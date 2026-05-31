import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarLembreteVencimento, enviarAvisoAtraso } from '@/lib/whatsapp'
import { diasAtraso } from '@/lib/utils'
import { addDays } from 'date-fns'

// Rota para ser chamada por um cron job (ex: Vercel Cron, Railway Cron)
export async function POST(req: NextRequest) {
  // Validar secret do cron — bloqueia se CRON_SECRET não estiver configurado
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const agora = new Date()
  // BUG-04: lembrete apenas para D+1 a D+3, excluindo quem vence hoje
  const amanha = addDays(agora, 1)
  const em3dias = addDays(agora, 3)

  const pendentes3d = await prisma.cobranca.findMany({
    where: {
      status: 'PENDENTE',
      lembreteEnviado3d: false,
      vencimento: {
        gte: amanha,
        lte: em3dias,
      },
    },
    include: { cliente: true, user: true },
  })

  for (const c of pendentes3d) {
    try {
      await enviarLembreteVencimento({
        nome: c.cliente.nome,
        telefone: c.cliente.telefone,
        valor: Number(c.valor),
        vencimento: c.vencimento.toISOString(),
        linkPagamento: c.linkPagamento ?? undefined,
        profissionalNome: c.user.nome,
      })
      await prisma.cobranca.update({ where: { id: c.id }, data: { lembreteEnviado3d: true } })
    } catch {
      // Continuar para próxima cobrança
    }
  }

  // Buscar cobranças em atraso (D+1 e D+7)
  const atrasadas = await prisma.cobranca.findMany({
    where: {
      status: { in: ['PENDENTE', 'ATRASADO'] },
      vencimento: { lt: agora },
    },
    include: { cliente: true, user: true },
    take: 200,
    orderBy: { vencimento: 'asc' },
  })

  // Atualizar status para ATRASADO
  const idsAtrasados = atrasadas.map((c) => c.id)
  if (idsAtrasados.length > 0) {
    await prisma.cobranca.updateMany({
      where: { id: { in: idsAtrasados }, status: 'PENDENTE' },
      data: { status: 'ATRASADO' },
    })
  }

  for (const c of atrasadas) {
    const atraso = diasAtraso(c.vencimento.toISOString())

    try {
      // BUG-05: usar intervalos em vez de igualdade exata para tolerar falha de cron
      if (atraso >= 1 && atraso <= 3 && !c.lembreteAtraso1d) {
        await enviarAvisoAtraso({
          nome: c.cliente.nome,
          telefone: c.cliente.telefone,
          valor: Number(c.valor),
          vencimento: c.vencimento.toISOString(),
          diasAtraso: atraso,
          linkPagamento: c.linkPagamento ?? undefined,
          profissionalNome: c.user.nome,
        })
        await prisma.cobranca.update({ where: { id: c.id }, data: { lembreteAtraso1d: true } })
      } else if (atraso >= 7 && atraso <= 9 && !c.lembreteAtraso7d) {
        await enviarAvisoAtraso({
          nome: c.cliente.nome,
          telefone: c.cliente.telefone,
          valor: Number(c.valor),
          vencimento: c.vencimento.toISOString(),
          diasAtraso: atraso,
          linkPagamento: c.linkPagamento ?? undefined,
          profissionalNome: c.user.nome,
        })
        await prisma.cobranca.update({ where: { id: c.id }, data: { lembreteAtraso7d: true } })
      }
    } catch {
      // Continuar
    }
  }

  return NextResponse.json({
    ok: true,
    lembretes3d: pendentes3d.length,
    atrasadas: atrasadas.length,
  })
}
