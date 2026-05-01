import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';
import { useCacheStore } from './cache-store';
import { useAuthStore } from './auth-store';

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
  ticket_medio?: number;
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
// CONSTANTES DE CACHE - OTIMIZADAS
// ==========================================

const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 15 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
};

const REQUEST_TIMEOUT = 15000;

// ==========================================
// STORE DO PRESTADOR
// ==========================================

export const usePrestadorStore = defineStore('prestador', () => {
  const $q = useQuasar();
  const cacheStore = useCacheStore();

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
    ticket_medio: 0,
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
  // MÉTODOS AUXILIARES
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
        if (obj.data && typeof obj.data === 'object') {
          return obj.data as T;
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
  }

  // Função auxiliar para obter o ID do usuário atual (SYNC)
  function getCurrentUserId(): number {
    const authStore = useAuthStore();
    return authStore.user?.id || 0;
  }

  // ==========================================
  // CATEGORIAS DO PRESTADOR
  // ==========================================

  async function fetchMinhasCategorias(
    forceRefresh: boolean = false,
  ): Promise<CategoriaPrestadorData[]> {
    const cacheKey = `prestador_categorias_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

          const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_CATEGORIAS, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = extractDataFromResponse<CategoriaPrestadorData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          minhasCategorias.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.LONG,
      forceRefresh,
    );
  }

  async function addCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(
        PRESTADOR_ENDPOINTS.ADICIONAR_CATEGORIA(categoriaId.toString()),
      );

      if (response.data.success) {
        cacheStore.invalidatePattern('prestador_categorias_');
        await fetchMinhasCategorias(true);
        showNotification('positive', 'Categoria adicionada!', 'add');
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
      const response = await api.delete(
        PRESTADOR_ENDPOINTS.REMOVER_CATEGORIA(categoriaId.toString()),
      );

      if (response.data.success) {
        minhasCategorias.value = minhasCategorias.value.filter((c) => c.id !== categoriaId);
        cacheStore.invalidatePattern('prestador_categorias_');
        showNotification('positive', 'Categoria removida!', 'delete');
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
  // SERVIÇOS DO PRESTADOR
  // ==========================================

  async function fetchServicos(forceRefresh: boolean = false): Promise<ServicoData[]> {
    const cacheKey = `prestador_servicos_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

          const response = await api.get(PRESTADOR_ENDPOINTS.SERVICOS, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = extractDataFromResponse<ServicoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          servicos.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.LONG,
      forceRefresh,
    );
  }

  async function fetchServicoDetalhes(id: number): Promise<ServicoData | null> {
    const cacheKey = `prestador_servico_detalhes_${id}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
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
          return data;
        } catch (error) {
          showError(error);
          return null;
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.MEDIUM,
    );
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
        cacheStore.invalidatePattern('prestador_servicos_');
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
        cacheStore.invalidatePattern('prestador_servicos_');
        cacheStore.invalidate(`prestador_servico_detalhes_${id}`);
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
        cacheStore.invalidatePattern('prestador_servicos_');
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
        cacheStore.invalidatePattern('prestador_servicos_');
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
  // DISPONIBILIDADE DO PRESTADOR
  // ==========================================

  async function fetchDisponibilidade(
    forceRefresh: boolean = false,
  ): Promise<DisponibilidadeData | null> {
    const cacheKey = `prestador_disponibilidade_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

          const response = await api.get(PRESTADOR_ENDPOINTS.DISPONIBILIDADE, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = extractDataFromResponse<DisponibilidadeData>(response.data);

          if (data && !data.horarios_padrao) {
            data.horarios_padrao = {};
          }

          disponibilidade.value = data;
          return data;
        } catch {
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
      },
      CACHE_TTL.MEDIUM,
      forceRefresh,
    );
  }

  async function updateDisponibilidade(
    data: Partial<DisponibilidadeData>,
  ): Promise<DisponibilidadeData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_DISPONIBILIDADE, data);
      if (response.data.success) {
        disponibilidade.value = extractDataFromResponse<DisponibilidadeData>(response.data);
        cacheStore.invalidatePattern('prestador_disponibilidade_');
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
  // ESTATÍSTICAS DO PRESTADOR
  // ==========================================

  async function fetchStats(forceRefresh: boolean = false): Promise<StatsData | null> {
    const cacheKey = `prestador_stats_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
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
          return data;
        } catch {
          const defaultStats = {
            pedidos_pendentes: 0,
            servicos_hoje: 0,
            avaliacao_media: 0,
            ganhos_mes: 0,
            ticket_medio: 0,
          };
          stats.value = defaultStats;
          return defaultStats;
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
  }

  // ==========================================
  // GANHOS DO PRESTADOR
  // ==========================================

  async function fetchGanhos(forceRefresh: boolean = false): Promise<GanhosData | null> {
    const cacheKey = `prestador_ganhos_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
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
          return data;
        } catch (error) {
          showError(error);
          return null;
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.MEDIUM,
      forceRefresh,
    );
  }

  // ==========================================
  // SOLICITAÇÕES/PEDIDOS
  // ==========================================

  async function fetchSolicitacoes(
    status?: string,
    forceRefresh: boolean = false,
  ): Promise<SolicitacaoData[]> {
    const cacheKey = `prestador_solicitacoes_${getCurrentUserId()}_${status || 'all'}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const url = status
            ? PRESTADOR_ENDPOINTS.SOLICITACOES_BY_STATUS(status)
            : PRESTADOR_ENDPOINTS.SOLICITACOES;
          const response = await api.get(url);
          const data = extractDataFromResponse<SolicitacaoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          solicitacoes.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
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
        cacheStore.invalidatePattern('prestador_solicitacoes_');
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
        cacheStore.invalidatePattern('prestador_solicitacoes_');
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
    const cacheKey = `prestador_notificacoes_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get('/notifications');
          const data = extractDataFromResponse<NotificacaoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          notificacoes.value = result;
          unreadCount.value = result.filter((n) => !n.lida).length;
          return result;
        } catch {
          notificacoes.value = [];
          unreadCount.value = 0;
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
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
    } catch {
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
        cacheStore.invalidatePattern('prestador_notificacoes_');
        return true;
      }
      return false;
    } catch {
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
        cacheStore.invalidatePattern('prestador_notificacoes_');
        return true;
      }
      return false;
    } catch {
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
    const cacheKey = `prestador_proximos_servicos_${getCurrentUserId()}_${limit}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PROXIMOS_SERVICOS, {
            params: { limit },
          });
          const data = extractDataFromResponse<ProximoServicoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          proximosServicos.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
  }

  async function fetchAvaliacoesRecentes(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<AvaliacaoRecenteData[]> {
    const cacheKey = `prestador_avaliacoes_recentes_${getCurrentUserId()}_${limit}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AVALIACOES_RECENTES, {
            params: { limit },
          });
          const data = extractDataFromResponse<AvaliacaoRecenteData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          avaliacoesRecentes.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
  }

  // ==========================================
  // INTERVALOS DO PRESTADOR
  // ==========================================

  async function fetchIntervalos(forceRefresh: boolean = false): Promise<IntervaloData[]> {
    const cacheKey = `prestador_intervalos_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.INTERVALOS);
          const data = extractDataFromResponse<IntervaloData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          intervalos.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.MEDIUM,
      forceRefresh,
    );
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
        cacheStore.invalidatePattern('prestador_intervalos_');
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
        cacheStore.invalidatePattern('prestador_intervalos_');
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
        cacheStore.invalidatePattern('prestador_intervalos_');
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
    const cacheKey = `prestador_pedidos_disponiveis_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PEDIDOS_DISPONIVEIS);
          const data = extractDataFromResponse<PedidoDisponivelData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          pedidosDisponiveis.value = result;
          return result;
        } catch {
          pedidosDisponiveis.value = [];
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
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
        cacheStore.invalidatePattern('prestador_minhas_propostas_');
        cacheStore.invalidatePattern('prestador_pedidos_disponiveis_');
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
    const cacheKey = `prestador_minhas_propostas_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_PROPOSTAS);
          const data = extractDataFromResponse<PropostaData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          minhasPropostas.value = result;
          return result;
        } catch {
          minhasPropostas.value = [];
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
      forceRefresh,
    );
  }

  // ==========================================
  // DADOS AUXILIARES (PÚBLICOS)
  // ==========================================

  async function fetchDiasSemana(forceRefresh: boolean = false): Promise<DiaSemanaData[]> {
    const cacheKey = 'aux_dias_semana';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_SEMANA);
          const data = extractDataFromResponse<DiaSemanaData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          diasSemana.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchMeses(forceRefresh: boolean = false): Promise<MesData[]> {
    const cacheKey = 'aux_meses';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_MESES);
          const data = extractDataFromResponse<MesData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          meses.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchHorariosPadrao(forceRefresh: boolean = false): Promise<HorarioPadraoData[]> {
    const cacheKey = 'aux_horarios_padrao';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_PADRAO);
          const data = extractDataFromResponse<HorarioPadraoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          horariosPadrao.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchDiasOptions(forceRefresh: boolean = false): Promise<DiaOptionData[]> {
    const cacheKey = 'aux_dias_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_OPTIONS);
          const data = extractDataFromResponse<DiaOptionData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          diasOptions.value = result;
          return result;
        } catch {
          diasOptions.value = [];
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchHorariosOptions(forceRefresh: boolean = false): Promise<HorarioOptionData[]> {
    const cacheKey = 'aux_horarios_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_OPTIONS);
          const data = extractDataFromResponse<HorarioOptionData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          horariosOptions.value = result;
          return result;
        } catch {
          horariosOptions.value = [];
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  // ==========================================
  // SAQUES E FINANCEIRO
  // ==========================================

  async function fetchSaques(forceRefresh: boolean = false): Promise<SaqueData[]> {
    const cacheKey = `prestador_saques_${getCurrentUserId()}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.SAQUES);
          const data = extractDataFromResponse<SaqueData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          saques.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.MEDIUM,
      forceRefresh,
    );
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
        cacheStore.invalidatePattern('prestador_saques_');
        cacheStore.invalidatePattern('prestador_historico_saques_');
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
    const cacheKey = `prestador_historico_saques_${getCurrentUserId()}_page_1`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.HISTORICO_SAQUES);
          const data = extractDataFromResponse<SaqueData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          historicoSaques.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.MEDIUM,
      forceRefresh,
    );
  }

  // ==========================================
  // AGENDA
  // ==========================================

  async function fetchAgenda(params?: { semana?: number }): Promise<AgendaData[]> {
    const cacheKey = `prestador_agenda_${getCurrentUserId()}_${params?.semana || 0}`;

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AGENDA, { params });
          const data = extractDataFromResponse<AgendaData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          agenda.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        } finally {
          loading.value = false;
        }
      },
      CACHE_TTL.SHORT,
    );
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
        cacheStore.invalidatePattern('prestador_agenda_');
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
        cacheStore.invalidatePattern('prestador_agenda_');
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
    const cacheKey = 'public_servico_tipos';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_SERVICO_TIPOS);
          const data = extractDataFromResponse<ServicoTipoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          servicoTipos.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchServicoTiposOptions(
    forceRefresh: boolean = false,
  ): Promise<ServicoTipoOptionData[]> {
    const cacheKey = 'public_servico_tipos_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_SERVICO_TIPOS_OPTIONS);
          const data = extractDataFromResponse<ServicoTipoOptionData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          servicoTiposOptions.value = result;
          return result;
        } catch {
          servicoTiposOptions.value = [];
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchRaioOpcoes(forceRefresh: boolean = false): Promise<RaioOpcaoData[]> {
    const cacheKey = 'public_raio_opcoes';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_RAIO_OPCOES);
          const data = extractDataFromResponse<RaioOpcaoData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          raioOpcoes.value = result;
          return result;
        } catch (error) {
          showError(error);
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchRaioOpcoesOptions(
    forceRefresh: boolean = false,
  ): Promise<RaioOpcaoOptionData[]> {
    const cacheKey = 'public_raio_opcoes_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_RAIO_OPCOES_OPTIONS);
          const data = extractDataFromResponse<RaioOpcaoOptionData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          raioOpcoesOptions.value = result;
          return result;
        } catch {
          raioOpcoesOptions.value = [];
          return [];
        }
      },
      CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  // ==========================================
  // MÉTODOS DE CARREGAMENTO ORGANIZADOS
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
    } catch {
      // Silencioso
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
    } catch {
      // Silencioso
    }
  }

  async function carregarTodosDados(forceRefresh: boolean = false): Promise<void> {
    loading.value = true;
    try {
      await fetchStats(forceRefresh);
      await delay(300);
      await fetchServicos(forceRefresh);
      await delay(300);
      await fetchMinhasCategorias(forceRefresh);
      await delay(300);
      await fetchDisponibilidade(forceRefresh);
      await delay(300);
      await fetchSolicitacoes(undefined, forceRefresh);

      await carregarDadosAuxiliares(forceRefresh);

      await fetchProximosServicos(5, forceRefresh);
      await delay(300);
      await fetchAvaliacoesRecentes(5, forceRefresh);
      await delay(300);
      await fetchGanhos(forceRefresh);

      await fetchPedidosDisponiveis(forceRefresh).catch(() => {});
      await fetchMinhasPropostas(forceRefresh).catch(() => {});
      await fetchNotificacoes(forceRefresh).catch(() => {});

      initialized.value = true;
    } catch {
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
      return;
    }
    await carregarTodosDados(forceRefresh);
  }

  function reset(): void {
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
    cacheStore.invalidatePattern('prestador_');
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
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

    fetchServicos,
    fetchServicoDetalhes,
    createServico,
    updateServico,
    deleteServico,
    toggleServico,

    fetchAgenda,
    bloquearHorario,
    desbloquearHorario,

    fetchSolicitacoes,
    aceitarSolicitacao,
    recusarSolicitacao,

    fetchMinhasCategorias,
    addCategoria,
    removeCategoria,

    fetchGanhos,
    fetchSaques,
    solicitarSaque,
    fetchHistoricoSaques,

    fetchStats,

    fetchProximosServicos,
    fetchAvaliacoesRecentes,

    fetchDiasSemana,
    fetchMeses,
    fetchHorariosPadrao,
    fetchDiasOptions,
    fetchHorariosOptions,

    fetchServicoTipos,
    fetchServicoTiposOptions,

    fetchRaioOpcoes,
    fetchRaioOpcoesOptions,

    fetchIntervalos,
    criarIntervalo,
    atualizarIntervalo,
    deletarIntervalo,

    fetchDisponibilidade,
    updateDisponibilidade,

    fetchPedidosDisponiveis,
    enviarProposta,
    fetchMinhasPropostas,

    fetchNotificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    fetchUnreadCount,

    carregarDashboard,
    carregarDadosAuxiliares,
    carregarTodosDados,
    initialize,
    reset,
    showNotification,
    showError,
  };
});
