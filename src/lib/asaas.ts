import axios from 'axios'

const asaas = axios.create({
  baseURL: process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json',
  },
})

export interface AsaasCustomer {
  id?: string
  name: string
  email?: string
  mobilePhone?: string
  cpfCnpj?: string
}

export interface AsaasChargeInput {
  customer: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
  value: number
  dueDate: string // YYYY-MM-DD
  description?: string
  externalReference?: string
}

export interface AsaasChargeResponse {
  id: string
  customer: string
  value: number
  dueDate: string
  status: string
  invoiceUrl: string
  bankSlipUrl?: string
  pixQrCodeId?: string
  pixCopiaECola?: string
}

export async function criarCliente(data: AsaasCustomer): Promise<AsaasCustomer> {
  const res = await asaas.post('/customers', data)
  return res.data
}

export async function criarCobranca(data: AsaasChargeInput): Promise<AsaasChargeResponse> {
  const res = await asaas.post('/payments', data)
  return res.data
}

export async function buscarCobranca(id: string): Promise<AsaasChargeResponse> {
  const res = await asaas.get(`/payments/${id}`)
  return res.data
}

export async function cancelarCobranca(id: string): Promise<void> {
  await asaas.delete(`/payments/${id}`)
}

export async function buscarPixCobranca(id: string): Promise<{ payload: string; encodedImage: string }> {
  const res = await asaas.get(`/payments/${id}/pixQrCode`)
  return res.data
}

export async function estornarCobranca(id: string): Promise<void> {
  await asaas.post(`/payments/${id}/refund`)
}
