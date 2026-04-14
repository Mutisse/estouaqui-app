import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
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
  descricao?: string;
  foto?: string | null;
  data: string;
  endereco: string;
  observacoes?: string;
  valor: number | null;
  created_at: string;
  prestador?: PrestadorData;
  servico?: { id: number; nome: string; preco: number };
  categoria?: { id: number; nome: string; icone: string; cor: string };
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

export interface PropostaData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  valor: number;
  mensagem: string | null;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  prestador?: PrestadorData;
  pedido?: PedidoData;
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

export interface CupomValidadoData {
  valido: boolean;
  id: number;
  codigo: string;
  titulo: string;
  descricao: string | null;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  desconto_aplicado: number;
  valor_minimo: number;
  validade: string;
  novo_total: number;
}

// ==========================================
// STORE DO CLIENTE
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
  const propostas = ref<PropostaData[]>([]);

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
  // PERFIL
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
  // DASHBOARD
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

  // ==========================================
  // PEDIDOS DO CLIENTE
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
      if (data.foto) {
        formData.append('foto', data.foto);
      }

      const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_PEDIDO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (response.data.success) {
        showNotification('positive', 'Pedido publicado com sucesso!', 'check_circle');
        await fetchMeusPedidos();
        return response.data.data;
      }
      return null;
    } catch (err) {
      showError(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMeusPedidos(): Promise<PedidoData[]> {
    return dedupeRequest('meus_pedidos', async () => {
      loading.value = true;
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.MEUS_PEDIDOS);
        const data = extractDataFromResponse<PedidoData[]>(response.data);
        pedidos.value = data;
        return pedidos.value;
      } catch (err) {
        showError(err);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchDetalhesPedido(id: number): Promise<PedidoData | null> {
    return dedupeRequest(`detalhes_pedido_${id}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.DETALHES_PEDIDO(id.toString()));
        const data = extractDataFromResponse<PedidoData>(response.data);
        pedidoDetalhes.value = data;
        return pedidoDetalhes.value;
      } catch (err) {
        showError(err);
        return null;
      } finally {
        loading.value = false;
      }
    });
  }

  async function cancelarPedidoCliente(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CANCELAR_PEDIDO_CLIENTE(id.toString()));
      if (response.data.success) {
        showNotification('positive', 'Pedido cancelado com sucesso!', 'cancel');
        await fetchMeusPedidos();
        return true;
      }
      return false;
    } catch (err) {
      showError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PROPOSTAS DO CLIENTE
  // ==========================================

  async function fetchMinhasPropostas(): Promise<PropostaData[]> {
    return dedupeRequest('minhas_propostas', async () => {
      loading.value = true;
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PROPOSTAS);
        const data = extractDataFromResponse<PropostaData[]>(response.data);
        propostas.value = data;
        return propostas.value;
      } catch (err) {
        showError(err);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function aceitarProposta(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.ACEITAR_PROPOSTA(id));
      if (response.data.success) {
        showNotification('positive', 'Proposta aceita! Prestador será contactado.', 'check_circle');
        await fetchMinhasPropostas();
        await fetchMeusPedidos();
        return true;
      }
      return false;
    } catch (err) {
      showError(err);
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
        await fetchMinhasPropostas();
        return true;
      }
      return false;
    } catch (err) {
      showError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // AVALIAÇÕES
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
  // FAVORITOS
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
  // PRESTADORES (consulta pública)
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
        const response = await api.get(CLIENTE_ENDPOINTS.CATEGORIAS_PUBLICAS);
        return extractDataFromResponse<CategoriaData[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  // ==========================================
  // NOTIFICAÇÕES
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

  // ==========================================
  // PREFERÊNCIAS
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
  // LOCALIZAÇÃO
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
  // ENDEREÇOS
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
  // CHAT
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
  // PROMOÇÕES
  // ==========================================

  async function fetchPromocoes(): Promise<unknown[]> {
    return dedupeRequest('promocoes', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PROMOCOES_ATIVAS);
        return extractDataFromResponse<unknown[]>(response.data);
      } catch (err) {
        showError(err);
        return [];
      }
    });
  }

  async function validarCupom(codigo: string): Promise<CupomValidadoData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.VALIDAR_CUPOM, { codigo });
      if (response.data.success) {
        showNotification('positive', `Cupom ${codigo} aplicado com sucesso!`, 'local_offer');
        return response.data.data as CupomValidadoData;
      }
      return null;
    } catch (err) {
      showError(err);
      return null;
    }
  }

  // ==========================================
  // REGISTRO - MÉTODOS
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

  function showNotification(type: 'positive' | 'negative' | 'warning' | 'info', message: string, icon?: string) {
    const notifyOptions: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };
    if (icon) {
      notifyOptions.icon = icon;
    }
    $q.notify(notifyOptions);
  }

  function showError(error: unknown) {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao carregar dados';
    showNotification('negative', message);
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
    propostas,

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

    // Perfil
    fetchProfile,
    updateProfile,
    updateAvatar,
    removeAvatar,
    changePassword,

    // Dashboard
    fetchDashboard,

    // Pedidos
    criarPedidoServico,
    fetchMeusPedidos,
    fetchDetalhesPedido,
    cancelarPedidoCliente,

    // Propostas
    fetchMinhasPropostas,
    aceitarProposta,
    recusarProposta,

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

    // Promoções
    fetchPromocoes,
    validarCupom,

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
    showNotification,
    showError,
    clearCache,
  };
});
