import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const cobranca = await prisma.cobranca.findFirst({ where: { id, userId: user.id } })
  if (!cobranca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (cobranca.status !== 'PAGO') {
    return NextResponse.json({ message: 'Apenas cobranças pagas podem ser estornadas.' }, { status: 409 })
  }

  await prisma.cobranca.update({
    where: { id },
    data: {
      status: 'ESTORNADO',
      pagamentoEm: null,
      reciboGerado: false,
      reciboUrl: null,
    },
  })

  return NextResponse.json({ ok: true })
}
