// src/stores/prestador/prestador-perfil-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { usePrestadorCacheStore, PRESTADOR_CACHE_TTL } from './prestador-cache-store';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';

// ==========================================
// TIPOS
// ==========================================

export interface PrestadorPerfilData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string | null;
  foto: string | null;
  tipo: string;
  sobre: string | null;
  profissao: string | null;
  media_avaliacao: number;
  total_avaliacoes: number;
  verificado: boolean;
  ativo: boolean;
  preferences: Record<string, unknown> | null;
  portfolio: string[];
  created_at: string;
}

export interface CategoriaPrestadorData {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  slug?: string;
}

export interface DisponibilidadeConfig {
  tempo_minimo_agendamento: number;
  tempo_entre_servicos: number;
  notificar_antes: number;
  aceitar_agendamento_automatico: boolean;
  dias_antecedencia: number;
}

export interface DisponibilidadeData {
  id: number;
  prestador_id: number;
  configuracoes: DisponibilidadeConfig;
  horarios_padrao: Record<string, string[]>;
  intervalos_padrao: Array<{
    dias: string[];
    inicio: string;
    fim: string;
    descricao: string;
  }>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntervaloData {
  id: number;
  prestador_id: number;
  dias: string[];
  inicio: string;
  fim: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STORE
// ==========================================

export const usePrestadorPerfilStore = defineStore('prestadorPerfil', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = usePrestadorCacheStore();

  // STATE
  const loading = ref(false);
  const perfilCompleto = ref<PrestadorPerfilData | null>(null);
  const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
  const disponibilidade = ref<DisponibilidadeData | null>(null);
  const intervalos = ref<IntervaloData[]>([]);

  // ==========================================
  // AUXILIARES
  // ==========================================

  function getCurrentUserId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const userId = getCurrentUserId();
    if (userId) {
      cacheStore.setPrestadorId(userId);
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

  function showNotification(type: 'positive' | 'negative' | 'warning' | 'info', message: string): void {
    $q.notify({ type, message, position: 'top', timeout: 3000 });
  }

  function showError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Erro ao processar requisição';
    showNotification('negative', message);
  }

  // ==========================================
  // PERFIL
  // ==========================================

  async function fetchPerfilCompleto(forceRefresh: boolean = false): Promise<PrestadorPerfilData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PrestadorPerfilData | null>(
      'perfil_completo',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.GET_PROFILE);
          if (response.data?.success && response.data.data) {
            const userData = response.data.data;
            const portfolioUrls = userData.portfolio || userData.preferences?.portfolio || [];

            const perfil: PrestadorPerfilData = {
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              telefone: userData.telefone,
              endereco: userData.endereco || null,
              foto: userData.foto || null,
              tipo: userData.tipo,
              sobre: userData.sobre || null,
              profissao: userData.profissao || null,
              media_avaliacao: userData.media_avaliacao || 0,
              total_avaliacoes: userData.total_avaliacoes || 0,
              verificado: userData.verificado || false,
              ativo: userData.ativo || true,
              preferences: userData.preferences || null,
              portfolio: portfolioUrls,
              created_at: userData.created_at,
            };

            perfilCompleto.value = perfil;
            return perfil;
          }
          return null;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh
    );

    return data;
  }

  // ✅ MÉTODO: Atualizar foto de perfil
  async function updateAvatar(file: File): Promise<string | null> {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const response = await api.post(PRESTADOR_ENDPOINTS.UPDATE_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success && response.data.data?.foto) {
        cacheStore.invalidatePattern('perfil_completo');
        await fetchPerfilCompleto(true);
        showNotification('positive', 'Foto atualizada!');
        return response.data.data.foto;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      showNotification('negative', 'Erro ao atualizar foto');
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ✅ MÉTODO: Atualizar perfil
  async function updateProfile(data: { nome?: string; telefone?: string; endereco?: string }): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.UPDATE_PROFILE, data);
      if (response.data.success === true) {
        cacheStore.invalidatePattern('perfil_completo');
        await fetchPerfilCompleto(true);
        showNotification('positive', 'Perfil atualizado!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showNotification('negative', 'Erro ao atualizar perfil');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // CATEGORIAS DO PRESTADOR
  // ==========================================

  async function fetchMinhasCategorias(forceRefresh: boolean = false): Promise<CategoriaPrestadorData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<CategoriaPrestadorData[]>(
      'minhas_categorias',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.MINHAS_CATEGORIAS);
          const result = extractDataFromResponse<CategoriaPrestadorData[]>(response.data);
          minhasCategorias.value = Array.isArray(result) ? result : [];
          return minhasCategorias.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.LONG,
      forceRefresh
    );

    return data;
  }

  async function addCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.post(PRESTADOR_ENDPOINTS.ADICIONAR_CATEGORIA(categoriaId.toString()));
      if (response.data.success) {
        cacheStore.invalidatePattern('minhas_categorias');
        await fetchMinhasCategorias(true);
        showNotification('positive', 'Categoria adicionada!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao adicionar categoria');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeCategoria(categoriaId: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.REMOVER_CATEGORIA(categoriaId.toString()));
      if (response.data.success) {
        minhasCategorias.value = minhasCategorias.value.filter(c => c.id !== categoriaId);
        cacheStore.invalidatePattern('minhas_categorias');
        showNotification('positive', 'Categoria removida!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao remover categoria');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // DISPONIBILIDADE
  // ==========================================

  async function fetchDisponibilidade(forceRefresh: boolean = false): Promise<DisponibilidadeData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<DisponibilidadeData | null>(
      'disponibilidade',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.DISPONIBILIDADE);
          disponibilidade.value = extractDataFromResponse<DisponibilidadeData>(response.data);
          return disponibilidade.value;
        } catch {
          disponibilidade.value = null;
          return null;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh
    );

    return data;
  }

  async function updateDisponibilidade(data: Partial<DisponibilidadeData>): Promise<DisponibilidadeData | null> {
    loading.value = true;
    try {
      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_DISPONIBILIDADE, data);
      if (response.data.success) {
        disponibilidade.value = extractDataFromResponse<DisponibilidadeData>(response.data);
        cacheStore.invalidatePattern('disponibilidade');
        showNotification('positive', 'Configurações atualizadas!');
        return disponibilidade.value;
      }
      return null;
    } catch {
      showNotification('negative', 'Erro ao atualizar disponibilidade');
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // INTERVALOS
  // ==========================================

  async function fetchIntervalos(forceRefresh: boolean = false): Promise<IntervaloData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<IntervaloData[]>(
      'intervalos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(PRESTADOR_ENDPOINTS.INTERVALOS);
          const result = extractDataFromResponse<IntervaloData[]>(response.data);
          intervalos.value = Array.isArray(result) ? result : [];
          return intervalos.value;
        } finally {
          loading.value = false;
        }
      },
      PRESTADOR_CACHE_TTL.MEDIUM,
      forceRefresh
    );

    return data;
  }

  async function criarIntervalo(data: { dias: string[]; inicio: string; fim: string; descricao?: string }): Promise<IntervaloData | null> {
    loading.value = true;
    try {
      const payload: { dias: string[]; inicio: string; fim: string; descricao?: string } = {
        dias: data.dias,
        inicio: data.inicio,
        fim: data.fim,
      };

      if (data.descricao && data.descricao.trim() !== '') {
        payload.descricao = data.descricao.trim();
      }

      const response = await api.post(PRESTADOR_ENDPOINTS.CRIAR_INTERVALO, payload);
      if (response.data.success) {
        const novo = extractDataFromResponse<IntervaloData>(response.data);
        intervalos.value.push(novo);
        cacheStore.invalidatePattern('intervalos');
        showNotification('positive', 'Intervalo criado!');
        return novo;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function atualizarIntervalo(id: number, data: { dias: string[]; inicio: string; fim: string; descricao?: string }): Promise<IntervaloData | null> {
    loading.value = true;
    try {
      const payload: { dias: string[]; inicio: string; fim: string; descricao?: string } = {
        dias: data.dias,
        inicio: data.inicio,
        fim: data.fim,
      };

      if (data.descricao && data.descricao.trim() !== '') {
        payload.descricao = data.descricao.trim();
      }

      const response = await api.put(PRESTADOR_ENDPOINTS.ATUALIZAR_INTERVALO(id.toString()), payload);
      if (response.data.success) {
        const atualizado = extractDataFromResponse<IntervaloData>(response.data);
        const index = intervalos.value.findIndex(i => i.id === id);
        if (index !== -1) {
          intervalos.value[index] = atualizado;
        }
        cacheStore.invalidatePattern('intervalos');
        showNotification('positive', 'Intervalo atualizado!');
        return atualizado;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deletarIntervalo(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(PRESTADOR_ENDPOINTS.DELETAR_INTERVALO(id.toString()));
      if (response.data.success) {
        intervalos.value = intervalos.value.filter(i => i.id !== id);
        cacheStore.invalidatePattern('intervalos');
        showNotification('positive', 'Intervalo removido!');
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
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
    perfilCompleto,
    minhasCategorias,
    disponibilidade,
    intervalos,

    // Actions - Perfil
    fetchPerfilCompleto,
    updateAvatar,
    updateProfile,

    // Actions - Categorias
    fetchMinhasCategorias,
    addCategoria,
    removeCategoria,

    // Actions - Disponibilidade
    fetchDisponibilidade,
    updateDisponibilidade,

    // Actions - Intervalos
    fetchIntervalos,
    criarIntervalo,
    atualizarIntervalo,
    deletarIntervalo,
  };
});
