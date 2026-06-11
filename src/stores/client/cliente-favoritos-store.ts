// stores/client/cliente-favoritos-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface PrestadorFavorito {
  id: number;
  nome: string;
  foto: string | null;
  verificado: boolean;
  disponivel: boolean;
  media_avaliacao: number | null;
  total_avaliacoes: number;
  profissao?: string;
  categorias?: Array<{ id: number; nome: string }>;
}

export interface FavoritoData {
  id: number;
  cliente_id: number;
  prestador_id: number;
  prestador: PrestadorFavorito;
  created_at: string;
}

export interface FavoritosStats {
  total: number;
  prestadores_verificados: number;
  prestadores_disponiveis: number;
  media_avaliacoes: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useFavoritosStore = defineStore('clienteFavoritos', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const favoritos = ref<FavoritoData[]>([]);
  const erro = ref<string | null>(null);
  const activeMenuId = ref<number | null>(null);
  const removendoItemId = ref<number | null>(null);
  const removendoTodos = ref<boolean>(false); // ✅ CORRIGIDO: apenas boolean, não null

  // ===================== GETTERS =====================

  const favoritosList = computed(() => favoritos.value);

  const favoritosCount = computed(() => favoritos.value.length);

  const isEmpty = computed(() => favoritos.value.length === 0);

  const stats = computed<FavoritosStats>(() => {
    let verificados = 0;
    let disponiveis = 0;
    let somaAvaliacoes = 0;

    for (const fav of favoritos.value) {
      if (fav.prestador.verificado) verificados++;
      if (fav.prestador.disponivel) disponiveis++;
      somaAvaliacoes += fav.prestador.media_avaliacao || 0;
    }

    return {
      total: favoritos.value.length,
      prestadores_verificados: verificados,
      prestadores_disponiveis: disponiveis,
      media_avaliacoes: favoritos.value.length > 0 ? somaAvaliacoes / favoritos.value.length : 0,
    };
  });

  const ultimosFavoritos = computed(() => {
    return [...favoritos.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  });

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
    if (!nome || nome.trim() === '') return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length === 1 && partes[0]) {
      return partes[0].charAt(0).toUpperCase();
    }
    const primeiraLetra = partes[0]?.charAt(0) || '';
    const ultimaLetra = partes[partes.length - 1]?.charAt(0) || '';
    if (!primeiraLetra && !ultimaLetra) return 'U';
    if (!primeiraLetra) return ultimaLetra.toUpperCase();
    if (!ultimaLetra) return primeiraLetra.toUpperCase();
    return (primeiraLetra + ultimaLetra).toUpperCase();
  };

  const getAvatarStyle = (nome: string) => {
    const gradients = [
      'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
      'linear-gradient(135deg, #10B981, #34D399)',
      'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'linear-gradient(135deg, #EF4444, #F87171)',
      'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    ];
    const idx = Math.abs(nome?.charCodeAt(0) || 0) % gradients.length;
    return { background: gradients[idx] };
  };

  const getAvatarUrl = (prestador: PrestadorFavorito): string => {
    if (prestador.foto) return prestador.foto;
    const iniciais = getInitials(prestador.nome);
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=56&name=${encodeURIComponent(iniciais)}`;
  };

  const formatarRating = (rating: number | null): string => {
    if (!rating) return '0';
    return rating.toFixed(1);
  };

  // ===================== AÇÕES =====================

  /**
   * Busca todos os favoritos do cliente
   * ✅ Corrigido: usa GET /favoritos (sem /cliente)
   */
  const fetchFavoritos = async (): Promise<FavoritoData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/favoritos');

      if (response.data?.success && response.data.data) {
        favoritos.value = response.data.data;
        return favoritos.value;
      }

      favoritos.value = [];
      return [];
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  /**
   * Adiciona um prestador aos favoritos
   * ✅ Corrigido: usa POST /favoritos com body { prestador_id }
   */
  const adicionarFavorito = async (prestadorId: number): Promise<boolean> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post('/favoritos', { prestador_id: prestadorId });

      if (response.data?.success && response.data.data) {
        favoritos.value.unshift(response.data.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  /**
   * Remove um prestador dos favoritos
   * ✅ Corrigido: usa DELETE /favoritos/{prestadorId}
   */
  const removerFavorito = async (prestadorId: number): Promise<boolean> => {
    removendoItemId.value = prestadorId;
    erro.value = null;

    try {
      const response = await api.delete(`/favoritos/${prestadorId}`);

      if (response.data?.success) {
        const index = favoritos.value.findIndex((f) => f.prestador.id === prestadorId);
        if (index !== -1) {
          favoritos.value.splice(index, 1);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      removendoItemId.value = null;
    }
  };

  /**
   * Remove todos os favoritos
   * ✅ Corrigido: usa DELETE /favoritos/limpar-todos
   */
  const removerTodosFavoritos = async (): Promise<boolean> => {
    removendoTodos.value = true;
    erro.value = null;

    try {
      const response = await api.delete('/favoritos/limpar-todos');

      if (response.data?.success) {
        favoritos.value = [];
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao remover todos favoritos:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      removendoTodos.value = false;
    }
  };

  /**
   * Verifica se um prestador está nos favoritos
   * ✅ Corrigido: usa GET /favoritos/check/{prestadorId}
   */
  const verificarFavorito = async (prestadorId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/favoritos/check/${prestadorId}`);

      if (response.data?.success) {
        return response.data.is_favorito;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  };

  /**
   * Alterna o menu ativo
   */
  const toggleMenu = (id: number): void => {
    activeMenuId.value = activeMenuId.value === id ? null : id;
    setTimeout(() => {
      const closeMenu = () => {
        activeMenuId.value = null;
        document.removeEventListener('click', closeMenu);
      };
      document.addEventListener('click', closeMenu, { once: true });
    }, 100);
  };

  /**
   * Fecha o menu
   */
  const closeMenu = (): void => {
    activeMenuId.value = null;
  };

  /**
   * Carrega os favoritos e inicializa o estado
   */
  const carregarFavoritos = async (): Promise<void> => {
    carregamentoInicial.value = true;
    try {
      await fetchFavoritos();
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  /**
   * Limpa todos os dados do store
   */
  const limparStore = (): void => {
    favoritos.value = [];
    erro.value = null;
    activeMenuId.value = null;
    removendoItemId.value = null;
    removendoTodos.value = false; // ✅ CORRIGIDO
    carregando.value = false;
    carregamentoInicial.value = true;
  };

  return {
    // Estados
    carregando,
    carregamentoInicial,
    favoritos,
    erro,
    activeMenuId,
    removendoItemId,
    removendoTodos,

    // Getters
    favoritosList,
    favoritosCount,
    isEmpty,
    stats,
    ultimosFavoritos,

    // Utilitários
    getInitials,
    getAvatarStyle,
    getAvatarUrl,
    formatarRating,
    getErrorMessage,

    // Ações
    fetchFavoritos,
    adicionarFavorito,
    removerFavorito,
    removerTodosFavoritos,
    verificarFavorito,
    toggleMenu,
    closeMenu,
    carregarFavoritos,
    limparStore,
  };
});

export default useFavoritosStore;
