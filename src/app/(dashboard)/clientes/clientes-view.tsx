'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Phone, Edit, Trash2, UserCheck, UserX, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ClienteForm } from '@/components/clientes/cliente-form'
import { formatCurrency, formatTelefone, getTipoAtendimentoLabel } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Cliente } from '@/types'

export function ClientesView({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editCliente, setEditCliente] = useState<Cliente | undefined>()

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Remover ${nome}? Esta ação não pode ser desfeita.`)) return

    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Cliente removido', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Erro ao remover cliente', variant: 'destructive' })
    }
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    const res = await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    if (res.ok) {
      toast({ title: ativo ? 'Cliente inativado' : 'Cliente reativado', variant: 'success' })
      router.refresh()
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => window.open('/api/exportar?tipo=clientes', '_blank')}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        <Button onClick={() => { setEditCliente(undefined); setFormOpen(true) }}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-900 font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm text-gray-500 mt-1">Cadastre seu primeiro cliente para começar</p>
          <Button className="mt-4" onClick={() => { setEditCliente(undefined); setFormOpen(true) }}>
            <Plus className="h-4 w-4" />
            Cadastrar cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((c) => (
            <Card key={c.id} className={!c.ativo ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{c.nome}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{getTipoAtendimentoLabel(c.tipoAtendimento)}</p>
                  </div>
                  <Badge variant={c.ativo ? 'success' : 'secondary'}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatTelefone(c.telefone)}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-lg font-bold text-indigo-600">{formatCurrency(c.valorHonorario)}</span>
                  <span className="text-xs text-gray-400">vence dia {c.diaVencimento}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/clientes/${c.id}`)}
                    title="Ver perfil"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setEditCliente(c); setFormOpen(true) }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleAtivo(c.id, c.ativo)}
                    title={c.ativo ? 'Inativar' : 'Reativar'}
                  >
                    {c.ativo ? <UserX className="h-4 w-4 text-gray-400" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(c.id, c.nome)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClienteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cliente={editCliente}
      />
    </div>
  )
}
