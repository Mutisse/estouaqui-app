<template>
  <q-page class="prestador-agenda bg-grey-1">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-add-btn"></div>
      </div>
      <div class="skeleton-week-selector">
        <div class="skeleton-nav-btn"></div>
        <div class="skeleton-week-text"></div>
        <div class="skeleton-nav-btn"></div>
      </div>
      <div class="skeleton-days-grid">
        <div v-for="i in 7" :key="i" class="skeleton-day-card"></div>
      </div>
      <div class="skeleton-section-header">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-btn-small"></div>
      </div>
      <div class="skeleton-horarios-grid">
        <div v-for="i in 6" :key="i" class="skeleton-horario-card"></div>
      </div>
      <div class="skeleton-section-header">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-btn-small"></div>
      </div>
      <div class="skeleton-intervalos-list">
        <div v-for="i in 2" :key="i" class="skeleton-intervalo-item">
          <div class="skeleton-intervalo-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
          </div>
          <div class="skeleton-intervalo-actions">
            <div class="skeleton-icon-btn"></div>
            <div class="skeleton-icon-btn"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-save-btn"></div>
      <div class="skeleton-spinner">
        <q-spinner color="primary" size="40px" />
      </div>
    </div>

    <!-- Conteúdo original -->
    <template v-else>
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
              :class="{ today: dia.hoje, selected: dia.selecionado }"
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

        <div v-if="carregandoHorarios" class="text-center q-py-md">
          <q-spinner size="32px" />
        </div>

        <div v-else class="horarios-grid">
          <div v-for="horario in horariosDoDia" :key="horario.id" class="horario-item">
            <q-card
              class="horario-card"
              :class="{ disponivel: horario.disponivel, ocupado: !horario.disponivel }"
              flat
              bordered
              @click="toggleHorario(horario)"
            >
              <q-card-section class="text-center">
                <div class="horario-tempo">{{ horario.horario }}</div>
                <div class="horario-status">
                  {{ horario.disponivel ? 'Disponível' : 'Ocupado' }}
                </div>
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

        <div v-if="carregandoIntervalos" class="text-center q-py-md">
          <q-spinner size="32px" />
        </div>

        <div v-else-if="intervalos.length === 0" class="empty-state q-pa-md text-center">
          <q-icon name="schedule" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhum intervalo configurado</div>
        </div>

        <q-list v-else bordered separator>
          <q-item v-for="intervalo in intervalos" :key="intervalo.id">
            <q-item-section>
              <q-item-label>{{ getDiasTexto(intervalo.dias) }}</q-item-label>
              <q-item-label caption>{{ intervalo.inicio }} - {{ intervalo.fim }}</q-item-label>
              <q-item-label v-if="intervalo.descricao" caption class="text-grey-6">
                {{ intervalo.descricao }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round icon="edit" size="sm" @click="editarIntervalo(intervalo)" />
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="removerIntervalo(intervalo)"
              />
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
          :loading="salvando"
          no-caps
        />
      </div>
    </template>

    <!-- Dialog para adicionar/editar horário -->
    <q-dialog v-model="showHorarioDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editandoHorario ? 'Editar' : 'Adicionar' }} Horário</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="novoHorario.horario"
            :options="horariosOptions"
            label="Horário"
            outlined
            dense
            option-label="label"
            option-value="value"
            map-options
            emit-value
            :rules="[(val) => !!val || 'Horário é obrigatório']"
          />
          <q-toggle v-model="novoHorario.disponivel" label="Disponível" color="positive" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarHorario"
            :loading="salvandoHorario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para adicionar/editar intervalo -->
    <q-dialog v-model="showIntervaloDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editandoIntervalo ? 'Editar' : 'Adicionar' }} Intervalo</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="novoIntervalo.dias"
            :options="diasOptions"
            label="Dias da semana"
            outlined
            dense
            multiple
            use-chips
            stack-label
            option-label="label"
            option-value="value"
            map-options
            emit-value
            :rules="[(val) => val.length > 0 || 'Selecione pelo menos um dia']"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="novoIntervalo.inicio"
                :options="horariosOptions"
                label="Início"
                outlined
                dense
                option-label="label"
                option-value="value"
                map-options
                emit-value
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="novoIntervalo.fim"
                :options="horariosOptions"
                label="Fim"
                outlined
                dense
                option-label="label"
                option-value="value"
                map-options
                emit-value
              />
            </div>
          </div>
          <q-input
            v-model="novoIntervalo.descricao"
            label="Descrição (opcional)"
            outlined
            dense
            placeholder="Ex: Horário de almoço"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarIntervalo"
            :loading="salvandoIntervalo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore } from 'src/stores/prestador-store';
import type { IntervaloData } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorAgenda',
});

interface DiaSemana {
  nome: string;
  nomeCurto: string;
  numero: number;
  mes: string;
  data: Date;
  hoje: boolean;
  selecionado: boolean;
}

interface HorarioLocal {
  id: number;
  horario: string;
  disponivel: boolean;
}

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const carregamentoInicial = ref(true);
const loading = ref(true);
const salvando = ref(false);
const carregandoHorarios = ref(false);
const carregandoIntervalos = ref(false);
const salvandoHorario = ref(false);
const salvandoIntervalo = ref(false);
const showHorarioDialog = ref(false);
const showIntervaloDialog = ref(false);
const editandoHorario = ref(false);
const editandoIntervalo = ref(false);
const horarioEditandoId = ref<number | null>(null);
const intervaloEditandoId = ref<number | null>(null);
const semanaOffset = ref(0);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// Dados locais
const diasSemana = ref<DiaSemana[]>([]);
const horariosDoDia = ref<HorarioLocal[]>([]);
const diaSelecionado = ref('');

// Formulários
const novoHorario = ref({
  horario: '',
  disponivel: true,
});

const novoIntervalo = ref({
  dias: [] as string[],
  inicio: '12:00',
  fim: '14:00',
  descricao: '',
});

// Computed do store
const diasOptions = computed(() => prestadorStore.diasOptions);
const horariosOptions = computed(() => prestadorStore.horariosOptions);
const intervalos = computed(() => prestadorStore.intervalos);
const agendaData = computed(() => prestadorStore.agenda);
const diasSemanaData = computed(() => prestadorStore.diasSemana);

// Computed da semana
const semanaAtual = computed(() => {
  if (diasSemana.value.length === 0) return '';
  const inicio = diasSemana.value[0];
  const fim = diasSemana.value[6];
  if (!inicio || !fim) return '';
  return `${inicio.numero} ${inicio.mes} - ${fim.numero} ${fim.mes} ${fim.data.getFullYear()}`;
});

const diasTextoCache = new Map<string, string>();
const getDiasTexto = (dias: string[]): string => {
  const key = dias.sort().join(',');
  if (diasTextoCache.has(key)) {
    return diasTextoCache.get(key)!;
  }
  const map: Record<string, string> = {};
  diasSemanaData.value.forEach((dia) => {
    map[dia.nome_curto.toLowerCase()] = dia.nome;
    map[dia.nome_curto] = dia.nome;
    map[dia.nome.toLowerCase()] = dia.nome;
  });
  const result = dias.map((d) => map[d] || d).join(', ');
  diasTextoCache.set(key, result);
  return result;
};

const formatarDataParaAPI = (date: Date): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0] || '';
};

const carregarAgenda = async () => {
  loading.value = true;
  try {
    await prestadorStore.fetchAgenda({ semana: semanaOffset.value });
    await gerarDiasSemana();
  } catch (error) {
    console.error('Erro ao carregar agenda:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar agenda',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const gerarDiasSemana = async () => {
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() + semanaOffset.value * 7 - hoje.getDay() + 1);

  const dias: DiaSemana[] = [];

  const [mesesMap, diasInfo] = await Promise.all([
    prestadorStore.fetchMeses(),
    prestadorStore.fetchDiasSemana(),
  ]);
  const meses = mesesMap.map((m) => m.nome_curto);
  const diasOrdenados = [...diasInfo].sort((a, b) => a.ordem - b.ordem);

  for (let i = 0; i < 7; i++) {
    const data = new Date(inicioSemana);
    data.setDate(inicioSemana.getDate() + i);

    const diaInfo = diasOrdenados[i % 7];
    if (!diaInfo) continue;

    dias.push({
      nome: diaInfo.nome,
      nomeCurto: diaInfo.nome_curto,
      numero: data.getDate(),
      mes: meses[data.getMonth()] || '',
      data: data,
      hoje: data.toDateString() === hoje.toDateString(),
      selecionado: i === 0,
    });
  }

  diasSemana.value = dias;
  if (dias[0]) {
    diaSelecionado.value = `${dias[0].nome}, ${dias[0].numero} ${dias[0].mes}`;
    carregarHorariosDoDia(dias[0].data);
  }
  await prestadorStore.fetchIntervalos();
};

const carregarHorariosDoDia = (data: Date) => {
  carregandoHorarios.value = true;
  try {
    const dataStr = formatarDataParaAPI(data);
    const horarios = agendaData.value.filter((h) => h.data === dataStr);

    if (horarios.length > 0) {
      horariosDoDia.value = horarios.map((h) => ({
        id: h.id,
        horario: h.horario_inicio,
        disponivel: !h.bloqueado,
      }));
    } else {
      horariosDoDia.value = [];
    }
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
  } finally {
    carregandoHorarios.value = false;
  }
};

const semanaAnterior = () => {
  semanaOffset.value--;
  void carregarAgenda();
};

const proximaSemana = () => {
  semanaOffset.value++;
  void carregarAgenda();
};

const selecionarDia = (dia: DiaSemana) => {
  diasSemana.value.forEach((d) => (d.selecionado = false));
  dia.selecionado = true;
  diaSelecionado.value = `${dia.nome}, ${dia.numero} ${dia.mes}`;
  carregarHorariosDoDia(dia.data);
};

const adicionarHorario = () => {
  editandoHorario.value = false;
  horarioEditandoId.value = null;
  novoHorario.value = {
    horario: '09:00',
    disponivel: true,
  };
  showHorarioDialog.value = true;
};

const editarHorario = (horario: HorarioLocal) => {
  editandoHorario.value = true;
  horarioEditandoId.value = horario.id;
  novoHorario.value = {
    horario: horario.horario,
    disponivel: horario.disponivel,
  };
  showHorarioDialog.value = true;
};

const salvarHorario = async () => {
  if (!novoHorario.value.horario) {
    $q.notify({ type: 'warning', message: 'Preencha o horário', position: 'top' });
    return;
  }

  salvandoHorario.value = true;

  const diaSelecionadoObj = diasSemana.value.find((d) => d.selecionado);
  if (!diaSelecionadoObj) {
    salvandoHorario.value = false;
    return;
  }

  const dataStr = formatarDataParaAPI(diaSelecionadoObj.data);
  const horaParts = novoHorario.value.horario.split(':');
  const hora = parseInt(horaParts[0] || '0');
  const horaFim = `${hora + 1}:00`;

  const horarioData: {
    data: string;
    horario_inicio: string;
    horario_fim: string;
    motivo?: string;
  } = {
    data: dataStr,
    horario_inicio: novoHorario.value.horario,
    horario_fim: horaFim,
  };

  if (!novoHorario.value.disponivel) {
    horarioData.motivo = 'Bloqueado';
  }

  try {
    if (editandoHorario.value && horarioEditandoId.value) {
      await prestadorStore.bloquearHorario(horarioData);
      $q.notify({ type: 'positive', message: 'Horário atualizado', position: 'top' });
    } else {
      await prestadorStore.bloquearHorario(horarioData);
      $q.notify({ type: 'positive', message: 'Horário adicionado', position: 'top' });
    }

    showHorarioDialog.value = false;
    await carregarAgenda();
  } catch (error) {
    console.error('Erro ao salvar horário:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar horário', position: 'top' });
  } finally {
    salvandoHorario.value = false;
  }
};

const toggleHorario = (horario: HorarioLocal) => {
  editarHorario(horario);
};

const adicionarDisponibilidade = () => {
  editandoIntervalo.value = false;
  intervaloEditandoId.value = null;
  novoIntervalo.value = {
    dias: [],
    inicio: '12:00',
    fim: '14:00',
    descricao: '',
  };
  showIntervaloDialog.value = true;
};

const configurarIntervalos = () => {
  adicionarDisponibilidade();
};

const editarIntervalo = (intervalo: IntervaloData) => {
  editandoIntervalo.value = true;
  intervaloEditandoId.value = intervalo.id;
  novoIntervalo.value = {
    dias: [...intervalo.dias],
    inicio: intervalo.inicio,
    fim: intervalo.fim,
    descricao: intervalo.descricao || '',
  };
  showIntervaloDialog.value = true;
};

const salvarIntervalo = async () => {
  if (novoIntervalo.value.dias.length === 0) {
    $q.notify({ type: 'warning', message: 'Selecione pelo menos um dia', position: 'top' });
    return;
  }

  salvandoIntervalo.value = true;

  const intervaloData: { dias: string[]; inicio: string; fim: string; descricao?: string } = {
    dias: novoIntervalo.value.dias,
    inicio: novoIntervalo.value.inicio,
    fim: novoIntervalo.value.fim,
  };

  if (novoIntervalo.value.descricao.trim()) {
    intervaloData.descricao = novoIntervalo.value.descricao;
  }

  try {
    if (editandoIntervalo.value && intervaloEditandoId.value) {
      await prestadorStore.atualizarIntervalo(intervaloEditandoId.value, intervaloData);
      $q.notify({ type: 'positive', message: 'Intervalo atualizado', position: 'top' });
    } else {
      await prestadorStore.criarIntervalo(intervaloData);
      $q.notify({ type: 'positive', message: 'Intervalo salvo', position: 'top' });
    }

    showIntervaloDialog.value = false;
    await prestadorStore.fetchIntervalos();
  } catch (error) {
    console.error('Erro ao salvar intervalo:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar intervalo', position: 'top' });
  } finally {
    salvandoIntervalo.value = false;
  }
};

const removerIntervalo = (intervalo: IntervaloData) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Remover este intervalo?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    prestadorStore
      .deletarIntervalo(intervalo.id)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Intervalo removido', position: 'top' });
      })
      .catch((error) => {
        console.error('Erro ao remover intervalo:', error);
        $q.notify({ type: 'negative', message: 'Erro ao remover intervalo', position: 'top' });
      });
  });
};

const salvarAlteracoes = async () => {
  salvando.value = true;
  try {
    await carregarAgenda();
    $q.notify({ type: 'positive', message: 'Alterações salvas', position: 'top' });
  } catch (error) {
    console.error('Erro ao salvar alterações:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar alterações', position: 'top' });
  } finally {
    salvando.value = false;
  }
};

const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    if (document.hasFocus()) {
      void prestadorStore.fetchAgenda({ semana: semanaOffset.value });
    }
  }, 60000);
};

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

let dadosAuxiliaresCarregados = false;
const carregarDadosAuxiliares = async () => {
  if (dadosAuxiliaresCarregados) return;
  await Promise.all([
    prestadorStore.fetchDiasSemana(),
    prestadorStore.fetchMeses(),
    prestadorStore.fetchHorariosOptions(),
    prestadorStore.fetchDiasOptions(),
  ]);
  dadosAuxiliaresCarregados = true;
};

// Inicialização
onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await carregarDadosAuxiliares();
    await carregarAgenda();
    iniciarPolling();
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
});

onUnmounted(() => {
  pararPolling();
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
  width: 120px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-week-selector {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.skeleton-nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-week-text {
  width: 150px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-days-grid {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.skeleton-day-card {
  flex: 1;
  height: 70px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

.skeleton-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-btn-small {
  width: 80px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.skeleton-horario-card {
  height: 70px;
  background: white;
  border-radius: 8px;
  border: 1px solid $gray-200;
}

.skeleton-intervalos-list {
  padding: 0 16px;
}

.skeleton-intervalo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid $gray-200;
}

.skeleton-intervalo-info {
  flex: 1;
}

.skeleton-intervalo-actions {
  display: flex;
  gap: 8px;
}

.skeleton-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-save-btn {
  margin: 16px;
  height: 48px;
  border-radius: 12px;
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

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
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

    .day-name,
    .day-number,
    .day-month {
      color: white;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }
}
</style>
