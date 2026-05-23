// src/stores/admin/admin-utilizadores-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { ADMIN_ENDPOINTS } from 'src/router/Api/admin-endpoints';
import { useAuthStore } from '../auth-store';
import { useAdminCacheStore, ADMIN_CACHE_TTL } from './admin-cache-store';
import type { AxiosError } from 'axios';

// ==========================================
// INTERFACES
// ==========================================

export interface UserData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  avatar?: string;
  data?: string;
  created_at?: string;
  blocked_at?: string | null;
  verificado?: boolean;
  ativo?: boolean;
  media_avaliacao?: number;
  total_avaliacoes?: number;
}

export interface PrestadorCategoria {
  id: number;
  nome: string;
  icone?: string;
}

export interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  verificado: boolean;
  media_avaliacao: number;
  total_avaliacoes: number;
  categorias?: PrestadorCategoria[];
  ativo?: boolean;
  blocked_at?: string | null;
  created_at?: string;
  avatar?: string;
}

// Interface para resposta paginada
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
}

// Interface para dados brutos da API
interface RawPrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  verificado: boolean;
  media_avaliacao: number;
  total_avaliacoes: number;
  categorias?: PrestadorCategoria[];
  ativo?: boolean;
  blocked_at?: string | null;
  created_at?: string;
}

// ==========================================
// STORE
// ==========================================

export const useAdminUtilizadoresStore = defineStore('adminUtilizadores', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useAdminCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const ultimosUtilizadores = ref<UserData[]>([]);
  const utilizadores = ref<UserData[]>([]);
  const utilizadorDetalhes = ref<UserData | null>(null);
  const prestadores = ref<PrestadorData[]>([]);
  const prestadoresPendentes = ref<PrestadorData[]>([]);

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  function getCurrentAdminId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const adminId = getCurrentAdminId();
    if (adminId) {
      cacheStore.setAdminId(adminId);
    }
  }

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

  function showError(error: unknown): void {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 });
  }

  function gerarAvatarUrl(nome: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=56`;
  }

  // ==========================================
  // UTILIZADORES
  // ==========================================

  async function fetchUltimosUtilizadores(
    limit: number = 5,
    forceRefresh: boolean = false,
  ): Promise<UserData[]> {
    initializeCache();
    const cacheKey = `ultimos_utilizadores_${limit}`;

    const data = await cacheStore.fetchWithCache<UserData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.USERS, { params: { per_page: limit } });
          const result = extractDataFromResponse<{ data: UserData[] }>(response.data);
          ultimosUtilizadores.value = result.data || [];
          return ultimosUtilizadores.value;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function fetchUtilizadores(
    params?: {
      tipo?: string;
      status?: string;
      busca?: string;
      per_page?: number;
    },
    forceRefresh: boolean = false,
  ): Promise<PaginatedResponse<UserData> | null> {
    initializeCache();
    const cacheKey = `utilizadores_${JSON.stringify(params)}`;

    const data = await cacheStore.fetchWithCache<PaginatedResponse<UserData> | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.USERS, { params });
          const result = response.data.data as PaginatedResponse<UserData>;
          utilizadores.value = result.data || [];
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchUtilizadorDetalhes(
    id: number,
    forceRefresh: boolean = false,
  ): Promise<UserData | null> {
    initializeCache();
    const cacheKey = `utilizador_${id}`;

    const data = await cacheStore.fetchWithCache<UserData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.USER_DETAILS(id));
          const result = extractDataFromResponse<UserData>(response.data);
          utilizadorDetalhes.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.LONG,
      forceRefresh,
    );
    return data;
  }

  async function updateUtilizador(id: number, data: Partial<UserData>): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.UPDATE_USER(id), data);
      if (response.data.success) {
        cacheStore.invalidatePattern('utilizadores');
        cacheStore.invalidate(`utilizador_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function blockUtilizador(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.BLOCK_USER(id));
      if (response.data.success) {
        cacheStore.invalidatePattern('utilizadores');
        cacheStore.invalidate(`utilizador_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function unblockUtilizador(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(ADMIN_ENDPOINTS.UNBLOCK_USER(id));
      if (response.data.success) {
        cacheStore.invalidatePattern('utilizadores');
        cacheStore.invalidate(`utilizador_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUtilizador(id: number, force: boolean = false): Promise<boolean> {
    loading.value = true;
    try {
      const url = force ? ADMIN_ENDPOINTS.FORCE_DELETE_USER(id) : ADMIN_ENDPOINTS.DELETE_USER(id);
      const response = await api.delete(url);
      if (response.data.success) {
        cacheStore.invalidatePattern('utilizadores');
        cacheStore.invalidate(`utilizador_${id}`);
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PRESTADORES
  // ==========================================

  async function fetchPrestadores(
    params?: {
      busca?: string;
      verificado?: boolean;
      categoria?: number;
      avaliacao_min?: number;
      per_page?: number;
    },
    forceRefresh: boolean = false,
  ): Promise<PaginatedResponse<PrestadorData> | null> {
    initializeCache();
    const cacheKey = `prestadores_${JSON.stringify(params)}`;

    const data = await cacheStore.fetchWithCache<PaginatedResponse<PrestadorData> | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES, { params });
          const result = extractDataFromResponse<PaginatedResponse<RawPrestadorData>>(
            response.data,
          );

          const prestadoresData: PrestadorData[] = (result.data || []).map(
            (prestador: RawPrestadorData) => {
              const prestadorMap: PrestadorData = {
                id: prestador.id,
                nome: prestador.nome,
                email: prestador.email,
                telefone: prestador.telefone,
                verificado: prestador.verificado,
                media_avaliacao: prestador.media_avaliacao,
                total_avaliacoes: prestador.total_avaliacoes,
              };

              if (prestador.categorias && prestador.categorias.length > 0) {
                prestadorMap.categorias = prestador.categorias;
              }
              if (prestador.ativo !== undefined) {
                prestadorMap.ativo = prestador.ativo;
              }
              if (prestador.blocked_at !== undefined) {
                prestadorMap.blocked_at = prestador.blocked_at;
              }
              if (prestador.created_at) {
                prestadorMap.created_at = prestador.created_at;
              }

              prestadorMap.avatar = gerarAvatarUrl(prestador.nome);

              return prestadorMap;
            },
          );

          prestadores.value = prestadoresData;

          return {
            data: prestadoresData,
            total: result.total,
            last_page: result.last_page,
            current_page: result.current_page,
            per_page: result.per_page,
          };
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchPrestadoresPendentes(
    forceRefresh: boolean = false,
  ): Promise<PaginatedResponse<PrestadorData> | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PaginatedResponse<PrestadorData> | null>(
      'prestadores_pendentes',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(ADMIN_ENDPOINTS.PRESTADORES_PENDENTES);
          const result = extractDataFromResponse<PaginatedResponse<RawPrestadorData>>(
            response.data,
          );

          const prestadoresData: PrestadorData[] = (result.data || []).map(
            (prestador: RawPrestadorData) => {
              const prestadorMap: PrestadorData = {
                id: prestador.id,
                nome: prestador.nome,
                email: prestador.email,
                telefone: prestador.telefone,
                verificado: prestador.verificado,
                media_avaliacao: prestador.media_avaliacao,
                total_avaliacoes: prestador.total_avaliacoes,
              };

              if (prestador.categorias && prestador.categorias.length > 0) {
                prestadorMap.categorias = prestador.categorias;
              }
              if (prestador.ativo !== undefined) {
                prestadorMap.ativo = prestador.ativo;
              }
              if (prestador.blocked_at !== undefined) {
                prestadorMap.blocked_at = prestador.blocked_at;
              }
              if (prestador.created_at) {
                prestadorMap.created_at = prestador.created_at;
              }

              prestadorMap.avatar = gerarAvatarUrl(prestador.nome);

              return prestadorMap;
            },
          );

          prestadoresPendentes.value = prestadoresData;

          return {
            data: prestadoresData,
            total: result.total,
            last_page: result.last_page,
            current_page: result.current_page,
            per_page: result.per_page,
          };
        } finally {
          loading.value = false;
        }
      },
      ADMIN_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function aprovarPrestador(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.APROVAR_PRESTADOR(id));
      if (response.data.success) {
        cacheStore.invalidatePattern('prestadores');
        cacheStore.invalidatePattern('prestadores_pendentes');
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function reprovarPrestador(id: number, motivo?: string): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(ADMIN_ENDPOINTS.REPROVAR_PRESTADOR(id), { motivo });
      if (response.data.success) {
        cacheStore.invalidatePattern('prestadores');
        cacheStore.invalidatePattern('prestadores_pendentes');
        return true;
      }
      return false;
    } catch {
      showError({} as Error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    ultimosUtilizadores,
    utilizadores,
    utilizadorDetalhes,
    prestadores,
    prestadoresPendentes,

    // Actions - Utilizadores
    fetchUltimosUtilizadores,
    fetchUtilizadores,
    fetchUtilizadorDetalhes,
    updateUtilizador,
    blockUtilizador,
    unblockUtilizador,
    deleteUtilizador,

    // Actions - Prestadores
    fetchPrestadores,
    fetchPrestadoresPendentes,
    aprovarPrestador,
    reprovarPrestador,

    // Utilitários
    showError,
  };
});
