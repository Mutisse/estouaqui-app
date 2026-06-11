// src/stores/admin/admin-monitoramento-store.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface SistemaStatus {
  cpu: number;
  memoria: number;
  disco: number;
  uptime: number;
  servicos: ServicoStatus[];
}

export interface ServicoStatus {
  nome: string;
  status: 'online' | 'offline' | 'manutencao';
  tempo_resposta: number;
  ultima_verificacao: string;
}

export interface Alerta {
  id: number;
  nivel: 'critico' | 'aviso' | 'info';
  titulo: string;
  mensagem: string;
  created_at: string;
  lido: boolean;
}

export interface LogMonitor {
  id: number;
  nivel: 'erro' | 'aviso' | 'info' | 'debug';
  mensagem: string;
  contexto: string;
  created_at: string;
}

export interface MetricaHistorica {
  timestamp: string;
  valor: number;
}

export interface MetricasMonitor {
  cpu: MetricaHistorica[];
  memoria: MetricaHistorica[];
  disco: MetricaHistorica[];
  requisicoes: MetricaHistorica[];
  tempo_resposta: MetricaHistorica[];
}

export interface EstatisticasMonitor {
  total_alertas: number;
  alertas_nao_lidos: number;
  tempo_medio_resposta: number;
  disponibilidade: number;
}

// ===================== STORE =====================

export const useAdminMonitoramentoStore = defineStore('adminMonitoramento', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const ultimaAtualizacao = ref<Date | null>(null);

  const systemStatus = ref<SistemaStatus>({
    cpu: 0,
    memoria: 0,
    disco: 0,
    uptime: 0,
    servicos: [],
  });

  const alertas = ref<Alerta[]>([]);
  const logs = ref<LogMonitor[]>([]);
  const metricas = ref<MetricasMonitor>({
    cpu: [],
    memoria: [],
    disco: [],
    requisicoes: [],
    tempo_resposta: [],
  });

  const estatisticas = ref<EstatisticasMonitor>({
    total_alertas: 0,
    alertas_nao_lidos: 0,
    tempo_medio_resposta: 0,
    disponibilidade: 99.9,
  });

  let pollingInterval: NodeJS.Timeout | null = null;

  // ===================== FUNÇÕES AUXILIARES =====================

  const getServiceStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      online: 'green',
      offline: 'red',
      manutencao: 'orange',
    };
    return colors[status] || 'grey';
  };

  const getServiceStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      online: 'check_circle',
      offline: 'cancel',
      manutencao: 'build',
    };
    return icons[status] || 'help';
  };

  const getServiceStatusLabel = (status: string): string => {
    if (status === 'online') return 'Online';
    if (status === 'offline') return 'Offline';
    return 'Manutenção';
  };

  const getLogNivelColor = (nivel: string): string => {
    const colors: Record<string, string> = {
      erro: 'negative',
      aviso: 'warning',
      info: 'info',
      debug: 'purple',
    };
    return colors[nivel] || 'grey';
  };

  const formatarUptime = (horas: number): string => {
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    if (dias > 0) {
      return `${dias}d ${horasRestantes}h`;
    }
    return `${horas}h`;
  };

  // ===================== AÇÕES =====================

  const carregarTodosDados = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const [statusRes, alertasRes, logsRes, metricasRes, estatisticasRes] = await Promise.all([
        api.get('/admin/monitoramento/status'),
        api.get('/admin/monitoramento/alertas'),
        api.get('/admin/monitoramento/logs'),
        api.get('/admin/monitoramento/metricas'),
        api.get('/admin/monitoramento/estatisticas'),
      ]);

      if (statusRes.data?.success) systemStatus.value = statusRes.data.data;
      if (alertasRes.data?.success) alertas.value = alertasRes.data.data;
      if (logsRes.data?.success) logs.value = logsRes.data.data;
      if (metricasRes.data?.success) metricas.value = metricasRes.data.data;
      if (estatisticasRes.data?.success) estatisticas.value = estatisticasRes.data.data;

      ultimaAtualizacao.value = new Date();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar dados';
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarTodosDados();
  };

  const marcarAlertaLido = async (id: number): Promise<boolean> => {
    try {
      const response = await api.put(`/admin/monitoramento/alertas/${id}/ler`);
      if (response.data?.success) {
        const alerta = alertas.value.find(a => a.id === id);
        if (alerta) {
          alerta.lido = true;
          estatisticas.value.alertas_nao_lidos = Math.max(0, estatisticas.value.alertas_nao_lidos - 1);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
      return false;
    }
  };

  const marcarTodosAlertasLidos = async (): Promise<boolean> => {
    try {
      const response = await api.put('/admin/monitoramento/alertas/marcar-todos-lidos');
      if (response.data?.success) {
        alertas.value.forEach(a => a.lido = true);
        estatisticas.value.alertas_nao_lidos = 0;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao marcar todos alertas como lidos:', err);
      return false;
    }
  };

  const limparLogs = async (): Promise<boolean> => {
    try {
      const response = await api.delete('/admin/monitoramento/logs/limpar');
      if (response.data?.success) {
        logs.value = [];
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao limpar logs:', err);
      return false;
    }
  };

  const testarServico = async (servico: string): Promise<void> => {
    try {
      const response = await api.get(`/admin/monitoramento/testar/${servico}`);
      if (response.data?.success) {
        const servicoIndex = systemStatus.value.servicos.findIndex(s => s.nome === servico);
        if (servicoIndex !== -1) {
          systemStatus.value.servicos[servicoIndex] = response.data.data;
        }
      }
    } catch (err) {
      console.error('Erro ao testar serviço:', err);
    }
  };

  const iniciarPolling = (intervaloMs: number = 30000): void => {
    if (pollingInterval) clearInterval(pollingInterval);

    pollingInterval = setInterval(() => {
      void carregarTodosDados();
    }, intervaloMs);
  };

  const pararPolling = (): void => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const limparStore = (): void => {
    systemStatus.value = {
      cpu: 0,
      memoria: 0,
      disco: 0,
      uptime: 0,
      servicos: [],
    };
    alertas.value = [];
    logs.value = [];
    metricas.value = {
      cpu: [],
      memoria: [],
      disco: [],
      requisicoes: [],
      tempo_resposta: [],
    };
    estatisticas.value = {
      total_alertas: 0,
      alertas_nao_lidos: 0,
      tempo_medio_resposta: 0,
      disponibilidade: 99.9,
    };
    ultimaAtualizacao.value = null;
    error.value = null;
    pararPolling();
  };

  return {
    isLoading,
    error,
    ultimaAtualizacao,
    systemStatus,
    alertas,
    logs,
    metricas,
    estatisticas,
    carregarTodosDados,
    recarregarDados,
    marcarAlertaLido,
    marcarTodosAlertasLidos,
    limparLogs,
    testarServico,
    iniciarPolling,
    pararPolling,
    limparStore,
    getServiceStatusColor,
    getServiceStatusIcon,
    getServiceStatusLabel,
    getLogNivelColor,
    formatarUptime,
  };
});

export default useAdminMonitoramentoStore;
