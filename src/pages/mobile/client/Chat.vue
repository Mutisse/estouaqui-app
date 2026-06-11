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
        <div v-for="i in 5" :key="i" class="skeleton-message">
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

      <!-- Header -->
      <div class="chat-header">
        <button class="back-btn" @click="() => void router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div class="chat-header__info">
          <div class="chat-avatar">
            <img :src="store.prestadorAvatar" :alt="store.prestadorNome" />
            <div class="status-dot" :class="{ online: store.prestadorOnline }"></div>
          </div>
          <div class="chat-header__details">
            <div class="chat-name">{{ store.prestadorNome }}</div>
            <div class="chat-status" :class="{ online: store.prestadorOnline }">
              {{ store.prestadorOnline ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>

        <button class="menu-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>

      <!-- Área de mensagens -->
      <div class="messages-area" ref="messagesArea">
        <div v-for="msg in store.mensagens" :key="msg.id" class="message-group">
          <div class="message-date">{{ store.formatarData(msg.created_at) }}</div>
          <div class="message-row" :class="{ own: msg.is_owner }">
            <div class="message-bubble" :class="{ own: msg.is_owner }">
              <div class="message-text">{{ msg.mensagem }}</div>
              <div class="message-time">{{ store.formatarHora(msg.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-area">
        <div class="input-container">
          <input
            v-model="novaMensagem"
            type="text"
            placeholder="Escreva uma mensagem..."
            class="message-input"
            :disabled="store.enviando"
            @keyup.enter="enviarMensagem"
          />
          <button
            class="send-btn"
            :disabled="!novaMensagem.trim() || store.enviando"
            @click="enviarMensagem"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useChatStore } from 'src/stores/client/cliente-chat-store';

defineOptions({ name: 'ChatPage' });

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const store = useChatStore();

const novaMensagem = ref('');
const messagesArea = ref<HTMLElement | null>(null);
const prestadorId = ref<number>(0);

const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  setTimeout(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  }, 100);
};

const enviarMensagem = async (): Promise<void> => {
  if (!novaMensagem.value.trim() || store.enviando || !prestadorId.value) return;

  const success = await store.sendMessage(prestadorId.value, novaMensagem.value.trim());

  if (success) {
    novaMensagem.value = '';
    await scrollToBottom();
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro || 'Erro ao enviar mensagem',
      position: 'top'
    });
  }
};

const marcarComoLidas = async (): Promise<void> => {
  if (!prestadorId.value) return;
  await store.markMessagesAsRead(prestadorId.value);
};

const handleFocus = (): void => {
  void marcarComoLidas();
};

const iniciarChat = async (): Promise<void> => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    return;
  }

  prestadorId.value = Number(id);

  await store.carregarChat(prestadorId.value);
  await scrollToBottom();
  await marcarComoLidas();
  store.iniciarPolling(prestadorId.value, 5000);
};

onMounted(() => {
  void iniciarChat();
  window.addEventListener('focus', handleFocus);
});

onUnmounted(() => {
  store.pararPolling();
  window.removeEventListener('focus', handleFocus);
  store.limparStore();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
// CHAT HEADER
// =====================
.chat-header {
  background: $white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;

  .back-btn, .menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;

    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.chat-avatar {
  position: relative;

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  .status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
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
}

.chat-name {
  font-size: 1rem;
  font-weight: 600;
  color: $dark;
  margin-bottom: 2px;
}

.chat-status {
  font-size: 0.7rem;
  color: $gray;

  &.online {
    color: $success;
  }
}

// =====================
// MESSAGES AREA
// =====================
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-date {
  text-align: center;
  font-size: 0.7rem;
  color: $gray;
  margin-bottom: 4px;
}

.message-row {
  display: flex;

  &.own {
    justify-content: flex-end;
  }
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 20px;
  background: $white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

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
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.65rem;
  text-align: right;
  color: $gray;
}

// =====================
// INPUT AREA
// =====================
.input-area {
  background: $white;
  border-top: 1px solid $border;
  padding: 12px 16px;
  flex-shrink: 0;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $gray-light;
  border-radius: 30px;
  padding: 4px 4px 4px 18px;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 0;
  font-size: 0.9rem;
  outline: none;

  &::placeholder {
    color: $gray;
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

  &:hover:not(:disabled) {
    background: lighten($accent, 6%);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// =====================
// SCROLLBAR
// =====================
.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: $border;
}

.messages-area::-webkit-scrollbar-thumb {
  background: $accent;
  border-radius: 4px;
}
</style>
