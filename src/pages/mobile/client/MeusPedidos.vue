<template>
  <div class="pedidos-page">
    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <h1 class="page-title">Meus Pedidos</h1>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="pedidosStore.carregando" class="skeleton-loading">
      <div class="skeleton-tabs">
        <div v-for="i in 3" :key="i" class="skeleton-tab"></div>
      </div>
      <div class="skeleton-cards">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-card-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-30"></div>
          </div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- Tabs de filtro -->
      <div class="filter-tabs">
        <button
          class="tab-btn"
          :class="{ active: tabAtivo === 'ativos' }"
          @click="tabAtivo = 'ativos'"
        >
          Ativos
          <span v-if="pedidosStore.contadores.ativos > 0" class="tab-badge">{{
            pedidosStore.contadores.ativos
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: tabAtivo === 'concluidos' }"
          @click="tabAtivo = 'concluidos'"
        >
          Concluídos
          <span v-if="pedidosStore.contadores.concluidos > 0" class="tab-badge">{{
            pedidosStore.contadores.concluidos
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: tabAtivo === 'cancelados' }"
          @click="tabAtivo = 'cancelados'"
        >
          Cancelados
          <span v-if="pedidosStore.contadores.cancelados > 0" class="tab-badge">{{
            pedidosStore.contadores.cancelados
          }}</span>
        </button>
      </div>

      <!-- Pedidos Ativos -->
      <div v-show="tabAtivo === 'ativos'" class="tab-panel">
        <div v-if="pedidosStore.pedidosAtivos.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Nenhum pedido ativo</h3>
          <p>Seus pedidos em andamento aparecerão aqui</p>
        </div>

        <div v-else class="pedidos-list">
          <div
            v-for="pedido in pedidosStore.pedidosAtivos"
            :key="pedido.id"
            class="pedido-card"
            @click="() => void verPedido(pedido.id)"
          >
            <div class="pedido-card__header">
              <div class="pedido-avatar">
                <div
                  class="avatar-placeholder"
                  :style="getAvatarStyle(pedido.prestador?.nome || 'P')"
                >
                  {{ getInitials(pedido.prestador?.nome || 'Prestador') }}
                </div>
              </div>
              <div class="pedido-info">
                <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
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
                  {{ pedidosStore.formatarData(pedido.data) }}
                </div>
              </div>
              <div class="pedido-status" :class="pedidosStore.getStatusClass(pedido.status)">
                {{ pedidosStore.getStatusTexto(pedido.status) }}
              </div>
            </div>
            <div class="pedido-card__actions">
              <button class="action-btn chat" @click.stop="() => void abrirChat(pedido)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
                Chat
              </button>
              <button
                v-if="pedido.status === 'pendente' || pedido.status === 'aceito'"
                class="action-btn cancel"
                @click.stop="() => void cancelarPedido(pedido.id)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pedidos Concluídos -->
      <div v-show="tabAtivo === 'concluidos'" class="tab-panel">
        <div v-if="pedidosStore.pedidosConcluidos.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>Nenhum pedido concluído</h3>
          <p>Seus serviços finalizados aparecerão aqui</p>
        </div>

        <div v-else class="pedidos-list">
          <div
            v-for="pedido in pedidosStore.pedidosConcluidos"
            :key="pedido.id"
            class="pedido-card"
            @click="() => void verPedido(pedido.id)"
          >
            <div class="pedido-card__header">
              <div class="pedido-avatar">
                <div
                  class="avatar-placeholder"
                  :style="getAvatarStyle(pedido.prestador?.nome || 'P')"
                >
                  {{ getInitials(pedido.prestador?.nome || 'Prestador') }}
                </div>
              </div>
              <div class="pedido-info">
                <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
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
                  {{ pedidosStore.formatarData(pedido.data) }}
                </div>
              </div>
              <div class="pedido-valor">{{ pedidosStore.formatarMoeda(pedido.valor || 0) }}</div>
            </div>
            <div class="pedido-card__actions">
              <button
                v-if="!pedidosStore.pedidoAvaliado(pedido.id)"
                class="action-btn rate"
                @click.stop="() => void avaliarPedido(pedido.id)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon
                    points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"
                  />
                </svg>
                Avaliar
              </button>
              <button class="action-btn repeat" @click.stop="() => void recontratar(pedido.id)">
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
                Repetir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pedidos Cancelados -->
      <div v-show="tabAtivo === 'cancelados'" class="tab-panel">
        <div v-if="pedidosStore.pedidosCancelados.length === 0" class="empty-state">
          <div class="empty-icon">❌</div>
          <h3>Nenhum pedido cancelado</h3>
          <p>Seus pedidos cancelados aparecerão aqui</p>
        </div>

        <div v-else class="pedidos-list">
          <div
            v-for="pedido in pedidosStore.pedidosCancelados"
            :key="pedido.id"
            class="pedido-card"
            @click="() => void verPedido(pedido.id)"
          >
            <div class="pedido-card__header">
              <div class="pedido-avatar">
                <div
                  class="avatar-placeholder"
                  :style="getAvatarStyle(pedido.prestador?.nome || 'P')"
                >
                  {{ getInitials(pedido.prestador?.nome || 'Prestador') }}
                </div>
              </div>
              <div class="pedido-info">
                <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                <div class="pedido-prestador">{{ pedido.prestador?.nome || 'Prestador' }}</div>
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
                  {{ pedidosStore.formatarData(pedido.data) }}
                </div>
              </div>
              <div class="pedido-status cancelado">Cancelado</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClientePedidosStore, type PedidoData } from 'src/stores/client/cliente-pedidos-store';

defineOptions({ name: 'MobileMeusPedidos' });

const router = useRouter();
const $q = useQuasar();
const pedidosStore = useClientePedidosStore();

const tabAtivo = ref('ativos');

const avatarGradients = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

const getAvatarStyle = (nome: string) => {
  const idx = Math.abs(nome?.charCodeAt(0) || 0) % avatarGradients.length;
  return { background: avatarGradients[idx] };
};

const getInitials = (nome: string): string => {
  if (!nome || nome.trim() === '') return 'U';
  const partes = nome.trim().split(' ');
  if (partes.length === 1 && partes[0]) {
    return partes[0].charAt(0).toUpperCase();
  }
  const primeiraLetra = partes[0]?.charAt(0) || '';
  const ultimaLetra = partes[partes.length - 1]?.charAt(0) || '';
  if (!primeiraLetra && !ultimaLetra) return 'U';
  if (!primeiraLetra) return ultimaLetra.toUpperCase();
  if (!ultimaLetra) return primeiraLetra.toUpperCase();
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

const verPedido = (id: number) => {
  void router.push(`/mobile/detalhes-pedido/${id}`);
};

const abrirChat = (pedido: PedidoData) => {
  const prestadorId = pedido.prestador?.id;
  if (prestadorId) {
    void router.push(`/mobile/chat/${prestadorId}`);
  } else {
    $q.notify({ type: 'warning', message: 'Prestador não encontrado', position: 'top' });
  }
};

const cancelarPedido = (id: number) => {
  $q.dialog({
    title: 'Cancelar pedido',
    message: 'Tem certeza que deseja cancelar este pedido?',
    cancel: { label: 'Não', flat: true },
    ok: { label: 'Sim, cancelar', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const success = await pedidosStore.cancelarPedidoCliente(id);
        if (success) {
          $q.notify({
            type: 'positive',
            message: 'Pedido cancelado com sucesso!',
            position: 'top',
          });
        } else {
          $q.notify({
            type: 'negative',
            message: pedidosStore.erro || 'Erro ao cancelar pedido',
            position: 'top',
          });
        }
      } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
        $q.notify({ type: 'negative', message: 'Erro ao cancelar pedido', position: 'top' });
      }
    })();
  });
};

const avaliarPedido = (pedidoId: number) => {
  void router.push(`/mobile/avaliacao/${pedidoId}`);
};

const recontratar = async (pedidoId: number) => {
  try {
    const novoPedido = await pedidosStore.recontratarServico(pedidoId);
    if (novoPedido) {
      $q.notify({
        type: 'positive',
        message: 'Serviço recontratado com sucesso!',
        position: 'top',
      });
      void router.push(`/mobile/detalhes-pedido/${novoPedido.id}`);
    } else {
      $q.notify({
        type: 'negative',
        message: pedidosStore.erro || 'Erro ao recontratar serviço',
        position: 'top',
      });
    }
  } catch (err) {
    console.error('Erro ao recontratar:', err);
    $q.notify({ type: 'negative', message: 'Erro ao recontratar serviço', position: 'top' });
  }
};

const carregarPedidos = async () => {
  try {
    await pedidosStore.fetchMeusPedidos();
    await pedidosStore.fetchDashboard();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    $q.notify({ type: 'negative', message: 'Erro ao carregar pedidos', position: 'top' });
  }
};

onMounted(() => {
  void carregarPedidos();
});

onUnmounted(() => {
  pedidosStore.limparStore();
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
.skeleton-tabs {
  display: flex;
  background: $white;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid $border;
}
.skeleton-tab {
  flex: 1;
  height: 40px;
  border-radius: $radius-sm;
  @extend %shimmer;
}
.skeleton-cards {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-card {
  background: $white;
  border-radius: $radius-sm;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid $border;
}
.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  @extend %shimmer;
}
.skeleton-card-info {
  flex: 1;
}
.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  @extend %shimmer;
}
.skeleton-badge {
  width: 70px;
  height: 28px;
  border-radius: 20px;
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
.pedidos-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  background: $white;
  padding: 16px;
  border-bottom: 1px solid $border;

  .page-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $dark;
    margin: 0;
  }
}

// =====================
// TABS
// =====================
.filter-tabs {
  display: flex;
  background: $white;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid $border;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: $accent-light;
    color: $accent;
  }

  &.active {
    background: $accent;
    color: $white;

    .tab-badge {
      background: rgba(255, 255, 255, 0.2);
      color: $white;
    }
  }
}

.tab-badge {
  background: rgba($gray, 0.1);
  color: $gray;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 22px;
}

// =====================
// TAB PANEL
// =====================
.tab-panel {
  padding: 16px;
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }
  p {
    font-size: 0.8rem;
    color: $gray;
  }
}

// =====================
// PEDIDOS LIST
// =====================
.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// =====================
// PEDIDO CARD
// =====================
.pedido-card {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: $accent;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
  }
}

.pedido-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: $white;
  text-transform: uppercase;
}

.pedido-info {
  flex: 1;
}

.pedido-servico {
  font-size: 0.95rem;
  font-weight: 600;
  color: $dark;
  margin-bottom: 2px;
}

.pedido-prestador {
  font-size: 0.8rem;
  color: $gray;
  margin-bottom: 4px;
}

.pedido-data {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: $gray;
}

.pedido-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;

  &.pendente {
    background: rgba($warning, 0.15);
    color: darken($warning, 15%);
  }
  &.aceito {
    background: rgba($accent, 0.15);
    color: $accent;
  }
  &.andamento {
    background: rgba($info, 0.15);
    color: $info;
  }
  &.concluido {
    background: rgba($success, 0.15);
    color: darken($success, 15%);
  }
  &.cancelado {
    background: rgba($danger, 0.15);
    color: $danger;
  }
}

.pedido-valor {
  font-size: 1rem;
  font-weight: 700;
  color: $accent;
}

// =====================
// ACTION BUTTONS
// =====================
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.chat {
    color: $accent;
    &:hover {
      background: $accent-light;
    }
  }
  &.cancel {
    color: $danger;
    &:hover {
      background: rgba($danger, 0.1);
    }
  }
  &.rate {
    color: $warning;
    &:hover {
      background: rgba($warning, 0.1);
    }
  }
  &.repeat {
    color: $success;
    &:hover {
      background: rgba($success, 0.1);
    }
  }
}

// =====================
// SCROLLBAR
// =====================
.pedidos-page::-webkit-scrollbar {
  width: 4px;
}

.pedidos-page::-webkit-scrollbar-track {
  background: $border;
}

.pedidos-page::-webkit-scrollbar-thumb {
  background: $accent;
  border-radius: 4px;
}
</style>
