'use client'

import { useState, useEffect, useCallback } from 'react'
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

function WhatsAppCard() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected' | 'unconfigured'>('loading')
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status')
      const data = await res.json()
      if (!data.configured) { setStatus('unconfigured'); return }
      setStatus(data.connected ? 'connected' : 'disconnected')
      if (data.connected) setQrcode(null)
    } catch { setStatus('disconnected') }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [checkStatus])

  async function handleConectar() {
    setLoadingQr(true)
    setQrcode(null)
    try {
      // Desconecta primeiro para forçar novo QR Code
      await fetch('/api/whatsapp/disconnect', { method: 'POST' })
      await new Promise(r => setTimeout(r, 1500))

      const res = await fetch('/api/whatsapp/qrcode')
      const data = await res.json()
      if (data.qrcode) {
        setQrcode(data.qrcode)
        setStatus('disconnected')
      } else {
        toast({ title: 'Erro ao gerar QR Code. Tente novamente.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao buscar QR Code', variant: 'destructive' })
    } finally { setLoadingQr(false) }
  }

  if (status === 'unconfigured') return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
        <CardDescription>Conecte o WhatsApp para envio automático de lembretes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Status da conexão</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {status === 'loading' ? 'Verificando...' : status === 'connected' ? 'WhatsApp conectado' : 'Desconectado'}
            </p>
          </div>
          <Badge variant={status === 'connected' ? 'success' : status === 'loading' ? 'secondary' : 'destructive'}>
            {status === 'loading' ? 'Verificando' : status === 'connected' ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>

        {status === 'disconnected' && !qrcode && (
          <Button onClick={handleConectar} disabled={loadingQr} className="w-full">
            {loadingQr ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
          </Button>
        )}

        {qrcode && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Abra o WhatsApp → <strong>Aparelhos conectados</strong> → <strong>Conectar aparelho</strong> → Escaneie o código abaixo
            </p>
            <img src={qrcode} alt="QR Code WhatsApp" className="w-48 h-48 rounded-lg border border-gray-200" />
            <p className="text-xs text-gray-400 text-center">O código expira em 60 segundos. A página atualiza automaticamente após conexão.</p>
            <Button variant="outline" onClick={handleConectar} disabled={loadingQr} size="sm">
              Gerar novo QR Code
            </Button>
          </div>
        )}

        {status === 'connected' && (
          <Button variant="outline" onClick={handleConectar} size="sm">
            Reconectar WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ConfiguracoesView({ user, integracoes }: { user: User | null; integracoes: Integracoes }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isPro = user?.plano === 'PRO' || user?.plano === 'CLINICA'

  const [form, setForm] = useState({
    nome: user?.nome ?? '',
    telefone: user?.telefone ?? '',
    profissao: user?.profissao ?? '',
    empresa: user?.empresa ?? '',
    cnpj: user?.cnpj ?? '',
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
                  <a
                    href="https://buy.stripe.com/00w6oIa6Nd9X7L47mx9oc01"
                    target="_blank" rel="noopener noreferrer"
                  >
                    Pro — R$ 47/mês
                  </a>
                </Button>
                <Button variant="default" asChild>
                  <a
                    href="https://buy.stripe.com/cNi8wQ6UBgm95CWfT39oc00"
                    target="_blank" rel="noopener noreferrer"
                  >
                    Clínica — R$ 97/mês
                  </a>
                </Button>
              </div>
            )}
            {user?.plano === 'PRO' && (
              <Button variant="default" asChild>
                <a
                  href="https://buy.stripe.com/cNi8wQ6UBgm95CWfT39oc00"
                  target="_blank" rel="noopener noreferrer"
                >
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
            {isPro && (
              <div className="space-y-1.5">
                <Label>CNPJ <span className="text-xs text-indigo-600 font-normal ml-1">PRO / Clínica</span></Label>
                <Input
                  placeholder="00.000.000/0001-00"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                />
                <p className="text-xs text-gray-400">Aparece nos recibos junto ao nome da empresa.</p>
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <WhatsAppCard />

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Configure os serviços externos utilizados pelo Recebi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Asaas (Pagamentos)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PIX, boleto e cartão de crédito</p>
            </div>
            <Badge variant={integracoes.asaas ? 'success' : 'secondary'}>
              {integracoes.asaas ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp (Evolution API)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lembretes automáticos</p>
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
