'use client'

import { Bell, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from './notification-center'

interface HeaderProps {
  title: string
  subtitle?: string
  relatorioUrl?: string
}

export function Header({ title, subtitle, relatorioUrl }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pl-14 md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {relatorioUrl && (
          <Button variant="outline" size="sm" onClick={() => window.open(relatorioUrl, '_blank')}>
            <FileDown className="h-4 w-4" />
            Relatório
          </Button>
        )}
        <NotificationCenter />
      </div>
    </header>
  )
}
