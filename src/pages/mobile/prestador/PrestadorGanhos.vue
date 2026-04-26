<template>
  <q-page class="prestador-ganhos bg-grey-1">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-menu-btn"></div>
      </div>
      <div class="skeleton-saldo-card q-pa-md">
        <div class="skeleton-saldo-inner"></div>
      </div>
      <div class="skeleton-filtros">
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
        <div class="skeleton-filter-btn"></div>
      </div>
      <div class="skeleton-resumo q-px-md">
        <div class="row q-col-gutter-sm">
          <div v-for="i in 3" :key="i" class="col-4">
            <div class="skeleton-resumo-card"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-grafico q-px-md q-mb-md">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-grafico-card">
          <div class="skeleton-grafico-barras">
            <div v-for="i in 6" :key="i" class="skeleton-barra"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-historico q-pa-md">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-list-info">
              <div class="skeleton-line w-50"></div>
              <div class="skeleton-line w-30"></div>
            </div>
            <div class="skeleton-badge"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-estatisticas q-pa-md">
        <div class="skeleton-section-header"></div>
        <div class="row q-col-gutter-sm">
          <div v-for="i in 4" :key="i" class="col-12 col-md-6">
            <div class="skeleton-estatistica-card"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo original -->
    <template v-else>
      <!-- Cabeçalho -->
      <div class="page-header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="router.back()" />
        <div class="text-h5 text-bold">Meus Ganhos</div>
        <q-btn flat round icon="more_vert" @click="opcoes" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="48px" />
        <div class="text-grey-6 q-mt-md">Carregando dados...</div>
      </div>

      <template v-else>
        <!-- Saldo atual -->
        <div class="saldo-card q-pa-md">
          <q-card flat bordered class="saldo-card-inner">
            <q-card-section class="text-center">
              <div class="saldo-label">Saldo disponível</div>
              <div class="saldo-valor">{{ formatarValor(saldoDisponivel) }} MZN</div>
              <q-btn
                unelevated
                color="primary"
                label="Realizar saque"
                class="q-mt-md saque-btn"
                @click="irParaSaques"
                no-caps
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Filtros de período -->
        <div class="filtros-periodo q-px-md q-mb-md">
          <q-btn-toggle
            v-model="periodo"
            toggle-color="primary"
            :options="[
              { label: 'Hoje', value: 'hoje' },
              { label: 'Semana', value: 'semana' },
              { label: 'Mês', value: 'mes' },
              { label: 'Ano', value: 'ano' },
            ]"
            @update:model-value="carregarDados"
          />
        </div>

        <!-- Resumo de ganhos -->
        <div class="resumo-ganhos q-px-md q-mb-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-card class="resumo-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="resumo-valor">{{ resumo.totalServicos }}</div>
                  <div class="resumo-label">Serviços</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="resumo-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="resumo-valor">{{ formatarValor(resumo.ganhosPeriodo) }}</div>
                  <div class="resumo-label">Ganhos</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="resumo-card" flat bordered>
                <q-card-section class="text-center">
                  <div class="resumo-valor">{{ formatarValor(resumo.media) }}</div>
                  <div class="resumo-label">Média</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Gráfico de ganhos -->
        <div class="grafico-section q-px-md q-mb-md">
          <div class="section-header">
            <div class="section-title">Evolução de ganhos</div>
          </div>
          <q-card flat bordered class="grafico-card">
            <q-card-section>
              <div v-if="graficoData.length === 0" class="text-center q-py-lg">
                <q-icon name="bar_chart" size="48px" color="grey-4" />
                <div class="text-grey-6 q-mt-sm">Nenhum dado disponível</div>
              </div>
              <div v-else class="grafico-barras">
                <div v-for="(item, index) in graficoData" :key="index" class="barra-item">
                  <div class="barra-label">{{ item.label }}</div>
                  <div class="barra-container">
                    <div
                      class="barra"
                      :style="{ height: item.altura + 'px', backgroundColor: item.cor }"
                    ></div>
                  </div>
                  <div class="barra-valor">{{ formatarValor(item.valor) }}k</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Histórico de ganhos -->
        <div class="historico-ganhos q-pa-md">
          <div class="section-header">
            <div class="section-title">Últimos ganhos</div>
            <q-btn flat dense label="Ver todos" icon="chevron_right" @click="verTodos" />
          </div>

          <div v-if="historicoGanhos.length === 0" class="empty-state q-pa-md text-center">
            <q-icon name="payments" size="48px" color="grey-4" />
            <div class="text-grey-6 q-mt-sm">Nenhum ganho registrado</div>
          </div>

          <q-list v-else bordered separator class="historico-list">
            <q-item v-for="ganho in historicoGanhos" :key="ganho.id" class="ganho-item">
              <q-item-section avatar>
                <q-avatar :color="ganho.cor" text-color="white" size="40px">
                  <q-icon :name="ganho.icone" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ ganho.cliente }}</q-item-label>
                <q-item-label caption>{{ ganho.servico }} • {{ ganho.data }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="ganho-valor text-positive">{{ formatarValor(ganho.valor) }} MZN</div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Estatísticas detalhadas -->
        <div class="estatisticas-detalhadas q-pa-md q-mt-md">
          <div class="section-header">
            <div class="section-title">Estatísticas Detalhadas</div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="estatistica-card">
                <q-card-section>
                  <div class="estatistica-titulo">Melhor mês</div>
                  <div class="estatistica-valor">{{ estatisticas.melhorMes.mes }}</div>
                  <div class="estatistica-sub">
                    {{ formatarValor(estatisticas.melhorMes.valor) }} MZN
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="estatistica-card">
                <q-card-section>
                  <div class="estatistica-titulo">Serviço mais requisitado</div>
                  <div class="estatistica-valor">{{ estatisticas.servicoMaisRequisitado.nome }}</div>
                  <div class="estatistica-sub">
                    {{ estatisticas.servicoMaisRequisitado.quantidade }} serviços
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="estatistica-card">
                <q-card-section>
                  <div class="estatistica-titulo">Melhor cliente</div>
                  <div class="estatistica-valor">{{ estatisticas.melhorCliente.nome }}</div>
                  <div class="estatistica-sub">
                    {{ formatarValor(estatisticas.melhorCliente.totalGasto) }} MZN gastos
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="estatistica-card">
                <q-card-section>
                  <div class="estatistica-titulo">Média por serviço</div>
                  <div class="estatistica-valor">
                    {{ formatarValor(estatisticas.mediaPorServico) }} MZN
                  </div>
                  <div class="estatistica-sub">
                    {{ estatisticas.totalServicos }} serviços realizados
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- Botão flutuante para estatísticas -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="bar_chart" color="primary" @click="scrollParaEstatisticas">
        <q-tooltip>Ver estatísticas detalhadas</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore } from 'src/stores/prestador-store';
import type { SolicitacaoData, ServicoTipoOptionData } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorGanhos',
});

interface GanhoHistorico {
  id: number;
  cliente: string;
  servico: string;
  data: string;
  valor: number;
  icone: string;
  cor: string;
}

interface ResumoGanhos {
  totalServicos: number;
  ganhosPeriodo: number;
  media: number;
}

interface GraficoItem {
  label: string;
  valor: number;
  altura: number;
  cor: string;
}

interface Estatisticas {
  melhorMes: {
    mes: string;
    valor: number;
  };
  servicoMaisRequisitado: {
    nome: string;
    quantidade: number;
  };
  melhorCliente: {
    nome: string;
    totalGasto: number;
  };
  mediaPorServico: number;
  totalServicos: number;
}

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const carregamentoInicial = ref(true);
const loading = ref(true);
const periodo = ref('mes');
const saldoDisponivel = ref(0);
const historicoGanhos = ref<GanhoHistorico[]>([]);
const resumo = ref<ResumoGanhos>({
  totalServicos: 0,
  ganhosPeriodo: 0,
  media: 0,
});
const graficoData = ref<GraficoItem[]>([]);
const estatisticas = ref<Estatisticas>({
  melhorMes: { mes: '--', valor: 0 },
  servicoMaisRequisitado: { nome: '--', quantidade: 0 },
  melhorCliente: { nome: '--', totalGasto: 0 },
  mediaPorServico: 0,
  totalServicos: 0,
});

const servicoTiposMap = new Map<string, { icone: string; cor: string }>();
const coresGrafico: string[] = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatarData = (dataString: string) => {
  const date = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (date.toDateString() === hoje.toDateString()) {
    return `Hoje, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (date.toDateString() === ontem.toDateString()) {
    return `Ontem, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getIconePorServico = (servicoNome: string): string => {
  const nome = servicoNome.toLowerCase();
  for (const [key, value] of servicoTiposMap) {
    if (nome.includes(key)) {
      return value.icone;
    }
  }
  return 'handyman';
};

const getCorPorServico = (servicoNome: string): string => {
  const nome = servicoNome.toLowerCase();
  for (const [key, value] of servicoTiposMap) {
    if (nome.includes(key)) {
      return value.cor;
    }
  }
  return 'grey-7';
};

const calcularEstatisticas = (pedidos: SolicitacaoData[]) => {
  const ganhosPorMes: Record<string, number> = {};
  pedidos.forEach((p) => {
    const data = new Date(p.data);
    const mesAno = `${data.toLocaleDateString('pt-PT', { month: 'long' })} ${data.getFullYear()}`;
    ganhosPorMes[mesAno] = (ganhosPorMes[mesAno] || 0) + p.valor;
  });

  let melhorMes = { mes: '--', valor: 0 };
  Object.entries(ganhosPorMes).forEach(([mes, valor]) => {
    if (valor > melhorMes.valor) {
      melhorMes = { mes, valor };
    }
  });

  const servicosCount: Record<string, number> = {};
  pedidos.forEach((p) => {
    const nomeServico = p.servico?.nome || 'Serviço';
    servicosCount[nomeServico] = (servicosCount[nomeServico] || 0) + 1;
  });

  let servicoMaisRequisitado = { nome: '--', quantidade: 0 };
  Object.entries(servicosCount).forEach(([nome, quantidade]) => {
    if (quantidade > servicoMaisRequisitado.quantidade) {
      servicoMaisRequisitado = { nome, quantidade };
    }
  });

  const gastosPorCliente: Record<string, { nome: string; total: number }> = {};
  pedidos.forEach((p) => {
    const clienteNome = p.cliente?.nome || 'Cliente';
    if (!gastosPorCliente[clienteNome]) {
      gastosPorCliente[clienteNome] = { nome: clienteNome, total: 0 };
    }
    gastosPorCliente[clienteNome].total += p.valor;
  });

  let melhorCliente = { nome: '--', totalGasto: 0 };
  Object.values(gastosPorCliente).forEach((cliente) => {
    if (cliente.total > melhorCliente.totalGasto) {
      melhorCliente = { nome: cliente.nome, totalGasto: cliente.total };
    }
  });

  const totalServicos = pedidos.length;
  const totalGanhos = pedidos.reduce((sum, p) => sum + p.valor, 0);
  const mediaPorServico = totalServicos > 0 ? totalGanhos / totalServicos : 0;

  return {
    melhorMes,
    servicoMaisRequisitado,
    melhorCliente,
    mediaPorServico,
    totalServicos,
  };
};

const carregarDados = async () => {
  loading.value = true;
  try {
    await prestadorStore.fetchServicoTiposOptions();
    servicoTiposMap.clear();
    prestadorStore.servicoTiposOptions.forEach((tipo: ServicoTipoOptionData) => {
      servicoTiposMap.set(tipo.label.toLowerCase(), {
        icone: tipo.icone,
        cor: tipo.cor,
      });
    });

    await prestadorStore.fetchGanhos();
    const ganhos = prestadorStore.ganhos;
    saldoDisponivel.value = ganhos.total - ganhos.pendente;

    await prestadorStore.fetchSolicitacoes('concluido');
    const pedidos = prestadorStore.solicitacoes;
    estatisticas.value = calcularEstatisticas(pedidos);

    const dataAtual = new Date();
    let dataLimite = new Date();

    switch (periodo.value) {
      case 'hoje':
        dataLimite.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataLimite.setDate(dataAtual.getDate() - 7);
        break;
      case 'mes':
        dataLimite.setMonth(dataAtual.getMonth() - 1);
        break;
      case 'ano':
        dataLimite.setFullYear(dataAtual.getFullYear() - 1);
        break;
      default:
        dataLimite = new Date(0);
    }

    const pedidosFiltrados = pedidos.filter((p) => new Date(p.data) >= dataLimite);

    const totalServicos = pedidosFiltrados.length;
    const ganhosPeriodo = pedidosFiltrados.reduce((sum, p) => sum + p.valor, 0);
    const media = totalServicos > 0 ? ganhosPeriodo / totalServicos : 0;

    resumo.value = {
      totalServicos,
      ganhosPeriodo,
      media: Math.round(media),
    };

    historicoGanhos.value = pedidosFiltrados.slice(0, 5).map((pedido) => ({
      id: pedido.id,
      cliente: pedido.cliente?.nome || 'Cliente',
      servico: pedido.servico?.nome || 'Serviço',
      data: formatarData(pedido.data),
      valor: pedido.valor,
      icone: getIconePorServico(pedido.servico?.nome || ''),
      cor: getCorPorServico(pedido.servico?.nome || ''),
    }));

    const meses: GraficoItem[] = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      const nomeMes = data.toLocaleDateString('pt-PT', { month: 'short' });
      const ganhosMes = pedidos
        .filter((p) => {
          const dataPedido = new Date(p.data);
          return (
            dataPedido.getMonth() === data.getMonth() &&
            dataPedido.getFullYear() === data.getFullYear()
          );
        })
        .reduce((sum, p) => sum + p.valor, 0);

      const altura = Math.min(120, (ganhosMes / 10000) * 120);
      const corIndex = i % coresGrafico.length;
      const cor = coresGrafico[corIndex] || '#667eea';

      meses.push({
        label: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        valor: ganhosMes / 1000,
        altura: altura || 5,
        cor: cor,
      });
    }
    graficoData.value = meses;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const irParaSaques = () => {
  void router.push('/mobile/prestador/saques');
};

const opcoes = () => {
  $q.notify({
    type: 'info',
    message: 'Opções em breve',
    position: 'top',
  });
};

const verTodos = () => {
  $q.notify({
    type: 'info',
    message: 'Histórico completo em breve',
    position: 'top',
  });
};

const scrollParaEstatisticas = () => {
  const element = document.querySelector('.estatisticas-detalhadas');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await carregarDados();
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
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

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: $gray-100;
  min-height: 100vh;
}

.skeleton-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 120px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-saldo-card {
  padding: 16px;
}

.skeleton-saldo-inner {
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  opacity: 0.7;
}

.skeleton-filtros {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
}

.skeleton-filter-btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-resumo-card {
  height: 80px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

.skeleton-grafico {
  margin-bottom: 24px;
}

.skeleton-section-header {
  height: 24px;
  width: 150px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-grafico-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid $gray-200;
}

.skeleton-grafico-barras {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
}

.skeleton-barra {
  width: 40px;
  height: 80px;
  border-radius: 15px 15px 0 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-list {
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
  overflow: hidden;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-right: 12px;
}

.skeleton-list-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 4px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-estatistica-card {
  height: 100px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
  margin-bottom: 12px;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.prestador-ganhos {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

.saldo-card {
  .saldo-card-inner {
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  .saldo-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }

  .saldo-valor {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .saque-btn {
    background: white;
    color: $purple-primary;
    border-radius: 30px;
    padding: 8px 24px;
  }
}

.filtros-periodo {
  background: white;
  padding: 12px 0;
}

.resumo-card {
  border-radius: 12px;

  .resumo-valor {
    font-size: 1.2rem;
    font-weight: 700;
    color: $purple-primary;
  }

  .resumo-label {
    font-size: 0.7rem;
    color: $gray-600;
  }
}

.grafico-card {
  border-radius: 12px;
}

.grafico-barras {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  margin-top: 20px;
}

.barra-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.barra-container {
  height: 120px;
  width: 30px;
  background: $gray-200;
  border-radius: 15px 15px 0 0;
  margin: 5px 0;
  position: relative;
  overflow: hidden;
}

.barra {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 0.3s ease;
}

.barra-label {
  font-size: 0.7rem;
  color: $gray-600;
}

.barra-valor {
  font-size: 0.7rem;
  font-weight: 600;
  color: $purple-primary;
}

.historico-list {
  border-radius: 12px;
  overflow: hidden;
}

.ganho-item {
  .ganho-valor {
    font-weight: 600;
  }
}

.estatisticas-detalhadas {
  margin-bottom: 80px;

  .estatistica-card {
    border-radius: 12px;
    margin-bottom: 12px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .estatistica-titulo {
      font-size: 0.8rem;
      color: $gray-600;
      margin-bottom: 8px;
    }

    .estatistica-valor {
      font-size: 1.2rem;
      font-weight: 700;
      color: $gray-800;
    }

    .estatistica-sub {
      font-size: 0.8rem;
      color: $purple-primary;
      margin-top: 4px;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }
}
</style>
