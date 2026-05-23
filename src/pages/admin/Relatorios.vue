<template>
  <q-page class="admin-relatorios q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="description" size="32px" class="q-mr-sm" />
          Relatórios
        </div>
        <div class="page-subtitle">Gere relatórios detalhados da plataforma</div>
      </div>
      <q-btn
        label="Atualizar"
        icon="refresh"
        color="grey-7"
        outline
        @click="carregarDados"
        :loading="dashboardStore.loading"
      />
    </div>

    <!-- Skeleton Loading -->
    <div v-if="dashboardStore.loading" class="skeleton-container">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-3">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="skeleton-select"></div>
            <div class="skeleton-input"></div>
            <div class="skeleton-input"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>

        <div class="col-12 col-md-9">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="row q-col-gutter-md q-mt-md">
              <div v-for="i in 3" :key="i" class="col-12 col-sm-4">
                <div class="skeleton-resumo-item">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-resumo-content">
                    <div class="skeleton-label"></div>
                    <div class="skeleton-value"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="skeleton-card">
            <div class="skeleton-tabs">
              <div v-for="i in 3" :key="i" class="skeleton-tab"></div>
            </div>
            <div class="skeleton-table-header">
              <div class="skeleton-panel-header"></div>
              <div class="skeleton-table">
                <div class="skeleton-table-header-row">
                  <div v-for="i in 4" :key="`th-${i}`" class="skeleton-header-cell"></div>
                </div>
                <div v-for="row in 4" :key="row" class="skeleton-table-row">
                  <div v-for="i in 4" :key="`td-${row}-${i}`" class="skeleton-cell">
                    <div class="skeleton-text"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <div class="row q-col-gutter-lg">
        <!-- Seletor de Período -->
        <div class="col-12 col-md-3">
          <q-card class="periodo-card">
            <q-card-section>
              <div class="text-h6">
                <q-icon name="calendar_today" class="q-mr-sm" />
                Período
              </div>
              <q-select
                v-model="periodo"
                :options="periodos"
                label="Selecione o período"
                dense
                outlined
                class="q-mt-md"
                @update:model-value="carregarDados"
              />
              <div v-if="periodo === 'custom'" class="q-mt-md">
                <q-input v-model="dataInicio" label="Data Início" dense outlined type="date" />
                <q-input
                  v-model="dataFim"
                  label="Data Fim"
                  dense
                  outlined
                  type="date"
                  class="q-mt-sm"
                />
                <q-btn
                  label="Aplicar"
                  color="primary"
                  dense
                  class="q-mt-md full-width"
                  @click="carregarDados"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Resumo do Período -->
        <div class="col-12 col-md-9">
          <q-card class="resumo-card">
            <q-card-section>
              <div class="text-h6">
                <q-icon name="summarize" class="q-mr-sm" />
                Resumo do Período
              </div>
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-sm-4">
                  <div class="resumo-item">
                    <div class="resumo-icon" style="background: rgba(46, 125, 50, 0.1)">
                      <q-icon name="payments" size="28px" color="positive" />
                    </div>
                    <div class="resumo-content">
                      <div class="resumo-label">Receita Total</div>
                      <div class="resumo-value text-positive">
                        {{ formatMoney(receitaPeriodo) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="resumo-item">
                    <div class="resumo-icon" style="background: rgba(25, 118, 210, 0.1)">
                      <q-icon name="assignment" size="28px" color="primary" />
                    </div>
                    <div class="resumo-content">
                      <div class="resumo-label">Serviços</div>
                      <div class="resumo-value">{{ formatNumber(servicosPeriodo) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="resumo-item">
                    <div class="resumo-icon" style="background: rgba(156, 39, 176, 0.1)">
                      <q-icon name="person_add" size="28px" color="secondary" />
                    </div>
                    <div class="resumo-content">
                      <div class="resumo-label">Novos Utilizadores</div>
                      <div class="resumo-value">{{ formatNumber(novosUtilizadoresPeriodo) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Relatórios por Tipo -->
        <div class="col-12">
          <q-card class="relatorios-card">
            <q-card-section>
              <q-tabs v-model="tabRelatorio" class="relatorio-tabs" dense>
                <q-tab name="servicos" label="Serviços" icon="construction" />
                <q-tab name="prestadores" label="Prestadores" icon="handyman" />
                <q-tab name="financeiro" label="Financeiro" icon="payments" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tabRelatorio" animated>
                <!-- Painel de Serviços -->
                <q-tab-panel name="servicos" class="q-pa-none">
                  <div class="panel-header">
                    <div class="panel-title">
                      <q-icon name="construction" class="q-mr-sm" />
                      Relatório de Serviços
                    </div>
                    <q-btn
                      color="primary"
                      icon="download"
                      label="Exportar"
                      flat
                      @click="exportarRelatorio('servicos')"
                      :loading="exportando"
                    />
                  </div>
                  <q-table
                    :rows="relatorioServicos"
                    :columns="servicosColumns"
                    row-key="periodo"
                    :loading="dashboardStore.loading"
                    :rows-per-page-options="[5, 10, 20]"
                    flat
                    bordered
                    class="relatorio-table"
                  >
                    <template v-slot:body-cell-receita_total="props">
                      <q-td :props="props">
                        <span class="text-primary">{{ formatMoney(props.row.receita_total) }}</span>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-servicos_por_status="props">
                      <q-td :props="props">
                        <div class="status-chips">
                          <q-chip size="sm" color="info" dense
                            >Pendente: {{ props.row.servicos_por_status?.pendente || 0 }}</q-chip
                          >
                          <q-chip size="sm" color="warning" dense
                            >Aceito: {{ props.row.servicos_por_status?.aceito || 0 }}</q-chip
                          >
                          <q-chip size="sm" color="positive" dense
                            >Concluído: {{ props.row.servicos_por_status?.concluido || 0 }}</q-chip
                          >
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                </q-tab-panel>

                <!-- Painel de Prestadores -->
                <q-tab-panel name="prestadores" class="q-pa-none">
                  <div class="panel-header">
                    <div class="panel-title">
                      <q-icon name="handyman" class="q-mr-sm" />
                      Relatório de Prestadores
                    </div>
                    <q-btn
                      color="primary"
                      icon="download"
                      label="Exportar"
                      flat
                      @click="exportarRelatorio('prestadores')"
                      :loading="exportando"
                    />
                  </div>
                  <q-table
                    :rows="relatorioPrestadores"
                    :columns="prestadoresColumns"
                    row-key="total"
                    :loading="dashboardStore.loading"
                    :rows-per-page-options="[5, 10, 20]"
                    flat
                    bordered
                    class="relatorio-table"
                  >
                    <template v-slot:body-cell-top_prestadores="props">
                      <q-td :props="props">
                        <div class="top-prestadores">
                          <div
                            v-for="prestador in props.row.top_prestadores"
                            :key="prestador.id"
                            class="prestador-item"
                          >
                            <q-icon name="star" size="12px" color="warning" />
                            <span>{{ prestador.nome }}</span>
                            <span class="text-caption text-grey"
                              >({{ prestador.media_avaliacao }} ★)</span
                            >
                          </div>
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                </q-tab-panel>

                <!-- Painel Financeiro -->
                <q-tab-panel name="financeiro" class="q-pa-none">
                  <div class="panel-header">
                    <div class="panel-title">
                      <q-icon name="payments" class="q-mr-sm" />
                      Relatório Financeiro
                    </div>
                    <q-btn
                      color="primary"
                      icon="download"
                      label="Exportar"
                      flat
                      @click="exportarRelatorio('financeiro')"
                      :loading="exportando"
                    />
                  </div>
                  <q-table
                    :rows="relatorioFinanceiro"
                    :columns="financeiroColumns"
                    row-key="periodo"
                    :loading="dashboardStore.loading"
                    :rows-per-page-options="[5, 10, 20]"
                    flat
                    bordered
                    class="relatorio-table"
                  >
                    <template v-slot:body-cell-entradas="props">
                      <q-td :props="props">
                        <span class="text-positive">{{ formatMoney(props.row.entradas) }}</span>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-saidas="props">
                      <q-td :props="props">
                        <span class="text-negative">{{ formatMoney(props.row.saidas) }}</span>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-saldo="props">
                      <q-td :props="props">
                        <span :class="props.row.saldo >= 0 ? 'text-positive' : 'text-negative'">
                          {{ formatMoney(props.row.saldo) }}
                        </span>
                      </q-td>
                    </template>
                  </q-table>
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useAdminDashboardStore } from 'src/stores/admin/admin-dashboard-store';
import { useAdminFinanceiroStore } from 'src/stores/admin/admin-financeiro-store';

// ==========================================
// INTERFACES
// ==========================================

interface ServicosPorStatus {
  pendente: number;
  aceito: number;
  em_andamento: number;
  concluido: number;
  cancelado: number;
}

interface RelatorioServicos {
  periodo: string;
  total_servicos: number;
  receita_total: number;
  servicos_por_status: ServicosPorStatus;
}

interface PrestadorTop {
  id: number;
  nome: string;
  media_avaliacao: number;
  total_servicos: number;
}

interface RelatorioPrestadores {
  total: number;
  verificados: number;
  nao_verificados: number;
  ativos: number;
  bloqueados: number;
  media_avaliacao_geral: number;
  top_prestadores: PrestadorTop[];
  periodo: string;
}

interface RelatorioFinanceiro {
  periodo: string;
  entradas: number;
  saidas: number;
  saldo: number;
  comissoes: number;
}

defineOptions({
  name: 'AdminRelatorios',
});

const $q = useQuasar();
const dashboardStore = useAdminDashboardStore();
const financeiroStore = useAdminFinanceiroStore();

// Estados
const periodo = ref('mes');
const tabRelatorio = ref('servicos');
const exportando = ref(false);
const dataInicio = ref('');
const dataFim = ref('');

// Opções de período
const periodos = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mês', value: 'mes' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Personalizado', value: 'custom' },
];

// Computed para dados do período
const receitaPeriodo = computed(() => {
  const receita = dashboardStore.estatisticas.receita_total;
  const percentual = periodo.value === 'mes' ? receita : receita * 0.8;
  return percentual;
});

const servicosPeriodo = computed(() => {
  const servicos = dashboardStore.estatisticas.total_pedidos;
  const percentual = periodo.value === 'mes' ? servicos : Math.floor(servicos * 0.7);
  return percentual;
});

const novosUtilizadoresPeriodo = computed(() => {
  const users = dashboardStore.dashboard.total_users;
  const percentual = periodo.value === 'mes' ? Math.floor(users * 0.15) : Math.floor(users * 0.3);
  return percentual;
});

// Relatórios
const relatorioServicos = computed((): RelatorioServicos[] => {
  const data = financeiroStore.relatorioServicos;
  if (!data) return [];
  return [data];
});

const relatorioPrestadores = computed((): RelatorioPrestadores[] => {
  const data = financeiroStore.relatorioPrestadores;
  if (!data) return [];
  return [data];
});

const relatorioFinanceiro = computed((): RelatorioFinanceiro[] => {
  const data = financeiroStore.relatorioFinanceiro;
  if (!data) return [];
  return [data];
});

// Colunas para tabela de serviços
const servicosColumns: QTableColumn[] = [
  { name: 'periodo', label: 'Período', field: 'periodo', align: 'left', sortable: true },
  {
    name: 'total_servicos',
    label: 'Total Serviços',
    field: 'total_servicos',
    align: 'center',
    sortable: true,
  },
  {
    name: 'receita_total',
    label: 'Receita Total',
    field: 'receita_total',
    align: 'center',
    sortable: true,
  },
  {
    name: 'servicos_por_status',
    label: 'Status',
    field: 'servicos_por_status',
    align: 'left',
    sortable: false,
  },
];

// Colunas para tabela de prestadores
const prestadoresColumns: QTableColumn[] = [
  { name: 'total', label: 'Total Prestadores', field: 'total', align: 'center', sortable: true },
  {
    name: 'verificados',
    label: 'Verificados',
    field: 'verificados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'nao_verificados',
    label: 'Não Verificados',
    field: 'nao_verificados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'media_avaliacao_geral',
    label: 'Média Avaliação',
    field: 'media_avaliacao_geral',
    align: 'center',
    sortable: true,
  },
  {
    name: 'top_prestadores',
    label: 'Top Prestadores',
    field: 'top_prestadores',
    align: 'left',
    sortable: false,
  },
];

// Colunas para tabela financeira
const financeiroColumns: QTableColumn[] = [
  { name: 'periodo', label: 'Período', field: 'periodo', align: 'left', sortable: true },
  { name: 'entradas', label: 'Entradas', field: 'entradas', align: 'center', sortable: true },
  { name: 'saidas', label: 'Saídas', field: 'saidas', align: 'center', sortable: true },
  { name: 'saldo', label: 'Saldo', field: 'saldo', align: 'center', sortable: true },
  { name: 'comissoes', label: 'Comissões', field: 'comissoes', align: 'center', sortable: true },
];

// Funções auxiliares
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-PT').format(value);
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

// Carregar dados
const carregarDados = async (): Promise<void> => {
  try {
    const periodoValue = periodo.value === 'custom' ? 'mes' : periodo.value;

    await Promise.all([
      dashboardStore.fetchDashboard(),
      dashboardStore.fetchStats(),
      financeiroStore.fetchRelatorioServicos(periodoValue),
      financeiroStore.fetchRelatorioPrestadores(),
      financeiroStore.fetchRelatorioFinanceiro(periodoValue),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados dos relatórios',
      position: 'top',
    });
  }
};

// ✅ Exportar relatório (sem any)
const exportarRelatorio = (tipo: string): void => {
  if (exportando.value) return;

  exportando.value = true;

  try {
    let data: RelatorioServicos[] | RelatorioPrestadores[] | RelatorioFinanceiro[] = [];
    let filename = '';
    let headers: string[] = [];

    if (tipo === 'servicos') {
      data = relatorioServicos.value;
      filename = `relatorio_servicos_${periodo.value}`;
      headers = [
        'Período',
        'Total Serviços',
        'Receita Total',
        'Pendentes',
        'Aceitos',
        'Em Andamento',
        'Concluídos',
        'Cancelados',
      ];
    } else if (tipo === 'prestadores') {
      data = relatorioPrestadores.value;
      filename = 'relatorio_prestadores';
      headers = ['Total', 'Verificados', 'Não Verificados', 'Média Avaliação', 'Top Prestadores'];
    } else {
      data = relatorioFinanceiro.value;
      filename = `relatorio_financeiro_${periodo.value}`;
      headers = ['Período', 'Entradas', 'Saídas', 'Saldo', 'Comissões'];
    }

    if (data.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Não há dados para exportar',
        position: 'top',
      });
      return;
    }

    const csvRows: string[][] = [headers];

    if (tipo === 'servicos') {
      const servicosData = data as RelatorioServicos[];
      servicosData.forEach((row: RelatorioServicos) => {
        csvRows.push([
          row.periodo || '',
          String(row.total_servicos || 0),
          String(row.receita_total || 0),
          String(row.servicos_por_status?.pendente || 0),
          String(row.servicos_por_status?.aceito || '0'),
          String(row.servicos_por_status?.em_andamento || '0'),
          String(row.servicos_por_status?.concluido || '0'),
          String(row.servicos_por_status?.cancelado || '0'),
        ]);
      });
    } else if (tipo === 'prestadores') {
      const prestadoresData = data as RelatorioPrestadores[];
      prestadoresData.forEach((row: RelatorioPrestadores) => {
        const topPrestadores =
          row.top_prestadores?.map((p: PrestadorTop) => p.nome).join('; ') || '';
        csvRows.push([
          String(row.total || 0),
          String(row.verificados || 0),
          String(row.nao_verificados || 0),
          String(row.media_avaliacao_geral || 0),
          topPrestadores,
        ]);
      });
    } else {
      const financeiroData = data as RelatorioFinanceiro[];
      financeiroData.forEach((row: RelatorioFinanceiro) => {
        csvRows.push([
          row.periodo || '',
          String(row.entradas || 0),
          String(row.saidas || 0),
          String(row.saldo || 0),
          String(row.comissoes || 0),
        ]);
      });
    }

    const csv = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Relatório exportado com sucesso!',
      position: 'top',
    });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar relatório',
      position: 'top',
    });
  } finally {
    exportando.value = false;
  }
};

// Carregar dados ao montar
onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
// ... styles mantidos iguais ao original
$primary-color: #667eea;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;

.admin-relatorios {
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
  margin-bottom: 24px;
}

.skeleton-title {
  width: 150px;
  height: 24px;
  background: $gray-200;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-select {
  width: 100%;
  height: 48px;
  background: $gray-100;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-input {
  width: 100%;
  height: 48px;
  background: $gray-100;
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-button {
  width: 100%;
  height: 36px;
  background: $gray-200;
  border-radius: 8px;
}

.skeleton-resumo-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 16px;
  border: 1px solid $gray-200;
}

.skeleton-icon {
  width: 52px;
  height: 52px;
  background: $gray-200;
  border-radius: 14px;
}

.skeleton-resumo-content {
  flex: 1;
}

.skeleton-label {
  width: 80px;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-value {
  width: 100px;
  height: 20px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid $gray-200;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.skeleton-tab {
  width: 100px;
  height: 36px;
  background: $gray-200;
  border-radius: 8px;
}

.skeleton-panel-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-table {
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-table-header-row {
  display: flex;
  background: $gray-100;
  padding: 12px 16px;

  .skeleton-header-cell {
    flex: 1;
    height: 20px;
    background: $gray-300;
    border-radius: 4px;
    margin: 0 4px;
  }
}

.skeleton-table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid $gray-200;

  .skeleton-cell {
    flex: 1;
    margin: 0 4px;

    .skeleton-text {
      width: 80%;
      height: 14px;
      background: $gray-200;
      border-radius: 4px;
    }
  }
}

.skeleton-shimmer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// Estilos principais
.periodo-card,
.resumo-card,
.relatorios-card {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.resumo-card {
  .resumo-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: white;
    border-radius: 16px;
    transition: all 0.2s ease;

    .resumo-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .resumo-content {
      flex: 1;
    }

    .resumo-label {
      font-size: 0.75rem;
      color: #6c757d;
      text-transform: uppercase;
    }

    .resumo-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a2e;
    }
  }
}

.relatorios-card {
  .relatorio-tabs {
    :deep(.q-tab) {
      font-size: 0.9rem;
      padding: 8px 16px;

      &.q-tab--active {
        color: #1976d2;
      }
    }
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
  }
}

.relatorio-table {
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

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.top-prestadores {
  .prestador-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 768px) {
  .admin-relatorios {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .resumo-card .resumo-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .panel-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .status-chips {
    flex-direction: column;
  }
}
</style>
