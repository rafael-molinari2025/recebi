import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarConfirmacaoPagamento } from '@/lib/whatsapp'
import { getAuthUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recebi-khaki.vercel.app'
  const reciboUrl = `${appUrl}/api/recibo/${id}`

  // Transação atômica para evitar duplo processamento (race condition)
  let cobranca: Awaited<ReturnType<typeof prisma.cobranca.findFirst>> & { cliente: { nome: string; telefone: string } } | null = null

  try {
    const result = await prisma.$transaction(async (tx) => {
      const c = await tx.cobranca.findFirst({
        where: { id, userId: user.id },
        include: { cliente: true },
      })
      if (!c) return null
      if (c.status === 'PAGO') throw new Error('JA_PAGO')

      return tx.cobranca.update({
        where: { id },
        data: { status: 'PAGO', pagamentoEm: new Date(), reciboGerado: true, reciboUrl },
        include: { cliente: true },
      })
    })

    if (!result) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    cobranca = result
  } catch (e: any) {
    if (e?.message === 'JA_PAGO') {
      return NextResponse.json({ error: 'Cobrança já confirmada como paga.' }, { status: 409 })
    }
    throw e
  }

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
