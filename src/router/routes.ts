// router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'servicos', component: () => import('pages/ServicosPage.vue') },
      { path: 'como-funciona', component: () => import('pages/ComoFuncionaPage.vue') },
      { path: 'contactos', component: () => import('pages/ContactosPage.vue') },
      { path: 'sobre', component: () => import('pages/SobrePage.vue') },
    ],
  },

  // Rotas de Autenticação
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/auth/Login.vue') },
      { path: 'register-cliente', component: () => import('pages/auth/RegisterCliente.vue') },
      { path: 'register-prestador', component: () => import('pages/auth/RegisterPrestador.vue') },
    ],
  },

  // Rotas Mobile
  {
    path: '/mobile',
    component: () => import('layouts/MobileLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'inicio', component: () => import('pages/mobile/client/MobileInicio.vue') }, // NOVA!
      { path: 'mapa', component: () => import('pages/mobile/client/Mapa.vue') },
      { path: 'lista-prestadores', component: () => import('pages/mobile/client/ListaPrestadores.vue') },
      { path: 'perfil-prestador/:id', component: () => import('pages/mobile/client/PerfilPrestador.vue') },
      { path: 'chat/:id', component: () => import('pages/mobile/client/Chat.vue') },
      { path: 'avaliacao/:id', component: () => import('pages/mobile/client/Avaliacao.vue') },
      { path: 'perfil', component: () => import('pages/mobile/client/Perfil.vue') },
      { path: 'meus-pedidos', component: () => import('pages/mobile/client/MeusPedidos.vue') },
      { path: 'favoritos', component: () => import('pages/mobile/client/Favoritos.vue') },
    ],
  },

  // Rotas Admin
  {
    path: '/admin/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/admin/auth/AdminLogin.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('pages/admin/Dashboard.vue') },
      { path: 'utilizadores', component: () => import('pages/admin/Utilizadores.vue') },
      { path: 'estatisticas', component: () => import('pages/admin/Estatisticas.vue') },
    ],
  },
  /*
  // router/routes.ts (atualização)
// Rotas Admin Protegidas
{
  path: '/admin',
  component: () => import('layouts/AdminLayout.vue'),
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    { path: 'dashboard', component: () => import('pages/admin/Dashboard.vue') },
    { path: 'utilizadores', component: () => import('pages/admin/Utilizadores.vue') },
    { path: 'prestadores', component: () => import('pages/admin/Prestadores.vue') }, // NOVO
    { path: 'categorias', component: () => import('pages/admin/Categorias.vue') }, // NOVO
    { path: 'servicos', component: () => import('pages/admin/Servicos.vue') }, // NOVO
    { path: 'estatisticas', component: () => import('pages/admin/Estatisticas.vue') },
    { path: 'relatorios', component: () => import('pages/admin/Relatorios.vue') }, // NOVO
    { path: 'financeiro', component: () => import('pages/admin/Financeiro.vue') }, // NOVO
    { path: 'configuracoes', component: () => import('pages/admin/Configuracoes.vue') }, // NOVO
    { path: 'logs', component: () => import('pages/admin/Logs.vue') }, // NOVO
    { path: 'perfil', component: () => import('pages/admin/Perfil.vue') }, // NOVO
  ],
},
  */
 // Rotas Mobile - Prestador
 
  {
    path: '/mobile/prestador',
    component: () => import('layouts/MobileLayout.vue'),
    meta: { requiresAuth: true, requiresPrestador: true },
    children: [
      { path: 'dashboard', component: () => import('pages/mobile/prestador/PrestadorDashboard.vue') },
      { path: 'agenda', component: () => import('pages/mobile/prestador/PrestadorAgenda.vue') },
      { path: 'servicos', component: () => import('pages/mobile/prestador/PrestadorServicos.vue') },
      { path: 'pedidos', component: () => import('pages/mobile/prestador/PrestadorPedidos.vue') },
      { path: 'historico', component: () => import('pages/mobile/prestador/PrestadorHistorico.vue') },
      { path: 'perfil', component: () => import('pages/mobile/prestador/PrestadorPerfil.vue') },
    ],
  },

  // Rota 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
