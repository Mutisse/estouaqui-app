<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-1 mobile-prestador-layout">
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

        <!-- Logo centralizada com badge de prestador -->
        <q-toolbar-title class="text-center">
          <div class="logo-mini">
            <q-icon name="handyman" size="16px" class="logo-icon" />
            <span class="logo-text">
              <span class="text-light">modo</span>
              <span class="text-bold">prestador</span>
            </span>
          </div>
        </q-toolbar-title>

        <!-- Notificações -->
        <q-btn flat round dense class="notification-btn">
          <q-icon name="notifications" size="20px" />
          <q-badge color="red" floating class="notification-badge">3</q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Drawer lateral com menu do prestador -->
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
            <div class="user-name">{{ userName || 'Prestador' }}</div>
            <div class="user-type">Prestador de Serviços</div>
            <div class="user-rating">
              <q-rating v-model="userRating" size="14px" :max="5" color="yellow" readonly />
              <span class="rating-count">({{ userTotalAvaliacoes }})</span>
            </div>
          </div>
        </div>

        <q-list padding class="drawer-menu">
          <q-item-label header class="menu-header">
            <q-icon name="dashboard" size="16px" />
            Painel Principal
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/dashboard"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="space_dashboard" class="menu-icon" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/pedidos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="assignment" class="menu-icon" />
            </q-item-section>
            <q-item-section>Pedidos Recebidos</q-item-section>
            <q-item-section side>
              <q-badge color="red">{{ pedidosPendentes }}</q-badge>
            </q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="work" size="16px" />
            Gestão de Serviços
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/servicos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="construction" class="menu-icon" />
            </q-item-section>
            <q-item-section>Meus Serviços</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/agenda"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="schedule" class="menu-icon" />
            </q-item-section>
            <q-item-section>Minha Agenda</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/historico"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="history" class="menu-icon" />
            </q-item-section>
            <q-item-section>Histórico</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="payments" size="16px" />
            Financeiro
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/ganhos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" class="menu-icon" />
            </q-item-section>
            <q-item-section>Meus Ganhos</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/saques"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="payments" class="menu-icon" />
            </q-item-section>
            <q-item-section>Realizar Saque</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="settings" size="16px" />
            Configurações
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/perfil"
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
            to="/mobile/prestador/configuracoes"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="settings" class="menu-icon" />
            </q-item-section>
            <q-item-section>Configurações</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item clickable v-ripple @click="logout" class="menu-item logout-item">
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

    <!-- Rodapé com navegação específica para prestador -->
    <q-footer class="footer-custom">
      <q-tabs
        class="tabs-custom"
        indicator-color="transparent"
        active-color="black"
        active-bg-color="rgba(102, 126, 234, 0.1)"
        narrow-indicator
        stretch
      >
        <q-route-tab
          to="/mobile/prestador/dashboard"
          icon="space_dashboard"
          label="Dashboard"
          class="tab-item"
          active-class="tab-active"
        />

        <q-route-tab
          to="/mobile/prestador/pedidos"
          icon="assignment"
          label="Pedidos"
          class="tab-item"
          active-class="tab-active"
        >
          <q-badge v-if="pedidosPendentes > 0" color="red" floating>{{ pedidosPendentes }}</q-badge>
        </q-route-tab>

        <q-route-tab
          to="/mobile/prestador/servicos"
          icon="construction"
          label="Serviços"
          class="tab-item"
          active-class="tab-active"
        />

        <q-route-tab
          to="/mobile/prestador/perfil"
          icon="person"
          label="Perfil"
          class="tab-item"
          active-class="tab-active"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);

// Dados do prestador - APENAS informações de prestador
const userName = computed(() => authStore.user?.nome || 'João Silva');
const userAvatar = ref('https://cdn.quasar.dev/img/avatar.png');
const userRating = ref(4.8);
const userTotalAvaliacoes = ref(87);
const pedidosPendentes = ref(3); // Mock - depois virá da API

// CORREÇÃO: Variável userType removida pois não é usada neste layout

const logout = () => {
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
    void authStore.logout().then(() => {
      void router.push('/auth/login');
    });
  });
};
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

.mobile-prestador-layout {
  max-width: 100%;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header-custom {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
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
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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

  .user-rating {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;

    .rating-count {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.8);
    }
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
  position: relative;

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
  color: $purple-primary !important;
  background: rgba(102, 126, 234, 0.1);

  :deep(.q-tab__icon) {
    color: $purple-primary !important;
  }

  :deep(.q-tab__label) {
    color: $purple-primary !important;
    font-weight: 600;
  }
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
