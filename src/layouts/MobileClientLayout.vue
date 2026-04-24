<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-1 mobile-client-layout">
    <!-- Header compacto para mobile -->
    <q-header elevated class="header-custom">
      <q-toolbar class="toolbar-compact">
        <!-- Menu hamburguer -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="menu-btn"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <!-- Logo centralizada -->
        <q-toolbar-title class="text-center">
          <div class="logo-mini">
            <q-icon name="location_on" size="16px" class="logo-icon" />
            <span class="logo-text">
              <span class="text-light">estou</span>
              <span class="text-bold">aqui</span>
            </span>
          </div>
        </q-toolbar-title>

        <!-- Notificações -->
        <q-btn flat round dense class="notification-btn" @click="openNotifications">
          <q-icon name="notifications" size="20px" />
          <q-badge
            v-if="unreadCount > 0"
            color="red"
            floating
            class="notification-badge"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Drawer lateral -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="280"
      overlay
      elevated
      class="drawer-custom"
    >
      <q-scroll-area class="fit">
        <div class="drawer-header">
          <q-avatar size="70px" class="drawer-avatar">
            <img :src="userAvatar" alt="Avatar" />
          </q-avatar>
          <div class="drawer-user-info">
            <div class="user-name">{{ userName || 'Cliente' }}</div>
            <div class="user-type">Cliente</div>
          </div>
        </div>

        <q-list padding class="drawer-menu">
          <q-item-label header class="menu-header">
            <q-icon name="menu" size="16px" />
            Navegação
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/inicio"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="home" class="menu-icon" />
            </q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/mapa"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="map" class="menu-icon" />
            </q-item-section>
            <q-item-section>Mapa</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/lista-prestadores"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="list" class="menu-icon" />
            </q-item-section>
            <q-item-section>Prestadores</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="person" size="16px" />
            Minha Conta
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/perfil"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="person" class="menu-icon" />
            </q-item-section>
            <q-item-section>Meu Perfil</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/meus-pedidos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="assignment" class="menu-icon" />
            </q-item-section>
            <q-item-section>Meus Pedidos</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/favoritos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="favorite" class="menu-icon" />
            </q-item-section>
            <q-item-section>Favoritos</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item clickable v-ripple @click="confirmLogout" class="menu-item logout-item">
            <q-item-section avatar>
              <q-icon name="logout" class="menu-icon" />
            </q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Conteúdo principal -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

    <!-- Rodapé com 4 ícones -->
    <q-footer class="footer-custom">
      <q-tabs
        class="tabs-custom"
        indicator-color="transparent"
        active-color="black"
        active-bg-color="rgba(0,0,0,0.05)"
        narrow-indicator
        stretch
      >
        <q-route-tab
          to="/mobile/inicio"
          icon="home"
          label="Início"
          class="tab-item"
          active-class="tab-active"
        />

        <q-route-tab
          to="/mobile/mapa"
          icon="map"
          label="Mapa"
          class="tab-item"
          active-class="tab-active"
        />

        <q-route-tab
          to="/mobile/lista-prestadores"
          icon="list"
          label="Prestadores"
          class="tab-item"
          active-class="tab-active"
        />

        <q-route-tab
          to="/mobile/perfil"
          icon="person"
          label="Perfil"
          class="tab-item"
          active-class="tab-active"
        />
      </q-tabs>
    </q-footer>

    <!-- Modal de Notificações -->
    <q-dialog v-model="notificationsDialog" position="top" class="notifications-dialog">
      <q-card style="min-width: 350px; max-width: 500px">
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
              <q-item
                v-for="notif in notificacoesLista"
                :key="notif.id"
                clickable
                v-ripple
                :class="{ 'notification-unread': !notif.lida }"
                @click="abrirNotificacao(notif)"
              >
                <q-item-section avatar>
                  <q-icon :name="getNotificacaoIcone(notif)" :color="getNotificacaoCor(notif)" size="32px" />
                </q-item-section>

                <q-item-section>
                  <q-item-label lines="1" class="text-weight-medium">
                    {{ notif.titulo }}
                  </q-item-label>
                  <q-item-label caption lines="2">
                    {{ notif.mensagem }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatarData(notif.created_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side v-if="!notif.lida">
                  <q-badge color="primary" rounded>Nova</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn
            v-if="unreadCount > 0"
            flat
            label="Marcar todas como lidas"
            @click="marcarTodasComoLidas"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useClienteStore, type NotificacaoData } from 'src/stores/cliente-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const clienteStore = useClienteStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const notificationsDialog = ref(false);
const loadingNotificacoes = ref(false);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// Computed
const userName = computed(() => authStore.user?.nome || 'Cliente');
const userAvatar = computed(() => authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');

const notificacoesLista = computed<NotificacaoData[]>(() => {
  if (Array.isArray(clienteStore.notificacoes)) {
    return clienteStore.notificacoes;
  }
  return [];
});

const unreadCount = computed(() => {
  if (!Array.isArray(clienteStore.notificacoes)) return 0;
  return clienteStore.notificacoes.filter((n: NotificacaoData) => !n.lida).length;
});

// Funções auxiliares
const getNotificacaoIcone = (notif: NotificacaoData) => {
  const tipo = notif.tipo || notif.type || 'default';
  const icones: Record<string, string> = {
    pedido: 'assignment',
    avaliacao: 'star',
    promocao: 'local_offer',
    sistema: 'info',
    proposta: 'request_quote',
    mensagem: 'chat',
    favorito: 'favorite',
    categoria: 'category',
    servico: 'handyman',
    transacao: 'payments',
    default: 'notifications',
  };
  return icones[tipo] || icones.default;
};

const getNotificacaoCor = (notif: NotificacaoData) => {
  const tipo = notif.tipo || notif.type || 'default';
  const cores: Record<string, string> = {
    pedido: 'primary',
    avaliacao: 'yellow-8',
    promocao: 'orange',
    proposta: 'purple',
    mensagem: 'teal',
    favorito: 'red',
    categoria: 'green',
    servico: 'blue',
    transacao: 'indigo',
    sistema: 'grey',
    default: 'primary',
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
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
    });
  }
};

// ✅ Função principal: Abrir notificação baseado no tipo
const abrirNotificacao = async (notificacao: NotificacaoData) => {
  // Fechar o modal
  notificationsDialog.value = false;

  // Extrair dados da notificação
  const tipo = notificacao.tipo || notificacao.type || '';
  const dados = notificacao.data || {};

  // Marcar como lida (se não estiver)
  if (!notificacao.lida) {
    await marcarNotificacaoLida(notificacao.id);
  }

  // Redirecionar baseado no tipo
  // Pedidos e Propostas
  if (tipo === 'nova_proposta' ||
      tipo === 'pedido_confirmado' ||
      tipo === 'pedido_em_andamento' ||
      tipo === 'pedido_concluido' ||
      tipo === 'pedido_cancelado' ||
      tipo === 'nova_solicitacao' ||
      tipo === 'solicitacao_aceita' ||
      tipo === 'solicitacao_recusada') {
    if (dados.pedido_id) {
      void router.push(`/mobile/detalhes-pedido/${dados.pedido_id}`);
    } else {
      void router.push('/mobile/meus-pedidos');
    }
    return;
  }

  // Avaliações
  if (tipo === 'nova_avaliacao' ||
      tipo === 'avaliacao_atualizada' ||
      tipo === 'avaliacao_removida') {
    if (dados.avaliacao_id) {
      void router.push(`/mobile/avaliacao/${dados.avaliacao_id}`);
    } else if (dados.pedido_id) {
      void router.push(`/mobile/detalhes-pedido/${dados.pedido_id}`);
    } else {
      void router.push('/mobile/lista-prestadores');
    }
    return;
  }

  // Mensagens
  if (tipo === 'nova_mensagem') {
    if (dados.conversa_id) {
      void router.push(`/mobile/chat/${dados.conversa_id}`);
    } else if (dados.prestador_id) {
      void router.push(`/mobile/chat/${dados.prestador_id}`);
    }
    return;
  }

  // Promoções
  if (tipo === 'promocao_nova' || tipo === 'promocao_atualizada') {
    void router.push('/mobile/promocoes');
    return;
  }

  // Favoritos
  if (tipo === 'novo_favorito') {
    void router.push('/mobile/favoritos');
    return;
  }

  // Categorias e Serviços
  if (tipo === 'nova_categoria' ||
      tipo === 'categoria_atualizada' ||
      tipo === 'categoria_removida' ||
      tipo === 'novo_servico' ||
      tipo === 'servico_atualizado' ||
      tipo === 'servico_removido' ||
      tipo === 'novo_tipo_servico' ||
      tipo === 'tipo_servico_atualizado' ||
      tipo === 'tipo_servico_removido') {
    void router.push('/mobile/lista-prestadores');
    return;
  }

  // Transações
  if (tipo === 'nova_transacao' || tipo === 'transacao_status') {
    if (authStore.isPrestador) {
      void router.push('/mobile/prestador/ganhos');
    } else {
      void router.push('/mobile/perfil');
    }
    return;
  }

  // Prestador aprovado/reprovado
  if (tipo === 'prestador_aprovado' || tipo === 'prestador_reprovado') {
    if (authStore.isPrestador) {
      void router.push('/mobile/prestador/perfil');
    } else {
      void router.push('/mobile/perfil');
    }
    return;
  }

  // Padrão: não faz nada
  console.log('Notificação sem destino definido:', tipo);
};

// Ações de notificações
const carregarNotificacoes = async () => {
  loadingNotificacoes.value = true;
  try {
    await clienteStore.fetchNotificacoes();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  } finally {
    loadingNotificacoes.value = false;
  }
};

const marcarNotificacaoLida = async (id: number): Promise<boolean> => {
  try {
    const success = await clienteStore.marcarNotificacaoLida(id);
    if (success) {
      await carregarNotificacoes();
    }
    return success;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return false;
  }
};

const marcarTodasComoLidas = async () => {
  try {
    const success = await clienteStore.marcarTodasNotificacoesLidas();
    if (success) {
      await carregarNotificacoes();
      $q.notify({
        type: 'positive',
        message: 'Todas notificações marcadas como lidas',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top',
    });
  }
};

const openNotifications = async () => {
  notificationsDialog.value = true;
  await carregarNotificacoes();
};

// Polling para buscar novas notificações a cada 30 segundos
const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    if (document.hasFocus()) {
      void carregarNotificacoes();
    }
  }, 30000);
};

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Logout
const confirmLogout = () => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: 'Sair',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void authStore
      .logout()
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Logout efetuado com sucesso!',
          position: 'top',
          icon: 'check_circle',
        });
        void router.push('/auth/login');
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao sair. Tente novamente.',
          position: 'top',
        });
      });
  });
};

onMounted(() => {
  void carregarNotificacoes();
  iniciarPolling();
});

onUnmounted(() => {
  pararPolling();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.mobile-client-layout {
  max-width: 100%;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header-custom {
  background: $purple-gradient !important;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.toolbar-compact {
  min-height: 56px;
  padding: 0 12px;
}

.menu-btn {
  color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  padding: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
}

.logo-mini {
  display: inline-flex;
  align-items: center;
  gap: 2px;

  .logo-icon {
    color: #ffd700;
    font-size: 16px;
  }

  .logo-text {
    font-size: 0.95rem;

    .text-light {
      font-weight: 300;
      color: rgba(255, 255, 255, 0.9);
    }

    .text-bold {
      font-weight: 700;
      color: white;
    }
  }
}

.notification-btn {
  color: white;
  position: relative;
  padding: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
}

.notification-badge {
  animation: pulse 2s infinite;
  top: 4px;
  right: 4px;
}

/* Drawer */
.drawer-custom {
  background: white;
}

.drawer-header {
  padding: 24px 16px;
  background: $purple-gradient;
  text-align: center;
}

.drawer-avatar {
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
}

.drawer-user-info {
  .user-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  }

  .user-type {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
  }
}

.drawer-menu {
  padding: 16px;
}

.menu-header {
  color: $gray-600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 0 4px;

  .q-icon {
    margin-right: 6px;
    font-size: 14px;
  }
}

.menu-separator {
  background: $gray-200;
  margin: 12px 0;
}

.menu-item {
  border-radius: 10px;
  margin: 2px 0;
  min-height: 48px;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  &:active {
    background: rgba(102, 126, 234, 0.15);
    transform: scale(0.98);
  }

  .menu-icon {
    color: $gray-600;
    font-size: 20px;
  }
}

.menu-item-active {
  background: rgba(102, 126, 234, 0.1);

  .menu-icon {
    color: $purple-primary;
  }

  .q-item__section {
    color: $purple-primary;
    font-weight: 500;
  }
}

.logout-item {
  &:hover {
    background: rgba(244, 67, 54, 0.05);

    .menu-icon {
      color: #f44336;
    }
  }
}

/* Page container */
.page-container {
  padding-bottom: 70px;
  flex: 1;
}

/* Rodapé */
.footer-custom {
  background: white !important;
  border-top: 1px solid $gray-200;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.tabs-custom {
  background: white;
  color: $gray-600;
  height: 60px;
}

.tab-item {
  min-height: 60px;
  transition: all 0.2s ease;
  color: $gray-600;

  :deep(.q-tab__icon) {
    font-size: 22px;
    margin-bottom: 2px;
    color: $gray-500;
  }

  :deep(.q-tab__label) {
    font-size: 11px;
    font-weight: 500;
    color: $gray-600;
  }

  &:active {
    transform: scale(0.95);
  }
}

.tab-active {
  color: $gray-900 !important;
  background: rgba(0, 0, 0, 0.05);

  :deep(.q-tab__icon) {
    color: $gray-800 !important;
  }

  :deep(.q-tab__label) {
    color: $gray-900 !important;
    font-weight: 600;
  }
}

/* Modal de Notificações */
.notifications-dialog {
  :deep(.q-dialog__inner) {
    margin-top: 56px;
  }
}

.notification-unread {
  background: rgba(102, 126, 234, 0.05);
  border-left: 3px solid $purple-primary;
}

/* Safe area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .footer-custom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .page-container {
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@media (max-width: 360px) {
  .logo-mini {
    .logo-text {
      font-size: 0.85rem;
    }
  }

  .tab-item {
    :deep(.q-tab__icon) {
      font-size: 20px;
    }

    :deep(.q-tab__label) {
      font-size: 10px;
    }
  }
}
</style>
