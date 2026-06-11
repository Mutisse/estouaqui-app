<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Serviços</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar serviços..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" label="Novo Serviço" @click="abrirModalNovo" />
        <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="handyman" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
          <div class="stat-label">Total Serviços</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="check_circle" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.ativos) }}</div>
          <div class="stat-label">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <q-icon name="cancel" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.inativos) }}</div>
          <div class="stat-label">Inativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="payments" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(estatisticas.preco_medio) }}</div>
          <div class="stat-label">Preço Médio</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <q-select
        v-model="filtros.categoria_id"
        :options="categorias"
        label="Categoria"
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
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando serviços...</p>
    </div>

    <!-- Tabela -->
    <q-table
      v-else
      :rows="servicos"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-preco_base="props">
        <q-td :props="props">
          <span class="preco-value">{{ formatMoney(props.row.preco_base) }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-duracao="props">
        <q-td :props="props">
          {{ formatarDuracao(props.row.duracao) }}
        </q-td>
      </template>

      <template v-slot:body-cell-categoria="props">
        <q-td :props="props">
          <q-badge :color="getCategoriaColor(props.row.categoria_id)" outline>
            {{ props.row.categoria?.nome || '—' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-ativo="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.ativo)">
            {{ getStatusLabel(props.row.ativo) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <div class="acoes-cell">
            <q-btn flat round icon="visibility" color="info" size="sm" @click="() => verServico(props.row)" title="Ver detalhes" />
            <q-btn flat round icon="edit" color="primary" size="sm" @click="() => editarServico(props.row)" title="Editar" />
            <q-btn flat round icon="delete" color="negative" size="sm" @click="() => confirmarExclusao(props.row)" title="Excluir" />
          </div>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container" v-if="paginacao.total > 0">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => mudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }}
            ({{ paginacao.total }} registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => mudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>

      <template v-slot:no-data>
        <div class="no-data">
          <q-icon name="handyman" size="48px" color="grey-5" />
          <p>Nenhum serviço encontrado</p>
          <q-btn flat color="primary" label="Criar primeiro serviço" @click="abrirModalNovo" />
        </div>
      </template>
    </q-table>

    <!-- Modal Novo/Editar Serviço -->
    <q-dialog v-model="modalVisible" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar Serviço' : 'Novo Serviço' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.nome"
            label="Nome do Serviço *"
            dense
            outlined
            :error="!!errors.nome"
            :error-message="errors.nome"
          />

          <q-input
            v-model="form.descricao"
            label="Descrição"
            type="textarea"
            dense
            outlined
            class="q-mt-md"
            rows="3"
          />

          <div class="form-row q-mt-md">
            <q-select
              v-model="form.categoria_id"
              :options="categorias"
              label="Categoria *"
              dense
              outlined
              class="col"
              emit-value
              map-options
              :error="!!errors.categoria_id"
              :error-message="errors.categoria_id"
            />
            <q-input
              v-model.number="form.duracao"
              label="Duração (minutos) *"
              type="number"
              dense
              outlined
              class="col"
              min="15"
              step="15"
              :error="!!errors.duracao"
              :error-message="errors.duracao"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model.number="form.preco_base"
              label="Preço Base (MZN) *"
              type="number"
              dense
              outlined
              class="col"
              min="0"
              step="50"
              prefix="MZN "
              :error="!!errors.preco_base"
              :error-message="errors.preco_base"
            />
          </div>

          <q-toggle v-model="form.ativo" label="Ativo" class="q-mt-md" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModal" />
          <q-btn flat label="Salvar" color="primary" @click="salvarServico" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Visualizar Serviço -->
    <q-dialog v-model="viewModalVisible">
      <q-card style="min-width: 450px; max-width: 550px;">
        <q-card-section class="view-header" :style="{ background: `linear-gradient(135deg, #667EEA, #1a1a2e)` }">
          <div class="view-icon">
            <q-icon name="handyman" size="48px" />
          </div>
          <div class="view-nome">{{ servicoVisualizacao?.nome }}</div>
          <q-badge :color="servicoVisualizacao?.ativo ? 'green' : 'red'" class="view-status">
            {{ servicoVisualizacao?.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-card-section>

        <q-card-section class="view-body">
          <div class="info-group">
            <div class="info-title">Descrição</div>
            <div class="info-value descricao">
              {{ servicoVisualizacao?.descricao || 'Sem descrição' }}
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Informações</div>
            <div class="info-row">
              <strong>Categoria:</strong>
              <q-badge :color="getCategoriaColor(servicoVisualizacao?.categoria_id)" outline>
                {{ servicoVisualizacao?.categoria?.nome || '—' }}
              </q-badge>
            </div>
            <div class="info-row">
              <strong>Preço Base:</strong> {{ formatMoney(servicoVisualizacao?.preco_base || 0) }}
            </div>
            <div class="info-row">
              <strong>Duração:</strong> {{ formatarDuracao(servicoVisualizacao?.duracao || 0) }}
            </div>
            <div class="info-row" v-if="servicoVisualizacao?.prestador">
              <strong>Prestador:</strong> {{ servicoVisualizacao.prestador.nome }}
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Datas</div>
            <div class="info-row">
              <strong>Criado em:</strong> {{ formatarData(servicoVisualizacao?.created_at) }}
            </div>
            <div class="info-row" v-if="servicoVisualizacao?.updated_at !== servicoVisualizacao?.created_at">
              <strong>Atualizado em:</strong> {{ formatarData(servicoVisualizacao?.updated_at) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn flat label="Editar" color="primary" @click="editarDoView" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminServicosStore } from 'src/stores/admin/admin-servicos-store';
import type { Servico, ServicoForm } from 'src/stores/admin/admin-servicos-store';

defineOptions({ name: 'AdminServicos' });

const $q = useQuasar();
const servicosStore = useAdminServicosStore();

const {
  isLoading,
  isSaving,
  servicos,
  categorias,
  estatisticas,
  paginacao,
  filtros,
  opcoesStatus,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(servicosStore);

const {
  carregarServicos,
  carregarEstatisticas,
  carregarCategorias,
  buscarServico,
  criarServico,
  atualizarServico,
  excluirServico,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  getStatusColor,
  getStatusLabel,
  formatarDuracao,
} = servicosStore;

// Estados locais
const modalVisible = ref(false);
const viewModalVisible = ref(false);
const editando = ref(false);
const editandoId = ref<number | null>(null);
const servicoVisualizacao = ref<Servico | null>(null);

const errors = reactive({
  nome: '',
  categoria_id: '',
  duracao: '',
  preco_base: '',
});

const form = reactive<ServicoForm>({
  nome: '',
  descricao: '',
  categoria_id: null,
  duracao: 60,
  preco_base: 0,
  ativo: true,
});

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true, style: 'width: 60px' },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, style: 'min-width: 200px' },
  { name: 'categoria', label: 'Categoria', field: 'categoria', align: 'left' as const, style: 'width: 150px' },
  { name: 'preco_base', label: 'Preço', field: 'preco_base', align: 'right' as const, style: 'width: 120px' },
  { name: 'duracao', label: 'Duração', field: 'duracao', align: 'center' as const, style: 'width: 100px' },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' as const, style: 'width: 100px' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const, style: 'width: 120px' },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value || 0);
};

const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getCategoriaColor = (categoriaId?: number): string => {
  const colors: Record<number, string> = {
    1: 'primary',
    2: 'secondary',
    3: 'accent',
    4: 'info',
    5: 'warning',
  };
  return colors[categoriaId || 1] || 'grey';
};

const validarForm = (): boolean => {
  let isValid = true;
  errors.nome = '';
  errors.categoria_id = '';
  errors.duracao = '';
  errors.preco_base = '';

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  }

  if (!form.categoria_id) {
    errors.categoria_id = 'Categoria é obrigatória';
    isValid = false;
  }

  if (!form.duracao || form.duracao < 15) {
    errors.duracao = 'Duração deve ser no mínimo 15 minutos';
    isValid = false;
  }

  if (form.preco_base < 0) {
    errors.preco_base = 'Preço deve ser maior ou igual a zero';
    isValid = false;
  }

  return isValid;
};

// Handlers
const handleRecarregar = (): void => {
  recarregarDados().catch(() => {
    $q.notify({ type: 'negative', message: 'Erro ao recarregar dados' });
  });
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('categoria_id', filtros.value.categoria_id);
  setFiltro('status', filtros.value.status);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Ações de modal
const abrirModalNovo = (): void => {
  editando.value = false;
  editandoId.value = null;
  form.nome = '';
  form.descricao = '';
  form.categoria_id = null;
  form.duracao = 60;
  form.preco_base = 0;
  form.ativo = true;
  errors.nome = '';
  errors.categoria_id = '';
  errors.duracao = '';
  errors.preco_base = '';
  modalVisible.value = true;
};

const editarServico = (servico: Servico): void => {
  editando.value = true;
  editandoId.value = servico.id;
  form.nome = servico.nome;
  form.descricao = servico.descricao || '';
  form.categoria_id = servico.categoria_id;
  form.duracao = servico.duracao;
  form.preco_base = servico.preco_base;
  form.ativo = servico.ativo;
  errors.nome = '';
  errors.categoria_id = '';
  errors.duracao = '';
  errors.preco_base = '';
  modalVisible.value = true;
};

const verServico = async (servico: Servico): Promise<void> => {
  const dados = await buscarServico(servico.id);
  if (dados) {
    servicoVisualizacao.value = dados;
    viewModalVisible.value = true;
  }
};

const editarDoView = (): void => {
  if (servicoVisualizacao.value) {
    viewModalVisible.value = false;
    editarServico(servicoVisualizacao.value);
  }
};

const salvarServico = (): void => {
  if (!validarForm()) return;

  if (editando.value && editandoId.value) {
    atualizarServico(editandoId.value, {
      nome: form.nome,
      descricao: form.descricao,
      categoria_id: form.categoria_id!,
      duracao: form.duracao,
      preco_base: form.preco_base,
      ativo: form.ativo,
    })
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Serviço atualizado com sucesso!' });
          modalVisible.value = false;
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao atualizar serviço' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar serviço' });
      });
  } else {
    criarServico({
      nome: form.nome,
      descricao: form.descricao,
      categoria_id: form.categoria_id!,
      duracao: form.duracao,
      preco_base: form.preco_base,
      ativo: form.ativo,
    })
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Serviço criado com sucesso!' });
          modalVisible.value = false;
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao criar serviço' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao criar serviço' });
      });
  }
};

const confirmarExclusao = (servico: Servico): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o serviço "${servico.nome}"? Esta ação não pode ser desfeita.`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    excluirServico(servico.id)
      .then((success) => {
        if (success) {
          $q.notify({ type: 'positive', message: 'Serviço excluído com sucesso!' });
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao excluir serviço' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao excluir serviço' });
      });
  });
};

const fecharModal = (): void => {
  modalVisible.value = false;
  editando.value = false;
  editandoId.value = null;
};

// Lifecycle
onMounted(() => {
  carregarServicos().catch(() => {
    $q.notify({ type: 'negative', message: 'Erro ao carregar serviços' });
  });
  carregarEstatisticas().catch(() => {
    $q.notify({ type: 'negative', message: 'Erro ao carregar estatísticas' });
  });
  carregarCategorias().catch(() => {
    $q.notify({ type: 'negative', message: 'Erro ao carregar categorias' });
  });
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
    &.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    &.purple { background: rgba(118, 75, 162, 0.1); color: #764ba2; }
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
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
    min-width: 200px;
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

.preco-value {
  font-weight: 600;
  color: #10b981;
}

.acoes-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.view-header {
  text-align: center;
  padding: 24px;
  color: white;

  .view-icon {
    margin-bottom: 12px;
  }

  .view-nome {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .view-status {
    font-size: 11px;
  }
}

.view-body {
  padding: 20px;

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

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

    .info-value.descricao {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .info-row {
      font-size: 13px;
      color: #374151;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
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

    .filter-select {
      width: 100%;
    }
  }
}
</style>
