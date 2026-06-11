<template>
  <div class="chart-card">
    <div class="card-header">
      <div class="header-title">
        <q-icon :name="icon" :color="iconColor" size="20px" />
        <h3>{{ title }}</h3>
      </div>
      <div class="header-actions" v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="chart-container">
      <canvas :id="chartId"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, onUnmounted } from 'vue';
import { Chart, registerables, type ChartConfiguration, type ChartType } from 'chart.js';

// Registrar todos os componentes
Chart.register(...registerables);

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  fill?: boolean;
}

const props = defineProps<{
  chartId: string;
  title: string;
  icon: string;
  iconColor?: string;
  type?: 'line' | 'bar' | 'pie' | 'doughnut';
  labels: string[];
  datasets: ChartDataset[];
}>();

let chartInstance: Chart | null = null;

const createChart = (): void => {
  const canvas = document.getElementById(props.chartId) as HTMLCanvasElement;
  if (!canvas) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const datasets = props.datasets.map(dataset => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.borderColor || '#667EEA',
    backgroundColor: dataset.backgroundColor || 'rgba(102, 126, 234, 0.1)',
    borderWidth: 2,
    fill: dataset.fill !== undefined ? dataset.fill : true,
    tension: 0.4,
    pointBackgroundColor: dataset.borderColor || '#667EEA',
    pointBorderColor: '#fff',
    pointRadius: 4,
    pointHoverRadius: 6,
  }));

  // ✅ Configuração tipada sem any
  const config: ChartConfiguration = {
    type: props.type as ChartType || 'line',
    data: {
      labels: props.labels,
      datasets: datasets as unknown as ChartConfiguration['data']['datasets'],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 11 },
          },
        },
      },
    },
  };

  if (props.type === 'line' || props.type === 'bar') {
    config.options = {
      ...config.options,
      scales: {
        y: { beginAtZero: true },
        x: {},
      },
    };
  }

  chartInstance = new Chart(ctx, config);
};

// ✅ setTimeout sem promise
const initChart = (): void => {
  setTimeout(() => {
    createChart();
  }, 100);
};

watch(() => [props.labels, props.datasets], () => {
  createChart();
}, { deep: true });

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped lang="scss">
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;

      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: #1a1a2e;
      }
    }
  }

  .chart-container {
    height: 280px;
    position: relative;
  }
}
</style>
