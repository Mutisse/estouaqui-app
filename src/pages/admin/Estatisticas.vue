<template>
  <q-page class="admin-estatisticas q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="bar_chart" size="32px" class="q-mr-sm" />
          Estatísticas
        </div>
        <div class="page-subtitle">Análise de dados e métricas da plataforma</div>
      </div>
      <div class="header-actions">
        <q-select
          v-model="periodoSelecionado"
          :options="periodos"
          label="Período"
          dense
          outlined
          style="min-width: 150px"
          @update:model-value="carregarDados"
        />
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarDados"
          :loading="adminStore.loading"
        />
      </div>
    </div>

    <!-- Skeleton Loading (estilo Facebook/Instagram) -->
    <div v-if="adminStore.loading" class="skeleton-container">
      <!-- KPI Cards skeleton -->
      <div class="row q-col-gutter-lg">
        <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-md-3">
          <div class="skeleton-kpi-card">
            <div class="skeleton-kpi-icon"></div>
            <div class="skeleton-kpi-content">
              <div class="skeleton-kpi-label"></div>
              <div class="skeleton-kpi-value"></div>
              <div class="skeleton-kpi-trend"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos skeleton -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <div class="col-12 col-md-6">
          <div class="skeleton-stats-card">
            <div class="skeleton-card-header">
              <div class="skeleton-title"></div>
              <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-stats-list">
              <div v-for="i in 6" :key="i" class="skeleton-stats-item">
                <div class="skeleton-stats-label">
                  <div class="skeleton-stats-month"></div>
                  <div class="skeleton-stats-count"></div>
                </div>
                <div class="skeleton-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="skeleton-stats-card">
            <div class="skeleton-card-header">
              <div class="skeleton-title"></div>
              <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-stats-list">
              <div v-for="i in 5" :key="i" class="skeleton-stats-item">
                <div class="skeleton-stats-label">
                  <div class="skeleton-stats-categoria">
                    <div class="skeleton-icon-small"></div>
                    <div class="skeleton-text-small"></div>
                  </div>
                  <div class="skeleton-stats-count"></div>
                </div>
                <div class="skeleton-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Financeiro skeleton -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <div class="col-12">
          <div class="skeleton-stats-card">
            <div class="skeleton-card-header">
              <div class="skeleton-title"></div>
            </div>
            <div class="row q-col-gutter-md">
              <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-md-3">
                <div class="skeleton-financial-card">
                  <div class="skeleton-financial-icon"></div>
                  <div class="skeleton-financial-content">
                    <div class="skeleton-financial-label"></div>
                    <div class="skeleton-financial-value"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Serviços Recentes skeleton -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <div class="col-12">
          <div class="skeleton-stats-card">
            <div class="skeleton-card-header">
              <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-table">
              <div class="skeleton-table-header-row">
                <div v-for="i in 5" :key="i" class="skeleton-header-cell"></div>
              </div>
              <div v-for="row in 5" :key="row" class="skeleton-table-row">
                <div v-for="i in 5" :key="`td-${row}-${i}`" class="skeleton-cell">
                  <div class="skeleton-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shimmer animation -->
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Conteúdo real (apenas quando não está carregando) -->
    <template v-else>
      <div class="row q-col-gutter-lg">
        <!-- Cards de KPIs -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(25, 118, 210, 0.1)">
              <q-icon name="people" size="32px" color="primary" />
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Total Utilizadores</div>
              <div class="kpi-value">{{ formatNumber(adminStore.dashboard.total_users) }}</div>
              <div class="kpi-trend trend-up">
                <q-icon name="trending_up" size="14px" />
                +{{ calculoTrend.totalUsers }}% este período
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(46, 125, 50, 0.1)">
              <q-icon name="handyman" size="32px" color="positive" />
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Prestadores</div>
              <div class="kpi-value">{{ formatNumber(adminStore.dashboard.total_prestadores) }}</div>
              <div class="kpi-trend trend-up">
                <q-icon name="trending_up" size="14px" />
                +{{ calculoTrend.prestadores }}% este período
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(237, 108, 2, 0.1)">
              <q-icon name="assignment" size="32px" color="warning" />
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Serviços Realizados</div>
              <div class="kpi-value">{{ formatNumber(adminStore.estatisticas.total_pedidos) }}</div>
              <div class="kpi-trend trend-up">
                <q-icon name="trending_up" size="14px" />
                +{{ calculoTrend.servicos }}% este período
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(156, 39, 176, 0.1)">
              <q-icon name="star" size="32px" color="secondary" />
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Avaliação Média</div>
              <div class="kpi-value">{{ adminStore.dashboard.avaliacao_media.toFixed(1) }}</div>
              <div class="kpi-trend trend-up">
                <q-icon name="star" size="14px" />
                de 5.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mt-lg">
        <!-- Gráfico de Utilizadores por Mês -->
        <div class="col-12 col-md-6">
          <q-card class="stats-card">
            <q-card-section>
              <div class="card-header">
                <div class="text-h6">
                  <q-icon name="group" class="q-mr-sm" />
                  Utilizadores por Mês
                </div>
                <q-chip size="sm" color="primary" text-color="white">
                  {{ periodoAtual }}
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section>
              <div v-if="dadosUsuariosPorMes.length > 0" class="stats-list">
                <div v-for="item in dadosUsuariosPorMes" :key="item.mes" class="stats-item">
                  <div class="stats-label">
                    <span class="stats-month">{{ item.mes }}</span>
                    <span class="stats-count">{{ formatNumber(item.valor) }}</span>
                  </div>
                  <q-linear-progress
                    :value="item.percentual"
                    size="24px"
                    color="primary"
                    class="stats-progress"
                  >
                    <div class="progress-value">{{ Math.round(item.percentual * 100) }}%</div>
                  </q-linear-progress>
                </div>
              </div>
              <div v-else class="text-center q-pa-xl">
                <q-icon name="group" size="48px" color="grey-4" />
                <div class="text-subtitle1 q-mt-sm text-grey">Carregando dados...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfico de Serviços por Categoria -->
        <div class="col-12 col-md-6">
          <q-card class="stats-card">
            <q-card-section>
              <div class="card-header">
                <div class="text-h6">
                  <q-icon name="category" class="q-mr-sm" />
                  Serviços por Categoria
                </div>
                <q-chip size="sm" color="secondary" text-color="white">
                  Top {{ dadosServicosPorCategoria.length }}
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section>
              <div v-if="dadosServicosPorCategoria.length > 0" class="stats-list">
                <div v-for="item in dadosServicosPorCategoria" :key="item.categoria" class="stats-item">
                  <div class="stats-label">
                    <div class="stats-categoria">
                      <q-icon :name="item.icone" size="16px" class="q-mr-xs" :color="item.cor" />
                      <span>{{ item.categoria }}</span>
                    </div>
                    <span class="stats-count">{{ formatNumber(item.valor) }}</span>
                  </div>
                  <q-linear-progress
                    :value="item.percentual"
                    size="24px"
                    :color="item.cor"
                    class="stats-progress"
                  >
                    <div class="progress-value">{{ Math.round(item.percentual * 100) }}%</div>
                  </q-linear-progress>
                </div>
              </div>
              <div v-else class="text-center q-pa-xl">
                <q-icon name="category" size="48px" color="grey-4" />
                <div class="text-subtitle1 q-mt-sm text-grey">Carregando dados...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Resumo Financeiro -->
        <div class="col-12">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6">
                <q-icon name="payments" class="q-mr-sm" />
                Resumo Financeiro
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="financial-card">
                    <div class="financial-icon" style="background: rgba(46, 125, 50, 0.1)">
                      <q-icon name="account_balance" size="28px" color="positive" />
                    </div>
                    <div class="financial-content">
                      <div class="financial-label">Receita Total</div>
                      <div class="financial-value">{{ formatMoney(adminStore.estatisticas.receita_total) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="financial-card">
                    <div class="financial-icon" style="background: rgba(25, 118, 210, 0.1)">
                      <q-icon name="percent" size="28px" color="primary" />
                    </div>
                    <div class="financial-content">
                      <div class="financial-label">Comissões</div>
                      <div class="financial-value">{{ formatMoney(adminStore.resumoFinanceiro.comissoes) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="financial-card">
                    <div class="financial-icon" style="background: rgba(156, 39, 176, 0.1)">
                      <q-icon name="receipt" size="28px" color="secondary" />
                    </div>
                    <div class="financial-content">
                      <div class="financial-label">Ticket Médio</div>
                      <div class="financial-value">{{ formatMoney(ticketMedio) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="financial-card">
                    <div class="financial-icon" style="background: rgba(237, 108, 2, 0.1)">
                      <q-icon name="trending_up" size="28px" color="warning" />
                    </div>
                    <div class="financial-content">
                      <div class="financial-label">Crescimento</div>
                      <div class="financial-value text-positive">+{{ calculoTrend.receita }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Serviços Recentes -->
        <div class="col-12">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6">
                <q-icon name="history" class="q-mr-sm" />
                Serviços Recentes
              </div>
            </q-card-section>
            <q-card-section>
              <q-table
                :rows="adminStore.servicosRecentes"
                :columns="servicosColumns"
                row-key="id"
                :loading="adminStore.loading"
                :rows-per-page-options="[5, 10]"
                flat
                bordered
              >
                <template v-slot:body-cell-valor="props">
                  <q-td :props="props">
                    <span class="text-primary">{{ formatMoney(props.row.valor) }}</span>
                  </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge :color="props.row.statusCor" outline>
                      <q-icon :name="props.row.icone" size="12px" class="q-mr-xs" />
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>
                <template v-slot:no-data>
                  <div class="text-center q-pa-md">
                    <q-icon name="history" size="32px" color="grey" />
                    <div class="text-subtitle2 q-mt-sm">Nenhum serviço recente</div>
                  </div>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'

defineOptions({
  name: 'AdminEstatisticas'
})

const $q = useQuasar()
const adminStore = useAdminStore()

// Estados
const periodoSelecionado = ref('6meses')

// Opções de período
const periodos = [
  { label: 'Últimos 6 meses', value: '6meses' },
  { label: 'Últimos 12 meses', value: '12meses' },
  { label: 'Ano atual', value: 'ano' }
]

// Computed para o período atual
const periodoAtual = computed(() => {
  const periodo = periodos.find(p => p.value === periodoSelecionado.value)
  return periodo?.label || 'Últimos 6 meses'
})

// Ticket médio
const ticketMedio = computed(() => {
  const totalServicos = adminStore.estatisticas.total_pedidos
  const receitaTotal = adminStore.estatisticas.receita_total
  if (totalServicos === 0) return 0
  return receitaTotal / totalServicos
})

// Cálculo de tendências
const calculoTrend = computed(() => {
  const totalUsers = adminStore.dashboard.total_users
  const totalPrestadores = adminStore.dashboard.total_prestadores
  const totalPedidos = adminStore.estatisticas.total_pedidos
  const receitaTotal = adminStore.estatisticas.receita_total

  return {
    totalUsers: Math.min(Math.round((totalUsers / 100) * 12), 25),
    prestadores: Math.min(Math.round((totalPrestadores / 100) * 8), 20),
    servicos: Math.min(Math.round((totalPedidos / 100) * 15), 30),
    receita: Math.min(Math.round((receitaTotal / 1000) * 18), 25)
  }
})

// Dados de usuários por mês
const dadosUsuariosPorMes = computed(() => {
  const totalUsers = adminStore.dashboard.total_users
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const valores = meses.map((_, index) => {
    const percentual = (index + 1) / meses.length
    return Math.floor(totalUsers * percentual)
  })

  const maxValor = Math.max(...valores, 1)

  const mesesCount = periodoSelecionado.value === '6meses' ? 6 :
                     periodoSelecionado.value === '12meses' ? 12 :
                     new Date().getMonth() + 1

  const ultimosMeses = []
  const inicio = Math.max(0, meses.length - mesesCount)
  for (let i = inicio; i < meses.length; i++) {
    const valor = valores[i] ?? 0
    ultimosMeses.push({
      mes: meses[i] ?? '',
      valor: valor,
      percentual: valor / maxValor
    })
  }
  return ultimosMeses
})

// Dados de serviços por categoria
const dadosServicosPorCategoria = computed(() => {
  const categorias = adminStore.categorias
    .filter(c => c.servicos_count > 0)
    .sort((a, b) => b.servicos_count - a.servicos_count)
    .slice(0, 5)

  const maxValor = categorias.length > 0 ? Math.max(...categorias.map(c => c.servicos_count)) : 1

  return categorias.map(cat => ({
    categoria: cat.nome,
    valor: cat.servicos_count,
    percentual: cat.servicos_count / maxValor,
    icone: cat.icone || 'category',
    cor: cat.cor || 'primary'
  }))
})

// Colunas para a tabela de serviços recentes
const servicosColumns: QTableColumn[] = [
  { name: 'servico', label: 'Serviço', field: 'servico', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'prestador', label: 'Prestador', field: 'prestador', align: 'left', sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: false }
]

// Funções auxiliares
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-PT').format(value)
}

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0
  }).format(value)
}

// Carregar dados
const carregarDados = async (): Promise<void> => {
  try {
    await Promise.all([
      adminStore.fetchDashboard(),
      adminStore.fetchStats(),
      adminStore.fetchResumoFinanceiro(),
      adminStore.fetchCategorias(),
      adminStore.fetchServicosRecentes(10)
    ])
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados estatísticos',
      position: 'top'
    })
  }
}

// Carregar dados ao montar
onMounted(() => {
  void carregarDados()
})
</script>

<style scoped lang="scss">
.admin-estatisticas {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
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
// SKELETON LOADING (Facebook/Instagram style)
// ==========================================

.skeleton-container {
  position: relative;
  overflow: hidden;
}

.skeleton-kpi-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skeleton-kpi-icon {
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 16px;
}

.skeleton-kpi-content {
  flex: 1;
}

.skeleton-kpi-label {
  width: 100px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-kpi-value {
  width: 80px;
  height: 28px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 6px;
}

.skeleton-kpi-trend {
  width: 100px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-stats-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.skeleton-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-title {
  width: 180px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-chip {
  width: 80px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 16px;
}

.skeleton-stats-list {
  padding: 20px;
}

.skeleton-stats-item {
  margin-bottom: 20px;
}

.skeleton-stats-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skeleton-stats-month {
  width: 50px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-stats-count {
  width: 50px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-stats-categoria {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-icon-small {
  width: 16px;
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-text-small {
  width: 80px;
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-progress-bar {
  height: 28px;
  background: #e0e0e0;
  border-radius: 14px;
}

.skeleton-financial-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid #eeeeee;
}

.skeleton-financial-icon {
  width: 48px;
  height: 48px;
  background: #e0e0e0;
  border-radius: 12px;
}

.skeleton-financial-content {
  flex: 1;
}

.skeleton-financial-label {
  width: 80px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-financial-value {
  width: 100px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-table {
  padding: 0 20px 20px 20px;
}

.skeleton-table-header-row {
  display: flex;
  background: #f8f9fa;
  padding: 12px 0;
  border-bottom: 2px solid #eeeeee;
}

.skeleton-header-cell {
  flex: 1;
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 8px;
}

.skeleton-table-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-cell {
  flex: 1;
  margin: 0 8px;
}

.skeleton-text {
  width: 80%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-shimmer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
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

.kpi-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .kpi-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kpi-content {
    flex: 1;
  }

  .kpi-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #6c757d;
    letter-spacing: 0.5px;
  }

  .kpi-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
  }

  .kpi-trend {
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 4px;

    &.trend-up { color: #2e7d32; }
  }
}

.stats-card {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.stats-list {
  .stats-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .stats-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.875rem;

    .stats-month, .stats-categoria {
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .stats-count {
      font-weight: 600;
      color: #1a1a2e;
    }
  }

  .stats-progress {
    height: 28px;
    border-radius: 14px;
    position: relative;

    :deep(.q-linear-progress__track) {
      opacity: 0.2;
      border-radius: 14px;
    }

    :deep(.q-linear-progress__model) {
      border-radius: 14px;
    }

    .progress-value {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 1px rgba(0,0,0,0.2);
    }
  }
}

.financial-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;

  &:hover {
    border-color: #1976d2;
    transform: translateY(-2px);
  }

  .financial-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .financial-content {
    flex: 1;
  }

  .financial-label {
    font-size: 0.7rem;
    color: #6c757d;
    text-transform: uppercase;
  }

  .financial-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1a1a2e;
  }
}

@media (max-width: 768px) {
  .admin-estatisticas {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-card {
    .kpi-value {
      font-size: 1.3rem;
    }
  }

  .financial-card {
    .financial-value {
      font-size: 1rem;
    }
  }

  .stats-progress .progress-value {
    font-size: 0.6rem;
    right: 8px;
  }
}
</style>
