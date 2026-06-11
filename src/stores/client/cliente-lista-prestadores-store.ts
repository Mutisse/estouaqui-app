// stores/client/cliente-lista-prestadores-store.ts
import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface PrestadorCategoria {
  id: number;
  nome: string;
  cor?: string;
  icone?: string;
}

export interface PrestadorListaItem {
  id: number;
  nome: string;
  foto: string | null;
  disponivel: boolean;
  verificado: boolean;
  media_avaliacao: number | null;
  total_avaliacoes: number;
  distancia?: number;
  categorias?: PrestadorCategoria[];
  profissao?: string;
}

export interface CategoriaData {
  id: number;
  nome: string;
  icone: string;
  cor?: string;
}

export interface SubcategoriaData {
  id: number;
  nome: string;
  categoria_id: number;
}

export interface FiltrosPrestadores {
  distancia_max: number;
  rating_min: number;
  disponivel: 'todos' | 'true' | 'false';
  categoria_id: number | null;
  subcategoria_id: number | null;
  ordenar_por: 'rating_desc' | 'distancia_asc' | 'servicos_desc';
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useListaPrestadoresStore = defineStore('clienteListaPrestadores', () => {
  // ===================== ESTADOS =====================
  const carregandoInicial = ref(true);
  const carregando = ref(false);
  const carregandoMais = ref(false);
  const prestadores = ref<PrestadorListaItem[]>([]);
  const categorias = ref<CategoriaData[]>([]);
  const subcategorias = ref<SubcategoriaData[]>([]);
  const searchQuery = ref('');
  const selectedCategory = ref<number | null>(null);
  const selectedSubcategory = ref<number | null>(null);
  const currentPage = ref(1);
  const hasMore = ref(false);
  const total = ref(0);
  const erro = ref<string | null>(null);
  const imageErrors = ref<Record<number, boolean>>({});

  // Filtros
  const filtros = reactive<FiltrosPrestadores>({
    distancia_max: 50,
    rating_min: 0,
    disponivel: 'todos',
    categoria_id: null,
    subcategoria_id: null,
    ordenar_por: 'rating_desc',
  });

  // ===================== GETTERS =====================

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

  const categoriaNome = computed(() => {
    const cat = categorias.value.find(c => c.id === selectedCategory.value);
    return cat?.nome || '';
  });

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

  const resultadosTexto = computed(() => {
    if (total.value === 0) return 'Nenhum resultado encontrado';
    if (total.value === 1) return '1 prestador encontrado';
    return `${total.value} prestadores encontrados`;
  });

  // Gradientes para avatares
  const avatarGradients = [
    'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
    'linear-gradient(135deg, #10B981, #34D399)',
    'linear-gradient(135deg, #F59E0B, #FBBF24)',
    'linear-gradient(135deg, #EF4444, #F87171)',
    'linear-gradient(135deg, #3B82F6, #60A5FA)',
    'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  ];

  // ===================== FUNÇÕES AUXILIARES =====================

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse;
      return data?.message || data?.error || error.message || 'Erro na requisição';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

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

  const getAvatarStyle = (id: number) => {
    const idx = Math.abs(id) % avatarGradients.length;
    return { background: avatarGradients[idx] };
  };

  const formatarDistancia = (distancia?: number): string => {
    if (!distancia && distancia !== 0) return '-- km';
    if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
    return `${distancia.toFixed(1)}km`;
  };

  // ===================== AÇÕES PRINCIPAIS =====================

  /**
   * Busca a lista de prestadores com filtros e paginação
   */
  const buscarPrestadores = async (resetPage: boolean = true): Promise<PrestadorListaItem[]> => {
    if (resetPage) {
      currentPage.value = 1;
      carregando.value = true;
    } else {
      carregandoMais.value = true;
    }

    try {
      const params: Record<string, unknown> = {
        page: currentPage.value,
        per_page: 20,
        search: searchQuery.value || undefined,
        distancia_max: filtros.distancia_max,
        rating_min: filtros.rating_min,
        disponivel: filtros.disponivel !== 'todos' ? filtros.disponivel === 'true' : undefined,
        categoria_id: filtros.categoria_id,
        subcategoria_id: filtros.subcategoria_id,
        ordenar_por: filtros.ordenar_por,
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/prestadores', { params });

      if (response.data?.success) {
        const novosPrestadores = response.data.data || [];
        const pagination: PaginationData = response.data.pagination || {
          current_page: currentPage.value,
          last_page: 1,
          per_page: 20,
          total: novosPrestadores.length,
        };

        total.value = pagination.total;
        hasMore.value = pagination.current_page < pagination.last_page;

        if (resetPage) {
          prestadores.value = novosPrestadores;
        } else {
          prestadores.value = [...prestadores.value, ...novosPrestadores];
        }

        return prestadores.value;
      }

      throw new Error('Erro ao buscar prestadores');
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
      carregandoMais.value = false;
    }
  };

  /**
   * Busca categorias disponíveis
   */
  const fetchCategorias = async (): Promise<CategoriaData[]> => {
    try {
      const response = await api.get('/categorias');

      if (response.data?.success) {
        categorias.value = response.data.data || [];
        return categorias.value;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      erro.value = getErrorMessage(error);
      return [];
    }
  };

  /**
   * Busca subcategorias por categoria
   */
  const fetchSubcategorias = async (categoriaId: number): Promise<SubcategoriaData[]> => {
    try {
      const response = await api.get(`/categorias/${categoriaId}/subcategorias`);

      if (response.data?.success) {
        subcategorias.value = response.data.data || [];
        return subcategorias.value;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
      return [];
    }
  };

  /**
   * Carrega mais prestadores (paginação)
   */
  const carregarMais = async (): Promise<void> => {
    if (!hasMore.value || carregandoMais.value || carregando.value) return;
    currentPage.value++;
    await buscarPrestadores(false);
  };

  /**
   * Aplica filtros e recarrega a lista
   */
  const aplicarFiltros = async (): Promise<void> => {
    currentPage.value = 1;
    await buscarPrestadores(true);
  };

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = async (): Promise<void> => {
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
    currentPage.value = 1;
    await buscarPrestadores(true);
  };

  /**
   * Filtra por categoria
   */
  const filtrarPorCategoria = async (categoriaId: number): Promise<void> => {
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
      await fetchSubcategorias(categoriaId);
    }
    currentPage.value = 1;
    await buscarPrestadores(true);
  };

  /**
   * Filtra por subcategoria
   */
  const filtrarPorSubcategoria = async (subcategoriaId: number): Promise<void> => {
    if (selectedSubcategory.value === subcategoriaId) {
      selectedSubcategory.value = null;
      filtros.subcategoria_id = null;
    } else {
      selectedSubcategory.value = subcategoriaId;
      filtros.subcategoria_id = subcategoriaId;
    }
    currentPage.value = 1;
    await buscarPrestadores(true);
  };

  /**
   * Limpa o filtro de subcategoria
   */
  const limparSubcategoria = async (): Promise<void> => {
    selectedSubcategory.value = null;
    filtros.subcategoria_id = null;
    currentPage.value = 1;
    await buscarPrestadores(true);
  };

  /**
   * Manipula a mudança de categoria no select
   */
  const onCategoriaChange = async (categoriaId: number | null): Promise<void> => {
    if (categoriaId) {
      selectedCategory.value = categoriaId;
      filtros.subcategoria_id = null;
      selectedSubcategory.value = null;
      await fetchSubcategorias(categoriaId);
    } else {
      selectedCategory.value = null;
      subcategorias.value = [];
      filtros.subcategoria_id = null;
      selectedSubcategory.value = null;
    }
  };

  /**
   * Manipula erro de imagem
   */
  const handleImageError = (prestadorId: number): void => {
    imageErrors.value[prestadorId] = true;
  };

  /**
   * Reseta o erro de imagem
   */
  const resetImageError = (prestadorId: number): void => {
    delete imageErrors.value[prestadorId];
  };

  /**
   * Limpa todos os dados do store
   */
  const limparStore = (): void => {
    prestadores.value = [];
    categorias.value = [];
    subcategorias.value = [];
    searchQuery.value = '';
    selectedCategory.value = null;
    selectedSubcategory.value = null;
    currentPage.value = 1;
    hasMore.value = false;
    total.value = 0;
    erro.value = null;
    imageErrors.value = {};
    carregandoInicial.value = true;
    carregando.value = false;
    carregandoMais.value = false;

    // Reset filters
    filtros.distancia_max = 50;
    filtros.rating_min = 0;
    filtros.disponivel = 'todos';
    filtros.categoria_id = null;
    filtros.subcategoria_id = null;
    filtros.ordenar_por = 'rating_desc';
  };

  /**
   * Carrega dados iniciais (categorias + prestadores)
   */
  const carregarDadosIniciais = async (): Promise<void> => {
    carregandoInicial.value = true;
    try {
      await Promise.all([
        fetchCategorias(),
        buscarPrestadores(true),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      erro.value = getErrorMessage(error);
    } finally {
      setTimeout(() => {
        carregandoInicial.value = false;
      }, 600);
    }
  };

  return {
    // Estados
    carregandoInicial,
    carregando,
    carregandoMais,
    prestadores,
    categorias,
    subcategorias,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    currentPage,
    hasMore,
    total,
    erro,
    imageErrors,
    filtros,

    // Getters
    activeFiltersCount,
    categoriaNome,
    hasActiveFilters,
    resultadosTexto,
    avatarGradients,

    // Utilitários
    getInitials,
    getAvatarStyle,
    formatarDistancia,
    getErrorMessage,

    // Ações
    buscarPrestadores,
    fetchCategorias,
    fetchSubcategorias,
    carregarMais,
    aplicarFiltros,
    limparFiltros,
    filtrarPorCategoria,
    filtrarPorSubcategoria,
    limparSubcategoria,
    onCategoriaChange,
    handleImageError,
    resetImageError,
    limparStore,
    carregarDadosIniciais,
  };
});

export default useListaPrestadoresStore;
