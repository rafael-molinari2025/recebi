import { prisma } from '@/lib/prisma'
import { getSupabaseUser, getPrismaUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { EquipeView } from './equipe-view'

export default async function EquipePage() {
  const authUser = await getSupabaseUser()
  const user = authUser ? await getPrismaUser(authUser.id) : null

  const isClinica = user?.plano === 'CLINICA'

  const membros = isClinica ? await prisma.membroClinica.findMany({
    where: { clinicaId: user.id },
    include: { membro: { select: { nome: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  }) : []

  return (
    <div>
      <Header title="Equipe" subtitle="Gerencie os membros da sua clínica" />
      <EquipeView isClinica={isClinica} membrosIniciais={membros} />
    </div>
  )
}
