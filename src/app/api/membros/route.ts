import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const convidarSchema = z.object({
  email: z.string().email(),
})

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (user.plano !== 'CLINICA') return NextResponse.json({ error: 'Disponível apenas no plano Clínica' }, { status: 403 })

  const membros = await prisma.membroClinica.findMany({
    where: { clinicaId: user.id },
    include: { membro: { select: { nome: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(membros)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (user.plano !== 'CLINICA') return NextResponse.json({ error: 'Disponível apenas no plano Clínica' }, { status: 403 })

  const count = await prisma.membroClinica.count({ where: { clinicaId: user.id } })
  if (count >= 3) return NextResponse.json({ message: 'Limite de 3 membros atingido no plano Clínica.' }, { status: 403 })

  const parsed = convidarSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ message: 'Email inválido.' }, { status: 400 })

  const { email } = parsed.data

  if (email === user.email) return NextResponse.json({ message: 'Você não pode convidar a si mesmo.' }, { status: 400 })

  const membro = await prisma.user.findUnique({ where: { email } })
  if (!membro) return NextResponse.json({ message: 'Usuário não encontrado. O membro precisa ter uma conta no Recebi.' }, { status: 404 })

  try {
    const convite = await prisma.membroClinica.create({
      data: { clinicaId: user.id, membroId: membro.id, email, status: 'ATIVO' },
    })
    return NextResponse.json(convite, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Este membro já foi adicionado.' }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { membroId } = await req.json()
  await prisma.membroClinica.deleteMany({ where: { clinicaId: user.id, membroId } })
  return NextResponse.json({ ok: true })
}
