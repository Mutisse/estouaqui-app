<template>
  <div class="prestador-dashboard">

    <!-- Skeleton Loading -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-greeting">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-60"></div>
        </div>
        <div class="skeleton-refresh-btn"></div>
      </div>
      <div class="skeleton-banner"></div>
      <div class="skeleton-cards">
        <div class="row q-col-gutter-sm">
          <div v-for="i in 4" :key="i" class="col-6">
            <div class="skeleton-card"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-line w-20"></div>
        </div>
        <div class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-list-info">
              <div class="skeleton-line w-50"></div>
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-30"></div>
            </div>
            <div class="skeleton-badge"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo real -->
    <template v-else>

      <!-- Cabeçalho -->
      <div class="dashboard-header">
        <div class="dashboard-header__greeting">
          <span class="greeting-small">Bem-vindo de volta</span>
          <h1 class="greeting-name">
            {{ primeiroNome }}<span class="greeting-name--accent"> {{ ultimoNome }}</span>
          </h1>
        </div>
        <q-btn flat round class="refresh-btn" @click="recarregarDados" :loading="recarregando" aria-label="Atualizar dados">
          <q-icon name="refresh" size="20px" />
          <q-tooltip>Atualizar dados</q-tooltip>
        </q-btn>
      </div>

      <!-- Barra de status -->
      <div class="status-bar">
        <span class="status-dot"></span>
        <span class="status-text">Disponível</span>
        <span class="status-sep"></span>
        <span class="status-date">{{ dataHoje }}</span>
      </div>

      <!-- Banner de Ganhos -->
      <div class="earnings-banner">
        <div class="earnings-banner__left">
          <div class="earnings-banner__sub">Ganhos do mês</div>
          <div class="earnings-banner__value">{{ formatMoney(ganhos.mes || 0) }}</div>
          <div class="earnings-banner__note">
            <q-icon name="trending_up" size="12px" />
            Ganhos totais do período
          </div>
        </div>
        <div class="earnings-banner__badge">{{ mesAtual }}</div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-card--primary">
          <div class="stat-card__icon stat-card__icon--primary">
            <q-icon name="pending_actions" size="20px" />
          </div>
          <div class="stat-card__value">{{ stats.pedidos_pendentes || 0 }}</div>
          <div class="stat-card__label">Pedidos pendentes</div>
        </div>

        <div class="stat-card stat-card--green">
          <div class="stat-card__icon stat-card__icon--green">
            <q-icon name="check_circle" size="20px" />
          </div>
          <div class="stat-card__value">{{ stats.servicos_hoje || 0 }}</div>
          <div class="stat-card__label">Serviços hoje</div>
        </div>

        <div class="stat-card stat-card--gold">
          <div class="stat-card__icon stat-card__icon--gold">
            <q-icon name="star" size="20px" />
          </div>
          <div class="stat-card__value">{{ (stats.avaliacao_media || 0).toFixed(1) }}</div>
          <div class="stat-card__label">Avaliação média</div>
        </div>

        <div class="stat-card stat-card--purple">
          <div class="stat-card__icon stat-card__icon--purple">
            <q-icon name="payments" size="20px" />
          </div>
          <div class="stat-card__value">{{ formatMoney(ganhos.total || 0) }}</div>
          <div class="stat-card__label">Ganhos totais</div>
        </div>
      </div>

      <!-- Próximos Serviços -->
      <div v-if="proximosServicosList.length > 0" class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Próximos serviços</h2>
          <q-btn flat dense no-caps label="Ver todos →" class="section-link" to="/mobile/prestador/agenda" />
        </div>

        <div class="services-card">
          <div
            v-for="servico in proximosServicosList"
            :key="servico.id"
            class="service-item"
            @click="verPedido(servico.id)"
          >
            <div class="service-item__avatar" :style="getAvatarStyle(servico.cliente?.nome)">
              {{ getInitials(servico.cliente?.nome || 'Cliente') }}
            </div>
            <div class="service-item__info">
              <div class="service-item__name">{{ servico.cliente?.nome || 'Cliente' }}</div>
              <div class="service-item__date">
                <q-icon name="schedule" size="11px" />
                {{ formatarData(servico.data) }}
              </div>
              <div class="service-item__type">{{ servico.servico?.nome || 'Serviço' }}</div>
            </div>
            <span class="status-badge" :class="`status-badge--${getStatusCor(servico.status)}`">
              {{ getStatusTexto(servico.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Ações rápidas</h2>
        </div>
        <div class="actions-grid">
          <div class="action-card" @click="irPara('agenda')">
            <div class="action-card__icon action-card__icon--1">
              <q-icon name="event" size="24px" />
            </div>
            <span class="action-card__label">Disponibilidade</span>
          </div>
          <div class="action-card" @click="irPara('servicos')">
            <div class="action-card__icon action-card__icon--2">
              <q-icon name="construction" size="24px" />
            </div>
            <span class="action-card__label">Meus serviços</span>
          </div>
          <div class="action-card" @click="irPara('portfolio')">
            <div class="action-card__icon action-card__icon--3">
              <q-icon name="photo_library" size="24px" />
            </div>
            <span class="action-card__label">Portfólio</span>
          </div>
          <div class="action-card" @click="irPara('precos')">
            <div class="action-card__icon action-card__icon--4">
              <q-icon name="attach_money" size="24px" />
            </div>
            <span class="action-card__label">Definir preços</span>
          </div>
        </div>
      </div>

      <!-- Avaliações Recentes -->
      <div v-if="avaliacoesRecentesList.length > 0" class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Avaliações recentes</h2>
          <q-btn flat dense no-caps label="Ver todas →" class="section-link" to="/mobile/prestador/avaliacoes" />
        </div>

        <div class="reviews-card">
          <div v-for="avaliacao in avaliacoesRecentesList" :key="avaliacao.id" class="review-item">
            <div class="review-item__avatar" :style="getAvatarStyle(avaliacao.cliente?.nome)">
              {{ getInitials(avaliacao.cliente?.nome || 'Cliente') }}
            </div>
            <div class="review-item__info">
              <div class="review-item__name">
                {{ avaliacao.cliente?.nome || 'Cliente' }}
                <span class="review-item__date">{{ formatarDataAvaliacao(avaliacao.created_at) }}</span>
              </div>
              <q-rating v-model="avaliacao.nota" size="13px" :max="5" color="amber-6" readonly class="review-item__rating" />
              <div class="review-item__comment">"{{ avaliacao.comentario }}"</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-if="!proximosServicosList.length && !avaliacoesRecentesList.length" class="empty-state">
        <q-icon name="dashboard" size="56px" class="empty-state__icon" />
        <h3 class="empty-state__title">Bem-vindo ao seu dashboard!</h3>
        <p class="empty-state__text">Você ainda não tem serviços agendados.</p>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorServicosStore } from 'src/stores/prestador/prestador-servicos-store';
import { usePrestadorFinanceiroStore } from 'src/stores/prestador/prestador-financeiro-store';
import { useQuasar } from 'quasar';

defineOptions({ name: 'PrestadorDashboard' });

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();
const servicosStore = usePrestadorServicosStore();
const financeiroStore = usePrestadorFinanceiroStore();

// Estado de loading
const carregamentoInicial = ref(true);
const recarregando = ref(false);

// Dados do prestador
const prestadorNome = computed(() => authStore.user?.nome || 'Prestador');

const primeiroNome = computed(() => {
  const partes = prestadorNome.value.trim().split(' ');
  return partes[0] || '';
});

const ultimoNome = computed(() => {
  const partes = prestadorNome.value.trim().split(' ');
  return partes.slice(1).join(' ') || '';
});

// Stores data
const stats = computed(() => financeiroStore.stats || {
  pedidos_pendentes: 0,
  servicos_hoje: 0,
  avaliacao_media: 0,
});

const ganhos = computed(() => financeiroStore.ganhos || {
  total: 0,
  mes: 0,
  semana: 0,
  pendente: 0,
});

const proximosServicosList = computed(() => servicosStore.proximosServicos || []);
const avaliacoesRecentesList = computed(() => servicosStore.avaliacoesRecentes || []);

// Datas formatadas
const dataHoje = computed(() => {
  const hoje = new Date();
  return hoje.toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
});

const mesAtual = computed(() => {
  const hoje = new Date();
  return hoje.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
});

// Gradientes para avatares baseados no nome
const avatarGradients = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

const getAvatarStyle = (nome?: string) => {
  if (!nome) return { background: avatarGradients[0] };
  const idx = Math.abs(nome.charCodeAt(0)) % avatarGradients.length;
  return { background: avatarGradients[idx] };
};

const getInitials = (nome: string) => {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase();
};

// Formatação
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

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
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return data;
  }
};

const formatarDataAvaliacao = (data: string) => {
  if (!data) return '';
  try {
    const date = new Date(data);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
};

// Status helpers
const getStatusTexto = (status: string) => {
  const map: Record<string, string> = {
    pendente: 'Pendente', aceito: 'Aceito', confirmado: 'Confirmado',
    em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado',
  };
  return map[status] || status;
};

const getStatusCor = (status: string) => {
  const map: Record<string, string> = {
    pendente: 'warning', aceito: 'info', confirmado: 'primary',
    em_andamento: 'primary', concluido: 'success', cancelado: 'danger',
  };
  return map[status] || 'default';
};

// Navegação
const irPara = (rota: string) => void router.push(`/mobile/prestador/${rota}`);
const verPedido = (id: number) => void router.push(`/mobile/prestador/pedidos/${id}`);

// Recarregar
const recarregarDados = async () => {
  recarregando.value = true;
  await carregarDados();
  recarregando.value = false;
};

const carregarDados = async () => {
  carregamentoInicial.value = true;
  try {
    await Promise.all([
      financeiroStore.fetchStats(),
      financeiroStore.fetchGanhos(),
      servicosStore.fetchProximosServicos(5),
      servicosStore.fetchAvaliacoesRecentes(5),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dashboard',
      position: 'top',
      timeout: 3000,
    });
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 400);
  }
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS DO SISTEMA
// =====================
$accent:       #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$accent-mid:   rgba(91, 75, 245, 0.15);
$green:        #10B981;
$green-light:  rgba(16, 185, 129, 0.1);
$gold:         #F59E0B;
$gold-light:   rgba(245, 158, 11, 0.1);
$purple:       #9F7AEA;
$purple-light: rgba(159, 122, 234, 0.1);
$ink:          #0A0A0F;
$ink-2:        #3D3D4E;
$muted:        #9898A8;
$line:         rgba(0, 0, 0, 0.06);
$surface:      #FFFFFF;
$bg:           #F4F4F8;
$radius:       16px;
$radius-sm:    10px;
$radius-xs:    8px;

// =====================
// SKELETON LOADING
// =====================
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

%shimmer {
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-loading {
  padding: 24px 16px 80px;
  background: $bg;
  min-height: 100vh;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.skeleton-greeting { flex: 1; }
.skeleton-refresh-btn {
  width: 40px; height: 40px; border-radius: 50%;
  @extend %shimmer;
}

.skeleton-banner {
  height: 100px; border-radius: $radius; margin-bottom: 20px;
  @extend %shimmer;
}

.skeleton-cards { margin-bottom: 24px; }
.skeleton-card {
  height: 100px; border-radius: $radius; background: $surface;
  @extend %shimmer;
}

.skeleton-section { margin-bottom: 24px; }
.skeleton-section-header {
  display: flex; justify-content: space-between; margin-bottom: 12px;
}

.skeleton-list {
  background: $surface; border-radius: $radius; overflow: hidden;
}

.skeleton-list-item {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  border-bottom: 1px solid $line;
  &:last-child { border-bottom: none; }
}

.skeleton-avatar {
  width: 44px; height: 44px; border-radius: $radius-sm; flex-shrink: 0;
  @extend %shimmer;
}

.skeleton-list-info { flex: 1; }
.skeleton-badge {
  width: 64px; height: 22px; border-radius: 20px;
  @extend %shimmer;
}

.skeleton-line {
  height: 13px; border-radius: 6px; margin: 5px 0;
  @extend %shimmer;
}
.w-20 { width: 20%; } .w-30 { width: 30%; } .w-40 { width: 40%; }
.w-50 { width: 50%; } .w-60 { width: 60%; }

// =====================
// DASHBOARD LAYOUT
// =====================
.prestador-dashboard {
  background: $bg;
  min-height: 100vh;
  padding: 24px 16px 80px;
}

// =====================
// HEADER
// =====================
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  &__greeting {
    .greeting-small {
      font-size: 11px;
      color: $muted;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      display: block;
      margin-bottom: 4px;
    }
    .greeting-name {
      font-size: 26px;
      font-weight: 700;
      color: $ink;
      margin: 0;
      line-height: 1.15;

      &--accent { color: $accent; }
    }
  }

  .refresh-btn {
    color: $muted;
    background: $surface;
    border: 1px solid $line;
    border-radius: 50% !important;
    margin-top: 4px;
    transition: all 0.2s;
    &:hover {
      color: $accent;
      border-color: $accent;
      background: $accent-light;
    }
  }
}

// =====================
// STATUS BAR
// =====================
.status-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;

  .status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: $green;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  .status-text { font-size: 12px; color: $green; font-weight: 500; }
  .status-sep { width: 1px; height: 12px; background: $line; }
  .status-date { font-size: 12px; color: $muted; }
}

// =====================
// EARNINGS BANNER
// =====================
.earnings-banner {
  background: $accent;
  border-radius: $radius;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::after, &::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    pointer-events: none;
  }
  &::after  { right: -20px; top: -20px; width: 100px; height: 100px; }
  &::before { right: 30px; bottom: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); }

  &__sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  &__value {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.1;
  }
  &__note {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  &__badge {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 1;
    white-space: nowrap;
  }
}

// =====================
// STATS GRID
// =====================
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.stat-card {
  background: $surface;
  border-radius: $radius;
  padding: 16px;
  border: 1px solid $line;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover { transform: translateY(-2px); }

  &::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 60px; height: 60px;
    border-radius: 0 $radius 0 60px;
    opacity: 0.08;
    pointer-events: none;
  }
  &--primary::before { background: $accent; }
  &--green::before   { background: $green; }
  &--gold::before    { background: $gold; }
  &--purple::before  { background: $purple; }

  &__icon {
    width: 36px; height: 36px;
    border-radius: $radius-xs;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;

    &--primary { background: $accent-light; color: $accent; }
    &--green   { background: $green-light;  color: $green; }
    &--gold    { background: $gold-light;   color: $gold; }
    &--purple  { background: $purple-light; color: $purple; }
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: $ink;
    line-height: 1;
    margin-bottom: 4px;
  }
  &__label {
    font-size: 11px;
    color: $muted;
    line-height: 1.3;
  }
}

// =====================
// SECTION
// =====================
.dashboard-section { margin-bottom: 28px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: $ink;
    margin: 0;
  }
  .section-link {
    font-size: 12px;
    color: $accent;
    font-weight: 500;
    padding: 4px 8px !important;
    border-radius: $radius-xs !important;
    &:hover { background: $accent-light !important; }
  }
}

// =====================
// SERVICES CARD
// =====================
.services-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  overflow: hidden;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid $line;
  cursor: pointer;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: $accent-light; }

  &__avatar {
    width: 44px; height: 44px;
    border-radius: $radius-sm;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700;
    color: #fff; flex-shrink: 0;
    letter-spacing: 0.02em;
  }
  &__info { flex: 1; min-width: 0; }
  &__name {
    font-size: 14px; font-weight: 500; color: $ink;
    margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  &__date {
    font-size: 11px; color: $muted;
    display: flex; align-items: center; gap: 3px;
    margin-bottom: 2px;
  }
  &__type { font-size: 11px; color: $accent; font-weight: 500; }
}

// Status badges
.status-badge {
  font-size: 10px; font-weight: 600;
  padding: 3px 9px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0;
  text-transform: uppercase; letter-spacing: 0.04em;

  &--primary { background: $accent-light;  color: $accent; }
  &--warning { background: $gold-light;    color: darken($gold, 20%); }
  &--info    { background: rgba(59,130,246,0.1); color: #1D4ED8; }
  &--success { background: $green-light;   color: darken($green, 15%); }
  &--danger  { background: rgba(239,68,68,0.1); color: #B91C1C; }
  &--default { background: rgba(0,0,0,0.05); color: $muted; }
}

// =====================
// ACTIONS GRID
// =====================
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 18px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; flex-direction: column; align-items: flex-start; gap: 12px;

  &:hover {
    transform: translateY(-2px);
    border-color: $accent;
    background: $accent-light;

    .action-card__icon { background: $accent; color: #fff; }
  }

  &__icon {
    width: 44px; height: 44px;
    border-radius: $radius-sm;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;

    &--1 { background: $accent-light;  color: $accent; }
    &--2 { background: $purple-light;  color: $purple; }
    &--3 { background: $green-light;   color: $green; }
    &--4 { background: $gold-light;    color: $gold; }
  }
  &__label { font-size: 13px; font-weight: 500; color: $ink; line-height: 1.3; }
}

// =====================
// REVIEWS CARD
// =====================
.reviews-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  overflow: hidden;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid $line;
  &:last-child { border-bottom: none; }

  &__avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    color: #fff; flex-shrink: 0;
  }
  &__info { flex: 1; }
  &__name {
    font-size: 13px; font-weight: 500; color: $ink;
    margin-bottom: 4px;
  }
  &__date {
    font-size: 10px; color: $muted; margin-left: 6px; font-weight: 400;
  }
  &__rating { margin-bottom: 5px; }
  &__comment {
    font-size: 12px; color: $ink-2; line-height: 1.5; font-style: italic;
  }
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 48px 24px;
  text-align: center;
  margin-top: 8px;

  &__icon { color: #d0d0dc; margin-bottom: 16px; }
  &__title {
    font-size: 1.1rem; font-weight: 600; color: $ink; margin-bottom: 8px;
  }
  &__text { color: $muted; font-size: 14px; }
}

// =====================
// RESPONSIVIDADE
// =====================
@media (max-width: 480px) {
  .stats-grid { gap: 8px; }
  .stat-card { padding: 12px; }
  .stat-card__value { font-size: 20px; }

  .earnings-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
  .earnings-banner__badge { align-self: flex-start; }

  .actions-grid { gap: 8px; }
  .action-card { padding: 14px; }
  .action-card__icon { width: 38px; height: 38px; }

  .service-item { padding: 12px; }
  .review-item { padding: 12px; }
}
</style>
