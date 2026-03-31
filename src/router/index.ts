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

  // ✅ GUARDA DE AUTENTICAÇÃO GLOBAL
  Router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // ✅ IMPORTANTE: Se o store ainda não foi inicializado, inicializar
    if (!authStore.initialized) {
      await authStore.initialize();
    }

    // Verificar se a rota requer autenticação
    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth === true);
    const requiresAdmin = to.matched.some(record => record.meta?.requiresAdmin === true);
    const requiresPrestador = to.matched.some(record => record.meta?.requiresPrestador === true);

    // Caso 1: Rota requer autenticação e usuário não está autenticado
    if (requiresAuth && !authStore.isAuthenticated) {
      const isAdminRoute = to.path.startsWith('/admin');
      const redirectPath = isAdminRoute ? '/admin/login' : '/auth/login';
      return redirectPath;
    }

    // Caso 2: Rota requer admin e usuário não é admin
    if (requiresAdmin && !authStore.isAdmin) {
      return '/auth/login';
    }

    // Caso 3: Rota requer prestador e usuário não é prestador
    if (requiresPrestador && !authStore.isPrestador) {
      console.log('❌ Acesso negado: rota de prestador, mas usuário não é prestador');
      return '/auth/login';
    }

    // Caso 4: Rota de login, mas usuário já está autenticado
    if (to.path === '/auth/login' && authStore.isAuthenticated) {
      if (authStore.isAdmin) {
        return '/admin/dashboard';
      } else if (authStore.isPrestador) {
        return '/mobile/prestador/dashboard';
      } else {
        return '/mobile/inicio';
      }
    }

    // Caso 5: Rota admin/login, mas usuário já está autenticado
    if (to.path === '/admin/login' && authStore.isAuthenticated) {
      if (authStore.isAdmin) {
        return '/admin/dashboard';
      } else {
        return '/mobile/inicio';
      }
    }

    // ✅ CASO ESPECIAL: Tentativa de acessar /mobile (rota de cliente) sendo prestador
    if (to.path.startsWith('/mobile') && !to.path.includes('/prestador') && authStore.isAuthenticated && authStore.isPrestador) {
      console.log('🔄 Prestador tentou acessar rota de cliente, redirecionando para dashboard do prestador');
      return '/mobile/prestador/dashboard';
    }

    // ✅ CASO ESPECIAL: Tentativa de acessar /mobile/prestador sendo cliente
    if (to.path.startsWith('/mobile/prestador') && authStore.isAuthenticated && authStore.isCliente) {
      console.log('🔄 Cliente tentou acessar rota de prestador, redirecionando para dashboard do cliente');
      return '/mobile/inicio';
    }

    // Permitir navegação
    return true;
  });

  return Router;
});
