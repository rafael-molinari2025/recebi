import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const url = process.env.EVOLUTION_API_URL
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!url || !key || !instance) {
    return NextResponse.json({ configured: false, connected: false })
  }

  try {
    const res = await fetch(`${url}/instance/connectionState/${instance}`, {
      headers: { apikey: key },
      cache: 'no-store',
    })
    const data = await res.json()
    const connected = data?.instance?.state === 'open'
    return NextResponse.json({ configured: true, connected, state: data?.instance?.state })
  } catch {
    return NextResponse.json({ configured: true, connected: false, state: 'error' })
  }
}
