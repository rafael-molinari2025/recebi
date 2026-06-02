import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { RelatoriosView } from './relatorios-view'

async function getUser(supabaseId: string) {
  return prisma.user.findUnique({ where: { supabaseId } })
}

export default async function RelatoriosPage() {
  const supabase = await createSupabaseClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const user = authUser ? await getUser(authUser.id) : null

  return (
    <div>
      <Header title="Relatórios" subtitle="Exporte seus dados e visualize relatórios mensais" />
      <RelatoriosView />
    </div>
  )
}
