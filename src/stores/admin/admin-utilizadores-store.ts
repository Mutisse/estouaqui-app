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
  status: 'ativo' | 'desativado' | 'bloqueado' | 'pendente' | 'reprovado';
  verificado: boolean;
  disponivel: boolean;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  raio_atendimento?: number;
  categorias?: Array<{
    id: number;
    nome: string;
    icone?: string;
    cor?: string;
    slug?: string;
  }>;
  servicos?: Array<{
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
    categoria_id?: number;
  }>;
  configuracoes?: {
    notificacoes_email?: boolean;
    notificacoes_push?: boolean;
    idioma?: string;
    tema?: string;
  };
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
  status: string;
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
  status?: string;
}

// ===================== STORE =====================

export const useAdminUtilizadoresStore = defineStore('adminUtilizadores', () => {
  const authStore = useAuthStore();

  // ===================== ESTADOS =====================
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
    status: '',
    page: 1,
    perPage: 15,
  });

  const utilizadorSelecionado = ref<Utilizador | null>(null);

  // ===================== GETTERS =====================

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

    if (filtros.value.status) {
      resultado = resultado.filter((u) => u.status === filtros.value.status);
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
      if (filtros.value.status) params.status = filtros.value.status;

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
      const axiosError = err as AxiosError;
      console.error('Erro ao carregar utilizadores:', err);
      error.value = axiosError.message || 'Erro ao carregar utilizadores';
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
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar utilizador:', err);
      error.value = axiosError.message || 'Erro ao buscar utilizador';
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
      const axiosError = err as AxiosError;
      console.error('Erro ao criar utilizador:', err);
      error.value = axiosError.message || 'Erro ao criar utilizador';
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
      const axiosError = err as AxiosError;
      console.error('Erro ao atualizar utilizador:', err);
      error.value = axiosError.message || 'Erro ao atualizar utilizador';
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
      const axiosError = err as AxiosError;
      console.error('Erro ao excluir utilizador:', err);
      error.value = axiosError.message || 'Erro ao excluir utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ==========================================
  // 🔥 AÇÕES DE GESTÃO DE STATUS
  // ==========================================

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
      const axiosError = err as AxiosError;
      console.error('Erro ao verificar utilizador:', err);
      error.value = axiosError.message || 'Erro ao verificar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const aprovarUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/aprovar`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao aprovar utilizador:', err);
      error.value = axiosError.message || 'Erro ao aprovar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const reprovarUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/reprovar`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao reprovar utilizador:', err);
      error.value = axiosError.message || 'Erro ao reprovar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const ativarUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/ativar`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao ativar utilizador:', err);
      error.value = axiosError.message || 'Erro ao ativar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const desativarUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/desativar`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao desativar utilizador:', err);
      error.value = axiosError.message || 'Erro ao desativar utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const bloquearUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/bloquear`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao bloquear utilizador:', err);
      error.value = axiosError.message || 'Erro ao bloquear utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const desbloquearUtilizador = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put(`/admin/utilizadores/${id}/desbloquear`);
      if (response.data?.success) {
        await carregarUtilizadores(false);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao desbloquear utilizador:', err);
      error.value = axiosError.message || 'Erro ao desbloquear utilizador';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== FILTROS E PAGINAÇÃO =====================

  const setFiltro = (key: keyof FiltrosUtilizadores, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'tipo') filtros.value.tipo = value as string;
    else if (key === 'verificado') filtros.value.verificado = value as string;
    else if (key === 'status') filtros.value.status = value as string;
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
      status: '',
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
      status: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  // ==========================================
  // 🔥 EXPORTAÇÕES
  // ==========================================

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    utilizadores,
    paginacao,
    filtros,
    utilizadorSelecionado,

    // Getters
    totalUtilizadores,
    temUtilizadores,
    temProximaPagina,
    temPaginaAnterior,
    utilizadoresFiltrados,

    // CRUD
    carregarUtilizadores,
    buscarUtilizador,
    criarUtilizador,
    atualizarUtilizador,
    removerUtilizador,

    // Ações de Status
    verificarUtilizador,
    aprovarUtilizador,
    reprovarUtilizador,
    ativarUtilizador,
    desativarUtilizador,
    bloquearUtilizador,
    desbloquearUtilizador,

    // Filtros e Paginação
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminUtilizadoresStore;
