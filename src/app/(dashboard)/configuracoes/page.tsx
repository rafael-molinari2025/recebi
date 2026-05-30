import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { ConfiguracoesView } from './configuracoes-view'

async function getUser(supabaseId: string) {
  return prisma.user.findUnique({ where: { supabaseId } })
}

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const user = authUser ? await getUser(authUser.id) : null

  const userData = user ? {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  } : null

  const integracoes = {
    asaas: !!process.env.ASAAS_API_KEY,
    whatsapp: !!(process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN),
  }

  return (
    <div>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />
      <ConfiguracoesView user={userData as any} integracoes={integracoes} />
    </div>
  )
}
