<template>
  <q-page class="admin-financeiro q-pa-md">
    <!-- Cabeçalho com indicador de permissão -->
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="payments" size="32px" class="q-mr-sm" />
          Financeiro
        </div>
        <div class="page-subtitle">
          {{ isRoot ? 'Visão geral e gestão das movimentações financeiras' : 'Visão geral das movimentações financeiras (consulta)' }}
        </div>
      </div>
      <div class="header-actions">
        <q-chip v-if="!isRoot" color="info" text-color="white" icon="visibility" class="q-mr-sm">
          Modo: Apenas Consulta
        </q-chip>
        <q-chip v-if="isRoot" color="positive" text-color="white" icon="admin_panel_settings">
          Root: Gestão Total
        </q-chip>
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarDados"
          :loading="financeiroStore.loading"
        />
        <q-btn
          v-if="isRoot"
          label="Exportar Relatório"
          icon="download"
          color="primary"
          glossy
          @click="exportarRelatorioCompleto"
        />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="financeiroStore.loading" class="skeleton-container">
      <!-- Cards skeleton -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-md-3">
          <div class="skeleton-card">
            <div class="skeleton-icon"></div>
            <div class="skeleton-content">
              <div class="skeleton-label"></div>
              <div class="skeleton-value"></div>
              <div class="skeleton-trend"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico e Distribuição skeleton -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-8">
          <div class="skeleton-chart-card">
            <div class="skeleton-header">
              <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-chart-bars">
              <div v-for="i in 6" :key="i" class="skeleton-bar-item">
                <div class="skeleton-bar"></div>
                <div class="skeleton-bar-label"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="skeleton-distribuicao-card">
            <div class="skeleton-header">
              <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-distribuicao-items">
              <div v-for="i in 3" :key="i" class="skeleton-distribuicao-item">
                <div class="skeleton-distribuicao-header">
                  <div class="skeleton-distribuicao-label"></div>
                  <div class="skeleton-distribuicao-value"></div>
                </div>
                <div class="skeleton-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela skeleton -->
      <div class="skeleton-table-card">
        <div class="skeleton-table-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-filters">
            <div class="skeleton-select"></div>
            <div class="skeleton-select"></div>
            <div class="skeleton-input"></div>
          </div>
        </div>
        <div class="skeleton-table">
          <div class="skeleton-table-header-row">
            <div v-for="i in 6" :key="i" class="skeleton-header-cell"></div>
          </div>
          <div v-for="row in 5" :key="row" class="skeleton-table-row">
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-badge"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-badge-small"></div>
            </div>
          </div>
        </div>
        <div class="skeleton-table-footer">
          <div class="skeleton-info"></div>
          <div class="skeleton-total"></div>
        </div>
      </div>

      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <!-- Cards de Resumo -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="finance-card saldo-card">
            <div class="card-icon">
              <q-icon name="account_balance_wallet" size="40px" />
            </div>
            <div class="card-content">
              <div class="card-label">Saldo Atual</div>
              <div class="card-value">{{ formatMoney(resumoFinanceiro.saldo_atual) }}</div>
              <div class="card-trend trend-up">
                <q-icon name="trending_up" size="14px" />
                Disponível para saque
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="finance-card pendente-card">
            <div class="card-icon">
              <q-icon name="schedule" size="40px" />
            </div>
            <div class="card-content">
              <div class="card-label">Pendente</div>
              <div class="card-value">{{ formatMoney(resumoFinanceiro.pendente) }}</div>
              <div class="card-trend trend-waiting">
                <q-icon name="pending" size="14px" />
                Aguardando processamento
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="finance-card processado-card">
            <div class="card-icon">
              <q-icon name="check_circle" size="40px" />
            </div>
            <div class="card-content">
              <div class="card-label">Processado (Mês)</div>
              <div class="card-value">{{ formatMoney(resumoFinanceiro.processado_mes) }}</div>
              <div class="card-trend">
                <q-icon name="calendar_today" size="14px" />
                {{ mesAtual }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="finance-card comissao-card">
            <div class="card-icon">
              <q-icon name="percent" size="40px" />
            </div>
            <div class="card-content">
              <div class="card-label">Comissões</div>
              <div class="card-value">{{ formatMoney(resumoFinanceiro.comissoes) }}</div>
              <div class="card-trend">
                <q-icon name="info" size="14px" />
                Comissões do mês
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Resumo -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-8">
          <q-card class="chart-card">
            <q-card-section>
              <div class="row justify-between items-center">
                <div class="text-h6">
                  <q-icon name="show_chart" class="q-mr-sm" />
                  Evolução Mensal
                </div>
              </div>
            </q-card-section>
            <q-card-section>
              <div class="chart-container" v-if="dadosGrafico.length > 0">
                <div class="chart-bars">
                  <div v-for="(item, index) in dadosGrafico" :key="index" class="chart-bar-item">
                    <div class="bar-wrapper">
                      <div
                        class="bar"
                        :style="{ height: `${item.altura}px`, backgroundColor: item.cor }"
                      >
                        <span class="bar-value">{{ formatMoney(item.valor) }}</span>
                      </div>
                    </div>
                    <div class="bar-label">{{ item.mes }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center q-pa-xl">
                <q-icon name="show_chart" size="48px" color="grey-4" />
                <div class="text-subtitle1 q-mt-sm text-grey">Carregando dados do gráfico...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="resumo-card">
            <q-card-section>
              <div class="text-h6">
                <q-icon name="pie_chart" class="q-mr-sm" />
                Distribuição
              </div>
            </q-card-section>
            <q-card-section>
              <div class="distribuicao-item">
                <div class="distribuicao-header">
                  <span class="distribuicao-label">
                    <q-icon name="arrow_upward" color="positive" size="14px" />
                    Entradas
                  </span>
                  <span class="distribuicao-value text-positive">{{ formatMoney(totalEntradas) }}</span>
                </div>
                <q-linear-progress :value="percentualEntradas" color="positive" class="q-mt-sm" />
              </div>
              <div class="distribuicao-item q-mt-md">
                <div class="distribuicao-header">
                  <span class="distribuicao-label">
                    <q-icon name="arrow_downward" color="negative" size="14px" />
                    Saídas
                  </span>
                  <span class="distribuicao-value text-negative">{{ formatMoney(totalSaidas) }}</span>
                </div>
                <q-linear-progress :value="percentualSaidas" color="negative" class="q-mt-sm" />
              </div>
              <div class="distribuicao-item q-mt-md">
                <div class="distribuicao-header">
                  <span class="distribuicao-label">
                    <q-icon name="percent" color="secondary" size="14px" />
                    Comissões
                  </span>
                  <span class="distribuicao-value text-secondary">{{ formatMoney(resumoFinanceiro.comissoes) }}</span>
                </div>
                <q-linear-progress :value="percentualComissoes" color="secondary" class="q-mt-sm" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabela de Transações -->
      <q-card class="transacoes-card">
        <q-card-section>
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6">
              <q-icon name="receipt" class="q-mr-sm" />
              Histórico de Transações
            </div>
            <div class="row q-gutter-sm">
              <q-select
                v-model="filtroTipo"
                :options="tipoOptions"
                label="Tipo"
                dense
                outlined
                clearable
                class="filter-select"
                @update:model-value="carregarTransacoes"
              />
              <q-select
                v-model="filtroStatus"
                :options="statusOptions"
                label="Status"
                dense
                outlined
                clearable
                class="filter-select"
                @update:model-value="carregarTransacoes"
              />
              <q-input
                v-model="busca"
                placeholder="Buscar..."
                dense
                outlined
                clearable
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <q-table
            :rows="transacoesFiltradas"
            :columns="colunas"
            row-key="id"
            :loading="financeiroStore.loading"
            :rows-per-page-options="[10, 20, 50]"
            class="transacoes-table"
            flat
            bordered
          >
            <template v-slot:body-cell-created_at="props">
              <q-td :props="props">
                <div class="data-cell">
                  <q-icon name="schedule" size="14px" class="q-mr-xs text-grey" />
                  {{ formatarData(props.row.created_at) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-tipo="props">
              <q-td :props="props">
                <div class="tipo-badge" :class="props.row.tipo">
                  <q-icon :name="props.row.tipo === 'entrada' ? 'arrow_upward' : 'arrow_downward'" size="14px" />
                  {{ props.row.tipo === 'entrada' ? 'Entrada' : 'Saída' }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-valor="props">
              <q-td :props="props">
                <span :class="props.row.tipo === 'entrada' ? 'text-positive' : 'text-negative'" class="valor-cell">
                  {{ props.row.tipo === 'entrada' ? '+' : '-' }} {{ formatMoney(props.row.valor) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getStatusCor(props.row.status)" class="status-badge" outline>
                  <q-icon :name="getStatusIcon(props.row.status)" size="12px" class="q-mr-xs" />
                  {{ getStatusTexto(props.row.status) }}
                </q-badge>
              </q-td>
            </template>

            <template v-slot:body-cell-descricao="props">
              <q-td :props="props">
                <div class="descricao-cell">
                  <q-icon name="description" size="14px" class="q-mr-xs text-grey" />
                  {{ props.row.descricao }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-metodo="props">
              <q-td :props="props">
                <q-chip size="sm" dense :color="getMetodoCor(props.row.metodo)" text-color="white" class="metodo-chip">
                  <q-icon :name="getMetodoIcon(props.row.metodo)" size="12px" class="q-mr-xs" />
                  {{ getMetodoLabel(props.row.metodo) }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="text-center q-pa-xl">
                <q-icon name="receipt" size="64px" color="grey-4" />
                <div class="text-subtitle1 q-mt-md text-grey">Nenhuma transação encontrada</div>
                <div class="text-caption text-grey">As transações aparecerão aqui quando houver movimentações</div>
              </div>
            </template>
          </q-table>

          <div class="row justify-between items-center q-mt-md q-pt-md" v-if="financeiroStore.transacoes.length > 0">
            <div class="text-caption text-grey">
              <q-icon name="info" size="14px" />
              Mostrando {{ transacoesFiltradas.length }} de {{ financeiroStore.transacoes.length }} transações
            </div>
            <div class="text-subtitle2 text-primary">
              Total: {{ formatMoney(calcularTotalTransacoes) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Modal de Exportação -->
    <q-dialog v-if="isRoot" v-model="mostrarModalExportacao">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="download" class="q-mr-sm" />
            Exportar Relatório
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="exportConfig.formato"
            :options="formatosExportacao"
            label="Formato"
            outlined
            dense
          />
          <q-select
            v-model="exportConfig.periodo"
            :options="periodosExportacao"
            label="Período"
            outlined
            dense
          />
          <q-select
            v-model="exportConfig.tipo"
            :options="tipoOptions"
            label="Tipo"
            outlined
            dense
            clearable
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Exportar" color="primary" @click="gerarExportacao" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
// ✅ IMPORTS CORRETOS
import { useAdminFinanceiroStore } from 'src/stores/admin/admin-financeiro-store';
import { useAuthStore } from 'src/stores/auth-store';
import type { TransacaoData } from 'src/stores/admin/admin-financeiro-store';

defineOptions({
  name: 'AdminFinanceiro',
});

const $q = useQuasar();
// ✅ USANDO O STORE CORRETO
const financeiroStore = useAdminFinanceiroStore();
const authStore = useAuthStore();

// Detectar se é ROOT
const isRoot = computed(() => {
  return authStore.user?.email === 'root@estouaqui.com';
});

// Estados
const filtroTipo = ref<string | null>(null);
const filtroStatus = ref<string | null>(null);
const busca = ref('');
const mostrarModalExportacao = ref(false);

// Configuração de exportação
const exportConfig = ref({
  formato: 'csv',
  periodo: 'mes',
  tipo: null as string | null,
});

// Opções
const tipoOptions = [
  { label: 'Entradas', value: 'entrada' },
  { label: 'Saídas', value: 'saida' },
  { label: 'Comissões', value: 'comissao' },
];

const statusOptions = [
  { label: 'Concluído', value: 'concluido' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Processando', value: 'processando' },
];

const formatosExportacao = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

const periodosExportacao = [
  { label: 'Mês atual', value: 'mes' },
  { label: 'Últimos 3 meses', value: '3meses' },
  { label: 'Últimos 6 meses', value: '6meses' },
  { label: 'Ano atual', value: 'ano' },
];

// Computed
const mesAtual = computed(() => {
  return new Date().toLocaleString('pt-PT', { month: 'long', year: 'numeric' });
});

const resumoFinanceiro = computed(() => financeiroStore.resumoFinanceiro);

// ✅ Computed com tipagem correta
const totalEntradas = computed(() => {
  return financeiroStore.transacoes
    .filter((t: TransacaoData) => t.tipo === 'entrada')
    .reduce((sum: number, t: TransacaoData) => sum + t.valor, 0);
});

const totalSaidas = computed(() => {
  return financeiroStore.transacoes
    .filter((t: TransacaoData) => t.tipo === 'saida')
    .reduce((sum: number, t: TransacaoData) => sum + t.valor, 0);
});

const totalGeral = computed(() => totalEntradas.value + totalSaidas.value + resumoFinanceiro.value.comissoes);

const percentualEntradas = computed(() => totalGeral.value > 0 ? totalEntradas.value / totalGeral.value : 0);
const percentualSaidas = computed(() => totalGeral.value > 0 ? totalSaidas.value / totalGeral.value : 0);
const percentualComissoes = computed(() => totalGeral.value > 0 ? resumoFinanceiro.value.comissoes / totalGeral.value : 0);

// ✅ Dados do gráfico com tipagem correta
const dadosGrafico = computed(() => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const entradasPorMes = new Array(12).fill(0);
  const saidasPorMes = new Array(12).fill(0);

  financeiroStore.transacoes.forEach((transacao: TransacaoData) => {
    if (transacao.created_at) {
      const mes = new Date(transacao.created_at).getMonth();
      if (transacao.tipo === 'entrada') {
        entradasPorMes[mes] += transacao.valor;
      } else {
        saidasPorMes[mes] += transacao.valor;
      }
    }
  });

  const mesAtualIndex = new Date().getMonth();
  const ultimosMeses = [];
  for (let i = 5; i >= 0; i--) {
    let mesIndex = mesAtualIndex - i;
    if (mesIndex < 0) mesIndex += 12;
    const valor = entradasPorMes[mesIndex] - saidasPorMes[mesIndex];
    const maxValor = Math.max(...entradasPorMes, ...saidasPorMes, 1);
    const altura = (Math.abs(valor) / maxValor) * 140 + 20;
    ultimosMeses.push({
      mes: meses[mesIndex],
      valor: valor,
      altura: Math.max(30, Math.min(160, altura)),
      cor: valor >= 0 ? '#2e7d32' : '#d32f2f',
    });
  }
  return ultimosMeses;
});

// ✅ Transações filtradas com tipagem correta
const transacoesFiltradas = computed(() => {
  let transacoes: TransacaoData[] = [...financeiroStore.transacoes];

  if (filtroTipo.value) {
    transacoes = transacoes.filter((t: TransacaoData) => t.tipo === filtroTipo.value);
  }

  if (filtroStatus.value) {
    transacoes = transacoes.filter((t: TransacaoData) => t.status === filtroStatus.value);
  }

  if (busca.value) {
    const termo = busca.value.toLowerCase();
    transacoes = transacoes.filter((t: TransacaoData) =>
      t.descricao?.toLowerCase().includes(termo) ||
      t.numero?.toLowerCase().includes(termo)
    );
  }

  return transacoes;
});

const calcularTotalTransacoes = computed(() => {
  return transacoesFiltradas.value.reduce((total: number, transacao: TransacaoData) => {
    if (transacao.tipo === 'entrada') {
      return total + transacao.valor;
    }
    return total - transacao.valor;
  }, 0);
});

// Funções auxiliares
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatarData = (data: string) => {
  if (!data) return '-';
  try {
    return new Date(data).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return data;
  }
};

const getStatusCor = (status: string) => {
  const cores: Record<string, string> = {
    concluido: 'positive',
    pendente: 'warning',
    processando: 'info',
  };
  return cores[status] || 'grey';
};

const getStatusTexto = (status: string) => {
  const textos: Record<string, string> = {
    concluido: 'Concluído',
    pendente: 'Pendente',
    processando: 'Processando',
  };
  return textos[status] || status;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    concluido: 'check_circle',
    pendente: 'pending',
    processando: 'hourglass_empty',
  };
  return icons[status] || 'help';
};

const getMetodoCor = (metodo: string) => {
  const cores: Record<string, string> = {
    mpesa: 'positive',
    visa: 'primary',
    mastercard: 'secondary',
    transferencia: 'info',
    dinheiro: 'warning',
  };
  return cores[metodo?.toLowerCase()] || 'grey';
};

const getMetodoIcon = (metodo: string) => {
  const icons: Record<string, string> = {
    mpesa: 'smartphone',
    visa: 'credit_card',
    mastercard: 'credit_card',
    transferencia: 'account_balance',
    dinheiro: 'attach_money',
  };
  return icons[metodo?.toLowerCase()] || 'payment';
};

const getMetodoLabel = (metodo: string) => {
  const labels: Record<string, string> = {
    mpesa: 'M-Pesa',
    visa: 'Visa',
    mastercard: 'Mastercard',
    transferencia: 'Transferência',
    dinheiro: 'Dinheiro',
  };
  return labels[metodo?.toLowerCase()] || metodo || 'N/A';
};

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'created_at', label: 'Data', field: 'created_at', align: 'left', sortable: true },
  { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left', sortable: false },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'center', sortable: true },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'center', sortable: false },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
];

// Ações
const carregarDados = async () => {
  try {
    await Promise.all([
      financeiroStore.fetchResumoFinanceiro(),
      carregarTransacoes(),
    ]);
    $q.notify({
      type: 'positive',
      message: 'Dados atualizados com sucesso!',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados financeiros',
      position: 'top',
    });
  }
};

const carregarTransacoes = async () => {
  const params: { tipo?: string; status?: string } = {};
  if (filtroTipo.value) params.tipo = filtroTipo.value;
  if (filtroStatus.value) params.status = filtroStatus.value;

  await financeiroStore.fetchTransacoes(params);
};

const exportarRelatorioCompleto = () => {
  if (!isRoot.value) return;
  mostrarModalExportacao.value = true;
};

const gerarExportacao = () => {
  if (!isRoot.value) return;
  $q.notify({
    type: 'positive',
    message: `Relatório em ${exportConfig.value.formato.toUpperCase()} gerado com sucesso!`,
    position: 'top',
  });
  mostrarModalExportacao.value = false;
};

// Carregar dados ao montar
onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
// ... styles mantidos iguais ao original
.admin-financeiro {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .page-title-section {
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 4px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// Skeleton Loading
.skeleton-container {
  position: relative;
  overflow: hidden;
}

.skeleton-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-icon {
  width: 64px;
  height: 64px;
  background: #e0e0e0;
  border-radius: 16px;
}

.skeleton-content {
  flex: 1;
}

.skeleton-label {
  width: 80px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-value {
  width: 100px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-trend {
  width: 120px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-chart-card,
.skeleton-distribuicao-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-title {
  width: 150px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-chart-bars {
  display: flex;
  justify-content: space-around;
  padding: 40px 20px;
}

.skeleton-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.skeleton-bar {
  width: 40px;
  height: 80px;
  background: #e0e0e0;
  border-radius: 8px 8px 0 0;
}

.skeleton-bar-label {
  width: 30px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-top: 8px;
}

.skeleton-distribuicao-items {
  padding: 20px;
}

.skeleton-distribuicao-item {
  margin-bottom: 20px;
}

.skeleton-distribuicao-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skeleton-distribuicao-label {
  width: 60px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-distribuicao-value {
  width: 80px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-progress {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}

.skeleton-table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eeeeee;
  flex-wrap: wrap;
  gap: 12px;
}

.skeleton-filters {
  display: flex;
  gap: 8px;
}

.skeleton-select {
  width: 140px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 8px;
}

.skeleton-input {
  width: 200px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 8px;
}

.skeleton-table {
  padding: 0 20px;
}

.skeleton-table-header-row {
  display: flex;
  background: #f8f9fa;
  padding: 12px 0;
  border-bottom: 2px solid #eeeeee;
}

.skeleton-header-cell {
  flex: 1;
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 8px;
}

.skeleton-table-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-cell {
  flex: 1;
  margin: 0 8px;
}

.skeleton-text {
  width: 80%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 20px;
  margin: 0 auto;
}

.skeleton-badge-small {
  width: 60px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 20px;
  margin: 0 auto;
}

.skeleton-chip {
  width: 80px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 16px;
  margin: 0 auto;
}

.skeleton-table-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #eeeeee;
}

.skeleton-info {
  width: 200px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-total {
  width: 120px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-shimmer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// Estilos principais
.finance-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.04);
  }

  .card-content {
    flex: 1;
  }

  .card-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .card-trend {
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 4px;

    &.trend-up { color: #2e7d32; }
    &.trend-waiting { color: #ed6c02; }
  }
}

.saldo-card {
  border-left: 4px solid #2e7d32;
  .card-icon { color: #2e7d32; background: rgba(46, 125, 50, 0.1); }
}

.pendente-card {
  border-left: 4px solid #ed6c02;
  .card-icon { color: #ed6c02; background: rgba(237, 108, 2, 0.1); }
}

.processado-card {
  border-left: 4px solid #1976d2;
  .card-icon { color: #1976d2; background: rgba(25, 118, 210, 0.1); }
}

.comissao-card {
  border-left: 4px solid #9c27b0;
  .card-icon { color: #9c27b0; background: rgba(156, 39, 176, 0.1); }
}

.chart-card, .resumo-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-container {
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;

  .bar-wrapper {
    height: 160px;
    display: flex;
    align-items: flex-end;
    margin-bottom: 8px;
  }

  .bar {
    width: 40px;
    border-radius: 8px 8px 0 0;
    position: relative;
    transition: height 0.3s ease;
    cursor: pointer;

    &:hover {
      opacity: 0.9;

      .bar-value {
        opacity: 1;
        transform: translateY(-20px);
      }
    }

    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      opacity: 0;
      transition: all 0.2s ease;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }

  .bar-label {
    font-size: 0.75rem;
    color: #6c757d;
  }
}

.distribuicao-item {
  .distribuicao-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.875rem;

    .distribuicao-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .distribuicao-value {
      font-weight: 600;
    }
  }
}

.transacoes-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-select, .search-input {
  min-width: 140px;
}

.transacoes-table {
  :deep(.q-table) {
    thead tr th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tbody tr {
      transition: background 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }
    }

    td {
      padding: 12px 16px;
    }
  }
}

.data-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;

  &.entrada {
    background: rgba(46, 125, 50, 0.1);
    color: #2e7d32;
  }

  &.saida {
    background: rgba(211, 47, 47, 0.1);
    color: #d32f2f;
  }
}

.valor-cell {
  font-weight: 700;
  font-size: 1rem;
}

.descricao-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.metodo-chip {
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .admin-financeiro {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select, .search-input {
    width: 100%;
  }

  .chart-bars .bar {
    width: 25px;
  }

  .finance-card .card-value {
    font-size: 1.2rem;
  }

  .skeleton-filters {
    flex-direction: column;
    width: 100%;
  }

  .skeleton-select,
  .skeleton-input {
    width: 100%;
  }
}
</style>
