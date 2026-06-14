<template>
  <div class="relatorio-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="() => router.back()">
        <q-icon name="arrow_back" size="22px" />
      </button>
      <h1>Relatório Financeiro</h1>
      <button class="filter-btn" @click="abrirFiltros">
        <q-icon name="filter_list" size="20px" />
      </button>
    </header>

    <!-- Loading -->
    <div v-if="relatorioStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>A carregar relatório...</p>
    </div>

    <div v-else-if="relatorioStore.dados" class="content">
      <!-- Resumo Principal -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">
            <q-icon name="account_balance_wallet" size="28px" color="primary" />
          </div>
          <div class="card-info">
            <span class="card-label">Total ganho</span>
            <strong class="card-value">{{
              relatorioStore.formatarMoeda(relatorioStore.dados.total_ganhos)
            }}</strong>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">
            <q-icon name="handyman" size="28px" color="primary" />
          </div>
          <div class="card-info">
            <span class="card-label">Serviços</span>
            <strong class="card-value">{{
              relatorioStore.formatarNumero(relatorioStore.dados.total_servicos)
            }}</strong>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">
            <q-icon name="people" size="28px" color="primary" />
          </div>
          <div class="card-info">
            <span class="card-label">Clientes</span>
            <strong class="card-value">{{
              relatorioStore.formatarNumero(relatorioStore.dados.total_clientes)
            }}</strong>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">
            <q-icon name="star" size="28px" color="amber" />
          </div>
          <div class="card-info">
            <span class="card-label">Avaliação</span>
            <strong class="card-value">{{
              relatorioStore.dados.avaliacao_media.toFixed(1)
            }}</strong>
          </div>
        </div>
      </div>

      <!-- Ganhos Rápidos -->
      <div class="quick-earnings">
        <div class="quick-item">
          <span class="quick-label">Hoje</span>
          <strong class="quick-value">{{
            relatorioStore.formatarMoeda(relatorioStore.dados.ganhos_hoje)
          }}</strong>
        </div>
        <div class="quick-item">
          <span class="quick-label">Esta semana</span>
          <strong class="quick-value">{{
            relatorioStore.formatarMoeda(relatorioStore.dados.ganhos_semana)
          }}</strong>
        </div>
        <div class="quick-item">
          <span class="quick-label">Este mês</span>
          <strong class="quick-value">{{
            relatorioStore.formatarMoeda(relatorioStore.dados.ganhos_mes)
          }}</strong>
          <span
            class="quick-change"
            :class="relatorioStore.dados.variacao_mes >= 0 ? 'positive' : 'negative'"
          >
            {{ relatorioStore.dados.variacao_mes >= 0 ? '+' : ''
            }}{{ relatorioStore.dados.variacao_mes }}%
          </span>
        </div>
      </div>

      <!-- GRID 2x2 DE GRÁFICOS -->
      <div class="charts-grid">
        <!-- GRÁFICO 1: LINHA - Evolução de Ganhos -->
        <div class="chart-card">
          <div class="chart-header">
            <q-icon name="show_chart" size="22px" color="primary" />
            <h3>📈 Evolução de Ganhos</h3>
          </div>
          <canvas ref="lineChartCanvas" class="chart-canvas"></canvas>
        </div>

        <!-- GRÁFICO 2: BARRA - Ganhos por Mês -->
        <div class="chart-card">
          <div class="chart-header">
            <q-icon name="bar_chart" size="22px" color="primary" />
            <h3>📊 Ganhos por Mês</h3>
          </div>
          <div class="bar-chart">
            <div
              v-for="item in relatorioStore.dados.ganhos_por_mes"
              :key="item.mes"
              class="bar-item"
            >
              <div class="bar" :style="{ height: getBarHeight(item.total) + '%' }"></div>
              <span class="bar-label">{{ item.mes }}</span>
              <span class="bar-value">{{ relatorioStore.formatarMoeda(item.total) }}</span>
            </div>
          </div>
        </div>

        <!-- GRÁFICO 3: PIZZA - Status dos Serviços -->
        <div class="chart-card">
          <div class="chart-header">
            <q-icon name="pie_chart" size="22px" color="primary" />
            <h3>🥧 Status dos Serviços</h3>
          </div>
          <div class="pie-wrapper">
            <canvas ref="pieChartCanvas" width="200" height="200" class="pie-canvas"></canvas>
            <div class="pie-legend">
              <div
                v-for="item in relatorioStore.dados.status_servicos"
                :key="item.status"
                class="legend-item"
              >
                <span class="legend-color" :style="{ background: item.cor }"></span>
                <span class="legend-label">{{ item.status }}</span>
                <span class="legend-value">{{ item.total }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- GRÁFICO 4: DONUT - Serviços por Categoria -->
        <div class="chart-card">
          <div class="chart-header">
            <q-icon name="donut_large" size="22px" color="primary" />
            <h3>🍩 Serviços por Categoria</h3>
          </div>
          <div class="donut-wrapper">
            <canvas ref="donutChartCanvas" width="200" height="200" class="donut-canvas"></canvas>
            <div class="donut-legend">
              <div
                v-for="(item, index) in relatorioStore.dados.servicos_por_categoria"
                :key="index"
                class="legend-item"
              >
                <span class="legend-color" :style="{ background: item.cor }"></span>
                <span class="legend-label">{{ item.categoria }}</span>
                <span class="legend-value">{{ item.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Serviços -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <q-icon name="emoji_events" size="22px" color="primary" />
          <h3>🏆 Top Serviços Mais Vendidos</h3>
        </div>
        <div class="top-servicos">
          <div
            v-for="servico in relatorioStore.dados.top_servicos"
            :key="servico.nome"
            class="top-item"
          >
            <div class="top-info">
              <span class="top-name">{{ servico.nome }}</span>
              <span class="top-qtd">{{ servico.quantidade }}x</span>
            </div>
            <div class="top-bar-container">
              <div class="top-bar" :style="{ width: getTopWidth(servico.quantidade) + '%' }"></div>
            </div>
            <span class="top-receita">{{ relatorioStore.formatarMoeda(servico.receita) }}</span>
          </div>
        </div>
      </div>

      <!-- Projeção -->
      <div class="chart-card full-width projection">
        <div class="chart-header">
          <q-icon name="trending_up" size="22px" color="primary" />
          <h3>🎯 Projeção de Ganhos</h3>
        </div>
        <div class="projection-items">
          <div class="projection-item">
            <span class="proj-label">Este mês</span>
            <strong class="proj-value">{{
              relatorioStore.formatarMoeda(relatorioStore.dados.projecao_mes_atual)
            }}</strong>
          </div>
          <div class="projection-arrow">
            <q-icon name="arrow_forward" size="24px" color="gray" />
          </div>
          <div class="projection-item">
            <span class="proj-label">Próximo mês</span>
            <strong class="proj-value">{{
              relatorioStore.formatarMoeda(relatorioStore.dados.projecao_mes_seguinte)
            }}</strong>
            <span class="proj-change positive">+10%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty">
      <div class="empty-icon">
        <q-icon name="bar_chart" size="64px" color="grey" />
      </div>
      <h3>Nenhum dado disponível</h3>
      <p>Complete serviços para ver seu relatório financeiro</p>
    </div>

    <!-- Modal de Filtros -->
    <div v-if="modalFiltros" class="modal" @click="fecharFiltros">
      <div class="modal-box" @click.stop>
        <div class="modal-header">
          <h3>Filtrar relatório</h3>
          <button class="modal-close" @click="fecharFiltros">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Período</label>
            <div class="periodo-options">
              <button
                v-for="op in opcoesPeriodo"
                :key="op.value"
                :class="['periodo-btn', { active: relatorioStore.filtros.periodo === op.value }]"
                @click="selecionarPeriodo(op.value)"
              >
                {{ op.label }}
              </button>
            </div>
          </div>
          <div v-if="relatorioStore.filtros.periodo === 'personalizado'" class="field">
            <label>Data início</label>
            <input type="date" v-model="dataInicioTemp" class="date-input" />
            <label class="mt-2">Data fim</label>
            <input type="date" v-model="dataFimTemp" class="date-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-clear" @click="limparFiltros">Limpar</button>
          <button class="btn-apply" @click="aplicarFiltros">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePrestadorRelatorioStore } from 'src/stores/prestador/prestador-relatorio-store';
import { Chart, registerables } from 'chart.js';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

defineOptions({ name: 'PrestadorRelatorioFinanceiro' });

const router = useRouter();
const relatorioStore = usePrestadorRelatorioStore();

// Referências dos canvases
const lineChartCanvas = ref<HTMLCanvasElement | null>(null);
const pieChartCanvas = ref<HTMLCanvasElement | null>(null);
const donutChartCanvas = ref<HTMLCanvasElement | null>(null);

// Instâncias dos gráficos
let lineChartInstance: Chart | null = null;
let pieChartInstance: Chart | null = null;
let donutChartInstance: Chart | null = null;

const modalFiltros = ref(false);
const dataInicioTemp = ref('');
const dataFimTemp = ref('');

const opcoesPeriodo = [
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mês', value: 'mes' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Personalizado', value: 'personalizado' },
];

const getBarHeight = (valor: number): number => {
  const valores = relatorioStore.dados?.ganhos_por_mes.map((v) => v.total) || [0];
  const maxValor = Math.max(...valores, 1);
  return (valor / maxValor) * 80;
};

const getTopWidth = (quantidade: number): number => {
  const quantidades = relatorioStore.dados?.top_servicos.map((s) => s.quantidade) || [0];
  const maxQtd = Math.max(...quantidades, 1);
  return (quantidade / maxQtd) * 100;
};

const abrirFiltros = () => {
  dataInicioTemp.value = relatorioStore.filtros.data_inicio || '';
  dataFimTemp.value = relatorioStore.filtros.data_fim || '';
  modalFiltros.value = true;
};

const fecharFiltros = () => {
  modalFiltros.value = false;
};

const selecionarPeriodo = (periodo: string) => {
  relatorioStore.setFiltroPeriodo(periodo as 'semana' | 'mes' | 'ano' | 'personalizado');
};

const limparFiltros = () => {
  relatorioStore.limparFiltros();
  fecharFiltros();
};

const aplicarFiltros = () => {
  if (relatorioStore.filtros.periodo === 'personalizado') {
    relatorioStore.setFiltroData('data_inicio', dataInicioTemp.value);
    relatorioStore.setFiltroData('data_fim', dataFimTemp.value);
  }
  void relatorioStore.aplicarFiltros();
  fecharFiltros();
};

// GRÁFICO 1: LINHA - Evolução de Ganhos
const renderLineChart = () => {
  if (!lineChartCanvas.value || !relatorioStore.dados) return;

  const dados = relatorioStore.dados.ganhos_por_mes;
  const labels = dados.map((item) => item.mes);
  const valores = dados.map((item) => item.total);

  if (lineChartInstance) lineChartInstance.destroy();

  const ctx = lineChartCanvas.value.getContext('2d');
  if (!ctx) return;

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ganhos (MZN)',
          data: valores,
          borderColor: '#5B4BF5',
          backgroundColor: 'rgba(91, 75, 245, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#5B4BF5',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 } },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `Ganhos: ${relatorioStore.formatarMoeda(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => relatorioStore.formatarMoeda(value as number),
            font: { size: 9 },
          },
          grid: { color: '#E5E9F0' },
        },
        x: {
          ticks: { font: { size: 9 } },
          grid: { display: false },
        },
      },
    },
  });
};

// GRÁFICO 3: PIZZA - Status dos Serviços
const renderPieChart = () => {
  if (!pieChartCanvas.value || !relatorioStore.dados) return;

  const dados = relatorioStore.dados.status_servicos.filter((s) => s.total > 0);
  if (pieChartInstance) pieChartInstance.destroy();

  const ctx = pieChartCanvas.value.getContext('2d');
  if (!ctx) return;

  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: dados.map((item) => item.status),
      datasets: [
        {
          data: dados.map((item) => item.total),
          backgroundColor: dados.map((item) => item.cor),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `${context.label}: ${value} serviços`;
            },
          },
        },
      },
    },
  });
};

// GRÁFICO 4: DONUT - Serviços por Categoria
const renderDonutChart = () => {
  if (!donutChartCanvas.value || !relatorioStore.dados) return;

  const dados = relatorioStore.dados.servicos_por_categoria;
  if (donutChartInstance) donutChartInstance.destroy();

  const ctx = donutChartCanvas.value.getContext('2d');
  if (!ctx) return;

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dados.map((item) => item.categoria),
      datasets: [
        {
          data: dados.map((item) => item.total),
          backgroundColor: dados.map((item) => item.cor),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '60%', // ✅ cutout vai aqui, dentro do options!
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `${context.label}: ${value} serviços`;
            },
          },
        },
      },
    },
  });
};

// Watch para renderizar gráficos quando dados mudarem
watch(
  () => relatorioStore.dados,
  () => {
    setTimeout(() => {
      renderLineChart();
      renderPieChart();
      renderDonutChart();
    }, 100);
  },
  { deep: true },
);

onMounted(async () => {
  await relatorioStore.fetchRelatorio();
});
</script>

<style scoped lang="scss">
$primary: #5b4bf5;
$bg: #f5f7fa;
$card: #ffffff;
$text: #1a1a2e;
$gray: #6b7280;
$border: #e5e9f0;
$success: #10b981;
$danger: #ef4444;

.relatorio-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 30px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  h1 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: $text;
  }

  .back-btn,
  .filter-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    border: none;
    cursor: pointer;
    &:hover {
      background: $border;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid $border;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content {
  padding: 16px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.summary-card {
  background: $card;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .card-icon {
    width: 40px;
    height: 40px;
    background: rgba($primary, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-info {
    flex: 1;
    .card-label {
      font-size: 0.6rem;
      color: $gray;
      display: block;
    }
    .card-value {
      font-size: 0.85rem;
      font-weight: 700;
      color: $text;
    }
  }
}

.quick-earnings {
  background: $card;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;

  .quick-item {
    text-align: center;
    flex: 1;
    .quick-label {
      font-size: 0.6rem;
      color: $gray;
      display: block;
    }
    .quick-value {
      font-size: 0.75rem;
      font-weight: 700;
      color: $text;
      display: block;
    }
    .quick-change {
      font-size: 0.55rem;
      font-weight: 600;
      display: inline-block;
      margin-top: 4px;
      &.positive {
        color: $success;
      }
      &.negative {
        color: $danger;
      }
    }
  }
}

// GRID 2x2
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.chart-card {
  background: $card;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &.full-width {
    grid-column: span 2;
  }

  .chart-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid rgba($primary, 0.3);

    h3 {
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
      color: $text;
    }
  }
}

.chart-canvas {
  width: 100%;
  max-height: 180px;
}

// GRÁFICO DE BARRAS
.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;

  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .bar {
      width: 20px;
      background: $primary;
      border-radius: 6px;
      transition: height 0.3s;
      min-height: 4px;
    }

    .bar-label {
      font-size: 0.5rem;
      color: $gray;
      margin-top: 6px;
      font-weight: 500;
    }
    .bar-value {
      font-size: 0.45rem;
      font-weight: 600;
      color: $primary;
      margin-top: 2px;
    }
  }
}

// PIZZA - Status dos Serviços
.pie-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  .pie-canvas {
    max-width: 140px;
    max-height: 140px;
    margin-bottom: 10px;
  }
}

// DONUT - Serviços por Categoria
.donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  .donut-canvas {
    max-width: 140px;
    max-height: 140px;
    margin-bottom: 10px;
  }
}

.pie-legend,
.donut-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6rem;
    background: $bg;
    padding: 2px 8px;
    border-radius: 16px;

    .legend-color {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }
    .legend-label {
      color: $gray;
    }
    .legend-value {
      font-weight: 600;
      color: $text;
    }
  }
}

.top-servicos {
  .top-item {
    margin-bottom: 10px;

    .top-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      .top-name {
        font-size: 0.7rem;
        font-weight: 500;
        color: $text;
      }
      .top-qtd {
        font-size: 0.65rem;
        color: $gray;
      }
    }

    .top-bar-container {
      background: #f0f2f5;
      border-radius: 8px;
      height: 6px;
      margin-bottom: 4px;

      .top-bar {
        background: $primary;
        border-radius: 8px;
        height: 100%;
        transition: width 0.3s;
      }
    }

    .top-receita {
      font-size: 0.65rem;
      font-weight: 600;
      color: $success;
      display: block;
      text-align: right;
      margin-top: 2px;
    }
  }
}

.projection {
  .projection-items {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    .projection-item {
      flex: 1;
      text-align: center;
      .proj-label {
        font-size: 0.7rem;
        color: $gray;
        display: block;
        margin-bottom: 4px;
      }
      .proj-value {
        font-size: 0.9rem;
        font-weight: 700;
        color: $text;
        display: block;
      }
      .proj-change {
        font-size: 0.6rem;
        font-weight: 600;
        &.positive {
          color: $success;
        }
      }
    }
    .projection-arrow {
      font-size: 1.2rem;
      color: $gray;
    }
  }
}

.empty {
  text-align: center;
  padding: 60px 20px;
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 4px;
    color: $text;
  }
  p {
    font-size: 0.8rem;
    color: $gray;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 340px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  .modal-close {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: #f0f2f5;
    font-size: 18px;
    cursor: pointer;
  }
}

.modal-body {
  padding: 16px;
}
.field {
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: $text;
  }
  .mt-2 {
    margin-top: 8px;
  }
}

.periodo-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .periodo-btn {
    padding: 6px 12px;
    border: 1px solid $border;
    border-radius: 30px;
    background: white;
    font-size: 0.65rem;
    cursor: pointer;
    &:hover {
      border-color: $primary;
    }
    &.active {
      background: $primary;
      color: white;
      border-color: $primary;
    }
  }
}

.date-input {
  width: 100%;
  padding: 10px;
  border: 1px solid $border;
  border-radius: 12px;
  font-size: 0.8rem;
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid $border;
  button {
    flex: 1;
    padding: 10px;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-clear {
    background: transparent;
    border: 1px solid $border;
    color: $gray;
  }
  .btn-apply {
    background: $primary;
    color: white;
    border: none;
  }
}
</style>
