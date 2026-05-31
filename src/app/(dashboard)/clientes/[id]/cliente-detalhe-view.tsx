'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, ExternalLink, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getTipoAtendimentoLabel } from '@/lib/utils'

interface Props {
  cliente: any
  stats: { totalPago: number; totalPendente: number; totalAtrasado: number }
}

export function ClienteDetalheView({ cliente, stats }: Props) {
  const router = useRouter()

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/clientes')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const url = `${window.location.origin}/portal/${cliente.id}`
            const portalPath = cliente.portalToken ? `/portal/${cliente.portalToken}` : null
            if (!portalPath) { toast({ title: 'Portal não disponível', description: 'Recadastre o cliente para gerar o link.', variant: 'destructive' }); return }
            navigator.clipboard.writeText(`${window.location.origin}${portalPath}`)
            toast({ title: 'Link copiado!', description: 'Envie ao cliente para ele ver suas cobranças.', variant: 'success' })
          }}>
            <Copy className="h-4 w-4" />
            Copiar link do portal
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const portalPath = cliente.portalToken ? `/portal/${cliente.portalToken}` : null
            if (portalPath) window.open(portalPath, '_blank')
          }}>
            <ExternalLink className="h-4 w-4" />
            Portal do cliente
          </Button>
        </div>
      </div>

      {/* Info do cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
                  <p className="text-sm text-gray-500">{getTipoAtendimentoLabel(cliente.tipoAtendimento)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{cliente.telefone}</span>
                {cliente.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{cliente.email}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Vence dia {cliente.diaVencimento}</span>
              </div>
              {cliente.observacoes && (
                <p className="text-sm text-gray-500 mt-1 italic">"{cliente.observacoes}"</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Honorário mensal</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(cliente.valorHonorario)}</p>
              <Badge variant={cliente.ativo ? 'success' : 'secondary'} className="mt-1">
                {cliente.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total recebido</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPago)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">A receber</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(stats.totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Em atraso</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalAtrasado)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Atendimentos ({cliente.atendimentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cliente.atendimentos.length === 0 ? (
            <p className="text-sm text-gray-400 p-6">Nenhum atendimento registrado.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {cliente.atendimentos.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(a.data)}</p>
                    {a.descricao && <p className="text-xs text-gray-400">{a.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(a.valor)}</span>
                    {a.cobranca && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(a.cobranca.status)}`}>
                        {getStatusLabel(a.cobranca.status)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de cobranças */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobranças ({cliente.cobrancas.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cliente.cobrancas.length === 0 ? (
            <p className="text-sm text-gray-400 p-6">Nenhuma cobrança registrada.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {cliente.cobrancas.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Vence {formatDate(c.vencimento)}</p>
                    {c.descricao && <p className="text-xs text-gray-400">{c.descricao}</p>}
                    {c.pagamentoEm && (
                      <p className="text-xs text-green-600">Pago em {formatDate(c.pagamentoEm)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(c.valor)}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
