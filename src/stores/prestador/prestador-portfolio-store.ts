import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

export interface PortfolioItem {
  id: string | number;
  url: string;
  path?: string;
  titulo?: string;
  descricao?: string;
  created_at?: string;
}

export const usePrestadorPortfolioStore = defineStore('prestadorPortfolio', () => {
  const items = ref<PortfolioItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchPortfolio = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/portfolio');
      if (response.data?.success) {
        items.value = response.data.data || [];
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao buscar portfólio:', err);
      error.value = axiosError.message || 'Erro ao carregar portfólio';
    } finally {
      isLoading.value = false;
    }
  };

  const addPortfolioItem = async (file: File, titulo?: string, descricao?: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    const formData = new FormData();
    formData.append('foto', file);
    if (titulo) formData.append('titulo', titulo);
    if (descricao) formData.append('descricao', descricao);

    try {
      const response = await api.post('/prestador/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        await fetchPortfolio();
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao adicionar foto:', err);
      error.value = axiosError.message || 'Erro ao adicionar foto';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const removePortfolioItem = async (id: string | number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.delete(`/prestador/portfolio/${id}`);
      if (response.data?.success) {
        items.value = items.value.filter(item => item.id !== id);
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro ao remover foto:', err);
      error.value = axiosError.message || 'Erro ao remover foto';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    isLoading,
    error,
    fetchPortfolio,
    addPortfolioItem,
    removePortfolioItem
  };
});
