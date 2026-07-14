import { Header } from '@/components/layout/header'
import { RelatoriosView } from './relatorios-view'

export default async function RelatoriosPage() {
  return (
    <div>
      <Header title="Relatórios" subtitle="Exporte seus dados e visualize relatórios mensais" />
      <RelatoriosView />
    </div>
  )
}
