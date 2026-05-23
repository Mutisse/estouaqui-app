// src/stores/cliente/cliente-pedidos-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { useClienteCacheStore, CLIENTE_CACHE_TTL } from './cliente-cache-store';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';

export interface PedidoData {
  id: number;
  numero: string;
  status: string;
  descricao?: string;
  foto?: string | null;
  data: string;
  endereco: string;
  observacoes?: string;
  valor: number | null;
  created_at: string;
  prestador?: { id: number; nome: string; foto: string | null };
  servico?: { id: number; nome: string; preco: number };
  categoria?: { id: number; nome: string; icone: string; cor: string };
  avaliacao?: { id: number; nota: number; comentario: string };
}

export interface PropostaData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  valor: number;
  mensagem: string | null;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  prestador?: { id: number; nome: string; foto: string | null };
}

// Procure por esta interface (deve estar no topo do arquivo)

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  categorias: string[];
  created_at: string;
  pedido_id: number; // ✅ JÁ ESTÁ AQUI! CORRETO
  prestador?: {
    id: number;
    nome: string;
    foto: string | null;
  };
}

export interface DashboardData {
  total_pedidos: number;
  pedidos_pendentes: number;
  pedidos_concluidos: number;
  avaliacoes_feitas: number;
  favoritos_count: number;
}

export const useClientePedidosStore = defineStore('clientePedidos', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useClienteCacheStore();

  const loading = ref(false);
  const dashboard = ref<DashboardData>({
    total_pedidos: 0,
    pedidos_pendentes: 0,
    pedidos_concluidos: 0,
    avaliacoes_feitas: 0,
    favoritos_count: 0,
  });
  const pedidos = ref<PedidoData[]>([]);
  const pedidoDetalhes = ref<PedidoData | null>(null);
  const avaliacoes = ref<AvaliacaoData[]>([]);
  const propostas = ref<PropostaData[]>([]);

  function getCurrentUserId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const userId = getCurrentUserId();
    if (userId) {
      cacheStore.setClienteId(userId);
    }
  }

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) return [] as T;
    if (Array.isArray(response)) return response as T;
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (obj.success === true && obj.data !== undefined) {
        return obj.data as T;
      }
      if (obj.data !== undefined) {
        return obj.data as T;
      }
    }
    return [] as T;
  }

  // ✅ CORRIGIDO - Usando QNotifyCreateOptions
  function showNotification(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    icon?: string,
  ): void {
    const options: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };
    if (icon) options.icon = icon;
    $q.notify(options);
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async function fetchDashboard(forceRefresh: boolean = false): Promise<DashboardData> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<DashboardData>(
      'dashboard',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.DASHBOARD);
          const result = extractDataFromResponse<DashboardData>(response.data);
          dashboard.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  // ==========================================
  // PEDIDOS
  // ==========================================

  async function criarPedidoServico(data: {
    categoria_id: number;
    descricao: string;
    endereco: string;
    foto?: File | null;
  }): Promise<PedidoData | null> {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append('categoria_id', String(data.categoria_id));
      formData.append('descricao', data.descricao);
      formData.append('endereco', data.endereco);
      if (data.foto) formData.append('foto', data.foto);

      const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_PEDIDO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        showNotification('positive', 'Pedido publicado com sucesso!', 'check_circle');
        cacheStore.invalidatePattern('pedidos');
        cacheStore.invalidate('dashboard');
        await fetchMeusPedidos(true);
        return response.data.data;
      }
      return null;
    } catch {
      showNotification('negative', 'Erro ao criar pedido');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMeusPedidos(forceRefresh: boolean = false): Promise<PedidoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PedidoData[]>(
      'meus_pedidos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.MEUS_PEDIDOS);
          const result = extractDataFromResponse<PedidoData[]>(response.data);
          pedidos.value = Array.isArray(result) ? result : [];
          return pedidos.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function cancelarPedidoCliente(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CANCELAR_PEDIDO_CLIENTE(id.toString()));
      if (response.data.success) {
        showNotification('positive', 'Pedido cancelado!', 'cancel');
        cacheStore.invalidatePattern('pedidos');
        cacheStore.invalidate('dashboard');
        await fetchMeusPedidos(true);
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao cancelar pedido');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PROPOSTAS
  // ==========================================

  async function fetchMinhasPropostas(forceRefresh: boolean = false): Promise<PropostaData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PropostaData[]>(
      'minhas_propostas',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PROPOSTAS);
          const result = extractDataFromResponse<PropostaData[]>(response.data);
          propostas.value = Array.isArray(result) ? result : [];
          return propostas.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function aceitarProposta(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.ACEITAR_PROPOSTA(id));
      if (response.data.success) {
        showNotification('positive', 'Proposta aceita!', 'check_circle');
        cacheStore.invalidatePattern('propostas');
        cacheStore.invalidatePattern('pedidos');
        cacheStore.invalidate('dashboard');
        await fetchMinhasPropostas(true);
        await fetchMeusPedidos(true);
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao aceitar proposta');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function recusarProposta(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.RECUSAR_PROPOSTA(id));
      if (response.data.success) {
        showNotification('info', 'Proposta recusada', 'cancel');
        cacheStore.invalidatePattern('propostas');
        await fetchMinhasPropostas(true);
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao recusar proposta');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // AVALIAÇÕES
  // ==========================================

  async function fetchAvaliacoes(forceRefresh: boolean = false): Promise<AvaliacaoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<AvaliacaoData[]>(
      'avaliacoes',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.AVALIACOES);
          const result = extractDataFromResponse<AvaliacaoData[]>(response.data);
          avaliacoes.value = Array.isArray(result) ? result : [];
          return avaliacoes.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function criarAvaliacao(data: {
    prestador_id: number;
    pedido_id: number;
    nota: number;
    comentario?: string;
  }): Promise<AvaliacaoData | null> {
    loading.value = true;
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_AVALIACAO, data);
      if (response.data.success) {
        cacheStore.invalidate('avaliacoes');
        await fetchAvaliacoes(true);
        showNotification('positive', 'Avaliação enviada!', 'star');
        return response.data.data;
      }
      return null;
    } catch {
      showNotification('negative', 'Erro ao enviar avaliação');
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    dashboard,
    pedidos,
    pedidoDetalhes,
    avaliacoes,
    propostas,
    fetchDashboard,
    criarPedidoServico,
    fetchMeusPedidos,
    cancelarPedidoCliente,
    fetchMinhasPropostas,
    aceitarProposta,
    recusarProposta,
    fetchAvaliacoes,
    criarAvaliacao,
  };
});
