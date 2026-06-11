import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

// Interfaces
export interface ResumoFinanceiro {
  total_ganhos: number;
  pendentes: number;
  pagos: number;
  total_saques: number;
  total_receitas: number;
  total_despesas: number;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'cancelado';
  data: string;
  created_at: string;
  usuario_id?: number;
  usuario_nome?: string;
  prestador_id?: number;
  prestador_nome?: string;
  servico_id?: number;
  servico_descricao?: string;
}

export interface GanhosPorMes {
  mes: string;
  total: number;
  ano: number;
  mes_numero: number;
}

export interface Saque {
  id: number;
  prestador_id: number;
  prestador_nome: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'concluido' | 'recusado';
  data_solicitacao: string;
  data_aprovacao?: string;
  data_pagamento?: string;
  observacao?: string;
}

export interface FinanceiroData {
  resumo: ResumoFinanceiro;
  transacoes: Transacao[];
  ganhos_por_mes: GanhosPorMes[];
  saques_pendentes: Saque[];
  ultimos_saques: Saque[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useAdminFinanceiroStore = defineStore('adminFinanceiro', {
  state: () => ({
    isLoading: false,
    isExporting: false,
    data: null as FinanceiroData | null,
    error: null as string | null,
    currentPeriodo: 'mes' as 'mes' | 'trimestre' | 'ano' | 'todos',
  }),

  getters: {
    // Resumo financeiro
    resumo(): ResumoFinanceiro {
      return (
        this.data?.resumo || {
          total_ganhos: 0,
          pendentes: 0,
          pagos: 0,
          total_saques: 0,
          total_receitas: 0,
          total_despesas: 0,
        }
      );
    },

    // Lista de transações
    transacoes(): Transacao[] {
      return this.data?.transacoes || [];
    },

    // Ganhos por mês (para o gráfico)
    ganhosPorMes(): GanhosPorMes[] {
      return this.data?.ganhos_por_mes || [];
    },

    // Saques pendentes
    saquesPendentes(): Saque[] {
      return this.data?.saques_pendentes || [];
    },

    // Últimos saques
    ultimosSaques(): Saque[] {
      return this.data?.ultimos_saques || [];
    },

    // Total de saques pendentes
    totalSaquesPendentes(): number {
      return this.saquesPendentes.reduce((total, saque) => total + saque.valor, 0);
    },

    // Média de ganhos diários
    mediaGanhosDiarios(): number {
      if (!this.ganhosPorMes.length) return 0;
      const total = this.ganhosPorMes.reduce((sum, item) => sum + item.total, 0);
      return total / this.ganhosPorMes.length / 30;
    },
  },

  actions: {
    // Limpar erro
    clearError() {
      this.error = null;
    },

    // Helper para extrair mensagem de erro
    getErrorMessage(error: unknown): string {
      const apiError = error as ApiError;
      return apiError.response?.data?.message || apiError.message || 'Erro desconhecido';
    },

    // Definir período
    setPeriodo(periodo: 'mes' | 'trimestre' | 'ano' | 'todos') {
      this.currentPeriodo = periodo;
    },

    // Carregar todos os dados financeiros
    async carregarFinanceiro(periodo?: string): Promise<boolean> {
      this.isLoading = true;
      this.clearError();

      const periodoParam = periodo || this.currentPeriodo;

      try {
        const response = await api.get(`/admin/financeiro?periodo=${periodoParam}`);
        this.data = response.data;
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

    // Carregar apenas resumo
    async carregarResumo(periodo?: string): Promise<boolean> {
      const periodoParam = periodo || this.currentPeriodo;

      try {
        const response = await api.get(`/admin/financeiro/resumo?periodo=${periodoParam}`);
        if (this.data) {
          this.data.resumo = response.data;
        } else {
          this.data = {
            resumo: response.data,
            transacoes: [],
            ganhos_por_mes: [],
            saques_pendentes: [],
            ultimos_saques: [],
          };
        }
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      }
    },

    // Carregar transações
    async carregarTransacoes(filtros?: {
      tipo?: 'receita' | 'despesa';
      status?: 'pago' | 'pendente' | 'cancelado';
      data_inicio?: string;
      data_fim?: string;
    }): Promise<boolean> {
      try {
        const params = new URLSearchParams();
        if (filtros?.tipo) params.append('tipo', filtros.tipo);
        if (filtros?.status) params.append('status', filtros.status);
        if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
        if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);

        const response = await api.get(`/admin/financeiro/transacoes?${params.toString()}`);
        if (this.data) {
          this.data.transacoes = response.data;
        }
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      }
    },

    // Carregar ganhos por mês
    async carregarGanhosPorMes(periodo?: string): Promise<boolean> {
      const periodoParam = periodo || this.currentPeriodo;

      try {
        const response = await api.get(`/admin/financeiro/ganhos-por-mes?periodo=${periodoParam}`);
        if (this.data) {
          this.data.ganhos_por_mes = response.data;
        }
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      }
    },

    // Carregar saques pendentes
    async carregarSaquesPendentes(): Promise<boolean> {
      try {
        const response = await api.get('/admin/financeiro/saques/pendentes');
        if (this.data) {
          this.data.saques_pendentes = response.data;
        }
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      }
    },

    // Carregar últimos saques
    async carregarUltimosSaques(limite: number = 10): Promise<boolean> {
      try {
        const response = await api.get(`/admin/financeiro/saques/ultimos?limite=${limite}`);
        if (this.data) {
          this.data.ultimos_saques = response.data;
        }
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        return false;
      }
    },

    // Aprovar saque
    async aprovarSaque(id: number): Promise<boolean> {
      try {
        await api.post(`/admin/financeiro/saques/${id}/aprovar`);
        Notify.create({
          type: 'positive',
          message: 'Saque aprovado com sucesso!',
          position: 'top',
        });
        await this.carregarSaquesPendentes();
        await this.carregarUltimosSaques();
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      }
    },

    // Concluir saque (pagamento realizado)
    async concluirSaque(id: number): Promise<boolean> {
      try {
        await api.post(`/admin/financeiro/saques/${id}/concluir`);
        Notify.create({
          type: 'positive',
          message: 'Pagamento do saque concluído!',
          position: 'top',
        });
        await this.carregarSaquesPendentes();
        await this.carregarUltimosSaques();
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      }
    },

    // Recusar saque
    async recusarSaque(id: number, observacao?: string): Promise<boolean> {
      try {
        await api.post(`/admin/financeiro/saques/${id}/recusar`, { observacao });
        Notify.create({
          type: 'positive',
          message: 'Saque recusado!',
          position: 'top',
        });
        await this.carregarSaquesPendentes();
        await this.carregarUltimosSaques();
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      }
    },

    // Exportar relatório
    async exportarRelatorio(periodo?: string, formato: 'csv' | 'excel' = 'csv'): Promise<boolean> {
      this.isExporting = true;
      const periodoParam = periodo || this.currentPeriodo;

      try {
        const response = await api.get(
          `/admin/financeiro/exportar?periodo=${periodoParam}&formato=${formato}`,
          {
            responseType: 'blob',
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        const extensao = formato === 'csv' ? 'csv' : 'xlsx';
        link.href = url;
        link.setAttribute('download', `financeiro_${periodoParam}.${extensao}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        Notify.create({
          type: 'positive',
          message: `Relatório exportado com sucesso!`,
          position: 'top',
        });
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
        this.isExporting = false;
      }
    },

    // Registrar nova transação
    async registrarTransacao(transacao: {
      descricao: string;
      valor: number;
      tipo: 'receita' | 'despesa';
      status: 'pago' | 'pendente';
      data: string;
      servico_id?: number;
      usuario_id?: number;
    }): Promise<boolean> {
      try {
        const response = await api.post('/admin/financeiro/transacoes', transacao);
        Notify.create({
          type: 'positive',
          message: 'Transação registada com sucesso!',
          position: 'top',
        });
        await this.carregarTransacoes();
        await this.carregarResumo();
        return response.data.success;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      }
    },

    // Atualizar status de transação
    async atualizarStatusTransacao(
      id: number,
      status: 'pago' | 'pendente' | 'cancelado',
    ): Promise<boolean> {
      try {
        await api.put(`/admin/financeiro/transacoes/${id}/status`, { status });
        Notify.create({
          type: 'positive',
          message: 'Status atualizado com sucesso!',
          position: 'top',
        });
        await this.carregarTransacoes();
        await this.carregarResumo();
        return true;
      } catch (error: unknown) {
        this.error = this.getErrorMessage(error);
        Notify.create({
          type: 'negative',
          message: this.error,
          position: 'top',
        });
        return false;
      }
    },

    // Carregar todos os dados (método principal)
    async carregarTodosDados(periodo?: string): Promise<void> {
      await this.carregarFinanceiro(periodo);
    },

    // Recarregar dados
    async recarregarDados(): Promise<void> {
      await this.carregarFinanceiro();
    },
  },
});
