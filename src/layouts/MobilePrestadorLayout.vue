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
          <q-badge
            v-if="prestadorStore.unreadCount > 0"
            color="red"
            floating
            class="notification-badge"
          >
            {{ prestadorStore.unreadCount > 99 ? '99+' : prestadorStore.unreadCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ===== DRAWER LATERAL ===== -->
    <q-drawer v-model="leftDrawerOpen" side="left" :width="280" overlay elevated class="ea-drawer">
      <q-scroll-area class="fit">
        <div class="ea-drawer__header">
          <q-avatar size="70px" class="ea-drawer__avatar">
            <img :src="userAvatar" alt="Avatar" />
          </q-avatar>
          <div class="ea-drawer__user-info">
            <div class="user-name">{{ userNome }}</div>
            <div class="user-type">{{ userProfissao }}</div>
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

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/dashboard"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar
              ><q-icon name="space_dashboard" class="menu-icon"
            /></q-item-section>
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
            <q-item-section avatar><q-icon name="assignment" class="menu-icon" /></q-item-section>
            <q-item-section>Pedidos Recebidos</q-item-section>
            <q-item-section side>
              <q-badge v-if="prestadorStore.solicitacoesPendentes > 0" color="red">{{
                prestadorStore.solicitacoesPendentes
              }}</q-badge>
            </q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="work" size="16px" /> Gestão de Serviços
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/servicos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar><q-icon name="construction" class="menu-icon" /></q-item-section>
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
            <q-item-section avatar><q-icon name="schedule" class="menu-icon" /></q-item-section>
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
            <q-item-section avatar><q-icon name="history" class="menu-icon" /></q-item-section>
            <q-item-section>Histórico</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="payments" size="16px" /> Financeiro
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/ganhos"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar
              ><q-icon name="account_balance_wallet" class="menu-icon"
            /></q-item-section>
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
            <q-item-section avatar><q-icon name="payments" class="menu-icon" /></q-item-section>
            <q-item-section>Realizar Saque</q-item-section>
          </q-item>

          <q-separator spaced class="menu-separator" />

          <q-item-label header class="menu-header">
            <q-icon name="settings" size="16px" /> Configurações
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/mobile/prestador/perfil"
            class="menu-item"
            active-class="menu-item-active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar><q-icon name="person" class="menu-icon" /></q-item-section>
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

    <!-- ===== RODAPÉ COM TABS ===== -->
    <q-footer class="ea-footer-tabs">
      <q-tabs
        class="ea-tabs"
        indicator-color="transparent"
        active-color="white"
        narrow-indicator
        stretch
      >
        <q-route-tab
          to="/mobile/prestador/dashboard"
          icon="space_dashboard"
          label="Dashboard"
          class="ea-tab-item"
          active-class="ea-tab-active"
        />
        <q-route-tab
          to="/mobile/prestador/pedidos-disponiveis"
          icon="search"
          label="Procurar"
          class="ea-tab-item"
          active-class="ea-tab-active"
        />
        <q-route-tab
          to="/mobile/prestador/pedidos"
          icon="assignment"
          label="Pedidos"
          class="ea-tab-item"
          active-class="ea-tab-active"
        >
          <q-badge v-if="prestadorStore.solicitacoesPendentes > 0" color="red" floating>{{
            prestadorStore.solicitacoesPendentes
          }}</q-badge>
        </q-route-tab>
        <q-route-tab
          to="/mobile/prestador/servicos"
          icon="construction"
          label="Serviços"
          class="ea-tab-item"
          active-class="ea-tab-active"
        />
        <q-route-tab
          to="/mobile/prestador/perfil"
          icon="person"
          label="Perfil"
          class="ea-tab-item"
          active-class="ea-tab-active"
        />
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

        <q-card-section v-if="prestadorStore.unreadCount > 0" class="q-pt-xs q-pb-xs">
          <q-btn
            flat
            dense
            label="Marcar todas como lidas"
            @click="handleMarcarTodasComoLidas"
            no-caps
            class="mark-all-btn"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md" style="max-height: 60vh; overflow-y: auto">
          <div v-if="loadingNotificacoes" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
            <div class="text-grey-6 q-mt-sm">Carregando notificações...</div>
          </div>
          <div v-else-if="prestadorStore.notificacoes.length === 0" class="text-center q-pa-md">
            <q-icon name="notifications_none" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">Nenhuma notificação</div>
          </div>
          <div v-else>
            <q-list separator>
              <q-item
                v-for="notif in prestadorStore.notificacoes.slice(0, 5)"
                :key="notif.id"
                clickable
                v-ripple
                :class="{ 'notification-unread': !notif.lida }"
                @click="handleMarcaNotificacaoLida(notif.id)"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="getNotificacaoIcone(notif.tipo)"
                    :color="getNotificacaoCor(notif.tipo)"
                    size="32px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1" class="text-weight-medium">{{
                    notif.titulo
                  }}</q-item-label>
                  <q-item-label caption lines="2">{{ notif.mensagem }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{
                    formatarData(notif.created_at)
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="!notif.lida">
                  <q-badge color="primary" rounded>Nova</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-sm">
          <q-btn
            flat
            label="Ver todas as notificações"
            @click="verTodasNotificacoes"
            no-caps
            class="view-all-btn"
          >
            <q-icon name="arrow_forward" size="14px" class="q-ml-xs" />
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ===== BOTÃO FLUTUANTE DE CHAT (FAB) ===== -->
    <q-btn round class="chat-fab-btn" @click="chatStore.abrirChat">
      <q-icon name="chat" size="24px" />
      <q-badge v-if="chatStore.totalNaoLidas > 0" color="red" floating class="chat-badge">
        {{ chatStore.totalNaoLidas > 99 ? '99+' : chatStore.totalNaoLidas }}
      </q-badge>
    </q-btn>

    <!-- ===== JANELA FLUTUANTE DE CHAT ===== -->
    <q-dialog
      v-model="chatDialogVisible"
      position="bottom"
      class="chat-dialog"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="chat-card">
        <!-- Cabeçalho -->
        <!-- Cabeçalho do Chat -->
<q-card-section class="chat-header row items-center">
  <q-btn
    v-if="chatStore.estaNaConversa"
    flat
    round
    dense
    icon="arrow_back"
    class="chat-back-btn"
    @click="chatStore.voltarParaLista"
  />
  <q-avatar size="36px" class="q-mr-sm">
    <!-- ✅ Mostrar foto do prestador quando está na lista -->
    <img
      v-if="!chatStore.estaNaConversa && perfilStore.foto"
      :src="perfilStore.foto"
    />
    <img
      v-else-if="chatStore.estaNaConversa && chatStore.conversaAtualFoto"
      :src="chatStore.conversaAtualFoto"
    />
    <div
      v-else-if="chatStore.estaNaConversa"
      class="avatar-placeholder"
      :style="{ background: getAvatarColor(chatStore.conversaAtualNome) }"
    >
      {{ chatStore.getAvatarIniciais(chatStore.conversaAtualNome) }}
    </div>
    <div
      v-else
      class="avatar-placeholder"
      :style="{ background: getAvatarColor(userNome) }"
    >
      {{ chatStore.getAvatarIniciais(userNome) }}
    </div>
  </q-avatar>
  <div class="chat-header-info">
    <div class="chat-header-title">
      {{ chatStore.estaNaConversa ? chatStore.conversaAtualNome : userNome }}
    </div>
    <div class="chat-header-status">
      <span class="status-dot"></span>
      {{ chatStore.estaNaConversa ? 'Online - Responde rápido' : userProfissao }}
    </div>
  </div>
  <q-space />
  <q-btn flat round dense icon="close" @click="chatStore.fecharChat" />
</q-card-section>aaa

        <q-separator />

        <!-- LISTA DE CONVERSAS -->
        <q-card-section v-if="chatStore.estaNaLista" class="chat-conversas">
          <div v-if="chatStore.isLoading && chatStore.conversas.length === 0" class="chat-loading">
            <q-spinner color="primary" size="32px" />
            <p>Carregando conversas...</p>
          </div>

          <div v-else-if="chatStore.conversas.length === 0" class="chat-empty">
            <q-icon name="chat" size="48px" color="grey-7" />
            <p>Nenhuma conversa ainda</p>
            <span>Quando clientes entrarem em contato, aparecerão aqui</span>
          </div>

          <div v-else class="conversas-list">
            <div
              v-for="conversa in chatStore.conversas"
              :key="conversa.id"
              class="conversa-item"
              @click="
                chatStore.abrirConversa(conversa.id, conversa.cliente_nome, conversa.cliente_foto)
              "
            >
              <div class="conversa-avatar">
                <img v-if="conversa.cliente_foto" :src="conversa.cliente_foto" />
                <div
                  v-else
                  class="avatar-placeholder-small"
                  :style="{ background: getAvatarColor(conversa.cliente_nome) }"
                >
                  {{ chatStore.getAvatarIniciais(conversa.cliente_nome) }}
                </div>
              </div>
              <div class="conversa-info">
                <div class="conversa-nome">{{ conversa.cliente_nome }}</div>
                <div class="conversa-mensagem">
                  {{ conversa.ultima_mensagem || 'Clique para conversar' }}
                </div>
              </div>
              <div class="conversa-right">
                <div class="conversa-data">
                  {{ formatarHoraCurta(conversa.ultima_mensagem_data) }}
                </div>
                <div v-if="conversa.nao_lidas > 0" class="conversa-badge">
                  {{ conversa.nao_lidas }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- MENSAGENS DA CONVERSA -->
        <q-card-section v-else class="chat-messages">
          <div v-if="chatStore.mensagensChat.length === 0" class="chat-empty">
            <q-icon name="chat" size="48px" color="grey-7" />
            <p>Nenhuma mensagem ainda</p>
            <span>Envie uma mensagem para começar</span>
          </div>
          <div v-else>
            <div
              v-for="msg in chatStore.mensagensChat"
              :key="msg.id"
              class="chat-message"
              :class="{ 'chat-message-user': msg.isUser, 'chat-message-support': !msg.isUser }"
            >
              <div class="chat-bubble">
                <div class="chat-text">{{ msg.text }}</div>
                <div class="chat-time">{{ msg.time }}</div>
              </div>
            </div>
            <div v-if="chatStore.digitando" class="chat-typing">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Input de mensagem -->
        <q-card-section v-if="chatStore.estaNaConversa" class="chat-input-section">
          <div class="row items-center no-wrap">
            <q-input
              v-model="novaMensagem"
              placeholder="Digite sua mensagem..."
              dense
              outlined
              class="col chat-input"
              @keyup.enter="enviarMensagem"
            />
            <q-btn
              round
              dense
              color="primary"
              icon="send"
              class="q-ml-sm"
              :disable="!novaMensagem.trim() || chatStore.isSending"
              @click="enviarMensagem"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { usePrestadorLayoutStore } from 'src/stores/prestador/prestador-layout-store';
import { usePrestadorChatStore } from 'src/stores/prestador/prestador-chat-store';
import { usePrestadorPerfilStore } from 'src/stores/prestador/prestador-perfil-store';

defineOptions({ name: 'MobilePrestadorLayout' });

const router = useRouter();
const authStore = useAuthStore();
const prestadorStore = usePrestadorLayoutStore();
const chatStore = usePrestadorChatStore();
const perfilStore = usePrestadorPerfilStore();
const $q = useQuasar();

// Estados
const isLoading = ref(true);
const leftDrawerOpen = ref(false);
const notificationsDialog = ref(false);
const loadingNotificacoes = ref(false);
const scrolled = ref(false);
const novaMensagem = ref('');
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// Computed - Dados do perfil do prestador (usando perfilStore)
const userNome = computed(() => {
  return perfilStore.perfil?.nome || authStore.user?.nome || 'Prestador';
});

const userAvatar = computed(() => {
  // ✅ Usar o getter foto do perfilStore (já tem fallback)
  const foto = perfilStore.foto;
  if (foto) return foto;

  return (
    'https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=' +
    encodeURIComponent(userNome.value)
  );
});

const userProfissao = computed(() => {
  return perfilStore.perfil?.profissao || 'Prestador de Serviços';
});

const userRating = computed(() => {
  return perfilStore.perfil?.media_avaliacao || 0;
});

const userTotalAvaliacoes = computed(() => {
  return perfilStore.perfil?.total_avaliacoes || 0;
});

const chatDialogVisible = computed({
  get: () => chatStore.chatDialogVisible,
  set: (val) => (val ? chatStore.abrirChat() : chatStore.fecharChat()),
});

// Funções
function goToHome() {
  void router.push('/');
}

function onScroll() {
  scrolled.value = window.scrollY > 40;
}

// Funções do chat
const getAvatarColor = (nome: string): string => {
  const cores = [
    '#5B4BF5',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
  ];
  const idx = Math.abs(nome.length) % cores.length;
  return cores[idx] as string;
};

const formatarHoraCurta = (dataString?: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffDias === 1) {
    return 'Ontem';
  } else if (diffDias < 7) {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayIndex = date.getDay();
    return dias[dayIndex] as string;
  } else {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
};

const enviarMensagem = async (): Promise<void> => {
  if (!novaMensagem.value.trim()) return;
  const text = novaMensagem.value;
  novaMensagem.value = '';
  await chatStore.enviarMensagem(text);
};

// Funções de notificação
const getNotificacaoIcone = (tipo?: string): string => {
  if (tipo === 'pedido') return 'assignment';
  if (tipo === 'avaliacao') return 'star';
  if (tipo === 'promocao') return 'local_offer';
  if (tipo === 'prestador') return 'handyman';
  if (tipo === 'sistema') return 'info';
  return 'notifications';
};

const getNotificacaoCor = (tipo?: string): string => {
  if (tipo === 'pedido') return 'primary';
  if (tipo === 'avaliacao') return 'yellow-8';
  if (tipo === 'promocao') return 'orange';
  if (tipo === 'prestador') return 'purple';
  if (tipo === 'sistema') return 'grey-7';
  return 'primary';
};

const formatarData = (dataString: string): string => {
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

const carregarNotificacoes = async (): Promise<void> => {
  if (!authStore.isPrestador) return;
  loadingNotificacoes.value = true;
  try {
    await prestadorStore.fetchNotificacoes();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  } finally {
    loadingNotificacoes.value = false;
  }
};

const handleMarcaNotificacaoLida = async (id: number): Promise<void> => {
  try {
    await prestadorStore.marcarNotificacaoLida(id);
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
  }
};

const handleMarcarTodasComoLidas = async (): Promise<void> => {
  try {
    await prestadorStore.marcarTodasNotificacoesLidas();
    $q.notify({
      type: 'positive',
      message: 'Todas notificações marcadas como lidas',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top',
    });
  }
};

const verTodasNotificacoes = (): void => {
  notificationsDialog.value = false;
  void router.push('/mobile/prestador/notificacoes');
};

const openNotifications = (): void => {
  notificationsDialog.value = true;
  void carregarNotificacoes();
};

const iniciarPolling = (): void => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (document.hasFocus() && authStore.isAuthenticated && authStore.isPrestador) {
      void prestadorStore.fetchNotificacoes();
      void prestadorStore.fetchSolicitacoesPendentes();
      void prestadorStore.fetchStats();
    }
  }, 30000);
};

const pararPolling = (): void => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const carregarDadosIniciais = async (): Promise<void> => {
  isLoading.value = true;
  try {
    if (!authStore.isAuthenticated) authStore.initialize();
    if (authStore.isAuthenticated && authStore.isPrestador) {
      // ✅ Carregar perfil PRIMEIRO (para ter a foto)
      await perfilStore.fetchPerfilCompleto();

      await Promise.all([
        prestadorStore.fetchNotificacoes(),
        prestadorStore.fetchSolicitacoesPendentes(),
        prestadorStore.fetchStats(),
        chatStore.fetchConversas(),
      ]);
    }
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 800);
  }
};

onMounted(async () => {
  await carregarDadosIniciais();
  if (authStore.isAuthenticated && authStore.isPrestador) {
    iniciarPolling();
    chatStore.iniciarPolling(15000);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  pararPolling();
  chatStore.pararPolling();
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS DO SISTEMA (PADRÃO)
// =====================
$ink: #0a0a0f;
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.08);
$accent-mid: rgba(91, 75, 245, 0.15);
$gold: #f59e0b;
$green: #10b981;
$surface: #ffffff;
$bg: #f4f4f8;
$line: rgba(0, 0, 0, 0.06);
$muted: #9898a8;
$radius: 16px;
$radius-sm: 10px;
$radius-xs: 8px;

// ==========================================
// SKELETON LOADING STYLES
// ==========================================
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-layout {
  background: $bg;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.skeleton-header {
  background: $ink;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}
.skeleton-menu-btn,
.skeleton-notification-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.skeleton-logo {
  width: 100px;
  height: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}
.skeleton-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.skeleton-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.skeleton-stat-card {
  flex: 1;
  background: $surface;
  border-radius: $radius;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.skeleton-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
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
.w-30 {
  width: 30%;
}
.w-40 {
  width: 40%;
}
.w-50 {
  width: 50%;
}
.w-60 {
  width: 60%;
}
.w-70 {
  width: 70%;
}
.w-80 {
  width: 80%;
}
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-list-item {
  background: $surface;
  border-radius: $radius;
  padding: 16px;
  display: flex;
  gap: 12px;
}
.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-list-info {
  flex: 1;
}
.skeleton-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $surface;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  border-top: 1px solid $line;
}
.skeleton-tab {
  width: 50px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

// ==========================================
// LAYOUT REAL STYLES
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
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    background 0.35s ease,
    box-shadow 0.35s ease;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
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
.ea-menu-btn,
.ea-notification-btn {
  color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transition: all 0.2s;
  padding: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
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
    font-size: 1rem;
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

.notification-badge {
  animation: pulse 2s infinite;
  top: 4px;
  right: 4px;
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

// ==========================================
// DRAWER
// ==========================================
.ea-drawer {
  background: $ink !important;
  .q-drawer__content {
    background: $ink !important;
  }
  .q-list,
  .q-item,
  .q-scroll-area,
  .fit {
    background: $ink !important;
  }
}

.ea-drawer__header {
  padding: 24px 16px;
  background: $accent-mid;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .ea-drawer__avatar {
    border: 2px solid $accent;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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
      color: rgba(255, 255, 255, 0.6);
    }
    .user-rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 4px;
      .rating-count {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.ea-drawer__menu {
  padding: 16px;
  background: $ink !important;

  .menu-header {
    color: rgba(255, 255, 255, 0.4);
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
    background: rgba(255, 255, 255, 0.08);
    margin: 12px 0;
  }

  .menu-item {
    border-radius: $radius-sm;
    margin: 4px 0;
    min-height: 44px;
    color: rgba(255, 255, 255, 0.7);
    background: transparent !important;

    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #fff;
    }
    .menu-icon {
      color: rgba(255, 255, 255, 0.5);
      font-size: 20px;
    }
  }

  .menu-item-active {
    background: $accent-mid !important;
    .menu-icon {
      color: $accent !important;
    }
    .q-item__section {
      color: #fff;
      font-weight: 500;
    }
  }
}

.page-container {
  padding-bottom: 70px;
  flex: 1;
  margin-top: 56px;
}

// ==========================================
// FOOTER TABS
// ==========================================
.ea-footer-tabs {
  background: $ink !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.ea-tabs {
  background: $ink;
  color: rgba(255, 255, 255, 0.6);
  height: 60px;
}

.ea-tab-item {
  min-height: 60px;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.6);
  :deep(.q-tab__icon) {
    font-size: 22px;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.5);
  }
  :deep(.q-tab__label) {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
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

// ==========================================
// NOTIFICAÇÕES
// ==========================================
.notifications-dialog :deep(.q-dialog__inner) {
  margin-top: 56px;
}
.notifications-card {
  background: $ink;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  .mark-all-btn {
    color: $accent;
    font-size: 0.7rem;
  }
  .view-all-btn {
    color: $accent;
    font-size: 0.75rem;
    width: 100%;
  }
}
.notification-unread {
  background: rgba($accent, 0.1);
  border-left: 3px solid $accent;
}

// ==========================================
// CHAT FAB BUTTON
// ==========================================
.chat-fab-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: $accent;
  color: white;
  box-shadow: 0 4px 15px rgba(91, 75, 245, 0.4);
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(91, 75, 245, 0.5);
  }

  .q-icon {
    font-size: 24px;
  }
}

.chat-badge {
  top: -4px;
  right: -4px;
  animation: pulse 2s infinite;
}

// ==========================================
// JANELA DE CHAT
// ==========================================
.chat-dialog {
  :deep(.q-dialog__inner) {
    justify-content: flex-end;
    align-items: flex-end;
    margin-bottom: 80px;
  }
}

.chat-card {
  background: $ink;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  height: 70vh;
  max-height: 550px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: $accent-mid;
  padding: 16px;

  .chat-header-info {
    .chat-header-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
    }
    .chat-header-status {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      gap: 6px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $green;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
    }
  }
}

.chat-back-btn {
  margin-left: -8px;
  margin-right: 4px;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

// ==========================================
// LISTA DE CONVERSAS
// ==========================================
.chat-conversas {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.conversas-list {
  display: flex;
  flex-direction: column;
}

.conversa-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .conversa-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .conversa-info {
    flex: 1;
    min-width: 0;

    .conversa-nome {
      font-weight: 600;
      font-size: 0.9rem;
      color: #fff;
      margin-bottom: 2px;
    }

    .conversa-mensagem {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .conversa-right {
    text-align: right;
    flex-shrink: 0;

    .conversa-data {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
    }

    .conversa-badge {
      background: $accent;
      color: white;
      font-size: 0.6rem;
      font-weight: 600;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
    }
  }
}

.chat-loading {
  text-align: center;
  padding: 40px 20px;

  p {
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
  }
}

// ==========================================
// MENSAGENS DO CHAT
// ==========================================
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: $ink;
}

.chat-empty {
  text-align: center;
  padding: 40px 20px;

  .q-icon {
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    font-size: 0.9rem;
    font-weight: 500;
    color: #fff;
    margin: 0 0 4px;
  }

  span {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }
}

.chat-message {
  display: flex;
  margin-bottom: 12px;

  &.chat-message-user {
    justify-content: flex-end;
  }

  &.chat-message-support {
    justify-content: flex-start;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 18px;
    position: relative;

    .chat-text {
      font-size: 0.85rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .chat-time {
      font-size: 0.6rem;
      margin-top: 4px;
      opacity: 0.6;
    }
  }

  &.chat-message-user .chat-bubble {
    background: $accent;
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.chat-message-support .chat-bubble {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-bottom-left-radius: 4px;
  }
}

.chat-typing {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  width: fit-content;
  margin-bottom: 12px;

  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

// ==========================================
// INPUT DO CHAT
// ==========================================
.chat-input-section {
  padding: 12px 16px;
  background: $ink;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .chat-input {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 25px;

      &::before {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    :deep(.q-field__native) {
      color: white;
      padding-left: 16px;
    }
  }
}

// ==========================================
// SAFE AREA
// ==========================================
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .ea-footer-tabs {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .page-container {
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }
  .chat-fab-btn {
    bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

// ==========================================
// RESPONSIVIDADE
// ==========================================
@media (max-width: 600px) {
  .ea-drawer {
    background: $ink !important;
  }
  .chat-fab-btn {
    bottom: 70px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
  .chat-card {
    width: 100% !important;
    height: 65vh !important;
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
