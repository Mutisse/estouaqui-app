<template>
  <q-layout view="hHh LpR fFf" class="admin-layout">
    <!-- Header Responsivo -->
    <q-header elevated class="admin-header text-white">
      <q-toolbar class="q-px-sm q-px-md-sm q-px-lg-md">
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="menu-btn"
        />

        <q-toolbar-title class="row items-center">
          <div class="logo-wrapper">
            <span class="text-bold">Estou</span>
            <span class="text-bold text-primary">Aqui</span>
          </div>
          <span class="admin-badge q-ml-sm q-ml-md-md" :class="{ 'root-badge': isRoot }">
            {{ isRoot ? 'Root' : 'Admin' }}
          </span>
        </q-toolbar-title>

        <!-- Info do admin - Responsivo -->
        <div class="row items-center q-gutter-sm q-gutter-md-md">
          <q-chip
            dense
            class="bg-white text-primary notification-chip"
            :class="{ 'lt-sm': $q.screen.lt.sm }"
            icon="notifications"
          >
            {{ unreadNotificationsCount }}
          </q-chip>

          <q-btn
            flat
            round
            dense
            icon="notifications"
            class="notification-btn"
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
                    v-else-if="notificacoes.length === 0"
                    class="text-center q-pa-md text-grey-6"
                  >
                    <q-icon name="notifications_none" size="48px" />
                    <div>Sem notificações</div>
                  </div>

                  <q-item
                    v-for="notif in notificacoes"
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
                      <q-item-label lines="1" class="text-weight-medium text-body2">
                        {{ notif.titulo }}
                      </q-item-label>
                      <q-item-label caption lines="2" class="text-caption">
                        {{ notif.mensagem }}
                      </q-item-label>
                      <q-item-label caption class="text-grey-6 text-caption">
                        {{ formatarData(notif.created_at) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="!notif.lida">
                      <q-badge color="primary" rounded>Nova</q-badge>
                    </q-item-section>
                  </q-item>
                </q-scroll-area>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round dense icon="more_vert">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup to="/admin/perfil">
                  <q-item-section avatar>
                    <q-icon name="person" size="18px" />
                  </q-item-section>
                  <q-item-section>Meu Perfil</q-item-section>
                </q-item>

                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" size="18px" color="negative" />
                  </q-item-section>
                  <q-item-section class="text-negative">Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Drawer Responsivo -->
    <q-drawer
      v-model="leftDrawerOpen"
      :show-if-above="windowWidth > 768"
      :width="drawerWidth"
      :breakpoint="768"
      bordered
      class="admin-drawer"
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
          <!-- ========================================== -->
          <!-- PRINCIPAL - AMBOS VEEM -->
          <!-- ========================================== -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            PRINCIPAL
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/dashboard"
            :active="isActive('/admin/dashboard')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="dashboard"
                :color="isActive('/admin/dashboard') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Dashboard</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- ========================================== -->
          <!-- GESTÃO -->
          <!-- ========================================== -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            GESTÃO
          </q-item-label>

          <!-- UTILIZADORES - APENAS ROOT -->
          <q-item
            v-if="isRoot"
            clickable
            v-ripple
            to="/admin/utilizadores"
            :active="isActive('/admin/utilizadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="people"
                :color="isActive('/admin/utilizadores') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Utilizadores</q-item-section>
          </q-item>

          <!-- PRESTADORES - AMBOS VEEM (com badge consulta para admin normal) -->
          <q-item
            clickable
            v-ripple
            to="/admin/prestadores"
            :active="isActive('/admin/prestadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="handyman"
                :color="isActive('/admin/prestadores') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Prestadores</q-item-section>
            <q-item-section side v-if="!isRoot">
              <q-badge color="info" class="text-caption">consulta</q-badge>
            </q-item-section>
          </q-item>

          <!-- CATEGORIAS - AMBOS VEEM -->
          <q-item
            clickable
            v-ripple
            to="/admin/categorias"
            :active="isActive('/admin/categorias')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="category"
                :color="isActive('/admin/categorias') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Categorias</q-item-section>
          </q-item>

          <!-- SERVIÇOS - AMBOS VEEM -->
          <q-item
            clickable
            v-ripple
            to="/admin/servicos"
            :active="isActive('/admin/servicos')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="assignment"
                :color="isActive('/admin/servicos') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Serviços</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- ========================================== -->
          <!-- RELATÓRIOS - AMBOS VEEM -->
          <!-- ========================================== -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            RELATÓRIOS
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/estatisticas"
            :active="isActive('/admin/estatisticas')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="bar_chart"
                :color="isActive('/admin/estatisticas') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
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
            <q-item-section avatar>
              <q-icon
                name="assessment"
                :color="isActive('/admin/relatorios') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Relatórios</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- ========================================== -->
          <!-- FINANCEIRO - AMBOS VEEM (com badges diferentes) -->
          <!-- ========================================== -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            FINANCEIRO
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/financeiro"
            :active="isActive('/admin/financeiro')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon
                name="payments"
                :color="isActive('/admin/financeiro') ? 'primary' : 'grey-7'"
                :size="menuIconSize"
              />
            </q-item-section>
            <q-item-section class="menu-item-text">Financeiro</q-item-section>
            <q-item-section side>
              <q-badge v-if="isRoot" color="positive" class="text-caption">gestão total</q-badge>
              <q-badge v-else color="info" class="text-caption">consulta</q-badge>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- ========================================== -->
          <!-- SISTEMA - APENAS ROOT VÊ -->
          <!-- ========================================== -->
          <template v-if="isRoot">
            <q-item-label header class="text-grey-7 text-uppercase menu-header">
              SISTEMA
            </q-item-label>

            <q-item
              clickable
              v-ripple
              to="/admin/monitoring"
              :active="isActive('/admin/monitoring')"
              active-class="menu-item-active"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon
                  name="monitor_heart"
                  :color="isActive('/admin/monitoring') ? 'primary' : 'grey-7'"
                  :size="menuIconSize"
                />
              </q-item-section>
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
              <q-item-section avatar>
                <q-icon
                  name="settings"
                  :color="isActive('/admin/configuracoes') ? 'primary' : 'grey-7'"
                  :size="menuIconSize"
                />
              </q-item-section>
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
import { useAdminStore, type NotificacaoData } from 'src/stores/admin-store';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'AdminLayout',
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();
const adminStore = useAdminStore();

// ✅ DETECTAR SE É ROOT (super admin)
const isRoot = computed(() => {
  return authStore.user?.email === 'root@estouaqui.com';
});

// Responsividade - largura da janela
const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const drawerWidth = computed(() => {
  if (windowWidth.value < 400) return 260;
  if (windowWidth.value < 600) return 280;
  return 280;
});

const drawerAvatarSize = computed(() => {
  if (windowWidth.value < 400) return '48px';
  return '56px';
});

const menuIconSize = computed(() => {
  if (windowWidth.value < 400) return '20px';
  return '24px';
});

const userNome = computed(() => authStore.user?.nome || 'Administrador');
const userAvatar = computed(
  () =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userNome.value)}&background=667eea&color=fff&size=56`,
);

const leftDrawerOpen = ref(true);
const globalLoading = ref(false);
const loadingNotificacoes = ref(false);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const notificacoes = computed(() => adminStore.notificacoesAdmin);
const unreadNotificationsCount = computed(() => {
  const notifs = notificacoes.value;
  return Array.isArray(notifs) ? notifs.filter((n) => !n.lida).length : 0;
});

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
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
    });
  }
};

const carregarNotificacoes = async () => {
  loadingNotificacoes.value = true;
  try {
    await adminStore.fetchNotificacoesAdmin();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  } finally {
    loadingNotificacoes.value = false;
  }
};

const marcarNotificacaoLida = async (id: string) => {
  try {
    await adminStore.marcarNotificacaoLida(id);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};

const marcarTodasComoLidas = async () => {
  try {
    const success = await adminStore.marcarTodasNotificacoesLidas();
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
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top',
    });
  }
};

const openNotifications = () => {
  void carregarNotificacoes();
};

const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    if (document.hasFocus()) {
      void adminStore.fetchNotificacoesAdmin();
    }
  }, 30000);
};

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/');
};

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

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);

  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    void router.push('/admin/login');
  }
  void carregarNotificacoes();
  iniciarPolling();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
  pararPolling();
});

watch(
  () => adminStore.notificacoesAdmin,
  (newVal) => {
    if (!Array.isArray(newVal)) {
      adminStore.notificacoesAdmin = [];
    }
  },
  { immediate: true },
);
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

.admin-layout {
  background: $gray-50;
}

.admin-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;

  .menu-btn {
    transition: all 0.3s ease;

    @media (max-width: 400px) {
      padding: 6px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .logo-wrapper {
    font-size: 1.3rem;

    @media (max-width: 500px) {
      font-size: 1.1rem;
    }

    .text-primary {
      color: $purple-primary !important;
    }
  }

  .admin-badge {
    background: rgba($purple-primary, 0.2);
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 0.7rem;

    @media (max-width: 500px) {
      display: none;
    }

    &.root-badge {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }
  }

  .notification-btn {
    transition: all 0.3s ease;

    @media (max-width: 400px) {
      padding: 6px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .notification-chip {
    @media (max-width: 600px) {
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
}

.admin-drawer {
  background: white;
  border-right: 1px solid $gray-200;
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  z-index: 1999;

  .drawer-profile {
    background: linear-gradient(135deg, $gray-100 0%, $gray-200 100%);
    border-bottom: 1px solid $gray-300;

    @media (max-width: 400px) {
      padding: 12px;
    }

    &.root-profile {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 126, 234, 0.2) 100%);
    }

    .profile-name {
      font-weight: 600;
      color: $gray-800;

      @media (max-width: 400px) {
        font-size: 0.9rem;
      }
    }

    .profile-role {
      font-size: 0.8rem;
      color: $gray-600;

      @media (max-width: 400px) {
        font-size: 0.7rem;
      }
    }

    .profile-avatar {
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
  }

  .menu-list {
    .menu-header {
      font-size: 0.7rem;
      letter-spacing: 0.5px;
      padding: 12px 16px 4px;
      color: $gray-600;

      @media (max-width: 400px) {
        font-size: 0.65rem;
        padding: 8px 12px 4px;
      }
    }

    .menu-item {
      margin: 4px 8px;
      border-radius: 10px;
      transition: all 0.3s ease;

      @media (max-width: 400px) {
        margin: 2px 4px;
        border-radius: 8px;
      }

      &:hover {
        background: $gray-100;
        transform: translateX(5px);

        @media (max-width: 400px) {
          transform: translateX(3px);
        }
      }

      &.menu-item-active {
        background: rgba($purple-primary, 0.1);
      }

      &.menu-item-active .q-icon {
        color: $purple-primary !important;
      }

      .menu-item-text {
        @media (max-width: 400px) {
          font-size: 0.85rem;
        }
      }
    }
  }
}

.q-page-container {
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background: $gray-50;

  @media (max-width: 768px) {
    margin-left: 0 !important;
  }
}

.notification-unread {
  background: rgba(102, 126, 234, 0.05);
  border-left: 3px solid $purple-primary;
}

.notification-item {
  @media (max-width: 400px) {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .admin-drawer {
    width: 280px !important;
  }

  .q-page-container {
    margin-left: 0 !important;
  }
}

@media (max-width: 400px) {
  .admin-drawer {
    width: 260px !important;
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .q-page-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>



