import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarHtmlRecibo } from '@/lib/pdf'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
