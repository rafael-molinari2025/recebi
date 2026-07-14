import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const editarSchema = z.object({
  data: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' }).optional(),
  descricao: z.string().max(500).optional().nullable(),
  notas: z.string().max(2000).optional().nullable(),
  valor: z.number().positive().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const atendimento = await prisma.atendimento.findFirst({ where: { id, userId: user.id } })
  if (!atendimento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const parsed = editarSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })

  const body = parsed.data

  try {
    const atualizado = await prisma.atendimento.update({
      where: { id },
      data: {
        data: body.data ? new Date(body.data) : undefined,
        descricao: body.descricao !== undefined ? body.descricao : undefined,
        notas: body.notas !== undefined ? body.notas : undefined,
        valor: body.valor ?? undefined,
      },
    })
    return NextResponse.json({ ...atualizado, valor: Number(atualizado.valor) })
  } catch (err) {
    console.error('[PUT /api/atendimentos/:id]', err)
    return NextResponse.json({ message: 'Erro ao atualizar atendimento.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const atendimento = await prisma.atendimento.findFirst({ where: { id, userId: user.id } })
  if (!atendimento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  try {
    await prisma.atendimento.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/atendimentos/:id]', err)
    return NextResponse.json({ message: 'Erro ao excluir atendimento.' }, { status: 500 })
  }
}
