import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { formatCurrency, formatDate, formatDateTime } from './utils'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#1a1a1a', backgroundColor: '#ffffff' },
  header: { borderBottom: '2px solid #6366f1', paddingBottom: 20, marginBottom: 24, textAlign: 'center' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#6366f1', letterSpacing: -1 },
  logoDark: { color: '#1a1a1a' },
  titulo: { fontSize: 14, color: '#666666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  numero: { fontSize: 12, color: '#999999', marginTop: 8 },
  badgeContainer: { display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  badge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4 12', borderRadius: 20, fontSize: 12, fontWeight: 'bold' },
  valorDestaque: { fontSize: 32, fontWeight: 'bold', color: '#6366f1', textAlign: 'center', padding: 20, backgroundColor: '#f5f3ff', borderRadius: 8, marginVertical: 24 },
  grid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  section: { width: '45%', marginBottom: 20 },
  sectionFull: { width: '100%', marginBottom: 20 },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#999999', marginBottom: 4 },
  value: { fontSize: 15, color: '#1a1a1a' },
  footer: { marginTop: 40, paddingTop: 20, borderTop: '1px solid #eeeeee', textAlign: 'center', fontSize: 11, color: '#999999' },
})

interface ReciboData {
  numero: string
  profissionalNome: string
  profissionalProfissao?: string
  clienteNome: string
  valor: number
  descricao?: string
  dataAtendimento?: string
  dataPagamento: string
}

const ReciboDocument = ({ data }: { data: ReciboData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>re<Text style={styles.logoDark}>cebi</Text></Text>
        <Text style={styles.titulo}>Recibo de Pagamento</Text>
        <Text style={styles.numero}>Nº {data.numero}</Text>
      </View>

      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>✓ Pagamento Confirmado</Text>
      </View>

      <View style={styles.valorDestaque}>
        <Text>{formatCurrency(data.valor)}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.section}>
          <Text style={styles.label}>Profissional</Text>
          <Text style={styles.value}>{data.profissionalNome}</Text>
          {data.profissionalProfissao && <Text style={{ fontSize: 13, color: '#666666' }}>{data.profissionalProfissao}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.value}>{data.clienteNome}</Text>
        </View>

        {data.descricao && (
          <View style={styles.sectionFull}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{data.descricao}</Text>
          </View>
        )}

        {data.dataAtendimento && (
          <View style={styles.section}>
            <Text style={styles.label}>Data do Atendimento</Text>
            <Text style={styles.value}>{formatDate(data.dataAtendimento)}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Data do Pagamento</Text>
          <Text style={styles.value}>{formatDate(data.dataPagamento)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Este recibo foi gerado automaticamente pelo Recebi — recebi.app</Text>
        <Text style={{ marginTop: 4 }}>Gerado em {formatDateTime(new Date().toISOString())}</Text>
      </View>
    </Page>
  </Document>
)

export async function gerarPdfReciboStream(data: ReciboData): Promise<NodeJS.ReadableStream> {
  return await renderToStream(<ReciboDocument data={data} />)
}
