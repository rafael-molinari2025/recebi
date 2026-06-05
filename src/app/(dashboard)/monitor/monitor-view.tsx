'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { RefreshCw, Database, Zap, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp, Wrench } from 'lucide-react'

interface MonitorLog {
  id: string
  createdAt: string
  status: string
  dbOk: boolean
  dbLatencyMs: number | null
  asaasOk: boolean | null
  whatsappOk: boolean | null
  corrigidas: number
  alertaEnviado: boolean
  detalhes: string | null
}

interface Resumo {
  status: string
  uptime: number
  totalCorrigidas24h: number
  ultimaVerificacao: string | null
}

function StatusIcon({ ok, size = 18 }: { ok: boolean | null; size?: number }) {
  if (ok === null) return <span className="text-gray-400" style={{ fontSize: size - 4 }}>N/A</span>
  if (ok) return <CheckCircle2 className="text-green-500" size={size} />
  return <XCircle className="text-red-500" size={size} />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OK: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DEGRADADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    FALHA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? map.OK}`}>
      {status === 'OK' && <CheckCircle2 size={11} />}
      {status === 'DEGRADADO' && <AlertTriangle size={11} />}
      {status === 'FALHA' && <XCircle size={11} />}
      {status}
    </span>
  )
}

function tempoRelativo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `há ${diff}s`
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return formatDate(iso)
}

export function MonitorView() {
  const [logs, setLogs] = useState<MonitorLog[]>([])
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null)

  const buscar = useCallback(async () => {
    try {
      const res = await fetch('/api/monitor/logs')
      if (!res.ok) return
      const data = await res.json()
      setLogs(data.logs)
      setResumo(data.resumo)
      setAtualizadoEm(new Date())
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    buscar()
    const interval = setInterval(buscar, 600_000) // atualiza a cada 10 min
    return () => clearInterval(interval)
  }, [buscar])

  const ultimo = logs[0]

  if (carregando) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <RefreshCw className="animate-spin h-4 w-4" />
        <span className="text-sm">Carregando dados de monitoramento...</span>
      </div>
    )
  }

  if (!resumo || logs.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aguardando primeira execução do cron de monitoramento.</p>
            <p className="text-xs text-gray-400 mt-1">O sistema verificará automaticamente uma vez por dia (6h UTC).</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Status atual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status Atual</span>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-1"><StatusBadge status={resumo.status} /></div>
            <p className="text-xs text-gray-400 mt-2">
              {resumo.ultimaVerificacao ? tempoRelativo(resumo.ultimaVerificacao) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Uptime (24h)</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resumo.uptime}%</p>
            <p className="text-xs text-gray-400 mt-1">{logs.length} verificações</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Auto-correções (24h)</span>
              <Wrench className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resumo.totalCorrigidas24h}</p>
            <p className="text-xs text-gray-400 mt-1">cobranças corrigidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Última Check</span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {resumo.ultimaVerificacao ? tempoRelativo(resumo.ultimaVerificacao) : '—'}
            </p>
            {atualizadoEm && (
              <p className="text-xs text-gray-400 mt-1">painel: {tempoRelativo(atualizadoEm.toISOString())}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Componentes */}
      {ultimo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Componentes — Última Verificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Database className="h-5 w-5 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Banco de Dados</p>
                  {ultimo.dbLatencyMs != null && (
                    <p className="text-xs text-gray-400">{ultimo.dbLatencyMs}ms</p>
                  )}
                </div>
                <StatusIcon ok={ultimo.dbOk} />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Zap className="h-5 w-5 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Asaas</p>
                  <p className="text-xs text-gray-400">gateway de pagamento</p>
                </div>
                <StatusIcon ok={ultimo.asaasOk} />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <MessageSquare className="h-5 w-5 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</p>
                  <p className="text-xs text-gray-400">Evolution API</p>
                </div>
                <StatusIcon ok={ultimo.whatsappOk} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Histórico de Verificações</CardTitle>
          <button
            onClick={buscar}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </button>
        </CardHeader>
        <CardContent>
          {/* Mini gráfico de barras de status */}
          <div className="flex gap-0.5 mb-4 h-6 items-end" title="Histórico visual — verde=OK, amarelo=DEGRADADO, vermelho=FALHA">
            {logs.slice(0, 100).reverse().map((l) => (
              <div
                key={l.id}
                className={`flex-1 rounded-sm min-w-[2px] ${
                  l.status === 'OK'
                    ? 'bg-green-400'
                    : l.status === 'DEGRADADO'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ height: l.status === 'OK' ? '100%' : l.status === 'DEGRADADO' ? '60%' : '30%' }}
                title={`${tempoRelativo(l.createdAt)} — ${l.status}`}
              />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Horário</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-2 pr-4 font-medium text-gray-500">BD</th>
                  <th className="text-center py-2 pr-4 font-medium text-gray-500">Asaas</th>
                  <th className="text-center py-2 pr-4 font-medium text-gray-500">WhatsApp</th>
                  <th className="text-right py-2 font-medium text-gray-500">Correções</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{tempoRelativo(l.createdAt)}</td>
                    <td className="py-2 pr-4"><StatusBadge status={l.status} /></td>
                    <td className="py-2 pr-4 text-center">
                      <span className={l.dbOk ? 'text-green-600' : 'text-red-600'}>
                        {l.dbOk ? `${l.dbLatencyMs ?? '?'}ms` : 'OFFLINE'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-center"><StatusIcon ok={l.asaasOk} size={14} /></td>
                    <td className="py-2 pr-4 text-center"><StatusIcon ok={l.whatsappOk} size={14} /></td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                      {l.corrigidas > 0 ? <span className="text-amber-600 font-medium">{l.corrigidas}</span> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
