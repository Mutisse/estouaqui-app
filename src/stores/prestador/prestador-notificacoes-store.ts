import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface FiltroOpcao {
  label: string;
  value: string;
  contagem?: number;
}

// Opções de filtro
export const filtrosOpcoes: FiltroOpcao[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Não lidas', value: 'nao_lidas' },
  { label: 'Pedidos', value: 'pedido' },
  { label: 'Pagamentos', value: 'pagamento' },
  { label: 'Sistema', value: 'sistema' },
];

// ===================== STORE =====================

export const usePrestadorNotificacoesStore = defineStore('prestadorNotificacoes', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isUpdating = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);
  const filtroAtivo = ref<string>('todas');

  // Dados principais
  const notificacoes = ref<NotificacaoData[]>([]);

  // Controle de polling
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  const pollingAtivo = ref(false);

  // ===================== GETTERS =====================

  const notificacoesNaoLidas = computed(() => {
    return notificacoes.value.filter((n) => !n.lida);
  });

  const notificacoesLidas = computed(() => {
    return notificacoes.value.filter((n) => n.lida);
  });

  const unreadCount = computed(() => {
    return notificacoes.value.filter((n) => !n.lida).length;
  });

  const notificacoesFiltradas = computed(() => {
    let resultado = [...notificacoes.value];

    switch (filtroAtivo.value) {
      case 'nao_lidas':
        resultado = resultado.filter((n) => !n.lida);
        break;
      case 'pedido':
        resultado = resultado.filter((n) => n.tipo === 'pedido' || n.tipo?.includes('pedido'));
        break;
      case 'pagamento':
        resultado = resultado.filter(
          (n) => n.tipo === 'pagamento' || n.tipo?.includes('pagamento'),
        );
        break;
      case 'sistema':
        resultado = resultado.filter((n) => n.tipo === 'sistema');
        break;
      default:
        break;
    }

    // Ordenar por data (mais recentes primeiro)
    resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return resultado;
  });

  const contadores = computed(() => {
    const todas = notificacoes.value.length;
    const naoLidas = notificacoesNaoLidas.value.length;
    const pedidos = notificacoes.value.filter(
      (n) => n.tipo === 'pedido' || n.tipo?.includes('pedido'),
    ).length;
    const pagamentos = notificacoes.value.filter(
      (n) => n.tipo === 'pagamento' || n.tipo?.includes('pagamento'),
    ).length;
    const sistema = notificacoes.value.filter((n) => n.tipo === 'sistema').length;

    return { todas, naoLidas, pedidos, pagamentos, sistema };
  });

  // ✅ CORRIGIDO: Garantir que chave nunca seja undefined
  const notificacoesAgrupadasPorData = computed(() => {
    const grupos: Record<string, NotificacaoData[]> = {};
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    notificacoesFiltradas.value.forEach((notif) => {
      const data = new Date(notif.created_at);
      let chave: string;

      if (data.toDateString() === hoje.toDateString()) {
        chave = 'Hoje';
      } else if (data.toDateString() === ontem.toDateString()) {
        chave = 'Ontem';
      } else {
        chave = data.toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }

      // ✅ Garantir que chave sempre tem um valor
      const chaveFinal = chave || 'Outras';

      if (!grupos[chaveFinal]) {
        grupos[chaveFinal] = [];
      }
      grupos[chaveFinal].push(notif);
    });

    return grupos;
  });

  // ===================== FUNÇÕES AUXILIARES =====================

  const formatarData = (dataString: string): string => {
    const date = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const diffHoras = (hoje.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (date.toDateString() === hoje.toDateString()) {
      return `Hoje, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (date.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else if (diffHoras < 168) {
      // menos de 7 dias
      const dias = Math.floor(diffHoras / 24);
      return `${dias} ${dias === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  const getIconePorTipo = (tipo: string): string => {
    const icones: Record<string, string> = {
      pedido: 'shopping_bag',
      pagamento: 'payments',
      sistema: 'info',
      avaliacao: 'star',
      mensagem: 'chat',
    };
    return icones[tipo] || 'notifications';
  };

  const getCorPorTipo = (tipo: string): string => {
    const cores: Record<string, string> = {
      pedido: 'primary',
      pagamento: 'positive',
      sistema: 'info',
      avaliacao: 'warning',
      mensagem: 'accent',
    };
    return cores[tipo] || 'grey';
  };

  // ===================== AÇÕES =====================

  /**
   * Busca todas as notificações
   * GET /api/prestador/notificacoes
   */
  const fetchNotificacoes = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/notificacoes');

      if (response.data?.success && response.data.data) {
        notificacoes.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        notificacoes.value = response.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar notificações';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Marca uma notificação como lida
   * PUT /api/prestador/notificacoes/{id}/lida
   */
  const marcarNotificacaoLida = async (id: number): Promise<boolean> => {
    isUpdating.value = true;
    try {
      const response = await api.put(`/prestador/notificacoes/${id}/lida`);
      if (response.data?.success) {
        const notificacao = notificacoes.value.find((n) => n.id === id);
        if (notificacao && !notificacao.lida) {
          notificacao.lida = true;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar notificação';
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Marca todas as notificações como lidas
   * PUT /api/prestador/notificacoes/marcar-todas-lidas
   */
  const marcarTodasNotificacoesLidas = async (): Promise<boolean> => {
    isUpdating.value = true;
    try {
      const response = await api.put('/prestador/notificacoes/marcar-todas-lidas');
      if (response.data?.success) {
        notificacoes.value.forEach((n) => {
          n.lida = true;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar notificações';
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Remove uma notificação
   * DELETE /api/prestador/notificacoes/{id}
   */
  const removerNotificacao = async (id: number): Promise<boolean> => {
    isUpdating.value = true;
    try {
      const response = await api.delete(`/prestador/notificacoes/${id}`);
      if (response.data?.success) {
        notificacoes.value = notificacoes.value.filter((n) => n.id !== id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover notificação:', err);
      error.value = (err as AxiosError).message || 'Erro ao remover notificação';
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Remove todas as notificações lidas
   * DELETE /api/prestador/notificacoes/limpar-lidas
   */
  const removerNotificacoesLidas = async (): Promise<boolean> => {
    isUpdating.value = true;
    try {
      const response = await api.delete('/prestador/notificacoes/limpar-lidas');
      if (response.data?.success) {
        notificacoes.value = notificacoes.value.filter((n) => !n.lida);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover notificações lidas:', err);
      error.value = (err as AxiosError).message || 'Erro ao remover notificações';
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Atualiza o filtro ativo
   */
  const setFiltro = (filtro: string): void => {
    filtroAtivo.value = filtro;
  };

  /**
   * Inicia o polling de notificações
   */
  const iniciarPolling = (intervaloMs: number = 30000): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(() => {
      if (document.hasFocus()) {
        void fetchNotificacoes(true);
      }
    }, intervaloMs);
    pollingAtivo.value = true;
  };

  /**
   * Para o polling de notificações
   */
  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    pollingAtivo.value = false;
  };

  /**
   * Carrega todos os dados do store
   */
  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await fetchNotificacoes(true);
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
    notificacoes.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    filtroAtivo.value = 'todas';
    pararPolling();
  };

  return {
    // Estados
    isLoading,
    isUpdating,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    filtroAtivo,
    notificacoes,
    pollingAtivo,

    // Getters
    notificacoesNaoLidas,
    notificacoesLidas,
    unreadCount,
    notificacoesFiltradas,
    contadores,
    notificacoesAgrupadasPorData,

    // Actions
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    removerNotificacao,
    removerNotificacoesLidas,
    setFiltro,
    iniciarPolling,
    pararPolling,
    carregarTodosDados,
    recarregarDados,
    limparStore,

    // Utilitários
    formatarData,
    getIconePorTipo,
    getCorPorTipo,
  };
});

export default usePrestadorNotificacoesStore;
