<template>
  <div class="prestador-ganhos">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-menu-btn"></div>
      </div>
      <div class="skeleton-saldo-card"></div>
      <div class="skeleton-filtros">
        <div v-for="i in 4" :key="i" class="skeleton-filter-btn"></div>
      </div>
      <div class="skeleton-resumo">
        <div class="row q-col-gutter-sm">
          <div v-for="i in 3" :key="i" class="col-4">
            <div class="skeleton-resumo-card"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-grafico">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-grafico-card">
          <div class="skeleton-grafico-barras">
            <div v-for="i in 6" :key="i" class="skeleton-barra"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-historico">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-list-info">
              <div class="skeleton-line w-50"></div>
              <div class="skeleton-line w-30"></div>
            </div>
            <div class="skeleton-badge"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-estatisticas">
        <div class="skeleton-section-header"></div>
        <div class="row q-col-gutter-sm">
          <div v-for="i in 4" :key="i" class="col-12 col-md-6">
            <div class="skeleton-estatistica-card"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== CABEÇALHO ===== -->
      <div class="page-header">
        <button class="back-btn" @click="() => void router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 class="page-title">Meus Ganhos</h1>
        <button class="menu-btn" @click="opcoes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      <!-- Loading interno -->
      <div v-if="ganhosStore.isLoading" class="loading-state">
        <div class="loader"></div>
        <p>Carregando dados...</p>
      </div>

      <template v-else>
        <!-- ===== SALDO CARD ===== -->
        <div class="saldo-card">
          <div class="saldo-card__inner">
            <div class="saldo-label">Saldo disponível</div>
            <div class="saldo-value">{{ formatarValor(ganhosStore.saldoDisponivel) }} MZN</div>
            <button class="saque-btn" @click="irParaSaques">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              Realizar saque
            </button>
          </div>
        </div>

        <!-- ===== FILTROS DE PERÍODO ===== -->
        <div class="periodo-filters">
          <button class="periodo-btn" :class="{ active: ganhosStore.periodo === 'hoje' }" @click="mudarPeriodo('hoje')">Hoje</button>
          <button class="periodo-btn" :class="{ active: ganhosStore.periodo === 'semana' }" @click="mudarPeriodo('semana')">Semana</button>
          <button class="periodo-btn" :class="{ active: ganhosStore.periodo === 'mes' }" @click="mudarPeriodo('mes')">Mês</button>
          <button class="periodo-btn" :class="{ active: ganhosStore.periodo === 'ano' }" @click="mudarPeriodo('ano')">Ano</button>
        </div>

        <!-- ===== RESUMO ===== -->
        <div class="resumo-grid">
          <div class="resumo-card">
            <div class="resumo-card__value">{{ ganhosStore.resumo.totalServicos }}</div>
            <div class="resumo-card__label">Serviços</div>
          </div>
          <div class="resumo-card">
            <div class="resumo-card__value">{{ formatarValor(ganhosStore.resumo.ganhosPeriodo) }}</div>
            <div class="resumo-card__label">Ganhos</div>
          </div>
          <div class="resumo-card">
            <div class="resumo-card__value">{{ formatarValor(ganhosStore.resumo.media) }}</div>
            <div class="resumo-card__label">Média</div>
          </div>
        </div>

        <!-- ===== GRÁFICO ===== -->
        <div class="grafico-section">
          <div class="section-header">
            <h3>Evolução de ganhos</h3>
          </div>
          <div class="grafico-card">
            <div v-if="ganhosStore.graficoData.length === 0" class="grafico-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                <path d="M12 8v4l2 2" />
              </svg>
              <p>Nenhum dado disponível</p>
            </div>
            <div v-else class="grafico-barras">
              <div v-for="(item, index) in ganhosStore.graficoData" :key="index" class="barra-item">
                <div class="barra-label">{{ item.label }}</div>
                <div class="barra-container">
                  <div class="barra" :style="{ height: item.altura + 'px' }"></div>
                </div>
                <div class="barra-valor">{{ formatarValor(item.valor) }}k</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== HISTÓRICO ===== -->
        <div class="historico-section">
          <div class="section-header">
            <h3>Últimos ganhos</h3>
            <button class="view-all" @click="verTodos">Ver todos →</button>
          </div>
          <div v-if="ganhosStore.historicoGanhos.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
              <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <p>Nenhum ganho registrado</p>
          </div>
          <div v-else class="historico-list">
            <div v-for="ganho in ganhosStore.historicoGanhos" :key="ganho.id" class="historico-item">
              <div class="historico-item__avatar" :class="ganho.cor">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83" />
                </svg>
              </div>
              <div class="historico-item__info">
                <div class="historico-item__cliente">{{ ganho.cliente }}</div>
                <div class="historico-item__servico">{{ ganho.servico }} • {{ ganho.data }}</div>
              </div>
              <div class="historico-item__valor">+{{ formatarValor(ganho.valor) }} MZN</div>
            </div>
          </div>
        </div>

        <!-- ===== ESTATÍSTICAS DETALHADAS ===== -->
        <div class="estatisticas-section">
          <div class="section-header">
            <h3>Estatísticas Detalhadas</h3>
          </div>
          <div class="estatisticas-grid">
            <div class="estatistica-card">
              <div class="estatistica-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div class="estatistica-card__title">Melhor mês</div>
              <div class="estatistica-card__value">{{ ganhosStore.estatisticas.melhorMes.mes }}</div>
              <div class="estatistica-card__sub">{{ formatarValor(ganhosStore.estatisticas.melhorMes.valor) }} MZN</div>
            </div>
            <div class="estatistica-card">
              <div class="estatistica-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                  <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                </svg>
              </div>
              <div class="estatistica-card__title">Serviço mais requisitado</div>
              <div class="estatistica-card__value">{{ ganhosStore.estatisticas.servicoMaisRequisitado.nome }}</div>
              <div class="estatistica-card__sub">{{ ganhosStore.estatisticas.servicoMaisRequisitado.quantidade }} serviços</div>
            </div>
            <div class="estatistica-card">
              <div class="estatistica-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="estatistica-card__title">Melhor cliente</div>
              <div class="estatistica-card__value">{{ ganhosStore.estatisticas.melhorCliente.nome }}</div>
              <div class="estatistica-card__sub">{{ formatarValor(ganhosStore.estatisticas.melhorCliente.totalGasto) }} MZN gastos</div>
            </div>
            <div class="estatistica-card">
              <div class="estatistica-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                  <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83" />
                </svg>
              </div>
              <div class="estatistica-card__title">Média por serviço</div>
              <div class="estatistica-card__value">{{ formatarValor(ganhosStore.estatisticas.mediaPorServico) }} MZN</div>
              <div class="estatistica-card__sub">{{ ganhosStore.estatisticas.totalServicos }} serviços realizados</div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorGanhosStore } from 'src/stores/prestador/prestador-ganhos-store';

defineOptions({ name: 'PrestadorGanhos' });

const router = useRouter();
const $q = useQuasar();

// ✅ APENAS UM STORE!
const ganhosStore = usePrestadorGanhosStore();

const carregamentoInicial = ref(true);

const formatarValor = (valor: number): string => {
  if (valor >= 1000) return (valor / 1000).toFixed(1) + 'k';
  return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const mudarPeriodo = async (periodo: 'hoje' | 'semana' | 'mes' | 'ano'): Promise<void> => {
  ganhosStore.setPeriodo(periodo);
  await ganhosStore.recarregarDados();
};

const irParaSaques = (): void => {
  void router.push('/mobile/prestador/saques');
};

const opcoes = (): void => {
  $q.notify({ type: 'info', message: 'Opções em breve', position: 'top' });
};

const verTodos = (): void => {
  $q.notify({ type: 'info', message: 'Histórico completo em breve', position: 'top' });
};

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await ganhosStore.carregarTodosDados();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados', position: 'top' });
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10b981;
$warning: #f59e0b;
$danger: #ef4444;
$info: #3b82f6;
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

%shimmer {
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-loading {
  background: $bg;
  min-height: 100vh;
}
.skeleton-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 16px;
  border-bottom: 1px solid $border;
}
.skeleton-back-btn,
.skeleton-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  @extend %shimmer;
}
.skeleton-title {
  width: 120px;
  height: 24px;
  border-radius: 12px;
  @extend %shimmer;
}
.skeleton-saldo-card {
  height: 160px;
  margin: 16px;
  background: linear-gradient(135deg, $accent, #9f7aea);
  border-radius: $radius;
  opacity: 0.7;
}
.skeleton-filtros {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: $white;
}
.skeleton-filter-btn {
  flex: 1;
  height: 36px;
  border-radius: $radius-xs;
  @extend %shimmer;
}
.skeleton-resumo {
  padding: 16px;
}
.skeleton-resumo-card {
  height: 80px;
  background: $white;
  border-radius: $radius-sm;
  border: 1px solid $border;
  @extend %shimmer;
}
.skeleton-grafico,
.skeleton-historico,
.skeleton-estatisticas {
  padding: 0 16px;
  margin-bottom: 24px;
}
.skeleton-section-header {
  height: 24px;
  width: 150px;
  border-radius: 12px;
  margin-bottom: 12px;
  @extend %shimmer;
}
.skeleton-grafico-card {
  background: $white;
  border-radius: $radius;
  padding: 16px;
  border: 1px solid $border;
}
.skeleton-grafico-barras {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
}
.skeleton-barra {
  width: 40px;
  height: 80px;
  border-radius: 15px 15px 0 0;
  @extend %shimmer;
}
.skeleton-list {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
}
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border;
}
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  @extend %shimmer;
}
.skeleton-list-info {
  flex: 1;
}
.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 4px 0;
  @extend %shimmer;
}
.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
  @extend %shimmer;
}
.skeleton-estatistica-card {
  height: 100px;
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  margin-bottom: 12px;
  @extend %shimmer;
}
.w-30 {
  width: 30%;
}
.w-40 {
  width: 40%;
}
.w-50 {
  width: 50%;
}
.w-60 {
  width: 60%;
}

// =====================
// LAYOUT PRINCIPAL
// =====================
.prestador-ganhos {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;

  .back-btn,
  .menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;

    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

.loading-state {
  text-align: center;
  padding: 60px 20px;

  .loader {
    width: 40px;
    height: 40px;
    border: 3px solid $accent-light;
    border-top-color: $accent;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 0.8s linear infinite;
  }
  p {
    color: $gray;
    font-size: 0.85rem;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// =====================
// SALDO CARD
// =====================
.saldo-card {
  padding: 16px;

  &__inner {
    background: linear-gradient(135deg, $accent, #9f7aea);
    border-radius: $radius;
    padding: 32px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
  }

  .saldo-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
  }

  .saldo-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: $white;
    margin-bottom: 20px;
  }

  .saque-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: $white;
    border: none;
    padding: 10px 24px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    color: $accent;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

// =====================
// PERÍODO FILTERS
// =====================
.periodo-filters {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background: $white;
  border-bottom: 1px solid $border;
}

.periodo-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: $radius-xs;
  font-size: 0.85rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $accent-light;
    color: $accent;
  }
  &.active {
    background: $accent;
    color: $white;
  }
}

// =====================
// RESUMO
// =====================
.resumo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.resumo-card {
  background: $white;
  border-radius: $radius-sm;
  padding: 16px;
  text-align: center;
  border: 1px solid $border;

  &__value {
    font-size: 1.3rem;
    font-weight: 700;
    color: $accent;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  &__label {
    font-size: 0.7rem;
    color: $gray;
  }
}

// =====================
// GRÁFICO
// =====================
.grafico-section {
  padding: 0 16px;
  margin-bottom: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
  .view-all {
    background: none;
    border: none;
    font-size: 0.75rem;
    color: $accent;
    cursor: pointer;
  }
}

.grafico-card {
  background: $white;
  border-radius: $radius;
  padding: 20px;
  border: 1px solid $border;
}

.grafico-empty {
  text-align: center;
  padding: 20px;
  p {
    font-size: 0.8rem;
    color: $gray;
    margin-top: 8px;
  }
}

.grafico-barras {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
}

.barra-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.barra-container {
  height: 120px;
  width: 30px;
  background: $gray-light;
  border-radius: 15px 15px 0 0;
  margin: 5px 0;
  position: relative;
  overflow: hidden;
}

.barra {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: $accent;
  border-radius: 15px 15px 0 0;
  transition: height 0.3s ease;
}

.barra-label {
  font-size: 0.7rem;
  color: $gray;
}
.barra-valor {
  font-size: 0.7rem;
  font-weight: 600;
  color: $accent;
}

// =====================
// HISTÓRICO
// =====================
.historico-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;

  p {
    font-size: 0.8rem;
    color: $gray;
    margin-top: 8px;
  }
}

.historico-list {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
}

.historico-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.primary {
      background: rgba($accent, 0.1);
      color: $accent;
    }
    &.success {
      background: rgba($success, 0.1);
      color: $success;
    }
    &.warning {
      background: rgba($warning, 0.1);
      color: $warning;
    }
    &.info {
      background: rgba($info, 0.1);
      color: $info;
    }
    &.accent {
      background: rgba($accent, 0.1);
      color: $accent;
    }
  }

  &__info {
    flex: 1;
  }
  &__cliente {
    font-size: 0.85rem;
    font-weight: 500;
    color: $dark;
    margin-bottom: 2px;
  }
  &__servico {
    font-size: 0.7rem;
    color: $gray;
  }
  &__valor {
    font-size: 0.85rem;
    font-weight: 700;
    color: $success;
  }
}

// =====================
// ESTATÍSTICAS
// =====================
.estatisticas-section {
  padding: 0 16px;
  margin-bottom: 24px;
}
.estatisticas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.estatistica-card {
  background: $white;
  border-radius: $radius;
  padding: 16px;
  border: 1px solid $border;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: $accent;
  }

  &__icon {
    margin-bottom: 12px;
  }
  &__title {
    font-size: 0.7rem;
    color: $gray;
    margin-bottom: 4px;
  }
  &__value {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 2px;
  }
  &__sub {
    font-size: 0.7rem;
    color: $accent;
  }
}
</style>
