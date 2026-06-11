// src/stores/admin/admin-logs-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export type NivelLog = 'info' | 'warning' | 'error' | 'debug';
export type AcaoLog = 'login' | 'logout' | 'criar' | 'editar' | 'excluir' | 'visualizar' | 'exportar' | 'backup';

// ✅ Interface para dados dinâmicos (sem any)
export interface DadosLog {
  [key: string]: string | number | boolean | null | DadosLog | DadosLog[];
}

export interface LogSistema {
  id: number;
  user_id: number | null;
  user_nome: string | null;
  user_email: string | null;
  acao: AcaoLog;
  nivel: NivelLog;
  descricao: string;
  ip: string;
  user_agent: string;
  dados_anteriores?: DadosLog;
  dados_novos?: DadosLog;
  modulo: string;
  created_at: string;
}

export interface FiltrosLogs {
  search: string;
  nivel: string;
  acao: string;
  modulo: string;
  user_id: string;
  data_inicio: string;
  data_fim: string;
  ip: string;
  page: number;
  perPage: number;
}

export interface EstatisticasLogs {
  total: number;
  por_nivel: {
    info: number;
    warning: number;
    error: number;
    debug: number;
  };
  por_acao: Record<string, number>;
  por_modulo: Record<string, number>;
  logs_por_dia: Array<{ data: string; total: number }>;
  usuarios_ativos: Array<{ user_id: number; user_nome: string; total: number }>;
  ips_mais_frequentes: Array<{ ip: string; total: number }>;
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
  nivel?: string;
  acao?: string;
  modulo?: string;
  user_id?: string;
  data_inicio?: string;
  data_fim?: string;
  ip?: string;
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

// Opções para selects
export const opcoesNivel = [
  { label: 'Todos', value: '' },
  { label: 'ℹ️ Info', value: 'info' },
  { label: '⚠️ Warning', value: 'warning' },
  { label: '❌ Error', value: 'error' },
  { label: '🐛 Debug', value: 'debug' },
];

export const opcoesAcao = [
  { label: 'Todas', value: '' },
  { label: '🔐 Login', value: 'login' },
  { label: '🚪 Logout', value: 'logout' },
  { label: '➕ Criar', value: 'criar' },
  { label: '✏️ Editar', value: 'editar' },
  { label: '🗑️ Excluir', value: 'excluir' },
  { label: '👁️ Visualizar', value: 'visualizar' },
  { label: '📤 Exportar', value: 'exportar' },
  { label: '💾 Backup', value: 'backup' },
];

export const opcoesModulo = [
  { label: 'Todos', value: '' },
  { label: 'Auth', value: 'auth' },
  { label: 'Users', value: 'users' },
  { label: 'Pedidos', value: 'pedidos' },
  { label: 'Prestadores', value: 'prestadores' },
  { label: 'Clientes', value: 'clientes' },
  { label: 'Categorias', value: 'categorias' },
  { label: 'Promoções', value: 'promocoes' },
  { label: 'Configurações', value: 'configuracoes' },
  { label: 'Backups', value: 'backups' },
  { label: 'Relatórios', value: 'relatorios' },
];

// ===================== STORE =====================

export const useAdminLogsStore = defineStore('adminLogs', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const logs = ref<LogSistema[]>([]);
  const estatisticas = ref<EstatisticasLogs>({
    total: 0,
    por_nivel: { info: 0, warning: 0, error: 0, debug: 0 },
    por_acao: {},
    por_modulo: {},
    logs_por_dia: [],
    usuarios_ativos: [],
    ips_mais_frequentes: [],
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosLogs>({
    search: '',
    nivel: '',
    acao: '',
    modulo: '',
    user_id: '',
    data_inicio: '',
    data_fim: '',
    ip: '',
    page: 1,
    perPage: 15,
  });

  // Getters
  const totalLogs = computed(() => paginacao.value.total);
  const temLogs = computed(() => logs.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);

  // Funções auxiliares
  const getNivelIcon = (nivel: string): string => {
    const icons: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      debug: 'bug_report',
    };
    return icons[nivel] || 'info';
  };

  const getNivelColor = (nivel: string): string => {
    const colors: Record<string, string> = {
      info: 'info',
      warning: 'orange',
      error: 'negative',
      debug: 'purple',
    };
    return colors[nivel] || 'grey';
  };

  const getAcaoIcon = (acao: string): string => {
    const icons: Record<string, string> = {
      login: 'login',
      logout: 'logout',
      criar: 'add',
      editar: 'edit',
      excluir: 'delete',
      visualizar: 'visibility',
      exportar: 'download',
      backup: 'backup',
    };
    return icons[acao] || 'info';
  };

  const getAcaoColor = (acao: string): string => {
    const colors: Record<string, string> = {
      login: 'positive',
      logout: 'grey',
      criar: 'positive',
      editar: 'warning',
      excluir: 'negative',
      visualizar: 'info',
      exportar: 'primary',
      backup: 'purple',
    };
    return colors[acao] || 'grey';
  };

  const getAcaoLabel = (acao: string): string => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      criar: 'Criar',
      editar: 'Editar',
      excluir: 'Excluir',
      visualizar: 'Visualizar',
      exportar: 'Exportar',
      backup: 'Backup',
    };
    return labels[acao] || acao;
  };

  // ===================== AÇÕES =====================

  const carregarLogs = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.nivel) params.nivel = filtros.value.nivel;
      if (filtros.value.acao) params.acao = filtros.value.acao;
      if (filtros.value.modulo) params.modulo = filtros.value.modulo;
      if (filtros.value.user_id) params.user_id = filtros.value.user_id;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;
      if (filtros.value.ip) params.ip = filtros.value.ip;

      const response = await api.get<ApiResponse<LogSistema[]>>('/admin/logs', { params });

      if (response.data?.success) {
        logs.value = response.data.data;
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
      console.error('Erro ao carregar logs:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar logs';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasLogs>>('/admin/logs/estatisticas', {
        params: {
          data_inicio: filtros.value.data_inicio,
          data_fim: filtros.value.data_fim,
        },
      });
      if (response.data?.success) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const limparLogs = async (): Promise<boolean> => {
    isLoading.value = true;
    try {
      const response = await api.delete<ApiResponse<null>>('/admin/logs/limpar');
      if (response.data?.success) {
        await carregarLogs(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao limpar logs:', err);
      error.value = (err as AxiosError).message || 'Erro ao limpar logs';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const exportarLogs = async (formato: 'csv' | 'json' | 'excel'): Promise<Blob | null> => {
    isLoading.value = true;
    try {
      const params: Record<string, string | undefined> = {
        formato,
        data_inicio: filtros.value.data_inicio,
        data_fim: filtros.value.data_fim,
      };
      if (filtros.value.search) params.search = filtros.value.search;
      if (filtros.value.nivel) params.nivel = filtros.value.nivel;
      if (filtros.value.acao) params.acao = filtros.value.acao;

      const response = await api.get('/admin/logs/exportar', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      console.error('Erro ao exportar logs:', err);
      error.value = (err as AxiosError).message || 'Erro ao exportar logs';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosLogs, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'nivel') filtros.value.nivel = value as string;
    else if (key === 'acao') filtros.value.acao = value as string;
    else if (key === 'modulo') filtros.value.modulo = value as string;
    else if (key === 'user_id') filtros.value.user_id = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'ip') filtros.value.ip = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarLogs(false);
    void carregarEstatisticas();
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      nivel: '',
      acao: '',
      modulo: '',
      user_id: '',
      data_inicio: '',
      data_fim: '',
      ip: '',
      page: 1,
      perPage: 15,
    };
    void carregarLogs(true);
    void carregarEstatisticas();
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarLogs(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarLogs(true),
      carregarEstatisticas(),
    ]);
  };

  const limparStore = (): void => {
    logs.value = [];
    estatisticas.value = {
      total: 0,
      por_nivel: { info: 0, warning: 0, error: 0, debug: 0 },
      por_acao: {},
      por_modulo: {},
      logs_por_dia: [],
      usuarios_ativos: [],
      ips_mais_frequentes: [],
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      nivel: '',
      acao: '',
      modulo: '',
      user_id: '',
      data_inicio: '',
      data_fim: '',
      ip: '',
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
    error,
    dadosCarregados,
    ultimaAtualizacao,
    logs,
    estatisticas,
    paginacao,
    filtros,

    // Opções
    opcoesNivel,
    opcoesAcao,
    opcoesModulo,

    // Getters
    totalLogs,
    temLogs,
    temProximaPagina,
    temPaginaAnterior,

    // Funções auxiliares
    getNivelIcon,
    getNivelColor,
    getAcaoIcon,
    getAcaoColor,
    getAcaoLabel,

    // Actions
    carregarLogs,
    carregarEstatisticas,
    limparLogs,
    exportarLogs,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminLogsStore;
