<!-- pages/mobile/Chat.vue -->
<template>
  <q-page class="chat-page">
    <!-- Header -->
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="header-info">
        <q-avatar size="40px">
          <img :src="prestador?.avatar" :alt="prestador?.nome">
        </q-avatar>
        <div class="header-details">
          <div class="header-name">{{ prestador?.nome }}</div>
          <div class="header-status" :class="{ online: prestador?.online }">
            {{ prestador?.online ? 'Online' : 'Offline' }}
          </div>
        </div>
      </div>
      <q-btn flat round icon="more_vert" />
    </div>

    <!-- Área de mensagens -->
    <div class="messages-area" ref="messagesArea">
      <div v-for="msg in mensagens" :key="msg.id" class="message-wrapper">
        <div class="message-date">{{ msg.data }}</div>
        <div class="message-row" :class="{ 'message-row-own': msg.isOwn }">
          <div class="message-bubble" :class="{ 'message-bubble-own': msg.isOwn }">
            <div class="message-text">{{ msg.texto }}</div>
            <div class="message-time">{{ msg.hora }}</div>
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
        @keyup.enter="enviarMensagem"
      >
        <template v-slot:append>
          <q-btn
            flat
            round
            icon="send"
            color="primary"
            :disable="!novaMensagem.trim()"
            @click="enviarMensagem"
          />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

defineOptions({
  name: 'ChatPage'
});

const router = useRouter();
const route = useRoute();

// Tipos
interface PrestadorChat {
  id: string | number;
  nome: string;
  avatar: string;
  online: boolean;
}

interface Mensagem {
  id: number;
  texto: string;
  hora: string;
  data: string;
  isOwn: boolean;
}

// Estados
const loading = ref<boolean>(true);
const novaMensagem = ref<string>('');
const messagesArea = ref<HTMLElement | null>(null);

// Dados com tipo definido
const prestador = ref<PrestadorChat | null>(null);
const mensagens = ref<Mensagem[]>([
  {
    id: 1,
    texto: 'Olá, tudo bem?',
    hora: '14:30',
    data: 'Hoje',
    isOwn: false
  },
  {
    id: 2,
    texto: 'Tudo sim! Preciso de um eletricista para reparar um curto-circuito',
    hora: '14:31',
    data: 'Hoje',
    isOwn: true
  },
  {
    id: 3,
    texto: 'Claro! Posso passar aí hoje às 16h?',
    hora: '14:32',
    data: 'Hoje',
    isOwn: false
  },
  {
    id: 4,
    texto: 'Perfeito! Qual é o preço?',
    hora: '14:33',
    data: 'Hoje',
    isOwn: true
  },
  {
    id: 5,
    texto: 'Fica 1.500 MZN incluindo material',
    hora: '14:34',
    data: 'Hoje',
    isOwn: false
  }
]);

// Função para scroll (sem retornar Promise)
const scrollToBottom = (): void => {
  // Usando setTimeout em vez de nextTick para evitar Promise
  setTimeout(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  }, 0);
};

// Carregar dados
onMounted((): void => {
  setTimeout((): void => {
    prestador.value = {
      id: route.params.id as string,
      nome: 'João Silva',
      avatar: 'https://i.pravatar.cc/150?img=1',
      online: true
    };
    loading.value = false;
    scrollToBottom();
  }, 1000);
});

// Enviar mensagem
const enviarMensagem = (): void => {
  if (!novaMensagem.value.trim()) return;

  const agora = new Date();
  const hora = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

  mensagens.value.push({
    id: mensagens.value.length + 1,
    texto: novaMensagem.value,
    hora,
    data: 'Hoje',
    isOwn: true
  });

  novaMensagem.value = '';
  scrollToBottom();
};
</script>

<style scoped lang="scss">
.chat-page {
  background: #f0f2f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

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
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);

    &-own {
      background: #667eea;
      color: white;

      .message-time {
        color: rgba(255,255,255,0.8);
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
