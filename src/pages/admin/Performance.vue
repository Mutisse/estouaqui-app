<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Performance do Sistema</h1>
      <div class="header-actions">
        <q-select
          v-model="filtros.periodo"
          :options="opcoesPeriodo"
          label="Período"
          dense
          outlined
          style="width: 150px"
          emit-value
          map-options
          @update:model-value="onFiltroChange"
        />
        <q-btn color="primary" icon="refresh" label="Atualizar" @click="recarregarDados" :loading="isLoading" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando métricas do sistema...</p>
    </div>

    <div v-else>
      <!-- KPIs Principais -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <q-icon name="speed" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dados.metricas_atuais.tempo_resposta }}ms</div>
            <div class="stat-label">Tempo de Resposta</div>
            <div class="stat-trend" :class="getTrendClass(dados.metricas_atuais.tempo_resposta, 200)">
              {{ getTrendIcon(dados.metricas_atuais.tempo_resposta, 200) }} {{ getTrendText(dados.metricas_atuais.tempo_resposta, 200) }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <q-icon name="memory" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dados.metricas_atuais.uso_memoria }}%</div>
            <div class="stat-label">Uso de Memória</div>
            <q-linear-progress :value="dados.metricas_atuais.uso_memoria / 100" color="green" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gold">
            <q-icon name="storage" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dados.metricas_atuais.espaco_disco }}%</div>
            <div class="stat-label">Espaço em Disco</div>
            <q-linear-progress :value="dados.metricas_atuais.espaco_disco / 100" color="orange" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <q-icon name="online_prediction" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dados.metricas_atuais.requisicoes }} req/s</div>
            <div class="stat-label">Requisições/Segundo</div>
          </div>
        </div>
      </div>

      <!-- Segunda Linha de KPIs -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <q-icon name="developer_board" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dados.metricas_atuais.cpu_usage }}%</div>
            <div class="stat-label">Uso de CPU</div>
            <q-linear-progress :value="dados.metricas_atuais.cpu_usage / 100" color="cyan" class="q-mt-sm" />
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pink">
            <q-icon name="people" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(dados.metricas_atuais.usuarios_online) }}</div>
            <div class="stat-label">Usuários Online</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon teal">
            <q-icon name="shopping_cart" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(dados.metricas_atuais.pedidos_hoje) }}</div>
            <div class="stat-label">Pedidos Hoje</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon indigo">
            <q-icon name="payments" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatMoney(dados.metricas_atuais.faturamento_hoje) }}</div>
            <div class="stat-label">Faturamento Hoje</div>
          </div>
        </div>
      </div>

      <!-- Gráficos - Layout 2 colunas -->
      <div class="charts-grid-2cols">
        <!-- Gráfico de Tempo de Resposta -->
        <ChartCard
          chart-id="tempo-resposta-chart"
          title="📈 Tempo de Resposta (ms)"
          icon="speed"
          iconColor="#667EEA"
          type="line"
          :labels="dados.historico_tempo_resposta.map(h => formatarHora(h.timestamp))"
          :datasets="[{
            label: 'Tempo de Resposta (ms)',
            data: dados.historico_tempo_resposta.map(h => h.valor),
            borderColor: '#667EEA',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true
          }]"
        />

        <!-- Gráfico de Uso de CPU -->
        <ChartCard
          chart-id="cpu-chart"
          title="🖥️ Uso de CPU (%)"
          icon="developer_board"
          iconColor="#06B6D4"
          type="line"
          :labels="dados.historico_cpu.map(h => formatarHora(h.timestamp))"
          :datasets="[{
            label: 'CPU (%)',
            data: dados.historico_cpu.map(h => h.valor),
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true
          }]"
        />
      </div>

      <div class="charts-grid-2cols">
        <!-- Gráfico de Uso de Memória -->
        <ChartCard
          chart-id="memoria-chart"
          title="💾 Uso de Memória (%)"
          icon="memory"
          iconColor="#10B981"
          type="line"
          :labels="dados.historico_memoria.map(h => formatarHora(h.timestamp))"
          :datasets="[{
            label: 'Memória (%)',
            data: dados.historico_memoria.map(h => h.valor),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
          }]"
        />

        <!-- Gráfico de Requisições por Segundo -->
        <ChartCard
          chart-id="requisicoes-chart"
          title="📡 Requisições por Segundo"
          icon="online_prediction"
          iconColor="#F59E0B"
          type="line"
          :labels="dados.historico_requisicoes.map(h => formatarHora(h.timestamp))"
          :datasets="[{
            label: 'req/s',
            data: dados.historico_requisicoes.map(h => h.valor),
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true
          }]"
        />
      </div>

      <!-- Tabela de Top Endpoints -->
      <div class="section">
        <div class="section-header">
          <h3>🌐 Top Endpoints Mais Acessados</h3>
          <q-icon name="api" size="20px" color="primary" />
        </div>
        <q-table
          :rows="dados.top_endpoints"
          :columns="topEndpointsColumns"
          row-key="endpoint"
          flat
          bordered
          dense
        >
          <template v-slot:body-cell-metodo="props">
            <q-td :props="props">
              <q-badge :color="getMethodColor(props.row.metodo)">
                {{ props.row.metodo }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-tempo_medio="props">
            <q-td :props="props">
              <span :class="getTempoMedioClass(props.row.tempo_medio)">
                {{ props.row.tempo_medio }}ms
              </span>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Tabela de Logs de Erro -->
      <div class="section">
        <div class="section-header">
          <h3>⚠️ Últimos Erros do Sistema</h3>
          <q-icon name="bug_report" size="20px" color="negative" />
        </div>
        <q-table
          :rows="dados.logs_erro"
          :columns="logsColumns"
          row-key="id"
          flat
          bordered
          dense
        >
          <template v-slot:body-cell-nivel="props">
            <q-td :props="props">
              <q-badge :color="getNivelColor(props.row.nivel)">
                {{ props.row.nivel.toUpperCase() }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-mensagem="props">
            <q-td :props="props">
              <div class="log-mensagem">{{ props.row.mensagem }}</div>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Informações do Sistema -->
      <div class="info-card">
        <div class="card-header">
          <h3>ℹ️ Informações do Sistema</h3>
          <q-icon name="info" size="20px" color="grey" />
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Uptime:</span>
            <span class="info-value">{{ formatarUptime(dados.metricas_atuais.uptime) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Consultas Banco de Dados:</span>
            <span class="info-value">{{ formatNumber(dados.metricas_atuais.database_queries) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Cache Hit Rate:</span>
            <span class="info-value">{{ dados.metricas_atuais.cache_hit_rate }}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Taxa de Erro:</span>
            <span class="info-value" :class="getErroRateClass(dados.metricas_atuais.erro_rate)">
              {{ dados.metricas_atuais.erro_rate }}%
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Última atualização:</span>
            <span class="info-value">{{ formatarDataCompleta(ultimaAtualizacao) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminPerformanceStore } from 'src/stores/admin/admin-performance-store';
import ChartCard from 'src/components/admin/ChartCard.vue';

defineOptions({ name: 'AdminPerformance' });

const performanceStore = useAdminPerformanceStore();

const {
  isLoading,
  dados,
  filtros,
  ultimaAtualizacao,
} = storeToRefs(performanceStore);

const {
  carregarPerformance,
  iniciarPolling,
  pararPolling,
  recarregarDados,
  setFiltro,
} = performanceStore;

// Opções
const opcoesPeriodo = [
  { label: 'Última Hora', value: 'ultima_hora' },
  { label: 'Hoje', value: 'hoje' },
  { label: 'Última Semana', value: 'ultima_semana' },
  { label: 'Último Mês', value: 'ultimo_mes' },
];

// Colunas das tabelas
const topEndpointsColumns = [
  { name: 'endpoint', label: 'Endpoint', field: 'endpoint', align: 'left' as const },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'center' as const },
  { name: 'total', label: 'Total Requisições', field: 'total', align: 'center' as const },
  { name: 'tempo_medio', label: 'Tempo Médio', field: 'tempo_medio', align: 'right' as const },
];

const logsColumns = [
  { name: 'created_at', label: 'Data/Hora', field: 'created_at', align: 'left' as const },
  { name: 'nivel', label: 'Nível', field: 'nivel', align: 'center' as const },
  { name: 'mensagem', label: 'Mensagem', field: 'mensagem', align: 'left' as const },
  { name: 'arquivo', label: 'Arquivo', field: 'arquivo', align: 'left' as const },
  { name: 'linha', label: 'Linha', field: 'linha', align: 'center' as const },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const formatarHora = (timestamp: string): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatarDataCompleta = (data?: Date | null): string => {
  if (!data) return '—';
  return data.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatarUptime = (segundos: number): string => {
  if (!segundos) return '—';
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor((segundos % 86400) / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const partes = [];
  if (dias > 0) partes.push(`${dias}d`);
  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}m`);
  return partes.join(' ') || '< 1m';
};

const getTrendClass = (valor: number, limite: number): string => {
  return valor <= limite ? 'trend-good' : 'trend-bad';
};

const getTrendIcon = (valor: number, limite: number): string => {
  return valor <= limite ? '⬇️' : '⬆️';
};

const getTrendText = (valor: number, limite: number): string => {
  const diff = valor - limite;
  return valor <= limite ? `${Math.abs(diff)}ms abaixo` : `${diff}ms acima`;
};

const getMethodColor = (metodo: string): string => {
  const colors: Record<string, string> = {
    GET: 'primary',
    POST: 'positive',
    PUT: 'warning',
    DELETE: 'negative',
    PATCH: 'info',
  };
  return colors[metodo] || 'grey';
};

const getTempoMedioClass = (tempo: number): string => {
  if (tempo < 100) return 'text-positive';
  if (tempo < 500) return 'text-warning';
  return 'text-negative';
};

const getNivelColor = (nivel: string): string => {
  const colors: Record<string, string> = {
    error: 'negative',
    warning: 'warning',
    info: 'info',
  };
  return colors[nivel] || 'grey';
};

const getErroRateClass = (taxa: number): string => {
  if (taxa < 1) return 'text-positive';
  if (taxa < 5) return 'text-warning';
  return 'text-negative';
};

// Ações
const onFiltroChange = (): void => {
  setFiltro('periodo', filtros.value.periodo);
};

// Lifecycle
onMounted(() => {
  void carregarPerformance();
  iniciarPolling(10000); // Atualiza a cada 10 segundos
});

onUnmounted(() => {
  pararPolling();
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
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue { background: rgba(102, 126, 234, 0.1); color: #667eea; }
    &.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.gold { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.purple { background: rgba(118, 75, 162, 0.1); color: #764ba2; }
    &.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
    &.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
    &.teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
    &.indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  }

  .stat-info {
    flex: 1;

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
      font-size: 11px;
      margin-top: 4px;

      &.trend-good { color: #10b981; }
      &.trend-bad { color: #ef4444; }
    }
  }
}

.charts-grid-2cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.section {
  background: white;
  border-radius: 16px;
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

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #1a1a2e;
    }
  }
}

.info-card {
  background: white;
  border-radius: 16px;
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

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      .info-label {
        font-size: 13px;
        color: #6b7280;
      }

      .info-value {
        font-size: 13px;
        font-weight: 500;
        color: #1f2937;
      }
    }
  }
}

.log-mensagem {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-positive { color: #10b981; font-weight: 600; }
.text-warning { color: #f59e0b; font-weight: 600; }
.text-negative { color: #ef4444; font-weight: 600; }

@media (max-width: 900px) {
  .charts-grid-2cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
