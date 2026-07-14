import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pagina = String(body.pagina ?? '').slice(0, 100)
    const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : null
    if (!pagina) return NextResponse.json({ ok: false }, { status: 400 })

    await prisma.pageView.create({ data: { pagina, sessionId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
