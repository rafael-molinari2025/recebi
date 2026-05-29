import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarConfirmacaoPagamento } from '@/lib/whatsapp'

// Webhook do Asaas para atualização automática de status
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { event, payment } = body

  if (!payment?.externalReference) {
    return NextResponse.json({ ok: true })
  }

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const cobranca = await prisma.cobranca.findFirst({
      where: { atendimentoId: payment.externalReference },
      include: { cliente: true, user: true },
    })

    if (cobranca && cobranca.status !== 'PAGO') {
      const reciboUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/recibo/${cobranca.id}`

      await prisma.cobranca.update({
        where: { id: cobranca.id },
        data: {
          status: 'PAGO',
          pagamentoEm: new Date(),
          reciboGerado: true,
          reciboUrl,
        },
      })

      try {
        await enviarConfirmacaoPagamento({
          nome: cobranca.cliente.nome,
          telefone: cobranca.cliente.telefone,
          valor: Number(cobranca.valor),
          reciboUrl,
          profissionalNome: cobranca.user.nome,
        })
      } catch {
        // WhatsApp não configurado
      }
    }
  }

  if (event === 'PAYMENT_OVERDUE') {
    await prisma.cobranca.updateMany({
      where: { asaasId: payment.id },
      data: { status: 'ATRASADO' },
    })
  }

  return NextResponse.json({ ok: true })
}
