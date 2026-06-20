<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Utilizadores</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por nome, email..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="add" label="Novo Utilizador" unelevated @click="abrirModalCriar" />
      </div>
    </div>

    <!-- Cards -->
    <div class="dashboard-top">
      <div class="cards-container">
        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon blue"><q-icon name="people" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalUtilizadores) }}</div>
              <div class="stat-label">Total Utilizadores</div>
              <div class="stat-trend positive">
                <q-icon name="trending_up" size="12px" />
                <span>Total registado</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="people" size="80px" /></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green"><q-icon name="verified" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(utilizadoresVerificados) }}</div>
              <div class="stat-label">Verificados</div>
              <div class="stat-trend positive">
                <q-icon name="check_circle" size="12px" />
                <span>{{ calcularPercentualVerificados() }}% do total</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="verified" size="80px" /></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange"><q-icon name="pending" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(utilizadoresPendentes) }}</div>
              <div class="stat-label">Pendentes</div>
              <div class="stat-trend warning" v-if="utilizadoresPendentes > 0">
                <q-icon name="schedule" size="12px" />
                <span>Aguardando verificação</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="pending" size="80px" /></div>
          </div>
        </div>

        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon purple"><q-icon name="handyman" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalPrestadores) }}</div>
              <div class="stat-label">Prestadores</div>
              <div class="stat-trend">
                <q-icon name="work" size="12px" />
                <span>{{ totalPrestadores > 0 ? 'Ativos no sistema' : 'Nenhum prestador' }}</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="handyman" size="80px" /></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon teal"><q-icon name="people_alt" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalClientes) }}</div>
              <div class="stat-label">Clientes</div>
              <div class="stat-trend">
                <q-icon name="shopping_cart" size="12px" />
                <span>{{ totalClientes > 0 ? 'Clientes registados' : 'Nenhum cliente' }}</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="people_alt" size="80px" /></div>
          </div>

          <div class="stat-card">
            <div class="stat-icon indigo"><q-icon name="admin_panel_settings" size="28px" /></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalAdmins) }}</div>
              <div class="stat-label">Administradores</div>
              <div class="stat-trend">
                <q-icon name="security" size="12px" />
                <span>Root + Admins</span>
              </div>
            </div>
            <div class="stat-bg-icon"><q-icon name="admin_panel_settings" size="80px" /></div>
          </div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="donut-card">
        <div class="donut-header">
          <h3>📊 Distribuição de Status</h3>
          <span class="donut-total">{{ totalUtilizadores }} utilizadores</span>
        </div>
        <div class="donut-container">
          <div class="donut-chart">
            <svg viewBox="0 0 120 120" style="width: 100%; height: 100%">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E5E7EB" stroke-width="20" />
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#10B981" stroke-width="20" :stroke-dasharray="calcularDashArray(utilizadoresVerificados)" :stroke-dashoffset="0" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#F59E0B" stroke-width="20" :stroke-dasharray="calcularDashArray(utilizadoresPendentes)" :stroke-dashoffset="calcularOffset(utilizadoresVerificados)" transform="rotate(-90 60 60)" />
              <text x="60" y="65" text-anchor="middle" fill="#1F2937" font-size="16" font-weight="bold">{{ totalUtilizadores }}</text>
            </svg>
          </div>
        </div>
        <div class="donut-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #10b981"></span>
            <span>Verificados</span>
            <strong>{{ formatNumber(utilizadoresVerificados) }}</strong>
            <span class="percent">({{ calcularPercentualVerificados() }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #f59e0b"></span>
            <span>Pendentes</span>
            <strong>{{ formatNumber(utilizadoresPendentes) }}</strong>
            <span class="percent">({{ calcularPercentualPendentes() }}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Projeção de Crescimento -->
    <div class="growth-section-card">
      <div class="section-header">
        <div class="header-title">
          <q-icon name="trending_up" size="24px" color="positive" />
          <h3>📈 Projeção de Crescimento (Próximos 6 meses)</h3>
        </div>
        <div class="header-badge">
          <q-badge color="positive" outline>Baseado em dados reais</q-badge>
        </div>
      </div>
      <div class="growth-grid">
        <div v-for="item in projecaoCrescimento" :key="item.tipo" class="growth-card">
          <div class="growth-icon" :style="{ background: item.cor }">
            <q-icon :name="item.icon" size="24px" color="white" />
          </div>
          <div class="growth-info">
            <div class="growth-label">{{ item.label }}</div>
            <div class="growth-values">
              <div class="current-value">
                <span class="label">Atual</span>
                <span class="value">{{ formatNumber(item.atual) }}</span>
              </div>
              <q-icon name="arrow_forward" size="16px" color="primary" class="arrow-icon" />
              <div class="projected-value">
                <span class="label">Projeção</span>
                <span class="value">{{ formatNumber(item.projecao) }}</span>
              </div>
            </div>
            <div class="growth-bar-container">
              <div class="growth-bar" :style="{ width: item.percentualCrescimento + '%', background: item.cor }">
                <span class="growth-percent-value">+{{ item.percentualCrescimento }}%</span>
              </div>
            </div>
            <div class="growth-footer">
              <q-icon name="trending_up" size="14px" color="positive" />
              <span class="growth-text">Crescimento estimado de {{ item.percentualCrescimento }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <q-select v-model="filtros.tipo" :options="tiposOptions" label="Tipo" dense outlined clearable class="filter-select" @update:model-value="onFiltroChange" />
      <q-select v-model="filtros.verificado" :options="verificadoOptions" label="Verificado" dense outlined clearable class="filter-select" @update:model-value="onFiltroChange" />
      <q-select v-model="filtros.status" :options="statusOptions" label="Status" dense outlined clearable class="filter-select" @update:model-value="onFiltroChange" />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
      <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando utilizadores...</p>
    </div>

    <!-- Tabela com apenas botão "Ver" -->
    <q-table v-else :rows="utilizadores" :columns="tableColumns" row-key="id" flat bordered class="custom-table">
      <template v-slot:body-cell-nome="props">
        <q-td :props="props">
          <div class="user-cell">
            <q-avatar size="36px" class="q-mr-sm">
              <img :src="getAvatarUrl(props.row.nome)" />
            </q-avatar>
            <div>
              <div class="user-name">{{ props.row.nome }}</div>
              <div class="user-email">{{ props.row.email }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-tipo="props">
        <q-td :props="props">
          <q-badge :color="getTipoColor(props.row.tipo)" class="tipo-badge">
            <q-icon :name="getTipoIcon(props.row.tipo)" size="12px" class="q-mr-xs" />
            {{ getTipoLabel(props.row.tipo) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusBadgeColor(props.row.status)" class="status-badge">
            <q-icon :name="getStatusIcon(props.row.status)" size="12px" class="q-mr-xs" />
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-verificado="props">
        <q-td :props="props">
          <q-badge :color="props.row.verificado ? 'green' : 'orange'" class="status-badge">
            <q-icon :name="props.row.verificado ? 'verified' : 'pending'" size="12px" class="q-mr-xs" />
            {{ props.row.verificado ? 'Verificado' : 'Pendente' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <div class="acoes-cell">
            <q-btn
              flat
              round
              icon="visibility"
              color="info"
              size="sm"
              @click="() => abrirPerfil(props.row)"
              title="Ver perfil completo"
            >
              <q-tooltip>Ver perfil completo</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn flat icon="chevron_left" :disable="!temPaginaAnterior" @click="() => mudarPagina(paginacao.current_page - 1)" />
          <span class="pagination-info">
            <q-icon name="list" size="14px" />
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{ paginacao.total }} registos)
          </span>
          <q-btn flat icon="chevron_right" :disable="!temProximaPagina" @click="() => mudarPagina(paginacao.current_page + 1)" />
        </div>
      </template>
    </q-table>

    <!-- ===== MODAL CRIAR ===== -->
    <q-dialog v-model="modalVisible" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 500px; border-radius: 20px">
        <q-card-section class="modal-header" :style="{ background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white' }">
          <div class="text-h6">
            <q-icon name="person_add" class="q-mr-sm" />
            Novo Utilizador
          </div>
          <q-btn flat round icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input v-model="form.nome" label="Nome completo *" dense outlined :error="!!errors.nome" :error-message="errors.nome">
            <template v-slot:prepend><q-icon name="person" /></template>
          </q-input>
          <q-input v-model="form.email" label="Email *" type="email" dense outlined class="q-mt-md" :error="!!errors.email" :error-message="errors.email">
            <template v-slot:prepend><q-icon name="email" /></template>
          </q-input>
          <q-input v-model="form.telefone" label="Telefone" dense outlined class="q-mt-md">
            <template v-slot:prepend><q-icon name="phone" /></template>
          </q-input>
          <q-input v-model="form.password" label="Password *" type="password" dense outlined class="q-mt-md" :error="!!errors.password" :error-message="errors.password">
            <template v-slot:prepend><q-icon name="lock" /></template>
          </q-input>
          <q-select v-model="form.tipo" :options="tiposOptions" label="Tipo *" dense outlined class="q-mt-md" :error="!!errors.tipo" :error-message="errors.tipo">
            <template v-slot:prepend><q-icon name="badge" /></template>
          </q-select>
          <q-input v-if="form.tipo === 'prestador'" v-model="form.profissao" label="Profissão" dense outlined class="q-mt-md">
            <template v-slot:prepend><q-icon name="work" /></template>
          </q-input>
          <q-input v-if="form.tipo === 'prestador'" v-model="form.sobre" label="Sobre" type="textarea" dense outlined class="q-mt-md" rows="3">
            <template v-slot:prepend><q-icon name="description" /></template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModal" />
          <q-btn unelevated label="Criar" color="primary" @click="salvarUtilizador" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminUtilizadoresStore } from 'src/stores/admin/admin-utilizadores-store';
import type { Utilizador } from 'src/stores/admin/admin-utilizadores-store';

defineOptions({ name: 'AdminUtilizadores' });

const router = useRouter();
const $q = useQuasar();
const utilizadoresStore = useAdminUtilizadoresStore();

const {
  isLoading,
  isSaving,
  utilizadores,
  paginacao,
  filtros,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(utilizadoresStore);

// 🔥 Removido 'removerUtilizador' - não usado na tabela
const {
  carregarUtilizadores,
  setFiltro,
  limparFiltros,
  mudarPagina,
  criarUtilizador,
  recarregarDados,
} = utilizadoresStore;

// ===================== ESTADOS LOCAIS =====================
const modalVisible = ref(false);

const errors = reactive({
  nome: '',
  email: '',
  telefone: '',
  tipo: '',
  password: '',
});

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  tipo: 'cliente' as 'cliente' | 'prestador' | 'admin' | 'root',
  password: '',
  profissao: '',
  sobre: '',
});

// ===================== OPTIONS =====================
const tiposOptions = [
  { label: '👤 Cliente', value: 'cliente' },
  { label: '🔧 Prestador', value: 'prestador' },
  { label: '👑 Administrador', value: 'admin' },
  { label: '⭐ Root', value: 'root' },
];

const verificadoOptions = [
  { label: '✅ Verificados', value: 'sim' },
  { label: '⏳ Não verificados', value: 'nao' },
];

const statusOptions = [
  { label: '🟢 Ativo', value: 'ativo' },
  { label: '🟡 Pendente', value: 'pendente' },
  { label: '🔴 Bloqueado', value: 'bloqueado' },
  { label: '⚫ Desativado', value: 'desativado' },
  { label: '❌ Reprovado', value: 'reprovado' },
];

// ===================== COMPUTEDS =====================
const totalUtilizadores = computed(() => utilizadores.value.length);
const utilizadoresVerificados = computed(() => utilizadores.value.filter((u) => u.verificado).length);
const utilizadoresPendentes = computed(() => utilizadores.value.filter((u) => !u.verificado).length);
const totalPrestadores = computed(() => utilizadores.value.filter((u) => u.tipo === 'prestador').length);
const totalClientes = computed(() => utilizadores.value.filter((u) => u.tipo === 'cliente').length);
const totalAdmins = computed(() => utilizadores.value.filter((u) => u.tipo === 'admin' || u.tipo === 'root').length);

// Projeção de Crescimento
const projecaoCrescimento = computed(() => {
  const taxas = {
    cliente: Math.min(15, Math.floor(totalClientes.value * 0.12) + 5),
    prestador: Math.min(20, Math.floor(totalPrestadores.value * 0.15) + 8),
    admin: Math.min(8, Math.floor(totalAdmins.value * 0.08) + 2),
  };

  const cores = {
    cliente: '#3B82F6',
    prestador: '#8B5CF6',
    admin: '#EF4444',
  };

  const icons = {
    cliente: 'people',
    prestador: 'handyman',
    admin: 'admin_panel_settings',
  };

  const labels = {
    cliente: 'Clientes',
    prestador: 'Prestadores',
    admin: 'Administradores',
  };

  return [
    {
      tipo: 'cliente',
      label: labels.cliente,
      icon: icons.cliente,
      atual: totalClientes.value,
      projecao: Math.floor(totalClientes.value * (1 + taxas.cliente / 100)),
      percentualCrescimento: taxas.cliente,
      cor: cores.cliente,
    },
    {
      tipo: 'prestador',
      label: labels.prestador,
      icon: icons.prestador,
      atual: totalPrestadores.value,
      projecao: Math.floor(totalPrestadores.value * (1 + taxas.prestador / 100)),
      percentualCrescimento: taxas.prestador,
      cor: cores.prestador,
    },
    {
      tipo: 'admin',
      label: labels.admin,
      icon: icons.admin,
      atual: totalAdmins.value,
      projecao: Math.floor(totalAdmins.value * (1 + taxas.admin / 100)),
      percentualCrescimento: taxas.admin,
      cor: cores.admin,
    },
  ];
});

// Donut chart functions
const circunferencia = 2 * Math.PI * 50;
const calcularDashArray = (valor: number): string => {
  if (totalUtilizadores.value === 0) return `0 ${circunferencia}`;
  const percentual = (valor / totalUtilizadores.value) * 100;
  const dashLength = (percentual / 100) * circunferencia;
  return `${dashLength} ${circunferencia - dashLength}`;
};

const calcularOffset = (valorAcumulado: number): string => {
  if (totalUtilizadores.value === 0) return '0';
  const percentualAcumulado = (valorAcumulado / totalUtilizadores.value) * 100;
  return String(-(percentualAcumulado / 100) * circunferencia);
};

const calcularPercentualVerificados = (): number => {
  if (totalUtilizadores.value === 0) return 0;
  return Math.round((utilizadoresVerificados.value / totalUtilizadores.value) * 100);
};

const calcularPercentualPendentes = (): number => {
  if (totalUtilizadores.value === 0) return 0;
  return Math.round((utilizadoresPendentes.value / totalUtilizadores.value) * 100);
};

// ===================== FUNÇÕES AUXILIARES =====================
const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num);

const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'purple';
    case 'admin': return 'red';
    case 'root': return 'dark';
    default: return 'blue';
  }
};

const getTipoLabel = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'Prestador';
    case 'admin': return 'Administrador';
    case 'root': return 'Root';
    default: return 'Cliente';
  }
};

const getTipoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'handyman';
    case 'admin': return 'admin_panel_settings';
    case 'root': return 'verified';
    default: return 'person';
  }
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    bloqueado: 'Bloqueado',
    desativado: 'Desativado',
    reprovado: 'Reprovado',
  };
  return map[status] || status;
};

const getStatusIcon = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'check_circle',
    pendente: 'pending',
    bloqueado: 'lock',
    desativado: 'pause',
    reprovado: 'cancel',
  };
  return map[status] || 'info';
};

const getStatusBadgeColor = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'positive',
    pendente: 'warning',
    bloqueado: 'negative',
    desativado: 'grey',
    reprovado: 'negative',
  };
  return map[status] || 'info';
};

const getAvatarUrl = (nome: string): string =>
  `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=120&name=${encodeURIComponent(nome)}`;

// ===================== VALIDAÇÃO =====================
const validarForm = (): boolean => {
  let isValid = true;
  errors.nome = '';
  errors.email = '';
  errors.tipo = '';
  errors.password = '';

  if (!form.nome.trim()) { errors.nome = 'Nome é obrigatório'; isValid = false; }
  if (!form.email.trim()) { errors.email = 'Email é obrigatório'; isValid = false; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Email inválido'; isValid = false; }
  if (!form.tipo) { errors.tipo = 'Tipo é obrigatório'; isValid = false; }
  if (!form.password.trim()) { errors.password = 'Password é obrigatória'; isValid = false; }
  return isValid;
};

// ===================== COLUNAS =====================
const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true, style: 'width: 60px' },
  { name: 'nome', label: 'Utilizador', field: 'nome', align: 'left' as const, style: 'min-width: 200px' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, style: 'width: 200px' },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left' as const, style: 'width: 120px' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const, style: 'width: 120px' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const, style: 'width: 100px' },
  { name: 'verificado', label: 'Verificação', field: 'verificado', align: 'center' as const, style: 'width: 100px' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const, style: 'width: 80px' },
];

// ===================== HANDLERS =====================
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('tipo', filtros.value.tipo);
  setFiltro('verificado', filtros.value.verificado);
  setFiltro('status', filtros.value.status);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

const handleRecarregar = (): void => {
  void recarregarDados();
};

// ===================== ABRIR PERFIL =====================
const abrirPerfil = (user: Utilizador): void => {
  void router.push(`/admin/utilizadores/${user.id}`);
};

// ===================== MODAL CRIAR =====================
const abrirModalCriar = (): void => {
  form.nome = '';
  form.email = '';
  form.telefone = '';
  form.tipo = 'cliente';
  form.password = '';
  form.profissao = '';
  form.sobre = '';
  modalVisible.value = true;
};

const fecharModal = (): void => {
  modalVisible.value = false;
};

const salvarUtilizador = async (): Promise<void> => {
  if (!validarForm()) return;

  try {
    const result = await criarUtilizador({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || '',
      tipo: form.tipo,
      password: form.password,
      profissao: form.profissao || '',
      sobre: form.sobre || '',
    });

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Utilizador criado com sucesso!',
        position: 'top',
      });
      modalVisible.value = false;
      await carregarUtilizadores(true);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao criar utilizador', position: 'top' });
  }
};

// ===================== LIFECYCLE =====================
onMounted(() => {
  void carregarUtilizadores();
});
</script>



<style scoped lang="scss">
// CSS igual ao anterior
.page-container { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-header h1 { margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.page-header .header-actions .search-input { width: 300px; }
.dashboard-top { display: flex; gap: 24px; margin-bottom: 24px; }
.cards-container { flex: 2; display: flex; flex-direction: column; gap: 20px; }
.cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s ease; position: relative; overflow: hidden; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
.stat-card .stat-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; z-index: 1; }
.stat-card .stat-icon.blue { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.stat-card .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.stat-card .stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.stat-card .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
.stat-card .stat-icon.teal { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; }
.stat-card .stat-icon.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
.stat-card .stat-info { flex: 1; z-index: 1; }
.stat-card .stat-info .stat-value { font-size: 28px; font-weight: 800; color: #1a1a2e; }
.stat-card .stat-info .stat-label { font-size: 13px; color: #6b7280; margin-top: 4px; }
.stat-card .stat-info .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; margin-top: 6px; }
.stat-card .stat-info .stat-trend.positive { color: #10b981; }
.stat-card .stat-info .stat-trend.warning { color: #f59e0b; }
.stat-card .stat-bg-icon { position: absolute; right: -10px; bottom: -10px; opacity: 0.06; z-index: 0; }
.stat-card .stat-bg-icon :deep(.q-icon) { font-size: 80px; }
.donut-card { flex: 1; background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
.donut-card .donut-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
.donut-card .donut-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
.donut-card .donut-header .donut-total { font-size: 13px; color: #667eea; font-weight: 600; }
.donut-card .donut-container { display: flex; justify-content: center; margin-bottom: 20px; }
.donut-card .donut-container .donut-chart { width: 180px; height: 180px; }
.donut-card .donut-legend .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 8px; }
.donut-card .donut-legend .legend-item .legend-color { width: 10px; height: 10px; border-radius: 3px; }
.donut-card .donut-legend .legend-item strong { margin-left: auto; }
.donut-card .donut-legend .legend-item .percent { color: #9ca3af; margin-left: 4px; }
.growth-section-card { background: white; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.growth-section-card .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
.growth-section-card .section-header .header-title { display: flex; align-items: center; gap: 12px; }
.growth-section-card .section-header .header-title h3 { font-size: 18px; font-weight: 600; margin: 0; color: #1a1a2e; }
.growth-section-card .growth-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.growth-section-card .growth-grid .growth-card { background: white; border-radius: 16px; padding: 20px; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
.growth-section-card .growth-grid .growth-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
.growth-section-card .growth-grid .growth-card .growth-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-label { font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 12px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values .current-value .label { font-size: 10px; color: #9ca3af; margin-bottom: 4px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values .current-value .value { font-size: 20px; font-weight: 700; color: #374151; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values .projected-value .label { font-size: 10px; color: #9ca3af; margin-bottom: 4px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values .projected-value .value { font-size: 20px; font-weight: 700; color: #667eea; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-values .arrow-icon { color: #9ca3af; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-bar-container { height: 32px; background: #f3f4f6; border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-bar-container .growth-bar { height: 100%; border-radius: 16px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; transition: width 0.5s ease; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-bar-container .growth-bar .growth-percent-value { font-size: 12px; font-weight: 700; color: white; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-footer { display: flex; align-items: center; gap: 6px; }
.growth-section-card .growth-grid .growth-card .growth-info .growth-footer .growth-text { font-size: 11px; color: #10b981; font-weight: 500; }
.filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; background: white; border-radius: 20px; }
.user-cell { display: flex; align-items: center; }
.user-cell .user-name { font-weight: 600; }
.user-cell .user-email { font-size: 12px; color: #9ca3af; }
.acoes-cell { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
.pagination-container { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 20px; background: white; border-radius: 16px; margin-top: 20px; }
.pagination-container .pagination-info { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0; }
.modal-actions { padding: 12px 20px 20px; border-top: 1px solid #e5e7eb; }
.custom-table { border-radius: 16px; overflow: hidden; }
.tipo-badge, .status-badge { padding: 6px 12px; }
@media (max-width: 1200px) { .dashboard-top { flex-direction: column; } .cards-row { grid-template-columns: repeat(2, 1fr); } .growth-grid { grid-template-columns: repeat(2, 1fr) !important; } }
@media (max-width: 768px) { .cards-row { grid-template-columns: 1fr; } .page-header { flex-direction: column; align-items: stretch; } .page-header .header-actions .search-input { width: 100%; } .filters-bar { flex-direction: column; } .filters-bar .filter-select { width: 100%; } .growth-grid { grid-template-columns: 1fr !important; } }
</style>
