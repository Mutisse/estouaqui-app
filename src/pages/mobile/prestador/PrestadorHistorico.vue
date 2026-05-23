<template>
  <div class="prestador-historico">

    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">Histórico de Serviços</h1>
      <button class="menu-btn" @click="opcoes">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-back"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-menu"></div>
      </div>
      <div class="skeleton-filters">
        <div class="skeleton-filter"></div>
        <div class="skeleton-filter"></div>
        <div class="skeleton-filter"></div>
        <div class="skeleton-filter"></div>
      </div>
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
      <div class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
            <div class="skeleton-line w-40"></div>
          </div>
          <div class="skeleton-value"></div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loader"></div>
        <p>Carregando histórico...</p>
      </div>

      <template v-else>

        <!-- ===== FILTROS DE PERÍODO ===== -->
        <div class="filters-container">
          <button
            v-for="filtro in filtrosOpcoes"
            :key="filtro.value"
            class="filter-btn"
            :class="{ active: filtroPeriodo === filtro.value }"
            @click="filtroPeriodo = filtro.value"
          >
            {{ filtro.label }}
          </button>
        </div>

        <!-- ===== ESTATÍSTICAS DO PERÍODO ===== -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-value">{{ estatisticas.totalServicos }}</div>
            <div class="stat-label">Serviços</div>
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatarValor(estatisticas.totalGanhos) }} MZN</div>
            <div class="stat-label">Ganhos</div>
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- ===== LISTA DE HISTÓRICO ===== -->
        <div class="historico-container">
          <div v-if="historicoFiltrado.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
              <path d="M12 8v4l3 3M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
              <path d="M12 6v2"/>
              <path d="M12 12h.01"/>
            </svg>
            <div class="empty-title">Nenhum serviço encontrado</div>
            <div class="empty-desc">Você ainda não concluiu serviços neste período</div>
          </div>

          <div v-else class="servicos-list">
            <div v-for="servico in historicoFiltrado" :key="servico.id" class="servico-card">
              <div class="servico-header">
                <div class="cliente-info">
                  <div class="cliente-avatar">
                    <img :src="servico.clienteFoto || getAvatarUrl(servico.clienteNome)" />
                  </div>
                  <div class="cliente-details">
                    <div class="cliente-nome">{{ servico.clienteNome }}</div>
                    <div class="servico-data">{{ servico.data }}</div>
                  </div>
                </div>
                <div class="servico-valor">{{ formatarValor(servico.valor) }} MZN</div>
              </div>

              <div class="servico-body">
                <div class="servico-tipo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                  </svg>
                  <span>{{ servico.servicoNome }}</span>
                </div>

                <div class="servico-avaliacao" v-if="servico.avaliacao">
                  <div class="stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= (servico.avaliacao?.nota || 0) }">★</span>
                  </div>
                  <span class="avaliacao-comentario">{{ servico.avaliacao.comentario }}</span>
                </div>
                <div v-else class="avaliacao-pendente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span>Aguardando avaliação do cliente</span>
                </div>
              </div>

              <div class="servico-footer" v-if="!servico.avaliacao">
                <button class="responder-btn" @click="responderAvaliacao">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Responder avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorServicosStore } from 'src/stores/prestador/prestador-servicos-store';
import { usePrestadorFinanceiroStore } from 'src/stores/prestador/prestador-financeiro-store';
import type { SolicitacaoData } from 'src/stores/prestador/prestador-servicos-store';
import type { NotificacaoData } from 'src/stores/prestador/prestador-financeiro-store';

defineOptions({ name: 'PrestadorHistorico' });

interface ServicoHistorico {
  id: number;
  clienteNome: string;
  clienteFoto: string | null;
  data: string;
  servicoNome: string;
  valor: number;
  avaliacao?: {
    nota: number;
    comentario: string;
  };
}

interface EstatisticasPeriodo {
  totalServicos: number;
  totalGanhos: number;
}

interface FiltroOpcao {
  label: string;
  value: string;
}

const router = useRouter();
const $q = useQuasar();

const servicosStore = usePrestadorServicosStore();
const financeiroStore = usePrestadorFinanceiroStore();

const carregamentoInicial = ref(true);
const loading = ref(true);
const filtroPeriodo = ref('mes');
const solicitacoes = ref<SolicitacaoData[]>([]);
const avaliacoes = ref<NotificacaoData[]>([]);

const filtrosOpcoes: FiltroOpcao[] = [
  { label: 'Este mês', value: 'mes' },
  { label: 'Últimos 3 meses', value: 'trimestre' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Todos', value: 'todos' },
];

const historicoFiltrado = computed<ServicoHistorico[]>(() => {
  const concluidos = solicitacoes.value.filter((s: SolicitacaoData) => s.status === 'concluido');
  let filtrados = [...concluidos];
  const agora = new Date();

  if (filtroPeriodo.value === 'mes') {
    filtrados = filtrados.filter((p: SolicitacaoData) => {
      const data = new Date(p.data);
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    });
  } else if (filtroPeriodo.value === 'trimestre') {
    const tresMesesAtras = new Date(agora);
    tresMesesAtras.setMonth(agora.getMonth() - 3);
    filtrados = filtrados.filter((p: SolicitacaoData) => new Date(p.data) >= tresMesesAtras);
  } else if (filtroPeriodo.value === 'ano') {
    filtrados = filtrados.filter((p: SolicitacaoData) => {
      const data = new Date(p.data);
      return data.getFullYear() === agora.getFullYear();
    });
  }

  const resultado: ServicoHistorico[] = filtrados.map((pedido: SolicitacaoData) => {
    const avaliacaoEncontrada = avaliacoes.value.find((a: NotificacaoData) => a.id === pedido.id);
    const item: ServicoHistorico = {
      id: pedido.id,
      clienteNome: pedido.cliente?.nome || 'Cliente',
      clienteFoto: pedido.cliente?.foto || null,
      data: formatarData(pedido.data),
      servicoNome: pedido.servico?.nome || 'Serviço',
      valor: pedido.valor,
    };

    if (avaliacaoEncontrada) {
      item.avaliacao = {
        nota: 5,
        comentario: avaliacaoEncontrada.mensagem || '',
      };
    }

    return item;
  });

  return resultado;
});

const estatisticas = computed<EstatisticasPeriodo>(() => {
  const totalServicos = historicoFiltrado.value.length;
  const totalGanhos = historicoFiltrado.value.reduce((sum: number, s: ServicoHistorico) => sum + s.valor, 0);
  return { totalServicos, totalGanhos };
});

const formatarValor = (valor: number): string => {
  if (!valor && valor !== 0) return '0';
  return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatarData = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (date.toDateString() === hoje.toDateString()) return 'Hoje';
  if (date.toDateString() === ontem.toDateString()) return 'Ontem';

  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getAvatarUrl = (nome: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=5B4BF5&color=fff&bold=true`;
};

const carregarDados = async (): Promise<void> => {
  loading.value = true;
  try {
    await servicosStore.fetchSolicitacoes();
    solicitacoes.value = [...servicosStore.solicitacoes];

    await financeiroStore.fetchNotificacoes();
    avaliacoes.value = [...financeiroStore.notificacoes];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar histórico', position: 'top' });
  } finally {
    loading.value = false;
  }
};

const responderAvaliacao = (): void => {
  $q.notify({ type: 'info', message: 'Funcionalidade em breve', position: 'top' });
};

const opcoes = (): void => {
  $q.notify({ type: 'info', message: 'Opções em breve', position: 'top' });
};

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await carregarDados();
  } finally {
    setTimeout(() => { carregamentoInicial.value = false; }, 500);
  }
});
</script>

<style scoped lang="scss">
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$success-light: rgba(16, 185, 129, 0.1);
$warning: #F59E0B;
$warning-light: rgba(245, 158, 11, 0.1);
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$bg: #F4F4F8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.prestador-historico {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .back-btn, .menu-btn {
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
    &:hover { background: $accent-light; color: $accent; }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;

  .loader {
    width: 48px;
    height: 48px;
    border: 3px solid $border;
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  p { margin-top: 16px; color: $gray; font-size: 0.85rem; }
}

// =====================
// SKELETON LOADING
// =====================
.skeleton-container {
  .skeleton-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $white;
    padding: 12px 16px;
    border-bottom: 1px solid $border;

    .skeleton-back, .skeleton-menu {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: $gray-light;
    }

    .skeleton-title {
      width: 160px;
      height: 24px;
      background: $gray-light;
      border-radius: $radius-xs;
    }
  }

  .skeleton-filters {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: $white;

    .skeleton-filter {
      flex: 1;
      height: 36px;
      background: $gray-light;
      border-radius: 20px;
    }
  }

  .skeleton-stats {
    display: flex;
    gap: 12px;
    padding: 0 16px;
    margin-bottom: 16px;

    .skeleton-stat {
      flex: 1;
      height: 80px;
      background: $white;
      border-radius: $radius;
      border: 1px solid $border;
    }
  }

  .skeleton-list { padding: 0 16px; }

  .skeleton-item {
    display: flex;
    align-items: center;
    background: $white;
    border-radius: $radius;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid $border;

    .skeleton-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: $gray-light;
      margin-right: 12px;
    }

    .skeleton-info { flex: 1; }

    .skeleton-line {
      height: 14px;
      background: $gray-light;
      border-radius: 7px;
      margin: 4px 0;

      &.w-30 { width: 30%; }
      &.w-40 { width: 40%; }
      &.w-50 { width: 50%; }
    }

    .skeleton-value {
      width: 80px;
      height: 20px;
      background: $gray-light;
      border-radius: 4px;
    }
  }
}

// =====================
// FILTROS
// =====================
.filters-container {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: $white;
  border-bottom: 1px solid $border;
  flex-wrap: wrap;

  .filter-btn {
    flex: 1;
    min-width: 70px;
    padding: 8px 12px;
    background: $gray-light;
    border: none;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: $accent-light; color: $accent; }

    &.active {
      background: $accent;
      color: $white;
    }
  }
}

// =====================
// ESTATÍSTICAS
// =====================
.stats-container {
  display: flex;
  gap: 12px;
  padding: 16px;

  .stat-card {
    flex: 1;
    background: $white;
    border-radius: $radius;
    padding: 16px;
    border: 1px solid $border;
    position: relative;
    overflow: hidden;

    .stat-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: $accent;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.7rem;
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      position: absolute;
      bottom: 12px;
      right: 12px;
      opacity: 0.3;
      color: $accent;
    }
  }
}

// =====================
// HISTÓRICO
// =====================
.historico-container {
  padding: 0 16px;
}

.servicos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.servico-card {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .servico-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;

    .cliente-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .cliente-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .cliente-details {
        .cliente-nome {
          font-weight: 600;
          color: $dark;
          font-size: 0.9rem;
        }

        .servico-data {
          font-size: 0.7rem;
          color: $gray;
          margin-top: 2px;
        }
      }
    }

    .servico-valor {
      font-weight: 700;
      color: $accent;
      font-size: 1rem;
    }
  }

  .servico-body {
    padding: 16px;
    border-bottom: 1px solid $border;

    .servico-tipo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      svg { color: $gray; }
      span { font-size: 0.8rem; color: $gray; }
    }

    .servico-avaliacao {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;

      .stars {
        display: flex;
        gap: 2px;

        .star {
          font-size: 16px;
          color: $border;

          &.filled { color: $warning; }
        }
      }

      .avaliacao-comentario {
        font-size: 0.75rem;
        color: $gray;
      }
    }

    .avaliacao-pendente {
      display: flex;
      align-items: center;
      gap: 8px;

      svg { color: $gray; }
      span { font-size: 0.75rem; color: $gray; }
    }
  }

  .servico-footer {
    padding: 12px 16px;
    background: $gray-light;

    .responder-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: none;
      border-radius: $radius-xs;
      font-size: 0.75rem;
      font-weight: 500;
      color: $accent;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: $accent-light; }
    }
  }
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  background: $white;
  border-radius: $radius;
  padding: 48px 24px;
  border: 1px solid $border;

  svg { margin-bottom: 16px; }

  .empty-title {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 0.8rem;
    color: $gray;
  }
}
</style>
