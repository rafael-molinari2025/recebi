import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function POST() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const url = process.env.EVOLUTION_API_URL
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!url || !key || !instance) {
    return NextResponse.json({ error: 'Não configurado' }, { status: 503 })
  }

  try {
    await fetch(`${url}/instance/logout/${instance}`, {
      method: 'DELETE',
      headers: { apikey: key },
    })
  } catch { /* ignora erro de logout */ }

  return NextResponse.json({ ok: true })
}
