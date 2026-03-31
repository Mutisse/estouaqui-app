<template>
  <q-page class="prestador-historico bg-grey-1">
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

// ✅ Interface com todas as propriedades opcionais ou com valores padrão
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
const loading = ref(true);
const periodo = ref('mes');
const showDetalhesDialog = ref(false);
const servicoSelecionado = ref<ServicoHistorico | null>(null);

// Dados do store
const solicitacoes = computed(() => prestadorStore.solicitacoes);
const avaliacoes = computed(() => prestadorStore.avaliacoesRecentes);

// Histórico filtrado
const historico = computed<ServicoHistorico[]>(() => {
  // Pegar apenas serviços concluídos
  const concluidos = solicitacoes.value.filter(s => s.status === 'concluido');

  // Mapear para o formato da interface
  const resultado: ServicoHistorico[] = concluidos.map(pedido => {
    // Buscar avaliação do pedido
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

  // Filtrar por período
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

// Estatísticas
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

// Formatação
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

// Ações
const carregarHistorico = async () => {
  loading.value = true;
  try {
    // Buscar solicitações concluídas
    await prestadorStore.fetchSolicitacoes('concluido');
    // Buscar avaliações recentes (50 para ter histórico completo)
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

// ✅ CORREÇÃO: Função verDetalhes com tipo explícito
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

// Inicialização
onMounted(async () => {
  await carregarHistorico();
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
