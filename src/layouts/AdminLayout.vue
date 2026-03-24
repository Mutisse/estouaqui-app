<template>
  <q-layout view="hHh LpR fFf" class="admin-layout">
    <!-- Header -->
    <q-header elevated class="admin-header text-white">
      <q-toolbar class="q-px-md">
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
          <span class="admin-badge q-ml-md">Admin</span>
        </q-toolbar-title>

        <!-- Info do admin -->
        <div class="row items-center q-gutter-sm">
          <q-chip dense class="bg-white text-primary" icon="notifications">
            {{ notificacoesNaoLidas }}
          </q-chip>

          <q-btn flat round dense icon="notifications" class="notification-btn">
            <q-menu>
              <q-list style="min-width: 300px" class="notification-list">
                <q-item-label header class="bg-grey-2 text-weight-bold">Notificações</q-item-label>
                <q-item v-for="notif in notificacoes" :key="notif.id" clickable v-close-popup>
                  <q-item-section avatar>
                    <q-avatar :color="notif.lida ? 'grey-3' : 'primary'" text-color="white">
                      <q-icon :name="notif.icone" size="18px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ notif.titulo }}</q-item-label>
                    <q-item-label caption>{{ notif.descricao }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="notificacoes.length === 0" disabled>
                  <q-item-section class="text-center text-grey-6 q-py-md">
                    Sem notificações
                  </q-item-section>
                </q-item>
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
                <q-item clickable v-close-popup to="/admin/configuracoes">
                  <q-item-section avatar>
                    <q-icon name="settings" size="18px" />
                  </q-item-section>
                  <q-item-section>Configurações</q-item-section>
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

    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      :show-if-above="true"
      :width="280"
      :breakpoint="0"
      bordered
      class="admin-drawer"
    >
      <q-scroll-area class="fit">
        <!-- Perfil resumido no drawer -->
        <div class="drawer-profile q-pa-md">
          <div class="row items-center">
            <q-avatar size="56px" class="profile-avatar">
              <img :src="userAvatar" :alt="userNome" />
            </q-avatar>
            <div class="q-ml-md">
              <div class="profile-name">{{ userNome }}</div>
              <div class="profile-role">Administrador</div>
            </div>
          </div>
        </div>

        <q-list padding class="menu-list">
          <!-- PRINCIPAL -->
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
              <q-icon name="dashboard" :color="isActive('/admin/dashboard') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- GESTÃO -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            GESTÃO
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/utilizadores"
            :active="isActive('/admin/utilizadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="people" :color="isActive('/admin/utilizadores') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Utilizadores</q-item-section>
            <q-item-section side>
              <q-badge color="positive" rounded>12</q-badge>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/prestadores"
            :active="isActive('/admin/prestadores')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="handyman" :color="isActive('/admin/prestadores') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Prestadores</q-item-section>
            <q-item-section side>
              <q-badge color="warning" rounded>5</q-badge>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/categorias"
            :active="isActive('/admin/categorias')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="category" :color="isActive('/admin/categorias') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Categorias</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/servicos"
            :active="isActive('/admin/servicos')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="assignment" :color="isActive('/admin/servicos') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Serviços</q-item-section>
            <q-item-section side>
              <q-badge color="info" rounded>23</q-badge>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- RELATÓRIOS -->
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
              <q-icon name="bar_chart" :color="isActive('/admin/estatisticas') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Estatísticas</q-item-section>
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
              <q-icon name="assessment" :color="isActive('/admin/relatorios') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Relatórios</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/financeiro"
            :active="isActive('/admin/financeiro')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="payments" :color="isActive('/admin/financeiro') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Financeiro</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- SISTEMA -->
          <q-item-label header class="text-grey-7 text-uppercase menu-header">
            SISTEMA
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/admin/configuracoes"
            :active="isActive('/admin/configuracoes')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="settings" :color="isActive('/admin/configuracoes') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Configurações</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/logs"
            :active="isActive('/admin/logs')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="security" :color="isActive('/admin/logs') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Logs</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- PERFIL -->
          <q-item
            clickable
            v-ripple
            to="/admin/perfil"
            :active="isActive('/admin/perfil')"
            active-class="menu-item-active"
            class="menu-item"
          >
            <q-item-section avatar>
              <q-icon name="person" :color="isActive('/admin/perfil') ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>Meu Perfil</q-item-section>
          </q-item>
          <q-separator class="q-my-sm" />
        </q-list>
      </q-scroll-area>

     
    </q-drawer>

    <!-- ✅ PAGE CONTAINER - CORRIGIDO -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'AdminLayout',
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

// Computed properties para o usuário
const userNome = computed(() => authStore.user?.nome || 'Administrador');
const userAvatar = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(userNome.value)}&background=667eea&color=fff&size=56`);

// Estados
const leftDrawerOpen = ref(true);
const globalLoading = ref(false);

// Notificações
interface Notificacao {
  id: number;
  icone: string;
  titulo: string;
  descricao: string;
  lida: boolean;
}

const notificacoes = ref<Notificacao[]>([
  { id: 1, icone: 'person_add', titulo: 'Novo prestador', descricao: 'João Silva aguarda verificação', lida: false },
  { id: 2, icone: 'assignment', titulo: 'Serviço concluído', descricao: 'Serviço #123 foi concluído', lida: false },
  { id: 3, icone: 'star', titulo: 'Nova avaliação', descricao: 'Cliente avaliou serviço com 5 estrelas', lida: true }
]);

const notificacoesNaoLidas = computed(() => notificacoes.value.filter(n => !n.lida).length);

// Verificar se rota está ativa
const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/');
};

// Logout
const logout = (): void => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(() => {
    globalLoading.value = true;
    void authStore.logout().then(() => {
      setTimeout(() => {
        globalLoading.value = false;
        void router.push('/auth/login');
        $q.notify({
          type: 'positive',
          message: 'Logout realizado com sucesso',
          position: 'top',
          timeout: 2000
        });
      }, 500);
    }).catch(() => {
      globalLoading.value = false;
      $q.notify({
        type: 'negative',
        message: 'Erro ao realizar logout',
        position: 'top',
        timeout: 2000
      });
    });
  });
};

// Verificar permissões
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    void router.push('/admin/login');
  }
});
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

  .menu-btn { transition: all 0.3s ease; &:hover { background: rgba(255,255,255,0.1); } }
  .logo-wrapper { font-size: 1.3rem; .text-primary { color: $purple-primary !important; } }
  .admin-badge { background: rgba($purple-primary, 0.2); padding: 4px 8px; border-radius: 20px; font-size: 0.7rem; }
  .notification-btn { transition: all 0.3s ease; &:hover { background: rgba(255,255,255,0.1); } }
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
    .profile-name { font-weight: 600; color: $gray-800; }
    .profile-role { font-size: 0.8rem; color: $gray-600; }
    .profile-avatar { border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  }

  .menu-list {
    .menu-header { font-size: 0.7rem; letter-spacing: 0.5px; padding: 12px 16px 4px; color: $gray-600; }
    .menu-item {
      margin: 4px 8px;
      border-radius: 10px;
      transition: all 0.3s ease;
      &:hover { background: $gray-100; transform: translateX(5px); }
      &.menu-item-active { background: rgba($purple-primary, 0.1); }
      &.menu-item-active .q-icon { color: $purple-primary !important; }
    }
  }

  .drawer-footer { border-top: 1px solid $gray-300; text-align: center; position: absolute; bottom: 0; left: 0; right: 0; }
}

.q-page-container {
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  background: $gray-50;
}

@media (max-width: 599px) {
  .admin-header .logo-wrapper { font-size: 1.1rem; }
  .admin-header .admin-badge { display: none; }
  .admin-drawer { width: 280px !important; }
  .q-page-container { margin-left: 0 !important; }
}
</style>
