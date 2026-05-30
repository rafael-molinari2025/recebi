'use client'

import { Bell, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
  relatorioUrl?: string
}

export function Header({ title, subtitle, relatorioUrl }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {relatorioUrl && (
          <Button variant="outline" size="sm" onClick={() => window.open(relatorioUrl, '_blank')}>
            <FileDown className="h-4 w-4" />
            Relatório
          </Button>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  )
}
