import { Header } from '@/components/layout/header'
import { MonitorView } from './monitor-view'

export const dynamic = 'force-dynamic'

export default function MonitorPage() {
  return (
    <div>
      <Header
        title="Monitor do Sistema"
        subtitle="Verificações automáticas a cada 5 minutos — 24 horas por dia"
      />
      <MonitorView />
    </div>
  )
}
