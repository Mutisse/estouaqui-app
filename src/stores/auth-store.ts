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

  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isAuthenticated = ref(!!token.value);
  const loading = ref(false);
  const initialized = ref(false);

  // Cache para evitar múltiplas requisições
  let loginPromise: Promise<boolean> | null = null;

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

  /**
   * Login do usuário
   * POST /api/login (rota pública)
   */
  async function login(emailOrPhone: string, password: string): Promise<boolean> {
    if (loginPromise) {
      return loginPromise;
    }

    loading.value = true;

    loginPromise = (async () => {
      try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
        const loginData: { email?: string; telefone?: string; password: string } = { password };

        if (isEmail) {
          loginData.email = emailOrPhone;
        } else {
          loginData.telefone = emailOrPhone.replace(/\s/g, '');
        }

        // ✅ Usando o endpoint correto: /login (público)
        const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, loginData, {
          timeout: 15000
        });

        if (response.data.success) {
          user.value = response.data.data.user;
          token.value = response.data.data.token;
          isAuthenticated.value = true;

          localStorage.setItem('auth_token', response.data.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;

          showNotification('positive', 'Login realizado com sucesso!', 'check_circle');
          return true;
        }
        return false;
      } catch (err) {
        const error = err as AxiosError<{ error?: string; message?: string }>;
        if (error.code === 'ECONNABORTED') {
          showNotification('negative', 'Tempo limite excedido. Tente novamente.');
        } else if (error.response) {
          const errorMessage = error.response.data?.error || error.response.data?.message || 'Erro no login';
          showNotification('negative', errorMessage);
        } else if (error.request) {
          showNotification('negative', 'Erro de conexão. Verifique sua internet.');
        } else {
          showNotification('negative', error.message || 'Erro ao fazer login');
        }
        return false;
      } finally {
        loading.value = false;
        loginPromise = null;
      }
    })();

    return loginPromise;
  }

  /**
   * Logout do usuário
   * POST /api/auth/logout (requer autenticação)
   */
  async function logout(): Promise<void> {
    loading.value = true;
    const currentToken = token.value;

    await clearAllData();
    showNotification('positive', 'Logout realizado com sucesso!', 'logout');

    // Tentar fazer logout no backend (não bloqueante)
    if (currentToken) {
      try {
        await api.post(AUTH_ENDPOINTS.LOGOUT, {}, { timeout: 3000 });
      } catch {
        // Ignorar erro no logout
      }
    }
    loading.value = false;
  }

  /**
   * Limpar todos os dados do usuário (logout + cache)
   */
  async function clearAllData(): Promise<void> {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    delete api.defaults.headers.common['Authorization'];

    try {
      const { useClienteStore } = await import('./cliente-store');
      const clienteStore = useClienteStore();
      if (clienteStore.$reset) {
        clienteStore.$reset();
      }
    } catch {
      // Cliente store não existe
    }

    try {
      const { useCacheStore } = await import('./cache-store');
      const cacheStore = useCacheStore();
      cacheStore.clear();
    } catch {
      // Cache store não existe
    }
  }

  /**
   * Verificar token e restaurar perfil do usuário
   * GET /api/auth/verify-token (requer autenticação)
   */
  async function verifyAndRestore(): Promise<boolean> {
    if (!token.value) {
      isAuthenticated.value = false;
      return false;
    }

    loading.value = true;

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      const response = await api.get(AUTH_ENDPOINTS.VERIFY_TOKEN, { timeout: 10000 });

      if (response.data.success) {
        user.value = response.data.data?.user;
        isAuthenticated.value = true;
        return true;
      } else {
        await clearAllData();
        return false;
      }
    } catch {
      await clearAllData();
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Inicializar o store (chamar na criação da app)
   */
  async function initialize(): Promise<void> {
    if (token.value && !initialized.value) {
      await verifyAndRestore();
    }
    initialized.value = true;
  }

  /**
   * Verificar token (alias)
   */
  async function verifyToken(): Promise<boolean> {
    return verifyAndRestore();
  }

  /**
   * Esqueci a senha - enviar link de recuperação
   * POST /api/auth/forgot-password (público)
   */
  async function forgotPassword(email: string): Promise<boolean> {
    loading.value = true;

    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      if (response.data.success) {
        showNotification(
          'positive',
          response.data.message || 'Link de recuperação enviado! Verifique seu email.',
          'mail',
        );
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification(
        'negative',
        error.response?.data?.error || error.message || 'Erro ao solicitar recuperação',
      );
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Redefinir senha com token
   * POST /api/auth/reset-password/{token} (público)
   */
  async function resetPassword(
    resetToken: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    loading.value = true;

    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD(resetToken), {
        email,
        password,
        confirm_password: password,
      });
      if (response.data.success) {
        showNotification(
          'positive',
          response.data.message || 'Senha alterada com sucesso! Faça login.',
          'lock',
        );
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification(
        'negative',
        error.response?.data?.error || error.message || 'Erro ao redefinir senha',
      );
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Verificar disponibilidade de email
   * GET /api/check-email?email=xxx (público)
   */
  async function checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(AUTH_ENDPOINTS.CHECK_EMAIL(email));
      return response.data.available;
    } catch {
      return false;
    }
  }

  /**
   * Verificar disponibilidade de telefone
   * GET /api/check-phone?phone=xxx (público)
   */
  async function checkPhoneAvailability(phone: string): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(AUTH_ENDPOINTS.CHECK_PHONE(phone));
      return response.data.available;
    } catch {
      return false;
    }
  }

  /**
   * Verificar email com token
   * GET /api/auth/verify-email/{token} (público)
   */
  async function verifyEmail(token: string): Promise<boolean> {
    try {
      const response = await api.get(AUTH_ENDPOINTS.VERIFY_EMAIL(token));
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Email verificado com sucesso!');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao verificar email');
      return false;
    }
  }

  /**
   * Reenviar verificação de email
   * GET /api/auth/resend-verification?email=xxx (público)
   */
  async function resendVerification(email: string): Promise<boolean> {
    try {
      const response = await api.get(AUTH_ENDPOINTS.RESEND_VERIFICATION(email));
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Email de verificação reenviado!');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao reenviar verificação');
      return false;
    }
  }

  /**
   * Mostrar notificação
   */
  function showNotification(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    icon?: string,
  ) {
    const options: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };
    if (icon) options.icon = icon;
    $q.notify(options);
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    initialized,

    // Getters
    isCliente,
    isPrestador,
    isAdmin,
    userNome,
    userFoto,
    userEmail,
    userTelefone,

    // Actions
    login,
    logout,
    verifyToken,
    initialize,
    verifyAndRestore,
    forgotPassword,
    resetPassword,
    checkEmailAvailability,
    checkPhoneAvailability,
    verifyEmail,
    resendVerification,
    clearAllData,
  };
});
