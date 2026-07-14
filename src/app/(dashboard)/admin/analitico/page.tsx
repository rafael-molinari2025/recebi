import { notFound } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { AnaliticoView } from './analitico-view'

export const dynamic = 'force-dynamic'

export default async function AnaliticoPage() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) notFound()

  return (
    <div>
      <Header title="Analítico" subtitle="Acessos à plataforma e crescimento nos últimos 30 dias" />
      <AnaliticoView />
    </div>
  )
}
