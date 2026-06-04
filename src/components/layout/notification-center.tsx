'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, CreditCard, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notificacao {
  id: string
  tipo: 'pagamento' | 'agendamento'
  title: string
  message: string
  time: string
  createdAt: string
}

const LS_KEY = 'notificacoes_lidas_ate'

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [lidaAte, setLidaAte] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLidaAte(localStorage.getItem(LS_KEY) ?? '')
  }, [])

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notificacoes')
      if (res.ok) setNotificacoes(await res.json())
    } catch { /* falha silenciosa */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    buscar()
  }, [buscar])

  function marcarTodasLidas() {
    const agora = new Date().toISOString()
    localStorage.setItem(LS_KEY, agora)
    setLidaAte(agora)
  }

  function handleAbrir() {
    setOpen((v) => !v)
    if (!open) buscar()
  }

  const naoLidas = notificacoes.filter((n) => !lidaAte || n.createdAt > lidaAte)
  const unreadCount = naoLidas.length

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={handleAbrir} className="relative">
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={marcarTodasLidas}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading && notificacoes.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">Carregando...</p>
            )}

            {!loading && notificacoes.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">Nenhuma notificação nos últimos 30 dias.</p>
            )}

            {notificacoes.map((n) => {
              const naoLida = !lidaAte || n.createdAt > lidaAte
              return (
                <div
                  key={n.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${
                    naoLida ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                      n.tipo === 'pagamento' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'
                    }`}>
                      {n.tipo === 'pagamento'
                        ? <CreditCard className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        : <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{n.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
