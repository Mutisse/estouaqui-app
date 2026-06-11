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

export interface ServicoPedido {
  id: number;
  nome: string;
}

export interface ClientePedido {
  id: number;
  nome: string;
  foto?: string | null;
}

export interface PedidoConcluido {
  id: number;
  cliente_id: number;
  servico_id: number;
  data: string;
  valor: number;
  cliente?: ClientePedido;
  servico?: ServicoPedido;
}

export interface GraficoItem {
  label: string;
  valor: number;
  altura: number;
}

export interface ResumoGanhos {
  totalServicos: number;
  ganhosPeriodo: number;
  media: number;
}

export interface Estatisticas {
  melhorMes: { mes: string; valor: number };
  servicoMaisRequisitado: { nome: string; quantidade: number };
  melhorCliente: { nome: string; totalGasto: number };
  mediaPorServico: number;
  totalServicos: number;
}

export interface GanhoHistorico {
  id: number;
  cliente: string;
  servico: string;
  data: string;
  valor: number;
  cor: string;
}

// ✅ Mapa de cores - simples e direto
const coresMap: Record<number, string> = {
  0: 'primary',
  1: 'success',
  2: 'warning',
  3: 'info',
  4: 'accent',
};

// ===================== STORE =====================

export const usePrestadorGanhosStore = defineStore('prestadorGanhos', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);
  const periodo = ref<'hoje' | 'semana' | 'mes' | 'ano'>('mes');

  // Dados principais
  const ganhos = ref<GanhosData>({
    total: 0,
    mes: 0,
    semana: 0,
    pendente: 0,
  });

  const pedidosConcluidos = ref<PedidoConcluido[]>([]);
  const ultimosPedidos = ref<PedidoConcluido[]>([]);

  // ===================== FUNÇÕES AUXILIARES =====================

  const formatarData = (dataString: string): string => {
    const date = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) return 'Hoje';
    if (date.toDateString() === ontem.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  // ✅ Função simples que sempre retorna uma string
  const obterCor = (index: number): string => {
    const remainder = index % 5;
    return coresMap[remainder] || 'primary';
  };

  const filtrarPedidosPorPeriodo = (pedidos: PedidoConcluido[]): PedidoConcluido[] => {
    const dataAtual = new Date();
    const dataLimite = new Date();

    switch (periodo.value) {
      case 'hoje':
        dataLimite.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataLimite.setDate(dataAtual.getDate() - 7);
        break;
      case 'mes':
        dataLimite.setMonth(dataAtual.getMonth() - 1);
        break;
      case 'ano':
        dataLimite.setFullYear(dataAtual.getFullYear() - 1);
        break;
      default:
        dataLimite.setDate(dataAtual.getDate() - 30);
    }

    return pedidos.filter(p => new Date(p.data) >= dataLimite);
  };

  const calcularEstatisticas = (pedidos: PedidoConcluido[]): Estatisticas => {
    // Melhor mês
    const ganhosPorMes: Record<string, number> = {};
    pedidos.forEach(p => {
      const data = new Date(p.data);
      const mesAno = `${data.toLocaleDateString('pt-PT', { month: 'long' })} ${data.getFullYear()}`;
      ganhosPorMes[mesAno] = (ganhosPorMes[mesAno] || 0) + p.valor;
    });

    let melhorMes = { mes: '--', valor: 0 };
    Object.entries(ganhosPorMes).forEach(([mes, valor]) => {
      if (valor > melhorMes.valor) melhorMes = { mes, valor };
    });

    // Serviço mais requisitado
    const servicosCount: Record<string, number> = {};
    pedidos.forEach(p => {
      const nomeServico = p.servico?.nome || 'Serviço';
      servicosCount[nomeServico] = (servicosCount[nomeServico] || 0) + 1;
    });

    let servicoMaisRequisitado = { nome: '--', quantidade: 0 };
    Object.entries(servicosCount).forEach(([nome, quantidade]) => {
      if (quantidade > servicoMaisRequisitado.quantidade) {
        servicoMaisRequisitado = { nome, quantidade };
      }
    });

    // Melhor cliente
    const gastosPorCliente: Record<string, { nome: string; total: number }> = {};
    pedidos.forEach(p => {
      const clienteNome = p.cliente?.nome || 'Cliente';
      if (!gastosPorCliente[clienteNome]) {
        gastosPorCliente[clienteNome] = { nome: clienteNome, total: 0 };
      }
      gastosPorCliente[clienteNome].total += p.valor;
    });

    let melhorCliente = { nome: '--', totalGasto: 0 };
    Object.values(gastosPorCliente).forEach(cliente => {
      if (cliente.total > melhorCliente.totalGasto) {
        melhorCliente = { nome: cliente.nome, totalGasto: cliente.total };
      }
    });

    const totalServicos = pedidos.length;
    const totalGanhos = pedidos.reduce((sum, p) => sum + p.valor, 0);
    const mediaPorServico = totalServicos > 0 ? totalGanhos / totalServicos : 0;

    return { melhorMes, servicoMaisRequisitado, melhorCliente, mediaPorServico, totalServicos };
  };

  // ===================== GETTERS =====================

  const saldoDisponivel = computed(() => ganhos.value.total - ganhos.value.pendente);

  const historicoGanhos = computed<GanhoHistorico[]>(() => {
    return ultimosPedidos.value.slice(0, 5).map((pedido, index) => ({
      id: pedido.id,
      cliente: pedido.cliente?.nome || 'Cliente',
      servico: pedido.servico?.nome || 'Serviço',
      data: formatarData(pedido.data),
      valor: pedido.valor,
      cor: obterCor(index),
    }));
  });

  const resumo = computed<ResumoGanhos>(() => {
    const pedidosFiltrados = filtrarPedidosPorPeriodo(pedidosConcluidos.value);
    const totalServicos = pedidosFiltrados.length;
    const ganhosPeriodo = pedidosFiltrados.reduce((sum, p) => sum + p.valor, 0);
    const media = totalServicos > 0 ? ganhosPeriodo / totalServicos : 0;
    return { totalServicos, ganhosPeriodo, media: Math.round(media) };
  });

  const graficoData = computed<GraficoItem[]>(() => {
    const meses: GraficoItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const nomeMes = data.toLocaleDateString('pt-PT', { month: 'short' });
      const ganhosMes = pedidosConcluidos.value
        .filter(p => {
          const dataPedido = new Date(p.data);
          return dataPedido.getMonth() === data.getMonth() &&
                 dataPedido.getFullYear() === data.getFullYear();
        })
        .reduce((sum, p) => sum + p.valor, 0);

      meses.push({
        label: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        valor: ganhosMes / 1000,
        altura: Math.min(120, (ganhosMes / 10000) * 120) || 5,
      });
    }
    return meses;
  });

  const estatisticas = computed<Estatisticas>(() => {
    return calcularEstatisticas(pedidosConcluidos.value);
  });

  // ===================== AÇÕES =====================

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

  const fetchPedidosConcluidos = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;

    isLoading.value = true;

    try {
      const response = await api.get('/prestador/pedidos', { params: { status: 'concluido' } });
      if (response.data?.success && response.data.data) {
        pedidosConcluidos.value = response.data.data;
        ultimosPedidos.value = [...pedidosConcluidos.value].sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
      } else if (Array.isArray(response.data)) {
        pedidosConcluidos.value = response.data;
        ultimosPedidos.value = [...pedidosConcluidos.value].sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos concluídos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar pedidos';
    } finally {
      isLoading.value = false;
    }
  };

  const setPeriodo = (novoPeriodo: 'hoje' | 'semana' | 'mes' | 'ano'): void => {
    periodo.value = novoPeriodo;
  };

  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchGanhos(true),
        fetchPedidosConcluidos(true),
      ]);
      dadosCarregados.value = true;
      ultimaAtualizacao.value = new Date();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarTodosDados();
  };

  const limparStore = (): void => {
    ganhos.value = { total: 0, mes: 0, semana: 0, pendente: 0 };
    pedidosConcluidos.value = [];
    ultimosPedidos.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    periodo.value = 'mes';
  };

  return {
    // Estados
    isLoading,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    periodo,
    ganhos,
    pedidosConcluidos,
    ultimosPedidos,

    // Getters
    saldoDisponivel,
    historicoGanhos,
    resumo,
    graficoData,
    estatisticas,

    // Actions
    fetchGanhos,
    fetchPedidosConcluidos,
    setPeriodo,
    carregarTodosDados,
    recarregarDados,
    limparStore,
  };
});

export default usePrestadorGanhosStore;
