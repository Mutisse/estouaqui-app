// src/stores/monitoring-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { MONITORING_ENDPOINTS } from 'src/router/Api/monitoring-endpoints';

// ==========================================
// INTERFACES
// ==========================================

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  environment: string;
  checks: {
    app: { name: string; environment: string; debug: boolean; url: string; timezone: string };
    database: { status: string; connection?: string; response_time_ms?: number; error?: string };
    cache: { status: string; driver?: string; response_time_ms?: number; error?: string };
    storage: {
      status: string;
      disk?: string;
      free_space_gb?: number;
      total_space_gb?: number;
      error?: string;
    };
  };
  response_time_ms: number;
}

export interface PerformanceMetrics {
  period: string;
  avg_response_time: number;
  requests_per_minute: number;
  error_rate: number;
  slow_queries: number;
  cache_hit_rate: number;
  timestamp: string;
}

export interface BusinessMetrics {
  users: { total: number; new_today: number; new_week: number; new_month: number };
  services: { total: number };
  orders: { total: number; completed: number; pending: number };
  revenue: { total: number; today: number; month: number };
  reviews: { total: number; average_rating: number };
}

export interface AdvancedBusinessMetrics {
  conversion_rate: number;
  churn_rate: number;
  customer_ltv: number;
  customer_cac: number;
  roi_percent: number;
  top_categories: Array<{ nome: string; total_services: number }>;
  peak_hours: Array<{ hour: number; total: number }>;
  health_score: { score: number; rating: string; recommendations: string[] };
}

export interface SecurityMetrics {
  failed_logins_last_hour: number;
  failed_logins_last_day: number;
  critical_events_last_day: number;
}

export interface SecurityRealtime {
  failed_logins_last_hour: number;
  brute_force_detected: boolean;
  brute_force_ips: Array<{ ip: string; attempts: number }>;
  top_offending_ips: Array<{ ip: string; attempts: number }>;
  blocked_ips: string[];
  unauthorized_access_today: number;
  total_security_events_today: number;
  alert: string | null;
}

export interface StatusCodeAnalysis {
  period_hours: number;
  total_requests: number;
  error_rate: number;
  status_codes_distribution: Array<{ status_code: number; total: number }>;
  most_common_error: { status_code: number; total: number } | null;
  alert: string | null;
}

export interface ExternalService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  last_check: string;
}

export interface ExecutiveReport {
  generated_at: string;
  summary: {
    total_users: number;
    new_users_today: number;
    total_revenue: number;
    avg_response_time: number;
    error_rate: number;
  };
  health_metrics: { score: number; rating: string; recommendations: string[] };
  alerts: { total_unresolved: number; critical: number };
  external_services_status: Record<string, ExternalService>;
  security_events: {
    failed_logins_today: number;
    brute_force_detected: boolean;
  };
  predictions: {
    users_growth: number;
    storage_days_left: number;
  };
}

export interface InfrastructureMetrics {
  cpu: { load_1min: number; load_5min: number; load_15min: number };
  memory: { php_used_mb: number; php_peak_mb: number; php_limit_mb: number };
  disk: { total_gb: number; free_gb: number; used_gb: number; usage_percent: number };
}

export interface CacheStats {
  default_driver: string;
  store_available: boolean;
  keys_count: number;
  memory_mb: number;
  hit_rate: number;
}

export interface DatabaseStats {
  connection: string;
  status: string;
  tables?: Array<{ name: string; rows: number; size_mb: number }>;
  total_rows?: number;
  total_size_mb?: number;
  error?: string;
}

export interface QueueStats {
  connection: string;
  total_pending: number;
  total_failed: number;
  workers_active: number;
  queues: Record<string, { pending_jobs: number; failed_jobs: number; status: string }>;
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  message: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface SlowQuery {
  sql_query: string;
  time_ms: number;
  occurred_at: string;
}

export interface SlowEndpoint {
  path: string;
  total_calls: number;
  avg_time: number;
  max_time: number;
}

export interface HistoryData {
  period_days: number;
  metrics: Array<{
    date: string;
    total_requests: number;
    avg_response_time: number;
    error_rate: number;
  }>;
}

export interface FrontendMetrics {
  core_web_vitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
  };
  total_samples: number;
}

export interface PredictionData {
  users: { current: number; predicted_30d: number; growth_rate_percent: number };
  storage: { days_until_full: number; estimated_date: string };
  timestamp: string;
}

// ==========================================
// STORE
// ==========================================

export const useMonitoringStore = defineStore('monitoring', () => {
  // State
  const loading = ref(false);
  const health = ref<HealthCheck | null>(null);
  const performance = ref<PerformanceMetrics | null>(null);
  const businessMetrics = ref<BusinessMetrics | null>(null);
  const advancedBusinessMetrics = ref<AdvancedBusinessMetrics | null>(null);
  const securityMetrics = ref<SecurityMetrics | null>(null);
  const securityRealtime = ref<SecurityRealtime | null>(null);
  const externalServices = ref<ExternalService[]>([]);
  const slowQueries = ref<SlowQuery[]>([]);
  const slowEndpoints = ref<SlowEndpoint[]>([]);
  const statusCodes = ref<StatusCodeAnalysis | null>(null);
  const infrastructureMetrics = ref<InfrastructureMetrics | null>(null);
  const cacheStats = ref<CacheStats | null>(null);
  const databaseStats = ref<DatabaseStats | null>(null);
  const queueStats = ref<QueueStats | null>(null);
  const alerts = ref<Alert[]>([]);
  const executiveReport = ref<ExecutiveReport | null>(null);
  const predictions = ref<PredictionData | null>(null);
  const frontendMetrics = ref<FrontendMetrics | null>(null);

  const pendingRequests = new Map<string, Promise<unknown>>();

  // ==========================================
  // FUNÇÃO DE REQUISIÇÃO COM DEDUPLICAÇÃO
  // ==========================================

  async function requestWithDedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
  }

  // ==========================================
  // MÉTODOS INDIVIDUAIS
  // ==========================================

  const fetchHealth = async (): Promise<HealthCheck> => {
    const cacheKey = 'monitoring_health';

    const data = await requestWithDedupe<HealthCheck>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.HEALTH, { timeout: 10000 });
      health.value = response.data;
      return health.value as HealthCheck;
    });

    return data;
  };

  const fetchPerformance = async (period: string = 'hour'): Promise<PerformanceMetrics> => {
    const cacheKey = `monitoring_performance_${period}`;

    const data = await requestWithDedupe<PerformanceMetrics>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.PERFORMANCE, {
        params: { period },
        timeout: 10000,
      });
      if (response.data.success) {
        performance.value = response.data.data;
        return performance.value as PerformanceMetrics;
      }
      throw new Error('Failed to fetch performance metrics');
    });

    return data;
  };

  const fetchBusinessMetrics = async (): Promise<BusinessMetrics> => {
    const cacheKey = 'monitoring_business_metrics';

    const data = await requestWithDedupe<BusinessMetrics>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.BUSINESS_METRICS, { timeout: 10000 });
      if (response.data.success) {
        businessMetrics.value = response.data.data;
        return businessMetrics.value as BusinessMetrics;
      }
      throw new Error('Failed to fetch business metrics');
    });

    return data;
  };

  const fetchAdvancedBusinessMetrics = async (): Promise<AdvancedBusinessMetrics> => {
    const cacheKey = 'monitoring_advanced_business_metrics';

    const data = await requestWithDedupe<AdvancedBusinessMetrics>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.BUSINESS_ADVANCED, { timeout: 15000 });
      if (response.data.success) {
        advancedBusinessMetrics.value = response.data.data;
        return advancedBusinessMetrics.value as AdvancedBusinessMetrics;
      }
      throw new Error('Failed to fetch advanced business metrics');
    });

    return data;
  };

  const fetchSecurityMetrics = async (): Promise<SecurityMetrics> => {
    const cacheKey = 'monitoring_security_metrics';

    const data = await requestWithDedupe<SecurityMetrics>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.SECURITY_METRICS, { timeout: 10000 });
      if (response.data.success) {
        securityMetrics.value = response.data.data;
        return securityMetrics.value as SecurityMetrics;
      }
      throw new Error('Failed to fetch security metrics');
    });

    return data;
  };

  const fetchSecurityRealtime = async (): Promise<SecurityRealtime> => {
    const cacheKey = 'monitoring_security_realtime';

    const data = await requestWithDedupe<SecurityRealtime>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.SECURITY_REALTIME, { timeout: 10000 });
      if (response.data.success) {
        securityRealtime.value = response.data.data;
        return securityRealtime.value as SecurityRealtime;
      }
      throw new Error('Failed to fetch security realtime');
    });

    return data;
  };

  const fetchExternalServices = async (): Promise<ExternalService[]> => {
    const cacheKey = 'monitoring_external_services';

    const data = await requestWithDedupe<ExternalService[]>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.EXTERNAL_CHECK, { timeout: 10000 });
      if (response.data.success) {
        externalServices.value = response.data.data.services || [];
        return externalServices.value;
      }
      throw new Error('Failed to fetch external services');
    });

    return data;
  };

  const fetchInfrastructureMetrics = async (): Promise<InfrastructureMetrics> => {
    const cacheKey = 'monitoring_infrastructure_metrics';

    const data = await requestWithDedupe<InfrastructureMetrics>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.INFRASTRUCTURE_METRICS, {
        timeout: 10000,
      });
      if (response.data.success) {
        infrastructureMetrics.value = response.data.data;
        return infrastructureMetrics.value as InfrastructureMetrics;
      }
      throw new Error('Failed to fetch infrastructure metrics');
    });

    return data;
  };

  const fetchAlerts = async (showResolved: boolean = false): Promise<Alert[]> => {
    const cacheKey = `monitoring_alerts_${showResolved}`;

    const data = await requestWithDedupe<Alert[]>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.ALERTS, {
        params: { resolved: showResolved },
        timeout: 10000,
      });
      if (response.data.success) {
        alerts.value = response.data.data.alerts || [];
        return alerts.value;
      }
      throw new Error('Failed to fetch alerts');
    });

    return data;
  };

  const resolveAlert = async (id: number): Promise<void> => {
    await api.put(MONITORING_ENDPOINTS.RESOLVE_ALERT(id));
    pendingRequests.delete('monitoring_alerts_false');
    pendingRequests.delete('monitoring_alerts_true');
  };

  const fetchExecutiveReport = async (): Promise<ExecutiveReport> => {
    const cacheKey = 'monitoring_executive_report';

    const data = await requestWithDedupe<ExecutiveReport>(cacheKey, async () => {
      const response = await api.get(MONITORING_ENDPOINTS.EXECUTIVE_REPORT, { timeout: 15000 });
      if (response.data.success) {
        executiveReport.value = response.data.data;
        return executiveReport.value as ExecutiveReport;
      }
      throw new Error('Failed to fetch executive report');
    });

    return data;
  };

  const exportMetrics = async (format: string = 'csv'): Promise<void> => {
    const url = MONITORING_ENDPOINTS.EXPORT(format);

    const response = await api.get(url, {
      timeout: 20000,
      responseType: 'blob',
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `metrics_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const clearCache = (): void => {
    pendingRequests.clear();
  };

  // ==========================================
  // CARREGAMENTO SEQUENCIAL
  // ==========================================

  const carregarTodosDados = async (): Promise<void> => {
    loading.value = true;

    try {
      await fetchHealth();
      await fetchPerformance();
      await fetchBusinessMetrics();
      await fetchAlerts(false);
      await fetchSecurityRealtime();
      await fetchExternalServices();
      await fetchExecutiveReport();
      await fetchInfrastructureMetrics();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // GETTERS COMPUTADOS
  // ==========================================

  const isSystemHealthy = computed((): boolean => {
    return health.value?.status === 'healthy';
  });

  const criticalAlertsCount = computed((): number => {
    return alerts.value.filter((alert) => alert.level === 'critical' && !alert.resolved).length;
  });

  const warningAlertsCount = computed((): number => {
    return alerts.value.filter((alert) => alert.level === 'warning' && !alert.resolved).length;
  });

  const overallHealthScore = computed((): number => {
    let score = 85;

    if (health.value?.status === 'healthy') score += 5;
    if (health.value?.status === 'degraded') score -= 20;
    if (health.value?.status === 'error') score -= 40;

    const responseTime = performance.value?.avg_response_time || 0;
    if (responseTime < 300) score += 5;
    if (responseTime > 1000) score -= 15;
    if (responseTime > 2000) score -= 30;

    const errorRate = performance.value?.error_rate || 0;
    if (errorRate < 1) score += 5;
    if (errorRate > 5) score -= 10;
    if (errorRate > 10) score -= 25;

    if (criticalAlertsCount.value > 0) score -= 15 * criticalAlertsCount.value;
    if (warningAlertsCount.value > 0) score -= 5 * warningAlertsCount.value;

    return Math.min(100, Math.max(0, Math.round(score)));
  });

  const healthScoreRating = computed((): string => {
    const score = overallHealthScore.value;
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Bom';
    if (score >= 60) return 'Regular';
    if (score >= 40) return 'Crítico';
    return 'Péssimo';
  });

  const conversionRate = computed((): number => {
    const totalUsers = businessMetrics.value?.users.total || 1;
    const totalOrders = businessMetrics.value?.orders.total || 0;
    return Math.round((totalOrders / totalUsers) * 100);
  });

  const totalRevenueFormatted = computed((): string => {
    const revenue = businessMetrics.value?.revenue.total || 0;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(revenue);
  });

  const averageRating = computed((): number => {
    return businessMetrics.value?.reviews.average_rating || 0;
  });

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // State
    loading,
    health,
    performance,
    businessMetrics,
    advancedBusinessMetrics,
    securityMetrics,
    securityRealtime,
    externalServices,
    slowQueries,
    slowEndpoints,
    statusCodes,
    infrastructureMetrics,
    cacheStats,
    databaseStats,
    queueStats,
    alerts,
    executiveReport,
    predictions,
    frontendMetrics,

    // Getters
    isSystemHealthy,
    criticalAlertsCount,
    warningAlertsCount,
    overallHealthScore,
    healthScoreRating,
    conversionRate,
    totalRevenueFormatted,
    averageRating,

    // Actions
    fetchHealth,
    fetchPerformance,
    fetchBusinessMetrics,
    fetchAdvancedBusinessMetrics,
    fetchSecurityMetrics,
    fetchSecurityRealtime,
    fetchExternalServices,
    fetchInfrastructureMetrics,
    fetchAlerts,
    resolveAlert,
    fetchExecutiveReport,
    exportMetrics,
    clearCache,
    carregarTodosDados,
  };
});
