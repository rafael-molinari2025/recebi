'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Nova sessão agendada', message: 'João Silva agendou uma sessão para 10/10 às 14:00.', time: 'Agora', unread: true },
  { id: 2, title: 'Pagamento recebido', message: 'Maria Oliveira pagou a mensalidade de R$ 350,00.', time: 'Há 2 horas', unread: true },
  { id: 3, title: 'Lembrete enviado', message: 'Lembrete de vencimento enviado para Carlos Mendes.', time: 'Ontem', unread: false },
]

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notificações</h3>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Marcar todas como lidas</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${n.unread ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
