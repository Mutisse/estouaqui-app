<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Configurações</h1>
      <div class="header-actions">
        <q-btn flat icon="refresh" label="Atualizar" @click="recarregarDados" :loading="isLoading" />
      </div>
    </div>

    <!-- Abas -->
    <q-tabs v-model="tab" align="left" narrow-indicator class="main-tabs">
      <q-tab name="geral" icon="settings" label="Geral" />
      <q-tab name="prestadores" icon="handyman" label="Prestadores" />
      <q-tab name="pagamentos" icon="payments" label="Pagamentos" />
      <q-tab name="permissoes" icon="security" label="Permissões" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- ==================== ABA GERAL ==================== -->
      <q-tab-panel name="geral" class="tab-panel">
        <div class="form-section">
          <!-- Identificação -->
          <div class="section-header">
            <h3>🏢 Identificação</h3>
          </div>
          <div class="form-row">
            <q-input
              v-model="configuracoesGerais.nome_sistema"
              label="Nome do Sistema"
              outlined
              dense
            />
            <q-file
              v-model="logoFile"
              label="Logo do Sistema"
              outlined
              dense
              accept="image/*"
            >
              <template v-slot:prepend>
                <q-icon name="image" />
              </template>
            </q-file>
          </div>

          <!-- Contato -->
          <div class="section-header q-mt-xl">
            <h3>📞 Contato</h3>
          </div>
          <div class="form-row">
            <q-input
              v-model="configuracoesGerais.email_contato"
              label="Email de Contato"
              type="email"
              outlined
              dense
            />
            <q-input
              v-model="configuracoesGerais.telefone_contato"
              label="Telefone de Contato"
              outlined
              dense
            />
          </div>
          <div class="form-row">
            <q-input
              v-model="configuracoesGerais.whatsapp_contato"
              label="WhatsApp"
              outlined
              dense
            />
            <q-input
              v-model="configuracoesGerais.endereco"
              label="Endereço"
              outlined
              dense
            />
          </div>

          <!-- Manutenção -->
          <div class="section-header q-mt-xl">
            <h3>🔧 Manutenção</h3>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesGerais.manutencao" label="Modo Manutenção" />
          </div>
          <div class="form-row" v-if="configuracoesGerais.manutencao">
            <q-input
              v-model="configuracoesGerais.mensagem_manutencao"
              label="Mensagem de Manutenção"
              type="textarea"
              outlined
              dense
              rows="2"
            />
          </div>

          <!-- Segurança -->
          <div class="section-header q-mt-xl">
            <h3>🔐 Segurança</h3>
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesGerais.tempo_sessao"
              label="Tempo de Sessão (minutos)"
              type="number"
              outlined
              dense
              min="1"
              max="480"
            />
            <q-input
              v-model.number="configuracoesGerais.max_tentativas_login"
              label="Máx. Tentativas Login"
              type="number"
              outlined
              dense
              min="3"
              max="10"
            />
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesGerais.registro_automatico" label="Registro Automático" />
            <q-toggle v-model="configuracoesGerais.verificacao_email" label="Verificação de Email" />
          </div>

          <!-- Notificações -->
          <div class="section-header q-mt-xl">
            <h3>🔔 Notificações</h3>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesGerais.notificacoes_email" label="Notificações por Email" />
            <q-toggle v-model="configuracoesGerais.notificacoes_push" label="Notificações Push" />
          </div>

          <!-- Email SMTP -->
          <div class="section-header q-mt-xl">
            <h3>📧 Servidor de Email</h3>
          </div>
          <div class="form-row">
            <q-input
              v-model="configuracoesGerais.smtp_host"
              label="SMTP Host"
              outlined
              dense
            />
            <q-input
              v-model.number="configuracoesGerais.smtp_porta"
              label="SMTP Porta"
              type="number"
              outlined
              dense
            />
          </div>
          <div class="form-row">
            <q-input
              v-model="configuracoesGerais.smtp_usuario"
              label="SMTP Usuário"
              outlined
              dense
            />
            <q-input
              v-model="configuracoesGerais.smtp_senha"
              label="SMTP Senha"
              type="password"
              outlined
              dense
            />
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesGerais.smtp_criptografia"
              :options="opcoesCriptografia"
              label="Criptografia"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- Financeiro -->
          <div class="section-header q-mt-xl">
            <h3>💰 Financeiro</h3>
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesGerais.comissao"
              label="Comissão (%)"
              type="number"
              outlined
              dense
              min="0"
              max="100"
              suffix="%"
            />
            <q-input
              v-model.number="configuracoesGerais.valor_minimo_saque"
              label="Valor Mínimo Saque"
              type="number"
              outlined
              dense
              min="0"
              suffix="MZN"
            />
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesGerais.moeda"
              :options="opcoesMoeda"
              label="Moeda"
              outlined
              dense
              emit-value
              map-options
            />
            <q-select
              v-model="configuracoesGerais.fuso_horario"
              :options="opcoesFusoHorario"
              label="Fuso Horário"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesGerais.limite_pedidos_por_dia"
              label="Limite Pedidos/Dia"
              type="number"
              outlined
              dense
              min="0"
            />
            <q-input
              v-model.number="configuracoesGerais.tempo_cancelamento_pedido"
              label="Tempo Cancelamento (min)"
              type="number"
              outlined
              dense
              min="0"
            />
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesGerais.pagamento_automatico" label="Pagamento Automático" />
          </div>

          <div class="form-actions">
            <q-btn color="primary" label="Salvar Configurações" @click="salvarGerais" :loading="isSaving" />
          </div>
        </div>
      </q-tab-panel>

      <!-- ==================== ABA PRESTADORES ==================== -->
      <q-tab-panel name="prestadores" class="tab-panel">
        <div class="form-section">
          <div class="section-header">
            <h3>👨‍🔧 Configurações de Prestadores</h3>
          </div>

          <!-- Raios e Distâncias -->
          <div class="sub-section-header">
            <h4>📍 Localização e Distâncias</h4>
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesPrestador.raios_atendimento"
              :options="opcoesRaios"
              label="Raios de Atendimento (km)"
              multiple
              use-chips
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesPrestador.raio_padrao"
              :options="opcoesRaios"
              label="Raio Padrão (km)"
              outlined
              dense
              emit-value
              map-options
            />
            <q-input
              v-model.number="configuracoesPrestador.distancia_maxima"
              label="Distância Máxima (km)"
              type="number"
              outlined
              dense
              min="0"
              suffix="km"
            />
          </div>

          <!-- Disponibilidade -->
          <div class="sub-section-header q-mt-xl">
            <h4>📅 Disponibilidade</h4>
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesPrestador.dias_semana"
              :options="opcoesDiasSemana"
              label="Dias de Trabalho"
              multiple
              use-chips
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="form-row">
            <div class="time-group">
              <q-input
                v-model="configuracoesPrestador.disponibilidade_padrao.inicio"
                label="Horário Início"
                type="time"
                outlined
                dense
              />
              <q-input
                v-model="configuracoesPrestador.disponibilidade_padrao.fim"
                label="Horário Fim"
                type="time"
                outlined
                dense
              />
              <q-input
                v-model.number="configuracoesPrestador.disponibilidade_padrao.intervalo"
                label="Intervalo (minutos)"
                type="number"
                outlined
                dense
                min="15"
                step="15"
              />
            </div>
          </div>

          <!-- Documentos -->
          <div class="sub-section-header q-mt-xl">
            <h4>📋 Documentos</h4>
          </div>
          <div class="form-row">
            <q-select
              v-model="configuracoesPrestador.documentos_aceitos"
              :options="opcoesDocumentos"
              label="Documentos Aceitos"
              multiple
              use-chips
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- Portfólio -->
          <div class="sub-section-header q-mt-xl">
            <h4>🖼️ Portfólio</h4>
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesPrestador.max_file_size"
              label="Tamanho Máximo Arquivo (MB)"
              type="number"
              outlined
              dense
              min="1"
              max="20"
              suffix="MB"
            />
            <q-input
              v-model.number="configuracoesPrestador.max_portfolio_photos"
              label="Máx. Fotos no Portfólio"
              type="number"
              outlined
              dense
              min="1"
              max="50"
            />
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesPrestador.min_portfolio_photos"
              label="Mín. Fotos no Portfólio"
              type="number"
              outlined
              dense
              min="0"
              max="10"
            />
          </div>

          <!-- Regras de Negócio -->
          <div class="sub-section-header q-mt-xl">
            <h4>⚙️ Regras de Negócio</h4>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesPrestador.precisa_aprovacao" label="Precisa Aprovação Manual" />
            <q-input
              v-model.number="configuracoesPrestador.tempo_resposta_maximo"
              label="Tempo Máximo Resposta (horas)"
              type="number"
              outlined
              dense
              min="0"
            />
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesPrestador.comissao_especial"
              label="Comissão Especial (%)"
              type="number"
              outlined
              dense
              min="0"
              max="100"
              suffix="%"
            />
            <q-input
              v-model.number="configuracoesPrestador.bonus_avaliacao"
              label="Bônus por Avaliação 5★ (MZN)"
              type="number"
              outlined
              dense
              min="0"
              suffix="MZN"
            />
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesPrestador.tempo_minimo_servico"
              label="Tempo Mínimo Serviço (min)"
              type="number"
              outlined
              dense
              min="0"
            />
          </div>

          <div class="form-actions">
            <q-btn color="primary" label="Salvar Configurações" @click="salvarPrestador" :loading="isSaving" />
          </div>
        </div>
      </q-tab-panel>

      <!-- ==================== ABA PAGAMENTOS ==================== -->
      <q-tab-panel name="pagamentos" class="tab-panel">
        <div class="form-section">
          <div class="section-header">
            <h3>💳 Métodos de Pagamento</h3>
          </div>

          <!-- M-Pesa -->
          <div class="sub-section-header">
            <h4>📱 M-Pesa</h4>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesPagamento.mpesa_ativo" label="Ativar M-Pesa" />
          </div>
          <div class="form-row" v-if="configuracoesPagamento.mpesa_ativo">
            <q-input
              v-model="configuracoesPagamento.mpesa_numero"
              label="Número M-Pesa"
              outlined
              dense
              placeholder="84 XXX XXXX"
            />
            <q-input
              v-model="configuracoesPagamento.mpesa_chave"
              label="Chave API M-Pesa"
              type="password"
              outlined
              dense
            />
          </div>

          <!-- Cartões de Crédito -->
          <div class="sub-section-header q-mt-xl">
            <h4>💳 Cartões de Crédito</h4>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesPagamento.visa_ativo" label="Visa" />
            <q-toggle v-model="configuracoesPagamento.mastercard_ativo" label="Mastercard" />
          </div>

          <!-- PayPal -->
          <div class="sub-section-header q-mt-xl">
            <h4>🌐 PayPal</h4>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesPagamento.paypal_ativo" label="Ativar PayPal" />
          </div>
          <div class="form-row" v-if="configuracoesPagamento.paypal_ativo">
            <q-input
              v-model="configuracoesPagamento.paypal_email"
              label="Email PayPal"
              type="email"
              outlined
              dense
            />
          </div>

          <!-- Transferência Bancária -->
          <div class="sub-section-header q-mt-xl">
            <h4>🏦 Transferência Bancária</h4>
          </div>
          <div class="form-row">
            <q-toggle v-model="configuracoesPagamento.transferencia_ativo" label="Ativar Transferência Bancária" />
            <q-toggle v-model="configuracoesPagamento.deposito_ativo" label="Ativar Depósito Bancário" />
          </div>

          <!-- Parcelamento -->
          <div class="sub-section-header q-mt-xl">
            <h4>📦 Parcelamento</h4>
          </div>
          <div class="form-row">
            <q-input
              v-model.number="configuracoesPagamento.parcelamento_maximo"
              label="Máx. Parcelas"
              type="number"
              outlined
              dense
              min="1"
              max="12"
            />
            <q-input
              v-model.number="configuracoesPagamento.juros_parcelamento"
              label="Juros por Parcela (%)"
              type="number"
              outlined
              dense
              min="0"
              max="10"
              suffix="%"
            />
          </div>

          <div class="form-actions">
            <q-btn color="primary" label="Salvar Configurações" @click="salvarPagamento" :loading="isSaving" />
          </div>
        </div>
      </q-tab-panel>

      <!-- ==================== ABA PERMISSÕES ==================== -->
      <q-tab-panel name="permissoes" class="tab-panel">
        <div class="permissions-section">
          <div class="section-header">
            <h3>🔒 Permissões por Perfil</h3>
          </div>

          <!-- Filtros -->
          <div class="filters-bar">
            <q-input
              v-model="filtrosPermissoes.search"
              placeholder="Pesquisar permissão..."
              dense
              outlined
              class="search-input"
              @update:model-value="onFiltroPermissaoChange"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-select
              v-model="filtrosPermissoes.modulo"
              :options="opcoesModulos"
              label="Módulo"
              dense
              outlined
              clearable
              class="filter-select"
              @update:model-value="onFiltroPermissaoChange"
            />
          </div>

          <!-- Tabela de Permissões -->
          <q-table
            :rows="permissoesFiltradas"
            :columns="permissoesColumns"
            row-key="id"
            flat
            bordered
            class="permissions-table"
          >
            <template v-slot:body-cell-nome="props">
              <q-td :props="props">
                <div class="permissao-nome">
                  <strong>{{ props.row.nome }}</strong>
                  <span class="permissao-desc">{{ props.row.descricao }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-modulo="props">
              <q-td :props="props">
                <q-badge :color="getModuloColor(props.row.modulo)">
                  {{ getModuloLabel(props.row.modulo) }}
                </q-badge>
              </q-td>
            </template>

            <template v-slot:body-cell-root="props">
              <q-td :props="props">
                <q-checkbox
                  v-model="props.row.root"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="() => togglePermissao(props.row.id, 'root')"
                  color="red"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-admin="props">
              <q-td :props="props">
                <q-checkbox
                  v-model="props.row.admin"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="() => togglePermissao(props.row.id, 'admin')"
                  color="primary"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-prestador="props">
              <q-td :props="props">
                <q-checkbox
                  v-model="props.row.prestador"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="() => togglePermissao(props.row.id, 'prestador')"
                  color="green"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">
                <q-checkbox
                  v-model="props.row.cliente"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="() => togglePermissao(props.row.id, 'cliente')"
                  color="blue"
                />
              </q-td>
            </template>
          </q-table>

          <div class="form-actions q-mt-md">
            <q-btn color="primary" label="Salvar Permissões" @click="salvarPermissoesGeral" :loading="isSaving" />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminConfiguracoesStore } from 'src/stores/admin/admin-configuracoes-store';

defineOptions({ name: 'AdminConfiguracoes' });

const $q = useQuasar();
const configStore = useAdminConfiguracoesStore();

const {
  isLoading,
  isSaving,
  configuracoesGerais,
  configuracoesPrestador,
  configuracoesPagamento,
  permissoes,
  opcoesModulos,
  opcoesRaios,
  opcoesDiasSemana,
  opcoesDocumentos,
  opcoesFusoHorario,
  opcoesMoeda,
  opcoesCriptografia,
} = storeToRefs(configStore);

const {
  salvarConfiguracoesGerais,
  salvarConfiguracoesPrestador,
  salvarConfiguracoesPagamento,
  recarregarDados,
} = configStore;

// Estados locais
const tab = ref('geral');
const logoFile = ref<File | null>(null);

// Filtros para permissões
const filtrosPermissoes = ref({
  search: '',
  modulo: '',
});

// Permissões para tabela
const permissoesFiltradas = computed(() => {
  let resultado = [...permissoes.value];

  if (filtrosPermissoes.value.search) {
    const searchLower = filtrosPermissoes.value.search.toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.nome.toLowerCase().includes(searchLower) ||
        p.descricao.toLowerCase().includes(searchLower)
    );
  }

  if (filtrosPermissoes.value.modulo) {
    resultado = resultado.filter((p) => p.modulo === filtrosPermissoes.value.modulo);
  }

  return resultado.map((p) => ({
    ...p,
    root: p.roles.includes('root'),
    admin: p.roles.includes('admin'),
    prestador: p.roles.includes('prestador'),
    cliente: p.roles.includes('cliente'),
  }));
});

const permissoesColumns = [
  { name: 'nome', label: 'Permissão', field: 'nome', align: 'left' as const },
  { name: 'modulo', label: 'Módulo', field: 'modulo', align: 'left' as const },
  { name: 'root', label: 'Root', field: 'root', align: 'center' as const, style: 'width: 80px' },
  { name: 'admin', label: 'Admin', field: 'admin', align: 'center' as const, style: 'width: 80px' },
  { name: 'prestador', label: 'Prestador', field: 'prestador', align: 'center' as const, style: 'width: 80px' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'center' as const, style: 'width: 80px' },
];

// Funções auxiliares
const getModuloLabel = (modulo: string): string => {
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    pedidos: 'Pedidos',
    prestadores: 'Prestadores',
    clientes: 'Clientes',
    categorias: 'Categorias',
    promocoes: 'Promoções',
    avaliacoes: 'Avaliações',
    financeiro: 'Financeiro',
    relatorios: 'Relatórios',
    configuracoes: 'Configurações',
    usuarios: 'Usuários',
  };
  return labels[modulo] || modulo;
};

const getModuloColor = (modulo: string): string => {
  const colors: Record<string, string> = {
    dashboard: 'primary',
    pedidos: 'orange',
    prestadores: 'green',
    clientes: 'blue',
    categorias: 'purple',
    promocoes: 'pink',
    avaliacoes: 'amber',
    financeiro: 'teal',
    relatorios: 'indigo',
    configuracoes: 'grey',
    usuarios: 'cyan',
  };
  return colors[modulo] || 'grey';
};

const togglePermissao = (permissaoId: number, role: string): void => {
  const permissao = permissoes.value.find((p) => p.id === permissaoId);
  if (permissao) {
    const roleIndex = permissao.roles.indexOf(role);
    if (roleIndex === -1) {
      permissao.roles.push(role);
    } else {
      permissao.roles.splice(roleIndex, 1);
    }
  }
};

// Ações de filtro
const onFiltroPermissaoChange = (): void => {};

// Ações de salvamento
const salvarGerais = async (): Promise<void> => {
  const success = await salvarConfiguracoesGerais();
  if (success) {
    $q.notify({ type: 'positive', message: 'Configurações gerais salvas com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao salvar configurações gerais' });
  }
};

const salvarPrestador = async (): Promise<void> => {
  const success = await salvarConfiguracoesPrestador();
  if (success) {
    $q.notify({ type: 'positive', message: 'Configurações de prestadores salvas com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao salvar configurações de prestadores' });
  }
};

const salvarPagamento = async (): Promise<void> => {
  const success = await salvarConfiguracoesPagamento();
  if (success) {
    $q.notify({ type: 'positive', message: 'Configurações de pagamento salvas com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao salvar configurações de pagamento' });
  }
};

const salvarPermissoesGeral = async (): Promise<void> => {
  // TODO: Implementar salvamento em lote das permissões
  await new Promise((resolve) => setTimeout(resolve, 100));
  $q.notify({ type: 'info', message: 'Funcionalidade em desenvolvimento' });
};

// Lifecycle
onMounted(() => {
  void recarregarDados();
});
</script>

<style scoped lang="scss">
.page-container {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.main-tabs {
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 0 16px;
}

.tab-panel {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 24px;
}

.form-section {
  max-width: 1000px;

  .section-header {
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: #1a1a2e;
    }
  }

  .sub-section-header {
    margin-bottom: 16px;
    margin-top: 8px;

    h4 {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      color: #4b5563;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .time-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }
}

.form-actions {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.permissions-section {
  .filters-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    .search-input {
      width: 300px;
    }

    .filter-select {
      width: 200px;
    }
  }

  .permissions-table {
    .permissao-nome {
      display: flex;
      flex-direction: column;

      strong {
        font-size: 14px;
      }

      .permissao-desc {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
    }
  }
}

@media (max-width: 768px) {
  .form-section .form-row,
  .time-group {
    grid-template-columns: 1fr;
  }

  .permissions-section .filters-bar {
    flex-direction: column;

    .search-input,
    .filter-select {
      width: 100%;
    }
  }
}
</style>
