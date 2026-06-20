// stores/client/cliente-chat-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface MensagemData {
  id: number;
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  mensagem: string;
  is_owner: boolean;
  lida: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MensagemApiResponse {
  id: number;
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  mensagem: string;
  lida: boolean | number;
  is_owner?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PrestadorChatInfo {
  id: number;
  nome: string;
  foto: string | null;
  disponivel: boolean;
  verificado?: boolean;
  media_avaliacao?: number;
  last_seen?: string;
}

export interface ClienteChatInfo {
  id: number;
  nome: string;
  foto: string | null;
  email?: string;
  telefone?: string;
}

export interface ChatData {
  id: number;
  prestador_id: number;
  cliente_id: number;
  ultima_mensagem?: string;
  ultima_mensagem_data?: string;
  prestador?: PrestadorChatInfo;
  cliente?: ClienteChatInfo;
  mensagens_nao_lidas?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useChatStore = defineStore('clienteChat', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const enviando = ref(false);
  const chats = ref<ChatData[]>([]);
  const mensagens = ref<MensagemData[]>([]);
  const prestadorAtual = ref<PrestadorChatInfo | null>(null);
  const erro = ref<string | null>(null);
  const ultimoIdMensagem = ref(0);
  const temMaisMensagens = ref(true);
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // ===================== GETTERS =====================

  const hasNewMessages = computed(() => {
    return chats.value.some((chat) => (chat.mensagens_nao_lidas || 0) > 0);
  });

  const totalNaoLidas = computed(() => {
    return chats.value.reduce((total, chat) => total + (chat.mensagens_nao_lidas || 0), 0);
  });

  const ultimaMensagem = computed(() => {
    if (mensagens.value.length === 0) return null;
    return mensagens.value[mensagens.value.length - 1];
  });

  const prestadorNome = computed(() => prestadorAtual.value?.nome || 'Carregando...');
  const prestadorAvatar = computed(() => {
    const nome = prestadorAtual.value?.nome || '';
    const foto = prestadorAtual.value?.foto;
    if (foto) return foto;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=5B4BF5&color=fff&size=44`;
  });
  const prestadorOnline = computed(() => prestadorAtual.value?.disponivel || false);

  // ===================== FUNÇÕES AUXILIARES =====================

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse;
      return data?.message || data?.error || error.message || 'Erro na requisição';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

  const getAvatarUrl = (nome: string, foto?: string | null): string => {
    if (foto) return foto;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=5B4BF5&color=fff&size=44`;
  };

  const getInitials = (nome: string): string => {
    if (!nome || nome.trim() === '') return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length === 1 && partes[0]) {
      return partes[0].charAt(0).toUpperCase();
    }
    const primeiraLetra = partes[0]?.charAt(0) || '';
    const ultimaLetra = partes[partes.length - 1]?.charAt(0) || '';
    if (!primeiraLetra && !ultimaLetra) return 'U';
    if (!primeiraLetra) return ultimaLetra.toUpperCase();
    if (!ultimaLetra) return primeiraLetra.toUpperCase();
    return (primeiraLetra + ultimaLetra).toUpperCase();
  };

  const formatarData = (data: string): string => {
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
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatarHora = (data: string): string => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentUserId = (): number => {
    try {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        const user = JSON.parse(authUser);
        return user.id || 0;
      }
    } catch (e) {
      console.error('Erro ao obter usuário atual:', e);
    }
    return 0;
  };

  // ===================== AÇÕES - CHATS =====================

  const fetchChats = async (): Promise<ChatData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/cliente/chat/chats');

      if (response.data?.success && response.data.data) {
        chats.value = response.data.data;
        return chats.value;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const fetchPrestadorInfo = async (prestadorId: number): Promise<PrestadorChatInfo | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/prestadores/${prestadorId}`);

      if (response.data?.success && response.data.data) {
        prestadorAtual.value = response.data.data;
        return prestadorAtual.value;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  // ===================== AÇÕES - MENSAGENS =====================

  const normalizarMensagem = (msg: MensagemApiResponse): MensagemData => {
    const currentUserId = getCurrentUserId();
    return {
      id: msg.id,
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      mensagem: msg.mensagem,
      is_owner: msg.is_owner || msg.sender_id === currentUserId,
      lida: typeof msg.lida === 'number' ? msg.lida === 1 : msg.lida === true,
      created_at: msg.created_at,
      updated_at: msg.updated_at!,
    };
  };

  const fetchMensagens = async (
    prestadorId: number,
    limit: number = 50,
  ): Promise<MensagemData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/cliente/chat/mensagens/${prestadorId}`, {
        params: { limit },
      });

      if (response.data?.success && response.data.data) {
        mensagens.value = response.data.data.map(normalizarMensagem);

        const ultimaMsg = mensagens.value[mensagens.value.length - 1];
        if (ultimaMsg && ultimaMsg.id) {
          ultimoIdMensagem.value = ultimaMsg.id;
        }

        // Verificar se tem mais mensagens
        temMaisMensagens.value = response.data.data.length >= limit;

        return mensagens.value;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  /**
   * 🔥 Carregar mais mensagens antigas (paginação)
   */
  const carregarMaisMensagens = async (
    prestadorId: number,
    limit: number = 20
  ): Promise<MensagemData[]> => {
    if (!prestadorId || mensagens.value.length === 0) {
      temMaisMensagens.value = false;
      return [];
    }

    carregando.value = true;

    try {
      // Pega o ID da mensagem mais antiga
      const mensagemMaisAntiga = mensagens.value[0];
      const beforeId = mensagemMaisAntiga?.id || 0;

      if (!beforeId) {
        temMaisMensagens.value = false;
        return [];
      }

      const response = await api.get(`/cliente/chat/mensagens/${prestadorId}`, {
        params: {
          limit,
          before_id: beforeId,
        },
      });

      if (response.data?.success && response.data.data) {
        const novasMensagens = response.data.data.map(normalizarMensagem);

        if (novasMensagens.length > 0) {
          // Adiciona no início da lista
          mensagens.value = [...novasMensagens, ...mensagens.value];
          temMaisMensagens.value = novasMensagens.length >= limit;
        } else {
          temMaisMensagens.value = false;
        }

        return novasMensagens;
      }

      temMaisMensagens.value = false;
      return [];
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const fetchLatestMessages = async (
    prestadorId: number,
    lastId: number,
  ): Promise<MensagemData[]> => {
    if (!prestadorId) return [];

    try {
      const response = await api.get(`/cliente/chat/mensagens/${prestadorId}/novas`, {
        params: { ultimo_id: lastId },
      });

      if (response.data?.success && response.data.data) {
        return response.data.data.map(normalizarMensagem);
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar novas mensagens:', error);
      return [];
    }
  };

  const sendMessage = async (
    prestadorId: number,
    message: string,
  ): Promise<MensagemData | null> => {
    if (!message.trim()) return null;

    enviando.value = true;
    erro.value = null;

    try {
      const response = await api.post(`/cliente/chat/enviar/${prestadorId}`, { message });

      if (response.data?.success && response.data.data) {
        const novaMensagem = normalizarMensagem({
          ...response.data.data,
          is_owner: true,
        });
        mensagens.value.push(novaMensagem);
        if (novaMensagem.id) {
          ultimoIdMensagem.value = novaMensagem.id;
        }
        return novaMensagem;
      }

      return null;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      enviando.value = false;
    }
  };

  const markMessagesAsRead = async (prestadorId: number): Promise<boolean> => {
    if (!prestadorId) return false;

    try {
      const response = await api.post(`/cliente/chat/marcar-lidas/${prestadorId}`);

      if (response.data?.success) {
        mensagens.value.forEach((msg) => {
          if (!msg.is_owner && !msg.lida) {
            msg.lida = true;
          }
        });
        const chat = chats.value.find(c => c.prestador_id === prestadorId);
        if (chat) {
          chat.mensagens_nao_lidas = 0;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      return false;
    }
  };

  const fetchNaoLidas = async (): Promise<number> => {
    try {
      const response = await api.get('/cliente/chat/nao-lidas');

      if (response.data?.success) {
        return response.data.total || 0;
      }

      return 0;
    } catch (error) {
      console.error('Erro ao buscar mensagens não lidas:', error);
      return 0;
    }
  };

  // ===================== AÇÕES - POLLING =====================

  const buscarNovasMensagens = async (prestadorId: number): Promise<void> => {
    if (!prestadorId) return;

    try {
      const novasMensagens = await fetchLatestMessages(prestadorId, ultimoIdMensagem.value);

      if (novasMensagens && novasMensagens.length > 0) {
        const idsExistentes = new Set(mensagens.value.map(m => m.id));
        const mensagensNovas = novasMensagens.filter(m => !idsExistentes.has(m.id));

        if (mensagensNovas.length > 0) {
          mensagens.value = [...mensagens.value, ...mensagensNovas];
          const ultimaNovaMsg = mensagensNovas[mensagensNovas.length - 1];
          if (ultimaNovaMsg && ultimaNovaMsg.id) {
            ultimoIdMensagem.value = ultimaNovaMsg.id;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar novas mensagens:', error);
    }
  };

  const iniciarPolling = (prestadorId: number, intervaloMs: number = 5000): void => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
      void buscarNovasMensagens(prestadorId);
    }, intervaloMs);
  };

  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // ===================== AÇÕES - UTILITÁRIOS =====================

  const limparStore = (): void => {
    chats.value = [];
    mensagens.value = [];
    prestadorAtual.value = null;
    erro.value = null;
    ultimoIdMensagem.value = 0;
    temMaisMensagens.value = true;
    carregando.value = false;
    carregamentoInicial.value = true;
    enviando.value = false;
    pararPolling();
  };

  const carregarChat = async (prestadorId: number): Promise<void> => {
    carregamentoInicial.value = true;
    temMaisMensagens.value = true;
    try {
      await Promise.all([fetchPrestadorInfo(prestadorId), fetchMensagens(prestadorId)]);
      await fetchChats();
      await markMessagesAsRead(prestadorId);
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
      erro.value = getErrorMessage(error);
    } finally {
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  return {
    // Estados
    carregando,
    carregamentoInicial,
    enviando,
    chats,
    mensagens,
    prestadorAtual,
    erro,
    ultimoIdMensagem,
    temMaisMensagens,

    // Getters
    hasNewMessages,
    totalNaoLidas,
    ultimaMensagem,
    prestadorNome,
    prestadorAvatar,
    prestadorOnline,

    // Utilitários
    getAvatarUrl,
    getInitials,
    formatarData,
    formatarHora,
    getErrorMessage,

    // Ações - Chats
    fetchChats,
    fetchPrestadorInfo,

    // Ações - Mensagens
    fetchMensagens,
    carregarMaisMensagens,
    fetchLatestMessages,
    sendMessage,
    markMessagesAsRead,
    fetchNaoLidas,

    // Ações - Polling
    buscarNovasMensagens,
    iniciarPolling,
    pararPolling,

    // Ações - Utilitários
    limparStore,
    carregarChat,
  };
});

export default useChatStore;
