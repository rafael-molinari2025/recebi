'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Eye, Users, MousePointerClick } from 'lucide-react'

interface AnaliticoData {
  viewsHoje: number
  viewsSemana: number
  viewsMes: number
  sessoesHoje: number
  sessoesSemana: number
  sessoesMes: number
  usuariosHoje: number
  usuariosSemana: number
  usuariosMes: number
  totalUsuarios: number
  porPagina: { pagina: string; total: number }[]
  viewsPorDia: { data: string; total: number; sessoes: number }[]
  novosPorDia: { data: string; total: number }[]
}

const LABELS: Record<string, string> = {
  '/': 'Landing Page',
  '/login': 'Login',
  '/cadastro': 'Cadastro',
}

function paginaLabel(p: string) {
  return LABELS[p] ?? p
}

function formatDia(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function BarChart({ dados, accessor, cor }: {
  dados: { data: string; [k: string]: number | string }[]
  accessor: string
  cor: string
}) {
  const valores = dados.map(d => Number(d[accessor]))
  const max = Math.max(...valores, 1)
  return (
    <div className="flex items-end gap-0.5 h-20 w-full">
      {dados.map((d) => {
        const v = Number(d[accessor])
        const pct = (v / max) * 100
        return (
          <div
            key={d.data}
            className="flex-1 flex flex-col items-center justify-end group relative"
            style={{ minWidth: 2 }}
          >
            <div
              className={`w-full rounded-t-sm ${cor} opacity-80 group-hover:opacity-100 transition-opacity`}
              style={{ height: `${Math.max(pct, v > 0 ? 4 : 0)}%` }}
            />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
              {formatDia(d.data)}: {v}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AnaliticoView() {
  const [data, setData] = useState<AnaliticoData | null>(null)
  const [carregando, setCarregando] = useState(true)

  const buscar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analitico')
      if (!res.ok) return
      setData(await res.json())
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { buscar() }, [buscar])

  if (carregando) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <RefreshCw className="animate-spin h-4 w-4" />
        <span className="text-sm">Carregando analítico...</span>
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: 'Visitas (hoje / semana / mês)',
      icon: Eye,
      hoje: data.viewsHoje,
      semana: data.viewsSemana,
      mes: data.viewsMes,
      cor: 'text-indigo-600',
    },
    {
      label: 'Sessões únicas (hoje / semana / mês)',
      icon: MousePointerClick,
      hoje: data.sessoesHoje,
      semana: data.sessoesSemana,
      mes: data.sessoesMes,
      cor: 'text-violet-600',
    },
    {
      label: 'Novos usuários (hoje / semana / mês)',
      icon: Users,
      hoje: data.usuariosHoje,
      semana: data.usuariosSemana,
      mes: data.usuariosMes,
      cor: 'text-emerald-600',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ label, icon: Icon, hoje, semana, mes, cor }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                <Icon className={`h-4 w-4 ${cor}`} />
              </div>
              <div className="flex gap-4">
                <div>
                  <p className={`text-2xl font-bold ${cor}`}>{hoje}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">hoje</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{semana}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">7 dias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-500">{mes}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de visitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visitas por dia — 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart dados={data.viewsPorDia} accessor="total" cor="bg-indigo-400" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{formatDia(data.viewsPorDia[0]?.data ?? '')}</span>
              <span>{formatDia(data.viewsPorDia[data.viewsPorDia.length - 1]?.data ?? '')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Novos cadastros por dia — 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart dados={data.novosPorDia} accessor="total" cor="bg-emerald-400" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{formatDia(data.novosPorDia[0]?.data ?? '')}</span>
              <span>{formatDia(data.novosPorDia[data.novosPorDia.length - 1]?.data ?? '')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por página + total usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visitas por página (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.porPagina.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma visita registrada ainda</p>
            ) : (
              <div className="space-y-3">
                {data.porPagina.map(({ pagina, total }) => {
                  const max = data.porPagina[0]?.total ?? 1
                  return (
                    <div key={pagina}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{paginaLabel(pagina)}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(total / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de usuários na plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 mt-2">{data.totalUsuarios}</p>
            <p className="text-sm text-gray-500 mt-2">usuários cadastrados</p>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">Novos nos últimos 30 dias</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">+{data.usuariosMes}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
