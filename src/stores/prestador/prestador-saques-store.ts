import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface GanhosData {
  total: number;
  mes: number;
  semana: number;
  pendente: number;
}

export interface SaqueData {
  id: number;
  numero: string;
  valor: number;
  metodo: string;
  status: string;
  created_at: string;
  conta: string;
  descricao?: string;
}

export interface SolicitarSaqueData {
  valor: number;
  metodo: 'mpesa' | 'bancario';
  conta: string;
}

export interface FormaPagamentoOption {
  label: string;
  value: string;
  icone: string;
}

export interface BancoOption {
  label: string;
  value: string;
}

export interface SaqueDetalhes {
  id: number;
  numero: string;
  valor: number;
  metodo: string;
  status: string;
  created_at: string;
  conta: string;
  descricao?: string;
}

// Constantes
export const VALOR_MINIMO_SAQUE = 500;

// Opções de formas de pagamento
export const formasPagamentoOptions: FormaPagamentoOption[] = [
  { label: 'M-Pesa', value: 'mpesa', icone: 'phone_android' },
  { label: 'Conta bancária', value: 'bancario', icone: 'account_balance' },
];

// Opções de bancos
export const bancosOptions: BancoOption[] = [
  { label: 'BCI - Banco Comercial e de Investimentos', value: 'bci' },
  { label: 'BIM - Banco Internacional de Moçambique', value: 'bim' },
  { label: 'Millennium BIM', value: 'millennium' },
  { label: 'Standard Bank', value: 'standard' },
  { label: 'Moza Banco', value: 'moza' },
  { label: 'ABS - African Banking Corporation', value: 'abs' },
  { label: 'First National Bank (FNB)', value: 'fnb' },
  { label: 'Banco Unico', value: 'unico' },
  { label: 'Ecobank', value: 'eco' },
  { label: 'Banco de Oportunidades', value: 'oportunidades' },
];

// ===================== STORE =====================

export const usePrestadorSaquesStore = defineStore('prestadorSaques', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  // Dados principais
  const ganhos = ref<GanhosData>({
    total: 0,
    mes: 0,
    semana: 0,
    pendente: 0,
  });

  const historicoSaques = ref<SaqueData[]>([]);

  // ===================== GETTERS =====================

  const saldoDisponivel = computed(() => {
    return (ganhos.value?.total || 0) - (ganhos.value?.pendente || 0);
  });

  const ultimosSaques = computed(() => {
    return historicoSaques.value.slice(0, 5);
  });

  const temHistorico = computed(() => historicoSaques.value.length > 0);
  const totalSaquesRealizados = computed(() => historicoSaques.value.length);
  const totalValorSacado = computed(() => {
    return historicoSaques.value.reduce((sum, s) => sum + s.valor, 0);
  });

  // ===================== FUNÇÕES AUXILIARES =====================

  const formatarValor = (valor: number): string => {
    if (!valor && valor !== 0) return '0';
    return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getLabelPorMetodo = (metodo: string): string => {
    if (metodo === 'mpesa') return 'M-Pesa';
    if (metodo === 'bancario') return 'Conta bancária';
    return 'Outro';
  };

  const getCorPorStatus = (status: string): string => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pendente': return 'warning';
      case 'processando': return 'info';
      case 'concluido': return 'success';
      case 'cancelado': return 'danger';
      default: return 'grey';
    }
  };

  const getLabelPorStatus = (status: string): string => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pendente': return 'Pendente';
      case 'processando': return 'Processando';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status || 'Desconhecido';
    }
  };

  // ===================== AÇÕES =====================

  /**
   * Busca os ganhos do prestador
   * GET /api/prestador/ganhos
   */
  const fetchGanhos = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/ganhos');
      if (response.data?.success && response.data.data) {
        ganhos.value = {
          total: response.data.data.total || 0,
          mes: response.data.data.mes || 0,
          semana: response.data.data.semana || 0,
          pendente: response.data.data.pendente || 0,
        };
      }
    } catch (err) {
      console.error('Erro ao buscar ganhos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar ganhos';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Busca histórico de saques
   * GET /api/prestador/saques/historico
   */
  const fetchHistoricoSaques = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh && historicoSaques.value.length > 0) return;

    isLoading.value = true;

    try {
      const response = await api.get('/prestador/saques/historico');
      if (response.data?.success && response.data.data) {
        historicoSaques.value = response.data.data;
      } else if (Array.isArray(response.data)) {
        historicoSaques.value = response.data;
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de saques:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar histórico';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Solicita um saque
   * POST /api/prestador/saques/solicitar
   */
  const solicitarSaque = async (data: SolicitarSaqueData): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.post('/prestador/saques/solicitar', data);
      if (response.data?.success) {
        await Promise.all([
          fetchGanhos(true),
          fetchHistoricoSaques(true),
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao solicitar saque:', err);
      error.value = (err as AxiosError).message || 'Erro ao solicitar saque';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Busca detalhes de um saque específico
   * GET /api/prestador/saques/{id}
   */
  const buscarDetalhesSaque = async (id: number): Promise<SaqueDetalhes | null> => {
    isLoading.value = true;
    try {
      const response = await api.get(`/prestador/saques/${id}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar detalhes do saque:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar detalhes';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Carrega todos os dados do store
   */
  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchGanhos(true),
        fetchHistoricoSaques(true),
      ]);
      dadosCarregados.value = true;
      ultimaAtualizacao.value = new Date();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Recarrega os dados
   */
  const recarregarDados = async (): Promise<void> => {
    await carregarTodosDados();
  };

  /**
   * Limpa todos os dados do store
   */
  const limparStore = (): void => {
    ganhos.value = { total: 0, mes: 0, semana: 0, pendente: 0 };
    historicoSaques.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    ganhos,
    historicoSaques,

    // Getters
    saldoDisponivel,
    ultimosSaques,
    temHistorico,
    totalSaquesRealizados,
    totalValorSacado,

    // Actions
    fetchGanhos,
    fetchHistoricoSaques,
    solicitarSaque,
    buscarDetalhesSaque,
    carregarTodosDados,
    recarregarDados,
    limparStore,

    // Utilitários
    formatarValor,
    getLabelPorMetodo,
    getCorPorStatus,
    getLabelPorStatus,
  };
});

export default usePrestadorSaquesStore;
