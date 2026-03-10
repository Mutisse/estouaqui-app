<template>
  <q-page class="prestador-agenda bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Minha Agenda</div>
      <q-btn flat round icon="add" @click="adicionarDisponibilidade" />
    </div>

    <!-- Seletor de semana -->
    <div class="week-selector q-px-md q-mb-md">
      <div class="row items-center justify-between">
        <q-btn flat round icon="chevron_left" @click="semanaAnterior" />
        <div class="text-subtitle1">{{ semanaAtual }}</div>
        <q-btn flat round icon="chevron_right" @click="proximaSemana" />
      </div>
    </div>

    <!-- Dias da semana -->
    <div class="days-grid q-px-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div v-for="dia in diasSemana" :key="dia.nome" class="col">
          <q-card
            class="day-card"
            :class="{ 'today': dia.hoje, 'selected': dia.selecionado }"
            flat
            bordered
            @click="selecionarDia(dia)"
          >
            <q-card-section class="text-center q-pa-sm">
              <div class="day-name">{{ dia.nomeCurto }}</div>
              <div class="day-number">{{ dia.numero }}</div>
              <div class="day-month">{{ dia.mes }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Horários do dia selecionado -->
    <div class="horarios-section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Horários para {{ diaSelecionado }}</div>
        <q-btn flat dense label="Adicionar" icon="add" @click="adicionarHorario" />
      </div>

      <div class="horarios-grid">
        <div v-for="horario in horariosDoDia" :key="horario.id" class="horario-item">
          <q-card
            class="horario-card"
            :class="{ 'disponivel': horario.disponivel, 'ocupado': !horario.disponivel }"
            flat
            bordered
            @click="toggleHorario(horario)"
          >
            <q-card-section class="text-center">
              <div class="horario-tempo">{{ horario.horario }}</div>
              <div class="horario-status">{{ horario.disponivel ? 'Disponível' : 'Ocupado' }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Intervalos de horário -->
    <div class="intervalos-section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Intervalos configurados</div>
        <q-btn flat dense label="Configurar" icon="settings" @click="configurarIntervalos" />
      </div>

      <q-list bordered separator>
        <q-item v-for="intervalo in intervalos" :key="intervalo.id">
          <q-item-section>
            <q-item-label>{{ intervalo.dias }}</q-item-label>
            <q-item-label caption>{{ intervalo.horario }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round icon="edit" size="sm" @click="editarIntervalo(intervalo)" />
            <q-btn flat round icon="delete" size="sm" color="negative" @click="removerIntervalo(intervalo)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Botão salvar -->
    <div class="q-pa-md">
      <q-btn
        unelevated
        color="primary"
        label="Salvar alterações"
        class="full-width"
        size="lg"
        @click="salvarAlteracoes"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'PrestadorAgenda'
})

// Tipos
interface DiaSemana {
  nome: string
  nomeCurto: string
  numero: number
  mes: string
  hoje: boolean
  selecionado: boolean
}

interface Horario {
  id: number
  horario: string
  disponivel: boolean
}

interface Intervalo {
  id: number
  dias: string
  horario: string
}

const router = useRouter()
const $q = useQuasar()

// Estado da semana
const semanaOffset = ref(0)

const semanaAtual = computed(() => {
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() + (semanaOffset.value * 7))
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 6)

  return `${inicioSemana.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} - ${fimSemana.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

// Dias da semana
const diasSemana = ref<DiaSemana[]>([
  { nome: 'Segunda', nomeCurto: 'SEG', numero: 10, mes: 'MAR', hoje: false, selecionado: true },
  { nome: 'Terça', nomeCurto: 'TER', numero: 11, mes: 'MAR', hoje: false, selecionado: false },
  { nome: 'Quarta', nomeCurto: 'QUA', numero: 12, mes: 'MAR', hoje: true, selecionado: false },
  { nome: 'Quinta', nomeCurto: 'QUI', numero: 13, mes: 'MAR', hoje: false, selecionado: false },
  { nome: 'Sexta', nomeCurto: 'SEX', numero: 14, mes: 'MAR', hoje: false, selecionado: false },
  { nome: 'Sábado', nomeCurto: 'SAB', numero: 15, mes: 'MAR', hoje: false, selecionado: false },
  { nome: 'Domingo', nomeCurto: 'DOM', numero: 16, mes: 'MAR', hoje: false, selecionado: false }
])

const diaSelecionado = ref('Segunda, 10 Mar')

// Horários do dia selecionado
const horariosDoDia = ref<Horario[]>([
  { id: 1, horario: '08:00', disponivel: true },
  { id: 2, horario: '09:00', disponivel: true },
  { id: 3, horario: '10:00', disponivel: false },
  { id: 4, horario: '11:00', disponivel: false },
  { id: 5, horario: '14:00', disponivel: true },
  { id: 6, horario: '15:00', disponivel: true },
  { id: 7, horario: '16:00', disponivel: true },
  { id: 8, horario: '17:00', disponivel: false }
])

// Intervalos configurados
const intervalos = ref<Intervalo[]>([
  { id: 1, dias: 'Segunda a Sexta', horario: '12:00 - 14:00 (almoço)' },
  { id: 2, dias: 'Sábado', horario: '13:00 - 15:00 (almoço)' }
])

const semanaAnterior = () => {
  semanaOffset.value--
  // Atualizar dias da semana
}

const proximaSemana = () => {
  semanaOffset.value++
  // Atualizar dias da semana
}

const selecionarDia = (dia: DiaSemana) => {
  diasSemana.value.forEach(d => d.selecionado = false)
  dia.selecionado = true
  diaSelecionado.value = `${dia.nome}, ${dia.numero} ${dia.mes}`
}

const adicionarDisponibilidade = () => {
  $q.notify({
    type: 'info',
    message: 'Adicionar disponibilidade em breve',
    position: 'top'
  })
}

const adicionarHorario = () => {
  $q.notify({
    type: 'info',
    message: 'Adicionar horário em breve',
    position: 'top'
  })
}

const toggleHorario = (horario: Horario) => {
  horario.disponivel = !horario.disponivel
}

const configurarIntervalos = () => {
  $q.notify({
    type: 'info',
    message: 'Configurar intervalos em breve',
    position: 'top'
  })
}

const editarIntervalo = (intervalo: Intervalo) => {
  $q.notify({
    type: 'info',
    message: `Editar intervalo de ${intervalo.dias}`,
    position: 'top'
  })
}

const removerIntervalo = (intervalo: Intervalo) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Remover intervalo de ${intervalo.dias}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    intervalos.value = intervalos.value.filter(i => i.id !== intervalo.id)
    $q.notify({
      type: 'positive',
      message: 'Intervalo removido',
      position: 'top'
    })
  })
}

const salvarAlteracoes = () => {
  $q.notify({
    type: 'positive',
    message: 'Alterações salvas com sucesso',
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

.prestador-agenda {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.week-selector {
  background: white;
  padding: 12px 0;
}

.day-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.today {
    border-color: $purple-primary;
    background: rgba(102, 126, 234, 0.05);
  }

  &.selected {
    background: $purple-primary;
    border-color: $purple-primary;

    .day-name, .day-number, .day-month {
      color: white;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .day-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: $gray-600;
  }

  .day-number {
    font-size: 1.2rem;
    font-weight: 700;
    color: $gray-800;
  }

  .day-month {
    font-size: 0.7rem;
    color: $gray-500;
  }
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.horario-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.disponivel {
    background: white;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
  }

  &.ocupado {
    background: $gray-100;
    opacity: 0.7;
  }

  .horario-tempo {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-800;
  }

  .horario-status {
    font-size: 0.7rem;
    color: $gray-600;
  }
}
</style>
