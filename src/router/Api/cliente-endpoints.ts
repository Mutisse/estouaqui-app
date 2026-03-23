/**
 * Endpoints completos da API para Cliente
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 * (Sem rotas de autenticação - movidas para auth-endpoints.ts)
 */
export const CLIENTE_ENDPOINTS = {
  // ==========================================
  // 1. REGISTRO DO CLIENTE
  // ==========================================

  // Registro inicial
  REGISTER: '/register/cliente',

  // ==========================================
  // 2. PERFIL DO CLIENTE
  // ==========================================

  // Obter perfil do cliente logado
  GET_PROFILE: '/me',

  // Atualizar perfil
  UPDATE_PROFILE: '/me',

  // Atualizar foto de perfil
  UPDATE_AVATAR: '/avatar',

  // Remover foto de perfil
  REMOVE_AVATAR: '/avatar',

  // Alterar senha
  CHANGE_PASSWORD: '/password',

  // Deletar conta (soft delete)
  DELETE_ACCOUNT: '/me',

  // Upload temporário de foto
  UPLOAD_PHOTO: '/upload-temp',

  // ==========================================
  // 3. DASHBOARD E ESTATÍSTICAS
  // ==========================================

  // Dashboard principal (resumo)
  DASHBOARD: '/dashboard',

  // Estatísticas gerais
  STATS: '/stats',

  // Atividades recentes
  RECENT_ACTIVITIES: '/activities/recent',

  // Histórico completo
  ACTIVITIES_HISTORY: '/activities',

  // ==========================================
  // 4. NOTIFICAÇÕES
  // ==========================================

  // Listar notificações
  NOTIFICATIONS: '/notifications',

  // Marcar notificação como lida
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,

  // Marcar todas como lidas
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

  // ==========================================
  // 5. PEDIDOS DO CLIENTE
  // ==========================================

  // Listar pedidos do cliente
  PEDIDOS: '/cliente/pedidos',

  // Listar pedidos por status
  PEDIDOS_BY_STATUS: (status: string) => `/cliente/pedidos?status=${status}`,

  // Detalhes do pedido
  PEDIDO_DETALHES: (id: string) => `/cliente/pedidos/${id}`,

  // Criar pedido
  CRIAR_PEDIDO: '/cliente/pedidos',

  // Cancelar pedido
  CANCELAR_PEDIDO: (id: string) => `/cliente/pedidos/${id}/cancelar`,

  // Verificar se já avaliou o pedido
  CHECK_PEDIDO_AVALIACAO: (pedidoId: string) => `/cliente/pedidos/${pedidoId}/avaliacao`,

  // ==========================================
  // 6. AVALIAÇÕES DO CLIENTE
  // ==========================================

  // Listar avaliações do cliente
  AVALIACOES: '/cliente/avaliacoes',

  // Criar avaliação
  CRIAR_AVALIACAO: '/cliente/avaliacoes',

  // Atualizar avaliação
  ATUALIZAR_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,

  // Remover avaliação
  REMOVER_AVALIACAO: (id: string) => `/cliente/avaliacoes/${id}`,

  // ==========================================
  // 7. FAVORITOS
  // ==========================================

  // Listar favoritos
  FAVORITOS: '/cliente/favoritos',

  // Adicionar favorito
  ADICIONAR_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,

  // Remover favorito
  REMOVER_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}`,

  // Verificar se é favorito
  CHECK_FAVORITO: (prestadorId: string) => `/cliente/favoritos/${prestadorId}/check`,

  // ==========================================
  // 8. PRESTADORES (consulta pública)
  // ==========================================

  // Listar prestadores
  PRESTADORES_LIST: '/prestadores',

  // Filtrar prestadores por categoria
  PRESTADORES_BY_CATEGORIA: (categoriaId: number) => `/prestadores?categoria=${categoriaId}`,

  // Buscar prestadores por nome
  PRESTADORES_BY_BUSCA: (busca: string) => `/prestadores?busca=${encodeURIComponent(busca)}`,

  // Detalhes do prestador
  PRESTADOR_DETALHES: (id: string) => `/prestadores/${id}`,

  // Avaliações do prestador
  PRESTADOR_AVALIACOES: (id: string) => `/prestadores/${id}/avaliacoes`,

  // Prestadores em destaque
  PRESTADORES_DESTAQUE: '/prestadores/destaque',

  // Prestadores mais bem avaliados
  PRESTADORES_TOP: '/prestadores/top',

  // Prestadores próximos (com base na localização)
  PRESTADORES_PROXIMOS: (lat: number, lng: number) => `/prestadores/proximos?lat=${lat}&lng=${lng}`,

  // Categorias de prestadores
  PRESTADORES_CATEGORIAS: '/prestadores/categorias',

  // ==========================================
  // 9. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================

  // Preferências do usuário
  PREFERENCES: '/preferences',

  // Atualizar preferências
  UPDATE_PREFERENCES: '/preferences',

  // Atualizar tema (dark/light)
  THEME: '/preferences/theme',

  // Atualizar idioma
  LANGUAGE: '/preferences/language',

  // Atualizar notificações push
  PUSH_NOTIFICATIONS: '/preferences/push',

  // ==========================================
  // 10. ENDEREÇOS DO CLIENTE
  // ==========================================

  // Listar endereços
  ADDRESSES: '/addresses',

  // Criar endereço
  CREATE_ADDRESS: '/addresses',

  // Obter endereço específico
  GET_ADDRESS: (id: string) => `/addresses/${id}`,

  // Atualizar endereço
  UPDATE_ADDRESS: (id: string) => `/addresses/${id}`,

  // Deletar endereço
  DELETE_ADDRESS: (id: string) => `/addresses/${id}`,

  // Definir endereço principal
  SET_PRIMARY_ADDRESS: (id: string) => `/addresses/${id}/primary`,
} as const;

export type ClienteEndpoints = typeof CLIENTE_ENDPOINTS;
