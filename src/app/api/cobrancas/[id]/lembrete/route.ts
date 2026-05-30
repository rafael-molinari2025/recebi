import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarLembreteVencimento, enviarAvisoAtraso, whatsappConfigurado } from '@/lib/whatsapp'
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

  if (!whatsappConfigurado()) {
    return NextResponse.json({ ok: false, message: 'WhatsApp não configurado.' }, { status: 200 })
  }

  const atraso = diasAtraso(cobranca.vencimento.toISOString())

  try {
    if (atraso > 0) {
      await enviarAvisoAtraso({
        nome: cobranca.cliente.nome,
        telefone: cobranca.cliente.telefone,
        valor: Number(cobranca.valor),
        vencimento: cobranca.vencimento.toISOString(),
        diasAtraso: atraso,
        linkPagamento: cobranca.linkPagamento ?? undefined,
        profissionalNome: user.empresa ?? user.nome,
      })
    } else {
      await enviarLembreteVencimento({
        nome: cobranca.cliente.nome,
        telefone: cobranca.cliente.telefone,
        valor: Number(cobranca.valor),
        vencimento: cobranca.vencimento.toISOString(),
        linkPagamento: cobranca.linkPagamento ?? undefined,
        profissionalNome: user.empresa ?? user.nome,
      })
    }
  } catch (err: any) {
    const zapiError = err?.response?.data
    const zapiStatus = err?.response?.status
    console.error('[lembrete] Erro Z-API:', zapiStatus, JSON.stringify(zapiError))
    console.error('[lembrete] URL usada:', `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`)
    return NextResponse.json({
      message: `Falha ao enviar mensagem WhatsApp. Código: ${zapiStatus ?? 'sem resposta'}. Detalhe: ${JSON.stringify(zapiError ?? err?.message)}`,
    }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
