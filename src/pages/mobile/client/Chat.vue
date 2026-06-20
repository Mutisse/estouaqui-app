<template>
  <div class="chat-page">

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="store.carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-header-info">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-header-details">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-20"></div>
          </div>
        </div>
        <div class="skeleton-menu-btn"></div>
      </div>
      <div class="skeleton-messages-area">
        <div v-for="i in 8" :key="i" class="skeleton-message">
          <div class="skeleton-bubble" :class="i % 2 === 0 ? 'skeleton-right' : 'skeleton-left'">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-30"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-input-area">
        <div class="skeleton-input"></div>
        <div class="skeleton-send-btn"></div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- ===== HEADER ===== -->
      <div class="chat-header">
        <button class="back-btn" @click="voltar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div class="chat-header__info" @click="irParaPerfil">
          <div class="avatar-container">
            <img
              v-if="avatarCarregou && store.prestadorAvatar && !store.prestadorAvatar.includes('ui-avatars')"
              :src="store.prestadorAvatar"
              :alt="store.prestadorNome"
              @error="aoErroAvatar"
            />
            <div v-else class="avatar-fallback" :style="{ backgroundColor: corAvatar }">
              {{ store.getInitials(store.prestadorNome) }}
            </div>
            <div class="status-dot" :class="{ online: store.prestadorOnline }"></div>
          </div>
          <div class="chat-header__details">
            <div class="chat-name">{{ store.prestadorNome || 'Prestador' }}</div>
            <div class="chat-status" :class="{ online: store.prestadorOnline }">
              <span class="status-text">
                {{ store.prestadorOnline ? '🟢 Online' : '⚪ Offline' }}
              </span>
            </div>
          </div>
        </div>

        <button class="menu-btn" @click="abrirMenu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <!-- ===== MENSAGENS ===== -->
      <div
        class="messages-area"
        ref="messagesArea"
        @scroll="onScroll"
      >
        <!-- Loading mais antigas -->
        <div v-if="carregandoMais" class="loading-more">
          <div class="spinner"></div>
          <span>Carregando mensagens anteriores...</span>
        </div>

        <!-- Fim do histórico -->
        <div v-else-if="!store.temMaisMensagens && store.mensagens.length > 0" class="end-of-history">
          <span>📜 Início da conversa</span>
        </div>

        <!-- Mensagens -->
        <template v-for="(msg, index) in store.mensagens" :key="msg.id">
          <!-- Separador de data -->
          <div v-if="deveMostrarData(msg, index)" class="message-date-divider">
            <span>{{ formatarDataCompleta(msg.created_at) }}</span>
          </div>

          <!-- Mensagem -->
          <div class="message-row" :class="{ own: msg.is_owner }">
            <div class="message-wrapper">
              <div class="message-bubble" :class="{ own: msg.is_owner }">
                <div class="message-text">{{ msg.mensagem }}</div>
                <div class="message-time">{{ store.formatarHora(msg.created_at) }}</div>
              </div>
              <!-- Status de lida (apenas mensagens próprias) -->
              <div v-if="msg.is_owner" class="message-status">
                <span v-if="msg.lida" class="read">✓✓ Lida</span>
                <span v-else class="sent">✓ Enviada</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Indicador de novas mensagens -->
        <div v-if="temMensagemNova" class="new-message-indicator" @click="scrollToBottom">
          <span>⬇ {{ qtdMensagensNovas }} nova{{ qtdMensagensNovas > 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- ===== INPUT ===== -->
      <div class="input-area">
        <div class="input-container">
          <button class="attach-btn" @click="abrirAnexos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <input
            ref="inputMensagem"
            v-model="novaMensagem"
            type="text"
            placeholder="Escreva uma mensagem..."
            class="message-input"
            :disabled="store.enviando"
            @keyup.enter="enviarMensagem"
            @focus="aoFocarInput"
          />

          <button
            class="send-btn"
            :disabled="!novaMensagem.trim() || store.enviando"
            @click="enviarMensagem"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useChatStore, type MensagemData } from 'src/stores/client/cliente-chat-store';

defineOptions({ name: 'ChatPage' });

// =====================
// COMPOSABLES
// =====================
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const store = useChatStore();

// =====================
// REFS
// =====================
const novaMensagem = ref('');
const messagesArea = ref<HTMLElement | null>(null);
const inputMensagem = ref<HTMLInputElement | null>(null);
const prestadorId = ref<number>(0);
const avatarCarregou = ref(true);

// =====================
// INFINITE SCROLL
// =====================
const CARREGAR_POR_VEZ = 20;
const LIMIAR_SCROLL = 150;
const carregandoMais = ref(false);

// =====================
// NOVAS MENSAGENS
// =====================
const qtdMensagensNovas = ref(0);
const temMensagemNova = computed(() => qtdMensagensNovas.value > 0);

// =====================
// COR DO AVATAR
// =====================
const corAvatar = computed(() => {
  const nome = store.prestadorNome || 'Usuário';
  const cores = [
    '#5B4BF5', '#10B981', '#F59E0B', '#EF4444',
    '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6',
    '#F97316', '#6366F1', '#06B6D4', '#84CC16',
  ];

  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cores[Math.abs(hash) % cores.length];
});

// =====================
// MÉTODOS DO AVATAR
// =====================
const aoErroAvatar = (): void => {
  avatarCarregou.value = false;
};

// =====================
// FORMATAÇÃO DE DATA
// =====================
const formatarDataCompleta = (data: string): string => {
  if (!data) return '';
  const date = new Date(data);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (date.toDateString() === hoje.toDateString()) {
    return 'Hoje';
  } else if (date.toDateString() === ontem.toDateString()) {
    return 'Ontem';
  }
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const deveMostrarData = (msg: MensagemData, index: number): boolean => {
  if (index === 0) return true;
  const msgAnterior = store.mensagens[index - 1];
  if (!msgAnterior) return true;

  const dataAtual = new Date(msg.created_at);
  const dataAnterior = new Date(msgAnterior.created_at);

  return dataAtual.toDateString() !== dataAnterior.toDateString();
};

// =====================
// SCROLL
// =====================
const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  setTimeout(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
      qtdMensagensNovas.value = 0;
    }
  }, 100);
};

const isAtBottom = (): boolean => {
  if (!messagesArea.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = messagesArea.value;
  return scrollHeight - scrollTop - clientHeight < 50;
};

// =====================
// CARREGAR MAIS MENSAGENS
// =====================
const carregarMaisMensagens = async (): Promise<void> => {
  if (carregandoMais.value || !store.temMaisMensagens || !prestadorId.value) return;

  const scrollHeightAntes = messagesArea.value?.scrollHeight || 0;
  const scrollTopAntes = messagesArea.value?.scrollTop || 0;

  carregandoMais.value = true;

  try {
    const mensagensAntigas = await store.carregarMaisMensagens(
      prestadorId.value,
      CARREGAR_POR_VEZ
    );

    await nextTick();
    if (messagesArea.value && mensagensAntigas.length > 0) {
      const novoScrollHeight = messagesArea.value.scrollHeight;
      const diferenca = novoScrollHeight - scrollHeightAntes;
      messagesArea.value.scrollTop = scrollTopAntes + diferenca;
    }
  } catch (error) {
    console.error('Erro ao carregar mais mensagens:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar mensagens antigas',
      position: 'top'
    });
  } finally {
    carregandoMais.value = false;
  }
};

// =====================
// EVENTO DE SCROLL
// =====================
const onScroll = (): void => {
  if (!messagesArea.value) return;

  const { scrollTop } = messagesArea.value;
  const estaNoFundo = isAtBottom();

  if (estaNoFundo && qtdMensagensNovas.value > 0) {
    qtdMensagensNovas.value = 0;
  }

  if (scrollTop < LIMIAR_SCROLL && !carregandoMais.value && store.temMaisMensagens) {
    void carregarMaisMensagens();
  }
};

// =====================
// ENVIAR MENSAGEM
// =====================
const enviarMensagem = async (): Promise<void> => {
  const mensagem = novaMensagem.value.trim();
  if (!mensagem || store.enviando || !prestadorId.value) return;

  const estavaNoFundo = isAtBottom();

  const success = await store.sendMessage(prestadorId.value, mensagem);

  if (success) {
    novaMensagem.value = '';

    if (estavaNoFundo) {
      await scrollToBottom();
    } else {
      qtdMensagensNovas.value += 1;
    }

    inputMensagem.value?.focus();
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro || 'Erro ao enviar mensagem',
      position: 'top'
    });
  }
};

// =====================
// MARCAR COMO LIDAS
// =====================
const marcarComoLidas = async (): Promise<void> => {
  if (!prestadorId.value) return;
  await store.markMessagesAsRead(prestadorId.value);
};

const aoFocarInput = (): void => {
  void marcarComoLidas();
};

// =====================
// NAVEGAÇÃO
// =====================
const voltar = (): void => {
  router.back();
};

/**
 * 🔥 IR PARA PERFIL DO PRESTADOR
 * Usando a rota correta: /mobile/perfil-prestador/:id
 */
const irParaPerfil = (): void => {
  if (prestadorId.value) {
    void router.push(`/mobile/perfil-prestador/${prestadorId.value}`);
  }
};

// =====================
// MENU DE OPÇÕES
// =====================
interface MenuItem {
  label: string;
  icon: string;
  id: string;
  color?: string;
}

const abrirMenu = (): void => {
  const items: MenuItem[] = [
    { label: 'Ver perfil', icon: 'person', id: 'perfil' },
    { label: 'Bloquear', icon: 'block', id: 'bloquear', color: 'negative' },
    { label: 'Denunciar', icon: 'report', id: 'denunciar', color: 'negative' },
  ];

  const dialog = $q.dialog({
    title: 'Opções',
    message: 'Selecione uma opção:',
    options: {
      type: 'radio',
      model: '',
      items: items.map(item => ({
        ...item,
        value: item.id,
      })),
    },
    ok: {
      label: 'Selecionar',
      color: 'primary',
    },
    cancel: {
      label: 'Fechar',
      color: 'grey',
    },
  });

  dialog.onOk((selectedValue: string) => {
    if (selectedValue === 'perfil') {
      irParaPerfil();
    } else if (selectedValue === 'bloquear') {
      $q.notify({
        type: 'warning',
        message: 'Funcionalidade em desenvolvimento',
        position: 'top'
      });
    } else if (selectedValue === 'denunciar') {
      $q.notify({
        type: 'warning',
        message: 'Funcionalidade em desenvolvimento',
        position: 'top'
      });
    }
  });
};

const abrirAnexos = (): void => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidade em desenvolvimento',
    position: 'top'
  });
};

// =====================
// WATCHERS
// =====================
watch(
  () => store.mensagens.length,
  (novo, antigo) => {
    if (novo > antigo) {
      if (!isAtBottom() && !store.enviando) {
        qtdMensagensNovas.value += novo - antigo;
      } else {
        void scrollToBottom();
      }
    }
  }
);

// =====================
// CICLO DE VIDA
// =====================
const iniciarChat = async (): Promise<void> => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    $q.notify({
      type: 'warning',
      message: 'ID do prestador não encontrado',
      position: 'top'
    });
    router.back();
    return;
  }

  prestadorId.value = Number(id);
  qtdMensagensNovas.value = 0;

  await store.carregarChat(prestadorId.value);
  await scrollToBottom();
  await marcarComoLidas();
  store.iniciarPolling(prestadorId.value, 5000);
};

onMounted(() => {
  void iniciarChat();
  window.addEventListener('focus', () => void marcarComoLidas());
});

onUnmounted(() => {
  store.pararPolling();
  store.limparStore();
});
</script>

<style scoped lang="scss">
// =====================
// VARIÁVEIS
// =====================
$accent: #5B4BF5;
$accent-dark: #4A3DD8;
$accent-light: rgba(91, 75, 245, 0.12);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: $gray-light;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  background: $white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
}

.skeleton-back-btn, .skeleton-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-details {
  flex: 1;
}

.skeleton-messages-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.skeleton-message {
  margin-bottom: 20px;
}

.skeleton-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  background: $white;
  box-shadow: $shadow;
}

.skeleton-left {
  margin-right: auto;
}

.skeleton-right {
  margin-left: auto;
  background: $accent;
}

.skeleton-right .skeleton-line {
  background: rgba(255, 255, 255, 0.3);
}

.skeleton-input-area {
  background: $white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid $border;
  flex-shrink: 0;
}

.skeleton-input {
  flex: 1;
  height: 44px;
  border-radius: 30px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-20 { width: 20%; }
.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-60 { width: 60%; }

// =====================
// CHAT PAGE
// =====================
.chat-page {
  background: $gray-light;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// =====================
// HEADER
// =====================
.chat-header {
  background: $white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
  box-shadow: $shadow;

  .back-btn, .menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: $accent-light;
      color: $accent;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 12px;
    transition: background 0.2s;

    &:hover {
      background: $accent-light;
    }
  }
}

// =====================
// AVATAR
// =====================
.avatar-container {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: $white;
    text-transform: uppercase;
    user-select: none;
  }

  .status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid $white;
    background: $gray;

    &.online {
      background: $success;
    }
  }
}

.chat-header__details {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 1rem;
  font-weight: 600;
  color: $dark;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status {
  .status-text {
    font-size: 0.7rem;
    color: $gray;
    font-weight: 500;
  }

  &.online .status-text {
    color: $success;
  }
}

// =====================
// MESSAGES AREA
// =====================
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  background: $gray-light;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  color: $gray;
  font-size: 0.8rem;

  .spinner {
    width: 20px;
    height: 20px;
    border: 2.5px solid $border;
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.end-of-history {
  text-align: center;
  padding: 20px;
  color: $gray;
  font-size: 0.75rem;
  opacity: 0.6;
}

.message-date-divider {
  text-align: center;
  padding: 16px 0 12px;

  span {
    background: $gray-light;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 0.7rem;
    color: $gray;
    font-weight: 500;
    background: $white;
    box-shadow: $shadow;
  }
}

.message-row {
  display: flex;
  margin-bottom: 4px;

  &.own {
    justify-content: flex-end;
  }
}

.message-wrapper {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  background: $white;
  box-shadow: $shadow;
  word-wrap: break-word;

  &.own {
    background: $accent;
    color: $white;
    border-bottom-right-radius: 4px;

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &:not(.own) {
    border-bottom-left-radius: 4px;
  }
}

.message-text {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 4px;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.6rem;
  text-align: right;
  color: $gray;
  letter-spacing: 0.3px;
}

.message-status {
  font-size: 0.6rem;
  text-align: right;
  padding-right: 4px;
  color: $gray;

  .read {
    color: $success;
  }

  .sent {
    color: $gray;
  }
}

.new-message-indicator {
  position: sticky;
  bottom: 0;
  align-self: center;
  background: $accent;
  color: $white;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba($accent, 0.35);
  transition: all 0.2s;
  animation: slideUp 0.3s ease-out;
  margin-top: 8px;
  z-index: 10;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba($accent, 0.45);
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// =====================
// INPUT AREA
// =====================
.input-area {
  background: $white;
  border-top: 1px solid $border;
  padding: 12px 16px;
  flex-shrink: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background: $gray-light;
  border-radius: 30px;
  padding: 4px 4px 4px 16px;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:focus-within {
    border-color: $accent;
    background: $white;
    box-shadow: 0 0 0 4px rgba($accent, 0.1);
  }
}

.attach-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: $gray;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: $accent-light;
    color: $accent;
  }
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 0;
  font-size: 0.9rem;
  outline: none;
  min-height: 44px;
  max-height: 120px;
  line-height: 1.5;

  &::placeholder {
    color: $gray;
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $accent;
  border: none;
  cursor: pointer;
  color: $white;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: $accent-dark;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// =====================
// SCROLLBAR
// =====================
.messages-area::-webkit-scrollbar {
  width: 5px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: $border;
  border-radius: 10px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: $gray;
}
</style>
