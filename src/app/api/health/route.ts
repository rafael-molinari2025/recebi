import { NextResponse } from 'next/server'
import { runHealthCheck } from '@/lib/monitor'

// Endpoint público para ferramentas externas (UptimeRobot, BetterUptime, etc.)
// Retorna 200 se OK ou DEGRADADO, 503 se FALHA crítica (banco offline)
export async function GET() {
  const result = await runHealthCheck()

  const httpStatus = result.status === 'FALHA' ? 503 : 200

  return NextResponse.json(result, { status: httpStatus })
}
