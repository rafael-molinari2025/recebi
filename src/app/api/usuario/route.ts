import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { supabaseUser: user, dbUser: await prisma.user.findUnique({ where: { supabaseId: user.id } }) }
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth?.dbUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, nome, email, telefone, profissao, empresa, plano, createdAt } = auth.dbUser
  return NextResponse.json({ id, nome, email, telefone, profissao, empresa, plano, createdAt })
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()

  // Criar usuário se não existir (primeiro acesso)
  if (!auth.dbUser) {
    const novoUser = await prisma.user.create({
      data: {
        supabaseId: auth.supabaseUser.id,
        email: auth.supabaseUser.email!,
        nome: body.nome ?? auth.supabaseUser.user_metadata?.nome ?? 'Usuário',
        profissao: body.profissao,
        telefone: body.telefone,
        empresa: body.empresa,
      },
    })
    return NextResponse.json(novoUser)
  }

  const atualizado = await prisma.user.update({
    where: { supabaseId: auth.supabaseUser.id },
    data: {
      nome: body.nome || undefined,
      profissao: body.profissao !== undefined ? (body.profissao || null) : undefined,
      telefone: body.telefone !== undefined ? (body.telefone || null) : undefined,
      empresa: body.empresa !== undefined ? (body.empresa || null) : undefined,
    },
  })

  return NextResponse.json(atualizado)
}
