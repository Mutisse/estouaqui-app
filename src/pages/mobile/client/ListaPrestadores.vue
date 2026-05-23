<template>
  <div class="lista-prestadores-page">

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="isLoading" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-search"></div>
        <div class="skeleton-filter-btn"></div>
      </div>
      <div class="skeleton-categories">
        <div v-for="i in 6" :key="i" class="skeleton-category-chip"></div>
      </div>
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

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- Header com busca -->
      <div class="search-header">
        <div class="search-header__container">
          <button class="back-btn" @click="() => void router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div class="search-input-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Pesquisar prestadores..."
              @input="handleSearch"
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''; handleSearch()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <button class="filter-btn" @click="showFilters = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
              <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="18" r="2" fill="currentColor" stroke="none"/>
            </svg>
            <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
          </button>
        </div>
      </div>

      <!-- Categorias em chips -->
      <div class="categories-section">
        <div class="categories-scroll">
          <button
            v-for="cat in categorias"
            :key="cat.id"
            class="category-chip"
            :class="{ active: selectedCategory === cat.id }"
            @click="() => void filtrarPorCategoria(cat.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
            </svg>
            {{ cat.nome }}
          </button>
        </div>
      </div>

      <!-- Subcategorias -->
      <div v-if="selectedCategory && subcategorias.length > 0" class="subcategories-section">
        <div class="subcategories-header">
          <span>Tipos de serviço</span>
          <button v-if="selectedSubcategory" class="clear-sub-btn" @click="() => void limparSubcategoria()">Limpar</button>
        </div>
        <div class="subcategories-scroll">
          <button
            v-for="sub in subcategorias"
            :key="sub.id"
            class="subcategory-chip"
            :class="{ active: selectedSubcategory === sub.id }"
            @click="() => void filtrarPorSubcategoria(sub.id)"
          >
            {{ sub.nome }}
          </button>
        </div>
      </div>

      <!-- Filtros ativos -->
      <div v-if="activeFiltersCount > 0" class="active-filters">
        <div class="active-filters__header">
          <span>Filtros ativos:</span>
          <button class="clear-all" @click="() => void clearAllFilters()">Limpar todos</button>
        </div>
        <div class="active-filters__list">
          <div v-if="filtros.distancia_max < 50" class="filter-chip" @click="filtros.distancia_max = 50; void carregarPrestadores(true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            ≤ {{ filtros.distancia_max }}km
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="remove-icon">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div v-if="filtros.rating_min > 0" class="filter-chip rating" @click="filtros.rating_min = 0; void carregarPrestadores(true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
              <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
            </svg>
            ≥ {{ filtros.rating_min }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="remove-icon">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div v-if="filtros.disponivel !== 'todos'" class="filter-chip" :class="filtros.disponivel === 'true' ? 'available' : 'unavailable'" @click="filtros.disponivel = 'todos'; void carregarPrestadores(true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ filtros.disponivel === 'true' ? 'Disponível' : 'Indisponível' }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="remove-icon">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div v-if="selectedCategory" class="filter-chip" @click="clearFilters">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
            </svg>
            {{ categoriaNome }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="remove-icon">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-section">
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>A carregar prestadores...</p>
        </div>

        <div v-else-if="prestadores.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Nenhum prestador encontrado</h3>
          <p>Tente ajustar os filtros ou pesquisar por outro termo</p>
          <button class="empty-action" @click="() => void clearFilters()">Limpar filtros</button>
        </div>

        <div v-else class="prestadores-grid">
          <div
            v-for="prestador in prestadores"
            :key="prestador.id"
            class="prestador-card"
            @click="() => void irParaPerfil(prestador.id)"
          >
            <div class="prestador-card__avatar">
              <img
                v-if="prestador.foto && !imageErrors[prestador.id]"
                :src="prestador.foto"
                :alt="prestador.nome"
                @error="(e) => handleImageError(e, prestador)"
              />
              <div v-else class="avatar-placeholder" :style="getAvatarStyle(prestador.id)">
                {{ getInitials(prestador.nome) }}
              </div>
              <div class="status-dot" :class="prestador.disponivel !== false ? 'online' : 'offline'"></div>
            </div>

            <div class="prestador-card__info">
              <div class="prestador-card__header">
                <h4 class="prestador-name">{{ prestador.nome }}</h4>
                <svg v-if="prestador.verificado" width="16" height="16" viewBox="0 0 24 24" fill="#5B4BF5" class="verified-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              <div class="prestador-card__stats">
                <div class="rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                  </svg>
                  <span class="rating-value">{{ (prestador.media_avaliacao || 0).toFixed(1) }}</span>
                  <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                </div>
                <div class="distance">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ formatarDistancia(prestador.distancia) }}</span>
                </div>
              </div>

              <div class="prestador-card__categories">
                <span v-for="cat in prestador.categorias?.slice(0, 2)" :key="cat.id" class="category-tag">
                  {{ cat.nome }}
                </span>
                <span v-if="prestador.categorias && prestador.categorias.length > 2" class="category-tag more">
                  +{{ prestador.categorias.length - 2 }}
                </span>
              </div>
            </div>

            <div class="prestador-card__status">
              <span class="status-badge" :class="prestador.disponivel !== false ? 'available' : 'unavailable'">
                {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" @click="() => void loadMore()" :disabled="loadingMore">
            <span v-if="!loadingMore">Carregar mais</span>
            <div v-else class="load-more-spinner"></div>
          </button>
        </div>
      </div>
    </template>

    <!-- ===== DRAWER DE FILTROS ===== -->
    <div class="filters-drawer" :class="{ open: showFilters }">
      <div class="filters-drawer__overlay" @click="showFilters = false"></div>
      <div class="filters-drawer__content">
        <div class="filters-drawer__header">
          <h3>Filtros avançados</h3>
          <button class="close-btn" @click="showFilters = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="filters-drawer__body">
          <div class="filter-group">
            <label>Distância máxima</label>
            <div class="slider-value">
              <span>Até <strong>{{ filtros.distancia_max }} km</strong></span>
              <button v-if="filtros.distancia_max < 50" class="reset-btn" @click="filtros.distancia_max = 50">Limpar</button>
            </div>
            <input type="range" v-model.number="filtros.distancia_max" :min="1" :max="50" :step="1" class="range-slider" />
          </div>

          <div class="filter-group">
            <label>Avaliação mínima</label>
            <div class="rating-filter">
              <div class="stars">
                <button v-for="star in 5" :key="star" class="star-btn" @click="filtros.rating_min = star">
                  <svg width="28" height="28" viewBox="0 0 24 24" :fill="star <= filtros.rating_min ? '#F59E0B' : 'none'" stroke="#D1D5DB" stroke-width="1.5">
                    <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                  </svg>
                </button>
              </div>
              <button v-if="filtros.rating_min > 0" class="reset-btn" @click="filtros.rating_min = 0">Limpar</button>
            </div>
          </div>

          <div class="filter-group">
            <label>Disponibilidade</label>
            <div class="radio-group">
              <label class="radio-item" :class="{ active: filtros.disponivel === 'todos' }">
                <input type="radio" value="todos" v-model="filtros.disponivel" /> Todos
              </label>
              <label class="radio-item" :class="{ active: filtros.disponivel === 'true' }">
                <input type="radio" value="true" v-model="filtros.disponivel" /> Disponível
              </label>
              <label class="radio-item" :class="{ active: filtros.disponivel === 'false' }">
                <input type="radio" value="false" v-model="filtros.disponivel" /> Indisponível
              </label>
            </div>
          </div>

          <div class="filter-group">
            <label>Categoria</label>
            <select v-model="filtros.categoria_id" class="filter-select" @change="(e: Event) => onCategoriaChange(Number((e.target as HTMLSelectElement).value) || null)">
              <option :value="null">Todas categorias</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
            </select>
          </div>

          <div v-if="subcategorias.length > 0" class="filter-group">
            <label>Tipo de serviço</label>
            <select v-model="filtros.subcategoria_id" class="filter-select">
              <option :value="null">Todos os tipos</option>
              <option v-for="sub in subcategorias" :key="sub.id" :value="sub.id">{{ sub.nome }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Ordenar por</label>
            <select v-model="filtros.ordenar_por" class="filter-select">
              <option value="rating_desc">🌟 Melhor avaliação</option>
              <option value="distancia_asc">📍 Mais próximo</option>
              <option value="servicos_desc">📋 Mais serviços</option>
            </select>
          </div>
        </div>

        <div class="filters-drawer__footer">
          <button class="clear-all-btn" @click="() => void clearAllFilters()">Limpar tudo</button>
          <button class="apply-btn" @click="() => void applyFilters()">Ver resultados</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClientePublicStore, type PrestadorData } from 'src/stores/client/cliente-public-store';

defineOptions({ name: 'ListaPrestadoresPage' });



const router = useRouter();
const $q = useQuasar();
const publicStore = useClientePublicStore();

const isLoading = ref(true);
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

const avatarGradients = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

const getAvatarStyle = (id: number) => {
  const idx = Math.abs(id) % avatarGradients.length;
  return { background: avatarGradients[idx] };
};

const filtros = reactive({
  distancia_max: 50,
  rating_min: 0,
  disponivel: 'todos' as 'todos' | 'true' | 'false',
  categoria_id: null as number | null,
  subcategoria_id: null as number | null,
  ordenar_por: 'rating_desc' as 'rating_desc' | 'distancia_asc' | 'servicos_desc',
});

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

const getInitials = (nome: string): string => {
  if (!nome || nome.trim() === '') return '??';
  const partes = nome.trim().split(' ');
  const primeiraParte = partes[0];
  if (!primeiraParte) return '??';
  if (partes.length === 1) {
    if (primeiraParte.length >= 2) return primeiraParte.substring(0, 2).toUpperCase();
    return (primeiraParte[0] || '?') + '?';
  }
  const ultimaParte = partes[partes.length - 1];
  if (!ultimaParte) {
    if (primeiraParte.length >= 2) return primeiraParte.substring(0, 2).toUpperCase();
    return (primeiraParte[0] || '?') + '?';
  }
  const primeiraLetra = primeiraParte[0] || '';
  const ultimaLetra = ultimaParte[0] || '';
  if (!primeiraLetra && !ultimaLetra) return '??';
  if (!primeiraLetra) return (ultimaLetra + '?').toUpperCase();
  if (!ultimaLetra) return (primeiraLetra + '?').toUpperCase();
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

const handleImageError = (event: Event, prestador: PrestadorData) => {
  const img = event.target as HTMLImageElement;
  if (!imageErrors.value[prestador.id]) {
    imageErrors.value[prestador.id] = true;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'avatar-placeholder';
      placeholder.style.cssText = `background: ${avatarGradients[Math.abs(prestador.id) % avatarGradients.length]}; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; font-weight: 700; color: white; font-size: 1rem; text-transform: uppercase;`;
      placeholder.innerText = getInitials(prestador.nome);
      parent.appendChild(placeholder);
    }
  }
};

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
    const cats = await publicStore.fetchCategorias(true);
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
    const result = await publicStore.buscarPrestadoresPorNome(searchQuery.value || '');

    let prestadoresData: PrestadorData[] = [];
    let pagination = null;

    if (Array.isArray(result)) {
      prestadoresData = result;
      hasMore.value = false;
    } else if (result && typeof result === 'object') {
      const obj = result as Record<string, unknown>;
      if ('data' in obj && Array.isArray(obj.data)) {
        prestadoresData = obj.data as PrestadorData[];
        pagination = obj;
        hasMore.value = (pagination?.current_page || 1) < (pagination?.last_page || 1);
      } else {
        prestadoresData = [];
        hasMore.value = false;
      }
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
    $q.notify({ type: 'negative', message: 'Erro ao carregar lista de prestadores', position: 'top' });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const carregarDadosIniciais = async () => {
  isLoading.value = true;
  try {
    await carregarCategorias();
    await carregarPrestadores(true);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setTimeout(() => { isLoading.value = false; }, 600);
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
  $q.notify({ type: 'positive', message: 'Todos os filtros foram limpos', position: 'top', timeout: 1500 });
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
  $q.notify({ type: 'info', message: `${activeFiltersCount.value} filtro(s) aplicado(s)`, position: 'top', timeout: 1500 });
};

onMounted(() => {
  void carregarDadosIniciais();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading { background: $gray-light; min-height: 100vh; }
.skeleton-header {
  background: $white; padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid $border;
}
.skeleton-back-btn, .skeleton-filter-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-search {
  flex: 1; height: 44px; border-radius: 30px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-categories {
  background: $white; padding: 12px 16px; display: flex; gap: 8px; overflow-x: auto; border-bottom: 1px solid $gray-light;
}
.skeleton-category-chip {
  width: 80px; height: 32px; border-radius: 30px; flex-shrink: 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-cards { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.skeleton-card {
  background: $white; border-radius: $radius-sm; padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.skeleton-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-card-info { flex: 1; }
.skeleton-line {
  height: 14px; border-radius: 7px; margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-badge { width: 70px; height: 24px; border-radius: 20px; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w-30 { width: 30%; } .w-40 { width: 40%; } .w-50 { width: 50%; } .w-60 { width: 60%; }

// =====================
// HEADER BUSCA
// =====================
.lista-prestadores-page { background: $gray-light; min-height: 100vh; }

.search-header {
  background: $white; border-bottom: 1px solid $border; position: sticky; top: 0; z-index: 10; padding: 12px 16px;
  &__container { display: flex; align-items: center; gap: 12px; }
}

.back-btn, .filter-btn {
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: $gray-light; border: none; cursor: pointer; color: $gray; transition: all 0.2s; position: relative;
  &:hover { background: $accent-light; color: $accent; }
}

.filter-badge {
  position: absolute; top: -4px; right: -4px; background: $accent; color: $white;
  font-size: 10px; font-weight: 600; min-width: 18px; height: 18px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
}

.search-input-wrapper {
  flex: 1; position: relative; display: flex; align-items: center;
  .search-icon { position: absolute; left: 14px; color: $gray; }
  .search-input {
    width: 100%; padding: 10px 40px 10px 44px; border: 1px solid $border; border-radius: 40px;
    font-size: 0.85rem; background: $gray-light; transition: all 0.2s;
    &:focus { outline: none; border-color: $accent; background: $white; }
  }
  .clear-btn {
    position: absolute; right: 12px; background: none; border: none; cursor: pointer; color: $gray;
    display: flex; align-items: center; justify-content: center; padding: 4px;
    &:hover { color: $dark; }
  }
}

// =====================
// CATEGORIAS
// =====================
.categories-section {
  background: $white; padding: 12px 16px; border-bottom: 1px solid $border;
  .categories-scroll { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: thin;
    &::-webkit-scrollbar { height: 3px; }
  }
}

.category-chip {
  display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 40px;
  background: $gray-light; border: none; font-size: 0.8rem; font-weight: 500; color: $gray;
  white-space: nowrap; cursor: pointer; transition: all 0.2s;
  svg { flex-shrink: 0; }
  &:hover { background: $accent-light; color: $accent; }
  &.active { background: $accent; color: $white; }
}

// =====================
// SUBCATEGORIAS
// =====================
.subcategories-section {
  background: $white; padding: 10px 16px 12px; border-bottom: 1px solid $border;
  .subcategories-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
    span { font-size: 0.7rem; color: $gray; }
    .clear-sub-btn { background: none; border: none; font-size: 0.7rem; color: $accent; cursor: pointer; }
  }
  .subcategories-scroll { display: flex; gap: 8px; overflow-x: auto;
    &::-webkit-scrollbar { height: 2px; }
  }
}

.subcategory-chip {
  padding: 5px 14px; border-radius: 30px; background: $gray-light; border: none;
  font-size: 0.75rem; font-weight: 500; color: $gray; white-space: nowrap; cursor: pointer; transition: all 0.2s;
  &:hover { background: $accent-light; color: $accent; }
  &.active { background: $accent; color: $white; }
}

// =====================
// FILTROS ATIVOS
// =====================
.active-filters {
  background: $white; padding: 10px 16px; border-bottom: 1px solid $border;
  &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    span { font-size: 0.7rem; color: $gray; }
    .clear-all { background: none; border: none; font-size: 0.7rem; color: $accent; cursor: pointer; }
  }
  &__list { display: flex; flex-wrap: wrap; gap: 8px; }
}

.filter-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: $gray-light;
  border-radius: 30px; font-size: 0.7rem; font-weight: 500; color: $gray; cursor: pointer; transition: all 0.2s;
  .remove-icon { opacity: 0.5; transition: opacity 0.2s; }
  &:hover { background: $accent-light; color: $accent; .remove-icon { opacity: 1; } }
  &.rating { color: $warning; background: rgba(245, 158, 11, 0.1); }
  &.available { background: rgba(16, 185, 129, 0.1); color: $success; }
  &.unavailable { background: rgba(239, 68, 68, 0.1); color: $danger; }
}

// =====================
// RESULTADOS
// =====================
.results-section { padding: 16px; }

.loading-state { text-align: center; padding: 60px 20px;
  .loader { width: 40px; height: 40px; border: 3px solid $accent-light; border-top-color: $accent; border-radius: 50%; margin: 0 auto 16px; animation: spin 0.8s linear infinite; }
  p { color: $gray; font-size: 0.85rem; }
}

.empty-state { text-align: center; padding: 60px 20px;
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  h3 { font-size: 1rem; font-weight: 600; color: $dark; margin-bottom: 8px; }
  p { font-size: 0.8rem; color: $gray; margin-bottom: 20px; }
  .empty-action { background: $accent-light; color: $accent; border: none; padding: 8px 24px; border-radius: 30px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    &:hover { background: $accent; color: $white; }
  }
}

.prestadores-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.prestador-card {
  display: flex; align-items: center; gap: 14px; padding: 16px; background: $white;
  border-radius: $radius; border: 1px solid $border; cursor: pointer; transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: $accent; }

  &__avatar { position: relative; width: 60px; height: 60px; flex-shrink: 0;
    img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  }

  &__info { flex: 1; min-width: 0; }
  &__header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  &__stats { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  &__categories { display: flex; flex-wrap: wrap; gap: 6px; }
  &__status { flex-shrink: 0; }
}

.prestador-name { font-size: 0.95rem; font-weight: 600; color: $dark; margin: 0; }

.rating { display: flex; align-items: center; gap: 4px;
  .rating-value { font-weight: 600; font-size: 0.8rem; color: $dark; }
  .rating-count { font-size: 0.7rem; color: $gray; }
}
.distance { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: $gray; }

.category-tag {
  padding: 3px 10px; background: $gray-light; border-radius: 20px; font-size: 0.65rem; font-weight: 500; color: $gray;
  &.more { background: $border; }
}

.status-dot {
  position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid $white;
  &.online { background: $success; }
  &.offline { background: $gray; }
}

.status-badge {
  padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
  &.available { background: rgba(16, 185, 129, 0.1); color: $success; }
  &.unavailable { background: rgba(239, 68, 68, 0.1); color: $danger; }
}

// =====================
// LOAD MORE
// =====================
.load-more { text-align: center; margin-top: 24px; }
.load-more-btn {
  background: $white; border: 1px solid $border; padding: 10px 24px; border-radius: 40px;
  font-size: 0.85rem; font-weight: 500; color: $accent; cursor: pointer; transition: all 0.2s;
  &:hover { background: $accent-light; border-color: $accent; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.load-more-spinner { width: 20px; height: 20px; border: 2px solid $accent-light; border-top-color: $accent; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

// =====================
// DRAWER FILTROS
// =====================
.filters-drawer {
  position: fixed; inset: 0; z-index: 1000; visibility: hidden;
  &.open { visibility: visible; .filters-drawer__overlay { opacity: 1; } .filters-drawer__content { transform: translateX(0); } }
  &__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); opacity: 0; transition: opacity 0.3s; }
  &__content {
    position: absolute; right: 0; top: 0; bottom: 0; width: 85%; max-width: 360px;
    background: $white; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s;
  }
  &__header {
    display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid $border;
    h3 { font-size: 1.1rem; font-weight: 600; color: $dark; margin: 0; }
    .close-btn { width: 36px; height: 36px; border-radius: 50%; background: $gray-light; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: $gray; transition: all 0.2s;
      &:hover { background: $accent-light; color: $accent; }
    }
  }
  &__body { flex: 1; overflow-y: auto; padding: 20px; }
  &__footer { display: flex; gap: 12px; padding: 20px; border-top: 1px solid $border; }
}

.filter-group { margin-bottom: 24px;
  label { display: block; font-size: 0.85rem; font-weight: 500; color: $dark; margin-bottom: 10px; }
}

.slider-value { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
  font-size: 0.75rem; strong { color: $accent; }
  .reset-btn { background: none; border: none; font-size: 0.7rem; color: $accent; cursor: pointer; }
}

.range-slider { width: 100%; height: 4px; -webkit-appearance: none; background: $border; border-radius: 4px;
  &::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: $accent; cursor: pointer; }
}

.rating-filter { display: flex; justify-content: space-between; align-items: center; }
.stars { display: flex; gap: 4px; }
.star-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; &:hover { transform: scale(1.1); } }

.radio-group { display: flex; gap: 16px; }
.radio-item {
  display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: $gray; cursor: pointer;
  input { accent-color: $accent; }
  &.active { color: $accent; font-weight: 500; }
}

.filter-select {
  width: 100%; padding: 10px 12px; border: 1px solid $border; border-radius: $radius-xs;
  font-size: 0.85rem; background: $white; cursor: pointer;
  &:focus { outline: none; border-color: $accent; }
}

.clear-all-btn, .apply-btn {
  flex: 1; padding: 12px; border-radius: $radius-sm; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.clear-all-btn { background: none; border: 1px solid $border; color: $gray; &:hover { background: $gray-light; } }
.apply-btn { background: $accent; border: none; color: $white; &:hover { background: lighten($accent, 6%); transform: translateY(-1px); } }

.avatar-placeholder {
  width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: white; font-size: 1rem; text-transform: uppercase;
}
</style>
