'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Download, FileSpreadsheet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RelatoriosView() {
  const [mes, setMes] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  function handleGerarPDF() {
    window.open(`/api/relatorio?mes=${mes}`, '_blank')
  }

  function handleExportarCSV(tipo: string) {
    window.open(`/api/exportar?tipo=${tipo}`, '_blank')
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Gere um relatório em PDF com o resumo financeiro do mês selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mês de referência</Label>
              <Input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              />
            </div>
            <Button onClick={handleGerarPDF} className="w-full flex gap-2">
              <Download className="h-4 w-4" />
              Gerar Relatório (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Exportação de Dados
            </CardTitle>
            <CardDescription>
              Exporte todos os seus dados em formato CSV para planilhas (Excel, Google Sheets).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={() => handleExportarCSV('clientes')} className="w-full flex justify-start gap-2">
              <Download className="h-4 w-4" /> Exportar Clientes
            </Button>
            <Button variant="outline" onClick={() => handleExportarCSV('atendimentos')} className="w-full flex justify-start gap-2">
              <Download className="h-4 w-4" /> Exportar Atendimentos
            </Button>
            <Button variant="outline" onClick={() => handleExportarCSV('cobrancas')} className="w-full flex justify-start gap-2">
              <Download className="h-4 w-4" /> Exportar Cobranças
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
