// src/stores/cliente/cliente-comunicacao-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { useClienteCacheStore, CLIENTE_CACHE_TTL } from './cliente-cache-store';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';

export interface ConversaData {
  id: number;
  nome: string;
  foto: string | null;
  tipo: string;
  disponivel: boolean;
  ultima_mensagem?: { texto: string; data: string; is_owner: boolean };
  nao_lidas: number;
}

export interface MensagemData {
  id: number;
  message: string;
  is_owner: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificacaoData {
  id: number;
  type: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  data?: {
    pedido_id?: number;
    avaliacao_id?: number;
    conversa_id?: number;
    prestador_id?: number;
    cliente_nome?: string;
    valor?: string;
    pedido_numero?: string;
    [key: string]: unknown;
  };
}

export interface FavoritoPrestador {
  id: number;
  nome: string;
  foto: string | null;
  verificado?: boolean;
  profissao?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  categorias?: { id: number; nome: string; icone?: string; cor?: string }[];
}

export interface FavoritoData {
  id: number;
  prestador: FavoritoPrestador;
  created_at: string;
}

export const useClienteComunicacaoStore = defineStore('clienteComunicacao', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useClienteCacheStore();

  const loading = ref(false);
  const notificacoes = ref<NotificacaoData[]>([]);
  const unreadCount = ref(0);
  const conversas = ref<ConversaData[]>([]);
  const mensagensChat = ref<MensagemData[]>([]);
  const favoritos = ref<FavoritoData[]>([]);

  function getCurrentUserId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const userId = getCurrentUserId();
    if (userId) {
      cacheStore.setClienteId(userId);
    }
  }

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) return [] as T;
    if (Array.isArray(response)) return response as T;
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (obj.success === true && obj.data !== undefined) {
        return obj.data as T;
      }
      if (obj.data !== undefined) {
        return obj.data as T;
      }
    }
    return [] as T;
  }

  function showNotification(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    icon?: string,
  ): void {
    const notifyOptions: {
      type: string;
      message: string;
      position: 'top';
      timeout: number;
      icon?: string;
    } = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };
    if (icon) notifyOptions.icon = icon;
    $q.notify(notifyOptions);
  }

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================

  async function fetchNotificacoes(forceRefresh: boolean = false): Promise<NotificacaoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<NotificacaoData[]>(
      'notificacoes',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.NOTIFICATIONS);
          const result = extractDataFromResponse<NotificacaoData[]>(response.data);
          notificacoes.value = Array.isArray(result) ? result : [];
          unreadCount.value = notificacoes.value.filter((n) => !n.lida).length;
          return notificacoes.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function marcarNotificacaoLida(id: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_NOTIFICATION_READ(id.toString()));
      if (response.data.success) {
        const notif = notificacoes.value.find((n) => n.id === id);
        if (notif && !notif.lida) {
          notif.lida = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        cacheStore.invalidate('notificacoes');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function marcarTodasNotificacoesLidas(): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      if (response.data.success) {
        notificacoes.value.forEach((n) => {
          n.lida = true;
        });
        unreadCount.value = 0;
        cacheStore.invalidate('notificacoes');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function fetchUnreadCount(forceRefresh: boolean = false): Promise<number> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<number>(
      'unread_count',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.CHAT_UNREAD_COUNT);
          const count = response.data.data?.total || 0;
          unreadCount.value = count;
          return count;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  // ==========================================
  // FAVORITOS
  // ==========================================

  async function fetchFavoritos(forceRefresh: boolean = false): Promise<FavoritoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<FavoritoData[]>(
      'favoritos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.FAVORITOS);
          const result = extractDataFromResponse<FavoritoData[]>(response.data);
          favoritos.value = Array.isArray(result) ? result : [];
          return favoritos.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.LONG,
      forceRefresh,
    );
    return data;
  }

  async function adicionarFavorito(prestadorId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.ADICIONAR_FAVORITO(prestadorId.toString()));
      if (response.data.success) {
        cacheStore.invalidate('favoritos');
        await fetchFavoritos(true);
        showNotification('positive', 'Adicionado aos favoritos!', 'favorite');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao adicionar favorito');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removerFavorito(prestadorId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVER_FAVORITO(prestadorId.toString()));
      if (response.data.success) {
        cacheStore.invalidate('favoritos');
        await fetchFavoritos(true);
        showNotification('info', 'Removido dos favoritos', 'favorite_border');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao remover favorito');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ✅ NOVO MÉTODO: Verificar se prestador está nos favoritos
  async function checkFavorito(prestadorId: number): Promise<boolean> {
    const cacheKey = `favorito_check_${prestadorId}`;

    const data = await cacheStore.fetchWithCache<boolean>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.CHECK_FAVORITO(prestadorId.toString()));
          return response.data.data?.is_favorito === true;
        } catch {
          return false;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
    );
    return data;
  }

  // ==========================================
  // CHAT
  // ==========================================

  async function fetchConversas(forceRefresh: boolean = false): Promise<ConversaData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<ConversaData[]>(
      'conversas',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.CHAT_CONVERSATIONS);
          const result = extractDataFromResponse<ConversaData[]>(response.data);
          conversas.value = Array.isArray(result) ? result : [];
          return conversas.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function fetchMensagens(prestadorId: number): Promise<MensagemData[]> {
    initializeCache();
    const cacheKey = `mensagens_${prestadorId}`;

    const data = await cacheStore.fetchWithCache<MensagemData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.CHAT_MESSAGES(prestadorId));
          const result = extractDataFromResponse<MensagemData[]>(response.data);
          mensagensChat.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
    );
    return data;
  }

  async function fetchLatestMessages(
    prestadorId: number,
    lastId?: number,
  ): Promise<MensagemData[]> {
    try {
      const url = lastId
        ? CLIENTE_ENDPOINTS.CHAT_LATEST_MESSAGES(prestadorId, lastId)
        : CLIENTE_ENDPOINTS.CHAT_MESSAGES(prestadorId);

      const response = await api.get(url);
      const result = extractDataFromResponse<MensagemData[]>(response.data);

      if (!lastId && Array.isArray(result)) {
        mensagensChat.value = result;
      }

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Erro ao buscar últimas mensagens:', error);
      return [];
    }
  }

  async function sendMessage(prestadorId: number, message: string): Promise<MensagemData | null> {
    loading.value = true;
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CHAT_SEND_MESSAGE, {
        prestador_id: prestadorId,
        message: message,
      });
      if (response.data.success) {
        const novaMensagem = extractDataFromResponse<MensagemData>(response.data);
        mensagensChat.value.push(novaMensagem);
        cacheStore.invalidate(`mensagens_${prestadorId}`);
        cacheStore.invalidate('conversas');
        return novaMensagem;
      }
      return null;
    } catch {
      showNotification('negative', 'Erro ao enviar mensagem');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function markMessagesAsRead(prestadorId: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CHAT_MARK_AS_READ(prestadorId));
      if (response.data.success === true) {
        cacheStore.invalidate('conversas');
        cacheStore.invalidate(`mensagens_${prestadorId}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return {
    // State
    loading,
    notificacoes,
    unreadCount,
    conversas,
    mensagensChat,
    favoritos,

    // Notificações
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    fetchUnreadCount,

    // Favoritos
    fetchFavoritos,
    adicionarFavorito,
    removerFavorito,
    checkFavorito, // ✅ ADICIONADO
    

    // Chat
    fetchConversas,
    fetchMensagens,
    fetchLatestMessages,
    sendMessage,
    markMessagesAsRead,
  };
});
