// src/stores/auth-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import { AUTH_ENDPOINTS } from 'src/router/Api/auth-endpoints';
import type { AxiosError } from 'axios';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  tipo: 'cliente' | 'prestador' | 'admin';
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const useAuthStore = defineStore('auth', () => {
  const $q = useQuasar();

  // ==========================================
  // STATE
  // ==========================================

  const loadFromStorage = (): boolean => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      isAuthenticated.value = true;

      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      return true;
    }
    return false;
  };

  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const initialized = ref(false);

  loadFromStorage();

  // ==========================================
  // GETTERS
  // ==========================================

  const isCliente = computed(() => user.value?.tipo === 'cliente');
  const isPrestador = computed(() => user.value?.tipo === 'prestador');
  const isAdmin = computed(() => user.value?.tipo === 'admin');
  const userNome = computed(() => user.value?.nome || '');
  const userFoto = computed(() => user.value?.foto);
  const userEmail = computed(() => user.value?.email || '');
  const userTelefone = computed(() => user.value?.telefone || '');

  // ==========================================
  // ACTIONS
  // ==========================================

  async function login(emailOrPhone: string, password: string): Promise<boolean> {
    loading.value = true;

    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const loginData: { email?: string; telefone?: string; password: string } = { password };

      if (isEmail) {
        loginData.email = emailOrPhone;
      } else {
        loginData.telefone = emailOrPhone.replace(/\s/g, '');
      }

      const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, loginData, {
        timeout: 15000
      });

      if (response.data.success) {
        user.value = response.data.data.user;
        token.value = response.data.data.token;
        isAuthenticated.value = true;

        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));

        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;

        showNotification('positive', 'Login realizado com sucesso!', 'check_circle');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro no login';
      showNotification('negative', errorMessage);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    loading.value = true;
    const currentToken = token.value;

    clearLocalData();

    showNotification('positive', 'Logout realizado com sucesso!', 'logout');

    if (currentToken) {
      try {
        await api.post(AUTH_ENDPOINTS.LOGOUT, {}, { timeout: 3000 });
      } catch {
        // Ignorar erro
      }
    }

    loading.value = false;
  }

  function clearLocalData(): void {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];
  }

  function initialize(): void {
    if (initialized.value) return;

    loadFromStorage();
    initialized.value = true;
  }

  function verifyToken(): boolean {
    if (!token.value) {
      return false;
    }
    return true;
  }

  async function forgotPassword(email: string): Promise<boolean> {
    loading.value = true;

    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Link de recuperação enviado!', 'mail');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao solicitar recuperação');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(resetToken: string, email: string, password: string): Promise<boolean> {
    loading.value = true;

    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD(resetToken), {
        email,
        password,
        confirm_password: password,
      });
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Senha alterada com sucesso!', 'lock');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao redefinir senha');
      return false;
    } finally {
      loading.value = false;
    }
  }

  function showNotification(type: 'positive' | 'negative' | 'warning' | 'info', message: string, icon?: string) {
    const options: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };
    if (icon) options.icon = icon;
    $q.notify(options);
  }

  return {
    user,
    token,
    isAuthenticated,
    loading,
    initialized,

    isCliente,
    isPrestador,
    isAdmin,
    userNome,
    userFoto,
    userEmail,
    userTelefone,

    login,
    logout,
    verifyToken,
    initialize,
    forgotPassword,
    resetPassword,
    clearLocalData,
  };
});
