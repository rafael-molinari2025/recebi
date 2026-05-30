import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatData(d: Date | string) {
  return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR })
}

// GET /api/relatorio?mes=YYYY-MM (default: mês atual)
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const mesParam = req.nextUrl.searchParams.get('mes')
  const referencia = mesParam ? new Date(`${mesParam}-01`) : new Date()
  const inicio = startOfMonth(referencia)
  const fim = endOfMonth(referencia)
  const mesLabel = format(referencia, 'MMMM yyyy', { locale: ptBR })

  const cobrancas = await prisma.cobranca.findMany({
    where: { userId: user.id, vencimento: { gte: inicio, lte: fim } },
    include: { cliente: { select: { nome: true } } },
    orderBy: { vencimento: 'asc' },
  })

  const totalRecebido = cobrancas.filter((c) => c.status === 'PAGO').reduce((a, c) => a + Number(c.valor), 0)
  const totalPendente = cobrancas.filter((c) => c.status === 'PENDENTE').reduce((a, c) => a + Number(c.valor), 0)
  const totalAtrasado = cobrancas.filter((c) => c.status === 'ATRASADO').reduce((a, c) => a + Number(c.valor), 0)
  const totalGeral = totalRecebido + totalPendente + totalAtrasado

  const statusLabel: Record<string, string> = {
    PAGO: 'Pago', PENDENTE: 'Pendente', ATRASADO: 'Atrasado', CANCELADO: 'Cancelado', ESTORNADO: 'Estornado',
  }
  const statusColor: Record<string, string> = {
    PAGO: '#16a34a', PENDENTE: '#ca8a04', ATRASADO: '#dc2626', CANCELADO: '#6b7280', ESTORNADO: '#6b7280',
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; color:#1a1a1a; background:#fff; font-size:13px; }
  .page { max-width:720px; margin:0 auto; padding:40px; }
  .header { border-bottom:2px solid #6366f1; padding-bottom:16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end; }
  .logo { font-size:24px; font-weight:bold; color:#6366f1; }
  .logo span { color:#1a1a1a; }
  .titulo { font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1px; }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
  .stat { background:#f9fafb; border-radius:8px; padding:12px; }
  .stat-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#999; }
  .stat-value { font-size:20px; font-weight:bold; margin-top:4px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f3f4f6; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; padding:8px; text-align:left; }
  td { padding:8px; border-bottom:1px solid #f3f4f6; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #eee; text-align:center; font-size:10px; color:#999; }
  .print-btn { text-align:center; margin-bottom:20px; }
  .print-btn button { background:#6366f1; color:#fff; border:none; padding:8px 24px; border-radius:6px; cursor:pointer; font-size:13px; }
  @media print { .print-btn { display:none; } }
</style>
</head>
<body>
<div class="page">
  <div class="print-btn"><button onclick="window.print()">⬇ Salvar / Imprimir PDF</button></div>

  <div class="header">
    <div>
      <div class="logo">re<span>cebi</span></div>
      <div class="titulo">Relatório Financeiro Mensal</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:15px;font-weight:bold;text-transform:capitalize">${mesLabel}</div>
      <div style="color:#999;font-size:11px">${user.nome}${user.empresa ? ' — ' + user.empresa : ''}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">Recebido</div>
      <div class="stat-value" style="color:#16a34a">${formatBRL(totalRecebido)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">A receber</div>
      <div class="stat-value" style="color:#ca8a04">${formatBRL(totalPendente)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Em atraso</div>
      <div class="stat-value" style="color:#dc2626">${formatBRL(totalAtrasado)}</div>
    </div>
  </div>

  <div style="margin-bottom:16px;padding:12px;background:#f5f3ff;border-radius:8px;display:flex;justify-content:space-between">
    <span style="font-weight:bold">Total faturado no mês</span>
    <span style="font-weight:bold;font-size:16px">${formatBRL(totalGeral)}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Vencimento</th>
        <th>Status</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${cobrancas.map((c) => `
      <tr>
        <td>${c.cliente.nome}</td>
        <td>${formatData(c.vencimento)}</td>
        <td style="color:${statusColor[c.status] ?? '#000'};font-weight:bold">${statusLabel[c.status] ?? c.status}</td>
        <td style="text-align:right">${formatBRL(Number(c.valor))}</td>
      </tr>`).join('')}
      ${cobrancas.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">Nenhuma cobrança neste mês.</td></tr>' : ''}
    </tbody>
  </table>

  <div class="footer">
    <p>Relatório gerado pelo <strong>Recebi</strong> em ${formatData(new Date())}</p>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
