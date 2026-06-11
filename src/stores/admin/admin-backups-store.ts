// src/stores/admin/admin-backups-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export type TipoBackup = 'manual' | 'agendado' | 'auto';
export type StatusBackup = 'completado' | 'falhou' | 'em_andamento';
export type FrequenciaBackup = 'diario' | 'semanal' | 'mensal';
export type DestinoBackup = 'local' | 's3' | 'dropbox' | 'google_drive';

export interface DestinoConfig {
  bucket?: string;
  region?: string;
  access_key?: string;
  secret_key?: string;
  folder?: string;
  access_token?: string;
  client_id?: string;
  client_secret?: string;
  folder_id?: string;
}

export interface Backup {
  id: number;
  nome: string;
  tamanho: number;
  tamanho_formatado: string;
  tipo: TipoBackup;
  status: StatusBackup;
  data: string;
  created_at: string;
  download_url: string;
}

export interface ConfiguracaoBackup {
  ativo: boolean;
  frequencia: FrequenciaBackup;
  horario: string;
  dia_semana?: number;
  dia_mes?: number;
  manter_ultimos: number;
  incluir_database: boolean;
  incluir_uploads: boolean;
  incluir_logs: boolean;
  destino: DestinoBackup;
  destino_config?: DestinoConfig;
}

export interface EstatisticasBackup {
  total: number;
  total_tamanho: number;
  ultimo_backup: string | null;
  ultimo_status: string | null;
  media_diaria: number;
}

export interface FiltrosBackups {
  search: string;
  tipo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  page: number;
  perPage: number;
}

export interface PaginacaoData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Interfaces para API
interface ApiParams {
  page: number;
  per_page: number;
  search?: string;
  tipo?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  message?: string;
}

// Opções para selects (exportadas para uso no componente)
export const opcoesFrequencia = [
  { label: 'Diário', value: 'diario' as const },
  { label: 'Semanal', value: 'semanal' as const },
  { label: 'Mensal', value: 'mensal' as const },
];

export const opcoesDestino = [
  { label: 'Local', value: 'local' as const },
  { label: 'Amazon S3', value: 's3' as const },
  { label: 'Dropbox', value: 'dropbox' as const },
  { label: 'Google Drive', value: 'google_drive' as const },
];

export const opcoesDiasSemana = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terça-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sábado', value: 6 },
];

// ===================== STORE =====================

export const useAdminBackupsStore = defineStore('adminBackups', () => {
  const authStore = useAuthStore();

  // Estados
  const isLoading = ref(false);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const backups = ref<Backup[]>([]);
  const configuracoes = ref<ConfiguracaoBackup>({
    ativo: true,
    frequencia: 'diario',
    horario: '02:00',
    dia_semana: 1,
    dia_mes: 1,
    manter_ultimos: 30,
    incluir_database: true,
    incluir_uploads: true,
    incluir_logs: true,
    destino: 'local',
  });

  const estatisticas = ref<EstatisticasBackup>({
    total: 0,
    total_tamanho: 0,
    ultimo_backup: null,
    ultimo_status: null,
    media_diaria: 0,
  });

  const paginacao = ref<PaginacaoData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const filtros = ref<FiltrosBackups>({
    search: '',
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    perPage: 15,
  });

  // Getters
  const totalBackups = computed(() => paginacao.value.total);
  const temBackups = computed(() => backups.value.length > 0);
  const temProximaPagina = computed(() => paginacao.value.current_page < paginacao.value.last_page);
  const temPaginaAnterior = computed(() => paginacao.value.current_page > 1);
  const totalTamanhoFormatado = computed(() => formatarTamanho(estatisticas.value.total_tamanho));

  // Funções auxiliares
  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ===================== AÇÕES =====================

  const carregarBackups = async (resetPage = true): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      if (resetPage) {
        filtros.value.page = 1;
      }

      const params: ApiParams = {
        page: filtros.value.page,
        per_page: filtros.value.perPage,
      };

      if (filtros.value.search) params.search = filtros.value.search;
      if (filtros.value.tipo) params.tipo = filtros.value.tipo;
      if (filtros.value.status) params.status = filtros.value.status;
      if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio;
      if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim;

      const response = await api.get<ApiResponse<Backup[]>>('/admin/backups', { params });

      if (response.data?.success) {
        backups.value = response.data.data;
        paginacao.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar backups:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar backups';
    } finally {
      isLoading.value = false;
    }
  };

  const carregarEstatisticas = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<EstatisticasBackup>>('/admin/backups/estatisticas');
      if (response.data?.success) {
        estatisticas.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const carregarConfiguracoes = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<ConfiguracaoBackup>>('/admin/backups/configuracoes');
      if (response.data?.success) {
        configuracoes.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  };

  const criarBackup = async (tipo: TipoBackup = 'manual'): Promise<Backup | null> => {
    isProcessing.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<Backup>>('/admin/backups', { tipo });
      if (response.data?.success) {
        await carregarBackups(true);
        await carregarEstatisticas();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar backup:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar backup';
      return null;
    } finally {
      isProcessing.value = false;
    }
  };

  const downloadBackup = async (backup: Backup): Promise<void> => {
    try {
      const response = await api.get(`/admin/backups/${backup.id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.nome);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar backup:', err);
      error.value = (err as AxiosError).message || 'Erro ao baixar backup';
      throw err;
    }
  };

  const excluirBackup = async (id: number): Promise<boolean> => {
    isProcessing.value = true;
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/backups/${id}`);
      if (response.data?.success) {
        await carregarBackups(true);
        await carregarEstatisticas();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir backup:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir backup';
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const salvarConfiguracoes = async (): Promise<boolean> => {
    isProcessing.value = true;
    try {
      const response = await api.put<ApiResponse<null>>('/admin/backups/configuracoes', configuracoes.value);
      if (response.data?.success) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      error.value = (err as AxiosError).message || 'Erro ao salvar configurações';
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const restaurarBackup = async (id: number): Promise<boolean> => {
    isProcessing.value = true;
    try {
      const response = await api.post<ApiResponse<null>>(`/admin/backups/${id}/restaurar`);
      if (response.data?.success) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao restaurar backup:', err);
      error.value = (err as AxiosError).message || 'Erro ao restaurar backup';
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosBackups, value: string | number): void => {
    if (key === 'search') filtros.value.search = value as string;
    else if (key === 'tipo') filtros.value.tipo = value as string;
    else if (key === 'status') filtros.value.status = value as string;
    else if (key === 'data_inicio') filtros.value.data_inicio = value as string;
    else if (key === 'data_fim') filtros.value.data_fim = value as string;
    else if (key === 'page') filtros.value.page = value as number;
    else if (key === 'perPage') filtros.value.perPage = value as number;

    if (key !== 'page') {
      filtros.value.page = 1;
    }
    void carregarBackups(false);
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    void carregarBackups(true);
  };

  const mudarPagina = (page: number): void => {
    if (page < 1 || page > paginacao.value.last_page) return;
    filtros.value.page = page;
    void carregarBackups(false);
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarBackups(true),
      carregarEstatisticas(),
      carregarConfiguracoes(),
    ]);
  };

  const limparStore = (): void => {
    backups.value = [];
    estatisticas.value = {
      total: 0,
      total_tamanho: 0,
      ultimo_backup: null,
      ultimo_status: null,
      media_diaria: 0,
    };
    paginacao.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
    filtros.value = {
      search: '',
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      perPage: 15,
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isProcessing,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    backups,
    configuracoes,
    estatisticas,
    paginacao,
    filtros,

    // Opções para selects
    opcoesFrequencia,
    opcoesDestino,
    opcoesDiasSemana,

    // Getters
    totalBackups,
    temBackups,
    temProximaPagina,
    temPaginaAnterior,
    totalTamanhoFormatado,
    formatarTamanho,

    // Actions
    carregarBackups,
    carregarEstatisticas,
    carregarConfiguracoes,
    criarBackup,
    downloadBackup,
    excluirBackup,
    salvarConfiguracoes,
    restaurarBackup,
    setFiltro,
    limparFiltros,
    mudarPagina,
    recarregarDados,
    limparStore,
  };
});

export default useAdminBackupsStore;
