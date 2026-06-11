// src/stores/prestador/prestador-layout-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/login-store';

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export const usePrestadorLayoutStore = defineStore('prestadorLayout', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const notificacoes = ref<NotificacaoData[]>([]);
  const unreadCount = ref(0);
  const solicitacoesPendentes = ref(0);
  const ganhosTotais = ref(0);
  const servicosAtivos = ref(0);

  // Getters
  const notificacoesNaoLidas = computed(() => notificacoes.value.filter(n => !n.lida));

  // ==========================================
  // NOTIFICAÇÕES (rotas corretas)
  // ==========================================

  const fetchNotificacoes = async (): Promise<void> => {
    if (!authStore.isPrestador) return;

    isLoading.value = true;
    try {
      // Rota correta: GET /prestador/notificacoes
      const response = await api.get('/prestador/notificacoes');
      if (response.data?.success) {
        notificacoes.value = response.data.data || [];
        unreadCount.value = notificacoes.value.filter(n => !n.lida).length;
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const marcarNotificacaoLida = async (id: number): Promise<void> => {
    try {
      // Rota correta: PUT /prestador/notificacoes/{id}/ler
      const response = await api.put(`/prestador/notificacoes/${id}/ler`);
      if (response.data?.success) {
        const notificacao = notificacoes.value.find(n => n.id === id);
        if (notificacao && !notificacao.lida) {
          notificacao.lida = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const marcarTodasNotificacoesLidas = async (): Promise<void> => {
    try {
      // Rota correta: PUT /prestador/notificacoes/marcar-todas-lidas
      const response = await api.put('/prestador/notificacoes/marcar-todas-lidas');
      if (response.data?.success) {
        notificacoes.value.forEach(n => { n.lida = true; });
        unreadCount.value = 0;
      }
    } catch (error) {
      console.error('Erro ao marcar todas notificações:', error);
    }
  };

  // ==========================================
  // SOLICITAÇÕES PENDENTES (corrigido)
  // ==========================================

  const fetchSolicitacoesPendentes = async (): Promise<void> => {
    if (!authStore.isPrestador) return;

    try {
      // Rota correta: GET /prestador/solicitacoes?status=pendente
      const response = await api.get('/prestador/solicitacoes', {
        params: { status: 'pendente' }
      });
      if (response.data?.success) {
        solicitacoesPendentes.value = response.data.data?.length || 0;
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
    }
  };

  // ==========================================
  // ESTATÍSTICAS DO DASHBOARD
  // ==========================================

  const fetchStats = async (): Promise<void> => {
    if (!authStore.isPrestador) return;

    try {
      // Rota correta: GET /prestador/dashboard/stats
      const response = await api.get('/prestador/dashboard/stats');
      if (response.data?.success) {
        const data = response.data.data;
        ganhosTotais.value = data?.ganhos_totais || 0;
        servicosAtivos.value = data?.servicos_ativos || 0;
        // Se o backend não enviar solicitacoes_pendentes, manter o valor existente
        if (data?.solicitacoes_pendentes !== undefined) {
          solicitacoesPendentes.value = data.solicitacoes_pendentes;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
    }
  };

  // ==========================================
  // CARREGAR TODOS OS DADOS
  // ==========================================

  const carregarTodosDados = async (): Promise<void> => {
    if (!authStore.isPrestador) return;

    isLoading.value = true;
    try {
      await Promise.all([
        fetchNotificacoes(),
        fetchSolicitacoesPendentes(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // ==========================================
  // LIMPAR STORE
  // ==========================================

  const limparStore = (): void => {
    notificacoes.value = [];
    unreadCount.value = 0;
    solicitacoesPendentes.value = 0;
    ganhosTotais.value = 0;
    servicosAtivos.value = 0;
  };

  return {
    // Estados
    isLoading,
    notificacoes,
    unreadCount,
    solicitacoesPendentes,
    ganhosTotais,
    servicosAtivos,

    // Getters
    notificacoesNaoLidas,

    // Actions
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    fetchSolicitacoesPendentes,
    fetchStats,
    carregarTodosDados,
    limparStore,
  };
});
