/**
 * Endpoints da API para Administração
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 */
export const ADMIN_ENDPOINTS = {
  // ==========================================
  // 1. DASHBOARD E ESTATÍSTICAS
  // ==========================================

  // Dashboard principal
  DASHBOARD: '/admin/dashboard',

  // Atividade dos últimos 7 dias
  ATIVIDADE: '/admin/atividade',

  // Estatísticas gerais
  STATS: '/admin/stats',

  // Logs do sistema
  LOGS: '/admin/logs',

  // ==========================================
  // 2. CONFIGURAÇÕES DO SISTEMA
  // ==========================================

  // Obter configurações
  CONFIGURACOES: '/admin/configuracoes',

  // Atualizar configurações
  UPDATE_CONFIGURACOES: '/admin/configuracoes',

  // ==========================================
  // 3. NOTIFICAÇÕES DO ADMIN
  // ==========================================

  // Listar notificações do admin
  NOTIFICACOES: '/admin/notifications',

  // Marcar notificação como lida
  MARK_NOTIFICATION_READ: (id: string) => `/admin/notifications/${id}/read`,

  // Marcar todas notificações como lidas
  MARK_ALL_NOTIFICATIONS_READ: '/admin/notifications/read-all',

  // ==========================================
  // 4. GESTÃO DE UTILIZADORES
  // ==========================================

  // Listar todos os utilizadores
  USERS: '/admin/users',

  // Detalhes de um utilizador
  USER_DETAILS: (id: number) => `/admin/users/${id}`,

  // Atualizar utilizador
  UPDATE_USER: (id: number) => `/admin/users/${id}`,

  // Bloquear utilizador
  BLOCK_USER: (id: number) => `/admin/users/${id}/status/block`,

  // Desbloquear utilizador
  UNBLOCK_USER: (id: number) => `/admin/users/${id}/status/unblock`,

  // Deletar utilizador (soft delete)
  DELETE_USER: (id: number) => `/admin/users/${id}`,

  // Deletar utilizador permanentemente
  FORCE_DELETE_USER: (id: number) => `/admin/users/${id}/force`,

  // Buscar utilizador por email
  USER_BY_EMAIL: (email: string) => `/admin/users/email/${encodeURIComponent(email)}`,

  // Exportar utilizadores
  EXPORT_USERS: '/admin/users/export',

  // ==========================================
  // 5. GESTÃO DE PRESTADORES
  // ==========================================

  // Listar prestadores
  PRESTADORES: '/admin/prestadores',

  // Prestadores pendentes de verificação
  PRESTADORES_PENDENTES: '/admin/prestadores/pendentes',

  // Aprovar prestador
  APROVAR_PRESTADOR: (id: number) => `/admin/prestadores/${id}/aprovar`,

  // Reprovar prestador
  REPROVAR_PRESTADOR: (id: number) => `/admin/prestadores/${id}/reprovar`,

  // ==========================================
  // 6. GESTÃO DE CATEGORIAS
  // ==========================================

  // Listar categorias
  CATEGORIAS: '/admin/categorias',

  // Criar categoria
  CREATE_CATEGORIA: '/admin/categorias',

  // Detalhes da categoria
  CATEGORIA_DETAILS: (id: number) => `/admin/categorias/${id}`,

  // Atualizar categoria
  UPDATE_CATEGORIA: (id: number) => `/admin/categorias/${id}`,

  // Deletar categoria
  DELETE_CATEGORIA: (id: number) => `/admin/categorias/${id}`,

  // Upload de imagem para categoria
  UPLOAD_CATEGORIA_IMAGEM: '/admin/categorias/upload-imagem',

  // Remover imagem da categoria
  REMOVER_CATEGORIA_IMAGEM: (id: number) => `/admin/categorias/${id}/imagem`,

  // ==========================================
  // 7. GESTÃO DE SERVIÇOS
  // ==========================================

  // Listar serviços
  SERVICOS: '/admin/servicos',

  // Criar serviço
  CREATE_SERVICO: '/admin/servicos',

  // Detalhes do serviço
  SERVICO_DETAILS: (id: number) => `/admin/servicos/${id}`,

  // Atualizar serviço
  UPDATE_SERVICO: (id: number) => `/admin/servicos/${id}`,

  // Deletar serviço
  DELETE_SERVICO: (id: number) => `/admin/servicos/${id}`,

  // ==========================================
  // 8. GESTÃO DE PEDIDOS
  // ==========================================

  // Listar pedidos
  PEDIDOS: '/admin/pedidos',

  // Detalhes do pedido
  PEDIDO_DETAILS: (id: number) => `/admin/pedidos/${id}`,

  // Atualizar status do pedido
  UPDATE_PEDIDO_STATUS: (id: number) => `/admin/pedidos/${id}/status`,

  // Cancelar pedido
  CANCELAR_PEDIDO: (id: number) => `/admin/pedidos/${id}/cancel`,

  // ==========================================
  // 9. GESTÃO DE AVALIAÇÕES
  // ==========================================

  // Listar avaliações
  AVALIACOES: '/admin/avaliacoes',

  // Detalhes da avaliação
  AVALIACAO_DETAILS: (id: number) => `/admin/avaliacoes/${id}`,

  // Deletar avaliação
  DELETE_AVALIACAO: (id: number) => `/admin/avaliacoes/${id}`,

  // ==========================================
  // 10. FINANCEIRO
  // ==========================================

  // Resumo financeiro
  RESUMO_FINANCEIRO: '/admin/financeiro/resumo',

  // Listar transações
  TRANSACOES: '/admin/financeiro/transacoes',

  // Detalhes da transação
  TRANSACAO_DETAILS: (id: number) => `/admin/financeiro/transacoes/${id}`,

  // Criar transação
  CREATE_TRANSACAO: '/admin/financeiro/transacoes',

  // Atualizar status da transação
  UPDATE_TRANSACAO_STATUS: (id: number) => `/admin/financeiro/transacoes/${id}/status`,

  // ==========================================
  // 11. RELATÓRIOS
  // ==========================================

  // Relatório de usuários
  RELATORIO_USUARIOS: '/admin/relatorios/usuarios',

  // Relatório de prestadores
  RELATORIO_PRESTADORES: '/admin/relatorios/prestadores',

  // Relatório de serviços (com período opcional)
  RELATORIO_SERVICOS: (periodo?: string) => {
    if (periodo) {
      return `/admin/relatorios/servicos?periodo=${periodo}`;
    }
    return '/admin/relatorios/servicos';
  },

  // Relatório financeiro (com período opcional)
  RELATORIO_FINANCEIRO: (periodo?: string) => {
    if (periodo) {
      return `/admin/relatorios/financeiro?periodo=${periodo}`;
    }
    return '/admin/relatorios/financeiro';
  },

  // ==========================================
  // 12. GESTÃO DE PROMOÇÕES
  // ==========================================

  // Criar promoção
  CREATE_PROMOCAO: '/admin/promocoes',

  // Atualizar promoção
  UPDATE_PROMOCAO: (id: number) => `/admin/promocoes/${id}`,

  // Deletar promoção
  DELETE_PROMOCAO: (id: number) => `/admin/promocoes/${id}`,

  // ==========================================
  // 13. MONITORAMENTO (SYSTEM)
  // ==========================================

  // Health check
  SYSTEM_HEALTH: '/system/health',

  // Métricas do sistema
  SYSTEM_METRICS: '/system/metrics',

  // Performance
  SYSTEM_PERFORMANCE: '/system/performance',

  // Cache stats
  SYSTEM_CACHE_STATS: '/system/cache-stats',

  // Database stats
  SYSTEM_DATABASE_STATS: '/system/database-stats',

  // Queue stats
  SYSTEM_QUEUE_STATS: '/system/queue-stats',

  // Logs recentes
  SYSTEM_LOGS_RECENT: '/system/logs/recent',

  // Alertas
  SYSTEM_ALERTS: '/system/alerts',

  // Resolver alerta
  SYSTEM_RESOLVE_ALERT: (id: string) => `/system/alerts/${id}/resolve`,

  // Histórico
  SYSTEM_HISTORY: '/system/history',

  // Métricas de negócio
  SYSTEM_BUSINESS_METRICS: '/system/business-metrics',

  // Exportar métricas
  SYSTEM_EXPORT: '/system/export',

  // Salvar métricas diárias
  SYSTEM_SAVE_DAILY_METRICS: '/system/save-daily-metrics',
} as const;

export type AdminEndpoints = typeof ADMIN_ENDPOINTS;
