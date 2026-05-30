import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarCliente, criarCobranca } from '@/lib/asaas'
import { gerarProximoVencimento } from '@/lib/utils'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const atendimentos = await prisma.atendimento.findMany({
    where: { userId: user.id },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { data: 'desc' },
    take: 50,
  })

  return NextResponse.json(atendimentos.map((a) => ({ ...a, valor: Number(a.valor) })))
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()

  const cliente = await prisma.cliente.findFirst({
    where: { id: body.clienteId, userId: user.id },
  })
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const atendimento = await prisma.atendimento.create({
    data: {
      userId: user.id,
      clienteId: body.clienteId,
      data: new Date(body.data),
      descricao: body.descricao,
      valor: body.valor,
      gerarCobranca: body.gerarCobranca ?? true,
    },
  })

  // Gerar cobrança automaticamente se solicitado
  if (body.gerarCobranca) {
    const vencimento = gerarProximoVencimento(cliente.diaVencimento)

    let asaasId: string | undefined
    let linkPagamento: string | undefined
    let pixCopiaECola: string | undefined

    // Tentar criar no Asaas (se configurado)
    try {
      let asaasClienteId = cliente.asaasId
      if (!asaasClienteId) {
        const asaasCliente = await criarCliente({
          name: cliente.nome,
          email: cliente.email ?? undefined,
          mobilePhone: cliente.telefone,
        })
        asaasClienteId = asaasCliente.id!
        await prisma.cliente.update({ where: { id: cliente.id }, data: { asaasId: asaasClienteId } })
      }

      const cobrancaAsaas = await criarCobranca({
        customer: asaasClienteId,
        billingType: 'UNDEFINED', // aceita PIX e boleto
        value: Number(body.valor),
        dueDate: vencimento.toISOString().slice(0, 10),
        description: body.descricao ?? `Atendimento — ${user.nome}`,
        externalReference: atendimento.id,
      })

      asaasId = cobrancaAsaas.id
      linkPagamento = cobrancaAsaas.invoiceUrl
      pixCopiaECola = cobrancaAsaas.pixCopiaECola
    } catch {
      // Asaas não configurado — cobrança criada sem link de pagamento
    }

    await prisma.cobranca.create({
      data: {
        userId: user.id,
        clienteId: body.clienteId,
        atendimentoId: atendimento.id,
        valor: body.valor,
        vencimento,
        descricao: body.descricao,
        asaasId,
        linkPagamento,
        pixCopiaECola,
      },
    })
  }

  return NextResponse.json({ ...atendimento, valor: Number(atendimento.valor) }, { status: 201 })
}
