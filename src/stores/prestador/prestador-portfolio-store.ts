// stores/prestador/prestador-portfolio-store.ts

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
  categoria?: string;
  visualizacoes?: number;
  avaliacao?: number;
}

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
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

  const addPortfolioItem = async (
    file: File,
    titulo?: string,
    descricao?: string,
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    if (!file) {
      error.value = 'Nenhum arquivo selecionado';
      isLoading.value = false;
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      error.value = 'A imagem deve ter no máximo 5MB';
      isLoading.value = false;
      return false;
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      error.value = 'Formato inválido. Use JPG, PNG ou GIF';
      isLoading.value = false;
      return false;
    }

    const formData = new FormData();
    formData.append('foto', file, file.name);

    if (titulo && titulo.trim()) {
      formData.append('titulo', titulo.trim());
    }
    if (descricao && descricao.trim()) {
      formData.append('descricao', descricao.trim());
    }

    console.log('📤 Enviando foto:', {
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      titulo: titulo || '',
      descricao: descricao || '',
    });

    // 🔥 CORRIGIDO: const em vez de let
    for (const pair of formData.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }

    try {
      const response = await api.post('/prestador/portfolio', formData, {
        timeout: 60000,
      });

      console.log('✅ Resposta do servidor:', response.data);

      if (response.data?.success) {
        await fetchPortfolio();
        return true;
      } else {
        error.value = response.data?.message || 'Erro ao adicionar foto';
        return false;
      }
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.error('❌ Erro ao adicionar foto:', err);

      const responseData = axiosError.response?.data;

      if (responseData?.errors) {
        const errorMessages = Object.values(responseData.errors).flat().join(', ');
        error.value = errorMessages;
      } else if (responseData?.message) {
        error.value = responseData.message;
      } else {
        error.value = axiosError.message || 'Erro ao adicionar foto';
      }

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
        items.value = items.value.filter((item) => item.id !== id);
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
    removePortfolioItem,
  };
});
