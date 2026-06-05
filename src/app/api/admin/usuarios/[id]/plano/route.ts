import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) return null
  return user
}

const schema = z.object({
  plano: z.enum(['STARTER', 'PRO', 'CLINICA']),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  const usuario = await prisma.user.findUnique({ where: { id } })
  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const atualizado = await prisma.user.update({
    where: { id },
    data: { plano: parsed.data.plano },
    select: { id: true, email: true, plano: true },
  })

  return NextResponse.json({ ok: true, usuario: atualizado })
}
