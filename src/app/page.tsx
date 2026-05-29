import Link from 'next/link'
import {
  CheckCircle, Wallet, MessageSquare, TrendingDown,
  Calendar, FileText, Star, ArrowRight, Menu
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              re<span className="text-indigo-600">cebi</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#recursos" className="hover:text-gray-900 transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-gray-900 transition-colors">Preços</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Mais de 500 profissionais já usam
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Chega de perder dinheiro<br />
            <span className="text-indigo-600">com inadimplência</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            O Recebi automatiza suas cobranças, envia lembretes pelo WhatsApp e gera recibos em segundos.
            Feito para psicólogos, personal trainers, nutricionistas e profissionais liberais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Criar conta grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#como-funciona" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Ver como funciona
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">Grátis para sempre até 5 clientes. Sem cartão de crédito.</p>
        </div>

        {/* App screenshot placeholder */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-400">recebi-khaki.vercel.app/dashboard</span>
            </div>
            <div className="p-8 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'A Receber', value: 'R$ 4.200', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { label: 'Recebido', value: 'R$ 8.750', color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Em Atraso', value: 'R$ 320', color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Clientes Ativos', value: '23', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl bg-white border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Clientes em Atraso</p>
                  {['Ana Paula — 3 dias', 'João Melo — 7 dias'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item}</span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Atraso</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Próximos Vencimentos</p>
                  {['Maria Souza — 02/06', 'Pedro Lima — 05/06'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Pendente</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Você já passou por isso?
          </h2>
          <p className="text-gray-500 mb-12">A realidade de quem cobra manualmente</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '😬', title: 'Constrangimento', desc: 'Mandar mensagem cobrando cliente no WhatsApp é desconfortável e desgastante' },
              { emoji: '😤', title: 'Esquecimento', desc: 'Perder o controle de quem pagou, quem deve e quando vence fica impossível sem uma ferramenta' },
              { emoji: '💸', title: 'Prejuízo silencioso', desc: 'Profissionais perdem em média R$ 1.500/mês em honorários esquecidos ou atrasados' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 bg-indigo-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-gray-500">Configure em 5 minutos. Comece a receber hoje.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Calendar, title: 'Cadastre seus clientes', desc: 'Adicione nome, WhatsApp e valor do honorário. O Recebi cuida do resto.' },
              { step: '02', icon: MessageSquare, title: 'Cobranças automáticas', desc: 'Lembretes por WhatsApp 3 dias antes, no vencimento e após o atraso.' },
              { step: '03', icon: FileText, title: 'Recibo em 1 clique', desc: 'Ao confirmar o pagamento, o recibo é gerado e enviado automaticamente.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
            <p className="text-gray-500">Sem complicação. Sem planilha. Sem constrangimento.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50', title: 'WhatsApp automático', desc: 'Lembretes amigáveis enviados no momento certo, no tom certo.' },
              { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', title: 'Controle de inadimplência', desc: 'Veja em tempo real quem está em atraso e quanto você tem a receber.' },
              { icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'PIX e boleto', desc: 'Link de pagamento gerado automaticamente para cada cobrança.' },
              { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Recibo profissional', desc: 'Recibo em PDF enviado automaticamente ao confirmar o pagamento.' },
              { icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Agenda de atendimentos', desc: 'Registre sessões e gere cobranças com um clique.' },
              { icon: Star, color: 'text-orange-600', bg: 'bg-orange-50', title: 'Dashboard financeiro', desc: 'Visão clara do seu faturamento, recebimentos e projeções.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quem já usa o Recebi</h2>
            <p className="text-indigo-200">Profissionais que pararam de perder dinheiro</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nome: 'Dra. Ana Paula', profissao: 'Psicóloga', texto: 'Antes eu perdia uns R$ 800 por mês de pacientes que atrasavam. Hoje o Recebi cobra por mim e eu nem preciso me envolver.' },
              { nome: 'Carlos Henrique', profissao: 'Personal Trainer', texto: 'Tinha alunos que sumiam sem pagar. Com o lembrete automático do WhatsApp, a inadimplência caiu 90%.' },
              { nome: 'Dra. Fernanda', profissao: 'Nutricionista', texto: 'O recibo automático me salvou. Meus pacientes adoram receber pelo WhatsApp e eu economizo horas por semana.' },
            ].map((item) => (
              <div key={item.nome} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{item.texto}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{item.nome}</p>
                  <p className="text-indigo-300 text-xs">{item.profissao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-500">Sem taxa de adesão. Cancele quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                nome: 'Grátis',
                preco: 'R$ 0',
                periodo: 'para sempre',
                destaque: false,
                cor: 'border-gray-200',
                recursos: ['Até 5 clientes', 'Cobranças manuais', 'Recibo básico', 'Dashboard', 'Suporte por e-mail'],
              },
              {
                nome: 'Pro',
                preco: 'R$ 47',
                periodo: '/mês',
                destaque: true,
                cor: 'border-indigo-500',
                recursos: ['Até 50 clientes', 'WhatsApp automático', 'PIX e boleto integrado', 'Recibo PDF automático', 'Dashboard avançado', 'Suporte prioritário'],
              },
              {
                nome: 'Clínica',
                preco: 'R$ 97',
                periodo: '/mês',
                destaque: false,
                cor: 'border-gray-200',
                recursos: ['Até 200 clientes', 'Até 3 profissionais', 'Tudo do Pro', 'Relatório financeiro', 'API de integração', 'Suporte dedicado'],
              },
            ].map((plano) => (
              <div key={plano.nome} className={`relative rounded-2xl border-2 p-8 ${plano.cor} ${plano.destaque ? 'shadow-xl shadow-indigo-100' : ''}`}>
                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{plano.nome}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plano.preco}</span>
                  <span className="text-gray-400 mb-1">{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.recursos.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-colors ${
                    plano.destaque
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plano.nome === 'Grátis' ? 'Começar grátis' : `Assinar ${plano.nome}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Preciso ter conhecimento técnico para usar?', r: 'Não. O Recebi foi criado para profissionais de saúde, educação e serviços — sem nenhum conhecimento técnico necessário. Configure em 5 minutos.' },
              { q: 'Como funciona o WhatsApp automático?', r: 'O Recebi se integra com a Evolution API ou Z-API para enviar mensagens via WhatsApp. Você configura seus templates de mensagem e nós enviamos nos momentos certos.' },
              { q: 'Os pagamentos são seguros?', r: 'Sim. Usamos a Asaas como gateway de pagamento, que é regulamentado pelo Banco Central e processa mais de R$ 5 bilhões por ano.' },
              { q: 'Posso cancelar a qualquer momento?', r: 'Sim. Não há fidelidade. Cancele quando quiser pelo painel de configurações, sem burocracia.' },
              { q: 'O plano gratuito tem limitações?', r: 'O plano gratuito suporta até 5 clientes ativos com cobranças manuais. Para automatizar via WhatsApp e ter mais clientes, escolha o plano Pro.' },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border border-gray-200 bg-white">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-900">
                  {item.q}
                  <span className="ml-4 text-indigo-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para parar de perder dinheiro?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Junte-se a centenas de profissionais que automatizaram suas cobranças com o Recebi.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg">
            Criar conta grátis agora
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-indigo-300 text-sm mt-4">Sem cartão de crédito · Plano gratuito para sempre</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <Wallet className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                re<span className="text-indigo-400">cebi</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
              <Link href="/cadastro" className="hover:text-white transition-colors">Cadastrar</Link>
              <a href="#precos" className="hover:text-white transition-colors">Preços</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <p className="text-sm text-gray-500">© 2026 Recebi · Desenvolvido pela PrimeTI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
