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

  // Cache para evitar requisições duplicadas
  const pendingRequests = new Map<string, Promise<unknown>>();

  // ==========================================
  // MÉTODO AUXILIAR PARA EVITAR REQUISIÇÕES DUPLICADAS
  // ==========================================

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
  // REGISTRO DO CLIENTE (MULTI-STEP)
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

  // ==========================================
  // 1. DASHBOARD (COM CACHE)
  // ==========================================

  async function fetchDashboard(): Promise<boolean> {
    try {
      const cacheKey = `dashboard_${Date.now()}`;

      const data = await cacheStore.fetchWithCache(
        cacheKey,
        async () => {
          const response = await api.get(CLIENTE_ENDPOINTS.DASHBOARD);
          return response.data.data;
        },
        2 * 60 * 1000,
      );

      dashboard.value = data;
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  // ==========================================
  // 2. PEDIDOS (COM CACHE E DEDUPE)
  // ==========================================

  async function fetchPedidos(status?: string): Promise<PedidoData[] | null> {
    const cacheKey = `pedidos_${status || 'all'}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const url = status
          ? CLIENTE_ENDPOINTS.PEDIDOS_BY_STATUS(status)
          : CLIENTE_ENDPOINTS.PEDIDOS;
        const response = await api.get(url);
        const data = response.data.data;
        pedidos.value = Array.isArray(data) ? data : data.data || [];
        return pedidos.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function fetchPedidoDetalhes(id: string | number): Promise<PedidoData | null> {
    const cacheKey = `pedido_detalhes_${id}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PEDIDO_DETALHES(id.toString()));
        pedidoDetalhes.value = response.data.data;
        return pedidoDetalhes.value;
      } catch (error) {
        showError(error);
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
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  }

  async function cancelarPedido(id: string | number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CANCELAR_PEDIDO(id.toString()));
      await fetchPedidos();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function checkPedidoAvaliado(pedidoId: string | number): Promise<boolean> {
    const cacheKey = `pedido_avaliado_${pedidoId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(
          CLIENTE_ENDPOINTS.CHECK_PEDIDO_AVALIACAO(pedidoId.toString()),
        );
        return response.data.data.avaliado;
      } catch (error) {
        console.error('Erro ao verificar avaliação:', error);
        return false;
      }
    });
  }

  // ==========================================
  // 3. AVALIAÇÕES (COM CACHE E DEDUPE)
  // ==========================================

  async function fetchAvaliacoes(): Promise<AvaliacaoData[] | null> {
    return dedupeRequest('avaliacoes', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.AVALIACOES);
        const data = response.data.data;
        avaliacoes.value = Array.isArray(data) ? data : data.data || [];
        return avaliacoes.value;
      } catch (error) {
        showError(error);
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
      return response.data.data;
    } catch (error) {
      showError(error);
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
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  }

  async function removerAvaliacao(id: string | number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVER_AVALIACAO(id.toString()));
      await fetchAvaliacoes();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  // ==========================================
  // 4. FAVORITOS (COM CACHE E DEDUPE)
  // ==========================================

  async function fetchFavoritos(): Promise<FavoritoData[] | null> {
    return dedupeRequest('favoritos', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.FAVORITOS);
        favoritos.value = response.data.data;
        return favoritos.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function adicionarFavorito(prestadorId: string | number): Promise<boolean> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.ADICIONAR_FAVORITO(prestadorId.toString()));
      await fetchFavoritos();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function removerFavorito(prestadorId: string | number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVER_FAVORITO(prestadorId.toString()));
      await fetchFavoritos();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function checkFavorito(prestadorId: string | number): Promise<boolean> {
    const cacheKey = `favorito_check_${prestadorId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHECK_FAVORITO(prestadorId.toString()));
        return response.data.data.is_favorito;
      } catch (error) {
        console.error('Erro ao verificar favorito:', error);
        return false;
      }
    });
  }

  // ==========================================
  // 5. PRESTADORES (consulta pública COM CACHE)
  // ==========================================

  async function fetchPrestadoresProximos(lat: number, lng: number): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_proximos_${lat}_${lng}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_PROXIMOS(lat, lng));
        prestadoresProximos.value = response.data.data;
        return prestadoresProximos.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchPrestadoresTop(): Promise<PrestadorData[]> {
    return dedupeRequest('prestadores_top', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_TOP);
        prestadoresTop.value = response.data.data;
        return prestadoresTop.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchPrestadoresDestaque(): Promise<PrestadorData[]> {
    return dedupeRequest('prestadores_destaque', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_DESTAQUE);
        prestadoresDestaque.value = response.data.data;
        return prestadoresDestaque.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchPrestadorDetalhes(id: string | number): Promise<PrestadorData | null> {
    const cacheKey = `prestador_detalhes_${id}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADOR_DETALHES(id.toString()));
        return response.data.data;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function buscarPrestadoresPorCategoria(categoriaId: number): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_categoria_${categoriaId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_BY_CATEGORIA(categoriaId));
        return response.data.data;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function buscarPrestadoresPorNome(busca: string): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_busca_${busca}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_BY_BUSCA(busca));
        return response.data.data;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchCategorias(): Promise<CategoriaData[]> {
    return dedupeRequest('categorias', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_CATEGORIAS);
        return response.data.data;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  // ==========================================
  // 6. ENDEREÇOS
  // ==========================================

  async function fetchEnderecos(): Promise<EnderecoData[] | null> {
    return dedupeRequest('enderecos', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.ADDRESSES);
        enderecos.value = response.data.data;
        return enderecos.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function criarEndereco(data: Omit<EnderecoData, 'id'>): Promise<EnderecoData | null> {
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CREATE_ADDRESS, data);
      await fetchEnderecos();
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  }

  async function atualizarEndereco(
    id: number,
    data: Partial<EnderecoData>,
  ): Promise<EnderecoData | null> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_ADDRESS(id.toString()), data);
      await fetchEnderecos();
      return response.data.data;
    } catch (error) {
      showError(error);
      return null;
    }
  }

  async function deletarEndereco(id: number): Promise<boolean> {
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.DELETE_ADDRESS(id.toString()));
      await fetchEnderecos();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function setEnderecoPrincipal(id: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.SET_PRIMARY_ADDRESS(id.toString()));
      await fetchEnderecos();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  // ==========================================
  // 7. NOTIFICAÇÕES
  // ==========================================

  async function fetchNotificacoes(): Promise<NotificacaoData[] | null> {
    return dedupeRequest('notificacoes', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.NOTIFICATIONS);
        notificacoes.value = response.data.data;
        return notificacoes.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function marcarNotificacaoLida(id: string | number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_NOTIFICATION_READ(id.toString()));
      await fetchNotificacoes();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function marcarTodasNotificacoesLidas(): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      await fetchNotificacoes();
      return response.data.success;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  // ==========================================
  // 8. CHAT
  // ==========================================

  async function fetchConversas(): Promise<ConversaData[] | null> {
    return dedupeRequest('conversas', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_CONVERSATIONS);
        conversas.value = response.data.data;
        return conversas.value;
      } catch (error) {
        showError(error);
        return null;
      }
    });
  }

  async function fetchMensagens(prestadorId: number): Promise<MensagemData[] | null> {
    const cacheKey = `mensagens_${prestadorId}`;
    return dedupeRequest(cacheKey, async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_MESSAGES(prestadorId));
        mensagensChat.value = response.data.data;
        return mensagensChat.value;
      } catch (error) {
        showError(error);
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
        const novaMensagem: MensagemData = response.data.data;
        mensagensChat.value.push(novaMensagem);
        return novaMensagem;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    }
  }

  async function fetchLatestMessages(
    prestadorId: number,
    lastId?: number,
  ): Promise<MensagemData[]> {
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.CHAT_LATEST_MESSAGES(prestadorId, lastId));
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar últimas mensagens:', error);
      return [];
    }
  }

  async function markMessagesAsRead(prestadorId: number): Promise<boolean> {
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CHAT_MARK_AS_READ(prestadorId));
      return response.data.success;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      return false;
    }
  }

  async function fetchUnreadCount(): Promise<number> {
    return dedupeRequest('unread_count', async () => {
      try {
        const response = await api.get(CLIENTE_ENDPOINTS.CHAT_UNREAD_COUNT);
        unreadCount.value = response.data.data.total;
        return unreadCount.value;
      } catch (error) {
        console.error('Erro ao buscar contagem de não lidas:', error);
        return 0;
      }
    });
  }

  // ==========================================
  // 9. REGISTRO - MÉTODOS
  // ==========================================

  function setRegisterField<K extends keyof typeof registerForm.value>(
    field: K,
    value: (typeof registerForm.value)[K],
  ) {
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

      const response = await api.post(CLIENTE_ENDPOINTS.REGISTER, formData, {
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
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      $q.notify({
        type: 'negative',
        message: err.response?.data?.error || err.message || 'Erro ao registar',
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
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
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

    // Dashboard
    fetchDashboard,

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

    // Endereços
    fetchEnderecos,
    criarEndereco,
    atualizarEndereco,
    deletarEndereco,
    setEnderecoPrincipal,

    // Notificações
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,

    // Chat
    fetchConversas,
    fetchMensagens,
    sendMessage,
    fetchLatestMessages,
    markMessagesAsRead,
    fetchUnreadCount,

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
