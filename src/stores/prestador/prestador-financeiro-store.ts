// src/stores/prestador/prestador-financeiro-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { usePrestadorCacheStore, PRESTADOR_CACHE_TTL } from './prestador-cache-store';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';
import type { AxiosError } from 'axios';

// ==========================================
// TIPOS - COMPLETOS
// ==========================================

export interface GanhosData {
  total: number;
  mes: number;
  semana: number;
  pendente: number;
}

export interface StatsData {
  pedidos_pendentes: number;
  servicos_hoje: number;
  avaliacao_media: number;
  ganhos_mes: number;
  ticket_medio?: number;
}

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  tipo?: string;
  lida: boolean;
  created_at: string;
  updated_at?: string;
  data?: string;
}

export interface SaqueData {
  id: number;
  numero: string;
  valor: number;
  status: 'pendente' | 'processando' | 'concluido' | 'cancelado';
  metodo: 'mpesa' | 'bancario';
  conta: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STORE
// ==========================================

export const usePrestadorFinanceiroStore = defineStore('prestadorFinanceiro', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = usePrestadorCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const ganhos = ref<GanhosData>({ total: 0, mes: 0, semana: 0, pendente: 0 });
  const stats = ref<StatsData>({
    pedidos_pendentes: 0,
    servicos_hoje: 0,
    avaliacao_media: 0,
    ganhos_mes: 0,
  });
  const notificacoes = ref<NotificacaoData[]>([]);
  const unreadCount = ref(0);
  const saques = ref<SaqueData[]>([]);
  const historicoSaques = ref<SaqueData[]>([]); // ✅ ADICIONADO

  // ==========================================
  // AUXILIARES
  // ==========================================

  function getCurrentUserId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const userId = getCurrentUserId();
    if (userId) {
      cacheStore.setPrestadorId(userId);
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
    icon?: string
  ): void {
    const notifyOptions: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: type === 'warning' ? 4000 : 3000
    };
    if (icon) {
      notifyOptions.icon = icon;
    }
    $q.notify(notifyOptions);
  }

  function showError(error: unknown): void {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    showNotification('negative', message);
  }

  // ==========================================
  // FINANCEIRO
  // ==========================================

  async function fetchGanhos(forceRefresh: boolean = false): Promise<GanhosData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<GanhosData | null>(
      'ganhos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.GANHOS);
          const result = extractDataFromResponse<GanhosData>(response.data);
          ganhos.value = result;
          return ganhos.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh,
    );

    return data;
  }

  async function fetchStats(forceRefresh: boolean = false): Promise<StatsData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<StatsData | null>(
      'stats',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PRESTADOR_STATS);
          const result = extractDataFromResponse<StatsData>(response.data);
          stats.value = result;
          return stats.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.INSTANT,
      forceRefresh,
    );

    return data;
  }

  async function fetchSaques(forceRefresh: boolean = false): Promise<SaqueData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<SaqueData[]>(
      'saques',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.SAQUES);
          const result = extractDataFromResponse<SaqueData[]>(response.data);
          saques.value = Array.isArray(result) ? result : [];
          return saques.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh,
    );

    return data;
  }

  // ✅ NOVO MÉTODO: Buscar histórico de saques
  async function fetchHistoricoSaques(forceRefresh: boolean = false): Promise<SaqueData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<SaqueData[]>(
      'historico_saques',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.HISTORICO_SAQUES);
          const result = extractDataFromResponse<SaqueData[]>(response.data);
          historicoSaques.value = Array.isArray(result) ? result : [];
          return historicoSaques.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh,
    );

    return data;
  }

  async function solicitarSaque(data: {
    valor: number;
    metodo: 'mpesa' | 'bancario';
    conta: string;
  }): Promise<SaqueData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.SOLICITAR_SAQUE, data);
      if (response.data.success) {
        showNotification('positive', 'Saque solicitado!', 'payments');
        cacheStore.invalidatePattern('ganhos');
        cacheStore.invalidatePattern('stats');
        cacheStore.invalidatePattern('saques');
        cacheStore.invalidatePattern('historico_saques');
        await fetchSaques(true);
        await fetchHistoricoSaques(true);
        return extractDataFromResponse<SaqueData>(response.data);
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
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
          const response = await api.get('/notifications');
          const result = extractDataFromResponse<NotificacaoData[]>(response.data);
          notificacoes.value = Array.isArray(result) ? result : [];
          unreadCount.value = notificacoes.value.filter((n) => !n.lida).length;
          return notificacoes.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.INSTANT,
      forceRefresh,
    );

    return data;
  }

  async function marcarNotificacaoLida(id: number): Promise<boolean> {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        const notif = notificacoes.value.find((n) => n.id === id);
        if (notif && !notif.lida) {
          notif.lida = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        cacheStore.invalidatePattern('notificacoes');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function marcarTodasNotificacoesLidas(): Promise<boolean> {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        notificacoes.value.forEach((notif) => {
          notif.lida = true;
        });
        unreadCount.value = 0;
        cacheStore.invalidatePattern('notificacoes');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao marcar todas notificações:', error);
      return false;
    }
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    ganhos,
    stats,
    notificacoes,
    unreadCount,
    saques,
    historicoSaques, // ✅ ADICIONADO

    // Actions
    fetchGanhos,
    fetchStats,
    fetchSaques,
    fetchHistoricoSaques, // ✅ ADICIONADO
    solicitarSaque,
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  };
});
