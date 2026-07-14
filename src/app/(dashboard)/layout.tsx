import { redirect } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSupabaseUser()

  if (!user) redirect('/login')

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdmin = !!(adminEmail && user.email === adminEmail)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
