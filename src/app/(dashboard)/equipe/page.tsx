import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { EquipeView } from './equipe-view'

async function getUser(supabaseId: string) {
  return prisma.user.findUnique({ where: { supabaseId } })
}

export default async function EquipePage() {
  const supabase = await createSupabaseClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const user = authUser ? await getUser(authUser.id) : null

  const isClinica = user?.plano === 'CLINICA'

  const membros = isClinica ? await prisma.membroClinica.findMany({
    where: { clinicaId: user.id },
    include: { membro: { select: { nome: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  }) : []

  return (
    <div>
      <Header title="Equipe" subtitle="Gerencie os membros da sua clínica" />
      <EquipeView isClinica={isClinica} membrosIniciais={membros as any} />
    </div>
  )
}
