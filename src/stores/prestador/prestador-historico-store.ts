import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface ClienteInfo {
  id: number;
  nome: string;
  foto?: string | null;
}

export interface ServicoInfo {
  id: number;
  nome: string;
  descricao?: string;
}

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
}

export interface PedidoHistorico {
  id: number;
  cliente_id: number;
  servico_id: number;
  data: string;
  valor: number;
  status: string;
  cliente?: ClienteInfo;
  servico?: ServicoInfo;
  avaliacao?: AvaliacaoData;
}

export interface HistoricoFiltrado {
  id: number;
  clienteNome: string;
  clienteFoto: string | null;
  data: string;
  servicoNome: string;
  valor: number;
  avaliacao?: {
    nota: number;
    comentario: string;
  };
}

export interface EstatisticasPeriodo {
  totalServicos: number;
  totalGanhos: number;
}

export interface FiltroOpcao {
  label: string;
  value: string;
}

// Opções de filtro
export const filtrosOpcoes: FiltroOpcao[] = [
  { label: 'Este mês', value: 'mes' },
  { label: 'Últimos 3 meses', value: 'trimestre' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Todos', value: 'todos' },
];

// Cores para avatar
const coresAvatar = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

// ===================== STORE =====================

export const usePrestadorHistoricoStore = defineStore('prestadorHistorico', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);
  const filtroPeriodo = ref<'mes' | 'trimestre' | 'ano' | 'todos'>('mes');

  // Dados principais
  const pedidos = ref<PedidoHistorico[]>([]);
  const avaliacoes = ref<AvaliacaoData[]>([]);

  // ===================== GETTERS =====================

  // Pedidos concluídos apenas
  const pedidosConcluidos = computed(() => {
    return pedidos.value.filter(p => p.status === 'concluido');
  });

  // Filtrar por período
  const pedidosFiltradosPorPeriodo = computed(() => {
    const agora = new Date();
    let filtrados = [...pedidosConcluidos.value];

    switch (filtroPeriodo.value) {
      case 'mes':
        filtrados = filtrados.filter(p => {
          const data = new Date(p.data);
          return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
        });
        break;
      case 'trimestre': {
        // ✅ CORRIGIDO: Adicionado bloco com chaves
        const tresMesesAtras = new Date(agora);
        tresMesesAtras.setMonth(agora.getMonth() - 3);
        filtrados = filtrados.filter(p => new Date(p.data) >= tresMesesAtras);
        break;
      }
      case 'ano':
        filtrados = filtrados.filter(p => {
          const data = new Date(p.data);
          return data.getFullYear() === agora.getFullYear();
        });
        break;
      default:
        break;
    }

    return filtrados;
  });

  // Histórico formatado para exibição
  const historicoFiltrado = computed<HistoricoFiltrado[]>(() => {
    return pedidosFiltradosPorPeriodo.value.map(pedido => {
      const avaliacao = avaliacoes.value.find(a => a.id === pedido.id);
      const result: HistoricoFiltrado = {
        id: pedido.id,
        clienteNome: pedido.cliente?.nome || 'Cliente',
        clienteFoto: pedido.cliente?.foto || null,
        data: formatarData(pedido.data),
        servicoNome: pedido.servico?.nome || 'Serviço',
        valor: pedido.valor,
      };
      if (avaliacao) {
        result.avaliacao = {
          nota: avaliacao.nota,
          comentario: avaliacao.comentario,
        };
      }
      return result;
    });
  });

  // Estatísticas do período
  const estatisticas = computed<EstatisticasPeriodo>(() => {
    const totalServicos = historicoFiltrado.value.length;
    const totalGanhos = historicoFiltrado.value.reduce((sum, s) => sum + s.valor, 0);
    return { totalServicos, totalGanhos };
  });

  // ===================== FUNÇÕES AUXILIARES =====================

  const formatarData = (dataString: string): string => {
    if (!dataString) return '';
    const date = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) return 'Hoje';
    if (date.toDateString() === ontem.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatarValor = (valor: number): string => {
    if (!valor && valor !== 0) return '0';
    return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getAvatarUrl = (nome: string): string => {
    const iniciais = nome.split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciais)}&background=5B4BF5&color=fff&bold=true&size=80`;
  };

  const getAvatarStyle = (nome?: string) => {
    if (!nome) return { background: coresAvatar[0] };
    const idx = Math.abs(nome.charCodeAt(0)) % coresAvatar.length;
    return { background: coresAvatar[idx] };
  };

  // ===================== AÇÕES =====================

  /**
   * Busca todos os pedidos do prestador
   * GET /api/prestador/pedidos
   */
  const fetchPedidos = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/pedidos');

      if (response.data?.success && response.data.data) {
        pedidos.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        pedidos.value = response.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar pedidos';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Busca avaliações recebidas
   * GET /api/prestador/avaliacoes
   */
  const fetchAvaliacoes = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh && avaliacoes.value.length > 0) return;

    try {
      const response = await api.get('/prestador/avaliacoes');

      if (response.data?.success && response.data.data) {
        avaliacoes.value = response.data.data;
      } else if (Array.isArray(response.data)) {
        avaliacoes.value = response.data;
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar avaliações';
    }
  };

  /**
   * Atualiza o filtro de período
   */
  const setFiltroPeriodo = (periodo: 'mes' | 'trimestre' | 'ano' | 'todos'): void => {
    filtroPeriodo.value = periodo;
  };

  /**
   * Carrega todos os dados do store
   */
  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchPedidos(true),
        fetchAvaliacoes(true),
      ]);
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
    pedidos.value = [];
    avaliacoes.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    filtroPeriodo.value = 'mes';
  };

  return {
    // Estados
    isLoading,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    filtroPeriodo,
    pedidos,
    avaliacoes,

    // Getters
    pedidosConcluidos,
    pedidosFiltradosPorPeriodo,
    historicoFiltrado,
    estatisticas,

    // Actions
    fetchPedidos,
    fetchAvaliacoes,
    setFiltroPeriodo,
    carregarTodosDados,
    recarregarDados,
    limparStore,

    // Utilitários
    formatarValor,
    formatarData,
    getAvatarUrl,
    getAvatarStyle,
  };
});

export default usePrestadorHistoricoStore;
