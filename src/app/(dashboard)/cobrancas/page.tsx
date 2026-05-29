import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { CobrancasView } from './cobrancas-view'

async function getCobrancas(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return []

  return prisma.cobranca.findMany({
    where: { userId: user.id },
    include: { cliente: { select: { id: true, nome: true, telefone: true } } },
    orderBy: { vencimento: 'desc' },
    take: 100,
  })
}

export default async function CobrancasPage() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cobrancas = user ? await getCobrancas(user.id) : []

  const serializadas = cobrancas.map((c) => ({
    ...c,
    valor: Number(c.valor),
    vencimento: c.vencimento.toISOString(),
    pagamentoEm: c.pagamentoEm?.toISOString() ?? undefined,
    descricao: c.descricao ?? undefined,
    asaasId: c.asaasId ?? undefined,
    linkPagamento: c.linkPagamento ?? undefined,
    pixCopiaECola: c.pixCopiaECola ?? undefined,
    boletoUrl: c.boletoUrl ?? undefined,
    reciboUrl: c.reciboUrl ?? undefined,
    atendimentoId: c.atendimentoId ?? undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div>
      <Header title="Cobranças" subtitle="Gerencie pagamentos e envie lembretes" />
      <CobrancasView cobrancas={serializadas as any} />
    </div>
  )
}
