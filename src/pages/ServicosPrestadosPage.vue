<!-- pages/ServicosPrestadosPage.vue -->
<template>
  <q-page class="servicos-prestados-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content container">
        <div class="text-center">
          <q-chip
            class="hero-chip"
            icon="assignment_turned_in"
            text-color="white"
            label="Serviços Realizados"
          />
          <h1 class="hero-title">Serviços prestados<br />pela plataforma</h1>
          <p class="hero-subtitle">
            Confira os serviços já realizados através do EstouAqui
          </p>
        </div>
      </div>
    </section>

    <!-- Estatísticas -->
    <section class="stats-section q-py-lg">
      <div class="container">
        <div class="row justify-center">
          <div class="col-12 col-md-10">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.total_servicos }}</div>
                <div class="stat-label">Total de serviços</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.prestadores_ativos }}</div>
                <div class="stat-label">Prestadores ativos</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.clientes_atendidos }}+</div>
                <div class="stat-label">Clientes atendidos</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.media_avaliacao }}</div>
                <div class="stat-label">Avaliação média</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtros e Busca -->
    <section class="filters-section q-py-md">
      <div class="container">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.search"
              outlined
              dense
              placeholder="Pesquisar serviço..."
              bg-color="white"
              @update:model-value="handleSearch"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.categoria"
              :options="categorias"
              option-value="id"
              option-label="nome"
              emit-value
              map-options
              outlined
              dense
              clearable
              placeholder="Categoria"
              bg-color="white"
              @update:model-value="carregarServicos(true)"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.ordenar_por"
              :options="ordenacaoOptions"
              outlined
              dense
              placeholder="Ordenar por"
              bg-color="white"
              emit-value
              map-options
              @update:model-value="carregarServicos(true)"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              flat
              color="primary"
              label="Limpar"
              icon="clear"
              @click="limparFiltros"
              no-caps
              class="full-width"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Lista de Serviços -->
    <section class="servicos-section q-py-xl">
      <div class="container">
        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="50px" />
          <p class="q-mt-md text-grey-7">A carregar serviços...</p>
        </div>

        <!-- Sem resultados -->
        <div v-else-if="servicos.length === 0" class="text-center q-pa-xl">
          <q-icon name="receipt" size="64px" color="grey-5" />
          <p class="text-h6 text-grey-7 q-mt-md">Nenhum serviço encontrado</p>
          <p class="text-grey-6">Tente ajustar os filtros ou pesquisar por outro termo</p>
        </div>

        <!-- Grid de Serviços -->
        <div v-else class="row q-col-gutter-lg">
          <div
            v-for="servico in servicos"
            :key="servico.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <div class="servico-card">
              <div class="servico-header">
                <div class="servico-icon">
                  <q-icon :name="servico.icone || 'work'" size="32px" color="primary" />
                </div>
                <div>
                  <div class="servico-titulo">{{ servico.titulo }}</div>
                  <div class="servico-categoria">{{ servico.categoria_nome }}</div>
                </div>
                <q-badge
                  :color="servico.status === 'concluido' ? 'positive' : 'grey'"
                  class="q-ml-auto"
                >
                  {{ servico.status === 'concluido' ? 'Concluído' : 'Em andamento' }}
                </q-badge>
              </div>

              <div class="servico-info">
                <div class="info-item">
                  <q-icon name="person" size="16px" color="grey-6" />
                  <span>{{ servico.prestador_nome }}</span>
                </div>
                <div class="info-item">
                  <q-icon name="calendar_today" size="16px" color="grey-6" />
                  <span>{{ formatarData(servico.data_realizacao) }}</span>
                </div>
                <div class="info-item">
                  <q-icon name="location_on" size="16px" color="grey-6" />
                  <span>{{ servico.localizacao }}</span>
                </div>
              </div>

              <p class="servico-descricao">{{ servico.descricao }}</p>

              <div class="servico-footer">
                <div>
                  <span class="preco-label">Valor:</span>
                  <span class="preco-valor">{{ servico.valor }} MZN</span>
                </div>
                <div class="servico-avaliacao">
                  <q-icon
                    v-for="n in 5"
                    :key="n"
                    :name="n <= servico.avaliacao ? 'star' : 'star_border'"
                    :color="n <= servico.avaliacao ? 'yellow-8' : 'grey-4'"
                    size="16px"
                  />
                  <span class="avaliacao-count" v-if="servico.total_avaliacoes > 1">
                    ({{ servico.total_avaliacoes }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="pagination.total_pages > 1" class="text-center q-mt-xl">
          <q-pagination
            v-model="pagination.current_page"
            :max="pagination.total_pages"
            :max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="mudarPagina"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section q-py-xl">
      <div class="container">
        <div class="cta-card">
          <div class="row items-center justify-between">
            <div class="col-12 col-md-7">
              <h3 class="cta-title">Precisa de um serviço?</h3>
              <p class="cta-text">Encontre profissionais qualificados perto de si</p>
            </div>
            <div class="col-12 col-md-5 text-right">
              <q-btn
                unelevated
                color="primary"
                label="Ver Prestadores"
                icon="person_search"
                size="lg"
                to="/mobile/lista-prestadores"
                class="cta-button"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

defineOptions({
  name: 'ServicosPrestadosPage'
});

const $q = useQuasar();

// Tipos
interface Servico {
  id: number;
  titulo: string;
  descricao: string;
  categoria_id: number;
  categoria_nome: string;
  icone?: string;
  prestador_id: number;
  prestador_nome: string;
  cliente_id: number;
  cliente_nome: string;
  data_realizacao: string;
  localizacao: string;
  valor: number;
  avaliacao: number;
  total_avaliacoes: number;
  status: 'concluido' | 'andamento';
}

interface Categoria {
  id: number;
  nome: string;
  icone?: string;
}

interface Stats {
  total_servicos: number;
  prestadores_ativos: number;
  clientes_atendidos: number;
  media_avaliacao: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

// Tipos para parâmetros da API
interface ServicosParams {
  page: number;
  limit: number;
  search?: string;
  categoria_id?: number | null;
  ordenar_por: string;
}

// Estados
const loading = ref<boolean>(true);
const servicos = ref<Servico[]>([]);
const categorias = ref<Categoria[]>([]);
const stats = ref<Stats>({
  total_servicos: 0,
  prestadores_ativos: 0,
  clientes_atendidos: 0,
  media_avaliacao: 0
});

const pagination = reactive<Pagination>({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  per_page: 12
});

// Filtros
const filtros = reactive({
  search: '',
  categoria: null as number | null,
  ordenar_por: 'recentes'
});

// Options
interface OrdenacaoOption {
  label: string;
  value: string;
}

const ordenacaoOptions: OrdenacaoOption[] = [
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Mais antigos', value: 'antigos' },
  { label: 'Melhor avaliados', value: 'avaliacao' },
  { label: 'Maior valor', value: 'maior_valor' },
  { label: 'Menor valor', value: 'menor_valor' }
];

// Declaração para o timeout da pesquisa
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Métodos para API
const carregarCategorias = async (): Promise<void> => {
  try {
    const response = await api.get<Categoria[]>('/categorias');
    categorias.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

const carregarStats = async (): Promise<void> => {
  try {
    const response = await api.get<Stats>('/servicos/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
};

const carregarServicos = async (resetPage = true): Promise<void> => {
  if (resetPage) {
    pagination.current_page = 1;
    loading.value = true;
  }

  try {
    const params: ServicosParams = {
      page: pagination.current_page,
      limit: pagination.per_page,
      ordenar_por: filtros.ordenar_por
    };

    if (filtros.search && filtros.search.trim() !== '') {
      params.search = filtros.search;
    }

    if (filtros.categoria) {
      params.categoria_id = filtros.categoria;
    }

    const response = await api.get('/servicos', { params });

    servicos.value = response.data.data || response.data;

    // Atualizar paginação
    if (response.data.pagination) {
      pagination.total_pages = response.data.pagination.last_page;
      pagination.total_items = response.data.pagination.total;
    }

  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar serviços',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// Handlers
const handleSearch = (): void => {
  // Limpar timeout anterior se existir
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Criar novo timeout
  searchTimeout = setTimeout(() => {
    void carregarServicos(true);
    searchTimeout = null;
  }, 500);
};

const limparFiltros = (): void => {
  filtros.search = '';
  filtros.categoria = null;
  filtros.ordenar_por = 'recentes';
  void carregarServicos(true);
};

const mudarPagina = (page: number): void => {
  pagination.current_page = page;
  void carregarServicos(false);
};

// Utils - Função manual para formatar data sem dependências
const formatarData = (data: string): string => {
  try {
    const date = new Date(data);

    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return data;
    }

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch {
    return data;
  }
};

// Lifecycle
onMounted(async () => {
  $q.loading.show({
    message: 'A carregar serviços...',
    delay: 400
  });

  try {
    await Promise.all([
      carregarCategorias(),
      carregarStats(),
      carregarServicos(true)
    ]);
  } finally {
    $q.loading.hide();
  }
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.page-hero {
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  background: $purple-gradient;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.1;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    color: white;
  }

  .hero-chip {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
}

// Stats Section
.stats-section {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  margin-top: -40px;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;

  .stats-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 30px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
    flex-wrap: wrap;
    gap: 20px;
  }

  .stat-item {
    text-align: center;
    flex: 1;
    min-width: 120px;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: $purple-primary;
    line-height: 1.2;
  }

  .stat-label {
    color: #666;
    font-size: 0.9rem;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: #e0e0e0;

    @media (max-width: 768px) {
      display: none;
    }
  }
}

// Filters Section
.filters-section {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

// Serviços Section
.servicos-section {
  background: #f8f9fa;
  min-height: 60vh;
}

.servico-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.1);
  }

  .servico-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;

    .servico-icon {
      width: 50px;
      height: 50px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .servico-titulo {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      line-height: 1.3;
    }

    .servico-categoria {
      font-size: 0.9rem;
      color: $purple-primary;
    }
  }

  .servico-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;

      .q-icon {
        font-size: 16px;
      }
    }
  }

  .servico-descricao {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    flex: 1;
  }

  .servico-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;

    .preco-label {
      font-size: 0.8rem;
      color: #999;
      display: block;
    }

    .preco-valor {
      font-size: 1.2rem;
      font-weight: 700;
      color: $purple-primary;
    }

    .servico-avaliacao {
      display: flex;
      align-items: center;
      gap: 2px;

      .avaliacao-count {
        margin-left: 4px;
        font-size: 0.8rem;
        color: #999;
      }
    }
  }
}

// CTA Section
.cta-section {
  background: white;
  padding: 60px 0;

  .cta-card {
    background: $purple-gradient;
    padding: 60px;
    border-radius: 30px;
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);
  }

  .cta-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 10px;
  }

  .cta-text {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .cta-button {
    padding: 15px 40px;
    border-radius: 50px;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
  }
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem !important;
  }

  .stats-section {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;

    .stats-grid {
      flex-direction: column;
      gap: 20px;
    }
  }

  .cta-card {
    padding: 30px !important;
    text-align: center;

    .text-right {
      text-align: center !important;
      margin-top: 20px;
    }
  }

  .filters-section {
    .col-12 {
      margin-bottom: 10px;
    }
  }
}
</style>
