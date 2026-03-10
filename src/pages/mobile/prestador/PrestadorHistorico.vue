<template>
  <q-page class="prestador-historico bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Histórico de Serviços</div>
      <q-btn flat round icon="filter_list" @click="abrirFiltros" />
    </div>

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
              <div class="stat-value">{{ stats.ganhos }}k</div>
              <div class="stat-label">Ganhos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-4">
          <q-card class="stat-card" flat bordered>
            <q-card-section class="text-center">
              <div class="stat-value">{{ stats.media }}</div>
              <div class="stat-label">Média</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Lista de serviços -->
    <div class="historico-list q-pa-md">
      <q-list bordered separator>
        <q-item
          v-for="servico in historico"
          :key="servico.id"
          clickable
          v-ripple
          @click="verDetalhes(servico)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="servico.clienteAvatar" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ servico.cliente }}</q-item-label>
            <q-item-label caption>{{ servico.servico }}</q-item-label>
            <q-item-label caption class="text-grey-6">
              <q-icon name="schedule" size="14px" /> {{ servico.data }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-weight-bold text-primary">{{ servico.valor }} MZN</div>
            <q-rating v-model="servico.avaliacao" size="12px" :max="5" color="yellow" readonly />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'PrestadorHistorico'
})

// Tipos
interface ServicoHistorico {
  id: number
  cliente: string
  clienteAvatar: string
  servico: string
  data: string
  valor: number
  avaliacao: number
}

interface Stats {
  total: number
  ganhos: number
  media: number
}

const router = useRouter()
const $q = useQuasar()

const periodo = ref('mes')

const stats = ref<Stats>({
  total: 24,
  ganhos: 36.5,
  media: 4.8
})

const historico = ref<ServicoHistorico[]>([
  {
    id: 1,
    cliente: 'Maria Santos',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    servico: 'Reparação elétrica',
    data: '10 Mar 2026',
    valor: 1500,
    avaliacao: 5
  },
  {
    id: 2,
    cliente: 'Pedro Oliveira',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    servico: 'Instalação de tomada',
    data: '8 Mar 2026',
    valor: 800,
    avaliacao: 4
  },
  {
    id: 3,
    cliente: 'Ana Costa',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    servico: 'Troca de disjuntor',
    data: '5 Mar 2026',
    valor: 1200,
    avaliacao: 5
  },
  {
    id: 4,
    cliente: 'Carlos Mendes',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    servico: 'Reparação geral',
    data: '3 Mar 2026',
    valor: 2000,
    avaliacao: 4
  }
])

const abrirFiltros = () => {
  $q.notify({
    type: 'info',
    message: 'Filtros em breve',
    position: 'top'
  })
}

const verDetalhes = (servico: ServicoHistorico) => {
  $q.notify({
    type: 'info',
    message: `Detalhes do serviço #${servico.id}`,
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
</style>
