<template>
  <q-page class="lista-prestadores-page">
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
          @update:model-value="handleSearch"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn flat round icon="tune" @click="showFilters = true">
          <q-badge v-if="activeFiltersCount > 0" color="primary" floating>{{ activeFiltersCount }}</q-badge>
        </q-btn>
      </div>
    </div>

    <!-- Categorias em chips -->
    <div class="categories-chips q-px-md q-mb-md">
      <div class="row q-gutter-sm" style="overflow-x: auto; flex-wrap: nowrap;">
        <q-chip
          v-for="(cat, index) in categorias"
          :key="cat?.id || `cat-${index}`"
          :clickable="true"
          :selected="selectedCategory === cat.id"
          :color="selectedCategory === cat.id ? 'primary' : 'grey-3'"
          :text-color="selectedCategory === cat.id ? 'white' : 'grey-9'"
          @click="filtrarPorCategoria(cat.id)"
          class="category-chip"
        >
          <q-icon :name="cat.icone || 'category'" size="16px" class="q-mr-xs" />
          {{ cat.nome }}
        </q-chip>
      </div>
    </div>

    <!-- Subcategorias (tipos de serviço) -->
    <div v-if="selectedCategory" class="subcategories-chips q-px-md q-mb-md">
      <div class="row items-center q-gutter-sm">
        <span class="text-caption text-grey-6">Tipos de serviço:</span>
        <q-chip
          v-for="(sub, index) in subcategorias"
          :key="sub?.id || `sub-${index}`"
          :clickable="true"
          :selected="selectedSubcategory === sub.id"
          :color="selectedSubcategory === sub.id ? 'secondary' : 'grey-2'"
          :text-color="selectedSubcategory === sub.id ? 'white' : 'grey-8'"
          @click="filtrarPorSubcategoria(sub.id)"
          size="sm"
          dense
        >
          {{ sub.nome }}
        </q-chip>
      </div>
    </div>

    <!-- Resultados -->
    <div class="results-section q-pa-md">
      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="50px" />
        <p class="q-mt-md text-grey-7">A carregar prestadores...</p>
      </div>

      <!-- Sem resultados -->
      <div v-else-if="!prestadores || prestadores.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="64px" color="grey-5" />
        <p class="text-h6 text-grey-7 q-mt-md">Nenhum prestador encontrado</p>
        <p class="text-grey-6">Tente ajustar os filtros ou pesquisar por outro termo</p>
        <q-btn flat color="primary" label="Limpar filtros" @click="clearFilters" no-caps />
      </div>

      <!-- Lista de prestadores -->
      <q-list v-else bordered separator>
        <q-item
          v-for="(prestador, index) in prestadores"
          :key="prestador?.id || `prestador-${index}`"
          clickable
          v-ripple
          :to="`/mobile/perfil-prestador/${prestador?.id}`"
        >
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="prestador?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador?.nome || 'Prestador')}&background=667eea&color=fff`"
                :alt="prestador?.nome || 'Prestador'"
              >
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ prestador?.nome || 'Nome não disponível' }}</q-item-label>
            <q-item-label caption>
              <q-icon name="star" color="yellow" size="16px" />
              {{ (prestador?.media_avaliacao || 0).toFixed(1) }}
              <span v-if="prestador?.distancia"> - a {{ formatarDistancia(prestador.distancia) }} de distância</span>
            </q-item-label>
            <q-item-label caption class="text-primary">
              {{ prestador?.categorias && prestador.categorias.length
                 ? prestador.categorias.map((c: { nome: string }) => c.nome).join(', ')
                 : 'Sem categoria' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge :color="prestador?.disponivel !== false ? 'primary' : 'grey'">
              {{ prestador?.disponivel !== false ? 'Disponível' : 'Indisponível' }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Load more -->
      <div v-if="hasMore && prestadores && prestadores.length > 0" class="text-center q-mt-lg">
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

    <!-- Drawer de filtros -->
    <q-drawer
      v-model="showFilters"
      side="right"
      behavior="mobile"
      bordered
      :width="300"
      :breakpoint="0"
    >
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Filtros</q-toolbar-title>
        <q-btn flat round icon="close" v-close-popup />
      </q-toolbar>

      <q-scroll-area style="height: calc(100vh - 50px)">
        <q-list separator>
          <!-- Distância -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">Distância máxima</q-item-label>
              <q-item-label caption>Até {{ filtros.distancia_max }}km</q-item-label>
              <q-slider
                v-model="filtros.distancia_max"
                :min="1"
                :max="50"
                :step="1"
                label
                color="primary"
                class="q-mt-md"
              />
            </q-item-section>
          </q-item>

          <!-- Avaliação -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">Avaliação mínima</q-item-label>
              <q-rating
                v-model="filtros.rating_min"
                :max="5"
                size="32px"
                color="yellow-8"
                icon="star_border"
                icon-selected="star"
              />
            </q-item-section>
          </q-item>

          <!-- Disponibilidade -->
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">Disponibilidade</q-item-label>
              <q-option-group
                v-model="filtros.disponivel"
                :options="disponibilidadeOptions"
                type="radio"
                inline
              />
            </q-item-section>
          </q-item>

          <!-- Categoria Principal -->
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
                placeholder="Selecione uma categoria"
                @update:model-value="onCategoriaChange"
              />
            </q-item-section>
          </q-item>

          <!-- Subcategoria (tipo de serviço) -->
          <q-item v-if="subcategorias && subcategorias.length > 0">
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
                placeholder="Selecione um tipo de serviço"
              />
            </q-item-section>
          </q-item>

          <!-- Ordenação -->
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
              />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Botões de ação -->
        <div class="row q-pa-md q-gutter-sm">
          <q-btn
            flat
            color="primary"
            label="Limpar"
            @click="clearAllFilters"
            class="col"
            no-caps
          />
          <q-btn
            unelevated
            color="primary"
            label="Aplicar"
            @click="applyFilters"
            class="col"
            no-caps
          />
        </div>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClienteStore } from 'src/stores/cliente-store';

// Definir interfaces localmente
interface CategoriaData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  servicos_count: number;
}

interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  media_avaliacao: number;
  total_avaliacoes: number;
  verificado: boolean;
  categorias?: { id: number; nome: string }[] | null;
  distancia?: number;
  disponivel?: boolean;
}

interface Filtros {
  distancia_max: number;
  rating_min: number;
  disponivel: string;
  categoria_id: number | null;
  subcategoria_id: number | null;
  ordenar_por: string;
}

// Tipo para resposta paginada da API
type ApiResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
};

defineOptions({
  name: 'ListaPrestadoresPage'
});

const router = useRouter();
const route = useRoute();
const clienteStore = useClienteStore();

// Estados
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const showFilters = ref(false);
const page = ref(1);
const hasMore = ref(false);
const prestadores = ref<PrestadorData[]>([]);
const categorias = ref<CategoriaData[]>([]);
const subcategorias = ref<{ id: number; nome: string }[]>([]);
const selectedCategory = ref<number | null>(null);
const selectedSubcategory = ref<number | null>(null);

// Filtros
const filtros = reactive<Filtros>({
  distancia_max: 20,
  rating_min: 0,
  disponivel: 'todos',
  categoria_id: null,
  subcategoria_id: null,
  ordenar_por: 'rating_desc'
});

// Options
const disponibilidadeOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Disponível', value: 'true' },
  { label: 'Indisponível', value: 'false' }
];

const ordenacaoOptions = [
  { label: 'Melhor avaliação', value: 'rating_desc' },
  { label: 'Mais próximo', value: 'distancia_asc' },
  { label: 'Mais serviços', value: 'servicos_desc' }
];

// Computed
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

// Funções auxiliares
const formatarDistancia = (distancia?: number) => {
  if (!distancia) return 'distância não calculada';
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  }
  return `${distancia.toFixed(1)}km`;
};

// Carregar categorias
const carregarCategorias = async () => {
  try {
    const response = await clienteStore.fetchCategorias();
    categorias.value = response || [];
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    categorias.value = [];
  }
};

// Carregar subcategorias (tipos de serviço da categoria selecionada)
const carregarSubcategorias = () => {
  // TODO: Implementar quando houver endpoint de serviços por categoria
  subcategorias.value = [];
};

// Carregar prestadores
const carregarPrestadores = async (resetPage = true) => {
  if (resetPage) {
    page.value = 1;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const params: {
      page: number;
      per_page: number;
      busca?: string;
      categoria?: number;
      avaliacao_min?: number;
      disponivel?: boolean;
    } = {
      page: page.value,
      per_page: 20
    };

    if (searchQuery.value) params.busca = searchQuery.value;
    if (filtros.categoria_id) params.categoria = filtros.categoria_id;
    if (filtros.rating_min > 0) params.avaliacao_min = filtros.rating_min;
    if (filtros.disponivel === 'true') params.disponivel = true;
    if (filtros.disponivel === 'false') params.disponivel = false;

    // Usar o store para buscar prestadores
    const result: unknown = await clienteStore.buscarPrestadoresPorNome(params.busca || '');

    // ✅ CORREÇÃO: Extrair os dados do formato paginado com type guard
    let prestadoresData: PrestadorData[] = [];

    // Type guard para verificar se é uma resposta paginada
    const isPaginatedResponse = (obj: unknown): obj is ApiResponse<PrestadorData> => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'data' in obj &&
        Array.isArray((obj as ApiResponse<PrestadorData>).data)
      );
    };

    if (result && Array.isArray(result)) {
      // Caso 1: Já é um array
      prestadoresData = result;
      hasMore.value = false;
    } else if (isPaginatedResponse(result)) {
      // Caso 2: É um objeto paginado (formato da API)
      prestadoresData = result.data;
      hasMore.value = result.current_page < result.last_page;
      console.log(`Página ${result.current_page} de ${result.last_page}, total: ${result.total} prestadores`);
    } else {
      // Caso 3: Formato desconhecido
      prestadoresData = [];
      hasMore.value = false;
      console.warn('Formato de resposta inesperado:', result);
    }

    console.log(`Carregados ${prestadoresData.length} prestadores`);

    if (resetPage) {
      prestadores.value = prestadoresData;
    } else {
      prestadores.value = [...prestadores.value, ...prestadoresData];
    }

  } catch (error) {
    console.error('Erro ao carregar prestadores:', error);
    prestadores.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// Handlers
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    void carregarPrestadores(true);
  }, 500);
};

const filtrarPorCategoria = (categoriaId: number) => {
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

const filtrarPorSubcategoria = (subcategoriaId: number) => {
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

const onCategoriaChange = (categoriaId: number | null) => {
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

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return;
  page.value++;
  void carregarPrestadores(false);
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = null;
  selectedSubcategory.value = null;
  filtros.distancia_max = 20;
  filtros.rating_min = 0;
  filtros.disponivel = 'todos';
  filtros.categoria_id = null;
  filtros.subcategoria_id = null;
  filtros.ordenar_por = 'rating_desc';
  subcategorias.value = [];
  page.value = 1;
  void carregarPrestadores(true);
};

const clearAllFilters = () => {
  clearFilters();
  showFilters.value = false;
};

const applyFilters = () => {
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
};

// Watch para mudanças nos filtros
watch([() => filtros.distancia_max, () => filtros.rating_min, () => filtros.disponivel, () => filtros.ordenar_por], () => {
  if (!showFilters.value) {
    page.value = 1;
    void carregarPrestadores(true);
  }
});

// Lifecycle
onMounted(async () => {
  await carregarCategorias();

  // Verificar se tem categoria na URL
  const categoriaParam = route.query.categoria;
  if (categoriaParam && categorias.value && categorias.value.length > 0) {
    const cat = categorias.value.find((c: CategoriaData) =>
      c.nome.toLowerCase() === String(categoriaParam).toLowerCase()
    );
    if (cat) {
      selectedCategory.value = cat.id;
      filtros.categoria_id = cat.id;
      carregarSubcategorias();
    }
  }

  // Carregar dados iniciais
  await carregarPrestadores(true);
});
</script>

<style scoped lang="scss">
.lista-prestadores-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.search-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;

  .search-input {
    :deep(.q-field__control) {
      border-radius: 30px;
      height: 40px;
    }
  }
}

.categories-chips {
  background: white;
  padding: 10px 0;

  .category-chip {
    border-radius: 30px;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
}

.subcategories-chips {
  background: white;
  padding: 5px 0 10px;
  border-bottom: 1px solid #e0e0e0;
}

.results-section {
  background: #f5f5f5;
}
</style>
