// src/stores/prestador/prestador-servicos-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { usePrestadorCacheStore, PRESTADOR_CACHE_TTL } from './prestador-cache-store';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';
import type { AxiosError } from 'axios';

// ==========================================
// TIPOS E INTERFACES (sem any)
// ==========================================

export interface ServicoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  icone: string;
  ativo: boolean;
  categoria_id: number;
  categoria?: { id: number; nome: string };
  created_at: string;
  updated_at: string;
}

export interface SolicitacaoData {
  id: number;
  numero: string;
  cliente_id: number;
  servico_id: number;
  data: string;
  endereco: string;
  status: string;
  valor: number;
  observacoes?: string;
  cliente?: { id: number; nome: string; foto: string | null; telefone: string };
  servico?: { id: number; nome: string; preco: number };
  created_at: string;
}

export interface AgendaData {
  id: number;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  bloqueado: boolean;
  motivo?: string;
}

export interface PedidoDisponivelData {
  id: number;
  numero: string;
  descricao: string;
  foto: string | null;
  endereco: string;
  status: string;
  created_at: string;
  distancia_km?: number;
  categoria?: {
    id: number;
    nome: string;
    icone: string;
    cor: string;
  };
  cliente?: {
    id: number;
    nome: string;
    foto: string | null;
    telefone?: string;
  };
}

export interface PropostaData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  valor: number;
  mensagem?: string;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  pedido?: PedidoDisponivelData;
}

export interface ProximoServicoData {
  id: number;
  numero: string;
  cliente: { id: number; nome: string; foto: string | null; telefone: string };
  servico: { id: number; nome: string; preco: number };
  data: string;
  endereco: string;
  status: string;
  valor: number;
  observacoes?: string;
}

export interface AvaliacaoRecenteData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente: { id: number; nome: string; foto: string | null };
}

// ==========================================
// STORE
// ==========================================

export const usePrestadorServicosStore = defineStore('prestadorServicos', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = usePrestadorCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const servicos = ref<ServicoData[]>([]);
  const servicoDetalhes = ref<ServicoData | null>(null);
  const solicitacoes = ref<SolicitacaoData[]>([]);
  const agenda = ref<AgendaData[]>([]);
  const pedidosDisponiveis = ref<PedidoDisponivelData[]>([]);
  const minhasPropostas = ref<PropostaData[]>([]);
  const proximosServicos = ref<ProximoServicoData[]>([]);
  const avaliacoesRecentes = ref<AvaliacaoRecenteData[]>([]);

  const pendingRequests = new Map<string, Promise<unknown>>();

  // ==========================================
  // MÉTODOS AUXILIARES (sem any)
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
    if (!response) {
      return [] as T;
    }

    if (Array.isArray(response)) {
      return response as T;
    }

    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      if (obj.success === true && obj.data !== undefined) {
        if (Array.isArray(obj.data)) {
          return obj.data as T;
        }
        if (
          obj.data &&
          typeof obj.data === 'object' &&
          (obj.data as Record<string, unknown>).data &&
          Array.isArray((obj.data as Record<string, unknown>).data)
        ) {
          return (obj.data as Record<string, unknown>).data as T;
        }
        if (obj.data && typeof obj.data === 'object') {
          return obj.data as T;
        }
        return obj.data as T;
      }

      if (obj.data !== undefined) {
        if (Array.isArray(obj.data)) {
          return obj.data as T;
        }
        if (
          obj.data &&
          typeof obj.data === 'object' &&
          (obj.data as Record<string, unknown>).data &&
          Array.isArray((obj.data as Record<string, unknown>).data)
        ) {
          return (obj.data as Record<string, unknown>).data as T;
        }
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
    const notifyOptions: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: type === 'warning' ? 4000 : 3000,
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
  // SERVIÇOS
  // ==========================================

  async function fetchServicos(forceRefresh: boolean = false): Promise<ServicoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<ServicoData[]>(
      'servicos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.SERVICOS);
          const result = extractDataFromResponse<ServicoData[]>(response.data);
          servicos.value = Array.isArray(result) ? result : [];
          return servicos.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.LONG,
      forceRefresh,
    );

    return data;
  }

  async function fetchServicoDetalhes(
    id: number,
    forceRefresh: boolean = false,
  ): Promise<ServicoData | null> {
    initializeCache();
    const cacheKey = `servico_detalhes_${id}`;

    const data = await cacheStore.fetchWithCache<ServicoData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()));
          const result = extractDataFromResponse<ServicoData>(response.data);
          servicoDetalhes.value = result;
          return result;
        } catch (error) {
          showError(error);
          return null;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh,
    );

    return data;
  }

  async function createServico(data: {
    nome: string;
    categoria_id: number;
    preco: number;
    duracao: number;
    descricao?: string;
    icone?: string;
  }): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.CRIAR_SERVICO, data);
      if (response.data.success) {
        const novo = extractDataFromResponse<ServicoData>(response.data);
        servicos.value.push(novo);
        cacheStore.invalidatePattern('servicos');
        showNotification('positive', 'Serviço criado com sucesso!', 'check_circle');
        return novo;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateServico(
    id: number,
    data: Partial<ServicoData>,
  ): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()), data);
      if (response.data.success) {
        const atualizado = extractDataFromResponse<ServicoData>(response.data);
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1) {
          servicos.value[index] = atualizado;
        }
        cacheStore.invalidatePattern('servicos');
        showNotification('positive', 'Serviço atualizado!', 'edit');
        return atualizado;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteServico(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DELETAR_SERVICO(id.toString()));
      if (response.data.success) {
        servicos.value = servicos.value.filter((s) => s.id !== id);
        cacheStore.invalidatePattern('servicos');
        showNotification('positive', 'Serviço removido!', 'delete');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function toggleServico(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.TOGGLE_SERVICO(id.toString()));
      if (response.data.success) {
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1 && servicos.value[index]) {
          servicos.value[index].ativo = !servicos.value[index].ativo;
        }
        cacheStore.invalidatePattern('servicos');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // SOLICITAÇÕES
  // ==========================================

  async function fetchSolicitacoes(
    status?: string,
    forceRefresh: boolean = false,
  ): Promise<SolicitacaoData[]> {
    initializeCache();
    const cacheKey = `solicitacoes_${status || 'all'}`;

    const data = await cacheStore.fetchWithCache<SolicitacaoData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const url = status
            ? PRESTADOR_ENDPOINTS.SOLICITACOES_BY_STATUS(status)
            : PRESTADOR_ENDPOINTS.SOLICITACOES;
          const response = await api.get(url);
          const result = extractDataFromResponse<SolicitacaoData[]>(response.data);
          solicitacoes.value = Array.isArray(result) ? result : [];
          return solicitacoes.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
      forceRefresh,
    );

    return data;
  }

  async function aceitarSolicitacao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ACEITAR_SOLICITACAO(id.toString()));
      if (response.data.success) {
        cacheStore.invalidatePattern('solicitacoes');
        showNotification('positive', 'Solicitação aceita!', 'check_circle');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function recusarSolicitacao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.RECUSAR_SOLICITACAO(id.toString()));
      if (response.data.success) {
        cacheStore.invalidatePattern('solicitacoes');
        showNotification('info', 'Solicitação recusada', 'cancel');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PEDIDOS DISPONÍVEIS
  // ==========================================

  async function fetchPedidosDisponiveis(
    forceRefresh: boolean = false,
  ): Promise<PedidoDisponivelData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PedidoDisponivelData[]>(
      'pedidos_disponiveis',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PEDIDOS_DISPONIVEIS);
          const result = extractDataFromResponse<PedidoDisponivelData[]>(response.data);
          pedidosDisponiveis.value = Array.isArray(result) ? result : [];
          return pedidosDisponiveis.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
      forceRefresh,
    );

    return data;
  }

  // ==========================================
  // PROPOSTAS
  // ==========================================

  async function enviarProposta(data: {
    pedido_id: number;
    valor: number;
    mensagem?: string;
  }): Promise<PropostaData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.ENVIAR_PROPOSTA, data);
      if (response.data.success) {
        cacheStore.invalidatePattern('pedidos_disponiveis');
        cacheStore.invalidatePattern('minhas_propostas');
        showNotification('positive', 'Proposta enviada!', 'send');
        return response.data.data;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMinhasPropostas(forceRefresh: boolean = false): Promise<PropostaData[]> {
    initializeCache();
    const cacheKey = `minhas_propostas_${getCurrentUserId()}`;

    const data = await cacheStore.fetchWithCache<PropostaData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_PROPOSTAS);
          const result = extractDataFromResponse<PropostaData[]>(response.data);
          minhasPropostas.value = Array.isArray(result) ? result : [];
          return minhasPropostas.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
      forceRefresh,
    );

    return data;
  }

  // ==========================================
  // AGENDA
  // ==========================================

  async function fetchAgenda(params?: { semana?: number }): Promise<AgendaData[]> {
    initializeCache();
    const cacheKey = `agenda_${params?.semana || 0}`;

    const data = await cacheStore.fetchWithCache<AgendaData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AGENDA, { params });
          const result = extractDataFromResponse<AgendaData[]>(response.data);
          agenda.value = Array.isArray(result) ? result : [];
          return agenda.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
    );

    return data;
  }

  async function bloquearHorario(data: {
    data: string;
    horario_inicio: string;
    horario_fim: string;
    motivo?: string;
  }): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.BLOQUEAR_HORARIO, data);
      if (response.data.success) {
        cacheStore.invalidatePattern('agenda');
        showNotification('positive', 'Horário bloqueado!', 'lock');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function desbloquearHorario(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DESBLOQUEAR_HORARIO(id.toString()));
      if (response.data.success) {
        cacheStore.invalidatePattern('agenda');
        showNotification('positive', 'Horário desbloqueado!', 'lock_open');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PRÓXIMOS SERVIÇOS E AVALIAÇÕES
  // ==========================================

  async function fetchProximosServicos(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<ProximoServicoData[]> {
    initializeCache();
    const cacheKey = `proximos_servicos_${getCurrentUserId()}_${limit}`;

    const data = await cacheStore.fetchWithCache<ProximoServicoData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PROXIMOS_SERVICOS, {
            params: { limit },
          });
          const result = extractDataFromResponse<ProximoServicoData[]>(response.data);
          proximosServicos.value = Array.isArray(result) ? result : [];
          return proximosServicos.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
      forceRefresh,
    );

    return data;
  }

  async function fetchAvaliacoesRecentes(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<AvaliacaoRecenteData[]> {
    initializeCache();
    const cacheKey = `avaliacoes_recentes_${getCurrentUserId()}_${limit}`;

    const data = await cacheStore.fetchWithCache<AvaliacaoRecenteData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AVALIACOES_RECENTES, {
            params: { limit },
          });
          const result = extractDataFromResponse<AvaliacaoRecenteData[]>(response.data);
          avaliacoesRecentes.value = Array.isArray(result) ? result : [];
          return avaliacoesRecentes.value;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.SHORT,
      forceRefresh,
    );

    return data;
  }

  // ==========================================
  // MÉTODOS DE CARREGAMENTO
  // ==========================================

  async function carregarDashboard(forceRefresh: boolean = false): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        fetchProximosServicos(5, forceRefresh),
        fetchAvaliacoesRecentes(5, forceRefresh),
      ]);
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // RESET
  // ==========================================

  function reset(): void {
    servicos.value = [];
    servicoDetalhes.value = null;
    solicitacoes.value = [];
    agenda.value = [];
    pedidosDisponiveis.value = [];
    minhasPropostas.value = [];
    proximosServicos.value = [];
    avaliacoesRecentes.value = [];
    pendingRequests.clear();
    cacheStore.invalidatePattern('servicos');
    cacheStore.invalidatePattern('solicitacoes');
    cacheStore.invalidatePattern('agenda');
    cacheStore.invalidatePattern('pedidos_disponiveis');
    cacheStore.invalidatePattern('minhas_propostas');
    cacheStore.invalidatePattern('proximos_servicos');
    cacheStore.invalidatePattern('avaliacoes_recentes');
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    servicos,
    servicoDetalhes,
    solicitacoes,
    agenda,
    pedidosDisponiveis,
    minhasPropostas,
    proximosServicos,
    avaliacoesRecentes,

    // Actions - Serviços
    fetchServicos,
    fetchServicoDetalhes,
    createServico,
    updateServico,
    deleteServico,
    toggleServico,

    // Actions - Solicitações
    fetchSolicitacoes,
    aceitarSolicitacao,
    recusarSolicitacao,

    // Actions - Pedidos Disponíveis
    fetchPedidosDisponiveis,

    // Actions - Propostas
    enviarProposta,
    fetchMinhasPropostas,

    // Actions - Agenda
    fetchAgenda,
    bloquearHorario,
    desbloquearHorario,

    // Actions - Próximos Serviços e Avaliações
    fetchProximosServicos,
    fetchAvaliacoesRecentes,

    // Actions - Dashboard
    carregarDashboard,

    // Actions - Reset
    reset,

    // Utilitários
    showNotification,
    showError,
  };
});
