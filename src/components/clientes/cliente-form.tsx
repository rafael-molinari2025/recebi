'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { Cliente, CreateClienteInput } from '@/types'

interface ClienteFormProps {
  open: boolean
  onClose: () => void
  cliente?: Cliente
}

export function ClienteForm({ open, onClose, cliente }: ClienteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const emptyForm = (): CreateClienteInput => ({
    nome: cliente?.nome ?? '',
    telefone: cliente?.telefone ?? '',
    email: cliente?.email ?? '',
    tipoAtendimento: cliente?.tipoAtendimento ?? 'SESSAO_AVULSA',
    valorHonorario: cliente?.valorHonorario ?? 0,
    diaVencimento: cliente?.diaVencimento ?? 5,
    observacoes: cliente?.observacoes ?? '',
  })

  const [form, setForm] = useState<CreateClienteInput>(emptyForm)

  useEffect(() => {
    if (open) setForm(emptyForm())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cliente?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const method = cliente ? 'PUT' : 'POST'
    const url = cliente ? `/api/clientes/${cliente.id}` : '/api/clientes'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Erro', description: err.message ?? 'Erro ao salvar cliente', variant: 'destructive' })
      setLoading(false)
      return
    }

    toast({ title: cliente ? 'Cliente atualizado!' : 'Cliente cadastrado!', variant: 'success' })
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input
              placeholder="Ana Paula Souza"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>WhatsApp *</Label>
            <Input
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="cliente@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de atendimento *</Label>
              <Select
                value={form.tipoAtendimento}
                onValueChange={(v) => setForm({ ...form, tipoAtendimento: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SESSAO_AVULSA">Sessão Avulsa</SelectItem>
                  <SelectItem value="PACOTE_MENSAL">Pacote Mensal</SelectItem>
                  <SelectItem value="PLANO_FIXO">Plano Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="200,00"
                value={form.valorHonorario || ''}
                onChange={(e) => setForm({ ...form, valorHonorario: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Dia de vencimento (1–28)</Label>
            <Input
              type="number"
              min="1"
              max="28"
              value={form.diaVencimento}
              onChange={(e) => setForm({ ...form, diaVencimento: parseInt(e.target.value) || 5 })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input
              placeholder="Observações internas..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
