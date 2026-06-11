<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Avaliações</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por cliente ou prestador..."
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

    <!-- ✅ Estatísticas em Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="star_rate" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas?.total || 0) }}</div>
          <div class="stat-label">Total Avaliações</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="star" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ (estatisticas?.media_global || 0).toFixed(1) }}</div>
          <div class="stat-label">Média Global</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="thumb_up" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas?.por_nota?.nota_5 || 0) }}</div>
          <div class="stat-label">5 Estrelas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="handyman" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas?.top_prestadores?.length || 0) }}</div>
          <div class="stat-label">Top Prestadores</div>
        </div>
      </div>
    </div>

    <!-- ✅ Distribuição de Notas (Barras) -->
    <div class="section" v-if="(estatisticas?.total || 0) > 0">
      <div class="section-header">
        <h2>📊 Distribuição de Avaliações</h2>
      </div>
      <div class="rating-distribution">
        <div class="rating-bar-item" v-for="nota in [5,4,3,2,1]" :key="nota">
          <div class="rating-label">
            <q-icon name="star" color="amber" size="16px" />
            <span>{{ nota }}</span>
          </div>
          <div class="rating-bar-container">
            <div class="rating-bar" :style="{ width: getPercentualNota(nota) + '%' }"></div>
          </div>
          <div class="rating-count">{{ getQuantidadeNota(nota) }}</div>
        </div>
      </div>
    </div>

    <!-- ✅ Filtros -->
    <div class="filters-bar">
      <q-select
        v-model="filtros.nota"
        :options="opcoesNota"
        label="Nota"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.status"
        :options="opcoesStatus"
        label="Status"
        dense
        outlined
        clearable
        class="filter-select"
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
      <q-btn flat label="Limpar Filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <div class="actions-bar">
      <q-btn flat icon="refresh" label="Atualizar" @click="recarregarDados" :loading="isLoading" />
    </div>

    <!-- ✅ Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando avaliações...</p>
    </div>

    <!-- ✅ Tabela -->
    <q-table
      v-else
      :rows="avaliacoes"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
      :pagination="{
        rowsPerPage: paginacao.per_page,
        page: paginacao.current_page
      }"
    >
      <template v-slot:no-data>
        <div class="no-data">
          <q-icon name="info" size="40px" color="grey-5" />
          <p>Nenhuma avaliação encontrada</p>
        </div>
      </template>

      <template v-slot:body-cell-cliente="props">
        <q-td :props="props">
          <div class="user-cell">
            <q-avatar size="32px" class="q-mr-sm">
              <img :src="getAvatarUrl(props.row.cliente?.nome || '')" />
            </q-avatar>
            <div>
              <div class="user-name">{{ props.row.cliente?.nome || '—' }}</div>
              <div class="user-email">{{ props.row.cliente?.email || '—' }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-prestador="props">
        <q-td :props="props">
          <div class="user-cell">
            <q-avatar size="32px" class="q-mr-sm">
              <img :src="getAvatarUrl(props.row.prestador?.nome || '')" />
            </q-avatar>
            <div>
              <div class="user-name">{{ props.row.prestador?.nome || '—' }}</div>
              <div class="user-profissao">{{ props.row.prestador?.profissao || '—' }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-nota="props">
        <q-td :props="props">
          <div class="rating-stars">
            <q-icon v-for="n in 5" :key="n"
                    :name="n <= props.row.nota ? 'star' : 'star_outline'"
                    color="amber" size="16px" />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-comentario="props">
        <q-td :props="props">
          <div class="comentario-cell">
            {{ props.row.comentario || 'Sem comentário' }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ getStatusLabel(props.row.status) }}
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
          <q-btn flat round icon="visibility" color="info" size="sm" @click="() => verAvaliacao(props.row)" />
          <q-btn
            v-if="props.row.status === 'pendente'"
            flat round icon="check" color="positive" size="sm"
            @click="() => confirmarAprovacao(props.row)"
          />
          <q-btn
            v-if="props.row.status === 'pendente'"
            flat round icon="close" color="negative" size="sm"
            @click="() => confirmarRejeicao(props.row)"
          />
          <q-btn flat round icon="delete" color="negative" size="sm" @click="() => confirmarExclusao(props.row)" />
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => mudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            Página {{ paginacao.current_page }} de {{ paginacao.last_page || 1 }}
            ({{ paginacao.total || 0 }} registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => mudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>
    </q-table>

    <!-- Modal Detalhes -->
    <q-dialog v-model="detalhesModalVisible">
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="detalhes-header">
          <div class="text-h6">Avaliação #{{ avaliacaoDetalhes?.id }}</div>
          <q-badge :color="getStatusColor(avaliacaoDetalhes?.status || 'pendente')">
            {{ getStatusLabel(avaliacaoDetalhes?.status || 'pendente') }}
          </q-badge>
        </q-card-section>

        <q-card-section class="detalhes-body">
          <div class="info-group">
            <div class="info-title">Avaliação</div>
            <div class="rating-stars big">
              <q-icon v-for="n in 5" :key="n"
                      :name="n <= (avaliacaoDetalhes?.nota || 0) ? 'star' : 'star_outline'"
                      color="amber" size="28px" />
            </div>
            <div class="rating-value">{{ avaliacaoDetalhes?.nota || 0 }} / 5</div>
          </div>

          <div class="info-group" v-if="avaliacaoDetalhes?.comentario">
            <div class="info-title">Comentário</div>
            <div class="info-value comentario">
              {{ avaliacaoDetalhes.comentario }}
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Cliente</div>
            <div class="info-content">
              <div class="info-name">{{ avaliacaoDetalhes?.cliente?.nome || '—' }}</div>
              <div class="info-contact">{{ avaliacaoDetalhes?.cliente?.email || '—' }}</div>
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Prestador</div>
            <div class="info-content">
              <div class="info-name">{{ avaliacaoDetalhes?.prestador?.nome || '—' }}</div>
              <div class="info-contact">{{ avaliacaoDetalhes?.prestador?.email || '—' }}</div>
              <div class="info-contact">{{ avaliacaoDetalhes?.prestador?.profissao || '—' }}</div>
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Data</div>
            <div class="info-content">
              <div class="info-row">{{ formatarDataCompleta(avaliacaoDetalhes?.created_at || '') }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="detalhes-actions">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn
            v-if="avaliacaoDetalhes?.status === 'pendente'"
            flat label="Aprovar" color="positive" @click="aprovarAvaliacaoModal"
          />
          <q-btn
            v-if="avaliacaoDetalhes?.status === 'pendente'"
            flat label="Rejeitar" color="negative" @click="abrirModalRejeicao"
          />
          <q-btn flat label="Excluir" color="negative" @click="confirmarExclusaoModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Rejeitar -->
    <q-dialog v-model="rejeicaoModalVisible">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Rejeitar Avaliação</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="motivoRejeicao"
            label="Motivo da rejeição"
            type="textarea"
            dense
            outlined
            rows="3"
            placeholder="Informe o motivo da rejeição..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Rejeitar" color="negative" @click="executarRejeicao" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminAvaliacoesStore } from 'src/stores/admin/admin-avaliacoes-store';
import type { Avaliacao } from 'src/stores/admin/admin-avaliacoes-store';

defineOptions({ name: 'AdminAvaliacoes' });

const $q = useQuasar();
const avaliacoesStore = useAdminAvaliacoesStore();

const {
  isLoading,
  isSaving,
  avaliacoes,
  estatisticas,
  paginacao,
  filtros,
  opcoesNota,
  opcoesStatus,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(avaliacoesStore);

const {
  carregarAvaliacoes,
  carregarEstatisticas,
  buscarAvaliacao,
  aprovarAvaliacao,
  rejeitarAvaliacao,
  excluirAvaliacao,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
} = avaliacoesStore;

// Estados locais
const detalhesModalVisible = ref(false);
const rejeicaoModalVisible = ref(false);
const avaliacaoDetalhes = ref<Avaliacao | null>(null);
const avaliacaoIdAction = ref<number | null>(null);
const motivoRejeicao = ref('');

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' as const },
  { name: 'prestador', label: 'Prestador', field: 'prestador', align: 'left' as const },
  { name: 'nota', label: 'Avaliação', field: 'nota', align: 'center' as const },
  { name: 'comentario', label: 'Comentário', field: 'comentario', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'data', label: 'Data', field: 'created_at', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

// ❌ REMOVIDO: formatMoney não usado

const formatarData = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatarDataCompleta = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getAvatarUrl = (nome: string): string => {
  return `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=60&name=${encodeURIComponent(nome)}`;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    aprovada: 'green',
    pendente: 'orange',
    rejeitada: 'red',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    aprovada: 'Aprovada',
    pendente: 'Pendente',
    rejeitada: 'Rejeitada',
  };
  return labels[status] || status;
};

const getQuantidadeNota = (nota: number): number => {
  if (!estatisticas.value?.por_nota) return 0;
  const map: Record<number, number> = {
    5: estatisticas.value.por_nota.nota_5 || 0,
    4: estatisticas.value.por_nota.nota_4 || 0,
    3: estatisticas.value.por_nota.nota_3 || 0,
    2: estatisticas.value.por_nota.nota_2 || 0,
    1: estatisticas.value.por_nota.nota_1 || 0,
  };
  return map[nota] || 0;
};

const getPercentualNota = (nota: number): number => {
  const total = estatisticas.value?.total || 0;
  if (total === 0) return 0;
  return (getQuantidadeNota(nota) / total) * 100;
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('nota', filtros.value.nota);
  setFiltro('status', filtros.value.status);
  setFiltro('data_inicio', filtros.value.data_inicio);
  setFiltro('data_fim', filtros.value.data_fim);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Ações de avaliação
const verAvaliacao = async (avaliacao: Avaliacao): Promise<void> => {
  const dados = await buscarAvaliacao(avaliacao.id);
  if (dados) {
    avaliacaoDetalhes.value = dados;
    detalhesModalVisible.value = true;
  }
};

const confirmarAprovacao = (avaliacao: Avaliacao): void => {
  $q.dialog({
    title: 'Aprovar avaliação',
    message: `Deseja aprovar esta avaliação?`,
    cancel: true,
    ok: { label: 'Aprovar', color: 'positive' },
  }).onOk(() => {
    void executarAprovacao(avaliacao.id);
  });
};

// ✅ CORRIGIDO: adicionado void na chamada
const aprovarAvaliacaoModal = (): void => {
  if (avaliacaoDetalhes.value) {
    void executarAprovacao(avaliacaoDetalhes.value.id);
  }
};

const executarAprovacao = async (id: number): Promise<void> => {
  const success = await aprovarAvaliacao(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Avaliação aprovada com sucesso!' });
    detalhesModalVisible.value = false;
    avaliacaoDetalhes.value = null;
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao aprovar avaliação' });
  }
};

const confirmarRejeicao = (avaliacao: Avaliacao): void => {
  avaliacaoIdAction.value = avaliacao.id;
  motivoRejeicao.value = '';
  rejeicaoModalVisible.value = true;
};

const abrirModalRejeicao = (): void => {
  if (avaliacaoDetalhes.value) {
    avaliacaoIdAction.value = avaliacaoDetalhes.value.id;
    motivoRejeicao.value = '';
    rejeicaoModalVisible.value = true;
  }
};

const executarRejeicao = async (): Promise<void> => {
  if (!avaliacaoIdAction.value) return;

  const success = await rejeitarAvaliacao(avaliacaoIdAction.value, motivoRejeicao.value);
  if (success) {
    $q.notify({ type: 'positive', message: 'Avaliação rejeitada com sucesso!' });
    rejeicaoModalVisible.value = false;
    detalhesModalVisible.value = false;
    avaliacaoDetalhes.value = null;
    avaliacaoIdAction.value = null;
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao rejeitar avaliação' });
  }
};

const confirmarExclusao = (avaliacao: Avaliacao): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(avaliacao.id);
  });
};

const confirmarExclusaoModal = (): void => {
  if (avaliacaoDetalhes.value) {
    $q.dialog({
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.`,
      cancel: true,
      ok: { label: 'Excluir', color: 'negative' },
    }).onOk(() => {
      void executarExclusao(avaliacaoDetalhes.value!.id);
    });
  }
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirAvaliacao(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Avaliação excluída com sucesso!' });
    detalhesModalVisible.value = false;
    avaliacaoDetalhes.value = null;
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir avaliação' });
  }
};

// ✅ CORRIGIDO: watch com void
watch([() => filtros.value.nota, () => filtros.value.status], () => {
  void carregarAvaliacoes();
});

// ✅ CORRIGIDO: onMounted com void
onMounted(() => {
  void carregarAvaliacoes();
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

    .search-input {
      width: 280px;
    }
  }
}

// ✅ Cards de Estatísticas
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue { background: rgba(102, 126, 234, 0.1); color: #667EEA; }
    &.green { background: rgba(16, 185, 129, 0.1); color: #10B981; }
    &.orange { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    &.purple { background: rgba(118, 75, 162, 0.1); color: #764BA2; }
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

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .section-header {
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

.rating-distribution {
  .rating-bar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .rating-label {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 50px;
    }

    .rating-bar-container {
      flex: 1;
      height: 10px;
      background: #e5e7eb;
      border-radius: 5px;
      overflow: hidden;

      .rating-bar {
        height: 100%;
        background: linear-gradient(90deg, #F59E0B, #F97316);
        border-radius: 5px;
        transition: width 0.3s ease;
      }
    }

    .rating-count {
      width: 50px;
      text-align: right;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
  }
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 16px;
  border-radius: 12px;
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
  border-radius: 12px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.no-data {
  text-align: center;
  padding: 40px;

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
  padding: 16px;

  .pagination-info {
    font-size: 14px;
    color: #6b7280;
  }
}

.user-cell {
  display: flex;
  align-items: center;

  .user-name {
    font-weight: 500;
    color: #1a1a2e;
  }

  .user-email, .user-profissao {
    font-size: 11px;
    color: #6b7280;
  }
}

.rating-stars {
  display: flex;
  gap: 2px;

  &.big {
    gap: 8px;
    margin-bottom: 8px;
  }
}

.rating-value {
  font-size: 14px;
  color: #6b7280;
}

.comentario-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #374151;
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

    .info-value.comentario {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.detalhes-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
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

    .filter-select, .filter-date {
      width: 100%;
    }
  }
}
</style>
