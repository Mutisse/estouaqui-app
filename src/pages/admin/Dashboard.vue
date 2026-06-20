<template>
  <div class="dashboard-container">
    <!-- SKELETON -->
    <template v-if="dashboardStore.isLoading">
      <div class="stats-grid">
        <div v-for="i in 4" :key="i" class="skeleton-stat-card">
          <div class="skeleton-top">
            <div class="skeleton-box s-icon"></div>
            <div class="skeleton-box s-badge"></div>
          </div>
          <div class="skeleton-box s-val"></div>
          <div class="skeleton-box s-lbl"></div>
        </div>
      </div>
      <div class="sec-grid">
        <div v-for="i in 4" :key="i" class="skeleton-sec-card">
          <div class="skeleton-box s-icon-sm"></div>
          <div>
            <div class="skeleton-box s-val-sm"></div>
            <div class="skeleton-box s-lbl-sm"></div>
          </div>
        </div>
      </div>
      <div class="charts-row">
        <div class="skeleton-chart"></div>
        <div class="skeleton-chart"></div>
      </div>
      <div class="lists-row">
        <div class="skeleton-list-card">
          <div v-for="i in 4" :key="i" class="skeleton-list-item">
            <div class="skeleton-box s-av"></div>
            <div style="flex: 1">
              <div class="skeleton-box s-nm"></div>
              <div class="skeleton-box s-em"></div>
            </div>
            <div class="skeleton-box s-bdg"></div>
          </div>
        </div>
        <div class="skeleton-list-card">
          <div v-for="i in 4" :key="i" class="skeleton-list-item">
            <div class="skeleton-box s-av"></div>
            <div style="flex: 1">
              <div class="skeleton-box s-nm"></div>
              <div class="skeleton-box s-em"></div>
            </div>
            <div class="skeleton-box s-bdg"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- CONTEÚDO REAL -->
    <template v-else>
      <template v-if="dashboardStore.dashboard">
        <!-- Stats principais -->
        <div class="stats-grid">
          <div
            v-for="card in dashboardStore.cardsPrincipais"
            :key="card.title"
            class="stat-card"
            :class="`sc-${card.colorKey}`"
          >
            <div class="stat-card__top">
              <div class="stat-icon" :class="`si-${card.colorKey}`">
                <q-icon :name="card.icon" size="20px" />
              </div>
              <span class="stat-trend" :class="card.trend >= 0 ? 'trend-up' : 'trend-dn'">
                <q-icon :name="card.trend >= 0 ? 'trending_up' : 'trending_down'" size="12px" />
                {{ Math.abs(card.trend) }}%
              </span>
            </div>
            <div class="stat-val">{{ formatNumberValue(card.value, card.isCurrency) }}</div>
            <div class="stat-lbl">{{ card.title }}</div>
          </div>
        </div>

        <!-- Stats secundárias -->
        <div class="sec-grid">
          <div v-for="card in dashboardStore.cardsSecundarios" :key="card.title" class="sec-card">
            <div class="sec-icon" :class="`si-${card.colorKey}`">
              <q-icon :name="card.icon" size="20px" />
            </div>
            <div>
              <div class="sec-val">{{ formatNumberValue(card.value) }}</div>
              <div class="sec-lbl">{{ card.title }}</div>
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="charts-row">
          <div class="card">
            <div class="card-head">
              <span class="card-title">Atividade — últimos 7 dias</span>
              <q-btn
                flat
                dense
                no-caps
                label="Ver relatório →"
                class="card-link"
                to="/admin/relatorios"
              />
            </div>
            <div class="card-body">
              <div class="bars-wrap">
                <div
                  v-for="(item, index) in dashboardStore.atividadeFormatada"
                  :key="index"
                  class="bar-col"
                >
                  <div class="bar-v">{{ item.valor }}</div>
                  <div
                    class="bar-b"
                    :style="{ height: item.altura + 'px', background: item.cor }"
                  ></div>
                  <div class="bar-d">{{ item.dia }}</div>
                </div>
                <div v-if="dashboardStore.atividadeFormatada.length === 0" class="no-data-text">
                  Sem dados de atividade
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <span class="card-title">Distribuição por tipo</span>
            </div>
            <div class="card-body">
              <div
                v-for="tipo in dashboardStore.distribuicaoPorTipo"
                :key="tipo.label"
                class="dist-item"
              >
                <div class="dist-head">
                  <span class="dist-lbl">{{ tipo.label }}</span>
                  <span class="dist-val">{{ formatNumber(tipo.value) }}</span>
                </div>
                <div class="dist-bar">
                  <div
                    class="dist-fill"
                    :style="{ width: tipo.percent + '%', background: tipo.color }"
                  ></div>
                </div>
              </div>
              <div class="dist-total">
                <span class="dt-lbl">Total de utilizadores</span>
                <span class="dt-val">{{
                  formatNumber(dashboardStore.dashboard.total_usuarios || 0)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Listas recentes -->
        <div class="lists-row">
          <div class="card">
            <div class="card-head">
              <span class="card-title">Últimos utilizadores</span>
              <q-btn
                flat
                dense
                no-caps
                label="Ver todos →"
                class="card-link"
                to="/admin/utilizadores"
              />
            </div>
            <div class="list-wrap">
              <div
                v-for="user in dashboardStore.ultimosUtilizadores"
                :key="user.id"
                class="list-item"
                @click="verUtilizador(user.id)"
              >
                <div class="li-av" :style="getAvatarStyle(user.nome)">
                  {{ getInitials(user.nome) }}
                </div>
                <div class="li-info">
                  <div class="li-name">{{ user.nome }}</div>
                  <div class="li-sub">{{ user.email }}</div>
                </div>
                <div class="li-right">
                  <span class="li-badge" :class="getUserBadgeClass(user.tipo)">
                    {{ getUserBadgeLabel(user.tipo) }}
                  </span>
                  <div class="li-date">{{ formatarData(user.data_criacao) }}</div>
                </div>
              </div>
              <div v-if="dashboardStore.ultimosUtilizadores.length === 0" class="no-data-text">
                Nenhum utilizador encontrado
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <span class="card-title">Serviços recentes</span>
              <q-btn
                flat
                dense
                no-caps
                label="Ver todos →"
                class="card-link"
                to="/admin/servicos"
              />
            </div>
            <div class="list-wrap">
              <div
                v-for="servico in dashboardStore.servicosRecentes"
                :key="servico.id"
                class="list-item"
                @click="verServico(servico.id)"
              >
                <div class="li-av-sq" :class="`si-${servico.colorKey || 'blue'}`">
                  <q-icon :name="servico.icone || 'receipt'" size="18px" />
                </div>
                <div class="li-info">
                  <div class="li-name">{{ servico.servico || servico.nome || 'Serviço' }}</div>
                  <div class="li-sub">
                    {{ servico.cliente || servico.cliente_nome || '—' }} →
                    {{ servico.prestador || servico.prestador_nome || '—' }}
                  </div>
                </div>
                <div class="li-right">
                  <div class="li-price">{{ formatMoney(servico.valor || 0) }}</div>
                  <span class="li-badge" :class="`badge-${servico.statusKey || 'pend'}`">
                    {{ servico.status || 'Pendente' }}
                  </span>
                </div>
              </div>
              <div v-if="dashboardStore.servicosRecentes.length === 0" class="no-data-text">
                Nenhum serviço encontrado
              </div>
            </div>
          </div>
        </div>

        <!-- 🔥 AÇÕES RÁPIDAS - COM RESTRIÇÕES -->
        <!-- 🔥 AÇÕES RÁPIDAS - COM RESTRIÇÕES (CORRIGIDO) -->
        <div class="card">
          <div class="card-head">
            <span class="card-title">Ações rápidas</span>
          </div>
          <div class="actions-inner">
            <div class="actions-row">
              <!-- 🔥 Ações disponíveis para todos (Admin e Root) -->
              <div
                v-for="action in acoesBasicas"
                :key="action.label"
                class="act-card"
                @click="novaAcao(action.tipo)"
              >
                <div class="act-icon" :class="`si-${action.colorKey}`">
                  <q-icon :name="action.icon" size="22px" />
                </div>
                <div class="act-lbl">{{ action.label }}</div>
              </div>

              <!-- 🔥 Ações APENAS para ROOT - usando template wrapper -->
              <template v-if="isRoot">
                <div
                  v-for="action in acoesRoot"
                  :key="action.label"
                  class="act-card"
                  @click="novaAcao(action.tipo)"
                >
                  <div class="act-icon" :class="`si-${action.colorKey}`">
                    <q-icon :name="action.icon" size="22px" />
                  </div>
                  <div class="act-lbl">{{ action.label }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- Se não houver dashboard -->
      <div v-else class="no-data-container">
        <q-icon name="dashboard" size="64px" color="grey-5" />
        <p>Carregando dados do dashboard...</p>
        <q-btn
          color="primary"
          label="Recarregar"
          @click="recarregar"
          :loading="dashboardStore.isLoading"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminDashboardStore } from 'src/stores/admin/admin-dashboard-store';
import { useAuthStore } from 'src/stores/login-store';
import { useQuasar } from 'quasar';

defineOptions({ name: 'AdminDashboard' });

const router = useRouter();
const dashboardStore = useAdminDashboardStore();
const authStore = useAuthStore();
const $q = useQuasar();

// ===================== 🔥 VERIFICAR SE É ROOT =====================
const isRoot = computed(() => authStore.user?.tipo === 'root');

// ===================== 🔥 AÇÕES POR TIPO DE USUÁRIO =====================

// Ações básicas (disponíveis para todos - Admin e Root)
const acoesBasicas = [
  { label: 'Novo Admin', icon: 'person_add', tipo: 'admin', colorKey: 'blue' },
  { label: 'Verificar Prestador', icon: 'handyman', tipo: 'prestador', colorKey: 'red' },
  { label: 'Nova Categoria', icon: 'category', tipo: 'categoria', colorKey: 'gold' },
  { label: 'Relatório', icon: 'receipt', tipo: 'relatorio', colorKey: 'green' },
];

// Ações exclusivas para ROOT
const acoesRoot = [
  { label: 'Configurações', icon: 'settings', tipo: 'config', colorKey: 'slate' },
  { label: 'Suporte', icon: 'support', tipo: 'suporte', colorKey: 'red' },
  { label: 'Backup', icon: 'backup', tipo: 'backup', colorKey: 'teal' },
  { label: 'Logs do Sistema', icon: 'history', tipo: 'logs', colorKey: 'purple' },
];

// Funções auxiliares para badges
const getUserBadgeClass = (tipo: string): string => {
  const classes: Record<string, string> = {
    prestador: 'badge-pr',
    admin: 'badge-admin',
    root: 'badge-root',
    cliente: 'badge-cl',
  };
  return classes[tipo] || 'badge-cl';
};

const getUserBadgeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    prestador: 'Prestador',
    admin: 'Admin',
    root: 'Root',
    cliente: 'Cliente',
  };
  return labels[tipo] || tipo;
};

// Helpers
const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num || 0);

const formatNumberValue = (value: number | string, isCurrency?: boolean): string => {
  if (isCurrency) return formatMoney(value as number);
  return typeof value === 'number'
    ? new Intl.NumberFormat('pt-PT').format(value || 0)
    : String(value || 0);
};

const formatMoney = (num: number): string =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(num || 0);

const formatarData = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

const avatarGradients = [
  'linear-gradient(135deg,#667EEA,#764BA2)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#EF4444,#DC2626)',
  'linear-gradient(135deg,#06B6D4,#0891B2)',
];

const getAvatarStyle = (nome: string) => ({
  background: avatarGradients[(nome || '').charCodeAt(0) % avatarGradients.length],
});

const getInitials = (nome: string): string =>
  (nome || '??')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

// Actions
const verUtilizador = (id: number): void => {
  void router.push(`/admin/utilizadores?id=${id}`);
};

const verServico = (id: number): void => {
  void router.push(`/admin/servicos?id=${id}`);
};

const recarregar = (): void => {
  void dashboardStore.carregarTodosDados();
};

const novaAcao = (tipo: string): void => {
  const rotas: Record<string, string> = {
    admin: '/admin/utilizadores?novo=admin',
    prestador: '/admin/prestadores?pendentes=true',
    categoria: '/admin/categorias?nova=true',
    relatorio: '/admin/relatorios',
    config: '/admin/configuracoes',
    suporte: '/admin/suporte',
    backup: '/admin/backups',
    logs: '/admin/logs',
  };
  if (rotas[tipo]) {
    void router.push(rotas[tipo]);
  } else {
    $q.notify({ type: 'info', message: 'Em desenvolvimento', position: 'top' });
  }
};

// Lifecycle
onMounted(() => {
  void dashboardStore.carregarTodosDados();
});
</script>

<style scoped lang="scss">
// ─── TOKENS ───────────────────────────────────────────────────────────────
$a: #667eea;
$green: #10b981;
$gold: #f59e0b;
$red: #ef4444;
$teal: #06b6d4;
$purple: #764ba2;
$slate: #607d8b;
$a-l: rgba(102, 126, 234, 0.09);
$gl: rgba(16, 185, 129, 0.1);
$gol: rgba(245, 158, 11, 0.1);
$rl: rgba(239, 68, 68, 0.1);
$tl: rgba(6, 182, 212, 0.1);
$pl: rgba(118, 75, 162, 0.1);
$sll: #eceff1;
$ink: #0d0d1a;
$ink2: #3d3d55;
$muted: #9898b2;
$line: rgba(0, 0, 0, 0.07);
$sur: #ffffff;
$bg: #f2f2f7;
$r: 12px;
$rs: 8px;

.dashboard-container {
  padding: 20px;
  background: $bg;
  min-height: 100vh;
}

// ─── SHIMMER ──────────────────────────────────────────────────────────────
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

%shimmer {
  background: linear-gradient(90deg, #e4e4ec 25%, #f0f0f6 50%, #e4e4ec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-box {
  @extend %shimmer;
}
.s-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.s-badge {
  width: 48px;
  height: 22px;
}
.s-val {
  width: 80px;
  height: 28px;
  margin: 12px 0 6px;
}
.s-lbl {
  width: 110px;
  height: 12px;
}
.s-icon-sm {
  width: 38px;
  height: 38px;
  border-radius: $rs;
}
.s-val-sm {
  width: 60px;
  height: 20px;
  margin-bottom: 5px;
}
.s-lbl-sm {
  width: 80px;
  height: 11px;
}
.s-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  @extend %shimmer;
}
.s-nm {
  width: 120px;
  height: 13px;
  margin-bottom: 5px;
}
.s-em {
  width: 160px;
  height: 10px;
}
.s-bdg {
  width: 64px;
  height: 22px;
  border-radius: 10px;
  @extend %shimmer;
}

.skeleton-stat-card {
  background: $sur;
  border-radius: $r;
  padding: 18px;
  border: 1px solid $line;
  .skeleton-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }
}

.skeleton-sec-card {
  background: $sur;
  border-radius: $r;
  padding: 14px 16px;
  border: 1px solid $line;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-chart {
  height: 200px;
  background: $sur;
  border-radius: $r;
  border: 1px solid $line;
  @extend %shimmer;
}

.skeleton-list-card {
  background: $sur;
  border-radius: $r;
  border: 1px solid $line;
  overflow: hidden;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 18px;
  border-bottom: 1px solid $line;
  &:last-child {
    border-bottom: none;
  }
}

// ─── STATS GRID ───────────────────────────────────────────────────────────
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.stat-card {
  background: $sur;
  border-radius: $r;
  padding: 18px;
  border: 1px solid $line;
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
  }

  &::after {
    content: '';
    position: absolute;
    top: -8px;
    right: -8px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    opacity: 0.07;
    pointer-events: none;
  }
  &.sc-blue::after {
    background: $a;
  }
  &.sc-green::after {
    background: $green;
  }
  &.sc-gold::after {
    background: $gold;
  }
  &.sc-teal::after {
    background: $teal;
  }
  &.sc-red::after {
    background: $red;
  }
  &.sc-purple::after {
    background: $purple;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-val {
  font-size: 26px;
  font-weight: 700;
  color: $ink;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-lbl {
  font-size: 11px;
  color: $muted;
}

.stat-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.trend-up {
  background: $gl;
  color: darken($green, 10%);
}
.trend-dn {
  background: $rl;
  color: darken($red, 10%);
}

// ─── ICON COLOURS ─────────────────────────────────────────────────────────
.si-blue {
  background: $a-l;
  color: $a;
}
.si-green {
  background: $gl;
  color: $green;
}
.si-gold {
  background: $gol;
  color: $gold;
}
.si-teal {
  background: $tl;
  color: $teal;
}
.si-red {
  background: $rl;
  color: $red;
}
.si-purple {
  background: $pl;
  color: $purple;
}
.si-slate {
  background: $sll;
  color: $slate;
}

// ─── SEC GRID ─────────────────────────────────────────────────────────────
.sec-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.sec-card {
  background: $sur;
  border-radius: $r;
  padding: 14px 16px;
  border: 1px solid $line;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-1px);
  }
}

.sec-icon {
  width: 38px;
  height: 38px;
  border-radius: $rs;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sec-val {
  font-size: 18px;
  font-weight: 700;
  color: $ink;
  line-height: 1;
  margin-bottom: 3px;
}
.sec-lbl {
  font-size: 11px;
  color: $muted;
}

// ─── CHARTS ROW ───────────────────────────────────────────────────────────
.charts-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

// ─── CARD ─────────────────────────────────────────────────────────────────
.card {
  background: $sur;
  border-radius: $r;
  border: 1px solid $line;
  overflow: hidden;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid $line;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: $ink;
}

.card-link {
  font-size: 11px;
  color: $a;
  font-weight: 500;
  padding: 3px 8px !important;
  border-radius: 6px !important;
  &:hover {
    background: $a-l !important;
  }
}

.card-body {
  padding: 18px;
}

// ─── BARS ─────────────────────────────────────────────────────────────────
.bars-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 130px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-v {
  font-size: 10px;
  color: $muted;
  font-weight: 500;
}
.bar-b {
  width: 100%;
  border-radius: 5px 5px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}
.bar-d {
  font-size: 10px;
  color: $muted;
}

// ─── DISTRIBUTION ─────────────────────────────────────────────────────────
.dist-item {
  margin-bottom: 14px;
}

.dist-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.dist-lbl {
  font-size: 12px;
  color: $ink2;
}
.dist-val {
  font-size: 12px;
  font-weight: 600;
  color: $ink;
}

.dist-bar {
  height: 6px;
  border-radius: 3px;
  background: $bg;
}
.dist-fill {
  height: 100%;
  border-radius: 3px;
}

.dist-total {
  display: flex;
  justify-content: space-between;
  padding-top: 14px;
  margin-top: 2px;
  border-top: 1px solid $line;
}
.dt-lbl {
  font-size: 12px;
  color: $ink2;
}
.dt-val {
  font-size: 14px;
  font-weight: 700;
  color: $a;
}

// ─── LISTS ROW ────────────────────────────────────────────────────────────
.lists-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.list-wrap {
  max-height: 380px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 18px;
  border-bottom: 1px solid $line;
  cursor: pointer;
  transition: background 0.15s;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: $a-l;
  }
}

.li-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.li-av-sq {
  width: 38px;
  height: 38px;
  border-radius: $rs;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.li-info {
  flex: 1;
  min-width: 0;
}
.li-name {
  font-size: 13px;
  font-weight: 500;
  color: $ink;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.li-sub {
  font-size: 11px;
  color: $muted;
}

.li-right {
  text-align: right;
  flex-shrink: 0;
}
.li-date {
  font-size: 10px;
  color: $muted;
  margin-top: 3px;
}
.li-price {
  font-size: 12px;
  font-weight: 700;
  color: $a;
  margin-bottom: 3px;
}

.li-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  display: inline-block;
}
.badge-cl {
  background: $a-l;
  color: $a;
}
.badge-pr {
  background: $pl;
  color: $purple;
}
.badge-admin {
  background: $rl;
  color: $red;
}
.badge-root {
  background: #1f293720;
  color: #1f2937;
}
.badge-ok {
  background: $gl;
  color: darken($green, 12%);
}
.badge-pend {
  background: $gol;
  color: darken($gold, 20%);
}
.badge-prog {
  background: $a-l;
  color: $a;
}
.badge-cancel {
  background: $rl;
  color: darken($red, 10%);
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────
.actions-inner {
  padding: 16px 18px;
}

.actions-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.act-card {
  background: $bg;
  border-radius: $r;
  padding: 16px 10px;
  text-align: center;
  cursor: pointer;
  border: 1px solid $line;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: $a;
    background: $a-l;
    .act-icon {
      background: $a;
      color: #fff;
    }
  }
}

.act-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 20px;
  transition: all 0.2s;
}

.act-lbl {
  font-size: 11px;
  font-weight: 500;
  color: $ink2;
}

// ─── NO DATA ──────────────────────────────────────────────────────────────
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
  gap: 16px;

  p {
    color: #9ca3af;
    margin: 0;
  }
}

.no-data-text {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

// ─── RESPONSIVE ───────────────────────────────────────────────────────────
@media (max-width: 1280px) {
  .stats-grid,
  .sec-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .actions-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .lists-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .actions-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid,
  .sec-grid {
    grid-template-columns: 1fr;
  }
  .actions-row {
    grid-template-columns: 1fr;
  }
}
</style>
