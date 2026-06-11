// stores/client/cliente-layout-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface LayoutState {
  leftDrawerOpen: boolean;
  scrolled: boolean;
  loadingGlobal: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Tipo específico para ícones com default garantido
interface IconesMap {
  pedido: string;
  avaliacao: string;
  promocao: string;
  sistema: string;
  proposta: string;
  mensagem: string;
  favorito: string;
  categoria: string;
  servico: string;
  transacao: string;
  default: string;
}

// Tipo específico para cores com default garantido
interface CoresMap {
  pedido: string;
  avaliacao: string;
  promocao: string;
  proposta: string;
  mensagem: string;
  favorito: string;
  categoria: string;
  servico: string;
  transacao: string;
  sistema: string;
  default: string;
}

export const useClienteLayoutStore = defineStore('clienteLayout', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const leftDrawerOpen = ref(false);
  const notificationsDialog = ref(false);
  const loadingNotificacoes = ref(false);
  const loadingGlobal = ref(true);
  const scrolled = ref(false);
  const notificacoes = ref<NotificacaoData[]>([]);
  const erro = ref<string | null>(null);

  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // ===================== GETTERS =====================

  const unreadCount = computed(() => {
    return notificacoes.value.filter((n: NotificacaoData) => !n.lida).length;
  });

  const hasNotifications = computed(() => notificacoes.value.length > 0);

  const hasUnreadNotifications = computed(() => unreadCount.value > 0);

  const notificacoesNaoLidas = computed(() => {
    return notificacoes.value.filter((n: NotificacaoData) => !n.lida);
  });

  const notificacoesLidas = computed(() => {
    return notificacoes.value.filter((n: NotificacaoData) => n.lida);
  });

  const ultimasNotificacoes = computed(() => {
    return [...notificacoes.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
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

  const getNotificacaoIcone = (notif: NotificacaoData): string => {
    const tipo = (notif.tipo as keyof IconesMap) || 'default';

    const icones: IconesMap = {
      pedido: 'assignment',
      avaliacao: 'star',
      promocao: 'local_offer',
      sistema: 'info',
      proposta: 'request_quote',
      mensagem: 'chat',
      favorito: 'favorite',
      categoria: 'category',
      servico: 'handyman',
      transacao: 'payments',
      default: 'notifications',
    };

    return icones[tipo];
  };

  const getNotificacaoCor = (notif: NotificacaoData): string => {
    const tipo = (notif.tipo as keyof CoresMap) || 'default';

    const cores: CoresMap = {
      pedido: 'primary',
      avaliacao: 'yellow-8',
      promocao: 'orange',
      proposta: 'purple',
      mensagem: 'teal',
      favorito: 'red',
      categoria: 'green',
      servico: 'blue',
      transacao: 'indigo',
      sistema: 'grey',
      default: 'primary',
    };

    return cores[tipo];
  };

  const formatarDataNotificacao = (dataString: string): string => {
    const date = new Date(dataString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `${diffMin} min atrás`;
    if (diffHours < 24) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Hoje às ${hours}:${minutes}`;
    }
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toggleDrawer = (): void => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

  const closeDrawer = (): void => {
    leftDrawerOpen.value = false;
  };

  const openDrawer = (): void => {
    leftDrawerOpen.value = true;
  };

  const setScrolled = (value: boolean): void => {
    scrolled.value = value;
  };

  // ===================== AÇÕES - NOTIFICAÇÕES =====================

  const fetchNotificacoes = async (): Promise<NotificacaoData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      // ✅ ATUALIZADO: endpoint correto com /cliente/
      const response = await api.get('/cliente/notificacoes');

      if (response.data?.success && response.data.data) {
        notificacoes.value = response.data.data;
        return notificacoes.value;
      }

      notificacoes.value = [];
      return [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const marcarNotificacaoLida = async (notificacaoId: number): Promise<boolean> => {
    carregando.value = true;
    erro.value = null;

    try {
      // ✅ ATUALIZADO: endpoint correto com /cliente/
      const response = await api.patch(`/cliente/notificacoes/${notificacaoId}/ler`);

      if (response.data?.success) {
        const notificacao = notificacoes.value.find((n: NotificacaoData) => n.id === notificacaoId);
        if (notificacao) {
          notificacao.lida = true;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const marcarTodasNotificacoesLidas = async (): Promise<boolean> => {
    carregando.value = true;
    erro.value = null;

    try {
      // ✅ ATUALIZADO: endpoint correto com /cliente/
      const response = await api.post('/cliente/notificacoes/marcar-todas-lidas');

      if (response.data?.success) {
        notificacoes.value.forEach((n: NotificacaoData) => {
          n.lida = true;
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const abrirNotificacoes = async (): Promise<void> => {
    notificationsDialog.value = true;
    await fetchNotificacoes();
  };

  const fecharNotificacoes = (): void => {
    notificationsDialog.value = false;
  };

  // ===================== AÇÕES - POLLING =====================

  const iniciarPollingNotificacoes = (intervaloMs: number = 30000): void => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
      if (document.hasFocus()) {
        void fetchNotificacoes();
      }
    }, intervaloMs);
  };

  const pararPollingNotificacoes = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // ===================== AÇÕES - CARREGAMENTO =====================

  const setLoadingGlobal = (value: boolean): void => {
    loadingGlobal.value = value;
  };

  const carregarDadosIniciais = async (): Promise<void> => {
    loadingGlobal.value = true;
    try {
      await fetchNotificacoes();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      erro.value = getErrorMessage(error);
    } finally {
      setTimeout(() => {
        loadingGlobal.value = false;
      }, 500);
    }
  };

  // ===================== AÇÕES - UTILITÁRIOS =====================

  const limparStore = (): void => {
    notificacoes.value = [];
    erro.value = null;
    carregando.value = false;
    loadingGlobal.value = true;
    loadingNotificacoes.value = false;
    leftDrawerOpen.value = false;
    notificationsDialog.value = false;
    scrolled.value = false;
    pararPollingNotificacoes();
  };

  return {
    // Estados
    carregando,
    leftDrawerOpen,
    notificationsDialog,
    loadingNotificacoes,
    loadingGlobal,
    scrolled,
    notificacoes,
    erro,

    // Getters
    unreadCount,
    hasNotifications,
    hasUnreadNotifications,
    notificacoesNaoLidas,
    notificacoesLidas,
    ultimasNotificacoes,

    // Utilitários
    getNotificacaoIcone,
    getNotificacaoCor,
    formatarDataNotificacao,
    getErrorMessage,

    // Ações - Drawer
    toggleDrawer,
    closeDrawer,
    openDrawer,
    setScrolled,

    // Ações - Notificações
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    abrirNotificacoes,
    fecharNotificacoes,

    // Ações - Polling
    iniciarPollingNotificacoes,
    pararPollingNotificacoes,

    // Ações - Carregamento
    setLoadingGlobal,
    carregarDadosIniciais,

    // Ações - Utilitários
    limparStore,
  };
});

export default useClienteLayoutStore;
