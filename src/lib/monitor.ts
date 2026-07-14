import axios from 'axios'
import { prisma } from './prisma'

export interface ComponentStatus {
  ok: boolean
  latencyMs?: number
  erro?: string
}

export interface HealthResult {
  status: 'OK' | 'DEGRADADO' | 'FALHA'
  timestamp: string
  db: ComponentStatus
  asaas: ComponentStatus | null
  whatsapp: ComponentStatus | null
  corrigidas: number
}

export async function checkDB(): Promise<ComponentStatus> {
  const inicio = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - inicio }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : 'falha desconhecida' }
  }
}

export async function checkAsaas(): Promise<ComponentStatus | null> {
  if (!process.env.ASAAS_API_KEY) return null
  const inicio = Date.now()
  try {
    await axios.get(
      `${process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3'}/myAccount`,
      { headers: { access_token: process.env.ASAAS_API_KEY }, timeout: 8000 }
    )
    return { ok: true, latencyMs: Date.now() - inicio }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      // Qualquer resposta HTTP (mesmo 401) significa que o serviço está no ar
      return { ok: true, latencyMs: Date.now() - inicio }
    }
    return { ok: false, erro: err instanceof Error ? err.message : 'sem resposta' }
  }
}

export async function checkWhatsApp(): Promise<ComponentStatus | null> {
  if (!process.env.EVOLUTION_API_URL) return null
  const inicio = Date.now()
  try {
    await axios.get(
      `${process.env.EVOLUTION_API_URL}/instance/fetchInstances`,
      { headers: { apikey: process.env.EVOLUTION_API_KEY }, timeout: 8000 }
    )
    return { ok: true, latencyMs: Date.now() - inicio }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { ok: true, latencyMs: Date.now() - inicio }
    }
    return { ok: false, erro: err instanceof Error ? err.message : 'sem resposta' }
  }
}

export async function autocorrigirCobrancas(): Promise<number> {
  const result = await prisma.cobranca.updateMany({
    where: { status: 'PENDENTE', vencimento: { lt: new Date() } },
    data: { status: 'ATRASADO' },
  })
  return result.count
}

export async function runHealthCheck(): Promise<HealthResult> {
  const [db, asaas, whatsapp] = await Promise.all([
    checkDB(),
    checkAsaas(),
    checkWhatsApp(),
  ])

  const corrigidas = db.ok ? await autocorrigirCobrancas() : 0

  const integracoesOk =
    (asaas === null || asaas.ok) && (whatsapp === null || whatsapp.ok)

  const status: HealthResult['status'] = !db.ok
    ? 'FALHA'
    : !integracoesOk
    ? 'DEGRADADO'
    : 'OK'

  return {
    status,
    timestamp: new Date().toISOString(),
    db,
    asaas,
    whatsapp,
    corrigidas,
  }
}
