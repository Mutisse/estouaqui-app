import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export interface CardPrincipal {
  title: string;
  value: number;
  icon: string;
  colorKey: 'blue' | 'green' | 'gold' | 'teal' | 'red' | 'purple';
  trend: number;
  isCurrency?: boolean;
}

export interface CardSecundario {
  title: string;
  value: number;
  icon: string;
  colorKey: 'blue' | 'green' | 'gold' | 'teal' | 'red' | 'purple' | 'slate';
}

export interface AtividadeDiaria {
  dia: string;
  valor: number;
  altura: number;
  cor: string;
}

export interface DistribuicaoTipo {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface UtilizadorRecente {
  id: number;
  nome: string;
  email: string;
  tipo: 'cliente' | 'prestador' | 'admin' | 'root';
  data_criacao: string;
}

export interface ServicoRecente {
  id: number;
  servico: string;
  nome?: string;
  cliente: string;
  cliente_nome: string;
  prestador: string;
  prestador_nome: string;
  valor: number;
  status: string;
  statusKey: 'ok' | 'pend' | 'prog' | 'cancel';
  icone: string;
  colorKey: 'blue' | 'green' | 'gold' | 'teal' | 'red' | 'purple' | 'slate';
}

export interface DashboardData {
  total_usuarios: number;
  total_prestadores: number;
  total_servicos: number;
  faturamento_mes: number;
  crescimento_usuarios: number;
  crescimento_prestadores: number;
  crescimento_servicos: number;
  crescimento_faturamento: number;
  atividade_ultimos_7_dias: Array<{ dia: string; quantidade: number }>;
  distribuicao_tipos: Array<{ tipo: string; quantidade: number; percentual: number; cor: string }>;
  ultimos_utilizadores: UtilizadorRecente[];
  servicos_recentes: ServicoRecente[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const CORES_GRAFICO: string[] = [
  '#667EEA', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#764BA2', '#607D8B', '#EC4899', '#F97316', '#14B8A6',
];
const COR_PADRAO = '#667EEA';

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: () => ({
    isLoading: false,
    dashboard: null as DashboardData | null,
    error: null as string | null,
  }),

  getters: {
    // ✅ CORRIGIDO: Verificar se dashboard existe antes de acessar
    cardsPrincipais(): CardPrincipal[] {
      const d = this.dashboard;
      if (!d) return [];

      return [
        {
          title: 'Utilizadores',
          value: d.total_usuarios || 0,
          icon: 'people',
          colorKey: 'blue',
          trend: d.crescimento_usuarios || 0,
        },
        {
          title: 'Prestadores',
          value: d.total_prestadores || 0,
          icon: 'handyman',
          colorKey: 'purple',
          trend: d.crescimento_prestadores || 0,
        },
        {
          title: 'Serviços',
          value: d.total_servicos || 0,
          icon: 'receipt',
          colorKey: 'teal',
          trend: d.crescimento_servicos || 0,
        },
        {
          title: 'Faturamento',
          value: d.faturamento_mes || 0,
          icon: 'attach_money',
          colorKey: 'green',
          trend: d.crescimento_faturamento || 0,
          isCurrency: true,
        },
      ];
    },

    // ✅ CORRIGIDO: Cards secundários com fallback seguro
    cardsSecundarios(): CardSecundario[] {
      const d = this.dashboard;
      if (!d) return [];

      return [
        { title: 'Clientes', value: (d.distribuicao_tipos?.find(t => t.tipo === 'cliente')?.quantidade) || 0, icon: 'person', colorKey: 'blue' },
        { title: 'Admins', value: (d.distribuicao_tipos?.find(t => t.tipo === 'admin')?.quantidade) || 0, icon: 'admin_panel_settings', colorKey: 'red' },
        { title: 'Verificados', value: Math.floor((d.total_usuarios || 0) * 0.7), icon: 'verified', colorKey: 'green' },
        { title: 'Pendentes', value: Math.floor((d.total_usuarios || 0) * 0.3), icon: 'pending', colorKey: 'gold' },
      ];
    },

    atividadeFormatada(): AtividadeDiaria[] {
      const atividades = this.dashboard?.atividade_ultimos_7_dias;
      if (!atividades || atividades.length === 0) return [];

      const max = Math.max(...atividades.map((a) => a.quantidade), 1);

      return atividades.map((item, index) => ({
        dia: item.dia.substring(5, 10),
        valor: item.quantidade,
        altura: Math.max(4, (item.quantidade / max) * 80),
        cor: CORES_GRAFICO[index % CORES_GRAFICO.length] || COR_PADRAO,
      }));
    },

    distribuicaoPorTipo(): DistribuicaoTipo[] {
      const tipos = this.dashboard?.distribuicao_tipos;
      if (!tipos) return [];

      return tipos.map((tipo) => ({
        label: tipo.tipo === 'prestador' ? 'Prestador' : tipo.tipo === 'admin' ? 'Admin' : tipo.tipo === 'root' ? 'Root' : 'Cliente',
        value: tipo.quantidade,
        percent: tipo.percentual,
        color: tipo.cor || COR_PADRAO,
      }));
    },

    ultimosUtilizadores(): UtilizadorRecente[] {
      return this.dashboard?.ultimos_utilizadores || [];
    },

    servicosRecentes(): ServicoRecente[] {
      return this.dashboard?.servicos_recentes || [];
    },
  },

  actions: {
    clearError() {
      this.error = null;
    },

    getErrorMessage(error: unknown): string {
      const apiError = error as ApiError;
      return apiError.response?.data?.message || apiError.message || 'Erro desconhecido';
    },

    async carregarDashboard(): Promise<boolean> {
      this.isLoading = true;
      this.clearError();

      try {
        const response = await api.get('/admin/dashboard');

        // ✅ Extrair corretamente os dados da resposta
        if (response.data?.success) {
          this.dashboard = response.data.data;
          return true;
        } else if (response.data) {
          this.dashboard = response.data;
          return true;
        }
        return false;
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

    async carregarTodosDados(): Promise<void> {
      await this.carregarDashboard();
    },

    async recarregarDados(): Promise<void> {
      await this.carregarDashboard();
    },
  },
});
