<template>
  <q-page class="prestador-dashboard bg-grey-1">
    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar dashboard...</p>
    </div>

    <template v-else>
      <!-- Cabeçalho com saudação -->
      <div class="header-greeting q-pa-md">
        <div>
          <div class="greeting-small">Bem-vindo de volta,</div>
          <div class="greeting-name">{{ prestadorNome }}</div>
        </div>
        <q-btn
          flat
          round
          icon="refresh"
          @click="recarregarDados"
          :loading="recarregando"
        />
      </div>

      <!-- Cards de resumo com dados do store -->
      <div class="summary-cards q-px-md q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-card class="summary-card" flat bordered>
              <q-card-section class="text-center">
                <q-icon name="pending_actions" size="32px" color="primary" />
                <div class="summary-value">{{ stats.pedidos_pendentes || 0 }}</div>
                <div class="summary-label">Pedidos pendentes</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="summary-card" flat bordered>
              <q-card-section class="text-center">
                <q-icon name="check_circle" size="32px" color="positive" />
                <div class="summary-value">{{ stats.servicos_hoje || 0 }}</div>
                <div class="summary-label">Serviços hoje</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="summary-card" flat bordered>
              <q-card-section class="text-center">
                <q-icon name="star" size="32px" color="yellow" />
                <div class="summary-value">{{ stats.avaliacao_media?.toFixed(1) || 0 }}</div>
                <div class="summary-label">Avaliação média</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="summary-card" flat bordered>
              <q-card-section class="text-center">
                <q-icon name="payments" size="32px" color="secondary" />
                <div class="summary-value">{{ formatMoney(ganhos.mes || 0) }}</div>
                <div class="summary-label">Ganhos do mês</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Próximos serviços -->
      <div class="section q-px-md q-mb-md" v-if="proximosServicosList.length > 0">
        <div class="section-header">
          <div class="section-title">Próximos serviços</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/prestador/agenda"
            no-caps
          />
        </div>

        <q-list bordered separator>
          <q-item
            v-for="servico in proximosServicosList"
            :key="servico.id"
            clickable
            v-ripple
            @click="verPedido(servico.id)"
          >
            <q-item-section avatar>
              <q-avatar>
                <img :src="servico.cliente?.foto || getAvatarUrl(servico.cliente?.nome || 'Cliente')" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ servico.cliente?.nome || 'Cliente' }}</q-item-label>
              <q-item-label caption>
                <q-icon name="schedule" size="14px" /> {{ formatarData(servico.data) }}
              </q-item-label>
              <q-item-label caption class="text-primary">
                {{ servico.servico?.nome || 'Serviço' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge :color="getStatusCor(servico.status)">
                {{ getStatusTexto(servico.status) }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Ações rápidas -->
      <div class="quick-actions q-px-md q-mb-md">
        <div class="section-header">
          <div class="section-title">Ações rápidas</div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-card class="action-card" flat bordered @click="irPara('agenda')">
              <q-card-section class="text-center">
                <q-icon name="schedule" size="32px" color="primary" />
                <div class="action-label">Definir disponibilidade</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="action-card" flat bordered @click="irPara('servicos')">
              <q-card-section class="text-center">
                <q-icon name="construction" size="32px" color="secondary" />
                <div class="action-label">Gerir serviços</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="action-card" flat bordered @click="irPara('portfolio')">
              <q-card-section class="text-center">
                <q-icon name="photo_library" size="32px" color="positive" />
                <div class="action-label">Portfólio</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="action-card" flat bordered @click="irPara('precos')">
              <q-card-section class="text-center">
                <q-icon name="attach_money" size="32px" color="warning" />
                <div class="action-label">Definir preços</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Avaliações recentes -->
      <div class="section q-px-md q-mb-md" v-if="avaliacoesRecentesList.length > 0">
        <div class="section-header">
          <div class="section-title">Avaliações recentes</div>
          <q-btn
            flat
            dense
            label="Ver todas"
            class="section-link"
            to="/mobile/prestador/avaliacoes"
            no-caps
          />
        </div>

        <q-list bordered separator>
          <q-item v-for="avaliacao in avaliacoesRecentesList" :key="avaliacao.id">
            <q-item-section avatar>
              <q-avatar>
                <img :src="avaliacao.cliente?.foto || getAvatarUrl(avaliacao.cliente?.nome || 'Cliente')" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ avaliacao.cliente?.nome || 'Cliente' }}</q-item-label>
              <q-item-label caption>
                <q-rating v-model="avaliacao.nota" size="14px" :max="5" color="yellow" readonly />
                <span class="q-ml-xs">{{ formatarDataAvaliacao(avaliacao.created_at) }}</span>
              </q-item-label>
              <q-item-label caption lines="2"> "{{ avaliacao.comentario }}" </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Mensagem quando não há dados -->
      <div v-if="!proximosServicosList.length && !avaliacoesRecentesList.length" class="empty-state q-pa-xl text-center">
        <q-icon name="dashboard" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Bem-vindo ao seu dashboard!</div>
        <div class="text-grey-6">Você ainda não tem serviços agendados.</div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorStore } from 'src/stores/prestador-store';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'PrestadorDashboard',
});

const router = useRouter();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();
const $q = useQuasar();

const recarregando = ref(false);
const loading = ref(true);

// Computed com dados do store
const prestadorNome = computed(() => authStore.user?.nome || 'Prestador');
const stats = computed(() => prestadorStore.stats);
const ganhos = computed(() => prestadorStore.ganhos);
const proximosServicosList = computed(() => prestadorStore.proximosServicos || []);
const avaliacoesRecentesList = computed(() => prestadorStore.avaliacoesRecentes || []);

// Funções auxiliares
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatarData = (data: string) => {
  if (!data) return 'Data não informada';
  const date = new Date(data);
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  if (date.toDateString() === hoje.toDateString()) {
    return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === amanha.toDateString()) {
    return `Amanhã, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatarDataAvaliacao = (data: string) => {
  if (!data) return '';
  const date = new Date(data);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
};

const getStatusTexto = (status: string) => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    confirmado: 'Confirmado',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return statusMap[status] || status;
};

const getStatusCor = (status: string) => {
  const corMap: Record<string, string> = {
    pendente: 'warning',
    aceito: 'info',
    confirmado: 'positive',
    em_andamento: 'primary',
    concluido: 'grey',
    cancelado: 'negative',
  };
  return corMap[status] || 'grey';
};

const getAvatarUrl = (nome: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff`;
};

// Navegação
const irPara = (rota: string) => {
  void router.push(`/mobile/prestador/${rota}`);
};

const verPedido = (id: number) => {
  void router.push(`/mobile/prestador/pedidos/${id}`);
};

// Recarregar dados
const recarregarDados = async () => {
  recarregando.value = true;
  await carregarDados();
  recarregando.value = false;
};

// Carregar dados
const carregarDados = async () => {
  loading.value = true;
  try {
    await Promise.all([
      prestadorStore.fetchStats(),
      prestadorStore.fetchGanhos(),
      prestadorStore.fetchProximosServicos(5),
      prestadorStore.fetchAvaliacoesRecentes(5),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dashboard',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.prestador-dashboard {
  min-height: 100vh;
  padding-bottom: 70px;
}

.header-greeting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;

  .greeting-small {
    font-size: 0.9rem;
    color: $gray-600;
  }

  .greeting-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: $gray-900;
  }
}

.summary-card {
  border-radius: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .summary-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-800;
    margin: 8px 0 4px;
  }

  .summary-label {
    font-size: 0.8rem;
    color: $gray-600;
  }
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .section-link {
    color: $purple-primary;
    font-size: 0.8rem;
  }
}

.action-card {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .action-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: $gray-700;
    margin-top: 8px;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}
</style>
