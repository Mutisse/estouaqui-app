// src/stores/admin/admin-performance-store.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export type PeriodoPerformance = 'ultima_hora' | 'hoje' | 'ultima_semana' | 'ultimo_mes';

export interface MetricasSistema {
  tempo_resposta: number;
  uso_memoria: number;
  espaco_disco: number;
  requisicoes: number;
  cpu_usage: number;
  uptime: number;
  database_queries: number;
  cache_hit_rate: number;
  erro_rate: number;
  usuarios_online: number;
  servicos_ativos: number;
  pedidos_hoje: number;
  faturamento_hoje: number;
}

export interface HistoricoMetrica {
  timestamp: string;
  valor: number;
}

export interface TopEndpoint {
  endpoint: string;
  metodo: string;
  total: number;
  tempo_medio: number;
}

export interface LogErro {
  id: number;
  nivel: 'error' | 'warning' | 'info';
  mensagem: string;
  arquivo: string;
  linha: number;
  created_at: string;
}

export interface DadosPerformance {
  metricas_atuais: MetricasSistema;
  historico_tempo_resposta: HistoricoMetrica[];
  historico_cpu: HistoricoMetrica[];
  historico_memoria: HistoricoMetrica[];
  historico_requisicoes: HistoricoMetrica[];
  top_endpoints: TopEndpoint[];
  logs_erro: LogErro[];
}

export interface FiltrosPerformance {
  periodo: PeriodoPerformance;
  tipo: string;
}

// ✅ Interface para parâmetros da API
interface ApiParams {
  periodo: PeriodoPerformance;
  tipo?: string;
}

// ✅ Interface para resposta da API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ===================== STORE =====================

export const useAdminPerformanceStore = defineStore('adminPerformance', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const dados = ref<DadosPerformance>({
    metricas_atuais: {
      tempo_resposta: 0,
      uso_memoria: 0,
      espaco_disco: 0,
      requisicoes: 0,
      cpu_usage: 0,
      uptime: 0,
      database_queries: 0,
      cache_hit_rate: 0,
      erro_rate: 0,
      usuarios_online: 0,
      servicos_ativos: 0,
      pedidos_hoje: 0,
      faturamento_hoje: 0,
    },
    historico_tempo_resposta: [],
    historico_cpu: [],
    historico_memoria: [],
    historico_requisicoes: [],
    top_endpoints: [],
    logs_erro: [],
  });

  const filtros = ref<FiltrosPerformance>({
    periodo: 'hoje',
    tipo: '',
  });

  let pollingInterval: NodeJS.Timeout | null = null;

  // ===================== AÇÕES =====================

  const carregarPerformance = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const params: ApiParams = {
        periodo: filtros.value.periodo,
      };
      if (filtros.value.tipo) params.tipo = filtros.value.tipo;

      const response = await api.get<ApiResponse<DadosPerformance>>('/admin/performance', { params });

      if (response.data?.success) {
        dados.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar métricas de performance:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar métricas';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarMetricasRealtime = async (): Promise<MetricasSistema | null> => {
    try {
      const response = await api.get<ApiResponse<MetricasSistema>>('/admin/performance/realtime');
      if (response.data?.success) {
        dados.value.metricas_atuais = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar métricas em tempo real:', err);
      return null;
    }
  };

  const iniciarPolling = (intervaloMs: number = 10000): void => {
    if (pollingInterval) clearInterval(pollingInterval);

    pollingInterval = setInterval(() => {
      void carregarMetricasRealtime();
    }, intervaloMs);
  };

  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // ✅ Função corrigida - sem uso de 'as any'
  const setFiltro = (key: keyof FiltrosPerformance, value: string): void => {
    if (key === 'periodo') {
      filtros.value.periodo = value as PeriodoPerformance;
    } else if (key === 'tipo') {
      filtros.value.tipo = value;
    }
    void carregarPerformance();
  };

  const limparFiltros = (): void => {
    filtros.value = {
      periodo: 'hoje',
      tipo: '',
    };
    void carregarPerformance();
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarPerformance();
  };

  const limparStore = (): void => {
    dados.value = {
      metricas_atuais: {
        tempo_resposta: 0,
        uso_memoria: 0,
        espaco_disco: 0,
        requisicoes: 0,
        cpu_usage: 0,
        uptime: 0,
        database_queries: 0,
        cache_hit_rate: 0,
        erro_rate: 0,
        usuarios_online: 0,
        servicos_ativos: 0,
        pedidos_hoje: 0,
        faturamento_hoje: 0,
      },
      historico_tempo_resposta: [],
      historico_cpu: [],
      historico_memoria: [],
      historico_requisicoes: [],
      top_endpoints: [],
      logs_erro: [],
    };
    filtros.value = {
      periodo: 'hoje',
      tipo: '',
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
    pararPolling();
  };

  return {
    isLoading,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    dados,
    filtros,
    carregarPerformance,
    carregarMetricasRealtime,
    iniciarPolling,
    pararPolling,
    setFiltro,
    limparFiltros,
    recarregarDados,
    limparStore,
  };
});

export default useAdminPerformanceStore;
