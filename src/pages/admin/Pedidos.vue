<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Pedidos</h1>
      <div class="header-actions">
        <q-input
          v-model="searchTerm"
          placeholder="Pesquisar por número, cliente ou prestador..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Cards de Estatísticas + Gráfico Donut -->
    <div class="stats-dashboard">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon blue">
            <q-icon name="receipt_long" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
            <div class="stat-label">Total Pedidos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">
            <q-icon name="pending" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticas.pendentes) }}</div>
            <div class="stat-label">Pendentes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <q-icon name="build" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ formatNumber((estatisticas.aceitos || 0) + (estatisticas.em_andamento || 0)) }}
            </div>
            <div class="stat-label">Em Andamento</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <q-icon name="check_circle" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticas.concluidos) }}</div>
            <div class="stat-label">Concluídos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">
            <q-icon name="cancel" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(estatisticas.cancelados) }}</div>
            <div class="stat-label">Cancelados</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon teal">
            <q-icon name="payments" size="28px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatMoney(estatisticas.valor_total) }}</div>
            <div class="stat-label">Faturamento</div>
          </div>
        </div>
      </div>

      <div class="stats-chart">
        <div class="chart-header">
          <h3>Distribuição de Pedidos</h3>
          <span class="chart-total">{{ estatisticas.total }} pedidos</span>
        </div>
        <div class="chart-container">
          <canvas ref="donutChartRef"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item" v-for="item in dadosGrafico" :key="item.label">
            <span class="legend-color" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ formatNumber(item.value) }}</span>
            <span class="legend-percent">{{ item.percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <q-select
        v-model="statusFilter"
        :options="opcoesStatus"
        label="Status"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="dataInicioFilter"
        label="Data Início"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="dataFimFilter"
        label="Data Fim"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <div class="actions-bar">
      <q-btn
        flat
        icon="refresh"
        label="Atualizar"
        @click="handleRecarregarDados"
        :loading="isLoading"
      />
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando pedidos...</p>
    </div>

    <q-table
      v-else
      :rows="pedidosFiltrados"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-valor="props">
        <q-td :props="props">
          <span class="valor-cell">{{ formatMoney(props.row.valor || 0) }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-propostas="props">
        <q-td :props="props">
          <q-badge
            :color="(props.row.total_propostas || 0) > 0 ? 'primary' : 'grey'"
            class="cursor-pointer"
            @click="() => handleAbrirPropostas(props.row)"
          >
            {{ props.row.total_propostas || 0 }} proposta(s)
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-data="props">
        <q-td :props="props">
          {{ formatarData(props.row.created_at) }}
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
            @click="() => handleAbrirDetalhes(props.row)"
          />
          <q-btn
            flat
            round
            icon="edit"
            color="primary"
            size="sm"
            @click="() => handleEditarStatus(props.row)"
          />
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="() => handleConfirmarExclusao(props.row)"
            v-if="props.row.status === 'pendente'"
          />
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => handleMudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{ paginacao.total }}
            registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => handleMudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>
    </q-table>

    <!-- Modal Detalhes do Pedido -->
    <q-dialog v-model="detalhesModalVisible">
      <q-card style="min-width: 500px; max-width: 650px">
        <q-card-section class="detalhes-header">
          <div class="text-h6">Pedido #{{ pedidoDetalhes?.numero }}</div>
          <q-badge :color="getStatusColor(pedidoDetalhes?.status || 'pendente')" class="status-badge">
            {{ getStatusLabel(pedidoDetalhes?.status || 'pendente') }}
          </q-badge>
        </q-card-section>

        <q-card-section class="detalhes-body">
          <div class="info-group">
            <div class="info-title">Cliente</div>
            <div class="info-content">
              <div class="info-name">{{ pedidoDetalhes?.cliente?.nome || '—' }}</div>
              <div class="info-contact">{{ pedidoDetalhes?.cliente?.email || '—' }}</div>
              <div class="info-contact">{{ pedidoDetalhes?.cliente?.telefone || '—' }}</div>
            </div>
          </div>

          <div class="info-group" v-if="pedidoDetalhes?.prestador">
            <div class="info-title">Prestador</div>
            <div class="info-content">
              <div class="info-name">{{ pedidoDetalhes.prestador.nome }}</div>
              <div class="info-contact">{{ pedidoDetalhes.prestador.email }}</div>
              <div class="info-contact">{{ pedidoDetalhes.prestador.telefone }}</div>
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Detalhes do Serviço</div>
            <div class="info-content">
              <div class="info-row">
                <strong>Categoria:</strong> {{ pedidoDetalhes?.categoria?.nome || '—' }}
              </div>
              <div class="info-row">
                <strong>Descrição:</strong> {{ pedidoDetalhes?.descricao || '—' }}
              </div>
              <div class="info-row">
                <strong>Endereço:</strong> {{ pedidoDetalhes?.endereco || '—' }}
              </div>
              <div class="info-row">
                <strong>Valor:</strong> {{ formatMoney(pedidoDetalhes?.valor || 0) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="detalhes-actions">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Propostas -->
    <q-dialog v-model="propostasModalVisible">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section class="detalhes-header">
          <div class="text-h6">Propostas para o Pedido</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-for="proposta in propostasPedido" :key="proposta.id" class="proposta-item">
            <div class="proposta-prestador">
              <strong>{{ proposta.prestador?.nome }}</strong>
              <span class="proposta-profissao">{{ proposta.prestador?.profissao }}</span>
            </div>
            <div class="proposta-valor">{{ formatMoney(proposta.valor) }}</div>
            <div class="proposta-mensagem">{{ proposta.mensagem || 'Sem mensagem' }}</div>
            <div class="proposta-status">
              <q-badge
                :color="
                  proposta.status === 'pendente'
                    ? 'orange'
                    : proposta.status === 'aceita'
                      ? 'green'
                      : 'red'
                "
              >
                {{
                  proposta.status === 'pendente'
                    ? 'Pendente'
                    : proposta.status === 'aceita'
                      ? 'Aceita'
                      : 'Recusada'
                }}
              </q-badge>
            </div>
          </div>
          <div v-if="propostasPedido.length === 0" class="no-propostas">
            <p>Nenhuma proposta para este pedido</p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="detalhes-actions">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminPedidosStore } from 'src/stores/admin/admin-pedidos-store';
import type { Pedido } from 'src/stores/admin/admin-pedidos-store';
import { Chart, registerables, type TooltipItem } from 'chart.js';

Chart.register(...registerables);

defineOptions({ name: 'AdminPedidos' });

const $q = useQuasar();
const pedidosStore = useAdminPedidosStore();

const {
  isLoading,
  estatisticas,
  paginacao,
  opcoesStatus,
  temPaginaAnterior,
  temProximaPagina,
  pedidosFiltrados,
  propostasPedido,
} = storeToRefs(pedidosStore);

const {
  carregarPedidos,
  buscarPedido,
  buscarPropostasDoPedido,
  excluirPedido,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  getStatusLabel,
  getStatusColor,
  formatMoney,
  formatarData,
} = pedidosStore;

// Filtros locais para binding no template
const searchTerm = ref('');
const statusFilter = ref('');
const dataInicioFilter = ref('');
const dataFimFilter = ref('');

const detalhesModalVisible = ref(false);
const propostasModalVisible = ref(false);
const pedidoDetalhes = ref<Pedido | null>(null);
const donutChartRef = ref<HTMLCanvasElement | null>(null);
let donutChartInstance: Chart | null = null;

const dadosGrafico = computed(() => {
  const total = estatisticas.value.total || 1;
  return [
    {
      label: 'Pendentes',
      value: estatisticas.value.pendentes,
      color: '#F59E0B',
      percent: Math.round((estatisticas.value.pendentes / total) * 100),
    },
    {
      label: 'Aceitos',
      value: estatisticas.value.aceitos || 0,
      color: '#3B82F6',
      percent: Math.round(((estatisticas.value.aceitos || 0) / total) * 100),
    },
    {
      label: 'Em Andamento',
      value: estatisticas.value.em_andamento || 0,
      color: '#8B5CF6',
      percent: Math.round(((estatisticas.value.em_andamento || 0) / total) * 100),
    },
    {
      label: 'Concluídos',
      value: estatisticas.value.concluidos,
      color: '#10B981',
      percent: Math.round((estatisticas.value.concluidos / total) * 100),
    },
    {
      label: 'Cancelados',
      value: estatisticas.value.cancelados,
      color: '#EF4444',
      percent: Math.round((estatisticas.value.cancelados / total) * 100),
    },
  ];
});

const initDonutChart = (): void => {
  if (!donutChartRef.value) return;
  if (donutChartInstance) donutChartInstance.destroy();

  const ctx = donutChartRef.value.getContext('2d');
  if (!ctx) return;

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dadosGrafico.value.map((d) => d.label),
      datasets: [
        {
          data: dadosGrafico.value.map((d) => d.value),
          backgroundColor: dadosGrafico.value.map((d) => d.color),
          borderWidth: 0,
          hoverOffset: 10,
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
            label: (tooltipItem: TooltipItem<'doughnut'>) => {
              const label = tooltipItem.label || '';
              const value = tooltipItem.raw as number;
              const total = dadosGrafico.value.reduce((acc, d) => acc + d.value, 0);
              const percent = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${new Intl.NumberFormat('pt-PT').format(value)} (${percent}%)`;
            },
          },
        },
      },
    },
  });
};

watch(estatisticas, () => {
  setTimeout(() => initDonutChart(), 100);
});

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'numero', label: 'Número', field: 'numero', align: 'left' as const },
  {
    name: 'cliente',
    label: 'Cliente',
    field: (row: Pedido) => row.cliente?.nome || '—',
    align: 'left' as const,
  },
  {
    name: 'prestador',
    label: 'Prestador',
    field: (row: Pedido) => row.prestador?.nome || '—',
    align: 'left' as const,
  },
  {
    name: 'categoria',
    label: 'Categoria',
    field: (row: Pedido) => row.categoria?.nome || '—',
    align: 'left' as const,
  },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'propostas', label: 'Propostas', field: 'total_propostas', align: 'center' as const },
  { name: 'data', label: 'Data', field: 'created_at', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const },
];

const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num);

const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('status', statusFilter.value);
  setFiltro('data_inicio', dataInicioFilter.value);
  setFiltro('data_fim', dataFimFilter.value);
};

const handleLimparFiltros = (): void => {
  searchTerm.value = '';
  statusFilter.value = '';
  dataInicioFilter.value = '';
  dataFimFilter.value = '';
  limparFiltros();
};

const handleMudarPagina = (page: number): void => mudarPagina(page);
const handleRecarregarDados = (): void => void recarregarDados();

const handleAbrirDetalhes = (pedido: Pedido): void => {
  void buscarPedido(pedido.id).then((dados) => {
    if (dados) {
      pedidoDetalhes.value = dados;
      detalhesModalVisible.value = true;
    }
  });
};

const handleAbrirPropostas = (pedido: Pedido): void => {
  void buscarPropostasDoPedido(pedido.id).then(() => {
    propostasModalVisible.value = true;
  });
};

const executarAtualizarStatus = async (id: number, status: string): Promise<void> => {
  const success = await pedidosStore.atualizarStatusPedido(id, status);
  if (success) {
    $q.notify({ type: 'positive', message: 'Status atualizado!' });
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar status' });
  }
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirPedido(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Pedido excluído!' });
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir pedido' });
  }
};

const handleEditarStatus = (pedido: Pedido): void => {
  $q.dialog({
    title: 'Alterar Status',
    message: `Deseja alterar o status do pedido #${pedido.numero}?`,
    cancel: true,
    options: {
      type: 'radio',
      model: pedido.status,
      items: [
        { label: 'Pendente', value: 'pendente' },
        { label: 'Aceito', value: 'aceito' },
        { label: 'Em andamento', value: 'em_andamento' },
        { label: 'Concluído', value: 'concluido' },
        { label: 'Cancelado', value: 'cancelado' },
      ],
    },
  }).onOk((status: string) => {
    void executarAtualizarStatus(pedido.id, status);
  });
};

const handleConfirmarExclusao = (pedido: Pedido): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o pedido #${pedido.numero}?`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(pedido.id);
  });
};

onMounted(async () => {
  await carregarPedidos();
  setTimeout(() => initDonutChart(), 100);
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

    .search-input {
      width: 320px;
    }
  }
}

.stats-dashboard {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stats-cards {
  flex: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
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
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    &.orange {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.purple {
      background: rgba(118, 75, 162, 0.1);
      color: #764ba2;
    }
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.red {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    &.teal {
      background: rgba(20, 184, 166, 0.1);
      color: #14b8a6;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
}

.stats-chart {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #1a1a2e;
    }

    .chart-total {
      font-size: 13px;
      color: #667eea;
      font-weight: 600;
    }
  }

  .chart-container {
    height: 180px;
    position: relative;
    margin-bottom: 16px;
  }

  .chart-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }

      .legend-label {
        flex: 1;
        color: #374151;
      }

      .legend-value {
        font-weight: 600;
        color: #1a1a2e;
      }

      .legend-percent {
        color: #6b7280;
        font-size: 11px;
        min-width: 40px;
        text-align: right;
      }
    }
  }
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

  .clear-btn {
    color: #6b7280;
  }
}

.actions-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: flex-end;
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

.valor-cell {
  font-weight: 600;
  color: #10b981;
}

.cursor-pointer {
  cursor: pointer;
}

.detalhes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.detalhes-body {
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
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-content {
      .info-name {
        font-weight: 500;
        color: #1a1a2e;
      }
      .info-contact {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }
      .info-row {
        font-size: 13px;
        color: #374151;
        margin-bottom: 6px;
      }
    }
  }
}

.detalhes-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.proposta-item {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 12px;

  .proposta-prestador {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .proposta-profissao {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .proposta-valor {
    font-size: 18px;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 8px;
  }

  .proposta-mensagem {
    font-size: 13px;
    color: #374151;
    margin-bottom: 8px;
  }
}

.no-propostas {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

@media (max-width: 900px) {
  .stats-dashboard {
    flex-direction: column;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
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
    .filter-date {
      width: 100%;
    }
  }
}
</style>
