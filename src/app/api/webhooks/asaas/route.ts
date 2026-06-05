import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { enviarConfirmacaoPagamento } from '@/lib/whatsapp'

const payloadSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    externalReference: z.string().nullable().optional(),
    value: z.number().optional(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  // ASAAS_WEBHOOK_TOKEN é obrigatório — configure-o no painel Asaas e no Vercel
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
  if (!webhookToken) {
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 503 })
  }

  const token = req.headers.get('asaas-access-token')
  if (token !== webhookToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const raw = await req.json()
  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { event, payment } = parsed.data

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
      } catch (err) {
        if (process.env.EVOLUTION_API_URL) {
          console.error('[webhook/asaas] Falha ao enviar confirmação WhatsApp para cobrança', cobranca.id, ':', err)
        }
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
