<template>
  <div class="prestador-agenda">
    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="page-title">Minha Agenda</h1>
      <button class="help-btn" @click="ajuda">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="skeleton-week-selector">
        <div class="skeleton-btn"></div>
        <div class="skeleton-range"></div>
        <div class="skeleton-btn"></div>
      </div>
      <div class="skeleton-grid">
        <div class="skeleton-grid-header"></div>
        <div v-for="i in 10" :key="i" class="skeleton-row">
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== SELECTOR DE SEMANA ===== -->
      <div class="week-selector">
        <button class="week-nav" @click="semanaAnterior">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div class="week-range">{{ semanaRange }}</div>
        <button class="week-nav" @click="proximaSemana">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button class="today-btn" @click="irParaHoje">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Hoje
        </button>
      </div>

      <!-- ===== LEGENDA ===== -->
      <div class="legenda">
        <div class="legenda-item">
          <div class="legenda-cor disponivel"></div>
          <span>Disponível</span>
        </div>
        <div class="legenda-item">
          <div class="legenda-cor ocupado"></div>
          <span>Ocupado</span>
        </div>
        <div class="legenda-item">
          <div class="legenda-cor bloqueado"></div>
          <span>Bloqueado</span>
        </div>
      </div>

      <!-- ===== GRID DA AGENDA ===== -->
      <div class="agenda-grid">
        <!-- Cabeçalho dos dias -->
        <div class="grid-header">
          <div class="header-cell hora-header"></div>
          <div v-for="dia in diasDaSemana" :key="dia.data" class="header-cell">
            <div class="dia-semana">{{ dia.nomeCurto }}</div>
            <div class="dia-mes">{{ dia.diaMes }}</div>
          </div>
        </div>

        <!-- Linhas de horários -->
        <div v-for="horario in horariosDoDia" :key="horario.horario" class="grid-row">
          <div class="hora-label">{{ horario.horario }}</div>
          <div
            v-for="dia in diasDaSemana"
            :key="dia.data"
            class="grid-cell"
            :class="{
              'cell-disponivel':
                getHorarioStatus(dia.data, horario.horario).disponivel &&
                !getHorarioStatus(dia.data, horario.horario).ocupado,
              'cell-ocupado': getHorarioStatus(dia.data, horario.horario).ocupado,
              'cell-bloqueado': getHorarioStatus(dia.data, horario.horario).bloqueado,
            }"
            @click="toggleHorario(dia.data, horario.horario)"
          >
            <svg
              v-if="getHorarioStatus(dia.data, horario.horario).bloqueado"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
            <svg
              v-else-if="getHorarioStatus(dia.data, horario.horario).ocupado"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ===== BOTÕES DE AÇÃO ===== -->
      <div class="acoes">
        <button class="btn-outline" @click="abrirModalIntervalos">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Intervalos
        </button>
        <button class="btn-primary" @click="salvarAlteracoes" :disabled="salvando">
          <svg
            v-if="!salvando"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <div v-else class="btn-spinner-small"></div>
          <span>Salvar Alterações</span>
        </button>
      </div>
    </template>

    <!-- ===== MODAL DE INTERVALOS ===== -->
    <div
      class="modal-overlay"
      v-if="modalIntervalos.visivel"
      @click="modalIntervalos.visivel = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Intervalos de Disponibilidade</h3>
          <button class="modal-close" @click="modalIntervalos.visivel = false">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">Configure períodos em que não estará disponível</p>

          <div
            v-for="(intervalo, idx) in intervalosList"
            :key="intervalo.id || idx"
            class="intervalo-item"
          >
            <div class="intervalo-inputs">
              <select v-model="intervalo.diasSelecionados" class="intervalo-select" multiple>
                <option v-for="dia in diasOptionsList" :key="dia.value" :value="dia.value">
                  {{ dia.label }}
                </option>
              </select>
              <input
                type="time"
                v-model="intervalo.inicio"
                class="intervalo-time"
                placeholder="Início"
              />
              <input type="time" v-model="intervalo.fim" class="intervalo-time" placeholder="Fim" />
              <input
                type="text"
                v-model="intervalo.descricao"
                class="intervalo-desc"
                placeholder="Descrição (opcional)"
              />
            </div>
            <button class="intervalo-remove" @click="removerIntervalo(intervalo.id || 0, idx)">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </div>

          <button class="btn-add" @click="adicionarIntervalo">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar Intervalo
          </button>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="modalIntervalos.visivel = false">Cancelar</button>
          <button class="btn-save" @click="salvarIntervalos" :disabled="salvandoIntervalos">
            <div v-if="salvandoIntervalos" class="btn-spinner-small"></div>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { usePrestadorAgendaStore } from 'src/stores/prestador/prestador-agenda-store';

defineOptions({ name: 'PrestadorAgenda' });

// ==========================================
// INTERFACES LOCAIS
// ==========================================

interface HorarioItem {
  horario: string;
}

interface DiaDaSemana {
  data: string;
  nomeCurto: string;
  diaMes: string;
}

interface HorarioStatus {
  disponivel: boolean;
  ocupado: boolean;
  bloqueado: boolean;
}

interface IntervaloLocal {
  id: number;
  diasSelecionados: string[];
  inicio: string;
  fim: string;
  descricao: string;
  ativo: boolean;
}

// ==========================================
// SETUP
// ==========================================

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// ✅ APENAS UM STORE!
const agendaStore = usePrestadorAgendaStore();

const carregamentoInicial = ref(true);
const salvando = ref(false);
const salvandoIntervalos = ref(false);
const intervalosList = ref<IntervaloLocal[]>([]);
const currentWeekOffset = ref(0);

const horariosDoDia = ref<HorarioItem[]>([
  { horario: '08:00' },
  { horario: '09:00' },
  { horario: '10:00' },
  { horario: '11:00' },
  { horario: '12:00' },
  { horario: '13:00' },
  { horario: '14:00' },
  { horario: '15:00' },
  { horario: '16:00' },
  { horario: '17:00' },
  { horario: '18:00' },
  { horario: '19:00' },
]);

const modalIntervalos = reactive({
  visivel: false,
});

const diasOptionsList = [
  { label: 'Segunda', value: 'SEGUNDA' },
  { label: 'Terça', value: 'TERCA' },
  { label: 'Quarta', value: 'QUARTA' },
  { label: 'Quinta', value: 'QUINTA' },
  { label: 'Sexta', value: 'SEXTA' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function obterNomeDiaCurto(dia: number): string {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dias[dia] || '---';
}

function obterNomeMesCurto(mes: number): string {
  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return meses[mes - 1] || '---';
}

function formatarDataParaAPI(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// ==========================================
// COMPUTEDS
// ==========================================

const diasDaSemana = computed<DiaDaSemana[]>(() => {
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  const diaSemanaAtual = hoje.getDay();
  const offset = diaSemanaAtual === 0 ? 6 : diaSemanaAtual - 1;
  inicioSemana.setDate(hoje.getDate() - offset + currentWeekOffset.value * 7);

  const dias: DiaDaSemana[] = [];
  for (let i = 0; i < 7; i++) {
    const data = new Date(inicioSemana);
    data.setDate(inicioSemana.getDate() + i);
    const diaSemana = data.getDay();
    const diaMesNum = data.getDate();
    const mesNum = data.getMonth() + 1;
    const dataStr = formatarDataParaAPI(data);
    dias.push({
      data: dataStr,
      nomeCurto: obterNomeDiaCurto(diaSemana),
      diaMes: `${diaMesNum} ${obterNomeMesCurto(mesNum)}`,
    });
  }
  return dias;
});

const semanaRange = computed(() => {
  if (diasDaSemana.value.length === 0) return '';
  const primeiro = diasDaSemana.value[0];
  const ultimo = diasDaSemana.value[6];
  if (!primeiro || !ultimo) return '';
  const [ano1, mes1, dia1] = primeiro.data.split('-').map(Number);
  const [ano2, mes2, dia2] = ultimo.data.split('-').map(Number);
  if (mes1 === mes2) {
    return `${dia1} - ${dia2}/${mes1}/${ano1}`;
  }
  return `${dia1}/${mes1} - ${dia2}/${mes2}/${ano2}`;
});

// ==========================================
// FUNÇÕES DE AGENDA
// ==========================================

function getHorarioStatus(data: string, horario: string): HorarioStatus {
  const encontrado = agendaStore.agenda.find(
    (h) => h.data === data && h.horario_inicio === horario,
  );
  if (encontrado) {
    return {
      disponivel: !encontrado.bloqueado && !encontrado.ocupado,
      ocupado: encontrado.ocupado === true,
      bloqueado: encontrado.bloqueado === true,
    };
  }
  return { disponivel: true, ocupado: false, bloqueado: false };
}

function toggleHorario(data: string, horario: string): void {
  const status = getHorarioStatus(data, horario);
  const existingIndex = agendaStore.agenda.findIndex(
    (h) => h.data === data && h.horario_inicio === horario,
  );

  if (status.bloqueado) {
    // Se está bloqueado, desbloquear
    if (existingIndex !== -1 && agendaStore.agenda[existingIndex]) {
      agendaStore.agenda[existingIndex].bloqueado = false;
      agendaStore.agenda[existingIndex].ocupado = false;
    }
  } else if (status.ocupado) {
    $q.notify({
      type: 'warning',
      message: 'Este horário já possui um serviço agendado',
      position: 'top',
    });
  } else if (status.disponivel) {
    // Se está disponível, bloquear
    if (existingIndex !== -1 && agendaStore.agenda[existingIndex]) {
      agendaStore.agenda[existingIndex].bloqueado = true;
    } else {
      agendaStore.agenda.push({
        id: Date.now(),
        data,
        horario_inicio: horario,
        horario_fim: horario,
        bloqueado: true,
        ocupado: false,
        motivo: 'Bloqueio manual',
      });
    }
  }
}

// ==========================================
// CARREGAR DADOS
// ==========================================

async function carregarAgenda(): Promise<void> {
  try {
    await agendaStore.fetchAgendaPorSemana(currentWeekOffset.value);
  } catch (error) {
    console.error('Erro ao carregar agenda:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar agenda', position: 'top' });
  }
}

async function carregarIntervalos(): Promise<void> {
  try {
    await agendaStore.fetchIntervalos();
    intervalosList.value = agendaStore.intervalos.map((i) => ({
      id: i.id,
      diasSelecionados: i.dias || [],
      inicio: i.inicio || '',
      fim: i.fim || '',
      descricao: i.descricao || '',
      ativo: i.ativo,
    }));
  } catch (error) {
    console.error('Erro ao carregar intervalos:', error);
  }
}

// ==========================================
// NAVEGAÇÃO
// ==========================================

function semanaAnterior(): void {
  currentWeekOffset.value--;
  void carregarAgenda();
}

function proximaSemana(): void {
  currentWeekOffset.value++;
  void carregarAgenda();
}

function irParaHoje(): void {
  currentWeekOffset.value = 0;
  void carregarAgenda();
}

// ==========================================
// SALVAR ALTERAÇÕES
// ==========================================

async function salvarAlteracoes(): Promise<void> {
  salvando.value = true;
  try {
    const bloqueiosParaSalvar = agendaStore.agenda.filter((h) => h.bloqueado && h.id && h.id > 0);
    const novosBloqueios = agendaStore.agenda.filter((h) => h.bloqueado && (!h.id || h.id === 0));

    const bloquearPromises = novosBloqueios.map((bloqueio) =>
      agendaStore.bloquearHorario({
        data: bloqueio.data,
        horario_inicio: bloqueio.horario_inicio,
        horario_fim: bloqueio.horario_fim,
        motivo: 'Bloqueio manual',
      }),
    );

    const desbloquearPromises = bloqueiosParaSalvar.map((bloqueio) =>
      agendaStore.desbloquearHorario(bloqueio.id),
    );

    await Promise.all([...bloquearPromises, ...desbloquearPromises]);

    $q.notify({ type: 'positive', message: 'Alterações salvas com sucesso!', position: 'top' });
    await carregarAgenda();
  } catch (error) {
    console.error('Erro ao salvar alterações:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar alterações', position: 'top' });
  } finally {
    salvando.value = false;
  }
}

// ==========================================
// GERENCIAR INTERVALOS
// ==========================================

function abrirModalIntervalos(): void {
  modalIntervalos.visivel = true;
}

function adicionarIntervalo(): void {
  intervalosList.value.push({
    id: 0,
    diasSelecionados: [],
    inicio: '09:00',
    fim: '17:00',
    descricao: '',
    ativo: true,
  });
}

function removerIntervalo(id: number, idx: number): void {
  if (id === 0) {
    intervalosList.value.splice(idx, 1);
    return;
  }

  $q.dialog({
    title: 'Confirmar',
    message: 'Tem certeza que deseja remover este intervalo?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        const success = await agendaStore.deletarIntervalo(id);
        if (success) {
          intervalosList.value = intervalosList.value.filter((i) => i.id !== id);
          $q.notify({ type: 'positive', message: 'Intervalo removido', position: 'top' });
        } else {
          $q.notify({ type: 'negative', message: 'Erro ao remover intervalo', position: 'top' });
        }
      } catch (error) {
        console.error('Erro ao remover intervalo:', error);
        $q.notify({ type: 'negative', message: 'Erro ao remover intervalo', position: 'top' });
      }
    })();
  });
}

async function salvarIntervalos(): Promise<void> {
  salvandoIntervalos.value = true;
  try {
    for (const intervalo of intervalosList.value) {
      const payload: { dias: string[]; inicio: string; fim: string; descricao?: string } = {
        dias: intervalo.diasSelecionados,
        inicio: intervalo.inicio,
        fim: intervalo.fim,
      };

      if (intervalo.descricao && intervalo.descricao.trim() !== '') {
        payload.descricao = intervalo.descricao.trim();
      }

      if (intervalo.id === 0) {
        await agendaStore.criarIntervalo(payload);
      } else {
        await agendaStore.atualizarIntervalo(intervalo.id, payload);
      }
    }
    $q.notify({ type: 'positive', message: 'Intervalos salvos com sucesso!', position: 'top' });
    modalIntervalos.visivel = false;
    await carregarIntervalos();
  } catch (error) {
    console.error('Erro ao salvar intervalos:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar intervalos', position: 'top' });
  } finally {
    salvandoIntervalos.value = false;
  }
}

function ajuda(): void {
  $q.dialog({
    title: 'Ajuda - Agenda',
    message: `
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Disponível (verde)</strong> - Horário livre para agendamentos</li>
        <li><strong>Ocupado (laranja)</strong> - Horário com serviço agendado</li>
        <li><strong>Bloqueado (vermelho)</strong> - Horário bloqueado por você</li>
        <li>Clique em um horário disponível para bloqueá-lo</li>
        <li>Use "Intervalos" para bloquear períodos recorrentes</li>
      </ul>
    `,
    html: true,
    ok: { label: 'Entendi', flat: true },
  });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

const carregarDadosIniciais = async (): Promise<void> => {
  carregamentoInicial.value = true;
  try {
    await Promise.all([
      agendaStore.carregarTodosDados(currentWeekOffset.value),
      carregarIntervalos(),
    ]);
  } catch (error) {
    console.error('Erro na inicialização:', error);
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.push('/auth/login');
    return;
  }
  if (!authStore.isPrestador) {
    await router.push('/mobile/prestador/dashboard');
    return;
  }
  void carregarDadosIniciais();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10b981;
$success-light: rgba(16, 185, 129, 0.15);
$warning: #f59e0b;
$warning-light: rgba(245, 158, 11, 0.15);
$danger: #ef4444;
$danger-light: rgba(239, 68, 68, 0.15);
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON LOADING
// =====================
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-container {
  padding: 16px;
}

.skeleton-header {
  margin-bottom: 20px;

  .skeleton-title {
    width: 150px;
    height: 24px;
    background: $gray-light;
    border-radius: $radius-xs;
    margin-bottom: 8px;
  }

  .skeleton-subtitle {
    width: 200px;
    height: 14px;
    background: $gray-light;
    border-radius: $radius-xs;
  }
}

.skeleton-week-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;

  .skeleton-btn {
    width: 40px;
    height: 40px;
    background: $gray-light;
    border-radius: 50%;
  }

  .skeleton-range {
    width: 200px;
    height: 20px;
    background: $gray-light;
    border-radius: $radius-xs;
  }
}

.skeleton-grid {
  background: $white;
  border-radius: $radius;
  overflow: hidden;
  border: 1px solid $border;

  .skeleton-grid-header {
    height: 60px;
    background: $gray-light;
  }

  .skeleton-row {
    display: flex;
    border-bottom: 1px solid $border;

    .skeleton-cell {
      flex: 1;
      height: 50px;
      background: $white;
      border-right: 1px solid $border;

      &:first-child {
        width: 60px;
        flex: none;
        background: $gray-light;
      }
    }
  }
}

// =====================
// LAYOUT PRINCIPAL
// =====================
.prestador-agenda {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;

  .back-btn,
  .help-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

// =====================
// WEEK SELECTOR
// =====================
.week-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: $white;
  padding: 12px 16px;
  margin: 16px;
  border-radius: $radius;
  border: 1px solid $border;

  .week-nav {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }

  .week-range {
    font-size: 0.9rem;
    font-weight: 500;
    color: $dark;
    min-width: 180px;
    text-align: center;
  }

  .today-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: $gray-light;
    border: none;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }
}

// =====================
// LEGENDA
// =====================
.legenda {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 0 16px 16px;
  padding: 12px;
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;

  .legenda-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: $gray;

    .legenda-cor {
      width: 16px;
      height: 16px;
      border-radius: 4px;

      &.disponivel {
        background: $success;
      }
      &.ocupado {
        background: $warning;
      }
      &.bloqueado {
        background: $danger;
      }
    }
  }
}

// =====================
// AGENDA GRID
// =====================
.agenda-grid {
  background: $white;
  margin: 0 16px;
  border-radius: $radius;
  overflow-x: auto;
  border: 1px solid $border;

  .grid-header {
    display: flex;
    background: $gray-light;
    border-bottom: 1px solid $border;

    .header-cell {
      flex: 1;
      text-align: center;
      padding: 12px 4px;
      border-right: 1px solid $border;

      &:last-child {
        border-right: none;
      }

      &.hora-header {
        flex: none;
        width: 70px;
        background: $gray-light;
      }

      .dia-semana {
        font-size: 0.8rem;
        font-weight: 600;
        color: $dark;
      }

      .dia-mes {
        font-size: 0.7rem;
        color: $gray;
      }
    }
  }

  .grid-row {
    display: flex;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }

    .hora-label {
      width: 70px;
      flex: none;
      text-align: center;
      padding: 12px 4px;
      font-size: 0.7rem;
      color: $gray;
      background: $gray-light;
      border-right: 1px solid $border;
    }

    .grid-cell {
      flex: 1;
      min-height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid $border;
      cursor: pointer;
      transition: all 0.15s ease;

      &:last-child {
        border-right: none;
      }

      &.cell-disponivel {
        background: $success-light;
        &:hover {
          background: rgba($success, 0.25);
        }
      }

      &.cell-ocupado {
        background: $warning-light;
        cursor: not-allowed;
        &:hover {
          background: rgba($warning, 0.25);
        }
      }

      &.cell-bloqueado {
        background: $danger-light;
        &:hover {
          background: rgba($danger, 0.3);
        }
      }
    }
  }
}

// =====================
// BOTÕES DE AÇÃO
// =====================
.acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  margin: 0 16px;

  .btn-outline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $radius-sm;
    font-size: 0.85rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: $gray-light;
      border-color: $gray;
    }
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: $accent;
    border: none;
    border-radius: $radius-sm;
    font-size: 0.85rem;
    font-weight: 600;
    color: $white;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
      transform: translateY(-1px);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.btn-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// =====================
// MODAL
// =====================
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: $white;
  border-radius: $radius;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid $border;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    &:hover {
      background: $border;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .modal-subtitle {
    font-size: 0.8rem;
    color: $gray;
    margin-bottom: 20px;
  }
}

.intervalo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: $gray-light;
  border-radius: $radius-sm;

  .intervalo-inputs {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .intervalo-select {
    min-width: 140px;
    padding: 10px;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.8rem;
    background: $white;
  }

  .intervalo-time {
    width: 100px;
    padding: 10px;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.8rem;
  }

  .intervalo-desc {
    flex: 1;
    min-width: 150px;
    padding: 10px;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.8rem;
  }

  .intervalo-remove {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: $danger;
    &:hover {
      background: $danger-light;
    }
  }
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px dashed $border;
  border-radius: $radius-sm;
  font-size: 0.8rem;
  color: $accent;
  cursor: pointer;
  margin-top: 8px;
  &:hover {
    background: $accent-light;
    border-color: $accent;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid $border;

  .btn-cancel {
    padding: 8px 20px;
    background: transparent;
    border: none;
    font-size: 0.85rem;
    color: $gray;
    cursor: pointer;
    &:hover {
      color: $dark;
    }
  }

  .btn-save {
    padding: 8px 24px;
    background: $accent;
    border: none;
    border-radius: $radius-sm;
    font-size: 0.85rem;
    font-weight: 500;
    color: $white;
    cursor: pointer;
    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
    }
    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
