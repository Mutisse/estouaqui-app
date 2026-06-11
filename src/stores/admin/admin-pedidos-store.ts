// src/stores/admin/admin-pedidos-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Proposta {
  id: number;
  pedido_id: number;
  prestador_id: number;
  valor: number;
  mensagem: string;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  updated_at: string;
  prestador?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    foto: string | null;
    profissao?: string;
    media_avaliacao?: number;
  };
}

export interface Pedido {
  id: number;
  numero: string;
  cliente_id: number;
  prestador_id: number | null;
  categoria_id: number;
  descricao: string;
  endereco?: string;
  foto?: string | null;
  status: 'pendente' | 'aceito' | 'em_andamento' | 'concluido' | 'cancelado';
  valor: number;
  agendado_para?: string;
  concluido_em?: string | null;
  created_at: string;
  updated_at: string;
  distancia_km?: number;
  total_propostas?: number;
  propostas?: Proposta[];
  cliente?: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    foto?: string | null;
  } | null;
  prestador?: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    foto?: string | null;
    profissao?: string;
  } | null;
  categoria?: {
    id: number;
    nome: string;
    icone?: string;
  } | null;
}

export interface FiltrosPedidos {
  search: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  page: number;
  perPage: number;
}

export interface PaginacaoData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface EstatisticasPedidos {
  total: number;
  pendentes: number;
  aceitos: number;
  em_andamento: number;
  concluidos: number;
  cancelados: number;
  valor_total: number;
  valor_medio: number;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  message?: string;
  contadores?: EstatisticasPedidos;
}

// ===================== STORE =====================

export const useAdminPedidosStore = defineStore('adminPedidos', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const pedidos = ref<Pedido[]>([]);
  const pedidoSelecionado = ref<Pedido | null>(null);
  const propostasPedido = ref<Proposta[]>([]);

  const estatisticas = ref<EstatisticasPedidos>({
    total: 0,
    pendentes: 0,
    aceitos: 0,
    em_andamento: 0,
    concluidos: 0,
    cancelados: 0,
    valor_total: 0,
    valor_medio: 0,
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosPedidos>({
    search: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // Opções de status para filtro
  const opcoesStatus = [
    { label: 'Todos', value: '' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Aceito', value: 'aceito' },
    { label: 'Em andamento', value: 'em_andamento' },
    { label: 'Concluído', value: 'concluido' },
    { label: 'Cancelado', value: 'cancelado' },
  ];

  // Cores dos status
  const statusColors: Record<string, string> = {
    pendente: 'orange',
    aceito: 'blue',
    em_andamento: 'purple',
    concluido: 'green',
    cancelado: 'red',
  };

  // Labels dos status
  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  // Cores dos status das propostas
  const propostaStatusColors: Record<string, string> = {
    pendente: 'orange',
    aceita: 'green',
    recusada: 'red',
  };

  const propostaStatusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aceita: 'Aceita',
    recusada: 'Recusada',
  };

  // Getters computados
  const totalPedidos = computed(() => paginacao.value.total);
  const temPedidos = computed(() => pedidos.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  // Computed para pedidos filtrados (CLIENT-SIDE)
  const pedidosFiltrados = computed(() => {
    let resultado = [...pedidos.value];

    if (filtros.value.search) {
      const searchLower = filtros.value.search.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.numero?.toLowerCase().includes(searchLower) ||
          p.cliente?.nome?.toLowerCase().includes(searchLower) ||
          p.prestador?.nome?.toLowerCase().includes(searchLower) ||
          p.descricao?.toLowerCase().includes(searchLower)
      );
    }

    if (filtros.value.status && filtros.value.status !== '') {
      resultado = resultado.filter((p) => p.status === filtros.value.status);
    }

    if (filtros.value.data_inicio) {
      resultado = resultado.filter((p) => p.created_at >= filtros.value.data_inicio);
    }

    if (filtros.value.data_fim) {
      resultado = resultado.filter((p) => p.created_at <= filtros.value.data_fim);
    }

    return resultado;
  });

  // ===================== AÇÕES =====================

  const carregarPedidos = async (resetPage = true): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      if (resetPage) {
        filtros.value.page = 1;
      }

      const params: ApiParams = {
        page: filtros.value.page,
        per_page: filtros.value.perPage,
      };

      if (filtros.value.search) params.search = filtros.value.search;
      if (filtros.value.status && filtros.value.status !== '') params.status = filtros.value.status;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get<ApiResponse<Pedido[]>>('/admin/pedidos', { params });

      if (response.data?.success) {
        pedidos.value = Array.isArray(response.data.data) ? response.data.data : [];

        paginacao.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
        };

        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();

        if (response.data.contadores) {
          estatisticas.value = response.data.contadores;
        } else {
          atualizarEstatisticasLocal();
        }
      } else {
        pedidos.value = [];
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar pedidos';
      pedidos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const atualizarEstatisticasLocal = (): void => {
    const lista = pedidos.value;
    estatisticas.value = {
      total: lista.length,
      pendentes: lista.filter(p => p.status === 'pendente').length,
      aceitos: lista.filter(p => p.status === 'aceito').length,
      em_andamento: lista.filter(p => p.status === 'em_andamento').length,
      concluidos: lista.filter(p => p.status === 'concluido').length,
      cancelados: lista.filter(p => p.status === 'cancelado').length,
      valor_total: lista.reduce((acc, p) => acc + (Number(p.valor) || 0), 0),
      valor_medio: lista.length > 0
        ? lista.reduce((acc, p) => acc + (Number(p.valor) || 0), 0) / lista.length
        : 0,
    };
  };

  const buscarPedido = async (id: number): Promise<Pedido | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Pedido>>(`/admin/pedidos/${id}`);
      if (response.data?.success && response.data.data) {
        pedidoSelecionado.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar pedido';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const buscarPropostasDoPedido = async (pedidoId: number): Promise<Proposta[]> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Proposta[]>>(`/admin/pedidos/${pedidoId}/propostas`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        propostasPedido.value = response.data.data;
        return response.data.data;
      }
      propostasPedido.value = [];
      return [];
    } catch (err) {
      console.error('Erro ao buscar propostas:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar propostas';
      propostasPedido.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const aceitarProposta = async (propostaId: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.post(`/admin/propostas/${propostaId}/aceitar`);
      if (response.data?.success) {
        await carregarPedidos(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao aceitar proposta:', err);
      error.value = (err as AxiosError).message || 'Erro ao aceitar proposta';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const recusarProposta = async (propostaId: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.post(`/admin/propostas/${propostaId}/recusar`);
      if (response.data?.success) {
        await carregarPedidos(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao recusar proposta:', err);
      error.value = (err as AxiosError).message || 'Erro ao recusar proposta';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarStatusPedido = async (id: number, status: string, motivo?: string): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      let response;
      if (status === 'cancelado') {
        response = await api.post(`/admin/pedidos/${id}/cancelar`, { motivo: motivo || 'Cancelado pelo administrador' });
      } else {
        response = await api.put(`/admin/pedidos/${id}/status`, { status });
      }

      if (response.data?.success) {
        await carregarPedidos(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar status';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const cancelarPedido = async (id: number, motivo: string): Promise<boolean> => {
    return atualizarStatusPedido(id, 'cancelado', motivo);
  };

  const excluirPedido = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete(`/admin/pedidos/${id}`);
      if (response.data?.success) {
        await carregarPedidos(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir pedido';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosPedidos, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarPedidos(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarPedidos(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarPedidos(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarPedidos(true);
  };

  const limparStore = (): void => {
    pedidos.value = [];
    pedidoSelecionado.value = null;
    propostasPedido.value = [];
    estatisticas.value = {
      total: 0,
      pendentes: 0,
      aceitos: 0,
      em_andamento: 0,
      concluidos: 0,
      cancelados: 0,
      valor_total: 0,
      valor_medio: 0,
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  // Funções auxiliares
  const getStatusLabel = (status: string): string => {
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    return statusColors[status] || 'grey';
  };

  const getPropostaStatusLabel = (status: string): string => {
    return propostaStatusLabels[status] || status;
  };

  const getPropostaStatusColor = (status: string): string => {
    return propostaStatusColors[status] || 'grey';
  };

  const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(Number(value) || 0);
  };

  const formatarData = (dataString: string): string => {
    if (!dataString) return '—';
    try {
      const date = new Date(dataString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const formatarDataCompleta = (dataString: string): string => {
    if (!dataString) return '—';
    try {
      const date = new Date(dataString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    pedidos,
    pedidoSelecionado,
    propostasPedido,
    estatisticas,
    paginacao,
    filtros,
    opcoesStatus,
    statusColors,
    statusLabels,
    propostaStatusColors,
    propostaStatusLabels,
    // Getters computados
    totalPedidos,
    temPedidos,
    temProximaPagina,
    temPaginaAnterior,
    pedidosFiltrados,  // <-- ADICIONADO
    // Actions
    carregarPedidos,
    buscarPedido,
    buscarPropostasDoPedido,
    aceitarProposta,
    recusarProposta,
    atualizarStatusPedido,
    cancelarPedido,
    excluirPedido,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
    // Helpers
    getStatusLabel,
    getStatusColor,
    getPropostaStatusLabel,
    getPropostaStatusColor,
    formatMoney,
    formatarData,
    formatarDataCompleta,
  };
});

export default useAdminPedidosStore;
