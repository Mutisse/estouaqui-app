<template>
  <q-page class="pedidos-disponiveis-page bg-grey-1">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="skeleton-filters q-px-md q-mb-md">
        <div class="skeleton-filter-item">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-select"></div>
        </div>
        <div class="skeleton-filter-item">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-select"></div>
        </div>
        <div class="skeleton-filter-item">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-toggle">
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-cards q-px-md">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-card-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-card-info">
              <div class="skeleton-line w-50"></div>
              <div class="skeleton-line w-30"></div>
            </div>
            <div class="skeleton-chip"></div>
          </div>
          <div class="skeleton-card-body">
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-60"></div>
          </div>
          <div class="skeleton-card-footer">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-btn-small"></div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Conteúdo original -->
    <template v-else>
      <!-- Header -->
      <div class="page-header q-pa-md">
        <div class="text-h6 text-bold">Pedidos Disponíveis</div>
        <div class="text-caption text-grey-6">Encontre serviços perto de si</div>
      </div>

      <!-- Filtros -->
      <div class="filters-container q-px-md q-mb-md">
        <div class="row items-center justify-between q-col-gutter-md">
          <!-- Filtro de Categoria -->
          <div class="col-12 col-sm-6">
            <div class="filter-label">
              <q-icon name="category" size="16px" class="q-mr-xs" />
              <span>Categoria</span>
            </div>
            <q-select
              v-model="filtros.categoriaId"
              :options="categoriasOptions"
              label="Todas as categorias"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="filter-select"
              @update:model-value="aplicarFiltros"
            />
          </div>

          <!-- Filtro de Raio -->
          <div class="col-12 col-sm-6">
            <div class="filter-label">
              <q-icon name="radar" size="16px" class="q-mr-xs" />
              <span>Raio de busca</span>
            </div>
            <q-select
              v-model="filtros.raio"
              :options="raioOptions"
              label="Distância máxima"
              outlined
              dense
              emit-value
              map-options
              class="filter-select"
              @update:model-value="aplicarFiltros"
            />
          </div>
        </div>

        <!-- Ordenação -->
        <div class="row items-center justify-between q-mt-md">
          <div class="filter-label">
            <q-icon name="sort" size="16px" class="q-mr-xs" />
            <span>Ordenar por</span>
          </div>
          <q-btn-toggle
            v-model="filtros.ordenacao"
            :options="ordenacaoOptions"
            toggle-color="primary"
            dense
            no-caps
            class="ordenacao-toggle"
          />
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div v-if="pedidosFiltrados.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="search_off" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido encontrado</div>
        <div class="text-grey-6">Não há pedidos disponíveis com os filtros selecionados</div>
        <q-btn flat color="primary" label="Limpar filtros" class="q-mt-md" @click="limparFiltros" />
      </div>

      <div v-else class="pedidos-list q-px-md q-pb-xl">
        <div
          v-for="pedido in pedidosFiltrados"
          :key="pedido.id"
          class="pedido-card q-mb-md"
          @click="abrirDetalhes(pedido)"
        >
          <!-- Cabeçalho do card -->
          <div class="pedido-header row items-center">
            <q-avatar size="45px" class="q-mr-sm">
              <img
                :src="
                  pedido.cliente?.foto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.cliente?.nome || 'Cliente')}&background=667eea&color=fff`
                "
              />
            </q-avatar>
            <div class="col">
              <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
              <div class="pedido-data">{{ formatarData(pedido.created_at) }}</div>
            </div>
            <div class="pedido-categoria">
              <q-chip :color="pedido.categoria?.cor || 'primary'" text-color="white" size="sm">
                {{ pedido.categoria?.nome || 'Serviço' }}
              </q-chip>
            </div>
          </div>

          <!-- Descrição -->
          <div class="pedido-descricao q-mt-sm">
            <div class="descricao-text">{{ pedido.descricao || 'Sem descrição' }}</div>
          </div>

          <!-- Localização e Distância -->
          <div class="pedido-localizacao row items-center justify-between q-mt-sm">
            <div class="row items-center">
              <q-icon name="location_on" size="16px" color="grey-6" />
              <span class="text-caption text-grey-7">{{ pedido.endereco }}</span>
            </div>
            <div v-if="pedido.distancia_km" class="distancia-badge">
              <q-icon name="near_me" size="14px" color="primary" />
              <span class="text-caption text-primary">
                {{
                  pedido.distancia_km < 1
                    ? (pedido.distancia_km * 1000).toFixed(0) + 'm'
                    : pedido.distancia_km.toFixed(1) + ' km'
                }}
              </span>
            </div>
          </div>

          <!-- Footer do card -->
          <div class="pedido-footer row justify-between items-center q-mt-md">
            <div class="pedido-status">
              <q-badge color="positive" outline>Disponível</q-badge>
            </div>
            <q-btn
              color="primary"
              label="Fazer Proposta"
              size="sm"
              unelevated
              no-caps
              @click.stop="abrirModalProposta(pedido)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Modal para fazer proposta -->
    <q-dialog v-model="modalProposta.visivel" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 100%; border-radius: 20px">
        <q-card-section
          class="q-pa-md"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <div class="text-h6 text-white">Enviar Proposta</div>
          <div class="text-subtitle2 text-white" style="opacity: 0.9">
            Para: {{ modalProposta.pedido?.cliente?.nome }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="info-pedido q-mb-md">
            <div class="text-weight-bold">Categoria:</div>
            <div>{{ modalProposta.pedido?.categoria?.nome }}</div>
            <div class="text-weight-bold q-mt-sm">Descrição:</div>
            <div class="text-caption">{{ modalProposta.pedido?.descricao }}</div>
          </div>

          <q-input
            v-model="novaProposta.valor"
            type="number"
            outlined
            dense
            label="Valor (MZN) *"
            class="q-mb-md"
            :rules="[(val) => val > 0 || 'Valor obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="grey-6" />
            </template>
          </q-input>

          <q-input
            v-model="novaProposta.mensagem"
            type="textarea"
            outlined
            dense
            label="Mensagem (opcional)"
            placeholder="Descreva como pode ajudar..."
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup class="text-grey-7" />
          <q-btn
            unelevated
            label="Enviar Proposta"
            color="primary"
            :loading="carregandoEnvio"
            @click="enviarProposta"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorStore, type PedidoDisponivelData } from 'src/stores/prestador-store';

defineOptions({
  name: 'PedidosDisponiveisPage',
});

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// Estados
const carregamentoInicial = ref(true);
const carregandoEnvio = ref(false);
const pedidos = ref<PedidoDisponivelData[]>([]);

// Opções
const raioOptions = ref<{ label: string; value: number }[]>([
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '30 km', value: 30 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
]);

const ordenacaoOptions = ref([
  { label: 'Mais próximos', value: 'distancia' },
  { label: 'Mais recentes', value: 'data' },
  { label: 'Maior distância', value: 'distancia_desc' },
]);

// Categorias do prestador (para filtro)
const categoriasOptions = computed(() => {
  const minhasCats = prestadorStore.minhasCategorias;
  return [
    { label: 'Todas as categorias', value: null },
    ...minhasCats.map((cat) => ({
      label: cat.nome,
      value: cat.id,
      icon: cat.icone,
      color: cat.cor,
    })),
  ];
});

// Filtros
const filtros = reactive({
  categoriaId: null as number | null,
  raio: 10,
  ordenacao: 'distancia' as 'distancia' | 'distancia_desc' | 'data',
});

// Modal de proposta
const modalProposta = reactive({
  visivel: false,
  pedido: null as PedidoDisponivelData | null,
});

const novaProposta = reactive({
  valor: 0,
  mensagem: '',
});

// Computed para pedidos filtrados e ordenados
const pedidosFiltrados = computed(() => {
  let resultado = [...pedidos.value];

  if (filtros.categoriaId) {
    resultado = resultado.filter((p) => p.categoria?.id === filtros.categoriaId);
  }

  if (filtros.raio) {
    resultado = resultado.filter((p) => {
      if (p.distancia_km === undefined || p.distancia_km === null) return true;
      return p.distancia_km <= filtros.raio;
    });
  }

  if (filtros.ordenacao === 'distancia') {
    resultado.sort((a, b) => {
      const distA = a.distancia_km ?? 9999;
      const distB = b.distancia_km ?? 9999;
      return distA - distB;
    });
  } else if (filtros.ordenacao === 'distancia_desc') {
    resultado.sort((a, b) => {
      const distA = a.distancia_km ?? -1;
      const distB = b.distancia_km ?? -1;
      return distB - distA;
    });
  } else if (filtros.ordenacao === 'data') {
    resultado.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }

  return resultado;
});

const formatarData = (data: string) => {
  if (!data) return '';
  try {
    const date = new Date(data);
    const hoje = new Date();
    const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0)
      return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  } catch {
    return data;
  }
};

const aplicarFiltros = () => {
  console.log('Filtros aplicados:', filtros);
};

const limparFiltros = () => {
  filtros.categoriaId = null;
  filtros.raio = 10;
  filtros.ordenacao = 'distancia';
};

const carregarPedidosDisponiveis = async () => {
  try {
    await prestadorStore.fetchPedidosDisponiveis();
    pedidos.value = prestadorStore.pedidosDisponiveis;
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar pedidos disponíveis',
      position: 'top',
    });
  }
};

const carregarMinhasCategorias = async () => {
  try {
    await prestadorStore.fetchMinhasCategorias();
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

const abrirDetalhes = (pedido: PedidoDisponivelData) => {
  console.log('Ver detalhes do pedido:', pedido.id);
};

const abrirModalProposta = (pedido: PedidoDisponivelData) => {
  modalProposta.pedido = pedido;
  novaProposta.valor = 0;
  novaProposta.mensagem = '';
  modalProposta.visivel = true;
};

const enviarProposta = async () => {
  if (!novaProposta.valor || novaProposta.valor <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Informe um valor válido',
      position: 'top',
    });
    return;
  }

  if (!modalProposta.pedido) return;

  carregandoEnvio.value = true;

  try {
    const propostaData: { pedido_id: number; valor: number; mensagem?: string } = {
      pedido_id: modalProposta.pedido.id,
      valor: novaProposta.valor,
    };

    if (novaProposta.mensagem && novaProposta.mensagem.trim()) {
      propostaData.mensagem = novaProposta.mensagem.trim();
    }

    const result = await prestadorStore.enviarProposta(propostaData);

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Proposta enviada com sucesso!',
        position: 'top',
      });
      modalProposta.visivel = false;
      pedidos.value = pedidos.value.filter((p) => p.id !== modalProposta.pedido?.id);
      await carregarPedidosDisponiveis();
    }
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar proposta',
      position: 'top',
    });
  } finally {
    carregandoEnvio.value = false;
  }
};

watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth && authStore.isPrestador) {
      await carregarPedidosDisponiveis();
      await carregarMinhasCategorias();
    }
  },
);

// Inicialização
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, faça login para continuar',
      position: 'top',
    });
    await router.push('/auth/login');
    return;
  }

  if (!authStore.isPrestador) {
    $q.notify({
      type: 'warning',
      message: 'Apenas prestadores podem aceder a esta página',
      position: 'top',
    });
    await router.push('/mobile/prestador/dashboard');
    return;
  }

  carregamentoInicial.value = true;
  try {
    await Promise.all([carregarPedidosDisponiveis(), carregarMinhasCategorias()]);
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: $gray-100;
  min-height: 100vh;
}

.skeleton-header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-title {
  width: 180px;
  height: 24px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-subtitle {
  width: 120px;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-filters {
  background: white;
  padding: 16px;
  border-radius: 16px;
  margin: 16px;
}

.skeleton-filter-item {
  margin-bottom: 16px;
}

.skeleton-select {
  height: 44px;
  border-radius: 12px;
  margin-top: 6px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-toggle {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.skeleton-btn {
  width: 80px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-cards {
  padding: 0 16px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid $gray-200;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-info {
  flex: 1;
}

.skeleton-chip {
  width: 80px;
  height: 28px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-body {
  margin-bottom: 12px;
}

.skeleton-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid $gray-200;
}

.skeleton-btn-small {
  width: 100px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.pedidos-disponiveis-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.filters-container {
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .filter-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: $gray-600;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
  }

  .filter-select {
    :deep(.q-field__control) {
      border-radius: 12px;
    }
  }

  .ordenacao-toggle {
    :deep(.q-btn) {
      min-width: 90px;
    }
  }
}

.pedido-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .pedido-header {
    .pedido-cliente {
      font-weight: 600;
      color: $gray-800;
    }
    .pedido-data {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }

  .pedido-descricao {
    .descricao-text {
      font-size: 0.85rem;
      color: $gray-700;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .pedido-localizacao {
    gap: 4px;

    .distancia-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(102, 126, 234, 0.1);
      padding: 4px 8px;
      border-radius: 20px;
    }
  }

  .pedido-footer {
    border-top: 1px solid $gray-200;
    padding-top: 12px;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}

.info-pedido {
  background: $gray-50;
  padding: 12px;
  border-radius: 12px;
}

@media (max-width: 599px) {
  .filters-container {
    .ordenacao-toggle {
      width: 100%;
      :deep(.q-btn) {
        flex: 1;
      }
    }
  }
}
</style>
