// stores/client/cliente-pedidos-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface PrestadorInfo {
  id: number;
  nome: string;
  foto?: string | null;
  telefone?: string;
}

export interface ServicoInfo {
  id: number;
  nome: string;
  preco: number;
  duracao?: number;
}

export interface AvaliacaoData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  cliente_id: number;
  nota: number;
  comentario?: string;
  created_at: string;
  cliente?: {
    id: number;
    nome: string;
    foto?: string;
  };
  prestador?: {
    id: number;
    nome: string;
    foto?: string;
  };
}

export interface PedidoData {
  id: number;
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  data: string;
  horario?: string;
  valor: number;
  status: 'pendente' | 'aceito' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  endereco?: string;
  created_at: string;
  updated_at: string;
  prestador?: PrestadorInfo;
  servico?: ServicoInfo;
  avaliacao?: AvaliacaoData;
}

export interface PedidoDetalhes extends PedidoData {
  historico_status?: {
    status: string;
    data: string;
    observacao?: string;
  }[];
  comprovativo_pagamento?: string;
  forma_pagamento?: string;
}

export interface ContadorPedidos {
  ativos: number;
  concluidos: number;
  cancelados: number;
  total: number;
}

export interface DashboardData {
  total_pedidos: number;
  avaliacoes_feitas: number;
  favoritos_count: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useClientePedidosStore = defineStore('clientePedidos', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const pedidos = ref<PedidoData[]>([]);
  const pedidoAtual = ref<PedidoDetalhes | null>(null);
  const dashboard = ref<DashboardData | null>(null);
  const erro = ref<string | null>(null);
  const avaliacoes = ref<AvaliacaoData[]>([]);

  // ===================== GETTERS =====================

  const pedidosAtivos = computed(() => {
    return pedidos.value.filter(
      (p) => p.status === 'pendente' || p.status === 'aceito' || p.status === 'em_andamento',
    );
  });

  const pedidosConcluidos = computed(() => {
    return pedidos.value.filter((p) => p.status === 'concluido');
  });

  const pedidosCancelados = computed(() => {
    return pedidos.value.filter((p) => p.status === 'cancelado');
  });

  const contadores = computed<ContadorPedidos>(() => ({
    ativos: pedidosAtivos.value.length,
    concluidos: pedidosConcluidos.value.length,
    cancelados: pedidosCancelados.value.length,
    total: pedidos.value.length,
  }));

  const totalGasto = computed(() => {
    return pedidosConcluidos.value.reduce((total, pedido) => total + (pedido.valor || 0), 0);
  });

  const ultimosPedidos = computed(() => {
    return [...pedidos.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  });

  // ===================== FUNÇÕES AUXILIARES =====================

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse;
      return data?.message || data?.error || error.message || 'Erro na requisição';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

  const getStatusTexto = (status: string): string => {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      em_andamento: 'Em andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      pendente: 'pendente',
      aceito: 'aceito',
      em_andamento: 'andamento',
      concluido: 'concluido',
      cancelado: 'cancelado',
    };
    return classMap[status] || '';
  };

  const getStatusCor = (status: string): string => {
    const corMap: Record<string, string> = {
      pendente: '#F59E0B',
      aceito: '#5B4BF5',
      em_andamento: '#3B82F6',
      concluido: '#10B981',
      cancelado: '#EF4444',
    };
    return corMap[status] || '#6B7280';
  };

  const formatarData = (data: string | undefined): string => {
    if (!data) return 'Data não informada';
    try {
      const date = new Date(data);
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

      if (date.toDateString() === hoje.toDateString()) {
        return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === amanha.toDateString()) {
        return `Amanhã, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return data;
    }
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  // ===================== AÇÕES PRINCIPAIS =====================

  const fetchMeusPedidos = async (): Promise<PedidoData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/cliente/pedidos');

      if (response.data?.success && response.data.data) {
        pedidos.value = response.data.data;
        return pedidos.value;
      }

      throw new Error('Erro ao carregar pedidos');
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const fetchPedidoDetalhes = async (pedidoId: number): Promise<PedidoDetalhes | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/cliente/pedidos/${pedidoId}`);

      if (response.data?.success && response.data.data) {
        pedidoAtual.value = response.data.data;
        return pedidoAtual.value;
      }

      throw new Error('Pedido não encontrado');
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const criarPedido = async (dados: {
    prestador_id: number;
    servico_id: number;
    data: string;
    horario?: string;
    observacoes?: string;
    endereco?: string;
  }): Promise<PedidoData | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post('/cliente/pedidos', dados);

      if (response.data?.success && response.data.data) {
        pedidos.value.unshift(response.data.data);
        return response.data.data;
      }

      throw new Error('Erro ao criar pedido');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const cancelarPedidoCliente = async (pedidoId: number, motivo?: string): Promise<boolean> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post(`/cliente/pedidos/${pedidoId}/cancelar`, { motivo });

      if (response.data?.success) {
        const index = pedidos.value.findIndex((p) => p.id === pedidoId);
        if (index !== -1 && pedidos.value[index]) {
          pedidos.value[index].status = 'cancelado';
        }

        if (pedidoAtual.value?.id === pedidoId && pedidoAtual.value) {
          pedidoAtual.value.status = 'cancelado';
        }

        return true;
      }

      throw new Error('Erro ao cancelar pedido');
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const reagendarPedido = async (
    pedidoId: number,
    novaData: string,
    novoHorario?: string,
  ): Promise<boolean> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.put(`/cliente/pedidos/${pedidoId}/reagendar`, {
        data: novaData,
        horario: novoHorario,
      });

      if (response.data?.success) {
        const index = pedidos.value.findIndex((p) => p.id === pedidoId);
        if (index !== -1 && pedidos.value[index]) {
          pedidos.value[index].data = novaData;
          if (novoHorario) pedidos.value[index].horario = novoHorario;
        }
        return true;
      }

      throw new Error('Erro ao reagendar pedido');
    } catch (error) {
      console.error('Erro ao reagendar pedido:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const recontratarServico = async (pedidoId: number): Promise<PedidoData | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post(`/cliente/pedidos/${pedidoId}/recontratar`);

      if (response.data?.success && response.data.data) {
        pedidos.value.unshift(response.data.data);
        return response.data.data;
      }

      throw new Error('Erro ao recontratar serviço');
    } catch (error) {
      console.error('Erro ao recontratar serviço:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const fetchDashboard = async (): Promise<DashboardData | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/cliente/dashboard');

      if (response.data?.success && response.data.data) {
        dashboard.value = response.data.data;
        return dashboard.value;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const fetchAvaliacoes = async (): Promise<AvaliacaoData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/cliente/avaliacoes');

      if (response.data?.success && response.data.data) {
        avaliacoes.value = response.data.data;
        return avaliacoes.value;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const criarAvaliacao = async (dados: {
    prestador_id: number;
    pedido_id: number;
    nota: number;
    comentario: string;
  }): Promise<AvaliacaoData | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post('/cliente/avaliacoes', dados);

      if (response.data?.success && response.data.data) {
        avaliacoes.value.unshift(response.data.data);

        const index = pedidos.value.findIndex((p) => p.id === dados.pedido_id);
        if (index !== -1 && pedidos.value[index]) {
          pedidos.value[index].avaliacao = response.data.data;
        }

        return response.data.data;
      }

      throw new Error('Erro ao criar avaliação');
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const pedidoAvaliado = (pedidoId: number): boolean => {
    const pedido = pedidos.value.find((p) => p.id === pedidoId);
    return !!pedido?.avaliacao;
  };

  const limparStore = (): void => {
    pedidos.value = [];
    pedidoAtual.value = null;
    dashboard.value = null;
    avaliacoes.value = [];
    erro.value = null;
    carregando.value = false;
  };

  return {
    // Estados
    carregando,
    pedidos,
    pedidoAtual,
    dashboard,
    erro,
    avaliacoes,

    // Getters
    pedidosAtivos,
    pedidosConcluidos,
    pedidosCancelados,
    contadores,
    totalGasto,
    ultimosPedidos,

    // Utilitários
    getStatusTexto,
    getStatusClass,
    getStatusCor,
    formatarData,
    formatarMoeda,

    // Ações principais
    fetchMeusPedidos,
    fetchPedidoDetalhes,
    criarPedido,
    cancelarPedidoCliente,
    reagendarPedido,
    recontratarServico,
    fetchDashboard,
    fetchAvaliacoes,
    criarAvaliacao,
    pedidoAvaliado,
    limparStore,
  };
});

export default useClientePedidosStore;
