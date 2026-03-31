// src/boot/axios.ts

import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ==========================================
// CONTROLE DE INATIVIDADE (OTIMIZADO)
// ==========================================

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 60 * 1000; // 5 horas
let lastActivity = Date.now();

const resetInactivityTimer = () => {
  lastActivity = Date.now();

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;

    if (inactiveTime >= INACTIVITY_TIMEOUT) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        localStorage.removeItem('auth_token');

        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
          const loginPath = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
          window.location.href = loginPath;
        }
      }
    }
  }, INACTIVITY_TIMEOUT);
};

const monitorUserActivity = () => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });
  resetInactivityTimer();
};

monitorUserActivity();

// ==========================================
// CONFIGURAÇÃO DO AXIOS (OTIMIZADA)
// ==========================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Reduzido de 120s para 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    resetInactivityTimer();
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de resposta (OTIMIZADO)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Tratamento de timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Silencioso - sem log
    }

    // Tratamento de 401 (não autorizado)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
        const loginPath = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
