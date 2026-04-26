<template>
  <q-page class="monitoring-page q-pa-md">
    <!-- Header -->
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="monitor_heart" size="32px" class="q-mr-sm" />
          Monitoramento do Sistema
        </div>
        <div class="page-subtitle">Acompanhe a saúde e performance da plataforma em tempo real</div>
      </div>
      <div class="header-actions">
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="primary"
          outline
          @click="carregarTodosDados"
          :loading="loading"
        />
        <q-btn label="Exportar CSV" icon="download" color="primary" @click="exportarCSV" />
      </div>
    </div>

    <!-- Skeleton Loading (estilo Facebook/Instagram) -->
    <div v-if="loading" class="skeleton-container">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="i in 4" :key="`status-${i}`" class="col-md-3 col-sm-6 col-xs-12">
          <div class="skeleton-status-card">
            <div class="row items-center">
              <div class="skeleton-icon"></div>
              <div class="q-ml-md">
                <div class="skeleton-label"></div>
                <div class="skeleton-value"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="skeleton-tabs">
        <div v-for="i in 6" :key="`tab-${i}`" class="skeleton-tab"></div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-md-6 col-xs-12">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="skeleton-value-large"></div>
                <div class="skeleton-label-small"></div>
              </div>
              <div class="col-6">
                <div class="skeleton-value-large"></div>
                <div class="skeleton-label-small"></div>
              </div>
              <div class="col-6">
                <div class="skeleton-value-medium q-mt-md"></div>
                <div class="skeleton-label-small"></div>
              </div>
              <div class="col-6">
                <div class="skeleton-stars q-mt-md"></div>
                <div class="skeleton-label-small"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xs-12">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="row q-col-gutter-md">
              <div v-for="i in 4" :key="`perf-${i}`" class="col-6">
                <div class="skeleton-value-medium"></div>
                <div class="skeleton-label-small"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="row q-col-gutter-md">
              <div v-for="i in 4" :key="`service-${i}`" class="col-md-3 col-sm-6 col-xs-12">
                <div class="skeleton-service-card">
                  <div class="skeleton-icon-small"></div>
                  <div class="skeleton-text-short q-mt-sm"></div>
                  <div class="skeleton-text-shorter"></div>
                  <div class="skeleton-text-tiny q-mt-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="skeleton-table">
              <div class="skeleton-table-header">
                <div v-for="i in 4" :key="`th-${i}`" class="skeleton-header-cell"></div>
              </div>
              <div v-for="row in 3" :key="`row-${row}`" class="skeleton-table-row">
                <div v-for="i in 4" :key="`td-${row}-${i}`" class="skeleton-cell">
                  <div class="skeleton-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="skeleton-shimmer"></div>
    </div>

    <!-- CONTEÚDO REAL -->
    <template v-else>
      <!-- Cards de Status Geral -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="status-card" :class="isSystemHealthy ? 'healthy' : 'degraded'">
            <q-card-section>
              <div class="row items-center">
                <q-icon :name="isSystemHealthy ? 'check_circle' : 'warning'" size="32px" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6">Status do Sistema</div>
                  <div class="text-h5 text-weight-bold">
                    {{ health?.status || 'Carregando...' }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="status-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="notifications_active" size="32px" color="warning" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6">Alertas Ativos</div>
                  <div class="text-h5 text-weight-bold">
                    {{ criticalAlertsCount }} <span class="text-caption">críticos</span> /
                    {{ warningAlertsCount }} <span class="text-caption">avisos</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="status-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="speed" size="32px" :color="performanceColor" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6">Tempo Médio Resposta</div>
                  <div class="text-h5 text-weight-bold">
                    {{ performance?.avg_response_time || 0 }}ms
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="status-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="health_and_safety" size="32px" :color="healthScoreColor" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6">Health Score</div>
                  <div class="text-h5 text-weight-bold">{{ overallHealthScore }}/100</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabs de Navegação -->
      <q-tabs v-model="tab" dense class="bg-white rounded-borders q-mb-md" align="justify">
        <q-tab name="dashboard" icon="space_dashboard" label="Dashboard" />
        <q-tab name="performance" icon="speed" label="Performance" />
        <q-tab name="business" icon="business" label="Negócio" />
        <q-tab name="security" icon="security" label="Segurança" />
        <q-tab name="infrastructure" icon="storage" label="Infraestrutura" />
        <q-tab name="alerts" icon="notifications" label="Alertas" />
      </q-tabs>

      <div class="q-mt-md">
        <!-- TAB: DASHBOARD -->
        <div v-show="tab === 'dashboard'">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Métricas de Negócio</div>
                </q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Total Usuários</div>
                      <div class="text-h4">{{ businessMetrics?.users?.total || 0 }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Novos Hoje</div>
                      <div class="text-h4 text-primary">
                        {{ businessMetrics?.users?.new_today || 0 }}
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Receita Total</div>
                      <div class="text-h5">
                        {{ formatMoney(businessMetrics?.revenue?.total || 0) }}
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Avaliação Média</div>
                      <div class="text-h5">
                        <q-rating v-model="averageRating" :max="5" size="20px" readonly />
                        <span class="q-ml-sm">({{ businessMetrics?.reviews?.total || 0 }})</span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Performance</div>
                </q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Requisições/minuto</div>
                      <div class="text-h4">{{ performance?.requests_per_minute || 0 }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Taxa de Erro</div>
                      <div class="text-h4" :class="errorRateColor">
                        {{ performance?.error_rate || 0 }}%
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Queries Lentas</div>
                      <div class="text-h4">{{ performance?.slow_queries || 0 }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Cache Hit Rate</div>
                      <div class="text-h4">{{ performance?.cache_hit_rate || 0 }}%</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Serviços Externos</div>
                </q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div
                      v-for="service in externalServices"
                      :key="service.name"
                      class="col-md-3 col-sm-6 col-xs-12"
                    >
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon
                            :name="getServiceIcon(service.status)"
                            :color="getServiceColor(service.status)"
                            size="32px"
                          />
                          <div class="text-weight-bold q-mt-sm">
                            {{ getServiceName(service.name) }}
                          </div>
                          <div class="text-caption">{{ service.status }}</div>
                          <div class="text-caption text-grey-6">
                            {{ service.response_time_ms }}ms
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- TAB: PERFORMANCE -->
        <div v-show="tab === 'performance'">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Endpoints mais Lentos</div>
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="slowEndpoints"
                    :columns="slowEndpointsColumns"
                    row-key="path"
                    flat
                    dense
                  >
                    <template v-slot:body-cell-avg_time="props">
                      <q-td :props="props">
                        <q-badge :color="getTimeColor(props.row.avg_time)"
                          >{{ props.row.avg_time }}ms</q-badge
                        >
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Distribuição de Status Codes</div>
                </q-card-section>
                <q-card-section>
                  <div v-if="statusCodes" class="row">
                    <div class="col-12">
                      <div class="row">
                        <div class="col-md-6 col-xs-12">
                          <div class="text-h5 text-center">{{ statusCodes.total_requests }}</div>
                          <div class="text-caption text-center">Total de Requisições</div>
                        </div>
                        <div class="col-md-6 col-xs-12">
                          <div class="text-h5 text-center" :class="errorRateColor">
                            {{ statusCodes.error_rate }}%
                          </div>
                          <div class="text-caption text-center">Taxa de Erro</div>
                        </div>
                      </div>
                      <div class="row q-mt-md">
                        <div
                          v-for="code in statusCodes.status_codes_distribution"
                          :key="code.status_code"
                          class="col-3 text-center"
                        >
                          <q-badge :color="getStatusCodeColor(code.status_code)" class="q-pa-sm">{{
                            code.status_code
                          }}</q-badge>
                          <div class="text-h6 q-mt-sm">{{ code.total }}</div>
                          <div class="text-caption">requisições</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Queries SQL Lentas</div>
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="slowQueries"
                    :columns="slowQueriesColumns"
                    row-key="sql_query"
                    flat
                    dense
                  >
                    <template v-slot:body-cell-time_ms="props">
                      <q-td :props="props">
                        <q-badge :color="getTimeColor(props.row.time_ms)"
                          >{{ props.row.time_ms }}ms</q-badge
                        >
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- TAB: NEGÓCIO -->
        <div v-show="tab === 'business'">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Métricas Avançadas</div>
                </q-card-section>
                <q-card-section>
                  <q-list dense>
                    <q-item
                      ><q-item-section>Taxa de Conversão</q-item-section
                      ><q-item-section side
                        >{{ advancedMetrics?.conversion_rate || 0 }}%</q-item-section
                      ></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>Churn Rate</q-item-section
                      ><q-item-section side :class="getChurnColor(advancedMetrics?.churn_rate || 0)"
                        >{{ advancedMetrics?.churn_rate || 0 }}%</q-item-section
                      ></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>LTV (Cliente)</q-item-section
                      ><q-item-section side>{{
                        formatMoney(advancedMetrics?.customer_ltv || 0)
                      }}</q-item-section></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>CAC</q-item-section
                      ><q-item-section side>{{
                        formatMoney(advancedMetrics?.customer_cac || 0)
                      }}</q-item-section></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>ROI</q-item-section
                      ><q-item-section side :class="getRoiColor(advancedMetrics?.roi_percent || 0)"
                        >{{ advancedMetrics?.roi_percent || 0 }}%</q-item-section
                      ></q-item
                    >
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Health Score do Sistema</div>
                </q-card-section>
                <q-card-section class="text-center">
                  <q-circular-progress
                    :value="advancedMetrics?.health_score?.score || 0"
                    :max="100"
                    size="150px"
                    :color="getHealthScoreColor(advancedMetrics?.health_score?.score || 0)"
                    show-value
                    :thickness="0.2"
                  >
                    <div class="text-h3">{{ advancedMetrics?.health_score?.score || 0 }}</div>
                  </q-circular-progress>
                  <div class="text-h6 q-mt-md">
                    {{ advancedMetrics?.health_score?.rating || '-' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- TAB: SEGURANÇA -->
        <div v-show="tab === 'security'">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Eventos de Segurança</div>
                </q-card-section>
                <q-card-section>
                  <q-list dense>
                    <q-item
                      ><q-item-section>Login Falhos (última hora)</q-item-section
                      ><q-item-section side>{{
                        securityRealtime?.failed_logins_last_hour || 0
                      }}</q-item-section></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>Login Falhos (último dia)</q-item-section
                      ><q-item-section side>{{
                        securityMetrics?.failed_logins_last_day || 0
                      }}</q-item-section></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>Acessos não autorizados</q-item-section
                      ><q-item-section side>{{
                        securityRealtime?.unauthorized_access_today || 0
                      }}</q-item-section></q-item
                    >
                    <q-separator />
                    <q-item
                      ><q-item-section>Brute Force Detectado</q-item-section
                      ><q-item-section side
                        ><q-badge
                          :color="securityRealtime?.brute_force_detected ? 'negative' : 'positive'"
                          >{{ securityRealtime?.brute_force_detected ? 'SIM' : 'NÃO' }}</q-badge
                        ></q-item-section
                      ></q-item
                    >
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">IPs com mais tentativas</div>
                </q-card-section>
                <q-card-section>
                  <q-table
                    :rows="securityRealtime?.top_offending_ips || []"
                    :columns="offendingIpsColumns"
                    row-key="ip"
                    flat
                    dense
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- TAB: INFRAESTRUTURA -->
        <div v-show="tab === 'infrastructure'">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section><div class="text-h6">CPU</div></q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-4 text-center">
                      <div class="text-h5">{{ infrastructureMetrics?.cpu?.load_1min || 0 }}</div>
                      <div class="text-caption">1 min</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="text-h5">{{ infrastructureMetrics?.cpu?.load_5min || 0 }}</div>
                      <div class="text-caption">5 min</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="text-h5">{{ infrastructureMetrics?.cpu?.load_15min || 0 }}</div>
                      <div class="text-caption">15 min</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-card>
                <q-card-section><div class="text-h6">Memória PHP</div></q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-6 text-center">
                      <div class="text-h5">
                        {{ infrastructureMetrics?.memory?.php_used_mb || 0 }} MB
                      </div>
                      <div class="text-caption">Usada</div>
                    </div>
                    <div class="col-6 text-center">
                      <div class="text-h5">
                        {{ infrastructureMetrics?.memory?.php_limit_mb || 0 }} MB
                      </div>
                      <div class="text-caption">Limite</div>
                    </div>
                  </div>
                  <q-linear-progress
                    :value="
                      (infrastructureMetrics?.memory?.php_used_mb || 0) /
                      (infrastructureMetrics?.memory?.php_limit_mb || 1)
                    "
                    :color="getMemoryColor"
                    class="q-mt-md"
                  />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card>
                <q-card-section><div class="text-h6">Armazenamento</div></q-card-section>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-md-3 col-sm-6 col-xs-12 text-center">
                      <div class="text-h5">{{ infrastructureMetrics?.disk?.total_gb || 0 }} GB</div>
                      <div class="text-caption">Total</div>
                    </div>
                    <div class="col-md-3 col-sm-6 col-xs-12 text-center">
                      <div class="text-h5 text-positive">
                        {{ infrastructureMetrics?.disk?.free_gb || 0 }} GB
                      </div>
                      <div class="text-caption">Livre</div>
                    </div>
                    <div class="col-md-3 col-sm-6 col-xs-12 text-center">
                      <div class="text-h5 text-negative">
                        {{ infrastructureMetrics?.disk?.used_gb || 0 }} GB
                      </div>
                      <div class="text-caption">Usado</div>
                    </div>
                    <div class="col-md-3 col-sm-6 col-xs-12 text-center">
                      <div class="text-h5">
                        {{ infrastructureMetrics?.disk?.usage_percent || 0 }}%
                      </div>
                      <div class="text-caption">Utilização</div>
                    </div>
                  </div>
                  <q-linear-progress
                    :value="(infrastructureMetrics?.disk?.usage_percent || 0) / 100"
                    :color="getDiskColor"
                    class="q-mt-md"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- TAB: ALERTAS -->
        <div v-show="tab === 'alerts'">
          <div class="row">
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="text-h6">Alertas do Sistema</div>
                    <q-toggle
                      v-model="showResolved"
                      label="Mostrar resolvidos"
                      @update:model-value="carregarAlertas"
                    />
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-table :rows="alerts" :columns="alertsColumns" row-key="id" flat dense>
                    <template v-slot:body-cell-level="props">
                      <q-td :props="props"
                        ><q-badge :color="getAlertLevelColor(props.row.level)">{{
                          props.row.level
                        }}</q-badge></q-td
                      >
                    </template>
                    <template v-slot:body-cell-resolved="props">
                      <q-td :props="props"
                        ><q-badge :color="props.row.resolved ? 'positive' : 'warning'">{{
                          props.row.resolved ? 'Resolvido' : 'Ativo'
                        }}</q-badge></q-td
                      >
                    </template>
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn
                          v-if="!props.row.resolved"
                          flat
                          round
                          icon="check"
                          color="positive"
                          size="sm"
                          @click="resolverAlerta(props.row.id)"
                        >
                          <q-tooltip>Marcar como resolvido</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMonitoringStore } from 'src/stores/monitoring-store';

defineOptions({
  name: 'AdminMonitoring',
});

const monitoringStore = useMonitoringStore();

// Estados
const tab = ref('dashboard');
const showResolved = ref(false);
const isInitialLoadComplete = ref(false); // ← NOVO: controla se o carregamento inicial terminou

// Computed do store
const loading = computed(() => monitoringStore.loading);
const health = computed(() => monitoringStore.health);
const performance = computed(() => monitoringStore.performance);
const businessMetrics = computed(() => monitoringStore.businessMetrics);
const advancedMetrics = computed(() => monitoringStore.advancedBusinessMetrics);
const alerts = computed(() => monitoringStore.alerts);
const securityMetrics = computed(() => monitoringStore.securityMetrics);
const securityRealtime = computed(() => monitoringStore.securityRealtime);
const externalServices = computed(() => monitoringStore.externalServices);
const slowQueries = computed(() => monitoringStore.slowQueries);
const slowEndpoints = computed(() => monitoringStore.slowEndpoints);
const statusCodes = computed(() => monitoringStore.statusCodes);
const infrastructureMetrics = computed(() => monitoringStore.infrastructureMetrics);

// Computed adicionais
const isSystemHealthy = computed(() => monitoringStore.isSystemHealthy);
const criticalAlertsCount = computed(() => monitoringStore.criticalAlertsCount);
const warningAlertsCount = computed(() => monitoringStore.warningAlertsCount);
const overallHealthScore = computed(() => monitoringStore.overallHealthScore);
const averageRating = computed(() => businessMetrics.value?.reviews?.average_rating || 0);

// Cores dinâmicas
const performanceColor = computed(() => {
  const time = performance.value?.avg_response_time || 0;
  if (time < 500) return 'positive';
  if (time < 1000) return 'warning';
  return 'negative';
});

const healthScoreColor = computed(() => {
  const score = overallHealthScore.value;
  if (score >= 80) return 'positive';
  if (score >= 60) return 'warning';
  return 'negative';
});

const errorRateColor = computed(() => {
  const rate = performance.value?.error_rate || 0;
  if (rate < 5) return 'text-positive';
  if (rate < 10) return 'text-warning';
  return 'text-negative';
});

const getMemoryColor = computed(() => {
  const used = infrastructureMetrics.value?.memory?.php_used_mb || 0;
  const limit = infrastructureMetrics.value?.memory?.php_limit_mb || 1;
  const percent = used / limit;
  if (percent < 0.7) return 'positive';
  if (percent < 0.9) return 'warning';
  return 'negative';
});

const getDiskColor = computed(() => {
  const percent = infrastructureMetrics.value?.disk?.usage_percent || 0;
  if (percent < 70) return 'positive';
  if (percent < 85) return 'warning';
  return 'negative';
});

// Colunas das tabelas
const slowEndpointsColumns = [
  { name: 'path', label: 'Endpoint', field: 'path', align: 'left' as const },
  { name: 'total_calls', label: 'Total Chamadas', field: 'total_calls', align: 'center' as const },
  { name: 'avg_time', label: 'Médio (ms)', field: 'avg_time', align: 'center' as const },
  { name: 'max_time', label: 'Máx (ms)', field: 'max_time', align: 'center' as const },
];

const slowQueriesColumns = [
  { name: 'sql_query', label: 'Query', field: 'sql_query', align: 'left' as const },
  { name: 'time_ms', label: 'Tempo (ms)', field: 'time_ms', align: 'center' as const },
  { name: 'occurred_at', label: 'Data', field: 'occurred_at', align: 'left' as const },
];

const offendingIpsColumns = [
  { name: 'ip', label: 'IP', field: 'ip', align: 'left' as const },
  { name: 'attempts', label: 'Tentativas', field: 'attempts', align: 'center' as const },
];

const alertsColumns = [
  { name: 'level', label: 'Nível', field: 'level', align: 'center' as const },
  { name: 'title', label: 'Título', field: 'title', align: 'left' as const },
  { name: 'message', label: 'Mensagem', field: 'message', align: 'left' as const },
  { name: 'created_at', label: 'Data', field: 'created_at', align: 'left' as const },
  { name: 'resolved', label: 'Status', field: 'resolved', align: 'center' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' as const },
];

// Funções auxiliares
const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getServiceIcon = (status: string): string => {
  switch (status) {
    case 'healthy': return 'check_circle';
    case 'degraded': return 'warning';
    case 'down': return 'error';
    default: return 'help';
  }
};

const getServiceColor = (status: string): string => {
  switch (status) {
    case 'healthy': return 'positive';
    case 'degraded': return 'warning';
    case 'down': return 'negative';
    default: return 'grey';
  }
};

const getServiceName = (name: string): string => {
  const names: Record<string, string> = {
    payment_gateway: 'Pagamento',
    sms_service: 'SMS',
    email_service: 'Email',
    maps_api: 'Mapas',
  };
  return names[name] || name;
};

const getTimeColor = (timeMs: number): string => {
  if (timeMs < 500) return 'positive';
  if (timeMs < 1000) return 'warning';
  return 'negative';
};

const getStatusCodeColor = (code: number): string => {
  if (code >= 200 && code < 300) return 'positive';
  if (code >= 400 && code < 500) return 'warning';
  if (code >= 500) return 'negative';
  return 'grey';
};

const getAlertLevelColor = (level: string): string => {
  switch (level) {
    case 'critical': return 'negative';
    case 'warning': return 'warning';
    default: return 'info';
  }
};

const getChurnColor = (churn: number): string => {
  if (churn < 5) return 'text-positive';
  if (churn < 10) return 'text-warning';
  return 'text-negative';
};

const getRoiColor = (roi: number): string => {
  if (roi > 20) return 'text-positive';
  if (roi > 0) return 'text-warning';
  return 'text-negative';
};

const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'positive';
  if (score >= 60) return 'warning';
  return 'negative';
};

// Ações
const carregarTodosDados = async (): Promise<void> => {
  await monitoringStore.carregarTodosDados();
  isInitialLoadComplete.value = true; // ← MARCA QUE O CARREGAMENTO INICIAL TERMINOU
};

const carregarAlertas = async (): Promise<void> => {
  await monitoringStore.fetchAlerts(showResolved.value);
};

const resolverAlerta = async (id: number): Promise<void> => {
  await monitoringStore.resolveAlert(id);
  await carregarAlertas();
};

const exportarCSV = async (): Promise<void> => {
  await monitoringStore.exportMetrics('csv');
};

// Auto-refresh - AGORA SÓ COMEÇA DEPOIS DO CARREGAMENTO INICIAL
let refreshInterval: ReturnType<typeof setInterval>;

onMounted(async (): Promise<void> => {
  // Primeiro carrega todos os dados
  await carregarTodosDados();

  // Só depois inicia o intervalo de atualização (60 segundos em vez de 30)
  refreshInterval = setInterval(() => {
    // Só atualiza se:
    // 1. O documento estiver focado
    // 2. O carregamento inicial já tiver terminado
    // 3. Não estiver carregando no momento
    if (document.hasFocus() && isInitialLoadComplete.value && !monitoringStore.loading) {
      void monitoringStore.fetchPerformance();
      void monitoringStore.fetchHealth();
      void monitoringStore.fetchAlerts(false);
      void monitoringStore.fetchSecurityRealtime();
    }
  }, 60000); // ← MUDADO: 30s -> 60s (menos requisições)
});

onUnmounted((): void => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped lang="scss">
$primary-color: #667eea;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;

.monitoring-page {
  max-width: 1600px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .page-title-section {
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 4px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// ==========================================
// SKELETON LOADING
// ==========================================

.skeleton-container {
  position: relative;
  overflow: hidden;
}

.skeleton-status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  background: $gray-200;
  border-radius: 50%;
}

.skeleton-label {
  width: 100px;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-value {
  width: 80px;
  height: 24px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-value-large {
  width: 100%;
  height: 40px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-value-medium {
  width: 100%;
  height: 32px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-tabs {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-tab {
  flex: 1;
  height: 40px;
  background: $gray-200;
  border-radius: 8px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.skeleton-title {
  width: 180px;
  height: 24px;
  background: $gray-200;
  border-radius: 4px;
  margin-bottom: 20px;
}

.skeleton-label-small {
  width: 80px;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
  margin-top: 8px;
}

.skeleton-stars {
  width: 100px;
  height: 20px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-service-card {
  background: $gray-100;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.skeleton-icon-small {
  width: 40px;
  height: 40px;
  background: $gray-200;
  border-radius: 50%;
  margin: 0 auto;
}

.skeleton-text-short {
  width: 80px;
  height: 14px;
  background: $gray-200;
  border-radius: 4px;
  margin: 8px auto 0;
}

.skeleton-text-shorter {
  width: 60px;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
  margin: 4px auto 0;
}

.skeleton-text-tiny {
  width: 40px;
  height: 10px;
  background: $gray-200;
  border-radius: 4px;
  margin: 4px auto 0;
}

.skeleton-table {
  margin-top: 16px;
}

.skeleton-table-header {
  display: flex;
  background: $gray-100;
  padding: 12px 0;
  border-bottom: 2px solid $gray-300;
}

.skeleton-header-cell {
  flex: 1;
  height: 16px;
  background: $gray-300;
  border-radius: 4px;
  margin: 0 8px;
}

.skeleton-table-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid $gray-200;
}

.skeleton-cell {
  flex: 1;
  margin: 0 8px;
}

.skeleton-text {
  width: 80%;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
}

.skeleton-shimmer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// ==========================================
// ESTILOS PRINCIPAIS
// ==========================================

.status-card {
  border-radius: 16px;
  transition: all 0.3s ease;

  &.healthy {
    border-left: 4px solid #2e7d32;
  }

  &.degraded {
    border-left: 4px solid #ed6c02;
  }
}

:deep(.q-tab-panel) {
  padding: 0;
}

:deep(.q-table) {
  thead tr th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }
}

@media (max-width: 768px) {
  .monitoring-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
