<template>
  <q-page class="chat-page">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
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

    <!-- Conteúdo original (sem alterações) -->
    <template v-else>
      <!-- Header -->
      <div class="header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="router.back" />
        <div class="header-info">
          <q-avatar size="40px">
            <img
              :src="prestador?.foto || getAvatarUrl(prestador?.nome || '')"
              :alt="prestador?.nome"
            />
          </q-avatar>
          <div class="header-details">
            <div class="header-name">{{ prestador?.nome }}</div>
            <div class="header-status" :class="{ online: prestador?.disponivel }">
              {{ prestador?.disponivel ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>
        <q-btn flat round icon="more_vert" />
      </div>

      <!-- Área de mensagens -->
      <div class="messages-area" ref="messagesArea">
        <div v-for="msg in mensagens" :key="msg.id" class="message-wrapper">
          <div class="message-date">{{ formatarData(msg.created_at) }}</div>
          <div class="message-row" :class="{ 'message-row-own': msg.is_owner }">
            <div class="message-bubble" :class="{ 'message-bubble-own': msg.is_owner }">
              <div class="message-text">{{ msg.message }}</div>
              <div class="message-time">{{ formatarHora(msg.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-area q-pa-md">
        <q-input
          v-model="novaMensagem"
          outlined
          dense
          placeholder="Escreva uma mensagem..."
          class="message-input"
          bg-color="white"
          :disable="enviando"
          @keyup.enter="enviarMensagem"
        >
          <template v-slot:append>
            <q-btn
              flat
              round
              icon="send"
              color="primary"
              :disable="!novaMensagem.trim() || enviando"
              :loading="enviando"
              @click="enviarMensagem"
            />
          </template>
        </q-input>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore, type PrestadorData, type MensagemData } from 'src/stores/cliente-store';

defineOptions({
  name: 'ChatPage',
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const clienteStore = useClienteStore();

// Estados
const carregamentoInicial = ref(true);
const enviando = ref(false);
const novaMensagem = ref('');
const messagesArea = ref<HTMLElement | null>(null);
const prestador = ref<PrestadorData | null>(null);
const mensagens = ref<MensagemData[]>([]);
const prestadorId = ref<number>(0);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// Computed para o último ID
const ultimoId = computed(() => {
  return mensagens.value[mensagens.value.length - 1]?.id || 0;
});

// Gerar URL de avatar baseada no nome
const getAvatarUrl = (nome: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=40`;
};

// Formatar data
const formatarData = (data: string) => {
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
    month: '2-digit',
    year: 'numeric',
  });
};

// Formatar hora
const formatarHora = (data: string) => {
  const date = new Date(data);
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Scroll para o final da conversa
const scrollToBottom = async () => {
  await nextTick();
  setTimeout(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  }, 100);
};

// Carregar dados do prestador
const carregarPrestador = async () => {
  const id = route.params.id as string;
  if (!id) return;

  prestadorId.value = parseInt(id, 10);

  try {
    const data = await clienteStore.fetchPrestadorDetalhes(prestadorId.value);
    if (data) {
      prestador.value = data;
    }
  } catch (error) {
    console.error('Erro ao carregar prestador:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do prestador',
      position: 'top',
    });
  }
};

// Carregar mensagens usando o store
const carregarMensagens = async () => {
  if (!prestadorId.value) return;

  try {
    const data = await clienteStore.fetchMensagens(prestadorId.value);
    if (data) {
      mensagens.value = data;
      await scrollToBottom();
    }
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar mensagens',
      position: 'top',
    });
  }
};

// Enviar mensagem usando o store
const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || enviando.value || !prestadorId.value) return;

  enviando.value = true;

  try {
    const mensagem = await clienteStore.sendMessage(prestadorId.value, novaMensagem.value.trim());

    if (mensagem) {
      mensagens.value.push(mensagem);
      novaMensagem.value = '';
      await scrollToBottom();
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar mensagem',
      position: 'top',
    });
  } finally {
    enviando.value = false;
  }
};

// Marcar mensagens como lidas usando o store
const marcarComoLidas = async () => {
  if (!prestadorId.value) return;
  await clienteStore.markMessagesAsRead(prestadorId.value);
};

// Função separada para o polling (não async, chama async internamente)
const buscarNovasMensagens = () => {
  if (!prestadorId.value) return;

  void (async () => {
    try {
      const novasMensagens = await clienteStore.fetchLatestMessages(
        prestadorId.value,
        ultimoId.value,
      );

      if (novasMensagens && novasMensagens.length > 0) {
        mensagens.value = [...mensagens.value, ...novasMensagens];
        await scrollToBottom();

        if (document.hasFocus()) {
          await marcarComoLidas();
        }
      }
    } catch (error) {
      console.error('Erro ao buscar novas mensagens:', error);
    }
  })();
};

// Inicializar chat
const iniciarChat = async () => {
  carregamentoInicial.value = true;
  try {
    await carregarPrestador();
    await carregarMensagens();
    await marcarComoLidas();
  } catch (error) {
    console.error('Erro ao iniciar chat:', error);
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

// Polling para novas mensagens
const iniciarPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    buscarNovasMensagens();
  }, 5000);
};

// Parar polling
const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Marcar como lidas quando a página ganhar foco
const handleFocus = () => {
  void marcarComoLidas();
};

onMounted(() => {
  void iniciarChat();
  iniciarPolling();
  window.addEventListener('focus', handleFocus);
});

onUnmounted(() => {
  pararPolling();
  window.removeEventListener('focus', handleFocus);
});
</script>

<style scoped lang="scss">
.chat-page {
  background: #f0f2f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: #f0f2f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.skeleton-back-btn {
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
  gap: 10px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-details {
  flex: 1;
}

.skeleton-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
  padding: 10px 15px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.skeleton-left {
  margin-right: auto;
}

.skeleton-right {
  margin-left: auto;
  background: #667eea;
}

.skeleton-right .skeleton-line {
  background: rgba(255, 255, 255, 0.3);
}

.skeleton-input-area {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-20 {
  width: 20%;
}
.w-30 {
  width: 30%;
}
.w-40 {
  width: 40%;
}
.w-60 {
  width: 60%;
}

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .header-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;

    .header-details {
      .header-name {
        font-weight: 600;
        color: #333;
      }
      .header-status {
        font-size: 0.8rem;
        color: #999;

        &.online {
          color: #4caf50;
        }
      }
    }
  }
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .message-wrapper {
    margin-bottom: 20px;

    .message-date {
      text-align: center;
      font-size: 0.8rem;
      color: #999;
      margin-bottom: 10px;
    }
  }

  .message-row {
    display: flex;
    margin-bottom: 10px;

    &-own {
      justify-content: flex-end;
    }
  }

  .message-bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 20px;
    background: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    &-own {
      background: #667eea;
      color: white;

      .message-time {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .message-text {
      margin-bottom: 5px;
      word-wrap: break-word;
    }

    .message-time {
      font-size: 0.7rem;
      color: #999;
      text-align: right;
    }
  }
}

.input-area {
  background: white;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;

  .message-input {
    :deep(.q-field__control) {
      border-radius: 30px;
    }
  }
}
</style>
