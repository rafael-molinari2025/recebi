import { getSupabaseUser, getPrismaUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { ConfiguracoesView } from './configuracoes-view'

export default async function ConfiguracoesPage() {
  const authUser = await getSupabaseUser()
  const user = authUser ? await getPrismaUser(authUser.id) : null

  const userData = user ? {
    id: user.id,
    supabaseId: user.supabaseId,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone ?? undefined,
    profissao: user.profissao ?? undefined,
    empresa: user.empresa ?? undefined,
    cnpj: user.cnpj ?? undefined,
    plano: user.plano,
    createdAt: user.createdAt.toISOString(),
  } : null

  const integracoes = {
    asaas: !!process.env.ASAAS_API_KEY,
    whatsapp: !!(
      process.env.EVOLUTION_API_URL &&
      process.env.EVOLUTION_API_KEY &&
      process.env.EVOLUTION_INSTANCE
    ),
  }

  const isAdmin = !!authUser?.email && authUser.email === process.env.ADMIN_EMAIL

  return (
    <div>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />
      <ConfiguracoesView user={userData} integracoes={integracoes} isAdmin={isAdmin} />
    </div>
  )
}
