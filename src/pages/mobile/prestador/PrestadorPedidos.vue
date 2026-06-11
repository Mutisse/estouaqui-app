<template>
  <div class="prestador-pedidos">
    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="page-title">Pedidos Recebidos</h1>
      <button class="menu-btn" @click="opcoes">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
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
      <div class="skeleton-tabs">
        <div v-for="i in 4" :key="i" class="skeleton-tab"></div>
      </div>
      <div class="skeleton-cards">
        <div v-for="i in 2" :key="i" class="skeleton-card">
          <div class="skeleton-card-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-info">
              <div class="skeleton-line w-50"></div>
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-30"></div>
            </div>
          </div>
          <div class="skeleton-card-body">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-30"></div>
            <div class="skeleton-line w-60"></div>
          </div>
          <div class="skeleton-card-footer">
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- Loading overlay -->
      <div v-if="pedidosStore.isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>Carregando pedidos...</p>
      </div>

      <template v-else>
        <!-- ===== TABS ===== -->
        <div class="tabs-container">
          <button
            v-for="tabOption in tabsOpcoes"
            :key="tabOption.value"
            class="tab-btn"
            :class="{ active: tab === tabOption.value }"
            @click="tab = tabOption.value"
          >
            {{ tabOption.label }}
            <span
              v-if="tabOption.value === 'pendentes' && pedidosStore.contadores.pendentes > 0"
              class="tab-badge danger"
            >
              {{ pedidosStore.contadores.pendentes }}
            </span>
            <span
              v-if="tabOption.value === 'confirmados' && pedidosStore.contadores.confirmados > 0"
              class="tab-badge success"
            >
              {{ pedidosStore.contadores.confirmados }}
            </span>
          </button>
        </div>

        <!-- ===== TAB: PENDENTES ===== -->
        <div v-show="tab === 'pendentes'" class="tab-content">
          <div v-if="pedidosStore.pedidosPendentes.length === 0" class="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              stroke-width="1.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <h3>Nenhum pedido pendente</h3>
            <p>Quando receber novos pedidos, aparecerão aqui</p>
          </div>

          <div v-else class="pedidos-list">
            <div
              v-for="pedido in pedidosStore.pedidosPendentes"
              :key="pedido.id"
              class="pedido-card"
            >
              <div class="pedido-card__header">
                <div class="pedido-avatar" :style="getAvatarStyle(pedido.cliente?.nome)">
                  {{ getInitials(pedido.cliente?.nome || 'Cliente') }}
                </div>
                <div class="pedido-info">
                  <div class="pedido-nome">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-data">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {{ formatarData(pedido.data) }}
                  </div>
                </div>
                <span class="status-badge warning">Pendente</span>
              </div>

              <div class="pedido-card__body">
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Duração</div>
                    <div class="detail-value">{{ obterDuracaoServico(pedido) }} min</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Valor</div>
                    <div class="detail-value primary">{{ formatarValor(pedido.valor) }} MZN</div>
                  </div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Localização</div>
                  <div class="detail-value">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {{ pedido.endereco || 'Endereço não informado' }}
                  </div>
                </div>
                <div v-if="pedido.observacoes" class="detail-item full-width">
                  <div class="detail-label">Observações</div>
                  <div class="detail-value muted">{{ pedido.observacoes }}</div>
                </div>
              </div>

              <div class="pedido-card__footer">
                <button
                  class="action-btn secondary"
                  @click="recusarPedido(pedido)"
                  :disabled="loadingAcao === pedido.id"
                >
                  <div v-if="loadingAcao === pedido.id" class="btn-spinner-small"></div>
                  <span v-else>Recusar</span>
                </button>
                <button
                  class="action-btn primary"
                  @click="aceitarPedido(pedido)"
                  :disabled="loadingAcao === pedido.id"
                >
                  <div v-if="loadingAcao === pedido.id" class="btn-spinner-small"></div>
                  <span v-else>Aceitar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== TAB: CONFIRMADOS ===== -->
        <div v-show="tab === 'confirmados'" class="tab-content">
          <div v-if="pedidosStore.pedidosConfirmados.length === 0" class="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              stroke-width="1.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Nenhum pedido confirmado</h3>
            <p>Os pedidos que aceitar aparecerão aqui</p>
          </div>

          <div v-else class="pedidos-list">
            <div
              v-for="pedido in pedidosStore.pedidosConfirmados"
              :key="pedido.id"
              class="pedido-card"
            >
              <div class="pedido-card__header">
                <div class="pedido-avatar" :style="getAvatarStyle(pedido.cliente?.nome)">
                  {{ getInitials(pedido.cliente?.nome || 'Cliente') }}
                </div>
                <div class="pedido-info">
                  <div class="pedido-nome">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-data">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {{ formatarData(pedido.data) }}
                  </div>
                </div>
                <span class="status-badge success">Confirmado</span>
              </div>

              <div class="pedido-card__body">
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Duração</div>
                    <div class="detail-value">{{ obterDuracaoServico(pedido) }} min</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Valor</div>
                    <div class="detail-value primary">{{ formatarValor(pedido.valor) }} MZN</div>
                  </div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Localização</div>
                  <div class="detail-value">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {{ pedido.endereco || 'Endereço não informado' }}
                  </div>
                </div>
              </div>

              <div class="pedido-card__footer">
                <button class="action-btn outline" @click="abrirChat(pedido)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </button>
                <button
                  class="action-btn primary"
                  @click="iniciarServico(pedido)"
                  :disabled="loadingAcao === pedido.id"
                >
                  <div v-if="loadingAcao === pedido.id" class="btn-spinner-small"></div>
                  <span v-else>Iniciar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== TAB: CONCLUÍDOS ===== -->
        <div v-show="tab === 'concluidos'" class="tab-content">
          <div v-if="pedidosStore.pedidosConcluidos.length === 0" class="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              stroke-width="1.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Nenhum pedido concluído</h3>
            <p>Histórico de serviços realizados</p>
          </div>

          <div v-else class="pedidos-list">
            <div
              v-for="pedido in pedidosStore.pedidosConcluidos"
              :key="pedido.id"
              class="pedido-card"
            >
              <div class="pedido-card__header">
                <div class="pedido-avatar" :style="getAvatarStyle(pedido.cliente?.nome)">
                  {{ getInitials(pedido.cliente?.nome || 'Cliente') }}
                </div>
                <div class="pedido-info">
                  <div class="pedido-nome">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-data">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {{ formatarData(pedido.data) }}
                  </div>
                </div>
                <span class="status-badge info">Concluído</span>
              </div>

              <div class="pedido-card__footer-note">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  stroke-width="2"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  />
                </svg>
                <span>Aguardando avaliação do cliente</span>
              </div>

              <div class="pedido-card__footer">
                <button class="action-btn outline" @click="verDetalhes(pedido)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== TAB: CANCELADOS ===== -->
        <div v-show="tab === 'cancelados'" class="tab-content">
          <div v-if="pedidosStore.pedidosCancelados.length === 0" class="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <h3>Nenhum pedido cancelado</h3>
          </div>

          <div v-else class="pedidos-list">
            <div
              v-for="pedido in pedidosStore.pedidosCancelados"
              :key="pedido.id"
              class="pedido-card"
            >
              <div class="pedido-card__header">
                <div class="pedido-avatar" :style="getAvatarStyle(pedido.cliente?.nome)">
                  {{ getInitials(pedido.cliente?.nome || 'Cliente') }}
                </div>
                <div class="pedido-info">
                  <div class="pedido-nome">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                  <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                  <div class="pedido-data">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {{ formatarData(pedido.data) }}
                  </div>
                </div>
                <span class="status-badge danger">Cancelado</span>
              </div>
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
import {
  usePrestadorPedidosStore,
  type SolicitacaoData,
} from 'src/stores/prestador/prestador-pedidos-store';

defineOptions({ name: 'PrestadorPedidos' });

interface TabOpcao {
  label: string;
  value: string;
}

const router = useRouter();
const $q = useQuasar();

// ✅ APENAS este store - específico para a tela de pedidos
const pedidosStore = usePrestadorPedidosStore();

const carregamentoInicial = ref(true);
const tab = ref('pendentes');
const loadingAcao = ref<number | null>(null);

const tabsOpcoes: TabOpcao[] = [
  { label: 'Pendentes', value: 'pendentes' },
  { label: 'Confirmados', value: 'confirmados' },
  { label: 'Concluídos', value: 'concluidos' },
  { label: 'Cancelados', value: 'cancelados' },
];

const avatarGradients = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

const getAvatarStyle = (nome?: string) => {
  if (!nome) return { background: avatarGradients[0] };
  const idx = Math.abs(nome.charCodeAt(0)) % avatarGradients.length;
  return { background: avatarGradients[idx] };
};

const getInitials = (nome: string): string => {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();
};

const obterDuracaoServico = (pedido: SolicitacaoData): number => {
  if (pedido.servico && 'duracao' in pedido.servico && typeof pedido.servico.duracao === 'number') {
    return pedido.servico.duracao;
  }
  return 60;
};

const formatarData = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffHours < 48) {
    return 'Ontem';
  }
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatarValor = (valor: number): string => {
  if (!valor && valor !== 0) return '0';
  return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ✅ Aceitar pedido usando o store específico
const aceitarPedido = (pedido: SolicitacaoData): void => {
  loadingAcao.value = pedido.id;
  $q.dialog({
    title: 'Confirmar aceitação',
    message: `Deseja aceitar o pedido de ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Aceitar', color: 'positive', unelevated: true },
  })
    .onOk(() => {
      void (async () => {
        try {
          const success = await pedidosStore.aceitarSolicitacao(pedido.id);
          if (success) {
            $q.notify({ type: 'positive', message: 'Pedido aceito com sucesso!', position: 'top' });
          } else {
            $q.notify({ type: 'negative', message: 'Erro ao aceitar pedido', position: 'top' });
          }
        } catch {
          $q.notify({ type: 'negative', message: 'Erro ao aceitar pedido', position: 'top' });
        } finally {
          loadingAcao.value = null;
        }
      })();
    })
    .onCancel(() => {
      loadingAcao.value = null;
    });
};

// ✅ Recusar pedido usando o store específico
const recusarPedido = (pedido: SolicitacaoData): void => {
  loadingAcao.value = pedido.id;
  $q.dialog({
    title: 'Confirmar recusa',
    message: `Deseja recusar o pedido de ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Recusar', color: 'negative', unelevated: true },
  })
    .onOk(() => {
      void (async () => {
        try {
          const success = await pedidosStore.recusarSolicitacao(pedido.id);
          if (success) {
            $q.notify({ type: 'negative', message: 'Pedido recusado', position: 'top' });
          } else {
            $q.notify({ type: 'negative', message: 'Erro ao recusar pedido', position: 'top' });
          }
        } catch {
          $q.notify({ type: 'negative', message: 'Erro ao recusar pedido', position: 'top' });
        } finally {
          loadingAcao.value = null;
        }
      })();
    })
    .onCancel(() => {
      loadingAcao.value = null;
    });
};

// ✅ Iniciar serviço usando o store específico
const iniciarServico = (pedido: SolicitacaoData): void => {
  $q.dialog({
    title: 'Iniciar serviço',
    message: `Confirmar início do serviço para ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Iniciar', color: 'positive', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        const success = await pedidosStore.iniciarServico(pedido.id);
        if (success) {
          $q.notify({ type: 'positive', message: 'Serviço iniciado!', position: 'top' });
        } else {
          $q.notify({ type: 'negative', message: 'Erro ao iniciar serviço', position: 'top' });
        }
      } catch {
        $q.notify({ type: 'negative', message: 'Erro ao iniciar serviço', position: 'top' });
      }
    })();
  });
};

const abrirChat = (pedido: SolicitacaoData): void => {
  void router.push(`/mobile/chat/${pedido.cliente_id}`);
};

const verDetalhes = (pedido: SolicitacaoData): void => {
  $q.notify({ type: 'info', message: `Pedido #${pedido.numero || pedido.id}`, position: 'top' });
};

const opcoes = (): void => {
  $q.dialog({
    title: 'Opções',
    message: 'Configurações de pedidos',
    options: {
      type: 'radio',
      model: 'notificacoes',
      items: [
        { label: 'Notificações em tempo real', value: 'notificacoes' },
        { label: 'Modo não perturbe', value: 'dnd' },
        { label: 'Aceitar automaticamente', value: 'auto' },
      ],
    },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(() => {
    $q.notify({ type: 'positive', message: 'Configuração salva', position: 'top' });
  });
};

// ✅ Carregar pedidos usando o store específico
const carregarPedidos = async (): Promise<void> => {
  try {
    await pedidosStore.fetchSolicitacoes();
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar pedidos', position: 'top' });
  }
};

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await carregarPedidos();
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS
// =====================
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10b981;
$success-light: rgba(16, 185, 129, 0.1);
$warning: #f59e0b;
$warning-light: rgba(245, 158, 11, 0.1);
$danger: #ef4444;
$danger-light: rgba(239, 68, 68, 0.1);
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.prestador-pedidos {
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
  position: sticky;
  top: 0;
  z-index: 10;

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

  p {
    margin-top: 16px;
    color: $gray;
    font-size: 0.85rem;
  }
}

// =====================
// SKELETON
// =====================
.skeleton-container {
  .skeleton-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $white;
    padding: 12px 16px;
    border-bottom: 1px solid $border;

    .skeleton-back,
    .skeleton-menu {
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

  .skeleton-tabs {
    display: flex;
    background: $white;
    padding: 8px;
    gap: 8px;

    .skeleton-tab {
      flex: 1;
      height: 40px;
      background: $gray-light;
      border-radius: 20px;
    }
  }

  .skeleton-cards {
    padding: 16px;
  }

  .skeleton-card {
    background: $white;
    border-radius: $radius;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid $border;

    .skeleton-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .skeleton-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: $gray-light;
      margin-right: 12px;
    }
    .skeleton-info {
      flex: 1;
    }
    .skeleton-line {
      height: 14px;
      background: $gray-light;
      border-radius: 7px;
      margin: 6px 0;
    }
    .skeleton-card-body {
      margin: 16px 0;
    }
    .skeleton-card-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid $border;
    }
    .skeleton-btn {
      width: 100px;
      height: 36px;
      background: $gray-light;
      border-radius: 8px;
    }
  }
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
// TABS
// =====================
.tabs-container {
  display: flex;
  background: $white;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid $border;

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 24px;
    font-size: 0.8rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background: $gray-light;
    }

    &.active {
      background: $accent;
      color: $white;
    }

    .tab-badge {
      position: absolute;
      top: 4px;
      right: 12px;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      font-size: 0.65rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;

      &.danger {
        background: $danger;
        color: $white;
      }
      &.success {
        background: $success;
        color: $white;
      }
    }
  }
}

.tab-content {
  padding: 16px;
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;

  svg {
    margin-bottom: 16px;
  }
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }
  p {
    color: $gray;
    font-size: 0.8rem;
  }
}

// =====================
// PEDIDO CARD
// =====================
.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pedido-card {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__body {
    padding: 16px;
    background: rgba(0, 0, 0, 0.01);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid $border;
  }

  &__footer-note {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba($warning, 0.08);
    font-size: 0.75rem;
    color: darken($warning, 15%);
  }
}

.pedido-avatar {
  width: 50px;
  height: 50px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: $white;
  flex-shrink: 0;
}

.pedido-info {
  flex: 1;

  .pedido-nome {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 2px;
  }
  .pedido-servico {
    font-size: 0.8rem;
    color: $accent;
    margin-bottom: 2px;
  }
  .pedido-data {
    font-size: 0.7rem;
    color: $gray;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;

  &.warning {
    background: $warning-light;
    color: darken($warning, 20%);
  }
  &.success {
    background: $success-light;
    color: darken($success, 15%);
  }
  &.info {
    background: $accent-light;
    color: $accent;
  }
  &.danger {
    background: $danger-light;
    color: darken($danger, 15%);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  .detail-item {
    &.full-width {
      grid-column: span 2;
    }

    .detail-label {
      font-size: 0.65rem;
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: $dark;
      display: flex;
      align-items: center;
      gap: 4px;
      &.primary {
        color: $accent;
        font-weight: 600;
      }
      &.muted {
        color: $gray;
        font-weight: 400;
      }
    }
  }
}

.action-btn {
  padding: 8px 20px;
  border-radius: $radius-xs;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: $accent;
    border: none;
    color: $white;
    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
    }
  }

  &.secondary {
    background: transparent;
    border: 1px solid $border;
    color: $gray;
    &:hover:not(:disabled) {
      background: $gray-light;
      border-color: $gray;
    }
  }

  &.outline {
    background: transparent;
    border: 1px solid $border;
    color: $accent;
    &:hover {
      background: $accent-light;
      border-color: $accent;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

// =====================
// RESPONSIVIDADE
// =====================
@media (max-width: 480px) {
  .pedido-card__header {
    flex-wrap: wrap;
  }
  .status-badge {
    margin-left: auto;
  }
  .pedido-card__footer {
    flex-direction: column;
  }
  .action-btn {
    justify-content: center;
  }
  .details-grid {
    grid-template-columns: 1fr;
  }
  .detail-item.full-width {
    grid-column: span 1;
  }
  .tabs-container .tab-btn {
    font-size: 0.7rem;
  }
}
</style>
