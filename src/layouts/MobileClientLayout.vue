<template>
  <q-layout view="hHh lpR fFf" class="mobile-client-layout">

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
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="280"
      overlay
      elevated
      class="ea-drawer"
      :breakpoint="0"
    >
      <q-scroll-area class="fit">
        <div class="ea-drawer__header">
          <q-avatar size="70px" class="ea-drawer__avatar">
            <img :src="userAvatar" alt="Avatar" />
          </q-avatar>
          <div class="ea-drawer__user-info">
            <div class="user-name">{{ userName || 'Cliente' }}</div>
            <div class="user-type">Cliente</div>
          </div>
        </div>

        <q-list padding class="ea-drawer__menu">
          <q-item-label header class="menu-header">
            <q-icon name="menu" size="16px" /> Navegação
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/inicio" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="home" class="menu-icon" /></q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/mapa" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="map" class="menu-icon" /></q-item-section>
            <q-item-section>Mapa</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/lista-prestadores" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="list" class="menu-icon" /></q-item-section>
            <q-item-section>Prestadores</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="person" size="16px" /> Minha Conta
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/perfil" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="person" class="menu-icon" /></q-item-section>
            <q-item-section>Meu Perfil</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/meus-pedidos" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="assignment" class="menu-icon" /></q-item-section>
            <q-item-section>Meus Pedidos</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/favoritos" class="menu-item" active-class="menu-item-active" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="favorite" class="menu-icon" /></q-item-section>
            <q-item-section>Favoritos</q-item-section>
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
        <q-route-tab to="/mobile/inicio" icon="home" label="Início" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/mapa" icon="map" label="Mapa" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/lista-prestadores" icon="list" label="Prestadores" class="ea-tab-item" active-class="ea-tab-active" />
        <q-route-tab to="/mobile/perfil" icon="person" label="Perfil" class="ea-tab-item" active-class="ea-tab-active" />
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
          <div v-else-if="notificacoesLista.length === 0" class="text-center q-pa-md">
            <q-icon name="notifications_none" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
          </div>
          <div v-else>
            <q-list separator>
              <q-item v-for="notif in notificacoesLista" :key="notif.id" clickable v-ripple :class="{ 'notification-unread': !notif.lida }" @click="abrirNotificacao(notif)">
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
          <q-btn v-if="unreadCount > 0" flat label="Marcar todas como lidas" @click="marcarTodasComoLidas" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useClienteComunicacaoStore, type NotificacaoData } from 'src/stores/client/cliente-comunicacao-store';
import { useClientePedidosStore } from 'src/stores/client/cliente-pedidos-store';
import { useClientePublicStore } from 'src/stores/client/cliente-public-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const comunicacaoStore = useClienteComunicacaoStore();
const pedidosStore = useClientePedidosStore();
const publicStore = useClientePublicStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const notificationsDialog = ref(false);
const loadingNotificacoes = ref(false);
const loadingGlobal = ref(true);
const scrolled = ref(false);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const userName = computed(() => authStore.user?.nome || 'Cliente');
const userAvatar = computed(() => authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');

const notificacoesLista = computed<NotificacaoData[]>(() => {
  if (Array.isArray(comunicacaoStore.notificacoes)) {
    return comunicacaoStore.notificacoes;
  }
  return [];
});

const unreadCount = computed(() => {
  if (!Array.isArray(comunicacaoStore.notificacoes)) return 0;
  return comunicacaoStore.notificacoes.filter((n: NotificacaoData) => !n.lida).length;
});

function goToHome() { void router.push('/'); }
function onScroll() { scrolled.value = window.scrollY > 40; }

const carregarDadosEmBackground = async () => {
  try {
    await Promise.all([
      comunicacaoStore.fetchNotificacoes(),
      pedidosStore.fetchDashboard(),
      pedidosStore.fetchMeusPedidos(),
      comunicacaoStore.fetchFavoritos(),
      publicStore.fetchCategorias(),
      publicStore.fetchPrestadoresDestaque(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setTimeout(() => { loadingGlobal.value = false; }, 500);
  }
};

const getNotificacaoIcone = (notif: NotificacaoData) => {
  const tipo = notif.tipo || notif.type || 'default';
  const icones: Record<string, string> = {
    pedido: 'assignment', avaliacao: 'star', promocao: 'local_offer', sistema: 'info',
    proposta: 'request_quote', mensagem: 'chat', favorito: 'favorite', categoria: 'category',
    servico: 'handyman', transacao: 'payments', default: 'notifications',
  };
  return icones[tipo] || icones.default;
};

const getNotificacaoCor = (notif: NotificacaoData) => {
  const tipo = notif.tipo || notif.type || 'default';
  const cores: Record<string, string> = {
    pedido: 'primary', avaliacao: 'yellow-8', promocao: 'orange', proposta: 'purple',
    mensagem: 'teal', favorito: 'red', categoria: 'green', servico: 'blue',
    transacao: 'indigo', sistema: 'grey', default: 'primary',
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

const abrirNotificacao = async (notificacao: NotificacaoData) => {
  notificationsDialog.value = false;
  const tipo = notificacao.tipo || notificacao.type || '';
  const dados = notificacao.data || {};

  if (!notificacao.lida) {
    await marcarNotificacaoLida(notificacao.id);
  }

  if (tipo === 'nova_proposta' || tipo === 'pedido_confirmado' || tipo === 'pedido_em_andamento' ||
      tipo === 'pedido_concluido' || tipo === 'pedido_cancelado' || tipo === 'nova_solicitacao' ||
      tipo === 'solicitacao_aceita' || tipo === 'solicitacao_recusada') {
    if (dados.pedido_id) {
      void router.push(`/mobile/detalhes-pedido/${dados.pedido_id}`);
    } else {
      void router.push('/mobile/meus-pedidos');
    }
    return;
  }

  if (tipo === 'nova_avaliacao' || tipo === 'avaliacao_atualizada' || tipo === 'avaliacao_removida') {
    if (dados.avaliacao_id) {
      void router.push(`/mobile/avaliacao/${dados.avaliacao_id}`);
    } else if (dados.pedido_id) {
      void router.push(`/mobile/detalhes-pedido/${dados.pedido_id}`);
    } else {
      void router.push('/mobile/lista-prestadores');
    }
    return;
  }

  if (tipo === 'nova_mensagem') {
    if (dados.conversa_id) {
      void router.push(`/mobile/chat/${dados.conversa_id}`);
    } else if (dados.prestador_id) {
      void router.push(`/mobile/chat/${dados.prestador_id}`);
    }
    return;
  }

  if (tipo === 'promocao_nova' || tipo === 'promocao_atualizada') {
    void router.push('/mobile/promocoes');
    return;
  }

  if (tipo === 'novo_favorito') {
    void router.push('/mobile/favoritos');
    return;
  }

  if (tipo === 'nova_transacao' || tipo === 'transacao_status') {
    void router.push('/mobile/perfil');
    return;
  }

  console.log('Notificação sem destino definido:', tipo);
};

const carregarNotificacoes = async () => {
  loadingNotificacoes.value = true;
  try {
    await comunicacaoStore.fetchNotificacoes();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  } finally {
    loadingNotificacoes.value = false;
  }
};

const marcarNotificacaoLida = async (id: number): Promise<boolean> => {
  try {
    const success = await comunicacaoStore.marcarNotificacaoLida(id);
    if (success) {
      await carregarNotificacoes();
    }
    return success;
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    return false;
  }
};

const marcarTodasComoLidas = async () => {
  try {
    const success = await comunicacaoStore.marcarTodasNotificacoesLidas();
    if (success) {
      await carregarNotificacoes();
      $q.notify({ type: 'positive', message: 'Todas notificações marcadas como lidas', position: 'top', timeout: 2000 });
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({ type: 'negative', message: 'Erro ao marcar notificações', position: 'top' });
  }
};

const openNotifications = async () => {
  notificationsDialog.value = true;
  await carregarNotificacoes();
};

const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (document.hasFocus()) {
      void comunicacaoStore.fetchNotificacoes();
    }
  }, 30000);
};

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const confirmLogout = () => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    void authStore.logout()
      .then(() => {
        $q.notify({ type: 'positive', message: 'Logout efetuado com sucesso!', position: 'top', icon: 'check_circle' });
        void router.push('/auth/login');
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao sair. Tente novamente.', position: 'top' });
      });
  });
};

onMounted(() => {
  void carregarDadosEmBackground();
  iniciarPolling();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  pararPolling();
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS DO SISTEMA
// =====================
$ink: #0A0A0F;
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$accent-mid: rgba(91, 75, 245, 0.15);
$gold: #F59E0B;
$green: #10B981;
$surface: #FFFFFF;
$bg: #F4F4F8;
$line: rgba(0, 0, 0, 0.06);
$muted: #9898A8;
$radius: 16px;
$radius-sm: 10px;
$radius-xs: 8px;

// =====================
// LAYOUT PRINCIPAL
// =====================
.mobile-client-layout {
  max-width: 100%;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg;
}

// =====================
// HEADER (PADRÃO ESCURO)
// =====================
.ea-header {
  background: $ink !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  transition: background 0.35s ease, box-shadow 0.35s ease;
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;

  &--scrolled {
    background: rgba(10, 10, 15, 0.88) !important;
    backdrop-filter: blur(20px);
  }
}

.ea-toolbar {
  min-height: 56px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ea-menu-btn, .ea-notification-btn {
  color: rgba(255,255,255,0.8);
  border-radius: 50%;
  transition: all 0.2s;
  padding: 8px;

  &:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
}

// Logo
.ea-logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $accent;
    box-shadow: 0 0 8px rgba(91,75,245,0.8);
  }

  &__text {
    font-size: 1rem;
    color: #fff;
    font-weight: 400;

    strong {
      font-weight: 800;
      background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.notification-badge {
  animation: pulse 2s infinite;
  top: 4px;
  right: 4px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

// =====================
// DRAWER (ESCURO - PADRÃO DO SISTEMA) - CORRIGIDO
// =====================
.ea-drawer {
  background: $ink !important;

  .q-drawer__content {
    background: $ink !important;
  }
}

// Forçar fundo escuro em todos os elementos do drawer
.ea-drawer__header {
  padding: 24px 16px;
  background: $ink;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.ea-drawer__avatar {
  border: 2px solid $accent;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
}

.ea-drawer__user-info {
  .user-name {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }
  .user-type {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
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

    .q-icon {
      margin-right: 6px;
      font-size: 14px;
    }
  }

  .menu-separator {
    background: rgba(255,255,255,0.08);
    margin: 12px 0;
  }

  .menu-item {
    border-radius: 10px;
    margin: 2px 0;
    min-height: 48px;
    color: rgba(255,255,255,0.7);
    background: transparent !important;

    &:hover {
      background: rgba(255,255,255,0.05);
      color: #fff;
    }

    .menu-icon {
      color: rgba(255,255,255,0.5);
      font-size: 20px;
    }
  }

  .menu-item-active {
    background: $accent-mid;

    .menu-icon {
      color: $accent;
    }

    .q-item__section {
      color: #fff;
      font-weight: 500;
    }
  }

  .logout-item:hover {
    background: rgba(244, 67, 54, 0.1);

    .menu-icon {
      color: #f44336;
    }
  }
}

// =====================
// PAGE CONTAINER
// =====================
.page-container {
  padding-bottom: 70px;
  flex: 1;
  margin-top: 56px;
}

// =====================
// FOOTER TABS (ESCURO)
// =====================
.ea-footer-tabs {
  background: $ink !important;
  border-top: 1px solid rgba(255,255,255,0.06);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.ea-tabs {
  background: $ink;
  color: rgba(255,255,255,0.6);
  height: 60px;
}

.ea-tab-item {
  min-height: 60px;
  transition: all 0.2s ease;
  color: rgba(255,255,255,0.6);

  :deep(.q-tab__icon) {
    font-size: 22px;
    margin-bottom: 2px;
    color: rgba(255,255,255,0.5);
  }

  :deep(.q-tab__label) {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
  }

  &:active {
    transform: scale(0.95);
  }
}

.ea-tab-active {
  color: $accent !important;

  :deep(.q-tab__icon) {
    color: $accent !important;
  }

  :deep(.q-tab__label) {
    color: $accent !important;
    font-weight: 600;
  }
}

// =====================
// NOTIFICAÇÕES
// =====================
.notifications-dialog :deep(.q-dialog__inner) {
  margin-top: 56px;
}

.notifications-card {
  background: $ink;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
}

.notification-unread {
  background: rgba($accent, 0.1);
  border-left: 3px solid $accent;
}

// =====================
// SAFE AREA
// =====================
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .ea-footer-tabs {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .page-container {
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }
}

// =====================
// RESPONSIVIDADE - GARANTIR DRAWER ESCURO EM TODOS OS TAMANHOS
// =====================
@media (max-width: 768px) {
  .ea-drawer {
    background: $ink !important;

    .q-drawer__content {
      background: $ink !important;
    }
  }

  .ea-drawer__menu {
    background: $ink !important;
  }
}

@media (max-width: 360px) {
  .ea-logo__text {
    font-size: 0.85rem;
  }

  .ea-tab-item :deep(.q-tab__icon) {
    font-size: 20px;
  }

  .ea-tab-item :deep(.q-tab__label) {
    font-size: 10px;
  }
}
</style>
