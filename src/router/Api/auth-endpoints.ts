/**
 * Endpoints de Autenticação da API
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 */
export const AUTH_ENDPOINTS = {
  // ==========================================
  // AUTENTICAÇÃO (pública)
  // ==========================================

  // Login
  LOGIN: '/auth/login',

  // Logout (requer autenticação)
  LOGOUT: '/auth/logout',

  // Verificar token (requer autenticação)
  VERIFY_TOKEN: '/auth/verify-token',

  // ==========================================
  // RECUPERAÇÃO DE SENHA (pública)
  // ==========================================

  // Solicitar recuperação
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Resetar senha com token
  RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,

  // ==========================================
  // VERIFICAÇÕES DE DISPONIBILIDADE (pública)
  // ==========================================

  // Verificar email
  CHECK_EMAIL: (email: string) => `/check-email?email=${encodeURIComponent(email)}`,

  // Verificar telefone
  CHECK_PHONE: (phone: string) => `/check-phone?phone=${encodeURIComponent(phone)}`,

  // ==========================================
  // VERIFICAÇÃO DE EMAIL (pública)
  // ==========================================

  // Verificar email com token
  VERIFY_EMAIL: (token: string) => `/auth/verify-email/${token}`,

  // Reenviar verificação
  RESEND_VERIFICATION: (email: string) =>
    `/auth/resend-verification?email=${encodeURIComponent(email)}`,
} as const;

export type AuthEndpoints = typeof AUTH_ENDPOINTS;
