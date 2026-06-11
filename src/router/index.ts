// src/router/index.ts

import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './web/routes';
import { useAuthStore } from 'src/stores/login-store';

export default defineRouter(function () {
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

  // ✅ GUARDA DE AUTENTICAÇÃO
  Router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (!authStore.initialized) {
      authStore.initialize();
    }

    // 🔓 Rota de login do ADMIN (Root e Admin usam esta tela)
    if (to.path === '/admin/login') {
      if (authStore.isAuthenticated && (authStore.isAdmin || authStore.user?.tipo === 'root')) {
        return '/admin/dashboard';
      }
      return true;
    }

    // 🔓 Rota de login do APP (Cliente e Prestador usam esta tela)
    if (to.path === '/auth/login') {
      if (authStore.isAuthenticated) {
        // Se for admin/root, vai para admin
        if (authStore.isAdmin || authStore.user?.tipo === 'root') {
          return '/admin/dashboard';
        }
        // Se for prestador, vai para dashboard prestador
        if (authStore.isPrestador) {
          return '/mobile/prestador/dashboard';
        }
        // Se for cliente, vai para inicio
        return '/mobile/inicio';
      }
      return true;
    }

    // 🔓 Rotas públicas
    const publicRoutes = ['/', '/servicos', '/como-funciona', '/contactos', '/sobre'];
    if (publicRoutes.includes(to.path)) {
      return true;
    }

    // 🔒 Verificar se a rota requer autenticação
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true);
    const requiresAdmin = to.matched.some((record) => record.meta?.requiresAdmin === true);
    const requiresPrestador = to.matched.some((record) => record.meta?.requiresPrestador === true);

    // Rota requer autenticação mas usuário não está logado
    if (requiresAuth && !authStore.isAuthenticated) {
      if (to.path.startsWith('/admin')) {
        return '/admin/login';
      }
      if (to.path.startsWith('/mobile')) {
        return '/auth/login';
      }
      return '/auth/login';
    }

    // ✅ Rota requer ADMIN (Root e Admin têm acesso)
    if (requiresAdmin) {
      const isAdminOrRoot = authStore.isAdmin || authStore.user?.tipo === 'root';
      if (!isAdminOrRoot) {
        return '/auth/login';
      }
    }

    // Rota requer prestador
    if (requiresPrestador && !authStore.isPrestador) {
      return '/auth/login';
    }

    // ✅ Garantir que Root/Admin não acedem a rotas mobile
    const isAdminOrRoot = authStore.isAdmin || authStore.user?.tipo === 'root';
    if (to.path.startsWith('/mobile') && isAdminOrRoot) {
      return '/admin/dashboard';
    }

    // ✅ Garantir que Cliente/Prestador não acedem a rotas admin
    if (to.path.startsWith('/admin') && !isAdminOrRoot) {
      if (authStore.isAuthenticated) {
        return authStore.isPrestador ? '/mobile/prestador/dashboard' : '/mobile/inicio';
      }
      return '/auth/login';
    }

    // Prestador tentando aceder rota de cliente
    if (
      to.path.startsWith('/mobile') &&
      !to.path.includes('/prestador') &&
      authStore.isAuthenticated &&
      authStore.isPrestador
    ) {
      return '/mobile/prestador/dashboard';
    }

    // Cliente tentando aceder rota de prestador
    if (
      to.path.startsWith('/mobile/prestador') &&
      authStore.isAuthenticated &&
      authStore.isCliente
    ) {
      return '/mobile/inicio';
    }

    return true;
  });

  return Router;
});
