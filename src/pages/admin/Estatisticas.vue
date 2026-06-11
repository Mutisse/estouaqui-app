<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Estatísticas</h1>
      <div class="header-actions">
        <q-select
          v-model="periodoSelecionado"
          :options="periodos"
          label="Período"
          dense
          outlined
          class="period-select"
          @update:model-value="mudarPeriodo"
          :disable="isLoading"
        />
        <q-btn flat icon="refresh" label="Atualizar" @click="recarregar" :loading="isLoading" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando estatísticas...</p>
    </div>

    <template v-else>
      <!-- Primeira Linha de Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <q-icon name="people" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticasStore.totalUsuarios) }}</div>
            <div class="stat-label">Total Utilizadores</div>
            <div class="stat-trend positive" v-if="estatisticasStore.dados?.crescimento_usuarios">
              <q-icon name="trending_up" size="12px" />
              +{{ estatisticasStore.dados.crescimento_usuarios }}%
            </div>
          </div>
          <div class="stat-bg-icon">
            <q-icon name="people" size="80px" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <q-icon name="handyman" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticasStore.totalPrestadores) }}</div>
            <div class="stat-label">Total Prestadores</div>
            <div
              class="stat-trend positive"
              v-if="estatisticasStore.dados?.crescimento_prestadores"
            >
              <q-icon name="trending_up" size="12px" />
              +{{ estatisticasStore.dados.crescimento_prestadores }}%
            </div>
          </div>
          <div class="stat-bg-icon">
            <q-icon name="handyman" size="80px" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gold">
            <q-icon name="receipt_long" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticasStore.totalPedidos) }}</div>
            <div class="stat-label">Total Pedidos</div>
            <div class="stat-trend positive" v-if="estatisticasStore.dados?.crescimento_pedidos">
              <q-icon name="trending_up" size="12px" />
              +{{ estatisticasStore.dados.crescimento_pedidos }}%
            </div>
          </div>
          <div class="stat-bg-icon">
            <q-icon name="receipt_long" size="80px" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <q-icon name="payments" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatMoney(estatisticasStore.ganhosTotais) }}</div>
            <div class="stat-label">Ganhos Totais</div>
            <div class="stat-trend positive" v-if="estatisticasStore.dados?.crescimento_ganhos">
              <q-icon name="trending_up" size="12px" />
              +{{ estatisticasStore.dados.crescimento_ganhos }}%
            </div>
          </div>
          <div class="stat-bg-icon">
            <q-icon name="payments" size="80px" />
          </div>
        </div>
      </div>

      <!-- Segunda Linha de Cards - Métricas Adicionais -->
      <div class="stats-grid-secondary">
        <div class="stat-card-small">
          <div class="stat-icon-small cyan">
            <q-icon name="shopping_cart" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.pedidos_por_status?.pendente || 0) }}
            </div>
            <div class="stat-label-small">Pedidos Pendentes</div>
          </div>
        </div>

        <div class="stat-card-small">
          <div class="stat-icon-small teal">
            <q-icon name="check_circle" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.pedidos_por_status?.concluido || 0) }}
            </div>
            <div class="stat-label-small">Pedidos Concluídos</div>
          </div>
        </div>

        <div class="stat-card-small">
          <div class="stat-icon-small orange">
            <q-icon name="cancel" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.pedidos_por_status?.cancelado || 0) }}
            </div>
            <div class="stat-label-small">Pedidos Cancelados</div>
          </div>
        </div>

        <div class="stat-card-small">
          <div class="stat-icon-small pink">
            <q-icon name="rate_review" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.avaliacoes_total || 0) }}
            </div>
            <div class="stat-label-small">Avaliações</div>
          </div>
        </div>

        <div class="stat-card-small">
          <div class="stat-icon-small indigo">
            <q-icon name="category" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.total_categorias || 0) }}
            </div>
            <div class="stat-label-small">Categorias</div>
          </div>
        </div>

        <div class="stat-card-small">
          <div class="stat-icon-small red">
            <q-icon name="support" size="20px" />
          </div>
          <div class="stat-info-small">
            <div class="stat-value-small">
              {{ formatNumber(estatisticasStore.dados?.tickets_abertos || 0) }}
            </div>
            <div class="stat-label-small">Tickets Abertos</div>
          </div>
        </div>
      </div>

      <!-- Gráficos - Layout 2 colunas -->
      <div class="charts-row">
        <!-- Gráfico de Ganhos por Mês -->
        <div class="chart-card" v-if="estatisticasStore.dados?.ganhos_por_mes?.length">
          <div class="card-header">
            <h3>📈 Evolução de Ganhos</h3>
            <q-icon name="show_chart" size="20px" color="primary" />
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvasGanhos"></canvas>
          </div>
        </div>

        <!-- Gráfico de Pedidos por Mês -->
        <div class="chart-card" v-if="estatisticasStore.dados?.pedidos_por_mes?.length">
          <div class="card-header">
            <h3>📊 Evolução de Pedidos</h3>
            <q-icon name="bar_chart" size="20px" color="primary" />
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvasPedidos"></canvas>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <!-- Top Categorias -->
        <div class="top-list-card" v-if="estatisticasStore.dados?.top_categorias?.length">
          <div class="card-header">
            <h3>🏆 Top Categorias Mais Pedidas</h3>
            <q-icon name="category" size="20px" color="primary" />
          </div>
          <div class="top-list">
            <div
              v-for="(categoria, index) in estatisticasStore.dados.top_categorias.slice(0, 5)"
              :key="categoria.categoria"
              class="list-item"
            >
              <div class="item-rank">{{ index + 1 }}º</div>
              <div class="item-name">{{ categoria.categoria }}</div>
              <div class="item-bar-container">
                <div
                  class="item-bar"
                  :style="{ width: (categoria.total / estatisticasStore.totalPedidos) * 100 + '%' }"
                ></div>
              </div>
              <div class="item-count">{{ formatNumber(categoria.total) }}</div>
              <div class="item-percent">
                {{ Math.round((categoria.total / estatisticasStore.totalPedidos) * 100) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Top Prestadores -->
        <div class="top-list-card" v-if="estatisticasStore.dados?.top_prestadores?.length">
          <div class="card-header">
            <h3>⭐ Top Prestadores Mais Solicitados</h3>
            <q-icon name="star" size="20px" color="warning" />
          </div>
          <div class="top-list">
            <div
              v-for="(prestador, index) in estatisticasStore.dados.top_prestadores.slice(0, 5)"
              :key="prestador.nome"
              class="list-item"
            >
              <div class="item-rank">{{ index + 1 }}º</div>
              <div class="item-avatar">
                <q-avatar size="32px">
                  <img :src="getAvatarUrl(prestador.nome)" />
                </q-avatar>
              </div>
              <div class="item-name">{{ prestador.nome }}</div>
              <div class="item-value">{{ formatNumber(prestador.total_pedidos) }} pedidos</div>
              <div class="item-rating">
                <q-rating v-model="prestador.avaliacao" readonly size="14px" max="5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribuição de Pedidos por Status -->
      <div class="status-card" v-if="estatisticasStore.dados?.pedidos_por_status">
        <div class="card-header">
          <h3>📊 Distribuição de Pedidos por Status</h3>
          <q-icon name="pie_chart" size="20px" color="primary" />
        </div>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">Pendentes</div>
            <div class="status-value">{{ formatNumber(estatisticasStore.pedidosPendentes) }}</div>
            <div class="status-bar">
              <div
                class="status-fill"
                :style="{
                  width:
                    (estatisticasStore.pedidosPendentes / estatisticasStore.totalPedidos) * 100 +
                    '%',
                  background: '#F59E0B',
                }"
              ></div>
            </div>
            <div class="status-percent">
              {{
                Math.round(
                  (estatisticasStore.pedidosPendentes / estatisticasStore.totalPedidos) * 100,
                )
              }}%
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">Em Andamento</div>
            <div class="status-value">{{ formatNumber(estatisticasStore.pedidosEmAndamento) }}</div>
            <div class="status-bar">
              <div
                class="status-fill"
                :style="{
                  width:
                    (estatisticasStore.pedidosEmAndamento / estatisticasStore.totalPedidos) * 100 +
                    '%',
                  background: '#667EEA',
                }"
              ></div>
            </div>
            <div class="status-percent">
              {{
                Math.round(
                  (estatisticasStore.pedidosEmAndamento / estatisticasStore.totalPedidos) * 100,
                )
              }}%
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">Concluídos</div>
            <div class="status-value">{{ formatNumber(estatisticasStore.pedidosConcluidos) }}</div>
            <div class="status-bar">
              <div
                class="status-fill"
                :style="{
                  width:
                    (estatisticasStore.pedidosConcluidos / estatisticasStore.totalPedidos) * 100 +
                    '%',
                  background: '#10B981',
                }"
              ></div>
            </div>
            <div class="status-percent">
              {{
                Math.round(
                  (estatisticasStore.pedidosConcluidos / estatisticasStore.totalPedidos) * 100,
                )
              }}%
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">Cancelados</div>
            <div class="status-value">{{ formatNumber(estatisticasStore.pedidosCancelados) }}</div>
            <div class="status-bar">
              <div
                class="status-fill"
                :style="{
                  width:
                    (estatisticasStore.pedidosCancelados / estatisticasStore.totalPedidos) * 100 +
                    '%',
                  background: '#EF4444',
                }"
              ></div>
            </div>
            <div class="status-percent">
              {{
                Math.round(
                  (estatisticasStore.pedidosCancelados / estatisticasStore.totalPedidos) * 100,
                )
              }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Últimas Atividades -->
      <div class="activities-card">
        <div class="card-header">
          <h3>🔄 Últimas Atividades</h3>
          <q-icon name="history" size="20px" color="primary" />
        </div>
        <div class="activities-list">
          <div
            v-for="(atividade, index) in estatisticasStore.dados?.ultimas_atividades?.slice(
              0,
              10,
            ) || []"
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="getActivityIconClass(atividade.tipo)">
              <q-icon :name="getActivityIcon(atividade.tipo)" size="16px" />
            </div>
            <div class="activity-content">
              <div class="activity-description">{{ atividade.descricao }}</div>
              <div class="activity-time">{{ formatarDataRelativa(atividade.created_at) }}</div>
            </div>
          </div>
          <div v-if="!estatisticasStore.dados?.ultimas_atividades?.length" class="no-activities">
            <q-icon name="history" size="32px" color="grey-4" />
            <p>Nenhuma atividade recente</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminEstatisticasStore } from 'src/stores/admin/admin-estatisticas-store';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

defineOptions({ name: 'AdminEstatisticas' });

const estatisticasStore = useAdminEstatisticasStore();
const { isLoading, dados } = storeToRefs(estatisticasStore);

const periodoSelecionado = ref('mes');
const periodos = [
  { label: 'Este Mês', value: 'mes' },
  { label: 'Últimos 3 Meses', value: 'trimestre' },
  { label: 'Este Ano', value: 'ano' },
  { label: 'Todos', value: 'todos' },
];

const chartCanvasGanhos = ref<HTMLCanvasElement | null>(null);
const chartCanvasPedidos = ref<HTMLCanvasElement | null>(null);
let chartGanhos: Chart | null = null;
let chartPedidos: Chart | null = null;

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num || 0);
};

const formatMoney = (num: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(num || 0);
};

const formatarDataRelativa = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getAvatarUrl = (nome: string): string => {
  return `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=60&name=${encodeURIComponent(nome)}`;
};

const getActivityIcon = (tipo: string): string => {
  const icons: Record<string, string> = {
    pedido: 'shopping_cart',
    usuario: 'person_add',
    prestador: 'handyman',
    avaliacao: 'star',
    pagamento: 'payments',
  };
  return icons[tipo] || 'info';
};

const getActivityIconClass = (tipo: string): string => {
  const classes: Record<string, string> = {
    pedido: 'icon-pedido',
    usuario: 'icon-usuario',
    prestador: 'icon-prestador',
    avaliacao: 'icon-avaliacao',
    pagamento: 'icon-pagamento',
  };
  return classes[tipo] || 'icon-default';
};

const atualizarGraficoGanhos = (): void => {
  const ganhosPorMes = dados.value?.ganhos_por_mes;

  if (!chartCanvasGanhos.value || !ganhosPorMes || ganhosPorMes.length === 0) return;

  const ctx = chartCanvasGanhos.value.getContext('2d');
  if (!ctx) return;

  if (chartGanhos) {
    chartGanhos.destroy();
  }

  const meses = ganhosPorMes.map((item) => item.mes);
  const valores = ganhosPorMes.map((item) => item.total);

  chartGanhos = new Chart(ctx, {
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
        legend: { position: 'top' },
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
            callback: (value) => {
              const numValue = value as number;
              return formatMoney(numValue);
            },
          },
        },
      },
    },
  });
};

const atualizarGraficoPedidos = (): void => {
  const pedidosPorMes = dados.value?.pedidos_por_mes;

  if (!chartCanvasPedidos.value || !pedidosPorMes || pedidosPorMes.length === 0) return;

  const ctx = chartCanvasPedidos.value.getContext('2d');
  if (!ctx) return;

  if (chartPedidos) {
    chartPedidos.destroy();
  }

  const meses = pedidosPorMes.map((item) => item.mes);
  const valores = pedidosPorMes.map((item) => item.total);

  chartPedidos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Pedidos',
          data: valores,
          backgroundColor: '#10B981',
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `Pedidos: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const numValue = value as number;
              return String(numValue);
            },
          },
        },
      },
    },
  });
};

const carregarEstatisticas = async (): Promise<void> => {
  await estatisticasStore.carregarEstatisticas(periodoSelecionado.value);
  atualizarGraficoGanhos();
  atualizarGraficoPedidos();
};

const mudarPeriodo = async (valor: string): Promise<void> => {
  periodoSelecionado.value = valor;
  await carregarEstatisticas();
};

const recarregar = (): void => {
  void carregarEstatisticas();
};

watch(periodoSelecionado, () => {
  void carregarEstatisticas();
});

onMounted(() => {
  void carregarEstatisticas();
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

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 16px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;

    &.blue {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.gold {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.purple {
      background: rgba(118, 75, 162, 0.1);
      color: #764ba2;
    }
  }

  .stat-info {
    flex: 1;
    z-index: 1;

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
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      margin-top: 4px;
      &.positive {
        color: #10b981;
      }
    }
  }

  .stat-bg-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    opacity: 0.06;
    z-index: 0;
    :deep(.q-icon) {
      font-size: 80px;
    }
  }
}

.stats-grid-secondary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card-small {
  background: white;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .stat-icon-small {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.cyan {
      background: rgba(6, 182, 212, 0.1);
      color: #06b6d4;
    }
    &.teal {
      background: rgba(20, 184, 166, 0.1);
      color: #14b8a6;
    }
    &.orange {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.pink {
      background: rgba(236, 72, 153, 0.1);
      color: #ec4899;
    }
    &.indigo {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }
    &.red {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  .stat-info-small {
    .stat-value-small {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stat-label-small {
      font-size: 10px;
      color: #6b7280;
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .chart-container {
    height: 280px;
  }
}

.top-list-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .top-list {
    .list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;

      .item-rank {
        width: 32px;
        font-weight: 700;
        color: #667eea;
      }
      .item-name {
        width: 120px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-bar-container {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        .item-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
        }
      }
      .item-count {
        width: 50px;
        text-align: right;
        font-weight: 600;
        font-size: 13px;
      }
      .item-percent {
        width: 45px;
        text-align: right;
        color: #6b7280;
        font-size: 11px;
      }
      .item-value {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        min-width: 80px;
      }
      .item-rating {
        min-width: 80px;
      }
    }
  }
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .status-item {
      .status-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
      }
      .status-value {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a2e;
        margin-bottom: 8px;
      }
      .status-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        .status-fill {
          height: 100%;
          border-radius: 4px;
        }
      }
      .status-percent {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        text-align: right;
      }
    }
  }
}

.activities-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .activities-list {
    max-height: 300px;
    overflow-y: auto;

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.icon-pedido {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        &.icon-usuario {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
        &.icon-prestador {
          background: rgba(118, 75, 162, 0.1);
          color: #764ba2;
        }
        &.icon-avaliacao {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        &.icon-pagamento {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }
        &.icon-default {
          background: #f3f4f6;
          color: #6b7280;
        }
      }

      .activity-content {
        flex: 1;
        .activity-description {
          font-size: 13px;
          color: #374151;
        }
        .activity-time {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
      }
    }

    .no-activities {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
    }
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-grid-secondary {
    grid-template-columns: repeat(3, 1fr);
  }
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid-secondary {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .status-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
