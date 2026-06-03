import { getSupabaseUser, getPrismaUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { ConfiguracoesView } from './configuracoes-view'

export default async function ConfiguracoesPage() {
  const authUser = await getSupabaseUser()
  const user = authUser ? await getPrismaUser(authUser.id) : null

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
