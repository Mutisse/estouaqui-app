// src/stores/prestador/prestador-relatorio-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

export interface RelatorioFinanceiroData {
  total_ganhos: number;
  total_servicos: number;
  total_clientes: number;
  avaliacao_media: number;
  ganhos_hoje: number;
  ganhos_semana: number;
  ganhos_mes: number;
  ganhos_ano: number;
  variacao_mes: number;
  variacao_ano: number;
  ganhos_por_mes: Array<{ mes: string; ano: number; total: number }>;
  servicos_por_categoria: Array<{ categoria: string; total: number; cor: string }>;
  status_servicos: Array<{ status: string; total: number; cor: string }>;
  top_servicos: Array<{ nome: string; quantidade: number; receita: number }>;
  projecao_mes_atual: number;
  projecao_mes_seguinte: number;
}

export interface FiltrosRelatorio {
  periodo: 'semana' | 'mes' | 'ano' | 'personalizado';
  data_inicio: string | null;
  data_fim: string | null;
}

type PeriodoType = 'semana' | 'mes' | 'ano' | 'personalizado';

export const usePrestadorRelatorioStore = defineStore('prestadorRelatorio', () => {
  const dados = ref<RelatorioFinanceiroData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filtros = ref<FiltrosRelatorio>({
    periodo: 'mes',
    data_inicio: null,
    data_fim: null,
  });

  const fetchRelatorio = async (periodo?: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const params: Record<string, string> = {};
      if (periodo) {
        params.periodo = periodo;
      } else if (
        filtros.value.periodo === 'personalizado' &&
        filtros.value.data_inicio &&
        filtros.value.data_fim
      ) {
        params.data_inicio = filtros.value.data_inicio;
        params.data_fim = filtros.value.data_fim;
      } else {
        params.periodo = filtros.value.periodo;
      }

      const response = await api.get('/prestador/relatorio-financeiro', { params });

      if (response.data?.success && response.data.data) {
        dados.value = response.data.data;
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar relatório:', err);
      error.value = axiosError.message || 'Erro ao carregar relatório';
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ CORRIGIDO: Sem any e sem redundância
  const setFiltroPeriodo = (value: PeriodoType): void => {
    filtros.value.periodo = value;
  };

  const setFiltroData = (key: 'data_inicio' | 'data_fim', value: string | null): void => {
    filtros.value[key] = value;
  };

  const aplicarFiltros = async (): Promise<void> => {
    await fetchRelatorio();
  };

  const limparFiltros = (): void => {
    filtros.value = {
      periodo: 'mes',
      data_inicio: null,
      data_fim: null,
    };
    void fetchRelatorio();
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const formatarNumero = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ').format(valor);
  };

  return {
    dados,
    isLoading,
    error,
    filtros,
    fetchRelatorio,
    setFiltroPeriodo,
    setFiltroData,
    aplicarFiltros,
    limparFiltros,
    formatarMoeda,
    formatarNumero,
  };
});

export default usePrestadorRelatorioStore;
