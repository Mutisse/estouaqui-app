<template>
  <q-page class="pedidos-page bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <div class="text-h5 text-bold">Meus Pedidos</div>
    </div>

    <!-- Tabs de filtro -->
    <q-tabs
      v-model="tab"
      class="filter-tabs"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      @update:model-value="carregarPedidosPorTab"
    >
      <q-tab name="ativos" label="Ativos" />
      <q-tab name="concluidos" label="Concluídos" />
      <q-tab name="cancelados" label="Cancelados" />
    </q-tabs>

    <!-- Loading -->
    <div v-if="carregando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar seus pedidos...</p>
    </div>

    <!-- Lista de pedidos -->
    <q-tab-panels v-model="tab" animated class="bg-transparent" v-else>
      <!-- Pedidos Ativos -->
      <q-tab-panel name="ativos" class="q-pa-md">
        <div v-if="pedidosAtivos.length === 0" class="empty-state">
          <q-icon name="assignment" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido ativo</div>
          <div class="text-grey-6">Seus pedidos em andamento aparecerão aqui</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="pedido in pedidosAtivos" :key="pedido.id" class="col-12">
            <q-card class="pedido-card" flat bordered @click="verPedido(pedido.id)">
              <q-card-section class="row items-center">
                <q-avatar size="50px" class="q-mr-sm">
                  <img
                    :src="
                      pedido.prestador?.foto ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.prestador?.nome || '')}&background=667eea&color=fff`
                    "
                  />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
                  <div class="pedido-data">{{ formatarData(pedido.data) }}</div>
                </div>
                <div class="pedido-status" :class="getStatusClass(pedido.status)">
                  {{ getStatusTexto(pedido.status) }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat dense icon="chat" label="Chat" @click.stop="abrirChat(pedido)" />
                <q-btn
                  v-if="pedido.status === 'pendente' || pedido.status === 'aceito'"
                  flat
                  dense
                  icon="cancel"
                  label="Cancelar"
                  color="negative"
                  @click.stop="cancelarPedido(pedido.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Pedidos Concluídos -->
      <q-tab-panel name="concluidos" class="q-pa-md">
        <div v-if="pedidosConcluidos.length === 0" class="empty-state">
          <q-icon name="check_circle" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido concluído</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="pedido in pedidosConcluidos" :key="pedido.id" class="col-12">
            <q-card class="pedido-card" flat bordered @click="verPedido(pedido.id)">
              <q-card-section class="row items-center">
                <q-avatar size="50px" class="q-mr-sm">
                  <img
                    :src="
                      pedido.prestador?.foto ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.prestador?.nome || '')}&background=667eea&color=fff`
                    "
                  />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
                  <div class="pedido-data">{{ formatarData(pedido.data) }}</div>
                </div>
                <div class="pedido-valor">
                  {{ pedido.valor ? formatMoney(pedido.valor) : 'A definir' }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  v-if="!pedidoAvaliado(pedido.id)"
                  flat
                  dense
                  icon="star"
                  label="Avaliar"
                  color="yellow"
                  @click.stop="avaliarPedido(pedido.id)"
                />
                <q-btn flat dense icon="repeat" label="Repetir" @click.stop="repetirPedido" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Pedidos Cancelados -->
      <q-tab-panel name="cancelados" class="q-pa-md">
        <div v-if="pedidosCancelados.length === 0" class="empty-state">
          <q-icon name="cancel" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido cancelado</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="pedido in pedidosCancelados" :key="pedido.id" class="col-12">
            <q-card class="pedido-card" flat bordered @click="verPedido(pedido.id)">
              <q-card-section class="row items-center">
                <q-avatar size="50px" class="q-mr-sm">
                  <img
                    :src="
                      pedido.prestador?.foto ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.prestador?.nome || '')}&background=667eea&color=fff`
                    "
                  />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
                  <div class="pedido-data">{{ formatarData(pedido.data) }}</div>
                </div>
                <div class="pedido-status cancelado">Cancelado</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore } from 'src/stores/cliente-store';
import type { PedidoData } from 'src/stores/cliente-store';

defineOptions({
  name: 'MobileMeusPedidos',
});

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();

const tab = ref('ativos');
const carregando = ref(false);
const pedidosAvaliados = ref<Set<number>>(new Set());

// Computed para separar pedidos por status
const pedidosAtivos = computed(() => {
  return clienteStore.pedidos.filter(
    (p) => p.status === 'pendente' || p.status === 'aceito' || p.status === 'em_andamento',
  );
});

const pedidosConcluidos = computed(() => {
  return clienteStore.pedidos.filter((p) => p.status === 'concluido');
});

const pedidosCancelados = computed(() => {
  return clienteStore.pedidos.filter((p) => p.status === 'cancelado');
});

// Funções auxiliares
const formatarData = (data: string) => {
  if (!data) return 'Data não informada';
  try {
    const date = new Date(data);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (date.toDateString() === hoje.toDateString()) {
      return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === amanha.toDateString()) {
      return `Amanhã, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return data;
  }
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusTexto = (status: string) => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pendente: 'pendente',
    aceito: 'aceito',
    em_andamento: 'em-andamento',
    concluido: 'concluido',
    cancelado: 'cancelado',
  };
  return classMap[status] || '';
};

// Carregar pedidos
const carregarPedidos = async () => {
  carregando.value = true;
  try {
    // ✅ CORRIGIDO: usar fetchMeusPedidos
    await clienteStore.fetchMeusPedidos();
  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar pedidos',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

const carregarPedidosPorTab = () => {
  // Já carregamos todos os pedidos no carregarPedidos, apenas mudamos a tab
};

// Ações
const verPedido = (id: number) => {
  void router.push(`/mobile/detalhes-pedido/${id}`);
};

const abrirChat = (pedido: PedidoData) => {
  const prestadorId = pedido.prestador?.id;
  if (prestadorId) {
    void router.push(`/mobile/chat/${prestadorId}`);
  } else {
    $q.notify({
      type: 'warning',
      message: 'Prestador não encontrado',
      position: 'top',
    });
  }
};

const cancelarPedido = (id: number) => {
  $q.dialog({
    title: 'Cancelar pedido',
    message: 'Tem certeza que deseja cancelar este pedido?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        // ✅ CORRIGIDO: usar cancelarPedidoCliente
        const success = await clienteStore.cancelarPedidoCliente(id);
        if (success) {
          $q.notify({
            type: 'positive',
            message: 'Pedido cancelado com sucesso!',
            position: 'top',
          });
          await carregarPedidos();
        }
      } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
        $q.notify({
          type: 'negative',
          message: 'Erro ao cancelar pedido',
          position: 'top',
        });
      }
    })();
  });
};

const avaliarPedido = (pedidoId: number) => {
  void router.push(`/mobile/avaliacao/${pedidoId}`);
};

const pedidoAvaliado = (pedidoId: number) => {
  return pedidosAvaliados.value.has(pedidoId);
};

const repetirPedido = () => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidade em desenvolvimento',
    position: 'top',
  });
};

// Carregar dados ao montar
onMounted(() => {
  void carregarPedidos();
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

.pedidos-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.filter-tabs {
  background: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.pedido-card {
  border-radius: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .pedido-servico {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .pedido-prestador {
    font-size: 0.85rem;
    color: $gray-600;
  }

  .pedido-data {
    font-size: 0.75rem;
    color: $gray-500;
  }

  .pedido-status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;

    &.pendente {
      background: #fff3e0;
      color: #f57c00;
    }

    &.aceito {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.em-andamento {
      background: #e3f2fd;
      color: #1976d2;
    }

    &.concluido {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.cancelado {
      background: #ffebee;
      color: #d32f2f;
    }
  }

  .pedido-valor {
    font-size: 1rem;
    font-weight: 700;
    color: $purple-primary;
  }
}
</style>
