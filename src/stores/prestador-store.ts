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

  // ✅ CORREÇÃO: Cache para evitar requisições duplicadas
  // ==========================================
  // MÉTODO AUXILIAR PARA EVITAR REQUISIÇÕES DUPLICADAS
  // ==========================================

  const pendingRequests = new Map<string, Promise<unknown>>();

  async function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    // ✅ CORREÇÃO: remover a asserção desnecessária
    return promise;
  }

  // ==========================================
  // SERVIÇOS DO PRESTADOR
  // ==========================================

  async function fetchServicos(): Promise<ServicoData[]> {
    return dedupeRequest('servicos', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICOS);
        servicos.value = response.data.data;
        return servicos.value;
      } catch (error) {
        showError(error);
        return [];
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
        servicos.value.push(response.data.data);
        showNotification('positive', 'Serviço criado com sucesso!', 'check_circle');
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

  async function updateServico(
    id: number,
    data: Partial<ServicoData>,
  ): Promise<ServicoData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_SERVICO(id.toString()), data);
      if (response.data.success) {
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1) {
          servicos.value[index] = response.data.data;
        }
        showNotification('positive', 'Serviço atualizado com sucesso!', 'edit');
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
        agenda.value = response.data.data;
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

        // ✅ CORREÇÃO: Garantir que solicitacoes seja sempre um array
        const data = response.data.data;
        if (Array.isArray(data)) {
          solicitacoes.value = data;
        } else if (data && Array.isArray(data.data)) {
          solicitacoes.value = data.data;
        } else {
          solicitacoes.value = [];
        }

        return solicitacoes.value;
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        solicitacoes.value = [];
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
        minhasCategorias.value = response.data.data;
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
        ganhos.value = response.data.data;
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
        saques.value = response.data.data;
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

  async function fetchHistoricoSaques(): Promise<SaqueData[]> {
    return dedupeRequest('historico_saques', async () => {
      loading.value = true;
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.HISTORICO_SAQUES);
        historicoSaques.value = response.data.data.data || response.data.data;
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
        stats.value = response.data.data;
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
        proximosServicos.value = response.data.data;
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
        avaliacoesRecentes.value = response.data.data;
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
        diasSemana.value = response.data.data;
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
        meses.value = response.data.data;
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
        horariosPadrao.value = response.data.data;
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
        diasOptions.value = response.data.data;
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
        horariosOptions.value = response.data.data;
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
        intervalos.value = response.data.data;
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
        intervalos.value.push(response.data.data);
        showNotification('positive', 'Intervalo criado com sucesso!', 'schedule');
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

  async function atualizarIntervalo(
    id: number,
    data: Partial<IntervaloData>,
  ): Promise<IntervaloData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_INTERVALO(id.toString()), data);
      if (response.data.success) {
        const index = intervalos.value.findIndex((i) => i.id === id);
        if (index !== -1) {
          intervalos.value[index] = response.data.data;
        }
        showNotification('positive', 'Intervalo atualizado!', 'edit');
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
        disponibilidade.value = response.data.data;
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
        disponibilidade.value = response.data.data;
        showNotification('positive', 'Configurações atualizadas!', 'settings');
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

  // ==========================================
  // TIPOS DE SERVIÇO
  // ==========================================

  async function fetchServicoTipos(): Promise<ServicoTipoData[]> {
    return dedupeRequest('servico_tipos', async () => {
      try {
        const response = await api.get(PRESTADOR_ENDPOINTS.SERVICO_TIPOS);
        servicoTipos.value = response.data.data;
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
        servicoTiposOptions.value = response.data.data;
        return servicoTiposOptions.value;
      } catch (error) {
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
        raioOpcoes.value = response.data.data;
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
        raioOpcoesOptions.value = response.data.data;
        return raioOpcoesOptions.value;
      } catch (error) {
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
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      loading.value = false;
    }
  }

  async function carregarDadosAuxiliares(): Promise<void> {
    await Promise.all([
      fetchDiasSemana(),
      fetchMeses(),
      fetchHorariosPadrao(),
      fetchDiasOptions(),
      fetchHorariosOptions(),
      fetchServicoTiposOptions(),
      fetchRaioOpcoesOptions(),
    ]);
  }

  async function carregarTodosDados(): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        fetchServicos(),
        fetchMinhasCategorias(),
        fetchIntervalos(),
        fetchDisponibilidade(),
        carregarDadosAuxiliares(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
    showNotification,
    showError,
  };
});
