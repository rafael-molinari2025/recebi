import { notFound } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { UsuariosView } from './usuarios-view'

export const dynamic = 'force-dynamic'

export default async function UsuariosAdminPage() {
  const user = await getSupabaseUser()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!user || !adminEmail || user.email !== adminEmail) notFound()

  return (
    <div>
      <Header title="Usuários" subtitle="Todos os cadastros na plataforma — gerencie planos e acessos" />
      <UsuariosView adminEmail={adminEmail} />
    </div>
  )
}
