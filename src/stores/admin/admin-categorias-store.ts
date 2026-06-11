// src/stores/admin/admin-categorias-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  servicos_count?: number;  // ✅ Adicionado para compatibilidade com o backend
  created_at: string;
  updated_at: string;
}

export interface CategoriaForm {
  nome: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  ordem?: number;
}

export interface FiltrosCategorias {
  search: string;
  ativo: string;
}

// ✅ Cores pré-definidas
export const coresDisponiveis = [
  { label: 'Roxo', value: '#667EEA' },
  { label: 'Verde', value: '#10B981' },
  { label: 'Amarelo', value: '#F59E0B' },
  { label: 'Vermelho', value: '#EF4444' },
  { label: 'Azul', value: '#3B82F6' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Ciano', value: '#06B6D4' },
  { label: 'Laranja', value: '#F97316' },
  { label: 'Cinza', value: '#6B7280' },
  { label: 'Indigo', value: '#8B5CF6' },
];

// ✅ Ícones disponíveis
export const iconesDisponiveis = [
  { label: '🛠️ Ferramentas', value: 'handyman' },
  { label: '🔧 Chave Inglesa', value: 'build' },
  { label: '⚡ Eletricista', value: 'bolt' },
  { label: '💧 Canalizador', value: 'water_drop' },
  { label: '🎨 Pintor', value: 'brush' },
  { label: '🧹 Limpeza', value: 'cleaning_services' },
  { label: '📦 Mudanças', value: 'moving' },
  { label: '🔒 Segurança', value: 'security' },
  { label: '📚 Educação', value: 'school' },
  { label: '💪 Saúde', value: 'fitness_center' },
  { label: '🐾 Pets', value: 'pets' },
  { label: '🔧 Reparação', value: 'repair' },
];

export const useAdminCategoriasStore = defineStore('adminCategorias', () => {
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const categorias = ref<Categoria[]>([]);
  const categoriaSelecionada = ref<Categoria | null>(null);

  const filtros = ref<FiltrosCategorias>({
    search: '',
    ativo: '',
  });

  // ✅ Getters
  const totalCategorias = computed(() => categorias.value.length);
  const temCategorias = computed(() => categorias.value.length > 0);
  const categoriasAtivas = computed(() => categorias.value.filter(c => c.ativo));
  const categoriasInativas = computed(() => categorias.value.filter(c => !c.ativo));

  const categoriasFiltradas = computed(() => {
    let resultado = [...categorias.value];

    if (filtros.value.search) {
      const searchLower = filtros.value.search.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          (c.descricao && c.descricao.toLowerCase().includes(searchLower))
      );
    }

    if (filtros.value.ativo) {
      const ativo = filtros.value.ativo === 'sim';
      resultado = resultado.filter((c) => c.ativo === ativo);
    }

    return resultado;
  });

  // ===================== AÇÕES =====================

  // ✅ CORRIGIDO: O backend retorna apenas categorias ativas por ordem
  const carregarCategorias = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: Categoria[] }>('/categorias');

      if (response.data?.success) {
        categorias.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar categorias';
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ Para o admin - carregar TODAS as categorias (incluindo inativas)
  const carregarTodasCategorias = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: Categoria[] }>('/admin/categorias');

      if (response.data?.success) {
        categorias.value = response.data.data;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar categorias';
    } finally {
      isLoading.value = false;
    }
  };

  const buscarCategoria = async (id: number): Promise<Categoria | null> => {
    isLoading.value = true;
    try {
      const response = await api.get<{ success: boolean; data: Categoria }>(`/categorias/${id}`);
      if (response.data?.success && response.data.data) {
        categoriaSelecionada.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar categoria:', err);
      error.value = (err as AxiosError).message || 'Erro ao buscar categoria';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const criarCategoria = async (data: CategoriaForm): Promise<Categoria | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const slug = data.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const response = await api.post<{ success: boolean; data: Categoria }>('/admin/categorias', { ...data, slug });
      if (response.data?.success && response.data.data) {
        await carregarTodasCategorias();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      error.value = (err as AxiosError).message || 'Erro ao criar categoria';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarCategoria = async (id: number, data: Partial<CategoriaForm>): Promise<Categoria | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put<{ success: boolean; data: Categoria }>(`/admin/categorias/${id}`, data);
      if (response.data?.success && response.data.data) {
        await carregarTodasCategorias();
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar categoria';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const excluirCategoria = async (id: number): Promise<boolean> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.delete<{ success: boolean }>(`/admin/categorias/${id}`);
      if (response.data?.success) {
        await carregarTodasCategorias();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir categoria';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const alternarStatusCategoria = async (id: number, ativo: boolean): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put<{ success: boolean }>(`/admin/categorias/${id}/status`, { ativo });
      if (response.data?.success) {
        await carregarTodasCategorias();
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

  const reordenarCategorias = async (ordens: { id: number; ordem: number }[]): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.post<{ success: boolean }>('/admin/categorias/reordenar', { ordens });
      if (response.data?.success) {
        await carregarTodasCategorias();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao reordenar categorias:', err);
      error.value = (err as AxiosError).message || 'Erro ao reordenar categorias';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const setFiltro = (key: keyof FiltrosCategorias, value: string): void => {
    filtros.value[key] = value;
  };

  const limparFiltros = (): void => {
    filtros.value = {
      search: '',
      ativo: '',
    };
  };

  const recarregarDados = async (): Promise<void> => {
    await carregarTodasCategorias();
  };

  const limparStore = (): void => {
    categorias.value = [];
    categoriaSelecionada.value = null;
    filtros.value = {
      search: '',
      ativo: '',
    };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  return {
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    categorias,
    categoriaSelecionada,
    filtros,
    totalCategorias,
    temCategorias,
    categoriasAtivas,
    categoriasInativas,
    categoriasFiltradas,
    coresDisponiveis,
    iconesDisponiveis,
    carregarCategorias,
    carregarTodasCategorias,
    buscarCategoria,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    alternarStatusCategoria,
    reordenarCategorias,
    setFiltro,
    limparFiltros,
    recarregarDados,
    limparStore,
  };
});

export default useAdminCategoriasStore;
