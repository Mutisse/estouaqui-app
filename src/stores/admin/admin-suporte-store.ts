// src/stores/admin/admin-suporte-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
export type TicketPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';
export type RemetenteTipo = 'cliente' | 'prestador' | 'admin';

export interface Ticket {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  status: TicketStatus;
  prioridade: TicketPrioridade;
  categoria: string;
  cliente_id: number;
  cliente?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    foto: string | null;
  };
  prestador_id?: number;
  prestador?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    profissao: string;
  };
  admin_id?: number;
  admin?: {
    id: number;
    nome: string;
    email: string;
  };
  anexos?: string[];
  created_at: string;
  updated_at: string;
  resolvido_em?: string;
}

export interface MensagemTicket {
  id: number;
  ticket_id: number;
  remetente_id: number;
  remetente_tipo: RemetenteTipo;
  remetente_nome: string;
  mensagem: string;
  anexos?: string[];
  lida: boolean;
  lida_em?: string;
  created_at: string;
}

export interface ChatMensagem {
  id: number;
  ticket_id: number;
  remetente_id: number;
  remetente_tipo: RemetenteTipo;
  remetente_nome: string;
  mensagem: string;
  anexos?: string[];
  lida: boolean;
  created_at: string;
}

export interface ChatTicket {
  id: number;
  numero: string;
  titulo: string;
  cliente_nome: string;
  cliente_foto: string | null;
  ultima_mensagem: string;
  ultima_mensagem_data: string;
  nao_lidas: number;
  status: TicketStatus;
  prioridade: TicketPrioridade;
}

export interface FiltrosTickets {
  search: string;
  status: string;
  prioridade: string;
  categoria: string;
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

export interface EstatisticasSuporte {
  total: number;
  abertos: number;
  em_andamento: number;
  resolvidos: number;
  fechados: number;
  urgentes: number;
  tempo_medio_resposta: number;
  tickets_por_categoria: Record<string, number>;
}

interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
  prioridade?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
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

export const useAdminSuporteStore = defineStore('adminSuporte', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);

  const tickets = ref<Ticket[]>([]);
  const ticketSelecionado = ref<Ticket | null>(null);
  const mensagens = ref<MensagemTicket[]>([]);
  const estatisticas = ref<EstatisticasSuporte>({
    total: 0,
    abertos: 0,
    em_andamento: 0,
    resolvidos: 0,
    fechados: 0,
    urgentes: 0,
    tempo_medio_resposta: 0,
    tickets_por_categoria: {},
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosTickets>({
    search: '',
    status: '',
    prioridade: '',
    categoria: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // Chat estados
  const chatTickets = ref<ChatTicket[]>([]);
  const chatMensagens = ref<ChatMensagem[]>([]);
  const chatSelecionado = ref<ChatTicket | null>(null);
  const isPolling = ref(false);
  let pollingInterval: NodeJS.Timeout | null = null;

  // Opções para selects
  const opcoesStatus = [
    { label: 'Todos', value: '' },
    { label: 'Aberto', value: 'aberto' },
    { label: 'Em Andamento', value: 'em_andamento' },
    { label: 'Resolvido', value: 'resolvido' },
    { label: 'Fechado', value: 'fechado' },
  ];

  const opcoesPrioridade = [
    { label: 'Todas', value: '' },
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Urgente', value: 'urgente' },
  ];

  const opcoesCategoria = [
    { label: 'Todas', value: '' },
    { label: 'Problema Técnico', value: 'tecnico' },
    { label: 'Dúvida', value: 'duvida' },
    { label: 'Reclamação', value: 'reclamacao' },
    { label: 'Sugestão', value: 'sugestao' },
    { label: 'Financeiro', value: 'financeiro' },
    { label: 'Outros', value: 'outros' },
  ];

  // Getters
  const totalTickets = computed(() => paginacao.value.total);
  const temTickets = computed(() => tickets.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);
  const totalNaoLidas = computed(() => chatTickets.value.reduce((acc, t) => acc + (t.nao_lidas || 0), 0));

  // Cores e labels - disponíveis via computed para uso no componente
  const statusColors = computed(() => ({
    aberto: 'negative',
    em_andamento: 'warning',
    resolvido: 'positive',
    fechado: 'grey',
  }));

  const prioridadeColors = computed(() => ({
    baixa: 'info',
    media: 'warning',
    alta: 'orange',
    urgente: 'negative',
  }));

  const statusLabels = computed(() => ({
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  }));

  const prioridadeLabels = computed(() => ({
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  }));

  const categoriaLabels = computed(() => ({
    tecnico: 'Problema Técnico',
    duvida: 'Dúvida',
    reclamacao: 'Reclamação',
    sugestao: 'Sugestão',
    financeiro: 'Financeiro',
    outros: 'Outros',
  }));

  // ===================== FUNÇÕES AUXILIARES =====================

  const toTicketStatus = (status: string): TicketStatus => {
    if (status === 'aberto') return 'aberto';
    if (status === 'em_andamento') return 'em_andamento';
    if (status === 'resolvido') return 'resolvido';
    return 'fechado';
  };

  const toTicketPrioridade = (prioridade: string): TicketPrioridade => {
    if (prioridade === 'baixa') return 'baixa';
    if (prioridade === 'media') return 'media';
    if (prioridade === 'alta') return 'alta';
    return 'urgente';
  };

  // ===================== AÇÕES =====================

  const carregarTickets = async (resetPage = true): Promise<void> => {
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
      if (filtros.value.prioridade) params.prioridade = filtros.value.prioridade;
      if (filtros.value.categoria) params.categoria = filtros.value.categoria;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get<ApiResponse<Ticket[]>>('/admin/suporte/tickets', { params });

      if (response.data?.success) {
        tickets.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
        };
        dadosCarregados.value = true;
      }
    } catch (err) {
      console.error('Erro ao carregar tickets:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar tickets';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasSuporte>>('/admin/suporte/estatisticas');
      if (response.data?.success && response.data.data) {
        estatisticas.value = {
          total: response.data.data.total || 0,
          abertos: response.data.data.abertos || 0,
          em_andamento: response.data.data.em_andamento || 0,
          resolvidos: response.data.data.resolvidos || 0,
          fechados: response.data.data.fechados || 0,
          urgentes: response.data.data.urgentes || 0,
          tempo_medio_resposta: response.data.data.tempo_medio_resposta || 0,
          tickets_por_categoria: response.data.data.tickets_por_categoria || {},
        };
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const buscarTicket = async (id: number): Promise<Ticket | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<Ticket>>(`/admin/suporte/tickets/${id}`);
      if (response.data?.success && response.data.data) {
        ticketSelecionado.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar ticket:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar ticket';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const carregarMensagens = async (ticketId: number): Promise<MensagemTicket[]> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<MensagemTicket[]>>(`/admin/suporte/tickets/${ticketId}/mensagens`);
      if (response.data?.success) {
        mensagens.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const enviarMensagem = async (ticketId: number, mensagem: string, anexos?: File[]): Promise<MensagemTicket | null> => {
    isSending.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('mensagem', mensagem);

      if (anexos && anexos.length > 0) {
        anexos.forEach((file, index) => {
          formData.append(`anexos[${index}]`, file);
        });
      }

      const response = await api.post<ApiResponse<MensagemTicket>>(`/admin/suporte/tickets/${ticketId}/mensagens`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data.data) {
        mensagens.value.push(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      error.value = (err as AxiosError).message || 'Erro ao enviar mensagem';
      return null;
    } finally {
      isSending.value = false;
    }
  };

  const atualizarStatus = async (id: number, status: string): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.put<ApiResponse<Ticket>>(`/admin/suporte/tickets/${id}/status`, { status });
      if (response.data?.success) {
        await carregarTickets(false);
        await carregarEstatisticas();
        if (ticketSelecionado.value && ticketSelecionado.value.id === id) {
          ticketSelecionado.value.status = toTicketStatus(status);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const atualizarPrioridade = async (id: number, prioridade: string): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.put<ApiResponse<Ticket>>(`/admin/suporte/tickets/${id}/prioridade`, { prioridade });
      if (response.data?.success) {
        await carregarTickets(false);
        if (ticketSelecionado.value && ticketSelecionado.value.id === id) {
          ticketSelecionado.value.prioridade = toTicketPrioridade(prioridade);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar prioridade:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const atribuirAdmin = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.put<ApiResponse<Ticket>>(`/admin/suporte/tickets/${id}/atribuir`, {
        admin_id: authStore.user?.id,
      });
      if (response.data?.success) {
        await carregarTickets(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atribuir ticket:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const fecharTicket = async (id: number): Promise<boolean> => {
    return atualizarStatus(id, 'fechado');
  };

  const excluirTicket = async (id: number): Promise<boolean> => {
    isSending.value = true;
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/suporte/tickets/${id}`);
      if (response.data?.success) {
        await carregarTickets(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir ticket:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  };

  // ===================== CHAT AÇÕES =====================

  const carregarChatTickets = async (): Promise<ChatTicket[]> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<ChatTicket[]>>('/admin/suporte/chat/tickets');
      if (response.data?.success) {
        chatTickets.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar chat tickets:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const carregarChatMensagens = async (ticketId: number): Promise<ChatMensagem[]> => {
    isLoading.value = true;
    try {
      const response = await api.get<ApiResponse<ChatMensagem[]>>(`/admin/suporte/chat/tickets/${ticketId}/mensagens`);
      if (response.data?.success) {
        chatMensagens.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar chat mensagens:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const enviarChatMensagem = async (ticketId: number, mensagem: string): Promise<ChatMensagem | null> => {
    isSending.value = true;
    try {
      const response = await api.post<ApiResponse<ChatMensagem>>(`/admin/suporte/chat/tickets/${ticketId}/enviar`, { mensagem });
      if (response.data?.success && response.data.data) {
        chatMensagens.value.push(response.data.data);
        const ticketIndex = chatTickets.value.findIndex(t => t.id === ticketId);
        if (ticketIndex !== -1 && chatTickets.value[ticketIndex]) {
          chatTickets.value[ticketIndex].ultima_mensagem = mensagem;
          chatTickets.value[ticketIndex].ultima_mensagem_data = new Date().toISOString();
        }
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      return null;
    } finally {
      isSending.value = false;
    }
  };

  const iniciarPolling = (ticketId: number): void => {
    if (pollingInterval) clearInterval(pollingInterval);

    isPolling.value = true;
    pollingInterval = setInterval(() => {
      void (async () => {
        if (!chatSelecionado.value || chatSelecionado.value.id !== ticketId) return;

        try {
          const ultimoId = chatMensagens.value[chatMensagens.value.length - 1]?.id || 0;
          const response = await api.get<ApiResponse<ChatMensagem[]>>(`/admin/suporte/chat/tickets/${ticketId}/novas`, {
            params: { ultimo_id: ultimoId }
          });
          if (response.data?.success && response.data.data.length > 0) {
            chatMensagens.value = [...chatMensagens.value, ...response.data.data];
          }
        } catch (err) {
          console.error('Erro no polling:', err);
        }
      })();
    }, 3000);
  };

  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    isPolling.value = false;
  };

  const marcarChatLidas = async (ticketId: number): Promise<void> => {
    try {
      await api.put(`/admin/suporte/chat/tickets/${ticketId}/marcar-lidas`);
      const ticketIndex = chatTickets.value.findIndex(t => t.id === ticketId);
      if (ticketIndex !== -1 && chatTickets.value[ticketIndex]) {
        chatTickets.value[ticketIndex].nao_lidas = 0;
      }
    } catch (err) {
      console.error('Erro ao marcar como lidas:', err);
    }
  };

  const setFiltro = (key: keyof FiltrosTickets, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'prioridade') filtros.value.prioridade = value as string;
    else if (key === 'categoria') filtros.value.categoria = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarTickets(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      status: '',
      prioridade: '',
      categoria: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarTickets(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarTickets(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarTickets(true),
      carregarEstatisticas(),
    ]);
  };

  const limparStore = (): void => {
    tickets.value = [];
    ticketSelecionado.value = null;
    mensagens.value = [];
    estatisticas.value = {
      total: 0,
      abertos: 0,
      em_andamento: 0,
      resolvidos: 0,
      fechados: 0,
      urgentes: 0,
      tempo_medio_resposta: 0,
      tickets_por_categoria: {},
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
      prioridade: '',
      categoria: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    error.value = null;
    chatTickets.value = [];
    chatMensagens.value = [];
    chatSelecionado.value = null;
    pararPolling();
  };

  return {
    // Estados
    isLoading,
    isSending,
    error,
    dadosCarregados,
    tickets,
    ticketSelecionado,
    mensagens,
    estatisticas,
    paginacao,
    filtros,
    opcoesStatus,
    opcoesPrioridade,
    opcoesCategoria,
    statusColors,
    prioridadeColors,
    statusLabels,
    prioridadeLabels,
    categoriaLabels,
    totalTickets,
    temTickets,
    temProximaPagina,
    temPaginaAnterior,
    totalNaoLidas,
    // Chat
    chatTickets,
    chatMensagens,
    chatSelecionado,
    isPolling,
    // Actions
    carregarTickets,
    carregarEstatisticas,
    buscarTicket,
    carregarMensagens,
    enviarMensagem,
    atualizarStatus,
    atualizarPrioridade,
    atribuirAdmin,
    fecharTicket,
    excluirTicket,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
    // Chat Actions
    carregarChatTickets,
    carregarChatMensagens,
    enviarChatMensagem,
    iniciarPolling,
    pararPolling,
    marcarChatLidas,
  };
});

export default useAdminSuporteStore;
