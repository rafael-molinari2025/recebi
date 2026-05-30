import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
}

function formatData(d: Date | string) {
  return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR })
}

function formatValor(v: number) {
  return v.toFixed(2).replace('.', ',')
}

// GET /api/exportar?tipo=clientes|atendimentos|cobrancas
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const tipo = req.nextUrl.searchParams.get('tipo') ?? 'clientes'

  let csv = ''
  let filename = ''

  if (tipo === 'clientes') {
    const clientes = await prisma.cliente.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' },
    })
    const header = ['Nome', 'WhatsApp', 'Email', 'Tipo Atendimento', 'Valor Honorário', 'Dia Vencimento', 'Status', 'Observações', 'Cadastrado em']
    const rows = clientes.map((c) => [
      c.nome, c.telefone, c.email ?? '', c.tipoAtendimento,
      formatValor(Number(c.valorHonorario)), String(c.diaVencimento),
      c.ativo ? 'Ativo' : 'Inativo', c.observacoes ?? '',
      formatData(c.createdAt),
    ])
    csv = toCSV([header, ...rows])
    filename = 'clientes.csv'

  } else if (tipo === 'atendimentos') {
    const atendimentos = await prisma.atendimento.findMany({
      where: { userId: user.id },
      include: { cliente: { select: { nome: true } } },
      orderBy: { data: 'desc' },
    })
    const header = ['Data', 'Cliente', 'Descrição', 'Valor', 'Cobrança gerada']
    const rows = atendimentos.map((a) => [
      formatData(a.data), a.cliente.nome, a.descricao ?? '',
      formatValor(Number(a.valor)), a.gerarCobranca ? 'Sim' : 'Não',
    ])
    csv = toCSV([header, ...rows])
    filename = 'atendimentos.csv'

  } else if (tipo === 'cobrancas') {
    const cobrancas = await prisma.cobranca.findMany({
      where: { userId: user.id },
      include: { cliente: { select: { nome: true } } },
      orderBy: { vencimento: 'desc' },
    })
    const header = ['Cliente', 'Valor', 'Vencimento', 'Status', 'Descrição', 'Pago em', 'Link Pagamento']
    const rows = cobrancas.map((c) => [
      c.cliente.nome, formatValor(Number(c.valor)),
      formatData(c.vencimento), c.status,
      c.descricao ?? '',
      c.pagamentoEm ? formatData(c.pagamentoEm) : '',
      c.linkPagamento ?? '',
    ])
    csv = toCSV([header, ...rows])
    filename = 'cobrancas.csv'
  } else {
    return NextResponse.json({ error: 'Tipo inválido. Use: clientes, atendimentos ou cobrancas' }, { status: 400 })
  }

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
