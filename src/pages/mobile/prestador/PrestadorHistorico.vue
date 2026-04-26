<template>
  <q-page class="prestador-historico bg-grey-1">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-filter-btn"></div>
      </div>
      <div class="skeleton-filtros">
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
      </div>
      <div class="skeleton-stats q-px-md q-mb-md">
        <div class="row q-col-gutter-sm">
          <div v-for="i in 3" :key="i" class="col-4">
            <div class="skeleton-stat-card"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-list q-pa-md">
        <div class="skeleton-list-header"></div>
        <div v-for="i in 3" :key="i" class="skeleton-list-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-list-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
            <div class="skeleton-line w-40"></div>
          </div>
          <div class="skeleton-badge">
            <div class="skeleton-line w-20"></div>
            <div class="skeleton-stars"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo original -->
    <template v-else>
      <!-- Cabeçalho -->
      <div class="page-header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="router.back()" />
        <div class="text-h5 text-bold">Histórico de Serviços</div>
        <q-btn flat round icon="filter_list" @click="abrirFiltros" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="48px" />
        <div class="text-grey-6 q-mt-md">Carregando histórico...</div>
      </div>

      <template v-else>
        <!-- Filtros rápidos -->
        <div class="quick-filters q-px-md q-mb-md">
          <q-btn-toggle
            v-model="periodo"
            toggle-color="primary"
            :options="[
              { label: 'Hoje', value: 'hoje' },
              { label: 'Semana', value: 'semana' },
              { label: 'Mês', value: 'mes' },
              { label: 'Todos', value: 'todos' }
            ]"
            @update:model-value="carregarHistorico"
          />
        </div>

        <!-- Estatísticas -->
        <div class="stats-cards q-px-md q-mb-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-card class="stat-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="stat-value">{{ stats.total }}</div>
                  <div class="stat-label">Total</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="stat-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="stat-value">{{ formatarValor(stats.ganhos) }} MZN</div>
                  <div class="stat-label">Ganhos</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="stat-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="stat-value">{{ stats.media.toFixed(1) }}</div>
                  <div class="stat-label">Média</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Lista de serviços -->
        <div class="historico-list q-pa-md">
          <div v-if="historico.length === 0" class="empty-state">
            <q-icon name="history" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">Nenhum serviço concluído</div>
            <div class="text-grey-6 q-mt-sm">Seus serviços concluídos aparecerão aqui</div>
          </div>

          <q-list v-else bordered separator>
            <q-item
              v-for="servico in historico"
              :key="servico.id"
              clickable
              v-ripple
              @click="verDetalhes(servico)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img :src="servico.clienteFoto || 'https://cdn.quasar.dev/img/avatar.png'" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ servico.clienteNome }}</q-item-label>
                <q-item-label caption>{{ servico.servicoNome }}</q-item-label>
                <q-item-label caption class="text-grey-6">
                  <q-icon name="schedule" size="14px" /> {{ formatarData(servico.data) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-weight-bold text-primary">{{ formatarValor(servico.valor) }} MZN</div>
                <q-rating v-model="servico.nota" size="12px" :max="5" color="yellow" readonly />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
    </template>

    <!-- Dialog de detalhes do serviço -->
    <q-dialog v-model="showDetalhesDialog">
      <q-card style="min-width: 350px; max-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalhes do Serviço</div>
        </q-card-section>

        <q-card-section v-if="servicoSelecionado">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="detalhe-item">
                <div class="detalhe-label">Cliente</div>
                <div class="detalhe-valor">{{ servicoSelecionado.clienteNome }}</div>
              </div>
            </div>

            <div class="col-12">
              <div class="detalhe-item">
                <div class="detalhe-label">Serviço</div>
                <div class="detalhe-valor">{{ servicoSelecionado.servicoNome }}</div>
              </div>
            </div>

            <div class="col-6">
              <div class="detalhe-item">
                <div class="detalhe-label">Data</div>
                <div class="detalhe-valor">{{ formatarDataCompleta(servicoSelecionado.data) }}</div>
              </div>
            </div>

            <div class="col-6">
              <div class="detalhe-item">
                <div class="detalhe-label">Valor</div>
                <div class="detalhe-valor text-primary">{{ formatarValor(servicoSelecionado.valor) }} MZN</div>
              </div>
            </div>

            <div class="col-12">
              <div class="detalhe-item">
                <div class="detalhe-label">Avaliação</div>
                <div class="detalhe-valor">
                  <q-rating v-model="servicoSelecionado.nota" size="20px" :max="5" color="yellow" readonly />
                  <span v-if="servicoSelecionado.comentario" class="q-ml-sm">- {{ servicoSelecionado.comentario }}</span>
                </div>
              </div>
            </div>

            <div v-if="servicoSelecionado.observacoes" class="col-12">
              <div class="detalhe-item">
                <div class="detalhe-label">Observações</div>
                <div class="detalhe-valor">{{ servicoSelecionado.observacoes }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorHistorico'
});

interface ServicoHistorico {
  id: number;
  clienteId: number;
  clienteNome: string;
  clienteFoto: string | null;
  servicoId: number;
  servicoNome: string;
  data: string;
  valor: number;
  nota: number;
  comentario?: string;
  observacoes?: string;
}

interface Stats {
  total: number;
  ganhos: number;
  media: number;
}

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const carregamentoInicial = ref(true);
const loading = ref(true);
const periodo = ref('mes');
const showDetalhesDialog = ref(false);
const servicoSelecionado = ref<ServicoHistorico | null>(null);

// Dados do store
const solicitacoes = computed(() => prestadorStore.solicitacoes);
const avaliacoes = computed(() => prestadorStore.avaliacoesRecentes);

// Histórico filtrado
const historico = computed<ServicoHistorico[]>(() => {
  const concluidos = solicitacoes.value.filter(s => s.status === 'concluido');

  const resultado: ServicoHistorico[] = concluidos.map(pedido => {
    const avaliacao = avaliacoes.value.find(a => a.id === pedido.id);

    return {
      id: pedido.id,
      clienteId: pedido.cliente_id,
      clienteNome: pedido.cliente?.nome || 'Cliente',
      clienteFoto: pedido.cliente?.foto || null,
      servicoId: pedido.servico_id,
      servicoNome: pedido.servico?.nome || 'Serviço',
      data: pedido.data,
      valor: pedido.valor,
      nota: avaliacao?.nota || 0,
      ...(avaliacao?.comentario && { comentario: avaliacao.comentario }),
      ...(pedido.observacoes && { observacoes: pedido.observacoes })
    };
  });

  return resultado.filter(servico => {
    const dataServico = new Date(servico.data);
    const hoje = new Date();
    const diffDias = Math.floor((hoje.getTime() - dataServico.getTime()) / (1000 * 60 * 60 * 24));

    switch (periodo.value) {
      case 'hoje':
        return dataServico.toDateString() === hoje.toDateString();
      case 'semana':
        return diffDias <= 7;
      case 'mes':
        return diffDias <= 30;
      default:
        return true;
    }
  });
});

const stats = computed<Stats>(() => {
  const total = historico.value.length;
  const ganhos = historico.value.reduce((sum, s) => sum + s.valor, 0);
  const media = historico.value.reduce((sum, s) => sum + s.nota, 0) / (total || 1);

  return {
    total,
    ganhos,
    media: media || 0
  };
});

const formatarData = (dataString: string) => {
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatarDataCompleta = (dataString: string) => {
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const carregarHistorico = async () => {
  loading.value = true;
  try {
    await prestadorStore.fetchSolicitacoes('concluido');
    await prestadorStore.fetchAvaliacoesRecentes(50);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar histórico',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const verDetalhes = (servico: ServicoHistorico) => {
  servicoSelecionado.value = servico;
  showDetalhesDialog.value = true;
};

const abrirFiltros = () => {
  $q.dialog({
    title: 'Filtros',
    message: 'Opções de filtro em breve',
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Filtros aplicados',
      position: 'top'
    });
  });
};

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await carregarHistorico();
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 180px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-filter-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-filtros {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
}

.skeleton-stats {
  padding: 0 16px;
  margin-bottom: 16px;
}

.skeleton-stat-card {
  height: 80px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

.skeleton-list {
  padding: 16px;
}

.skeleton-list-header {
  width: 150px;
  height: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid $gray-200;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-right: 12px;
}

.skeleton-list-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 4px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-badge {
  text-align: right;
}

.skeleton-stars {
  width: 60px;
  height: 12px;
  border-radius: 6px;
  margin-top: 6px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-20 { width: 20%; }
.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.prestador-historico {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.quick-filters {
  background: white;
  padding: 12px 0;
}

.stat-card {
  border-radius: 12px;

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: $purple-primary;
  }

  .stat-label {
    font-size: 0.7rem;
    color: $gray-600;
  }
}

.detalhe-item {
  margin-bottom: 12px;

  .detalhe-label {
    font-size: 0.7rem;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .detalhe-valor {
    font-size: 1rem;
    font-weight: 500;
    color: $gray-800;
  }
}
</style>
