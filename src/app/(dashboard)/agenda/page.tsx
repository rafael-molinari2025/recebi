import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { AgendaView } from './agenda-view'
import { startOfMonth, endOfMonth } from 'date-fns'

async function getData(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return []

  const agora = new Date()
  const inicio = startOfMonth(agora)
  const fim = endOfMonth(agora)

  const atendimentos = await prisma.atendimento.findMany({
    where: { userId: user.id, data: { gte: inicio, lte: fim } },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { data: 'asc' },
  })

  return atendimentos.map((a) => ({
    id: a.id,
    data: a.data.toISOString(),
    clienteNome: a.cliente.nome,
    clienteId: a.cliente.id,
    descricao: a.descricao ?? undefined,
    valor: Number(a.valor),
  }))
}

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const atendimentos = user ? await getData(user.id) : []

  return (
    <div>
      <Header title="Agenda" subtitle="Visualização de atendimentos do mês" />
      <AgendaView atendimentos={atendimentos} />
    </div>
  )
}
