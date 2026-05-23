<!-- pages/ServicosPrestadosPage.vue -->
<template>
  <div class="ea-servicos-page">

    <!-- ===== HERO BG (mesmo padrão) ===== -->
    <section class="ea-servicos-hero">
      <div class="ea-servicos-hero__bg">
        <div class="ea-servicos-hero__noise"></div>
        <div class="ea-servicos-hero__orb ea-servicos-hero__orb--1"></div>
        <div class="ea-servicos-hero__orb ea-servicos-hero__orb--2"></div>
        <div class="ea-servicos-hero__orb ea-servicos-hero__orb--3"></div>
        <div class="ea-servicos-hero__grid"></div>
      </div>

      <div class="ea-servicos-hero__container">

        <!-- CONTEÚDO CENTRALIZADO -->
        <div class="ea-servicos-hero__content">

          <!-- Badge -->
          <div class="ea-servicos-badge">
            <span class="ea-badge__dot"></span>
            Serviços Realizados
          </div>

          <!-- Título -->
          <h1 class="ea-servicos-title">
            Serviços prestados<br>
            <span class="ea-title-accent">pela plataforma</span>
          </h1>

          <p class="ea-servicos-subtitle">
            Confira os serviços já realizados através do EstouAqui
          </p>

        </div>
      </div>
    </section>

    <!-- ===== STATS BAR ===== -->
    <section class="ea-stats-bar">
      <div class="ea-container ea-stats-bar__inner">
        <div class="ea-stat">
          <div class="ea-stat__value">{{ stats.total_servicos.toLocaleString() }}</div>
          <div class="ea-stat__label">Total de serviços</div>
        </div>
        <div class="ea-stat">
          <div class="ea-stat__value">{{ stats.prestadores_ativos.toLocaleString() }}</div>
          <div class="ea-stat__label">Prestadores ativos</div>
        </div>
        <div class="ea-stat">
          <div class="ea-stat__value">{{ stats.clientes_atendidos.toLocaleString() }}+</div>
          <div class="ea-stat__label">Clientes atendidos</div>
        </div>
        <div class="ea-stat">
          <div class="ea-stat__value">{{ stats.media_avaliacao }}★</div>
          <div class="ea-stat__label">Avaliação média</div>
        </div>
      </div>
    </section>

    <!-- ===== FILTROS ===== -->
    <section class="ea-filters-section">
      <div class="ea-container">
        <div class="ea-filters-grid">
          <div class="ea-filter-item">
            <q-input
              v-model="filtros.search"
              outlined
              dense
              placeholder="Pesquisar serviço..."
              bg-color="white"
              class="ea-search-input"
              @update:model-value="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="ea-filter-item">
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
              class="ea-filter-select"
              @update:model-value="carregarServicos(true)"
            />
          </div>

          <div class="ea-filter-item">
            <q-select
              v-model="filtros.ordenar_por"
              :options="ordenacaoOptions"
              outlined
              dense
              placeholder="Ordenar por"
              bg-color="white"
              emit-value
              map-options
              class="ea-filter-select"
              @update:model-value="carregarServicos(true)"
            />
          </div>

          <div class="ea-filter-item">
            <q-btn
              flat
              color="primary"
              label="Limpar"
              icon="clear"
              @click="limparFiltros"
              no-caps
              class="ea-clear-btn"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SERVIÇOS ===== -->
    <section class="ea-servicos-section">
      <div class="ea-container">

        <!-- Loading -->
        <div v-if="loading" class="ea-loading">
          <q-spinner color="primary" size="50px" />
          <p>A carregar serviços...</p>
        </div>

        <!-- Sem resultados -->
        <div v-else-if="servicos.length === 0" class="ea-empty">
          <q-icon name="receipt" size="64px" />
          <h3>Nenhum serviço encontrado</h3>
          <p>Tente ajustar os filtros ou pesquisar por outro termo</p>
        </div>

        <!-- Grid de Serviços -->
        <div v-else class="ea-servicos-grid">
          <div
            v-for="servico in servicos"
            :key="servico.id"
            class="ea-servico-card"
          >
            <div class="ea-servico-card__header">
              <div class="ea-servico-card__icon">
                <q-icon :name="servico.icone || 'work'" size="28px" />
              </div>
              <div class="ea-servico-card__info">
                <div class="ea-servico-card__title">{{ servico.titulo }}</div>
                <div class="ea-servico-card__category">{{ servico.categoria_nome }}</div>
              </div>
              <q-badge
                :color="servico.status === 'concluido' ? 'positive' : 'warning'"
                class="ea-servico-card__status"
              >
                {{ servico.status === 'concluido' ? 'Concluído' : 'Em andamento' }}
              </q-badge>
            </div>

            <div class="ea-servico-card__details">
              <div class="ea-detail-item">
                <q-icon name="person" size="16px" />
                <span>{{ servico.prestador_nome }}</span>
              </div>
              <div class="ea-detail-item">
                <q-icon name="calendar_today" size="16px" />
                <span>{{ formatarData(servico.data_realizacao) }}</span>
              </div>
              <div class="ea-detail-item">
                <q-icon name="location_on" size="16px" />
                <span>{{ servico.localizacao }}</span>
              </div>
            </div>

            <p class="ea-servico-card__description">{{ servico.descricao }}</p>

            <div class="ea-servico-card__footer">
              <div class="ea-servico-card__price">
                <span class="price-label">Valor:</span>
                <span class="price-value">{{ servico.valor.toLocaleString() }} MZN</span>
              </div>
              <div class="ea-servico-card__rating">
                <q-rating
                  v-model="servico.avaliacao"
                  readonly
                  size="16px"
                  color="amber"
                  icon="star"
                  icon-selected="star"
                />
                <span v-if="servico.total_avaliacoes > 0" class="rating-count">
                  ({{ servico.total_avaliacoes }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="pagination.total_pages > 1" class="ea-pagination">
          <q-pagination
            v-model="pagination.current_page"
            :max="pagination.total_pages"
            :max-pages="6"
            boundary-numbers
            direction-links
            color="primary"
            @update:model-value="mudarPagina"
          />
        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="ea-cta-section">
      <div class="ea-cta-section__bg">
        <div class="ea-cta__orb ea-cta__orb--1"></div>
        <div class="ea-cta__orb ea-cta__orb--2"></div>
      </div>
      <div class="ea-container ea-cta__inner">
        <div class="ea-cta__label">Precisa de um serviço?</div>
        <h2 class="ea-cta__title">Encontre profissionais<br>qualificados perto de si</h2>
        <div class="ea-cta__btns">
          <q-btn
            unelevated
            color="primary"
            label="Ver Prestadores"
            icon="person_search"
            size="lg"
            to="/mobile/lista-prestadores"
            class="ea-cta-white"
            no-caps
          />
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

defineOptions({ name: 'ServicosPrestadosPage' });

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

interface ServicosParams {
  page: number;
  limit: number;
  search?: string;
  categoria_id?: number | null;
  ordenar_por: string;
}

interface OrdenacaoOption {
  label: string;
  value: string;
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
const ordenacaoOptions: OrdenacaoOption[] = [
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Mais antigos', value: 'antigos' },
  { label: 'Melhor avaliados', value: 'avaliacao' },
  { label: 'Maior valor', value: 'maior_valor' },
  { label: 'Menor valor', value: 'menor_valor' }
];

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

const handleSearch = (): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
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

const formatarData = (data: string): string => {
  try {
    const date = new Date(data);
    if (isNaN(date.getTime())) return data;

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return data;
  }
};

onMounted(async () => {
  $q.loading.show({ message: 'A carregar serviços...', delay: 400 });
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
$ink: #0A0A0F;
$accent: #5B4BF5;
$gold: #F59E0B;
$radius-md: 16px;
$radius-lg: 24px;
$radius-xl: 32px;

.ea-servicos-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: #F7F7FA;
  min-height: 100vh;
}

.ea-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

// =====================
// HERO
// =====================
.ea-servicos-hero {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 80px 0;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);

    &--1 {
      width: 500px; height: 500px;
      top: -200px; left: -150px;
      background: radial-gradient(circle, rgba(91,75,245,0.3) 0%, transparent 70%);
    }
    &--2 {
      width: 400px; height: 400px;
      bottom: -100px; right: -100px;
      background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
    }
    &--3 {
      width: 300px; height: 300px;
      top: 50%; right: 30%;
      background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    }
  }

  &__container {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    text-align: center;
  }

  &__content {
    max-width: 700px;
  }
}

.ea-servicos-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(91, 75, 245, 0.15);
  border: 1px solid rgba(91, 75, 245, 0.3);
  color: $accent;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
}

.ea-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 8px #4ADE80;
}

.ea-servicos-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 16px;
}

.ea-title-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ea-servicos-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
}

// =====================
// STATS BAR
// =====================
.ea-stats-bar {
  background: $ink;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 32px 0;

  &__inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;

    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px 0;
    }
  }
}

.ea-stat {
  text-align: center;
  padding: 0 20px;
  border-right: 1px solid rgba(255,255,255,0.06);

  &:last-child { border-right: none; }

  &__value {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  &__label {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.4);
    margin-top: 4px;
  }
}

// =====================
// FILTROS
// =====================
.ea-filters-section {
  background: #fff;
  padding: 24px 0;
  border-bottom: 1px solid #EDEDF2;
}

.ea-filters-grid {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 0.8fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.ea-search-input,
.ea-filter-select {
  width: 100%;
}

.ea-clear-btn {
  width: 100%;
  height: 40px;
}

// =====================
// SERVIÇOS
// =====================
.ea-servicos-section {
  background: #F7F7FA;
  padding: 60px 0;
  min-height: 60vh;
}

.ea-servicos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.ea-servico-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 24px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    background: rgba(91, 75, 245, 0.1);
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $accent;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: #0A0A0F;
    margin-bottom: 4px;
  }

  &__category {
    font-size: 0.75rem;
    color: $accent;
  }

  &__status {
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.7rem;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__description {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #EDEDF2;
  }

  &__price {
    .price-label {
      font-size: 0.7rem;
      color: #999;
      display: block;
    }
    .price-value {
      font-size: 1rem;
      font-weight: 700;
      color: $accent;
    }
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 4px;

    .rating-count {
      font-size: 0.7rem;
      color: #999;
    }
  }
}

.ea-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #666;

  .q-icon {
    color: $accent;
  }
}

// =====================
// LOADING & EMPTY
// =====================
.ea-loading,
.ea-empty {
  text-align: center;
  padding: 60px 20px;

  .q-icon {
    color: #ccc;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
  }
}

// =====================
// PAGINAÇÃO
// =====================
.ea-pagination {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

// =====================
// CTA FINAL
// =====================
.ea-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 80px 0;
  text-align: center;
}

.ea-cta-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ea-cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);

  &--1 {
    width: 500px; height: 500px;
    top: -200px; left: -100px;
    background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
  }
  &--2 {
    width: 400px; height: 400px;
    bottom: -150px; right: -50px;
    background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
  }
}

.ea-cta__inner {
  position: relative;
  z-index: 2;
}

.ea-cta__label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: rgba(91,75,245,0.15);
  border: 1px solid rgba(91,75,245,0.3);
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
}

.ea-cta__title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin: 0 0 32px;
}

.ea-cta-white {
  background: #fff;
  color: $ink;
  padding: 14px 32px;
  border-radius: 100px;
  font-weight: 600;
  transition: all 0.25s;

  &:hover {
    background: #f0effe;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255,255,255,0.15);
  }
}
</style>
