// src/stores/prestador/prestador-chat-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface MensagemChat {
  id: number;
  text: string;
  time: string;
  isUser: boolean;
  lida?: boolean;
  created_at?: string;
}

export interface ConversaData {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  cliente_foto?: string;
  ultima_mensagem?: string;
  ultima_mensagem_data?: string;
  nao_lidas: number;
  // ✅ Dados do prestador
  prestador_id?: number;
  prestador_nome?: string;
  prestador_foto?: string;
  prestador_profissao?: string;
}

export interface PrestadorDados {
  id: number;
  nome: string;
  foto: string | null;
  profissao: string;
  media_avaliacao: number;
  total_avaliacoes: number;
}

// Interface para mensagem da API
interface ApiMensagem {
  id: number;
  mensagem: string;
  is_user: boolean;
  lida: boolean;
  created_at: string;
  sender_id?: number;
}

// Interface para resposta da API de conversas
interface ApiConversa {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  cliente_foto?: string;
  ultima_mensagem?: string;
  ultima_mensagem_data?: string;
  nao_lidas: number;
  prestador_id?: number;
  prestador_nome?: string;
  prestador_foto?: string;
  prestador_profissao?: string;
}

// Interface para resposta de envio
interface ApiEnvioResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    mensagem: string;
    created_at: string;
    is_user: boolean;
  };
}

// Interface para resposta de dados do prestador
interface ApiPrestadorResponse {
  success: boolean;
  data: PrestadorDados;
}

// ===================== STORE =====================

export const usePrestadorChatStore = defineStore('prestadorChat', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);
  const chatDialogVisible = ref(false);
  const chatView = ref<'lista' | 'conversa'>('lista');
  const digitando = ref(false);

  const mensagensChat = ref<MensagemChat[]>([]);
  const conversas = ref<ConversaData[]>([]);
  const conversaAtualId = ref<number | null>(null);
  const conversaAtualNome = ref<string>('');
  const conversaAtualFoto = ref<string>('');

  // ✅ Dados do prestador logado
  const prestadorDados = ref<PrestadorDados | null>(null);

  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Getters
  const totalNaoLidas = computed(() => {
    return conversas.value.reduce((sum, c) => sum + (c.nao_lidas || 0), 0);
  });

  const hasConversas = computed(() => conversas.value.length > 0);
  const estaNaLista = computed(() => chatView.value === 'lista');
  const estaNaConversa = computed(() => chatView.value === 'conversa');

  // ✅ Getter para nome do prestador
  const prestadorNome = computed(() => {
    return prestadorDados.value?.nome || authStore.user?.nome || 'Prestador';
  });

  // ✅ Getter para foto do prestador
  const prestadorFoto = computed(() => {
    return prestadorDados.value?.foto || authStore.user?.foto || null;
  });

  // ✅ Getter para profissão do prestador
  const prestadorProfissao = computed(() => {
    return prestadorDados.value?.profissao || 'Prestador de Serviços';
  });

  // Funções auxiliares
  const formatarHoraAtual = (): string => {
    const agora = new Date();
    return `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
  };

  const getAvatarIniciais = (nome: string): string => {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase();
  };

  // Actions
  const toggleChatDialog = (): void => {
    chatDialogVisible.value = !chatDialogVisible.value;
    if (chatDialogVisible.value) {
      chatView.value = 'lista';
    }
  };

  const abrirChat = (): void => {
    chatDialogVisible.value = true;
    chatView.value = 'lista';
    void Promise.all([fetchConversas(), fetchPrestadorDados()]);
  };

  const fecharChat = (): void => {
    chatDialogVisible.value = false;
    chatView.value = 'lista';
    conversaAtualId.value = null;
    mensagensChat.value = [];
  };

  const voltarParaLista = (): void => {
    chatView.value = 'lista';
    conversaAtualId.value = null;
    mensagensChat.value = [];
    void fetchConversas();
  };

  const abrirConversa = async (chatId: number, clienteNome: string, clienteFoto?: string): Promise<void> => {
    conversaAtualId.value = chatId;
    conversaAtualNome.value = clienteNome;
    conversaAtualFoto.value = clienteFoto || '';
    chatView.value = 'conversa';
    await fetchMensagens(chatId);
  };

  // ✅ Buscar dados do prestador logado
  const fetchPrestadorDados = async (): Promise<void> => {
    try {
      const response = await api.get<ApiPrestadorResponse>('/prestador/chat/dados');
      if (response.data?.success && response.data.data) {
        prestadorDados.value = response.data.data;

        // Atualizar authStore se necessário
        if (authStore.user && authStore.user.nome !== response.data.data.nome) {
          authStore.user.nome = response.data.data.nome;
          authStore.user.foto = response.data.data.foto;
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados do prestador:', err);
    }
  };

  const fetchConversas = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: ApiConversa[] }>('/prestador/chat/conversas');

      if (response.data?.success && response.data.data) {
        conversas.value = response.data.data;

        // ✅ Se houver dados do prestador na conversa, atualizar
        const primeiraConversa = response.data.data[0];
        if (primeiraConversa?.prestador_nome && !prestadorDados.value) {
          prestadorDados.value = {
            id: primeiraConversa.prestador_id || 0,
            nome: primeiraConversa.prestador_nome,
            foto: primeiraConversa.prestador_foto || null,
            profissao: primeiraConversa.prestador_profissao || 'Prestador de Serviços',
            media_avaliacao: 0,
            total_avaliacoes: 0,
          };
        }
      }
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar conversas';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMensagens = async (chatId: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: ApiMensagem[] }>(`/prestador/chat/mensagens/${chatId}`);

      if (response.data?.success && response.data.data) {
        mensagensChat.value = response.data.data.map((msg: ApiMensagem) => ({
          id: msg.id,
          text: msg.mensagem,
          time: formatarHoraAtual(),
          isUser: msg.is_user === true || msg.sender_id === authStore.user?.id,
          lida: msg.lida,
          created_at: msg.created_at,
        }));

        await marcarMensagensComoLidas(chatId);
      }
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar mensagens';
    } finally {
      isLoading.value = false;
    }
  };

  const enviarMensagem = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    if (!conversaAtualId.value) return false;

    isSending.value = true;

    const novaMsg: MensagemChat = {
      id: Date.now(),
      text: text,
      time: formatarHoraAtual(),
      isUser: true,
    };
    mensagensChat.value.push(novaMsg);

    try {
      const response = await api.post<ApiEnvioResponse>('/prestador/chat/enviar', {
        mensagem: text,
        chat_id: conversaAtualId.value,
      });

      if (response.data?.success) {
        if (response.data.data) {
          const index = mensagensChat.value.findIndex(m => m.id === novaMsg.id);
          if (index !== -1) {
            mensagensChat.value[index] = {
              id: response.data.data.id,
              text: novaMsg.text,
              time: novaMsg.time,
              isUser: true,
              created_at: response.data.data.created_at,
            };
          }
        }
        void fetchConversas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      mensagensChat.value = mensagensChat.value.filter(m => m.id !== novaMsg.id);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const iniciarDigitacao = (): void => {
    digitando.value = true;
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      digitando.value = false;
    }, 2000);
  };

  const marcarMensagensComoLidas = async (chatId: number): Promise<boolean> => {
    try {
      const response = await api.put<{ success: boolean }>(`/prestador/chat/marcar-lidas/${chatId}`);
      if (response.data?.success) {
        const conversa = conversas.value.find(c => c.id === chatId);
        if (conversa) {
          conversa.nao_lidas = 0;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err);
      return false;
    }
  };

  const iniciarPolling = (intervaloMs: number = 15000): void => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
      if (document.hasFocus() && authStore.isAuthenticated && chatDialogVisible.value) {
        void fetchConversas();
        if (chatView.value === 'conversa' && conversaAtualId.value) {
          void fetchMensagens(conversaAtualId.value);
        }
      }
    }, intervaloMs);
  };

  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const resetarChat = (): void => {
    mensagensChat.value = [];
    conversaAtualId.value = null;
    conversaAtualNome.value = '';
    conversaAtualFoto.value = '';
    digitando.value = false;
    chatView.value = 'lista';
  };

  const limparStore = (): void => {
    mensagensChat.value = [];
    conversas.value = [];
    conversaAtualId.value = null;
    conversaAtualNome.value = '';
    conversaAtualFoto.value = '';
    prestadorDados.value = null;
    digitando.value = false;
    chatDialogVisible.value = false;
    chatView.value = 'lista';
    error.value = null;
    pararPolling();
  };

  return {
    // Estados
    isLoading,
    isSending,
    error,
    mensagensChat,
    conversas,
    conversaAtualId,
    conversaAtualNome,
    conversaAtualFoto,
    prestadorDados,
    digitando,
    chatDialogVisible,
    chatView,

    // Getters
    totalNaoLidas,
    hasConversas,
    estaNaLista,
    estaNaConversa,
    prestadorNome,
    prestadorFoto,
    prestadorProfissao,

    // Actions
    toggleChatDialog,
    abrirChat,
    fecharChat,
    voltarParaLista,
    abrirConversa,
    fetchConversas,
    fetchMensagens,
    fetchPrestadorDados,
    enviarMensagem,
    iniciarDigitacao,
    marcarMensagensComoLidas,
    iniciarPolling,
    pararPolling,
    resetarChat,
    limparStore,
    formatarHoraAtual,
    getAvatarIniciais,
  };
});

export default usePrestadorChatStore;
