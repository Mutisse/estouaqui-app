<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Relatórios e Analytics</h1>
      <div class="header-actions">
        <div class="date-range">
          <q-input
            v-model="filtros.data_inicio"
            label="Data Início"
            type="date"
            dense
            outlined
            class="date-input"
          />
          <q-input
            v-model="filtros.data_fim"
            label="Data Fim"
            type="date"
            dense
            outlined
            class="date-input"
          />
        </div>
        <q-btn-dropdown flat color="primary" icon="download" label="Exportar">
          <q-list>
            <q-item clickable v-close-popup @click="exportar('excel')">
              <q-item-section avatar><q-icon name="table_chart" /></q-item-section>
              <q-item-section>Exportar para Excel</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportar('pdf')">
              <q-item-section avatar><q-icon name="picture_as_pdf" /></q-item-section>
              <q-item-section>Exportar para PDF</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn color="primary" icon="refresh" @click="carregarTodosDados" :loading="isLoading" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando dados dos relatórios...</p>
    </div>

    <div v-else>
      <!-- ==================== SEÇÃO 1: RESUMO GERAL ==================== -->
      <div class="section">
        <div class="section-header">
          <h2>📊 Resumo Geral</h2>
          <q-icon name="dashboard" size="24px" color="primary" />
        </div>
        <div class="kpi-grid">
          <KpiCard
            label="Total Pedidos"
            :value="dadosPedidos?.total || 0"
            icon="receipt_long"
            iconBg="#667EEA20"
            iconColor="#667EEA"
          />
          <KpiCard
            label="Faturamento Total"
            :value="dadosFinanceiro?.faturamento_total || 0"
            icon="payments"
            format="currency"
            iconBg="#10B98120"
            iconColor="#10B981"
          />
          <KpiCard
            label="Prestadores Ativos"
            :value="dadosPrestadores?.ativos || 0"
            icon="handyman"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
          />
          <KpiCard
            label="Total Clientes"
            :value="dadosClientes?.total_clientes || 0"
            icon="people"
            iconBg="#8B5CF620"
            iconColor="#8B5CF6"
          />
          <KpiCard
            label="Ticket Médio"
            :value="dadosPedidos?.valor_medio || 0"
            icon="trending_up"
            format="currency"
            iconBg="#EC489920"
            iconColor="#EC4899"
          />
          <KpiCard
            label="Avaliação Média"
            :value="dadosPrestadores?.media_avaliacao_global || 0"
            icon="star"
            format="number"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
          />
        </div>
      </div>

      <!-- ==================== SEÇÃO 2: PEDIDOS ==================== -->
      <div class="section">
        <div class="section-header">
          <h2>📋 Análise de Pedidos</h2>
          <q-icon name="receipt_long" size="24px" color="primary" />
        </div>

        <!-- KPIs de Pedidos -->
        <div class="kpi-grid-small">
          <KpiCard
            label="Pendentes"
            :value="dadosPedidos?.por_status?.pendente || 0"
            icon="pending"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
            small
          />
          <KpiCard
            label="Aceitos"
            :value="dadosPedidos?.por_status?.aceito || 0"
            icon="check_circle"
            iconBg="#3B82F620"
            iconColor="#3B82F6"
            small
          />
          <KpiCard
            label="Em Andamento"
            :value="dadosPedidos?.por_status?.em_andamento || 0"
            icon="build"
            iconBg="#8B5CF620"
            iconColor="#8B5CF6"
            small
          />
          <KpiCard
            label="Concluídos"
            :value="dadosPedidos?.por_status?.concluido || 0"
            icon="verified"
            iconBg="#10B98120"
            iconColor="#10B981"
            small
          />
          <KpiCard
            label="Cancelados"
            :value="dadosPedidos?.por_status?.cancelado || 0"
            icon="cancel"
            iconBg="#EF444420"
            iconColor="#EF4444"
            small
          />
        </div>

        <!-- Gráficos de Pedidos - Layout 2 colunas -->
        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="status-chart"
            title="Distribuição por Status"
            icon="pie_chart"
            iconColor="#667EEA"
            type="doughnut"
            :labels="['Pendente', 'Aceito', 'Em Andamento', 'Concluído', 'Cancelado']"
            :datasets="[
              {
                label: 'Pedidos',
                data: [
                  dadosPedidos?.por_status?.pendente || 0,
                  dadosPedidos?.por_status?.aceito || 0,
                  dadosPedidos?.por_status?.em_andamento || 0,
                  dadosPedidos?.por_status?.concluido || 0,
                  dadosPedidos?.por_status?.cancelado || 0,
                ],
                backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
              },
            ]"
          />

          <ChartCard
            chart-id="pedidos-dia-chart"
            title="Pedidos por Dia"
            icon="show_chart"
            iconColor="#10B981"
            type="line"
            :labels="dadosPedidos?.pedidos_por_dia?.map((p) => formatarDataCurta(p.data)) || []"
            :datasets="[
              {
                label: 'Pedidos',
                data: dadosPedidos?.pedidos_por_dia?.map((p) => p.total) || [],
                borderColor: '#667EEA',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
              },
            ]"
          />
        </div>

        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="categoria-chart"
            title="Pedidos por Categoria"
            icon="category"
            iconColor="#8B5CF6"
            type="bar"
            :labels="dadosPedidos?.pedidos_por_categoria?.map((c) => c.nome) || []"
            :datasets="[
              {
                label: 'Quantidade',
                data: dadosPedidos?.pedidos_por_categoria?.map((c) => c.total) || [],
                backgroundColor: '#667EEA',
              },
            ]"
          />

          <ChartCard
            chart-id="prestador-chart"
            title="Top 5 Prestadores"
            icon="handyman"
            iconColor="#F59E0B"
            type="bar"
            :labels="dadosPedidos?.pedidos_por_prestador?.slice(0, 5).map((p) => p.nome) || []"
            :datasets="[
              {
                label: 'Pedidos',
                data: dadosPedidos?.pedidos_por_prestador?.slice(0, 5).map((p) => p.total) || [],
                backgroundColor: '#10B981',
              },
            ]"
          />
        </div>

        <!-- Tabela Top Clientes -->
        <div class="table-card" v-if="dadosPedidos?.top_clientes?.length">
          <div class="table-header">
            <h3>🏆 Top Clientes</h3>
          </div>
          <q-table
            :rows="dadosPedidos.top_clientes"
            :columns="topClientesColumns"
            row-key="id"
            flat
            dense
            bordered
          />
        </div>
      </div>

      <!-- ==================== SEÇÃO 3: FINANCEIRO ==================== -->
      <div class="section">
        <div class="section-header">
          <h2>💰 Análise Financeira</h2>
          <q-icon name="payments" size="24px" color="primary" />
        </div>

        <!-- KPIs Financeiros -->
        <div class="kpi-grid">
          <KpiCard
            label="Faturamento Período"
            :value="dadosFinanceiro?.faturamento_periodo || 0"
            icon="trending_up"
            format="currency"
            iconBg="#10B98120"
            iconColor="#10B981"
          />
          <KpiCard
            label="Comissões"
            :value="dadosFinanceiro?.comissoes_total || 0"
            icon="commission"
            format="currency"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
          />
          <KpiCard
            label="Pagamentos Pendentes"
            :value="dadosFinanceiro?.pagamentos_pendentes || 0"
            icon="pending"
            format="currency"
            iconBg="#EF444420"
            iconColor="#EF4444"
          />
          <KpiCard
            label="Faturamento Total"
            :value="dadosFinanceiro?.faturamento_total || 0"
            icon="account_balance"
            format="currency"
            iconBg="#667EEA20"
            iconColor="#667EEA"
          />
        </div>

        <!-- Gráficos Financeiros - Layout 2 colunas -->
        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="receita-dia-chart"
            title="Receita por Dia"
            icon="show_chart"
            iconColor="#10B981"
            type="line"
            :labels="dadosFinanceiro?.receita_por_dia?.map((r) => formatarDataCurta(r.data)) || []"
            :datasets="[
              {
                label: 'Receita (MZN)',
                data: dadosFinanceiro?.receita_por_dia?.map((r) => r.valor) || [],
                borderColor: '#667EEA',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
              },
            ]"
          />

          <ChartCard
            chart-id="receita-mes-chart"
            title="Receita por Mês"
            icon="calendar_month"
            iconColor="#8B5CF6"
            type="bar"
            :labels="dadosFinanceiro?.receita_por_mes?.map((r) => r.mes) || []"
            :datasets="[
              {
                label: 'Receita (MZN)',
                data: dadosFinanceiro?.receita_por_mes?.map((r) => r.valor) || [],
                backgroundColor: '#10B981',
              },
            ]"
          />
        </div>

        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="top-categorias-financeiro-chart"
            title="Top Categorias por Faturamento"
            icon="category"
            iconColor="#F59E0B"
            type="pie"
            :labels="dadosFinanceiro?.top_categorias?.map((c) => c.nome) || []"
            :datasets="[
              {
                label: 'Faturamento',
                data: dadosFinanceiro?.top_categorias?.map((c) => c.valor) || [],
                backgroundColor: [
                  '#667EEA',
                  '#10B981',
                  '#F59E0B',
                  '#EF4444',
                  '#8B5CF6',
                  '#EC4899',
                  '#06B6D4',
                ],
              },
            ]"
          />
          <div class="chart-placeholder"></div>
        </div>
      </div>

      <!-- ==================== SEÇÃO 4: PRESTADORES ==================== -->
      <div class="section">
        <div class="section-header">
          <h2>👨‍🔧 Análise de Prestadores</h2>
          <q-icon name="handyman" size="24px" color="primary" />
        </div>

        <!-- KPIs de Prestadores -->
        <div class="kpi-grid-small">
          <KpiCard
            label="Total"
            :value="dadosPrestadores?.total_prestadores || 0"
            icon="handyman"
            iconBg="#667EEA20"
            iconColor="#667EEA"
            small
          />
          <KpiCard
            label="Ativos"
            :value="dadosPrestadores?.ativos || 0"
            icon="check_circle"
            iconBg="#10B98120"
            iconColor="#10B981"
            small
          />
          <KpiCard
            label="Verificados"
            :value="dadosPrestadores?.verificados || 0"
            icon="verified"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
            small
          />
          <KpiCard
            label="Média Avaliação"
            :value="dadosPrestadores?.media_avaliacao_global || 0"
            icon="star"
            format="number"
            iconBg="#8B5CF620"
            iconColor="#8B5CF6"
            small
          />
        </div>

        <!-- Gráficos de Prestadores - Layout 2 colunas -->
        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="status-prestador-chart"
            title="Status dos Prestadores"
            icon="people"
            iconColor="#667EEA"
            type="doughnut"
            :labels="['Ativos', 'Inativos']"
            :datasets="[
              {
                label: 'Prestadores',
                data: [dadosPrestadores?.ativos || 0, dadosPrestadores?.inativos || 0],
                backgroundColor: ['#10B981', '#EF4444'],
              },
            ]"
          />

          <ChartCard
            chart-id="verificacao-chart"
            title="Verificação"
            icon="verified"
            iconColor="#F59E0B"
            type="doughnut"
            :labels="['Verificados', 'Não Verificados']"
            :datasets="[
              {
                label: 'Prestadores',
                data: [dadosPrestadores?.verificados || 0, dadosPrestadores?.nao_verificados || 0],
                backgroundColor: ['#667EEA', '#F59E0B'],
              },
            ]"
          />
        </div>

        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="prestadores-categoria-chart"
            title="Prestadores por Categoria"
            icon="category"
            iconColor="#8B5CF6"
            type="bar"
            :labels="dadosPrestadores?.prestadores_por_categoria?.map((c) => c.nome) || []"
            :datasets="[
              {
                label: 'Prestadores',
                data: dadosPrestadores?.prestadores_por_categoria?.map((c) => c.total) || [],
                backgroundColor: '#667EEA',
              },
            ]"
          />
        </div>

        <!-- Tabela Top Prestadores -->
        <div class="table-card" v-if="dadosPrestadores?.top_prestadores?.length">
          <div class="table-header">
            <h3>🏆 Top Prestadores</h3>
          </div>
          <q-table
            :rows="dadosPrestadores.top_prestadores"
            :columns="topPrestadoresColumns"
            row-key="id"
            flat
            dense
            bordered
          />
        </div>
      </div>

      <!-- ==================== SEÇÃO 5: CLIENTES ==================== -->
      <div class="section">
        <div class="section-header">
          <h2>👥 Análise de Clientes</h2>
          <q-icon name="people" size="24px" color="primary" />
        </div>

        <!-- KPIs de Clientes -->
        <div class="kpi-grid">
          <KpiCard
            label="Total Clientes"
            :value="dadosClientes?.total_clientes || 0"
            icon="people"
            iconBg="#667EEA20"
            iconColor="#667EEA"
          />
          <KpiCard
            label="Novos no Mês"
            :value="dadosClientes?.novos_mes || 0"
            icon="person_add"
            iconBg="#10B98120"
            iconColor="#10B981"
          />
          <KpiCard
            label="Ativos no Mês"
            :value="dadosClientes?.ativos_mes || 0"
            icon="check_circle"
            iconBg="#F59E0B20"
            iconColor="#F59E0B"
          />
        </div>

        <!-- Gráficos de Clientes - Layout 2 colunas -->
        <div class="charts-grid-2cols">
          <ChartCard
            chart-id="clientes-mes-chart"
            title="Novos Clientes por Mês"
            icon="trending_up"
            iconColor="#10B981"
            type="line"
            :labels="dadosClientes?.clientes_por_mes?.map((c) => c.mes) || []"
            :datasets="[
              {
                label: 'Novos Clientes',
                data: dadosClientes?.clientes_por_mes?.map((c) => c.total) || [],
                borderColor: '#667EEA',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
              },
            ]"
          />
        </div>

        <!-- Tabela Top Clientes -->
        <div class="table-card" v-if="dadosClientes?.top_clientes?.length">
          <div class="table-header">
            <h3>🏆 Top Clientes</h3>
          </div>
          <q-table
            :rows="dadosClientes.top_clientes"
            :columns="topClientesDetalhesColumns"
            row-key="id"
            flat
            dense
            bordered
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import {
  useAdminRelatoriosStore,
  type FiltrosRelatorios,
} from 'src/stores/admin/admin-relatorios-store';
import KpiCard from 'src/components/admin/KpiCard.vue';
import ChartCard from 'src/components/admin/ChartCard.vue';

defineOptions({ name: 'AdminRelatorios' });

const $q = useQuasar();
const relatoriosStore = useAdminRelatoriosStore();

const { isLoading, dadosPedidos, dadosFinanceiro, dadosPrestadores, dadosClientes } =
  storeToRefs(relatoriosStore);

const {
  carregarRelatorioPedidos,
  carregarRelatorioFinanceiro,
  carregarRelatorioPrestadores,
  carregarRelatorioClientes,
  exportarExcel,
  exportarPDF,
} = relatoriosStore;

// ✅ Função auxiliar para formatar data como YYYY-MM-DD
const formatarDataYMD = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

// ✅ Datas com valores garantidos
const hoje = new Date();
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

// ✅ Interface local para o filtro - com undefined explícito
interface FiltrosLocal {
  data_inicio: string;
  data_fim: string;
  tipo: string;
  categoria_id?: number | undefined;
  prestador_id?: number | undefined;
}

// ✅ Tipar corretamente o ref
const filtros = ref<FiltrosLocal>({
  data_inicio: formatarDataYMD(primeiroDiaMes),
  data_fim: formatarDataYMD(hoje),
  tipo: 'completo',
  categoria_id: undefined,
  prestador_id: undefined,
});

const topClientesColumns = [
  { name: 'nome', label: 'Cliente', field: 'nome', align: 'left' as const },
  { name: 'pedidos', label: 'Pedidos', field: 'pedidos', align: 'center' as const },
  {
    name: 'valor_total',
    label: 'Valor Total',
    field: 'valor_total',
    align: 'right' as const,
    format: (val: number) => formatMoney(val),
  },
];

const topPrestadoresColumns = [
  { name: 'nome', label: 'Prestador', field: 'nome', align: 'left' as const },
  { name: 'profissao', label: 'Profissão', field: 'profissao', align: 'left' as const },
  { name: 'total_pedidos', label: 'Pedidos', field: 'total_pedidos', align: 'center' as const },
  {
    name: 'faturamento',
    label: 'Faturamento',
    field: 'faturamento',
    align: 'right' as const,
    format: (val: number) => formatMoney(val),
  },
  {
    name: 'media_avaliacao',
    label: 'Avaliação',
    field: 'media_avaliacao',
    align: 'center' as const,
  },
];

const topClientesDetalhesColumns = [
  { name: 'nome', label: 'Cliente', field: 'nome', align: 'left' as const },
  { name: 'total_pedidos', label: 'Pedidos', field: 'total_pedidos', align: 'center' as const },
  {
    name: 'total_gasto',
    label: 'Total Gasto',
    field: 'total_gasto',
    align: 'right' as const,
    format: (val: number) => formatMoney(val),
  },
];

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const formatarDataCurta = (data: string): string => {
  if (!data) return '';
  const d = new Date(data);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

// ✅ Função para obter os filtros - removendo undefined
const obterFiltros = (): FiltrosRelatorios => {
  const result: FiltrosRelatorios = {
    data_inicio: filtros.value.data_inicio,
    data_fim: filtros.value.data_fim,
    tipo: filtros.value.tipo,
  };

  // ✅ Só adiciona categoria_id se for um número válido
  if (filtros.value.categoria_id !== undefined) {
    result.categoria_id = filtros.value.categoria_id;
  }

  // ✅ Só adiciona prestador_id se for um número válido
  if (filtros.value.prestador_id !== undefined) {
    result.prestador_id = filtros.value.prestador_id;
  }

  return result;
};

// ✅ Função para carregar todos os dados
const carregarTodosDados = (): void => {
  const filtrosAtuais = obterFiltros();

  Promise.all([
    carregarRelatorioPedidos(filtrosAtuais),
    carregarRelatorioFinanceiro(filtrosAtuais),
    carregarRelatorioPrestadores(filtrosAtuais),
    carregarRelatorioClientes(filtrosAtuais),
  ]).catch((error) => {
    console.error('Erro ao carregar dados:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados dos relatórios' });
  });
};

const exportar = async (formato: 'excel' | 'pdf'): Promise<void> => {
  const filtrosAtuais = obterFiltros();

  try {
    let blob: Blob | null = null;
    if (formato === 'excel') {
      blob = await exportarExcel('completo', filtrosAtuais);
    } else {
      blob = await exportarPDF('completo', filtrosAtuais);
    }

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `relatorio_completo_${formatarDataYMD(new Date())}.${formato === 'excel' ? 'xlsx' : 'pdf'}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      $q.notify({ type: 'positive', message: `Relatório exportado com sucesso!` });
    }
  } catch (error) {
    console.error('Erro ao exportar:', error);
    $q.notify({ type: 'negative', message: 'Erro ao exportar relatório' });
  }
};

// ✅ Watch com tratamento de void
watch(
  [() => filtros.value.data_inicio, () => filtros.value.data_fim],
  () => {
    void carregarTodosDados();
  },
  { deep: true },
);

// ✅ Lifecycle
onMounted(() => {
  void carregarTodosDados();
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
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .date-range {
      display: flex;
      gap: 12px;

      .date-input {
        width: 140px;
      }
    }
  }
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: #1a1a2e;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 12px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.charts-grid-2cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-placeholder {
  background: #f8f9fa;
  border-radius: 12px;
  min-height: 300px;
}

.table-card {
  margin-top: 20px;

  .table-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #374151;
    }
  }
}

@media (max-width: 900px) {
  .charts-grid-2cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .kpi-grid-small {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;

    .header-actions {
      flex-direction: column;
      align-items: stretch;

      .date-range {
        flex-direction: column;

        .date-input {
          width: 100%;
        }
      }
    }
  }
}
</style>
