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
    >
      <q-tab name="ativos" label="Ativos" />
      <q-tab name="concluidos" label="Concluídos" />
      <q-tab name="cancelados" label="Cancelados" />
    </q-tabs>

    <!-- Lista de pedidos -->
    <q-tab-panels v-model="tab" animated class="bg-transparent">
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
                  <img :src="pedido.prestadorAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador }}</div>
                  <div class="pedido-data">{{ pedido.data }}</div>
                </div>
                <div class="pedido-status" :class="pedido.statusClass">
                  {{ pedido.status }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat dense icon="chat" label="Chat" @click.stop="abrirChat(pedido)" />
                <q-btn flat dense icon="cancel" label="Cancelar" color="negative" @click.stop="cancelarPedido(pedido)" />
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
                  <img :src="pedido.prestadorAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador }}</div>
                  <div class="pedido-data">{{ pedido.data }}</div>
                </div>
                <div class="pedido-valor">{{ pedido.valor }} MZN</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat dense icon="star" label="Avaliar" color="yellow" @click.stop="avaliarPedido(pedido)" />
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
            <q-card class="pedido-card" flat bordered>
              <q-card-section class="row items-center">
                <q-avatar size="50px" class="q-mr-sm">
                  <img :src="pedido.prestadorAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-prestador">{{ pedido.prestador }}</div>
                  <div class="pedido-data">{{ pedido.data }}</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'MobileMeusPedidos'
})

// Interfaces para tipagem
interface PedidoBase {
  id: number
  servico: string
  prestador: string
  prestadorAvatar: string
  data: string
}

interface PedidoAtivo extends PedidoBase {
  status: string
  statusClass: string
}

interface PedidoConcluido extends PedidoBase {
  valor: number
}

// CORREÇÃO 1: Removida interface vazia, usar PedidoBase diretamente
// type PedidoCancelado = PedidoBase

const router = useRouter()
const $q = useQuasar()

const tab = ref('ativos')

// Dados mockados com tipagem correta
const pedidosAtivos = ref<PedidoAtivo[]>([
  {
    id: 1,
    servico: 'Reparação elétrica',
    prestador: 'João Silva',
    prestadorAvatar: 'https://cdn.quasar.dev/img/avatar.png',
    data: 'Hoje, 14:30',
    status: 'Em andamento',
    statusClass: 'em-andamento'
  },
  {
    id: 2,
    servico: 'Limpeza residencial',
    prestador: 'Maria Santos',
    prestadorAvatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    data: 'Amanhã, 09:00',
    status: 'Agendado',
    statusClass: 'agendado'
  }
])

const pedidosConcluidos = ref<PedidoConcluido[]>([
  {
    id: 3,
    servico: 'Canalização',
    prestador: 'Pedro Oliveira',
    prestadorAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    data: '10 Mar 2026',
    valor: 1800
  },
  {
    id: 4,
    servico: 'Pintura',
    prestador: 'Ana Costa',
    prestadorAvatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    data: '5 Mar 2026',
    valor: 2000
  }
])

const pedidosCancelados = ref<PedidoBase[]>([
  {
    id: 5,
    servico: 'Transporte',
    prestador: 'Carlos Mendes',
    prestadorAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    data: '1 Mar 2026'
  }
])

// CORREÇÃO 2: Remover o underscore e usar o parâmetro
const verPedido = (id: number) => {
  console.log('Ver pedido:', id) // Usando o parâmetro
  $q.notify({
    type: 'info',
    message: 'Detalhes do pedido em breve',
    position: 'top'
  })
}

const abrirChat = (pedido: PedidoBase) => {
  void router.push(`/mobile/chat/${pedido.id}`)
}

const cancelarPedido = (pedido: PedidoBase) => {
  $q.dialog({
    title: 'Cancelar pedido',
    message: `Tem certeza que deseja cancelar o pedido de ${pedido.servico}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Pedido cancelado com sucesso',
      position: 'top'
    })
  })
}

const avaliarPedido = (pedido: PedidoBase) => {
  void router.push(`/mobile/avaliacao/${pedido.id}`)
}

const repetirPedido = () => {
  $q.notify({
    type: 'info',
    message: 'Repetir pedido em breve',
    position: 'top'
  })
}
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
    padding: 4px 8px;
    border-radius: 20px;

    &.em-andamento {
      background: #e3f2fd;
      color: #1976d2;
    }

    &.agendado {
      background: #fff3e0;
      color: #f57c00;
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
