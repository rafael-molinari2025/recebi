'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

interface SolicitarAgendamentoProps {
  token: string
}

export function SolicitarAgendamento({ token }: SolicitarAgendamentoProps) {
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    
    try {
      const res = await fetch(`/api/portal/${token}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      
      if (!res.ok) {
        throw new Error('Erro ao agendar')
      }
      
      setSucesso(true)
    } catch {
      setErro('Não foi possível agendar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div style={{ background: '#d1fae5', color: '#065f46', padding: 16, borderRadius: 8, textAlign: 'center', marginBottom: 24 }}>
        <strong>🎉 Agendamento Confirmado!</strong>
        <p style={{ fontSize: 13, marginTop: 4 }}>Sua sessão foi agendada e já está no calendário do profissional.</p>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 24, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Calendar size={20} color="#6366f1" />
        <h3 style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}>Agendar Nova Sessão</h3>
      </div>
      
      <form onSubmit={handleAgendar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Selecione a data e hora</label>
          <input 
            type="datetime-local" 
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}
          />
        </div>
        
        {erro && <p style={{ color: '#ef4444', fontSize: 13 }}>{erro}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#6366f1', 
            color: '#fff', 
            border: 'none', 
            padding: '10px', 
            borderRadius: 6, 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      </form>
    </div>
  )
}
