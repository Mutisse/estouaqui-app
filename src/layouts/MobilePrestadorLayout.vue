<template>
  <!-- Skeleton Loading (mostra enquanto carrega) -->
  <div v-if="isLoading" class="skeleton-layout">
    <div class="skeleton-header">
      <div class="skeleton-menu-btn"></div>
      <div class="skeleton-logo"></div>
      <div class="skeleton-notification-btn"></div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-stats">
        <div v-for="i in 3" :key="i" class="skeleton-stat-card">
          <div class="skeleton-stat-icon"></div>
          <div class="skeleton-stat-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-list">
        <div v-for="i in 4" :key="i" class="skeleton-list-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-list-info">
            <div class="skeleton-line w-70"></div>
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="skeleton-footer">
      <div v-for="i in 5" :key="i" class="skeleton-tab"></div>
    </div>
  </div>

  <!-- Layout real -->
  <q-layout v-else view="hHh lpR fFf" class="mobile-prestador-layout">

    <!-- ===== HEADER ===== -->
    <q-header class="ea-header" :class="{ 'ea-header--scrolled': scrolled }">
      <q-toolbar class="ea-toolbar">
        <q-btn flat round dense class="ea-menu-btn" @click="leftDrawerOpen = !leftDrawerOpen">
          <q-icon name="menu" size="22px" />
        </q-btn>

        <q-toolbar-title class="text-center">
          <div class="ea-logo" @click="goToHome">
            <span class="ea-logo__dot"></span>
            <span class="ea-logo__text">estou<strong>aqui</strong></span>
          </div>
        </q-toolbar-title>

        <q-btn flat round dense class="ea-notification-btn" @click="openNotifications">
          <q-icon name="notifications" size="22px" />
          <q-badge v-if="unreadCount > 0" color="red" floating class="notification-badge">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ===== DRAWER LATERAL (ESCURO - PADRÃO DO SISTEMA) ===== -->
    <q-drawer v-model="leftDrawerOpen" side="left" :width="280" overlay elevated class="ea-drawer">
      <q-scroll-area class="fit">
        <div class="ea-drawer__header">
          <q-avatar size="70px" class="ea-drawer__avatar">
            <img :src="userAvatar" alt="Avatar" />
          </q-avatar>
          <div class="ea-drawer__user-info">
            <div class="user-name">{{ userNome }}</div>
            <div class="user-type">Prestador de Serviços</div>
            <div class="user-rating">
              <q-rating v-model="userRating" size="14px" :max="5" color="amber" readonly />
              <span class="rating-count">({{ userTotalAvaliacoes }})</span>
            </div>
          </div>
        </div>

        <q-list padding class="ea-drawer__menu">
          <q-item-label header class="menu-header">
            <q-icon name="dashboard" size="16px" /> Painel Principal
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/prestador/dashboard" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="space_dashboard" class="menu-icon" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/prestador/pedidos" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="assignment" class="menu-icon" /></q-item-section>
            <q-item-section>Pedidos Recebidos</q-item-section>
            <q-item-section side>
              <q-badge v-if="solicitacoesPendentesCount > 0" color="red">{{ solicitacoesPendentesCount }}</q-badge>
            </q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="work" size="16px" /> Gestão de Serviços
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/prestador/servicos" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="construction" class="menu-icon" /></q-item-section>
            <q-item-section>Meus Serviços</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/prestador/agenda" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="schedule" class="menu-icon" /></q-item-section>
            <q-item-section>Minha Agenda</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/prestador/historico" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="history" class="menu-icon" /></q-item-section>
            <q-item-section>Histórico</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="payments" size="16px" /> Financeiro
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/prestador/ganhos" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="account_balance_wallet" class="menu-icon" /></q-item-section>
            <q-item-section>Meus Ganhos</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/prestador/saques" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="payments" class="menu-icon" /></q-item-section>
            <q-item-section>Realizar Saque</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="settings" size="16px" /> Configurações
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/prestador/perfil" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="person" class="menu-icon" /></q-item-section>
            <q-item-section>Meu Perfil</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/prestador/configuracoes" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="settings" class="menu-icon" /></q-item-section>
            <q-item-section>Configurações</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item clickable v-ripple @click="confirmLogout" class="menu-item logout-item">
            <q-item-section avatar><q-icon name="logout" class="menu-icon" /></q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- ===== PAGE CONTAINER ===== -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

    <!-- ===== RODAPÉ COM TABS ===== -->
    <q-footer class="ea-footer-tabs">
      <q-tabs class="ea-tabs" indicator-color="transparent" active-color="white" narrow-indicator stretch>
        <q-route-tab to="/mobile/prestador/dashboard" icon="space_dashboard" label="Dashboard" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/prestador/pedidos-disponiveis" icon="search" label="Procurar" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/prestador/pedidos" icon="assignment" label="Pedidos" class="ea-tab-item" active-class="ea-tab-active">
          <q-badge v-if="solicitacoesPendentesCount > 0" color="red" floating>{{ solicitacoesPendentesCount }}</q-badge>
        </q-route-tab>
        <q-route-tab to="/mobile/prestador/servicos" icon="construction" label="Serviços" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/prestador/perfil" icon="person" label="Perfil" class="ea-tab-item" active-class="ea-tab-active" />
      </q-tabs>
    </q-footer>

    <!-- ===== MODAL DE NOTIFICAÇÕES ===== -->
    <q-dialog v-model="notificationsDialog" position="top" class="notifications-dialog">
      <q-card class="notifications-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Notificações</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md" style="max-height: 60vh; overflow-y: auto">
          <div v-if="loadingNotificacoes" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
            <div class="text-grey-6 q-mt-sm">Carregando notificações...</div>
          </div>
          <div v-else-if="notificacoesList.length === 0" class="text-center q-pa-md">
            <q-icon name="notifications_none" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
          </div>
          <div v-else>
            <q-list separator>
              <q-item v-for="notif in notificacoesList" :key="notif.id" clickable v-ripple :class="{ 'notification-unread': !notif.lida }" @click="handleMarcaNotificacaoLida(notif.id)">
                <q-item-section avatar>
                  <q-icon :name="getNotificacaoIcone(notif)" :color="getNotificacaoCor(notif)" size="32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1" class="text-weight-medium">{{ notif.titulo }}</q-item-label>
                  <q-item-label caption lines="2">{{ notif.mensagem }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ formatarData(notif.created_at) }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="!notif.lida">
                  <q-badge color="primary" rounded>Nova</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn v-if="unreadCount > 0" flat label="Marcar todas como lidas" @click="handleMarcarTodasComoLidas" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorServicosStore } from 'src/stores/prestador/prestador-servicos-store';
import { usePrestadorFinanceiroStore } from 'src/stores/prestador/prestador-financeiro-store';
import type { NotificacaoData } from 'src/stores/prestador/prestador-financeiro-store';
import { useQuasar } from 'quasar';

interface PrestadorUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  tipo: 'cliente' | 'prestador' | 'admin';
  media_avaliacao?: number;
  total_avaliacoes?: number;
  profissao?: string;
  sobre?: string;
  verificado?: boolean;
  ativo?: boolean;
}

defineOptions({ name: 'MobilePrestadorLayout' });

const router = useRouter();
const authStore = useAuthStore();
const servicosStore = usePrestadorServicosStore();
const financeiroStore = usePrestadorFinanceiroStore();
const $q = useQuasar();

const isLoading = ref(true);
const leftDrawerOpen = ref(false);
const notificationsDialog = ref(false);
const loadingNotificacoes = ref(false);
const scrolled = ref(false);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const userNome = computed(() => authStore.user?.nome || 'Prestador');
const userAvatar = computed(() => authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');
const userRating = computed(() => (authStore.user as PrestadorUser)?.media_avaliacao || 0);
const userTotalAvaliacoes = computed(() => (authStore.user as PrestadorUser)?.total_avaliacoes || 0);
const solicitacoesPendentesCount = computed(() => {
  if (servicosStore.solicitacoes && Array.isArray(servicosStore.solicitacoes)) {
    return servicosStore.solicitacoes.filter((s) => s.status === 'pendente').length;
  }
  return 0;
});
const notificacoesList = computed(() => financeiroStore.notificacoes || []);
const unreadCount = computed(() => financeiroStore.unreadCount || 0);

function goToHome() { void router.push('/'); }
function onScroll() { scrolled.value = window.scrollY > 40; }

const getNotificacaoIcone = (notif: NotificacaoData) => {
  const tipo = notif.tipo || 'default';
  const icones: Record<string, string> = {
    pedido: 'assignment', avaliacao: 'star', promocao: 'local_offer',
    prestador: 'handyman', sistema: 'info', default: 'notifications',
  };
  return icones[tipo] || icones.default;
};

const getNotificacaoCor = (notif: NotificacaoData) => {
  const tipo = notif.tipo || 'default';
  const cores: Record<string, string> = {
    pedido: 'primary', avaliacao: 'yellow-8', promocao: 'orange',
    prestador: 'purple', sistema: 'grey-7', default: 'primary',
  };
  return cores[tipo] || cores.default;
};

const formatarData = (dataString: string) => {
  const date = new Date(dataString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffHours * 60);
    return `${diffMinutes} min atrás`;
  } else if (diffHours < 24) {
    return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffHours < 48) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
};

const carregarNotificacoes = async () => {
  if (!authStore.isPrestador) return;
  loadingNotificacoes.value = true;
  try {
    await financeiroStore.fetchNotificacoes();
  } catch (error) { console.error('Erro ao carregar notificações:', error); }
  finally { loadingNotificacoes.value = false; }
};

const handleMarcaNotificacaoLida = async (id: number) => {
  try { await financeiroStore.marcarNotificacaoLida(id); }
  catch (error) { console.error('Erro ao marcar notificação:', error); }
};

const handleMarcarTodasComoLidas = async () => {
  try {
    await financeiroStore.marcarTodasNotificacoesLidas();
    $q.notify({ type: 'positive', message: 'Todas notificações marcadas como lidas', position: 'top', timeout: 2000 });
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({ type: 'negative', message: 'Erro ao marcar notificações', position: 'top' });
  }
};

const openNotifications = () => { notificationsDialog.value = true; void carregarNotificacoes(); };
const carregarSolicitacoesPendentes = async () => {
  if (!authStore.isPrestador) return;
  try { await servicosStore.fetchSolicitacoes('pendente'); }
  catch (error) { console.error('Erro ao carregar solicitações:', error); }
};

const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (document.hasFocus() && authStore.isAuthenticated && authStore.isPrestador) {
      void financeiroStore.fetchNotificacoes();
      void carregarSolicitacoesPendentes();
      void financeiroStore.fetchStats();
    }
  }, 30000);
};

const pararPolling = () => { if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; } };

const confirmLogout = () => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => { void authStore.logout().then(() => { void router.push('/auth/login'); }); });
};

const carregarDadosIniciais = async () => {
  isLoading.value = true;
  try {
    if (!authStore.isAuthenticated) authStore.initialize();
    if (authStore.isAuthenticated && authStore.isPrestador) {
      await Promise.all([
        financeiroStore.fetchNotificacoes(),
        carregarSolicitacoesPendentes(),
        financeiroStore.fetchStats(),
        financeiroStore.fetchGanhos(),
      ]);
    }
  } catch (error) { console.error('Erro ao carregar dados iniciais:', error); }
  finally { setTimeout(() => { isLoading.value = false; }, 800); }
};

onMounted(async () => {
  await carregarDadosIniciais();
  if (authStore.isAuthenticated && authStore.isPrestador) iniciarPolling();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => { pararPolling(); window.removeEventListener('scroll', onScroll); });
</script>

<style scoped lang="scss">
// =====================
// TOKENS DO SISTEMA (PADRÃO)
// =====================
$ink:          #0A0A0F;
$accent:       #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$accent-mid:   rgba(91, 75, 245, 0.15);
$gold:         #F59E0B;
$green:        #10B981;
$surface:      #FFFFFF;
$bg:           #F4F4F8;
$line:         rgba(0, 0, 0, 0.06);
$muted:        #9898A8;
$radius:       16px;
$radius-sm:    10px;
$radius-xs:    8px;

// ==========================================
// SKELETON LOADING STYLES
// ==========================================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-layout { background: $bg; min-height: 100vh; display: flex; flex-direction: column; }
.skeleton-header { background: $ink; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; }
.skeleton-menu-btn, .skeleton-notification-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); }
.skeleton-logo { width: 100px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.2); }
.skeleton-content { flex: 1; padding: 16px; overflow-y: auto; }
.skeleton-stats { display: flex; gap: 12px; margin-bottom: 20px; }
.skeleton-stat-card { flex: 1; background: $surface; border-radius: $radius; padding: 16px; display: flex; align-items: center; gap: 12px; }
.skeleton-stat-icon { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-stat-info { flex: 1; }
.skeleton-line { height: 14px; border-radius: 7px; margin: 6px 0; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w-30 { width: 30%; } .w-40 { width: 40%; } .w-50 { width: 50%; } .w-60 { width: 60%; } .w-70 { width: 70%; } .w-80 { width: 80%; }
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-list-item { background: $surface; border-radius: $radius; padding: 16px; display: flex; gap: 12px; }
.skeleton-avatar { width: 50px; height: 50px; border-radius: $radius-sm; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-list-info { flex: 1; }
.skeleton-footer { position: fixed; bottom: 0; left: 0; right: 0; background: $surface; height: 60px; display: flex; align-items: center; justify-content: space-around; padding: 0 8px; border-top: 1px solid $line; }
.skeleton-tab { width: 50px; height: 40px; border-radius: 20px; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }

// ==========================================
// LAYOUT REAL STYLES (PADRÃO ESCURO)
// ==========================================
.mobile-prestador-layout {
  max-width: 100%;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg;
}

.ea-header {
  background: $ink !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  transition: background 0.35s ease, box-shadow 0.35s ease;
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  &--scrolled { background: rgba(10, 10, 15, 0.88) !important; backdrop-filter: blur(20px); }
}

.ea-toolbar { min-height: 56px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; }
.ea-menu-btn, .ea-notification-btn {
  color: rgba(255,255,255,0.8); border-radius: 50%; transition: all 0.2s; padding: 8px;
  &:hover { background: rgba(255,255,255,0.08); color: #fff; }
}

.ea-logo { display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  &__dot { width: 8px; height: 8px; border-radius: 50%; background: $accent; box-shadow: 0 0 8px rgba(91,75,245,0.8); }
  &__text { font-size: 1rem; color: #fff; font-weight: 400;
    strong { font-weight: 800; background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  }
}

.notification-badge { animation: pulse 2s infinite; top: 4px; right: 4px; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }

// ==========================================
// DRAWER ESCURO (PADRÃO DO SISTEMA)
// ==========================================
.ea-drawer {
  background: $ink !important;
  .q-drawer__content { background: $ink !important; }
  .q-list, .q-item, .q-scroll-area, .fit { background: $ink !important; }
}

.ea-drawer__header {
  padding: 24px 16px;
  background: $accent-mid;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);

  .ea-drawer__avatar { border: 2px solid $accent; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: 12px; }
  .ea-drawer__user-info {
    .user-name { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .user-type { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
    .user-rating { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 4px;
      .rating-count { font-size: 0.7rem; color: rgba(255,255,255,0.5); }
    }
  }
}

.ea-drawer__menu {
  padding: 16px;
  background: $ink !important;

  .menu-header {
    color: rgba(255,255,255,0.4);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 0 4px;
    background: transparent !important;
    .q-icon { margin-right: 6px; font-size: 14px; }
  }

  .menu-separator { background: rgba(255,255,255,0.08); margin: 12px 0; }

  .menu-item {
    border-radius: $radius-sm;
    margin: 4px 0;
    min-height: 44px;
    color: rgba(255,255,255,0.7);
    background: transparent !important;

    &:hover { background: rgba(255,255,255,0.08) !important; color: #fff; }
    .menu-icon { color: rgba(255,255,255,0.5); font-size: 20px; }
  }

  .menu-item-active {
    background: $accent-mid !important;
    .menu-icon { color: $accent !important; }
    .q-item__section { color: #fff; font-weight: 500; }
  }

  .logout-item:hover { background: rgba(244, 67, 54, 0.15) !important;
    .menu-icon { color: #f44336 !important; }
  }
}

.page-container { padding-bottom: 70px; flex: 1; margin-top: 56px; }

// ==========================================
// FOOTER TABS ESCURO
// ==========================================
.ea-footer-tabs {
  background: $ink !important;
  border-top: 1px solid rgba(255,255,255,0.06);
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;
}

.ea-tabs { background: $ink; color: rgba(255,255,255,0.6); height: 60px; }

.ea-tab-item {
  min-height: 60px; transition: all 0.2s ease; color: rgba(255,255,255,0.6);
  :deep(.q-tab__icon) { font-size: 22px; margin-bottom: 2px; color: rgba(255,255,255,0.5); }
  :deep(.q-tab__label) { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.5); }
  &:active { transform: scale(0.95); }
}

.ea-tab-active { color: $accent !important;
  :deep(.q-tab__icon) { color: $accent !important; }
  :deep(.q-tab__label) { color: $accent !important; font-weight: 600; }
}

// ==========================================
// NOTIFICAÇÕES
// ==========================================
.notifications-dialog :deep(.q-dialog__inner) { margin-top: 56px; }
.notifications-card { background: $ink; border: 1px solid rgba(255,255,255,0.1); color: #fff; }
.notification-unread { background: rgba($accent, 0.1); border-left: 3px solid $accent; }

// ==========================================
// SAFE AREA
// ==========================================
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .ea-footer-tabs { padding-bottom: env(safe-area-inset-bottom); }
  .page-container { padding-bottom: calc(70px + env(safe-area-inset-bottom)); }
}

// ==========================================
// RESPONSIVIDADE
// ==========================================
@media (max-width: 600px) {
  .ea-drawer { background: $ink !important; }
}

@media (max-width: 360px) {
  .ea-logo__text { font-size: 0.85rem; }
  .ea-tab-item :deep(.q-tab__icon) { font-size: 20px; }
  .ea-tab-item :deep(.q-tab__label) { font-size: 10px; }
}
</style>
