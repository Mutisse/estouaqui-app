<template>
  <q-page class="admin-users-page">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="people" size="32px" class="q-mr-sm" />
          Gestão de Utilizadores
        </div>
        <div class="page-subtitle">Gerencie todos os utilizadores da plataforma</div>
      </div>
      <q-btn
        label="Novo Utilizador"
        icon="person_add"
        color="primary"
        glossy
        @click="novoUtilizador"
      />
    </div>

    <!-- Filtros -->
    <q-card class="filters-card">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.busca"
              placeholder="Pesquisar utilizadores..."
              dense
              outlined
              @update:model-value="handleFilterChange"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filters.busca">
                <q-icon name="close" class="cursor-pointer" @click="clearSearch" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.tipo"
              :options="tipoOptions"
              label="Tipo"
              dense
              outlined
              clearable
              @update:model-value="handleFilterChange"
              class="filter-select"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              clearable
              @update:model-value="handleFilterChange"
              class="filter-select"
            >
              <template v-slot:prepend>
                <q-icon name="toggle_on" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              label="Atualizar"
              icon="refresh"
              color="primary"
              dense
              @click="carregarUtilizadores"
              :loading="utilizadoresStore.loading"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Skeleton Loading -->
    <div v-if="utilizadoresStore.loading" class="skeleton-container">
      <div class="skeleton-table-header">
        <div class="row justify-between items-center">
          <div class="skeleton-total"></div>
          <div class="skeleton-pagination"></div>
        </div>
      </div>

      <div class="skeleton-table">
        <div class="skeleton-table-header-row">
          <div v-for="i in 8" :key="`header-${i}`" class="skeleton-header-cell"></div>
        </div>

        <div v-for="row in 5" :key="row" class="skeleton-table-row">
          <div class="skeleton-cell"><div class="skeleton-text-short"></div></div>
          <div class="skeleton-cell"><div class="skeleton-text"></div></div>
          <div class="skeleton-cell"><div class="skeleton-text"></div></div>
          <div class="skeleton-cell"><div class="skeleton-text-short"></div></div>
          <div class="skeleton-cell"><div class="skeleton-badge"></div></div>
          <div class="skeleton-cell"><div class="skeleton-badge"></div></div>
          <div class="skeleton-cell"><div class="skeleton-badge"></div></div>
          <div class="skeleton-cell"><div class="skeleton-actions"></div></div>
        </div>
      </div>

      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Tabela de Utilizadores -->
    <q-card v-else class="users-table-card">
      <q-card-section class="table-header">
        <div class="row justify-between items-center">
          <div class="total-info">
            <q-icon name="info" size="18px" class="q-mr-xs" />
            <span class="text-subtitle1">Total: <strong>{{ pagination.total }}</strong> utilizadores</span>
          </div>
          <div class="pagination-controls">
            <q-pagination
              v-model="pagination.page"
              :max="pagination.lastPage"
              :max-pages="5"
              direction-links
              boundary-links
              color="primary"
              @update:model-value="carregarUtilizadores"
              size="sm"
            />
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="utilizadoresStore.utilizadores"
        :columns="columns"
        row-key="id"
        hide-bottom
        class="users-table"
        :rows-per-page-options="[0]"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="!props.row.blocked_at ? 'positive' : 'negative'"
              :outline="!props.row.blocked_at"
              class="status-badge"
            >
              <q-icon :name="!props.row.blocked_at ? 'check_circle' : 'cancel'" size="12px" class="q-mr-xs" />
              {{ !props.row.blocked_at ? 'Ativo' : 'Bloqueado' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-badge
              :color="getTipoColor(props.row.tipo)"
              class="tipo-badge"
            >
              <q-icon :name="getTipoIcon(props.row.tipo)" size="12px" class="q-mr-xs" />
              {{ getTipoLabel(props.row.tipo) }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-verificado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.verificado ? 'positive' : 'warning'"
              class="verificado-badge"
            >
              <q-icon :name="props.row.verificado ? 'verified' : 'pending'" size="12px" class="q-mr-xs" />
              {{ props.row.verificado ? 'Verificado' : 'Pendente' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn
                flat
                round
                icon="visibility"
                size="sm"
                color="primary"
                @click="verDetalhes(props.row.id)"
              >
                <q-tooltip>Ver detalhes</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="edit"
                size="sm"
                color="secondary"
                @click="editarUtilizador(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!props.row.blocked_at"
                flat
                round
                icon="block"
                size="sm"
                color="negative"
                @click="bloquearUtilizador(props.row.id, props.row.nome)"
              >
                <q-tooltip>Bloquear</q-tooltip>
              </q-btn>
              <q-btn
                v-else
                flat
                round
                icon="lock_open"
                size="sm"
                color="positive"
                @click="desbloquearUtilizador(props.row.id, props.row.nome)"
              >
                <q-tooltip>Desbloquear</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>

      <q-card-section v-if="pagination.total > pagination.perPage" class="table-footer">
        <div class="row justify-center">
          <q-pagination
            v-model="pagination.page"
            :max="pagination.lastPage"
            :max-pages="5"
            direction-links
            boundary-links
            color="primary"
            @update:model-value="carregarUtilizadores"
            size="sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Diálogo de Edição -->
    <q-dialog v-model="dialogEdit" transition="scale">
      <q-card class="edit-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Utilizador
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="editForm.nome"
            label="Nome"
            dense
            outlined
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="editForm.email"
            label="Email"
            dense
            outlined
            class="q-mb-md"
            type="email"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="editForm.telefone"
            label="Telefone"
            dense
            outlined
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="primary" />
            </template>
          </q-input>

          <q-select
            v-model="editForm.tipo"
            :options="tipoOptions"
            label="Tipo"
            dense
            outlined
          >
            <template v-slot:prepend>
              <q-icon name="category" color="primary" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Salvar" color="primary" @click="salvarEdicao" :loading="salvando" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Detalhes -->
    <q-dialog v-model="dialogDetails" transition="scale">
      <q-card class="details-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            <q-icon name="account_circle" class="q-mr-sm" />
            Detalhes do Utilizador
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="detalhes" class="details-content">
          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="person" size="16px" />
              <span>Nome</span>
            </div>
            <div class="detail-value">{{ detalhes.nome }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="email" size="16px" />
              <span>Email</span>
            </div>
            <div class="detail-value">{{ detalhes.email }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="phone" size="16px" />
              <span>Telefone</span>
            </div>
            <div class="detail-value">{{ detalhes.telefone }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="category" size="16px" />
              <span>Tipo</span>
            </div>
            <div class="detail-value">
              <q-badge :color="getTipoColor(detalhes.tipo)" class="detail-badge">
                <q-icon :name="getTipoIcon(detalhes.tipo)" size="12px" class="q-mr-xs" />
                {{ getTipoLabel(detalhes.tipo) }}
              </q-badge>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="toggle_on" size="16px" />
              <span>Status</span>
            </div>
            <div class="detail-value">
              <q-badge :color="!detalhes.blocked_at ? 'positive' : 'negative'" class="detail-badge">
                <q-icon :name="!detalhes.blocked_at ? 'check_circle' : 'cancel'" size="12px" class="q-mr-xs" />
                {{ !detalhes.blocked_at ? 'Ativo' : 'Bloqueado' }}
              </q-badge>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="verified" size="16px" />
              <span>Verificação</span>
            </div>
            <div class="detail-value">
              <q-badge :color="detalhes.verificado ? 'positive' : 'warning'" class="detail-badge">
                <q-icon :name="detalhes.verificado ? 'verified' : 'pending'" size="12px" class="q-mr-xs" />
                {{ detalhes.verificado ? 'Verificado' : 'Pendente' }}
              </q-badge>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">
              <q-icon name="calendar_today" size="16px" />
              <span>Cadastro</span>
            </div>
            <div class="detail-value">{{ formatDate(detalhes.created_at) }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Fechar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
// ✅ IMPORT CORRETO
import { useAdminUtilizadoresStore, type UserData } from 'src/stores/admin/admin-utilizadores-store';

interface UserEditForm {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
}

defineOptions({
  name: 'AdminUtilizadores',
});

const $q = useQuasar();
// ✅ USANDO O STORE CORRETO
const utilizadoresStore = useAdminUtilizadoresStore();

// Estado local
const dialogEdit = ref(false);
const dialogDetails = ref(false);
const salvando = ref(false);
const detalhes = ref<UserData | null>(null);

// Filtros
const filters = reactive({
  busca: '',
  tipo: null as string | null,
  status: null as string | null,
});

// Paginação
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  lastPage: 1,
});

// Formulário de edição
const editForm = reactive<UserEditForm>({
  id: 0,
  nome: '',
  email: '',
  telefone: '',
  tipo: '',
});

// Opções
const tipoOptions = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Prestador', value: 'prestador' },
  { label: 'Administrador', value: 'admin' },
];

const statusOptions = [
  { label: 'Ativos', value: 'ativo' },
  { label: 'Bloqueados', value: 'bloqueado' },
];

// Colunas da tabela
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left', sortable: false },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: false },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: false },
  { name: 'verificado', label: 'Verificado', field: 'verificado', align: 'center', sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', sortable: false },
];

// Métodos auxiliares
const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    cliente: 'Cliente',
    prestador: 'Prestador',
    admin: 'Administrador',
  };
  return labels[tipo] || tipo;
};

const getTipoColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    cliente: 'primary',
    prestador: 'secondary',
    admin: 'grey-8',
  };
  return colors[tipo] || 'grey';
};

const getTipoIcon = (tipo: string): string => {
  const icons: Record<string, string> = {
    cliente: 'person',
    prestador: 'handyman',
    admin: 'admin_panel_settings',
  };
  return icons[tipo] || 'person';
};

const formatDate = (date?: string): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const clearSearch = (): void => {
  filters.busca = '';
  handleFilterChange();
};

const novoUtilizador = (): void => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidade em desenvolvimento',
    position: 'top',
  });
};

// ✅ Carregar utilizadores usando utilizadoresStore
const carregarUtilizadores = async (): Promise<void> => {
  try {
    const params: {
      page: number;
      per_page: number;
      busca?: string;
      tipo?: string;
      status?: string;
    } = {
      page: pagination.page,
      per_page: pagination.perPage,
    };

    if (filters.busca) params.busca = filters.busca;
    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.status === 'ativo') params.status = 'ativo';
    if (filters.status === 'bloqueado') params.status = 'bloqueado';

    const result = await utilizadoresStore.fetchUtilizadores(params);

    if (result) {
      pagination.total = result.total;
      pagination.lastPage = result.last_page;
      pagination.page = result.current_page;
    }
  } catch (err) {
    console.error('Erro ao carregar utilizadores:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar utilizadores',
      position: 'top',
    });
  }
};

// Handler para mudança de filtro
const handleFilterChange = (): void => {
  pagination.page = 1;
  void carregarUtilizadores();
};

// ✅ Ver detalhes usando utilizadoresStore
const verDetalhes = async (id: number): Promise<void> => {
  try {
    const user = await utilizadoresStore.fetchUtilizadorDetalhes(id);
    if (user) {
      detalhes.value = user;
      dialogDetails.value = true;
    }
  } catch (err) {
    console.error('Erro ao carregar detalhes:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar detalhes do utilizador',
      position: 'top',
    });
  }
};

// Editar utilizador
const editarUtilizador = (user: UserData): void => {
  editForm.id = user.id;
  editForm.nome = user.nome;
  editForm.email = user.email;
  editForm.telefone = user.telefone;
  editForm.tipo = user.tipo;
  dialogEdit.value = true;
};

// ✅ Salvar edição usando utilizadoresStore
const salvarEdicao = async (): Promise<void> => {
  salvando.value = true;
  try {
    const result = await utilizadoresStore.updateUtilizador(editForm.id, {
      nome: editForm.nome,
      email: editForm.email,
      telefone: editForm.telefone,
      tipo: editForm.tipo,
    });

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Utilizador atualizado com sucesso!',
        position: 'top',
      });
      dialogEdit.value = false;
      await carregarUtilizadores();
    }
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar utilizador',
      position: 'top',
    });
  } finally {
    salvando.value = false;
  }
};

// ✅ Bloquear utilizador usando utilizadoresStore
const bloquearUtilizador = (id: number, nome: string): void => {
  $q.dialog({
    title: 'Confirmar',
    message: `Tem certeza que deseja bloquear o utilizador ${nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.blockUtilizador(id);
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Utilizador bloqueado com sucesso!',
            position: 'top',
          });
          await carregarUtilizadores();
        }
      } catch (err) {
        console.error('Erro ao bloquear:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao bloquear utilizador',
          position: 'top',
        });
      }
    })();
  });
};

// ✅ Desbloquear utilizador usando utilizadoresStore
const desbloquearUtilizador = (id: number, nome: string): void => {
  $q.dialog({
    title: 'Confirmar',
    message: `Tem certeza que deseja desbloquear o utilizador ${nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.unblockUtilizador(id);
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Utilizador desbloqueado com sucesso!',
            position: 'top',
          });
          await carregarUtilizadores();
        }
      } catch (err) {
        console.error('Erro ao desbloquear:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao desbloquear utilizador',
          position: 'top',
        });
      }
    })();
  });
};

// Observar mudanças nos filtros
watch([() => filters.busca, () => filters.tipo, () => filters.status], () => {
  pagination.page = 1;
  void carregarUtilizadores();
});

// Carregar dados ao montar
onMounted(() => {
  void carregarUtilizadores();
});
</script>

<style scoped lang="scss">
// ... styles mantidos iguais ao original
$primary-color: #667eea;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;

.admin-users-page {
  max-width: 1400px;
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
}

.filters-card,
.users-table-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.search-input,
.filter-select {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

// Skeleton Loading
.skeleton-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  margin-bottom: 24px;
}

.skeleton-table-header {
  padding: 20px;
  border-bottom: 1px solid $gray-200;

  .skeleton-total {
    width: 180px;
    height: 20px;
    background: $gray-200;
    border-radius: 4px;
  }

  .skeleton-pagination {
    width: 200px;
    height: 32px;
    background: $gray-200;
    border-radius: 4px;
  }
}

.skeleton-table {
  .skeleton-table-header-row {
    display: flex;
    background: $gray-100;
    padding: 12px 16px;
    border-bottom: 1px solid $gray-200;

    .skeleton-header-cell {
      flex: 1;
      height: 20px;
      background: $gray-300;
      border-radius: 4px;
      margin: 0 8px;

      &:first-child {
        margin-left: 0;
        width: 60px;
        flex: none;
      }
      &:last-child {
        margin-right: 0;
        width: 120px;
        flex: none;
      }
    }
  }

  .skeleton-table-row {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid $gray-200;

    .skeleton-cell {
      flex: 1;
      margin: 0 8px;

      &:first-child {
        margin-left: 0;
        width: 60px;
        flex: none;
      }
      &:last-child {
        margin-right: 0;
        width: 120px;
        flex: none;
      }

      .skeleton-text {
        width: 100%;
        height: 16px;
        background: $gray-200;
        border-radius: 4px;
      }

      .skeleton-text-short {
        width: 60%;
        height: 16px;
        background: $gray-200;
        border-radius: 4px;
      }

      .skeleton-badge {
        width: 80px;
        height: 24px;
        background: $gray-200;
        border-radius: 12px;
        margin: 0 auto;
      }

      .skeleton-actions {
        display: flex;
        gap: 8px;
        justify-content: center;

        &::before {
          content: '';
          width: 32px;
          height: 32px;
          background: $gray-200;
          border-radius: 50%;
        }
        &::after {
          content: '';
          width: 32px;
          height: 32px;
          background: $gray-200;
          border-radius: 50%;
        }
      }
    }
  }
}

.skeleton-shimmer {
  position: absolute;
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

.table-header {
  border-bottom: 1px solid #e9ecef;

  .total-info {
    display: flex;
    align-items: center;
    color: #495057;
    font-size: 0.875rem;
  }

  .pagination-controls {
    :deep(.q-pagination) {
      .q-btn {
        min-width: 32px;
        height: 32px;
      }
    }
  }
}

.users-table {
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
    }
  }
}

.status-badge,
.tipo-badge,
.verificado-badge {
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
    &:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease;
    }
  }
}

.table-footer {
  border-top: 1px solid #e9ecef;
  padding: 16px;
}

.edit-dialog,
.details-dialog {
  min-width: 450px;
  border-radius: 16px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 16px 20px;

    .text-h6 {
      display: flex;
      align-items: center;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a2e;
    }
  }

  .dialog-actions {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
  }
}

.details-content {
  padding: 20px;

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #6c757d;
      font-size: 0.875rem;
      min-width: 100px;

      i {
        font-size: 16px;
      }
    }

    .detail-value {
      flex: 1;
      text-align: right;
      color: #2c3e50;
      font-weight: 500;
      word-break: break-word;
    }

    .detail-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .admin-users-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-dialog,
  .details-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }

  .details-content .detail-row {
    flex-direction: column;
    gap: 8px;

    .detail-label {
      min-width: auto;
    }

    .detail-value {
      text-align: left;
    }
  }

  .skeleton-table {
    overflow-x: auto;
  }
}
</style>
