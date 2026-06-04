import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const desde = new Date()
  desde.setDate(desde.getDate() - 30)

  const [pagamentos, agendamentos] = await Promise.all([
    prisma.cobranca.findMany({
      where: { userId: user.id, status: 'PAGO', pagamentoEm: { gte: desde } },
      include: { cliente: { select: { nome: true } } },
      orderBy: { pagamentoEm: 'desc' },
      take: 10,
    }),
    prisma.atendimento.findMany({
      where: {
        userId: user.id,
        descricao: { contains: 'Agendamento via Portal' },
        createdAt: { gte: desde },
      },
      include: { cliente: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const notificacoes = [
    ...pagamentos.map((c) => ({
      id: `pago-${c.id}`,
      tipo: 'pagamento' as const,
      title: 'Pagamento recebido',
      message: `${c.cliente.nome} pagou R$ ${Number(c.valor).toFixed(2).replace('.', ',')}.`,
      time: timeAgo(c.pagamentoEm ?? c.updatedAt),
      createdAt: (c.pagamentoEm ?? c.updatedAt).toISOString(),
    })),
    ...agendamentos.map((a) => ({
      id: `agenda-${a.id}`,
      tipo: 'agendamento' as const,
      title: 'Nova sessão agendada',
      message: `${a.cliente.nome} agendou uma sessão para ${new Date(a.data).toLocaleDateString('pt-BR')}.`,
      time: timeAgo(a.createdAt),
      createdAt: a.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 10)

  return NextResponse.json(notificacoes)
}
