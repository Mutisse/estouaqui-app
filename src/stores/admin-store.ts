import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import type { AxiosError } from 'axios';

// ==========================================
// INTERFACES COMPLETAS
// ==========================================

export interface DashboardData {
  total_users: number;
  total_clientes: number;
  total_prestadores: number;
  total_admins: number;
  prestadores_ativos: number;
  servicos_hoje: number;
  servicos_pendentes: number;
  avaliacao_media: number;
  total_avaliacoes: number;
}

export interface AtividadeData {
  dia: string;
  valor: number;
  data: string;
}

export interface UserData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  avatar?: string;
  data?: string;
  created_at?: string;
  blocked_at?: string | null;
  verificado?: boolean;
  ativo?: boolean;
  media_avaliacao?: number;
  total_avaliacoes?: number;
}

export interface PrestadorCategoria {
  id: number;
  nome: string;
  icone?: string;
}

export interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  verificado: boolean;
  media_avaliacao: number;
  total_avaliacoes: number;
  categorias?: PrestadorCategoria[];
  ativo?: boolean;
  blocked_at?: string | null;
}

export interface CategoriaData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  servicos_count: number;
  imagem_url?: string;
}

export interface ServicoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  ativo: boolean;
  prestador?: UserData;
  categoria?: CategoriaData;
  created_at?: string;
}

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente?: UserData;
  prestador?: UserData;
}

export interface PedidoData {
  id: number;
  numero: string;
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  data: string;
  endereco: string;
  status: string;
  valor: number;
  cliente?: UserData;
  prestador?: UserData;
  servico?: ServicoData;
  avaliacao?: AvaliacaoData;
  created_at?: string;
}

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
  user?: UserData;
}

export interface StatsData {
  total_usuarios: number;
  total_clientes: number;
  total_prestadores: number;
  total_servicos: number;
  total_pedidos: number;
  total_avaliacoes: number;
  receita_total: number;
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
  top_prestadores: PrestadorData[];
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

export interface ServicoRecente {
  id: number;
  servico: string;
  cliente: string;
  prestador: string;
  valor: number;
  status: string;
  statusCor: string;
  icone: string;
}

export interface LogData {
  id: number;
  data: string;
  nivel: string;
  usuario: string;
  acao: string;
  ip: string;
}

export interface CreateServicoData {
  prestador_id: number;
  categoria_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}

export interface NotificacaoData {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  icone?: string;
  cor?: string;
}

export interface CreateCategoriaData {
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  imagem_url?: string;
}

export interface UpdateCategoriaData extends Partial<CreateCategoriaData> {
  ativo?: boolean;
}

export interface CreateTransacaoData {
  user_id: number;
  valor: number;
  tipo: 'entrada' | 'saida' | 'comissao';
  status: 'pendente' | 'concluido' | 'cancelado';
  descricao?: string;
  metodo?: string;
}

export interface UpdateTransacaoStatusData {
  status: 'pendente' | 'concluido' | 'cancelado';
}

export interface PromocaoData {
  id: number;
  titulo: string;
  descricao: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  uso_por_usuario?: number;
  uso_total?: number;
  min_valor_pedido?: number;
  max_desconto?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePromocaoData {
  titulo: string;
  descricao: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  data_inicio: string;
  data_fim: string;
  uso_por_usuario?: number;
  uso_total?: number;
  min_valor_pedido?: number;
  max_desconto?: number;
}

export interface UpdatePromocaoData extends Partial<CreatePromocaoData> {
  ativo?: boolean;
}

// ==========================================
// CONSTANTES DE CACHE
// ==========================================

const CACHE_KEYS = {
  DASHBOARD: 'admin_dashboard',
  ATIVIDADE: 'admin_atividade',
  STATS: 'admin_stats',
  CONFIGURACOES: 'admin_configuracoes',
  NOTIFICACOES: 'admin_notificacoes',
  CATEGORIAS: 'admin_categorias',
  PRESTADORES: 'admin_prestadores',
  PRESTADORES_PENDENTES: 'admin_prestadores_pendentes',
  SERVICOS: 'admin_servicos',
  SERVICOS_RECENTES: 'admin_servicos_recentes',
  PEDIDOS: 'admin_pedidos',
  TRANSACOES: 'admin_transacoes',
  RESUMO_FINANCEIRO: 'admin_resumo_financeiro',
  AVALIACOES: 'admin_avaliacoes',
  ULTIMOS_UTILIZADORES: 'admin_ultimos_utilizadores',
  UTILIZADORES: 'admin_utilizadores',
  LOGS: 'admin_logs',
  RELATORIO_SERVICOS: 'admin_relatorio_servicos',
  RELATORIO_PRESTADORES: 'admin_relatorio_prestadores',
  RELATORIO_FINANCEIRO: 'admin_relatorio_financeiro',
  RELATORIO_USUARIOS: 'admin_relatorio_usuarios',
  PROMOCOES: 'admin_promocoes',
};

const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutos
  MEDIUM: 5 * 60 * 1000,     // 5 minutos
  LONG: 15 * 60 * 1000,      // 15 minutos
  VERY_LONG: 60 * 60 * 1000, // 1 hora
};

// ==========================================
// FUNÇÕES DE CACHE COM LOCALSTORAGE
// ==========================================

function saveToCache<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
  try {
    const item = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl,
    };
    localStorage.setItem(`admin_cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.warn(`Erro ao salvar cache para ${key}:`, error);
  }
}

function loadFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`admin_cache_${key}`);
    if (!raw) return null;

    const item = JSON.parse(raw);
    const isExpired = Date.now() - item.timestamp > item.ttl;

    if (isExpired) {
      localStorage.removeItem(`admin_cache_${key}`);
      return null;
    }

    return item.data as T;
  } catch (error) {
    console.warn(`Erro ao carregar cache para ${key}:`, error);
    return null;
  }
}

function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(`admin_cache_${key}`);
  } else {
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      localStorage.removeItem(`admin_cache_${cacheKey}`);
    });
  }
  console.log('🗑️ Cache do admin limpo');
}

// ==========================================
// STORE DO ADMIN
// ==========================================

export const useAdminStore = defineStore('admin', () => {
  const $q = useQuasar();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const dashboard = ref<DashboardData>({
    total_users: 0,
    total_clientes: 0,
    total_prestadores: 0,
    total_admins: 0,
    prestadores_ativos: 0,
    servicos_hoje: 0,
    servicos_pendentes: 0,
    avaliacao_media: 0,
    total_avaliacoes: 0,
  });

  const atividadeSemanal = ref<AtividadeData[]>([]);
  const ultimosUtilizadores = ref<UserData[]>([]);
  const utilizadores = ref<UserData[]>([]);
  const utilizadorDetalhes = ref<UserData | null>(null);
  const prestadores = ref<PrestadorData[]>([]);
  const prestadoresPendentes = ref<PrestadorData[]>([]);
  const categorias = ref<CategoriaData[]>([]);
  const servicos = ref<ServicoData[]>([]);
  const servicosRecentes = ref<ServicoRecente[]>([]);
  const pedidos = ref<PedidoData[]>([]);
  const pedidoDetalhes = ref<PedidoData | null>(null);
  const transacoes = ref<TransacaoData[]>([]);
  const transacaoDetalhes = ref<TransacaoData | null>(null);
  const resumoFinanceiro = ref<ResumoFinanceiroData>({
    saldo_atual: 0,
    pendente: 0,
    processado_mes: 0,
    comissoes: 0,
  });
  const estatisticas = ref<StatsData>({
    total_usuarios: 0,
    total_clientes: 0,
    total_prestadores: 0,
    total_servicos: 0,
    total_pedidos: 0,
    total_avaliacoes: 0,
    receita_total: 0,
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
  const logs = ref<LogData[]>([]);
  const notificacoesAdmin = ref<NotificacaoData[]>([]);
  const avaliacoes = ref<AvaliacaoData[]>([]);

  const pendingRequests = new Map<string, Promise<unknown>>();

  // ==========================================
  // MÉTODO AUXILIAR
  // ==========================================

  async function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
  }

  // ==========================================
  // 1. DASHBOARD E ESTATÍSTICAS (COM CACHE)
  // ==========================================

  const fetchDashboard = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = loadFromCache<DashboardData>(CACHE_KEYS.DASHBOARD);
      if (cached) {
        dashboard.value = cached;
        return true;
      }
    }

    try {
      const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
      dashboard.value = response.data.data;
      saveToCache(CACHE_KEYS.DASHBOARD, dashboard.value, CACHE_TTL.MEDIUM);
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const fetchAtividade = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = loadFromCache<AtividadeData[]>(CACHE_KEYS.ATIVIDADE);
      if (cached) {
        atividadeSemanal.value = cached;
        return true;
      }
    }

    try {
      const response = await api.get(ADMIN_ENDPOINTS.ATIVIDADE);
      atividadeSemanal.value = response.data.data;
      saveToCache(CACHE_KEYS.ATIVIDADE, atividadeSemanal.value, CACHE_TTL.LONG);
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const fetchStats = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = loadFromCache<StatsData>(CACHE_KEYS.STATS);
      if (cached) {
        estatisticas.value = cached;
        return true;
      }
    }

    try {
      const response = await api.get(ADMIN_ENDPOINTS.STATS);
      estatisticas.value = response.data.data;
      saveToCache(CACHE_KEYS.STATS, estatisticas.value, CACHE_TTL.MEDIUM);
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const fetchLogs = async (forceRefresh: boolean = false) => {
    return dedupeRequest('logs', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<LogData[]>(CACHE_KEYS.LOGS);
        if (cached) {
          logs.value = cached;
          return logs.value;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.LOGS);
        logs.value = response.data.data || [];
        saveToCache(CACHE_KEYS.LOGS, logs.value, CACHE_TTL.SHORT);
        return logs.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  };

  // ==========================================
  // 2. CONFIGURAÇÕES (COM CACHE)
  // ==========================================

  const fetchConfiguracoes = async (forceRefresh: boolean = false) => {
    return dedupeRequest('configuracoes', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<ConfiguracoesData>(CACHE_KEYS.CONFIGURACOES);
        if (cached) {
          configuracoes.value = cached;
          return cached;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.CONFIGURACOES);
        configuracoes.value = response.data.data;
        saveToCache(CACHE_KEYS.CONFIGURACOES, configuracoes.value, CACHE_TTL.VERY_LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const updateConfiguracoes = async (data: Partial<ConfiguracoesData>) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CONFIGURACOES, data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.CONFIGURACOES);
        await fetchConfiguracoes(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 3. NOTIFICAÇÕES DO ADMIN (COM CACHE CURTO)
  // ==========================================

  const fetchNotificacoesAdmin = async (forceRefresh: boolean = false) => {
    return dedupeRequest('notificacoes_admin', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<NotificacaoData[]>(CACHE_KEYS.NOTIFICACOES);
        if (cached) {
          notificacoesAdmin.value = cached;
          return cached;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.NOTIFICACOES);
        const data = response.data.data || [];
        notificacoesAdmin.value = Array.isArray(data) ? data : [];
        saveToCache(CACHE_KEYS.NOTIFICACOES, notificacoesAdmin.value, CACHE_TTL.SHORT);
        return notificacoesAdmin.value;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 404) {
          console.error('Erro ao carregar notificações admin:', error);
          showError(error);
        }
        notificacoesAdmin.value = [];
        return [];
      }
    });
  };

  const marcarNotificacaoLida = async (id: string) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.MARK_NOTIFICATION_READ(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.NOTIFICACOES);
        await fetchNotificacoesAdmin(true);
      }
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const marcarTodasNotificacoesLidas = async () => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      if (response.data.success) {
        clearCache(CACHE_KEYS.NOTIFICACOES);
        await fetchNotificacoesAdmin(true);
      }
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const notificacoesNaoLidas = computed(() => {
    return notificacoesAdmin.value.filter((n) => !n.lida).length;
  });

  const notificacoesRecentes = computed(() => {
    return [...notificacoesAdmin.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  });

  // ==========================================
  // 4. GESTÃO DE UTILIZADORES (COM CACHE)
  // ==========================================

  const fetchUltimosUtilizadores = async (limit: number = 5, forceRefresh: boolean = false) => {
    return dedupeRequest('ultimos_utilizadores', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<UserData[]>(CACHE_KEYS.ULTIMOS_UTILIZADORES);
        if (cached) {
          ultimosUtilizadores.value = cached;
          return true;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.USERS, {
          params: { per_page: limit },
        });
        ultimosUtilizadores.value = response.data.data.data || [];
        saveToCache(CACHE_KEYS.ULTIMOS_UTILIZADORES, ultimosUtilizadores.value, CACHE_TTL.SHORT);
        return true;
      } catch (error) {
        console.error('Erro em fetchUltimosUtilizadores:', error);
        showError(error);
        return false;
      }
    });
  };

  const fetchUtilizadores = async (params?: {
    tipo?: string;
    status?: string;
    busca?: string;
    per_page?: number;
  }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.UTILIZADORES}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<UserData[]>(cacheKey);
      if (cached) {
        utilizadores.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.USERS, { params });
        utilizadores.value = response.data.data.data || [];
        saveToCache(cacheKey, utilizadores.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchUtilizadorDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `utilizador_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<UserData>(cacheKey);
      if (cached) {
        utilizadorDetalhes.value = cached;
        return cached;
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.USER_DETAILS(id));
        utilizadorDetalhes.value = response.data.data;
        saveToCache(cacheKey, utilizadorDetalhes.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const updateUtilizador = async (id: number, data: Partial<UserData>) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_USER(id), data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.UTILIZADORES);
        clearCache(CACHE_KEYS.ULTIMOS_UTILIZADORES);
        clearCache(`utilizador_${id}`);
        await fetchUtilizadores({}, true);
        await fetchUltimosUtilizadores(5, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const blockUtilizador = async (id: number) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.BLOCK_USER(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.UTILIZADORES);
        clearCache(CACHE_KEYS.ULTIMOS_UTILIZADORES);
        clearCache(`utilizador_${id}`);
        await fetchUtilizadores({}, true);
        await fetchUltimosUtilizadores(5, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const unblockUtilizador = async (id: number) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.UNBLOCK_USER(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.UTILIZADORES);
        clearCache(CACHE_KEYS.ULTIMOS_UTILIZADORES);
        clearCache(`utilizador_${id}`);
        await fetchUtilizadores({}, true);
        await fetchUltimosUtilizadores(5, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const deleteUtilizador = async (id: number, force: boolean = false) => {
    try {
      const url = force ? ADMIN_ENDPOINTS.FORCE_DELETE_USER(id) : ADMIN_ENDPOINTS.DELETE_USER(id);
      const response = await api.delete(url);
      if (response.data.success) {
        clearCache(CACHE_KEYS.UTILIZADORES);
        clearCache(CACHE_KEYS.ULTIMOS_UTILIZADORES);
        clearCache(`utilizador_${id}`);
        await fetchUtilizadores({}, true);
        await fetchUltimosUtilizadores(5, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const getUtilizadorByEmail = async (email: string, forceRefresh: boolean = false) => {
    const cacheKey = `utilizador_email_${email}`;

    if (!forceRefresh) {
      const cached = loadFromCache<UserData>(cacheKey);
      if (cached) return cached;
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.USER_BY_EMAIL(email));
        const data = response.data.data;
        saveToCache(cacheKey, data, CACHE_TTL.LONG);
        return data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const exportUtilizadores = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.EXPORT_USERS);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 5. GESTÃO DE PRESTADORES (COM CACHE)
  // ==========================================

  const fetchPrestadores = async (params?: {
    busca?: string;
    verificado?: boolean;
    categoria?: number;
    avaliacao_min?: number;
    per_page?: number;
  }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.PRESTADORES}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<PrestadorData[]>(cacheKey);
      if (cached) {
        prestadores.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES, { params });
        prestadores.value = response.data.data.data || [];
        saveToCache(cacheKey, prestadores.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchPrestadoresPendentes = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = loadFromCache<PrestadorData[]>(CACHE_KEYS.PRESTADORES_PENDENTES);
      if (cached) {
        prestadoresPendentes.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest('prestadores_pendentes', async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES_PENDENTES);
        prestadoresPendentes.value = response.data.data.data || [];
        saveToCache(CACHE_KEYS.PRESTADORES_PENDENTES, prestadoresPendentes.value, CACHE_TTL.SHORT);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const aprovarPrestador = async (id: number) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.APROVAR_PRESTADOR(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.PRESTADORES);
        clearCache(CACHE_KEYS.PRESTADORES_PENDENTES);
        await fetchPrestadores({}, true);
        await fetchPrestadoresPendentes(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const reprovarPrestador = async (id: number, motivo?: string) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.REPROVAR_PRESTADOR(id), { motivo });
      if (response.data.success) {
        clearCache(CACHE_KEYS.PRESTADORES);
        clearCache(CACHE_KEYS.PRESTADORES_PENDENTES);
        await fetchPrestadores({}, true);
        await fetchPrestadoresPendentes(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 6. GESTÃO DE CATEGORIAS (COM CACHE LONGO)
  // ==========================================

  const fetchCategorias = async (forceRefresh: boolean = false) => {
    return dedupeRequest('categorias', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<CategoriaData[]>(CACHE_KEYS.CATEGORIAS);
        if (cached) {
          categorias.value = cached;
          return cached;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.CATEGORIAS);
        categorias.value = response.data.data;
        saveToCache(CACHE_KEYS.CATEGORIAS, categorias.value, CACHE_TTL.VERY_LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  };

  const fetchCategoriaDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `categoria_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<CategoriaData>(cacheKey);
      if (cached) return cached;
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.CATEGORIA_DETAILS(id));
        const data = response.data.data;
        saveToCache(cacheKey, data, CACHE_TTL.VERY_LONG);
        return data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const createCategoria = async (data: CreateCategoriaData) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_CATEGORIA, data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.CATEGORIAS);
        await fetchCategorias(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateCategoria = async (id: number, data: UpdateCategoriaData) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CATEGORIA(id), data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.CATEGORIAS);
        clearCache(`categoria_${id}`);
        await fetchCategorias(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const deleteCategoria = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_CATEGORIA(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.CATEGORIAS);
        clearCache(`categoria_${id}`);
        await fetchCategorias(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const uploadCategoriaImagem = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
      const response = await api.post(ADMIN_ENDPOINTS.UPLOAD_CATEGORIA_IMAGEM, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      showError(error);
      return null;
    }
  };

  const removerCategoriaImagem = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.REMOVER_CATEGORIA_IMAGEM(categoriaId));
      if (response.data.success) {
        clearCache(CACHE_KEYS.CATEGORIAS);
        clearCache(`categoria_${categoriaId}`);
        await fetchCategorias(true);
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // 7. GESTÃO DE SERVIÇOS (COM CACHE)
  // ==========================================

  const fetchServicos = async (params?: {
    categoria?: number;
    ativo?: boolean;
    per_page?: number;
  }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.SERVICOS}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<ServicoData[]>(cacheKey);
      if (cached) {
        servicos.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.SERVICOS, { params });
        servicos.value = response.data.data.data || [];
        saveToCache(cacheKey, servicos.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchServicoDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `servico_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<ServicoData>(cacheKey);
      if (cached) return cached;
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.SERVICO_DETAILS(id));
        const data = response.data.data;
        saveToCache(cacheKey, data, CACHE_TTL.LONG);
        return data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchServicosRecentes = async (limit: number = 5, forceRefresh: boolean = false) => {
    return dedupeRequest('servicos_recentes', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<ServicoRecente[]>(CACHE_KEYS.SERVICOS_RECENTES);
        if (cached) {
          servicosRecentes.value = cached;
          return true;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.PEDIDOS, {
          params: { per_page: limit },
        });
        const pedidosData = response.data.data.data || [];
        servicosRecentes.value = pedidosData.map((pedido: PedidoData) => ({
          id: pedido.id,
          servico: pedido.servico?.nome || 'Serviço',
          cliente: pedido.cliente?.nome || 'Cliente',
          prestador: pedido.prestador?.nome || 'Prestador',
          valor: pedido.valor || 0,
          status: getStatusText(pedido.status),
          statusCor: getStatusColor(pedido.status),
          icone: getStatusIcon(pedido.status),
        }));
        saveToCache(CACHE_KEYS.SERVICOS_RECENTES, servicosRecentes.value, CACHE_TTL.SHORT);
        return true;
      } catch (error) {
        console.error('Erro em fetchServicosRecentes:', error);
        showError(error);
        return false;
      }
    });
  };

  const createServico = async (data: CreateServicoData) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_SERVICO, data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.SERVICOS);
        await fetchServicos({}, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateServico = async (
    id: number,
    data: Partial<CreateServicoData & { ativo?: boolean }>,
  ) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_SERVICO(id), data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.SERVICOS);
        clearCache(`servico_${id}`);
        await fetchServicos({}, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const deleteServico = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_SERVICO(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.SERVICOS);
        clearCache(`servico_${id}`);
        await fetchServicos({}, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 8. GESTÃO DE PEDIDOS (COM CACHE)
  // ==========================================

  const fetchPedidos = async (params?: { status?: string; per_page?: number }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.PEDIDOS}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<PedidoData[]>(cacheKey);
      if (cached) {
        pedidos.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PEDIDOS, { params });
        pedidos.value = response.data.data.data || [];
        saveToCache(cacheKey, pedidos.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchPedidoDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `pedido_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<PedidoData>(cacheKey);
      if (cached) {
        pedidoDetalhes.value = cached;
        return cached;
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PEDIDO_DETAILS(id));
        pedidoDetalhes.value = response.data.data;
        saveToCache(cacheKey, pedidoDetalhes.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const updatePedidoStatus = async (id: number, status: string) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_PEDIDO_STATUS(id), { status });
      if (response.data.success) {
        clearCache(CACHE_KEYS.PEDIDOS);
        clearCache(`pedido_${id}`);
        await fetchPedidos({}, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const cancelPedido = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.CANCELAR_PEDIDO(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.PEDIDOS);
        clearCache(`pedido_${id}`);
        await fetchPedidos({}, true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 9. FINANCEIRO (COM CACHE)
  // ==========================================

  const fetchResumoFinanceiro = async (forceRefresh: boolean = false) => {
    return dedupeRequest('resumo_financeiro', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<ResumoFinanceiroData>(CACHE_KEYS.RESUMO_FINANCEIRO);
        if (cached) {
          resumoFinanceiro.value = cached;
          return cached;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.RESUMO_FINANCEIRO);
        resumoFinanceiro.value = response.data.data;
        saveToCache(CACHE_KEYS.RESUMO_FINANCEIRO, resumoFinanceiro.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchTransacoes = async (params?: {
    tipo?: string;
    status?: string;
    per_page?: number;
  }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.TRANSACOES}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<TransacaoData[]>(cacheKey);
      if (cached) {
        transacoes.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.TRANSACOES, { params });
        transacoes.value = response.data.data.data || [];
        saveToCache(cacheKey, transacoes.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchTransacaoDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `transacao_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<TransacaoData>(cacheKey);
      if (cached) {
        transacaoDetalhes.value = cached;
        return cached;
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.TRANSACAO_DETAILS(id));
        transacaoDetalhes.value = response.data.data;
        saveToCache(cacheKey, transacaoDetalhes.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const createTransacao = async (data: CreateTransacaoData) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_TRANSACAO, data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.TRANSACOES);
        clearCache(CACHE_KEYS.RESUMO_FINANCEIRO);
        await fetchTransacoes({}, true);
        await fetchResumoFinanceiro(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateTransacaoStatus = async (id: number, status: string) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_TRANSACAO_STATUS(id), { status });
      if (response.data.success) {
        clearCache(CACHE_KEYS.TRANSACOES);
        clearCache(CACHE_KEYS.RESUMO_FINANCEIRO);
        clearCache(`transacao_${id}`);
        await fetchTransacoes({}, true);
        await fetchResumoFinanceiro(true);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 10. RELATÓRIOS (COM CACHE)
  // ==========================================

  const fetchRelatorioServicos = async (periodo: string = 'mes', forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.RELATORIO_SERVICOS}_${periodo}`;

    if (!forceRefresh) {
      const cached = loadFromCache<RelatorioServicosData>(cacheKey);
      if (cached) {
        relatorioServicos.value = cached;
        return cached;
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_SERVICOS(periodo));
        relatorioServicos.value = response.data.data;
        saveToCache(cacheKey, relatorioServicos.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchRelatorioPrestadores = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      const cached = loadFromCache<RelatorioPrestadoresData>(CACHE_KEYS.RELATORIO_PRESTADORES);
      if (cached) {
        relatorioPrestadores.value = cached;
        return cached;
      }
    }

    return dedupeRequest('relatorio_prestadores', async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_PRESTADORES);
        relatorioPrestadores.value = response.data.data;
        saveToCache(CACHE_KEYS.RELATORIO_PRESTADORES, relatorioPrestadores.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchRelatorioFinanceiro = async (periodo: string = 'mes', forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.RELATORIO_FINANCEIRO}_${periodo}`;

    if (!forceRefresh) {
      const cached = loadFromCache<RelatorioFinanceiroData>(cacheKey);
      if (cached) {
        relatorioFinanceiro.value = cached;
        return cached;
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_FINANCEIRO(periodo));
        relatorioFinanceiro.value = response.data.data;
        saveToCache(cacheKey, relatorioFinanceiro.value, CACHE_TTL.LONG);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchRelatorioUsuarios = async (forceRefresh: boolean = false) => {
    return dedupeRequest('relatorio_usuarios', async () => {
      if (!forceRefresh) {
        const cached = loadFromCache<RelatorioUsuariosData>(CACHE_KEYS.RELATORIO_USUARIOS);
        if (cached) {
          relatorioUsuarios.value = cached;
          return cached;
        }
      }

      try {
        const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_USUARIOS);
        relatorioUsuarios.value = response.data.data;
        saveToCache(CACHE_KEYS.RELATORIO_USUARIOS, relatorioUsuarios.value, CACHE_TTL.LONG);
        return relatorioUsuarios.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  // ==========================================
  // 11. GESTÃO DE AVALIAÇÕES (COM CACHE)
  // ==========================================

  const fetchAvaliacoes = async (params?: { nota?: number; per_page?: number }, forceRefresh: boolean = false) => {
    const cacheKey = `${CACHE_KEYS.AVALIACOES}_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = loadFromCache<AvaliacaoData[]>(cacheKey);
      if (cached) {
        avaliacoes.value = cached;
        return { data: cached, total: cached.length, last_page: 1, current_page: 1 };
      }
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.AVALIACOES, { params });
        avaliacoes.value = response.data.data.data || [];
        saveToCache(cacheKey, avaliacoes.value, CACHE_TTL.MEDIUM);
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const fetchAvaliacaoDetalhes = async (id: number, forceRefresh: boolean = false) => {
    const cacheKey = `avaliacao_${id}`;

    if (!forceRefresh) {
      const cached = loadFromCache<AvaliacaoData>(cacheKey);
      if (cached) return cached;
    }

    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.AVALIACAO_DETAILS(id));
        const data = response.data.data;
        saveToCache(cacheKey, data, CACHE_TTL.LONG);
        return data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  };

  const deleteAvaliacao = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_AVALIACAO(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.AVALIACOES);
        clearCache(`avaliacao_${id}`);
        await fetchAvaliacoes({}, true);
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // 12. GESTÃO DE PROMOÇÕES
  // ==========================================

  const createPromocao = async (data: CreatePromocaoData) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_PROMOCAO, data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.PROMOCOES);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updatePromocao = async (id: number, data: UpdatePromocaoData) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_PROMOCAO(id), data);
      if (response.data.success) {
        clearCache(CACHE_KEYS.PROMOCOES);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const deletePromocao = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_PROMOCAO(id));
      if (response.data.success) {
        clearCache(CACHE_KEYS.PROMOCOES);
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 13. MÉTODOS AUXILIARES
  // ==========================================

  const carregarTodosDados = async (forceRefresh: boolean = false) => {
    loading.value = true;
    try {
      await Promise.all([
        fetchDashboard(forceRefresh),
        fetchAtividade(forceRefresh),
        fetchUltimosUtilizadores(5, forceRefresh),
        fetchServicosRecentes(5, forceRefresh),
        fetchStats(forceRefresh),
        fetchResumoFinanceiro(forceRefresh),
        fetchNotificacoesAdmin(forceRefresh),
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      em_andamento: 'Em andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pendente: 'info',
      aceito: 'primary',
      em_andamento: 'warning',
      concluido: 'positive',
      cancelado: 'negative',
    };
    return colorMap[status] || 'grey';
  };

  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      pendente: 'schedule',
      aceito: 'check_circle',
      em_andamento: 'play_circle',
      concluido: 'task_alt',
      cancelado: 'cancel',
    };
    return iconMap[status] || 'help';
  };

  const showError = (error: unknown) => {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 3000,
    });
  };

  const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================
  // GETTERS FORMATADOS
  // ==========================================

  const atividadeFormatada = computed(() => {
    return atividadeSemanal.value.map((item, index) => ({
      dia: item.dia,
      valor: item.valor,
      altura: Math.min(item.valor * 2, 120),
      cor: index < 5 ? '#667eea' : '#764ba2',
    }));
  });

  const cardsPrincipais = computed(() => [
    {
      title: 'Total Utilizadores',
      value: dashboard.value.total_users,
      icon: 'people',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      trend: 12,
    },
    {
      title: 'Prestadores',
      value: dashboard.value.total_prestadores,
      icon: 'handyman',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      trend: 8,
    },
    {
      title: 'Serviços Hoje',
      value: dashboard.value.servicos_hoje,
      icon: 'assignment',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      trend: 5,
    },
    {
      title: 'Avaliação Média',
      value: dashboard.value.avaliacao_media.toFixed(1),
      icon: 'star',
      iconColor: 'white',
      bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      trend: 3,
    },
  ]);

  const cardsSecundarios = computed(() => [
    {
      title: 'Receita Total',
      value: formatMoney(estatisticas.value.receita_total),
      icon: 'payments',
      iconColor: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Categorias',
      value: categorias.value.length,
      icon: 'category',
      iconColor: '#f57c00',
      bgColor: '#fff3e0',
    },
    {
      title: 'Serviços',
      value: estatisticas.value.total_servicos,
      icon: 'construction',
      iconColor: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Avaliações',
      value: dashboard.value.total_avaliacoes,
      icon: 'chat',
      iconColor: '#9c27b0',
      bgColor: '#f3e5f5',
    },
  ]);

  const distribuicaoPorTipo = computed(() => {
    const total = dashboard.value.total_users;
    if (total === 0) return [];
    return [
      {
        label: 'Clientes',
        value: dashboard.value.total_clientes,
        percent: (dashboard.value.total_clientes / total) * 100,
        color: 'primary',
      },
      {
        label: 'Prestadores',
        value: dashboard.value.total_prestadores,
        percent: (dashboard.value.total_prestadores / total) * 100,
        color: 'secondary',
      },
      {
        label: 'Administradores',
        value: dashboard.value.total_admins,
        percent: (dashboard.value.total_admins / total) * 100,
        color: 'grey',
      },
    ];
  });

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    dashboard,
    atividadeSemanal,
    ultimosUtilizadores,
    utilizadores,
    utilizadorDetalhes,
    prestadores,
    prestadoresPendentes,
    categorias,
    servicos,
    servicosRecentes,
    pedidos,
    pedidoDetalhes,
    transacoes,
    transacaoDetalhes,
    resumoFinanceiro,
    estatisticas,
    relatorioServicos,
    relatorioPrestadores,
    relatorioFinanceiro,
    relatorioUsuarios,
    configuracoes,
    logs,
    notificacoesAdmin,
    avaliacoes,

    // Dashboard
    fetchDashboard,
    fetchAtividade,
    fetchStats,
    fetchLogs,

    // Configurações
    fetchConfiguracoes,
    updateConfiguracoes,

    // Notificações
    fetchNotificacoesAdmin,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    notificacoesNaoLidas,
    notificacoesRecentes,

    // Utilizadores
    fetchUtilizadores,
    fetchUltimosUtilizadores,
    fetchUtilizadorDetalhes,
    updateUtilizador,
    blockUtilizador,
    unblockUtilizador,
    deleteUtilizador,
    getUtilizadorByEmail,
    exportUtilizadores,

    // Prestadores
    fetchPrestadores,
    fetchPrestadoresPendentes,
    aprovarPrestador,
    reprovarPrestador,

    // Categorias
    fetchCategorias,
    fetchCategoriaDetalhes,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    uploadCategoriaImagem,
    removerCategoriaImagem,

    // Serviços
    fetchServicos,
    fetchServicoDetalhes,
    fetchServicosRecentes,
    createServico,
    updateServico,
    deleteServico,

    // Pedidos
    fetchPedidos,
    fetchPedidoDetalhes,
    updatePedidoStatus,
    cancelPedido,

    // Financeiro
    fetchResumoFinanceiro,
    fetchTransacoes,
    fetchTransacaoDetalhes,
    createTransacao,
    updateTransacaoStatus,

    // Relatórios
    fetchRelatorioServicos,
    fetchRelatorioPrestadores,
    fetchRelatorioFinanceiro,
    fetchRelatorioUsuarios,

    // Avaliações
    fetchAvaliacoes,
    fetchAvaliacaoDetalhes,
    deleteAvaliacao,

    // Promoções
    createPromocao,
    updatePromocao,
    deletePromocao,

    // Utilitários
    carregarTodosDados,
    getStatusText,
    getStatusColor,
    getStatusIcon,
    showError,
    clearCache,
    formatMoney,

    // Getters
    atividadeFormatada,
    cardsPrincipais,
    cardsSecundarios,
    distribuicaoPorTipo,
  };
});
