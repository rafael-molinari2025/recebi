import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: 'indigo' | 'green' | 'red' | 'yellow'
  trend?: number
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400', value: 'text-indigo-700 dark:text-indigo-300' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/30',   icon: 'text-green-600 dark:text-green-400',   value: 'text-green-700 dark:text-green-300'   },
  red:    { bg: 'bg-red-50 dark:bg-red-900/30',       icon: 'text-red-600 dark:text-red-400',       value: 'text-red-700 dark:text-red-300'       },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400', value: 'text-yellow-700 dark:text-yellow-300' },
}

export function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className={cn('text-2xl font-bold mt-1', colors.value)}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1">
            <span className={cn('text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
