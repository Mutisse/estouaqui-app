// src/stores/admin/admin-notificacoes-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

// ✅ Tipo para os dados dinâmicos da notificação
export interface NotificacaoData {
  title?: string;
  body?: string;
  pedido_numero?: string;
  pedido_id?: number;
  cliente_nome?: string;
  prestador_nome?: string;
  valor?: number;
  nota?: number;
  cupom?: string;
  desconto?: number;
  [key: string]: unknown; // Para outros campos dinâmicos
}

export interface Notificacao {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: NotificacaoData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateNotificacao {
  type: string;
  title_pt: string;
  title_en: string;
  body_pt: string;
  body_en: string;
  icon: string;
  color: string;
  channels: string[];
}

// ✅ Tipo para os dados ao enviar notificação
export interface EnviarNotificacaoData {
  user_id?: number;
  user_ids?: number[];
  tipo_usuario?: 'cliente' | 'prestador' | 'admin' | 'todos';
  type: string;
  data: NotificacaoData;
  channels?: string[];
}

export interface FiltrosNotificacoes {
  search: string;
  tipo: string;
  lida: string;
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

export interface EstatisticasNotificacoes {
  total: number;
  lidas: number;
  nao_lidas: number;
  por_tipo: Record<string, number>;
}

// ✅ Interface para resposta da API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  tipo?: string;
  lida?: string;
  data_inicio?: string;
  data_fim?: string;
}

// ===================== STORE =====================

export const useAdminNotificacoesStore = defineStore('adminNotificacoes', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const notificacoes = ref<Notificacao[]>([]);
  const templates = ref<TemplateNotificacao[]>([]);
  const notificacaoSelecionada = ref<Notificacao | null>(null);
  const estatisticas = ref<EstatisticasNotificacoes>({
    total: 0,
    lidas: 0,
    nao_lidas: 0,
    por_tipo: {},
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosNotificacoes>({
    search: '',
    tipo: '',
    lida: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // Opções para selects
  const opcoesTipo = [
    { label: 'Todos', value: '' },
    { label: 'Pedidos', value: 'pedido' },
    { label: 'Promoções', value: 'promocao' },
    { label: 'Sistema', value: 'sistema' },
    { label: 'Segurança', value: 'seguranca' },
  ];

  const opcoesLida = [
    { label: 'Todos', value: '' },
    { label: 'Lidas', value: 'sim' },
    { label: 'Não lidas', value: 'nao' },
  ];

  const opcoesTipoUsuario = [
    { label: 'Todos os Usuários', value: 'todos' },
    { label: 'Clientes', value: 'cliente' },
    { label: 'Prestadores', value: 'prestador' },
    { label: 'Administradores', value: 'admin' },
  ];

  // Getters
  const totalNotificacoes = computed(() => paginacao.value.total);
  const temNotificacoes = computed(() => notificacoes.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  // ===================== AÇÕES =====================

  const carregarNotificacoes = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.lida) params.lida = filtros.value.lida;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get<ApiResponse<Notificacao[]>>('/admin/notificacoes', { params });

      if (response.data?.success) {
        notificacoes.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 15,
          total: response.data.total || response.data.meta?.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar notificações';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasNotificacoes>>('/admin/notificacoes/estatisticas');
      if (response.data?.success) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const carregarTemplates = async (): Promise<TemplateNotificacao[]> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<TemplateNotificacao[]>>('/admin/notificacoes/templates');
      if (response.data?.success) {
        templates.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const buscarNotificacao = async (id: number): Promise<Notificacao | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Notificacao>>(`/admin/notificacoes/${id}`);
      if (response.data?.success && response.data.data) {
        notificacaoSelecionada.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar notificação:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar notificação';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const marcarComoLida = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.put<ApiResponse<null>>(`/admin/notificacoes/${id}/marcar-lida`);
      if (response.data?.success) {
        await carregarNotificacoes(false);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const marcarTodasComoLidas = async (): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.put<ApiResponse<null>>('/admin/notificacoes/marcar-todas-lidas');
      if (response.data?.success) {
        await carregarNotificacoes(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const enviarNotificacao = async (data: EnviarNotificacaoData): Promise<boolean> => {
    isSending.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<null>>('/admin/notificacoes/enviar', data);
      if (response.data?.success) {
        await carregarNotificacoes(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
      error.value = (err as AxiosError).message || 'Erro ao enviar notificação';
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const excluirNotificacao = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/notificacoes/${id}`);
      if (response.data?.success) {
        await carregarNotificacoes(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir notificação:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosNotificacoes, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'tipo') filtros.value.tipo = value as string;
    else if (key === 'lida') filtros.value.lida = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarNotificacoes(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      tipo: '',
      lida: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarNotificacoes(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarNotificacoes(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarNotificacoes(true),
      carregarEstatisticas(),
    ]);
  };

  const limparStore = (): void => {
    notificacoes.value = [];
    templates.value = [];
    notificacaoSelecionada.value = null;
    estatisticas.value = {
      total: 0,
      lidas: 0,
      nao_lidas: 0,
      por_tipo: {},
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      tipo: '',
      lida: '',
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
    isSending,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    notificacoes,
    templates,
    notificacaoSelecionada,
    estatisticas,
    paginacao,
    filtros,
    opcoesTipo,
    opcoesLida,
    opcoesTipoUsuario,
    totalNotificacoes,
    temNotificacoes,
    temProximaPagina,
    temPaginaAnterior,
    carregarNotificacoes,
    carregarEstatisticas,
    carregarTemplates,
    buscarNotificacao,
    marcarComoLida,
    marcarTodasComoLidas,
    enviarNotificacao,
    excluirNotificacao,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminNotificacoesStore;
