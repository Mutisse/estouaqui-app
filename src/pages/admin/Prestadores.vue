<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Prestadores</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por nome, email ou profissão..."
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
      <!-- Cards lado esquerdo - 2 linhas de 3 cards -->
      <div class="cards-container">
        <!-- Linha 1: 3 cards -->
        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon blue">
              <q-icon name="handyman" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalPrestadores) }}</div>
              <div class="stat-label">Total Prestadores</div>
              <div class="stat-trend">
                <q-icon name="trending_up" size="12px" />
                <span>+12% este mês</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <q-icon name="verified" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(prestadoresVerificados) }}</div>
              <div class="stat-label">Verificados</div>
              <div class="stat-trend">
                <q-icon name="check_circle" size="12px" />
                <span>{{ calcularPercentualVerificados() }}% do total</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <q-icon name="pending" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(prestadoresPendentes) }}</div>
              <div class="stat-label">Pendentes</div>
              <div class="stat-trend" v-if="prestadoresPendentes > 0">
                <q-icon name="schedule" size="12px" />
                <span>Aguardando</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Linha 2: 3 cards -->
        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-icon purple">
              <q-icon name="star" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ mediaAvaliacaoGlobal.toFixed(1) }}</div>
              <div class="stat-label">Média Avaliações</div>
              <div class="stat-trend">
                <q-icon name="star" size="12px" />
                <span>{{ formatNumber(totalAvaliacoes) }} avaliações</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon teal">
              <q-icon name="online_prediction" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(prestadoresDisponiveis) }}</div>
              <div class="stat-label">Disponíveis</div>
              <div class="stat-trend">
                <q-icon name="check_circle" size="12px" />
                <span
                  >{{ Math.round((prestadoresDisponiveis / totalPrestadores) * 100) || 0 }}%
                  ativos</span
                >
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon indigo">
              <q-icon name="category" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(totalProfissoes) }}</div>
              <div class="stat-label">Profissões</div>
              <div class="stat-trend">
                <q-icon name="trending_up" size="12px" />
                <span>Categorias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut Chart lado direito -->
      <div class="donut-card">
        <div class="donut-header">
          <h3>📊 Distribuição de Status</h3>
          <span class="donut-total">{{ totalPrestadores }} prestadores</span>
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
                :stroke-dasharray="calcularDashArray(prestadoresVerificados)"
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
                :stroke-dasharray="calcularDashArray(prestadoresPendentes)"
                :stroke-dashoffset="calcularOffset(prestadoresVerificados)"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#3B82F6"
                stroke-width="20"
                :stroke-dasharray="calcularDashArray(prestadoresDisponiveis)"
                :stroke-dashoffset="calcularOffset(prestadoresVerificados + prestadoresPendentes)"
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
                {{ totalPrestadores }}
              </text>
            </svg>
          </div>
        </div>
        <div class="donut-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #10b981"></span>
            <span>Verificados</span>
            <strong>{{ formatNumber(prestadoresVerificados) }}</strong>
            <span class="percent">({{ calcularPercentualVerificados() }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #f59e0b"></span>
            <span>Pendentes</span>
            <strong>{{ formatNumber(prestadoresPendentes) }}</strong>
            <span class="percent">({{ calcularPercentualPendentes() }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #3b82f6"></span>
            <span>Disponíveis</span>
            <strong>{{ formatNumber(prestadoresDisponiveis) }}</strong>
            <span class="percent">({{ calcularPercentualDisponiveis() }}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 gráficos lado a lado: Top Profissões (esquerda) + Distribuição Avaliações (direita) -->
    <div class="charts-bottom-row">
      <!-- Top Profissões -->
      <div class="top-profissoes-card">
        <div class="card-header">
          <h3>🏆 Top Profissões</h3>
          <q-icon name="bar_chart" size="20px" color="primary" />
        </div>
        <div class="top-profissoes-list">
          <div
            v-for="(profissao, index) in topProfissoes"
            :key="profissao[0]"
            class="profissao-item"
          >
            <div class="profissao-rank">{{ index + 1 }}º</div>
            <div class="profissao-name">{{ profissao[0] }}</div>
            <div class="profissao-bar-container">
              <div
                class="profissao-bar"
                :style="{ width: (profissao[1] / totalPrestadores) * 100 + '%' }"
              ></div>
            </div>
            <div class="profissao-count">{{ formatNumber(profissao[1]) }}</div>
            <div class="profissao-percent">
              {{ Math.round((profissao[1] / totalPrestadores) * 100) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Distribuição de Avaliações -->
      <div class="rating-card">
        <div class="card-header">
          <h3>⭐ Distribuição de Avaliações</h3>
          <q-icon name="star" size="20px" color="warning" />
        </div>
        <div class="rating-stats">
          <div class="rating-item" v-for="nota in [5, 4, 3, 2, 1]" :key="nota">
            <span class="rating-stars">
              <q-icon v-for="n in nota" :key="n" name="star" size="16px" color="amber" />
            </span>
            <div class="rating-bar-container">
              <div
                class="rating-bar"
                :style="{
                  width: getPercentualPorNota(nota) + '%',
                  background: getCorPorNota(nota),
                }"
              ></div>
            </div>
            <span class="rating-count">{{ formatNumber(getQuantidadePorNota(nota)) }}</span>
            <span class="rating-percent">{{ getPercentualPorNota(nota).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
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
      <q-select
        v-model="filtros.profissao"
        :options="opcoesProfissao"
        label="Profissão"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <div class="actions-bar">
      <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando prestadores...</p>
    </div>

    <q-table v-else :rows="prestadores" :columns="tableColumns" row-key="id" flat bordered>
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

      <!-- ✅ CORRIGIDO: Number() para converter string em número -->
      <template v-slot:body-cell-media_avaliacao="props">
        <q-td :props="props">
          <div class="rating-cell">
            <q-rating
              :model-value="Number(props.row.media_avaliacao)"
              readonly
              size="16px"
              max="5"
            />
            <span class="rating-count">({{ props.row.total_avaliacoes || 0 }})</span>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-verificado="props">
        <q-td :props="props">
          <q-badge :color="props.row.verificado ? 'green' : 'orange'">
            {{ props.row.verificado ? 'Verificado' : 'Pendente' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-disponivel="props">
        <q-td :props="props">
          <q-badge :color="props.row.disponivel ? 'green' : 'red'">
            {{ props.row.disponivel ? 'Disponível' : 'Indisponível' }}
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
              @click="() => handleAbrirPerfil(props.row)"
              title="Ver"
            />
            <q-btn
              v-if="!props.row.verificado"
              flat
              round
              icon="verified"
              color="primary"
              size="sm"
              @click="() => handleConfirmarVerificacao(props.row)"
              title="Verificar"
            />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="() => handleConfirmarExclusao(props.row)"
              title="Excluir"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => handleMudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{
              paginacao.total
            }}
            registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => handleMudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>
    </q-table>

    <!-- Modal Mini-Perfil -->
    <q-dialog v-model="perfilModalVisible" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 380px; max-width: 450px; border-radius: 20px">
        <q-card-section
          class="perfil-header"
          :style="{
            background: `linear-gradient(135deg, ${prestadorPerfil?.verificado ? '#10B981' : '#667EEA'}, #1a1a2e)`,
          }"
        >
          <div class="perfil-avatar">
            <q-avatar size="80px">
              <img :src="getAvatarUrl(prestadorPerfil?.nome || '')" />
            </q-avatar>
            <q-badge :color="prestadorPerfil?.verificado ? 'green' : 'orange'" class="status-badge">
              {{ prestadorPerfil?.verificado ? 'Verificado' : 'Pendente' }}
            </q-badge>
          </div>
          <div class="perfil-nome">{{ prestadorPerfil?.nome }}</div>
          <div class="perfil-profissao">
            {{ prestadorPerfil?.profissao || 'Profissão não informada' }}
          </div>
        </q-card-section>

        <q-card-section class="perfil-body">
          <div class="info-grid">
            <div class="info-item">
              <q-icon name="email" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Email</div>
                <div class="info-value">{{ prestadorPerfil?.email }}</div>
              </div>
            </div>
            <div class="info-item">
              <q-icon name="phone" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Telefone</div>
                <div class="info-value">{{ prestadorPerfil?.telefone || 'Não informado' }}</div>
              </div>
            </div>
            <div class="info-item">
              <q-icon name="calendar_today" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Registo</div>
                <div class="info-value">{{ formatarData(prestadorPerfil?.created_at) }}</div>
              </div>
            </div>
            <!-- ✅ CORRIGIDO: Number() no rating do modal -->
            <div class="info-item">
              <q-icon name="star" size="18px" class="info-icon" />
              <div class="info-content">
                <div class="info-label">Avaliação</div>
                <div class="info-value">
                  <q-rating
                    :model-value="Number(avaliacaoTemp)"
                    readonly
                    size="16px"
                    max="5"
                  />
                  <span class="rating-count">({{ prestadorPerfil?.total_avaliacoes || 0 }})</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="perfil-actions">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn
            v-if="!prestadorPerfil?.verificado"
            flat
            label="Verificar"
            color="green"
            @click="handleConfirmarVerificacaoPerfil"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminPrestadoresStore } from 'src/stores/admin/admin-prestadores-store';
import type { Prestador } from 'src/stores/admin/admin-prestadores-store';

defineOptions({ name: 'AdminPrestadores' });

const $q = useQuasar();
const prestadoresStore = useAdminPrestadoresStore();

const {
  isLoading,
  prestadores,
  paginacao,
  filtros,
  opcoesProfissao,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(prestadoresStore);

const {
  carregarPrestadores,
  setFiltro,
  limparFiltros,
  mudarPagina,
  buscarPrestador,
  verificarPrestador,
  excluirPrestador,
  carregarOpcoesProfissao,
  recarregarDados,
} = prestadoresStore;

// Estados locais
const perfilModalVisible = ref(false);
const prestadorPerfil = ref<Prestador | null>(null);
const avaliacaoTemp = ref(0);

const verificadoOptions = [
  { label: 'Verificados', value: 'sim' },
  { label: 'Não verificados', value: 'nao' },
];

// Computed
const totalPrestadores = computed(() => prestadores.value.length);
const prestadoresVerificados = computed(() => prestadores.value.filter((p) => p.verificado).length);
const prestadoresPendentes = computed(() => prestadores.value.filter((p) => !p.verificado).length);
const prestadoresDisponiveis = computed(() => prestadores.value.filter((p) => p.disponivel).length);
const totalAvaliacoes = computed(() =>
  prestadores.value.reduce((acc, p) => acc + (p.total_avaliacoes || 0), 0),
);
const mediaAvaliacaoGlobal = computed(() => {
  if (totalAvaliacoes.value === 0) return 0;
  const somaNotas = prestadores.value.reduce(
    (acc, p) => acc + p.media_avaliacao * (p.total_avaliacoes || 0),
    0,
  );
  return somaNotas / totalAvaliacoes.value;
});
const totalProfissoes = computed(() => {
  const profissoes = new Set(prestadores.value.map((p) => p.profissao).filter(Boolean));
  return profissoes.size;
});

const topProfissoes = computed(() => {
  const contagem: Record<string, number> = {};
  prestadores.value.forEach((p) => {
    if (p.profissao) {
      contagem[p.profissao] = (contagem[p.profissao] || 0) + 1;
    }
  });
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

const distribuicaoAvaliacoes = computed(() => {
  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  prestadores.value.forEach((p) => {
    const nota = Math.round(p.media_avaliacao);
    if (nota >= 1 && nota <= 5) {
      distribuicao[nota as keyof typeof distribuicao]++;
    }
  });
  return distribuicao;
});

const getQuantidadePorNota = (nota: number): number => {
  return distribuicaoAvaliacoes.value[nota as keyof typeof distribuicaoAvaliacoes.value] || 0;
};

const getPercentualPorNota = (nota: number): number => {
  if (totalPrestadores.value === 0) return 0;
  return (getQuantidadePorNota(nota) / totalPrestadores.value) * 100;
};

const getCorPorNota = (nota: number): string => {
  const cores = { 5: '#10B981', 4: '#3B82F6', 3: '#8B5CF6', 2: '#F59E0B', 1: '#EF4444' };
  return cores[nota as keyof typeof cores] || '#9CA3AF';
};

// Donut chart functions
const circunferencia = 2 * Math.PI * 50;
const calcularDashArray = (valor: number): string => {
  if (totalPrestadores.value === 0) return `0 ${circunferencia}`;
  const percentual = (valor / totalPrestadores.value) * 100;
  const dashLength = (percentual / 100) * circunferencia;
  return `${dashLength} ${circunferencia - dashLength}`;
};

const calcularOffset = (valorAcumulado: number): string => {
  if (totalPrestadores.value === 0) return '0';
  const percentualAcumulado = (valorAcumulado / totalPrestadores.value) * 100;
  const offset = (percentualAcumulado / 100) * circunferencia;
  return String(-offset);
};

const calcularPercentualVerificados = (): number => {
  if (totalPrestadores.value === 0) return 0;
  return Math.round((prestadoresVerificados.value / totalPrestadores.value) * 100);
};

const calcularPercentualPendentes = (): number => {
  if (totalPrestadores.value === 0) return 0;
  return Math.round((prestadoresPendentes.value / totalPrestadores.value) * 100);
};

const calcularPercentualDisponiveis = (): number => {
  if (totalPrestadores.value === 0) return 0;
  return Math.round((prestadoresDisponiveis.value / totalPrestadores.value) * 100);
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
    label: 'Prestador',
    field: 'nome',
    align: 'left' as const,
    style: 'min-width: 200px',
  },
  {
    name: 'profissao',
    label: 'Profissão',
    field: 'profissao',
    align: 'left' as const,
    style: 'width: 150px',
  },
  {
    name: 'telefone',
    label: 'Telefone',
    field: 'telefone',
    align: 'left' as const,
    style: 'width: 120px',
  },
  {
    name: 'media_avaliacao',
    label: 'Avaliação',
    field: 'media_avaliacao',
    align: 'center' as const,
    style: 'width: 120px',
  },
  {
    name: 'verificado',
    label: 'Status',
    field: 'verificado',
    align: 'center' as const,
    style: 'width: 100px',
  },
  {
    name: 'disponivel',
    label: 'Disponível',
    field: 'disponivel',
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

// Helpers
const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num);
const getAvatarUrl = (nome: string): string =>
  `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=120&name=${encodeURIComponent(nome)}`;
const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Handlers
const onSearchChange = (value: string | number | null): void =>
  setFiltro('search', String(value ?? ''));
const onFiltroChange = (): void => {
  setFiltro('verificado', filtros.value.verificado);
  setFiltro('profissao', filtros.value.profissao);
};
const handleLimparFiltros = (): void => limparFiltros();
const handleMudarPagina = (page: number): void => mudarPagina(page);
const handleRecarregar = (): void => {
  void recarregarDados();
};

const handleAbrirPerfil = (prestador: Prestador): void => {
  void buscarPrestador(prestador.id).then((dados) => {
    if (dados) {
      prestadorPerfil.value = dados;
      avaliacaoTemp.value = dados.media_avaliacao || 0;
      perfilModalVisible.value = true;
    }
  });
};

const handleConfirmarVerificacao = (prestador: Prestador): void => {
  $q.dialog({
    title: 'Verificar prestador',
    message: `Deseja verificar o prestador "${prestador.nome}"?`,
    cancel: true,
    ok: { label: 'Verificar', color: 'green' },
  }).onOk(() => {
    void verificarPrestador(prestador.id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Prestador verificado com sucesso!' });
        void recarregarDados();
        if (prestadorPerfil.value && prestadorPerfil.value.id === prestador.id) {
          prestadorPerfil.value.verificado = true;
        }
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao verificar prestador' });
      }
    });
  });
};

const handleConfirmarVerificacaoPerfil = (): void => {
  if (!prestadorPerfil.value) return;
  $q.dialog({
    title: 'Verificar prestador',
    message: `Deseja verificar o prestador "${prestadorPerfil.value.nome}"?`,
    cancel: true,
    ok: { label: 'Verificar', color: 'green' },
  }).onOk(() => {
    void verificarPrestador(prestadorPerfil.value!.id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Prestador verificado com sucesso!' });
        void recarregarDados();
        if (prestadorPerfil.value) prestadorPerfil.value.verificado = true;
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao verificar prestador' });
      }
    });
  });
};

const handleConfirmarExclusao = (prestador: Prestador): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o prestador "${prestador.nome}"?`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void excluirPrestador(prestador.id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Prestador excluído!' });
        if (perfilModalVisible.value) perfilModalVisible.value = false;
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao excluir prestador' });
      }
    });
  });
};

onMounted(() => {
  void carregarPrestadores();
  void carregarOpcoesProfissao();
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

// Dashboard top: cards (esquerda) + donut (direita)
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

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
      color: #10b981;
      margin-top: 6px;
    }
  }
}

// Donut Card
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

// 2 gráficos lado a lado
.charts-bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

// Top Profissões
.top-profissoes-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .top-profissoes-list {
    .profissao-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .profissao-rank {
        width: 32px;
        font-weight: 700;
        color: #667eea;
      }

      .profissao-name {
        width: 100px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .profissao-bar-container {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;

        .profissao-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      }

      .profissao-count {
        width: 45px;
        text-align: right;
        font-weight: 600;
        font-size: 13px;
      }

      .profissao-percent {
        width: 40px;
        text-align: right;
        color: #6b7280;
        font-size: 11px;
      }
    }
  }
}

// Rating Card
.rating-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .rating-stats {
    .rating-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .rating-stars {
        width: 70px;
        display: flex;
        gap: 2px;
      }

      .rating-bar-container {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;

        .rating-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      }

      .rating-count {
        width: 45px;
        text-align: right;
        font-weight: 600;
        font-size: 13px;
      }

      .rating-percent {
        width: 45px;
        text-align: right;
        color: #6b7280;
        font-size: 11px;
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

.actions-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
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
}
.user-name {
  font-weight: 600;
}
.user-email {
  font-size: 12px;
  color: #9ca3af;
}
.rating-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rating-count {
  font-size: 11px;
  color: #9ca3af;
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
}

.perfil-header {
  text-align: center;
  padding: 24px;
  color: white;
  border-radius: 20px 20px 0 0;
}

.perfil-body {
  padding: 20px;
}
.perfil-actions {
  padding: 12px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1200px) {
  .dashboard-top {
    flex-direction: column;
  }
  .cards-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cards-row {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
  }
  .page-header .header-actions .search-input {
    width: 100%;
  }
  .filters-bar {
    flex-direction: column;
  }
  .filters-bar .filter-select {
    width: 100%;
  }
}
</style>
