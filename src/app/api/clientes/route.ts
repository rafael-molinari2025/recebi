import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: { userId: user.id },
    include: { _count: { select: { atendimentos: true, cobrancas: true } } },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(clientes.map((c) => ({ ...c, valorHonorario: Number(c.valorHonorario) })))
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Verificar limite do plano
  if (user.plano === 'STARTER') {
    const count = await prisma.cliente.count({ where: { userId: user.id, ativo: true } })
    if (count >= 5) {
      return NextResponse.json(
        { message: 'Limite de 5 clientes atingido no plano gratuito. Faça upgrade para continuar.' },
        { status: 403 }
      )
    }
  }

  const body = await req.json()

  try {
    const cliente = await prisma.cliente.create({
      data: {
        userId: user.id,
        nome: body.nome,
        telefone: body.telefone,
        email: body.email || null,
        tipoAtendimento: body.tipoAtendimento,
        valorHonorario: body.valorHonorario,
        diaVencimento: body.diaVencimento ?? 5,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json({ ...cliente, valorHonorario: Number(cliente.valorHonorario) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/clientes]', err)
    return NextResponse.json({ message: 'Erro interno ao criar cliente.' }, { status: 500 })
  }
}
