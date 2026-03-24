import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import type { AxiosError } from 'axios';

// ==========================================
// INTERFACES COMPLETAS (TODAS EXPORTADAS)
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
}

// Interface para categorias do prestador
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
}

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente?: UserData;
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
  media_avaliacao_geral: number;
  top_prestadores: PrestadorData[];
}

export interface RelatorioFinanceiroData {
  periodo: string;
  entradas: number;
  saidas: number;
  saldo: number;
  comissoes: number;
}

export interface ConfiguracoesData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  comissao_padrao: number;
  tipo_comissao: string;
}

// Interface para serviço recente formatado
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

// Interface para log
export interface LogData {
  id: number;
  data: string;
  nivel: string;
  usuario: string;
  acao: string;
  ip: string;
}

// Interface para criação de serviço
export interface CreateServicoData {
  prestador_id: number;
  categoria_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}

// ==========================================
// STORE
// ==========================================

export const useAdminStore = defineStore('admin', () => {
  const $q = useQuasar();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);

  // Dashboard
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

  // Atividade semanal
  const atividadeSemanal = ref<AtividadeData[]>([]);

  // Utilizadores
  const ultimosUtilizadores = ref<UserData[]>([]);
  const utilizadores = ref<UserData[]>([]);
  const utilizadorDetalhes = ref<UserData | null>(null);

  // Prestadores
  const prestadores = ref<PrestadorData[]>([]);
  const prestadoresPendentes = ref<PrestadorData[]>([]);

  // Categorias
  const categorias = ref<CategoriaData[]>([]);

  // Serviços
  const servicos = ref<ServicoData[]>([]);
  const servicosRecentes = ref<ServicoRecente[]>([]);

  // Pedidos
  const pedidos = ref<PedidoData[]>([]);
  const pedidoDetalhes = ref<PedidoData | null>(null);

  // Transações
  const transacoes = ref<TransacaoData[]>([]);
  const resumoFinanceiro = ref<ResumoFinanceiroData>({
    saldo_atual: 0,
    pendente: 0,
    processado_mes: 0,
    comissoes: 0,
  });

  // Estatísticas
  const estatisticas = ref<StatsData>({
    total_usuarios: 0,
    total_clientes: 0,
    total_prestadores: 0,
    total_servicos: 0,
    total_pedidos: 0,
    total_avaliacoes: 0,
    receita_total: 0,
  });

  // Relatórios
  const relatorioServicos = ref<RelatorioServicosData | null>(null);
  const relatorioPrestadores = ref<RelatorioPrestadoresData | null>(null);
  const relatorioFinanceiro = ref<RelatorioFinanceiroData | null>(null);

  // Configurações
  const configuracoes = ref<ConfiguracoesData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    comissao_padrao: 0,
    tipo_comissao: '',
  });

  // Logs
  const logs = ref<LogData[]>([]);

  // ==========================================
  // 1. DASHBOARD E ESTATÍSTICAS
  // ==========================================

  const fetchDashboard = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
      dashboard.value = response.data.data;
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const fetchAtividade = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.ATIVIDADE);
      atividadeSemanal.value = response.data.data;
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.STATS);
      estatisticas.value = response.data.data;
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // 2. GESTÃO DE UTILIZADORES
  // ==========================================

  const fetchUtilizadores = async (params?: {
    tipo?: string;
    status?: string;
    busca?: string;
    per_page?: number;
  }) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USERS, { params });
      utilizadores.value = response.data.data.data || [];
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchUltimosUtilizadores = async (limit: number = 5) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USERS, {
        params: { per_page: limit },
      });
      ultimosUtilizadores.value = response.data.data.data || [];
      return true;
    } catch (error) {
      console.error('Erro em fetchUltimosUtilizadores:', error);
      showError(error);
      return false;
    }
  };

  const fetchUtilizadorDetalhes = async (id: number) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USER_DETAILS(id));
      utilizadorDetalhes.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateUtilizador = async (id: number, data: Partial<UserData>) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_USER(id), data);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const blockUtilizador = async (id: number) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.BLOCK_USER(id));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const unblockUtilizador = async (id: number) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.UNBLOCK_USER(id));
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
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const getUtilizadorByEmail = async (email: string) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USER_BY_EMAIL(email));
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 3. GESTÃO DE PRESTADORES
  // ==========================================

  const fetchPrestadores = async (params?: {
    verificado?: boolean;
    categoria?: number;
    avaliacao_min?: number;
  }) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES, { params });
      prestadores.value = response.data.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchPrestadoresPendentes = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES_PENDENTES);
      prestadoresPendentes.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const aprovarPrestador = async (id: number) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.APROVAR_PRESTADOR(id));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const reprovarPrestador = async (id: number) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.REPROVAR_PRESTADOR(id));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 4. GESTÃO DE CATEGORIAS
  // ==========================================

  const fetchCategorias = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.CATEGORIAS);
      categorias.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return [];
    }
  };

  const createCategoria = async (data: {
    nome: string;
    descricao?: string;
    icone?: string;
    cor?: string;
  }) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_CATEGORIA, data);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateCategoria = async (id: number, data: Partial<CategoriaData>) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CATEGORIA(id), data);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const deleteCategoria = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_CATEGORIA(id));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 5. GESTÃO DE SERVIÇOS
  // ==========================================

  const fetchServicos = async (params?: { categoria?: number; ativo?: boolean }) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.SERVICOS, { params });
      servicos.value = response.data.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchServicosRecentes = async (limit: number = 5) => {
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
      return true;
    } catch (error) {
      console.error('Erro em fetchServicosRecentes:', error);
      showError(error);
      return false;
    }
  };

  const createServico = async (data: CreateServicoData) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_SERVICO, data);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 6. GESTÃO DE PEDIDOS
  // ==========================================

  const fetchPedidos = async (params?: { status?: string; per_page?: number }) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.PEDIDOS, { params });
      pedidos.value = response.data.data.data || [];
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchPedidoDetalhes = async (id: number) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.PEDIDO_DETAILS(id));
      pedidoDetalhes.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updatePedidoStatus = async (id: number, status: string) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_PEDIDO_STATUS(id), { status });
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const cancelPedido = async (id: number) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.CANCELAR_PEDIDO(id));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 7. FINANCEIRO
  // ==========================================

  const fetchResumoFinanceiro = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.RESUMO_FINANCEIRO);
      resumoFinanceiro.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchTransacoes = async (params?: { tipo?: string; status?: string }) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.TRANSACOES, { params });
      transacoes.value = response.data.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 8. RELATÓRIOS
  // ==========================================

  const fetchRelatorioServicos = async (periodo: string = 'mes') => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_SERVICOS(periodo));
      relatorioServicos.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchRelatorioPrestadores = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_PRESTADORES);
      relatorioPrestadores.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const fetchRelatorioFinanceiro = async (periodo: string = 'mes') => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.RELATORIO_FINANCEIRO(periodo));
      relatorioFinanceiro.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const exportRelatorio = async (tipo: string = 'usuarios') => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.EXPORT_RELATORIO(tipo));
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 9. CONFIGURAÇÕES DO SISTEMA
  // ==========================================

  const fetchConfiguracoes = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.CONFIGURACOES);
      configuracoes.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  const updateConfiguracoes = async (data: Partial<ConfiguracoesData>) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CONFIGURACOES, data);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // 10. LOGS DO SISTEMA
  // ==========================================

  const fetchLogs = async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.LOGS);
      logs.value = response.data.data;
      return response.data.data;
    } catch (error) {
      showError(error);
      return [];
    }
  };

  // ==========================================
  // 11. MÉTODOS AUXILIARES
  // ==========================================

  const carregarTodosDados = async () => {
    loading.value = true;
    try {
      await Promise.all([
        fetchDashboard(),
        fetchAtividade(),
        fetchUltimosUtilizadores(5),
        fetchServicosRecentes(5),
        fetchStats(),
        fetchResumoFinanceiro(),
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

  // ==========================================
  // GETTERS FORMATADOS
  // ==========================================

  const atividadeFormatada = () => {
    return atividadeSemanal.value.map((item, index) => ({
      dia: item.dia,
      valor: item.valor,
      altura: item.valor * 2,
      cor: index < 5 ? '#667eea' : '#764ba2',
    }));
  };

  const cardsPrincipais = () => [
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
  ];

  const cardsSecundarios = () => [
    {
      title: 'Receita Total',
      value: estatisticas.value.receita_total,
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
  ];

  const distribuicaoPorTipo = () => {
    const total = dashboard.value.total_users;
    if (total === 0) return [];
    return [
      {
        label: 'Clientes',
        value: dashboard.value.total_clientes,
        percent: dashboard.value.total_clientes / total,
        color: 'primary',
      },
      {
        label: 'Prestadores',
        value: dashboard.value.total_prestadores,
        percent: dashboard.value.total_prestadores / total,
        color: 'secondary',
      },
      {
        label: 'Administradores',
        value: dashboard.value.total_admins,
        percent: dashboard.value.total_admins / total,
        color: 'grey',
      },
    ];
  };

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
    resumoFinanceiro,
    estatisticas,
    relatorioServicos,
    relatorioPrestadores,
    relatorioFinanceiro,
    configuracoes,
    logs,

    // Dashboard
    fetchDashboard,
    fetchAtividade,
    fetchStats,

    // Utilizadores
    fetchUtilizadores,
    fetchUltimosUtilizadores,
    fetchUtilizadorDetalhes,
    updateUtilizador,
    blockUtilizador,
    unblockUtilizador,
    deleteUtilizador,
    getUtilizadorByEmail,

    // Prestadores
    fetchPrestadores,
    fetchPrestadoresPendentes,
    aprovarPrestador,
    reprovarPrestador,

    // Categorias
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,

    // Serviços
    fetchServicos,
    fetchServicosRecentes,
    createServico,

    // Pedidos
    fetchPedidos,
    fetchPedidoDetalhes,
    updatePedidoStatus,
    cancelPedido,

    // Financeiro
    fetchResumoFinanceiro,
    fetchTransacoes,

    // Relatórios
    fetchRelatorioServicos,
    fetchRelatorioPrestadores,
    fetchRelatorioFinanceiro,
    exportRelatorio,

    // Configurações
    fetchConfiguracoes,
    updateConfiguracoes,

    // Logs
    fetchLogs,

    // Utilitários
    carregarTodosDados,
    getStatusText,
    getStatusColor,
    getStatusIcon,
    showError,

    // Getters formatados
    atividadeFormatada,
    cardsPrincipais,
    cardsSecundarios,
    distribuicaoPorTipo,
  };
});
