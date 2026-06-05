import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) return null
  return user
}

export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nome: true,
      email: true,
      plano: true,
      profissao: true,
      createdAt: true,
      _count: {
        select: { clientes: true, atendimentos: true, cobrancas: true },
      },
    },
  })

  return NextResponse.json({
    usuarios: usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      plano: u.plano,
      profissao: u.profissao ?? null,
      clienteCount: u._count.clientes,
      atendimentoCount: u._count.atendimentos,
      cobrancaCount: u._count.cobrancas,
      createdAt: u.createdAt.toISOString(),
    })),
  })
}
