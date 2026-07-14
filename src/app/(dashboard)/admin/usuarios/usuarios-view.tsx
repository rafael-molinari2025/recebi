'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Search, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface Usuario {
  id: string
  nome: string
  email: string
  plano: 'STARTER' | 'PRO' | 'CLINICA'
  profissao: string | null
  clienteCount: number
  atendimentoCount: number
  cobrancaCount: number
  createdAt: string
}

const PLANOS = ['STARTER', 'PRO', 'CLINICA'] as const

const PLANO_STYLES: Record<string, string> = {
  STARTER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PRO: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  CLINICA: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function UsuariosView({ adminEmail }: { adminEmail: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [novoPlano, setNovoPlano] = useState<string>('')
  const [salvando, setSalvando] = useState(false)

  const buscar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/usuarios')
      if (!res.ok) return
      const data = await res.json()
      setUsuarios(data.usuarios)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { buscar() }, [buscar])

  async function salvarPlano(id: string) {
    setSalvando(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/plano`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: novoPlano }),
      })
      if (!res.ok) throw new Error()
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, plano: novoPlano as Usuario['plano'] } : u))
      setEditando(null)
      toast({ title: 'Plano atualizado', description: `Plano alterado para ${novoPlano}`, variant: 'success' })
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Não foi possível alterar o plano.', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  )

  if (carregando) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <RefreshCw className="animate-spin h-4 w-4" />
        <span className="text-sm">Carregando usuários...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Busca + total */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">{filtrados.length} usuário{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Plano</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Clientes</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Atend.</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Cobranças</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Cadastro</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {u.email === adminEmail && (
                          <span title="Admin"><Shield className="h-3.5 w-3.5 text-indigo-500 shrink-0" /></span>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{u.nome}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                          {u.profissao && <p className="text-xs text-gray-400">{u.profissao}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {editando === u.id ? (
                        <select
                          value={novoPlano}
                          onChange={e => setNovoPlano(e.target.value)}
                          className="text-xs border border-indigo-300 rounded-md px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        >
                          {PLANOS.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${PLANO_STYLES[u.plano]}`}>
                          {u.plano}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{u.clienteCount}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{u.atendimentoCount}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{u.cobrancaCount}</td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{formatData(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      {editando === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => salvarPlano(u.id)}
                            disabled={salvando || novoPlano === u.plano}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {salvando ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            disabled={salvando}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        u.email !== adminEmail && (
                          <button
                            onClick={() => { setEditando(u.id); setNovoPlano(u.plano) }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium transition-colors"
                          >
                            Alterar plano
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
