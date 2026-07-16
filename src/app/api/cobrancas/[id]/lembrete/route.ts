import { NextRequest, NextResponse } from 'next/server'
import { isAxiosError } from 'axios'
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
  } catch (err) {
    const zapiStatus = isAxiosError(err) ? err.response?.status : undefined
    console.error('[lembrete] Erro ao enviar WhatsApp. Status:', zapiStatus, isAxiosError(err) ? err.response?.data : err)
    const mensagem = zapiStatus === 401
      ? 'Chave da Evolution API inválida. Verifique EVOLUTION_API_KEY no Vercel.'
      : zapiStatus === 404
      ? 'Instância não encontrada. Verifique EVOLUTION_INSTANCE no Vercel.'
      : 'WhatsApp desconectado. Reconecte em Configurações → WhatsApp.'
    return NextResponse.json({ message: mensagem }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
