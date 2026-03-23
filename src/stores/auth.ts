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

  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isAuthenticated = ref(!!token.value);

  // Getters
  const isCliente = computed(() => user.value?.tipo === 'cliente');
  const isPrestador = computed(() => user.value?.tipo === 'prestador');
  const isAdmin = computed(() => user.value?.tipo === 'admin');
  const userNome = computed(() => user.value?.nome || '');
  const userFoto = computed(() => user.value?.foto);

  // Actions
  async function login(emailOrPhone: string, password: string): Promise<boolean> {
    try {
      // Determinar se é email ou telefone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const loginData: { email?: string; telefone?: string; password: string } = { password };

      if (isEmail) {
        loginData.email = emailOrPhone;
      } else {
        loginData.telefone = emailOrPhone.replace(/\s/g, '');
      }

      const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, loginData);

      if (response.data.success) {
        user.value = response.data.data.user;
        token.value = response.data.data.token;
        isAuthenticated.value = true;

        // Salvar token no localStorage
        localStorage.setItem('auth_token', response.data.data.token);

        // Configurar header do axios para todas as requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;

        return true;
      }
      return false;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      if (err.response) {
        const errorMessage =
          err.response.data?.error || err.response.data?.message || 'Erro no login';
        showNotification('negative', errorMessage);
      } else if (err.request) {
        showNotification('negative', 'Erro de conexão. Verifique sua internet.');
      } else {
        showNotification('negative', err.message || 'Erro ao fazer login');
      }
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      if (token.value) {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar estado
      user.value = null;
      token.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async function verifyToken(): Promise<boolean> {
    if (!token.value) return false;

    try {
      const response = await api.get(AUTH_ENDPOINTS.VERIFY_TOKEN);
      if (response.data.success) {
        user.value = response.data.data.user;
        isAuthenticated.value = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        return true;
      }
      return false;
    } catch {
      // Token inválido, limpar
      token.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  }

  async function forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Link de recuperação enviado!');
        return true;
      }
      return false;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      showNotification(
        'negative',
        err.response?.data?.error || err.message || 'Erro ao solicitar recuperação',
      );
      return false;
    }
  }

  async function resetPassword(token: string, email: string, password: string): Promise<boolean> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD(token), {
        email,
        password,
        confirm_password: password,
      });
      if (response.data.success) {
        showNotification('positive', response.data.message || 'Senha alterada com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      showNotification(
        'negative',
        err.response?.data?.error || err.message || 'Erro ao redefinir senha',
      );
      return false;
    }
  }

  async function checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(AUTH_ENDPOINTS.CHECK_EMAIL(email));
      return response.data.available;
    } catch {
      return false;
    }
  }

  async function checkPhoneAvailability(phone: string): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(AUTH_ENDPOINTS.CHECK_PHONE(phone));
      return response.data.available;
    } catch {
      return false;
    }
  }

  function showNotification(
    type: 'positive' | 'negative' | 'warning',
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

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Getters
    isCliente,
    isPrestador,
    isAdmin,
    userNome,
    userFoto,

    // Actions
    login,
    logout,
    verifyToken,
    forgotPassword,
    resetPassword,
    checkEmailAvailability,
    checkPhoneAvailability,
  };
});
