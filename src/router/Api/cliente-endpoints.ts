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

  // ==========================================
  // 2. PERFIL DO CLIENTE
  // ==========================================
  GET_PROFILE: '/me',
  UPDATE_PROFILE: '/me',
  UPDATE_AVATAR: '/avatar',
  REMOVE_AVATAR: '/avatar',
  CHANGE_PASSWORD: '/password',
  DELETE_ACCOUNT: '/me',
  UPLOAD_PHOTO: '/upload-temp',

  // ==========================================
  // 3. DASHBOARD E ESTATÍSTICAS
  // ==========================================
  DASHBOARD: '/dashboard',
  STATS: '/stats',
  RECENT_ACTIVITIES: '/activities/recent',
  ACTIVITIES_HISTORY: '/activities',

  // ==========================================
  // 4. NOTIFICAÇÕES
  // ==========================================
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

  // ==========================================
  // 5. PEDIDOS DO CLIENTE
  // ==========================================
  PEDIDOS: '/cliente/pedidos',
  PEDIDOS_BY_STATUS: (status: string) => `/cliente/pedidos?status=${status}`,
  PEDIDO_DETALHES: (id: string) => `/cliente/pedidos/${id}`,
  CRIAR_PEDIDO: '/cliente/pedidos',
  CANCELAR_PEDIDO: (id: string) => `/cliente/pedidos/${id}/cancelar`,
  CHECK_PEDIDO_AVALIACAO: (pedidoId: string) => `/cliente/pedidos/${pedidoId}/avaliacao`,

  // ==========================================
  // 6. AVALIAÇÕES DO CLIENTE
  // ==========================================
  AVALIACOES: '/cliente/avaliacoes',
  CRIAR_AVALIACAO: '/cliente/avaliacoes',
  ATUALIZAR_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,
  REMOVER_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,

  // ==========================================
  // 7. FAVORITOS
  // ==========================================
  FAVORITOS: '/cliente/favoritos',
  ADICIONAR_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,
  REMOVER_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,
  CHECK_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}/check`,

  // ==========================================
  // 8. PRESTADORES (consulta pública)
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
  // 9. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================
  PREFERENCES: '/preferences',
  UPDATE_PREFERENCES: '/preferences',
  THEME: '/preferences/theme',
  LANGUAGE: '/preferences/language',
  PUSH_NOTIFICATIONS: '/preferences/push',

  // ==========================================
  // 10. ENDEREÇOS DO CLIENTE
  // ==========================================
  ADDRESSES: '/addresses',
  CREATE_ADDRESS: '/addresses',
  GET_ADDRESS: (id: string) => `/addresses/${id}`,
  UPDATE_ADDRESS: (id: string) => `/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `/addresses/${id}`,
  SET_PRIMARY_ADDRESS: (id: string) => `/addresses/${id}/primary`,

  // ==========================================
  // 11. CHAT
  // ==========================================
  CHAT_MESSAGES: (prestadorId: number) => `/chat/messages/${prestadorId}`,
  CHAT_SEND_MESSAGE: '/chat/messages',
  CHAT_LATEST_MESSAGES: (prestadorId: number, lastId?: number) =>
    `/chat/messages/${prestadorId}/latest${lastId ? `?last_id=${lastId}` : ''}`,
  CHAT_MARK_AS_READ: (prestadorId: number) => `/chat/messages/${prestadorId}/read`,
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_UNREAD_COUNT: '/chat/unread-count',

  // ==========================================
  // 12. PROMOÇÕES
  // ==========================================
  PROMOCOES: '/promocoes',
  PROMOCOES_ATIVAS: '/promocoes/ativas',
  PROMOCOES_ID: (id: number) => `/promocoes/${id}`,
  PROMOCOES_CODIGO: (codigo: string) => `/promocoes/codigo/${encodeURIComponent(codigo)}`,
  VALIDAR_CUPOM: '/promocoes/validar',

  // ==========================================
  // 13. ADMIN - GESTÃO DE PROMOÇÕES
  // ==========================================
  ADMIN_PROMOCOES: '/admin/promocoes',
  ADMIN_PROMOCOES_CREATE: '/admin/promocoes',
  ADMIN_PROMOCOES_UPDATE: (id: number) => `/admin/promocoes/${id}`,
  ADMIN_PROMOCOES_DELETE: (id: number) => `/admin/promocoes/${id}`,
} as const;

export type ClienteEndpoints = typeof CLIENTE_ENDPOINTS;
