<template>
  <div class="prestador-notificacoes">

    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">Notificações</h1>
      <button class="menu-btn" @click="abrirMenuOpcoes">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="notificacoesStore.isLoading && !notificacoesStore.dadosCarregados" class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-back"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-menu"></div>
      </div>
      <div class="skeleton-filters">
        <div v-for="i in 5" :key="i" class="skeleton-filter"></div>
      </div>
      <div class="skeleton-list">
        <div v-for="i in 4" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
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

      <!-- ===== BOTÃO MARCAR TODAS COMO LIDAS ===== -->
      <div v-if="notificacoesStore.unreadCount > 0" class="mark-all-section">
        <button class="mark-all-btn" @click="marcarTodasComoLidas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Marcar todas como lidas</span>
        </button>
      </div>

      <!-- ===== FILTROS ===== -->
      <div class="filters-section">
        <div class="filters-scroll">
          <button
            v-for="filtro in filtrosOpcoes"
            :key="filtro.value"
            class="filter-chip"
            :class="{ active: notificacoesStore.filtroAtivo === filtro.value }"
            @click="mudarFiltro(filtro.value)"
          >
            {{ filtro.label }}
            <span v-if="filtro.value === 'nao_lidas' && notificacoesStore.contadores.naoLidas > 0" class="filter-count">
              {{ notificacoesStore.contadores.naoLidas }}
            </span>
          </button>
        </div>
      </div>

      <!-- ===== LISTA DE NOTIFICAÇÕES ===== -->
      <div class="notificacoes-container">
        <div v-if="notificacoesStore.notificacoesFiltradas.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3>Nenhuma notificação</h3>
          <p>{{ mensagemVazia }}</p>
        </div>

        <div v-else>
          <div v-for="(notificacoes, data) in notificacoesStore.notificacoesAgrupadasPorData" :key="data" class="date-group">
            <div class="date-header">{{ data }}</div>
            <div class="notificacoes-group">
              <div
                v-for="notificacao in notificacoes"
                :key="notificacao.id"
                class="notificacao-card"
                :class="{ unread: !notificacao.lida }"
                @click="abrirNotificacao(notificacao)"
              >
                <div class="card-icon" :class="`icon-${notificacoesStore.getCorPorTipo(notificacao.tipo)}`">
                  <q-icon :name="notificacoesStore.getIconePorTipo(notificacao.tipo)" size="24px" />
                </div>
                <div class="card-content">
                  <div class="card-header">
                    <h4 class="card-title">{{ notificacao.titulo }}</h4>
                    <span class="card-time">{{ notificacoesStore.formatarData(notificacao.created_at) }}</span>
                  </div>
                  <p class="card-message">{{ notificacao.mensagem }}</p>
                </div>
                <div class="card-actions" v-if="!notificacao.lida">
                  <span class="unread-badge">Nova</span>
                  <button class="more-btn" @click.stop="abrirOpcoesNotificacao(notificacao)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MENU DE OPÇÕES ===== -->
    <q-menu v-model="menuOpcoesAberto" class="options-menu">
      <div class="options-menu-content">
        <div class="options-menu-item" @click="limparNotificacoesLidas">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          </svg>
          <span>Limpar notificações lidas</span>
        </div>
        <div class="options-menu-item" @click="configurarNotificacoes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Configurações</span>
        </div>
      </div>
    </q-menu>

    <!-- ===== MENU DE OPÇÕES DA NOTIFICAÇÃO ===== -->
    <q-menu v-model="notifMenuOpcoesAberto" class="options-menu">
      <div class="options-menu-content">
        <div class="options-menu-item" @click="marcarComoLida(notificacaoSelecionada?.id)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Marcar como lida</span>
        </div>
        <div class="options-menu-item danger" @click="removerNotificacao(notificacaoSelecionada?.id)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          </svg>
          <span>Excluir</span>
        </div>
      </div>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorNotificacoesStore, filtrosOpcoes, type NotificacaoData } from 'src/stores/prestador/prestador-notificacoes-store';

defineOptions({ name: 'PrestadorNotificacoes' });

const router = useRouter();
const $q = useQuasar();

// ✅ APENAS UM STORE!
const notificacoesStore = usePrestadorNotificacoesStore();

// Estados locais
const menuOpcoesAberto = ref(false);
const notifMenuOpcoesAberto = ref(false);
const notificacaoSelecionada = ref<NotificacaoData | null>(null);

// Computed
const mensagemVazia = computed(() => {
  const filtro = notificacoesStore.filtroAtivo;
  if (filtro === 'nao_lidas') return 'Você não tem notificações não lidas';
  if (filtro === 'pedido') return 'Você não tem notificações de pedidos';
  if (filtro === 'pagamento') return 'Você não tem notificações de pagamentos';
  if (filtro === 'sistema') return 'Você não tem notificações do sistema';
  return 'Você não tem notificações no momento';
});

// ===================== FUNÇÕES =====================

const mudarFiltro = (filtro: string): void => {
  notificacoesStore.setFiltro(filtro);
};

const marcarTodasComoLidas = async (): Promise<void> => {
  const success = await notificacoesStore.marcarTodasNotificacoesLidas();
  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Todas notificações marcadas como lidas',
      position: 'top',
      timeout: 1500
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top'
    });
  }
};

// ✅ CORRIGIDO: Remover async quando não tem await
const limparNotificacoesLidas = (): void => {
  menuOpcoesAberto.value = false;

  $q.dialog({
    title: 'Limpar notificações',
    message: 'Deseja remover todas as notificações lidas?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Limpar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await notificacoesStore.removerNotificacoesLidas();
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Notificações lidas removidas',
          position: 'top'
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover notificações',
          position: 'top'
        });
      }
    })();
  });
};

const marcarComoLida = async (id?: number): Promise<void> => {
  if (!id) return;
  notifMenuOpcoesAberto.value = false;
  await notificacoesStore.marcarNotificacaoLida(id);
};

// ✅ CORRIGIDO: Remover async quando não tem await
const removerNotificacao = (id?: number): void => {
  if (!id) return;
  notifMenuOpcoesAberto.value = false;

  $q.dialog({
    title: 'Excluir notificação',
    message: 'Deseja excluir esta notificação?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await notificacoesStore.removerNotificacao(id);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Notificação removida',
          position: 'top'
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover notificação',
          position: 'top'
        });
      }
    })();
  });
};

// ✅ CORRIGIDO: Converter dados para número antes de usar na URL
const abrirNotificacao = async (notificacao: NotificacaoData): Promise<void> => {
  if (!notificacao.lida) {
    await notificacoesStore.marcarNotificacaoLida(notificacao.id);
  }

  const tipo = notificacao.tipo;
  const dados = notificacao.data || {};

  // ✅ Converter para número com segurança
  const pedidoId = typeof dados.pedido_id === 'number' ? dados.pedido_id : Number(dados.pedido_id);
  const prestadorId = typeof dados.prestador_id === 'number' ? dados.prestador_id : Number(dados.prestador_id);

  if (tipo === 'pedido' && pedidoId && !isNaN(pedidoId)) {
    void router.push(`/mobile/prestador/pedidos/${pedidoId}`);
    return;
  }

  if (tipo === 'pagamento') {
    void router.push('/mobile/prestador/ganhos');
    return;
  }

  if (tipo === 'avaliacao' && pedidoId && !isNaN(pedidoId)) {
    void router.push(`/mobile/prestador/avaliacao/${pedidoId}`);
    return;
  }

  if (tipo === 'mensagem' && prestadorId && !isNaN(prestadorId)) {
    void router.push(`/mobile/prestador/chat/${prestadorId}`);
    return;
  }

  // Fallback
  void router.push('/mobile/prestador/notificacoes');
};

const abrirMenuOpcoes = (): void => {
  menuOpcoesAberto.value = true;
};

const abrirOpcoesNotificacao = (notificacao: NotificacaoData): void => {
  notificacaoSelecionada.value = notificacao;
  notifMenuOpcoesAberto.value = true;
};

const configurarNotificacoes = (): void => {
  menuOpcoesAberto.value = false;
  void router.push('/mobile/prestador/configuracoes');
};

// ===================== CARREGAMENTO INICIAL =====================

const carregarDados = async (): Promise<void> => {
  try {
    await notificacoesStore.carregarTodosDados();
    notificacoesStore.iniciarPolling(30000);
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar notificações',
      position: 'top'
    });
  }
};

onMounted(() => {
  void carregarDados();
});

onUnmounted(() => {
  notificacoesStore.pararPolling();
});
</script>

<style scoped lang="scss">
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$info: #3B82F6;
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

.prestador-notificacoes {
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

// ===================== SKELETON =====================
.skeleton-container {
  .skeleton-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $white;
    padding: 12px 16px;
    border-bottom: 1px solid $border;
  }
  .skeleton-back, .skeleton-menu {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $gray-light;
  }
  .skeleton-title { width: 120px; height: 24px; background: $gray-light; border-radius: $radius-xs; }
  .skeleton-filters { display: flex; gap: 8px; padding: 12px 16px; background: $white; }
  .skeleton-filter { flex: 1; height: 36px; background: $gray-light; border-radius: 20px; }
  .skeleton-list { padding: 16px; }
  .skeleton-item {
    display: flex; align-items: center; gap: 12px; background: $white;
    border-radius: $radius; padding: 16px; margin-bottom: 12px; border: 1px solid $border;
  }
  .skeleton-icon { width: 48px; height: 48px; border-radius: 50%; background: $gray-light; }
  .skeleton-info { flex: 1; }
  .skeleton-line { height: 14px; background: $gray-light; border-radius: 7px; margin: 6px 0; }
  .skeleton-badge { width: 60px; height: 24px; background: $gray-light; border-radius: 12px; }
  .w-30 { width: 30%; } .w-40 { width: 40%; } .w-60 { width: 60%; }
}

// ===================== MARK ALL =====================
.mark-all-section {
  background: $white;
  padding: 8px 16px;
  border-bottom: 1px solid $border;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba($success, 0.1);
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: $success;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba($success, 0.2); }
}

// ===================== FILTROS =====================
.filters-section {
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;
  overflow-x: auto;
}

.filters-scroll {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: $gray-light;
  border: 1px solid $border;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover { background: $accent-light; border-color: $accent; color: $accent; }
  &.active { background: $accent; border-color: $accent; color: $white; }

  .filter-count {
    background: rgba(255,255,255,0.2);
    padding: 0 6px;
    border-radius: 10px;
    font-size: 0.65rem;
    font-weight: 600;
  }
}

// ===================== NOTIFICAÇÕES =====================
.notificacoes-container {
  padding: 16px;
}

.date-group {
  margin-bottom: 20px;
}

.date-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: $gray;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.notificacoes-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notificacao-card {
  background: $white;
  border-radius: $radius;
  padding: 16px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid $border;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  &.unread {
    background: rgba($accent, 0.02);
    border-left: 3px solid $accent;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.icon-primary { background: rgba($accent, 0.1); color: $accent; }
    &.icon-positive { background: rgba($success, 0.1); color: $success; }
    &.icon-info { background: rgba($info, 0.1); color: $info; }
    &.icon-warning { background: rgba($warning, 0.1); color: $warning; }
    &.icon-accent { background: rgba($accent, 0.1); color: $accent; }
    &.icon-grey { background: rgba($gray, 0.1); color: $gray; }
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: $dark;
      margin: 0;
    }

    .card-time {
      font-size: 0.7rem;
      color: $gray;
    }
  }

  .card-message {
    font-size: 0.8rem;
    color: $gray;
    margin: 0;
    line-height: 1.4;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .unread-badge {
    background: $accent;
    color: white;
    font-size: 0.6rem;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 500;
  }

  .more-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    &:hover { background: $gray-light; }
  }
}

// ===================== EMPTY STATE =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;

  .empty-icon { margin-bottom: 20px; opacity: 0.5; }
  h3 { font-size: 1rem; font-weight: 600; color: $dark; margin-bottom: 8px; }
  p { font-size: 0.8rem; color: $gray; }
}

// ===================== MENU =====================
.options-menu {
  .options-menu-content {
    background: $white;
    border-radius: $radius-sm;
    overflow: hidden;
    min-width: 180px;
  }

  .options-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.85rem;
    color: $dark;

    svg { color: $gray; }

    &:hover { background: $gray-light; }

    &.danger {
      color: $danger;
      svg { color: $danger; }
      &:hover { background: rgba($danger, 0.1); }
    }
  }
}
</style>
