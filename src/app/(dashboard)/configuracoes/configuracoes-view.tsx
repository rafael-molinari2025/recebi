'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import type { User } from '@/types'

interface Integracoes {
  asaas: boolean
  whatsapp: boolean
}

export function ConfiguracoesView({ user, integracoes }: { user: User | null; integracoes: Integracoes }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: user?.nome ?? '',
    telefone: user?.telefone ?? '',
    profissao: user?.profissao ?? '',
    empresa: user?.empresa ?? '',
  })

  const planoInfo = {
    STARTER: { label: 'Gratuito', limite: '5 clientes', cor: 'secondary' as const },
    PRO: { label: 'Pro — R$ 47/mês', limite: '50 clientes', cor: 'default' as const },
    CLINICA: { label: 'Clínica — R$ 97/mês', limite: '200 clientes', cor: 'default' as const },
  }

  const plano = user?.plano ? planoInfo[user.plano] : planoInfo.STARTER

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/usuario', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast({ title: 'Perfil atualizado!', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Plano atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
          <CardDescription>Seu plano define o limite de clientes ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={plano.cor}>{plano.label}</Badge>
              <p className="text-sm text-gray-500 mt-1">Limite: {plano.limite}</p>
            </div>
            {user?.plano === 'STARTER' && (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={process.env.NEXT_PUBLIC_STRIPE_LINK_PRO} target="_blank" rel="noopener noreferrer">
                    Pro — R$ 47/mês
                  </a>
                </Button>
                <Button variant="default" asChild>
                  <a href={process.env.NEXT_PUBLIC_STRIPE_LINK_CLINICA} target="_blank" rel="noopener noreferrer">
                    Clínica — R$ 97/mês
                  </a>
                </Button>
              </div>
            )}
            {user?.plano === 'PRO' && (
              <Button variant="default" asChild>
                <a href={process.env.NEXT_PUBLIC_STRIPE_LINK_CLINICA} target="_blank" rel="noopener noreferrer">
                  Upgrade para Clínica — R$ 97/mês
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados do perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Perfil</CardTitle>
          <CardDescription>Essas informações aparecem nos recibos enviados aos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Profissão</Label>
              <Input
                placeholder="Psicóloga, Personal Trainer..."
                value={form.profissao}
                onChange={(e) => setForm({ ...form, profissao: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome da empresa</Label>
              <Input
                placeholder="Ex.: Clínica Bem Estar"
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Configure os serviços externos utilizados pelo Recebi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">Asaas (Pagamentos)</p>
              <p className="text-xs text-gray-500">PIX, boleto e cartão de crédito</p>
            </div>
            <Badge variant={integracoes.asaas ? 'success' : 'secondary'}>
              {integracoes.asaas ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">WhatsApp (Evolution API)</p>
              <p className="text-xs text-gray-500">Lembretes automáticos</p>
            </div>
            <Badge variant={integracoes.whatsapp ? 'success' : 'secondary'}>
              {integracoes.whatsapp ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
