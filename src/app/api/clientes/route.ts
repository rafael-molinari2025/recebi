import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const LIMITES = { STARTER: 5, PRO: 50, CLINICA: 200 }

const clienteSchema = z.object({
  nome: z.string().min(2).max(100),
  telefone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal('')),
  tipoAtendimento: z.enum(['SESSAO_AVULSA', 'PACOTE_MENSAL', 'PLANO_FIXO']),
  valorHonorario: z.number().positive(),
  diaVencimento: z.number().int().min(1).max(28).default(5),
  observacoes: z.string().max(500).optional(),
})

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

  const parsed = clienteSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 })
  }
  const body = parsed.data

  // Verificar limite do plano
  const limite = LIMITES[user.plano] ?? 5
  const count = await prisma.cliente.count({ where: { userId: user.id, ativo: true } })
  if (count >= limite) {
    return NextResponse.json(
      { message: `Limite de ${limite} clientes atingido no seu plano. Faça upgrade para continuar.` },
      { status: 403 }
    )
  }

  try {
    const portalToken = randomBytes(24).toString('hex')
    const cliente = await prisma.cliente.create({
      data: {
        userId: user.id,
        nome: body.nome,
        telefone: body.telefone,
        email: body.email || null,
        tipoAtendimento: body.tipoAtendimento,
        valorHonorario: body.valorHonorario,
        diaVencimento: body.diaVencimento,
        observacoes: body.observacoes || null,
        portalToken,
      },
    })
    return NextResponse.json({ ...cliente, valorHonorario: Number(cliente.valorHonorario) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/clientes]', err)
    return NextResponse.json({ message: 'Erro interno ao criar cliente.' }, { status: 500 })
  }
}
