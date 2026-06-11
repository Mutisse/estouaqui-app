<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Monitoramento</h1>
      <div class="header-actions">
        <q-btn color="primary" icon="refresh" label="Atualizar" @click="atualizarDados" :loading="isLoading" />
        <q-btn color="warning" icon="notifications" label="Alertas" @click="abrirModalAlertas">
          <q-badge v-if="estatisticas.alertas_nao_lidos > 0" color="red" floating>
            {{ estatisticas.alertas_nao_lidos }}
          </q-badge>
        </q-btn>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando métricas do sistema...</p>
    </div>

    <div v-else>
      <!-- KPIs -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><q-icon name="memory" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStatus.cpu }}%</div>
            <div class="stat-label">CPU</div>
            <q-linear-progress :value="systemStatus.cpu / 100" :color="getProgressColor(systemStatus.cpu)" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green"><q-icon name="storage" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStatus.memoria }}%</div>
            <div class="stat-label">Memória</div>
            <q-linear-progress :value="systemStatus.memoria / 100" :color="getProgressColor(systemStatus.memoria)" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gold"><q-icon name="sd_card" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStatus.disco }}%</div>
            <div class="stat-label">Disco</div>
            <q-linear-progress :value="systemStatus.disco / 100" :color="getProgressColor(systemStatus.disco)" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple"><q-icon name="schedule" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ formatarUptime(systemStatus.uptime) }}</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cyan"><q-icon name="online_prediction" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ estatisticas.tempo_medio_resposta }}ms</div>
            <div class="stat-label">Tempo Médio</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pink"><q-icon name="warning" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ estatisticas.total_alertas }}</div>
            <div class="stat-label">Total Alertas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon teal"><q-icon name="notifications_active" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ estatisticas.alertas_nao_lidos }}</div>
            <div class="stat-label">Alertas Não Lidos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon indigo"><q-icon name="check_circle" size="28px" /></div>
          <div class="stat-info">
            <div class="stat-value">{{ estatisticas.disponibilidade }}%</div>
            <div class="stat-label">Disponibilidade</div>
          </div>
        </div>
      </div>

      <!-- Serviços -->
      <div class="section" v-if="systemStatus.servicos?.length">
        <div class="section-header">
          <h3>🔄 Serviços do Sistema</h3>
        </div>
        <div class="services-grid">
          <div v-for="servico in systemStatus.servicos" :key="servico.nome" class="service-item">
            <q-icon :name="getServiceStatusIcon(servico.status)" :color="getServiceStatusColor(servico.status)" size="28px" />
            <div class="service-info">
              <div class="service-name">{{ servico.nome }}</div>
              <q-badge :color="getServiceStatusColor(servico.status)">{{ getServiceStatusLabel(servico.status) }}</q-badge>
              <span class="service-time">{{ servico.tempo_resposta }}ms</span>
            </div>
            <q-btn flat dense icon="refresh" @click="() => testarServicoFn(servico.nome)" size="sm" />
          </div>
        </div>
      </div>

      <!-- CARD 1: CPU + Memória (juntos - TAMANHO GRANDE) -->
      <div class="donut-card-dual">
        <div class="card-header">
          <h3>📊 Uso de Recursos</h3>
          <q-icon name="analytics" size="20px" color="primary" />
        </div>
        <div class="donuts-dual">
          <!-- CPU Donut -->
          <div class="donut-item">
            <div class="donut-header">
              <q-icon name="memory" size="24px" color="primary" />
              <h4>CPU</h4>
            </div>
            <div class="donut-wrapper">
              <canvas ref="cpuDonutChart" width="180" height="180"></canvas>
              <div class="donut-center-text">
                <span class="donut-value">{{ systemStatus.cpu }}%</span>
              </div>
            </div>
            <div class="donut-footer">
              <span><span class="dot green"></span> Em uso: <strong>{{ systemStatus.cpu }}%</strong></span>
              <span><span class="dot gray"></span> Livre: <strong>{{ 100 - systemStatus.cpu }}%</strong></span>
            </div>
          </div>

          <!-- Memória Donut -->
          <div class="donut-item">
            <div class="donut-header">
              <q-icon name="storage" size="24px" color="primary" />
              <h4>Memória</h4>
            </div>
            <div class="donut-wrapper">
              <canvas ref="memoriaDonutChart" width="180" height="180"></canvas>
              <div class="donut-center-text">
                <span class="donut-value">{{ systemStatus.memoria }}%</span>
              </div>
            </div>
            <div class="donut-footer">
              <span><span class="dot green"></span> Em uso: <strong>{{ systemStatus.memoria }}%</strong></span>
              <span><span class="dot gray"></span> Livre: <strong>{{ 100 - systemStatus.memoria }}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos de linha -->
      <div class="charts-row">
        <ChartCard
          chart-id="requisicoes-chart"
          title="📡 Requisições por Segundo"
          icon="online_prediction"
          type="line"
          :labels="metricas.requisicoes?.map(m => formatarHora(m.timestamp)) || []"
          :datasets="[{ label: 'req/s', data: metricas.requisicoes?.map(m => m.valor) || [], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', fill: true }]"
        />

        <ChartCard
          chart-id="resposta-chart"
          title="⚡ Tempo de Resposta (ms)"
          icon="speed"
          type="line"
          :labels="metricas.tempo_resposta?.map(m => formatarHora(m.timestamp)) || []"
          :datasets="[{ label: 'Tempo (ms)', data: metricas.tempo_resposta?.map(m => m.valor) || [], borderColor: '#667EEA', backgroundColor: 'rgba(102, 126, 234, 0.1)', fill: true }]"
        />
      </div>

      <!-- CARD 2: Disco (sozinho - TAMANHO GRANDE) -->
      <div class="donut-card-single">
        <div class="card-header">
          <h3>💿 Espaço em Disco</h3>
          <q-icon name="sd_card" size="20px" color="primary" />
        </div>
        <div class="donut-single">
          <div class="donut-item">
            <div class="donut-wrapper">
              <canvas ref="discoDonutChart" width="200" height="200"></canvas>
              <div class="donut-center-text">
                <span class="donut-value">{{ systemStatus.disco }}%</span>
              </div>
            </div>
            <div class="donut-footer-single">
              <span><span class="dot orange"></span> Em uso: <strong>{{ systemStatus.disco }}%</strong></span>
              <span><span class="dot gray"></span> Livre: <strong>{{ 100 - systemStatus.disco }}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div class="section" v-if="alertasNaoLidos.length">
        <div class="section-header">
          <h3>⚠️ Alertas Ativos</h3>
          <q-btn flat dense icon="done_all" @click="marcarTodosLidos" label="Marcar todos" />
        </div>
        <div class="alertas-list">
          <div v-for="alerta in alertasNaoLidos.slice(0, 5)" :key="alerta.id" class="alert-item" :class="alerta.nivel">
            <q-icon :name="alerta.nivel === 'critico' ? 'error' : 'warning'" size="20px" />
            <div class="alert-content">
              <div class="alert-titulo">{{ alerta.titulo }}</div>
              <div class="alert-mensagem">{{ alerta.mensagem }}</div>
            </div>
            <q-btn flat dense icon="done" @click="() => marcarLido(alerta.id)" size="sm" />
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="section">
        <div class="section-header">
          <h3>📋 Logs Recentes</h3>
          <q-btn flat dense icon="delete_sweep" @click="confirmarLimparLogs" color="negative" label="Limpar" />
        </div>
        <q-table :rows="logs.slice(0, 10)" :columns="logsColumns" row-key="id" flat bordered dense>
          <template v-slot:body-cell-nivel="props">
            <q-td :props="props"><q-badge :color="getLogNivelColor(props.row.nivel)">{{ props.row.nivel.toUpperCase() }}</q-badge></q-td>
          </template>
        </q-table>
      </div>

      <!-- Informações -->
      <div class="info-card">
        <h3>ℹ️ Informações do Sistema</h3>
        <div class="info-grid">
          <div class="info-item"><span>Uptime:</span><strong>{{ formatarUptime(systemStatus.uptime) }}</strong></div>
          <div class="info-item"><span>Total Alertas:</span><strong>{{ estatisticas.total_alertas }}</strong></div>
          <div class="info-item"><span>Alertas Não Lidos:</span><strong :class="estatisticas.alertas_nao_lidos > 0 ? 'text-negative' : ''">{{ estatisticas.alertas_nao_lidos }}</strong></div>
          <div class="info-item"><span>Disponibilidade:</span><strong>{{ estatisticas.disponibilidade }}%</strong></div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <q-dialog v-model="modalAlertasVisible">
      <q-card style="min-width: 500px">
        <q-card-section><div class="text-h6">Todos os Alertas</div></q-card-section>
        <q-card-section class="alertas-list-modal">
          <div v-for="alerta in alertas" :key="alerta.id" class="alert-item-modal" :class="alerta.nivel">
            <div class="alert-header">
              <q-icon :name="alerta.nivel === 'critico' ? 'error' : 'warning'" size="18px" />
              <span>{{ alerta.titulo }}</span>
              <q-badge :color="alerta.lido ? 'green' : 'red'">{{ alerta.lido ? 'Lido' : 'Não lido' }}</q-badge>
            </div>
            <div class="alert-mensagem">{{ alerta.mensagem }}</div>
            <q-btn v-if="!alerta.lido" flat dense icon="done" @click="() => marcarLido(alerta.id)" label="Marcar como lido" size="sm" />
          </div>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Fechar" v-close-popup /><q-btn flat label="Marcar todos" color="primary" @click="marcarTodosLidos" /></q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminMonitoramentoStore } from 'src/stores/admin/admin-monitoramento-store';
import ChartCard from 'src/components/admin/ChartCard.vue';
import Chart from 'chart.js/auto';

defineOptions({ name: 'AdminMonitoramento' });

const $q = useQuasar();
const monitoramentoStore = useAdminMonitoramentoStore();

const {
  isLoading,
  systemStatus,
  alertas,
  logs,
  metricas,
  estatisticas,
} = storeToRefs(monitoramentoStore);

const {
  recarregarDados,
  marcarAlertaLido,
  marcarTodosAlertasLidos,
  limparLogs,
  testarServico,
  iniciarPolling,
  pararPolling,
  getServiceStatusColor,
  getServiceStatusIcon,
  getServiceStatusLabel,
  getLogNivelColor,
  formatarUptime,
} = monitoramentoStore;

const modalAlertasVisible = ref(false);
const cpuDonutChart = ref<HTMLCanvasElement | null>(null);
const memoriaDonutChart = ref<HTMLCanvasElement | null>(null);
const discoDonutChart = ref<HTMLCanvasElement | null>(null);
let cpuChart: Chart | null = null;
let memoriaChart: Chart | null = null;
let discoChart: Chart | null = null;

const alertasNaoLidos = computed(() => alertas.value.filter(a => !a.lido));

const logsColumns = [
  { name: 'created_at', label: 'Data/Hora', field: 'created_at', align: 'left' as const },
  { name: 'nivel', label: 'Nível', field: 'nivel', align: 'center' as const },
  { name: 'mensagem', label: 'Mensagem', field: 'mensagem', align: 'left' as const },
];

const getProgressColor = (valor: number): string => valor > 80 ? 'negative' : valor > 60 ? 'warning' : 'positive';
const formatarHora = (timestamp: string): string => timestamp ? new Date(timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';

const initDonutCharts = async (): Promise<void> => {
  await nextTick();

  if (cpuDonutChart.value) {
    if (cpuChart) cpuChart.destroy();
    const ctx = cpuDonutChart.value.getContext('2d');
    if (ctx) {
      cpuChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Em uso', 'Livre'], datasets: [{ data: [systemStatus.value.cpu, 100 - systemStatus.value.cpu], backgroundColor: ['#10B981', '#E5E7EB'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: true } } },
      });
    }
  }

  if (memoriaDonutChart.value) {
    if (memoriaChart) memoriaChart.destroy();
    const ctx = memoriaDonutChart.value.getContext('2d');
    if (ctx) {
      memoriaChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Em uso', 'Livre'], datasets: [{ data: [systemStatus.value.memoria, 100 - systemStatus.value.memoria], backgroundColor: ['#10B981', '#E5E7EB'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: true } } },
      });
    }
  }

  if (discoDonutChart.value) {
    if (discoChart) discoChart.destroy();
    const ctx = discoDonutChart.value.getContext('2d');
    if (ctx) {
      discoChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Em uso', 'Livre'], datasets: [{ data: [systemStatus.value.disco, 100 - systemStatus.value.disco], backgroundColor: ['#F59E0B', '#E5E7EB'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: true } } },
      });
    }
  }
};

const updateDonutCharts = (): void => {
  if (cpuChart?.data?.datasets?.[0]) { cpuChart.data.datasets[0].data = [systemStatus.value.cpu, 100 - systemStatus.value.cpu]; cpuChart.update(); }
  if (memoriaChart?.data?.datasets?.[0]) { memoriaChart.data.datasets[0].data = [systemStatus.value.memoria, 100 - systemStatus.value.memoria]; memoriaChart.update(); }
  if (discoChart?.data?.datasets?.[0]) { discoChart.data.datasets[0].data = [systemStatus.value.disco, 100 - systemStatus.value.disco]; discoChart.update(); }
};

watch([() => systemStatus.value.cpu, () => systemStatus.value.memoria, () => systemStatus.value.disco], () => updateDonutCharts());

const atualizarDados = (): void => { void recarregarDados(); };
const marcarLido = (id: number): void => { void marcarAlertaLido(id); };
const marcarTodosLidos = (): void => { void marcarTodosAlertasLidos(); };
const abrirModalAlertas = (): void => { modalAlertasVisible.value = true; };
const testarServicoFn = (servico: string): void => { void testarServico(servico); };
const confirmarLimparLogs = (): void => {
  $q.dialog({
    title: 'Limpar Logs',
    message: 'Tem certeza?',
    cancel: true,
    ok: { label: 'Limpar', color: 'negative' },
  }).onOk(() => { void limparLogs(); });
};

onMounted(async () => {
  await recarregarDados();
  iniciarPolling(3600000);
  await initDonutCharts();
});

onUnmounted(() => {
  pararPolling();
  cpuChart?.destroy();
  memoriaChart?.destroy();
  discoChart?.destroy();
});
</script>

<style scoped lang="scss">
.page-container { background: #f3f4f6; min-height: 100vh; padding: 20px; }
.page-header { background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; h1 { font-size: 24px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; background: white; border-radius: 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); } }
.stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; &.blue { background: rgba(102,126,234,0.1); color: #667eea; } &.green { background: rgba(16,185,129,0.1); color: #10b981; } &.gold { background: rgba(245,158,11,0.1); color: #f59e0b; } &.purple { background: rgba(118,75,162,0.1); color: #764ba2; } &.cyan { background: rgba(6,182,212,0.1); color: #06b6d4; } &.pink { background: rgba(236,72,153,0.1); color: #ec4899; } &.teal { background: rgba(20,184,166,0.1); color: #14b8a6; } &.indigo { background: rgba(99,102,241,0.1); color: #6366f1; } }
.stat-info { flex: 1; .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; } .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; } }
.section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; h3 { margin: 0; } } }
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.service-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 12px; .service-info { flex: 1; display: flex; align-items: center; gap: 12px; .service-name { font-weight: 600; font-size: 14px; } .service-time { font-size: 11px; color: #6b7280; } } }

/* CARD 1 - CPU + Memória juntos - TAMANHO GRANDE */
.donut-card-dual { background: white; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; h3 { margin: 0; font-size: 18px; font-weight: 600; } } }
.donuts-dual { display: flex; justify-content: center; gap: 60px; flex-wrap: wrap; }
.donut-item { text-align: center; min-width: 240px; }
.donut-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; h4 { margin: 0; font-size: 18px; font-weight: 600; color: #374151; } }
.donut-wrapper { position: relative; width: 180px; height: 180px; margin: 0 auto; canvas { width: 180px !important; height: 180px !important; } }
.donut-center-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; .donut-value { font-size: 28px; font-weight: 700; color: #1f2937; } }
.donut-footer { margin-top: 20px; font-size: 13px; display: flex; flex-direction: column; gap: 8px; color: #6b7280; .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; &.green { background: #10B981; } &.orange { background: #F59E0B; } &.gray { background: #E5E7EB; } } strong { color: #1f2937; } }

/* CARD 2 - Disco sozinho - TAMANHO GRANDE */
.donut-card-single { background: white; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; h3 { margin: 0; font-size: 18px; font-weight: 600; } } }
.donut-single { display: flex; justify-content: center; .donut-wrapper { width: 200px; height: 200px; canvas { width: 200px !important; height: 200px !important; } } .donut-footer-single { margin-top: 24px; font-size: 14px; display: flex; justify-content: center; gap: 32px; color: #6b7280; .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; &.orange { background: #F59E0B; } &.gray { background: #E5E7EB; } } strong { color: #1f2937; } } }

.charts-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
.alertas-list { .alert-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #f0f0f0; &.critico { background: rgba(239,68,68,0.05); } .alert-content { flex: 1; .alert-titulo { font-weight: 600; font-size: 13px; } .alert-mensagem { font-size: 11px; color: #6b7280; } } } }
.alertas-list-modal { max-height: 400px; overflow-y: auto; }
.alert-item-modal { padding: 12px; border-bottom: 1px solid #f0f0f0; &.critico { background: rgba(239,68,68,0.05); } .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; } .alert-mensagem { font-size: 12px; } }
.info-card { background: white; border-radius: 16px; padding: 20px; h3 { margin: 0 0 16px 0; font-size: 16px; } .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; .info-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; } } }
.text-negative { color: #ef4444; font-weight: 600; }
.log-mensagem { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
  .donuts-dual { gap: 30px; }
  .donut-wrapper { width: 140px; height: 140px; canvas { width: 140px !important; height: 140px !important; } }
  .donut-center-text .donut-value { font-size: 22px; }
  .donut-single .donut-wrapper { width: 160px; height: 160px; canvas { width: 160px !important; height: 160px !important; } }
}
</style>
