// src/router/Api/cliente-endpoints.ts

/**
 * Endpoints completos da API para Cliente
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 */
export const CLIENTE_ENDPOINTS = {
  // ==========================================
  // 1. REGISTRO DO CLIENTE
  // ==========================================
  REGISTER: '/register/cliente',
  REGISTER_PRESTADOR: '/register/prestador',

  // ==========================================
  // 2. AUTENTICAÇÃO
  // ==========================================
  LOGIN: '/login',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
  VERIFY_TOKEN: '/auth/verify-token',

  // ==========================================
  // 3. PERFIL DO USUÁRIO
  // ==========================================
  GET_PROFILE: '/me',
  UPDATE_PROFILE: '/me',
  UPDATE_AVATAR: '/avatar',
  REMOVE_AVATAR: '/avatar',
  CHANGE_PASSWORD: '/password',
  DELETE_ACCOUNT: '/me',
  UPLOAD_PHOTO: '/upload-temp',

  // ==========================================
  // 4. VERIFICAÇÕES
  // ==========================================
  CHECK_EMAIL: (email: string) => `/check-email?email=${encodeURIComponent(email)}`,
  CHECK_PHONE: (phone: string) => `/check-phone?phone=${encodeURIComponent(phone)}`,

  // ==========================================
  // 5. DASHBOARD E ESTATÍSTICAS
  // ==========================================
  DASHBOARD: '/dashboard',
  STATS: '/stats',
  RECENT_ACTIVITIES: '/activities/recent',
  ACTIVITIES_HISTORY: '/activities',

  // ==========================================
  // 6. NOTIFICAÇÕES
  // ==========================================
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_PREFERENCES: '/notifications/preferences',
  UPDATE_NOTIFICATION_PREFERENCES: '/notifications/preferences',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

  // ==========================================
  // 7. PEDIDOS DO CLIENTE
  // ==========================================
  PEDIDOS: '/cliente/pedidos',
  PEDIDOS_BY_STATUS: (status: string) => `/cliente/pedidos?status=${status}`,
  PEDIDO_DETALHES: (id: string) => `/cliente/pedidos/${id}`,
  CRIAR_PEDIDO: '/cliente/pedidos',
  CANCELAR_PEDIDO: (id: string) => `/cliente/pedidos/${id}/cancelar`,
  CHECK_PEDIDO_AVALIACAO: (pedidoId: string) => `/cliente/pedidos/${pedidoId}/avaliacao`,

  // ==========================================
  // 8. AVALIAÇÕES DO CLIENTE
  // ==========================================
  AVALIACOES: '/cliente/avaliacoes',
  CRIAR_AVALIACAO: '/cliente/avaliacoes',
  ATUALIZAR_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,
  REMOVER_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,

  // ==========================================
  // 9. FAVORITOS
  // ==========================================
  FAVORITOS: '/cliente/favoritos',
  ADICIONAR_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,
  REMOVER_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,
  CHECK_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}/check`,

  // ==========================================
  // 10. PRESTADORES (consulta pública)
  // ==========================================
  PRESTADORES_LIST: '/prestadores',
  PRESTADORES_BY_CATEGORIA: (categoriaId: number) => `/prestadores?categoria=${categoriaId}`,
  PRESTADORES_BY_BUSCA: (busca: string) => `/prestadores?busca=${encodeURIComponent(busca)}`,
  PRESTADOR_DETALHES: (id: string) => `/prestadores/${id}`,
  PRESTADOR_AVALIACOES: (id: string) => `/prestadores/${id}/avaliacoes`,
  PRESTADORES_DESTAQUE: '/prestadores/destaque',
  PRESTADORES_TOP: '/prestadores/top',
  PRESTADORES_PROXIMOS: (lat: number, lng: number) => `/prestadores/proximos?lat=${lat}&lng=${lng}`,
  PRESTADORES_CATEGORIAS: '/prestadores/categorias',

  // ==========================================
  // 11. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================
  PREFERENCES: '/preferences',
  UPDATE_PREFERENCES: '/preferences',
  THEME: '/preferences/theme',
  LANGUAGE: '/preferences/language',
  PUSH_NOTIFICATIONS: '/preferences/push',

  // ==========================================
  // 12. ENDEREÇOS DO USUÁRIO
  // ==========================================
  ADDRESSES: '/addresses',
  CREATE_ADDRESS: '/addresses',
  GET_ADDRESS: (id: string) => `/addresses/${id}`,
  UPDATE_ADDRESS: (id: string) => `/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `/addresses/${id}`,
  SET_PRIMARY_ADDRESS: (id: string) => `/addresses/${id}/primary`,

  // ==========================================
  // 13. LOCALIZAÇÃO
  // ==========================================
  LOCALIZACAO: '/localizacao',
  UPDATE_LOCALIZACAO: '/localizacao',
  PRESTADORES_PROXIMOS_LOCAL: (lat: number, lng: number, raio?: number) =>
    `/localizacao/prestadores-proximos?latitude=${lat}&longitude=${lng}${raio ? `&raio=${raio}` : ''}`,

  // ==========================================
  // 14. CHAT
  // ==========================================
  CHAT_MESSAGES: (prestadorId: number) => `/chat/messages/${prestadorId}`,
  CHAT_SEND_MESSAGE: '/chat/messages',
  CHAT_LATEST_MESSAGES: (prestadorId: number, lastId?: number) =>
    `/chat/messages/${prestadorId}/latest${lastId ? `?last_id=${lastId}` : ''}`,
  CHAT_MARK_AS_READ: (prestadorId: number) => `/chat/messages/${prestadorId}/read`,
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_UNREAD_COUNT: '/chat/unread-count',

  // ==========================================
  // 15. PROMOÇÕES
  // ==========================================
  PROMOCOES: '/promocoes',
  PROMOCOES_ATIVAS: '/promocoes/ativas',
  PROMOCOES_ID: (id: number) => `/promocoes/${id}`,
  PROMOCOES_CODIGO: (codigo: string) => `/promocoes/codigo/${encodeURIComponent(codigo)}`,
  VALIDAR_CUPOM: '/promocoes/validar',

  // ==========================================
  // 16. AUXILIAR (dados de configuração)
  // ==========================================
  AUX_DIAS_SEMANA: '/auxiliar/dias-semana',
  AUX_MESES: '/auxiliar/meses',
  AUX_DIAS_OPTIONS: '/auxiliar/dias-options',
  AUX_HORARIOS_PADRAO: '/auxiliar/horarios-padrao',
  AUX_HORARIOS_OPTIONS: '/auxiliar/horarios-options',

  // ==========================================
  // 17. SERVIÇOS TIPOS
  // ==========================================
  SERVICO_TIPOS: '/servico-tipos',
  SERVICO_TIPOS_OPTIONS: '/servico-tipos/options',

  // ==========================================
  // 18. RAIO OPÇÕES
  // ==========================================
  RAIO_OPCOES: '/raio-opcoes',
  RAIO_OPCOES_OPTIONS: '/raio-opcoes/options',

  // ==========================================
  // 19. ADMIN - GESTÃO DE PROMOÇÕES
  // ==========================================
  ADMIN_PROMOCOES: '/admin/promocoes',
  ADMIN_PROMOCOES_CREATE: '/admin/promocoes',
  ADMIN_PROMOCOES_UPDATE: (id: number) => `/admin/promocoes/${id}`,
  ADMIN_PROMOCOES_DELETE: (id: number) => `/admin/promocoes/${id}`,

  // ==========================================
  // 20. ADMIN - GESTÃO DE USUÁRIOS
  // ==========================================
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETALHES: (id: number) => `/admin/users/${id}`,
  ADMIN_USER_UPDATE: (id: number) => `/admin/users/${id}`,
  ADMIN_USER_DELETE: (id: number) => `/admin/users/${id}`,
  ADMIN_USER_BLOCK: (id: number) => `/admin/users/${id}/status/block`,
  ADMIN_USER_UNBLOCK: (id: number) => `/admin/users/${id}/status/unblock`,

  // ==========================================
  // 21. ADMIN - GESTÃO DE PRESTADORES
  // ==========================================
  ADMIN_PRESTADORES: '/admin/prestadores',
  ADMIN_PRESTADORES_PENDENTES: '/admin/prestadores/pendentes',
  ADMIN_PRESTADOR_APROVAR: (id: number) => `/admin/prestadores/${id}/aprovar`,
  ADMIN_PRESTADOR_REPROVAR: (id: number) => `/admin/prestadores/${id}/reprovar`,

  // ==========================================
  // 22. ADMIN - GESTÃO DE CATEGORIAS
  // ==========================================
  ADMIN_CATEGORIAS: '/admin/categorias',
  ADMIN_CATEGORIA_CRIAR: '/admin/categorias',
  ADMIN_CATEGORIA_DETALHES: (id: number) => `/admin/categorias/${id}`,
  ADMIN_CATEGORIA_ATUALIZAR: (id: number) => `/admin/categorias/${id}`,
  ADMIN_CATEGORIA_DELETAR: (id: number) => `/admin/categorias/${id}`,

  // ==========================================
  // 23. ADMIN - GESTÃO DE SERVIÇOS
  // ==========================================
  ADMIN_SERVICOS: '/admin/servicos',
  ADMIN_SERVICO_CRIAR: '/admin/servicos',
  ADMIN_SERVICO_DETALHES: (id: number) => `/admin/servicos/${id}`,
  ADMIN_SERVICO_ATUALIZAR: (id: number) => `/admin/servicos/${id}`,
  ADMIN_SERVICO_DELETAR: (id: number) => `/admin/servicos/${id}`,

  // ==========================================
  // 24. ADMIN - GESTÃO DE PEDIDOS
  // ==========================================
  ADMIN_PEDIDOS: '/admin/pedidos',
  ADMIN_PEDIDO_DETALHES: (id: number) => `/admin/pedidos/${id}`,
  ADMIN_PEDIDO_STATUS: (id: number) => `/admin/pedidos/${id}/status`,
  ADMIN_PEDIDO_CANCELAR: (id: number) => `/admin/pedidos/${id}/cancel`,

  // ==========================================
  // 25. ADMIN - GESTÃO DE AVALIAÇÕES
  // ==========================================
  ADMIN_AVALIACOES: '/admin/avaliacoes',
  ADMIN_AVALIACAO_DETALHES: (id: number) => `/admin/avaliacoes/${id}`,
  ADMIN_AVALIACAO_DELETAR: (id: number) => `/admin/avaliacoes/${id}`,

  // ==========================================
  // 26. ADMIN - FINANCEIRO
  // ==========================================
  ADMIN_FINANCEIRO_RESUMO: '/admin/financeiro/resumo',
  ADMIN_FINANCEIRO_TRANSACOES: '/admin/financeiro/transacoes',
  ADMIN_FINANCEIRO_TRANSACAO_DETALHES: (id: number) => `/admin/financeiro/transacoes/${id}`,
  ADMIN_FINANCEIRO_TRANSACAO_CRIAR: '/admin/financeiro/transacoes',
  ADMIN_FINANCEIRO_TRANSACAO_STATUS: (id: number) => `/admin/financeiro/transacoes/${id}/status`,

  // ==========================================
  // 27. ADMIN - RELATÓRIOS
  // ==========================================
  ADMIN_RELATORIO_USUARIOS: '/admin/relatorios/usuarios',
  ADMIN_RELATORIO_SERVICOS: '/admin/relatorios/servicos',
  ADMIN_RELATORIO_FINANCEIRO: '/admin/relatorios/financeiro',
  ADMIN_RELATORIO_PRESTADORES: '/admin/relatorios/prestadores',

  // ==========================================
  // 28. ADMIN - DASHBOARD
  // ==========================================
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ATIVIDADE: '/admin/atividade',
  ADMIN_STATS: '/admin/stats',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_CONFIGURACOES: '/admin/configuracoes',
  ADMIN_UPDATE_CONFIGURACOES: '/admin/configuracoes',

  // ==========================================
  // 29. PRESTADOR (rotas específicas)
  // ==========================================
  PRESTADOR_SERVICOS: '/prestador/servicos',
  PRESTADOR_SERVICO_CRIAR: '/prestador/servicos',
  PRESTADOR_SERVICO_ATUALIZAR: (id: number) => `/prestador/servicos/${id}`,
  PRESTADOR_SERVICO_DELETAR: (id: number) => `/prestador/servicos/${id}`,
  PRESTADOR_SERVICO_TOGGLE: (id: number) => `/prestador/servicos/${id}/toggle`,

  PRESTADOR_AGENDA: '/prestador/agenda',
  PRESTADOR_AGENDA_BLOQUEAR: '/prestador/agenda/bloquear',
  PRESTADOR_AGENDA_DESBLOQUEAR: (id: number) => `/prestador/agenda/${id}`,

  PRESTADOR_SOLICITACOES: '/prestador/solicitacoes',
  PRESTADOR_SOLICITACAO_ACEITAR: (id: number) => `/prestador/solicitacoes/${id}/aceitar`,
  PRESTADOR_SOLICITACAO_RECUSAR: (id: number) => `/prestador/solicitacoes/${id}/recusar`,

  PRESTADOR_CATEGORIAS: '/prestador/categorias',
  PRESTADOR_CATEGORIA_ADD: (categoriaId: number) => `/prestador/categorias/${categoriaId}`,
  PRESTADOR_CATEGORIA_REMOVE: (categoriaId: number) => `/prestador/categorias/${categoriaId}`,

  PRESTADOR_SAQUES: '/prestador/saques',
  PRESTADOR_SAQUE_SOLICITAR: '/prestador/saques',
  PRESTADOR_SAQUE_HISTORICO: '/prestador/saques/historico',

  PRESTADOR_INTERVALOS: '/prestador/intervalos',
  PRESTADOR_INTERVALO_CRIAR: '/prestador/intervalos',
  PRESTADOR_INTERVALO_ATUALIZAR: (id: number) => `/prestador/intervalos/${id}`,
  PRESTADOR_INTERVALO_DELETAR: (id: number) => `/prestador/intervalos/${id}`,

  PRESTADOR_GANHOS: '/prestador/ganhos',
  PRESTADOR_DISPONIBILIDADE: '/prestador/disponibilidade',
  PRESTADOR_UPDATE_DISPONIBILIDADE: '/prestador/disponibilidade',
  PRESTADOR_PROXIMOS_SERVICOS: '/prestador/proximos-servicos',
  PRESTADOR_AVALIACOES_RECENTES: '/prestador/avaliacoes/recentes',
  PRESTADOR_STATS: '/prestador/stats',
  PRESTADOR_CLEAR_CACHE: '/prestador/clear-cache',

  // ==========================================
  // 30. MONITORAMENTO DE SISTEMA
  // ==========================================
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_METRICS: '/system/metrics',
  SYSTEM_PERFORMANCE: '/system/performance',
  SYSTEM_CACHE_STATS: '/system/cache-stats',
  SYSTEM_DATABASE_STATS: '/system/database-stats',
  SYSTEM_QUEUE_STATS: '/system/queue-stats',
  SYSTEM_LOGS_RECENT: '/system/logs/recent',
  SYSTEM_ALERTS: '/system/alerts',

  // ==========================================
  // 31. TESTE
  // ==========================================
  TEST: '/test',
} as const;

export type ClienteEndpoints = typeof CLIENTE_ENDPOINTS;
