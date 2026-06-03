import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

// Simulação de Job de Cron (Pode ser chamado via Vercel Cron ou Trigger externo)
// Rota segura com Header Authorization Bearer CRON_SECRET no mundo real
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    // Em produção, verificar se authHeader === `Bearer ${process.env.CRON_SECRET}`

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
