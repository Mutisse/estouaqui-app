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
      </div>
    </div>

    <!-- Layout: Cards (esquerda) + Donut (direita) -->
    <div class="dashboard-top">
      <div class="cards-container">
        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon blue">
              <q-icon name="people" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalUtilizadores) }}</div>
              <div class="stat-label">Total Utilizadores</div>
              <div class="stat-trend positive">
                <q-icon name="trending_up" size="12px" />
                <span>Total registado</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="people" size="80px" />
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <q-icon name="verified" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(utilizadoresVerificados) }}</div>
              <div class="stat-label">Verificados</div>
              <div class="stat-trend positive">
                <q-icon name="check_circle" size="12px" />
                <span>{{ calcularPercentualVerificados() }}% do total</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="verified" size="80px" />
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <q-icon name="pending" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(utilizadoresPendentes) }}</div>
              <div class="stat-label">Pendentes</div>
              <div class="stat-trend warning" v-if="utilizadoresPendentes > 0">
                <q-icon name="schedule" size="12px" />
                <span>Aguardando verificação</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="pending" size="80px" />
            </div>
          </div>
        </div>

        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon purple">
              <q-icon name="handyman" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalPrestadores) }}</div>
              <div class="stat-label">Prestadores</div>
              <div class="stat-trend">
                <q-icon name="work" size="12px" />
                <span>{{ totalPrestadores > 0 ? 'Ativos no sistema' : 'Nenhum prestador' }}</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="handyman" size="80px" />
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon teal">
              <q-icon name="people_alt" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalClientes) }}</div>
              <div class="stat-label">Clientes</div>
              <div class="stat-trend">
                <q-icon name="shopping_cart" size="12px" />
                <span>{{ totalClientes > 0 ? 'Clientes registados' : 'Nenhum cliente' }}</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="people_alt" size="80px" />
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon indigo">
              <q-icon name="admin_panel_settings" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalAdmins) }}</div>
              <div class="stat-label">Administradores</div>
              <div class="stat-trend">
                <q-icon name="security" size="12px" />
                <span>Root + Admins</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <q-icon name="admin_panel_settings" size="80px" />
            </div>
          </div>
        </div>
      </div>

      <!-- Donut Chart lado direito -->
      <div class="donut-card">
        <div class="donut-header">
          <h3>📊 Distribuição de Status</h3>
          <span class="donut-total">{{ totalUtilizadores }} utilizadores</span>
        </div>
        <div class="donut-container">
          <div class="donut-chart">
            <svg viewBox="0 0 120 120" style="width: 100%; height: 100%">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#E5E7EB"
                stroke-width="20"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#10B981"
                stroke-width="20"
                :stroke-dasharray="calcularDashArray(utilizadoresVerificados)"
                :stroke-dashoffset="0"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#F59E0B"
                stroke-width="20"
                :stroke-dasharray="calcularDashArray(utilizadoresPendentes)"
                :stroke-dashoffset="calcularOffset(utilizadoresVerificados)"
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="65"
                text-anchor="middle"
                fill="#1F2937"
                font-size="16"
                font-weight="bold"
              >
                {{ totalUtilizadores }}
              </text>
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

    <!-- APENAS PROJEÇÃO DE CRESCIMENTO (Próximos 6 meses) -->
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
              <div
                class="growth-bar"
                :style="{ width: item.percentualCrescimento + '%', background: item.cor }"
              >
                <span class="growth-percent-value">+{{ item.percentualCrescimento }}%</span>
              </div>
            </div>
            <div class="growth-footer">
              <q-icon name="trending_up" size="14px" color="positive" />
              <span class="growth-text"
                >Crescimento estimado de {{ item.percentualCrescimento }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <q-select
        v-model="filtros.tipo"
        :options="tiposOptions"
        label="Tipo"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.verificado"
        :options="verificadoOptions"
        label="Verificado"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
      <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando utilizadores...</p>
    </div>

    <q-table
      v-else
      :rows="utilizadores"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
      class="custom-table"
    >
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

      <template v-slot:body-cell-verificado="props">
        <q-td :props="props">
          <q-badge :color="props.row.verificado ? 'green' : 'orange'" class="status-badge">
            <q-icon
              :name="props.row.verificado ? 'verified' : 'pending'"
              size="12px"
              class="q-mr-xs"
            />
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
              title="Ver"
            >
              <q-tooltip>Ver detalhes</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="() => editarUtilizador(props.row)"
              title="Editar"
            >
              <q-tooltip>Editar utilizador</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="() => abrirConfirmacaoExclusao(props.row)"
              title="Excluir"
            >
              <q-tooltip>Excluir utilizador</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => mudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            <q-icon name="list" size="14px" />
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{
              paginacao.total
            }}
            registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => mudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>
    </q-table>

    <!-- Modal Editar Utilizador -->
    <q-dialog v-model="modalVisible" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 500px; border-radius: 20px">
        <q-card-section
          class="modal-header"
          :style="{ background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white' }"
        >
          <div class="text-h6">✏️ Editar Utilizador</div>
          <q-btn flat round icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input
            v-model="form.nome"
            label="Nome completo *"
            dense
            outlined
            :error="!!errors.nome"
            :error-message="errors.nome"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input
            v-model="form.email"
            label="Email *"
            type="email"
            dense
            outlined
            class="q-mt-md"
            :error="!!errors.email"
            :error-message="errors.email"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input v-model="form.telefone" label="Telefone" dense outlined class="q-mt-md">
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
          <q-select
            v-model="form.tipo"
            :options="tiposOptions"
            label="Tipo *"
            dense
            outlined
            class="q-mt-md"
            :error="!!errors.tipo"
            :error-message="errors.tipo"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-select>
          <q-input
            v-if="form.tipo === 'prestador'"
            v-model="form.profissao"
            label="Profissão"
            dense
            outlined
            class="q-mt-md"
          >
            <template v-slot:prepend>
              <q-icon name="work" />
            </template>
          </q-input>
          <q-input
            v-if="form.tipo === 'prestador'"
            v-model="form.sobre"
            label="Sobre"
            type="textarea"
            dense
            outlined
            class="q-mt-md"
            rows="3"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModal" />
          <q-btn
            flat
            label="Salvar"
            color="primary"
            @click="salvarUtilizador"
            :loading="isSaving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Mini-Perfil -->
    <q-dialog v-model="perfilModalVisible" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 380px; max-width: 450px; border-radius: 20px">
        <q-card-section
          class="perfil-header"
          :style="{
            background: `linear-gradient(135deg, ${getPerfilGradient(utilizadorPerfil?.tipo || 'cliente')}, #1a1a2e)`,
          }"
        >
          <div class="perfil-avatar">
            <q-avatar size="80px">
              <img :src="getAvatarUrl(utilizadorPerfil?.nome || '')" />
            </q-avatar>
            <q-badge :color="getStatusColor(utilizadorPerfil?.verificado)" class="status-badge">
              <q-icon :name="utilizadorPerfil?.verificado ? 'verified' : 'pending'" size="12px" />
              {{ utilizadorPerfil?.verificado ? 'Verificado' : 'Pendente' }}
            </q-badge>
          </div>
          <div class="perfil-nome">{{ utilizadorPerfil?.nome }}</div>
          <div class="perfil-tipo">
            <q-badge :color="getTipoColor(utilizadorPerfil?.tipo || 'cliente')" class="tipo-badge">
              <q-icon :name="getTipoIcon(utilizadorPerfil?.tipo || 'cliente')" size="12px" />
              {{ getTipoLabel(utilizadorPerfil?.tipo || 'cliente') }}
            </q-badge>
          </div>
        </q-card-section>

        <q-card-section class="perfil-body">
          <div class="info-grid">
            <div class="info-item">
              <q-icon name="email" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Email</div>
                <div class="info-value">{{ utilizadorPerfil?.email }}</div>
              </div>
            </div>
            <div class="info-item">
              <q-icon name="phone" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Telefone</div>
                <div class="info-value">{{ utilizadorPerfil?.telefone || 'Não informado' }}</div>
              </div>
            </div>
            <div class="info-item">
              <q-icon name="calendar_today" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Data de registo</div>
                <div class="info-value">{{ formatarData(utilizadorPerfil?.created_at) }}</div>
              </div>
            </div>
            <div
              class="info-item"
              v-if="utilizadorPerfil?.tipo === 'prestador' && utilizadorPerfil?.profissao"
            >
              <q-icon name="work" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Profissão</div>
                <div class="info-value">{{ utilizadorPerfil?.profissao }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="perfil-actions">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn flat label="Editar" color="primary" @click="editarDoPerfil" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminUtilizadoresStore } from 'src/stores/admin/admin-utilizadores-store';
import type { Utilizador } from 'src/stores/admin/admin-utilizadores-store';

defineOptions({ name: 'AdminUtilizadores' });

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

const {
  carregarUtilizadores,
  setFiltro,
  limparFiltros,
  mudarPagina,
  buscarUtilizador,
  atualizarUtilizador,
  removerUtilizador,
  recarregarDados,
} = utilizadoresStore;

// Estados locais
const modalVisible = ref(false);
const perfilModalVisible = ref(false);
const editandoId = ref<number | null>(null);
const utilizadorPerfil = ref<Utilizador | null>(null);

const errors = reactive({ nome: '', email: '', tipo: '' });

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  tipo: 'cliente' as 'cliente' | 'prestador' | 'admin' | 'root',
  profissao: '',
  sobre: '',
});

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

// Computed - DADOS REAIS DA STORE
const totalUtilizadores = computed(() => utilizadores.value.length);
const utilizadoresVerificados = computed(
  () => utilizadores.value.filter((u) => u.verificado).length,
);
const utilizadoresPendentes = computed(
  () => utilizadores.value.filter((u) => !u.verificado).length,
);
const totalPrestadores = computed(
  () => utilizadores.value.filter((u) => u.tipo === 'prestador').length,
);
const totalClientes = computed(() => utilizadores.value.filter((u) => u.tipo === 'cliente').length);
const totalAdmins = computed(
  () => utilizadores.value.filter((u) => u.tipo === 'admin' || u.tipo === 'root').length,
);
const totalRoot = computed(() => utilizadores.value.filter((u) => u.tipo === 'root').length);
const totalAdminOnly = computed(() => utilizadores.value.filter((u) => u.tipo === 'admin').length);

// Projeção de Crescimento
const projecaoCrescimento = computed(() => {
  const taxas = {
    cliente: Math.min(15, Math.floor(totalClientes.value * 0.12) + 5),
    prestador: Math.min(20, Math.floor(totalPrestadores.value * 0.15) + 8),
    admin: Math.min(8, Math.floor(totalAdminOnly.value * 0.08) + 2),
    root: Math.min(5, Math.floor(totalRoot.value * 0.05) + 1),
  };

  const cores = {
    cliente: '#3B82F6',
    prestador: '#8B5CF6',
    admin: '#EF4444',
    root: '#1F2937',
  };

  const icons = {
    cliente: 'people',
    prestador: 'handyman',
    admin: 'admin_panel_settings',
    root: 'verified',
  };

  const labels = {
    cliente: 'Clientes',
    prestador: 'Prestadores',
    admin: 'Administradores',
    root: 'Root',
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
      atual: totalAdminOnly.value,
      projecao: Math.floor(totalAdminOnly.value * (1 + taxas.admin / 100)),
      percentualCrescimento: taxas.admin,
      cor: cores.admin,
    },
    {
      tipo: 'root',
      label: labels.root,
      icon: icons.root,
      atual: totalRoot.value,
      projecao: Math.floor(totalRoot.value * (1 + taxas.root / 100)),
      percentualCrescimento: taxas.root,
      cor: cores.root,
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
  const offset = (percentualAcumulado / 100) * circunferencia;
  return String(-offset);
};

const calcularPercentualVerificados = (): number => {
  if (totalUtilizadores.value === 0) return 0;
  return Math.round((utilizadoresVerificados.value / totalUtilizadores.value) * 100);
};

const calcularPercentualPendentes = (): number => {
  if (totalUtilizadores.value === 0) return 0;
  return Math.round((utilizadoresPendentes.value / totalUtilizadores.value) * 100);
};

// Funções auxiliares
const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num);

const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'prestador':
      return 'purple';
    case 'admin':
      return 'red';
    case 'root':
      return 'dark';
    default:
      return 'blue';
  }
};

const getTipoLabel = (tipo: string): string => {
  switch (tipo) {
    case 'prestador':
      return 'Prestador';
    case 'admin':
      return 'Administrador';
    case 'root':
      return 'Root';
    default:
      return 'Cliente';
  }
};

const getTipoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'prestador':
      return 'handyman';
    case 'admin':
      return 'admin_panel_settings';
    case 'root':
      return 'verified';
    default:
      return 'person';
  }
};

const getPerfilGradient = (tipo: string): string => {
  switch (tipo) {
    case 'prestador':
      return '#667EEA';
    case 'admin':
      return '#EF4444';
    case 'root':
      return '#1F2937';
    default:
      return '#10B981';
  }
};

const getStatusColor = (verificado?: boolean): string => (verificado ? 'green' : 'orange');
const getAvatarUrl = (nome: string): string =>
  `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=120&name=${encodeURIComponent(nome)}`;
const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const validarForm = (): boolean => {
  let isValid = true;
  errors.nome = '';
  errors.email = '';
  errors.tipo = '';

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  }
  if (!form.email.trim()) {
    errors.email = 'Email é obrigatório';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email inválido';
    isValid = false;
  }
  if (!form.tipo) {
    errors.tipo = 'Tipo é obrigatório';
    isValid = false;
  }
  return isValid;
};

const tableColumns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left' as const,
    sortable: true,
    style: 'width: 60px',
  },
  {
    name: 'nome',
    label: 'Utilizador',
    field: 'nome',
    align: 'left' as const,
    style: 'min-width: 200px',
  },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, style: 'width: 200px' },
  {
    name: 'telefone',
    label: 'Telefone',
    field: 'telefone',
    align: 'left' as const,
    style: 'width: 120px',
  },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const, style: 'width: 120px' },
  {
    name: 'verificado',
    label: 'Status',
    field: 'verificado',
    align: 'center' as const,
    style: 'width: 100px',
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: 'acoes',
    align: 'center' as const,
    style: 'width: 120px',
  },
];

// Handlers - SEM await no notify e SEM parâmetros de erro não usados
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('tipo', filtros.value.tipo);
  setFiltro('verificado', filtros.value.verificado);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

const handleRecarregar = (): void => {
  void recarregarDados();
};

const editarUtilizador = (user: Utilizador): void => {
  editandoId.value = user.id;
  form.nome = user.nome;
  form.email = user.email;
  form.telefone = user.telefone || '';
  form.tipo = user.tipo;
  form.profissao = user.profissao || '';
  form.sobre = user.sobre || '';
  modalVisible.value = true;
};

const salvarUtilizador = async (): Promise<void> => {
  if (!validarForm()) return;

  try {
    const result = await atualizarUtilizador(editandoId.value!, {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || '',
      tipo: form.tipo,
      profissao: form.profissao || '',
      sobre: form.sobre || '',
    });

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Utilizador atualizado com sucesso!',
        position: 'top',
      });
      modalVisible.value = false;
      await carregarUtilizadores(true);
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar utilizador',
      position: 'top',
    });
  }
};

const fecharModal = (): void => {
  modalVisible.value = false;
  editandoId.value = null;
};

const abrirPerfil = async (user: Utilizador): Promise<void> => {
  try {
    const dados = await buscarUtilizador(user.id);
    if (dados) {
      utilizadorPerfil.value = dados;
      perfilModalVisible.value = true;
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perfil',
      position: 'top',
    });
  }
};

const editarDoPerfil = (): void => {
  if (utilizadorPerfil.value) {
    perfilModalVisible.value = false;
    editarUtilizador(utilizadorPerfil.value);
  }
};

const abrirConfirmacaoExclusao = (user: Utilizador): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o utilizador "${user.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
  }).onOk(() => {
    void executarExclusao(user);
  });
};

const executarExclusao = async (user: Utilizador): Promise<void> => {
  try {
    const success = await removerUtilizador(user.id);
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Utilizador excluído com sucesso!',
        position: 'top',
      });
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir utilizador',
      position: 'top',
    });
  }
};

// Lifecycle
onMounted(() => {
  void carregarUtilizadores();
});
</script>
<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions .search-input {
    width: 300px;
  }
}

.dashboard-top {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.cards-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;

    &.blue {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    &.green {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    &.orange {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }
    &.purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }
    &.teal {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      color: white;
    }
    &.indigo {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }
  }

  .stat-info {
    flex: 1;
    z-index: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: #1a1a2e;
    }

    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-top: 6px;

      &.positive {
        color: #10b981;
      }
      &.warning {
        color: #f59e0b;
      }
    }
  }

  .stat-bg-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    opacity: 0.06;
    z-index: 0;

    :deep(.q-icon) {
      font-size: 80px;
    }
  }
}

.donut-card {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  .donut-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .donut-total {
      font-size: 13px;
      color: #667eea;
      font-weight: 600;
    }
  }

  .donut-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    .donut-chart {
      width: 180px;
      height: 180px;
    }
  }

  .donut-legend {
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-bottom: 8px;

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }

      strong {
        margin-left: auto;
      }

      .percent {
        color: #9ca3af;
        margin-left: 4px;
      }
    }
  }
}

// PROJEÇÃO DE CRESCIMENTO
.growth-section-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #1a1a2e;
      }
    }
  }

  .growth-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .growth-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #f0f0f0;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }

      .growth-icon {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .growth-info {
        .growth-label {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .growth-values {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;

          .current-value,
          .projected-value {
            display: flex;
            flex-direction: column;
            align-items: center;

            .label {
              font-size: 10px;
              color: #9ca3af;
              margin-bottom: 4px;
            }

            .value {
              font-size: 20px;
              font-weight: 700;
              color: #374151;
            }
          }

          .projected-value .value {
            color: #667eea;
          }

          .arrow-icon {
            color: #9ca3af;
          }
        }

        .growth-bar-container {
          height: 32px;
          background: #f3f4f6;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;

          .growth-bar {
            height: 100%;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 12px;
            transition: width 0.5s ease;

            .growth-percent-value {
              font-size: 12px;
              font-weight: 700;
              color: white;
            }
          }
        }

        .growth-footer {
          display: flex;
          align-items: center;
          gap: 6px;

          .growth-text {
            font-size: 11px;
            color: #10b981;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
}

.user-cell {
  display: flex;
  align-items: center;

  .user-name {
    font-weight: 600;
  }

  .user-email {
    font-size: 12px;
    color: #9ca3af;
  }
}

.acoes-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin-top: 20px;

  .pagination-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0;
}

.modal-actions {
  padding: 12px 20px 20px;
  border-top: 1px solid #e5e7eb;
}

.perfil-header {
  text-align: center;
  padding: 24px;
  color: white;
  border-radius: 20px 20px 0 0;

  .perfil-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;

    .status-badge {
      position: absolute;
      bottom: 4px;
      right: -4px;
    }
  }

  .perfil-nome {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .tipo-badge {
    font-size: 12px;
    padding: 4px 12px;
  }
}

.perfil-body {
  padding: 20px;

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .info-icon {
      color: #667eea;
      margin-top: 2px;
    }

    .info-content {
      flex: 1;

      .info-label {
        font-size: 11px;
        color: #9ca3af;
        margin-bottom: 2px;
      }

      .info-value {
        font-size: 13px;
        color: #1a1a2e;
      }
    }
  }
}

.perfil-actions {
  padding: 12px 20px 20px;
  border-top: 1px solid #e5e7eb;
}

.custom-table {
  border-radius: 16px;
  overflow: hidden;
}

.tipo-badge,
.status-badge {
  padding: 6px 12px;
}

@media (max-width: 1200px) {
  .dashboard-top {
    flex-direction: column;
  }
  .cards-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .growth-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .cards-row {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;

    .header-actions .search-input {
      width: 100%;
    }
  }
  .filters-bar {
    flex-direction: column;

    .filter-select {
      width: 100%;
    }
  }
  .growth-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
