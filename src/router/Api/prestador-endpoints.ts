/**
 * Endpoints completos da API para Prestador
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 */
export const PRESTADOR_ENDPOINTS = {
  // ==========================================
  // 1. REGISTRO DO PRESTADOR
  // ==========================================
  REGISTER: '/register/prestador',

  // ==========================================
  // 2. PERFIL DO PRESTADOR
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
  PRESTADOR_STATS: '/prestador/stats',
  RECENT_ACTIVITIES: '/activities/recent',
  ACTIVITIES_HISTORY: '/activities',

  // ==========================================
  // 4. NOTIFICAÇÕES
  // ==========================================
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

  // ==========================================
  // 5. SERVIÇOS DO PRESTADOR
  // ==========================================
  SERVICOS: '/prestador/servicos',
  CRIAR_SERVICO: '/prestador/servicos',
  ATUALIZAR_SERVICO: (id: string) => `/prestador/servicos/${id}`,
  DELETAR_SERVICO: (id: string) => `/prestador/servicos/${id}`,
  TOGGLE_SERVICO: (id: string) => `/prestador/servicos/${id}/toggle`,

  // ==========================================
  // 6. AGENDA DO PRESTADOR
  // ==========================================
  AGENDA: '/prestador/agenda',
  BLOQUEAR_HORARIO: '/prestador/agenda/bloquear',
  DESBLOQUEAR_HORARIO: (id: string) => `/prestador/agenda/${id}`,

  // ==========================================
  // 7. SOLICITAÇÕES/PEDIDOS
  // ==========================================
  SOLICITACOES: '/prestador/solicitacoes',
  SOLICITACOES_BY_STATUS: (status: string) => `/prestador/solicitacoes?status=${status}`,
  ACEITAR_SOLICITACAO: (id: string) => `/prestador/solicitacoes/${id}/aceitar`,
  RECUSAR_SOLICITACAO: (id: string) => `/prestador/solicitacoes/${id}/recusar`,

  // ==========================================
  // 8. CATEGORIAS DO PRESTADOR
  // ==========================================
  MINHAS_CATEGORIAS: '/prestador/categorias',
  ADICIONAR_CATEGORIA: (categoriaId: string) => `/prestador/categorias/${categoriaId}`,
  REMOVER_CATEGORIA: (categoriaId: string) => `/prestador/categorias/${categoriaId}`,

  // ==========================================
  // 9. CONFIGURAÇÕES E PREFERÊNCIAS
  // ==========================================
  PREFERENCES: '/preferences',
  UPDATE_PREFERENCES: '/preferences',

  // ==========================================
  // 10. ENDEREÇOS
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
  PRESTADORES_LIST: '/prestadores',
  PRESTADORES_BY_CATEGORIA: (categoriaId: number) => `/prestadores?categoria=${categoriaId}`,
  PRESTADORES_BY_BUSCA: (busca: string) => `/prestadores?busca=${encodeURIComponent(busca)}`,
  PRESTADOR_DETALHES: (id: string) => `/prestadores/${id}`,
  PRESTADOR_AVALIACOES: (id: string) => `/prestadores/${id}/avaliacoes`,
  PRESTADORES_DESTAQUE: '/prestadores/destaque',
  PRESTADORES_TOP: '/prestadores/top',
  PRESTADORES_PROXIMOS: (lat: number, lng: number) => `/prestadores/proximos?lat=${lat}&lng=${lng}`,
  PROXIMOS_SERVICOS: '/prestador/proximos-servicos',
  AVALIACOES_RECENTES: '/prestador/avaliacoes/recentes',
  PRESTADORES_CATEGORIAS: '/prestadores/categorias',

  // ==========================================
  // 12. FINANCEIRO DO PRESTADOR
  // ==========================================
  GANHOS: '/prestador/ganhos',
  SAQUES: '/prestador/saques',
  SOLICITAR_SAQUE: '/prestador/saques',
  HISTORICO_SAQUES: '/prestador/saques/historico',

  // ==========================================
  // 13. INTERVALOS DO PRESTADOR (NOVO)
  // ==========================================
  INTERVALOS: '/prestador/intervalos',
  CRIAR_INTERVALO: '/prestador/intervalos',
  ATUALIZAR_INTERVALO: (id: string) => `/prestador/intervalos/${id}`,
  DELETAR_INTERVALO: (id: string) => `/prestador/intervalos/${id}`,

  // ==========================================
  // 14. DISPONIBILIDADE DO PRESTADOR (NOVO)
  // ==========================================
  DISPONIBILIDADE: '/prestador/disponibilidade',
  ATUALIZAR_DISPONIBILIDADE: '/prestador/disponibilidade',

  // ==========================================
  // 15. DADOS AUXILIARES (NOVOS - PÚBLICOS)
  // ==========================================
  AUX_DIAS_SEMANA: '/auxiliar/dias-semana',
  AUX_MESES: '/auxiliar/meses',
  AUX_DIAS_OPTIONS: '/auxiliar/dias-options',
  AUX_HORARIOS_PADRAO: '/auxiliar/horarios-padrao',
  AUX_HORARIOS_OPTIONS: '/auxiliar/horarios-options',

  // ==========================================
  // 16. TIPOS DE SERVIÇO (NOVO)
  // ==========================================
  SERVICO_TIPOS: '/servico-tipos',
  SERVICO_TIPOS_OPTIONS: '/servico-tipos/options',

  // ==========================================
  // 17. OPÇÕES DE RAIO (NOVO)
  // ==========================================
  RAIO_OPCOES: '/raio-opcoes',
  RAIO_OPCOES_OPTIONS: '/raio-opcoes/options',
} as const;

export type PrestadorEndpoints = typeof PRESTADOR_ENDPOINTS;
