import axios from 'axios'
import { formatCurrency, formatDate } from './utils'

const wa = axios.create({
  baseURL: process.env.WHATSAPP_API_URL ?? 'http://localhost:8080',
  headers: {
    apikey: process.env.WHATSAPP_API_KEY,
    'Content-Type': 'application/json',
  },
})

const INSTANCE = process.env.WHATSAPP_INSTANCE ?? 'recebi'

async function enviarMensagem(numero: string, mensagem: string): Promise<void> {
  const telefone = numero.replace(/\D/g, '')
  const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`

  await wa.post(`/message/sendText/${INSTANCE}`, {
    number: numeroFormatado,
    text: mensagem,
  })
}

export async function enviarLembreteVencimento(params: {
  nome: string
  telefone: string
  valor: number
  vencimento: string
  linkPagamento?: string
  profissionalNome: string
}): Promise<void> {
  const mensagem = `Olá, ${params.nome}! 😊

Passando para lembrar que você tem um pagamento no valor de *${formatCurrency(params.valor)}* com vencimento em *${formatDate(params.vencimento)}*.

${params.linkPagamento ? `Pague com facilidade pelo link:\n${params.linkPagamento}` : ''}

Qualquer dúvida, é só chamar!
_${params.profissionalNome}_`

  await enviarMensagem(params.telefone, mensagem)
}

export async function enviarAvisoAtraso(params: {
  nome: string
  telefone: string
  valor: number
  vencimento: string
  diasAtraso: number
  linkPagamento?: string
  profissionalNome: string
}): Promise<void> {
  const mensagem = `Olá, ${params.nome}!

Notei que o pagamento de *${formatCurrency(params.valor)}* (vencido em ${formatDate(params.vencimento)}) ainda está em aberto.

Caso já tenha pago, desconsidere esta mensagem. Se precisar combinar algo, pode me chamar.

${params.linkPagamento ? `Link para pagamento:\n${params.linkPagamento}` : ''}

_${params.profissionalNome}_`

  await enviarMensagem(params.telefone, mensagem)
}

export async function enviarConfirmacaoPagamento(params: {
  nome: string
  telefone: string
  valor: number
  reciboUrl?: string
  profissionalNome: string
}): Promise<void> {
  const mensagem = `Olá, ${params.nome}! ✅

Pagamento de *${formatCurrency(params.valor)}* confirmado. Obrigado!

${params.reciboUrl ? `Seu recibo está disponível em:\n${params.reciboUrl}` : ''}

_${params.profissionalNome}_`

  await enviarMensagem(params.telefone, mensagem)
}
