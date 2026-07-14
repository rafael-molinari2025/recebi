import { prisma } from '@/lib/prisma'
import { getSupabaseUser, getPrismaUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { CobrancasView } from './cobrancas-view'

async function getCobrancas(supabaseId: string) {
  const user = await getPrismaUser(supabaseId)
  if (!user) return []

  return prisma.cobranca.findMany({
    where: { userId: user.id },
    include: { cliente: { select: { id: true, nome: true, telefone: true } } },
    orderBy: { vencimento: 'desc' },
    take: 100,
  })
}

export default async function CobrancasPage() {
  const user = await getSupabaseUser()
  const cobrancas = user ? await getCobrancas(user.id) : []

  const serializadas = cobrancas.map((c) => ({
    id: c.id,
    userId: c.userId,
    clienteId: c.clienteId,
    atendimentoId: c.atendimentoId ?? undefined,
    valor: isNaN(Number(c.valor)) ? 0 : Number(c.valor),
    vencimento: c.vencimento ? new Date(c.vencimento).toISOString() : new Date().toISOString(),
    status: c.status,
    descricao: c.descricao ?? undefined,
    asaasId: c.asaasId ?? undefined,
    linkPagamento: c.linkPagamento ?? undefined,
    pixCopiaECola: c.pixCopiaECola ?? undefined,
    boletoUrl: c.boletoUrl ?? undefined,
    reciboGerado: !!c.reciboGerado,
    reciboUrl: c.reciboUrl ?? undefined,
    lembreteEnviado3d: !!c.lembreteEnviado3d,
    lembreteEnviado1d: !!c.lembreteEnviado1d,
    lembreteAtraso1d: !!c.lembreteAtraso1d,
    lembreteAtraso7d: !!c.lembreteAtraso7d,
    pagamentoEm: c.pagamentoEm ? new Date(c.pagamentoEm).toISOString() : undefined,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
    cliente: {
      id: c.cliente?.id || '',
      nome: c.cliente?.nome || '',
      telefone: c.cliente?.telefone || '',
    }
  }))

  return (
    <div>
      <Header title="Cobranças" subtitle="Gerencie pagamentos e envie lembretes" />
      <CobrancasView cobrancas={serializadas as any} />
    </div>
  )
}
