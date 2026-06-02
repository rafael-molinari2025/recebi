import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { gerarHtmlRecibo } from '@/lib/pdf'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cobranca = await prisma.cobranca.findUnique({
    where: { id },
    include: {
      cliente: true,
      user: true,
      atendimento: true,
    },
  })

  if (!cobranca || cobranca.status !== 'PAGO') {
    return NextResponse.json({ error: 'Recibo não disponível' }, { status: 404 })
  }

  // Verificação de acesso: usuário autenticado (dono) OU token do portal do cliente
  const portalToken = req.nextUrl.searchParams.get('token')

  if (portalToken) {
    // Acesso via portal do cliente: valida que o token corresponde ao cliente da cobrança
    if (!cobranca.cliente.portalToken || cobranca.cliente.portalToken !== portalToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  } else {
    // Acesso via dashboard: exige sessão autenticada e que seja o dono
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser || cobranca.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }

  const html = gerarHtmlRecibo({
    numero: cobranca.id.slice(-8).toUpperCase(),
    profissionalNome: cobranca.user.nome,
    profissionalProfissao: cobranca.user.profissao ?? undefined,
    clienteNome: cobranca.cliente.nome,
    valor: Number(cobranca.valor),
    descricao: cobranca.descricao ?? undefined,
    dataAtendimento: cobranca.atendimento?.data.toISOString(),
    dataPagamento: (cobranca.pagamentoEm ?? new Date()).toISOString(),
  })

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
