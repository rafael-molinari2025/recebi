import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarConfirmacaoPagamento } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  // Verificar token do webhook Asaas (configurar ASAAS_WEBHOOK_TOKEN no Vercel e no painel Asaas)
  const token = req.headers.get('asaas-access-token')
  if (process.env.ASAAS_WEBHOOK_TOKEN && token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { event, payment } = body

  if (!payment?.externalReference) {
    return NextResponse.json({ ok: true })
  }

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    // BUG-06: cobranças manuais não têm atendimentoId — buscar por asaasId também
    const cobranca = await prisma.cobranca.findFirst({
      where: {
        OR: [
          { atendimentoId: payment.externalReference },
          { asaasId: payment.id },
        ],
      },
      include: { cliente: true, user: true },
    })

    if (cobranca && cobranca.status !== 'PAGO') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recebi-khaki.vercel.app'
      const reciboUrl = `${appUrl}/api/recibo/${cobranca.id}`

      await prisma.cobranca.update({
        where: { id: cobranca.id },
        data: { status: 'PAGO', pagamentoEm: new Date(), reciboGerado: true, reciboUrl },
      })

      try {
        await enviarConfirmacaoPagamento({
          nome: cobranca.cliente.nome,
          telefone: cobranca.cliente.telefone,
          valor: Number(cobranca.valor),
          reciboUrl,
          profissionalNome: cobranca.user.empresa ?? cobranca.user.nome,
        })
      } catch {
        // WhatsApp não configurado
      }
    }
  }

  if (event === 'PAYMENT_OVERDUE') {
    await prisma.cobranca.updateMany({
      where: { asaasId: payment.id, status: { not: 'PAGO' } },
      data: { status: 'ATRASADO' },
    })
  }

  return NextResponse.json({ ok: true })
}
