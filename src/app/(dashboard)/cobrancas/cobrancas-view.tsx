'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, CheckCircle, FileText, Filter, Download, Search, Edit, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, diasAtraso } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Cobranca } from '@/types'

interface CobrancaComCliente extends Omit<Cobranca, 'cliente'> {
  cliente: { id: string; nome: string; telefone: string }
}

export function CobrancasView({ cobrancas }: { cobrancas: CobrancaComCliente[] }) {
  const router = useRouter()
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [busca, setBusca] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editando, setEditando] = useState<CobrancaComCliente | null>(null)
  const [editForm, setEditForm] = useState({ valor: 0, vencimento: '', descricao: '' })
  const [editLoading, setEditLoading] = useState(false)

  const filtradas = cobrancas
    .filter((c) => filtroStatus === 'TODOS' || c.status === filtroStatus)
    .filter((c) => !busca || c.cliente.nome.toLowerCase().includes(busca.toLowerCase()))

  function abrirEditar(c: CobrancaComCliente) {
    setEditando(c)
    setEditForm({
      valor: c.valor,
      vencimento: c.vencimento.slice(0, 10),
      descricao: c.descricao ?? '',
    })
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setEditLoading(true)
    const res = await fetch(`/api/cobrancas/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, valor: Number(editForm.valor) }),
    })
    if (res.ok) {
      toast({ title: 'Cobrança atualizada!', variant: 'success' })
      setEditando(null)
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    setEditLoading(false)
  }

  async function handleMarcarPago(id: string, nomeCliente: string, valor: number) {
    if (!confirm(`Confirmar pagamento de ${formatCurrency(valor)} de ${nomeCliente}?`)) return
    setLoadingId(id)
    const res = await fetch(`/api/cobrancas/${id}/pagar`, { method: 'POST' })
    if (res.ok) {
      toast({ title: 'Pagamento confirmado!', variant: 'success' })
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast({ title: 'Erro ao confirmar pagamento', description: err.error, variant: 'destructive' })
    }
    setLoadingId(null)
  }

  async function handleEstornar(id: string, nomeCliente: string) {
    if (!confirm(`Estornar pagamento de ${nomeCliente}? A cobrança voltará para status anterior.`)) return
    setLoadingId(id)
    const res = await fetch(`/api/cobrancas/${id}/estornar`, { method: 'POST' })
    if (res.ok) {
      toast({ title: 'Pagamento estornado', variant: 'success' })
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast({ title: 'Erro ao estornar', description: err.message, variant: 'destructive' })
    }
    setLoadingId(null)
  }

  async function handleEnviarLembrete(id: string) {
    setLoadingId(id)
    const res = await fetch(`/api/cobrancas/${id}/lembrete`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) {
      toast({ title: 'Lembrete enviado!', description: 'Mensagem enviada via WhatsApp.', variant: 'success' })
    } else if (res.ok && !data.ok) {
      toast({ title: 'WhatsApp não configurado', description: 'Configure a integração em Configurações para enviar lembretes.', variant: 'destructive' })
    } else {
      toast({ title: 'Erro ao enviar lembrete', description: data.message, variant: 'destructive' })
    }
    setLoadingId(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-8 w-44" placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Filter className="h-4 w-4 text-gray-400" />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="ESTORNADO">Estornado</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">{filtradas.length} cobranças</span>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.open('/api/exportar?tipo=cobrancas', '_blank')}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-gray-900 font-medium">Nenhuma cobrança encontrada</p>
          <p className="text-sm text-gray-500 mt-1">As cobranças aparecem automaticamente ao registrar atendimentos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((c) => {
            const atraso = diasAtraso(c.vencimento)
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{c.cliente.nome}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(c.status)}`}>
                          {getStatusLabel(c.status)}
                        </span>
                        {atraso > 0 && c.status !== 'PAGO' && (
                          <Badge variant="destructive">{atraso}d em atraso</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Vence em {formatDate(c.vencimento)}
                        {c.descricao && ` • ${c.descricao}`}
                      </p>
                      {c.linkPagamento && (
                        <a href={c.linkPagamento} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline mt-0.5 inline-block">
                          Ver link de pagamento →
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(c.valor)}</span>
                      <div className="flex gap-1">
                        {c.status !== 'PAGO' && c.status !== 'CANCELADO' && c.status !== 'ESTORNADO' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => abrirEditar(c)} title="Editar cobrança">
                              <Edit className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEnviarLembrete(c.id)}
                              disabled={loadingId === c.id} title="Enviar lembrete WhatsApp">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="success"
                              onClick={() => handleMarcarPago(c.id, c.cliente.nome, c.valor)}
                              disabled={loadingId === c.id}>
                              <CheckCircle className="h-4 w-4" />
                              Pago
                            </Button>
                          </>
                        )}
                        {c.status === 'PAGO' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => window.open(`/api/recibo/${c.id}`, '_blank')}>
                              <FileText className="h-4 w-4" />
                              Recibo
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEstornar(c.id, c.cliente.nome)}
                              disabled={loadingId === c.id} title="Estornar pagamento">
                              <RotateCcw className="h-4 w-4 text-orange-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de edição de cobrança */}
      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Cobrança — {editando?.cliente.nome}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvarEdicao} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input type="number" min="0.01" step="0.01"
                value={editForm.valor || ''} onChange={(e) => setEditForm({ ...editForm, valor: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input type="date" value={editForm.vencimento}
                onChange={(e) => setEditForm({ ...editForm, vencimento: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={editForm.descricao}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
