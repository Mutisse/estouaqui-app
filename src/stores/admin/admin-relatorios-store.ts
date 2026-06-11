// src/stores/admin/admin-relatorios-store.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ✅ Interface com undefined explícito para opcionais
export interface FiltrosRelatorios {
  data_inicio: string;
  data_fim: string;
  tipo: string;
  categoria_id?: number | undefined;
  prestador_id?: number | undefined;
}

export interface DadosRelatorioPedidos {
  total: number;
  por_status: {
    pendente: number;
    aceito: number;
    em_andamento: number;
    concluido: number;
    cancelado: number;
  };
  valor_total: number;
  valor_medio: number;
  pedidos_por_dia: Array<{ data: string; total: number }>;
  pedidos_por_categoria: Array<{ nome: string; total: number; valor: number }>;
  pedidos_por_prestador: Array<{ nome: string; total: number; valor: number }>;
  top_clientes: Array<{ nome: string; pedidos: number; valor_total: number }>;
}

export interface DadosRelatorioFinanceiro {
  faturamento_total: number;
  faturamento_periodo: number;
  comissoes_total: number;
  pagamentos_pendentes: number;
  receita_por_dia: Array<{ data: string; valor: number }>;
  receita_por_mes: Array<{ mes: string; valor: number }>;
  top_categorias: Array<{ nome: string; valor: number }>;
}

export interface DadosRelatorioPrestadores {
  total_prestadores: number;
  ativos: number;
  inativos: number;
  verificados: number;
  nao_verificados: number;
  media_avaliacao_global: number;
  top_prestadores: Array<{
    id: number;
    nome: string;
    profissao: string;
    total_pedidos: number;
    faturamento: number;
    media_avaliacao: number;
  }>;
  prestadores_por_categoria: Array<{ nome: string; total: number }>;
}

export interface DadosRelatorioClientes {
  total_clientes: number;
  novos_mes: number;
  ativos_mes: number;
  top_clientes: Array<{
    id: number;
    nome: string;
    total_pedidos: number;
    total_gasto: number;
  }>;
  clientes_por_mes: Array<{ mes: string; total: number }>;
}

interface ApiParams {
  data_inicio: string;
  data_fim: string;
  categoria_id?: number;
  prestador_id?: number;
  format?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useAdminRelatoriosStore = defineStore('adminRelatorios', () => {
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const dadosPedidos = ref<DadosRelatorioPedidos | null>(null);
  const dadosFinanceiro = ref<DadosRelatorioFinanceiro | null>(null);
  const dadosPrestadores = ref<DadosRelatorioPrestadores | null>(null);
  const dadosClientes = ref<DadosRelatorioClientes | null>(null);

  const carregarRelatorioPedidos = async (filtros: FiltrosRelatorios): Promise<DadosRelatorioPedidos | null> => {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const params: ApiParams = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      };
      if (filtros.categoria_id !== undefined && filtros.categoria_id !== null) {
        params.categoria_id = filtros.categoria_id;
      }
      if (filtros.prestador_id !== undefined && filtros.prestador_id !== null) {
        params.prestador_id = filtros.prestador_id;
      }

      const response = await api.get<ApiResponse<DadosRelatorioPedidos>>('/admin/relatorios/pedidos', { params });
      if (response.data?.success) {
        dadosPedidos.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar relatório de pedidos:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar relatório';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const carregarRelatorioFinanceiro = async (filtros: FiltrosRelatorios): Promise<DadosRelatorioFinanceiro | null> => {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const params: ApiParams = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      };

      const response = await api.get<ApiResponse<DadosRelatorioFinanceiro>>('/admin/relatorios/financeiro', { params });
      if (response.data?.success) {
        dadosFinanceiro.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar relatório financeiro:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar relatório';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const carregarRelatorioPrestadores = async (filtros: FiltrosRelatorios): Promise<DadosRelatorioPrestadores | null> => {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const params: ApiParams = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      };

      const response = await api.get<ApiResponse<DadosRelatorioPrestadores>>('/admin/relatorios/prestadores', { params });
      if (response.data?.success) {
        dadosPrestadores.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar relatório de prestadores:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar relatório';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const carregarRelatorioClientes = async (filtros: FiltrosRelatorios): Promise<DadosRelatorioClientes | null> => {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const params: ApiParams = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      };

      const response = await api.get<ApiResponse<DadosRelatorioClientes>>('/admin/relatorios/clientes', { params });
      if (response.data?.success) {
        dadosClientes.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar relatório de clientes:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar relatório';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const exportarExcel = async (tipo: string, filtros: FiltrosRelatorios): Promise<Blob | null> => {
    try {
      const params: ApiParams & { format: string } = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        format: 'excel',
      };
      if (filtros.categoria_id !== undefined && filtros.categoria_id !== null) {
        params.categoria_id = filtros.categoria_id;
      }

      const response = await api.get(`/admin/relatorios/${tipo}/exportar`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      console.error('Erro ao exportar:', err);
      return null;
    }
  };

  const exportarPDF = async (tipo: string, filtros: FiltrosRelatorios): Promise<Blob | null> => {
    try {
      const params: ApiParams & { format: string } = {
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        format: 'pdf',
      };
      if (filtros.categoria_id !== undefined && filtros.categoria_id !== null) {
        params.categoria_id = filtros.categoria_id;
      }

      const response = await api.get(`/admin/relatorios/${tipo}/exportar`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      return null;
    }
  };

  const limparDados = (): void => {
    dadosPedidos.value = null;
    dadosFinanceiro.value = null;
    dadosPrestadores.value = null;
    dadosClientes.value = null;
  };

  return {
    isLoading,
    error,
    dadosPedidos,
    dadosFinanceiro,
    dadosPrestadores,
    dadosClientes,
    carregarRelatorioPedidos,
    carregarRelatorioFinanceiro,
    carregarRelatorioPrestadores,
    carregarRelatorioClientes,
    exportarExcel,
    exportarPDF,
    limparDados,
  };
});

export default useAdminRelatoriosStore;
