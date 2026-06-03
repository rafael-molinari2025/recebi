'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { Cliente } from '@/types'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  cpfCnpj: z.string().max(18).optional().or(z.literal('')),
  telefone: z.string().min(8, 'Telefone inválido').max(20),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  tipoAtendimento: z.enum(['SESSAO_AVULSA', 'PACOTE_MENSAL', 'PLANO_FIXO']),
  valorHonorario: z.number().positive('O valor deve ser maior que zero'),
  diaVencimento: z.number().int().min(1).max(28),
  observacoes: z.string().max(500).optional().or(z.literal('')),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  open: boolean
  onClose: () => void
  cliente?: Cliente
}

export function ClienteForm({ open, onClose, cliente }: ClienteFormProps) {
  const router = useRouter()

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      cpfCnpj: '',
      telefone: '',
      email: '',
      tipoAtendimento: 'SESSAO_AVULSA',
      valorHonorario: 0,
      diaVencimento: 5,
      observacoes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nome: cliente?.nome ?? '',
        cpfCnpj: (cliente as any)?.cpfCnpj ?? '',
        telefone: cliente?.telefone ?? '',
        email: cliente?.email ?? '',
        tipoAtendimento: cliente?.tipoAtendimento ?? 'SESSAO_AVULSA',
        valorHonorario: cliente?.valorHonorario ?? 0,
        diaVencimento: cliente?.diaVencimento ?? 5,
        observacoes: cliente?.observacoes ?? '',
      })
    }
  }, [open, cliente, form])

  async function onSubmit(data: ClienteFormValues) {
    try {
      const method = cliente ? 'PUT' : 'POST'
      const url = cliente ? `/api/clientes/${cliente.id}` : '/api/clientes'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        let errMessage = 'Erro ao salvar cliente'
        try {
          const err = await res.json()
          errMessage = err.message || errMessage
        } catch {
          // fallback silencioso se não for json
        }
        toast({ title: 'Erro', description: errMessage, variant: 'destructive' })
        return
      }

      toast({ title: cliente ? 'Cliente atualizado!' : 'Cliente cadastrado!', variant: 'success' })
      onClose()
      router.refresh()
    } catch (error) {
      toast({ title: 'Erro de Conexão', description: 'Não foi possível se conectar ao servidor.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input placeholder="Ana Paula Souza" {...form.register('nome')} />
            {form.formState.errors.nome && <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>WhatsApp *</Label>
              <Input placeholder="(11) 99999-9999" {...form.register('telefone')} />
              {form.formState.errors.telefone && <p className="text-sm text-red-500">{form.formState.errors.telefone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>CPF / CNPJ</Label>
              <Input placeholder="000.000.000-00" {...form.register('cpfCnpj')} />
              {form.formState.errors.cpfCnpj && <p className="text-sm text-red-500">{form.formState.errors.cpfCnpj.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" placeholder="cliente@email.com" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de atendimento *</Label>
              <Select
                value={form.watch('tipoAtendimento')}
                onValueChange={(v) => form.setValue('tipoAtendimento', v as any)}
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
                {...form.register('valorHonorario', { valueAsNumber: true })}
              />
              {form.formState.errors.valorHonorario && <p className="text-sm text-red-500">{form.formState.errors.valorHonorario.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Dia de vencimento (1–28)</Label>
            <Input
              type="number"
              min="1"
              max="28"
              {...form.register('diaVencimento', { valueAsNumber: true })}
            />
            {form.formState.errors.diaVencimento && <p className="text-sm text-red-500">{form.formState.errors.diaVencimento.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input placeholder="Observações internas..." {...form.register('observacoes')} />
            {form.formState.errors.observacoes && <p className="text-sm text-red-500">{form.formState.errors.observacoes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
