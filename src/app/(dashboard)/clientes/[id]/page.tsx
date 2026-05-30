import { notFound } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { ClienteDetalheView } from './cliente-detalhe-view'

async function getData(supabaseId: string, clienteId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return null

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, userId: user.id },
    include: {
      atendimentos: {
        orderBy: { data: 'desc' },
        take: 50,
        include: { cobranca: { select: { id: true, status: true, valor: true, vencimento: true } } },
      },
      cobrancas: {
        orderBy: { vencimento: 'desc' },
        take: 50,
      },
    },
  })

  if (!cliente) return null

  const totalPago = cliente.cobrancas
    .filter((c) => c.status === 'PAGO')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalPendente = cliente.cobrancas
    .filter((c) => c.status === 'PENDENTE')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalAtrasado = cliente.cobrancas
    .filter((c) => c.status === 'ATRASADO')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  return {
    cliente: {
      ...cliente,
      valorHonorario: Number(cliente.valorHonorario),
      email: cliente.email ?? undefined,
      observacoes: cliente.observacoes ?? undefined,
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
      atendimentos: cliente.atendimentos.map((a) => ({
        ...a,
        valor: Number(a.valor),
        descricao: a.descricao ?? undefined,
        data: a.data.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        cobranca: a.cobranca ? {
          ...a.cobranca,
          valor: Number(a.cobranca.valor),
          vencimento: a.cobranca.vencimento.toISOString(),
        } : null,
      })),
      cobrancas: cliente.cobrancas.map((c) => ({
        ...c,
        valor: Number(c.valor),
        vencimento: c.vencimento.toISOString(),
        descricao: c.descricao ?? undefined,
        pagamentoEm: c.pagamentoEm?.toISOString() ?? undefined,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    },
    stats: { totalPago, totalPendente, totalAtrasado },
  }
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const data = await getData(user.id, id)
  if (!data) return notFound()

  return (
    <div>
      <Header
        title={data.cliente.nome}
        subtitle={`Perfil completo do cliente`}
      />
      <ClienteDetalheView cliente={data.cliente as any} stats={data.stats} />
    </div>
  )
}
