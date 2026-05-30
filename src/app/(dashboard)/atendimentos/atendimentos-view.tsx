'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Atendimento } from '@/types'

interface ClienteSimples {
  id: string
  nome: string
  valorHonorario: number
}

interface Props {
  atendimentos: Atendimento[]
  clientes: ClienteSimples[]
}

export function AtendimentosView({ atendimentos, clientes }: Props) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clienteId: '',
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    notas: '',
    valor: 0,
    gerarCobranca: true,
  })

  function handleClienteChange(clienteId: string) {
    const cliente = clientes.find((c) => c.id === clienteId)
    setForm({ ...form, clienteId, valor: cliente?.valorHonorario ?? 0 })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/atendimentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      setLoading(false)
      return
    }

    toast({
      title: 'Atendimento registrado!',
      description: form.gerarCobranca ? 'Cobrança criada automaticamente.' : undefined,
      variant: 'success',
    })
    setFormOpen(false)
    setForm({ clienteId: '', data: new Date().toISOString().slice(0, 10), descricao: '', notas: '', valor: 0, gerarCobranca: true })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Registrar atendimento
        </Button>
      </div>

      {atendimentos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-900 font-medium">Nenhum atendimento registrado</p>
          <p className="text-sm text-gray-500 mt-1">Registre o primeiro atendimento para começar a cobrar</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Registrar atendimento
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {atendimentos.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{(a as any).cliente?.nome ?? '—'}</p>
                  <p className="text-xs text-gray-400">{formatDate(a.data)}{a.descricao ? ` • ${a.descricao}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{formatCurrency(a.valor)}</span>
                  {a.gerarCobranca && (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Cobrança gerada
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Atendimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.clienteId} onValueChange={handleClienteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor || ''}
                  onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex.: Sessão de psicoterapia"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notas privadas <span className="text-xs text-gray-400">(não aparecem no recibo)</span></Label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                placeholder="Anotações clínicas, observações da sessão..."
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.gerarCobranca}
                onChange={(e) => setForm({ ...form, gerarCobranca: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Gerar cobrança automaticamente</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading || !form.clienteId}>
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
