<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Logs do Sistema</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar logs..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn-dropdown flat color="primary" icon="download" label="Exportar">
          <q-list>
            <q-item clickable v-close-popup @click="exportar('csv')">
              <q-item-section avatar><q-icon name="table_chart" /></q-item-section>
              <q-item-section>Exportar CSV</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportar('json')">
              <q-item-section avatar><q-icon name="code" /></q-item-section>
              <q-item-section>Exportar JSON</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportar('excel')">
              <q-item-section avatar><q-icon name="grid_on" /></q-item-section>
              <q-item-section>Exportar Excel</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          flat
          icon="delete_sweep"
          label="Limpar Logs"
          color="negative"
          @click="confirmarLimparLogs"
        />
        <q-btn
          flat
          icon="refresh"
          label="Atualizar"
          @click="recarregarDados"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="receipt_long" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
          <div class="stat-label">Total Logs</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="info" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.por_nivel.info) }}</div>
          <div class="stat-label">Info</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="warning" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.por_nivel.warning) }}</div>
          <div class="stat-label">Warnings</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <q-icon name="error" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.por_nivel.error) }}</div>
          <div class="stat-label">Erros</div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="charts-grid-2cols">
      <!-- Logs por Dia -->
      <ChartCard
        chart-id="logs-dia-chart"
        title="📊 Logs por Dia"
        icon="show_chart"
        iconColor="#667EEA"
        type="line"
        :labels="estatisticas.logs_por_dia.map((l) => formatarDataCurta(l.data))"
        :datasets="[
          {
            label: 'Logs',
            data: estatisticas.logs_por_dia.map((l) => l.total),
            borderColor: '#667EEA',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
          },
        ]"
      />

      <!-- Logs por Ação -->
      <ChartCard
        chart-id="logs-acao-chart"
        title="📋 Logs por Ação"
        icon="category"
        iconColor="#10B981"
        type="bar"
        :labels="Object.keys(estatisticas.por_acao).slice(0, 8)"
        :datasets="[
          {
            label: 'Quantidade',
            data: Object.values(estatisticas.por_acao).slice(0, 8),
            backgroundColor: '#10B981',
          },
        ]"
      />
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <q-select
        v-model="filtros.nivel"
        :options="opcoesNivel"
        label="Nível"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.acao"
        :options="opcoesAcao"
        label="Ação"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.modulo"
        :options="opcoesModulo"
        label="Módulo"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="filtros.ip"
        placeholder="IP"
        dense
        outlined
        class="filter-ip"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="filtros.data_inicio"
        label="Data Início"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="filtros.data_fim"
        label="Data Fim"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando logs...</p>
    </div>

    <!-- Tabela -->
    <q-table
      v-else
      :rows="logs"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
      :pagination="{
        rowsPerPage: paginacao.per_page,
        page: paginacao.current_page,
      }"
    >
      <template v-slot:body-cell-nivel="props">
        <q-td :props="props">
          <q-badge :color="getNivelColor(props.row.nivel)">
            <q-icon :name="getNivelIcon(props.row.nivel)" size="12px" class="q-mr-xs" />
            {{ props.row.nivel.toUpperCase() }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acao="props">
        <q-td :props="props">
          <q-badge :color="getAcaoColor(props.row.acao)">
            <q-icon :name="getAcaoIcon(props.row.acao)" size="12px" class="q-mr-xs" />
            {{ getAcaoLabel(props.row.acao) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-usuario="props">
        <q-td :props="props">
          <div v-if="props.row.user_nome">
            <div class="user-name">{{ props.row.user_nome }}</div>
            <div class="user-email">{{ props.row.user_email }}</div>
          </div>
          <span v-else class="text-grey">Sistema</span>
        </q-td>
      </template>

      <template v-slot:body-cell-descricao="props">
        <q-td :props="props">
          <div class="descricao-cell">
            {{ props.row.descricao }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-data="props">
        <q-td :props="props">
          <div class="data-cell">
            <div>{{ formatarDataRelativa(props.row.created_at) }}</div>
            <div class="data-detalhe">{{ formatarHora(props.row.created_at) }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            icon="visibility"
            color="info"
            size="sm"
            @click="() => verDetalhes(props.row)"
            title="Ver detalhes"
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="no-data">
          <q-icon name="receipt_long" size="48px" color="grey-5" />
          <p>Nenhum log encontrado</p>
        </div>
      </template>
    </q-table>

    <!-- Paginação -->
    <div class="pagination-container" v-if="paginacao.total > 0">
      <q-btn
        flat
        icon="chevron_left"
        :disable="!temPaginaAnterior"
        @click="() => mudarPagina(paginacao.current_page - 1)"
      />
      <span class="pagination-info">
        Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{
          paginacao.total
        }}
        registos)
      </span>
      <q-btn
        flat
        icon="chevron_right"
        :disable="!temProximaPagina"
        @click="() => mudarPagina(paginacao.current_page + 1)"
      />
    </div>

    <!-- Modal Detalhes -->
    <q-dialog v-model="detalhesModalVisible">
      <q-card style="min-width: 550px; max-width: 700px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            <q-icon name="receipt_long" class="q-mr-sm" />
            Detalhes do Log
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="detalhes-body">
          <div class="info-group">
            <div class="info-title">Informações Básicas</div>
            <div class="info-row"><strong>ID:</strong> {{ logDetalhes?.id }}</div>
            <div class="info-row">
              <strong>Nível:</strong>
              <q-badge :color="getNivelColor(logDetalhes?.nivel || 'info')" class="q-ml-sm">
                {{ logDetalhes?.nivel?.toUpperCase() }}
              </q-badge>
            </div>
            <div class="info-row">
              <strong>Ação:</strong>
              <q-badge :color="getAcaoColor(logDetalhes?.acao || 'visualizar')" class="q-ml-sm">
                {{ getAcaoLabel(logDetalhes?.acao || 'visualizar') }}
              </q-badge>
            </div>
            <div class="info-row"><strong>Módulo:</strong> {{ logDetalhes?.modulo }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Descrição</div>
            <div class="info-value descricao">
              {{ logDetalhes?.descricao }}
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Usuário</div>
            <div class="info-row" v-if="logDetalhes?.user_nome">
              <strong>Nome:</strong> {{ logDetalhes.user_nome }}
            </div>
            <div class="info-row" v-if="logDetalhes?.user_email">
              <strong>Email:</strong> {{ logDetalhes.user_email }}
            </div>
            <div class="info-row" v-if="!logDetalhes?.user_nome">
              <span class="text-grey">Sistema (nenhum usuário logado)</span>
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Informações Técnicas</div>
            <div class="info-row"><strong>IP:</strong> {{ logDetalhes?.ip }}</div>
            <div class="info-row">
              <strong>User Agent:</strong>
              <div class="user-agent">{{ logDetalhes?.user_agent }}</div>
            </div>
            <div class="info-row">
              <strong>Data:</strong> {{ formatarDataCompleta(logDetalhes?.created_at) }}
            </div>
          </div>

          <div
            class="info-group"
            v-if="logDetalhes?.dados_anteriores && Object.keys(logDetalhes.dados_anteriores).length"
          >
            <div class="info-title">Dados Anteriores</div>
            <pre class="json-data">{{ JSON.stringify(logDetalhes.dados_anteriores, null, 2) }}</pre>
          </div>

          <div
            class="info-group"
            v-if="logDetalhes?.dados_novos && Object.keys(logDetalhes.dados_novos).length"
          >
            <div class="info-title">Dados Novos</div>
            <pre class="json-data">{{ JSON.stringify(logDetalhes.dados_novos, null, 2) }}</pre>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminLogsStore, type LogSistema } from 'src/stores/admin/admin-logs-store';
import ChartCard from 'src/components/admin/ChartCard.vue';

defineOptions({ name: 'AdminLogs' });

const $q = useQuasar();
const logsStore = useAdminLogsStore();

const {
  isLoading,
  logs,
  estatisticas,
  paginacao,
  filtros,
  opcoesNivel,
  opcoesAcao,
  opcoesModulo,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(logsStore);

const {
  carregarLogs,
  carregarEstatisticas,
  limparLogs,
  exportarLogs,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  getNivelIcon,
  getNivelColor,
  getAcaoIcon,
  getAcaoColor,
  getAcaoLabel,
} = logsStore;

// Estados locais
const detalhesModalVisible = ref(false);
const logDetalhes = ref<LogSistema | null>(null);

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, style: 'width: 60px' },
  { name: 'nivel', label: 'Nível', field: 'nivel', align: 'center' as const, style: 'width: 90px' },
  { name: 'acao', label: 'Ação', field: 'acao', align: 'center' as const, style: 'width: 100px' },
  {
    name: 'usuario',
    label: 'Usuário',
    field: 'usuario',
    align: 'left' as const,
    style: 'min-width: 150px',
  },
  { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left' as const },
  { name: 'ip', label: 'IP', field: 'ip', align: 'left' as const, style: 'width: 120px' },
  {
    name: 'data',
    label: 'Data',
    field: 'created_at',
    align: 'center' as const,
    style: 'width: 110px',
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const, style: 'width: 70px' },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatarDataCurta = (data: string): string => {
  if (!data) return '';
  const d = new Date(data);
  return `${d.getDate()}/${d.getMonth() + 1}`;
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

const formatarHora = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const formatarDataCompleta = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Ações
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('nivel', filtros.value.nivel);
  setFiltro('acao', filtros.value.acao);
  setFiltro('modulo', filtros.value.modulo);
  setFiltro('data_inicio', filtros.value.data_inicio);
  setFiltro('data_fim', filtros.value.data_fim);
  setFiltro('ip', filtros.value.ip);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// ✅ CORRIGIDO: Tipo LogSistema em vez de any ou Log
const verDetalhes = (log: LogSistema): void => {
  logDetalhes.value = log;
  detalhesModalVisible.value = true;
};

// ✅ CORRIGIDO: onOk sem async/await direto
const confirmarLimparLogs = (): void => {
  $q.dialog({
    title: 'Limpar Logs',
    message:
      'Tem certeza que deseja limpar todos os logs do sistema? Esta ação não pode ser desfeita.',
    cancel: true,
    ok: { label: 'Limpar', color: 'negative' },
  }).onOk(() => {
    void executarLimparLogs();
  });
};

const executarLimparLogs = async (): Promise<void> => {
  const success = await limparLogs();
  if (success) {
    $q.notify({ type: 'positive', message: 'Logs limpos com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao limpar logs' });
  }
};

const exportar = async (formato: 'csv' | 'json' | 'excel'): Promise<void> => {
  const blob = await exportarLogs(formato);
  if (blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `logs_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : formato}`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    $q.notify({ type: 'positive', message: 'Logs exportados com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao exportar logs' });
  }
};

// Lifecycle
onMounted(() => {
  void carregarLogs();
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
    flex-wrap: wrap;

    .search-input {
      width: 250px;
    }

    .filter-ip {
      width: 120px;
    }
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;

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

    &.blue {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.orange {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.red {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
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

.charts-grid-2cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .filter-select {
    min-width: 150px;
  }

  .filter-date {
    width: 150px;
  }

  .filter-ip {
    width: 140px;
  }

  .clear-btn {
    color: #6b7280;
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

.user-name {
  font-weight: 500;
  font-size: 13px;
  color: #1a1a2e;
}

.user-email {
  font-size: 11px;
  color: #6b7280;
}

.descricao-cell {
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-cell {
  text-align: center;

  .data-detalhe {
    font-size: 11px;
    color: #9ca3af;
  }
}

.no-data {
  text-align: center;
  padding: 48px;
  color: #9ca3af;

  p {
    margin-top: 12px;
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin-top: 20px;

  .pagination-info {
    font-size: 14px;
    color: #6b7280;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.modal-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.detalhes-body {
  padding: 20px;

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row {
      font-size: 13px;
      color: #374151;
      margin-bottom: 6px;
    }

    .info-value.descricao {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .user-agent {
      font-size: 11px;
      color: #6b7280;
      font-family: monospace;
      word-break: break-all;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 6px;
      margin-top: 4px;
    }

    .json-data {
      background: #1e1e2e;
      color: #fff;
      padding: 12px;
      border-radius: 8px;
      font-size: 11px;
      overflow-x: auto;
      margin: 0;
    }
  }
}

@media (max-width: 900px) {
  .charts-grid-2cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;

    .header-actions {
      flex-direction: column;

      .search-input {
        width: 100%;
      }
    }
  }

  .filters-bar {
    flex-direction: column;

    .filter-select,
    .filter-date,
    .filter-ip {
      width: 100%;
    }
  }

  .descricao-cell {
    max-width: 150px;
  }
}
</style>
