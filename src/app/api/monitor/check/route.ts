import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runHealthCheck } from '@/lib/monitor'
import { getSupabaseUser } from '@/lib/auth'

export async function POST() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const resultado = await runHealthCheck()

  const detalhes: Record<string, string> = {}
  if (!resultado.db.ok && resultado.db.erro) detalhes.db = resultado.db.erro
  if (resultado.asaas && !resultado.asaas.ok && resultado.asaas.erro) detalhes.asaas = resultado.asaas.erro
  if (resultado.whatsapp && !resultado.whatsapp.ok && resultado.whatsapp.erro) detalhes.whatsapp = resultado.whatsapp.erro

  if (resultado.db.ok) {
    await prisma.monitorLog.create({
      data: {
        status: resultado.status,
        dbOk: resultado.db.ok,
        dbLatencyMs: resultado.db.latencyMs ?? null,
        asaasOk: resultado.asaas?.ok ?? null,
        whatsappOk: resultado.whatsapp?.ok ?? null,
        corrigidas: resultado.corrigidas,
        alertaEnviado: false,
        detalhes: Object.keys(detalhes).length > 0 ? JSON.stringify(detalhes) : null,
      },
    })
  }

  return NextResponse.json({
    ok: resultado.status !== 'FALHA',
    status: resultado.status,
    db: resultado.db,
    asaas: resultado.asaas,
    whatsapp: resultado.whatsapp,
    corrigidas: resultado.corrigidas,
  })
}
