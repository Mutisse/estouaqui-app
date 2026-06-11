// src/stores/admin/admin-avaliacoes-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Avaliacao {
  id: number;
  cliente_id: number;
  prestador_id: number;
  pedido_id: number;
  nota: number;
  comentario: string | null;
  status: 'aprovada' | 'pendente' | 'rejeitada';
  created_at: string;
  updated_at: string;
  cliente?: {
    id: number;
    nome: string;
    email: string;
    foto: string | null;
  };
  prestador?: {
    id: number;
    nome: string;
    email: string;
    foto: string | null;
    profissao: string;
  };
  pedido?: {
    id: number;
    numero: string;
    valor: number;
  };
}

export interface FiltrosAvaliacoes {
  search: string;
  nota: string;
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

export interface EstatisticasAvaliacoes {
  total: number;
  media_global: number;
  por_nota: {
    nota_1: number;
    nota_2: number;
    nota_3: number;
    nota_4: number;
    nota_5: number;
  };
  top_prestadores: Array<{
    id: number;
    nome: string;
    profissao: string;
    media: number;
    total_avaliacoes: number;
  }>;
  avaliacoes_por_mes: Array<{ mes: string; total: number }>;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  nota?: string;
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
}

// ===================== STORE =====================

export const useAdminAvaliacoesStore = defineStore('adminAvaliacoes', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const avaliacoes = ref<Avaliacao[]>([]);
  const avaliacaoSelecionada = ref<Avaliacao | null>(null);
  const estatisticas = ref<EstatisticasAvaliacoes>({
    total: 0,
    media_global: 0,
    por_nota: {
      nota_1: 0,
      nota_2: 0,
      nota_3: 0,
      nota_4: 0,
      nota_5: 0,
    },
    top_prestadores: [],
    avaliacoes_por_mes: [],
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosAvaliacoes>({
    search: '',
    nota: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // Opções para filtros
  const opcoesNota = [
    { label: 'Todas', value: '' },
    { label: '⭐ 1 estrela', value: '1' },
    { label: '⭐⭐ 2 estrelas', value: '2' },
    { label: '⭐⭐⭐ 3 estrelas', value: '3' },
    { label: '⭐⭐⭐⭐ 4 estrelas', value: '4' },
    { label: '⭐⭐⭐⭐⭐ 5 estrelas', value: '5' },
  ];

  const opcoesStatus = [
    { label: 'Todos', value: '' },
    { label: 'Aprovadas', value: 'aprovada' },
    { label: 'Pendentes', value: 'pendente' },
    { label: 'Rejeitadas', value: 'rejeitada' },
  ];

  // Getters
  const totalAvaliacoes = computed(() => paginacao.value.total);
  const temAvaliacoes = computed(() => avaliacoes.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  // ===================== AÇÕES =====================

  const carregarAvaliacoes = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.nota) params.nota = filtros.value.nota;
      if (filtros.value.status) params.status = filtros.value.status;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get<ApiResponse<Avaliacao[]>>('/admin/avaliacoes', { params });

      if (response.data?.success) {
        avaliacoes.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar avaliações';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasAvaliacoes>>('/admin/avaliacoes/estatisticas');
      if (response.data?.success && response.data.data) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const buscarAvaliacao = async (id: number): Promise<Avaliacao | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Avaliacao>>(`/admin/avaliacoes/${id}`);
      if (response.data?.success && response.data.data) {
        avaliacaoSelecionada.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar avaliação:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar avaliação';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const aprovarAvaliacao = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put<ApiResponse<Avaliacao>>(`/admin/avaliacoes/${id}/aprovar`);
      if (response.data?.success) {
        await carregarAvaliacoes(false);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao aprovar avaliação:', err);
      error.value = (err as AxiosError).message || 'Erro ao aprovar avaliação';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const rejeitarAvaliacao = async (id: number, motivo?: string): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put<ApiResponse<Avaliacao>>(`/admin/avaliacoes/${id}/rejeitar`, { motivo });
      if (response.data?.success) {
        await carregarAvaliacoes(false);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao rejeitar avaliação:', err);
      error.value = (err as AxiosError).message || 'Erro ao rejeitar avaliação';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const excluirAvaliacao = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/avaliacoes/${id}`);
      if (response.data?.success) {
        await carregarAvaliacoes(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir avaliação';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosAvaliacoes, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'nota') filtros.value.nota = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarAvaliacoes(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      nota: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarAvaliacoes(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarAvaliacoes(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarAvaliacoes(true),
      carregarEstatisticas(),
    ]);
  };

  const limparStore = (): void => {
    avaliacoes.value = [];
    avaliacaoSelecionada.value = null;
    estatisticas.value = {
      total: 0,
      media_global: 0,
      por_nota: {
        nota_1: 0,
        nota_2: 0,
        nota_3: 0,
        nota_4: 0,
        nota_5: 0,
      },
      top_prestadores: [],
      avaliacoes_por_mes: [],
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      nota: '',
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

  return {
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    avaliacoes,
    avaliacaoSelecionada,
    estatisticas,
    paginacao,
    filtros,
    opcoesNota,
    opcoesStatus,
    totalAvaliacoes,
    temAvaliacoes,
    temProximaPagina,
    temPaginaAnterior,
    carregarAvaliacoes,
    carregarEstatisticas,
    buscarAvaliacao,
    aprovarAvaliacao,
    rejeitarAvaliacao,
    excluirAvaliacao,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminAvaliacoesStore;
