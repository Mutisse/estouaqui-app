import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface Cliente {
  id: number;
  nome: string;
  foto: string | null;
  telefone?: string;
}

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  duracao?: number;
  preco?: number;
}

export interface SolicitacaoData {
  id: number;
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  data: string;
  status: 'pendente' | 'aceito' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  valor: number;
  endereco?: string;
  observacoes?: string;
  numero?: string;
  cliente?: Cliente;
  servico?: Servico;
  created_at: string;
  updated_at: string;
}

export interface ContadoresPedidos {
  pendentes: number;
  aceitos: number;
  confirmados: number;
  concluidos: number;
  cancelados: number;
}

// ===================== STORE =====================

export const usePrestadorPedidosStore = defineStore('prestadorPedidos', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const solicitacoes = ref<SolicitacaoData[]>([]);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);
  const statusFiltro = ref<string>('todas');

  // ===================== GETTERS =====================

  const pedidosPendentes = computed(() =>
    solicitacoes.value.filter((p) => p.status === 'pendente'),
  );

  const pedidosAceitos = computed(() => solicitacoes.value.filter((p) => p.status === 'aceito'));

  const pedidosConfirmados = computed(() =>
    solicitacoes.value.filter((p) => p.status === 'confirmado' || p.status === 'em_andamento'),
  );

  const pedidosConcluidos = computed(() =>
    solicitacoes.value.filter((p) => p.status === 'concluido'),
  );

  const pedidosCancelados = computed(() =>
    solicitacoes.value.filter((p) => p.status === 'cancelado'),
  );

  const todosPedidosOrdenados = computed(() =>
    [...solicitacoes.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
  );

  const contadores = computed<ContadoresPedidos>(() => ({
    pendentes: pedidosPendentes.value.length,
    aceitos: pedidosAceitos.value.length,
    confirmados: pedidosConfirmados.value.length,
    concluidos: pedidosConcluidos.value.length,
    cancelados: pedidosCancelados.value.length,
  }));

  const totalPedidos = computed(() => solicitacoes.value.length);
  const temPedidosPendentes = computed(() => pedidosPendentes.value.length > 0);
  const temPedidosConfirmados = computed(() => pedidosConfirmados.value.length > 0);

  // ===================== FUNÇÃO AUXILIAR =====================
  const atualizarStatusPedido = (id: number, novoStatus: SolicitacaoData['status']): boolean => {
    const pedido = solicitacoes.value.find((p) => p.id === id);
    if (pedido) {
      pedido.status = novoStatus;
      return true;
    }
    return false;
  };

  // ===================== AÇÕES =====================

  const fetchSolicitacoes = async (status?: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      let url = '/prestador/solicitacoes';
      if (status && status !== 'todas') {
        url += `?status=${status}`;
      }

      const response = await api.get(url);

      if (response.data?.success && response.data.data) {
        solicitacoes.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        solicitacoes.value = response.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else {
        throw new Error('Resposta da API inválida');
      }
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao carregar pedidos';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSolicitacoesPorStatus = async (status: string): Promise<void> => {
    return fetchSolicitacoes(status);
  };

  // ✅ CORRIGIDO: usando a função auxiliar
  const aceitarSolicitacao = async (id: number): Promise<boolean> => {
    isLoading.value = true;

    try {
      const response = await api.put(`/prestador/solicitacoes/${id}/aceitar`);

      if (response.data?.success) {
        atualizarStatusPedido(id, 'aceito');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao aceitar solicitação:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao aceitar pedido';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ CORRIGIDO: usando a função auxiliar
  const recusarSolicitacao = async (id: number): Promise<boolean> => {
    isLoading.value = true;

    try {
      const response = await api.put(`/prestador/solicitacoes/${id}/recusar`);

      if (response.data?.success) {
        atualizarStatusPedido(id, 'cancelado');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao recusar solicitação:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao recusar pedido';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ CORRIGIDO: usando a função auxiliar
  const iniciarServico = async (id: number): Promise<boolean> => {
    isLoading.value = true;

    try {
      const response = await api.put(`/prestador/solicitacoes/${id}/iniciar`);

      if (response.data?.success) {
        atualizarStatusPedido(id, 'em_andamento');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao iniciar serviço:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao iniciar serviço';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ CORRIGIDO: usando a função auxiliar
  const concluirServico = async (id: number): Promise<boolean> => {
    isLoading.value = true;

    try {
      const response = await api.put(`/prestador/solicitacoes/${id}/concluir`);

      if (response.data?.success) {
        atualizarStatusPedido(id, 'concluido');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao concluir serviço:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao concluir serviço';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ CORRIGIDO: usando a função auxiliar
  const cancelarSolicitacao = async (id: number): Promise<boolean> => {
    isLoading.value = true;

    try {
      const response = await api.put(`/prestador/solicitacoes/${id}/cancelar`);

      if (response.data?.success) {
        atualizarStatusPedido(id, 'cancelado');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao cancelar solicitação:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao cancelar pedido';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const buscarPedidoPorId = async (id: number): Promise<SolicitacaoData | null> => {
    isLoading.value = true;

    try {
      const response = await api.get(`/prestador/solicitacoes/${id}`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
      const axiosError = err as AxiosError;
      error.value = axiosError.message || 'Erro ao buscar pedido';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    await fetchSolicitacoes();
  };

  const limparStore = (): void => {
    solicitacoes.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    statusFiltro.value = 'todas';
  };

  return {
    // Estados
    isLoading,
    error,
    solicitacoes,
    dadosCarregados,
    ultimaAtualizacao,
    statusFiltro,

    // Getters
    pedidosPendentes,
    pedidosAceitos,
    pedidosConfirmados,
    pedidosConcluidos,
    pedidosCancelados,
    todosPedidosOrdenados,
    contadores,
    totalPedidos,
    temPedidosPendentes,
    temPedidosConfirmados,

    // Actions
    fetchSolicitacoes,
    fetchSolicitacoesPorStatus,
    aceitarSolicitacao,
    recusarSolicitacao,
    iniciarServico,
    concluirServico,
    cancelarSolicitacao,
    buscarPedidoPorId,
    recarregarDados,
    limparStore,
  };
});

export default usePrestadorPedidosStore;
