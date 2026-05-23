// src/stores/cliente/cliente-perfil-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from '../auth-store';
import { useClienteCacheStore, CLIENTE_CACHE_TTL } from './cliente-cache-store';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';

export interface EnderecoData {
  id: number;
  endereco: string;
  cidade: string;
  bairro: string;
  complemento?: string;
  lat?: number;
  lng?: number;
  principal: boolean;
}

export interface PreferencesData {
  theme: string;
  language: string;
  notifications: boolean;
}

export const useClientePerfilStore = defineStore('clientePerfil', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const cacheStore = useClienteCacheStore();

  const loading = ref(false);
  const usuarioPerfil = ref<Record<string, unknown> | null>(null);
  const enderecos = ref<EnderecoData[]>([]);

  function getCurrentUserId(): number {
    return authStore.user?.id || 0;
  }

  function initializeCache(): void {
    const userId = getCurrentUserId();
    if (userId) {
      cacheStore.setClienteId(userId);
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

  // ==========================================
  // PERFIL
  // ==========================================

  async function fetchProfile(forceRefresh: boolean = false): Promise<Record<string, unknown> | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<Record<string, unknown> | null>(
      'profile',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.GET_PROFILE);
          const profileData = response.data.data as Record<string, unknown>;
          usuarioPerfil.value = profileData;
          return profileData;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function updateProfile(data: { nome?: string; telefone?: string; endereco?: string }): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_PROFILE, data);
      if (response.data.success === true) {
        cacheStore.invalidate('profile');
        await fetchProfile(true);
        showNotification('positive', 'Perfil atualizado!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao atualizar perfil');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateAvatar(file: File): Promise<string | null> {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const response = await api.post(CLIENTE_ENDPOINTS.UPDATE_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      cacheStore.invalidate('profile');
      await fetchProfile(true);
      return response.data.data?.foto || null;
    } catch {
      showNotification('negative', 'Erro ao atualizar foto');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function removeAvatar(): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.REMOVE_AVATAR);
      if (response.data.success === true) {
        cacheStore.invalidate('profile');
        await fetchProfile(true);
        showNotification('positive', 'Foto removida!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao remover foto');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });
      if (response.data.success === true) {
        showNotification('positive', 'Palavra-passe alterada!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao alterar palavra-passe');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // ENDEREÇOS
  // ==========================================

  async function fetchEnderecos(forceRefresh: boolean = false): Promise<EnderecoData[]> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<EnderecoData[]>(
      'enderecos',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.ADDRESSES);
          const result = extractDataFromResponse<EnderecoData[]>(response.data);
          enderecos.value = Array.isArray(result) ? result : [];
          return enderecos.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.LONG,
      forceRefresh
    );
    return data;
  }

  async function criarEndereco(data: Omit<EnderecoData, 'id'>): Promise<EnderecoData | null> {
    loading.value = true;
    try {
      const response = await api.post(CLIENTE_ENDPOINTS.CREATE_ADDRESS, data);
      cacheStore.invalidate('enderecos');
      await fetchEnderecos(true);
      return extractDataFromResponse<EnderecoData>(response.data);
    } catch {
      showNotification('negative', 'Erro ao criar endereço');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deletarEndereco(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.delete(CLIENTE_ENDPOINTS.DELETE_ADDRESS(id.toString()));
      if (response.data.success === true) {
        cacheStore.invalidate('enderecos');
        await fetchEnderecos(true);
        showNotification('positive', 'Endereço removido!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao remover endereço');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // PREFERÊNCIAS
  // ==========================================

  async function fetchPreferences(forceRefresh: boolean = false): Promise<PreferencesData | null> {
    initializeCache();

    const data = await cacheStore.fetchWithCache<PreferencesData | null>(
      'preferences',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PREFERENCES);
          return response.data.data as PreferencesData;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.VERY_LONG,
      forceRefresh
    );
    return data;
  }

  async function updatePreferences(preferences: { theme?: string; language?: string; notifications?: boolean }): Promise<boolean> {
    loading.value = true;
    try {
      const response = await api.put(CLIENTE_ENDPOINTS.UPDATE_PREFERENCES, preferences);
      if (response.data.success === true) {
        cacheStore.invalidate('preferences');
        showNotification('positive', 'Preferências atualizadas!');
        return true;
      }
      return false;
    } catch {
      showNotification('negative', 'Erro ao atualizar preferências');
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    usuarioPerfil,
    enderecos,
    fetchProfile,
    updateProfile,
    updateAvatar,
    removeAvatar,
    changePassword,
    fetchEnderecos,
    criarEndereco,
    deletarEndereco,
    fetchPreferences,
    updatePreferences,
  };
});
