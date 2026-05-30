export type Plano = 'STARTER' | 'PRO' | 'CLINICA'
export type TipoAtendimento = 'SESSAO_AVULSA' | 'PACOTE_MENSAL' | 'PLANO_FIXO'
export type StatusCobranca = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO' | 'ESTORNADO'

export interface User {
  id: string
  supabaseId: string
  nome: string
  email: string
  telefone?: string
  profissao?: string
  empresa?: string
  plano: Plano
  createdAt: string
}

export interface Cliente {
  id: string
  userId: string
  nome: string
  telefone: string
  email?: string
  tipoAtendimento: TipoAtendimento
  valorHonorario: number
  diaVencimento: number
  ativo: boolean
  observacoes?: string
  createdAt: string
  _count?: {
    atendimentos: number
    cobrancas: number
  }
}

export interface Atendimento {
  id: string
  clienteId: string
  cliente?: Cliente
  data: string
  descricao?: string
  notas?: string
  valor: number
  gerarCobranca: boolean
  createdAt: string
}

export interface Cobranca {
  id: string
  clienteId: string
  cliente?: Cliente
  atendimentoId?: string
  valor: number
  vencimento: string
  status: StatusCobranca
  descricao?: string
  asaasId?: string
  linkPagamento?: string
  pixCopiaECola?: string
  boletoUrl?: string
  reciboGerado: boolean
  reciboUrl?: string
  pagamentoEm?: string
  createdAt: string
}

export interface DashboardStats {
  totalReceber: number
  totalRecebido: number
  totalAtrasado: number
  taxaInadimplencia: number
  clientesAtivos: number
  atendimentosMes: number
  cobrancasPendentes: number
  evoluçãoMensal: Array<{
    mes: string
    recebido: number
    atrasado: number
  }>
  clientesEmAtraso: Array<{
    id: string
    nome: string
    valor: number
    diasAtraso: number
  }>
}

export interface AsaasCharge {
  id: string
  customer: string
  value: number
  dueDate: string
  status: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCodeId?: string
  pixCopiaECola?: string
}

export interface CreateClienteInput {
  nome: string
  telefone: string
  email?: string
  tipoAtendimento: TipoAtendimento
  valorHonorario: number
  diaVencimento: number
  observacoes?: string
}

export interface CreateAtendimentoInput {
  clienteId: string
  data: string
  descricao?: string
  valor: number
  gerarCobranca: boolean
}

export interface CreateCobrancaInput {
  clienteId: string
  atendimentoId?: string
  valor: number
  vencimento: string
  descricao?: string
}
