// src/stores/admin/admin-servicos-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Servico {
  id: number;
  prestador_id: number;
  nome: string;
  descricao: string;
  categoria_id: number;
  duracao: number;
  preco_base: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: {
    id: number;
    nome: string;
    icone?: string;
  };
  prestador?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
}

export interface ServicoForm {
  nome: string;
  descricao: string;
  categoria_id: number | null;
  duracao: number;
  preco_base: number;
  ativo: boolean;
}

export interface FiltrosServicos {
  search: string;
  categoria_id: string;
  status: string;
  prestador_id: string;
  page: number;
  perPage: number;
}

export interface PaginacaoData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface EstatisticasServicos {
  total: number;
  ativos: number;
  inativos: number;
  total_prestadores: number;
  preco_medio: number;
  duracao_media: number;
  servicos_por_categoria: Record<string, number>;
}

export interface CategoriaOption {
  label: string;
  value: number;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  categoria_id?: string;
  status?: string;
  prestador_id?: string;
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

export const useAdminServicosStore = defineStore('adminServicos', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const servicos = ref<Servico[]>([]);
  const servicoSelecionado = ref<Servico | null>(null);
  const categorias = ref<CategoriaOption[]>([]);
  const estatisticas = ref<EstatisticasServicos>({
    total: 0,
    ativos: 0,
    inativos: 0,
    total_prestadores: 0,
    preco_medio: 0,
    duracao_media: 0,
    servicos_por_categoria: {},
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosServicos>({
    search: '',
    categoria_id: '',
    status: '',
    prestador_id: '',
    page: 1,
    perPage: 15,
  });

  // Opções para selects
  const opcoesStatus = [
    { label: 'Todos', value: '' },
    { label: 'Ativos', value: 'ativo' },
    { label: 'Inativos', value: 'inativo' },
  ];

  // Getters
  const totalServicos = computed(() => paginacao.value.total);
  const temServicos = computed(() => servicos.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  // ===================== AÇÕES =====================

  const carregarCategorias = async (): Promise<void> => {
    try {
      const response = await api.get<{ success: boolean; data: Array<{ id: number; nome: string; icone?: string }> }>('/categorias');
      if (response.data?.success && response.data.data) {
        categorias.value = response.data.data.map((cat) => ({
          label: `${cat.icone || '📌'} ${cat.nome}`,
          value: cat.id,
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar categorias';
    }
  };

  const carregarServicos = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.categoria_id) params.categoria_id = filtros.value.categoria_id;
      if (filtros.value.status) params.status = filtros.value.status;
      if (filtros.value.prestador_id) params.prestador_id = filtros.value.prestador_id;

      const response = await api.get<ApiResponse<Servico[]>>('/admin/servicos', { params });

      if (response.data?.success) {
        servicos.value = response.data.data;
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
      console.error('Erro ao carregar serviços:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar serviços';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasServicos>>('/admin/servicos/estatisticas');
      if (response.data?.success) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const buscarServico = async (id: number): Promise<Servico | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Servico>>(`/admin/servicos/${id}`);
      if (response.data?.success && response.data.data) {
        servicoSelecionado.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar serviço';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const criarServico = async (data: ServicoForm): Promise<Servico | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<Servico>>('/admin/servicos', data);
      if (response.data?.success && response.data.data) {
        await carregarServicos(true);
        await carregarEstatisticas();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar serviço';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarServico = async (id: number, data: Partial<ServicoForm>): Promise<Servico | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put<ApiResponse<Servico>>(`/admin/servicos/${id}`, data);
      if (response.data?.success && response.data.data) {
        await carregarServicos(false);
        await carregarEstatisticas();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar serviço';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const excluirServico = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/servicos/${id}`);
      if (response.data?.success) {
        await carregarServicos(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir serviço';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const alternarStatusServico = async (id: number, ativo: boolean): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put<ApiResponse<null>>(`/admin/servicos/${id}/status`, { ativo });
      if (response.data?.success) {
        await carregarServicos(false);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      error.value = (err as AxiosError).message || 'Erro ao alternar status';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosServicos, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'categoria_id') filtros.value.categoria_id = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'prestador_id') filtros.value.prestador_id = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarServicos(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      categoria_id: '',
      status: '',
      prestador_id: '',
      page: 1,
      perPage: 15,
    };
    void carregarServicos(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarServicos(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarServicos(true),
      carregarEstatisticas(),
      carregarCategorias(),
    ]);
  };

  const limparStore = (): void => {
    servicos.value = [];
    servicoSelecionado.value = null;
    categorias.value = [];
    estatisticas.value = {
      total: 0,
      ativos: 0,
      inativos: 0,
      total_prestadores: 0,
      preco_medio: 0,
      duracao_media: 0,
      servicos_por_categoria: {},
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      categoria_id: '',
      status: '',
      prestador_id: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  // Funções auxiliares
  const getStatusColor = (status: boolean): string => {
    return status ? 'positive' : 'negative';
  };

  const getStatusLabel = (status: boolean): string => {
    return status ? 'Ativo' : 'Inativo';
  };

  const formatarDuracao = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    servicos,
    servicoSelecionado,
    categorias,
    estatisticas,
    paginacao,
    filtros,
    opcoesStatus,
    // Getters
    totalServicos,
    temServicos,
    temProximaPagina,
    temPaginaAnterior,
    // Actions
    carregarCategorias,
    carregarServicos,
    carregarEstatisticas,
    buscarServico,
    criarServico,
    atualizarServico,
    excluirServico,
    alternarStatusServico,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
    // Helpers
    getStatusColor,
    getStatusLabel,
    formatarDuracao,
  };
});

export default useAdminServicosStore;
