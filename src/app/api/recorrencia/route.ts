import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarCliente, criarCobranca } from '@/lib/asaas'
import { gerarProximoVencimento } from '@/lib/utils'
import { startOfMonth, endOfMonth } from 'date-fns'

// Cron: gerar cobranças mensais automáticas para clientes PACOTE_MENSAL e PLANO_FIXO
// Chamar no início de cada mês com Authorization: Bearer $CRON_SECRET
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 })

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const agora = new Date()
  const inicioMes = startOfMonth(agora)
  const fimMes = endOfMonth(agora)

  // Buscar clientes ativos com plano recorrente
  const clientes = await prisma.cliente.findMany({
    where: {
      ativo: true,
      tipoAtendimento: { in: ['PACOTE_MENSAL', 'PLANO_FIXO'] },
    },
    include: { user: true },
  })

  let geradas = 0
  let ignoradas = 0

  for (const cliente of clientes) {
    // Verificar se já existe cobrança para este mês
    const jaExiste = await prisma.cobranca.findFirst({
      where: {
        clienteId: cliente.id,
        vencimento: { gte: inicioMes, lte: fimMes },
        status: { not: 'CANCELADO' },
      },
    })

    if (jaExiste) { ignoradas++; continue }

    const vencimento = gerarProximoVencimento(cliente.diaVencimento)

    let asaasId: string | undefined
    let linkPagamento: string | undefined
    let pixCopiaECola: string | undefined

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
        billingType: 'UNDEFINED',
        value: Number(cliente.valorHonorario),
        dueDate: vencimento.toISOString().slice(0, 10),
        description: `Honorários mensais — ${cliente.user.nome}`,
      })

      asaasId = cobrancaAsaas.id
      linkPagamento = cobrancaAsaas.invoiceUrl
      pixCopiaECola = cobrancaAsaas.pixCopiaECola
    } catch {
      // Asaas não configurado — cobrança criada sem link
    }

    await prisma.cobranca.create({
      data: {
        userId: cliente.userId,
        clienteId: cliente.id,
        valor: cliente.valorHonorario,
        vencimento,
        descricao: 'Mensalidade automática',
        asaasId,
        linkPagamento,
        pixCopiaECola,
      },
    })

    geradas++
  }

  return NextResponse.json({ ok: true, geradas, ignoradas })
}
