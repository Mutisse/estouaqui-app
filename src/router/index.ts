// src/router/index.ts - VERSÃO CORRIGIDA (sem parâmetros não utilizados)

import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './web/routes';
import { useAuthStore } from 'src/stores/auth-store';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // ✅ GUARDA DE AUTENTICAÇÃO - VERSÃO MODERNA (sem next)
  Router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // Inicializar store se necessário
    if (!authStore.initialized) {
      await authStore.initialize();
    }

    // 🔓 REGRA ESPECIAL: Rota de login do admin
    if (to.path === '/admin/login') {
      // Se já estiver autenticado como admin, redirecionar para dashboard
      if (authStore.isAuthenticated && authStore.isAdmin) {
        return '/admin/dashboard';
      }
      return true;
    }

    // 🔓 REGRA: Rota de login comum
    if (to.path === '/auth/login') {
      if (authStore.isAuthenticated) {
        if (authStore.isAdmin) {
          return '/admin/dashboard';
        }
        if (authStore.isPrestador) {
          return '/mobile/prestador/dashboard';
        }
        return '/mobile/inicio';
      }
      return true;
    }

    // 🔓 Rotas públicas
    const publicRoutes = ['/', '/servicos', '/como-funciona', '/contactos', '/sobre'];
    if (publicRoutes.includes(to.path)) {
      return true;
    }

    // 🔒 Verificar rotas protegidas
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true);
    const requiresAdmin = to.matched.some((record) => record.meta?.requiresAdmin === true);
    const requiresPrestador = to.matched.some((record) => record.meta?.requiresPrestador === true);

    // Rota requer autenticação mas usuário não está logado
    if (requiresAuth && !authStore.isAuthenticated) {
      // Se for rota admin, redirecionar para login admin
      if (to.path.startsWith('/admin')) {
        return '/admin/login';
      }

      // Se for rota mobile, redirecionar para login comum
      if (to.path.startsWith('/mobile')) {
        return '/auth/login';
      }

      return '/auth/login';
    }

    // Rota requer admin mas usuário não é admin
    if (requiresAdmin && !authStore.isAdmin) {
      return '/auth/login';
    }

    // Rota requer prestador mas usuário não é prestador
    if (requiresPrestador && !authStore.isPrestador) {
      return '/auth/login';
    }

    // Prestador tentando acessar rota de cliente
    if (
      to.path.startsWith('/mobile') &&
      !to.path.includes('/prestador') &&
      authStore.isAuthenticated &&
      authStore.isPrestador
    ) {
      return '/mobile/prestador/dashboard';
    }

    // Cliente tentando acessar rota de prestador
    if (
      to.path.startsWith('/mobile/prestador') &&
      authStore.isAuthenticated &&
      authStore.isCliente
    ) {
      return '/mobile/inicio';
    }

    // Permitir navegação
    return true;
  });

  return Router;
});
