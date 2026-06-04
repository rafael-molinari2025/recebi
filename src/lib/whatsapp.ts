import axios from 'axios'
import { formatCurrency, formatDate } from './utils'

// Evolution API (self-hosted — gratuito via Oracle Cloud Free Tier)
// Variáveis necessárias no Vercel:
//   EVOLUTION_API_URL      — URL da sua instância (ex: http://IP_ORACLE:8080)
//   EVOLUTION_API_KEY      — Chave definida na variável AUTHENTICATION_API_KEY do Docker
//   EVOLUTION_INSTANCE     — Nome da instância criada (ex: recebi)

const EVOLUTION_URL      = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY  = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE

export function whatsappConfigurado(): boolean {
  return !!(EVOLUTION_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE)
}

async function enviarMensagem(numero: string, mensagem: string): Promise<void> {
  const telefone = numero.replace(/\D/g, '')
  const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`

  await axios.post(
    `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
    { number: numeroFormatado, text: mensagem },
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY!,
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
