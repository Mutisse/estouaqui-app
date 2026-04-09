// src/router/Api/auth-endpoints.ts

/**
 * Endpoints de Autenticação da API
 * ALINHADOS COM AS ROTAS DO BACKEND LARAVEL
 */
export const AUTH_ENDPOINTS = {
  // ==========================================
  // AUTENTICAÇÃO (pública)
  // ==========================================

  // Login - POST /api/login
  LOGIN: '/login',

  // Logout - POST /api/auth/logout (requer autenticação)
  LOGOUT: '/auth/logout',

  // Verificar token - GET /api/auth/verify-token (requer autenticação)
  VERIFY_TOKEN: '/auth/verify-token',

  // ==========================================
  // RECUPERAÇÃO DE SENHA (pública)
  // ==========================================

  // Solicitar recuperação - POST /api/auth/forgot-password
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Resetar senha com token - POST /api/auth/reset-password/{token}
  RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,

  // ==========================================
  // VERIFICAÇÕES DE DISPONIBILIDADE (pública)
  // ==========================================

  // Verificar email - GET /api/check-email?email=xxx
  CHECK_EMAIL: (email: string) => `/check-email?email=${encodeURIComponent(email)}`,

  // Verificar telefone - GET /api/check-phone?phone=xxx
  CHECK_PHONE: (phone: string) => `/check-phone?phone=${encodeURIComponent(phone)}`,

  // ==========================================
  // VERIFICAÇÃO DE EMAIL (pública)
  // ==========================================

  // Verificar email com token - GET /api/auth/verify-email/{token}
  VERIFY_EMAIL: (token: string) => `/auth/verify-email/${token}`,

  // Reenviar verificação - GET /api/auth/resend-verification?email=xxx
  RESEND_VERIFICATION: (email: string) =>
    `/auth/resend-verification?email=${encodeURIComponent(email)}`,
} as const;

export type AuthEndpoints = typeof AUTH_ENDPOINTS;
