// src/stores/admin/admin-promocoes-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Promocao {
  id: number;
  codigo: string;
  descricao: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  valor_minimo: number;
  validade_inicio: string;
  validade_fim: string;
  ativo: boolean;
  usado_quantidade: number;
  max_usos: number;
  created_at: string;
  updated_at: string;
}

export interface PromocaoForm {
  codigo: string;
  descricao: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  valor_minimo: number;
  validade_inicio: string;
  validade_fim: string;
  ativo: boolean;
  max_usos: number;
}

export interface FiltrosPromocoes {
  search: string;
  status: string;
  tipo_desconto: string;
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

export interface EstatisticasPromocoes {
  total: number;
  ativas: number;
  expiradas: number;
  uso_total: number;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  tipo_desconto?: string;
  data_inicio?: string;
  data_fim?: string;
}

// ===================== STORE =====================

export const useAdminPromocoesStore = defineStore('adminPromocoes', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const promocoes = ref<Promocao[]>([]);
  const promocaoSelecionada = ref<Promocao | null>(null);
  const estatisticas = ref<EstatisticasPromocoes>({
    total: 0,
    ativas: 0,
    expiradas: 0,
    uso_total: 0,
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosPromocoes>({
    search: '',
    status: '',
    tipo_desconto: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  const opcoesStatus = [
    { label: 'Ativas', value: 'ativa' },
    { label: 'Expiradas', value: 'expirada' },
    { label: 'Inativas', value: 'inativa' },
  ];

  const opcoesTipoDesconto = [
    { label: 'Percentual (%)', value: 'percentual' },
    { label: 'Valor Fixo (MZN)', value: 'fixo' },
  ];

  // Getters
  const totalPromocoes = computed(() => paginacao.value.total);
  const temPromocoes = computed(() => promocoes.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  const promocoesFiltradas = computed(() => {
    let resultado = [...promocoes.value];

    if (filtros.value.search) {
      const searchLower = filtros.value.search.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.codigo.toLowerCase().includes(searchLower) ||
          (p.descricao && p.descricao.toLowerCase().includes(searchLower))
      );
    }

    if (filtros.value.status) {
      const hoje = new Date();
      if (filtros.value.status === 'ativa') {
        resultado = resultado.filter(p =>
          p.ativo && new Date(p.validade_fim) >= hoje && new Date(p.validade_inicio) <= hoje
        );
      } else if (filtros.value.status === 'expirada') {
        resultado = resultado.filter(p => new Date(p.validade_fim) < hoje);
      } else if (filtros.value.status === 'inativa') {
        resultado = resultado.filter(p => !p.ativo);
      }
    }

    if (filtros.value.tipo_desconto) {
      resultado = resultado.filter(p => p.tipo_desconto === filtros.value.tipo_desconto);
    }

    return resultado;
  });

  // ===================== AÇÕES =====================

  const carregarPromocoes = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.status) params.status = filtros.value.status;
      if (filtros.value.tipo_desconto) params.tipo_desconto = filtros.value.tipo_desconto;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get('/admin/promocoes', { params });

      if (response.data?.success) {
        promocoes.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 15,
          total: response.data.total || response.data.meta?.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        promocoes.value = response.data;
      }
    } catch (err) {
      console.error('Erro ao carregar promoções:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar promoções';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get('/admin/promocoes/estatisticas');
      if (response.data?.success && response.data.data) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const buscarPromocao = async (id: number): Promise<Promocao | null> => {
    isLoading.value = true;
    try {
      const response = await api.get(`/admin/promocoes/${id}`);
      if (response.data?.success && response.data.data) {
        promocaoSelecionada.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar promoção:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar promoção';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const criarPromocao = async (data: PromocaoForm): Promise<Promocao | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.post('/admin/promocoes', data);
      if (response.data?.success && response.data.data) {
        await carregarPromocoes(true);
        await carregarEstatisticas();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar promoção:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar promoção';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarPromocao = async (id: number, data: Partial<PromocaoForm>): Promise<Promocao | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/promocoes/${id}`, data);
      if (response.data?.success && response.data.data) {
        await carregarPromocoes(false);
        await carregarEstatisticas();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar promoção:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar promoção';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const excluirPromocao = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete(`/admin/promocoes/${id}`);
      if (response.data?.success) {
        await carregarPromocoes(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir promoção:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir promoção';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const alternarStatusPromocao = async (id: number, ativo: boolean): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put(`/admin/promocoes/${id}/status`, { ativo });
      if (response.data?.success) {
        await carregarPromocoes(false);
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

  const setFiltro = (key: keyof FiltrosPromocoes, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'tipo_desconto') filtros.value.tipo_desconto = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarPromocoes(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      status: '',
      tipo_desconto: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarPromocoes(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarPromocoes(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarPromocoes(true),
      carregarEstatisticas(),
    ]);
  };

  const limparStore = (): void => {
    promocoes.value = [];
    promocaoSelecionada.value = null;
    estatisticas.value = {
      total: 0,
      ativas: 0,
      expiradas: 0,
      uso_total: 0,
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
      tipo_desconto: '',
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
    promocoes,
    promocaoSelecionada,
    estatisticas,
    paginacao,
    filtros,
    opcoesStatus,
    opcoesTipoDesconto,
    totalPromocoes,
    temPromocoes,
    temProximaPagina,
    temPaginaAnterior,
    promocoesFiltradas,
    carregarPromocoes,
    carregarEstatisticas,
    buscarPromocao,
    criarPromocao,
    atualizarPromocao,
    excluirPromocao,
    alternarStatusPromocao,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminPromocoesStore;
