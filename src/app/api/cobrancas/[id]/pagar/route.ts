import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarConfirmacaoPagamento } from '@/lib/whatsapp'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cobranca = await prisma.cobranca.findFirst({
    where: { id, userId: user.id },
    include: { cliente: true },
  })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('host') ?? 'recebi-khaki.vercel.app'
  const reciboUrl = `${proto}://${host}/api/recibo/${id}`

  await prisma.cobranca.update({
    where: { id },
    data: {
      status: 'PAGO',
      pagamentoEm: new Date(),
      reciboGerado: true,
      reciboUrl,
    },
  })

  // Enviar confirmação por WhatsApp
  try {
    await enviarConfirmacaoPagamento({
      nome: cobranca.cliente.nome,
      telefone: cobranca.cliente.telefone,
      valor: Number(cobranca.valor),
      reciboUrl,
      profissionalNome: user.empresa ?? user.nome,
    })
  } catch {
    // WhatsApp não configurado
  }

  return NextResponse.json({ ok: true })
}
