import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cancelarCobranca } from '@/lib/asaas'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { supabaseId: user.id } })
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
