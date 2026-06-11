<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Categorias</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar..."
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

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="category" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(totalCategorias) }}</div>
          <div class="stat-label">Total Categorias</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="check_circle" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(categoriasAtivas.length) }}</div>
          <div class="stat-label">Ativas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <q-icon name="cancel" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(categoriasInativas.length) }}</div>
          <div class="stat-label">Inativas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="work" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(totalServicos) }}</div>
          <div class="stat-label">Total Serviços</div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <q-select
        v-model="filtros.ativo"
        :options="statusOptions"
        label="Status"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <div class="actions-bar">
      <q-btn color="primary" icon="add" label="Nova Categoria" @click="abrirModalNovo" />
      <q-btn
        flat
        icon="swap_vert"
        label="Reordenar"
        @click="toggleReorderMode"
        v-if="!reorderMode"
      />
      <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando categorias...</p>
    </div>

    <!-- Modo de Reordenação -->
    <div v-else-if="reorderMode" class="reorder-container">
      <div class="reorder-header">
        <span>Arraste os ícones ↕️ para reordenar as categorias</span>
        <div>
          <q-btn flat label="Cancelar" @click="toggleReorderMode" />
          <q-btn
            flat
            label="Salvar ordem"
            color="primary"
            @click="handleSalvarOrdem"
            :loading="isSaving"
          />
        </div>
      </div>
      <div class="reorder-list">
        <div
          v-for="(categoria, index) in categoriasOrdenadas"
          :key="categoria.id"
          class="reorder-item"
          draggable="true"
          @dragstart="dragStart($event, index)"
          @dragover="dragOver($event)"
          @drop="drop($event, index)"
          @dragend="dragEnd"
        >
          <div class="drag-handle">
            <q-icon name="drag_indicator" size="20px" />
          </div>
          <div class="reorder-icon" :style="{ color: categoria.cor }">
            <q-icon :name="categoria.icone || 'category'" size="24px" />
          </div>
          <div class="reorder-info">
            <div class="reorder-name">{{ categoria.nome }}</div>
            <div class="reorder-id">ID: {{ categoria.id }}</div>
            <div class="reorder-servicos" v-if="categoria.servicos_count !== undefined">
              <q-icon name="work" size="12px" />
              {{ categoria.servicos_count }} serviços
            </div>
          </div>
          <div class="reorder-order">
            <span class="order-badge">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Categorias -->
    <q-table
      v-else
      :rows="categoriasFiltradas"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-icone="props">
        <q-td :props="props">
          <div class="icon-preview" :style="{ color: props.row.cor }">
            <q-icon :name="props.row.icone || 'category'" size="24px" />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-cor="props">
        <q-td :props="props">
          <div class="color-preview" :style="{ background: props.row.cor }"></div>
          <span class="color-code">{{ props.row.cor }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-servicos="props">
        <q-td :props="props">
          <div class="servicos-cell">
            <q-icon name="work" size="14px" class="q-mr-xs" />
            <span>{{ props.row.servicos_count || 0 }}</span>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-ativo="props">
        <q-td :props="props">
          <q-badge :color="props.row.ativo ? 'green' : 'red'">
            {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-ordem="props">
        <q-td :props="props">
          <span class="order-badge">{{ props.row.ordem }}</span>
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
            @click="() => verCategoria(props.row)"
            title="Ver detalhes"
          />
          <q-btn
            flat
            round
            icon="edit"
            color="primary"
            size="sm"
            @click="() => editarCategoria(props.row)"
            title="Editar"
          />
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="() => confirmarExclusao(props.row)"
            title="Excluir"
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="no-data">
          <q-icon name="category" size="48px" color="grey-5" />
          <p>Nenhuma categoria encontrada</p>
          <q-btn flat color="primary" label="Criar primeira categoria" @click="abrirModalNovo" />
        </div>
      </template>
    </q-table>

    <!-- Modal Nova/Editar Categoria -->
    <q-dialog v-model="modalVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar Categoria' : 'Nova Categoria' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.nome"
            label="Nome *"
            dense
            outlined
            :error="!!errors.nome"
            :error-message="errors.nome"
            @update:model-value="onNomeChange"
          />

          <div v-if="slugPreview" class="slug-preview">
            <span class="slug-label">Slug:</span>
            <span class="slug-value">{{ slugPreview }}</span>
          </div>

          <div class="form-row">
            <q-select
              v-model="form.icone"
              :options="iconesDisponiveis"
              label="Ícone"
              dense
              outlined
              class="col"
              emit-value
              map-options
            />
            <q-select
              v-model="form.cor"
              :options="coresDisponiveis"
              label="Cor"
              dense
              outlined
              class="col"
              emit-value
              map-options
            >
              <template v-slot:selected>
                <div class="flex items-center">
                  <div class="color-preview-small" :style="{ background: form.cor }"></div>
                  <span class="q-ml-sm">{{ form.cor }}</span>
                </div>
              </template>
              <template v-slot:option="scope">
                <div class="flex items-center">
                  <div class="color-preview-small" :style="{ background: scope.opt.value }"></div>
                  <span class="q-ml-sm">{{ scope.opt.label }}</span>
                </div>
              </template>
            </q-select>
          </div>

          <q-input
            v-model="form.descricao"
            label="Descrição"
            type="textarea"
            dense
            outlined
            class="q-mt-md"
            rows="3"
          />

          <q-toggle v-model="form.ativo" label="Ativo" class="q-mt-md" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModal" />
          <q-btn flat label="Salvar" color="primary" @click="salvarCategoria" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Visualizar Categoria -->
    <q-dialog v-model="viewModalVisible">
      <q-card style="min-width: 400px">
        <q-card-section
          class="view-header"
          :style="{
            background: `linear-gradient(135deg, ${categoriaVisualizacao?.cor || '#667EEA'}, #1a1a2e)`,
          }"
        >
          <div class="view-icon">
            <q-icon :name="categoriaVisualizacao?.icone || 'category'" size="48px" />
          </div>
          <div class="view-nome">{{ categoriaVisualizacao?.nome }}</div>
          <q-badge :color="categoriaVisualizacao?.ativo ? 'green' : 'red'" class="view-status">
            {{ categoriaVisualizacao?.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-card-section>

        <q-card-section class="view-body">
          <div class="info-row"><strong>ID:</strong> {{ categoriaVisualizacao?.id }}</div>
          <div class="info-row"><strong>Slug:</strong> {{ categoriaVisualizacao?.slug }}</div>
          <div class="info-row">
            <strong>Cor:</strong>
            <div class="color-preview" :style="{ background: categoriaVisualizacao?.cor }"></div>
            <span>{{ categoriaVisualizacao?.cor }}</span>
          </div>
          <div class="info-row" v-if="categoriaVisualizacao?.descricao">
            <strong>Descrição:</strong> {{ categoriaVisualizacao.descricao }}
          </div>
          <div class="info-row"><strong>Ordem:</strong> {{ categoriaVisualizacao?.ordem }}</div>
          <div class="info-row" v-if="categoriaVisualizacao?.servicos_count !== undefined">
            <strong>Serviços:</strong> {{ categoriaVisualizacao.servicos_count }}
          </div>
          <div class="info-row">
            <strong>Criado em:</strong> {{ formatarData(categoriaVisualizacao?.created_at) }}
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import {
  useAdminCategoriasStore,
  coresDisponiveis,
  iconesDisponiveis,
} from 'src/stores/admin/admin-categorias-store';
import type { Categoria, CategoriaForm } from 'src/stores/admin/admin-categorias-store';

defineOptions({ name: 'AdminCategorias' });

const $q = useQuasar();
const categoriasStore = useAdminCategoriasStore();

const { isLoading, isSaving, categorias, filtros, categoriasFiltradas, categoriasAtivas, categoriasInativas, totalCategorias } =
  storeToRefs(categoriasStore);

const {
  carregarTodasCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
  reordenarCategorias,
  setFiltro,
  limparFiltros,
  recarregarDados,
} = categoriasStore;

// Estados locais
const modalVisible = ref(false);
const viewModalVisible = ref(false);
const editando = ref(false);
const editandoId = ref<number | null>(null);
const reorderMode = ref(false);
const categoriasOrdenadas = ref<Categoria[]>([]);
const dragStartIndex = ref<number | null>(null);
const categoriaVisualizacao = ref<Categoria | null>(null);
const slugPreview = ref('');

const errors = reactive({
  nome: '',
});

const form = reactive<CategoriaForm>({
  nome: '',
  icone: 'category',
  cor: '#667EEA',
  descricao: '',
  ativo: true,
});

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Ativos', value: 'sim' },
  { label: 'Inativos', value: 'nao' },
];

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'icone', label: 'Ícone', field: 'icone', align: 'center' as const },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'cor', label: 'Cor', field: 'cor', align: 'left' as const },
  { name: 'servicos', label: 'Serviços', field: 'servicos_count', align: 'center' as const },
  { name: 'ordem', label: 'Ordem', field: 'ordem', align: 'center' as const, sortable: true },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const },
];

// Computed
const totalServicos = computed(() => {
  return categorias.value.reduce((total, cat) => total + (cat.servicos_count || 0), 0);
});

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const gerarSlug = (nome: string): string => {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const onNomeChange = (): void => {
  slugPreview.value = gerarSlug(form.nome);
};

const validarForm = (): boolean => {
  let isValid = true;
  errors.nome = '';

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  }

  return isValid;
};

// Drag and drop nativo
const dragStart = (event: DragEvent, index: number): void => {
  dragStartIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const dragOver = (event: DragEvent): void => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const drop = (event: DragEvent, dropIndex: number): void => {
  event.preventDefault();
  const startIndex = dragStartIndex.value;
  if (startIndex === null || startIndex === dropIndex) return;

  const newItems = [...categoriasOrdenadas.value];

  if (
    startIndex >= 0 &&
    startIndex < newItems.length &&
    dropIndex >= 0 &&
    dropIndex < newItems.length
  ) {
    const itemToMove = newItems[startIndex];
    if (itemToMove) {
      const filtered = newItems.filter((_, idx) => idx !== startIndex);
      filtered.splice(dropIndex, 0, itemToMove);
      categoriasOrdenadas.value = filtered;
    }
  }
  dragStartIndex.value = null;
};

const dragEnd = (): void => {
  dragStartIndex.value = null;
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('ativo', filtros.value.ativo);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Handlers com .then().catch() para evitar promessas flutuantes
const handleRecarregar = (): void => {
  recarregarDados().catch(() => {
    $q.notify({ type: 'negative', message: 'Erro ao recarregar dados' });
  });
};

// Ações de modal
const abrirModalNovo = (): void => {
  editando.value = false;
  editandoId.value = null;
  form.nome = '';
  form.icone = 'category';
  form.cor = '#667EEA';
  form.descricao = '';
  form.ativo = true;
  slugPreview.value = '';
  errors.nome = '';
  modalVisible.value = true;
};

const editarCategoria = (categoria: Categoria): void => {
  editando.value = true;
  editandoId.value = categoria.id;
  form.nome = categoria.nome;
  form.icone = categoria.icone || 'category';
  form.cor = categoria.cor || '#667EEA';
  form.descricao = categoria.descricao || '';
  form.ativo = categoria.ativo;
  slugPreview.value = categoria.slug;
  errors.nome = '';
  modalVisible.value = true;
};

const verCategoria = (categoria: Categoria): void => {
  categoriaVisualizacao.value = categoria;
  viewModalVisible.value = true;
};

const editarDoView = (): void => {
  if (categoriaVisualizacao.value) {
    viewModalVisible.value = false;
    editarCategoria(categoriaVisualizacao.value);
  }
};

const salvarCategoria = (): void => {
  if (!validarForm()) return;

  if (editando.value && editandoId.value) {
    atualizarCategoria(editandoId.value, {
      nome: form.nome,
      icone: form.icone,
      cor: form.cor,
      descricao: form.descricao,
      ativo: form.ativo,
    })
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Categoria atualizada com sucesso!' });
          modalVisible.value = false;
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao atualizar categoria' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar categoria' });
      });
  } else {
    criarCategoria({
      nome: form.nome,
      icone: form.icone,
      cor: form.cor,
      descricao: form.descricao,
      ativo: form.ativo,
    })
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Categoria criada com sucesso!' });
          modalVisible.value = false;
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao criar categoria' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao criar categoria' });
      });
  }
};

const confirmarExclusao = (categoria: Categoria): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir a categoria "${categoria.nome}"? Esta ação não pode ser desfeita.`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    excluirCategoria(categoria.id)
      .then((success) => {
        if (success) {
          $q.notify({ type: 'positive', message: 'Categoria excluída com sucesso!' });
          return recarregarDados();
        }
        $q.notify({ type: 'negative', message: 'Erro ao excluir categoria' });
        return null;
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao excluir categoria' });
      });
  });
};

// Reordenação
const toggleReorderMode = (): void => {
  reorderMode.value = !reorderMode.value;
  if (reorderMode.value) {
    categoriasOrdenadas.value = [...categorias.value].sort(
      (a, b) => (a.ordem || 0) - (b.ordem || 0),
    );
  }
};

const handleSalvarOrdem = (): void => {
  const ordens = categoriasOrdenadas.value.map((cat, index) => ({
    id: cat.id,
    ordem: index + 1,
  }));

  reordenarCategorias(ordens)
    .then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Ordem atualizada com sucesso!' });
        reorderMode.value = false;
        return recarregarDados();
      }
      $q.notify({ type: 'negative', message: 'Erro ao atualizar ordem' });
      return null;
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar ordem' });
    });
};

const fecharModal = (): void => {
  modalVisible.value = false;
  editando.value = false;
  editandoId.value = null;
};

// Lifecycle
onMounted(() => {
  carregarTodasCategorias().catch(() => {
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

    .search-input {
      width: 250px;
    }
  }
}

// Cards de Estatísticas
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
  margin-bottom: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;

  .filter-select {
    min-width: 150px;
  }

  .clear-btn {
    color: #6b7280;
  }
}

.actions-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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

.icon-preview {
  display: flex;
  justify-content: center;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
  border: 1px solid #e5e7eb;
}

.color-preview-small {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #e5e7eb;
}

.color-code {
  font-size: 12px;
  color: #6b7280;
}

.order-badge {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #374151;
}

.servicos-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #6b7280;
}

.no-data {
  text-align: center;
  padding: 48px;
  color: #9ca3af;

  p {
    margin-top: 12px;
  }
}

// Estilos de Reordenação
.reorder-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;

  .reorder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 16px;

    span {
      color: #6b7280;
      font-size: 14px;
    }
  }
}

.reorder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.reorder-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;

  .drag-handle {
    cursor: grab;
    color: #9ca3af;

    &:active {
      cursor: grabbing;
    }
  }

  .reorder-icon {
    width: 40px;
    text-align: center;
  }

  .reorder-info {
    flex: 1;

    .reorder-name {
      font-weight: 500;
      color: #1a1a2e;
    }

    .reorder-id {
      font-size: 11px;
      color: #9ca3af;
    }

    .reorder-servicos {
      font-size: 11px;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
  }

  .reorder-order {
    .order-badge {
      background: #667eea;
      color: white;
    }
  }
}

// Modal Visualizar
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

  .info-row {
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
    }

    strong {
      display: inline-block;
      width: 80px;
      color: #374151;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.slug-preview {
  margin-top: 4px;
  margin-bottom: 16px;
  font-size: 12px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  display: inline-block;

  .slug-label {
    color: #6b7280;
    margin-right: 8px;
  }

  .slug-value {
    color: #667eea;
    font-family: monospace;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .reorder-item {
    flex-wrap: wrap;
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
