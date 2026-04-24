// src/stores/monitoring-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { MONITORING_ENDPOINTS } from 'src/router/Api/monitoring-endpoints';
import { useCacheStore } from './cache-store';
import type { AxiosError } from 'axios';

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
    storage: { status: string; free_space_gb?: number; total_space_gb?: number; error?: string };
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
  users: {
    total: number;
    new_today: number;
    new_week: number;
    new_month: number;
  };
  services: { total: number };
  orders: {
    total: number;
    completed: number;
    pending: number;
  };
  revenue: {
    total: number;
    today: number;
    month: number;
  };
  reviews: {
    average_rating: number;
    total: number;
  };
}

export interface AdvancedBusinessMetrics {
  conversion_rate: number;
  churn_rate: number;
  customer_ltv: number;
  customer_cac: number;
  roi_percent: number;
  top_categories: Array<{ nome: string; total_services: number }>;
  peak_hours: Array<{ hour: number; total: number }>;
  health_score: {
    score: number;
    rating: string;
    recommendations: string[];
  };
}

export interface AlertContext {
  [key: string]: unknown;
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  message: string;
  context: AlertContext;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface SecurityMetrics {
  failed_logins_last_hour: number;
  failed_logins_last_day: number;
  critical_events_last_day: number;
}

export interface BruteForceIp {
  ip: string;
  attempts: number;
}

export interface SecurityRealtime {
  failed_logins_last_hour: number;
  brute_force_detected: boolean;
  brute_force_ips: BruteForceIp[];
  top_offending_ips: BruteForceIp[];
  blocked_ips: string[];
  unauthorized_access_today: number;
  total_security_events_today: number;
  alert: string | null;
}

export interface ExternalService {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  response_time_ms: number;
  last_check_at: string;
  last_error_at: string | null;
  last_error_message: string | null;
}

export interface SlowEndpoint {
  path: string;
  total_calls: number;
  avg_time: number;
  max_time: number;
  min_time: number;
}

export interface StatusCodeDistribution {
  status_code: number;
  total: number;
}

export interface MostCommonError {
  status_code: number;
  total: number;
}

export interface StatusCodeAnalysis {
  period_hours: number;
  total_requests: number;
  error_rate: number;
  status_codes_distribution: StatusCodeDistribution[];
  most_common_error: MostCommonError | null;
  alert: string | null;
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
  health_metrics: {
    score: number;
    rating: string;
    recommendations: string[];
  };
  alerts: {
    total_unresolved: number;
    critical: number;
  };
  external_services_status: Record<string, ExternalService>;
  security_events: {
    failed_logins_today: number;
    brute_force_detected: boolean;
  };
}

export interface SlowQuery {
  sql_query: string;
  time_ms: number;
  path: string | null;
  ip: string | null;
  occurred_at: string;
}

export interface SlowQueriesResponse {
  hours: number;
  total_slow_queries: number;
  average_time_ms: number;
  slowest_queries: SlowQuery[];
}

export interface HistoryMetric {
  date: string;
  requests: number;
  avg_response_time: number;
  error_rate: number;
  new_users: number;
  revenue: number;
  avg_rating: number;
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

export interface RecentLog {
  timestamp: string | null;
  level: string;
  message: string;
}

export interface PredictionData {
  users: {
    current: number;
    predicted_30d: number;
    growth_rate_percent: number;
  };
  storage: {
    days_until_full: number;
    estimated_date: string;
  };
  timestamp: string;
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

export interface InfrastructureMetrics {
  cpu: {
    load_1min: number;
    load_5min: number;
    load_15min: number;
  };
  memory: {
    php_used_mb: number;
    php_peak_mb: number;
    php_limit_mb: number;
  };
  disk: {
    total_gb: number;
    free_gb: number;
    used_gb: number;
    usage_percent: number;
  };
}

// ==========================================
// CONSTANTES DE CACHE
// ==========================================

const CACHE_TTL = {
  HEALTH: 60 * 1000, // 1 minuto
  PERFORMANCE: 120 * 1000, // 2 minutos
  BUSINESS: 300 * 1000, // 5 minutos
  ADVANCED: 600 * 1000, // 10 minutos
  ALERTS: 30 * 1000, // 30 segundos
  SECURITY: 60 * 1000, // 1 minuto
  EXTERNAL: 120 * 1000, // 2 minutos
  SLOW_QUERIES: 300 * 1000, // 5 minutos
  SLOW_ENDPOINTS: 300 * 1000, // 5 minutos
  EXECUTIVE: 600 * 1000, // 10 minutos
  HISTORY: 3600 * 1000, // 1 hora
  CACHE_STATS: 300 * 1000, // 5 minutos
  DATABASE_STATS: 300 * 1000, // 5 minutos
  QUEUE_STATS: 60 * 1000, // 1 minuto
  LOGS: 60 * 1000, // 1 minuto
  PREDICTIONS: 3600 * 1000, // 1 hora
  FRONTEND: 300 * 1000, // 5 minutos
  INFRASTRUCTURE: 300 * 1000, // 5 minutos
};

// ==========================================
// STORE
// ==========================================

export const useMonitoringStore = defineStore('monitoring', () => {
  const $q = useQuasar();
  const cacheStore = useCacheStore();

  // ==========================================
  // STATE
  // ==========================================

  const loading = ref(false);
  const health = ref<HealthCheck | null>(null);
  const performance = ref<PerformanceMetrics | null>(null);
  const businessMetrics = ref<BusinessMetrics | null>(null);
  const advancedBusinessMetrics = ref<AdvancedBusinessMetrics | null>(null);
  const alerts = ref<Alert[]>([]);
  const securityMetrics = ref<SecurityMetrics | null>(null);
  const securityRealtime = ref<SecurityRealtime | null>(null);
  const externalServices = ref<ExternalService[]>([]);
  const slowQueries = ref<SlowQuery[]>([]);
  const slowEndpoints = ref<SlowEndpoint[]>([]);
  const statusCodes = ref<StatusCodeAnalysis | null>(null);
  const executiveReport = ref<ExecutiveReport | null>(null);
  const predictions = ref<PredictionData | null>(null);
  const frontendMetrics = ref<FrontendMetrics | null>(null);
  const history = ref<HistoryMetric[]>([]);
  const cacheStats = ref<CacheStats | null>(null);
  const databaseStats = ref<DatabaseStats | null>(null);
  const queueStats = ref<QueueStats | null>(null);
  const recentLogs = ref<RecentLog[]>([]);
  const infrastructureMetrics = ref<InfrastructureMetrics | null>(null);

  // ==========================================
  // GETTERS
  // ==========================================

  const isSystemHealthy = computed(() => health.value?.status === 'healthy');
  const hasActiveAlerts = computed(() => alerts.value.some((a) => !a.resolved));
  const criticalAlertsCount = computed(
    () => alerts.value.filter((a) => !a.resolved && a.level === 'critical').length,
  );
  const warningAlertsCount = computed(
    () => alerts.value.filter((a) => !a.resolved && a.level === 'warning').length,
  );
  const overallHealthScore = computed(() => {
    if (!executiveReport.value) return 0;
    return executiveReport.value.health_metrics.score;
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  const showError = (error: unknown) => {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Erro ao carregar dados';
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 });
  };

  // ==========================================
  // SAÚDE E BÁSICO
  // ==========================================

  const fetchHealth = async (): Promise<HealthCheck | null> => {
    const cacheKey = 'monitoring_health';
    const cached = cacheStore.get<HealthCheck>(cacheKey);
    if (cached) return cached;

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.HEALTH, { timeout: 5000 });
      health.value = response.data;
      cacheStore.set(cacheKey, health.value, CACHE_TTL.HEALTH);
      return health.value;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchDashboard = async () => {
    const cacheKey = 'monitoring_dashboard';
    const cached = cacheStore.get(cacheKey);
    if (cached) return cached;

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.DASHBOARD, { timeout: 8000 });
      cacheStore.set(cacheKey, response.data, CACHE_TTL.PERFORMANCE);
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchMetrics = async () => {
    const cacheKey = 'monitoring_metrics';
    const cached = cacheStore.get(cacheKey);
    if (cached) return cached;

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.METRICS, { timeout: 8000 });
      if (response.data.success) {
        const data = response.data.data;
        performance.value = data.performance;
        businessMetrics.value = data.business;
        cacheStore.set(cacheKey, data, CACHE_TTL.BUSINESS);
        return data;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchPerformance = async (
    period: 'hour' | 'day' | 'week' = 'hour',
  ): Promise<PerformanceMetrics | null> => {
    const cacheKey = `monitoring_performance_${period}`;
    const cached = cacheStore.get<PerformanceMetrics>(cacheKey);
    if (cached) {
      performance.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.PERFORMANCE, {
        params: { period },
        timeout: 8000,
      });
      if (response.data.success) {
        performance.value = response.data.data;
        cacheStore.set(cacheKey, performance.value, CACHE_TTL.PERFORMANCE);
        return performance.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  const fetchCacheStats = async (): Promise<CacheStats | null> => {
    const cacheKey = 'monitoring_cache_stats';
    const cached = cacheStore.get<CacheStats>(cacheKey);
    if (cached) {
      cacheStats.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.CACHE_STATS, { timeout: 5000 });
      if (response.data.success) {
        cacheStats.value = response.data.data;
        cacheStore.set(cacheKey, cacheStats.value, CACHE_TTL.CACHE_STATS);
        return cacheStats.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchDatabaseStats = async (): Promise<DatabaseStats | null> => {
    const cacheKey = 'monitoring_database_stats';
    const cached = cacheStore.get<DatabaseStats>(cacheKey);
    if (cached) {
      databaseStats.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.DATABASE_STATS, { timeout: 8000 });
      if (response.data.success) {
        databaseStats.value = response.data.data;
        cacheStore.set(cacheKey, databaseStats.value, CACHE_TTL.DATABASE_STATS);
        return databaseStats.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchQueueStats = async (): Promise<QueueStats | null> => {
    const cacheKey = 'monitoring_queue_stats';
    const cached = cacheStore.get<QueueStats>(cacheKey);
    if (cached) {
      queueStats.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.QUEUE_STATS, { timeout: 5000 });
      if (response.data.success) {
        queueStats.value = response.data.data;
        cacheStore.set(cacheKey, queueStats.value, CACHE_TTL.QUEUE_STATS);
        return queueStats.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecentLogs = async (
    lines: number = 100,
    level: string = 'error',
  ): Promise<RecentLog[]> => {
    const cacheKey = `monitoring_logs_${lines}_${level}`;
    const cached = cacheStore.get<RecentLog[]>(cacheKey);
    if (cached) {
      recentLogs.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.LOGS_RECENT, {
        params: { lines, level },
        timeout: 8000,
      });
      if (response.data.success) {
        recentLogs.value = response.data.data.logs || [];
        cacheStore.set(cacheKey, recentLogs.value, CACHE_TTL.LOGS);
        return recentLogs.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // ALERTAS
  // ==========================================

  interface FetchAlertsParams {
    resolved: boolean;
    level?: string;
  }

  const fetchAlerts = async (resolved: boolean = false, level?: string): Promise<Alert[]> => {
    const cacheKey = `monitoring_alerts_${resolved}_${level || 'all'}`;
    const cached = cacheStore.get<Alert[]>(cacheKey);
    if (cached) {
      alerts.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const params: FetchAlertsParams = { resolved };
      if (level) params.level = level;
      const response = await api.get(MONITORING_ENDPOINTS.ALERTS, { params, timeout: 5000 });
      if (response.data.success) {
        alerts.value = response.data.data.alerts || [];
        cacheStore.set(cacheKey, alerts.value, CACHE_TTL.ALERTS);
        return alerts.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const resolveAlert = async (id: number): Promise<boolean> => {
    try {
      const response = await api.put(MONITORING_ENDPOINTS.RESOLVE_ALERT(id), {}, { timeout: 5000 });
      if (response.data.success) {
        const alert = alerts.value.find((a) => a.id === id);
        if (alert) {
          alert.resolved = true;
          alert.resolved_at = new Date().toISOString();
        }
        cacheStore.invalidatePattern('monitoring_alerts_.*');
        $q.notify({
          type: 'positive',
          message: 'Alerta resolvido',
          position: 'top',
          timeout: 2000,
        });
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // MÉTRICAS DE NEGÓCIO
  // ==========================================

  const fetchBusinessMetrics = async (): Promise<BusinessMetrics | null> => {
    const cacheKey = 'monitoring_business_metrics';
    const cached = cacheStore.get<BusinessMetrics>(cacheKey);
    if (cached) {
      businessMetrics.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.BUSINESS_METRICS, { timeout: 8000 });
      if (response.data.success) {
        businessMetrics.value = response.data.data;
        cacheStore.set(cacheKey, businessMetrics.value, CACHE_TTL.BUSINESS);
        return businessMetrics.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchAdvancedBusinessMetrics = async (): Promise<AdvancedBusinessMetrics | null> => {
    const cacheKey = 'monitoring_advanced_business';
    const cached = cacheStore.get<AdvancedBusinessMetrics>(cacheKey);
    if (cached) {
      advancedBusinessMetrics.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.BUSINESS_ADVANCED, { timeout: 10000 });
      if (response.data.success) {
        advancedBusinessMetrics.value = response.data.data;
        cacheStore.set(cacheKey, advancedBusinessMetrics.value, CACHE_TTL.ADVANCED);
        return advancedBusinessMetrics.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchHistory = async (days: number = 30): Promise<HistoryMetric[]> => {
    const cacheKey = `monitoring_history_${days}`;
    const cached = cacheStore.get<HistoryMetric[]>(cacheKey);
    if (cached) {
      history.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.HISTORY(days), { timeout: 10000 });
      if (response.data.success) {
        history.value = response.data.data.metrics || [];
        cacheStore.set(cacheKey, history.value, CACHE_TTL.HISTORY);
        return history.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const exportMetrics = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await api.get(MONITORING_ENDPOINTS.EXPORT(format), {
        responseType: format === 'csv' ? 'blob' : 'json',
        timeout: 15000,
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `metrics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        $q.notify({
          type: 'positive',
          message: 'Relatório exportado com sucesso',
          position: 'top',
        });
        return true;
      }
      return response.data;
    } catch (error) {
      showError(error);
      return null;
    }
  };

  // ==========================================
  // SEGURANÇA
  // ==========================================

  const fetchSecurityMetrics = async (): Promise<SecurityMetrics | null> => {
    const cacheKey = 'monitoring_security_metrics';
    const cached = cacheStore.get<SecurityMetrics>(cacheKey);
    if (cached) {
      securityMetrics.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.SECURITY_METRICS, { timeout: 8000 });
      if (response.data.success) {
        securityMetrics.value = response.data.data;
        cacheStore.set(cacheKey, securityMetrics.value, CACHE_TTL.SECURITY);
        return securityMetrics.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchSecurityRealtime = async (): Promise<SecurityRealtime | null> => {
    const cacheKey = 'monitoring_security_realtime';
    const cached = cacheStore.get<SecurityRealtime>(cacheKey);
    if (cached) {
      securityRealtime.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.SECURITY_REALTIME, { timeout: 8000 });
      if (response.data.success) {
        securityRealtime.value = response.data.data;
        cacheStore.set(cacheKey, securityRealtime.value, CACHE_TTL.SECURITY);
        return securityRealtime.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const blockIp = async (ip: string, reason?: string): Promise<boolean> => {
    try {
      const response = await api.post(
        MONITORING_ENDPOINTS.BLOCK_IP,
        { ip, reason },
        { timeout: 5000 },
      );
      if (response.data.success) {
        $q.notify({ type: 'positive', message: `IP ${ip} bloqueado com sucesso`, position: 'top' });
        cacheStore.invalidatePattern('monitoring_security_.*');
        await fetchSecurityRealtime();
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // DEPENDÊNCIAS EXTERNAS
  // ==========================================

  const fetchExternalServices = async (): Promise<ExternalService[]> => {
    const cacheKey = 'monitoring_external_services';
    const cached = cacheStore.get<ExternalService[]>(cacheKey);
    if (cached) {
      externalServices.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.EXTERNAL_SERVICES, { timeout: 10000 });
      if (response.data.success) {
        externalServices.value = response.data.data || [];
        cacheStore.set(cacheKey, externalServices.value, CACHE_TTL.EXTERNAL);
        return externalServices.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const checkExternalServices = async (): Promise<ExternalService[]> => {
    const cacheKey = 'monitoring_external_check';
    const cached = cacheStore.get<ExternalService[]>(cacheKey);
    if (cached) {
      externalServices.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.EXTERNAL_CHECK, { timeout: 15000 });
      if (response.data.success) {
        const services = response.data.data.services || [];
        externalServices.value = services;
        cacheStore.set(cacheKey, externalServices.value, CACHE_TTL.EXTERNAL);
        return externalServices.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // PERFORMANCE DETALHADA
  // ==========================================

  const fetchSlowQueries = async (hours: number = 24): Promise<SlowQuery[]> => {
    const cacheKey = `monitoring_slow_queries_${hours}`;
    const cached = cacheStore.get<SlowQuery[]>(cacheKey);
    if (cached) {
      slowQueries.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.SLOW_QUERIES(hours), { timeout: 10000 });
      if (response.data.success) {
        slowQueries.value = response.data.data.slowest_queries || [];
        cacheStore.set(cacheKey, slowQueries.value, CACHE_TTL.SLOW_QUERIES);
        return slowQueries.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchSlowEndpoints = async (hours: number = 24): Promise<SlowEndpoint[]> => {
    const cacheKey = `monitoring_slow_endpoints_${hours}`;
    const cached = cacheStore.get<SlowEndpoint[]>(cacheKey);
    if (cached) {
      slowEndpoints.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.SLOW_ENDPOINTS(hours), {
        timeout: 10000,
      });
      if (response.data.success) {
        slowEndpoints.value = response.data.data.slowest_endpoints || [];
        cacheStore.set(cacheKey, slowEndpoints.value, CACHE_TTL.SLOW_ENDPOINTS);
        return slowEndpoints.value;
      }
      return [];
    } catch (error) {
      showError(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchStatusCodes = async (hours: number = 24): Promise<StatusCodeAnalysis | null> => {
    const cacheKey = `monitoring_status_codes_${hours}`;
    const cached = cacheStore.get<StatusCodeAnalysis>(cacheKey);
    if (cached) {
      statusCodes.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.STATUS_CODES(hours), { timeout: 10000 });
      if (response.data.success) {
        statusCodes.value = response.data.data;
        cacheStore.set(cacheKey, statusCodes.value, CACHE_TTL.SLOW_ENDPOINTS);
        return statusCodes.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // FRONTEND E PREDIÇÕES
  // ==========================================

  const fetchFrontendMetrics = async (): Promise<FrontendMetrics | null> => {
    const cacheKey = 'monitoring_frontend_metrics';
    const cached = cacheStore.get<FrontendMetrics>(cacheKey);
    if (cached) {
      frontendMetrics.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.FRONTEND_METRICS, { timeout: 8000 });
      if (response.data.success) {
        frontendMetrics.value = response.data.data;
        cacheStore.set(cacheKey, frontendMetrics.value, CACHE_TTL.FRONTEND);
        return frontendMetrics.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchPredictions = async (): Promise<PredictionData | null> => {
    const cacheKey = 'monitoring_predictions';
    const cached = cacheStore.get<PredictionData>(cacheKey);
    if (cached) {
      predictions.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.PREDICTIONS, { timeout: 10000 });
      if (response.data.success) {
        predictions.value = response.data.data;
        cacheStore.set(cacheKey, predictions.value, CACHE_TTL.PREDICTIONS);
        return predictions.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchExecutiveReport = async (): Promise<ExecutiveReport | null> => {
    const cacheKey = 'monitoring_executive_report';
    const cached = cacheStore.get<ExecutiveReport>(cacheKey);
    if (cached) {
      executiveReport.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.EXECUTIVE_REPORT, { timeout: 10000 });
      if (response.data.success) {
        executiveReport.value = response.data.data;
        cacheStore.set(cacheKey, executiveReport.value, CACHE_TTL.EXECUTIVE);
        return executiveReport.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // TAREFAS
  // ==========================================

  const saveDailyMetrics = async (): Promise<boolean> => {
    try {
      const response = await api.post(
        MONITORING_ENDPOINTS.SAVE_DAILY_METRICS,
        {},
        { timeout: 10000 },
      );
      if (response.data.success) {
        cacheStore.invalidatePattern('monitoring_.*');
        $q.notify({
          type: 'positive',
          message: 'Métricas diárias salvas',
          position: 'top',
          timeout: 2000,
        });
        return true;
      }
      return false;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // ==========================================
  // MÉTRICAS DE INFRAESTRUTURA
  // ==========================================

  const fetchInfrastructureMetrics = async (): Promise<InfrastructureMetrics | null> => {
    const cacheKey = 'monitoring_infrastructure';
    const cached = cacheStore.get<InfrastructureMetrics>(cacheKey);
    if (cached) {
      infrastructureMetrics.value = cached;
      return cached;
    }

    loading.value = true;
    try {
      const response = await api.get(MONITORING_ENDPOINTS.INFRASTRUCTURE_METRICS, {
        timeout: 8000,
      });
      if (response.data.success) {
        infrastructureMetrics.value = response.data.data;
        cacheStore.set(cacheKey, infrastructureMetrics.value, CACHE_TTL.INFRASTRUCTURE);
        return infrastructureMetrics.value;
      }
      return null;
    } catch (error) {
      showError(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // CARREGAR TUDO
  // ==========================================

  const carregarTodosDados = async (): Promise<boolean> => {
    loading.value = true;
    try {
      await Promise.all([
        fetchHealth(),
        fetchPerformance(),
        fetchBusinessMetrics(),
        fetchAlerts(false),
        fetchSecurityRealtime(),
        fetchExternalServices(),
        fetchExecutiveReport(),
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const carregarDadosPainel = async (): Promise<boolean> => {
    loading.value = true;
    try {
      await Promise.all([
        fetchHealth(),
        fetchPerformance(),
        fetchBusinessMetrics(),
        fetchAlerts(false),
        fetchExecutiveReport(),
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const reset = (): void => {
    health.value = null;
    performance.value = null;
    businessMetrics.value = null;
    advancedBusinessMetrics.value = null;
    alerts.value = [];
    securityMetrics.value = null;
    securityRealtime.value = null;
    externalServices.value = [];
    slowQueries.value = [];
    slowEndpoints.value = [];
    statusCodes.value = null;
    executiveReport.value = null;
    predictions.value = null;
    frontendMetrics.value = null;
    history.value = [];
    cacheStats.value = null;
    databaseStats.value = null;
    queueStats.value = null;
    recentLogs.value = [];
    infrastructureMetrics.value = null;
    cacheStore.invalidatePattern('monitoring_.*');
  };

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
    alerts,
    securityMetrics,
    securityRealtime,
    externalServices,
    slowQueries,
    slowEndpoints,
    statusCodes,
    executiveReport,
    predictions,
    frontendMetrics,
    history,
    cacheStats,
    databaseStats,
    queueStats,
    recentLogs,
    infrastructureMetrics,

    // Getters
    isSystemHealthy,
    hasActiveAlerts,
    criticalAlertsCount,
    warningAlertsCount,
    overallHealthScore,

    // Saúde e básico
    fetchHealth,
    fetchDashboard,
    fetchMetrics,
    fetchPerformance,

    // Estatísticas
    fetchCacheStats,
    fetchDatabaseStats,
    fetchQueueStats,
    fetchRecentLogs,

    // Alertas
    fetchAlerts,
    resolveAlert,

    // Métricas de negócio
    fetchBusinessMetrics,
    fetchAdvancedBusinessMetrics,
    fetchHistory,
    exportMetrics,

    // Segurança
    fetchSecurityMetrics,
    fetchSecurityRealtime,
    blockIp,

    // Dependências externas
    fetchExternalServices,
    checkExternalServices,

    // Performance detalhada
    fetchSlowQueries,
    fetchSlowEndpoints,
    fetchStatusCodes,

    // Frontend e previsões
    fetchFrontendMetrics,
    fetchPredictions,
    fetchExecutiveReport,

    // Tarefas
    saveDailyMetrics,

    // Infraestrutura
    fetchInfrastructureMetrics,

    // Utilitários
    carregarTodosDados,
    carregarDadosPainel,
    reset,
    showError,
  };
});
