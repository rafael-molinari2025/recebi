'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, CreditCard, Settings, LogOut, Wallet, CalendarDays, FileText, UsersRound, Menu, X, Activity, BarChart2, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/atendimentos', label: 'Atendimentos', icon: Calendar },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/cobrancas', label: 'Cobranças', icon: CreditCard },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/equipe', label: 'Equipe', icon: UsersRound },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const adminNavItems = [
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/admin/analitico', label: 'Analítico', icon: BarChart2 },
  { href: '/admin/usuarios', label: 'Usuários', icon: UserCog },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-4 z-40 p-2 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              re<span className="text-indigo-600 dark:text-indigo-400">cebi</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">Admin</p>
              </div>
              {adminNavItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
    </>
  )
}
