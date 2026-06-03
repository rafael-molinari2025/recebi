import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  
  try {
    const { data } = await req.json()
    
    if (!data) {
      return NextResponse.json({ error: 'Data não informada' }, { status: 400 })
    }

    const cliente = await prisma.cliente.findUnique({
      where: { portalToken: token },
      include: { user: true }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const atendimento = await prisma.atendimento.create({
      data: {
        userId: cliente.userId,
        clienteId: cliente.id,
        data: new Date(data),
        descricao: 'Agendamento via Portal (Self-Booking)',
        valor: cliente.valorHonorario,
        gerarCobranca: true,
      }
    })

    return NextResponse.json({ success: true, atendimento })
  } catch (error) {
    console.error('Erro ao agendar via portal:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
