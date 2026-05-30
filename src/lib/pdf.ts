import { formatCurrency, formatDate, formatDateTime } from './utils'

interface ReciboData {
  numero: string
  profissionalNome: string
  profissionalProfissao?: string
  clienteNome: string
  valor: number
  descricao?: string
  dataAtendimento?: string
  dataPagamento: string
}

export function gerarHtmlRecibo(data: ReciboData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fff; }
  .page { max-width: 600px; margin: 0 auto; padding: 40px; }
  .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px; }
  .logo { font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: -1px; }
  .logo span { color: #1a1a1a; }
  .titulo { font-size: 14px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
  .numero { font-size: 12px; color: #999; margin-top: 8px; }
  .section { margin-bottom: 20px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 4px; }
  .value { font-size: 15px; color: #1a1a1a; }
  .valor-destaque { font-size: 32px; font-weight: bold; color: #6366f1; text-align: center; padding: 20px; background: #f5f3ff; border-radius: 8px; margin: 24px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
  .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
  .print-btn { display: flex; justify-content: center; margin-bottom: 24px; }
  .print-btn button { background: #6366f1; color: #fff; border: none; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; }
  .print-btn button:hover { background: #4f46e5; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">re<span>cebi</span></div>
    <div class="titulo">Recibo de Pagamento</div>
    <div class="numero">Nº ${data.numero}</div>
  </div>

  <div class="print-btn">
    <button onclick="window.print()">⬇ Salvar / Imprimir PDF</button>
  </div>

  <div style="text-align:center;">
    <span class="badge">✓ Pagamento Confirmado</span>
  </div>

  <div class="valor-destaque">${formatCurrency(data.valor)}</div>

  <div class="grid">
    <div class="section">
      <div class="label">Profissional</div>
      <div class="value">${data.profissionalNome}</div>
      ${data.profissionalProfissao ? `<div style="font-size:13px;color:#666">${data.profissionalProfissao}</div>` : ''}
    </div>
    <div class="section">
      <div class="label">Cliente</div>
      <div class="value">${data.clienteNome}</div>
    </div>
    ${data.descricao ? `
    <div class="section" style="grid-column:1/-1">
      <div class="label">Descrição</div>
      <div class="value">${data.descricao}</div>
    </div>` : ''}
    ${data.dataAtendimento ? `
    <div class="section">
      <div class="label">Data do Atendimento</div>
      <div class="value">${formatDate(data.dataAtendimento)}</div>
    </div>` : ''}
    <div class="section">
      <div class="label">Data do Pagamento</div>
      <div class="value">${formatDate(data.dataPagamento)}</div>
    </div>
  </div>

  <div class="footer">
    <p>Este recibo foi gerado automaticamente pelo <strong>Recebi</strong> — recebi.app</p>
    <p style="margin-top:4px">Gerado em ${formatDateTime(new Date().toISOString())}</p>
  </div>
</div>
</body>
</html>`
}
