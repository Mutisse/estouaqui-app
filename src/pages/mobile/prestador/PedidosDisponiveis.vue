<template>
  <div class="pedidos-disponiveis-page">

    <!-- ===== CABEÇALHO MODERNO ===== -->
    <header class="modern-header">
      <button class="header-btn" @click="() => void router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="header-center">
        <h1>Pedidos Disponíveis</h1>
        <p>Encontre serviços perto de você</p>
      </div>
      <button class="header-btn" @click="recarregarDados" :disabled="pedidosStore.isLoading">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </header>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-container">
      <div class="skeleton-header-spacer"></div>
      <div class="skeleton-filters-bar"></div>
      <div class="skeleton-cards">
        <div v-for="i in 3" :key="i" class="skeleton-card-modern">
          <div class="skeleton-avatar-large"></div>
          <div class="skeleton-content">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-80"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- ===== FILTROS MODERNOS ===== -->
      <div class="filters-bar">
        <div class="filter-scroll">
          <button
            class="filter-chip"
            :class="{ active: filtros.categoriaId === null }"
            @click="atualizarFiltroCategoria(null)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            Todas
          </button>
          <button
            v-for="cat in categoriasOptions"
            :key="cat.value"
            class="filter-chip"
            :class="{ active: filtros.categoriaId === cat.value }"
            :style="filtros.categoriaId === cat.value ? { background: cat.color, borderColor: cat.color } : {}"
            @click="atualizarFiltroCategoria(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- ===== CONTROLES DE ORDENAÇÃO E RAIO ===== -->
      <div class="controls-bar">
        <div class="control-group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Raio:</span>
          <div class="raio-selector">
            <span v-for="raio in raioOptions" :key="raio.value"
                  class="raio-value"
                  :class="{ active: filtros.raio === raio.value }"
                  @click="atualizarFiltroRaio(raio.value)">
              {{ raio.label }}
            </span>
          </div>
        </div>

        <div class="control-group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="3" x2="12" y2="21"/>
            <path d="M8 7l4-4 4 4M8 17l4 4 4-4"/>
          </svg>
          <div class="ordenacao-selector">
            <span v-for="op in ordenacaoOptions" :key="op.value"
                  class="ordenacao-value"
                  :class="{ active: filtros.ordenacao === op.value }"
                  @click="atualizarFiltroOrdenacao(op.value)">
              {{ op.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== ESTATÍSTICA RÁPIDA ===== -->
      <div class="stats-chip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span>{{ pedidosStore.totalPedidosDisponiveis }} pedido{{ pedidosStore.totalPedidosDisponiveis !== 1 ? 's' : '' }} disponível{{ pedidosStore.totalPedidosDisponiveis !== 1 ? 'is' : '' }}</span>
      </div>

      <!-- ===== LISTA DE PEDIDOS ===== -->
      <div v-if="!pedidosStore.temPedidosDisponiveis" class="empty-state-modern">
        <div class="empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h3>Nenhum pedido encontrado</h3>
        <p>Tente ajustar os filtros ou aumentar o raio de busca</p>
        <button class="reset-btn" @click="limparFiltros">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Limpar filtros
        </button>
      </div>

      <div v-else class="pedidos-grid">
        <div v-for="pedido in pedidosStore.pedidosFiltrados" :key="pedido.id" class="pedido-card-modern">

          <!-- Badge de distância -->
          <div v-if="pedido.distancia_km" class="distance-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ pedido.distancia_km < 1
              ? (pedido.distancia_km * 1000).toFixed(0) + 'm'
              : pedido.distancia_km.toFixed(1) + ' km'
            }}
          </div>

          <!-- Avatar e nome -->
          <div class="card-header">
            <div class="cliente-avatar-large" :style="getAvatarStyle(pedido.cliente?.nome)">
              {{ getInitials(pedido.cliente?.nome || 'Cliente') }}
            </div>
            <div class="card-header-info">
              <div class="cliente-nome">{{ pedido.cliente?.nome || 'Cliente' }}</div>
              <div class="pedido-data">{{ formatarData(pedido.created_at) }}</div>
            </div>
            <div class="categoria-tag" :style="{ background: (pedido.categoria?.cor || '#667eea') + '20', color: pedido.categoria?.cor || '#667eea' }">
              {{ pedido.categoria?.nome || 'Serviço' }}
            </div>
          </div>

          <!-- Descrição -->
          <div class="card-description">
            <p>{{ pedido.descricao || 'Sem descrição' }}</p>
          </div>

          <!-- Localização -->
          <div class="card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ pedido.endereco?.split(',')[0] || 'Endereço não informado' }}</span>
          </div>

          <!-- Botão de ação com verificação -->
          <div class="card-action">
            <div v-if="pedido.proposta_enviada" class="proposta-enviada-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>
                Proposta enviada em {{ pedido.proposta_data ? formatarData(pedido.proposta_data) : 'data desconhecida' }}
              </span>
            </div>

            <button
              v-else
              class="proposta-btn-modern"
              @click.stop="abrirModalPropostaComVerificacao(pedido)"
            >
              <span>Fazer Proposta</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MODAL DE PROPOSTA ===== -->
    <div class="modal-overlay" v-if="pedidosStore.modalProposta.visivel" @click="fecharModalProposta">
      <div class="modal-content-modern" @click.stop>
        <div class="modal-header-modern">
          <div class="modal-avatar" :style="getAvatarStyle(pedidosStore.modalProposta.pedido?.cliente?.nome)">
            {{ getInitials(pedidosStore.modalProposta.pedido?.cliente?.nome || 'Cliente') }}
          </div>
          <div>
            <h3>Enviar Proposta</h3>
            <p>Para: {{ pedidosStore.modalProposta.pedido?.cliente?.nome || 'Cliente' }}</p>
          </div>
          <button class="modal-close" @click="fecharModalProposta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body-modern">
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Categoria</span>
              <span class="info-value">{{ pedidosStore.modalProposta.pedido?.categoria?.nome }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Descrição</span>
              <span class="info-value">{{ pedidosStore.modalProposta.pedido?.descricao || 'Sem descrição' }}</span>
            </div>
          </div>

          <div class="input-group-modern">
            <label class="input-label-modern">Valor da proposta (MZN)</label>
            <div class="valor-input-modern">
              <span class="prefix">MZN</span>
              <input type="number" v-model.number="pedidosStore.novaProposta.valor" placeholder="0" />
            </div>
          </div>

          <div class="input-group-modern">
            <label class="input-label-modern">Mensagem (opcional)</label>
            <textarea v-model="pedidosStore.novaProposta.mensagem" rows="3" placeholder="Descreva como pode ajudar..."></textarea>
          </div>
        </div>

        <div class="modal-footer-modern">
          <button class="cancel-btn" @click="fecharModalProposta">Cancelar</button>
          <button class="send-btn" @click="enviarProposta" :disabled="pedidosStore.isSending">
            <div v-if="pedidosStore.isSending" class="spinner-small"></div>
            <span v-else>Enviar Proposta</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import {
  usePrestadorPedidosDisponiveisStore,
  type PedidoDisponivelData
} from 'src/stores/prestador/prestador-pedidos-disponiveis-store';
import { usePrestadorPerfilStore } from 'src/stores/prestador/prestador-perfil-store';

defineOptions({ name: 'PedidosDisponiveisPage' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Stores
const pedidosStore = usePrestadorPedidosDisponiveisStore();
const perfilStore = usePrestadorPerfilStore();

const carregamentoInicial = ref(true);

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
  return nome.split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase();
};

// Dados do store
const filtros = computed(() => pedidosStore.filtros);
const raioOptions = computed(() => pedidosStore.raioOptions);
const ordenacaoOptions = computed(() => pedidosStore.ordenacaoOptions);

// Categorias do perfil
const categoriasOptions = computed(() => {
  const minhasCats = perfilStore.minhasCategorias;
  return minhasCats.map((cat) => ({
    label: cat.nome,
    value: cat.id,
    icon: cat.icone || 'category',
    color: cat.cor || '#5B4BF5',
  }));
});

const formatarData = (data: string | undefined): string => {
  if (!data) return 'data desconhecida';
  try {
    const date = new Date(data);
    const hoje = new Date();
    const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return `Hoje, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  } catch {
    return data;
  }
};

// ===================== AÇÕES DO STORE =====================

const recarregarDados = async (): Promise<void> => {
  await pedidosStore.recarregarDados();
  $q.notify({ type: 'positive', message: 'Pedidos atualizados!', position: 'top', timeout: 1500 });
};

const aplicarFiltros = (): void => {
  void pedidosStore.aplicarFiltros();
};

const limparFiltros = (): void => {
  pedidosStore.limparFiltros();
  void pedidosStore.fetchPedidosDisponiveis();
};

const atualizarFiltroCategoria = (categoriaId: number | null): void => {
  pedidosStore.atualizarFiltro('categoriaId', categoriaId);
  aplicarFiltros();
};

const atualizarFiltroRaio = (raio: number): void => {
  pedidosStore.atualizarFiltro('raio', raio);
  aplicarFiltros();
};

const atualizarFiltroOrdenacao = (ordenacao: string): void => {
  pedidosStore.atualizarFiltro('ordenacao', ordenacao);
  aplicarFiltros();
};

// Abrir modal com verificação
const abrirModalPropostaComVerificacao = async (pedido: PedidoDisponivelData): Promise<void> => {
  const success = await pedidosStore.abrirModalProposta(pedido);

  if (!success) {
    $q.notify({
      type: 'warning',
      message: pedidosStore.error || 'Você já enviou uma proposta para este pedido',
      position: 'top',
      timeout: 3000
    });
  }
};

const fecharModalProposta = (): void => {
  pedidosStore.fecharModalProposta();
};

const enviarProposta = async (): Promise<void> => {
  if (!pedidosStore.novaProposta.valor || pedidosStore.novaProposta.valor <= 0) {
    $q.notify({ type: 'warning', message: 'Informe um valor válido', position: 'top' });
    return;
  }

  try {
    const success = await pedidosStore.enviarPropostaModal();
    if (success) {
      $q.notify({ type: 'positive', message: 'Proposta enviada com sucesso!', position: 'top' });
      fecharModalProposta();
    } else {
      $q.notify({ type: 'negative', message: pedidosStore.error || 'Erro ao enviar proposta', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao enviar proposta', position: 'top' });
  }
};

// ===================== CARREGAMENTO INICIAL =====================

const carregarDadosIniciais = async (): Promise<void> => {
  carregamentoInicial.value = true;
  try {
    await Promise.all([
      pedidosStore.carregarTodosDados(),
      perfilStore.fetchMinhasCategorias()
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados', position: 'top' });
  } finally {
    setTimeout(() => { carregamentoInicial.value = false; }, 500);
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    $q.notify({ type: 'warning', message: 'Por favor, faça login para continuar', position: 'top' });
    await router.push('/auth/login');
    return;
  }

  if (!authStore.isPrestador) {
    $q.notify({ type: 'warning', message: 'Apenas prestadores podem aceder a esta página', position: 'top' });
    await router.push('/mobile/prestador/dashboard');
    return;
  }

  void carregarDadosIniciais();
});
</script>

<style scoped lang="scss">
// ===================== VARIÁVEIS =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #1A1A2E;
$gray: #6B7280;
$gray-light: #F9FAFB;
$border: #E5E7EB;
$white: #FFFFFF;
$bg: #F3F4F6;
$radius: 20px;
$radius-sm: 14px;
$radius-xs: 10px;

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pedidos-disponiveis-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 40px;
}

// ===================== HEADER =====================
.modern-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: $white;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-btn {
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

  .header-center {
    text-align: center;

    h1 {
      font-size: 1.2rem;
      font-weight: 700;
      color: $dark;
      margin: 0;
    }

    p {
      font-size: 0.7rem;
      color: $gray;
      margin: 2px 0 0;
    }
  }
}

// ===================== SKELETON =====================
.skeleton-container {
  .skeleton-header-spacer { height: 70px; }
  .skeleton-filters-bar { height: 50px; background: $white; margin: 12px 16px; border-radius: 30px; }
  .skeleton-cards { padding: 0 16px; }

  .skeleton-card-modern {
    background: $white;
    border-radius: $radius;
    padding: 20px;
    margin-bottom: 16px;
    display: flex;
    gap: 16px;

    .skeleton-avatar-large {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: $gray-light;
    }

    .skeleton-content { flex: 1; }
    .skeleton-line {
      height: 14px;
      background: $gray-light;
      border-radius: 7px;
      margin: 8px 0;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: shimmer 1.5s infinite;
      }
    }
  }
}

.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

// ===================== FILTROS =====================
.filters-bar {
  padding: 12px 16px;
  background: $white;
  border-bottom: 1px solid $border;

  .filter-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: $gray-light;
    border: 1px solid $border;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
    color: $gray;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $accent-light;
      border-color: $accent;
      color: $accent;
    }

    &.active {
      background: $accent;
      border-color: $accent;
      color: $white;
    }
  }
}

// ===================== CONTROLES =====================
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  background: $white;
  border-bottom: 1px solid $border;

  .control-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: $gray;

    svg { flex-shrink: 0; }
  }

  .raio-selector, .ordenacao-selector {
    display: flex;
    gap: 4px;

    span {
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.7rem;
      font-weight: 500;

      &:hover { background: $accent-light; color: $accent; }
      &.active { background: $accent; color: $white; }
    }
  }
}

// ===================== STATS CHIP =====================
.stats-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 16px;
  padding: 8px 16px;
  background: $white;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 500;
  color: $accent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

// ===================== EMPTY STATE =====================
.empty-state-modern {
  text-align: center;
  padding: 60px 24px;

  .empty-icon {
    margin-bottom: 24px;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.85rem;
    color: $gray;
    margin-bottom: 24px;
  }

  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: $accent-light;
    border: none;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
    color: $accent;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $accent;
      color: $white;
    }
  }
}

// ===================== PEDIDOS GRID =====================
.pedidos-grid {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pedido-card-modern {
  background: $white;
  border-radius: $radius;
  padding: 20px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid $border;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .distance-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: $accent-light;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    color: $accent;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;

    .cliente-avatar-large {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 700;
      color: $white;
    }

    .card-header-info {
      flex: 1;

      .cliente-nome {
        font-weight: 700;
        font-size: 1rem;
        color: $dark;
        margin-bottom: 2px;
      }

      .pedido-data {
        font-size: 0.7rem;
        color: $gray;
      }
    }

    .categoria-tag {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 500;
    }
  }

  .card-description {
    p {
      font-size: 0.85rem;
      color: $gray;
      line-height: 1.5;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-location {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;

    svg { color: $gray; flex-shrink: 0; }
    span { font-size: 0.75rem; color: $gray; }
  }

  .card-action {
    .proposta-btn-modern {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: $accent;
      border: none;
      border-radius: $radius-xs;
      font-size: 0.85rem;
      font-weight: 600;
      color: $white;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: lighten($accent, 6%);
        gap: 12px;
      }
    }
  }
}

// ===================== BADGE PROPOSTA ENVIADA =====================
.proposta-enviada-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: $radius-xs;
  font-size: 0.8rem;
  font-weight: 500;
  color: $success;

  svg {
    flex-shrink: 0;
  }
}

// ===================== MODAL =====================
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content-modern {
  background: $white;
  border-radius: $radius;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header-modern {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, $accent, darken($accent, 10%));
  position: relative;

  .modal-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: $white;
    background: rgba(255, 255, 255, 0.2);
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $white;
    margin: 0;
  }

  p {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 2px 0 0;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    color: $white;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.modal-body-modern {
  padding: 20px;

  .info-card {
    background: $gray-light;
    border-radius: $radius-xs;
    padding: 14px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;

      &:last-child { margin-bottom: 0; }

      .info-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: $gray;
        min-width: 70px;
      }

      .info-value {
        font-size: 0.8rem;
        color: $dark;
        flex: 1;
      }
    }
  }
}

.input-group-modern {
  margin-bottom: 16px;

  .input-label-modern {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }

  .valor-input-modern {
    display: flex;
    align-items: center;
    border: 1px solid $border;
    border-radius: $radius-xs;
    overflow: hidden;

    .prefix {
      padding: 12px 14px;
      background: $gray-light;
      color: $gray;
      border-right: 1px solid $border;
      font-size: 0.85rem;
      font-weight: 500;
    }

    input {
      flex: 1;
      padding: 12px;
      border: none;
      outline: none;
      font-size: 0.9rem;

      &:focus { background: $accent-light; }
    }
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-family: inherit;
    resize: vertical;
    outline: none;

    &:focus { border-color: $accent; }
  }
}

.modal-footer-modern {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid $border;

  .cancel-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $gray-light;
    }
  }

  .send-btn {
    flex: 1;
    padding: 10px;
    background: $accent;
    border: none;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-weight: 600;
    color: $white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.6s linear infinite;
}
</style>
