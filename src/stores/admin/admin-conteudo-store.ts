// src/stores/admin/admin-conteudo-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import { useAuthStore } from '../auth-store';
import { useAdminCacheStore, ADMIN_CACHE_TTL } from './admin-cache-store';
import type { AxiosError } from 'axios';

// ==========================================
// INTERFACES
// ==========================================

export interface CategoriaData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  servicos_count: number;
  imagem_url?: string;
}

export interface ServicoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  ativo: boolean;
  prestador?: { id: number; nome: string };
  categoria?: CategoriaData;
  created_at?: string;
}

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

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente?: { id: number; nome: string };
  prestador?: { id: number; nome: string };
}

export interface PromocaoData {
  id: number;
  titulo: string;
  descricao: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  uso_por_usuario?: number;
  uso_total?: number;
  min_valor_pedido?: number;
  max_desconto?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoriaData {
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  imagem_url?: string;
}

export interface UpdateCategoriaData extends Partial<CreateCategoriaData> {
  ativo?: boolean;
}

export interface CreateServicoData {
  prestador_id: number;
  categoria_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}

export interface CreatePromocaoData {
  titulo: string;
  descricao: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  data_inicio: string;
  data_fim: string;
  uso_por_usuario?: number;
  uso_total?: number;
  min_valor_pedido?: number;
  max_desconto?: number;
}

export interface UpdatePromocaoData extends Partial<CreatePromocaoData> {
  ativo?: boolean;
}

// Interface para o tipo do pedido raw (corrige o erro do any)
interface PedidoRawItem {
  id: number;
  servico?: { nome: string };
  cliente?: { nome: string };
  prestador?: { nome: string };
  valor: number;
  status: string;
}

// ==========================================
// STORE
// ==========================================

export const useAdminConteudoStore = defineStore('adminConteudo', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useAdminCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const categorias = ref<CategoriaData[]>([]);
  const servicos = ref<ServicoData[]>([]);
  const servicosRecentes = ref<ServicoRecente[]>([]);
  const avaliacoes = ref<AvaliacaoData[]>([]);
  const promocoes = ref<PromocaoData[]>([]);

  // ==========================================
  // AUXILIARES
  // ==========================================

  function getCurrentAdminId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const adminId = getCurrentAdminId();
    if (adminId) {
      cacheStore.setAdminId(adminId);
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

  function showError(error: unknown): void {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 });
  }

  function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      em_andamento: 'Em andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
  }

  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pendente: 'info',
      aceito: 'primary',
      em_andamento: 'warning',
      concluido: 'positive',
      cancelado: 'negative',
    };
    return colorMap[status] || 'grey';
  }

  function getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pendente: 'schedule',
      aceito: 'check_circle',
      em_andamento: 'play_circle',
      concluido: 'task_alt',
      cancelado: 'cancel',
    };
    return iconMap[status] || 'help';
  }

  // ==========================================
  // CATEGORIAS
  // ==========================================

  async function fetchCategorias(forceRefresh: boolean = false): Promise<CategoriaData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<CategoriaData[]>(
      'categorias',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.CATEGORIAS);
          const result = extractDataFromResponse<CategoriaData[]>(response.data);
          categorias.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
    return data;
  }

  async function fetchCategoriaDetalhes(
    id: number,
    forceRefresh: boolean = false,
  ): Promise<CategoriaData | null> {
    initializeCache();
    const cacheKey = `categoria_${id}`;

    const data = await cacheStore.fetchWithCache<CategoriaData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.CATEGORIA_DETAILS(id));
          return extractDataFromResponse<CategoriaData>(response.data);
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
    return data;
  }

  async function createCategoria(data: CreateCategoriaData): Promise<CategoriaData | null> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_CATEGORIA, data);
      if (response.data.success) {
        cacheStore.invalidate('categorias');
        return extractDataFromResponse<CategoriaData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateCategoria(
    id: number,
    data: UpdateCategoriaData,
  ): Promise<CategoriaData | null> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_CATEGORIA(id), data);
      if (response.data.success) {
        cacheStore.invalidate('categorias');
        cacheStore.invalidate(`categoria_${id}`);
        return extractDataFromResponse<CategoriaData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCategoria(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_CATEGORIA(id));
      if (response.data.success) {
        cacheStore.invalidate('categorias');
        cacheStore.invalidate(`categoria_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // SERVIÇOS
  // ==========================================

  async function fetchServicos(
    params?: {
      categoria?: number;
      ativo?: boolean;
      per_page?: number;
    },
    forceRefresh: boolean = false,
  ): Promise<{
    data: ServicoData[];
    total: number;
    last_page: number;
    current_page: number;
  } | null> {
    initializeCache();
    const cacheKey = `servicos_${JSON.stringify(params)}`;

    const data = await cacheStore.fetchWithCache<{
      data: ServicoData[];
      total: number;
      last_page: number;
      current_page: number;
    } | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.SERVICOS, { params });
          const result = response.data.data;
          servicos.value = result.data || [];
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchServicoDetalhes(
    id: number,
    forceRefresh: boolean = false,
  ): Promise<ServicoData | null> {
    initializeCache();
    const cacheKey = `servico_${id}`;

    const data = await cacheStore.fetchWithCache<ServicoData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.SERVICO_DETAILS(id));
          return extractDataFromResponse<ServicoData>(response.data);
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh,
    );
    return data;
  }

  async function fetchServicosRecentes(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<ServicoRecente[]> {
    initializeCache();
    const cacheKey = `servicos_recentes_${limit}`;

    const data = await cacheStore.fetchWithCache<ServicoRecente[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.PEDIDOS, { params: { per_page: limit } });
          const pedidos = extractDataFromResponse<{
            data: PedidoRawItem[];
          }>(response.data);

          // CORRIGIDO: usando PedidoRawItem em vez de any
          const result = (pedidos.data || []).map((pedido: PedidoRawItem) => ({
            id: pedido.id,
            servico: pedido.servico?.nome || 'Serviço',
            cliente: pedido.cliente?.nome || 'Cliente',
            prestador: pedido.prestador?.nome || 'Prestador',
            valor: pedido.valor || 0,
            status: getStatusText(pedido.status),
            statusCor: getStatusColor(pedido.status),
            icone: getStatusIcon(pedido.status),
          }));

          servicosRecentes.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function createServico(data: CreateServicoData): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_SERVICO, data);
      if (response.data.success) {
        cacheStore.invalidatePattern('servicos');
        return extractDataFromResponse<ServicoData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateServico(
    id: number,
    data: Partial<CreateServicoData & { ativo?: boolean }>,
  ): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_SERVICO(id), data);
      if (response.data.success) {
        cacheStore.invalidatePattern('servicos');
        cacheStore.invalidate(`servico_${id}`);
        return extractDataFromResponse<ServicoData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteServico(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_SERVICO(id));
      if (response.data.success) {
        cacheStore.invalidatePattern('servicos');
        cacheStore.invalidate(`servico_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // AVALIAÇÕES
  // ==========================================

  async function fetchAvaliacoes(
    params?: { nota?: number; per_page?: number },
    forceRefresh: boolean = false,
  ): Promise<{
    data: AvaliacaoData[];
    total: number;
    last_page: number;
    current_page: number;
  } | null> {
    initializeCache();
    const cacheKey = `avaliacoes_${JSON.stringify(params)}`;

    const data = await cacheStore.fetchWithCache<{
      data: AvaliacaoData[];
      total: number;
      last_page: number;
      current_page: number;
    } | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.AVALIACOES, { params });
          const result = response.data.data;
          avaliacoes.value = result.data || [];
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchAvaliacaoDetalhes(
    id: number,
    forceRefresh: boolean = false,
  ): Promise<AvaliacaoData | null> {
    initializeCache();
    const cacheKey = `avaliacao_${id}`;

    const data = await cacheStore.fetchWithCache<AvaliacaoData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.AVALIACAO_DETAILS(id));
          return extractDataFromResponse<AvaliacaoData>(response.data);
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh,
    );
    return data;
  }

  async function deleteAvaliacao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_AVALIACAO(id));
      if (response.data.success) {
        cacheStore.invalidatePattern('avaliacoes');
        cacheStore.invalidate(`avaliacao_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PROMOÇÕES
  // ==========================================

  async function fetchPromocoes(forceRefresh: boolean = false): Promise<PromocaoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PromocaoData[]>(
      'promocoes',
      async () => {
        loading.value = true;
        try {
          // CORRIGIDO: ADMIN_ENDPOINTS.PROMOCOES agora existe
          const response = await api.get(ADMIN_ENDPOINTS.PROMOCOES);
          const result = extractDataFromResponse<PromocaoData[]>(response.data);
          promocoes.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function createPromocao(data: CreatePromocaoData): Promise<PromocaoData | null> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_PROMOCAO, data);
      if (response.data.success) {
        cacheStore.invalidate('promocoes');
        return extractDataFromResponse<PromocaoData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updatePromocao(
    id: number,
    data: UpdatePromocaoData,
  ): Promise<PromocaoData | null> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_PROMOCAO(id), data);
      if (response.data.success) {
        cacheStore.invalidate('promocoes');
        cacheStore.invalidate(`promocao_${id}`);
        return extractDataFromResponse<PromocaoData>(response.data);
      }
      return null;
    } catch {
      showError({} as Error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deletePromocao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.DELETE_PROMOCAO(id));
      if (response.data.success) {
        cacheStore.invalidate('promocoes');
        cacheStore.invalidate(`promocao_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    categorias,
    servicos,
    servicosRecentes,
    avaliacoes,
    promocoes,

    // Actions - Categorias
    fetchCategorias,
    fetchCategoriaDetalhes,
    createCategoria,
    updateCategoria,
    deleteCategoria,

    // Actions - Serviços
    fetchServicos,
    fetchServicoDetalhes,
    fetchServicosRecentes,
    createServico,
    updateServico,
    deleteServico,

    // Actions - Avaliações
    fetchAvaliacoes,
    fetchAvaliacaoDetalhes,
    deleteAvaliacao,

    // Actions - Promoções
    fetchPromocoes,
    createPromocao,
    updatePromocao,
    deletePromocao,

    // Utilitários
    showError,
    getStatusText,
    getStatusColor,
    getStatusIcon,
  };
});
