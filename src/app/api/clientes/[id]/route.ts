import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { supabaseId: user.id } })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const cliente = await prisma.cliente.findFirst({ where: { id, userId: user.id } })
  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const atualizado = await prisma.cliente.update({
    where: { id },
    data: {
      nome: body.nome !== undefined ? body.nome : undefined,
      telefone: body.telefone !== undefined ? body.telefone : undefined,
      email: body.email !== undefined ? body.email : undefined,
      tipoAtendimento: body.tipoAtendimento !== undefined ? body.tipoAtendimento : undefined,
      valorHonorario: body.valorHonorario !== undefined ? body.valorHonorario : undefined,
      diaVencimento: body.diaVencimento !== undefined ? body.diaVencimento : undefined,
      observacoes: body.observacoes !== undefined ? body.observacoes : undefined,
      ativo: body.ativo !== undefined ? body.ativo : undefined,
    },
  })

  return NextResponse.json({ ...atualizado, valorHonorario: Number(atualizado.valorHonorario) })
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
