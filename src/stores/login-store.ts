// src/stores/auth-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError, AxiosResponse } from 'axios';

// ===================== INTERFACES =====================

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  tipo: 'root' | 'admin' | 'cliente' | 'prestador';
  status?: 'ativo' | 'desativado' | 'bloqueado' | 'pendente' | 'reprovado';
  verificado?: boolean;
  disponivel?: boolean;
  profissao?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  sobre?: string;
  created_at?: string;
  updated_at?: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  aviso?: string;
}

// ===================== ENDPOINTS =====================

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
  VERIFY: '/auth/verify',
  USER: '/auth/user',
  UPDATE_PROFILE: '/auth/user',
  UPLOAD_FOTO: '/upload/foto',
};

// ===================== STORE =====================

export const useAuthStore = defineStore('auth', () => {
  const $q = useQuasar();

  // ===================== STATE =====================

  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const initialized = ref(false);
  const loginAviso = ref<string | null>(null);

  // ===================== PRIVATE FUNCTIONS =====================

  const loadFromStorage = (): boolean => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
        isAuthenticated.value = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        return true;
      } catch (error) {
        console.error('Erro ao carregar dados do storage:', error);
        clearLocalData();
        return false;
      }
    }
    return false;
  };

  const showNotification = (type: 'positive' | 'negative' | 'warning' | 'info', message: string, icon?: string) => {
    const options: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 4000,
    };
    if (icon) options.icon = icon;
    $q.notify(options);
  };

  // ===================== GETTERS =====================

  // Tipos de usuário
  const isRoot = computed(() => user.value?.tipo === 'root');
  const isAdmin = computed(() => user.value?.tipo === 'admin');
  const isCliente = computed(() => user.value?.tipo === 'cliente');
  const isPrestador = computed(() => user.value?.tipo === 'prestador');

  // Status
  const isAtivo = computed(() => user.value?.status === 'ativo');
  const isPendente = computed(() => user.value?.status === 'pendente');
  const isBloqueado = computed(() => user.value?.status === 'bloqueado');
  const isDesativado = computed(() => user.value?.status === 'desativado');
  const isReprovado = computed(() => user.value?.status === 'reprovado');

  // 🔥 VERIFICAÇÃO - GETTERS ADICIONAIS
  const isVerificado = computed(() => user.value?.verificado === true);
  const isNaoVerificado = computed(() => user.value?.verificado === false);
  const statusVerificacao = computed(() => {
    if (user.value?.verificado === true) return 'Verificado';
    if (user.value?.tipo === 'prestador' && user.value?.status === 'pendente') return 'Pendente';
    return 'Não verificado';
  });
  const corVerificacao = computed(() => {
    if (user.value?.verificado === true) return 'positive';
    if (user.value?.tipo === 'prestador' && user.value?.status === 'pendente') return 'warning';
    return 'grey';
  });
  const iconeVerificacao = computed(() => {
    if (user.value?.verificado === true) return 'verified';
    if (user.value?.tipo === 'prestador' && user.value?.status === 'pendente') return 'pending';
    return 'info';
  });

  // Dados básicos
  const userId = computed(() => user.value?.id || 0);
  const userNome = computed(() => user.value?.nome || 'Usuário');
  const userEmail = computed(() => user.value?.email || '');
  const userTelefone = computed(() => user.value?.telefone || '');
  const userFoto = computed(() => user.value?.foto);
  const userTipo = computed(() => user.value?.tipo || 'cliente');
  const userStatus = computed(() => user.value?.status || 'ativo');
  const userVerificado = computed(() => user.value?.verificado || false);
  const userDisponivel = computed(() => user.value?.disponivel || false);

  // Avatar com fallback
  const userAvatar = computed(() => {
    if (user.value?.foto) return user.value.foto;
    const iniciais = (user.value?.nome || 'U').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=${iniciais}`;
  });

  // Dados específicos do prestador
  const userProfissao = computed(() => user.value?.profissao || '');
  const userMediaAvaliacao = computed(() => user.value?.media_avaliacao || 0);
  const userTotalAvaliacoes = computed(() => user.value?.total_avaliacoes || 0);
  const userSobre = computed(() => user.value?.sobre || '');

  // ===================== ACTIONS =====================

  const initialize = (): void => {
    if (initialized.value) return;
    loadFromStorage();
    initialized.value = true;
  };

  /**
   * 🔥 LOGIN - COM VERIFICAÇÃO DE STATUS
   */
  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    loading.value = true;
    loginAviso.value = null;

    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const loginData: { email?: string; telefone?: string; password: string } = { password };

      if (isEmail) {
        loginData.email = emailOrPhone;
      } else {
        loginData.telefone = emailOrPhone.replace(/\s/g, '');
      }

      const response: AxiosResponse<LoginResponse> = await api.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        loginData,
        { timeout: 15000 }
      );

      if (response.data?.success === true) {
        const data = response.data;

        // 🔥 VERIFICAR STATUS DO USUÁRIO
        if (data.user.status) {
          switch (data.user.status) {
            case 'bloqueado':
              showNotification('negative', '❌ A sua conta foi bloqueada. Contacte o suporte.', 'block');
              return false;
            case 'desativado':
              showNotification('negative', '❌ A sua conta foi desativada. Contacte o suporte.', 'block');
              return false;
            case 'reprovado':
              showNotification('negative', '❌ O seu cadastro foi reprovado. Contacte o suporte.', 'block');
              return false;
          }
        }

        user.value = data.user;
        token.value = data.token;
        isAuthenticated.value = true;

        // 🔥 SALVAR AVISO (para prestadores pendentes)
        if (data.aviso) {
          loginAviso.value = data.aviso;
          showNotification('warning', data.aviso, 'info');
        }

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        // 🔥 MENSAGEM DE BOAS-VINDAS COM STATUS
        let welcomeMsg = `Bem-vindo, ${user.value.nome}!`;
        if (user.value.status === 'pendente') {
          welcomeMsg = `Bem-vindo, ${user.value.nome}! Aguarde a verificação da sua conta.`;
        }
        showNotification('positive', welcomeMsg, 'check_circle');
        return true;
      }

      showNotification('negative', response.data?.message || 'Erro ao fazer login');
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      const msg = error.response?.data?.error || error.response?.data?.message || 'Erro no login';
      showNotification('negative', msg);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    loading.value = true;
    const currentToken = token.value;
    clearLocalData();
    loginAviso.value = null;
    showNotification('positive', 'Logout realizado com sucesso!', 'logout');

    if (currentToken) {
      try {
        await api.post(AUTH_ENDPOINTS.LOGOUT, {}, { timeout: 3000 });
      } catch {
        // Ignorar erro
      }
    }
    loading.value = false;
  };

  const clearLocalData = (): void => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    loginAviso.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedData: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
      localStorage.setItem('auth_user', JSON.stringify(user.value));
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    try {
      const response = await api.get(AUTH_ENDPOINTS.VERIFY);
      if (response.data?.success) {
        if (response.data.user) {
          user.value = { ...user.value, ...response.data.user };
          localStorage.setItem('auth_user', JSON.stringify(user.value));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.USER);
      if (response.data?.success) {
        user.value = response.data.user;
        localStorage.setItem('auth_user', JSON.stringify(user.value));
        return user.value;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    loading.value = true;
    try {
      const response = await api.put(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
      if (response.data?.success) {
        user.value = { ...user.value, ...response.data.user };
        localStorage.setItem('auth_user', JSON.stringify(user.value));
        showNotification('positive', 'Perfil atualizado com sucesso!', 'check');
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao atualizar perfil');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const uploadFoto = async (file: File): Promise<string | null> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post(AUTH_ENDPOINTS.UPLOAD_FOTO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data.foto) {
        user.value = { ...user.value, foto: response.data.foto } as User;
        localStorage.setItem('auth_user', JSON.stringify(user.value));
        showNotification('positive', 'Foto atualizada com sucesso!', 'photo_camera');
        return response.data.foto;
      }
      return null;
    } catch (err) {
      const error = err as AxiosError<{ error?: string; message?: string }>;
      showNotification('negative', error.response?.data?.error || 'Erro ao atualizar foto');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    loading.value = true;
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      if (response.data?.success) {
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
  };

  const resetPassword = async (resetToken: string, email: string, password: string): Promise<boolean> => {
    loading.value = true;
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD(resetToken), {
        email,
        password,
        password_confirmation: password,
      });
      if (response.data?.success) {
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
  };

  // ===================== RETURN =====================

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    initialized,
    loginAviso,

    // Getters (tipo de usuário)
    isRoot,
    isAdmin,
    isCliente,
    isPrestador,

    // Getters (status)
    isAtivo,
    isPendente,
    isBloqueado,
    isDesativado,
    isReprovado,

    // 🔥 Getters (verificação)
    isVerificado,
    isNaoVerificado,
    statusVerificacao,
    corVerificacao,
    iconeVerificacao,

    // Getters (dados básicos)
    userId,
    userNome,
    userEmail,
    userTelefone,
    userFoto,
    userAvatar,
    userTipo,
    userStatus,
    userVerificado,
    userDisponivel,

    // Getters (dados específicos - prestador)
    userProfissao,
    userMediaAvaliacao,
    userTotalAvaliacoes,
    userSobre,

    // Actions
    initialize,
    login,
    logout,
    clearLocalData,
    updateUser,
    verifyToken,
    fetchUser,
    updateProfile,
    uploadFoto,
    forgotPassword,
    resetPassword,
  };
});

export default useAuthStore;
