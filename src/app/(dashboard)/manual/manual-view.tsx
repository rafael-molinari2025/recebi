'use client'

import { Download, BookOpen, LayoutDashboard, Users, Calendar, CreditCard, CalendarDays, FileText, Settings, UsersRound, Wallet, Bell, ChevronRight } from 'lucide-react'

export function ManualView() {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-section {
            break-inside: avoid;
          }
          .print-page-break {
            break-before: page;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 print-container">
        {/* Cabeçalho */}
        <div className="no-print sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Manual de Utilização</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">

          {/* Capa */}
          <div className="text-center space-y-4 py-6 print-section">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
                <Wallet className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              re<span className="text-indigo-600">cebi</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">Manual de Utilização do Sistema</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Gestão financeira e de clientes para profissionais autônomos</p>
            <div className="mx-auto w-24 h-1 bg-indigo-600 rounded-full" />
          </div>

          {/* Índice */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 print-section">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Índice</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                { num: '1', title: 'Introdução', anchor: '#intro' },
                { num: '2', title: 'Primeiros Passos', anchor: '#inicio' },
                { num: '3', title: 'Dashboard', anchor: '#dashboard' },
                { num: '4', title: 'Clientes', anchor: '#clientes' },
                { num: '5', title: 'Atendimentos', anchor: '#atendimentos' },
                { num: '6', title: 'Cobranças', anchor: '#cobrancas' },
                { num: '7', title: 'Agenda', anchor: '#agenda' },
                { num: '8', title: 'Relatórios', anchor: '#relatorios' },
                { num: '9', title: 'Equipe', anchor: '#equipe' },
                { num: '10', title: 'Configurações', anchor: '#configuracoes' },
                { num: '11', title: 'Planos', anchor: '#planos' },
                { num: '12', title: 'Integrações', anchor: '#integracoes' },
              ].map(item => (
                <a
                  key={item.num}
                  href={item.anchor}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors no-print"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold">{item.num}</span>
                  {item.title}
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </a>
              ))}
              {[
                { num: '1', title: 'Introdução' },
                { num: '2', title: 'Primeiros Passos' },
                { num: '3', title: 'Dashboard' },
                { num: '4', title: 'Clientes' },
                { num: '5', title: 'Atendimentos' },
                { num: '6', title: 'Cobranças' },
                { num: '7', title: 'Agenda' },
                { num: '8', title: 'Relatórios' },
                { num: '9', title: 'Equipe' },
                { num: '10', title: 'Configurações' },
                { num: '11', title: 'Planos' },
                { num: '12', title: 'Integrações' },
              ].map(item => (
                <div
                  key={item.num + '-print'}
                  className="hidden print:flex items-center gap-2 p-1 text-gray-700"
                >
                  <span className="text-xs font-bold text-indigo-600">{item.num}.</span>
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          {/* 1. Introdução */}
          <section id="intro" className="space-y-4 print-section">
            <SectionHeader icon={<BookOpen className="h-5 w-5" />} number="1" title="Introdução" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O <strong className="text-indigo-600">Recebi</strong> é uma plataforma de gestão financeira desenvolvida para profissionais autônomos — psicólogos, personal trainers, fisioterapeutas, nutricionistas, consultores e outros prestadores de serviços — que desejam controlar seus clientes, registrar atendimentos e automatizar a cobrança de forma simples e eficiente.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                Com o Recebi você consegue:
              </p>
              <ul className="mt-2 space-y-1.5">
                <FeatureItem>Cadastrar e gerenciar sua carteira de clientes</FeatureItem>
                <FeatureItem>Registrar cada sessão ou atendimento realizado</FeatureItem>
                <FeatureItem>Criar cobranças automaticamente ao registrar um atendimento</FeatureItem>
                <FeatureItem>Acompanhar pagamentos pendentes, recebidos e em atraso</FeatureItem>
                <FeatureItem>Enviar lembretes de cobrança via WhatsApp automaticamente</FeatureItem>
                <FeatureItem>Visualizar a agenda de atendimentos no calendário</FeatureItem>
                <FeatureItem>Gerar relatórios financeiros e exportar dados em CSV</FeatureItem>
                <FeatureItem>Gerenciar equipes no plano Clínica</FeatureItem>
              </ul>
            </Card>
          </section>

          {/* 2. Primeiros Passos */}
          <section id="inicio" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Wallet className="h-5 w-5" />} number="2" title="Primeiros Passos" />
            <Card>
              <Subsection title="2.1 Criando sua conta">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Acesse <strong>/cadastro</strong> e preencha os seguintes dados:
                </p>
                <ol className="mt-2 space-y-1.5 list-decimal list-inside text-gray-700 dark:text-gray-300">
                  <li><strong>Nome completo</strong> — seu nome que aparecerá no sistema</li>
                  <li><strong>Profissão</strong> — ex.: Psicólogo, Personal Trainer (opcional)</li>
                  <li><strong>E-mail</strong> — será seu login de acesso</li>
                  <li><strong>Senha</strong> — mínimo de 8 caracteres</li>
                </ol>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ao criar a conta, você começa automaticamente no plano <strong>Starter gratuito</strong> com até 5 clientes ativos.
                </p>
              </Subsection>
              <Subsection title="2.2 Fazendo login">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Acesse <strong>/login</strong> com seu e-mail e senha cadastrados. Caso esqueça a senha, utilize a opção de recuperação na tela de login.
                </p>
              </Subsection>
              <Subsection title="2.3 Navegação">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Após o login, você terá acesso ao menu lateral (sidebar) com todos os módulos do sistema. No celular, o menu pode ser aberto pelo ícone de hambúrguer no canto superior esquerdo.
                </p>
              </Subsection>
            </Card>
          </section>

          {/* 3. Dashboard */}
          <section id="dashboard" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<LayoutDashboard className="h-5 w-5" />} number="3" title="Dashboard" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O Dashboard é a tela inicial após o login e apresenta um resumo financeiro em tempo real do seu negócio.
              </p>
              <Subsection title="3.1 Cards de resumo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <MetricCard color="yellow" title="A Receber" desc="Total de cobranças pendentes do mês atual que ainda não venceram." />
                  <MetricCard color="green" title="Recebido" desc="Total de pagamentos confirmados no mês atual." />
                  <MetricCard color="red" title="Em Atraso" desc="Total de cobranças vencidas e não pagas, com a taxa de inadimplência." />
                  <MetricCard color="indigo" title="Projeção" desc="Soma dos honorários dos clientes com plano fixo ou pacote mensal — previsão de receita recorrente." />
                </div>
              </Subsection>
              <Subsection title="3.2 Gráfico de receita">
                <p className="text-gray-700 dark:text-gray-300">
                  Exibe o histórico dos últimos 6 meses com três linhas: <strong>Recebido</strong> (verde), <strong>Pendente</strong> (amarelo) e <strong>Em atraso</strong> (vermelho). Útil para identificar tendências financeiras.
                </p>
              </Subsection>
              <Subsection title="3.3 Clientes em atraso">
                <p className="text-gray-700 dark:text-gray-300">
                  Lista os 5 clientes com maior valor em atraso, mostrando nome, dias em atraso e valor. Se não houver inadimplência, exibe uma mensagem de parabéns.
                </p>
              </Subsection>
              <Subsection title="3.4 Próximos vencimentos">
                <p className="text-gray-700 dark:text-gray-300">
                  Exibe as próximas cobranças a vencer, ordenadas por data, com nome do cliente, data de vencimento e valor.
                </p>
              </Subsection>
            </Card>
          </section>

          {/* 4. Clientes */}
          <section id="clientes" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Users className="h-5 w-5" />} number="4" title="Clientes" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O módulo de Clientes permite cadastrar e gerenciar toda a sua carteira de atendidos.
              </p>
              <Subsection title="4.1 Cadastrar novo cliente">
                <p className="text-gray-700 dark:text-gray-300">Clique em <strong>+ Novo Cliente</strong> e preencha:</p>
                <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Nome completo</strong> (obrigatório)</li>
                  <li><strong>Telefone</strong> — usado para envio de lembretes via WhatsApp</li>
                  <li><strong>E-mail</strong> (opcional)</li>
                  <li><strong>Tipo de atendimento</strong> — Sessão avulsa, Pacote mensal ou Plano fixo</li>
                  <li><strong>Honorário mensal (R$)</strong> — valor padrão das cobranças</li>
                  <li><strong>Dia de vencimento</strong> — dia do mês para geração das cobranças</li>
                  <li><strong>Observações</strong> — anotações internas sobre o cliente</li>
                </ul>
              </Subsection>
              <Subsection title="4.2 Ações disponíveis">
                <ul className="mt-1 space-y-1.5 text-gray-700 dark:text-gray-300">
                  <FeatureItem><strong>Buscar</strong> — filtre por nome, telefone ou e-mail</FeatureItem>
                  <FeatureItem><strong>Editar</strong> — atualize os dados do cliente</FeatureItem>
                  <FeatureItem><strong>Ativar/Desativar</strong> — arquive o cliente sem excluir seu histórico</FeatureItem>
                  <FeatureItem><strong>Excluir</strong> — remoção permanente do cliente</FeatureItem>
                  <FeatureItem><strong>Exportar CSV</strong> — baixe a lista completa em planilha</FeatureItem>
                </ul>
              </Subsection>
              <Subsection title="4.3 Perfil do cliente">
                <p className="text-gray-700 dark:text-gray-300">
                  Clique no ícone de olho para acessar o perfil completo, que exibe:
                </p>
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem>Resumo financeiro: total recebido, pendente e em atraso</FeatureItem>
                  <FeatureItem>Histórico de atendimentos com possibilidade de edição</FeatureItem>
                  <FeatureItem>Histórico de cobranças com ações de pagamento</FeatureItem>
                  <FeatureItem>Link do portal do cliente para compartilhar</FeatureItem>
                </ul>
              </Subsection>
            </Card>
          </section>

          {/* 5. Atendimentos */}
          <section id="atendimentos" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Calendar className="h-5 w-5" />} number="5" title="Atendimentos" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Registre cada sessão ou serviço prestado. O sistema pode gerar uma cobrança automaticamente a cada atendimento registrado.
              </p>
              <Subsection title="5.1 Registrar atendimento">
                <p className="text-gray-700 dark:text-gray-300">Clique em <strong>+ Novo Atendimento</strong> e preencha:</p>
                <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Cliente</strong> (obrigatório) — selecione da lista de ativos; o honorário é preenchido automaticamente</li>
                  <li><strong>Data</strong> (obrigatório) — data em que o atendimento ocorreu</li>
                  <li><strong>Valor (R$)</strong> — preenchido automaticamente pelo honorário do cliente</li>
                  <li><strong>Descrição</strong> — ex.: &ldquo;Sessão de psicoterapia&rdquo;, &ldquo;Aula de treino&rdquo;</li>
                  <li><strong>Anotações privadas</strong> — notas clínicas; não aparecem nos recibos</li>
                  <li><strong>Gerar cobrança</strong> — ativado por padrão; cria automaticamente uma cobrança vinculada</li>
                </ul>
              </Subsection>
              <Subsection title="5.2 Cobrança automática">
                <p className="text-gray-700 dark:text-gray-300">
                  Quando a opção <strong>Gerar cobrança</strong> está ativa, ao salvar o atendimento o sistema cria automaticamente uma cobrança com:
                </p>
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem>Valor do atendimento</FeatureItem>
                  <FeatureItem>Cliente vinculado</FeatureItem>
                  <FeatureItem>Data de vencimento calculada com base no dia de vencimento configurado no cliente</FeatureItem>
                  <FeatureItem>Status inicial: <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Pendente</span></FeatureItem>
                </ul>
              </Subsection>
            </Card>
          </section>

          {/* 6. Cobranças */}
          <section id="cobrancas" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<CreditCard className="h-5 w-5" />} number="6" title="Cobranças" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O módulo de Cobranças centraliza todas as solicitações de pagamento, permitindo acompanhar o status e executar ações sobre cada cobrança.
              </p>
              <Subsection title="6.1 Status das cobranças">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <StatusBadge color="yellow" label="Pendente" desc="Cobrança gerada, pagamento ainda não venceu." />
                  <StatusBadge color="red" label="Em Atraso" desc="Data de vencimento passou sem pagamento." />
                  <StatusBadge color="green" label="Pago" desc="Pagamento confirmado e recebido." />
                  <StatusBadge color="purple" label="Estornado" desc="Pagamento revertido de volta a pendente." />
                  <StatusBadge color="gray" label="Cancelado" desc="Cobrança cancelada permanentemente." />
                </div>
              </Subsection>
              <Subsection title="6.2 Ações disponíveis">
                <ul className="mt-1 space-y-1.5 text-gray-700 dark:text-gray-300">
                  <FeatureItem><strong>Editar</strong> — altere valor, data de vencimento ou descrição</FeatureItem>
                  <FeatureItem><strong>Marcar como Pago</strong> — confirma o recebimento, envia confirmação via WhatsApp (se configurado) e gera recibo</FeatureItem>
                  <FeatureItem><strong>Enviar Lembrete</strong> — envia mensagem de cobrança via WhatsApp ao cliente</FeatureItem>
                  <FeatureItem><strong>Ver Recibo</strong> — acessa o recibo em PDF da cobrança paga</FeatureItem>
                  <FeatureItem><strong>Estornar</strong> — reverte uma cobrança paga de volta ao status pendente</FeatureItem>
                  <FeatureItem><strong>Exportar CSV</strong> — baixa todas as cobranças em planilha</FeatureItem>
                </ul>
              </Subsection>
              <Subsection title="6.3 Filtros">
                <p className="text-gray-700 dark:text-gray-300">
                  Use os filtros no topo da página para visualizar: <strong>Todas</strong>, <strong>Pendente</strong>, <strong>Em Atraso</strong>, <strong>Pago</strong>, <strong>Estornado</strong> ou <strong>Cancelado</strong>. Também é possível buscar por nome do cliente.
                </p>
              </Subsection>
              <Subsection title="6.4 Lembretes automáticos">
                <p className="text-gray-700 dark:text-gray-300">
                  O sistema envia lembretes automáticos via WhatsApp (quando a integração estiver configurada):
                </p>
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem><strong>3 dias antes</strong> do vencimento — lembrete de pagamento futuro</FeatureItem>
                  <FeatureItem><strong>1 dia antes</strong> do vencimento — lembrete de vencimento próximo</FeatureItem>
                  <FeatureItem><strong>1 dia após</strong> o vencimento — aviso de atraso</FeatureItem>
                  <FeatureItem><strong>7 dias após</strong> o vencimento — notificação de atraso urgente</FeatureItem>
                </ul>
              </Subsection>
            </Card>
          </section>

          {/* 7. Agenda */}
          <section id="agenda" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<CalendarDays className="h-5 w-5" />} number="7" title="Agenda" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                A Agenda exibe todos os atendimentos em uma visualização de calendário mensal, permitindo ter uma visão rápida dos seus compromissos.
              </p>
              <Subsection title="7.1 Navegação">
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem>Use as setas <strong>← →</strong> para navegar entre meses</FeatureItem>
                  <FeatureItem>Dias com atendimentos são destacados com o nome do cliente e valor</FeatureItem>
                  <FeatureItem>Dias de outros meses aparecem em cor mais suave</FeatureItem>
                  <FeatureItem>Clique em um dia para ver os detalhes de todos os atendimentos daquela data</FeatureItem>
                </ul>
              </Subsection>
            </Card>
          </section>

          {/* 8. Relatórios */}
          <section id="relatorios" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<FileText className="h-5 w-5" />} number="8" title="Relatórios" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O módulo de Relatórios oferece ferramentas para exportar e analisar seus dados financeiros.
              </p>
              <Subsection title="8.1 Relatório financeiro mensal (PDF)">
                <p className="text-gray-700 dark:text-gray-300">
                  Selecione o mês e clique em <strong>Gerar Relatório</strong> para baixar um PDF com resumo mensal contendo: total recebido, pendente e em atraso, listagem detalhada das cobranças e gráficos de status.
                </p>
              </Subsection>
              <Subsection title="8.2 Exportações CSV">
                <p className="text-gray-700 dark:text-gray-300">Três opções de exportação em planilha:</p>
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem><strong>Clientes</strong> — nome, telefone, e-mail, tipo de serviço, honorário, dia de vencimento, status</FeatureItem>
                  <FeatureItem><strong>Atendimentos</strong> — data, cliente, descrição, valor, se cobrança foi gerada</FeatureItem>
                  <FeatureItem><strong>Cobranças</strong> — cliente, valor, vencimento, status, data de pagamento, descrição</FeatureItem>
                </ul>
              </Subsection>
            </Card>
          </section>

          {/* 9. Equipe */}
          <section id="equipe" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<UsersRound className="h-5 w-5" />} number="9" title="Equipe" />
            <Card>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 mb-4">
                <span className="text-indigo-600 font-bold text-sm mt-0.5">CLÍNICA</span>
                <p className="text-sm text-indigo-800 dark:text-indigo-300">Este módulo está disponível exclusivamente para usuários do plano Clínica.</p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O módulo de Equipe permite gerenciar múltiplos profissionais dentro de uma clínica, com até 3 membros além do titular da conta.
              </p>
              <Subsection title="9.1 Convidar membro">
                <p className="text-gray-700 dark:text-gray-300">
                  Informe o e-mail do profissional e clique em <strong>Enviar Convite</strong>. O convidado receberá um e-mail com as instruções de acesso e aparecerá na lista com status <em>Pendente</em> até aceitar o convite.
                </p>
              </Subsection>
              <Subsection title="9.2 Gerenciar membros">
                <p className="text-gray-700 dark:text-gray-300">
                  A lista exibe todos os membros com e-mail, status (Pendente / Ativo) e data de ingresso. Você pode remover membros a qualquer momento clicando no botão de remoção (com confirmação).
                </p>
              </Subsection>
            </Card>
          </section>

          {/* 10. Configurações */}
          <section id="configuracoes" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Settings className="h-5 w-5" />} number="10" title="Configurações" />
            <Card>
              <Subsection title="10.1 Perfil da conta">
                <p className="text-gray-700 dark:text-gray-300">
                  Visualize os dados da sua conta: nome, e-mail, telefone, profissão, nome da empresa (planos PRO e Clínica), CNPJ, plano atual e data de criação da conta.
                </p>
              </Subsection>
              <Subsection title="10.2 Integração WhatsApp">
                <p className="text-gray-700 dark:text-gray-300">
                  Para habilitar o envio de lembretes e confirmações via WhatsApp:
                </p>
                <ol className="mt-2 space-y-1.5 list-decimal list-inside text-gray-700 dark:text-gray-300">
                  <li>Clique em <strong>Conectar WhatsApp</strong></li>
                  <li>Um QR Code será exibido na tela</li>
                  <li>No seu celular, abra o WhatsApp e vá em <strong>Dispositivos Conectados</strong></li>
                  <li>Toque em <strong>Conectar Dispositivo</strong> e escaneie o QR Code</li>
                  <li>Após a conexão, o status será atualizado para <span className="text-green-600 font-medium">Conectado</span></li>
                </ol>
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  O QR Code expira em 60 segundos. Se necessário, clique em <strong>Gerar Novo QR Code</strong>.
                </p>
              </Subsection>
              <Subsection title="10.3 Status do sistema">
                <p className="text-gray-700 dark:text-gray-300">
                  Exibe o status das integrações ativas: banco de dados, gateway de pagamento (Asaas) e WhatsApp, com timestamps das últimas verificações.
                </p>
              </Subsection>
            </Card>
          </section>

          {/* 11. Planos */}
          <section id="planos" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Wallet className="h-5 w-5" />} number="11" title="Planos" />
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                O Recebi oferece três planos para atender diferentes perfis de profissionais:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PlanCard
                  name="Starter"
                  price="Gratuito"
                  color="gray"
                  features={[
                    'Até 5 clientes ativos',
                    'Atendimentos ilimitados',
                    'Cobranças ilimitadas',
                    'Exportação CSV',
                    'Relatórios PDF',
                    '1 usuário',
                  ]}
                />
                <PlanCard
                  name="PRO"
                  price="R$ 47/mês"
                  color="indigo"
                  featured
                  features={[
                    'Até 50 clientes ativos',
                    'Todos os recursos Starter',
                    'Nome da empresa',
                    'CNPJ na conta',
                    '1 usuário',
                  ]}
                />
                <PlanCard
                  name="Clínica"
                  price="R$ 97/mês"
                  color="purple"
                  features={[
                    'Até 200 clientes ativos',
                    'Todos os recursos PRO',
                    'Gestão de equipe',
                    'Até 3 membros adicionais',
                  ]}
                />
              </div>
            </Card>
          </section>

          {/* 12. Integrações */}
          <section id="integracoes" className="space-y-4 print-section print-page-break">
            <SectionHeader icon={<Bell className="h-5 w-5" />} number="12" title="Integrações" />
            <Card>
              <Subsection title="12.1 WhatsApp (Evolution API)">
                <p className="text-gray-700 dark:text-gray-300">
                  Permite o envio automático de lembretes e confirmações de pagamento diretamente pelo WhatsApp do profissional. A configuração é feita em <strong>Configurações → Integração WhatsApp</strong> (veja seção 10.2).
                </p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  Mensagens enviadas automaticamente:
                </p>
                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                  <FeatureItem>Lembrete de vencimento (D-3 e D-1)</FeatureItem>
                  <FeatureItem>Notificação de cobrança em atraso (D+1 e D+7)</FeatureItem>
                  <FeatureItem>Confirmação de pagamento recebido</FeatureItem>
                </ul>
              </Subsection>
              <Subsection title="12.2 Asaas (Gateway de Pagamento)">
                <p className="text-gray-700 dark:text-gray-300">
                  Integração opcional com o gateway de pagamento Asaas para geração de links de pagamento via Pix, Boleto ou Cartão de Crédito, sincronização automática de status e geração de recibos. Configurada pelo administrador do sistema via variáveis de ambiente.
                </p>
              </Subsection>
            </Card>
          </section>

          {/* Rodapé */}
          <footer className="text-center text-sm text-gray-400 dark:text-gray-600 py-8 border-t border-gray-200 dark:border-gray-800 print-section">
            <p>re<span className="text-indigo-600">cebi</span> — Manual de Utilização</p>
            <p className="mt-1">Para suporte, entre em contato com o administrador do sistema.</p>
          </footer>

        </div>
      </div>
    </>
  )
}

function SectionHeader({ icon, number, title }: { icon: React.ReactNode; number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        <span className="text-indigo-600 mr-1">{number}.</span>{title}
      </h2>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-5">
      {children}
    </div>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function MetricCard({ color, title, desc }: { color: string; title: string; desc: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  }
  const titleColors: Record<string, string> = {
    yellow: 'text-yellow-800 dark:text-yellow-300',
    green: 'text-green-800 dark:text-green-300',
    red: 'text-red-800 dark:text-red-300',
    indigo: 'text-indigo-800 dark:text-indigo-300',
  }
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <p className={`font-semibold text-sm ${titleColors[color]}`}>{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
    </div>
  )
}

function StatusBadge({ color, label, desc }: { color: string; label: string; desc: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }
  return (
    <div className="flex items-start gap-2">
      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>{label}</span>
      <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{desc}</span>
    </div>
  )
}

function PlanCard({ name, price, color, features, featured }: { name: string; price: string; color: string; features: string[]; featured?: boolean }) {
  const borderColors: Record<string, string> = {
    gray: 'border-gray-200 dark:border-gray-700',
    indigo: 'border-indigo-500 dark:border-indigo-500',
    purple: 'border-purple-400 dark:border-purple-600',
  }
  const nameColors: Record<string, string> = {
    gray: 'text-gray-700 dark:text-gray-300',
    indigo: 'text-indigo-700 dark:text-indigo-400',
    purple: 'text-purple-700 dark:text-purple-400',
  }
  return (
    <div className={`rounded-xl border-2 p-4 ${borderColors[color]} ${featured ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
      <p className={`font-bold text-base ${nameColors[color]}`}>{name}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{price}</p>
      <ul className="mt-3 space-y-1.5">
        {features.map(f => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
