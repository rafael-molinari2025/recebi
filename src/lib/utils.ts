import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM yyyy', { locale: ptBR })
}

export function diasAtraso(vencimento: string | Date): number {
  const d = typeof vencimento === 'string' ? parseISO(vencimento) : vencimento
  if (!isPast(d)) return 0
  return differenceInDays(new Date(), d)
}

export function formatTelefone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return tel
}

export function getTipoAtendimentoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    SESSAO_AVULSA: 'Sessão Avulsa',
    PACOTE_MENSAL: 'Pacote Mensal',
    PLANO_FIXO: 'Plano Fixo',
  }
  return labels[tipo] ?? tipo
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    PAGO: 'Pago',
    ATRASADO: 'Atrasado',
    CANCELADO: 'Cancelado',
    ESTORNADO: 'Estornado',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    PAGO: 'bg-green-100 text-green-800',
    ATRASADO: 'bg-red-100 text-red-800',
    CANCELADO: 'bg-gray-100 text-gray-800',
    ESTORNADO: 'bg-purple-100 text-purple-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function gerarProximoVencimento(diaVencimento: number): Date {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const vencimentoMesAtual = new Date(ano, mes, diaVencimento)

  if (vencimentoMesAtual > hoje) return vencimentoMesAtual
  return new Date(ano, mes + 1, diaVencimento)
}
