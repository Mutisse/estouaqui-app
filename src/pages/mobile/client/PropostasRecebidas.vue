<template>
  <div class="propostas-page">
    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <h1 class="page-title">
        <q-icon name="request_quote" size="24px" class="q-mr-sm" />
        Propostas Recebidas
      </h1>
      <q-badge v-if="store.totalPropostas > 0" color="primary" class="count-badge">
        {{ store.totalPropostas }}
      </q-badge>
    </div>

    <!-- ===== ESTATÍSTICAS RÁPIDAS ===== -->
    <div class="stats-mini" v-if="store.dadosCarregados">
      <div class="stat-mini-item" @click="filtrarPorStatus(null)">
        <span class="stat-mini-value">{{ store.estatisticas.total }}</span>
        <span class="stat-mini-label">Total</span>
      </div>
      <div class="stat-mini-divider"></div>
      <div class="stat-mini-item" @click="filtrarPorStatus('pendente')">
        <span class="stat-mini-value" style="color: #F59E0B;">{{ store.estatisticas.pendentes + store.estatisticas.enviadas }}</span>
        <span class="stat-mini-label">Pendentes</span>
      </div>
      <div class="stat-mini-divider"></div>
      <div class="stat-mini-item" @click="filtrarPorStatus('aceita')">
        <span class="stat-mini-value" style="color: #10B981;">{{ store.estatisticas.aceitas }}</span>
        <span class="stat-mini-label">Aceitas</span>
      </div>
      <div class="stat-mini-divider"></div>
      <div class="stat-mini-item" @click="filtrarPorStatus('recusada')">
        <span class="stat-mini-value" style="color: #EF4444;">{{ store.estatisticas.recusadas }}</span>
        <span class="stat-mini-label">Recusadas</span>
      </div>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="store.isLoading" class="skeleton-loading">
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
          :class="{ active: filtroStatus === null }"
          @click="filtroStatus = null"
        >
          Todas
          <span v-if="store.totalPropostas > 0" class="tab-badge">{{ store.totalPropostas }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: filtroStatus === 'pendente' || filtroStatus === 'enviada' }"
          @click="filtroStatus = 'pendente'"
        >
          Pendentes
          <span v-if="store.estatisticas.pendentes + store.estatisticas.enviadas > 0" class="tab-badge">{{
            store.estatisticas.pendentes + store.estatisticas.enviadas
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: filtroStatus === 'aceita' }"
          @click="filtroStatus = 'aceita'"
        >
          Aceitas
          <span v-if="store.estatisticas.aceitas > 0" class="tab-badge">{{
            store.estatisticas.aceitas
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: filtroStatus === 'recusada' }"
          @click="filtroStatus = 'recusada'"
        >
          Recusadas
          <span v-if="store.estatisticas.recusadas > 0" class="tab-badge">{{
            store.estatisticas.recusadas
          }}</span>
        </button>
      </div>

      <!-- Barra de busca -->
      <div class="search-bar">
        <q-input
          v-model="filtroBusca"
          placeholder="Buscar proposta..."
          dense
          outlined
          clearable
          class="search-input"
          @update:model-value="onFiltroChange"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Lista de Propostas -->
      <div v-if="propostasFiltradas.length > 0" class="propostas-list">
        <div
          v-for="proposta in propostasFiltradas"
          :key="proposta.id"
          class="proposta-card"
          @click="() => void verDetalhes(proposta)"
        >
          <div class="proposta-card__header">
            <div class="proposta-avatar">
              <div
                class="avatar-placeholder"
                :style="getAvatarStyle(proposta.prestador?.nome || 'P')"
              >
                {{ getInitials(proposta.prestador?.nome || 'Prestador') }}
              </div>
            </div>
            <div class="proposta-info">
              <div class="proposta-servico">{{ proposta.servico?.nome || 'Serviço' }}</div>
              <div class="proposta-prestador">{{ proposta.prestador?.nome || 'Prestador' }}</div>
              <div class="proposta-data">
                <q-icon name="schedule" size="12px" />
                {{ formatarData(proposta.created_at) }}
              </div>
            </div>
            <div class="proposta-status" :class="getStatusClass(proposta.status)">
              {{ store.getStatusLabel(proposta.status) }}
            </div>
          </div>

          <div class="proposta-card__body">
            <div class="proposta-detalhes">
              <div class="detalhe-item">
                <q-icon name="payments" size="16px" color="grey-6" />
                <span class="detalhe-valor">{{ formatarPreco(proposta.valor) }}</span>
              </div>
              <div class="detalhe-item">
                <q-icon name="schedule" size="16px" color="grey-6" />
                <span>{{ proposta.duracao ? proposta.duracao + ' min' : 'A definir' }}</span>
              </div>
              <div class="detalhe-item">
                <q-icon name="location_on" size="16px" color="grey-6" />
                <span>{{ proposta.endereco || 'Endereço a definir' }}</span>
              </div>
            </div>
            <div v-if="proposta.mensagem" class="proposta-mensagem">
              <q-icon name="chat" size="16px" color="grey-6" />
              <span>{{ truncarTexto(proposta.mensagem, 60) }}</span>
            </div>
          </div>

          <div class="proposta-card__footer">
            <div class="proposta-avaliacao">
              <q-icon name="star" size="14px" color="amber" />
              <span>{{ Number(proposta.prestador?.media_avaliacao || 0).toFixed(1) }}</span>
              <span class="avaliacao-count">({{ proposta.prestador?.total_avaliacoes || 0 }})</span>
            </div>
            <div class="proposta-actions">
              <q-btn
                v-if="proposta.status === 'pendente' || proposta.status === 'enviada'"
                flat
                dense
                label="Aceitar"
                color="positive"
                size="sm"
                :loading="store.isSending"
                @click.stop="() => void aceitarProposta(proposta)"
              />
              <q-btn
                v-if="proposta.status === 'pendente' || proposta.status === 'enviada'"
                flat
                dense
                label="Recusar"
                color="negative"
                size="sm"
                :loading="store.isSending"
                @click.stop="() => void recusarProposta(proposta)"
              />
              <q-btn
                flat
                dense
                round
                icon="chat"
                color="primary"
                size="sm"
                @click.stop="() => void abrirChat(proposta)"
                title="Conversar com prestador"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Nenhuma proposta encontrada</h3>
        <p v-if="filtroBusca || filtroStatus">
          Nenhuma proposta encontrada com os filtros atuais.
        </p>
        <p v-else>Quando um prestador enviar uma proposta, ela aparecerá aqui.</p>
        <q-btn
          v-if="filtroBusca || filtroStatus"
          flat
          label="Limpar filtros"
          color="primary"
          @click="limparFiltros"
        />
      </div>
    </template>

    <!-- ===== MODAL DE DETALHES ===== -->
    <q-dialog v-model="modalDetalhes" maximized>
      <q-card class="detalhes-modal">
        <q-card-section class="modal-header">
          <div class="modal-header-content">
            <q-btn flat round icon="arrow_back" @click="modalDetalhes = false" />
            <div>
              <div class="modal-title">Proposta #{{ store.propostaSelecionada?.numero || store.propostaSelecionada?.id }}</div>
              <div class="modal-subtitle">{{ store.propostaSelecionada?.servico?.nome || 'Serviço' }}</div>
            </div>
          </div>
          <q-btn flat round icon="close" @click="modalDetalhes = false" />
        </q-card-section>

        <q-card-section v-if="store.propostaSelecionada" class="modal-body">
          <!-- Status -->
          <div class="info-row">
            <span class="info-label">Status</span>
            <q-badge :color="store.getStatusColor(store.propostaSelecionada.status)">
              {{ store.getStatusLabel(store.propostaSelecionada.status) }}
            </q-badge>
          </div>

          <!-- Prestador -->
          <div class="info-row">
            <span class="info-label">Prestador</span>
            <div class="prestador-detalhe">
              <q-avatar size="40px">
                <img :src="getAvatarUrl(store.propostaSelecionada.prestador?.nome || 'P')" />
              </q-avatar>
              <div>
                <div class="prestador-nome-detalhe">{{ store.propostaSelecionada.prestador?.nome || 'Prestador' }}</div>
                <div class="prestador-email">{{ store.propostaSelecionada.prestador?.email || '' }}</div>
                <div class="prestador-avaliacao-detalhe">
                  <q-icon name="star" size="14px" color="amber" />
                  <span>{{ Number(store.propostaSelecionada.prestador?.media_avaliacao || 0).toFixed(1) }}</span>
                  <span class="avaliacao-count">({{ store.propostaSelecionada.prestador?.total_avaliacoes || 0 }} avaliações)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Valor -->
          <div class="info-row">
            <span class="info-label">Valor</span>
            <span class="info-value valor-destaque">{{ formatarPreco(store.propostaSelecionada.valor) }}</span>
          </div>

          <!-- Duração -->
          <div class="info-row">
            <span class="info-label">Duração</span>
            <span class="info-value">{{ store.propostaSelecionada.duracao ? store.propostaSelecionada.duracao + ' min' : 'A definir' }}</span>
          </div>

          <!-- Endereço -->
          <div class="info-row">
            <span class="info-label">Endereço</span>
            <span class="info-value">{{ store.propostaSelecionada.endereco || 'Não informado' }}</span>
          </div>

          <!-- Mensagem -->
          <div v-if="store.propostaSelecionada.mensagem" class="info-row mensagem-row">
            <span class="info-label">Mensagem</span>
            <div class="mensagem-box">{{ store.propostaSelecionada.mensagem }}</div>
          </div>

          <!-- Data -->
          <div class="info-row">
            <span class="info-label">Enviado em</span>
            <span class="info-value">{{ formatarDataCompleta(store.propostaSelecionada.created_at) }}</span>
          </div>

          <!-- Expira em -->
          <div v-if="store.propostaSelecionada.expira_em" class="info-row">
            <span class="info-label">Expira em</span>
            <span class="info-value">{{ formatarDataCompleta(store.propostaSelecionada.expira_em) }}</span>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions" align="center">
          <q-btn
            v-if="store.propostaSelecionada?.status === 'pendente' || store.propostaSelecionada?.status === 'enviada'"
            unelevated
            label="Aceitar Proposta"
            color="positive"
            class="action-btn-lg"
            :loading="store.isSending"
            @click="() => void aceitarProposta(store.propostaSelecionada!)"
          />
          <q-btn
            v-if="store.propostaSelecionada?.status === 'pendente' || store.propostaSelecionada?.status === 'enviada'"
            flat
            label="Recusar"
            color="negative"
            class="action-btn-lg"
            :loading="store.isSending"
            @click="() => void recusarProposta(store.propostaSelecionada!)"
          />
          <q-btn
            flat
            label="Conversar com prestador"
            color="primary"
            @click="() => void abrirChat(store.propostaSelecionada!)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClientePropostasStore, type PropostaData } from 'src/stores/client/cliente-propostas-store';

defineOptions({ name: 'PropostasRecebidas' });

const router = useRouter();
const $q = useQuasar();
const store = useClientePropostasStore();

// ===================== ESTADOS LOCAIS =====================
const modalDetalhes = ref(false);
const filtroStatus = ref<string | null>(null);
const filtroBusca = ref('');

// ===================== COMPUTEDS =====================

const propostasFiltradas = computed(() => {
  let lista = store.propostas;

  if (filtroStatus.value) {
    if (filtroStatus.value === 'pendente') {
      lista = lista.filter(p => p.status === 'pendente' || p.status === 'enviada');
    } else {
      lista = lista.filter(p => p.status === filtroStatus.value);
    }
  }

  if (filtroBusca.value.trim()) {
    const termo = filtroBusca.value.toLowerCase().trim();
    lista = lista.filter(p =>
      p.servico?.nome?.toLowerCase().includes(termo) ||
      p.prestador?.nome?.toLowerCase().includes(termo) ||
      p.numero?.toLowerCase().includes(termo) ||
      String(p.id).includes(termo)
    );
  }

  return lista;
});

// ===================== FUNÇÕES =====================

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

const getAvatarUrl = (nome: string): string => {
  return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=60&name=${encodeURIComponent(nome)}`;
};

const formatarPreco = (valor?: number): string => {
  if (!valor && valor !== 0) return 'A definir';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 }).format(valor);
};

const formatarData = (data: string): string => {
  if (!data) return '';
  const date = new Date(data);
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return date.toLocaleDateString('pt-PT');
};

const formatarDataCompleta = (data: string): string => {
  if (!data) return '';
  const date = new Date(data);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  if (texto.length <= max) return texto;
  return texto.substring(0, max) + '...';
};

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    pendente: 'pendente',
    enviada: 'enviada',
    aceita: 'aceita',
    recusada: 'recusada',
    expirada: 'expirada',
  };
  return classes[status] || '';
};

const filtrarPorStatus = (status: string | null) => {
  filtroStatus.value = status;
};

// ===================== AÇÕES =====================

const onFiltroChange = (): void => {
  store.setFiltro('status', filtroStatus.value);
  store.setFiltro('busca', filtroBusca.value);
};

const limparFiltros = (): void => {
  filtroStatus.value = null;
  filtroBusca.value = '';
  store.limparFiltros();
};

const aceitarProposta = (proposta: PropostaData): void => {
  $q.dialog({
    title: 'Aceitar proposta',
    message: `Deseja aceitar a proposta #${proposta.numero || proposta.id} de ${proposta.prestador?.nome}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Aceitar', color: 'positive' },
  }).onOk(() => {
    void (async () => {
      const success = await store.aceitarProposta(proposta.id);
      if (success) {
        modalDetalhes.value = false;
        $q.notify({
          type: 'positive',
          message: 'Proposta aceita com sucesso!',
          position: 'top',
          timeout: 3000,
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Erro ao aceitar proposta. Tente novamente.',
          position: 'top',
        });
      }
    })();
  });
};

const recusarProposta = (proposta: PropostaData): void => {
  $q.dialog({
    title: 'Recusar proposta',
    message: `Deseja recusar a proposta #${proposta.numero || proposta.id}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Recusar', color: 'negative' },
  }).onOk(() => {
    void (async () => {
      const success = await store.recusarProposta(proposta.id);
      if (success) {
        modalDetalhes.value = false;
        $q.notify({
          type: 'info',
          message: 'Proposta recusada.',
          position: 'top',
          timeout: 2000,
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Erro ao recusar proposta. Tente novamente.',
          position: 'top',
        });
      }
    })();
  });
};

const verDetalhes = async (proposta: PropostaData): Promise<void> => {
  const dados = await store.buscarProposta(proposta.id);
  if (dados) {
    modalDetalhes.value = true;
  }
};

const abrirChat = (proposta: PropostaData): void => {
  if (proposta.prestador_id) {
    void router.push(`/mobile/chat/${proposta.prestador_id}`);
  }
};

// ===================== CARREGAR DADOS =====================

const carregarDados = async (): Promise<void> => {
  await store.carregarPropostas(true);
  await store.carregarEstatisticas();
};

// ===================== WATCHERS =====================

watch(() => store.propostaSelecionada, (nova) => {
  if (!nova) {
    modalDetalhes.value = false;
  }
});

watch(filtroStatus, () => {
  onFiltroChange();
});

// ===================== CICLO DE VIDA =====================

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$info: #3B82F6;
$dark: #0A0A0F;
$ink: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$bg: #F4F4F8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: $bg;
  min-height: 100vh;
  padding: 16px;
}

.skeleton-cards {
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
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-badge {
  width: 70px;
  height: 28px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }

// =====================
// LAYOUT PRINCIPAL
// =====================
.propostas-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  background: $white;
  padding: 16px;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $dark;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .count-badge {
    font-size: 0.8rem;
    padding: 4px 12px;
  }
}

// =====================
// STATS MINI
// =====================
.stats-mini {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: $white;
  border-radius: $radius-sm;
  padding: 12px 16px;
  margin: 12px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  cursor: pointer;

  .stat-mini-item {
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 8px;
    border-radius: $radius-xs;

    &:hover {
      background: $accent-light;
    }

    .stat-mini-value {
      display: block;
      font-size: 1.1rem;
      font-weight: 700;
      color: $dark;
    }

    .stat-mini-label {
      font-size: 0.65rem;
      color: $gray;
      text-transform: uppercase;
    }
  }

  .stat-mini-divider {
    width: 1px;
    height: 30px;
    background: $border;
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
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 0;
  }
}

.tab-btn {
  flex: 1;
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: $radius-sm;
  font-size: 0.8rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;

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
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 20px;
}

// =====================
// SEARCH BAR
// =====================
.search-bar {
  padding: 12px 16px;
  background: $white;
  border-bottom: 1px solid $border;

  .search-input {
    :deep(.q-field__control) {
      border-radius: 30px;
      background: $gray-light;
    }
  }
}

// =====================
// PROPOSTAS LIST
// =====================
.propostas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

// =====================
// PROPOSTA CARD
// =====================
.proposta-card {
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
    padding: 14px 16px;
    border-bottom: 1px solid $border;
  }

  &__body {
    padding: 12px 16px;
    border-bottom: 1px solid $border;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
  }
}

.proposta-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: $white;
  text-transform: uppercase;
}

.proposta-info {
  flex: 1;
  min-width: 0;
}

.proposta-servico {
  font-size: 0.9rem;
  font-weight: 600;
  color: $dark;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.proposta-prestador {
  font-size: 0.75rem;
  color: $gray;
  margin-bottom: 2px;
}

.proposta-data {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: $gray;
}

.proposta-status {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;

  &.pendente {
    background: rgba($warning, 0.15);
    color: darken($warning, 15%);
  }
  &.enviada {
    background: rgba($accent, 0.15);
    color: $accent;
  }
  &.aceita {
    background: rgba($success, 0.15);
    color: darken($success, 15%);
  }
  &.recusada {
    background: rgba($danger, 0.15);
    color: $danger;
  }
  &.expirada {
    background: rgba($gray, 0.15);
    color: $gray;
  }
}

.proposta-detalhes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .detalhe-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: $gray;

    .detalhe-valor {
      font-weight: 600;
      color: $accent;
    }
  }
}

.proposta-mensagem {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  background: $gray-light;
  padding: 6px 10px;
  border-radius: $radius-xs;
  font-size: 0.75rem;
  color: $gray;

  span {
    flex: 1;
    word-break: break-word;
  }
}

.proposta-avaliacao {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: $dark;

  .avaliacao-count {
    color: $gray;
    font-size: 0.65rem;
  }
}

.proposta-actions {
  display: flex;
  gap: 4px;
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $white;
  margin: 16px;
  border-radius: $radius;
  border: 1px solid $border;

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
    max-width: 300px;
    margin: 0 auto 12px;
  }
}

// =====================
// MODAL
// =====================
.detalhes-modal {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: $accent;
  color: white;
  padding: 16px 20px;

  .modal-header-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .modal-title {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .modal-subtitle {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .info-row {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 0.95rem;
      color: $dark;

      &.valor-destaque {
        font-size: 1.2rem;
        font-weight: 700;
        color: $accent;
      }
    }

    .prestador-detalhe {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;

      .prestador-nome-detalhe {
        font-weight: 500;
        color: $dark;
      }

      .prestador-email {
        font-size: 0.8rem;
        color: $gray;
      }

      .prestador-avaliacao-detalhe {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        color: $dark;

        .avaliacao-count {
          color: $gray;
          font-size: 0.7rem;
        }
      }
    }

    .mensagem-box {
      background: $gray-light;
      padding: 12px 16px;
      border-radius: $radius-xs;
      font-size: 0.9rem;
      color: $dark;
      line-height: 1.5;
      word-break: break-word;
    }
  }
}

.modal-actions {
  padding: 16px 20px;
  gap: 12px;
  border-top: 1px solid $border;
  flex-wrap: wrap;
  justify-content: center;

  .action-btn-lg {
    min-width: 200px;
    padding: 12px 24px;
  }
}

// =====================
// RESPONSIVIDADE
// =====================
@media (max-width: 480px) {
  .filter-tabs {
    flex-wrap: wrap;
    gap: 4px;
  }

  .tab-btn {
    flex: 1;
    min-width: 60px;
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  .stats-mini {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;

    .stat-mini-item {
      flex: 1;
      min-width: 40px;
    }
  }

  .proposta-card {
    &__header {
      flex-wrap: wrap;
    }

    &__footer {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
    }
  }

  .proposta-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .modal-actions {
    flex-direction: column;

    .action-btn-lg {
      min-width: 0;
      width: 100%;
    }
  }

  .proposta-detalhes {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .proposta-card {
    &__footer {
      flex-wrap: wrap;
    }
  }

  .modal-header {
    .modal-header-content {
      .modal-title {
        font-size: 0.95rem;
      }
    }
  }
}
</style>
