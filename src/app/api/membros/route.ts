import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const convidarSchema = z.object({
  email: z.string().email(),
})

const removerMembroSchema = z.object({
  membroId: z.string().min(1),
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

  // Anti user-enumeration: busca o membro mas sempre retorna a mesma mensagem genérica caso não exista
  const membro = await prisma.user.findUnique({ where: { email } })
  if (!membro) {
    // Mensagem genérica — não revela se o email está cadastrado ou não
    return NextResponse.json(
      { message: 'Convite enviado. Se o usuário tiver uma conta no Recebi, ele aparecerá na lista em breve.' },
      { status: 200 }
    )
  }

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
  // Apenas o dono da clínica (plano CLINICA) pode remover membros
  if (user.plano !== 'CLINICA') return NextResponse.json({ error: 'Disponível apenas no plano Clínica' }, { status: 403 })

  const parsed = removerMembroSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })

  const { membroId } = parsed.data

  // Verifica que o membro pertence à clínica do usuário autenticado antes de deletar
  const vinculo = await prisma.membroClinica.findFirst({
    where: { clinicaId: user.id, membroId },
  })
  if (!vinculo) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })

  await prisma.membroClinica.deleteMany({ where: { clinicaId: user.id, membroId } })
  return NextResponse.json({ ok: true })
}

