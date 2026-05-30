import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { criarCliente, criarCobranca } from '@/lib/asaas'
import { getAuthUser } from '@/lib/auth'

const cobrancaSchema = z.object({
  clienteId: z.string().min(1),
  valor: z.number().positive(),
  vencimento: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' }),
  descricao: z.string().max(500).optional(),
})

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cobrancas = await prisma.cobranca.findMany({
    where: { userId: user.id },
    include: { cliente: { select: { id: true, nome: true, telefone: true } } },
    orderBy: { vencimento: 'desc' },
    take: 100,
  })

  return NextResponse.json(cobrancas.map((c) => ({ ...c, valor: Number(c.valor) })))
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const parsed = cobrancaSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 })
  }
  const body = parsed.data

  const cliente = await prisma.cliente.findFirst({
    where: { id: body.clienteId, userId: user.id },
  })
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

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
      value: body.valor,
      dueDate: new Date(body.vencimento).toISOString().slice(0, 10),
      description: body.descricao ?? `Honorários — ${user.nome}`,
    })
    asaasId = cobrancaAsaas.id
    linkPagamento = cobrancaAsaas.invoiceUrl
    pixCopiaECola = cobrancaAsaas.pixCopiaECola
  } catch {
    // Asaas não configurado
  }

  try {
    const cobranca = await prisma.cobranca.create({
      data: {
        userId: user.id,
        clienteId: body.clienteId,
        valor: body.valor,
        vencimento: new Date(body.vencimento),
        descricao: body.descricao,
        asaasId,
        linkPagamento,
        pixCopiaECola,
      },
    })
    return NextResponse.json({ ...cobranca, valor: Number(cobranca.valor) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/cobrancas]', err)
    return NextResponse.json({ message: 'Erro interno ao criar cobrança.' }, { status: 500 })
  }
}
