import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// SEM FALLBACK - usa apenas o .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // ✅ ALTERADO: 10s -> 30s (para aguentar o TiDB cold start)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR DE REQUISIÇÃO - CORRIGIDO
api.interceptors.request.use(
  (config) => {
    // ✅ CORREÇÃO: usar 'auth_token' em vez de 'token'
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ✅ INTERCEPTOR DE RESPOSTA - TRATAMENTO DE ERROS
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // ✅ Tratamento específico para timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('⏱️ Timeout na requisição:', error.config?.url);
      // Não fazer redirect, apenas rejeitar
    }

    // ✅ Tratamento para 401 (não autorizado)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
        const loginPath = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
