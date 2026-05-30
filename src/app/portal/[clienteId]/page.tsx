import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'

export default async function PortalClientePage({
  params,
}: {
  params: Promise<{ clienteId: string }>
}) {
  const { clienteId } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      user: { select: { nome: true, profissao: true, empresa: true } },
      cobrancas: {
        where: { status: { not: 'CANCELADO' } },
        orderBy: { vencimento: 'desc' },
        take: 20,
      },
    },
  })

  if (!cliente) return notFound()

  const profissional = cliente.user.empresa ?? cliente.user.nome

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: 32, color: '#1a1a1a' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #6366f1', paddingBottom: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#6366f1' }}>
          re<span style={{ color: '#1a1a1a' }}>cebi</span>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Portal do Cliente</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 18, fontWeight: 'bold' }}>Olá, {cliente.nome}!</p>
        <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
          Aqui estão suas cobranças com <strong>{profissional}</strong>
          {cliente.user.profissao ? ` — ${cliente.user.profissao}` : ''}.
        </p>
      </div>

      {cliente.cobrancas.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: 32 }}>Nenhuma cobrança encontrada.</p>
      ) : (
        <div>
          {cliente.cobrancas.map((c) => {
            const statusColors: Record<string, string> = {
              PAGO: '#d1fae5', PENDENTE: '#fef9c3', ATRASADO: '#fee2e2',
            }
            const bg = statusColors[c.status] ?? '#f3f4f6'
            return (
              <div key={c.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, background: bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{formatCurrency(Number(c.valor))}</div>
                    <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                      Vencimento: {formatDate(c.vencimento.toISOString())}
                    </div>
                    {c.descricao && <div style={{ color: '#888', fontSize: 12 }}>{c.descricao}</div>}
                    {c.pagamentoEm && (
                      <div style={{ color: '#16a34a', fontSize: 12 }}>
                        Pago em {formatDate(c.pagamentoEm.toISOString())}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 'bold', color: '#374151' }}>
                    {getStatusLabel(c.status)}
                  </span>
                </div>
                {c.linkPagamento && c.status !== 'PAGO' && (
                  <a
                    href={c.linkPagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 10, background: '#6366f1', color: '#fff', padding: '6px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}
                  >
                    Pagar agora →
                  </a>
                )}
                {c.reciboUrl && c.status === 'PAGO' && (
                  <a
                    href={c.reciboUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 10, background: '#16a34a', color: '#fff', padding: '6px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}
                  >
                    Ver recibo →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #eee', textAlign: 'center', fontSize: 11, color: '#999' }}>
        Portal gerado pelo <strong>Recebi</strong> — recebi.app
      </div>
    </div>
  )
}
