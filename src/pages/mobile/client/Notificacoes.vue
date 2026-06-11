<template>
  <div class="notificacoes-page">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregando" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-avatar"></div>
      </div>
      <div class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== HEADER COM FOTO DE PERFIL ===== -->
      <div class="page-header">
        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 class="page-title">Notificações</h1>

        <!-- FOTO DE PERFIL NO CANTO DIREITO -->
        <div class="profile-avatar" @click="irParaPerfil">
          <img
            v-if="authStore.user?.foto"
            :src="authStore.user.foto"
            alt="Foto de perfil"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder" :style="{ backgroundColor: avatarColor }">
            <span class="avatar-iniciais">{{ iniciaisNome }}</span>
          </div>
        </div>
      </div>

      <!-- ===== BOTÃO MARCAR TODAS COMO LIDAS ===== -->
      <div v-if="layoutStore.unreadCount > 0" class="mark-all-section">
        <button class="mark-all-btn" @click="marcarTodasComoLidas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Marcar todas como lidas</span>
        </button>
      </div>

      <!-- ===== FILTROS (SEM PROPAGAÇÃO) ===== -->
      <div class="filtros-section">
        <div class="filtros-scroll">
          <button
            v-for="filtro in filtros"
            :key="filtro.valor"
            class="filtro-btn"
            :class="{ active: filtroAtivo === filtro.valor }"
            @click.stop="setFiltro(filtro.valor)"
          >
            {{ filtro.label }}
            <span v-if="filtro.contagem && filtro.contagem > 0" class="filtro-count">{{ filtro.contagem }}</span>
          </button>
        </div>
      </div>

      <!-- ===== LISTA DE NOTIFICAÇÕES ===== -->
      <div class="notificacoes-list">
        <div v-if="notificacoesFiltradas.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3>Nenhuma notificação</h3>
          <p>{{ mensagemVazia }}</p>
        </div>

        <div v-else>
          <!-- Agrupamento por data -->
          <div v-for="group in notificacoesAgrupadas" :key="group.label" class="date-group">
            <div class="date-header">{{ group.label }}</div>

            <div class="notificacoes-group">
              <div
                v-for="notificacao in group.items"
                :key="notificacao.id"
                class="notificacao-card"
                :class="{ unread: !notificacao.lida }"
                @click="abrirNotificacao(notificacao)"
              >
                <div class="card-icon" :class="getIconClass(notificacao)">
                  <q-icon :name="getIcone(notificacao)" size="24px" />
                </div>

                <div class="card-content">
                  <div class="card-header">
                    <h4 class="card-title">{{ notificacao.titulo }}</h4>
                    <span class="card-time">{{ formatarHora(notificacao.created_at) }}</span>
                  </div>
                  <p class="card-message">{{ notificacao.mensagem }}</p>
                  <div class="card-footer">
                    <span class="card-date">{{ formatarDataCompleta(notificacao.created_at) }}</span>
                    <span v-if="!notificacao.lida" class="unread-badge">Nova</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { useClienteLayoutStore, type NotificacaoData } from 'src/stores/client/cliente-layout-store';

defineOptions({ name: 'MobileNotificacoes' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const layoutStore = useClienteLayoutStore();

// ===================== ESTADOS =====================
const carregando = ref(false);
const filtroAtivo = ref<string>('todas');

// ===================== COMPUTED PARA PERFIL =====================
const iniciaisNome = computed(() => {
  const nome = authStore.user?.nome || 'U';
  if (!nome.trim()) return 'U';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) {
    return partes[0]?.charAt(0).toUpperCase() || 'U';
  }
  const primeira = partes[0]?.charAt(0) || '';
  const ultima = partes[partes.length - 1]?.charAt(0) || '';
  return (primeira + ultima).toUpperCase();
});

const avatarColor = computed(() => {
  const colors = ['#5B4BF5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
  const nome = authStore.user?.nome || '';
  const index = Math.abs(nome.length) % colors.length;
  return colors[index] || '#5B4BF5';
});

// ===================== FILTROS =====================
interface Filtro {
  label: string;
  valor: string;
  contagem?: number;
}

const filtros = computed<Filtro[]>(() => {
  const naoLidas = layoutStore.notificacoes.filter(n => !n.lida).length;
  const pedidos = layoutStore.notificacoes.filter(n => n.tipo?.includes('pedido')).length;
  const mensagens = layoutStore.notificacoes.filter(n => n.tipo === 'mensagem').length;
  const avaliacoes = layoutStore.notificacoes.filter(n => n.tipo?.includes('avaliacao')).length;

  return [
    { label: 'Todas', valor: 'todas', contagem: layoutStore.notificacoes.length },
    { label: 'Não lidas', valor: 'nao-lidas', contagem: naoLidas },
    { label: 'Pedidos', valor: 'pedido', contagem: pedidos },
    { label: 'Mensagens', valor: 'mensagem', contagem: mensagens },
    { label: 'Avaliações', valor: 'avaliacao', contagem: avaliacoes },
  ];
});

const mensagemVazia = computed(() => {
  if (filtroAtivo.value === 'nao-lidas') {
    return 'Você não tem notificações não lidas';
  }
  if (filtroAtivo.value === 'pedido') {
    return 'Você não tem notificações de pedidos';
  }
  if (filtroAtivo.value === 'mensagem') {
    return 'Você não tem notificações de mensagens';
  }
  if (filtroAtivo.value === 'avaliacao') {
    return 'Você não tem notificações de avaliações';
  }
  return 'Você não tem notificações no momento';
});

// ===================== NOTIFICAÇÕES FILTRADAS =====================
const notificacoesFiltradas = computed(() => {
  let notificacoes = [...layoutStore.notificacoes];

  switch (filtroAtivo.value) {
    case 'nao-lidas':
      notificacoes = notificacoes.filter(n => !n.lida);
      break;
    case 'pedido':
      notificacoes = notificacoes.filter(n => n.tipo?.includes('pedido'));
      break;
    case 'mensagem':
      notificacoes = notificacoes.filter(n => n.tipo === 'mensagem');
      break;
    case 'avaliacao':
      notificacoes = notificacoes.filter(n => n.tipo?.includes('avaliacao'));
      break;
    default:
      break;
  }

  return notificacoes;
});

// ===================== NOTIFICAÇÕES AGRUPADAS =====================
const notificacoesAgrupadas = computed(() => {
  const grupos: Record<string, NotificacaoData[]> = {};

  notificacoesFiltradas.value.forEach(notificacao => {
    const data = new Date(notificacao.created_at);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    let chave: string;

    if (data.toDateString() === hoje.toDateString()) {
      chave = 'hoje';
    } else if (data.toDateString() === ontem.toDateString()) {
      chave = 'ontem';
    } else {
      chave = data.toISOString().split('T')[0] || 'outros';
    }

    if (!grupos[chave]) {
      grupos[chave] = [];
    }

    const grupo = grupos[chave];
    if (grupo) {
      grupo.push(notificacao);
    }
  });

  const ordem = ['hoje', 'ontem'];
  const outras = Object.keys(grupos).filter(k => !ordem.includes(k)).sort().reverse();
  const chavesOrdenadas = [...ordem, ...outras];

  return chavesOrdenadas.map(chave => {
    const items = grupos[chave] || [];
    const primeiraNotificacao = items[0];

    let label: string;
    if (chave === 'hoje') {
      label = 'Hoje';
    } else if (chave === 'ontem') {
      label = 'Ontem';
    } else if (primeiraNotificacao?.created_at) {
      label = formatarDataCompleta(primeiraNotificacao.created_at);
    } else {
      label = chave;
    }

    return {
      label,
      items
    };
  });
});

// ===================== FUNÇÕES =====================
const irParaPerfil = (): void => {
  void router.push('/mobile/perfil');
};

// ✅ Função para filtrar - sem propagação de eventos
const setFiltro = (valor: string): void => {
  filtroAtivo.value = valor;
};

const carregarNotificacoes = async (): Promise<void> => {
  carregando.value = true;
  try {
    await layoutStore.abrirNotificacoes();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar notificações',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

const marcarTodasComoLidas = async (): Promise<void> => {
  try {
    const success = await layoutStore.marcarTodasNotificacoesLidas();
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Todas notificações marcadas como lidas',
        position: 'top',
        timeout: 1500
      });
    }
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao marcar notificações',
      position: 'top'
    });
  }
};

const getIcone = (notificacao: NotificacaoData): string => {
  const tipo = notificacao.tipo || '';

  if (tipo.includes('pedido')) return 'shopping_bag';
  if (tipo.includes('avaliacao')) return 'star';
  if (tipo === 'mensagem') return 'chat';
  if (tipo === 'favorito') return 'favorite';
  if (tipo === 'promocao') return 'local_offer';
  if (tipo === 'transacao') return 'payments';
  return 'notifications';
};

const getIconClass = (notificacao: NotificacaoData): string => {
  const tipo = notificacao.tipo || '';

  if (tipo.includes('pedido')) return 'icon-pedido';
  if (tipo.includes('avaliacao')) return 'icon-avaliacao';
  if (tipo === 'mensagem') return 'icon-mensagem';
  if (tipo === 'favorito') return 'icon-favorito';
  if (tipo === 'promocao') return 'icon-promocao';
  if (tipo === 'transacao') return 'icon-transacao';
  return 'icon-sistema';
};

const abrirNotificacao = async (notificacao: NotificacaoData): Promise<void> => {
  const tipo = notificacao.tipo || '';
  const dados = notificacao.data || {};

  if (!notificacao.lida) {
    await layoutStore.marcarNotificacaoLida(notificacao.id);
  }

  if (tipo.includes('pedido')) {
    const pedidoId = dados.pedido_id as number | undefined;
    if (pedidoId) {
      void router.push(`/mobile/detalhes-pedido/${pedidoId}`);
      return;
    }
    void router.push('/mobile/meus-pedidos');
    return;
  }

  if (tipo.includes('avaliacao')) {
    const avaliacaoId = dados.avaliacao_id as number | undefined;
    const pedidoId = dados.pedido_id as number | undefined;
    if (avaliacaoId) {
      void router.push(`/mobile/avaliacao/${avaliacaoId}`);
      return;
    }
    if (pedidoId) {
      void router.push(`/mobile/detalhes-pedido/${pedidoId}`);
      return;
    }
    void router.push('/mobile/lista-prestadores');
    return;
  }

  if (tipo === 'mensagem') {
    const prestadorId = dados.prestador_id as number | undefined;
    if (prestadorId) {
      void router.push(`/mobile/chat/${prestadorId}`);
      return;
    }
    void router.push('/mobile/mensagens');
    return;
  }

  if (tipo === 'favorito') {
    void router.push('/mobile/favoritos');
    return;
  }

  if (tipo === 'promocao') {
    void router.push('/mobile/promocoes');
    return;
  }

  if (tipo === 'sistema' || tipo === 'transacao') {
    void router.push('/mobile/perfil');
    return;
  }

  void router.push('/mobile/inicio');
};

const formatarHora = (data: string): string => {
  const date = new Date(data);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const formatarDataCompleta = (data: string): string => {
  const date = new Date(data);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  if (date.toDateString() === hoje.toDateString()) {
    return 'Hoje';
  }

  if (date.toDateString() === ontem.toDateString()) {
    return 'Ontem';
  }

  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

onMounted(() => {
  void carregarNotificacoes();
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;
$danger: #ef4444;
$success: #10b981;
$warning: #f59e0b;
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;

// ===================== SKELETON =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading { background: $bg; min-height: 100vh; }
.skeleton-header {
  background: $white; padding: 16px; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid $border;
}
.skeleton-back-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-title {
  width: 120px; height: 24px; border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.skeleton-item {
  background: $white; border-radius: $radius-sm; padding: 16px; display: flex; gap: 12px;
  border: 1px solid $border;
}
.skeleton-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-info { flex: 1; }
.skeleton-line {
  height: 12px; border-radius: 6px; margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.w-40 { width: 40%; } .w-60 { width: 60%; } .w-80 { width: 80%; }

// ===================== LAYOUT =====================
.notificacoes-page { background: $bg; min-height: 100vh; }

// ===================== HEADER =====================
.page-header {
  background: $white; padding: 12px 16px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid $border; position: sticky; top: 0; z-index: 10;

  .back-btn {
    width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: $gray-light; border: none; cursor: pointer; color: $gray; transition: all 0.2s;
    &:hover { background: rgba($accent, 0.1); color: $accent; }
  }

  .page-title { font-size: 1.1rem; font-weight: 600; color: $dark; margin: 0; }

  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    overflow: hidden;
    flex-shrink: 0;

    &:hover {
      transform: scale(1.05);
      opacity: 0.9;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      .avatar-iniciais {
        font-size: 1rem;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
      }
    }
  }
}

// ===================== MARK ALL SECTION =====================
.mark-all-section {
  background: $white;
  padding: 8px 16px;
  border-bottom: 1px solid $border;

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

    &:hover {
      background: rgba($success, 0.2);
      transform: scale(1.02);
    }
  }
}

// ===================== FILTROS =====================
.filtros-section {
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;
  overflow-x: auto;

  .filtros-scroll {
    display: flex;
    gap: 8px;
    white-space: nowrap;
  }

  .filtro-btn {
    background: $gray-light;
    border: none;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover {
      background: rgba($accent, 0.1);
      color: $accent;
    }

    &.active {
      background: $accent;
      color: white;
    }

    .filtro-count {
      background: rgba(0,0,0,0.2);
      padding: 0 6px;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 600;
    }
  }
}

// ===================== LISTA =====================
.notificacoes-list {
  padding: 16px;
  padding-bottom: 40px;
}

.date-group {
  margin-bottom: 24px;

  .date-header {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: $gray;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }
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

    &.icon-pedido { background: rgba($accent, 0.1); color: $accent; }
    &.icon-avaliacao { background: rgba($warning, 0.1); color: $warning; }
    &.icon-mensagem { background: rgba($success, 0.1); color: $success; }
    &.icon-favorito { background: rgba($danger, 0.1); color: $danger; }
    &.icon-promocao { background: rgba($warning, 0.1); color: $warning; }
    &.icon-transacao { background: rgba($success, 0.1); color: $success; }
    &.icon-sistema { background: rgba($gray, 0.1); color: $gray; }
  }

  .card-content {
    flex: 1;
    min-width: 0;

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
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-date {
        font-size: 0.65rem;
        color: $gray;
      }

      .unread-badge {
        background: $accent;
        color: white;
        font-size: 0.6rem;
        padding: 2px 8px;
        border-radius: 20px;
        font-weight: 500;
      }
    }
  }
}

// ===================== EMPTY STATE =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-illustration {
    margin-bottom: 20px;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.8rem;
    color: $gray;
  }
}
</style>
