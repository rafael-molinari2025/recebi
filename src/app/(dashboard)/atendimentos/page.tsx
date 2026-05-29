import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { AtendimentosView } from './atendimentos-view'

async function getData(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return { atendimentos: [], clientes: [] }

  const [atendimentos, clientes] = await Promise.all([
    prisma.atendimento.findMany({
      where: { userId: user.id },
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { data: 'desc' },
      take: 50,
    }),
    prisma.cliente.findMany({
      where: { userId: user.id, ativo: true },
      select: { id: true, nome: true, valorHonorario: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  return {
    atendimentos: atendimentos.map((a) => ({
      ...a,
      valor: Number(a.valor),
      data: a.data.toISOString(),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    clientes: clientes.map((c) => ({ ...c, valorHonorario: Number(c.valorHonorario) })),
  }
}

export default async function AtendimentosPage() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { atendimentos, clientes } = user ? await getData(user.id) : { atendimentos: [], clientes: [] }

  return (
    <div>
      <Header title="Atendimentos" subtitle="Registre sessões e gere cobranças automaticamente" />
      <AtendimentosView atendimentos={atendimentos as any} clientes={clientes} />
    </div>
  )
}
