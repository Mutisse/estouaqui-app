import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';

// ==========================================
// INTERFACES
// ==========================================

export interface ServicoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  icone: string;
  ativo: boolean;
  categoria_id: number;
  categoria?: { id: number; nome: string };
  created_at: string;
  updated_at: string;
}

export interface AgendaData {
  id: number;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  bloqueado: boolean;
  motivo?: string;
}

export interface SolicitacaoData {
  id: number;
  numero: string;
  cliente_id: number;
  servico_id: number;
  data: string;
  endereco: string;
  status: string;
  valor: number;
  observacoes?: string;
  cliente?: { id: number; nome: string; foto: string | null; telefone: string };
  servico?: { id: number; nome: string; preco: number };
  created_at: string;
}

export interface PedidoDisponivelData {
  id: number;
  numero: string;
  descricao: string;
  foto: string | null;
  endereco: string;
  status: string;
  created_at: string;
  distancia_km?: number;
  categoria?: { id: number; nome: string; icone: string; cor: string };
  cliente?: { id: number; nome: string; foto: string | null };
}

export interface PropostaData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  valor: number;
  mensagem: string | null;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  pedido?: PedidoDisponivelData;
}

export interface CategoriaPrestadorData {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  slug?: string;
  descricao?: string;
}

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
  status: 'pendente' | 'processando' | 'concluido' | 'cancelado';
  metodo: 'mpesa' | 'bancario';
  conta: string;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export interface StatsData {
  pedidos_pendentes: number;
  servicos_hoje: number;
  avaliacao_media: number;
  ganhos_mes: number;
}

export interface ProximoServicoData {
  id: number;
  numero: string;
  cliente: { id: number; nome: string; foto: string | null; telefone: string };
  servico: { id: number; nome: string; preco: number };
  data: string;
  endereco: string;
  status: string;
  valor: number;
  observacoes?: string;
}

export interface AvaliacaoRecenteData {
  id: number;
  nota: number;
  comentario: string;
  created_at: string;
  cliente: { id: number; nome: string; foto: string | null };
}

export interface DiaSemanaData {
  id: number;
  nome: string;
  nome_curto: string;
  ordem: number;
  ativo: boolean;
}

export interface MesData {
  id: number;
  nome: string;
  nome_curto: string;
  numero: number;
  ativo: boolean;
}

export interface HorarioPadraoData {
  id: number;
  horario: string;
  label: string;
  ordem: number;
  ativo: boolean;
}

export interface HorarioOptionData {
  label: string;
  value: string;
}

export interface DiaOptionData {
  label: string;
  value: string;
}

export interface IntervaloData {
  id: number;
  prestador_id: number;
  dias: string[];
  inicio: string;
  fim: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracoesDisponibilidade {
  tempo_minimo_agendamento: number;
  tempo_entre_servicos: number;
  notificar_antes: number;
  aceitar_agendamento_automatico: boolean;
  dias_antecedencia: number;
}

export interface DisponibilidadeData {
  id: number;
  prestador_id: number;
  configuracoes: ConfiguracoesDisponibilidade;
  horarios_padrao: Record<string, string[]>;
  intervalos_padrao: Array<{
    dias: string[];
    inicio: string;
    fim: string;
    descricao: string;
  }>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicoTipoData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicoTipoOptionData {
  label: string;
  value: string;
  icone: string;
  cor: string;
}

export interface RaioOpcaoData {
  id: number;
  valor: number;
  label: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RaioOpcaoOptionData {
  label: string;
  value: number;
}

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  tipo?: string;
  lida: boolean;
  created_at: string;
  updated_at?: string;
  data?: string;
}

// ==========================================
// CONSTANTES DE CACHE
// ==========================================

const CACHE_KEYS = {
  SERVICOS: 'prestador_servicos',
  SOLICITACOES: 'prestador_solicitacoes',
  CATEGORIAS: 'prestador_categorias',
  GANHOS: 'prestador_ganhos',
  STATS: 'prestador_stats',
  PROXIMOS_SERVICOS: 'prestador_proximos_servicos',
  AVALIACOES_RECENTES: 'prestador_avaliacoes_recentes',
  NOTIFICACOES: 'prestador_notificacoes',
  DASHBOARD: 'prestador_dashboard',
  PEDIDOS_DISPONIVEIS: 'prestador_pedidos_disponiveis',
  MINHAS_PROPOSTAS: 'prestador_minhas_propostas',
  INTERVALOS: 'prestador_intervalos',
  DISPONIBILIDADE: 'prestador_disponibilidade',
  SAQUES: 'prestador_saques',
  HISTORICO_SAQUES: 'prestador_historico_saques',
};

const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 15 * 60 * 1000, // 15 minutos
  LONG: 60 * 60 * 1000, // 1 hora
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 horas
};

const REQUEST_TIMEOUT = 15000; // 15 segundos timeout para requisições

// ==========================================
// FUNÇÕES DE CACHE COM LOCALSTORAGE
// ==========================================

function saveToCache<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
  try {
    const item = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl,
    };
    localStorage.setItem(`prestador_cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.warn(`Erro ao salvar cache para ${key}:`, error);
  }
}

function loadFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`prestador_cache_${key}`);
    if (!raw) return null;

    const item = JSON.parse(raw);
    const isExpired = Date.now() - item.timestamp > item.ttl;

    if (isExpired) {
      localStorage.removeItem(`prestador_cache_${key}`);
      return null;
    }

    return item.data as T;
  } catch (error) {
    console.warn(`Erro ao carregar cache para ${key}:`, error);
    return null;
  }
}

function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(`prestador_cache_${key}`);
  } else {
    Object.values(CACHE_KEYS).forEach((cacheKey) => {
      localStorage.removeItem(`prestador_cache_${cacheKey}`);
    });
  }
}

// ==========================================
// STORE DO PRESTADOR - CORRIGIDA
// ==========================================

export const usePrestadorStore = defineStore('prestador', () => {
  const $q = useQuasar();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const initialized = ref(false);
  const servicos = ref<ServicoData[]>([]);
  const servicoDetalhes = ref<ServicoData | null>(null);
  const agenda = ref<AgendaData[]>([]);
  const solicitacoes = ref<SolicitacaoData[]>([]);
  const solicitacaoDetalhes = ref<SolicitacaoData | null>(null);
  const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
  const ganhos = ref<GanhosData>({ total: 0, mes: 0, semana: 0, pendente: 0 });
  const saques = ref<SaqueData[]>([]);
  const historicoSaques = ref<SaqueData[]>([]);
  const stats = ref<StatsData>({
    pedidos_pendentes: 0,
    servicos_hoje: 0,
    avaliacao_media: 0,
    ganhos_mes: 0,
  });
  const proximosServicos = ref<ProximoServicoData[]>([]);
  const avaliacoesRecentes = ref<AvaliacaoRecenteData[]>([]);
  const diasSemana = ref<DiaSemanaData[]>([]);
  const meses = ref<MesData[]>([]);
  const horariosPadrao = ref<HorarioPadraoData[]>([]);
  const diasOptions = ref<DiaOptionData[]>([]);
  const horariosOptions = ref<HorarioOptionData[]>([]);
  const intervalos = ref<IntervaloData[]>([]);
  const disponibilidade = ref<DisponibilidadeData | null>(null);
  const servicoTipos = ref<ServicoTipoData[]>([]);
  const servicoTiposOptions = ref<ServicoTipoOptionData[]>([]);
  const raioOpcoes = ref<RaioOpcaoData[]>([]);
  const raioOpcoesOptions = ref<RaioOpcaoOptionData[]>([]);
  const pedidosDisponiveis = ref<PedidoDisponivelData[]>([]);
  const minhasPropostas = ref<PropostaData[]>([]);
  const notificacoes = ref<NotificacaoData[]>([]);
  const unreadCount = ref(0);

  const pendingRequests = new Map<string, Promise<unknown>>();
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // MÉTODOS AUXILIARES - CORRIGIDOS
  // ==========================================

  async function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (pendingRequests.has(key)) {
      console.log(`🔄 Reutilizando requisição em andamento: ${key}`);
      return pendingRequests.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
  }

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) {
      console.warn('⚠️ Resposta vazia, retornando array vazio');
      return [] as T;
    }

    if (Array.isArray(response)) {
      return response as T;
    }

    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      // Formato: { success: true, data: [...] }
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
        // Se data for objeto mas tiver os campos esperados
        if (obj.data && typeof obj.data === 'object') {
          return obj.data as T;
        }
        return obj.data as T;
      }

      // Formato: { data: [...] }
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

    console.warn('⚠️ Formato de resposta inesperado:', response);
    return [] as T;
  }

  function showNotification(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    icon?: string,
  ) {
    const options: QNotifyCreateOptions = { type, message, position: 'top', timeout: 3000 };
    if (icon) options.icon = icon;
    $q.notify(options);
  }

  function showError(error: unknown) {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    showNotification('negative', message);
    console.error('❌ Erro detalhado:', error);
  }

  // ==========================================
  // CATEGORIAS DO PRESTADOR - CORRIGIDO (CRÍTICO)
  // ==========================================

  async function fetchMinhasCategorias(
    forceRefresh: boolean = false,
  ): Promise<CategoriaPrestadorData[]> {
    const cacheKey = CACHE_KEYS.CATEGORIAS;

    console.log('🔍 Buscando categorias do prestador... forceRefresh:', forceRefresh);

    if (!forceRefresh) {
      const cached = loadFromCache<CategoriaPrestadorData[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log('📦 Categorias carregadas do cache:', cached.length);
        minhasCategorias.value = cached;
        return cached;
      }
    }

    return dedupeRequest('minhas_categorias', async () => {
      loading.value = true;
      try {
        // Adicionar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        console.log('🌐 Buscando categorias da API...');
        const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_CATEGORIAS, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('📥 Resposta da API de categorias:', response.data);

        const data = extractDataFromResponse<CategoriaPrestadorData[]>(response.data);
        minhasCategorias.value = Array.isArray(data) ? data : [];

        console.log(`✅ Categorias carregadas: ${minhasCategorias.value.length}`);

        if (minhasCategorias.value.length === 0) {
          console.warn('⚠️ Nenhuma categoria encontrada para o prestador');
        } else {
          console.log(
            '📋 Categorias:',
            minhasCategorias.value.map((c) => c.nome),
          );
        }

        saveToCache(cacheKey, minhasCategorias.value, CACHE_TTL.LONG);
        return minhasCategorias.value;
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        minhasCategorias.value = [];
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function addCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      console.log(`➕ Adicionando categoria ${categoriaId}...`);
      const response = await api.post(
        PRESTADOR_ENDPOINTS.ADICIONAR_CATEGORIA(categoriaId.toString()),
      );

      if (response.data.success) {
        clearCache(CACHE_KEYS.CATEGORIAS);
        await fetchMinhasCategorias(true);
        showNotification('positive', 'Categoria adicionada!', 'add');
        console.log('✅ Categoria adicionada com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      console.log(`❌ Removendo categoria ${categoriaId}...`);
      const response = await api.delete(
        PRESTADOR_ENDPOINTS.REMOVER_CATEGORIA(categoriaId.toString()),
      );

      if (response.data.success) {
        minhasCategorias.value = minhasCategorias.value.filter((c) => c.id !== categoriaId);
        clearCache(CACHE_KEYS.CATEGORIAS);
        showNotification('positive', 'Categoria removida!', 'delete');
        console.log('✅ Categoria removida com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // SERVIÇOS DO PRESTADOR - CORRIGIDO
  // ==========================================

  async function fetchServicos(forceRefresh: boolean = false): Promise<ServicoData[]> {
    const cacheKey = CACHE_KEYS.SERVICOS;

    if (!forceRefresh) {
      const cached = loadFromCache<ServicoData[]>(cacheKey);
      if (cached) {
        servicos.value = cached;
        return cached;
      }
    }

    return dedupeRequest('servicos', async () => {
      loading.value = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICOS, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = extractDataFromResponse<ServicoData[]>(response.data);
        servicos.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, servicos.value, CACHE_TTL.LONG);
        return servicos.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchServicoDetalhes(id: number): Promise<ServicoData | null> {
    return dedupeRequest(`servico_${id}`, async () => {
      loading.value = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await api.get(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()), {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = extractDataFromResponse<ServicoData>(response.data);
        servicoDetalhes.value = data;
        return servicoDetalhes.value;
      } catch (error) {
        showError(error);
        return null;
      } finally {
        loading.value = false;
      }
    });
  }

  async function createServico(data: {
    nome: string;
    categoria_id: number;
    preco: number;
    duracao: number;
    descricao?: string;
    icone?: string;
  }): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.CRIAR_SERVICO, data);
      if (response.data.success) {
        const newServico = extractDataFromResponse<ServicoData>(response.data);
        servicos.value.push(newServico);
        clearCache(CACHE_KEYS.SERVICOS);
        showNotification('positive', 'Serviço criado com sucesso!', 'check_circle');
        return newServico;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateServico(
    id: number,
    data: Partial<ServicoData>,
  ): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()), data);
      if (response.data.success) {
        const updatedServico = extractDataFromResponse<ServicoData>(response.data);
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1) {
          servicos.value[index] = updatedServico;
        }
        clearCache(CACHE_KEYS.SERVICOS);
        showNotification('positive', 'Serviço atualizado com sucesso!', 'edit');
        return updatedServico;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteServico(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DELETAR_SERVICO(id.toString()));
      if (response.data.success) {
        servicos.value = servicos.value.filter((s) => s.id !== id);
        clearCache(CACHE_KEYS.SERVICOS);
        showNotification('positive', 'Serviço removido com sucesso!', 'delete');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function toggleServico(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.TOGGLE_SERVICO(id.toString()));
      if (response.data.success) {
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1 && servicos.value[index]) {
          servicos.value[index].ativo = !servicos.value[index].ativo;
          const message = servicos.value[index].ativo ? 'Serviço ativado!' : 'Serviço desativado!';
          showNotification('info', message, 'toggle_on');
        }
        clearCache(CACHE_KEYS.SERVICOS);
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // DISPONIBILIDADE DO PRESTADOR - CORRIGIDO
  // ==========================================

  async function fetchDisponibilidade(
    forceRefresh: boolean = false,
  ): Promise<DisponibilidadeData | null> {
    const cacheKey = CACHE_KEYS.DISPONIBILIDADE;

    if (!forceRefresh) {
      const cached = loadFromCache<DisponibilidadeData>(cacheKey);
      if (cached) {
        disponibilidade.value = cached;
        return cached;
      }
    }

    return dedupeRequest('disponibilidade', async () => {
      loading.value = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await api.get(PRESTADOR_ENDPOINTS.DISPONIBILIDADE, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = extractDataFromResponse<DisponibilidadeData>(response.data);
        disponibilidade.value = data;

        // Se não tiver horários padrão, criar objeto vazio mas válido
        if (disponibilidade.value && !disponibilidade.value.horarios_padrao) {
          disponibilidade.value.horarios_padrao = {};
        }

        saveToCache(cacheKey, disponibilidade.value, CACHE_TTL.MEDIUM);
        return disponibilidade.value;
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
        // Retornar um objeto padrão em vez de null para evitar quebras
        const defaultDisponibilidade = {
          id: 0,
          prestador_id: 0,
          configuracoes: {
            tempo_minimo_agendamento: 60,
            tempo_entre_servicos: 15,
            notificar_antes: 30,
            aceitar_agendamento_automatico: true,
            dias_antecedencia: 30,
          },
          horarios_padrao: {},
          intervalos_padrao: [],
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        disponibilidade.value = defaultDisponibilidade;
        return defaultDisponibilidade;
      } finally {
        loading.value = false;
      }
    });
  }

  async function updateDisponibilidade(
    data: Partial<DisponibilidadeData>,
  ): Promise<DisponibilidadeData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_DISPONIBILIDADE, data);
      if (response.data.success) {
        disponibilidade.value = extractDataFromResponse<DisponibilidadeData>(response.data);
        clearCache(CACHE_KEYS.DISPONIBILIDADE);
        showNotification('positive', 'Configurações atualizadas!', 'settings');
        return disponibilidade.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // ESTATÍSTICAS DO PRESTADOR - CORRIGIDO
  // ==========================================

  async function fetchStats(forceRefresh: boolean = false): Promise<StatsData | null> {
    const cacheKey = CACHE_KEYS.STATS;

    if (!forceRefresh) {
      const cached = loadFromCache<StatsData>(cacheKey);
      if (cached) {
        stats.value = cached;
        return cached;
      }
    }

    return dedupeRequest('stats', async () => {
      loading.value = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await api.get(PRESTADOR_ENDPOINTS.PRESTADOR_STATS, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = extractDataFromResponse<StatsData>(response.data);
        stats.value = data;
        saveToCache(cacheKey, stats.value, CACHE_TTL.SHORT);
        return stats.value;
      } catch (error) {
        console.error('Erro ao carregar stats:', error);
        // Retornar stats padrão
        const defaultStats = {
          pedidos_pendentes: 0,
          servicos_hoje: 0,
          avaliacao_media: 0,
          ganhos_mes: 0,
        };
        stats.value = defaultStats;
        return defaultStats;
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // GANHOS DO PRESTADOR
  // ==========================================

  async function fetchGanhos(forceRefresh: boolean = false): Promise<GanhosData | null> {
    const cacheKey = CACHE_KEYS.GANHOS;

    if (!forceRefresh) {
      const cached = loadFromCache<GanhosData>(cacheKey);
      if (cached) {
        ganhos.value = cached;
        return cached;
      }
    }

    return dedupeRequest('ganhos', async () => {
      loading.value = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await api.get(PRESTADOR_ENDPOINTS.GANHOS, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = extractDataFromResponse<GanhosData>(response.data);
        ganhos.value = data;
        saveToCache(cacheKey, ganhos.value, CACHE_TTL.MEDIUM);
        return ganhos.value;
      } catch (error) {
        showError(error);
        return null;
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // SOLICITAÇÕES/PEDIDOS
  // ==========================================

  async function fetchSolicitacoes(
    status?: string,
    forceRefresh: boolean = false,
  ): Promise<SolicitacaoData[]> {
    const cacheKey = `${CACHE_KEYS.SOLICITACOES}_${status || 'all'}`;

    if (!forceRefresh) {
      const cached = loadFromCache<SolicitacaoData[]>(cacheKey);
      if (cached) {
        solicitacoes.value = cached;
        return cached;
      }
    }

    return dedupeRequest(`solicitacoes_${status || 'all'}`, async () => {
      loading.value = true;
      try {
        const url = status
          ? PRESTADOR_ENDPOINTS.SOLICITACOES_BY_STATUS(status)
          : PRESTADOR_ENDPOINTS.SOLICITACOES;
        const response = await api.get(url);
        const data = extractDataFromResponse<SolicitacaoData[]>(response.data);
        solicitacoes.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, solicitacoes.value, CACHE_TTL.SHORT);
        return solicitacoes.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function aceitarSolicitacao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ACEITAR_SOLICITACAO(id.toString()));
      if (response.data.success) {
        const index = solicitacoes.value.findIndex((s) => s.id === id);
        if (index !== -1 && solicitacoes.value[index]) {
          solicitacoes.value[index].status = 'aceito';
        }
        clearCache(CACHE_KEYS.SOLICITACOES);
        showNotification('positive', 'Solicitação aceita!', 'check_circle');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function recusarSolicitacao(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.RECUSAR_SOLICITACAO(id.toString()));
      if (response.data.success) {
        const index = solicitacoes.value.findIndex((s) => s.id === id);
        if (index !== -1 && solicitacoes.value[index]) {
          solicitacoes.value[index].status = 'cancelado';
        }
        clearCache(CACHE_KEYS.SOLICITACOES);
        showNotification('warning', 'Solicitação recusada', 'cancel');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================

  async function fetchNotificacoes(forceRefresh: boolean = false): Promise<NotificacaoData[]> {
    const cacheKey = CACHE_KEYS.NOTIFICACOES;

    if (!forceRefresh) {
      const cached = loadFromCache<NotificacaoData[]>(cacheKey);
      if (cached) {
        notificacoes.value = cached;
        unreadCount.value = cached.filter((n) => !n.lida).length;
        return cached;
      }
    }

    return dedupeRequest('notificacoes', async () => {
      loading.value = true;
      try {
        const response = await api.get('/notifications');
        const data = extractDataFromResponse<NotificacaoData[]>(response.data);
        notificacoes.value = Array.isArray(data) ? data : [];
        unreadCount.value = notificacoes.value.filter((n) => !n.lida).length;
        saveToCache(cacheKey, notificacoes.value, CACHE_TTL.SHORT);
        return notificacoes.value;
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        notificacoes.value = [];
        unreadCount.value = 0;
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data && typeof response.data === 'object') {
        unreadCount.value = response.data.total || 0;
        return unreadCount.value;
      }
      unreadCount.value = 0;
      return 0;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      unreadCount.value = 0;
      return 0;
    }
  }

  async function marcarNotificacaoLida(id: number): Promise<boolean> {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        const notif = notificacoes.value.find((n) => n.id === id);
        if (notif && !notif.lida) {
          notif.lida = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        clearCache(CACHE_KEYS.NOTIFICACOES);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  async function marcarTodasNotificacoesLidas(): Promise<boolean> {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        notificacoes.value.forEach((n) => {
          n.lida = true;
        });
        unreadCount.value = 0;
        clearCache(CACHE_KEYS.NOTIFICACOES);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      return false;
    }
  }

  // ==========================================
  // PRÓXIMOS SERVIÇOS E AVALIAÇÕES RECENTES
  // ==========================================

  async function fetchProximosServicos(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<ProximoServicoData[]> {
    const cacheKey = `${CACHE_KEYS.PROXIMOS_SERVICOS}_${limit}`;

    if (!forceRefresh) {
      const cached = loadFromCache<ProximoServicoData[]>(cacheKey);
      if (cached) {
        proximosServicos.value = cached;
        return cached;
      }
    }

    return dedupeRequest(`proximos_servicos_${limit}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PROXIMOS_SERVICOS, {
          params: { limit },
        });
        const data = extractDataFromResponse<ProximoServicoData[]>(response.data);
        proximosServicos.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, proximosServicos.value, CACHE_TTL.SHORT);
        return proximosServicos.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchAvaliacoesRecentes(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<AvaliacaoRecenteData[]> {
    const cacheKey = `${CACHE_KEYS.AVALIACOES_RECENTES}_${limit}`;

    if (!forceRefresh) {
      const cached = loadFromCache<AvaliacaoRecenteData[]>(cacheKey);
      if (cached) {
        avaliacoesRecentes.value = cached;
        return cached;
      }
    }

    return dedupeRequest(`avaliacoes_recentes_${limit}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AVALIACOES_RECENTES, {
          params: { limit },
        });
        const data = extractDataFromResponse<AvaliacaoRecenteData[]>(response.data);
        avaliacoesRecentes.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, avaliacoesRecentes.value, CACHE_TTL.SHORT);
        return avaliacoesRecentes.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // INTERVALOS DO PRESTADOR
  // ==========================================

  async function fetchIntervalos(forceRefresh: boolean = false): Promise<IntervaloData[]> {
    const cacheKey = CACHE_KEYS.INTERVALOS;

    if (!forceRefresh) {
      const cached = loadFromCache<IntervaloData[]>(cacheKey);
      if (cached) {
        intervalos.value = cached;
        return cached;
      }
    }

    return dedupeRequest('intervalos', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.INTERVALOS);
        const data = extractDataFromResponse<IntervaloData[]>(response.data);
        intervalos.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, intervalos.value, CACHE_TTL.MEDIUM);
        return intervalos.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function criarIntervalo(data: {
    dias: string[];
    inicio: string;
    fim: string;
    descricao?: string;
  }): Promise<IntervaloData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.CRIAR_INTERVALO, data);
      if (response.data.success) {
        const newIntervalo = extractDataFromResponse<IntervaloData>(response.data);
        intervalos.value.push(newIntervalo);
        clearCache(CACHE_KEYS.INTERVALOS);
        showNotification('positive', 'Intervalo criado com sucesso!', 'schedule');
        return newIntervalo;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function atualizarIntervalo(
    id: number,
    data: Partial<IntervaloData>,
  ): Promise<IntervaloData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_INTERVALO(id.toString()), data);
      if (response.data.success) {
        const updatedIntervalo = extractDataFromResponse<IntervaloData>(response.data);
        const index = intervalos.value.findIndex((i) => i.id === id);
        if (index !== -1) {
          intervalos.value[index] = updatedIntervalo;
        }
        clearCache(CACHE_KEYS.INTERVALOS);
        showNotification('positive', 'Intervalo atualizado!', 'edit');
        return updatedIntervalo;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deletarIntervalo(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DELETAR_INTERVALO(id.toString()));
      if (response.data.success) {
        intervalos.value = intervalos.value.filter((i) => i.id !== id);
        clearCache(CACHE_KEYS.INTERVALOS);
        showNotification('positive', 'Intervalo removido!', 'delete');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PEDIDOS DISPONÍVEIS E PROPOSTAS
  // ==========================================

  async function fetchPedidosDisponiveis(
    forceRefresh: boolean = false,
  ): Promise<PedidoDisponivelData[]> {
    const cacheKey = CACHE_KEYS.PEDIDOS_DISPONIVEIS;

    if (!forceRefresh) {
      const cached = loadFromCache<PedidoDisponivelData[]>(cacheKey);
      if (cached) {
        pedidosDisponiveis.value = cached;
        return cached;
      }
    }

    return dedupeRequest('pedidos_disponiveis', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PEDIDOS_DISPONIVEIS);
        const data = extractDataFromResponse<PedidoDisponivelData[]>(response.data);
        pedidosDisponiveis.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, pedidosDisponiveis.value, CACHE_TTL.SHORT);
        return pedidosDisponiveis.value;
      } catch (error) {
        console.error('Erro ao carregar pedidos disponíveis:', error);
        pedidosDisponiveis.value = [];
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function enviarProposta(data: {
    pedido_id: number;
    valor: number;
    mensagem?: string;
  }): Promise<PropostaData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.ENVIAR_PROPOSTA, data);
      if (response.data.success) {
        showNotification('positive', 'Proposta enviada com sucesso!', 'send');
        clearCache(CACHE_KEYS.MINHAS_PROPOSTAS);
        await fetchMinhasPropostas(true);
        return response.data.data;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMinhasPropostas(forceRefresh: boolean = false): Promise<PropostaData[]> {
    const cacheKey = CACHE_KEYS.MINHAS_PROPOSTAS;

    if (!forceRefresh) {
      const cached = loadFromCache<PropostaData[]>(cacheKey);
      if (cached) {
        minhasPropostas.value = cached;
        return cached;
      }
    }

    return dedupeRequest('minhas_propostas', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_PROPOSTAS);
        const data = extractDataFromResponse<PropostaData[]>(response.data);
        minhasPropostas.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, minhasPropostas.value, CACHE_TTL.SHORT);
        return minhasPropostas.value;
      } catch (error) {
        console.error('Erro ao carregar propostas:', error);
        minhasPropostas.value = [];
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // DADOS AUXILIARES (PÚBLICOS)
  // ==========================================

  async function fetchDiasSemana(forceRefresh: boolean = false): Promise<DiaSemanaData[]> {
    const cacheKey = 'dias_semana';

    if (!forceRefresh) {
      const cached = loadFromCache<DiaSemanaData[]>(cacheKey);
      if (cached) {
        diasSemana.value = cached;
        return cached;
      }
    }

    return dedupeRequest('dias_semana', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_SEMANA);
        const data = extractDataFromResponse<DiaSemanaData[]>(response.data);
        diasSemana.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, diasSemana.value, CACHE_TTL.VERY_LONG);
        return diasSemana.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchMeses(forceRefresh: boolean = false): Promise<MesData[]> {
    const cacheKey = 'meses';

    if (!forceRefresh) {
      const cached = loadFromCache<MesData[]>(cacheKey);
      if (cached) {
        meses.value = cached;
        return cached;
      }
    }

    return dedupeRequest('meses', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_MESES);
        const data = extractDataFromResponse<MesData[]>(response.data);
        meses.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, meses.value, CACHE_TTL.VERY_LONG);
        return meses.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchHorariosPadrao(forceRefresh: boolean = false): Promise<HorarioPadraoData[]> {
    const cacheKey = 'horarios_padrao';

    if (!forceRefresh) {
      const cached = loadFromCache<HorarioPadraoData[]>(cacheKey);
      if (cached) {
        horariosPadrao.value = cached;
        return cached;
      }
    }

    return dedupeRequest('horarios_padrao', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_PADRAO);
        const data = extractDataFromResponse<HorarioPadraoData[]>(response.data);
        horariosPadrao.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, horariosPadrao.value, CACHE_TTL.VERY_LONG);
        return horariosPadrao.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchDiasOptions(forceRefresh: boolean = false): Promise<DiaOptionData[]> {
    const cacheKey = 'dias_options';

    if (!forceRefresh) {
      const cached = loadFromCache<DiaOptionData[]>(cacheKey);
      if (cached) {
        diasOptions.value = cached;
        return cached;
      }
    }

    return dedupeRequest('dias_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_OPTIONS);
        const data = extractDataFromResponse<DiaOptionData[]>(response.data);
        diasOptions.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, diasOptions.value, CACHE_TTL.VERY_LONG);
        return diasOptions.value;
      } catch (error) {
        console.error('Erro ao carregar dias options:', error);
        diasOptions.value = [];
        return [];
      }
    });
  }

  async function fetchHorariosOptions(forceRefresh: boolean = false): Promise<HorarioOptionData[]> {
    const cacheKey = 'horarios_options';

    if (!forceRefresh) {
      const cached = loadFromCache<HorarioOptionData[]>(cacheKey);
      if (cached) {
        horariosOptions.value = cached;
        return cached;
      }
    }

    return dedupeRequest('horarios_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_OPTIONS);
        const data = extractDataFromResponse<HorarioOptionData[]>(response.data);
        horariosOptions.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, horariosOptions.value, CACHE_TTL.VERY_LONG);
        return horariosOptions.value;
      } catch (error) {
        console.error('Erro ao carregar horarios options:', error);
        horariosOptions.value = [];
        return [];
      }
    });
  }

  // ==========================================
  // SAQUES E FINANCEIRO
  // ==========================================

  async function fetchSaques(forceRefresh: boolean = false): Promise<SaqueData[]> {
    const cacheKey = CACHE_KEYS.SAQUES;

    if (!forceRefresh) {
      const cached = loadFromCache<SaqueData[]>(cacheKey);
      if (cached) {
        saques.value = cached;
        return cached;
      }
    }

    return dedupeRequest('saques', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SAQUES);
        const data = extractDataFromResponse<SaqueData[]>(response.data);
        saques.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, saques.value, CACHE_TTL.MEDIUM);
        return saques.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function solicitarSaque(data: {
    valor: number;
    metodo: 'mpesa' | 'bancario';
    conta: string;
  }): Promise<SaqueData | null> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.SOLICITAR_SAQUE, data);
      if (response.data.success) {
        showNotification('positive', 'Saque solicitado com sucesso!', 'payments');
        clearCache(CACHE_KEYS.SAQUES);
        clearCache(CACHE_KEYS.HISTORICO_SAQUES);
        await fetchSaques(true);
        return extractDataFromResponse<SaqueData>(response.data);
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistoricoSaques(forceRefresh: boolean = false): Promise<SaqueData[]> {
    const cacheKey = CACHE_KEYS.HISTORICO_SAQUES;

    if (!forceRefresh) {
      const cached = loadFromCache<SaqueData[]>(cacheKey);
      if (cached) {
        historicoSaques.value = cached;
        return cached;
      }
    }

    return dedupeRequest('historico_saques', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.HISTORICO_SAQUES);
        const data = extractDataFromResponse<SaqueData[]>(response.data);
        historicoSaques.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, historicoSaques.value, CACHE_TTL.MEDIUM);
        return historicoSaques.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // AGENDA
  // ==========================================

  async function fetchAgenda(params?: { semana?: number }): Promise<AgendaData[]> {
    return dedupeRequest(`agenda_${params?.semana || 0}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AGENDA, { params });
        const data = extractDataFromResponse<AgendaData[]>(response.data);
        agenda.value = Array.isArray(data) ? data : [];
        return agenda.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function bloquearHorario(data: {
    data: string;
    horario_inicio: string;
    horario_fim: string;
    motivo?: string;
  }): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.BLOQUEAR_HORARIO, data);
      if (response.data.success) {
        showNotification('positive', 'Horário bloqueado com sucesso!', 'lock');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function desbloquearHorario(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DESBLOQUEAR_HORARIO(id.toString()));
      if (response.data.success) {
        showNotification('positive', 'Horário desbloqueado com sucesso!', 'lock_open');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // TIPOS DE SERVIÇO E OPÇÕES DE RAIO
  // ==========================================

  async function fetchServicoTipos(forceRefresh: boolean = false): Promise<ServicoTipoData[]> {
    const cacheKey = 'servico_tipos';

    if (!forceRefresh) {
      const cached = loadFromCache<ServicoTipoData[]>(cacheKey);
      if (cached) {
        servicoTipos.value = cached;
        return cached;
      }
    }

    return dedupeRequest('servico_tipos', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_SERVICO_TIPOS);
        const data = extractDataFromResponse<ServicoTipoData[]>(response.data);
        servicoTipos.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, servicoTipos.value, CACHE_TTL.VERY_LONG);
        return servicoTipos.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchServicoTiposOptions(
    forceRefresh: boolean = false,
  ): Promise<ServicoTipoOptionData[]> {
    const cacheKey = 'servico_tipos_options';

    if (!forceRefresh) {
      const cached = loadFromCache<ServicoTipoOptionData[]>(cacheKey);
      if (cached) {
        servicoTiposOptions.value = cached;
        return cached;
      }
    }

    return dedupeRequest('servico_tipos_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_SERVICO_TIPOS_OPTIONS);
        const data = extractDataFromResponse<ServicoTipoOptionData[]>(response.data);
        servicoTiposOptions.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, servicoTiposOptions.value, CACHE_TTL.VERY_LONG);
        return servicoTiposOptions.value;
      } catch (error) {
        console.error('Erro ao carregar servico tipos options:', error);
        servicoTiposOptions.value = [];
        return [];
      }
    });
  }

  async function fetchRaioOpcoes(forceRefresh: boolean = false): Promise<RaioOpcaoData[]> {
    const cacheKey = 'raio_opcoes';

    if (!forceRefresh) {
      const cached = loadFromCache<RaioOpcaoData[]>(cacheKey);
      if (cached) {
        raioOpcoes.value = cached;
        return cached;
      }
    }

    return dedupeRequest('raio_opcoes', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_RAIO_OPCOES);
        const data = extractDataFromResponse<RaioOpcaoData[]>(response.data);
        raioOpcoes.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, raioOpcoes.value, CACHE_TTL.VERY_LONG);
        return raioOpcoes.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchRaioOpcoesOptions(
    forceRefresh: boolean = false,
  ): Promise<RaioOpcaoOptionData[]> {
    const cacheKey = 'raio_opcoes_options';

    if (!forceRefresh) {
      const cached = loadFromCache<RaioOpcaoOptionData[]>(cacheKey);
      if (cached) {
        raioOpcoesOptions.value = cached;
        return cached;
      }
    }

    return dedupeRequest('raio_opcoes_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_RAIO_OPCOES_OPTIONS);
        const data = extractDataFromResponse<RaioOpcaoOptionData[]>(response.data);
        raioOpcoesOptions.value = Array.isArray(data) ? data : [];
        saveToCache(cacheKey, raioOpcoesOptions.value, CACHE_TTL.VERY_LONG);
        return raioOpcoesOptions.value;
      } catch (error) {
        console.error('Erro ao carregar raio opcoes options:', error);
        raioOpcoesOptions.value = [];
        return [];
      }
    });
  }

  // ==========================================
  // MÉTODOS DE CARREGAMENTO ORGANIZADOS - CORRIGIDOS
  // ==========================================

  async function carregarDashboard(forceRefresh: boolean = false): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        fetchStats(forceRefresh),
        fetchGanhos(forceRefresh),
        fetchProximosServicos(5, forceRefresh),
        fetchAvaliacoesRecentes(5, forceRefresh),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      loading.value = false;
    }
  }

  async function carregarDadosAuxiliares(forceRefresh: boolean = false): Promise<void> {
    try {
      await fetchDiasSemana(forceRefresh);
      await delay(300);
      await fetchMeses(forceRefresh);
      await delay(300);
      await fetchHorariosPadrao(forceRefresh);
      await delay(300);
      await fetchDiasOptions(forceRefresh);
      await delay(300);
      await fetchHorariosOptions(forceRefresh);
      await delay(300);
      await fetchServicoTiposOptions(forceRefresh);
      await delay(300);
      await fetchRaioOpcoesOptions(forceRefresh);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  }

  async function carregarTodosDados(forceRefresh: boolean = false): Promise<void> {
    loading.value = true;
    try {
      console.log('🚀 Iniciando carregamento de todos os dados...');

      // ETAPA 1: Dados essenciais (com timeout individual)
      await fetchStats(forceRefresh);
      console.log('✅ Stats carregados');

      await delay(300);
      await fetchServicos(forceRefresh);
      console.log('✅ Serviços carregados');

      await delay(300);
      await fetchMinhasCategorias(forceRefresh);
      console.log('✅ Categorias carregadas');

      await delay(300);
      await fetchDisponibilidade(forceRefresh);
      console.log('✅ Disponibilidade carregada');

      await delay(300);
      await fetchSolicitacoes(undefined, forceRefresh);
      console.log('✅ Solicitações carregadas');

      // ETAPA 2: Dados auxiliares (não críticos)
      await carregarDadosAuxiliares(forceRefresh);
      console.log('✅ Dados auxiliares carregados');

      // ETAPA 3: Dados complementares
      await fetchProximosServicos(5, forceRefresh);
      await delay(300);
      await fetchAvaliacoesRecentes(5, forceRefresh);
      await delay(300);
      await fetchGanhos(forceRefresh);
      console.log('✅ Ganhos carregados');

      // ETAPA 4: Dados opcionais (não forçam refresh por padrão)
      await fetchPedidosDisponiveis(forceRefresh).catch((e) =>
        console.warn('Pedidos disponíveis:', e),
      );
      await fetchMinhasPropostas(forceRefresh).catch((e) => console.warn('Minhas propostas:', e));
      await fetchNotificacoes(forceRefresh).catch((e) => console.warn('Notificações:', e));

      initialized.value = true;
      console.log('🎉 Todos os dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      showNotification(
        'warning',
        'Alguns dados não puderam ser carregados. Recarregue a página.',
        'refresh',
      );
    } finally {
      loading.value = false;
    }
  }

  async function initialize(forceRefresh: boolean = false): Promise<void> {
    if (initialized.value && !forceRefresh) {
      console.log('📦 Store já inicializada, usando cache');
      return;
    }
    console.log('🔄 Inicializando store...');
    await carregarTodosDados(forceRefresh);
  }

  function reset(): void {
    console.log('🔄 Resetando store...');
    servicos.value = [];
    minhasCategorias.value = [];
    solicitacoes.value = [];
    intervalos.value = [];
    disponibilidade.value = null;
    pedidosDisponiveis.value = [];
    minhasPropostas.value = [];
    notificacoes.value = [];
    unreadCount.value = 0;
    initialized.value = false;
    pendingRequests.clear();
    clearCache();
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    initialized,
    servicos,
    servicoDetalhes,
    agenda,
    solicitacoes,
    solicitacaoDetalhes,
    minhasCategorias,
    ganhos,
    saques,
    historicoSaques,
    stats,
    proximosServicos,
    avaliacoesRecentes,
    diasSemana,
    meses,
    horariosPadrao,
    diasOptions,
    horariosOptions,
    intervalos,
    disponibilidade,
    servicoTipos,
    servicoTiposOptions,
    raioOpcoes,
    raioOpcoesOptions,
    pedidosDisponiveis,
    minhasPropostas,
    notificacoes,
    unreadCount,

    // Serviços
    fetchServicos,
    fetchServicoDetalhes,
    createServico,
    updateServico,
    deleteServico,
    toggleServico,

    // Agenda
    fetchAgenda,
    bloquearHorario,
    desbloquearHorario,

    // Solicitações
    fetchSolicitacoes,
    aceitarSolicitacao,
    recusarSolicitacao,

    // Categorias - CORRIGIDAS
    fetchMinhasCategorias,
    addCategoria,
    removeCategoria,

    // Financeiro
    fetchGanhos,
    fetchSaques,
    solicitarSaque,
    fetchHistoricoSaques,

    // Estatísticas
    fetchStats,

    // Próximos serviços e avaliações
    fetchProximosServicos,
    fetchAvaliacoesRecentes,

    // Dados Auxiliares
    fetchDiasSemana,
    fetchMeses,
    fetchHorariosPadrao,
    fetchDiasOptions,
    fetchHorariosOptions,

    // Tipos de Serviço
    fetchServicoTipos,
    fetchServicoTiposOptions,

    // Opções de Raio
    fetchRaioOpcoes,
    fetchRaioOpcoesOptions,

    // Intervalos
    fetchIntervalos,
    criarIntervalo,
    atualizarIntervalo,
    deletarIntervalo,

    // Disponibilidade - CORRIGIDA
    fetchDisponibilidade,
    updateDisponibilidade,

    // Propostas
    fetchPedidosDisponiveis,
    enviarProposta,
    fetchMinhasPropostas,

    // Notificações
    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    fetchUnreadCount,

    // Utilitários
    carregarDashboard,
    carregarDadosAuxiliares,
    carregarTodosDados,
    initialize,
    reset,
    showNotification,
    showError,
    clearCache,
  };
});
