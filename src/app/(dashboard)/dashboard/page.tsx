import { Suspense } from 'react'
import { DollarSign, TrendingDown, Clock, Users } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, diasAtraso } from '@/lib/utils'

async function getDashboardData(supabaseId: string) {
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return null

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)

  const [cobrancasMes, clientesAtivos, atendimentosMes] = await Promise.all([
    prisma.cobranca.findMany({
      where: { userId: user.id, vencimento: { gte: inicioMes, lte: fimMes } },
      include: { cliente: { select: { nome: true, telefone: true } } },
      orderBy: { vencimento: 'asc' },
    }),
    prisma.cliente.count({ where: { userId: user.id, ativo: true } }),
    prisma.atendimento.count({ where: { userId: user.id, data: { gte: inicioMes, lte: fimMes } } }),
  ])

  const totalReceber = cobrancasMes
    .filter((c) => c.status === 'PENDENTE')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalRecebido = cobrancasMes
    .filter((c) => c.status === 'PAGO')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalAtrasado = cobrancasMes
    .filter((c) => c.status === 'ATRASADO' || (c.status === 'PENDENTE' && new Date(c.vencimento) < agora))
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalGeral = totalReceber + totalRecebido
  const taxaInadimplencia = totalGeral > 0 ? Math.round((totalAtrasado / totalGeral) * 100) : 0

  const clientesEmAtraso = cobrancasMes
    .filter((c) => c.status === 'ATRASADO' || (c.status === 'PENDENTE' && new Date(c.vencimento) < agora))
    .map((c) => ({
      id: c.id,
      nome: c.cliente.nome,
      valor: Number(c.valor),
      diasAtraso: diasAtraso(c.vencimento.toISOString()),
    }))
    .sort((a, b) => b.diasAtraso - a.diasAtraso)

  return {
    totalReceber,
    totalRecebido,
    totalAtrasado,
    taxaInadimplencia,
    clientesAtivos,
    atendimentosMes,
    clientesEmAtraso,
    cobrancasPendentes: cobrancasMes.filter((c) => c.status === 'PENDENTE' && new Date(c.vencimento) >= agora),
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
        <div className="p-6">
          <p className="text-gray-500">Configure sua conta para começar.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Visão geral do mês atual" />

      <div className="p-6 space-y-6">
        {/* Cards de stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="A Receber"
            value={formatCurrency(data.totalReceber)}
            subtitle="pendente este mês"
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Recebido"
            value={formatCurrency(data.totalRecebido)}
            subtitle="confirmado este mês"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Em Atraso"
            value={formatCurrency(data.totalAtrasado)}
            subtitle={`${data.taxaInadimplencia}% de inadimplência`}
            icon={TrendingDown}
            color="red"
          />
          <StatsCard
            title="Clientes Ativos"
            value={String(data.clientesAtivos)}
            subtitle={`${data.atendimentosMes} atendimentos este mês`}
            icon={Users}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clientes em atraso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Clientes em Atraso
                {data.clientesEmAtraso.length > 0 && (
                  <Badge variant="destructive">{data.clientesEmAtraso.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.clientesEmAtraso.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm text-gray-500">Nenhum cliente em atraso!</p>
                </div>
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

          {/* Próximos vencimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {data.cobrancasPendentes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Sem cobranças pendentes.</p>
                </div>
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
