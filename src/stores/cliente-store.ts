import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';
import type { AxiosError } from 'axios';
import { useCacheStore } from './cache-store';

// ==========================================
// INTERFACES
// ==========================================

export interface EnderecoData {
  id: number;
  endereco: string;
  cidade: string;
  bairro: string;
  complemento?: string;
  lat?: number;
  lng?: number;
  principal: boolean;
}

export interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  media_avaliacao: number;
  total_avaliacoes: number;
  verificado: boolean;
  categorias?: { id: number; nome: string }[];
  distancia?: number;
  disponivel?: boolean;
  lat?: number;
  lng?: number;
}

export interface CategoriaData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  servicos_count: number;
}

export interface PedidoData {
  id: number;
  numero: string;
  status: string;
  data: string;
  endereco: string;
  valor: number;
  observacoes?: string;
  prestador?: PrestadorData;
  servico?: { id: number; nome: string; preco: number };
  avaliacao?: { id: number; nota: number; comentario: string };
}

export interface AvaliacaoData {
  id: number;
  nota: number;
  comentario: string;
  categorias: string[];
  created_at: string;
  prestador?: PrestadorData;
  pedido?: PedidoData;
}

export interface FavoritoData {
  id: number;
  prestador: PrestadorData;
  created_at: string;
}

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  tipo?: 'pedido' | 'avaliacao' | 'promocao' | 'sistema';
  icone?: string;
  cor?: string;
  data?: string;
}

export interface DashboardData {
  total_pedidos: number;
  pedidos_pendentes: number;
  pedidos_concluidos: number;
  avaliacoes_feitas: number;
  favoritos_count: number;
}

export interface MensagemData {
  id: number;
  message: string;
  is_owner: boolean;
  created_at: string;
  read_at: string | null;
}

export interface ConversaData {
  id: number;
  nome: string;
  foto: string | null;
  tipo: string;
  disponivel: boolean;
  ultima_mensagem?: {
    texto: string;
    data: string;
    is_owner: boolean;
  };
  nao_lidas: number;
}

export interface SystemHealthData {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    app: Record<string, unknown>;
    database: { status: string; response_time_ms?: number; error?: string };
    cache: { status: string; response_time_ms?: number; error?: string };
    storage: { status: string; free_space_gb?: number; total_space_gb?: number; error?: string };
  };
  response_time_ms: number;
}

export interface SystemMetricsData {
  timestamp: string;
  system: {
    cpu: { load_1min: number; load_5min: number; load_15min: number };
    memory: { total_mb: number; peak_mb: number; limit_mb: number };
    php_version: string;
    server_software: string;
  };
  database: { connection: string; status: string; table_count?: number };
  cache: { driver: string; store: string; prefix: string };
  queue: { connection: string; driver: string };
  storage: { disk: string; free_gb: number; used_gb: number; total_gb: number; usage_percent: number };
  response_time_ms: number;
}

export interface NotificationPreferencesData {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: Record<string, boolean>;
}

export interface PreferencesData {
  theme: string;
  language: string;
  notifications: boolean;
}

export interface LocalizacaoData {
  latitude: number | null;
  longitude: number | null;
  raio: number;
}

export interface SystemPerformanceData {
  period: string;
  avg_response_time: number;
  requests_per_minute: number;
  error_rate: number;
  slow_queries: number;
  cache_hit_rate: number;
}

export interface SystemCacheStatsData {
  default_driver: string;
  stores: Record<string, { available: boolean; status?: string; error?: string }>;
  keys_count: number;
  memory_usage_mb: number;
}

export interface SystemDatabaseStatsData {
  connection: string;
  database: string;
  status: string;
  tables: Array<{ name: string; rows: number; size_mb: number }>;
  total_rows: number;
  total_size_mb: number;
  connection_time_ms?: number;
  error?: string;
}

export interface SystemQueueStatsData {
  connection: string;
  queues: Record<string, { pending_jobs: number; failed_jobs: number; status: string }>;
  total_pending: number;
  total_failed: number;
  workers_active: number;
}

// ==========================================
// STORE DO CLIENTE (COMPLETO E OTIMIZADO)
// ==========================================

export const useClienteStore = defineStore('cliente', () => {
  const $q = useQuasar();
  const cacheStore = useCacheStore();

  // ==========================================
  // STATE
  // ==========================================

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
  const favoritos = ref<FavoritoData[]>([]);
  const enderecos = ref<EnderecoData[]>([]);
  const notificacoes = ref<NotificacaoData[]>([]);
  const prestadoresProximos = ref<PrestadorData[]>([]);
  const prestadoresTop = ref<PrestadorData[]>([]);
  const prestadoresDestaque = ref<PrestadorData[]>([]);
  const conversas = ref<ConversaData[]>([]);
  const mensagensChat = ref<MensagemData[]>([]);
  const unreadCount = ref(0);

  // Monitoramento
  const systemHealth = ref<SystemHealthData | null>(null);
  const systemMetrics = ref<SystemMetricsData | null>(null);
  const systemAlerts = ref<Array<{ level: string; type: string; message: string; timestamp: string }>>([]);

  // Cache para evitar requisições duplicadas
  const pendingRequests = new Map<string, Promise<unknown>>();

  // ==========================================
  // FUNÇÃO AUXILIAR PARA EXTRAIR DADOS DA API
  // ==========================================

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) {
      return [] as T;
    }

    if (Array.isArray(response)) {
      return response as T;
    }

    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      if (obj.data && typeof obj.data === 'object' && obj.data !== null) {
        const nestedData = obj.data as Record<string, unknown>;
        if (nestedData.data && Array.isArray(nestedData.data)) {
          return nestedData.data as T;
        }
      }

      if (obj.success === true && obj.data !== undefined) {
        if (Array.isArray(obj.data)) {
          return obj.data as T;
        }
        if (
          obj.data &&
          typeof obj.data === 'object' &&
          (obj.data as Record<string, unknown>).data &&
          Array.isArray((obj.data as Record<string, unknown>).data)
        ) {
          return (obj.data as Record<string, unknown>).data as T;
        }
        return obj.data as T;
      }

      if (obj.data !== undefined) {
        if (Array.isArray(obj.data)) {
          return obj.data as T;
        }
        if (
          obj.data &&
          typeof obj.data === 'object' &&
          (obj.data as Record<string, unknown>).data &&
          Array.isArray((obj.data as Record<string, unknown>).data)
        ) {
          return (obj.data as Record<string, unknown>).data as T;
        }
        return obj.data as T;
      }
    }

    console.warn('Formato de resposta inesperado:', response);
    return [] as T;
  }

  async function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
  }

  // ==========================================
  // 1. AUTENTICAÇÃO
  // ==========================================

  async function login(email: string, password: string): Promise<{ success: boolean; user?: unknown; token?: string; error?: string }> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.LOGIN, { email, password });
      if (response.data.success) {
        const token = response.data.data?.token;
        if (token) {
          localStorage.setItem('auth_token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return { success: true, user: response.data.data?.user, token };
      }
      return { success: false, error: response.data.error || 'Erro no login' };
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async function logout(): Promise<boolean> {
    try {
      await api.post(CLIENTE_ENDPOINTS.LOGOUT);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      return true;
    } catch {
      return false;
    }
  }

  async function verifyToken(): Promise<boolean> {
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.VERIFY_TOKEN);
      return response.data.success === true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // 2. PERFIL
  // ==========================================

  async function fetchProfile(): Promise<Record<string, unknown> | null> {
    return dedupeRequest('profile', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.GET_PROFILE);
        return response.data.data as Record<string, unknown>;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function updateProfile(data: { nome?: string; telefone?: string; endereco?: string }): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_PROFILE, data);
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function updateAvatar(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const response = await api.post(CLIENTE_ENDPOINTS.UPDATE_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data?.foto || null;
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function removeAvatar(): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVE_AVATAR);
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 3. DASHBOARD
  // ==========================================

  async function fetchDashboard(): Promise<boolean> {
    try {
      const cacheKey = `dashboard_${Date.now()}`;
      const data = await cacheStore.fetchWithCache(
        cacheKey,
        async () => {
          const response = await api.get(CLIENTE_ENDPOINTS.DASHBOARD);
          return extractDataFromResponse<DashboardData>(response.data);
        },
        2 * 60 * 1000,
      );
      dashboard.value = data;
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function fetchStats(): Promise<Record<string, unknown> | null> {
    return dedupeRequest('stats', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.STATS);
        return response.data.data as Record<string, unknown>;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function fetchRecentActivities(limit = 10): Promise<unknown[]> {
    return dedupeRequest(`recent_activities_${limit}`, async () => {
      try {
        const response = await api.get(`${CLIENTE_ENDPOINTS.RECENT_ACTIVITIES}?limit=${limit}`);
        return extractDataFromResponse<unknown[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function fetchActivitiesHistory(page = 1, perPage = 20): Promise<{ data: unknown[]; last_page: number; total: number }> {
    const cacheKey = `activities_history_${page}_${perPage}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(`${CLIENTE_ENDPOINTS.ACTIVITIES_HISTORY}?page=${page}&per_page=${perPage}`);
        return {
          data: extractDataFromResponse<unknown[]>(response.data),
          last_page: response.data.data?.last_page || 1,
          total: response.data.data?.total || 0,
        };
      } catch (err) {
        showError(err);
        return { data: [], last_page: 1, total: 0 };
      }
    });
  }

  // ==========================================
  // 4. PEDIDOS
  // ==========================================

  async function fetchPedidos(status?: string): Promise<PedidoData[] | null> {
    const cacheKey = `pedidos_${status || 'all'}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const url = status ? CLIENTE_ENDPOINTS.PEDIDOS_BY_STATUS(status) : CLIENTE_ENDPOINTS.PEDIDOS;
        const response = await api.get(url);
        const data = extractDataFromResponse<PedidoData[]>(response.data);
        pedidos.value = data;
        return pedidos.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function fetchPedidoDetalhes(id: string | number): Promise<PedidoData | null> {
    const cacheKey = `pedido_detalhes_${id}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PEDIDO_DETALHES(id.toString()));
        const data = extractDataFromResponse<PedidoData>(response.data);
        pedidoDetalhes.value = data;
        return pedidoDetalhes.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function criarPedido(data: {
    prestador_id: number;
    servico_id: number;
    data: string;
    endereco: string;
    observacoes?: string;
  }): Promise<PedidoData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_PEDIDO, data);
      await fetchPedidos();
      return extractDataFromResponse<PedidoData>(response.data);
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function cancelarPedido(id: string | number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CANCELAR_PEDIDO(id.toString()));
      await fetchPedidos();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function checkPedidoAvaliado(pedidoId: string | number): Promise<boolean> {
    const cacheKey = `pedido_avaliado_${pedidoId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHECK_PEDIDO_AVALIACAO(pedidoId.toString()));
        return response.data.data?.avaliado === true;
      } catch {
        return false;
      }
    });
  }

  // ==========================================
  // 5. AVALIAÇÕES
  // ==========================================

  async function fetchAvaliacoes(): Promise<AvaliacaoData[] | null> {
    return dedupeRequest('avaliacoes', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.AVALIACOES);
        const data = extractDataFromResponse<AvaliacaoData[]>(response.data);
        avaliacoes.value = data;
        return avaliacoes.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function criarAvaliacao(data: {
    prestador_id: number;
    pedido_id: number;
    nota: number;
    comentario?: string;
    categorias?: string[];
    recomenda?: boolean;
  }): Promise<AvaliacaoData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_AVALIACAO, data);
      await fetchAvaliacoes();
      return extractDataFromResponse<AvaliacaoData>(response.data);
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function atualizarAvaliacao(
    id: string | number,
    data: { nota?: number; comentario?: string; categorias?: string[] },
  ): Promise<AvaliacaoData | null> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.ATUALIZAR_AVALIACAO(id.toString()), data);
      await fetchAvaliacoes();
      return extractDataFromResponse<AvaliacaoData>(response.data);
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function removerAvaliacao(id: string | number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVER_AVALIACAO(id.toString()));
      await fetchAvaliacoes();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 6. FAVORITOS
  // ==========================================

  async function fetchFavoritos(): Promise<FavoritoData[] | null> {
    return dedupeRequest('favoritos', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.FAVORITOS);
        const data = extractDataFromResponse<FavoritoData[]>(response.data);
        favoritos.value = data;
        return favoritos.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function adicionarFavorito(prestadorId: string | number): Promise<boolean> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.ADICIONAR_FAVORITO(prestadorId.toString()));
      await fetchFavoritos();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function removerFavorito(prestadorId: string | number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVER_FAVORITO(prestadorId.toString()));
      await fetchFavoritos();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function checkFavorito(prestadorId: string | number): Promise<boolean> {
    const cacheKey = `favorito_check_${prestadorId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHECK_FAVORITO(prestadorId.toString()));
        return response.data.data?.is_favorito === true;
      } catch {
        return false;
      }
    });
  }

  // ==========================================
  // 7. PRESTADORES (público)
  // ==========================================

  async function fetchPrestadoresProximos(lat: number, lng: number, raio?: number): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_proximos_${lat}_${lng}_${raio || 10}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const url = CLIENTE_ENDPOINTS.PRESTADORES_PROXIMOS_LOCAL(lat, lng, raio);
        const response = await api.get(url);
        const data = extractDataFromResponse<PrestadorData[]>(response.data);
        prestadoresProximos.value = data;
        return prestadoresProximos.value;
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function fetchPrestadoresTop(): Promise<PrestadorData[]> {
    return dedupeRequest('prestadores_top', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_TOP);
        const data = extractDataFromResponse<PrestadorData[]>(response.data);
        prestadoresTop.value = data;
        return prestadoresTop.value;
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function fetchPrestadoresDestaque(): Promise<PrestadorData[]> {
    return dedupeRequest('prestadores_destaque', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_DESTAQUE);
        const data = extractDataFromResponse<PrestadorData[]>(response.data);
        prestadoresDestaque.value = data;
        return prestadoresDestaque.value;
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function fetchPrestadorDetalhes(id: string | number): Promise<PrestadorData | null> {
    const cacheKey = `prestador_detalhes_${id}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADOR_DETALHES(id.toString()));
        return extractDataFromResponse<PrestadorData>(response.data);
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function buscarPrestadoresPorCategoria(categoriaId: number): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_categoria_${categoriaId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_BY_CATEGORIA(categoriaId));
        return extractDataFromResponse<PrestadorData[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function buscarPrestadoresPorNome(busca: string): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_busca_${busca}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_BY_BUSCA(busca));
        return extractDataFromResponse<PrestadorData[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function fetchCategorias(): Promise<CategoriaData[]> {
    return dedupeRequest('categorias', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_CATEGORIAS);
        return extractDataFromResponse<CategoriaData[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  // ==========================================
  // 8. NOTIFICAÇÕES
  // ==========================================

  async function fetchNotificacoes(): Promise<NotificacaoData[] | null> {
    return dedupeRequest('notificacoes', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.NOTIFICATIONS);
        const data = extractDataFromResponse<NotificacaoData[]>(response.data);
        notificacoes.value = data;
        return notificacoes.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function marcarNotificacaoLida(id: string | number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_NOTIFICATION_READ(id.toString()));
      await fetchNotificacoes();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function marcarTodasNotificacoesLidas(): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      await fetchNotificacoes();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function fetchNotificationPreferences(): Promise<NotificationPreferencesData | null> {
    return dedupeRequest('notif_preferences', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.NOTIFICATION_PREFERENCES);
        return response.data.data as NotificationPreferencesData;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function updateNotificationPreferences(preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    types?: Record<string, boolean>;
  }): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCES, preferences);
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 9. PREFERÊNCIAS
  // ==========================================

  async function fetchPreferences(): Promise<PreferencesData | null> {
    return dedupeRequest('preferences', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PREFERENCES);
        return response.data.data as PreferencesData;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function updatePreferences(preferences: { theme?: string; language?: string; notifications?: boolean }): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_PREFERENCES, preferences);
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 10. LOCALIZAÇÃO
  // ==========================================

  async function fetchLocalizacao(): Promise<LocalizacaoData | null> {
    return dedupeRequest('localizacao', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.LOCALIZACAO);
        return response.data.data as LocalizacaoData;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function updateLocalizacao(latitude: number, longitude: number, raio?: number): Promise<boolean> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.UPDATE_LOCALIZACAO, { latitude, longitude, raio });
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 11. ENDEREÇOS
  // ==========================================

  async function fetchEnderecos(): Promise<EnderecoData[] | null> {
    return dedupeRequest('enderecos', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.ADDRESSES);
        const data = extractDataFromResponse<EnderecoData[]>(response.data);
        enderecos.value = data;
        return enderecos.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function criarEndereco(data: Omit<EnderecoData, 'id'>): Promise<EnderecoData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CREATE_ADDRESS, data);
      await fetchEnderecos();
      return extractDataFromResponse<EnderecoData>(response.data);
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function atualizarEndereco(id: number, data: Partial<EnderecoData>): Promise<EnderecoData | null> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_ADDRESS(id.toString()), data);
      await fetchEnderecos();
      return extractDataFromResponse<EnderecoData>(response.data);
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function deletarEndereco(id: number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.DELETE_ADDRESS(id.toString()));
      await fetchEnderecos();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function setEnderecoPrincipal(id: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.SET_PRIMARY_ADDRESS(id.toString()));
      await fetchEnderecos();
      return response.data.success === true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // ==========================================
  // 12. CHAT
  // ==========================================

  async function fetchConversas(): Promise<ConversaData[] | null> {
    return dedupeRequest('conversas', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_CONVERSATIONS);
        const data = extractDataFromResponse<ConversaData[]>(response.data);
        conversas.value = data;
        return conversas.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function fetchMensagens(prestadorId: number): Promise<MensagemData[] | null> {
    const cacheKey = `mensagens_${prestadorId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_MESSAGES(prestadorId));
        const data = extractDataFromResponse<MensagemData[]>(response.data);
        mensagensChat.value = data;
        return mensagensChat.value;
      } catch (err) {
        showError(err);
        return null;
      }
    });
  }

  async function sendMessage(prestadorId: number, message: string): Promise<MensagemData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CHAT_SEND_MESSAGE, {
        prestador_id: prestadorId,
        message: message,
      });
      if (response.data.success) {
        const novaMensagem = extractDataFromResponse<MensagemData>(response.data);
        mensagensChat.value.push(novaMensagem);
        return novaMensagem;
      }
      return null;
    } catch (err) {
      showError(err);
      return null;
    }
  }

  async function fetchLatestMessages(prestadorId: number, lastId?: number): Promise<MensagemData[]> {
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.CHAT_LATEST_MESSAGES(prestadorId, lastId));
      return extractDataFromResponse<MensagemData[]>(response.data);
    } catch {
      return [];
    }
  }

  async function markMessagesAsRead(prestadorId: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CHAT_MARK_AS_READ(prestadorId));
      return response.data.success === true;
    } catch {
      return false;
    }
  }

  async function fetchUnreadCount(): Promise<number> {
    return dedupeRequest('unread_count', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_UNREAD_COUNT);
        unreadCount.value = response.data.data?.total || 0;
        return unreadCount.value;
      } catch {
        return 0;
      }
    });
  }

  // ==========================================
  // 13. MONITORAMENTO DE SISTEMA
  // ==========================================

  async function fetchSystemHealth(): Promise<SystemHealthData | null> {
    return dedupeRequest('system_health', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_HEALTH);
        systemHealth.value = response.data as SystemHealthData;
        return systemHealth.value;
      } catch {
        return null;
      }
    });
  }

  async function fetchSystemMetrics(): Promise<SystemMetricsData | null> {
    return dedupeRequest('system_metrics', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_METRICS);
        systemMetrics.value = response.data.data as SystemMetricsData;
        return systemMetrics.value;
      } catch {
        return null;
      }
    });
  }

  async function fetchSystemPerformance(period: 'hour' | 'day' | 'week' = 'hour'): Promise<SystemPerformanceData | null> {
    return dedupeRequest(`system_performance_${period}`, async () => {
      try {
        const response = await api.get(`${CLIENTE_ENDPOINTS.SYSTEM_PERFORMANCE}?period=${period}`);
        return response.data.data as SystemPerformanceData;
      } catch {
        return null;
      }
    });
  }

  async function fetchSystemAlerts(): Promise<Array<{ level: string; type: string; message: string; timestamp: string }>> {
    return dedupeRequest('system_alerts', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_ALERTS);
        systemAlerts.value = response.data.data?.alerts || [];
        return systemAlerts.value;
      } catch {
        return [];
      }
    });
  }

  async function fetchSystemLogs(lines = 100, level = 'all'): Promise<{ total: number; logs: Array<{ timestamp: string | null; level: string; message: string }> }> {
    return dedupeRequest(`system_logs_${lines}_${level}`, async () => {
      try {
        const response = await api.get(`${CLIENTE_ENDPOINTS.SYSTEM_LOGS_RECENT}?lines=${lines}&level=${level}`);
        return response.data.data as { total: number; logs: Array<{ timestamp: string | null; level: string; message: string }> };
      } catch {
        return { total: 0, logs: [] };
      }
    });
  }

  async function fetchCacheStats(): Promise<SystemCacheStatsData | null> {
    return dedupeRequest('cache_stats', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_CACHE_STATS);
        return response.data.data as SystemCacheStatsData;
      } catch {
        return null;
      }
    });
  }

  async function fetchDatabaseStats(): Promise<SystemDatabaseStatsData | null> {
    return dedupeRequest('database_stats', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_DATABASE_STATS);
        return response.data.data as SystemDatabaseStatsData;
      } catch {
        return null;
      }
    });
  }

  async function fetchQueueStats(): Promise<SystemQueueStatsData | null> {
    return dedupeRequest('queue_stats', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.SYSTEM_QUEUE_STATS);
        return response.data.data as SystemQueueStatsData;
      } catch {
        return null;
      }
    });
  }

  // ==========================================
  // 14. REGISTRO - MÉTODOS
  // ==========================================

  const registerForm = ref({
    nome: '',
    telefone: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    foto: null as File | null,
    tipo: 'cliente' as const,
  });

  const currentStep = ref(1);
  const registerLoading = ref(false);
  const acceptTerms = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const photoPreview = ref<string | null>(null);
  const totalSteps = 4;

  const progressWidth = computed(() => (currentStep.value / totalSteps) * 100);

  const passwordStrength = computed(() => {
    const pwd = registerForm.value.password;
    if (!pwd) return { strength: 0, text: 'Fraca' };

    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;

    let text = 'Fraca';
    if (strength <= 25) text = 'Fraca';
    else if (strength <= 50) text = 'Razoável';
    else if (strength <= 75) text = 'Boa';
    else text = 'Forte';

    return { strength, text };
  });

  const isFormValid = computed(() => {
    return (
      registerForm.value.nome &&
      registerForm.value.telefone &&
      registerForm.value.email &&
      registerForm.value.password &&
      registerForm.value.password === registerForm.value.confirmPassword &&
      acceptTerms.value
    );
  });

  function setRegisterField<K extends keyof typeof registerForm.value>(field: K, value: (typeof registerForm.value)[K]) {
    registerForm.value[field] = value;
  }

  function nextStep() {
    if (currentStep.value < totalSteps) {
      if (!validateCurrentStep()) return;
      currentStep.value++;
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  function goToStep(step: number) {
    if (step < currentStep.value) {
      currentStep.value = step;
    }
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateCurrentStep(): boolean {
    switch (currentStep.value) {
      case 1:
        if (!registerForm.value.nome?.trim()) {
          $q.notify({ type: 'warning', message: 'Preencha o nome completo', position: 'top' });
          return false;
        }
        if (!registerForm.value.telefone?.trim()) {
          $q.notify({ type: 'warning', message: 'Preencha o telefone', position: 'top' });
          return false;
        }
        if (!registerForm.value.email?.trim()) {
          $q.notify({ type: 'warning', message: 'Preencha o email', position: 'top' });
          return false;
        }
        if (!isValidEmail(registerForm.value.email)) {
          $q.notify({ type: 'warning', message: 'Email inválido', position: 'top' });
          return false;
        }
        break;

      case 2:
        if (!registerForm.value.password) {
          $q.notify({ type: 'warning', message: 'Preencha a palavra-passe', position: 'top' });
          return false;
        }
        if (registerForm.value.password.length < 6) {
          $q.notify({
            type: 'warning',
            message: 'A palavra-passe deve ter pelo menos 6 caracteres',
            position: 'top',
          });
          return false;
        }
        if (registerForm.value.password !== registerForm.value.confirmPassword) {
          $q.notify({
            type: 'warning',
            message: 'As palavras-passe não coincidem',
            position: 'top',
          });
          return false;
        }
        break;

      case 3:
        break;

      case 4:
        if (!acceptTerms.value) {
          $q.notify({
            type: 'warning',
            message: 'Aceite os termos para continuar',
            position: 'top',
          });
          return false;
        }
        break;
    }
    return true;
  }

  function handleFileUpload(file: File | null) {
    if (!file) return;

    const allowedTypes = ['jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(extension || '')) {
      $q.notify({
        type: 'negative',
        message: 'Formato não suportado. Use JPG ou PNG',
        position: 'top',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      $q.notify({ type: 'negative', message: 'A imagem deve ter no máximo 5MB', position: 'top' });
      return;
    }

    registerForm.value.foto = file;
    photoPreview.value = URL.createObjectURL(file);
  }

  function removePhoto() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    registerForm.value.foto = null;
    photoPreview.value = null;
  }

  async function register(): Promise<boolean> {
    if (!validateCurrentStep()) return false;

    registerLoading.value = true;
    try {
      const formData = new FormData();
      formData.append('nome', registerForm.value.nome);
      formData.append('telefone', registerForm.value.telefone);
      formData.append('email', registerForm.value.email);
      formData.append('password', registerForm.value.password);
      formData.append('endereco', registerForm.value.endereco || '');
      formData.append('tipo', registerForm.value.tipo);

      if (registerForm.value.foto) {
        formData.append('foto', registerForm.value.foto);
      }

      const endpoint = registerForm.value.tipo === 'cliente' ? CLIENTE_ENDPOINTS.REGISTER : CLIENTE_ENDPOINTS.REGISTER_PRESTADOR;
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || 'Registo efetuado com sucesso!',
          position: 'top',
          icon: 'check_circle',
        });
        resetRegisterForm();
        return true;
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.error || 'Erro ao registar',
          position: 'top',
        });
        return false;
      }
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      $q.notify({
        type: 'negative',
        message: error.response?.data?.error || error.message || 'Erro ao registar',
        position: 'top',
      });
      return false;
    } finally {
      registerLoading.value = false;
    }
  }

  function resetRegisterForm() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }

    registerForm.value = {
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      endereco: '',
      foto: null,
      tipo: 'cliente',
    };
    currentStep.value = 1;
    acceptTerms.value = false;
    photoPreview.value = null;
    showPassword.value = false;
    showConfirmPassword.value = false;
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  function showError(error: unknown) {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao carregar dados';
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 3000,
    });
  }

  function clearCache(): void {
    cacheStore.clear();
    pendingRequests.clear();
    console.log('🗑️ Cache do cliente limpo');
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    dashboard,
    pedidos,
    pedidoDetalhes,
    avaliacoes,
    favoritos,
    enderecos,
    notificacoes,
    prestadoresProximos,
    prestadoresTop,
    prestadoresDestaque,
    conversas,
    mensagensChat,
    unreadCount,

    // Monitoramento State
    systemHealth,
    systemMetrics,
    systemAlerts,

    // Registro State
    registerForm,
    currentStep,
    registerLoading,
    acceptTerms,
    showPassword,
    showConfirmPassword,
    photoPreview,
    totalSteps,
    progressWidth,
    passwordStrength,
    isFormValid,

    // Autenticação
    login,
    logout,
    verifyToken,

    // Perfil
    fetchProfile,
    updateProfile,
    updateAvatar,
    removeAvatar,
    changePassword,

    // Dashboard
    fetchDashboard,
    fetchStats,
    fetchRecentActivities,
    fetchActivitiesHistory,

    // Pedidos
    fetchPedidos,
    fetchPedidoDetalhes,
    criarPedido,
    cancelarPedido,
    checkPedidoAvaliado,

    // Avaliações
    fetchAvaliacoes,
    criarAvaliacao,
    atualizarAvaliacao,
    removerAvaliacao,

    // Favoritos
    fetchFavoritos,
    adicionarFavorito,
    removerFavorito,
    checkFavorito,

    // Prestadores
    fetchPrestadoresProximos,
    fetchPrestadoresTop,
    fetchPrestadoresDestaque,
    fetchPrestadorDetalhes,
    buscarPrestadoresPorCategoria,
    buscarPrestadoresPorNome,
    fetchCategorias,

    // Notificações
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    fetchNotificationPreferences,
    updateNotificationPreferences,

    // Preferências
    fetchPreferences,
    updatePreferences,

    // Localização
    fetchLocalizacao,
    updateLocalizacao,

    // Endereços
    fetchEnderecos,
    criarEndereco,
    atualizarEndereco,
    deletarEndereco,
    setEnderecoPrincipal,

    // Chat
    fetchConversas,
    fetchMensagens,
    sendMessage,
    fetchLatestMessages,
    markMessagesAsRead,
    fetchUnreadCount,

    // Monitoramento
    fetchSystemHealth,
    fetchSystemMetrics,
    fetchSystemPerformance,
    fetchSystemAlerts,
    fetchSystemLogs,
    fetchCacheStats,
    fetchDatabaseStats,
    fetchQueueStats,

    // Registro Métodos
    setRegisterField,
    nextStep,
    prevStep,
    goToStep,
    handleFileUpload,
    removePhoto,
    register,
    resetRegisterForm,

    // Utilitários
    showError,
    clearCache,
  };
});
