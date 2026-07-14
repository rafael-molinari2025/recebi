import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const agendarSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/, 'Formato de data inválido'),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = agendarSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data inválida ou ausente' }, { status: 400 })
    }

    const dataAgendamento = new Date(parsed.data.data)

    // Rejeitar datas no passado
    const agora = new Date()
    agora.setHours(0, 0, 0, 0)
    if (dataAgendamento < agora) {
      return NextResponse.json({ error: 'Não é possível agendar para uma data no passado' }, { status: 400 })
    }

    const cliente = await prisma.cliente.findUnique({
      where: { portalToken: token },
      include: { user: true },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Validar que o cliente está ativo
    if (!cliente.ativo) {
      return NextResponse.json({ error: 'Agendamento não disponível' }, { status: 403 })
    }

    const atendimento = await prisma.atendimento.create({
      data: {
        userId: cliente.userId,
        clienteId: cliente.id,
        data: dataAgendamento,
        descricao: 'Agendamento via Portal (Self-Booking)',
        valor: cliente.valorHonorario,
        gerarCobranca: true,
      },
    })

    return NextResponse.json({ success: true, atendimento })
  } catch (error) {
    console.error('Erro ao agendar via portal:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
