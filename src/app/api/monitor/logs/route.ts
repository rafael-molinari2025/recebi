import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseUser } from '@/lib/auth'

export async function GET() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const [logs, totalCorrigidas] = await Promise.all([
    prisma.monitorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 288, // últimas 24h a cada 5 min
    }),
    prisma.monitorLog.aggregate({
      _sum: { corrigidas: true },
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ])

  const totalChecks = logs.length
  const checksOk = logs.filter((l) => l.status === 'OK').length
  const uptime = totalChecks > 0 ? Math.round((checksOk / totalChecks) * 1000) / 10 : 100

  return NextResponse.json({
    logs: logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
    resumo: {
      status: logs[0]?.status ?? 'OK',
      uptime,
      totalCorrigidas24h: totalCorrigidas._sum.corrigidas ?? 0,
      ultimaVerificacao: logs[0]?.createdAt.toISOString() ?? null,
    },
  })
}
