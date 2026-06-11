import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ===================== INTERFACES =====================

export interface ServicoData {
  id: number;
  nome: string;
  categoria_id: number;
  preco: number;
  duracao: number;
  descricao: string;
  icone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoriaPrestadorData {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
  slug?: string;
  descricao?: string;
}

export interface CreateServicoData {
  nome: string;
  categoria_id: number;
  preco: number;
  duracao: number;
  descricao?: string;
  icone?: string;
}

export interface UpdateServicoData {
  nome?: string;
  categoria_id?: number;
  preco?: number;
  duracao?: number;
  descricao?: string;
  icone?: string;
  ativo?: boolean;
}

// Gradients para ícones
export const gradients: string[] = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

export const getGradientForIcon = (icon?: string): string => {
  const defaultGradient = 'linear-gradient(135deg, #5B4BF5, #9F7AEA)';
  if (!icon) return defaultGradient;
  const idx = Math.abs(icon.charCodeAt(0)) % gradients.length;
  return gradients[idx] || defaultGradient;
};

// ===================== STORE =====================

export const usePrestadorServicosStore = defineStore('prestadorServicos', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  // Serviços
  const servicos = ref<ServicoData[]>([]);

  // Categorias do prestador
  const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
  const todasCategoriasDisponiveis = ref<CategoriaPrestadorData[]>([]);

  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  // ===================== GETTERS =====================

  const servicosAtivos = computed(() => servicos.value.filter((s) => s.ativo));
  const servicosInativos = computed(() => servicos.value.filter((s) => !s.ativo));
  const totalServicos = computed(() => servicos.value.length);
  const totalAtivos = computed(() => servicosAtivos.value.length);

  // Categorias que o prestador NÃO tem (para adicionar)
  const categoriasParaAdicionar = computed(() => {
    const minhasIds = new Set(minhasCategorias.value.map((c) => c.id));
    return todasCategoriasDisponiveis.value.filter((c) => !minhasIds.has(c.id));
  });

  // ===================== AÇÕES - SERVIÇOS =====================

  const fetchServicos = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/servicos');

      if (response.data?.success && response.data.data) {
        servicos.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      } else if (Array.isArray(response.data)) {
        servicos.value = response.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar serviços';
    } finally {
      isLoading.value = false;
    }
  };

  const createServico = async (data: CreateServicoData): Promise<ServicoData | null> => {
    isSaving.value = true;
    try {
      const response = await api.post('/prestador/servicos', data);
      if (response.data?.success && response.data.data) {
        servicos.value.push(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar serviço';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const updateServico = async (
    id: number,
    data: UpdateServicoData,
  ): Promise<ServicoData | null> => {
    isSaving.value = true;
    try {
      const response = await api.put(`/prestador/servicos/${id}`, data);
      if (response.data?.success && response.data.data) {
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1 && servicos.value[index]) {
          servicos.value[index] = { ...servicos.value[index], ...response.data.data };
        }
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar serviço';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const deleteServico = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.delete(`/prestador/servicos/${id}`);
      if (response.data?.success) {
        servicos.value = servicos.value.filter((s) => s.id !== id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
      error.value = (err as AxiosError).message || 'Erro ao remover serviço';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const toggleServico = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.patch(`/prestador/servicos/${id}/toggle`);
      if (response.data?.success) {
        const index = servicos.value.findIndex((s) => s.id === id);
        if (index !== -1 && servicos.value[index]) {
          servicos.value[index].ativo = !servicos.value[index].ativo;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      error.value = (err as AxiosError).message || 'Erro ao alternar status';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== AÇÕES - CATEGORIAS DO PRESTADOR =====================

  const fetchMinhasCategorias = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh && minhasCategorias.value.length > 0) return;

    try {
      const response = await api.get('/prestador/perfil/categorias');
      if (response.data?.success && response.data.data) {
        minhasCategorias.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const fetchTodasCategoriasDisponiveis = async (): Promise<void> => {
    try {
      const response = await api.get('/categorias');
      if (response.data?.success && response.data.data) {
        todasCategoriasDisponiveis.value = response.data.data;
      }
    } catch (err) {
      console.error('Erro ao buscar categorias disponíveis:', err);
    }
  };

  const addCategoria = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.post('/prestador/perfil/categorias', {
        categoria_id: categoriaId,
      });
      if (response.data?.success) {
        await fetchMinhasCategorias(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      return false;
    }
  };

  const removeCategoria = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/prestador/perfil/categorias/${categoriaId}`);
      if (response.data?.success) {
        await fetchMinhasCategorias(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      return false;
    }
  };

  // ===================== AÇÕES GERAIS =====================

  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchServicos(true),
        fetchMinhasCategorias(true),
        fetchTodasCategoriasDisponiveis(),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarTodosDados();
  };

  const limparStore = (): void => {
    servicos.value = [];
    minhasCategorias.value = [];
    todasCategoriasDisponiveis.value = [];
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    servicos,
    minhasCategorias,
    todasCategoriasDisponiveis,
    dadosCarregados,
    ultimaAtualizacao,

    // Getters
    servicosAtivos,
    servicosInativos,
    totalServicos,
    totalAtivos,
    categoriasParaAdicionar,

    // Serviços
    fetchServicos,
    createServico,
    updateServico,
    deleteServico,
    toggleServico,

    // Categorias
    fetchMinhasCategorias,
    fetchTodasCategoriasDisponiveis,
    addCategoria,
    removeCategoria,

    // Gerais
    carregarTodosDados,
    recarregarDados,
    limparStore,
  };
});

export default usePrestadorServicosStore;
