<template>
  <q-page class="admin-dashboard">
    <!-- Cabeçalho com saudação -->
    <div class="dashboard-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Bem-vindo de volta, {{ adminNome }}</div>
      </div>
      <q-btn
        flat
        round
        icon="refresh"
        class="refresh-btn"
        @click="carregarDados"
        :loading="loading"
      >
        <q-tooltip>Atualizar dados</q-tooltip>
      </q-btn>
    </div>

    <!-- Cards de estatísticas principais -->
    <div class="stats-grid">
      <div class="stat-card" v-for="card in cardsPrincipais" :key="card.title">
        <div class="stat-card-content">
          <div class="stat-icon" :style="{ background: card.bgColor }">
            <q-icon :name="card.icon" size="28px" :color="card.iconColor" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumberValue(card.value) }}</div>
            <div class="stat-label">{{ card.title }}</div>
            <div class="stat-trend" :class="card.trend > 0 ? 'trend-up' : 'trend-down'">
              <q-icon :name="card.trend > 0 ? 'trending_up' : 'trending_down'" size="12px" />
              {{ Math.abs(card.trend) }}% este mês
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards secundários -->
    <div class="stats-grid-secondary">
      <div class="stat-card-secondary" v-for="card in cardsSecundarios" :key="card.title">
        <div class="stat-card-secondary-content">
          <div class="stat-secondary-icon" :style="{ background: card.bgColor }">
            <q-icon :name="card.icon" size="24px" :color="card.iconColor" />
          </div>
          <div class="stat-secondary-info">
            <div class="stat-secondary-value">{{ formatNumberValue(card.value) }}</div>
            <div class="stat-secondary-label">{{ card.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos e distribuição -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">Atividade dos Últimos 7 Dias</span>
        </div>
        <div class="chart-content">
          <div class="bars-container">
            <div v-for="(item, index) in atividadeSemanal" :key="index" class="bar-item">
              <div class="bar" :style="{ height: item.altura + 'px', backgroundColor: item.cor }"></div>
              <div class="bar-label">{{ item.dia }}</div>
              <div class="bar-value">{{ item.valor }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="distribuicao-card">
        <div class="card-header">
          <span class="card-title">Distribuição por Tipo</span>
        </div>
        <div class="distribuicao-content">
          <div class="distribuicao-item">
            <div class="distribuicao-header">
              <span class="distribuicao-label">Clientes</span>
              <span class="distribuicao-value">{{ formatNumber(stats.totalClientes) }}</span>
            </div>
            <q-linear-progress :value="stats.totalClientes / stats.totalUsers" color="primary" class="progress-bar" />
          </div>
          <div class="distribuicao-item">
            <div class="distribuicao-header">
              <span class="distribuicao-label">Prestadores</span>
              <span class="distribuicao-value">{{ formatNumber(stats.totalPrestadores) }}</span>
            </div>
            <q-linear-progress :value="stats.totalPrestadores / stats.totalUsers" color="secondary" class="progress-bar" />
          </div>
          <div class="distribuicao-item">
            <div class="distribuicao-header">
              <span class="distribuicao-label">Administradores</span>
              <span class="distribuicao-value">{{ formatNumber(stats.totalAdmins) }}</span>
            </div>
            <q-linear-progress :value="stats.totalAdmins / stats.totalUsers" color="grey" class="progress-bar" />
          </div>
          <div class="distribuicao-total">
            <span class="total-label">Total de Utilizadores</span>
            <span class="total-value">{{ formatNumber(stats.totalUsers) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Listas de atividades recentes -->
    <div class="recent-lists">
      <div class="recent-card">
        <div class="card-header">
          <span class="card-title">Últimos Utilizadores</span>
          <q-btn flat dense icon="chevron_right" label="Ver todos" to="/admin/utilizadores" no-caps class="view-all-btn" />
        </div>
        <div class="users-list">
          <div v-for="user in ultimosUtilizadores" :key="user.id" class="user-item" @click="verUtilizador(user.id)">
            <q-avatar size="40px">
              <img :src="user.avatar" />
            </q-avatar>
            <div class="user-info">
              <div class="user-name">{{ user.nome }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
            <div class="user-badge">
              <q-badge :color="user.tipo === 'prestador' ? 'secondary' : 'primary'" rounded>
                {{ user.tipo === 'prestador' ? 'Prestador' : 'Cliente' }}
              </q-badge>
              <div class="user-date">{{ user.data }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-card">
        <div class="card-header">
          <span class="card-title">Serviços Recentes</span>
          <q-btn flat dense icon="chevron_right" label="Ver todos" to="/admin/servicos" no-caps class="view-all-btn" />
        </div>
        <div class="services-list">
          <div v-for="servico in servicosRecentes" :key="servico.id" class="service-item" @click="verServico(servico.id)">
            <q-avatar :color="servico.statusCor" text-color="white" size="40px">
              <q-icon :name="servico.icone" size="20px" />
            </q-avatar>
            <div class="service-info">
              <div class="service-name">{{ servico.servico }}</div>
              <div class="service-cliente">{{ servico.cliente }} • {{ servico.prestador }}</div>
            </div>
            <div class="service-value">
              <div class="service-price">{{ formatMoney(servico.valor) }}</div>
              <q-badge :color="servico.statusCor">{{ servico.status }}</q-badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações rápidas -->
    <div class="quick-actions">
      <div class="card-header">
        <span class="card-title">Ações Rápidas</span>
      </div>
      <div class="actions-grid">
        <div v-for="action in acoesRapidas" :key="action.label" class="action-item" @click="novaAcao(action.tipo)">
          <div class="action-icon" :style="{ background: action.bgColor }">
            <q-icon :name="action.icon" size="24px" :color="action.iconColor" />
          </div>
          <div class="action-label">{{ action.label }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'AdminDashboard'
});

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const loading = ref(false);

// Nome do admin
const adminNome = computed(() => authStore.user?.nome?.split(' ')[0] || 'Administrador');

// Interface para card
interface CardPrincipal {
  title: string;
  value: number | string;
  icon: string;
  iconColor: string;
  bgColor: string;
  trend: number;
}

interface CardSecundario {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  bgColor: string;
}

// Estatísticas
const stats = ref({
  totalUsers: 12580,
  totalClientes: 8450,
  totalPrestadores: 4120,
  totalAdmins: 10,
  prestadoresAtivos: 3890,
  servicosHoje: 234,
  avaliacaoMedia: 4.8,
  totalAvaliacoes: 15234,
  receitaTotal: 1258000,
  totalCategorias: 12,
  totalServicos: 156
});

// Cards principais
const cardsPrincipais = computed<CardPrincipal[]>(() => [
  { title: 'Total Utilizadores', value: stats.value.totalUsers, icon: 'people', iconColor: 'white', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', trend: 12 },
  { title: 'Prestadores', value: stats.value.totalPrestadores, icon: 'handyman', iconColor: 'white', bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', trend: 8 },
  { title: 'Serviços Hoje', value: stats.value.servicosHoje, icon: 'assignment', iconColor: 'white', bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', trend: 5 },
  { title: 'Avaliação Média', value: stats.value.avaliacaoMedia.toFixed(1), icon: 'star', iconColor: 'white', bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', trend: 3 }
]);

// Cards secundários
const cardsSecundarios = computed<CardSecundario[]>(() => [
  { title: 'Receita Total', value: stats.value.receitaTotal, icon: 'payments', iconColor: '#2e7d32', bgColor: '#e8f5e9' },
  { title: 'Categorias', value: stats.value.totalCategorias, icon: 'category', iconColor: '#f57c00', bgColor: '#fff3e0' },
  { title: 'Serviços', value: stats.value.totalServicos, icon: 'construction', iconColor: '#1976d2', bgColor: '#e3f2fd' },
  { title: 'Avaliações', value: stats.value.totalAvaliacoes, icon: 'chat', iconColor: '#9c27b0', bgColor: '#f3e5f5' }
]);

// Ações rápidas
const acoesRapidas = [
  { label: 'Novo Admin', icon: 'person_add', tipo: 'admin', iconColor: '#667eea', bgColor: '#e8eaff' },
  { label: 'Verificar Prestador', icon: 'handyman', tipo: 'prestador', iconColor: '#f5576c', bgColor: '#ffe8ea' },
  { label: 'Nova Categoria', icon: 'category', tipo: 'categoria', iconColor: '#f57c00', bgColor: '#fff3e0' },
  { label: 'Relatório', icon: 'receipt', tipo: 'relatorio', iconColor: '#4caf50', bgColor: '#e8f5e9' },
  { label: 'Configurações', icon: 'settings', tipo: 'config', iconColor: '#607d8b', bgColor: '#eceff1' },
  { label: 'Suporte', icon: 'support', tipo: 'suporte', iconColor: '#f44336', bgColor: '#ffebee' }
];

// Atividade semanal
const atividadeSemanal = ref([
  { dia: 'Seg', valor: 45, altura: 90, cor: '#667eea' },
  { dia: 'Ter', valor: 62, altura: 124, cor: '#667eea' },
  { dia: 'Qua', valor: 58, altura: 116, cor: '#667eea' },
  { dia: 'Qui', valor: 71, altura: 142, cor: '#667eea' },
  { dia: 'Sex', valor: 84, altura: 168, cor: '#667eea' },
  { dia: 'Sáb', valor: 53, altura: 106, cor: '#764ba2' },
  { dia: 'Dom', valor: 38, altura: 76, cor: '#764ba2' }
]);

// Últimos utilizadores
const ultimosUtilizadores = ref([
  { id: 1, nome: 'João Silva', email: 'joao.silva@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar.png', data: 'Hoje, 10:30' },
  { id: 2, nome: 'Maria Santos', email: 'maria.santos@email.com', tipo: 'cliente', avatar: 'https://cdn.quasar.dev/img/avatar2.jpg', data: 'Hoje, 09:15' },
  { id: 3, nome: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar3.jpg', data: 'Ontem, 16:45' },
  { id: 4, nome: 'Ana Costa', email: 'ana.costa@email.com', tipo: 'cliente', avatar: 'https://cdn.quasar.dev/img/avatar4.jpg', data: 'Ontem, 14:20' },
  { id: 5, nome: 'Carlos Mendes', email: 'carlos.mendes@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar5.jpg', data: '2 dias atrás' }
]);

// Serviços recentes
const servicosRecentes = ref([
  { id: 1, servico: 'Reparação elétrica', cliente: 'João Silva', prestador: 'Maria Santos', valor: 1500, status: 'Concluído', statusCor: 'positive', icone: 'bolt' },
  { id: 2, servico: 'Instalação de tomada', cliente: 'Pedro Oliveira', prestador: 'Ana Costa', valor: 800, status: 'Em andamento', statusCor: 'warning', icone: 'electrical_services' },
  { id: 3, servico: 'Limpeza residencial', cliente: 'Maria Santos', prestador: 'Carlos Mendes', valor: 1200, status: 'Pendente', statusCor: 'info', icone: 'cleaning_services' },
  { id: 4, servico: 'Pintura de parede', cliente: 'Ana Costa', prestador: 'João Silva', valor: 2000, status: 'Concluído', statusCor: 'positive', icone: 'brush' },
  { id: 5, servico: 'Troca de disjuntor', cliente: 'Carlos Mendes', prestador: 'Pedro Oliveira', valor: 950, status: 'Cancelado', statusCor: 'negative', icone: 'settings' }
]);

// Métodos auxiliares
const formatNumber = (num: number) => new Intl.NumberFormat('pt-PT').format(num);

// CORREÇÃO: função que aceita number ou string
const formatNumberValue = (value: number | string): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-PT').format(value);
  }
  return value;
};

const formatMoney = (num: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(num);

const carregarDados = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    $q.notify({ type: 'positive', message: 'Dados atualizados!', position: 'top', timeout: 2000 });
  }, 1000);
};

const verUtilizador = (id: number) => void router.push(`/admin/utilizadores?id=${id}`);
const verServico = (id: number) => void router.push(`/admin/servicos?id=${id}`);

const novaAcao = (tipo: string) => {
  const rotas: Record<string, string> = {
    admin: '/admin/utilizadores?novo=admin',
    prestador: '/admin/prestadores?pendentes=true',
    categoria: '/admin/categorias?nova=true',
    relatorio: '/admin/relatorios',
    config: '/admin/configuracoes',
    suporte: '/admin/suporte'
  };
  if (rotas[tipo]) void router.push(rotas[tipo]);
  else $q.notify({ type: 'info', message: 'Ação em desenvolvimento', position: 'top' });
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => { loading.value = false; }, 800);
});
</script>

<style scoped lang="scss">
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #424242;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    font-size: 0.9rem;
    color: #9e9e9e;
    margin-top: 4px;
  }

  .refresh-btn {
    color: #9e9e9e;
    &:hover { background: #f5f5f5; }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .stat-card-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #424242;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #9e9e9e;
    margin-top: 4px;
  }

  .stat-trend {
    font-size: 0.7rem;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 2px;

    &.trend-up { color: #2e7d32; }
    &.trend-down { color: #d32f2f; }
  }
}

.stats-grid-secondary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card-secondary {
  background: white;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); }

  .stat-card-secondary-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-secondary-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-secondary-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #424242;
  }

  .stat-secondary-label {
    font-size: 0.75rem;
    color: #9e9e9e;
  }
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card, .distribuicao-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eeeeee;

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #424242;
  }

  .view-all-btn {
    color: #667eea;
    font-size: 0.8rem;
  }
}

.bars-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 160px;
  padding: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 50px;

  .bar {
    width: 30px;
    border-radius: 6px 6px 0 0;
    transition: height 0.3s ease;
  }

  .bar-label {
    font-size: 0.7rem;
    color: #9e9e9e;
    margin-top: 8px;
  }

  .bar-value {
    font-size: 0.7rem;
    font-weight: 600;
    color: #757575;
  }
}

.distribuicao-content {
  padding: 20px;
}

.distribuicao-item {
  margin-bottom: 16px;

  .distribuicao-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;

    .distribuicao-label { font-size: 0.8rem; color: #757575; }
    .distribuicao-value { font-size: 0.8rem; font-weight: 600; color: #424242; }
  }

  .progress-bar { height: 6px; border-radius: 3px; }
}

.distribuicao-total {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #eeeeee;

  .total-label { font-size: 0.85rem; font-weight: 500; color: #616161; }
  .total-value { font-size: 1rem; font-weight: 700; color: #667eea; }
}

.recent-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.recent-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.users-list, .services-list {
  max-height: 380px;
  overflow-y: auto;
}

.user-item, .service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover { background: #f5f5f5; }
  &:last-child { border-bottom: none; }
}

.user-info, .service-info {
  flex: 1;
}

.user-name, .service-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #424242;
}

.user-email, .service-cliente {
  font-size: 0.7rem;
  color: #9e9e9e;
}

.user-badge, .service-value {
  text-align: right;
}

.user-date {
  font-size: 0.65rem;
  color: #e0e0e0;
  margin-top: 4px;
}

.service-price {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
}

.quick-actions {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 20px;
}

.action-item {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover { transform: translateY(-4px); }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
  }

  .action-label {
    font-size: 0.7rem;
    color: #757575;
  }
}

@media (max-width: 1024px) {
  .stats-grid, .stats-grid-secondary {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row, .recent-lists {
    grid-template-columns: 1fr;
  }
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .admin-dashboard { padding: 16px; }
  .stats-grid, .stats-grid-secondary { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
