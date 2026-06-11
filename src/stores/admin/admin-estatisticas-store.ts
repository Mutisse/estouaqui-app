import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export interface GanhosPorMes {
  mes: string;
  total: number;
}

export interface PedidosPorMes {
  mes: string;
  total: number;
}

export interface PedidosPorStatus {
  pendente: number;
  em_andamento: number;
  concluido: number;
  cancelado: number;
}

export interface TopCategoria {
  categoria: string;
  total: number;
}

export interface TopPrestador {
  id: number;
  nome: string;
  total_pedidos: number;
  avaliacao: number;
}

export interface UltimaAtividade {
  tipo: 'pedido' | 'usuario' | 'prestador' | 'avaliacao' | 'pagamento';
  descricao: string;
  created_at: string;
}

export interface EstatisticasData {
  total_usuarios: number;
  total_prestadores: number;
  total_clientes: number;
  total_pedidos: number;
  ganhos_totais: number;
  crescimento_usuarios: number;
  crescimento_prestadores: number;
  crescimento_pedidos: number;
  crescimento_ganhos: number;
  avaliacoes_total: number;
  total_categorias: number;
  tickets_abertos: number;
  pedidos_por_status: PedidosPorStatus;
  ganhos_por_mes: GanhosPorMes[];
  pedidos_por_mes: PedidosPorMes[];
  top_categorias: TopCategoria[];
  top_prestadores: TopPrestador[];
  ultimas_atividades: UltimaAtividade[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useAdminEstatisticasStore = defineStore('adminEstatisticas', {
  state: () => ({
    isLoading: false,
    dados: null as EstatisticasData | null,
    error: null as string | null,
    periodoAtual: 'mes' as 'mes' | 'trimestre' | 'ano' | 'todos',
  }),

  getters: {
    totalUsuarios: (state) => state.dados?.total_usuarios || 0,
    totalPrestadores: (state) => state.dados?.total_prestadores || 0,
    totalClientes: (state) => state.dados?.total_clientes || 0,
    totalPedidos: (state) => state.dados?.total_pedidos || 0,
    ganhosTotais: (state) => state.dados?.ganhos_totais || 0,
    pedidosPendentes: (state) => state.dados?.pedidos_por_status?.pendente || 0,
    pedidosEmAndamento: (state) => state.dados?.pedidos_por_status?.em_andamento || 0,
    pedidosConcluidos: (state) => state.dados?.pedidos_por_status?.concluido || 0,
    pedidosCancelados: (state) => state.dados?.pedidos_por_status?.cancelado || 0,
  },

  actions: {
    clearError() {
      this.error = null;
    },

    getErrorMessage(error: unknown): string {
      const apiError = error as ApiError;
      return apiError.response?.data?.message || apiError.message || 'Erro desconhecido';
    },

    setPeriodo(periodo: 'mes' | 'trimestre' | 'ano' | 'todos') {
      this.periodoAtual = periodo;
    },

    async carregarEstatisticas(periodo?: string): Promise<boolean> {
      this.isLoading = true;
      this.clearError();

      const periodoParam = periodo || this.periodoAtual;

      try {
        const response = await api.get(`/admin/estatisticas?periodo=${periodoParam}`);
        this.dados = response.data.data;
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async carregarEstatisticasPorPeriodo(periodo: string): Promise<boolean> {
      this.isLoading = true;
      try {
        const response = await api.get(`/admin/estatisticas/${periodo}`);
        this.dados = response.data.data;
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async recarregarDados(): Promise<void> {
      await this.carregarEstatisticas();
    },
  },
});
