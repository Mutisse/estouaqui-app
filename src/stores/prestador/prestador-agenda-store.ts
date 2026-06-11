import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface AgendaItem {
  id: number;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  bloqueado: boolean;
  ocupado?: boolean;
  motivo?: string | null;
  pedido_id?: number;
}

export interface IntervaloItem {
  id: number;
  dias: string[];
  inicio: string;
  fim: string;
  descricao?: string;
  ativo: boolean;
}

export interface BloquearHorarioData {
  data: string;
  horario_inicio: string;
  horario_fim: string;
  motivo?: string;
}

export interface IntervaloData {
  dias: string[];
  inicio: string;
  fim: string;
  descricao?: string;
}

export interface FetchAgendaParams {
  semana?: number;
  data_inicio?: string;
  data_fim?: string;
}

// ===================== STORE =====================

export const usePrestadorAgendaStore = defineStore('prestadorAgenda', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  // Dados da agenda
  const agenda = ref<AgendaItem[]>([]);
  const intervalos = ref<IntervaloItem[]>([]);

  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);
  const currentWeekOffset = ref(0);

  // ===================== GETTERS =====================

  const agendaPorData = computed(() => {
    const map: Record<string, AgendaItem[]> = {};
    agenda.value.forEach(item => {
      if (!map[item.data]) {
        map[item.data] = [];
      }
      const grupo = map[item.data];
      if (grupo) {
        grupo.push(item);
      }
    });
    return map;
  });

  const horariosBloqueados = computed(() => {
    return agenda.value.filter(item => item.bloqueado);
  });

  const horariosOcupados = computed(() => {
    return agenda.value.filter(item => item.ocupado);
  });

  // ===================== AÇÕES - AGENDA =====================

  const fetchAgenda = async (params: FetchAgendaParams = {}): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/agenda', { params });

      if (response.data?.success && response.data.data) {
        agenda.value = response.data.data.map((item: AgendaItem) => ({
          ...item,
          ocupado: item.ocupado || false,
        }));
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        agenda.value = response.data.map((item: AgendaItem) => ({
          ...item,
          ocupado: item.ocupado || false,
        }));
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao buscar agenda:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar agenda';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAgendaPorSemana = async (offset: number = 0): Promise<void> => {
    currentWeekOffset.value = offset;
    await fetchAgenda({ semana: offset });
  };

  /**
   * Bloqueia um horário específico
   * POST /api/prestador/agenda/bloquear
   */
  const bloquearHorario = async (data: BloquearHorarioData): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.post('/prestador/agenda/bloquear', data);
      if (response.data?.success) {
        const novoId = response.data.data?.id || Date.now();

        const index = agenda.value.findIndex(
          item => item.data === data.data && item.horario_inicio === data.horario_inicio
        );

        if (index !== -1 && agenda.value[index]) {
          // ✅ CORRIGIDO: Criar objeto com todas as propriedades obrigatórias
          const itemExistente = agenda.value[index];
          agenda.value[index] = {
            id: itemExistente.id,
            data: itemExistente.data,
            horario_inicio: itemExistente.horario_inicio,
            horario_fim: itemExistente.horario_fim,
            bloqueado: true,
            ocupado: false,
            motivo: data.motivo ?? null,
          };
        } else {
          // ✅ CORRIGIDO: Criar objeto com todas as propriedades obrigatórias
          const novoBloqueio: AgendaItem = {
            id: novoId,
            data: data.data,
            horario_inicio: data.horario_inicio,
            horario_fim: data.horario_fim,
            bloqueado: true,
            ocupado: false,
            motivo: data.motivo ?? null,
          };
          agenda.value.push(novoBloqueio);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao bloquear horário:', err);
      error.value = (err as AxiosError).message || 'Erro ao bloquear horário';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Desbloqueia um horário específico
   * DELETE /api/prestador/agenda/bloquear/{id}
   */
  const desbloquearHorario = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.delete(`/prestador/agenda/bloquear/${id}`);
      if (response.data?.success) {
        const index = agenda.value.findIndex(item => item.id === id);
        if (index !== -1 && agenda.value[index]) {
          agenda.value[index].bloqueado = false;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao desbloquear horário:', err);
      error.value = (err as AxiosError).message || 'Erro ao desbloquear horário';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Salva múltiplas alterações na agenda (bloquear/desbloquear)
   */
  const salvarAlteracoes = async (
    novosBloqueios: BloquearHorarioData[],
    bloqueiosParaDesbloquear: number[]
  ): Promise<boolean> => {
    isSaving.value = true;
    try {
      for (const id of bloqueiosParaDesbloquear) {
        await desbloquearHorario(id);
      }

      for (const bloqueio of novosBloqueios) {
        await bloquearHorario(bloqueio);
      }

      return true;
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      error.value = (err as AxiosError).message || 'Erro ao salvar alterações';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== AÇÕES - INTERVALOS =====================

  const fetchIntervalos = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await api.get('/prestador/agenda/intervalos');
      if (response.data?.success && response.data.data) {
        intervalos.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao buscar intervalos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar intervalos';
    } finally {
      isLoading.value = false;
    }
  };

  const criarIntervalo = async (data: IntervaloData): Promise<IntervaloItem | null> => {
    isSaving.value = true;
    try {
      const response = await api.post('/prestador/agenda/intervalos', data);
      if (response.data?.success && response.data.data) {
        const novoIntervalo = response.data.data;
        intervalos.value.push(novoIntervalo);
        return novoIntervalo;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar intervalo:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar intervalo';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarIntervalo = async (id: number, data: IntervaloData): Promise<IntervaloItem | null> => {
    isSaving.value = true;
    try {
      const response = await api.put(`/prestador/agenda/intervalos/${id}`, data);
      if (response.data?.success && response.data.data) {
        const index = intervalos.value.findIndex(i => i.id === id);
        if (index !== -1) {
          intervalos.value[index] = { ...intervalos.value[index], ...response.data.data };
        }
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar intervalo:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar intervalo';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const deletarIntervalo = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.delete(`/prestador/agenda/intervalos/${id}`);
      if (response.data?.success) {
        intervalos.value = intervalos.value.filter(i => i.id !== id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao deletar intervalo:', err);
      error.value = (err as AxiosError).message || 'Erro ao deletar intervalo';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== AÇÕES GERAIS =====================

  const carregarTodosDados = async (semanaOffset: number = 0): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchAgendaPorSemana(semanaOffset),
        fetchIntervalos(),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarAgenda = async (): Promise<void> => {
    await fetchAgendaPorSemana(currentWeekOffset.value);
  };

  const limparStore = (): void => {
    agenda.value = [];
    intervalos.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    currentWeekOffset.value = 0;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    agenda,
    intervalos,
    dadosCarregados,
    ultimaAtualizacao,
    currentWeekOffset,

    // Getters
    agendaPorData,
    horariosBloqueados,
    horariosOcupados,

    // Agenda
    fetchAgenda,
    fetchAgendaPorSemana,
    bloquearHorario,
    desbloquearHorario,
    salvarAlteracoes,

    // Intervalos
    fetchIntervalos,
    criarIntervalo,
    atualizarIntervalo,
    deletarIntervalo,

    // Gerais
    carregarTodosDados,
    recarregarAgenda,
    limparStore,
  };
});

export default usePrestadorAgendaStore;
