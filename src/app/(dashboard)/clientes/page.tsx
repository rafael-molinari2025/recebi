import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { ClientesView } from './clientes-view'

async function getClientes(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return []

  return prisma.cliente.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { atendimentos: true, cobrancas: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ClientesPage() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientes = user ? await getClientes(user.id) : []

  const clientesSerializados = clientes.map((c) => ({
    id: c.id,
    userId: c.userId,
    nome: c.nome,
    cpfCnpj: c.cpfCnpj ?? undefined,
    telefone: c.telefone,
    email: c.email ?? undefined,
    tipoAtendimento: c.tipoAtendimento,
    valorHonorario: Number(c.valorHonorario),
    diaVencimento: c.diaVencimento,
    ativo: c.ativo,
    observacoes: c.observacoes ?? undefined,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
  }))


  return (
    <div>
      <Header title="Clientes" subtitle="Gerencie seus clientes e honorários" />
      <ClientesView clientes={clientesSerializados} />
    </div>
  )
}
