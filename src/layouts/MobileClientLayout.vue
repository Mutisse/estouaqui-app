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
            v-if="unreadNotificationsCount > 0"
            color="red"
            floating
            class="notification-badge"
          >
            {{ unreadNotificationsCount }}
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
          <div v-if="notifications.length === 0" class="text-center q-pa-md">
            <q-icon name="notifications_none" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
          </div>

          <div v-else>
            <q-list separator>
              <q-item
                v-for="notif in notifications"
                :key="notif.id"
                clickable
                v-ripple
                :class="{ 'notification-unread': !notif.lida }"
                @click="markAsRead(notif.id)"
              >
                <q-item-section avatar>
                  <q-icon :name="notif.icone" :color="notif.cor" size="32px" />
                </q-item-section>

                <q-item-section>
                  <q-item-label lines="1" class="text-weight-medium">
                    {{ notif.titulo }}
                  </q-item-label>
                  <q-item-label caption lines="2">
                    {{ notif.mensagem }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatDate(notif.data) }}
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
            v-if="unreadNotificationsCount > 0"
            flat
            label="Marcar todas como lidas"
            @click="markAllAsRead"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const notificationsDialog = ref(false);

interface Notification {
  id: number;
  titulo: string;
  mensagem: string;
  icone: string;
  cor: string;
  data: string;
  lida: boolean;
}

const notifications = ref<Notification[]>([]);
const unreadNotificationsCount = ref(0);

const userName = computed(() => authStore.user?.nome || 'Cliente');
const userAvatar = ref('https://cdn.quasar.dev/img/avatar.png');

// Função sem async (sem await)
const fetchNotifications = () => {
  try {
    notifications.value = [
      {
        id: 1,
        titulo: 'Novo pedido',
        mensagem: 'Maria Santos solicitou um serviço de reparação elétrica',
        icone: 'assignment',
        cor: 'primary',
        data: '2026-03-23T10:30:00',
        lida: false,
      },
      {
        id: 2,
        titulo: 'Serviço concluído',
        mensagem: 'Seu serviço de limpeza foi concluído com sucesso',
        icone: 'check_circle',
        cor: 'positive',
        data: '2026-03-22T15:20:00',
        lida: false,
      },
      {
        id: 3,
        titulo: 'Avaliação recebida',
        mensagem: 'João Silva avaliou seu trabalho com 5 estrelas',
        icone: 'star',
        cor: 'yellow',
        data: '2026-03-21T09:15:00',
        lida: true,
      },
    ];
    unreadNotificationsCount.value = notifications.value.filter((n) => !n.lida).length;
  } catch {
    console.error('Erro ao buscar notificações');
  }
};

const openNotifications = () => {
  notificationsDialog.value = true;
};

const markAsRead = (id: number) => {
  try {
    const notif = notifications.value.find((n) => n.id === id);
    if (notif && !notif.lida) {
      notif.lida = true;
      unreadNotificationsCount.value--;
    }
  } catch {
    console.error('Erro ao marcar notificação como lida');
  }
};

const markAllAsRead = () => {
  try {
    notifications.value.forEach((n) => {
      if (!n.lida) {
        n.lida = true;
      }
    });
    unreadNotificationsCount.value = 0;
  } catch {
    console.error('Erro ao marcar todas notificações como lidas');
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffHours < 48) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-PT');
  }
};

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
  fetchNotifications();
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
