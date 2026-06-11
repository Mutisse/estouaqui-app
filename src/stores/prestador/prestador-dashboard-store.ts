import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface DashboardStats {
  pedidos_pendentes: number;
  servicos_hoje: number;
  avaliacao_media: number;
}

export interface GanhosData {
  total: number;
  mes: number;
  semana: number;
  pendente: number;
}

export interface Cliente {
  id: number;
  nome: string;
  foto: string | null;
}

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
}

export interface ProximoServico {
  id: number;
  cliente_id: number;
  servico_id: number;
  data: string;
  status: string;
  cliente?: Cliente;
  servico?: Servico;
}

export interface Avaliacao {
  id: number;
  cliente_id: number;
  prestador_id: number;
  pedido_id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente?: Cliente;
}

// ===================== STORE =====================

export const usePrestadorDashboardStore = defineStore('prestadorDashboard', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Dados do dashboard
  const stats = ref<DashboardStats>({
    pedidos_pendentes: 0,
    servicos_hoje: 0,
    avaliacao_media: 0,
  });

  const ganhos = ref<GanhosData>({
    total: 0,
    mes: 0,
    semana: 0,
    pendente: 0,
  });

  const proximosServicos = ref<ProximoServico[]>([]);
  const avaliacoesRecentes = ref<Avaliacao[]>([]);

  // Controle de dados já carregados
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  // ===================== GETTERS =====================

  const temServicosProximos = computed(() => proximosServicos.value.length > 0);
  const temAvaliacoes = computed(() => avaliacoesRecentes.value.length > 0);
  const pedidosPendentesCount = computed(() => stats.value.pedidos_pendentes);
  const avaliacaoMediaFormatada = computed(() => stats.value.avaliacao_media.toFixed(1));

  const ganhosMesFormatado = computed(() => `MZN ${ganhos.value.mes.toLocaleString()}`);
  const ganhosTotalFormatado = computed(() => `MZN ${ganhos.value.total.toLocaleString()}`);

  // ===================== AÇÕES =====================

  /**
   * Busca estatísticas do dashboard
   * GET /api/prestador/dashboard/stats
   */
  const fetchStats = async (): Promise<void> => {
    try {
      const response = await api.get('/prestador/dashboard/stats');

      if (response.data?.success && response.data.data) {
        stats.value = {
          pedidos_pendentes: response.data.data.pedidos_pendentes || 0,
          servicos_hoje: response.data.data.servicos_hoje || 0,
          avaliacao_media: response.data.data.avaliacao_media || 0,
        };
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao carregar estatísticas';
    }
  };

  /**
   * Busca dados de ganhos
   * GET /api/prestador/dashboard/ganhos
   */
  const fetchGanhos = async (): Promise<void> => {
    try {
      const response = await api.get('/prestador/dashboard/ganhos');

      if (response.data?.success && response.data.data) {
        ganhos.value = {
          total: response.data.data.total || 0,
          mes: response.data.data.mes || 0,
          semana: response.data.data.semana || 0,
          pendente: response.data.data.pendente || 0,
        };
      }
    } catch (err) {
      console.error('Erro ao buscar ganhos:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao carregar ganhos';
    }
  };

  /**
   * Busca próximos serviços
   * GET /api/prestador/dashboard/proximos-servicos?limite=5
   */
  const fetchProximosServicos = async (limite: number = 5): Promise<void> => {
    try {
      const response = await api.get(`/prestador/dashboard/proximos-servicos?limite=${limite}`);

      if (response.data?.success && response.data.data) {
        proximosServicos.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao buscar próximos serviços:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao carregar próximos serviços';
    }
  };

  /**
   * Busca avaliações recentes
   * GET /api/prestador/dashboard/avaliacoes-recentes?limite=5
   */
  const fetchAvaliacoesRecentes = async (limite: number = 5): Promise<void> => {
    try {
      const response = await api.get(`/prestador/dashboard/avaliacoes-recentes?limite=${limite}`);

      if (response.data?.success && response.data.data) {
        avaliacoesRecentes.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações recentes:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao carregar avaliações recentes';
    }
  };

  /**
   * Carrega todos os dados do dashboard de uma vez
   */
  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await Promise.all([
        fetchStats(),
        fetchGanhos(),
        fetchProximosServicos(5),
        fetchAvaliacoesRecentes(5),
      ]);

      dadosCarregados.value = true;
      ultimaAtualizacao.value = new Date();
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      error.value = 'Erro ao carregar dados do dashboard';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Recarrega todos os dados (para refresh manual)
   */
  const recarregarDados = async (): Promise<void> => {
    await carregarTodosDados();
  };

  /**
   * Limpa todos os dados do store
   */
  const limparStore = (): void => {
    stats.value = {
      pedidos_pendentes: 0,
      servicos_hoje: 0,
      avaliacao_media: 0,
    };
    ganhos.value = {
      total: 0,
      mes: 0,
      semana: 0,
      pendente: 0,
    };
    proximosServicos.value = [];
    avaliacoesRecentes.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    error,
    stats,
    ganhos,
    proximosServicos,
    avaliacoesRecentes,
    dadosCarregados,
    ultimaAtualizacao,

    // Getters
    temServicosProximos,
    temAvaliacoes,
    pedidosPendentesCount,
    avaliacaoMediaFormatada,
    ganhosMesFormatado,
    ganhosTotalFormatado,

    // Actions
    fetchStats,
    fetchGanhos,
    fetchProximosServicos,
    fetchAvaliacoesRecentes,
    carregarTodosDados,
    recarregarDados,
    limparStore,
  };
});

export default usePrestadorDashboardStore;
