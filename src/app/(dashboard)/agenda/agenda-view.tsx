'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay,
  format, isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Atendimento {
  id: string
  data: string
  clienteNome: string
  clienteId: string
  descricao?: string
  valor: number
}

interface Props {
  atendimentos: Atendimento[]
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AgendaView({ atendimentos }: Props) {
  const router = useRouter()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)

  const inicioMes = startOfMonth(mesAtual)
  const fimMes = endOfMonth(mesAtual)
  const inicioCalendario = startOfWeek(inicioMes, { locale: ptBR })
  const fimCalendario = endOfWeek(fimMes, { locale: ptBR })

  const dias: Date[] = []
  let dia = inicioCalendario
  while (dia <= fimCalendario) {
    dias.push(dia)
    dia = addDays(dia, 1)
  }

  const atendimentosDoDia = (d: Date) =>
    atendimentos.filter((a) => isSameDay(new Date(a.data), d))

  const atendimentosSelecionados = diaSelecionado ? atendimentosDoDia(diaSelecionado) : []

  return (
    <div className="p-6 space-y-4">
      {/* Navegação do mês */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setMesAtual(subMonths(mesAtual, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setMesAtual(addMonths(mesAtual, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Grid do calendário */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DIAS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7">
          {dias.map((d, i) => {
            const ats = atendimentosDoDia(d)
            const selecionado = diaSelecionado && isSameDay(d, diaSelecionado)
            const doMes = isSameMonth(d, mesAtual)
            const hoje = isToday(d)
            return (
              <div
                key={i}
                onClick={() => setDiaSelecionado(isSameDay(d, diaSelecionado ?? new Date(0)) ? null : d)}
                className={`min-h-[72px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors
                  ${selecionado ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                  ${!doMes ? 'opacity-40' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 flex items-center justify-center w-6 h-6 rounded-full
                  ${hoje ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                  {format(d, 'd')}
                </div>
                {ats.slice(0, 2).map((a) => (
                  <div key={a.id} className="text-[10px] bg-indigo-100 text-indigo-700 rounded px-1 py-0.5 truncate mb-0.5">
                    {a.clienteNome}
                  </div>
                ))}
                {ats.length > 2 && (
                  <div className="text-[10px] text-gray-400">+{ats.length - 2} mais</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Painel do dia selecionado */}
      {diaSelecionado && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 capitalize">
            {format(diaSelecionado, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          {atendimentosSelecionados.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {atendimentosSelecionados.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => router.push(`/clientes/${a.clienteId}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.clienteNome}</p>
                    {a.descricao && <p className="text-xs text-gray-500">{a.descricao}</p>}
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{formatCurrency(a.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
