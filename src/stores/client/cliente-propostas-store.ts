// src/stores/client/cliente-propostas-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface PrestadorProposta {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  media_avaliacao?: number;  // ✅ Número, não string
  total_avaliacoes?: number;
  foto?: string;
  verificado?: boolean;
}

export interface ServicoProposta {
  id: number;
  nome: string;
  descricao?: string;
  preco?: number;
  duracao?: number;
}

export interface PedidoProposta {
  id: number;
  descricao: string;
  status: string;
  endereco?: string;
  categoria_id?: number;
  categoria?: {
    id: number;
    nome: string;
  };
}

export interface PropostaData {
  id: number;
  numero?: string;
  pedido_id: number;
  pedido?: PedidoProposta;
  servico_id?: number;
  servico?: ServicoProposta;
  prestador_id: number;
  prestador?: PrestadorProposta;
  valor: number;
  duracao?: number;
  endereco?: string;
  mensagem?: string;
  status: 'pendente' | 'enviada' | 'aceita' | 'recusada' | 'expirada';
  expira_em?: string;
  created_at: string;
  updated_at: string;
}

export interface EstatisticasPropostas {
  total: number;
  pendentes: number;
  enviadas: number;
  aceitas: number;
  recusadas: number;
  expiradas: number;
}

export interface FiltrosPropostas {
  status: string | null;
  busca: string;
  data_inicio: string;
  data_fim: string;
  page: number;
  perPage: number;
}

export interface PaginacaoPropostas {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ===================== STORE =====================

export const useClientePropostasStore = defineStore('clientePropostas', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);

  const propostas = ref<PropostaData[]>([]);
  const propostaSelecionada = ref<PropostaData | null>(null);
  const estatisticas = ref<EstatisticasPropostas>({
    total: 0,
    pendentes: 0,
    enviadas: 0,
    aceitas: 0,
    recusadas: 0,
    expiradas: 0,
  });

  const paginacao = ref<PaginacaoPropostas>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosPropostas>({
    status: null,
    busca: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // ===================== GETTERS =====================

  const totalPropostas = computed(() => paginacao.value.total);
  const temPropostas = computed(() => propostas.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  const propostasPendentes = computed(() => {
    return propostas.value.filter((p) => p.status === 'pendente' || p.status === 'enviada');
  });

  const propostasAceitas = computed(() => {
    return propostas.value.filter((p) => p.status === 'aceita');
  });

  const propostasRecusadas = computed(() => {
    return propostas.value.filter((p) => p.status === 'recusada');
  });

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

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      enviada: 'Enviada',
      aceita: 'Aceita',
      recusada: 'Recusada',
      expirada: 'Expirada',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const cores: Record<string, string> = {
      pendente: 'warning',
      enviada: 'primary',
      aceita: 'positive',
      recusada: 'negative',
      expirada: 'grey',
    };
    return cores[status] || 'grey';
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      pendente: 'pending',
      enviada: 'send',
      aceita: 'check_circle',
      recusada: 'cancel',
      expirada: 'schedule',
    };
    return icons[status] || 'info';
  };

  // ===================== AÇÕES PRINCIPAIS =====================

  /**
   * Buscar todas as propostas do cliente
   */
  const carregarPropostas = async (resetPage = true): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      if (resetPage) {
        filtros.value.page = 1;
      }

      const params: Record<string, string | number> = {
        page: filtros.value.page,
        per_page: filtros.value.perPage,
      };

      if (filtros.value.status) params.status = filtros.value.status;
      if (filtros.value.busca) params.search = filtros.value.busca;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get('/cliente/propostas', { params });

      if (response.data?.success) {
        propostas.value = response.data.data || [];
        paginacao.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
        };
        dadosCarregados.value = true;
      }
    } catch (err) {
      console.error('Erro ao carregar propostas:', err);
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Buscar estatísticas das propostas
   */
  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get('/cliente/propostas/estatisticas');

      if (response.data?.success && response.data.data) {
        estatisticas.value = {
          total: response.data.data.total || 0,
          pendentes: response.data.data.pendentes || 0,
          enviadas: response.data.data.enviadas || 0,
          aceitas: response.data.data.aceitas || 0,
          recusadas: response.data.data.recusadas || 0,
          expiradas: response.data.data.expiradas || 0,
        };
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  /**
   * Buscar detalhes de uma proposta específica
   */
  const buscarProposta = async (id: number): Promise<PropostaData | null> => {
    isLoading.value = true;
    try {
      const response = await api.get(`/cliente/propostas/${id}`);

      if (response.data?.success && response.data.data) {
        propostaSelecionada.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar proposta:', err);
      error.value = getErrorMessage(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Aceitar uma proposta
   */
  const aceitarProposta = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.post(`/cliente/propostas/${id}/aceitar`);

      if (response.data?.success) {
        const index = propostas.value.findIndex((p) => p.id === id);
        if (index !== -1 && propostas.value[index]) {
          propostas.value[index].status = 'aceita';
        }
        if (propostaSelecionada.value?.id === id) {
          propostaSelecionada.value.status = 'aceita';
        }
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao aceitar proposta:', err);
      error.value = getErrorMessage(err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  /**
   * Recusar uma proposta
   */
  const recusarProposta = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.post(`/cliente/propostas/${id}/recusar`);

      if (response.data?.success) {
        const index = propostas.value.findIndex((p) => p.id === id);
        if (index !== -1 && propostas.value[index]) {
          propostas.value[index].status = 'recusada';
        }
        if (propostaSelecionada.value?.id === id) {
          propostaSelecionada.value.status = 'recusada';
        }
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao recusar proposta:', err);
      error.value = getErrorMessage(err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  /**
   * Responder proposta (aceitar/recusar)
   */
  const responderProposta = async (id: number, acao: 'aceitar' | 'recusar'): Promise<boolean> => {
    if (acao === 'aceitar') {
      return await aceitarProposta(id);
    } else {
      return await recusarProposta(id);
    }
  };

  /**
   * Contagem de propostas pendentes (para badge)
   */
  const contarPropostasPendentes = async (): Promise<number> => {
    try {
      const response = await api.get('/cliente/propostas/pendentes/count');

      if (response.data?.success) {
        return response.data.count || 0;
      }
      return 0;
    } catch (err) {
      console.error('Erro ao contar propostas pendentes:', err);
      return 0;
    }
  };

  /**
   * Verificar se já existe proposta aceita para um pedido
   */
  const verificarPropostaAceita = async (pedidoId: number): Promise<{ aceita: boolean; proposta_id: number | null }> => {
    try {
      const response = await api.get(`/cliente/propostas/check/${pedidoId}`);

      if (response.data?.success && response.data.data) {
        return {
          aceita: response.data.data.aceita || false,
          proposta_id: response.data.data.proposta_id || null,
        };
      }
      return { aceita: false, proposta_id: null };
    } catch (err) {
      console.error('Erro ao verificar proposta aceita:', err);
      return { aceita: false, proposta_id: null };
    }
  };

  // ===================== FILTROS E PAGINAÇÃO =====================

  const setFiltro = (key: keyof FiltrosPropostas, value: string | number | null): void => {
    if (key === 'status') filtros.value.status = value as string | null;
    else if (key === 'busca') filtros.value.busca = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarPropostas(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      status: null,
      busca: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarPropostas(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarPropostas(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarPropostas(true),
      carregarEstatisticas(),
    ]);
  };

  // ===================== UTILITÁRIOS =====================

  const limparStore = (): void => {
    propostas.value = [];
    propostaSelecionada.value = null;
    estatisticas.value = {
      total: 0,
      pendentes: 0,
      enviadas: 0,
      aceitas: 0,
      recusadas: 0,
      expiradas: 0,
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      status: null,
      busca: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isSending,
    error,
    dadosCarregados,
    propostas,
    propostaSelecionada,
    estatisticas,
    paginacao,
    filtros,

    // Getters
    totalPropostas,
    temPropostas,
    temProximaPagina,
    temPaginaAnterior,
    propostasPendentes,
    propostasAceitas,
    propostasRecusadas,

    // Funções auxiliares
    getStatusLabel,
    getStatusColor,
    getStatusIcon,
    getErrorMessage,

    // Ações
    carregarPropostas,
    carregarEstatisticas,
    buscarProposta,
    aceitarProposta,
    recusarProposta,
    responderProposta,
    contarPropostasPendentes,
    verificarPropostaAceita,

    // Filtros e paginação
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,

    // Utilitários
    limparStore,
  };
});

export default useClientePropostasStore;
