import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// ✅ CORRETO - lê a variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Validação para garantir que a URL foi carregada
if (!API_BASE_URL) {
  console.error('❌ VITE_API_URL não está definida no arquivo .env');
  throw new Error('VITE_API_URL não configurada');
}

console.log('✅ API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // ✅ Importante para CORS
  withCredentials: false,
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log para debug (remover em produção)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(new Error(error.message || 'Erro na requisição'));
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    // Log para debug (remover em produção)
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Tratamento de erro 401 (não autorizado)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      delete api.defaults.headers.common['Authorization'];

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.warn('⚠️ Token expirado, redirecionando para login');
        window.location.href = '/login';
      }
    }

    // Tratamento de erro 404
    if (error.response?.status === 404) {
      console.error('❌ Endpoint não encontrado:', error.config?.url);
    }

    // Tratamento de erro 500
    if (error.response?.status === 500) {
      console.error('❌ Erro interno do servidor');
    }

    // Tratamento de erro de rede
    if (error.message === 'Network Error') {
      console.error('❌ Erro de rede - API pode estar offline');
    }

    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  // Disponibiliza axios e api para uso global
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
