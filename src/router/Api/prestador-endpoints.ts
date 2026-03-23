/**
 * Endpoints completos da API para Prestador
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 * (Sem rotas de autenticação - movidas para auth-endpoints.ts)
 */
export const PRESTADOR_ENDPOINTS = {
  // ==========================================
  // 1. REGISTRO DO PRESTADOR
  // ==========================================

  // Registro inicial
  REGISTER: '/register/prestador',

  // ==========================================
  // 2. PERFIL DO PRESTADOR (compartilhado com UsuarioController)
  // ==========================================

  // Obter perfil
  GET_PROFILE: '/me',

  // Atualizar perfil
  UPDATE_PROFILE: '/me',

  // Atualizar foto de perfil
  UPDATE_AVATAR: '/avatar',

  // Remover foto de perfil
  REMOVE_AVATAR: '/avatar',

  // Alterar senha
  CHANGE_PASSWORD: '/password',

  // Deletar conta
  DELETE_ACCOUNT: '/me',

  // Upload temporário de foto
  UPLOAD_PHOTO: '/upload-temp',

  // ==========================================
  // 3. DASHBOARD E ESTATÍSTICAS
  // ==========================================

  // Dashboard principal
  DASHBOARD: '/dashboard',

  // Estatísticas do prestador
  PRESTADOR_STATS: '/prestador/stats',

  // Atividades recentes
  RECENT_ACTIVITIES: '/activities/recent',

  // Histórico completo
  ACTIVITIES_HISTORY: '/activities',

  // ==========================================
  // 4. NOTIFICAÇÕES (compartilhado)
  // ==========================================

  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

  // ==========================================
  // 5. SERVIÇOS DO PRESTADOR
  // ==========================================

  // Listar serviços
  SERVICOS: '/prestador/servicos',

  // Criar serviço
  CRIAR_SERVICO: '/prestador/servicos',

  // Atualizar serviço
  ATUALIZAR_SERVICO: (id: string) => `/prestador/servicos/${id}`,

  // Deletar serviço
  DELETAR_SERVICO: (id: string) => `/prestador/servicos/${id}`,

  // Ativar/Desativar serviço
  TOGGLE_SERVICO: (id: string) => `/prestador/servicos/${id}/toggle`,

  // ==========================================
  // 6. AGENDA DO PRESTADOR
  // ==========================================

  // Listar agenda
  AGENDA: '/prestador/agenda',

  // Bloquear horário
  BLOQUEAR_HORARIO: '/prestador/agenda/bloquear',

  // Desbloquear horário
  DESBLOQUEAR_HORARIO: (id: string) => `/prestador/agenda/${id}`,

  // ==========================================
  // 7. SOLICITAÇÕES/PEDIDOS
  // ==========================================

  // Listar solicitações
  SOLICITACOES: '/prestador/solicitacoes',

  // Filtrar por status
  SOLICITACOES_BY_STATUS: (status: string) => `/prestador/solicitacoes?status=${status}`,

  // Aceitar solicitação
  ACEITAR_SOLICITACAO: (id: string) => `/prestador/solicitacoes/${id}/aceitar`,

  // Recusar solicitação
  RECUSAR_SOLICITACAO: (id: string) => `/prestador/solicitacoes/${id}/recusar`,

  // ==========================================
  // 8. CATEGORIAS DO PRESTADOR
  // ==========================================

  // Listar categorias que atende
  MINHAS_CATEGORIAS: '/prestador/categorias',

  // Adicionar categoria
  ADICIONAR_CATEGORIA: (categoriaId: string) => `/prestador/categorias/${categoriaId}`,

  // Remover categoria
  REMOVER_CATEGORIA: (categoriaId: string) => `/prestador/categorias/${categoriaId}`,

  // ==========================================
  // 9. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================

  // Preferências (compartilhado)
  PREFERENCES: '/preferences',
  UPDATE_PREFERENCES: '/preferences',

  // ==========================================
  // 10. ENDEREÇOS (compartilhado)
  // ==========================================

  ADDRESSES: '/addresses',
  CREATE_ADDRESS: '/addresses',
  GET_ADDRESS: (id: string) => `/addresses/${id}`,
  UPDATE_ADDRESS: (id: string) => `/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `/addresses/${id}`,
  SET_PRIMARY_ADDRESS: (id: string) => `/addresses/${id}/primary`,

  // ==========================================
  // 11. PRESTADORES (consulta pública)
  // ==========================================

  // Listar prestadores
  PRESTADORES_LIST: '/prestadores',

  // Filtrar por categoria
  PRESTADORES_BY_CATEGORIA: (categoriaId: number) => `/prestadores?categoria=${categoriaId}`,

  // Buscar por nome
  PRESTADORES_BY_BUSCA: (busca: string) => `/prestadores?busca=${encodeURIComponent(busca)}`,

  // Detalhes do prestador
  PRESTADOR_DETALHES: (id: string) => `/prestadores/${id}`,

  // Avaliações do prestador
  PRESTADOR_AVALIACOES: (id: string) => `/prestadores/${id}/avaliacoes`,

  // Prestadores em destaque
  PRESTADORES_DESTAQUE: '/prestadores/destaque',

  // Mais bem avaliados
  PRESTADORES_TOP: '/prestadores/top',

  // Prestadores próximos
  PRESTADORES_PROXIMOS: (lat: number, lng: number) => `/prestadores/proximos?lat=${lat}&lng=${lng}`,

  // Categorias de prestadores (público)
  PRESTADORES_CATEGORIAS: '/prestadores/categorias',

  // ==========================================
  // 12. FINANCEIRO DO PRESTADOR
  // ==========================================

  // Ganhos
  GANHOS: '/prestador/ganhos',
  SAQUES: '/prestador/saques',
  SOLICITAR_SAQUE: '/prestador/saques',
  HISTORICO_SAQUES: '/prestador/saques/historico',
} as const;

export type PrestadorEndpoints = typeof PRESTADOR_ENDPOINTS;
