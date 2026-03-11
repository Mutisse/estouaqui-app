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
          v-for="cat in categorias"
          :key="cat.id"
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

    <!-- Resultados -->
    <div class="results-section q-pa-md">
      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="50px" />
        <p class="q-mt-md text-grey-7">A carregar prestadores...</p>
      </div>

      <!-- Sem resultados -->
      <div v-else-if="prestadores.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="64px" color="grey-5" />
        <p class="text-h6 text-grey-7 q-mt-md">Nenhum prestador encontrado</p>
        <p class="text-grey-6">Tente ajustar os filtros ou pesquisar por outro termo</p>
        <q-btn flat color="primary" label="Limpar filtros" @click="clearFilters" no-caps />
      </div>

      <!-- Lista de prestadores -->
      <q-list v-else bordered separator>
        <q-item
          v-for="prestador in prestadores"
          :key="prestador.id"
          clickable
          v-ripple
          :to="`/mobile/perfil-prestador/${prestador.id}`"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="prestador.avatar" :alt="prestador.nome">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ prestador.nome }}</q-item-label>
            <q-item-label caption>
              <q-icon name="star" color="yellow" size="16px" /> {{ prestador.rating }}
              - a {{ prestador.distancia }}km de distância
            </q-item-label>
            <q-item-label caption class="text-primary">
              {{ prestador.categoria }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge :color="prestador.disponivel ? 'primary' : 'grey'">
              {{ prestador.disponivel ? 'Disponível' : 'Indisponível' }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Load more -->
      <div v-if="hasMore && prestadores.length > 0" class="text-center q-mt-lg">
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

          <!-- Categoria -->
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

defineOptions({
  name: 'ListaPrestadoresPage'
});

const router = useRouter();
const route = useRoute();

// Tipos
interface Prestador {
  id: number;
  nome: string;
  avatar: string;
  rating: number;
  distancia: number;
  disponivel: boolean;
  categoria: string;
}

interface Categoria {
  id: number;
  nome: string;
  icone?: string;
}

interface Filtros {
  distancia_max: number;
  rating_min: number;
  disponivel: string;
  categoria_id: number | null;
  ordenar_por: string;
}

// Estados
const loading = ref<boolean>(true);
const loadingMore = ref<boolean>(false);
const searchQuery = ref<string>('');
const showFilters = ref<boolean>(false);
const page = ref<number>(1);
const hasMore = ref<boolean>(false);

// Dados mockados
const prestadores = ref<Prestador[]>([
  {
    id: 1,
    nome: 'João Silva',
    avatar: 'https://cdn.quasar.dev/img/avatar.png',
    rating: 4.9,
    distancia: 1.2,
    disponivel: true,
    categoria: 'Eletricista'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    rating: 4.8,
    distancia: 2.5,
    disponivel: true,
    categoria: 'Limpeza'
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    rating: 4.7,
    distancia: 3.0,
    disponivel: false,
    categoria: 'Canalizador'
  },
  {
    id: 4,
    nome: 'Ana Costa',
    avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    rating: 5.0,
    distancia: 0.8,
    disponivel: true,
    categoria: 'Pintora'
  }
]);

const categorias = ref<Categoria[]>([
  { id: 1, nome: 'Eletricista', icone: 'bolt' },
  { id: 2, nome: 'Canalizador', icone: 'water_drop' },
  { id: 3, nome: 'Pintor', icone: 'brush' },
  { id: 4, nome: 'Limpeza', icone: 'cleaning_services' },
  { id: 5, nome: 'Informático', icone: 'computer' },
  { id: 6, nome: 'Cabeleireiro', icone: 'content_cut' }
]);

// Filtros
const filtros = reactive<Filtros>({
  distancia_max: 20,
  rating_min: 0,
  disponivel: 'todos',
  categoria_id: null,
  ordenar_por: 'rating_desc'
});

// Categoria selecionada (para chips)
const selectedCategory = ref<number | null>(null);

// Options
const disponibilidadeOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Disponível', value: 'true' },
  { label: 'Indisponível', value: 'false' }
];

const ordenacaoOptions = [
  { label: 'Melhor avaliação', value: 'rating_desc' },
  { label: 'Mais próximo', value: 'distancia_asc' },
  { label: 'Menor preço', value: 'preco_asc' },
  { label: 'Maior preço', value: 'preco_desc' }
];

// Computed
const activeFiltersCount = computed<number>(() => {
  let count = 0;
  if (filtros.distancia_max < 50) count++;
  if (filtros.rating_min > 0) count++;
  if (filtros.disponivel !== 'todos') count++;
  if (filtros.categoria_id) count++;
  if (filtros.ordenar_por !== 'rating_desc') count++;
  return count;
});

// Timeout para debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const carregarPrestadores = (resetPage = true): void => {
  if (resetPage) {
    page.value = 1;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  // Simular chamada API com timeout
  setTimeout(() => {
    if (resetPage) {
      // Reset para os dados iniciais
      prestadores.value = [
        {
          id: 1,
          nome: 'João Silva',
          avatar: 'https://cdn.quasar.dev/img/avatar.png',
          rating: 4.9,
          distancia: 1.2,
          disponivel: true,
          categoria: 'Eletricista'
        },
        {
          id: 2,
          nome: 'Maria Santos',
          avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
          rating: 4.8,
          distancia: 2.5,
          disponivel: true,
          categoria: 'Limpeza'
        },
        {
          id: 3,
          nome: 'Pedro Oliveira',
          avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
          rating: 4.7,
          distancia: 3.0,
          disponivel: false,
          categoria: 'Canalizador'
        },
        {
          id: 4,
          nome: 'Ana Costa',
          avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
          rating: 5.0,
          distancia: 0.8,
          disponivel: true,
          categoria: 'Pintora'
        }
      ];
    } else {
      // Adicionar mais itens para paginação
      const maisItens: Prestador[] = [
        {
          id: 5,
          nome: 'Carlos Mendes',
          avatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
          rating: 4.6,
          distancia: 4.2,
          disponivel: true,
          categoria: 'Motorista'
        },
        {
          id: 6,
          nome: 'Sofia Rodrigues',
          avatar: 'https://cdn.quasar.dev/img/avatar6.jpg',
          rating: 4.9,
          distancia: 1.5,
          disponivel: true,
          categoria: 'Manicure'
        }
      ];
      prestadores.value = [...prestadores.value, ...maisItens];
    }

    hasMore.value = prestadores.value.length < 20;
    loading.value = false;
    loadingMore.value = false;
  }, 800);
};

// Handlers
const handleSearch = (): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    carregarPrestadores(true);
  }, 500);
};

const filtrarPorCategoria = (categoriaId: number): void => {
  if (selectedCategory.value === categoriaId) {
    selectedCategory.value = null;
    filtros.categoria_id = null;
  } else {
    selectedCategory.value = categoriaId;
    filtros.categoria_id = categoriaId;
  }
  carregarPrestadores(true);
};

const loadMore = (): void => {
  if (!hasMore.value || loadingMore.value) return;
  page.value++;
  carregarPrestadores(false);
};

const clearFilters = (): void => {
  searchQuery.value = '';
  selectedCategory.value = null;
  filtros.distancia_max = 20;
  filtros.rating_min = 0;
  filtros.disponivel = 'todos';
  filtros.categoria_id = null;
  filtros.ordenar_por = 'rating_desc';

  carregarPrestadores(true);
};

const clearAllFilters = (): void => {
  clearFilters();
  showFilters.value = false;
};

const applyFilters = (): void => {
  showFilters.value = false;
  if (filtros.categoria_id) {
    selectedCategory.value = filtros.categoria_id;
  } else {
    selectedCategory.value = null;
  }
  carregarPrestadores(true);
};

// Lifecycle
onMounted(() => {
  // Verificar se tem categoria na URL
  const categoriaParam = route.query.categoria;
  if (categoriaParam) {
    const cat = categorias.value.find(c =>
      c.nome.toLowerCase() === String(categoriaParam).toLowerCase()
    );
    if (cat) {
      selectedCategory.value = cat.id;
      filtros.categoria_id = cat.id;
    }
  }

  // Carregar dados iniciais
  carregarPrestadores(true);
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

.results-section {
  background: #f5f5f5;
}

.fixed-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}
</style>
