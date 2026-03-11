<template>
  <q-page class="prestador-ganhos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meus Ganhos</div>
      <q-btn flat round icon="more_vert" @click="opcoes" />
    </div>

    <!-- Saldo atual -->
    <div class="saldo-card q-pa-md">
      <q-card flat bordered class="saldo-card-inner">
        <q-card-section class="text-center">
          <div class="saldo-label">Saldo disponível</div>
          <div class="saldo-valor">{{ saldoAtual }} MZN</div>
          <q-btn
            unelevated
            color="primary"
            label="Realizar saque"
            class="q-mt-md saque-btn"
            @click="irParaSaques"
            no-caps
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Filtros de período -->
    <div class="filtros-periodo q-px-md q-mb-md">
      <q-btn-toggle
        v-model="periodo"
        toggle-color="primary"
        :options="[
          { label: 'Hoje', value: 'hoje' },
          { label: 'Semana', value: 'semana' },
          { label: 'Mês', value: 'mes' },
          { label: 'Ano', value: 'ano' }
        ]"
      />
    </div>

    <!-- Resumo de ganhos -->
    <div class="resumo-ganhos q-px-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-4">
          <q-card class="resumo-card" flat bordered>
            <q-card-section class="text-center">
              <div class="resumo-valor">{{ resumo.totalServicos }}</div>
              <div class="resumo-label">Serviços</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-4">
          <q-card class="resumo-card" flat bordered>
            <q-card-section class="text-center">
              <div class="resumo-valor">{{ resumo.ganhosPeriodo }}k</div>
              <div class="resumo-label">Ganhos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-4">
          <q-card class="resumo-card" flat bordered>
            <q-card-section class="text-center">
              <div class="resumo-valor">{{ resumo.media }}</div>
              <div class="resumo-label">Média</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Gráfico de ganhos (simulado) -->
    <div class="grafico-section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Evolução de ganhos</div>
      </div>
      <q-card flat bordered class="grafico-card">
        <q-card-section>
          <div class="grafico-barras">
            <div v-for="(item, index) in graficoData" :key="index" class="barra-item">
              <div class="barra-label">{{ item.label }}</div>
              <div class="barra-container">
                <div
                  class="barra"
                  :style="{ height: item.altura + 'px', backgroundColor: item.cor }"
                ></div>
              </div>
              <div class="barra-valor">{{ item.valor }}k</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Histórico de ganhos -->
    <div class="historico-ganhos q-pa-md">
      <div class="section-header">
        <div class="section-title">Últimos ganhos</div>
        <q-btn flat dense label="Ver todos" icon="chevron_right" @click="verTodos" />
      </div>

      <q-list bordered separator class="historico-list">
        <q-item v-for="ganho in historicoGanhos" :key="ganho.id" class="ganho-item">
          <q-item-section avatar>
            <q-avatar :color="ganho.cor" text-color="white" size="40px">
              <q-icon :name="ganho.icone" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ ganho.cliente }}</q-item-label>
            <q-item-label caption>{{ ganho.servico }} • {{ ganho.data }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="ganho-valor text-positive">{{ ganho.valor }} MZN</div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Botão flutuante para estatísticas -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="bar_chart"
        color="primary"
        @click="verEstatisticas"
      >
        <q-tooltip>Ver estatísticas detalhadas</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'PrestadorGanhos'
})

const router = useRouter()
const $q = useQuasar()

const periodo = ref('mes')
const saldoAtual = ref(12580)

const resumo = ref({
  totalServicos: 24,
  ganhosPeriodo: 12.5,
  media: 520
})

const graficoData = ref([
  { label: 'Jan', valor: 2.5, altura: 40, cor: '#667eea' },
  { label: 'Fev', valor: 3.8, altura: 60, cor: '#667eea' },
  { label: 'Mar', valor: 4.2, altura: 70, cor: '#667eea' },
  { label: 'Abr', valor: 5.1, altura: 85, cor: '#667eea' },
  { label: 'Mai', valor: 6.3, altura: 100, cor: '#667eea' },
  { label: 'Jun', valor: 7.8, altura: 120, cor: '#667eea' }
])

const historicoGanhos = ref([
  {
    id: 1,
    cliente: 'Maria Santos',
    servico: 'Reparação elétrica',
    data: 'Hoje, 14:30',
    valor: 1500,
    icone: 'bolt',
    cor: 'warning'
  },
  {
    id: 2,
    cliente: 'Pedro Oliveira',
    servico: 'Instalação de tomada',
    data: 'Ontem, 09:00',
    valor: 800,
    icone: 'electrical_services',
    cor: 'primary'
  },
  {
    id: 3,
    cliente: 'Ana Costa',
    servico: 'Troca de disjuntor',
    data: '10 Mar 2026',
    valor: 1200,
    icone: 'settings',
    cor: 'secondary'
  }
])

const irParaSaques = () => {
  void router.push('/mobile/prestador/saques')
}

const opcoes = () => {
  $q.notify({
    type: 'info',
    message: 'Opções em breve',
    position: 'top'
  })
}

const verTodos = () => {
  $q.notify({
    type: 'info',
    message: 'Histórico completo em breve',
    position: 'top'
  })
}

const verEstatisticas = () => {
  $q.notify({
    type: 'info',
    message: 'Estatísticas detalhadas em breve',
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

.prestador-ganhos {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.saldo-card {
  .saldo-card-inner {
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  .saldo-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }

  .saldo-valor {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .saque-btn {
    background: white;
    color: $purple-primary;
    border-radius: 30px;
    padding: 8px 24px;
  }
}

.filtros-periodo {
  background: white;
  padding: 12px 0;
}

.resumo-card {
  border-radius: 12px;

  .resumo-valor {
    font-size: 1.2rem;
    font-weight: 700;
    color: $purple-primary;
  }

  .resumo-label {
    font-size: 0.7rem;
    color: $gray-600;
  }
}

.grafico-card {
  border-radius: 12px;
}

.grafico-barras {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  margin-top: 20px;
}

.barra-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.barra-container {
  height: 120px;
  width: 30px;
  background: $gray-200;
  border-radius: 15px 15px 0 0;
  margin: 5px 0;
  position: relative;
  overflow: hidden;
}

.barra {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 0.3s ease;
}

.barra-label {
  font-size: 0.7rem;
  color: $gray-600;
}

.barra-valor {
  font-size: 0.7rem;
  font-weight: 600;
  color: $purple-primary;
}

.historico-list {
  border-radius: 12px;
  overflow: hidden;
}

.ganho-item {
  .ganho-valor {
    font-weight: 600;
  }
}
</style>
