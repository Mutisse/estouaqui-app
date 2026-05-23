<template>
  <!-- Skeleton Loading (mostra enquanto carrega) -->
  <div v-if="isLoading" class="skeleton-admin-layout">
    <!-- Skeleton Header -->
    <div class="skeleton-header">
      <div class="skeleton-menu-btn"></div>
      <div class="skeleton-logo"></div>
      <div class="skeleton-header-actions">
        <div class="skeleton-notification"></div>
        <div class="skeleton-avatar"></div>
      </div>
    </div>

    <!-- Skeleton Drawer -->
    <div class="skeleton-drawer">
      <div class="skeleton-profile">
        <div class="skeleton-profile-avatar"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
        </div>
      </div>
      <div class="skeleton-menu">
        <div v-for="i in 8" :key="i" class="skeleton-menu-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-50"></div>
        </div>
      </div>
    </div>

    <!-- Skeleton Content -->
    <div class="skeleton-content">
      <div class="skeleton-stats">
        <div v-for="i in 4" :key="i" class="skeleton-stat-card">
          <div class="skeleton-stat-icon"></div>
          <div class="skeleton-stat-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-table">
        <div class="skeleton-table-header">
          <div v-for="i in 5" :key="i" class="skeleton-line w-15"></div>
        </div>
        <div v-for="i in 5" :key="i" class="skeleton-table-row">
          <div v-for="j in 5" :key="j" class="skeleton-line w-15"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Layout real -->
  <q-layout v-else view="hHh LpR fFf" class="admin-layout">
    <!-- Header -->
    <q-header elevated class="ea-admin-header text-white">
      <q-toolbar class="q-px-sm q-px-md-sm q-px-lg-md">
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="ea-menu-btn"
        />

        <q-toolbar-title class="row items-center">
          <div class="ea-logo" @click="goToHome">
            <span class="ea-logo__dot"></span>
            <span class="ea-logo__text">estou<strong>aqui</strong></span>
          </div>
          <span class="admin-badge q-ml-sm q-ml-md-md" :class="{ 'root-badge': isRoot }">
            {{ isRoot ? 'Root' : 'Admin' }}
          </span>
        </q-toolbar-title>

        <!-- Info do admin -->
        <div class="row items-center q-gutter-sm q-gutter-md-md">
          <q-btn
            flat
            round
            dense
            icon="notifications"
            class="ea-notification-btn"
            @click="openNotifications"
          >
            <q-badge
              v-if="unreadNotificationsCount > 0"
              color="red"
              floating
              class="notification-badge-mobile"
            >
              {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
            </q-badge>
            <q-menu>
              <q-list style="min-width: 320px; max-width: 90vw" class="notification-list">
                <q-item-label header class="bg-grey-2 text-weight-bold">
                  <div class="row items-center justify-between q-col-gutter-sm">
                    <div class="col">Notificações</div>
                    <div class="col-auto">
                      <q-btn
                        v-if="unreadNotificationsCount > 0"
                        flat
                        dense
                        label="Marcar todas"
                        size="sm"
                        @click="marcarTodasComoLidas"
                        no-caps
                      />
                    </div>
                  </div>
                </q-item-label>

                <q-scroll-area style="height: 400px; max-height: 60vh">
                  <div v-if="loadingNotificacoes" class="text-center q-pa-md">
                    <q-spinner color="primary" size="32px" />
                  </div>
                  <div
                    v-else-if="notificacoesList.length === 0"
                    class="text-center q-pa-md text-grey-6"
                  >
                    <q-icon name="notifications_none" size="48px" />
                    <div>Sem notificações</div>
                  </div>
                  <q-item
                    v-for="notif in notificacoesList"
                    :key="notif.id"
                    clickable
                    v-close-popup
                    :class="{ 'notification-unread': !notif.lida }"
                    @click="marcarNotificacaoLida(notif.id)"
                    class="notification-item"
                  >
                    <q-item-section avatar class="q-pa-none">
                      <q-avatar :color="getNotificacaoCor(notif)" text-color="white" size="36px">
                        <q-icon :name="getNotificacaoIcone(notif)" size="18px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label lines="1" class="text-weight-medium text-body2">{{
                        notif.titulo
                      }}</q-item-label>
                      <q-item-label caption lines="2" class="text-caption">{{
                        notif.mensagem
                      }}</q-item-label>
                      <q-item-label caption class="text-grey-6 text-caption">{{
                        formatarData(notif.created_at)
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="!notif.lida">
                      <q-badge color="primary" rounded>Nova</q-badge>
                    </q-item-section>
                  </q-item>
                </q-scroll-area>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round dense icon="more_vert" class="ea-more-btn">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup to="/admin/perfil">
                  <q-item-section avatar><q-icon name="person" size="18px" /></q-item-section>
                  <q-item-section>Meu Perfil</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar
                    ><q-icon name="logout" size="18px" color="negative"
                  /></q-item-section>
                  <q-item-section class="text-negative">Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      :show-if-above="windowWidth > 768"
      :width="drawerWidth"
      :breakpoint="768"
      bordered
      class="ea-admin-drawer"
    >
      <q-scroll-area class="fit">
        <!-- Perfil resumido no drawer -->
        <div class="drawer-profile q-pa-md q-pa-sm-sm" :class="{ 'root-profile': isRoot }">
          <div class="row items-center no-wrap">
            <q-avatar :size="drawerAvatarSize" class="profile-avatar">
              <img :src="userAvatar" :alt="userNome" />
            </q-avatar>
            <div class="q-ml-sm q-ml-md-md">
              <div class="profile-name text-body1 text-h6-sm">{{ userNome }}</div>
              <div class="profile-role text-caption">
                {{ isRoot ? 'Root Administrator' : 'Administrador' }}
              </div>
            </div>
          </div>
        </div>

        <q-list padding class="menu-list">
          <!-- PRINCIPAL -->
          <q-item-label header class="menu-header">PRINCIPAL</q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/dashboard"
            :active="isActive('/admin/dashboard')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="dashboard"
                :color="isActive('/admin/dashboard') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Dashboard</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- GESTÃO -->
          <q-item-label header class="menu-header">GESTÃO</q-item-label>

          <q-item
            v-if="isRoot"
            clickable
            v-ripple
            to="/admin/utilizadores"
            :active="isActive('/admin/utilizadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="people"
                :color="isActive('/admin/utilizadores') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Utilizadores</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/prestadores"
            :active="isActive('/admin/prestadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="handyman"
                :color="isActive('/admin/prestadores') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Prestadores</q-item-section>
            <q-item-section side v-if="!isRoot"
              ><q-badge color="info" class="text-caption">consulta</q-badge></q-item-section
            >
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/categorias"
            :active="isActive('/admin/categorias')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="category"
                :color="isActive('/admin/categorias') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Categorias</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/servicos"
            :active="isActive('/admin/servicos')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="assignment"
                :color="isActive('/admin/servicos') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Serviços</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- RELATÓRIOS -->
          <q-item-label header class="menu-header">RELATÓRIOS</q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/estatisticas"
            :active="isActive('/admin/estatisticas')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="bar_chart"
                :color="isActive('/admin/estatisticas') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Estatísticas</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/relatorios"
            :active="isActive('/admin/relatorios')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="assessment"
                :color="isActive('/admin/relatorios') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Relatórios</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- FINANCEIRO -->
          <q-item-label header class="menu-header">FINANCEIRO</q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/financeiro"
            :active="isActive('/admin/financeiro')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar
              ><q-icon
                name="payments"
                :color="isActive('/admin/financeiro') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
            /></q-item-section>
            <q-item-section class="menu-item-text">Financeiro</q-item-section>
            <q-item-section side>
              <q-badge v-if="isRoot" color="positive" class="text-caption">gestão total</q-badge>
              <q-badge v-else color="info" class="text-caption">consulta</q-badge>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- SISTEMA - APENAS ROOT -->
          <template v-if="isRoot">
            <q-item-label header class="menu-header">SISTEMA</q-item-label>

            <q-item
              clickable
              v-ripple
              to="/admin/monitoring"
              :active="isActive('/admin/monitoring')"
              active-class="menu-item-active"
              class="menu-item"
            >
              <q-item-section avatar
                ><q-icon
                  name="monitor_heart"
                  :color="isActive('/admin/monitoring') ? 'primary' : 'grey-7'"
                  :size="menuIconSize"
              /></q-item-section>
              <q-item-section class="menu-item-text">Monitoramento</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              to="/admin/configuracoes"
              :active="isActive('/admin/configuracoes')"
              active-class="menu-item-active"
              class="menu-item"
            >
              <q-item-section avatar
                ><q-icon
                  name="settings"
                  :color="isActive('/admin/configuracoes') ? 'primary' : 'grey-7'"
                  :size="menuIconSize"
              /></q-item-section>
              <q-item-section class="menu-item-text">Configurações</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Loading global -->
    <q-inner-loading :showing="globalLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
// ✅ IMPORT CORRETO - usando dashboardStore
import { useAdminDashboardStore, type NotificacaoData } from 'src/stores/admin/admin-dashboard-store';
import { useQuasar } from 'quasar';

defineOptions({ name: 'AdminLayout' });

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();
// ✅ USANDO O STORE CORRETO
const dashboardStore = useAdminDashboardStore();

const isLoading = ref(true);
const windowWidth = ref(window.innerWidth);
const leftDrawerOpen = ref(true);
const globalLoading = ref(false);
const loadingNotificacoes = ref(false);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const isRoot = computed(() => authStore.user?.email === 'root@estouaqui.com');
const userNome = computed(() => authStore.user?.nome || 'Administrador');
const userAvatar = computed(
  () =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userNome.value)}&background=5B4BF5&color=fff&size=56`,
);

const drawerWidth = computed(() => (windowWidth.value < 400 ? 260 : 280));
const drawerAvatarSize = computed(() => (windowWidth.value < 400 ? '48px' : '56px'));
const menuIconSize = computed(() => (windowWidth.value < 400 ? '20px' : '24px'));

// ✅ Notificações vêm do dashboardStore
const notificacoesList = computed(() => dashboardStore.notificacoesAdmin);
const unreadNotificationsCount = computed(() => {
  const notifs = notificacoesList.value;
  return Array.isArray(notifs) ? notifs.filter((n: NotificacaoData) => !n.lida).length : 0;
});

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const goToHome = () => {
  void router.push('/');
};

const getNotificacaoIcone = (notif: NotificacaoData) => {
  const tipo = notif.tipo || 'default';
  const icones: Record<string, string> = {
    pedido: 'assignment',
    avaliacao: 'star',
    promocao: 'local_offer',
    prestador: 'handyman',
    sistema: 'info',
    default: 'notifications',
  };
  return icones[tipo] || icones.default;
};

const getNotificacaoCor = (notif: NotificacaoData) => {
  const tipo = notif.tipo || 'default';
  const cores: Record<string, string> = {
    pedido: 'primary',
    avaliacao: 'yellow-8',
    promocao: 'orange',
    prestador: 'purple',
    sistema: 'grey-7',
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
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
};

const carregarNotificacoes = async () => {
  loadingNotificacoes.value = true;
  try {
    await dashboardStore.fetchNotificacoesAdmin();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  } finally {
    loadingNotificacoes.value = false;
  }
};

const marcarNotificacaoLida = async (id: string) => {
  try {
    await dashboardStore.marcarNotificacaoLida(id);
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
  }
};

const marcarTodasComoLidas = async () => {
  try {
    const success = await dashboardStore.marcarTodasNotificacoesLidas();
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Todas notificações marcadas como lidas',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({ type: 'negative', message: 'Erro ao marcar notificações', position: 'top' });
  }
};

const openNotifications = () => {
  void carregarNotificacoes();
};

const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (document.hasFocus()) {
      void dashboardStore.fetchNotificacoesAdmin();
    }
  }, 30000);
};

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const isActive = (path: string): boolean =>
  route.path === path || route.path.startsWith(path + '/');

const logout = (): void => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    globalLoading.value = true;
    void authStore
      .logout()
      .then(() => {
        setTimeout(() => {
          globalLoading.value = false;
          void router.push('/auth/login');
          $q.notify({
            type: 'positive',
            message: 'Logout realizado com sucesso',
            position: 'top',
            timeout: 2000,
          });
        }, 500);
      })
      .catch(() => {
        globalLoading.value = false;
        $q.notify({
          type: 'negative',
          message: 'Erro ao realizar logout',
          position: 'top',
          timeout: 2000,
        });
      });
  });
};

const carregarDadosIniciais = async () => {
  isLoading.value = true;
  try {
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      await router.push('/admin/login');
      isLoading.value = false;
      return;
    }
    await Promise.all([carregarNotificacoes()]);
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 600);
  }
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    void router.push('/admin/login');
    isLoading.value = false;
  } else {
    void carregarDadosIniciais();
    iniciarPolling();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
  pararPolling();
});

watch(
  () => dashboardStore.notificacoesAdmin,
  (newVal) => {
    if (!Array.isArray(newVal)) {
      // Se não for array, mantém o valor atual
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
// ... (styles mantidos iguais ao original)
$ink: #0a0a0f;
$accent: #5b4bf5;
$gold: #f59e0b;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-600: #757575;
$gray-800: #424242;

// ==========================================
// SKELETON LOADING STYLES
// ==========================================

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-admin-layout {
  background: $gray-50;
  min-height: 100vh;
  display: flex;
}
.skeleton-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: $ink;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 2000;
}
.skeleton-menu-btn,
.skeleton-notification,
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.skeleton-logo {
  width: 120px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}
.skeleton-header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.skeleton-drawer {
  position: fixed;
  top: 60px;
  left: 0;
  width: 280px;
  height: calc(100vh - 60px);
  background: white;
  border-right: 1px solid $gray-200;
  z-index: 1999;
}
.skeleton-profile {
  padding: 16px;
  background: $gray-100;
  border-bottom: 1px solid $gray-300;
  display: flex;
  align-items: center;
  gap: 12px;
}
.skeleton-profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-profile-info {
  flex: 1;
}
.skeleton-menu {
  padding: 16px;
}
.skeleton-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 4px 0;
  border-radius: 10px;
}
.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-content {
  flex: 1;
  margin-left: 280px;
  margin-top: 60px;
  padding: 24px;
}
.skeleton-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.skeleton-stat-card {
  flex: 1;
  min-width: 200px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.skeleton-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-stat-info {
  flex: 1;
}
.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.w-15 { width: 15%; }
.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-80 { width: 80%; }
.skeleton-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.skeleton-table-header {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: $gray-100;
  border-bottom: 1px solid $gray-200;
}
.skeleton-table-row {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

@media (max-width: 768px) {
  .skeleton-drawer {
    width: 260px;
  }
  .skeleton-content {
    margin-left: 0;
  }
}

// ==========================================
// LAYOUT REAL STYLES
// ==========================================

.admin-layout {
  background: $gray-50;
}

.ea-admin-header {
  background: $ink !important;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;

  .ea-menu-btn,
  .ea-notification-btn,
  .ea-more-btn {
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
  }
}

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
    box-shadow: 0 0 8px rgba(91, 75, 245, 0.8);
  }
  &__text {
    font-size: 1.1rem;
    color: #fff;
    font-weight: 400;
    strong {
      font-weight: 800;
      background: linear-gradient(135deg, $accent 0%, #a78bfa 50%, $gold 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.admin-badge {
  background: rgba($accent, 0.2);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  &.root-badge {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }
  @media (max-width: 500px) {
    display: none;
  }
}

.notification-badge-mobile {
  top: 2px;
  right: 2px;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
}

.ea-admin-drawer {
  background: $ink !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  z-index: 1999;

  .drawer-profile {
    background: rgba(91, 75, 245, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    &.root-profile {
      background: rgba(76, 175, 80, 0.1);
    }
    .profile-name {
      font-weight: 600;
      color: #fff;
    }
    .profile-role {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .profile-avatar {
      border: 2px solid $accent;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      flex-shrink: 0;
    }
  }

  .menu-list {
    .menu-header {
      font-size: 0.7rem;
      letter-spacing: 0.5px;
      padding: 12px 16px 4px;
      color: rgba(255, 255, 255, 0.4);
    }
    .menu-item {
      margin: 4px 8px;
      border-radius: 10px;
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.7);
      &:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateX(5px);
      }
      &.menu-item-active {
        background: rgba($accent, 0.1);
      }
      &.menu-item-active .q-icon {
        color: $accent !important;
      }
      .menu-item-text {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.q-page-container {
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background: $gray-50;
}

.notification-unread {
  background: rgba($accent, 0.05);
  border-left: 3px solid $accent;
}

@media (max-width: 768px) {
  .ea-admin-drawer {
    width: 280px !important;
  }
  .q-page-container {
    margin-left: 0 !important;
  }
}
@media (max-width: 400px) {
  .ea-admin-drawer {
    width: 260px !important;
  }
}
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .q-page-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
