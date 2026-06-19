// stores/client/cliente-prestador-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface PrestadorCategoria {
  id: number;
  nome: string;
  cor?: string;
  icone?: string;
}

export interface PrestadorServico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
  tempo_estimado?: string;
}

export interface PrestadorAvaliacao {
  id: number;
  nota: number;
  comentario?: string;
  created_at: string;
  cliente: {
    id: number;
    nome: string;
    foto?: string | null;
  };
}

export interface PortfolioItem {
  url: string;
  titulo?: string;
  descricao?: string;
  created_at?: string;
  path?: string;
}

export interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  disponivel: boolean;
  verificado: boolean;
  raio?: number;
  media_avaliacao: number | null;
  total_avaliacoes: number;
  categorias: PrestadorCategoria[];
  servicos: PrestadorServico[];
  portfolio: PortfolioItem[];
  avaliacoes: PrestadorAvaliacao[];
  created_at: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const usePrestadorStore = defineStore('clientePrestador', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const prestador = ref<PrestadorData | null>(null);
  const erro = ref<string | null>(null);
  const isFavorito = ref(false);
  const favoritoLoading = ref(false);
  const avatarError = ref(false);

  // ===================== GETTERS =====================

  const mediaFormatada = computed(() => {
    const media = prestador.value?.media_avaliacao;
    if (media === null || media === undefined) return '0';
    const num = typeof media === 'string' ? parseFloat(media) : media;
    if (isNaN(num)) return '0';
    return num.toFixed(1);
  });

  const iniciaisNome = computed(() => {
    const nome = prestador.value?.nome || '';
    if (!nome.trim()) return 'PR';
    const partes = nome.trim().split(' ');

    if (partes.length === 1) {
      const primeiraLetra = partes[0]?.charAt(0);
      return primeiraLetra ? primeiraLetra.toUpperCase() : 'PR';
    }

    const primeiraLetra = partes[0]?.charAt(0) || '';
    const ultimaParte = partes[partes.length - 1];
    const ultimaLetra = ultimaParte?.charAt(0) || '';

    if (!primeiraLetra && !ultimaLetra) return 'PR';
    if (!primeiraLetra) return ultimaLetra.toUpperCase();
    if (!ultimaLetra) return primeiraLetra.toUpperCase();

    return (primeiraLetra + ultimaLetra).toUpperCase();
  });

  const avatarUrl = computed(() => {
    if (prestador.value?.foto && !avatarError.value) return prestador.value.foto;
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=100&name=${encodeURIComponent(iniciaisNome.value)}`;
  });

  const avatarGradiente = computed(() => {
    const gradients = [
      'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
      'linear-gradient(135deg, #10B981, #34D399)',
      'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'linear-gradient(135deg, #EF4444, #F87171)',
      'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    ];
    const nome = prestador.value?.nome || '';
    const index = Math.abs(nome.length) % gradients.length;
    return gradients[index];
  });

  const servicosOrdenados = computed(() => {
    if (!prestador.value?.servicos) return [];
    return [...prestador.value.servicos].sort((a, b) => a.preco - b.preco);
  });

  const ultimasAvaliacoes = computed(() => {
    if (!prestador.value?.avaliacoes) return [];
    return [...prestador.value.avaliacoes].slice(0, 3);
  });

  const anosRegistro = computed(() => {
    if (!prestador.value?.created_at) return 0;
    const anoRegistro = new Date(prestador.value.created_at).getFullYear();
    const anoAtual = new Date().getFullYear();
    return anoAtual - anoRegistro;
  });

  const statusFormatado = computed(() => {
    if (!prestador.value) return 'Indisponível';
    return prestador.value.disponivel ? 'Disponível' : 'Indisponível';
  });

  const statusCor = computed(() => {
    if (!prestador.value) return '#EF4444';
    return prestador.value.disponivel ? '#10B981' : '#EF4444';
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

  const normalizarPortfolio = (portfolio: unknown[]): PortfolioItem[] => {
    if (!portfolio || !Array.isArray(portfolio)) return [];

    return portfolio
      .map((item) => {
        if (typeof item === 'string') {
          if (item.startsWith('http')) {
            return { url: item };
          }
          return { url: `http://localhost:8000/storage/${item}` };
        }

        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;

          if (obj.url && typeof obj.url === 'string') {
            return {
              url: obj.url,
              titulo: typeof obj.titulo === 'string' ? obj.titulo : '',
              descricao: typeof obj.descricao === 'string' ? obj.descricao : '',
              created_at: typeof obj.created_at === 'string' ? obj.created_at : '',
              path: typeof obj.path === 'string' ? obj.path : '',
            };
          }
          if (obj.path && typeof obj.path === 'string') {
            return {
              url: `http://localhost:8000/storage/${obj.path}`,
              titulo: typeof obj.titulo === 'string' ? obj.titulo : '',
              descricao: typeof obj.descricao === 'string' ? obj.descricao : '',
              created_at: typeof obj.created_at === 'string' ? obj.created_at : '',
              path: obj.path,
            };
          }
        }

        return { url: '' };
      })
      .filter((item) => item.url);
  };

  // ===================== AÇÕES PRINCIPAIS =====================

  const fetchPrestadorDetalhes = async (prestadorId: number) => {
    carregando.value = true;
    carregamentoInicial.value = true;
    erro.value = null;
    avatarError.value = false;

    try {
      const response = await api.get(`/prestadores/${prestadorId}`);

      if (response.data?.success && response.data.data) {
        const data = response.data.data;

        if (data.portfolio) {
          data.portfolio = normalizarPortfolio(data.portfolio);
        }

        if (!data.avaliacoes) {
          data.avaliacoes = [];
        }

        if (!data.servicos) {
          data.servicos = [];
        }

        prestador.value = data;
        return prestador.value;
      }

      throw new Error('Prestador não encontrado');
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  const fetchPrestadorBasico = async (prestadorId: number) => {
    carregando.value = true;
    try {
      const response = await api.get(`/prestadores/${prestadorId}`);

      if (response.data?.success && response.data.data) {
        const data = response.data.data;

        if (data.portfolio) {
          data.portfolio = normalizarPortfolio(data.portfolio);
        }

        if (prestador.value) {
          prestador.value = { ...prestador.value, ...data };
        } else {
          prestador.value = data;
        }
        return prestador.value;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dados básicos:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const fetchServicos = async (prestadorId: number) => {
    try {
      const response = await api.get(`/prestadores/${prestadorId}/servicos`);

      if (response.data?.success && response.data.data && prestador.value) {
        prestador.value.servicos = response.data.data;
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  };

  const fetchAvaliacoes = async (prestadorId: number, page: number = 1, limit: number = 10) => {
    try {
      const response = await api.get(`/prestadores/${prestadorId}/avaliacoes`, {
        params: { page, limit },
      });

      if (response.data?.success) {
        if (prestador.value) {
          if (page === 1) {
            prestador.value.avaliacoes = response.data.data;
          } else {
            prestador.value.avaliacoes = [...prestador.value.avaliacoes, ...response.data.data];
          }
        }
        return {
          avaliacoes: response.data.data,
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages,
        };
      }

      return { avaliacoes: [], total: 0, page: 1, totalPages: 1 };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return { avaliacoes: [], total: 0, page: 1, totalPages: 1 };
    }
  };

  const fetchPortfolio = async (prestadorId: number) => {
    try {
      const response = await api.get(`/prestadores/${prestadorId}/portfolio`);

      if (response.data?.success && response.data.data && prestador.value) {
        prestador.value.portfolio = normalizarPortfolio(response.data.data);
        return prestador.value.portfolio;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar portfólio:', error);
      return [];
    }
  };

  // ===================== AÇÕES DE FAVORITO =====================

  const verificarFavorito = async (prestadorId: number) => {
    try {
      const response = await api.get(`/favoritos/check/${prestadorId}`);

      if (response.data?.success) {
        isFavorito.value = response.data.is_favorito;
        return isFavorito.value;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  };

  const adicionarFavorito = async (prestadorId: number) => {
    favoritoLoading.value = true;
    try {
      const response = await api.post('/favoritos', { prestador_id: prestadorId });

      if (response.data?.success) {
        isFavorito.value = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    } finally {
      favoritoLoading.value = false;
    }
  };

  const removerFavorito = async (prestadorId: number) => {
    favoritoLoading.value = true;
    try {
      const response = await api.delete(`/favoritos/${prestadorId}`);

      if (response.data?.success) {
        isFavorito.value = false;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    } finally {
      favoritoLoading.value = false;
    }
  };

  const toggleFavorito = async (prestadorId: number) => {
    if (favoritoLoading.value) return false;

    if (isFavorito.value) {
      return await removerFavorito(prestadorId);
    } else {
      return await adicionarFavorito(prestadorId);
    }
  };

  // ===================== AÇÕES DE INTERAÇÃO =====================

  const enviarAvaliacao = async (prestadorId: number, nota: number, comentario: string) => {
    try {
      const response = await api.post(`/prestadores/${prestadorId}/avaliar`, {
        nota,
        comentario,
      });

      if (response.data?.success) {
        if (prestador.value) {
          prestador.value.media_avaliacao = response.data.media;
          prestador.value.total_avaliacoes = response.data.total;
          if (response.data.avaliacao) {
            prestador.value.avaliacoes = [response.data.avaliacao, ...prestador.value.avaliacoes];
          }
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      return false;
    }
  };

  const reportarPrestador = async (prestadorId: number, motivo: string, descricao: string) => {
    try {
      const response = await api.post(`/prestadores/${prestadorId}/reportar`, {
        motivo,
        descricao,
      });

      return response.data?.success || false;
    } catch (error) {
      console.error('Erro ao reportar prestador:', error);
      return false;
    }
  };

  // ===================== AÇÃO PARA CRIAR PEDIDO =====================

  const criarPedido = async (
    prestadorId: number,
    data: {
      descricao: string;
      data: string;
      hora: string;
      endereco: string;
      servico_id?: number;
      categoria_id?: number;
    },
  ): Promise<boolean> => {
    try {
      const response = await api.post('/cliente/pedidos', {
        prestador_id: prestadorId,
        categoria_id: data.categoria_id,
        servico_id: data.servico_id || null,
        descricao: data.descricao,
        data: data.data,
        hora: data.hora,
        endereco: data.endereco,
      });

      return response.data?.success || false;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return false;
    }
  };

  // ===================== UTILITÁRIOS =====================

  const getChipStyle = (cor?: string) => ({
    background: cor ? `${cor}15` : 'rgba(91, 75, 245, 0.1)',
    color: cor || '#5B4BF5',
  });

  const getAvatarStyle = (nome: string) => {
    const gradients = [
      'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
      'linear-gradient(135deg, #10B981, #34D399)',
      'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'linear-gradient(135deg, #EF4444, #F87171)',
      'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    ];
    const idx = Math.abs(nome.charCodeAt(0) || 0) % gradients.length;
    return { background: gradients[idx] };
  };

  const formatarPreco = (preco: number) => {
    if (!preco && preco !== 0) return 'A combinar';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(preco);
  };

  const formatarData = (data: string) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-PT');
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

  const limparStore = () => {
    prestador.value = null;
    erro.value = null;
    isFavorito.value = false;
    favoritoLoading.value = false;
    avatarError.value = false;
    carregando.value = false;
    carregamentoInicial.value = true;
  };

  return {
    // Estados
    carregando,
    carregamentoInicial,
    prestador,
    erro,
    isFavorito,
    favoritoLoading,
    avatarError,

    // Getters
    mediaFormatada,
    iniciaisNome,
    avatarUrl,
    avatarGradiente,
    servicosOrdenados,
    ultimasAvaliacoes,
    anosRegistro,
    statusFormatado,
    statusCor,

    // Ações principais
    fetchPrestadorDetalhes,
    fetchPrestadorBasico,
    fetchServicos,
    fetchAvaliacoes,
    fetchPortfolio,

    // Ações de favorito
    verificarFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,

    // Ações de interação
    enviarAvaliacao,
    reportarPrestador,

    // Ação para criar pedido
    criarPedido,

    // Utilitários
    getChipStyle,
    getAvatarStyle,
    formatarPreco,
    formatarData,
    getInitials,
    limparStore,
  };
});

export default usePrestadorStore;
