import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.$transaction(async (tx) => {
      const cobranca = await tx.cobranca.findFirst({ where: { id, userId: user.id } })
      if (!cobranca) throw new Error('NAO_ENCONTRADO')
      if (cobranca.status !== 'PAGO') throw new Error('NAO_PAGO')

      await tx.cobranca.update({
        where: { id },
        data: { status: 'ESTORNADO', pagamentoEm: null, reciboGerado: false, reciboUrl: null },
      })
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : undefined
    if (message === 'NAO_ENCONTRADO') return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    if (message === 'NAO_PAGO') return NextResponse.json({ message: 'Apenas cobranças pagas podem ser estornadas.' }, { status: 409 })
    console.error('[POST /estornar]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
