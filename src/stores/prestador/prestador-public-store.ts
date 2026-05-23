// src/stores/prestador/prestador-public-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { usePrestadorCacheStore, PRESTADOR_CACHE_TTL } from './prestador-cache-store';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';

// ==========================================
// TIPOS
// ==========================================

export interface ServicoTipoOptionData {
  value: number;
  label: string;
  icone: string;
  cor: string;
}

export interface RaioOpcaoOptionData {
  label: string;
  value: number;
}

export interface DiaOptionData {
  label: string;
  value: string;
}

export interface DiaSemanaData {
  id: number;
  nome: string;
  nome_curto: string;
  ordem: number;
  ativo: boolean;
}

export interface MesData {
  id: number;
  nome: string;
  nome_curto: string;
  numero: number;
  ativo: boolean;
}

// ==========================================
// TIPOS PARA RESPOSTAS DA API
// ==========================================

interface ServicoTipoRawData {
  value: number;
  label: string;
  icone?: string;
  cor?: string;
}

interface RaioOpcaoRawData {
  label: string;
  value: number;
}

// ==========================================
// STORE
// ==========================================

export const usePrestadorPublicStore = defineStore('prestadorPublic', () => {
  const cacheStore = usePrestadorCacheStore();

  // State
  const loading = ref(false);
  const servicoTiposOptions = ref<ServicoTipoOptionData[]>([]);
  const raioOpcoesOptions = ref<RaioOpcaoOptionData[]>([]);
  const diasOptions = ref<DiaOptionData[]>([]);
  const diasSemana = ref<DiaSemanaData[]>([]);
  const meses = ref<MesData[]>([]);

  // ==========================================
  // AUXILIARES
  // ==========================================

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) return [] as T;
    if (Array.isArray(response)) return response as T;
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (obj.success === true && obj.data !== undefined) {
        return obj.data as T;
      }
      if (obj.data !== undefined) {
        return obj.data as T;
      }
    }
    return [] as T;
  }

  // ==========================================
  // MÉTODOS
  // ==========================================

  async function fetchServicoTiposOptions(
    forceRefresh: boolean = false,
  ): Promise<ServicoTipoOptionData[]> {
    const cacheKey = 'public_servico_tipos_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_SERVICO_TIPOS_OPTIONS);
          const responseData = response.data;

          if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
            const result: ServicoTipoOptionData[] = responseData.data.map(
              (item: ServicoTipoRawData) => ({
                value: item.value,
                label: item.label,
                icone: item.icone || 'category',
                cor: item.cor || 'primary',
              }),
            );
            servicoTiposOptions.value = result;
            return result;
          }
          servicoTiposOptions.value = [];
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchRaioOpcoesOptions(
    forceRefresh: boolean = false,
  ): Promise<RaioOpcaoOptionData[]> {
    const cacheKey = 'public_raio_opcoes_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.PUBLIC_RAIO_OPCOES_OPTIONS);
          const responseData = response.data;
          if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
            const result: RaioOpcaoOptionData[] = responseData.data.map(
              (item: RaioOpcaoRawData) => ({
                label: item.label,
                value: item.value,
              }),
            );
            raioOpcoesOptions.value = result;
            return result;
          }
          raioOpcoesOptions.value = [];
          return [];
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchDiasOptions(forceRefresh: boolean = false): Promise<DiaOptionData[]> {
    const cacheKey = 'aux_dias_options';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_OPTIONS);
          const data = extractDataFromResponse<DiaOptionData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          diasOptions.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchDiasSemana(forceRefresh: boolean = false): Promise<DiaSemanaData[]> {
    const cacheKey = 'aux_dias_semana';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_DIAS_SEMANA);
          const data = extractDataFromResponse<DiaSemanaData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          diasSemana.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  async function fetchMeses(forceRefresh: boolean = false): Promise<MesData[]> {
    const cacheKey = 'aux_meses';

    return cacheStore.fetchWithCache(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.AUX_MESES);
          const data = extractDataFromResponse<MesData[]>(response.data);
          const result = Array.isArray(data) ? data : [];
          meses.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    loading,
    servicoTiposOptions,
    raioOpcoesOptions,
    diasOptions,
    diasSemana,
    meses,
    fetchServicoTiposOptions,
    fetchRaioOpcoesOptions,
    fetchDiasOptions,
    fetchDiasSemana,
    fetchMeses,
  };
});
