import { DollarSign, TrendingDown, Clock, Users, FileDown } from 'lucide-react'

export const revalidate = 60
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, diasAtraso } from '@/lib/utils'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function getDashboardData(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return null

  const agora = new Date()
  const inicioMes = startOfMonth(agora)
  const fimMes = endOfMonth(agora)

  const [cobrancasMes, cobrancasAtrasadas, clientesAtivos, atendimentosMes] = await Promise.all([
    prisma.cobranca.findMany({
      where: { userId: user.id, vencimento: { gte: inicioMes, lte: fimMes } },
      include: { cliente: { select: { nome: true, telefone: true } } },
      orderBy: { vencimento: 'asc' },
    }),
    // BUG-02: buscar atrasos de TODOS os meses (não só o atual)
    prisma.cobranca.findMany({
      where: {
        userId: user.id,
        status: { in: ['ATRASADO', 'PENDENTE'] },
        vencimento: { lt: inicioMes }, // meses anteriores ainda em aberto
      },
      include: { cliente: { select: { nome: true } } },
    }),
    prisma.cliente.count({ where: { userId: user.id, ativo: true } }),
    prisma.atendimento.count({ where: { userId: user.id, data: { gte: inicioMes, lte: fimMes } } }),
  ])

  // BUG-01: categorias mutuamente exclusivas para cálculo correto
  const pendentesNaoVencidos = cobrancasMes.filter((c) => c.status === 'PENDENTE' && new Date(c.vencimento) >= agora)
  const atrasadosMes = cobrancasMes.filter((c) => c.status === 'ATRASADO' || (c.status === 'PENDENTE' && new Date(c.vencimento) < agora))

  const totalReceber = pendentesNaoVencidos.reduce((acc, c) => acc + Number(c.valor), 0)
  const totalRecebido = cobrancasMes.filter((c) => c.status === 'PAGO').reduce((acc, c) => acc + Number(c.valor), 0)
  const totalAtrasadoMes = atrasadosMes.reduce((acc, c) => acc + Number(c.valor), 0)
  const totalAtrasadoHistorico = cobrancasAtrasadas.reduce((acc, c) => acc + Number(c.valor), 0)
  const totalAtrasado = totalAtrasadoMes + totalAtrasadoHistorico

  // BUG-01: denominador correto inclui todos os valores (pago + a receber + atrasado)
  const totalGeral = totalRecebido + totalReceber + totalAtrasado
  const taxaInadimplencia = totalGeral > 0 ? Math.round((totalAtrasado / totalGeral) * 100) : 0

  // BUG-02: combinar atrasos do mês + histórico
  const clientesEmAtraso = [
    ...atrasadosMes.map((c) => ({ id: c.id, nome: c.cliente.nome, valor: Number(c.valor), diasAtraso: diasAtraso(c.vencimento.toISOString()) })),
    ...cobrancasAtrasadas.map((c) => ({ id: c.id, nome: c.cliente.nome, valor: Number(c.valor), diasAtraso: diasAtraso(c.vencimento.toISOString()) })),
  ].sort((a, b) => b.diasAtraso - a.diasAtraso)

  // Evolução dos últimos 6 meses
  const meses = Array.from({ length: 6 }, (_, i) => subMonths(agora, 5 - i))
  const cobrancas6m = await prisma.cobranca.findMany({
    where: { userId: user.id, vencimento: { gte: startOfMonth(meses[0]), lte: fimMes } },
    select: { valor: true, status: true, vencimento: true },
  })

  const evolucaoMensal = meses.map((m) => {
    const inicio = startOfMonth(m)
    const fim = endOfMonth(m)
    const doMes = cobrancas6m.filter((c) => c.vencimento >= inicio && c.vencimento <= fim)
    return {
      mes: format(m, 'MMM', { locale: ptBR }),
      recebido: doMes.filter((c) => c.status === 'PAGO').reduce((acc, c) => acc + Number(c.valor), 0),
      pendente: doMes.filter((c) => c.status === 'PENDENTE').reduce((acc, c) => acc + Number(c.valor), 0),
      atrasado: doMes.filter((c) => c.status === 'ATRASADO').reduce((acc, c) => acc + Number(c.valor), 0),
    }
  })

  return {
    totalReceber, totalRecebido, totalAtrasado, taxaInadimplencia,
    clientesAtivos, atendimentosMes, clientesEmAtraso, evolucaoMensal,
    cobrancasPendentes: pendentesNaoVencidos,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const data = user ? await getDashboardData(user.id) : null

  if (!data) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Visão geral do mês" />
        <div className="p-6"><p className="text-gray-500">Configure sua conta para começar.</p></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Visão geral do mês atual" relatorioUrl="/api/relatorio" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="A Receber" value={formatCurrency(data.totalReceber)} subtitle="pendente este mês" icon={Clock} color="yellow" />
          <StatsCard title="Recebido" value={formatCurrency(data.totalRecebido)} subtitle="confirmado este mês" icon={DollarSign} color="green" />
          <StatsCard title="Em Atraso" value={formatCurrency(data.totalAtrasado)} subtitle={`${data.taxaInadimplencia}% de inadimplência`} icon={TrendingDown} color="red" />
          <StatsCard title="Clientes Ativos" value={String(data.clientesAtivos)} subtitle={`${data.atendimentosMes} atendimentos este mês`} icon={Users} color="indigo" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira — Últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.evolucaoMensal} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Clientes em Atraso
                {data.clientesEmAtraso.length > 0 && <Badge variant="destructive">{data.clientesEmAtraso.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.clientesEmAtraso.length === 0 ? (
                <div className="text-center py-8"><p className="text-2xl mb-2">🎉</p><p className="text-sm text-gray-500">Nenhum cliente em atraso!</p></div>
              ) : (
                <div className="space-y-3">
                  {data.clientesEmAtraso.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.nome}</p>
                        <p className="text-xs text-red-500">{c.diasAtraso} dia{c.diasAtraso !== 1 ? 's' : ''} em atraso</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(c.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Próximos Vencimentos</CardTitle></CardHeader>
            <CardContent>
              {data.cobrancasPendentes.length === 0 ? (
                <div className="text-center py-8"><p className="text-sm text-gray-500">Sem cobranças pendentes.</p></div>
              ) : (
                <div className="space-y-3">
                  {data.cobrancasPendentes.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.cliente.nome}</p>
                        <p className="text-xs text-gray-400">Vence em {formatDate(c.vencimento.toISOString())}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(c.valor))}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
