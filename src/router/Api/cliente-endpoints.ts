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
  CRIAR_PEDIDO: '/cliente/pedidos',                                    // POST - Criar pedido
  MEUS_PEDIDOS: '/cliente/pedidos/meus-pedidos',                       // ✅ GET - Listar meus pedidos (CORRIGIDO)
  DETALHES_PEDIDO: (id: string | number) => `/cliente/pedidos/${id}`,  // GET - Detalhes de um pedido
  CANCELAR_PEDIDO_CLIENTE: (id: string | number) => `/cliente/pedidos/${id}/cancelar`, // PUT - Cancelar pedido
  CHECK_PEDIDO_AVALIACAO: (pedidoId: string | number) => `/cliente/pedidos/${pedidoId}/avaliacao`, // GET - Verificar avaliação

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
  // 10. PROPOSTAS DO CLIENTE
  // ==========================================
  PROPOSTAS: '/cliente/propostas',
  ACEITAR_PROPOSTA: (id: number) => `/cliente/propostas/${id}/aceitar`,
  RECUSAR_PROPOSTA: (id: number) => `/cliente/propostas/${id}/recusar`,

  // ==========================================
  // 11. PRESTADORES (consulta pública)
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
  // 12. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================
  PREFERENCES: '/preferences',
  UPDATE_PREFERENCES: '/preferences',

  // ==========================================
  // 13. ENDEREÇOS DO USUÁRIO
  // ==========================================
  ADDRESSES: '/addresses',
  CREATE_ADDRESS: '/addresses',
  GET_ADDRESS: (id: string) => `/addresses/${id}`,
  UPDATE_ADDRESS: (id: string) => `/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `/addresses/${id}`,
  SET_PRIMARY_ADDRESS: (id: string) => `/addresses/${id}/primary`,

  // ==========================================
  // 14. LOCALIZAÇÃO
  // ==========================================
  LOCALIZACAO: '/localizacao',
  UPDATE_LOCALIZACAO: '/localizacao',
  PRESTADORES_PROXIMOS_LOCAL: (lat: number, lng: number, raio?: number) =>
    `/localizacao/prestadores-proximos?latitude=${lat}&longitude=${lng}${raio ? `&raio=${raio}` : ''}`,

  // ==========================================
  // 15. CHAT
  // ==========================================
  CHAT_MESSAGES: (prestadorId: number) => `/chat/messages/${prestadorId}`,
  CHAT_SEND_MESSAGE: '/chat/messages',
  CHAT_LATEST_MESSAGES: (prestadorId: number, lastId?: number) =>
    `/chat/messages/${prestadorId}/latest${lastId ? `?last_id=${lastId}` : ''}`,
  CHAT_MARK_AS_READ: (prestadorId: number) => `/chat/messages/${prestadorId}/read`,
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_UNREAD_COUNT: '/chat/unread-count',

  // ==========================================
  // 16. PROMOÇÕES (públicas)
  // ==========================================
  PROMOCOES: '/promocoes',
  PROMOCOES_ATIVAS: '/promocoes/ativas',
  PROMOCOES_ID: (id: number) => `/promocoes/${id}`,
  PROMOCOES_CODIGO: (codigo: string) => `/promocoes/codigo/${encodeURIComponent(codigo)}`,
  VALIDAR_CUPOM: '/promocoes/validar',

  // ==========================================
  // 17. AUXILIAR (dados de configuração)
  // ==========================================
  AUX_DIAS_SEMANA: '/auxiliar/dias-semana',
  AUX_MESES: '/auxiliar/meses',
  AUX_DIAS_OPTIONS: '/auxiliar/dias-options',
  AUX_HORARIOS_PADRAO: '/auxiliar/horarios-padrao',
  AUX_HORARIOS_OPTIONS: '/auxiliar/horarios-options',

  // ==========================================
  // 18. TIPOS DE SERVIÇO (PÚBLICOS)
  // ==========================================
  SERVICO_TIPOS: '/public/servico-tipos',
  SERVICO_TIPOS_OPTIONS: '/public/servico-tipos/options',

  // ==========================================
  // 19. OPÇÕES DE RAIO (PÚBLICOS)
  // ==========================================
  RAIO_OPCOES: '/public/raio-opcoes',
  RAIO_OPCOES_OPTIONS: '/public/raio-opcoes/options',

  // ==========================================
  // 20. CATEGORIAS (PÚBLICAS)
  // ==========================================
  CATEGORIAS_PUBLICAS: '/public/categorias',

  // ==========================================
  // 21. MONITORAMENTO (público)
  // ==========================================
  SYSTEM_HEALTH: '/system/health',

  // ==========================================
  // 22. TESTE
  // ==========================================
  TEST: '/test',
} as const;

export type ClienteEndpoints = typeof CLIENTE_ENDPOINTS;
