<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Financeiro</h1>
      <div class="header-actions">
        <q-select
          v-model="periodo"
          :options="periodos"
          label="Período"
          dense
          outlined
          class="period-select"
          @update:model-value="mudarPeriodo"
        />
        <q-btn
          color="primary"
          icon="download"
          label="Exportar"
          @click="exportarRelatorio"
          :loading="financeiroStore.isExporting"
        />
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="trending_up" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(financeiroStore.resumo.total_ganhos) }}</div>
          <div class="stat-label">Ganhos Totais</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="pending" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(financeiroStore.resumo.pendentes) }}</div>
          <div class="stat-label">Pagamentos Pendentes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon gold">
          <q-icon name="check_circle" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(financeiroStore.resumo.pagos) }}</div>
          <div class="stat-label">Pagamentos Realizados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="receipt" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(financeiroStore.resumo.total_saques) }}</div>
          <div class="stat-label">Total Saques</div>
        </div>
      </div>
    </div>

    <!-- Gráfico de Ganhos -->
    <div class="chart-card">
      <div class="card-header">
        <h3>Evolução de Ganhos</h3>
      </div>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Tabela de Transações -->
    <div class="card-header">
      <h3>Últimas Transações</h3>
    </div>
    <q-table
      :rows="financeiroStore.transacoes"
      :columns="columns"
      row-key="id"
      :loading="financeiroStore.isLoading"
      flat
      bordered
    >
      <template v-slot:body-cell-tipo="props">
        <q-td :props="props">
          <q-badge :color="props.row.tipo === 'receita' ? 'green' : 'red'">
            {{ props.row.tipo === 'receita' ? 'Receita' : 'Despesa' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 'pago' ? 'green' : 'orange'">
            {{ props.row.status === 'pago' ? 'Pago' : 'Pendente' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-valor="props">
        <q-td :props="props">
          <span :class="props.row.tipo === 'receita' ? 'text-positive' : 'text-negative'">
            {{ formatMoney(props.row.valor) }}
          </span>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAdminFinanceiroStore } from 'src/stores/admin/admin-financeiro-store';

Chart.register(...registerables);

defineOptions({ name: 'AdminFinanceiro' });


const financeiroStore = useAdminFinanceiroStore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;
const periodo = ref('mes');

const periodos = [
  { label: 'Este Mês', value: 'mes' },
  { label: 'Últimos 3 Meses', value: 'trimestre' },
  { label: 'Este Ano', value: 'ano' },
  { label: 'Todos', value: 'todos' },
];

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const },
  { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left' as const },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'data', label: 'Data', field: 'data', align: 'left' as const },
];

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num || 0);
};

const formatMoney = (num: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(num || 0);
};

const atualizarGrafico = (): void => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  if (chart) {
    chart.destroy();
  }

  const dados = financeiroStore.ganhosPorMes;
  const meses = dados.map(item => item.mes);
  const valores = dados.map(item => item.total);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Ganhos',
          data: valores,
          borderColor: '#667EEA',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667EEA',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `Ganhos: ${formatMoney(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatMoney(value as number),
          },
        },
      },
    },
  });
};

const carregarDados = async (): Promise<void> => {
  await financeiroStore.carregarFinanceiro(periodo.value);
  atualizarGrafico();
};

const mudarPeriodo = async (valor: string): Promise<void> => {
  periodo.value = valor;
  await carregarDados();
};

const exportarRelatorio = async (): Promise<void> => {
  await financeiroStore.exportarRelatorio(periodo.value);
};

watch(periodo, () => {
  void carregarDados();
});

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
.page-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;

    .period-select {
      width: 180px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.green { background: rgba(16, 185, 129, 0.1); color: #10B981; }
    &.blue { background: rgba(102, 126, 234, 0.1); color: #667EEA; }
    &.gold { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    &.purple { background: rgba(118, 75, 162, 0.1); color: #764BA2; }
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
}

.chart-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;

  .card-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .chart-container {
    height: 300px;
  }
}

.card-header {
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

.text-positive {
  color: #10B981;
  font-weight: 600;
}

.text-negative {
  color: #EF4444;
  font-weight: 600;
}
</style>
