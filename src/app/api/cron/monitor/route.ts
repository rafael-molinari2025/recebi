import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runHealthCheck } from '@/lib/monitor'
import { enviarAlertaAdmin } from '@/lib/whatsapp'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Chamado pelo Vercel Cron a cada 5 minutos (requer Vercel Pro)
// Configura: vercel.json → crons → /api/cron/monitor → */5 * * * *
// Variável necessária no Vercel: CRON_SECRET, ADMIN_PHONE (opcional)
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const resultado = await runHealthCheck()

  // Montar detalhes de erro por componente
  const detalhes: Record<string, string> = {}
  if (!resultado.db.ok && resultado.db.erro) detalhes.db = resultado.db.erro
  if (resultado.asaas && !resultado.asaas.ok && resultado.asaas.erro) detalhes.asaas = resultado.asaas.erro
  if (resultado.whatsapp && !resultado.whatsapp.ok && resultado.whatsapp.erro) detalhes.whatsapp = resultado.whatsapp.erro

  let alertaEnviado = false

  // Verificar se deve alertar: só na primeira falha (evita spam)
  // Não salva log se o BD estiver offline (não há onde salvar)
  if (resultado.db.ok) {
    const ultimoLog = await prisma.monitorLog.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    const estavaBom = !ultimoLog || ultimoLog.status !== 'FALHA'
    const agoraMal = resultado.status === 'FALHA'

    if (agoraMal && estavaBom && process.env.ADMIN_PHONE) {
      const horario = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      const linha = (label: string, ok: boolean | undefined | null) =>
        ok == null ? '' : `${label}: ${ok ? 'OK' : 'OFFLINE'}`

      const msg = [
        'ALERTA RECEBI - Sistema com falha detectada',
        `Status: ${resultado.status}`,
        linha('Banco de dados', resultado.db.ok),
        linha('Asaas', resultado.asaas?.ok),
        linha('WhatsApp', resultado.whatsapp?.ok),
        '',
        `Verificado em: ${horario}`,
        `Painel: https://recebi-khaki.vercel.app/monitor`,
      ]
        .filter((l) => l !== null)
        .join('\n')

      try {
        await enviarAlertaAdmin(msg)
        alertaEnviado = true
      } catch {
        // WhatsApp pode estar fora — ignorar falha no alerta
      }
    }

    await prisma.monitorLog.create({
      data: {
        status: resultado.status,
        dbOk: resultado.db.ok,
        dbLatencyMs: resultado.db.latencyMs ?? null,
        asaasOk: resultado.asaas?.ok ?? null,
        whatsappOk: resultado.whatsapp?.ok ?? null,
        corrigidas: resultado.corrigidas,
        alertaEnviado,
        detalhes: Object.keys(detalhes).length > 0 ? JSON.stringify(detalhes) : null,
      },
    })

    // Limpar logs com mais de 7 dias para não acumular dados infinitamente
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await prisma.monitorLog.deleteMany({ where: { createdAt: { lt: seteDiasAtras } } })
  }

  return NextResponse.json({
    ok: resultado.status !== 'FALHA',
    status: resultado.status,
    db: resultado.db,
    asaas: resultado.asaas,
    whatsapp: resultado.whatsapp,
    corrigidas: resultado.corrigidas,
    alertaEnviado,
  })
}
