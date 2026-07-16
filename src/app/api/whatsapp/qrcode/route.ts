import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth'

export async function GET() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const url = process.env.EVOLUTION_API_URL
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!url || !key || !instance) {
    return NextResponse.json({ error: 'WhatsApp não configurado' }, { status: 503 })
  }

  try {
    const res = await fetch(`${url}/instance/connect/${instance}`, {
      headers: { apikey: key },
      cache: 'no-store',
    })
    const data = await res.json()

    if (data?.base64) {
      return NextResponse.json({ qrcode: data.base64 })
    }

    // Já conectado — sem QR Code
    return NextResponse.json({ qrcode: null, connected: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar QR Code' }, { status: 500 })
  }
}
