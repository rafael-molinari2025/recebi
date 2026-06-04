import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const agora = new Date()
    const tresDiasFrente = addDays(agora, 3)
    const umDiaFrente = addDays(agora, 1)

    // Buscar cobranças pendentes vencendo em 3 dias (e lembrete não enviado)
    const cobrancas3d = await prisma.cobranca.findMany({
      where: {
        status: 'PENDENTE',
        vencimento: {
          gte: agora,
          lte: tresDiasFrente,
        },
        lembreteEnviado3d: false,
      },
      include: { cliente: true }
    })

    // Processar envios de e-mail / whatsapp simulado
    const sent = []
    for (const cob of cobrancas3d) {
      console.log(`[CRON] Enviando lembrete de 3 dias para ${cob.cliente.nome} (${cob.cliente.telefone}) - Valor: ${cob.valor}`)
      
      // Marcar como enviado
      await prisma.cobranca.update({
        where: { id: cob.id },
        data: { lembreteEnviado3d: true }
      })
      sent.push(cob.id)
    }

    return NextResponse.json({ success: true, lembretesEnviados: sent.length, ids: sent })
  } catch (error) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
