import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Apenas campos que o próprio usuário pode editar no perfil
// Campos bloqueados explicitamente: plano, supabaseId, email, id
const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  profissao: z.string().max(100).optional().or(z.literal('')).or(z.null()),
  telefone: z.string().min(8).max(20).optional().or(z.literal('')).or(z.null()),
  empresa: z.string().max(150).optional().or(z.literal('')).or(z.null()),
  cnpj: z.string().max(18).optional().or(z.literal('')).or(z.null()),
})

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { supabaseUser: user, dbUser: await prisma.user.findUnique({ where: { supabaseId: user.id } }) }
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth?.dbUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, nome, email, telefone, profissao, empresa, cnpj, plano, createdAt } = auth.dbUser
  return NextResponse.json({ id, nome, email, telefone, profissao, empresa, cnpj, plano, createdAt })
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const raw = await req.json()

  // Rejeitar explicitamente campos protegidos mesmo que o schema os ignore
  const camposProibidos = ['plano', 'supabaseId', 'email', 'id', 'asaasId', 'createdAt']
  const tentativa = camposProibidos.filter((c) => c in raw)
  if (tentativa.length > 0) {
    return NextResponse.json({ error: `Campos não permitidos: ${tentativa.join(', ')}` }, { status: 403 })
  }

  const parsed = atualizarUsuarioSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data

  // Criar usuário se não existir (primeiro acesso)
  if (!auth.dbUser) {
    const novoUser = await prisma.user.create({
      data: {
        supabaseId: auth.supabaseUser.id,
        email: auth.supabaseUser.email!,
        nome: body.nome ?? auth.supabaseUser.user_metadata?.nome ?? 'Usuário',
        profissao: body.profissao || null,
        telefone: body.telefone || null,
        empresa: body.empresa || null,
        cnpj: body.cnpj || null,
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
      cnpj: body.cnpj !== undefined ? (body.cnpj || null) : undefined,
    },
  })

  return NextResponse.json(atualizado)
}

