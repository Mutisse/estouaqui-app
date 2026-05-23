// src/stores/admin/admin-financeiro-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import { useAuthStore } from '../auth-store';
import { useAdminCacheStore, ADMIN_CACHE_TTL } from './admin-cache-store';
import type { AxiosError } from 'axios';

export interface TransacaoData {
  id: number;
  numero: string;
  user_id: number;
  tipo: string;
  status: string;
  valor: number;
  descricao: string;
  metodo: string;
  created_at: string;
  user?: { id: number; nome: string };
}

export interface ResumoFinanceiroData {
  saldo_atual: number;
  pendente: number;
  processado_mes: number;
  comissoes: number;
}

export interface RelatorioServicosData {
  periodo: string;
  total_servicos: number;
  receita_total: number;
  servicos_por_status: {
    pendente: number;
    aceito: number;
    em_andamento: number;
    concluido: number;
    cancelado: number;
  };
}

export interface RelatorioPrestadoresData {
  total: number;
  verificados: number;
  nao_verificados: number;
  ativos: number;
  bloqueados: number;
  media_avaliacao_geral: number;
  top_prestadores: { id: number; nome: string; media_avaliacao: number; total_servicos: number }[];
  periodo: string;
}

export interface RelatorioFinanceiroData {
  periodo: string;
  entradas: number;
  saidas: number;
  saldo: number;
  comissoes: number;
}

export interface RelatorioUsuariosData {
  total_usuarios: number;
  novos_usuarios: number;
  usuarios_ativos: number;
  usuarios_inativos: number;
  usuarios_por_tipo: {
    clientes: number;
    prestadores: number;
    admins: number;
  };
  usuarios_por_status: {
    ativos: number;
    bloqueados: number;
    pendentes: number;
  };
  crescimento_mensal: Array<{
    mes: string;
    total: number;
    novos: number;
  }>;
}

export interface ConfiguracoesData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  comissao_padrao: number;
  tipo_comissao: string;
}

export interface CreateTransacaoData {
  user_id: number;
  valor: number;
  tipo: 'entrada' | 'saida' | 'comissao';
  status: 'pendente' | 'concluido' | 'cancelado';
  descricao?: string;
  metodo?: string;
}

export const useAdminFinanceiroStore = defineStore('adminFinanceiro', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useAdminCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const transacoes = ref<TransacaoData[]>([]);
  const transacaoDetalhes = ref<TransacaoData | null>(null);
  const resumoFinanceiro = ref<ResumoFinanceiroData>({
    saldo_atual: 0,
    pendente: 0,
    processado_mes: 0,
    comissoes: 0,
  });
  const relatorioServicos = ref<RelatorioServicosData | null>(null);
  const relatorioPrestadores = ref<RelatorioPrestadoresData | null>(null);
  const relatorioFinanceiro = ref<RelatorioFinanceiroData | null>(null);
  const relatorioUsuarios = ref<RelatorioUsuariosData | null>(null);
  const configuracoes = ref<ConfiguracoesData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    comissao_padrao: 0,
    tipo_comissao: '',
  });

  // ==========================================
  // AUXILIARES
  // ==========================================

  function getCurrentAdminId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const adminId = getCurrentAdminId();
    if (adminId) {
      cacheStore.setAdminId(adminId);
    }
  }

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) return [] as T;
    if (Array.isArray(response)) return response as T;
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (obj.success === true && obj.data !== undefined) {
        return obj.data as T;
      }
      if (obj.data !== undefined) {
        return obj.data as T;
      }
    }
    return [] as T;
  }

  function showError(error: unknown): void {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 });
  }

  // ==========================================
  // CONFIGURAÇÕES
  // ==========================================

  async function fetchConfiguracoes(forceRefresh: boolean = false): Promise<ConfiguracoesData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<ConfiguracoesData | null>(
      'configuracoes',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.CONFIGURACOES);
          const result = extractDataFromResponse<ConfiguracoesData>(response.data);
          configuracoes.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.VERY_LONG,
      forceRefresh
    );
    return data;
  }

  async function updateConfiguracoes(data: Partial<ConfiguracoesData>): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CONFIGURACOES, data);
      if (response.data.success) {
        cacheStore.invalidate('configuracoes');
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // FINANCEIRO
  // ==========================================

  async function fetchResumoFinanceiro(forceRefresh: boolean = false): Promise<ResumoFinanceiroData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<ResumoFinanceiroData | null>(
      'resumo_financeiro',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.RESUMO_FINANCEIRO);
          const result = extractDataFromResponse<ResumoFinanceiroData>(response.data);
          resumoFinanceiro.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh
    );
    return data;
  }

  async function fetchTransacoes(params?: {
    tipo?: string;
    status?: string;
    per_page?: number;
  }, forceRefresh: boolean = false): Promise<{ data: TransacaoData[]; total: number; last_page: number; current_page: number } | null> {
    initializeCache();
    const cacheKey = `transacoes_${JSON.stringify(params)}`;

    const data = await cacheStore.fetchWithCache<{ data: TransacaoData[]; total: number; last_page: number; current_page: number } | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.TRANSACOES, { params });
          const result = response.data.data;
          transacoes.value = result.data || [];
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh
    );
    return data;
  }

  async function fetchTransacaoDetalhes(id: number, forceRefresh: boolean = false): Promise<TransacaoData | null> {
    initializeCache();
    const cacheKey = `transacao_${id}`;

    const data = await cacheStore.fetchWithCache<TransacaoData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.TRANSACAO_DETAILS(id));
          const result = extractDataFromResponse<TransacaoData>(response.data);
          transacaoDetalhes.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function createTransacao(data: CreateTransacaoData): Promise<TransacaoData | null> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_TRANSACAO, data);
      if (response.data.success) {
        cacheStore.invalidatePattern('transacoes');
        cacheStore.invalidate('resumo_financeiro');
        return extractDataFromResponse<TransacaoData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateTransacaoStatus(id: number, status: string): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_TRANSACAO_STATUS(id), { status });
      if (response.data.success) {
        cacheStore.invalidatePattern('transacoes');
        cacheStore.invalidate('resumo_financeiro');
        cacheStore.invalidate(`transacao_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // RELATÓRIOS
  // ==========================================

  async function fetchRelatorioServicos(periodo: string = 'mes', forceRefresh: boolean = false): Promise<RelatorioServicosData | null> {
    initializeCache();
    const cacheKey = `relatorio_servicos_${periodo}`;

    const data = await cacheStore.fetchWithCache<RelatorioServicosData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_SERVICOS(periodo));
          const result = extractDataFromResponse<RelatorioServicosData>(response.data);
          relatorioServicos.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function fetchRelatorioPrestadores(forceRefresh: boolean = false): Promise<RelatorioPrestadoresData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<RelatorioPrestadoresData | null>(
      'relatorio_prestadores',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_PRESTADORES);
          const result = extractDataFromResponse<RelatorioPrestadoresData>(response.data);
          relatorioPrestadores.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function fetchRelatorioFinanceiro(periodo: string = 'mes', forceRefresh: boolean = false): Promise<RelatorioFinanceiroData | null> {
    initializeCache();
    const cacheKey = `relatorio_financeiro_${periodo}`;

    const data = await cacheStore.fetchWithCache<RelatorioFinanceiroData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_FINANCEIRO(periodo));
          const result = extractDataFromResponse<RelatorioFinanceiroData>(response.data);
          relatorioFinanceiro.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function fetchRelatorioUsuarios(forceRefresh: boolean = false): Promise<RelatorioUsuariosData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<RelatorioUsuariosData | null>(
      'relatorio_usuarios',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_USUARIOS);
          const result = extractDataFromResponse<RelatorioUsuariosData>(response.data);
          relatorioUsuarios.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    transacoes,
    transacaoDetalhes,
    resumoFinanceiro,
    relatorioServicos,
    relatorioPrestadores,
    relatorioFinanceiro,
    relatorioUsuarios,
    configuracoes,

    // Actions - Configurações
    fetchConfiguracoes,
    updateConfiguracoes,

    // Actions - Financeiro
    fetchResumoFinanceiro,
    fetchTransacoes,
    fetchTransacaoDetalhes,
    createTransacao,
    updateTransacaoStatus,

    // Actions - Relatórios
    fetchRelatorioServicos,
    fetchRelatorioPrestadores,
    fetchRelatorioFinanceiro,
    fetchRelatorioUsuarios,

    // Utilitários
    showError,
  };
});
