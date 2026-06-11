// src/stores/admin/admin-utilizadores-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'cliente' | 'prestador' | 'admin' | 'root';
  verificado: boolean;
  disponivel: boolean;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  created_at: string;
  updated_at: string;
}

export interface UtilizadorForm {
  nome: string;
  email: string;
  telefone?: string;
  tipo: string;
  password?: string;
  profissao?: string;
  sobre?: string;
}

export interface FiltrosUtilizadores {
  search: string;
  tipo: string;
  verificado: string;
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
  tipo?: string;
  verificado?: boolean;
}

// ===================== STORE =====================

export const useAdminUtilizadoresStore = defineStore('adminUtilizadores', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const utilizadores = ref<Utilizador[]>([]);
  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosUtilizadores>({
    search: '',
    tipo: '',
    verificado: '',
    page: 1,
    perPage: 15,
  });

  const utilizadorSelecionado = ref<Utilizador | null>(null);

  // Getters
  const totalUtilizadores = computed(() => paginacao.value.total);
  const temUtilizadores = computed(() => utilizadores.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  const utilizadoresFiltrados = computed(() => {
    let resultado = [...utilizadores.value];

    if (filtros.value.search) {
      const searchLower = filtros.value.search.toLowerCase();
      resultado = resultado.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.telefone && u.telefone.includes(searchLower))
      );
    }

    if (filtros.value.tipo) {
      resultado = resultado.filter((u) => u.tipo === filtros.value.tipo);
    }

    if (filtros.value.verificado) {
      const verificado = filtros.value.verificado === 'sim';
      resultado = resultado.filter((u) => u.verificado === verificado);
    }

    return resultado;
  });

  // ===================== AÇÕES =====================

  const carregarUtilizadores = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.tipo) params.tipo = filtros.value.tipo;
      if (filtros.value.verificado) params.verificado = filtros.value.verificado === 'sim';

      const response = await api.get('/admin/utilizadores', { params });

      if (response.data?.success) {
        utilizadores.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 15,
          total: response.data.total || response.data.meta?.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        utilizadores.value = response.data;
      }
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar utilizadores';
    } finally {
      isLoading.value = false;
    }
  };

  const buscarUtilizador = async (id: number): Promise<Utilizador | null> => {
    isLoading.value = true;
    try {
      const response = await api.get(`/admin/utilizadores/${id}`);
      if (response.data?.success && response.data.data) {
        utilizadorSelecionado.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar utilizador:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar utilizador';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const criarUtilizador = async (data: UtilizadorForm): Promise<Utilizador | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.post('/admin/utilizadores', data);
      if (response.data?.success && response.data.data) {
        await carregarUtilizadores(true);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar utilizador:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar utilador';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarUtilizador = async (id: number, data: Partial<UtilizadorForm>): Promise<Utilizador | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}`, data);
      if (response.data?.success && response.data.data) {
        await carregarUtilizadores(false);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar utilizador:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar utilizador';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const removerUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete(`/admin/utilizadores/${id}`);
      if (response.data?.success) {
        await carregarUtilizadores(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir utilizador:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ✅ NOVA FUNÇÃO: Verificar utilizador (prestador)
  const verificarUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/verificar`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao verificar utilizador:', err);
      error.value = (err as AxiosError).message || 'Erro ao verificar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosUtilizadores, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'tipo') filtros.value.tipo = value as string;
    else if (key === 'verificado') filtros.value.verificado = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarUtilizadores(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      tipo: '',
      verificado: '',
      page: 1,
      perPage: 15,
    };
    void carregarUtilizadores(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarUtilizadores(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarUtilizadores(true);
  };

  const limparStore = (): void => {
    utilizadores.value = [];
    utilizadorSelecionado.value = null;
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      tipo: '',
      verificado: '',
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
    utilizadores,
    paginacao,
    filtros,
    utilizadorSelecionado,
    totalUtilizadores,
    temUtilizadores,
    temProximaPagina,
    temPaginaAnterior,
    utilizadoresFiltrados,
    carregarUtilizadores,
    buscarUtilizador,
    criarUtilizador,
    atualizarUtilizador,
    removerUtilizador,
    verificarUtilizador, // ✅ ADICIONADO
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminUtilizadoresStore;
