'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Trash2, UserPlus, Users } from 'lucide-react'

interface Membro {
  id: string
  membroId: string
  email: string
  status: string
  membro?: { nome: string } | null
}

export function EquipeView({ isClinica, membrosIniciais }: { isClinica: boolean, membrosIniciais: Membro[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [membros, setMembros] = useState(membrosIniciais)

  if (!isClinica) {
    return (
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Gestão de Equipe
            </CardTitle>
            <CardDescription>O gerenciamento de equipe é exclusivo do plano Clínica.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href={process.env.NEXT_PUBLIC_STRIPE_LINK_CLINICA} target="_blank" rel="noopener noreferrer">
                Fazer Upgrade para o plano Clínica
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function handleConvidar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/membros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({ title: 'Membro adicionado com sucesso!', variant: 'success' })
        setEmail('')
        router.refresh()
        // Optimistic update could be added here, but refresh is fine
      } else {
        toast({ title: data.message || 'Erro ao convidar membro', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Erro na requisição', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleRemover(membroId: string) {
    if (!confirm('Tem certeza que deseja remover este membro da clínica?')) return

    try {
      const res = await fetch('/api/membros', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membroId }),
      })

      if (res.ok) {
        toast({ title: 'Membro removido', variant: 'success' })
        router.refresh()
      } else {
        toast({ title: 'Erro ao remover', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro na requisição', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Convidar Membro</CardTitle>
          <CardDescription>
            Adicione um profissional à sua clínica. Ele precisa já ter uma conta (mesmo que gratuita) no Recebi com este email. (Limite de 3 membros).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConvidar} className="flex gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <Label>Email do usuário</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading || membros.length >= 3}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>
          {membros.length >= 3 && (
            <p className="text-sm text-red-500 mt-2">Você já atingiu o limite de 3 membros do plano.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Clínica ({membros.length}/3)</CardTitle>
        </CardHeader>
        <CardContent>
          {membros.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum membro adicionado ainda.</p>
          ) : (
            <div className="space-y-4">
              {membros.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{m.membro?.nome || 'Usuário'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={m.status === 'ATIVO' ? 'success' : 'secondary'}>
                      {m.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleRemover(m.membroId)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
