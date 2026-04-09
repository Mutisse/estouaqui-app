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

export interface CategoriaPrestadorData {
  id: number;
  nome: string;
  icone: string;
  cor: string;
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

// ==========================================
// STORE DO PRESTADOR
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
  // FUNÇÃO AUXILIAR PARA EXTRAIR DADOS
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

  // ==========================================
  // SERVIÇOS DO PRESTADOR
  // ==========================================

  async function fetchServicos(): Promise<ServicoData[]> {
    return dedupeRequest('servicos', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICOS);
        const data = extractDataFromResponse<ServicoData[]>(response.data);
        servicos.value = data;
        console.log(`✅ ${data.length} serviços carregados`);
        return servicos.value;
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
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
        const response = await api.get(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()));
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
  // AGENDA DO PRESTADOR
  // ==========================================

  async function fetchAgenda(params?: { semana?: number }): Promise<AgendaData[]> {
    return dedupeRequest(`agenda_${params?.semana || 0}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AGENDA, { params });
        agenda.value = extractDataFromResponse<AgendaData[]>(response.data);
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
  // SOLICITAÇÕES/PEDIDOS
  // ==========================================

  async function fetchSolicitacoes(status?: string): Promise<SolicitacaoData[]> {
    const cacheKey = `solicitacoes_${status || 'all'}`;
    return dedupeRequest(cacheKey, async () => {
      loading.value = true;
      try {
        const url = status
          ? PRESTADOR_ENDPOINTS.SOLICITACOES_BY_STATUS(status)
          : PRESTADOR_ENDPOINTS.SOLICITACOES;
        const response = await api.get(url);
        solicitacoes.value = extractDataFromResponse<SolicitacaoData[]>(response.data);
        console.log(`✅ ${solicitacoes.value.length} solicitações carregadas`);
        return solicitacoes.value;
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
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
  // CATEGORIAS DO PRESTADOR
  // ==========================================

  async function fetchMinhasCategorias(): Promise<CategoriaPrestadorData[]> {
    return dedupeRequest('minhas_categorias', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_CATEGORIAS);
        minhasCategorias.value = extractDataFromResponse<CategoriaPrestadorData[]>(response.data);
        console.log(`✅ ${minhasCategorias.value.length} categorias carregadas`);
        return minhasCategorias.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function addCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(
        PRESTADOR_ENDPOINTS.ADICIONAR_CATEGORIA(categoriaId.toString()),
      );
      if (response.data.success) {
        await fetchMinhasCategorias();
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
  // FINANCEIRO DO PRESTADOR
  // ==========================================

  async function fetchGanhos(): Promise<GanhosData | null> {
    return dedupeRequest('ganhos', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.GANHOS);
        ganhos.value = extractDataFromResponse<GanhosData>(response.data);
        return ganhos.value;
      } catch (error) {
        showError(error);
        return null;
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchSaques(): Promise<SaqueData[]> {
    return dedupeRequest('saques', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SAQUES);
        saques.value = extractDataFromResponse<SaqueData[]>(response.data);
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
        await fetchSaques();
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

  async function fetchHistoricoSaques(): Promise<SaqueData[]> {
    return dedupeRequest('historico_saques', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.HISTORICO_SAQUES);
        historicoSaques.value = extractDataFromResponse<SaqueData[]>(response.data);
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
  // ESTATÍSTICAS DO PRESTADOR
  // ==========================================

  async function fetchStats(): Promise<StatsData | null> {
    return dedupeRequest('stats', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PRESTADOR_STATS);
        stats.value = extractDataFromResponse<StatsData>(response.data);
        return stats.value;
      } catch (error) {
        showError(error);
        return null;
      } finally {
        loading.value = false;
      }
    });
  }

  // ==========================================
  // PRÓXIMOS SERVIÇOS E AVALIAÇÕES RECENTES
  // ==========================================

  async function fetchProximosServicos(limit: number = 5): Promise<ProximoServicoData[]> {
    return dedupeRequest(`proximos_servicos_${limit}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.PROXIMOS_SERVICOS, {
          params: { limit },
        });
        proximosServicos.value = extractDataFromResponse<ProximoServicoData[]>(response.data);
        return proximosServicos.value;
      } catch (error) {
        showError(error);
        return [];
      } finally {
        loading.value = false;
      }
    });
  }

  async function fetchAvaliacoesRecentes(limit: number = 5): Promise<AvaliacaoRecenteData[]> {
    return dedupeRequest(`avaliacoes_recentes_${limit}`, async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AVALIACOES_RECENTES, {
          params: { limit },
        });
        avaliacoesRecentes.value = extractDataFromResponse<AvaliacaoRecenteData[]>(response.data);
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
  // DADOS AUXILIARES
  // ==========================================

  async function fetchDiasSemana(): Promise<DiaSemanaData[]> {
    return dedupeRequest('dias_semana', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_SEMANA);
        diasSemana.value = extractDataFromResponse<DiaSemanaData[]>(response.data);
        return diasSemana.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchMeses(): Promise<MesData[]> {
    return dedupeRequest('meses', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_MESES);
        meses.value = extractDataFromResponse<MesData[]>(response.data);
        return meses.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchHorariosPadrao(): Promise<HorarioPadraoData[]> {
    return dedupeRequest('horarios_padrao', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_PADRAO);
        horariosPadrao.value = extractDataFromResponse<HorarioPadraoData[]>(response.data);
        return horariosPadrao.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchDiasOptions(): Promise<DiaOptionData[]> {
    return dedupeRequest('dias_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_OPTIONS);
        diasOptions.value = extractDataFromResponse<DiaOptionData[]>(response.data);
        return diasOptions.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchHorariosOptions(): Promise<HorarioOptionData[]> {
    return dedupeRequest('horarios_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.AUX_HORARIOS_OPTIONS);
        horariosOptions.value = extractDataFromResponse<HorarioOptionData[]>(response.data);
        return horariosOptions.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  // ==========================================
  // INTERVALOS DO PRESTADOR
  // ==========================================

  async function fetchIntervalos(): Promise<IntervaloData[]> {
    return dedupeRequest('intervalos', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.INTERVALOS);
        intervalos.value = extractDataFromResponse<IntervaloData[]>(response.data);
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
  // DISPONIBILIDADE DO PRESTADOR
  // ==========================================

  async function fetchDisponibilidade(): Promise<DisponibilidadeData | null> {
    return dedupeRequest('disponibilidade', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.DISPONIBILIDADE);
        disponibilidade.value = extractDataFromResponse<DisponibilidadeData>(response.data);
        return disponibilidade.value;
      } catch (error) {
        showError(error);
        return null;
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
  // TIPOS DE SERVIÇO
  // ==========================================

  async function fetchServicoTipos(): Promise<ServicoTipoData[]> {
    return dedupeRequest('servico_tipos', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICO_TIPOS);
        servicoTipos.value = extractDataFromResponse<ServicoTipoData[]>(response.data);
        return servicoTipos.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchServicoTiposOptions(): Promise<ServicoTipoOptionData[]> {
    return dedupeRequest('servico_tipos_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICO_TIPOS_OPTIONS);
        servicoTiposOptions.value = extractDataFromResponse<ServicoTipoOptionData[]>(response.data);
        console.log(`✅ ${servicoTiposOptions.value.length} tipos de serviço carregados`);
        return servicoTiposOptions.value;
      } catch (error) {
        console.error('Erro ao carregar tipos de serviço:', error);
        showError(error);
        return [];
      }
    });
  }

  // ==========================================
  // OPÇÕES DE RAIO
  // ==========================================

  async function fetchRaioOpcoes(): Promise<RaioOpcaoData[]> {
    return dedupeRequest('raio_opcoes', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.RAIO_OPCOES);
        raioOpcoes.value = extractDataFromResponse<RaioOpcaoData[]>(response.data);
        return raioOpcoes.value;
      } catch (error) {
        showError(error);
        return [];
      }
    });
  }

  async function fetchRaioOpcoesOptions(): Promise<RaioOpcaoOptionData[]> {
    return dedupeRequest('raio_opcoes_options', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.RAIO_OPCOES_OPTIONS);
        raioOpcoesOptions.value = extractDataFromResponse<RaioOpcaoOptionData[]>(response.data);
        console.log(`✅ ${raioOpcoesOptions.value.length} opções de raio carregadas`);
        return raioOpcoesOptions.value;
      } catch (error) {
        console.error('Erro ao carregar opções de raio:', error);
        showError(error);
        return [];
      }
    });
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

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
    console.error('Erro:', message);
    showNotification('negative', message);
  }

  async function carregarDashboard(): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        fetchStats(),
        fetchGanhos(),
        fetchProximosServicos(5),
        fetchAvaliacoesRecentes(5),
      ]);
      console.log('✅ Dashboard carregado com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      loading.value = false;
    }
  }

  async function carregarDadosAuxiliares(): Promise<void> {
    console.log('📦 Carregando dados auxiliares...');
    await Promise.all([
      fetchDiasSemana(),
      fetchMeses(),
      fetchHorariosPadrao(),
      fetchDiasOptions(),
      fetchHorariosOptions(),
      fetchServicoTiposOptions(),
      fetchRaioOpcoesOptions(),
    ]);
    console.log('✅ Dados auxiliares carregados');
  }

  async function carregarTodosDados(): Promise<void> {
    console.log('🚀 Carregando todos os dados do prestador...');
    loading.value = true;
    try {
      await Promise.all([
        fetchServicos(),
        fetchMinhasCategorias(),
        fetchSolicitacoes(),
        fetchIntervalos(),
        fetchDisponibilidade(),
        carregarDadosAuxiliares(),
      ]);
      initialized.value = true;
      console.log('✅ Todos os dados do prestador carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      loading.value = false;
    }
  }

  async function initialize(): Promise<void> {
    if (initialized.value) {
      console.log('⚠️ PrestadorStore já inicializado');
      return;
    }
    await carregarTodosDados();
  }

  function reset(): void {
    console.log('🔄 Resetando PrestadorStore...');
    servicos.value = [];
    minhasCategorias.value = [];
    solicitacoes.value = [];
    intervalos.value = [];
    disponibilidade.value = null;
    initialized.value = false;
    pendingRequests.clear();
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

    // Categorias
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

    // Intervalos
    fetchIntervalos,
    criarIntervalo,
    atualizarIntervalo,
    deletarIntervalo,

    // Disponibilidade
    fetchDisponibilidade,
    updateDisponibilidade,

    // Tipos de Serviço
    fetchServicoTipos,
    fetchServicoTiposOptions,

    // Opções de Raio
    fetchRaioOpcoes,
    fetchRaioOpcoesOptions,

    // Utilitários
    carregarDashboard,
    carregarDadosAuxiliares,
    carregarTodosDados,
    initialize,
    reset,
    showNotification,
    showError,
  };
});
