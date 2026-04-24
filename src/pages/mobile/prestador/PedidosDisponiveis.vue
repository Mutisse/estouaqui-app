<template>
  <q-page class="pedidos-disponiveis-page bg-grey-1">
    <!-- Header -->
    <div class="page-header q-pa-md">
      <div class="text-h6 text-bold">Pedidos Disponíveis</div>
      <div class="text-caption text-grey-6">Encontre serviços perto de si</div>
    </div>

    <!-- Filtro de Raio -->
    <div class="radius-filter q-px-md q-mb-md">
      <div class="row items-center justify-between">
        <div class="text-subtitle2 text-grey-7">Raio de busca:</div>
        <q-select
          v-model="filtros.raio"
          :options="raioOptions"
          label="Distância"
          outlined
          dense
          emit-value
          map-options
          style="width: 120px"
          @update:model-value="aplicarFiltroRaio"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar pedidos disponíveis...</p>
    </div>

    <!-- Lista de pedidos -->
    <div v-else-if="pedidosFiltrados.length === 0" class="empty-state q-pa-xl text-center">
      <q-icon name="search_off" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido encontrado</div>
      <div class="text-grey-6">Não há pedidos disponíveis num raio de {{ filtros.raio }} km</div>
    </div>

    <div v-else class="pedidos-list q-px-md">
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
            <span class="text-caption text-primary">{{ pedido.distancia_km }} km</span>
          </div>
        </div>

        <!-- Footer do card -->
        <div class="pedido-footer row justify-between items-center q-mt-md">
          <div class="pedido-status">
            <q-badge color="positive" outline>Aberto</q-badge>
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
            <div class="text-weight-bold">Serviço:</div>
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
import { ref, reactive, computed, onMounted } from 'vue';
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
const carregando = ref(true);
const carregandoEnvio = ref(false);
const pedidos = ref<PedidoDisponivelData[]>([]);

// Opções para raio
const raioOptions = ref<{ label: string; value: number }[]>([
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '30 km', value: 30 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
]);

// Filtros (apenas raio)
const filtros = reactive({
  raio: 10,
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

// Computed para pedidos filtrados por raio
const pedidosFiltrados = computed(() => {
  let resultado = [...pedidos.value];

  // Filtrar por raio (se o pedido tiver distancia_km)
  if (filtros.raio) {
    resultado = resultado.filter((p) => {
      if (p.distancia_km === undefined || p.distancia_km === null) return true;
      return p.distancia_km <= filtros.raio;
    });
  }

  // Ordenar por distância (mais próximos primeiro)
  resultado.sort((a, b) => {
    const distA = a.distancia_km ?? 9999;
    const distB = b.distancia_km ?? 9999;
    return distA - distB;
  });

  return resultado;
});

// Funções auxiliares
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

const aplicarFiltroRaio = () => {
  // O computed já atualiza automaticamente
  console.log('Raio alterado para:', filtros.raio);
};

// Carregar pedidos disponíveis
const carregarPedidosDisponiveis = async () => {
  carregando.value = true;
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
  } finally {
    carregando.value = false;
  }
};

// Abrir detalhes do pedido
const abrirDetalhes = (pedido: PedidoDisponivelData) => {
  console.log('Ver detalhes do pedido:', pedido.id);
};

// Abrir modal para fazer proposta
const abrirModalProposta = (pedido: PedidoDisponivelData) => {
  modalProposta.pedido = pedido;
  novaProposta.valor = 0;
  novaProposta.mensagem = '';
  modalProposta.visivel = true;
};

// Enviar proposta
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

    const success = await prestadorStore.enviarProposta(propostaData);

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Proposta enviada com sucesso!',
        position: 'top',
      });
      modalProposta.visivel = false;
      // Remove o pedido da lista após enviar proposta
      pedidos.value = pedidos.value.filter((p) => p.id !== modalProposta.pedido?.id);
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

onMounted(async () => {
  // Verifica se está autenticado
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, faça login para continuar',
      position: 'top',
    });
    await router.push('/auth/login');
    return;
  }

  // Verifica se é prestador
  if (!authStore.isPrestador) {
    $q.notify({
      type: 'warning',
      message: 'Apenas prestadores podem aceder a esta página',
      position: 'top',
    });
    await router.push('/mobile/prestador/dashboard');
    return;
  }

  // Carrega os pedidos
  await carregarPedidosDisponiveis();
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

.pedidos-disponiveis-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.radius-filter {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid $gray-200;
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

  .pedido-cliente {
    font-weight: 600;
    color: $gray-800;
  }

  .pedido-data {
    font-size: 0.7rem;
    color: $gray-500;
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
</style>
