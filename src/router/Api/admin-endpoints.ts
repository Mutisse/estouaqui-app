// src/router/Api/admin-endpoints.ts

export const ADMIN_ENDPOINTS = {
  // ==========================================
  // 1. DASHBOARD E ESTATÍSTICAS
  // ==========================================
  DASHBOARD: '/admin/dashboard',
  ATIVIDADE: '/admin/atividade',
  STATS: '/admin/stats',
  LOGS: '/admin/logs',

  // ==========================================
  // 2. CONFIGURAÇÕES DO SISTEMA
  // ==========================================
  CONFIGURACOES: '/admin/configuracoes',
  UPDATE_CONFIGURACOES: '/admin/configuracoes',

  // ==========================================
  // 3. NOTIFICAÇÕES DO ADMIN
  // ==========================================
  NOTIFICACOES: '/admin/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/admin/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/admin/notifications/read-all',

  // ==========================================
  // 4. GESTÃO DE UTILIZADORES
  // ==========================================
  USERS: '/admin/users',
  USER_DETAILS: (id: number) => `/admin/users/${id}`,
  UPDATE_USER: (id: number) => `/admin/users/${id}`,
  BLOCK_USER: (id: number) => `/admin/users/${id}/status/block`,
  UNBLOCK_USER: (id: number) => `/admin/users/${id}/status/unblock`,
  DELETE_USER: (id: number) => `/admin/users/${id}`,
  FORCE_DELETE_USER: (id: number) => `/admin/users/${id}/force`,
  USER_BY_EMAIL: (email: string) => `/admin/users/email/${encodeURIComponent(email)}`,
  EXPORT_USERS: '/admin/users/export',

  // ==========================================
  // 5. GESTÃO DE PRESTADORES
  // ==========================================
  PRESTADORES: '/admin/prestadores',
  PRESTADORES_PENDENTES: '/admin/prestadores/pendentes',
  APROVAR_PRESTADOR: (id: number) => `/admin/prestadores/${id}/aprovar`,
  REPROVAR_PRESTADOR: (id: number) => `/admin/prestadores/${id}/reprovar`,

  // ==========================================
  // 6. GESTÃO DE CATEGORIAS
  // ==========================================
  CATEGORIAS: '/admin/categorias',
  CREATE_CATEGORIA: '/admin/categorias',
  CATEGORIA_DETAILS: (id: number) => `/admin/categorias/${id}`,
  UPDATE_CATEGORIA: (id: number) => `/admin/categorias/${id}`,
  DELETE_CATEGORIA: (id: number) => `/admin/categorias/${id}`,
  UPLOAD_CATEGORIA_IMAGEM: '/admin/categorias/upload-imagem',
  REMOVER_CATEGORIA_IMAGEM: (id: number) => `/admin/categorias/${id}/imagem`,

  // ==========================================
  // 7. GESTÃO DE SERVIÇOS
  // ==========================================
  SERVICOS: '/admin/servicos',
  CREATE_SERVICO: '/admin/servicos',
  SERVICO_DETAILS: (id: number) => `/admin/servicos/${id}`,
  UPDATE_SERVICO: (id: number) => `/admin/servicos/${id}`,
  DELETE_SERVICO: (id: number) => `/admin/servicos/${id}`,

  // ==========================================
  // 8. GESTÃO DE PEDIDOS
  // ==========================================
  PEDIDOS: '/admin/pedidos',
  PEDIDO_DETAILS: (id: number) => `/admin/pedidos/${id}`,
  UPDATE_PEDIDO_STATUS: (id: number) => `/admin/pedidos/${id}/status`,
  CANCELAR_PEDIDO: (id: number) => `/admin/pedidos/${id}/cancel`,

  // ==========================================
  // 9. GESTÃO DE AVALIAÇÕES
  // ==========================================
  AVALIACOES: '/admin/avaliacoes',
  AVALIACAO_DETAILS: (id: number) => `/admin/avaliacoes/${id}`,
  DELETE_AVALIACAO: (id: number) => `/admin/avaliacoes/${id}`,

  // ==========================================
  // 10. FINANCEIRO
  // ==========================================
  RESUMO_FINANCEIRO: '/admin/financeiro/resumo',
  TRANSACOES: '/admin/financeiro/transacoes',
  TRANSACAO_DETAILS: (id: number) => `/admin/financeiro/transacoes/${id}`,
  CREATE_TRANSACAO: '/admin/financeiro/transacoes',
  UPDATE_TRANSACAO_STATUS: (id: number) => `/admin/financeiro/transacoes/${id}/status`,

  // ==========================================
  // 11. RELATÓRIOS
  // ==========================================
  RELATORIO_USUARIOS: '/admin/relatorios/usuarios',
  RELATORIO_PRESTADORES: '/admin/relatorios/prestadores',
  RELATORIO_SERVICOS: (periodo?: string) => {
    if (periodo) return `/admin/relatorios/servicos?periodo=${periodo}`;
    return '/admin/relatorios/servicos';
  },
  RELATORIO_FINANCEIRO: (periodo?: string) => {
    if (periodo) return `/admin/relatorios/financeiro?periodo=${periodo}`;
    return '/admin/relatorios/financeiro';
  },

  // ==========================================
  // 12. GESTÃO DE PROMOÇÕES
  // ==========================================
  // ⬇️⬇️⬇️ ADICIONE ESTA LINHA ⬇️⬇️⬇️
  PROMOCOES: '/admin/promocoes',

  CREATE_PROMOCAO: '/admin/promocoes',
  UPDATE_PROMOCAO: (id: number) => `/admin/promocoes/${id}`,
  DELETE_PROMOCAO: (id: number) => `/admin/promocoes/${id}`,

  // ==========================================
  // 13. MONITORAMENTO (SYSTEM)
  // ==========================================
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_METRICS: '/system/metrics',
  SYSTEM_PERFORMANCE: '/system/performance',
  SYSTEM_CACHE_STATS: '/system/cache-stats',
  SYSTEM_DATABASE_STATS: '/system/database-stats',
  SYSTEM_QUEUE_STATS: '/system/queue-stats',
  SYSTEM_LOGS_RECENT: '/system/logs/recent',
  SYSTEM_ALERTS: '/system/alerts',
  SYSTEM_RESOLVE_ALERT: (id: string) => `/system/alerts/${id}/resolve`,
  SYSTEM_HISTORY: '/system/history',
  SYSTEM_BUSINESS_METRICS: '/system/business-metrics',
  SYSTEM_EXPORT: '/system/export',
  SYSTEM_SAVE_DAILY_METRICS: '/system/save-daily-metrics',
} as const;

export type AdminEndpoints = typeof ADMIN_ENDPOINTS;
