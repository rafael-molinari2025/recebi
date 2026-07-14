import { notFound } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { MonitorView } from './monitor-view'

export const dynamic = 'force-dynamic'

export default async function MonitorPage() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) {
    notFound()
  }

  return (
    <div>
      <Header
        title="Monitor do Sistema"
        subtitle="Verificação automática diária — histórico das últimas 24 horas"
      />
      <MonitorView />
    </div>
  )
}
