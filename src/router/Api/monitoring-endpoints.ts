// src/router/Api/monitoring-endpoints.ts

export const MONITORING_ENDPOINTS = {
  // ==========================================
  // SAÚDE E BÁSICO
  // ==========================================
  HEALTH: '/system/health',
  DASHBOARD: '/system/dashboard',
  METRICS: '/system/metrics',
  PERFORMANCE: '/system/performance',

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================
  CACHE_STATS: '/system/cache-stats',
  DATABASE_STATS: '/system/database-stats',
  QUEUE_STATS: '/system/queue-stats',
  LOGS_RECENT: '/system/logs/recent',

  // ==========================================
  // ALERTAS
  // ==========================================
  ALERTS: '/system/alerts',
  RESOLVE_ALERT: (id: number) => `/system/alerts/${id}/resolve`,

  // ==========================================
  // MÉTRICAS DE NEGÓCIO
  // ==========================================
  BUSINESS_METRICS: '/system/business-metrics',
  BUSINESS_ADVANCED: '/system/business/advanced',
  HISTORY: (days: number = 30) => `/system/history?days=${days}`,
  EXPORT: (format: string = 'json') => `/system/export?format=${format}`,

  // ==========================================
  // SEGURANÇA
  // ==========================================
  SECURITY_METRICS: '/system/security-metrics',
  SECURITY_REALTIME: '/system/security/realtime',
  BLOCK_IP: '/system/security/block-ip',

  // ==========================================
  // DEPENDÊNCIAS EXTERNAS
  // ==========================================
  EXTERNAL_SERVICES: '/system/external-services',
  EXTERNAL_CHECK: '/system/external/check',

  // ==========================================
  // PERFORMANCE DETALHADA
  // ==========================================
  SLOW_QUERIES: (hours: number = 24) => `/system/slow-queries?hours=${hours}`,
  SLOW_ENDPOINTS: (hours: number = 24) => `/system/performance/endpoints?hours=${hours}`,
  STATUS_CODES: (hours: number = 24) => `/system/performance/status-codes?hours=${hours}`,

  // ==========================================
  // FRONTEND E PREDIÇÕES
  // ==========================================
  FRONTEND_METRICS: '/system/frontend-metrics',
  PREDICTIONS: '/system/predictions',
  EXECUTIVE_REPORT: '/system/executive-report',

  // ==========================================
  // TAREFAS
  // ==========================================
  SAVE_DAILY_METRICS: '/system/save-daily-metrics',

  // ==========================================
  // MÉTRICAS DE INFRAESTRUTURA
  // ==========================================
  INFRASTRUCTURE_METRICS: '/system/infrastructure-metrics',
} as const;

export type MonitoringEndpoints = typeof MONITORING_ENDPOINTS;
