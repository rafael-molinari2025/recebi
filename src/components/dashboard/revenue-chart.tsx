'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    mes: string
    recebido: number
    pendente: number
    atrasado: number
  }>
}

function formatBRL(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={{ strokeOpacity: 0.2 }} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} width={50} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => formatBRL(Number(value))} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
        <Legend wrapperStyle={{ fontSize: 12, opacity: 0.8 }} />
        <Bar dataKey="recebido" name="Recebido" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pendente" name="A receber" fill="#eab308" radius={[4, 4, 0, 0]} />
        <Bar dataKey="atrasado" name="Atrasado" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
