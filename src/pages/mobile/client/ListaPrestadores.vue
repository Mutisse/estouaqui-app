<template>
  <q-page class="lista-prestadores-page">
    <!-- Skeleton Loading (mostra enquanto carrega) -->
    <div v-if="isLoading" class="skeleton-loading">
      <!-- Skeleton Header -->
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-search"></div>
        <div class="skeleton-filter-btn"></div>
      </div>

      <!-- Skeleton Categories -->
      <div class="skeleton-categories">
        <div v-for="i in 6" :key="i" class="skeleton-category-chip"></div>
      </div>

      <!-- Skeleton Cards -->
      <div class="skeleton-cards">
        <div v-for="i in 6" :key="i" class="skeleton-card">
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

    <!-- Conteúdo real -->
    <template v-else>
      <!-- Header com busca -->
      <div class="search-header q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="router.back()" />
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Pesquisar prestadores..."
            class="col search-input"
            bg-color="white"
            clearable
            @update:model-value="handleSearch"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn flat round icon="tune" @click="showFilters = true">
            <q-badge v-if="activeFiltersCount > 0" color="primary" floating rounded>
              {{ activeFiltersCount }}
            </q-badge>
          </q-btn>
        </div>
      </div>

      <!-- Categorias em chips -->
      <div class="categories-chips q-px-md q-mb-sm">
        <div class="chips-scroll">
          <q-chip
            v-for="cat in categorias"
            :key="cat.id"
            :clickable="true"
            :selected="selectedCategory === cat.id"
            :color="selectedCategory === cat.id ? 'primary' : 'grey-3'"
            :text-color="selectedCategory === cat.id ? 'white' : 'grey-9'"
            @click="() => filtrarPorCategoria(cat.id)"
            class="category-chip"
            size="md"
          >
            <q-icon :name="cat.icone || 'category'" size="18px" class="q-mr-xs" />
            {{ cat.nome }}
          </q-chip>
        </div>
      </div>

      <!-- Subcategorias -->
      <div
        v-if="selectedCategory && subcategorias.length > 0"
        class="subcategories-chips q-px-md q-mb-md"
      >
        <div class="sub-header row items-center justify-between">
          <span class="text-caption text-grey-6">Tipos de serviço:</span>
          <q-btn
            v-if="selectedSubcategory"
            flat
            dense
            size="sm"
            color="primary"
            label="Limpar"
            @click="limparSubcategoria"
            no-caps
          />
        </div>
        <div class="chips-scroll">
          <q-chip
            v-for="sub in subcategorias"
            :key="sub.id"
            :clickable="true"
            :selected="selectedSubcategory === sub.id"
            :color="selectedSubcategory === sub.id ? 'secondary' : 'grey-2'"
            :text-color="selectedSubcategory === sub.id ? 'white' : 'grey-8'"
            @click="() => filtrarPorSubcategoria(sub.id)"
            size="sm"
            dense
          >
            {{ sub.nome }}
          </q-chip>
        </div>
      </div>

      <!-- Resumo de filtros ativos -->
      <div v-if="activeFiltersCount > 0" class="active-filters q-px-md q-pb-sm">
        <div class="row items-center justify-between">
          <span class="text-caption text-grey-6">Filtros ativos:</span>
          <q-btn
            flat
            dense
            size="sm"
            color="primary"
            label="Limpar todos"
            @click="clearAllFilters"
            no-caps
          />
        </div>
        <div class="row q-gutter-xs q-mt-xs">
          <q-chip
            v-if="filtros.distancia_max < 50"
            dense
            size="sm"
            removable
            color="primary"
            @remove="
              filtros.distancia_max = 50;
              void carregarPrestadores(true);
            "
          >
            <q-icon name="radar" size="14px" class="q-mr-xs" />
            ≤ {{ filtros.distancia_max }}km
          </q-chip>
          <q-chip
            v-if="filtros.rating_min > 0"
            dense
            size="sm"
            removable
            color="amber"
            text-color="dark"
            @remove="
              filtros.rating_min = 0;
              void carregarPrestadores(true);
            "
          >
            <q-icon name="star" size="14px" class="q-mr-xs" />
            ≥ {{ filtros.rating_min }}
          </q-chip>
          <q-chip
            v-if="filtros.disponivel !== 'todos'"
            dense
            size="sm"
            removable
            :color="filtros.disponivel === 'true' ? 'positive' : 'negative'"
            text-color="white"
            @remove="
              filtros.disponivel = 'todos';
              void carregarPrestadores(true);
            "
          >
            <q-icon name="check_circle" size="14px" class="q-mr-xs" />
            {{ filtros.disponivel === 'true' ? 'Disponível' : 'Indisponível' }}
          </q-chip>
          <q-chip
            v-if="selectedCategory"
            dense
            size="sm"
            removable
            color="secondary"
            @remove="clearFilters"
          >
            <q-icon name="category" size="14px" class="q-mr-xs" />
            {{ categoriaNome }}
          </q-chip>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-section q-pa-md">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="50px" />
          <p class="q-mt-md text-grey-7">A carregar prestadores...</p>
        </div>

        <div v-else-if="prestadores.length === 0" class="text-center q-pa-xl">
          <q-icon name="search_off" size="64px" color="grey-5" />
          <p class="text-h6 text-grey-7 q-mt-md">Nenhum prestador encontrado</p>
          <p class="text-grey-6">Tente ajustar os filtros ou pesquisar por outro termo</p>
          <q-btn flat color="primary" label="Limpar filtros" @click="clearFilters" no-caps />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div
              v-for="prestador in prestadores"
              :key="prestador.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="prestador-card cursor-pointer"
                flat
                bordered
                @click="() => irParaPerfil(prestador.id)"
              >
                <q-card-section class="row items-center no-wrap q-gutter-md">
                  <!-- Avatar com fallback de iniciais - CORRIGIDO -->
                  <q-avatar size="56px">
                    <!-- ✅ AGORA USA 'foto' em vez de 'fotoProcessada' -->
                    <img
                      v-if="prestador.foto"
                      :src="prestador.foto"
                      :alt="prestador.nome"
                      @error="(e) => handleImageError(e, prestador)"
                    />
                    <!-- Fallback: avatar com iniciais -->
                    <div
                      v-else
                      class="avatar-placeholder"
                      :style="{ backgroundColor: getAvatarColor(prestador.id) }"
                    >
                      {{ obterIniciais(prestador.nome) }}
                    </div>
                  </q-avatar>

                  <div class="col">
                    <div class="row items-center justify-between">
                      <div class="prestador-nome">{{ prestador.nome }}</div>
                      <q-icon
                        v-if="prestador.verificado"
                        name="verified"
                        color="primary"
                        size="16px"
                      />
                    </div>

                    <div class="row items-center q-gutter-xs q-mt-xs">
                      <div class="rating">
                        <q-icon name="star" color="yellow-8" size="14px" />
                        <span class="rating-value">{{
                          (prestador.media_avaliacao || 0).toFixed(1)
                        }}</span>
                        <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                      </div>
                      <q-separator vertical inset />
                      <div class="distancia">
                        <q-icon name="location_on" size="14px" class="text-grey-6" />
                        <span class="distancia-value">{{
                          formatarDistancia(prestador.distancia)
                        }}</span>
                      </div>
                    </div>

                    <div class="categorias-preview q-mt-xs">
                      <q-chip
                        v-for="cat in prestador.categorias?.slice(0, 2)"
                        :key="cat.id"
                        dense
                        size="sm"
                        class="categoria-chip"
                      >
                        {{ cat.nome }}
                      </q-chip>
                      <q-chip
                        v-if="prestador.categorias && prestador.categorias.length > 2"
                        dense
                        size="sm"
                        class="categoria-chip more"
                      >
                        +{{ prestador.categorias.length - 2 }}
                      </q-chip>
                    </div>
                  </div>

                  <div class="status-badge">
                    <q-badge :color="prestador.disponivel !== false ? 'positive' : 'grey'" rounded>
                      {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-if="hasMore" class="text-center q-mt-lg">
            <q-btn
              flat
              color="primary"
              label="Carregar mais"
              icon="expand_more"
              @click="loadMore"
              :loading="loadingMore"
              no-caps
            />
          </div>
        </div>
      </div>

      <!-- Drawer de filtros -->
      <q-drawer
        v-model="showFilters"
        side="right"
        behavior="mobile"
        bordered
        :width="340"
        :breakpoint="0"
      >
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <div class="row items-center">
              <q-icon name="tune" size="20px" class="q-mr-sm" />
              Filtros avançados
            </div>
          </q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-scroll-area style="height: calc(100vh - 50px)">
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Distância máxima</q-item-label>
                <div class="row items-center justify-between q-mt-sm">
                  <span class="text-caption text-grey-6"
                    >Até <strong>{{ filtros.distancia_max }}km</strong></span
                  >
                  <q-btn
                    v-if="filtros.distancia_max < 50"
                    flat
                    dense
                    size="sm"
                    color="primary"
                    label="Limpar"
                    @click="filtros.distancia_max = 50"
                    no-caps
                  />
                </div>
                <q-slider
                  v-model="filtros.distancia_max"
                  :min="1"
                  :max="50"
                  :step="1"
                  label
                  color="primary"
                  class="q-mt-sm"
                  label-always
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Avaliação mínima</q-item-label>
                <div class="row items-center justify-between q-mt-sm">
                  <q-rating
                    v-model="filtros.rating_min"
                    :max="5"
                    size="32px"
                    color="amber"
                    icon="star_border"
                    icon-selected="star"
                  />
                  <q-btn
                    v-if="filtros.rating_min > 0"
                    flat
                    dense
                    size="sm"
                    label="Limpar"
                    @click="filtros.rating_min = 0"
                    no-caps
                  />
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Disponibilidade</q-item-label>
                <q-option-group
                  v-model="filtros.disponivel"
                  :options="disponibilidadeOptions"
                  type="radio"
                  inline
                  class="q-mt-sm"
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Categoria</q-item-label>
                <q-select
                  v-model="filtros.categoria_id"
                  :options="categorias"
                  option-value="id"
                  option-label="nome"
                  emit-value
                  map-options
                  dense
                  outlined
                  clearable
                  placeholder="Todas categorias"
                  @update:model-value="onCategoriaChange"
                  class="q-mt-sm"
                />
              </q-item-section>
            </q-item>

            <q-item v-if="subcategorias.length > 0">
              <q-item-section>
                <q-item-label class="text-weight-bold">Tipo de serviço</q-item-label>
                <q-select
                  v-model="filtros.subcategoria_id"
                  :options="subcategorias"
                  option-value="id"
                  option-label="nome"
                  emit-value
                  map-options
                  dense
                  outlined
                  clearable
                  placeholder="Todos os tipos"
                  class="q-mt-sm"
                />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Ordenar por</q-item-label>
                <q-select
                  v-model="filtros.ordenar_por"
                  :options="ordenacaoOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  class="q-mt-sm"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row q-pa-md q-gutter-sm">
            <q-btn
              flat
              color="primary"
              label="Limpar tudo"
              @click="clearAllFilters"
              class="col"
              no-caps
            />
            <q-btn
              unelevated
              color="primary"
              label="Ver resultados"
              @click="applyFilters"
              class="col"
              no-caps
            />
          </div>
        </q-scroll-area>
      </q-drawer>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore, type PrestadorData } from 'src/stores/cliente-store';

defineOptions({ name: 'ListaPrestadoresPage' });

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();

// Estado de loading do skeleton
const isLoading = ref(true);

// Estados
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const showFilters = ref(false);
const page = ref(1);
const hasMore = ref(false);
const prestadores = ref<PrestadorData[]>([]);
const categorias = ref<{ id: number; nome: string; icone: string }[]>([]);
const subcategorias = ref<{ id: number; nome: string }[]>([]);
const selectedCategory = ref<number | null>(null);
const selectedSubcategory = ref<number | null>(null);
const imageErrors = ref<Record<number, boolean>>({});

const categoriaNome = computed(() => {
  const cat = categorias.value.find((c) => c.id === selectedCategory.value);
  return cat?.nome || '';
});

// Interface para resultado paginado
interface PaginatedResult {
  data: PrestadorData[];
  current_page: number;
  last_page: number;
  total: number;
}

const filtros = reactive({
  distancia_max: 50,
  rating_min: 0,
  disponivel: 'todos' as 'todos' | 'true' | 'false',
  categoria_id: null as number | null,
  subcategoria_id: null as number | null,
  ordenar_por: 'rating_desc' as 'rating_desc' | 'distancia_asc' | 'servicos_desc',
});

const disponibilidadeOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Disponível', value: 'true' },
  { label: 'Indisponível', value: 'false' },
];

const ordenacaoOptions = [
  { label: '🌟 Melhor avaliação', value: 'rating_desc' },
  { label: '📍 Mais próximo', value: 'distancia_asc' },
  { label: '📋 Mais serviços', value: 'servicos_desc' },
];

// ✅ FUNÇÃO PARA OBTER INICIAIS DO NOME
const obterIniciais = (nome: string): string => {
  if (!nome || nome.trim() === '') return '??';

  const partes = nome.trim().split(' ');
  const primeiraParte = partes[0];

  if (!primeiraParte) return '??';

  if (partes.length === 1) {
    if (primeiraParte.length >= 2) {
      return primeiraParte.substring(0, 2).toUpperCase();
    }
    return (primeiraParte[0] || '?') + '?';
  }

  const ultimaParte = partes[partes.length - 1];
  if (!ultimaParte) {
    if (primeiraParte.length >= 2) {
      return primeiraParte.substring(0, 2).toUpperCase();
    }
    return (primeiraParte[0] || '?') + '?';
  }

  const primeiraLetra = primeiraParte[0] || '';
  const ultimaLetra = ultimaParte[0] || '';

  if (!primeiraLetra && !ultimaLetra) return '??';
  if (!primeiraLetra) return (ultimaLetra + '?').toUpperCase();
  if (!ultimaLetra) return (primeiraLetra + '?').toUpperCase();

  return (primeiraLetra + ultimaLetra).toUpperCase();
};

// ✅ FUNÇÃO PARA GERAR COR DO AVATAR BASEADA NO ID
const getAvatarColor = (id: number): string => {
  const colors: string[] = [
    '#667eea', '#48bb78', '#ed8936', '#f56565', '#9f7aea',
    '#38b2ac', '#fbbf24', '#a0aec0', '#4a5568', '#d53f8c',
  ];
  const index = Math.abs(id) % colors.length;
  return colors[index] ?? '#667eea';
};

// ✅ FUNÇÃO PARA TRATAR ERRO DE IMAGEM
const handleImageError = (event: Event, prestador: PrestadorData) => {
  const img = event.target as HTMLImageElement;
  if (!imageErrors.value[prestador.id]) {
    imageErrors.value[prestador.id] = true;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const existingPlaceholder = parent.querySelector('.avatar-placeholder');
      if (existingPlaceholder) {
        existingPlaceholder.remove();
      }
      const placeholder = document.createElement('div');
      placeholder.className = 'avatar-placeholder';
      placeholder.style.backgroundColor = getAvatarColor(prestador.id);
      placeholder.innerText = obterIniciais(prestador.nome);
      parent.appendChild(placeholder);
    }
  }
};

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filtros.distancia_max < 50) count++;
  if (filtros.rating_min > 0) count++;
  if (filtros.disponivel !== 'todos') count++;
  if (filtros.categoria_id) count++;
  if (filtros.subcategoria_id) count++;
  if (filtros.ordenar_por !== 'rating_desc') count++;
  return count;
});

const formatarDistancia = (distancia?: number) => {
  if (!distancia && distancia !== 0) return '-- km';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${distancia.toFixed(1)}km`;
};

const irParaPerfil = (id: number): void => {
  void router.push(`/mobile/perfil-prestador/${id}`);
};

const carregarCategorias = async (): Promise<void> => {
  try {
    const cats = await clienteStore.fetchCategorias(true);
    categorias.value = cats || [];
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    categorias.value = [];
  }
};

const carregarSubcategorias = (): void => {
  if (selectedCategory.value === 1) {
    subcategorias.value = [
      { id: 101, nome: 'Instalação Elétrica' },
      { id: 102, nome: 'Manutenção' },
      { id: 103, nome: 'Projetos' },
    ];
  } else if (selectedCategory.value === 2) {
    subcategorias.value = [
      { id: 201, nome: 'Desentupimento' },
      { id: 202, nome: 'Instalação' },
      { id: 203, nome: 'Reparos' },
    ];
  } else {
    subcategorias.value = [];
  }
};

const carregarPrestadores = async (resetPage = true): Promise<void> => {
  if (resetPage) {
    page.value = 1;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const result = await clienteStore.buscarPrestadoresPorNome(searchQuery.value || '');

    let prestadoresData: PrestadorData[] = [];

    if (Array.isArray(result)) {
      prestadoresData = result;
      hasMore.value = false;
    } else if (
      result &&
      typeof result === 'object' &&
      'data' in result &&
      Array.isArray((result as PaginatedResult).data)
    ) {
      const paginated = result as PaginatedResult;
      prestadoresData = paginated.data;
      hasMore.value = paginated.current_page < paginated.last_page;
    } else {
      prestadoresData = [];
      hasMore.value = false;
    }

    const sortedPrestadores = [...prestadoresData];

    if (filtros.ordenar_por === 'rating_desc') {
      sortedPrestadores.sort((a, b) => (b.media_avaliacao || 0) - (a.media_avaliacao || 0));
    } else if (filtros.ordenar_por === 'distancia_asc') {
      sortedPrestadores.sort((a, b) => (a.distancia || 999) - (b.distancia || 999));
    }

    if (resetPage) {
      prestadores.value = sortedPrestadores;
    } else {
      prestadores.value = [...prestadores.value, ...sortedPrestadores];
    }
  } catch (error) {
    console.error('Erro ao carregar prestadores:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar lista de prestadores',
      position: 'top',
    });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// Carregar dados iniciais com skeleton
const carregarDadosIniciais = async () => {
  isLoading.value = true;

  try {
    await carregarCategorias();
    await carregarPrestadores(true);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 600);
  }
};

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = (): void => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    void carregarPrestadores(true);
  }, 500);
};

const filtrarPorCategoria = (categoriaId: number): void => {
  if (selectedCategory.value === categoriaId) {
    selectedCategory.value = null;
    filtros.categoria_id = null;
    filtros.subcategoria_id = null;
    selectedSubcategory.value = null;
    subcategorias.value = [];
  } else {
    selectedCategory.value = categoriaId;
    filtros.categoria_id = categoriaId;
    filtros.subcategoria_id = null;
    selectedSubcategory.value = null;
    carregarSubcategorias();
  }
  page.value = 1;
  void carregarPrestadores(true);
};

const filtrarPorSubcategoria = (subcategoriaId: number): void => {
  if (selectedSubcategory.value === subcategoriaId) {
    selectedSubcategory.value = null;
    filtros.subcategoria_id = null;
  } else {
    selectedSubcategory.value = subcategoriaId;
    filtros.subcategoria_id = subcategoriaId;
  }
  page.value = 1;
  void carregarPrestadores(true);
};

const limparSubcategoria = (): void => {
  selectedSubcategory.value = null;
  filtros.subcategoria_id = null;
  page.value = 1;
  void carregarPrestadores(true);
};

const onCategoriaChange = (categoriaId: number | null): void => {
  if (categoriaId) {
    selectedCategory.value = categoriaId;
    filtros.subcategoria_id = null;
    selectedSubcategory.value = null;
    carregarSubcategorias();
  } else {
    selectedCategory.value = null;
    subcategorias.value = [];
    filtros.subcategoria_id = null;
    selectedSubcategory.value = null;
  }
};

const loadMore = (): void => {
  if (!hasMore.value || loadingMore.value || loading.value) return;
  page.value++;
  void carregarPrestadores(false);
};

const clearFilters = (): void => {
  searchQuery.value = '';
  selectedCategory.value = null;
  selectedSubcategory.value = null;
  filtros.distancia_max = 50;
  filtros.rating_min = 0;
  filtros.disponivel = 'todos';
  filtros.categoria_id = null;
  filtros.subcategoria_id = null;
  filtros.ordenar_por = 'rating_desc';
  subcategorias.value = [];
  page.value = 1;
  void carregarPrestadores(true);
};

const clearAllFilters = (): void => {
  clearFilters();
  showFilters.value = false;
  $q.notify({
    type: 'positive',
    message: 'Todos os filtros foram limpos',
    position: 'top',
    timeout: 1500,
  });
};

const applyFilters = (): void => {
  showFilters.value = false;
  if (filtros.categoria_id) {
    selectedCategory.value = filtros.categoria_id;
    carregarSubcategorias();
  } else {
    selectedCategory.value = null;
    subcategorias.value = [];
  }
  if (filtros.subcategoria_id) {
    selectedSubcategory.value = filtros.subcategoria_id;
  } else {
    selectedSubcategory.value = null;
  }
  page.value = 1;
  void carregarPrestadores(true);
  $q.notify({
    type: 'info',
    message: `${activeFiltersCount.value} filtro(s) aplicado(s)`,
    position: 'top',
    timeout: 1500,
  });
};

watch(
  [
    () => filtros.distancia_max,
    () => filtros.rating_min,
    () => filtros.disponivel,
    () => filtros.ordenar_por,
  ],
  () => {
    if (!showFilters.value) {
      page.value = 1;
      void carregarPrestadores(true);
    }
  },
);

onMounted(async () => {
  await carregarDadosIniciais();
});
</script>

<style scoped lang="scss">
.lista-prestadores-page {
  background: #f8f9fa;
  min-height: 100vh;
}

// ==========================================
// SKELETON LOADING STYLES
// ==========================================

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 0;
}

.skeleton-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-search {
  flex: 1;
  height: 44px;
  border-radius: 30px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-filter-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-categories {
  background: white;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-category-chip {
  width: 80px;
  height: 32px;
  border-radius: 30px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-cards {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
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
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-badge {
  width: 70px;
  height: 24px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-30 {
  width: 30%;
}
.w-40 {
  width: 40%;
}
.w-50 {
  width: 50%;
}
.w-60 {
  width: 60%;
}

// ==========================================
// ESTILOS NORMAIS
// ==========================================

.search-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;

  .search-input {
    :deep(.q-field__control) {
      border-radius: 30px;
      height: 44px;
    }
  }
}

.categories-chips {
  background: white;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  .chips-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 3px;
    }
  }

  .category-chip {
    border-radius: 30px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.subcategories-chips {
  background: white;
  padding: 8px 0 12px;
  border-bottom: 1px solid #f0f0f0;

  .sub-header {
    padding: 0 4px 8px 4px;
  }

  .chips-scroll {
    display: flex;
    gap: 6px;
    overflow-x: auto;
  }
}

.active-filters {
  background: white;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.results-section {
  min-height: 60vh;
}

.prestador-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .prestador-nome {
    font-weight: 600;
    font-size: 1rem;
    color: #212529;
  }

  .rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .rating-value {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .rating-count {
      font-size: 0.7rem;
      color: #6c757d;
    }
  }

  .distancia {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .distancia-value {
      font-size: 0.8rem;
      color: #6c757d;
    }
  }

  .categorias-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;

    .categoria-chip {
      background: #e9ecef;
      color: #495057;
      font-size: 0.7rem;

      &.more {
        background: #dee2e6;
      }
    }
  }

  .status-badge {
    flex-shrink: 0;
  }
}

// ✅ ESTILO PARA O AVATAR PLACEHOLDER COM INICIAIS
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .prestador-card {
    .prestador-nome {
      font-size: 0.9rem;
    }

    .categorias-preview {
      .categoria-chip {
        font-size: 0.6rem;
      }
    }
  }

  .avatar-placeholder {
    font-size: 1rem;
  }
}
</style>
