import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarLembreteVencimento, enviarAvisoAtraso } from '@/lib/whatsapp'
import { diasAtraso } from '@/lib/utils'
import { getAuthUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cobranca = await prisma.cobranca.findFirst({
    where: { id, userId: user.id },
    include: { cliente: true },
  })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const atraso = diasAtraso(cobranca.vencimento.toISOString())

  if (atraso > 0) {
    await enviarAvisoAtraso({
      nome: cobranca.cliente.nome,
      telefone: cobranca.cliente.telefone,
      valor: Number(cobranca.valor),
      vencimento: cobranca.vencimento.toISOString(),
      diasAtraso: atraso,
      linkPagamento: cobranca.linkPagamento ?? undefined,
      profissionalNome: user.nome,
    })
  } else {
    await enviarLembreteVencimento({
      nome: cobranca.cliente.nome,
      telefone: cobranca.cliente.telefone,
      valor: Number(cobranca.valor),
      vencimento: cobranca.vencimento.toISOString(),
      linkPagamento: cobranca.linkPagamento ?? undefined,
      profissionalNome: user.nome,
    })
  }

  return NextResponse.json({ ok: true })
}
