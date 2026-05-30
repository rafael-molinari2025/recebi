import axios from 'axios'
import { formatCurrency, formatDate } from './utils'

// Z-API: https://z-api.io
// Variáveis necessárias no Vercel:
//   ZAPI_INSTANCE_ID  — ID da instância
//   ZAPI_TOKEN        — Token da instância
//   ZAPI_CLIENT_TOKEN — Security token da conta (Client-Token)

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID
const ZAPI_TOKEN = process.env.ZAPI_TOKEN
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN

export function whatsappConfigurado(): boolean {
  return !!(ZAPI_INSTANCE_ID && ZAPI_TOKEN)
}

async function enviarMensagem(numero: string, mensagem: string): Promise<void> {
  const telefone = numero.replace(/\D/g, '')
  const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`

  await axios.post(
    `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`,
    { phone: numeroFormatado, message: mensagem },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(ZAPI_CLIENT_TOKEN ? { 'Client-Token': ZAPI_CLIENT_TOKEN } : {}),
      },
    }
  )
}

export async function enviarLembreteVencimento(params: {
  nome: string
  telefone: string
  valor: number
  vencimento: string
  linkPagamento?: string
  profissionalNome: string
}): Promise<void> {
  const mensagem = `Olá, ${params.nome}!
Você possui um pagamento de *${formatCurrency(params.valor)}* com vencimento em *${formatDate(params.vencimento)}*.
Caso o pagamento já tenha sido efetuado, por favor desconsidere esta mensagem.${params.linkPagamento ? `\nPague pelo link: ${params.linkPagamento}` : ''}
Em caso de dúvidas, estamos à disposição.
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
Identificamos que o pagamento de *${formatCurrency(params.valor)}*, com vencimento em *${formatDate(params.vencimento)}*, encontra-se em aberto há ${params.diasAtraso} ${params.diasAtraso === 1 ? 'dia' : 'dias'}.
Caso o pagamento já tenha sido efetuado, por favor desconsidere esta mensagem.${params.linkPagamento ? `\nRegularize pelo link: ${params.linkPagamento}` : ''}
Em caso de dúvidas, estamos à disposição.
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
  const mensagem = `Olá, ${params.nome}!
Seu pagamento de *${formatCurrency(params.valor)}* foi confirmado. Obrigado!${params.reciboUrl ? `\nSeu recibo está disponível em: ${params.reciboUrl}` : ''}
_${params.profissionalNome}_`

  await enviarMensagem(params.telefone, mensagem)
}
