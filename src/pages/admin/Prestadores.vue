<template>
  <q-page class="admin-prestadores q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="handyman" size="32px" class="q-mr-sm" />
          Gestão de Prestadores
        </div>
        <div class="page-subtitle">Gerencie os prestadores de serviços da plataforma</div>
      </div>
      <div class="header-actions">
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarPrestadores"
          :loading="utilizadoresStore.loading"
        />
      </div>
    </div>

    <!-- Filtros e busca -->
    <q-card class="filters-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.busca"
              placeholder="Buscar prestador..."
              dense
              outlined
              @update:model-value="handleBuscaChange"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filtros.busca">
                <q-icon name="close" class="cursor-pointer" @click="limparBusca" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.status"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              clearable
              @update:model-value="handleFilterChange"
              class="filter-select"
            >
              <template v-slot:prepend>
                <q-icon name="verified" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.categoria"
              :options="categoriasSelectOptions"
              label="Categoria"
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
          <div class="col-12 col-md-2">
            <q-btn
              label="Filtrar"
              icon="filter_list"
              color="primary"
              dense
              @click="abrirFiltros"
              outline
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
          <div v-for="i in colunas.length" :key="`header-${i}`" class="skeleton-header-cell"></div>
        </div>

        <div v-for="row in 5" :key="row" class="skeleton-table-row">
          <div class="skeleton-cell">
            <div class="skeleton-text"></div>
            <div class="skeleton-text-short q-mt-xs"></div>
          </div>
          <div class="skeleton-cell"><div class="skeleton-text"></div></div>
          <div class="skeleton-cell"><div class="skeleton-text-short"></div></div>
          <div class="skeleton-cell"><div class="skeleton-badge"></div></div>
          <div class="skeleton-cell"><div class="skeleton-rating"></div></div>
          <div class="skeleton-cell"><div class="skeleton-chips"></div></div>
          <div class="skeleton-cell"><div class="skeleton-actions"></div></div>
        </div>
      </div>

      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Tabela de prestadores -->
    <q-card v-else class="prestadores-table-card">
      <q-card-section class="table-header">
        <div class="row justify-between items-center">
          <div class="total-info">
            <q-icon name="info" size="18px" class="q-mr-xs" />
            <span class="text-subtitle1">Total: <strong>{{ paginacao.total }}</strong> prestadores</span>
          </div>
          <div class="pagination-controls">
            <q-pagination
              v-model="paginacao.page"
              :max="paginacao.lastPage"
              :max-pages="5"
              direction-links
              boundary-links
              color="primary"
              @update:model-value="carregarPrestadores"
              size="sm"
            />
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="utilizadoresStore.prestadores"
        :columns="colunas"
        row-key="id"
        hide-bottom
        class="prestadores-table"
        :rows-per-page-options="[0]"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.verificado ? 'positive' : 'warning'" class="status-badge">
              <q-icon :name="props.row.verificado ? 'verified' : 'pending'" size="12px" class="q-mr-xs" />
              {{ props.row.verificado ? 'Verificado' : 'Pendente' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-avaliacao="props">
          <q-td :props="props">
            <div class="rating-container">
              <q-rating
                :model-value="props.row.media_avaliacao || 0"
                size="16px"
                :max="5"
                color="amber"
                readonly
                icon="star"
                icon-selected="star"
              />
              <span class="rating-count">({{ props.row.total_avaliacoes || 0 }})</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-categorias="props">
          <q-td :props="props">
            <div class="categorias-container">
              <q-chip
                v-for="cat in props.row.categorias"
                :key="cat.id"
                size="sm"
                :color="getCategoriaCor(cat.nome)"
                text-color="white"
                dense
              >
                {{ cat.nome }}
              </q-chip>
              <span v-if="!props.row.categorias?.length" class="text-grey">-</span>
            </div>
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
                @click="verPrestador(props.row)"
              >
                <q-tooltip>Ver detalhes</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="edit"
                size="sm"
                color="secondary"
                @click="editarPrestador(props.row)"
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
                @click="bloquearPrestador(props.row)"
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
                @click="desbloquearPrestador(props.row)"
              >
                <q-tooltip>Desbloquear</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-center q-pa-md">
            <q-icon name="info" size="32px" color="grey" />
            <div class="text-subtitle1 q-mt-sm">Nenhum prestador encontrado</div>
            <div class="text-caption text-grey">Tente ajustar os filtros ou verifique se há prestadores cadastrados</div>
          </div>
        </template>
      </q-table>

      <q-card-section v-if="paginacao.total > paginacao.perPage" class="table-footer">
        <div class="row justify-center">
          <q-pagination
            v-model="paginacao.page"
            :max="paginacao.lastPage"
            :max-pages="5"
            direction-links
            boundary-links
            color="primary"
            @update:model-value="carregarPrestadores"
            size="sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog de filtros avançados -->
    <q-dialog v-model="mostrarFiltros" transition="scale">
      <q-card style="min-width: 400px" class="filters-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros Avançados
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="filtros.status"
            :options="statusOptions"
            label="Status de verificação"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <q-select
            v-model="filtros.categoria"
            :options="categoriasSelectOptions"
            label="Categoria"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <q-input
            v-model.number="filtros.avaliacaoMin"
            label="Avaliação mínima (0-5)"
            type="number"
            outlined
            dense
            :min="0"
            :max="5"
            step="0.5"
          />

          <q-select
            v-model="filtros.ordenar"
            :options="ordenacaoOptions"
            label="Ordenar por"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Limpar tudo" color="grey-7" @click="limparFiltros" />
          <q-btn unelevated label="Aplicar" color="primary" @click="aplicarFiltros" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de detalhes do prestador -->
    <q-dialog v-model="mostrarDetalhes" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="details-dialog">
        <q-card-section class="dialog-header bg-primary text-white">
          <div class="text-h6">
            <q-icon name="handyman" class="q-mr-sm" />
            Detalhes do Prestador
          </div>
          <q-btn flat round dense icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section v-if="prestadorSelecionado" class="details-content">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4 text-center">
              <q-avatar size="120px" class="avatar-large">
                <img :src="prestadorSelecionado.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestadorSelecionado.nome)}&background=667eea&color=fff`" />
              </q-avatar>
              <div class="text-h6 q-mt-md">{{ prestadorSelecionado.nome }}</div>
              <div class="text-grey-7">{{ prestadorSelecionado.email }}</div>
              <div class="text-grey-7">{{ prestadorSelecionado.telefone }}</div>
            </div>

            <div class="col-12 col-md-8">
              <q-list bordered separator class="rounded-borders">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status de Verificação</q-item-label>
                    <q-item-label>
                      <q-badge :color="prestadorSelecionado.verificado ? 'positive' : 'warning'" class="status-badge-large">
                        <q-icon :name="prestadorSelecionado.verificado ? 'verified' : 'pending'" size="14px" class="q-mr-xs" />
                        {{ prestadorSelecionado.verificado ? 'Verificado' : 'Pendente' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Avaliação</q-item-label>
                    <q-item-label>
                      <q-rating :model-value="prestadorSelecionado.media_avaliacao || 0" size="20px" :max="5" color="amber" readonly />
                      <span class="q-ml-sm">({{ prestadorSelecionado.total_avaliacoes || 0 }} avaliações)</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Categorias</q-item-label>
                    <q-item-label>
                      <q-chip
                        v-for="cat in prestadorSelecionado.categorias"
                        :key="cat.id"
                        size="sm"
                        :color="getCategoriaCor(cat.nome)"
                        text-color="white"
                      >
                        {{ cat.nome }}
                      </q-chip>
                      <span v-if="!prestadorSelecionado.categorias?.length" class="text-grey">Nenhuma categoria</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status da Conta</q-item-label>
                    <q-item-label>
                      <q-badge :color="!prestadorSelecionado.blocked_at ? 'positive' : 'negative'">
                        <q-icon :name="!prestadorSelecionado.blocked_at ? 'check_circle' : 'cancel'" size="12px" class="q-mr-xs" />
                        {{ !prestadorSelecionado.blocked_at ? 'Ativo' : 'Bloqueado' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Data de Cadastro</q-item-label>
                    <q-item-label>{{ formatDate(prestadorSelecionado.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row q-mt-md q-gutter-sm">
                <q-btn
                  v-if="!prestadorSelecionado.verificado"
                  unelevated
                  color="positive"
                  icon="verified"
                  label="Verificar Prestador"
                  @click="aprovarPrestador(prestadorSelecionado.id)"
                />
                <q-btn
                  v-else
                  unelevated
                  color="warning"
                  icon="warning"
                  label="Suspender Verificação"
                  @click="reprovarPrestador(prestadorSelecionado.id)"
                />
                <q-btn flat label="Fechar" color="grey-7" v-close-popup />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
// ✅ IMPORTS CORRETOS
import { useAdminUtilizadoresStore, type PrestadorData } from 'src/stores/admin/admin-utilizadores-store';
import { useAdminConteudoStore, type CategoriaData } from 'src/stores/admin/admin-conteudo-store';



defineOptions({
  name: 'AdminPrestadores',
});

const $q = useQuasar();
// ✅ USANDO OS STORES CORRETOS
const utilizadoresStore = useAdminUtilizadoresStore();
const conteudoStore = useAdminConteudoStore();

// Estados
const mostrarFiltros = ref(false);
const mostrarDetalhes = ref(false);
const prestadorSelecionado = ref<PrestadorData | null>(null);

// Filtros
const filtros = reactive({
  busca: '',
  status: null as string | null,
  categoria: null as number | null,
  avaliacaoMin: null as number | null,
  ordenar: 'nome_asc',
});

// Paginação
const paginacao = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  lastPage: 1,
});

// Opções
const statusOptions = [
  { label: 'Verificados', value: 'verificado' },
  { label: 'Pendentes', value: 'pendente' },
];

const categoriasSelectOptions = ref<{ label: string; value: number }[]>([]);

const ordenacaoOptions = [
  { label: 'Nome (A-Z)', value: 'nome_asc' },
  { label: 'Nome (Z-A)', value: 'nome_desc' },
  { label: 'Melhor avaliação', value: 'avaliacao_desc' },
  { label: 'Mais serviços', value: 'servicos_desc' },
];

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'center', sortable: false },
  { name: 'status', label: 'Status', field: 'verificado', align: 'center', sortable: false },
  { name: 'avaliacao', label: 'Avaliação', field: 'media_avaliacao', align: 'center', sortable: true },
  { name: 'categorias', label: 'Categorias', field: 'categorias', align: 'left', sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', sortable: false },
];

// Métodos auxiliares
const getCategoriaCor = (nome: string) => {
  const cores: Record<string, string> = {
    'Eletricista': 'primary',
    'Canalizador': 'secondary',
    'Pintor': 'info',
    'Informático': 'warning',
    'Limpeza': 'positive',
  };
  return cores[nome] || 'grey';
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

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

// ✅ Carregar prestadores usando utilizadoresStore
const carregarPrestadores = async () => {
  try {
    const params: {
      page: number;
      per_page: number;
      busca?: string;
      verificado?: boolean;
      categoria?: number;
      avaliacao_min?: number;
    } = {
      page: paginacao.page,
      per_page: paginacao.perPage,
    };

    if (filtros.busca) params.busca = filtros.busca;
    if (filtros.status === 'verificado') params.verificado = true;
    if (filtros.status === 'pendente') params.verificado = false;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.avaliacaoMin) params.avaliacao_min = filtros.avaliacaoMin;

    const result = await utilizadoresStore.fetchPrestadores(params);

    if (result) {
      paginacao.total = result.total;
      paginacao.lastPage = result.last_page;
      paginacao.page = result.current_page;
    }
  } catch (err) {
    console.error('Erro ao carregar prestadores:', err);
  }
};

// Handlers
const handleBuscaChange = () => {
  paginacao.page = 1;
  void carregarPrestadores();
};

const handleFilterChange = () => {
  paginacao.page = 1;
  void carregarPrestadores();
};

const limparBusca = () => {
  filtros.busca = '';
  handleBuscaChange();
};

const abrirFiltros = () => {
  mostrarFiltros.value = true;
};

const limparFiltros = () => {
  filtros.status = null;
  filtros.categoria = null;
  filtros.avaliacaoMin = null;
  filtros.ordenar = 'nome_asc';
};

const aplicarFiltros = () => {
  mostrarFiltros.value = false;
  paginacao.page = 1;
  void carregarPrestadores();
};

const verPrestador = (prestador: PrestadorData) => {
  prestadorSelecionado.value = prestador;
  mostrarDetalhes.value = true;
};

const editarPrestador = (prestador: PrestadorData) => {
  $q.notify({
    type: 'info',
    message: `Editar ${prestador.nome}`,
    position: 'top',
  });
};

// ✅ Aprovar prestador usando utilizadoresStore
const aprovarPrestador = (id: number) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Tem certeza que deseja aprovar este prestador?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.aprovarPrestador(id);
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Prestador aprovado com sucesso!',
          });
          await carregarPrestadores();
          mostrarDetalhes.value = false;
        }
      } catch (err) {
        console.error('Erro ao aprovar:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao aprovar prestador',
        });
      }
    })();
  });
};

// ✅ Reprovar prestador usando utilizadoresStore
const reprovarPrestador = (id: number) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Tem certeza que deseja reprovar este prestador?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.reprovarPrestador(id);
        if (result) {
          $q.notify({
            type: 'warning',
            message: 'Prestador reprovado!',
          });
          await carregarPrestadores();
          mostrarDetalhes.value = false;
        }
      } catch (err) {
        console.error('Erro ao reprovar:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao reprovar prestador',
        });
      }
    })();
  });
};

// ✅ Bloquear prestador usando utilizadoresStore
const bloquearPrestador = (prestador: PrestadorData) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Tem certeza que deseja bloquear o prestador ${prestador.nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.blockUtilizador(prestador.id);
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Prestador bloqueado com sucesso!',
          });
          await carregarPrestadores();
        }
      } catch (err) {
        console.error('Erro ao bloquear:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao bloquear prestador',
        });
      }
    })();
  });
};

// ✅ Desbloquear prestador usando utilizadoresStore
const desbloquearPrestador = (prestador: PrestadorData) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Tem certeza que deseja desbloquear o prestador ${prestador.nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const result = await utilizadoresStore.unblockUtilizador(prestador.id);
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Prestador desbloqueado com sucesso!',
          });
          await carregarPrestadores();
        }
      } catch (err) {
        console.error('Erro ao desbloquear:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao desbloquear prestador',
        });
      }
    })();
  });
};

// Watch
watch([() => filtros.busca, () => filtros.status, () => filtros.categoria, () => filtros.avaliacaoMin], () => {
  paginacao.page = 1;
  void carregarPrestadores();
});

// Carregar dados ao montar
onMounted(() => {
  void carregarCategorias();
  void carregarPrestadores();
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

.admin-prestadores {
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

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filters-card,
.prestadores-table-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;

  :deep(.q-card__section) {
    padding: 20px;
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

      &:first-child { margin-left: 0; width: 20%; flex: none; }
      &:nth-child(2) { width: 20%; flex: none; }
      &:nth-child(3) { width: 15%; flex: none; }
      &:nth-child(4) { width: 10%; flex: none; }
      &:nth-child(5) { width: 12%; flex: none; }
      &:nth-child(6) { width: 15%; flex: none; }
      &:last-child { margin-right: 0; width: 8%; flex: none; }
    }
  }

  .skeleton-table-row {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid $gray-200;

    .skeleton-cell {
      flex: 1;
      margin: 0 8px;

      &:first-child { margin-left: 0; width: 20%; flex: none; }
      &:nth-child(2) { width: 20%; flex: none; }
      &:nth-child(3) { width: 15%; flex: none; }
      &:nth-child(4) { width: 10%; flex: none; }
      &:nth-child(5) { width: 12%; flex: none; }
      &:nth-child(6) { width: 15%; flex: none; }
      &:last-child { margin-right: 0; width: 8%; flex: none; }

      .skeleton-text {
        width: 100%;
        height: 16px;
        background: $gray-200;
        border-radius: 4px;
      }

      .skeleton-text-short {
        width: 60%;
        height: 12px;
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

      .skeleton-rating {
        display: flex;
        gap: 4px;

        &::before {
          content: '★★★★★';
          color: $gray-200;
          font-size: 14px;
          letter-spacing: 2px;
        }
      }

      .skeleton-chips {
        display: flex;
        gap: 4px;

        &::before {
          content: 'Chip';
          color: transparent;
          background: $gray-200;
          width: 60px;
          height: 24px;
          border-radius: 16px;
        }
      }

      .skeleton-actions {
        display: flex;
        gap: 8px;
        justify-content: center;

        &::before, &::after {
          content: '';
          width: 28px;
          height: 28px;
          background: $gray-200;
          border-radius: 50%;
        }
        &::after {
          content: '';
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// Estilos principais
.table-header {
  border-bottom: 1px solid #e9ecef;

  .total-info {
    display: flex;
    align-items: center;
    color: #495057;
    font-size: 0.875rem;
  }
}

.prestadores-table {
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

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.status-badge-large {
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 4px;

  .rating-count {
    font-size: 0.75rem;
    color: #6c757d;
  }
}

.categorias-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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

.filters-dialog,
.details-dialog {
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

  .avatar-large {
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .admin-prestadores {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-dialog,
  .details-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }

  .details-content .row {
    flex-direction: column;
  }
}
</style>
