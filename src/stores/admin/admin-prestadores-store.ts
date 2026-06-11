// src/stores/admin/admin-prestadores-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Prestador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  profissao: string;
  sobre?: string;
  verificado: boolean;
  disponivel: boolean;
  foto: string | null;
  media_avaliacao: number;
  total_avaliacoes: number;
  latitude?: number;
  longitude?: number;
  raio_atendimento?: number;
  created_at: string;
  updated_at: string;
}

export interface FiltrosPrestadores {
  search: string;
  verificado: string;
  profissao: string;
  page: number;
  perPage: number;
}

export interface PaginacaoData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  verificado?: boolean;
  profissao?: string;
}

// ===================== STORE =====================

export const useAdminPrestadoresStore = defineStore('adminPrestadores', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const prestadores = ref<Prestador[]>([]);
  const prestadorSelecionado = ref<Prestador | null>(null);

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosPrestadores>({
    search: '',
    verificado: '',
    profissao: '',
    page: 1,
    perPage: 15,
  });

  // Opções de profissões (para filtro)
  const opcoesProfissao = ref<{ label: string; value: string }[]>([]);

  // Getters
  const totalPrestadores = computed(() => paginacao.value.total);
  const temPrestadores = computed(() => prestadores.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  const prestadoresFiltrados = computed(() => {
    let resultado = [...prestadores.value];

    if (filtros.value.search) {
      const searchLower = filtros.value.search.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.profissao.toLowerCase().includes(searchLower)
      );
    }

    if (filtros.value.verificado) {
      const verificado = filtros.value.verificado === 'sim';
      resultado = resultado.filter((p) => p.verificado === verificado);
    }

    if (filtros.value.profissao) {
      resultado = resultado.filter((p) => p.profissao === filtros.value.profissao);
    }

    return resultado;
  });

  // ===================== AÇÕES =====================

  const carregarPrestadores = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.verificado) params.verificado = filtros.value.verificado === 'sim';
      if (filtros.value.profissao) params.profissao = filtros.value.profissao;

      const response = await api.get('/admin/prestadores', { params });

      if (response.data?.success) {
        prestadores.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 15,
          total: response.data.total || response.data.meta?.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        prestadores.value = response.data;
      }
    } catch (err) {
      console.error('Erro ao carregar prestadores:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar prestadores';
    } finally {
      isLoading.value = false;
    }
  };

  const buscarPrestador = async (id: number): Promise<Prestador | null> => {
    isLoading.value = true;
    try {
      const response = await api.get(`/admin/prestadores/${id}`);
      if (response.data?.success && response.data.data) {
        prestadorSelecionado.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar prestador:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar prestador';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const verificarPrestador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/prestadores/${id}/verificar`);
      if (response.data?.success) {
        await carregarPrestadores(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao verificar prestador:', err);
      error.value = (err as AxiosError).message || 'Erro ao verificar prestador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const excluirPrestador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete(`/admin/prestadores/${id}`);
      if (response.data?.success) {
        await carregarPrestadores(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir prestador:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir prestador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const carregarOpcoesProfissao = async (): Promise<void> => {
    try {
      const response = await api.get('/admin/prestadores/profissoes');
      if (response.data?.success && response.data.data) {
        opcoesProfissao.value = response.data.data.map((p: string) => ({
          label: p,
          value: p,
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar opções de profissão:', err);
    }
  };

  const setFiltro = (key: keyof FiltrosPrestadores, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'verificado') filtros.value.verificado = value as string;
    else if (key === 'profissao') filtros.value.profissao = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarPrestadores(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      verificado: '',
      profissao: '',
      page: 1,
      perPage: 15,
    };
    void carregarPrestadores(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarPrestadores(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarPrestadores(true);
  };

  const limparStore = (): void => {
    prestadores.value = [];
    prestadorSelecionado.value = null;
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      verificado: '',
      profissao: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    prestadores,
    prestadorSelecionado,
    paginacao,
    filtros,
    opcoesProfissao,

    // Getters
    totalPrestadores,
    temPrestadores,
    temProximaPagina,
    temPaginaAnterior,
    prestadoresFiltrados,

    // Actions
    carregarPrestadores,
    buscarPrestador,
    verificarPrestador,
    excluirPrestador,
    carregarOpcoesProfissao,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminPrestadoresStore;
