// src/stores/suporte-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

export interface Ticket {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  categoria: string;
  created_at: string;
  updated_at: string;
  resolvido_em?: string;
}

export interface Mensagem {
  id: number;
  ticket_id: number;
  remetente_id: number;
  remetente_tipo: 'cliente' | 'prestador' | 'admin';
  remetente_nome: string;
  mensagem: string;
  anexos?: string[];
  lida: boolean;
  created_at: string;
}

export interface CriarTicketData {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade?: string;
  codigo_erro?: string;
  anexos?: File[];
}

export interface EstatisticasSuporte {
  total: number;
  abertos: number;
  andamento: number;
  resolvidos: number;
  fechados: number;
}

export const useSuporteStore = defineStore('suporte', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  const tickets = ref<Ticket[]>([]);
  const ticketAtual = ref<Ticket | null>(null);
  const mensagens = ref<Mensagem[]>([]);
  const estatisticas = ref<EstatisticasSuporte>({
    total: 0,
    abertos: 0,
    andamento: 0,
    resolvidos: 0,
    fechados: 0,
  });

  // Computed
  const isPrestador = computed(() => authStore.isPrestador);
  const isCliente = computed(() => authStore.isCliente);
  const tipoUsuario = computed(() => (authStore.isPrestador ? 'prestador' : 'cliente'));

  // Helpers
  const getEndpoint = (path: string): string => {
    return `/${tipoUsuario.value}${path}`;
  };

  // Carregar todos os tickets
  const carregarTickets = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(getEndpoint('/suporte/tickets'));

      if (response.data?.success) {
        tickets.value = response.data.data || [];

        // Calcular estatísticas
        estatisticas.value = {
          total: tickets.value.length,
          abertos: tickets.value.filter((t) => t.status === 'aberto').length,
          andamento: tickets.value.filter((t) => t.status === 'em_andamento').length,
          resolvidos: tickets.value.filter((t) => t.status === 'resolvido').length,
          fechados: tickets.value.filter((t) => t.status === 'fechado').length,
        };

        // Se o backend enviou estatísticas, usar elas
        if (response.data.estatisticas) {
          estatisticas.value = response.data.estatisticas;
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao carregar tickets:', err);
      error.value = axiosError.message || 'Erro ao carregar tickets';
    } finally {
      isLoading.value = false;
    }
  };

  // Carregar ticket específico
  const carregarTicket = async (id: number): Promise<Ticket | null> => {
    isLoading.value = true;

    try {
      const response = await api.get(getEndpoint(`/suporte/tickets/${id}`));

      if (response.data?.success) {
        ticketAtual.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar ticket:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Carregar mensagens de um ticket
  const carregarMensagens = async (ticketId: number): Promise<Mensagem[]> => {
    isLoading.value = true;

    try {
      const response = await api.get(getEndpoint(`/suporte/tickets/${ticketId}/mensagens`));

      if (response.data?.success) {
        mensagens.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Criar novo ticket
  const criarTicket = async (data: CriarTicketData): Promise<Ticket | null> => {
    isSending.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('descricao', data.descricao);
      formData.append('categoria', data.categoria);
      formData.append('prioridade', data.prioridade || 'media');

      if (data.codigo_erro) {
        formData.append('codigo_erro', data.codigo_erro);
      }

      if (data.anexos && data.anexos.length > 0) {
        data.anexos.forEach((file, i) => {
          formData.append(`anexos[${i}]`, file);
        });
      }

      const response = await api.post(getEndpoint('/suporte/tickets'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        await carregarTickets();
        return response.data.data;
      }
      return null;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao criar ticket:', err);
      error.value = axiosError.message || 'Erro ao criar ticket';
      return null;
    } finally {
      isSending.value = false;
    }
  };

  // ✅ Enviar mensagem - CORRIGIDO (removida atualização direta do array)
  const enviarMensagem = async (ticketId: number, mensagem: string): Promise<Mensagem | null> => {
    isSending.value = true;

    try {
      const response = await api.post(getEndpoint(`/suporte/tickets/${ticketId}/mensagens`), {
        mensagem,
      });

      if (response.data?.success) {
        const novaMensagem = response.data.data;
        mensagens.value.push(novaMensagem);

        // ✅ CORRIGIDO: verificar se ticket existe antes de atualizar
        const ticketIndex = tickets.value.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1 && tickets.value[ticketIndex]) {
          tickets.value[ticketIndex] = {
            ...tickets.value[ticketIndex],
            updated_at: new Date().toISOString(),
          };
        }

        return novaMensagem;
      }
      return null;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      error.value = 'Erro ao enviar mensagem';
      return null;
    } finally {
      isSending.value = false;
    }
  };

  // ✅ Fechar ticket - CORRIGIDO (removida asserção desnecessária)
  const fecharTicket = async (id: number): Promise<boolean> => {
    isSending.value = true;

    try {
      const response = await api.put(getEndpoint(`/suporte/tickets/${id}/fechar`));

      if (response.data?.success) {
        await carregarTickets();
        if (ticketAtual.value && ticketAtual.value.id === id) {
          ticketAtual.value.status = 'fechado';
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao fechar ticket:', err);
      error.value = 'Erro ao fechar ticket';
      return false;
    } finally {
      isSending.value = false;
    }
  };

  // Limpar store
  const limparStore = (): void => {
    tickets.value = [];
    ticketAtual.value = null;
    mensagens.value = [];
    error.value = null;
    estatisticas.value = {
      total: 0,
      abertos: 0,
      andamento: 0,
      resolvidos: 0,
      fechados: 0,
    };
  };

  // Recarregar todos os dados
  const recarregarDados = async (): Promise<void> => {
    await carregarTickets();
  };

  return {
    // Estados
    isLoading,
    isSending,
    error,
    tickets,
    ticketAtual,
    mensagens,
    estatisticas,

    // Computed
    isPrestador,
    isCliente,
    tipoUsuario,

    // Actions
    carregarTickets,
    carregarTicket,
    carregarMensagens,
    criarTicket,
    enviarMensagem,
    fecharTicket,
    limparStore,
    recarregarDados,
  };
});

export default useSuporteStore;
