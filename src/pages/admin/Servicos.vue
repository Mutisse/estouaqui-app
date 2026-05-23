<template>
  <q-page class="admin-servicos q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="construction" size="32px" class="q-mr-sm" />
          Gestão de Serviços
        </div>
        <div class="page-subtitle">Gerencie os serviços oferecidos na plataforma</div>
      </div>
      <div class="header-actions">
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarServicos"
          :loading="conteudoStore.loading"
        />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="conteudoStore.loading" class="skeleton-container">
      <div class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-filters">
            <div class="skeleton-select"></div>
            <div class="skeleton-select"></div>
          </div>
        </div>
        <div class="skeleton-table">
          <div class="skeleton-table-header">
            <div v-for="i in 6" :key="i" class="skeleton-header-cell"></div>
          </div>
          <div v-for="row in 5" :key="row" class="skeleton-table-row">
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-text"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-badge"></div>
            </div>
            <div class="skeleton-cell">
              <div class="skeleton-actions">
                <div class="skeleton-action-icon"></div>
                <div class="skeleton-action-icon"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <q-card class="servicos-card">
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Lista de Serviços</div>
            <div class="row q-gutter-sm">
              <q-select
                v-model="filtroCategoria"
                :options="categoriasOptions"
                label="Filtrar por categoria"
                dense
                outlined
                clearable
                class="filter-select"
                style="min-width: 150px"
                @update:model-value="carregarServicos"
              />
              <q-select
                v-model="filtroAtivo"
                :options="statusOptions"
                label="Status"
                dense
                outlined
                clearable
                class="filter-select"
                style="min-width: 120px"
                @update:model-value="carregarServicos"
              />
            </div>
          </div>
        </q-card-section>

        <q-table
          :rows="conteudoStore.servicos"
          :columns="colunas"
          row-key="id"
          :loading="conteudoStore.loading"
          :rows-per-page-options="[10, 20, 50]"
          class="servicos-table"
        >
          <!-- Nome do serviço -->
          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
              <div class="servico-nome">
                <q-icon
                  :name="getIconeCategoria(props.row.categoria?.nome)"
                  size="20px"
                  class="q-mr-sm"
                  :color="getCorCategoria(props.row.categoria?.nome)"
                />
                <span class="text-weight-medium">{{ props.row.nome }}</span>
              </div>
            </q-td>
          </template>

          <!-- Categoria com cor -->
          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              <q-chip
                size="sm"
                :color="getCorCategoria(props.row.categoria?.nome)"
                text-color="white"
                dense
              >
                {{ props.row.categoria?.nome || 'Sem categoria' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Preço -->
          <template v-slot:body-cell-preco="props">
            <q-td :props="props">
              <div class="preco-value">
                <strong>{{ formatMoney(props.row.preco) }}</strong>
              </div>
            </q-td>
          </template>

          <!-- Duração -->
          <template v-slot:body-cell-duracao="props">
            <q-td :props="props">
              <div class="duracao-value">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ props.row.duracao }} min
              </div>
            </q-td>
          </template>

          <!-- Status -->
          <template v-slot:body-cell-ativo="props">
            <q-td :props="props">
              <q-badge :color="props.row.ativo ? 'positive' : 'grey'" class="status-badge">
                <q-icon
                  :name="props.row.ativo ? 'check_circle' : 'cancel'"
                  size="12px"
                  class="q-mr-xs"
                />
                {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
              </q-badge>
            </q-td>
          </template>

          <!-- Ações -->
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  icon="edit"
                  size="sm"
                  color="secondary"
                  @click="editarServico(props.row)"
                >
                  <q-tooltip>Editar serviço</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete"
                  size="sm"
                  color="negative"
                  @click="removerServico(props.row)"
                >
                  <q-tooltip>Remover serviço</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="text-center q-pa-md">
              <q-icon name="construction" size="48px" color="grey" />
              <div class="text-subtitle1 q-mt-sm">Nenhum serviço encontrado</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- Dialog para editar serviço -->
    <q-dialog v-model="mostrarDialog" persistent transition="scale">
      <q-card style="min-width: 500px" class="servico-dialog">
        <q-card-section class="dialog-header bg-secondary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Serviço
          </div>
          <q-btn flat round dense icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            v-model="form.nome"
            label="Nome do serviço"
            outlined
            dense
            :rules="[(val) => !!val || 'Nome é obrigatório']"
            counter
            maxlength="100"
            disable
          >
            <template v-slot:prepend>
              <q-icon name="title" color="secondary" />
            </template>
            <template v-slot:append>
              <q-icon name="info" color="grey">
                <q-tooltip>Nome não pode ser alterado</q-tooltip>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="form.categoria_id"
            :options="categoriasSelectOptions"
            label="Categoria"
            outlined
            dense
            emit-value
            map-options
            :rules="[(val) => !!val || 'Selecione uma categoria']"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="secondary" />
            </template>
          </q-select>

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            dense
            type="textarea"
            autogrow
            rows="3"
          >
            <template v-slot:prepend>
              <q-icon name="description" color="secondary" />
            </template>
          </q-input>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="form.preco"
                label="Preço (MZN)"
                outlined
                dense
                type="number"
                :rules="[(val) => val > 0 || 'Preço deve ser maior que 0']"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" color="secondary" />
                </template>
              </q-input>
            </div>

            <div class="col-6">
              <q-input
                v-model.number="form.duracao"
                label="Duração (minutos)"
                outlined
                dense
                type="number"
                :rules="[(val) => val >= 5 || 'Duração mínima de 5 minutos']"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" color="secondary" />
                </template>
              </q-input>
            </div>
          </div>

          <q-toggle v-model="form.ativo" label="Serviço ativo" left-label color="secondary" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="secondary"
            @click="salvarServico"
            :disable="!form.nome || !form.categoria_id || !form.preco"
            :loading="salvando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
// ✅ IMPORT CORRETO
import { useAdminConteudoStore, type ServicoData, type CategoriaData } from 'src/stores/admin/admin-conteudo-store';

defineOptions({
  name: 'AdminServicos',
});

const $q = useQuasar();
// ✅ USANDO O STORE CORRETO
const conteudoStore = useAdminConteudoStore();

// Estados
const mostrarDialog = ref(false);
const salvando = ref(false);
const servicoEditandoId = ref<number | null>(null);
const filtroCategoria = ref<number | null>(null);
const filtroAtivo = ref<boolean | null>(null);

// Opções para filtros
const statusOptions = [
  { label: 'Ativos', value: true },
  { label: 'Inativos', value: false },
];

// Categorias para os filtros e select
const categoriasSelectOptions = ref<{ label: string; value: number }[]>([]);
const categoriasOptions = computed(() => [
  ...categoriasSelectOptions.value,
  { label: 'Todas', value: null },
]);

// Funções auxiliares para cores e ícones
const getCorCategoria = (nomeCategoria?: string): string => {
  const cores: Record<string, string> = {
    Eletricista: 'warning',
    Canalizador: 'info',
    Pintor: 'accent',
    Informático: 'primary',
    Limpeza: 'positive',
    Motorista: 'secondary',
    Cabeleireiro: 'pink',
    Manicure: 'purple',
  };
  return cores[nomeCategoria || ''] || 'grey';
};

const getIconeCategoria = (nomeCategoria?: string): string => {
  const icones: Record<string, string> = {
    Eletricista: 'bolt',
    Canalizador: 'water_drop',
    Pintor: 'brush',
    Informático: 'computer',
    Limpeza: 'cleaning_services',
    Motorista: 'local_taxi',
    Cabeleireiro: 'content_cut',
    Manicure: 'handshake',
  };
  return icones[nomeCategoria || ''] || 'handyman';
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'nome', label: 'Serviço', field: 'nome', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoria', field: 'categoria', align: 'left', sortable: true },
  { name: 'preco', label: 'Preço', field: 'preco', align: 'center', sortable: true },
  { name: 'duracao', label: 'Duração', field: 'duracao', align: 'center', sortable: true },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center', sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', sortable: false },
];

// Formulário
const form = reactive({
  nome: '',
  categoria_id: null as number | null,
  descricao: '',
  preco: 0,
  duracao: 30,
  ativo: true,
});

// ✅ Carregar categorias usando conteudoStore
const carregarCategorias = async () => {
  try {
    const cats = await conteudoStore.fetchCategorias();
    categoriasSelectOptions.value = cats.map((cat: CategoriaData) => ({
      label: cat.nome,
      value: cat.id,
    }));
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

// ✅ Carregar serviços usando conteudoStore
const carregarServicos = async () => {
  try {
    const params: {
      categoria?: number;
      ativo?: boolean;
    } = {};
    if (filtroCategoria.value) params.categoria = filtroCategoria.value;
    if (filtroAtivo.value !== null) params.ativo = filtroAtivo.value;

    await conteudoStore.fetchServicos(params);
  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
  }
};

// Editar serviço
const editarServico = (servico: ServicoData) => {
  servicoEditandoId.value = servico.id;
  form.nome = servico.nome;
  form.categoria_id = servico.categoria?.id || null;
  form.descricao = servico.descricao || '';
  form.preco = servico.preco;
  form.duracao = servico.duracao;
  form.ativo = servico.ativo;
  mostrarDialog.value = true;
};

// ✅ Salvar serviço usando conteudoStore
const salvarServico = async () => {
  if (!form.nome || !form.categoria_id || !form.preco) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos obrigatórios',
      position: 'top',
    });
    return;
  }

  salvando.value = true;
  try {
    const response = await conteudoStore.updateServico(servicoEditandoId.value!, {
      categoria_id: form.categoria_id,
      descricao: form.descricao,
      preco: form.preco,
      duracao: form.duracao,
      ativo: form.ativo,
    });

    if (response) {
      $q.notify({
        type: 'positive',
        message: 'Serviço atualizado com sucesso!',
        position: 'top',
      });
      mostrarDialog.value = false;
      await carregarServicos();
    } else {
      throw new Error('Erro ao salvar');
    }
  } catch (err) {
    console.error('Erro ao salvar serviço:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço',
      position: 'top',
    });
  } finally {
    salvando.value = false;
  }
};

// ✅ Remover serviço usando conteudoStore
const removerServico = (servico: ServicoData) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: `Tem certeza que deseja remover o serviço "${servico.nome}"?`,
    cancel: { label: 'Cancelar', color: 'grey' },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const response = await conteudoStore.deleteServico(servico.id);
        if (response) {
          $q.notify({
            type: 'positive',
            message: 'Serviço removido com sucesso!',
            position: 'top',
          });
          await carregarServicos();
        } else {
          throw new Error('Erro ao remover');
        }
      } catch (err) {
        console.error('Erro ao remover serviço:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover serviço',
          position: 'top',
        });
      }
    })();
  });
};

// Carregar dados ao montar
onMounted(() => {
  void carregarCategorias();
  void carregarServicos();
});
</script>

<style scoped lang="scss">
// ... styles mantidos iguais ao original
.admin-servicos {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .page-title-section {
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 4px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// Skeleton Loading
.skeleton-container {
  position: relative;
  overflow: hidden;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-title {
  width: 150px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-filters {
  display: flex;
  gap: 8px;
}

.skeleton-select {
  width: 150px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 8px;
}

.skeleton-table {
  padding: 0 20px 20px 20px;
}

.skeleton-table-header {
  display: flex;
  background: #f8f9fa;
  padding: 12px 0;
  border-bottom: 2px solid #eeeeee;
}

.skeleton-header-cell {
  flex: 1;
  height: 20px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 8px;
}

.skeleton-table-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-cell {
  flex: 1;
  margin: 0 8px;
}

.skeleton-text {
  width: 80%;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-chip {
  width: 80px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 16px;
}

.skeleton-badge {
  width: 60px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 16px;
  margin: 0 auto;
}

.skeleton-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.skeleton-action-icon {
  width: 32px;
  height: 32px;
  background: #e0e0e0;
  border-radius: 50%;
}

.skeleton-shimmer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// Estilos principais
.servicos-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.filter-select {
  min-width: 150px;
}

.servicos-table {
  :deep(.q-table) {
    thead tr th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #e9ecef;
    }

    tbody tr {
      transition: background 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }
    }

    td {
      padding: 12px 16px;
      vertical-align: middle;
    }
  }
}

.servico-nome {
  display: flex;
  align-items: center;
}

.preco-value {
  color: #2e7d32;
  font-weight: 600;
}

.duracao-value {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;

  .q-btn {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.servico-dialog {
  border-radius: 16px;
  overflow: hidden;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
  }

  .dialog-actions {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
  }
}

@media (max-width: 768px) {
  .admin-servicos {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
  }

  .servico-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }
}
</style>
