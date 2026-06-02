import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// Somente campos que o profissional pode editar — campos sensíveis (portalToken, asaasId, userId) são bloqueados
const atualizarClienteSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  telefone: z.string().min(8).max(20).optional(),
  email: z.string().email().optional().or(z.literal('')).or(z.null()),
  tipoAtendimento: z.enum(['SESSAO_AVULSA', 'PACOTE_MENSAL', 'PLANO_FIXO']).optional(),
  valorHonorario: z.number().positive().optional(),
  diaVencimento: z.number().int().min(1).max(28).optional(),
  observacoes: z.string().max(500).optional().or(z.null()),
  ativo: z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cliente = await prisma.cliente.findFirst({ where: { id, userId: user.id } })
  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const parsed = atualizarClienteSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data

  try {
    const atualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nome: body.nome,
        telefone: body.telefone,
        email: body.email !== undefined ? (body.email || null) : undefined,
        tipoAtendimento: body.tipoAtendimento,
        valorHonorario: body.valorHonorario,
        diaVencimento: body.diaVencimento,
        observacoes: body.observacoes !== undefined ? (body.observacoes || null) : undefined,
        ativo: body.ativo,
      },
    })

    return NextResponse.json({ ...atualizado, valorHonorario: Number(atualizado.valorHonorario) })
  } catch (err) {
    console.error('[PUT /api/clientes/:id]', err)
    return NextResponse.json({ message: 'Erro interno ao atualizar cliente.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cliente = await prisma.cliente.findFirst({ where: { id, userId: user.id } })
  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.cliente.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

