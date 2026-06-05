import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) return null
  return user
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildDailyMap(days: number): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    map.set(toDateKey(d), 0)
  }
  return map
}

export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const agora = new Date()
  const inicioDia   = new Date(agora); inicioDia.setHours(0, 0, 0, 0)
  const inicioSem   = new Date(agora); inicioSem.setDate(agora.getDate() - 7)
  const inicioMes   = new Date(agora); inicioMes.setDate(agora.getDate() - 30)
  const inicio30d   = inicioMes

  const [views30d, usuarios30d, totalUsuarios] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: inicio30d } },
      select: { pagina: true, sessionId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: inicio30d } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.count(),
  ])

  // Contadores gerais
  const viewsHoje    = views30d.filter(v => v.createdAt >= inicioDia).length
  const viewsSemana  = views30d.filter(v => v.createdAt >= inicioSem).length
  const viewsMes     = views30d.length

  const sessoesHoje   = new Set(views30d.filter(v => v.createdAt >= inicioDia && v.sessionId).map(v => v.sessionId)).size
  const sessoesSemana = new Set(views30d.filter(v => v.createdAt >= inicioSem && v.sessionId).map(v => v.sessionId)).size
  const sessoesMes    = new Set(views30d.filter(v => v.sessionId).map(v => v.sessionId)).size

  const usuariosHoje   = usuarios30d.filter(u => u.createdAt >= inicioDia).length
  const usuariosSemana = usuarios30d.filter(u => u.createdAt >= inicioSem).length
  const usuariosMes    = usuarios30d.length

  // Views por página
  const porPaginaMap = new Map<string, number>()
  for (const v of views30d) {
    porPaginaMap.set(v.pagina, (porPaginaMap.get(v.pagina) ?? 0) + 1)
  }
  const porPagina = Array.from(porPaginaMap.entries())
    .map(([pagina, total]) => ({ pagina, total }))
    .sort((a, b) => b.total - a.total)

  // Views por dia (30 dias)
  const viewsDiasMap = buildDailyMap(30)
  const sessoesDiasMap = buildDailyMap(30)
  const sessoesVistas = new Map<string, Set<string>>()
  for (const v of views30d) {
    const key = toDateKey(v.createdAt)
    if (viewsDiasMap.has(key)) {
      viewsDiasMap.set(key, (viewsDiasMap.get(key) ?? 0) + 1)
    }
    if (v.sessionId && sessoesDiasMap.has(key)) {
      if (!sessoesVistas.has(key)) sessoesVistas.set(key, new Set())
      sessoesVistas.get(key)!.add(v.sessionId)
    }
  }
  for (const [key, set] of sessoesVistas) {
    sessoesDiasMap.set(key, set.size)
  }
  const viewsPorDia = Array.from(viewsDiasMap.entries()).map(([data, total]) => ({
    data,
    total,
    sessoes: sessoesDiasMap.get(data) ?? 0,
  }))

  // Novos usuários por dia (30 dias)
  const novosDiasMap = buildDailyMap(30)
  for (const u of usuarios30d) {
    const key = toDateKey(u.createdAt)
    if (novosDiasMap.has(key)) {
      novosDiasMap.set(key, (novosDiasMap.get(key) ?? 0) + 1)
    }
  }
  const novosPorDia = Array.from(novosDiasMap.entries()).map(([data, total]) => ({ data, total }))

  return NextResponse.json({
    viewsHoje, viewsSemana, viewsMes,
    sessoesHoje, sessoesSemana, sessoesMes,
    usuariosHoje, usuariosSemana, usuariosMes,
    totalUsuarios,
    porPagina,
    viewsPorDia,
    novosPorDia,
  })
}
