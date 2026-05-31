import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { cancelarCobranca } from '@/lib/asaas'
import { getAuthUser } from '@/lib/auth'

const editarCobrancaSchema = z.object({
  valor: z.number().positive().optional(),
  vencimento: z.string().refine((d) => !isNaN(Date.parse(d))).optional(),
  descricao: z.string().max(500).optional().nullable(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const cobranca = await prisma.cobranca.findFirst({ where: { id, userId: user.id } })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (cobranca.status === 'PAGO') {
    return NextResponse.json({ message: 'Não é possível editar uma cobrança já paga.' }, { status: 409 })
  }

  const parsed = editarCobrancaSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })

  const body = parsed.data
  try {
    const atualizada = await prisma.cobranca.update({
      where: { id },
      data: {
        valor: body.valor ?? undefined,
        vencimento: body.vencimento ? new Date(body.vencimento) : undefined,
        descricao: body.descricao !== undefined ? body.descricao : undefined,
      },
    })
    return NextResponse.json({ ...atualizada, valor: Number(atualizada.valor) })
  } catch (err) {
    console.error('[PUT /api/cobrancas/:id]', err)
    return NextResponse.json({ message: 'Erro ao atualizar cobrança.' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cobranca = await prisma.cobranca.findFirst({
    where: { id, userId: user.id },
    include: { cliente: { select: { id: true, nome: true, telefone: true } } },
  })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  return NextResponse.json({ ...cobranca, valor: Number(cobranca.valor) })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cobranca = await prisma.cobranca.findFirst({ where: { id, userId: user.id } })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Cancelar no Asaas se tiver ID
  if (cobranca.asaasId) {
    try {
      await cancelarCobranca(cobranca.asaasId)
    } catch {
      // Ignorar erro do Asaas
    }
  }

  await prisma.cobranca.update({
    where: { id },
    data: { status: 'CANCELADO' },
  })

  return NextResponse.json({ ok: true })
}
