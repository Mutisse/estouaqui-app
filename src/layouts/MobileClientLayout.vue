<template>
  <q-layout view="hHh lpR fFf" class="mobile-client-layout">

    <!-- ===== HEADER ===== -->
    <q-header class="ea-header" :class="{ 'ea-header--scrolled': layoutStore.scrolled }">
      <q-toolbar class="ea-toolbar">
        <q-btn flat round dense class="ea-menu-btn" @click="layoutStore.toggleDrawer()">
          <q-icon name="menu" size="22px" />
        </q-btn>

        <q-toolbar-title class="text-center">
          <div class="ea-logo" @click="goToHome">
            <span class="ea-logo__dot"></span>
            <span class="ea-logo__text">estou<strong>aqui</strong></span>
          </div>
        </q-toolbar-title>

        <!-- BOTÃO DE NOTIFICAÇÕES COM DROPDOWN -->
        <div class="notification-wrapper">
          <q-btn flat round dense class="ea-notification-btn" @click="toggleNotificationsDropdown">
            <q-icon name="notifications" size="22px" />
            <q-badge v-if="layoutStore.unreadCount > 0" color="red" floating class="notification-badge">
              {{ layoutStore.unreadCount > 99 ? '99+' : layoutStore.unreadCount }}
            </q-badge>
          </q-btn>

          <!-- DROPDOWN DE NOTIFICAÇÕES -->
          <q-menu
            v-model="notificationsMenuOpen"
            anchor="bottom right"
            self="top right"
            :offset="[0, 8]"
            class="notifications-menu"
            transition-show="scale"
            transition-hide="scale"
            @before-show="carregarNotificacoesDropdown"
          >
            <q-card class="notifications-card" style="min-width: 320px; max-width: 380px;">
              <q-card-section class="row items-center q-pb-sm">
                <div class="text-h6 text-white">Notificações</div>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup class="text-white" />
              </q-card-section>

              <!-- BOTÃO MARCAR TODAS COMO LIDAS -->
              <q-card-section v-if="layoutStore.unreadCount > 0" class="q-pt-xs q-pb-xs">
                <q-btn
                  flat
                  dense
                  label="Marcar todas como lidas"
                  @click="marcarTodasComoLidas"
                  no-caps
                  class="mark-all-btn"
                />
              </q-card-section>

              <q-separator dark />

              <q-card-section class="q-pt-md" style="max-height: 50vh; min-height: 200px; overflow-y: auto">
                <div v-if="layoutStore.carregando" class="text-center q-pa-md">
                  <q-spinner color="primary" size="32px" />
                  <div class="text-grey-6 q-mt-sm">Carregando...</div>
                </div>
                <div v-else-if="layoutStore.notificacoes.length === 0" class="text-center q-pa-md">
                  <q-icon name="notifications_none" size="40px" color="grey-6" />
                  <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
                </div>
                <div v-else>
                  <q-list separator dark>
                    <q-item
                      v-for="notif in layoutStore.notificacoes.slice(0, 5)"
                      :key="notif.id"
                      clickable
                      v-ripple
                      :class="{ 'notification-unread': !notif.lida }"
                      @click="abrirNotificacao(notif)"
                      class="notification-item"
                    >
                      <q-item-section avatar>
                        <q-icon :name="layoutStore.getNotificacaoIcone(notif)" :color="layoutStore.getNotificacaoCor(notif)" size="28px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label lines="1" class="text-weight-medium text-white">{{ notif.titulo }}</q-item-label>
                        <q-item-label caption lines="2" class="text-grey-6">{{ notif.mensagem }}</q-item-label>
                        <q-item-label caption class="text-grey-7 text-caption">{{ layoutStore.formatarDataNotificacao(notif.created_at) }}</q-item-label>
                      </q-item-section>
                      <q-item-section side v-if="!notif.lida">
                        <q-badge color="primary" rounded>Nova</q-badge>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-card-section>

              <q-separator dark />

              <q-card-actions align="center" class="q-pa-sm">
                <q-btn
                  flat
                  label="Ver todas as notificações"
                  @click="verTodasNotificacoes"
                  no-caps
                  class="view-all-btn"
                >
                  <q-icon name="arrow_forward" size="16px" class="q-ml-xs" />
                </q-btn>
              </q-card-actions>
            </q-card>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ===== DRAWER LATERAL ===== -->
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
            <img :src="userAvatar" alt="Avatar" @error="avatarError = true" />
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

          <q-item clickable v-ripple to="/mobile/inicio" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="home" class="menu-icon" /></q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/mapa" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="map" class="menu-icon" /></q-item-section>
            <q-item-section>Mapa</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/lista-prestadores" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="list" class="menu-icon" /></q-item-section>
            <q-item-section>Prestadores</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="person" size="16px" /> Minha Conta
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/perfil" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="person" class="menu-icon" /></q-item-section>
            <q-item-section>Meu Perfil</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/meus-pedidos" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="assignment" class="menu-icon" /></q-item-section>
            <q-item-section>Meus Pedidos</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mobile/favoritos" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="favorite" class="menu-icon" /></q-item-section>
            <q-item-section>Favoritos</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <!-- ⭐ SUPORTE TÉCNICO -->
          <q-item-label header class="menu-header">
            <q-icon name="support_agent" size="16px" /> Ajuda
          </q-item-label>

          <q-item clickable v-ripple to="/mobile/suporte" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="support_agent" class="menu-icon" /></q-item-section>
            <q-item-section>Suporte Técnico</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item clickable v-ripple to="/mobile/configuracoes" class="menu-item" active-class="menu-item-active" @click="layoutStore.closeDrawer()">
            <q-item-section avatar><q-icon name="settings" class="menu-icon" /></q-item-section>
            <q-item-section>Configurações</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- ===== PAGE CONTAINER ===== -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

    <!-- ===== RODAPÉ COM 5 TABS ===== -->
    <q-footer class="ea-footer-tabs">
      <q-tabs class="ea-tabs" indicator-color="transparent" active-color="white" narrow-indicator stretch>

        <!-- 1. INÍCIO -->
        <q-route-tab to="/mobile/inicio" icon="home" label="Início" class="ea-tab-item" active-class="ea-tab-active" />

        <!-- 2. MAPA -->
        <q-route-tab to="/mobile/mapa" icon="map" label="Mapa" class="ea-tab-item" active-class="ea-tab-active" />

        <!-- 3. PROPOSTAS RECEBIDAS -->
        <q-route-tab to="/mobile/propostas-recebidas" icon="request_quote" label="Propostas" class="ea-tab-item" active-class="ea-tab-active">
          <q-badge v-if="propostasCount > 0" color="red" floating class="tab-badge">
            {{ propostasCount > 99 ? '99+' : propostasCount }}
          </q-badge>
        </q-route-tab>

        <!-- 4. MEUS PEDIDOS -->
        <q-route-tab to="/mobile/meus-pedidos" icon="assignment" label="Pedidos" class="ea-tab-item" active-class="ea-tab-active" />

        <!-- 5. PERFIL -->
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
          <div v-if="layoutStore.carregando" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
            <div class="text-grey-6 q-mt-sm">Carregando notificações...</div>
          </div>
          <div v-else-if="layoutStore.notificacoes.length === 0" class="text-center q-pa-md">
            <q-icon name="notifications_none" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
          </div>
          <div v-else>
            <q-list separator>
              <q-item v-for="notif in layoutStore.notificacoes" :key="notif.id" clickable v-ripple :class="{ 'notification-unread': !notif.lida }" @click="abrirNotificacao(notif)">
                <q-item-section avatar>
                  <q-icon :name="layoutStore.getNotificacaoIcone(notif)" :color="layoutStore.getNotificacaoCor(notif)" size="32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1" class="text-weight-medium">{{ notif.titulo }}</q-item-label>
                  <q-item-label caption lines="2">{{ notif.mensagem }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ layoutStore.formatarDataNotificacao(notif.created_at) }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="!notif.lida">
                  <q-badge color="primary" rounded>Nova</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn v-if="layoutStore.unreadCount > 0" flat label="Marcar todas como lidas" @click="marcarTodasComoLidas" no-caps />
          <q-btn flat label="Ver todas" @click="verTodasNotificacoes" no-caps class="text-primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { useClienteLayoutStore, type NotificacaoData } from 'src/stores/client/cliente-layout-store';
import { usePerfilStore } from 'src/stores/client/cliente-perfil-store';
import { useClientePropostasStore } from 'src/stores/client/cliente-propostas-store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const layoutStore = useClienteLayoutStore();
const perfilStore = usePerfilStore();
const propostasStore = useClientePropostasStore();

// ===================== ESTADOS =====================
const notificationsMenuOpen = ref(false);
const avatarError = ref(false);
const propostasCount = ref(0);

// Computed para acesso fácil
const leftDrawerOpen = computed({
  get: () => layoutStore.leftDrawerOpen,
  set: (val: boolean) => {
    if (val) {
      layoutStore.openDrawer();
    } else {
      layoutStore.closeDrawer();
    }
  }
});

const notificationsDialog = computed({
  get: () => layoutStore.notificationsDialog,
  set: (val: boolean) => {
    if (val) {
      void layoutStore.abrirNotificacoes();
    } else {
      layoutStore.fecharNotificacoes();
    }
  }
});

const userName = computed(() => {
  return perfilStore.userData?.nome || authStore.user?.nome || 'Cliente';
});

const userAvatar = computed(() => {
  // 🔥 SEM FALLBACK - APENAS A FOTO DO PERFIL
  const fotoPerfil = perfilStore.userData?.foto;
  if (fotoPerfil && fotoPerfil !== 'null' && fotoPerfil !== '') {
    if (fotoPerfil.startsWith('http')) {
      return fotoPerfil;
    }
    return `http://localhost:8000/storage/${fotoPerfil}`;
  }

  const fotoAuth = authStore.user?.foto;
  if (fotoAuth && fotoAuth !== 'null' && fotoAuth !== '') {
    if (fotoAuth.startsWith('http')) {
      return fotoAuth;
    }
    return `http://localhost:8000/storage/${fotoAuth}`;
  }

  // 🔥 SE NÃO TIVER FOTO, NÃO MOSTRA NADA
  return '';
});

// ===================== FUNÇÕES =====================
function goToHome(): void {
  void router.push('/');
}

function onScroll(): void {
  layoutStore.setScrolled(window.scrollY > 40);
}

// Funções do dropdown de notificações
const toggleNotificationsDropdown = (): void => {
  notificationsMenuOpen.value = !notificationsMenuOpen.value;
};

const carregarNotificacoesDropdown = async (): Promise<void> => {
  await layoutStore.abrirNotificacoes();
};

const marcarTodasComoLidas = async (): Promise<void> => {
  try {
    const success = await layoutStore.marcarTodasNotificacoesLidas();
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Todas notificações marcadas como lidas',
        position: 'top',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top'
    });
  }
};

// Ver todas as notificações
const verTodasNotificacoes = (): void => {
  notificationsMenuOpen.value = false;
  layoutStore.fecharNotificacoes();
  void router.push('/mobile/notificacoes');
};

const abrirNotificacao = async (notificacao: NotificacaoData): Promise<void> => {
  layoutStore.fecharNotificacoes();
  notificationsMenuOpen.value = false;

  const tipo = notificacao.tipo || '';
  const dados = notificacao.data || {};

  if (!notificacao.lida) {
    await layoutStore.marcarNotificacaoLida(notificacao.id);
  }

  const pedidoId = dados.pedido_id as number | undefined;
  const avaliacaoId = dados.avaliacao_id as number | undefined;
  const prestadorId = dados.prestador_id as number | undefined;

  if (tipo.includes('pedido') && pedidoId) {
    void router.push(`/mobile/detalhes-pedido/${pedidoId}`);
    return;
  }

  if (tipo.includes('avaliacao') && avaliacaoId) {
    void router.push(`/mobile/avaliacao/${avaliacaoId}`);
    return;
  }

  if (tipo === 'mensagem' && prestadorId) {
    void router.push(`/mobile/chat/${prestadorId}`);
    return;
  }

  const rotasPorTipo: Record<string, string> = {
    pedido: '/mobile/meus-pedidos',
    proposta: '/mobile/propostas-recebidas',
    avaliacao: '/mobile/lista-prestadores',
    favorito: '/mobile/favoritos',
    promocao: '/mobile/promocoes',
    servico: '/mobile/lista-prestadores',
    sistema: '/mobile/perfil',
    transacao: '/mobile/perfil'
  };

  const rota = rotasPorTipo[tipo] || '/mobile/inicio';
  void router.push(rota);
};

// 🔥 Carregar contagem de propostas usando o store
const carregarPropostasCount = async (): Promise<void> => {
  try {
    const count = await propostasStore.contarPropostasPendentes();
    propostasCount.value = count;
  } catch (error) {
    console.error('Erro ao carregar contagem de propostas:', error);
    propostasCount.value = 0;
  }
};

// Carregar dados do perfil
const carregarPerfil = async () => {
  try {
    await perfilStore.fetchPerfil();
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
};

// Watch para quando o perfil mudar (após upload de foto)
watch(() => perfilStore.userData?.foto, (novaFoto) => {
  if (novaFoto) {
    avatarError.value = false;
  }
});

onMounted(async () => {
  await carregarPerfil();
  await carregarPropostasCount();
  void layoutStore.carregarDadosIniciais();
  layoutStore.iniciarPollingNotificacoes(30000);
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  layoutStore.pararPollingNotificacoes();
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
// HEADER
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

.notification-wrapper {
  position: relative;
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
// DRAWER
// =====================
.ea-drawer {
  background: $ink !important;

  .q-drawer__content {
    background: $ink !important;
  }
}

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
}

// =====================
// DROPDOWN DE NOTIFICAÇÕES
// =====================
.notifications-menu {
  .q-menu__content {
    background: $ink !important;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
  }
}

.notifications-card {
  background: $ink !important;
  color: #fff;

  .mark-all-btn {
    color: $accent;
    font-size: 0.7rem;

    &:hover {
      background: rgba($accent, 0.1);
    }
  }

  .view-all-btn {
    color: $accent;
    font-size: 0.75rem;
    width: 100%;

    &:hover {
      background: rgba($accent, 0.1);
    }
  }

  .q-item__label {
    color: rgba(255, 255, 255, 0.85) !important;

    &--caption {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }

  .text-grey-6 {
    color: rgba(255, 255, 255, 0.5) !important;
  }

  .text-grey-7 {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  .text-caption {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  .text-white {
    color: #ffffff !important;
  }

  .text-weight-medium {
    color: rgba(255, 255, 255, 0.9) !important;
  }
}

.notification-item {
  border-radius: 10px;
  margin: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.notification-unread {
  background: rgba($accent, 0.08);
  border-left: 3px solid $accent;
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
// FOOTER TABS (5 TABS)
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
  display: flex;
  justify-content: space-around;
}

.ea-tab-item {
  min-height: 60px;
  transition: all 0.2s ease;
  color: rgba(255,255,255,0.6);
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0 4px;

  :deep(.q-tab__icon) {
    font-size: 20px;
    margin-bottom: 2px;
    color: rgba(255,255,255,0.5);
  }

  :deep(.q-tab__label) {
    font-size: 10px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    white-space: nowrap;
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

// 🔥 BADGE DAS PROPOSTAS NO FOOTER
.tab-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 50%;
}

// =====================
// NOTIFICAÇÕES MODAL
// =====================
.notifications-dialog :deep(.q-dialog__inner) {
  margin-top: 56px;
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
// RESPONSIVIDADE
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

@media (max-width: 400px) {
  .ea-tab-item {
    :deep(.q-tab__icon) {
      font-size: 18px;
    }
    :deep(.q-tab__label) {
      font-size: 9px;
    }
  }
}

@media (max-width: 360px) {
  .ea-logo__text {
    font-size: 0.85rem;
  }

  .notifications-card {
    min-width: 300px !important;
  }
}
</style>
