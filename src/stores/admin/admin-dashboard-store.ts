// src/stores/admin/admin-dashboard-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import { useAuthStore } from '../auth-store';
import { useAdminCacheStore, ADMIN_CACHE_TTL } from './admin-cache-store';
import type { AxiosError } from 'axios';

export interface DashboardData {
  total_users: number;
  total_clientes: number;
  total_prestadores: number;
  total_admins: number;
  prestadores_ativos: number;
  servicos_hoje: number;
  servicos_pendentes: number;
  avaliacao_media: number;
  total_avaliacoes: number;
}

export interface AtividadeData {
  dia: string;
  valor: number;
  data: string;
}

export interface StatsData {
  total_usuarios: number;
  total_clientes: number;
  total_prestadores: number;
  total_servicos: number;
  total_pedidos: number;
  total_avaliacoes: number;
  receita_total: number;
}

export interface LogData {
  id: number;
  data: string;
  nivel: string;
  usuario: string;
  acao: string;
  ip: string;
}

export interface NotificacaoData {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  icone?: string;
  cor?: string;
}

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useAdminCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const dashboard = ref<DashboardData>({
    total_users: 0,
    total_clientes: 0,
    total_prestadores: 0,
    total_admins: 0,
    prestadores_ativos: 0,
    servicos_hoje: 0,
    servicos_pendentes: 0,
    avaliacao_media: 0,
    total_avaliacoes: 0,
  });
  const atividadeSemanal = ref<AtividadeData[]>([]);
  const estatisticas = ref<StatsData>({
    total_usuarios: 0,
    total_clientes: 0,
    total_prestadores: 0,
    total_servicos: 0,
    total_pedidos: 0,
    total_avaliacoes: 0,
    receita_total: 0,
  });
  const logs = ref<LogData[]>([]);
  const notificacoesAdmin = ref<NotificacaoData[]>([]);

  // ==========================================
  // AUXILIARES
  // ==========================================

  function getCurrentAdminId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const adminId = getCurrentAdminId();
    if (adminId) {
      cacheStore.setAdminId(adminId);
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

  function showError(error: unknown): void {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 });
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async function fetchDashboard(forceRefresh: boolean = false): Promise<DashboardData> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<DashboardData>(
      'dashboard',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
          const result = extractDataFromResponse<DashboardData>(response.data);
          dashboard.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh
    );
    return data;
  }

  async function fetchAtividade(forceRefresh: boolean = false): Promise<AtividadeData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<AtividadeData[]>(
      'atividade',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.ATIVIDADE);
          const result = extractDataFromResponse<AtividadeData[]>(response.data);
          atividadeSemanal.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function fetchStats(forceRefresh: boolean = false): Promise<StatsData> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<StatsData>(
      'stats',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.STATS);
          const result = extractDataFromResponse<StatsData>(response.data);
          estatisticas.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh
    );
    return data;
  }

  async function fetchLogs(forceRefresh: boolean = false): Promise<LogData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<LogData[]>(
      'logs',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.LOGS);
          const result = extractDataFromResponse<LogData[]>(response.data);
          logs.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.SHORT,
      forceRefresh
    );
    return data;
  }

  // ==========================================
  // NOTIFICAÇÕES DO ADMIN
  // ==========================================

  async function fetchNotificacoesAdmin(forceRefresh: boolean = false): Promise<NotificacaoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<NotificacaoData[]>(
      'notificacoes',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.NOTIFICACOES);
          const result = extractDataFromResponse<NotificacaoData[]>(response.data);
          notificacoesAdmin.value = Array.isArray(result) ? result : [];
          return notificacoesAdmin.value;
        } catch {
          notificacoesAdmin.value = [];
          return [];
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.SHORT,
      forceRefresh
    );
    return data;
  }

  async function marcarNotificacaoLida(id: string): Promise<boolean> {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.MARK_NOTIFICATION_READ(id));
      if (response.data.success) {
        const notif = notificacoesAdmin.value.find(n => n.id === id);
        if (notif && !notif.lida) {
          notif.lida = true;
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
      const response = await api.put(ADMIN_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      if (response.data.success) {
        notificacoesAdmin.value.forEach(n => { n.lida = true; });
        cacheStore.invalidate('notificacoes');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  const notificacoesNaoLidas = computed(() => {
    return notificacoesAdmin.value.filter((n) => !n.lida).length;
  });

  const notificacoesRecentes = computed(() => {
    return [...notificacoesAdmin.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  });

  // ==========================================
  // GETTERS FORMATADOS
  // ==========================================

  const atividadeFormatada = computed(() => {
    return atividadeSemanal.value.map((item, index) => ({
      dia: item.dia,
      valor: item.valor,
      altura: Math.min(item.valor * 2, 120),
      cor: index < 5 ? '#667eea' : '#764ba2',
    }));
  });

  const cardsPrincipais = computed(() => [
    {
      title: 'Total Utilizadores',
      value: dashboard.value.total_users,
      icon: 'people',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      trend: 12,
    },
    {
      title: 'Prestadores',
      value: dashboard.value.total_prestadores,
      icon: 'handyman',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      trend: 8,
    },
    {
      title: 'Serviços Hoje',
      value: dashboard.value.servicos_hoje,
      icon: 'assignment',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      trend: 5,
    },
    {
      title: 'Avaliação Média',
      value: dashboard.value.avaliacao_media.toFixed(1),
      icon: 'star',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      trend: 3,
    },
  ]);

  const cardsSecundarios = computed(() => [
    {
      title: 'Receita Total',
      value: formatMoney(estatisticas.value.receita_total),
      icon: 'payments',
      iconColor: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Categorias',
      value: 0, // Será atualizado pelo conteúdo-store
      icon: 'category',
      iconColor: '#f57c00',
      bgColor: '#fff3e0',
    },
    {
      title: 'Serviços',
      value: estatisticas.value.total_servicos,
      icon: 'construction',
      iconColor: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Avaliações',
      value: dashboard.value.total_avaliacoes,
      icon: 'chat',
      iconColor: '#9c27b0',
      bgColor: '#f3e5f5',
    },
  ]);

  const distribuicaoPorTipo = computed(() => {
    const total = dashboard.value.total_users;
    if (total === 0) return [];
    return [
      {
        label: 'Clientes',
        value: dashboard.value.total_clientes,
        percent: (dashboard.value.total_clientes / total) * 100,
        color: 'primary',
      },
      {
        label: 'Prestadores',
        value: dashboard.value.total_prestadores,
        percent: (dashboard.value.total_prestadores / total) * 100,
        color: 'secondary',
      },
      {
        label: 'Administradores',
        value: dashboard.value.total_admins,
        percent: (dashboard.value.total_admins / total) * 100,
        color: 'grey',
      },
    ];
  });

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  async function carregarDashboard(forceRefresh: boolean = false): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        fetchDashboard(forceRefresh),
        fetchAtividade(forceRefresh),
        fetchStats(forceRefresh),
        fetchNotificacoesAdmin(forceRefresh),
      ]);
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    dashboard,
    atividadeSemanal,
    estatisticas,
    logs,
    notificacoesAdmin,

    // Computed
    notificacoesNaoLidas,
    notificacoesRecentes,
    atividadeFormatada,
    cardsPrincipais,
    cardsSecundarios,
    distribuicaoPorTipo,

    // Actions
    fetchDashboard,
    fetchAtividade,
    fetchStats,
    fetchLogs,
    fetchNotificacoesAdmin,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    carregarDashboard,
    formatMoney,
    showError,
  };
});
