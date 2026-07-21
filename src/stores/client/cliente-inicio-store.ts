// src/stores/client/cliente-inicio-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ========== TIPOS ==========
export interface CategoriaData {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
  servicos_count?: number;
}

export interface PrestadorData {
  id: number;
  nome: string;
  foto?: string;
  profissao?: string;
  media_avaliacao?: number | string;
  total_avaliacoes?: number;
  categorias?: { id: number; nome: string }[];
}

export interface PedidoData {
  id: number;
  numero: string;
  status: string;
  valor?: number;
  created_at: string;
}

export interface PromocaoData {
  id: number;
  titulo: string;
  descricao: string;
  codigo: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
}

export interface DashboardData {
  pedidos_pendentes: number;
  favoritos_count: number;
  pedidos_count: number;
}

export interface NotificacaoData {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface NovoPedidoData {
  categoria_id: number;
  descricao: string;
  endereco: string;
  foto?: File | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ========== STORE ==========
export const useClienteInicioStore = defineStore('clienteInicio', () => {
  // ========== STATE ==========
  // Estados de loading
  const carregandoInicial = ref(true);
  const carregandoDestaque = ref(true);
  const carregandoTop = ref(true);
  const carregandoPromocoes = ref(false);
  const carregandoCriarPedido = ref(false);

  // 🔥 ESTADOS PARA LOCALIZAÇÃO
  const carregandoLocalizacao = ref(false);
  const localizacaoObtida = ref(false);
  const localizacaoData = ref<{ lat: number; lng: number } | null>(null);

  // Dados principais
  const categorias = ref<CategoriaData[]>([]);
  const prestadoresDestaque = ref<PrestadorData[]>([]);
  const prestadoresTop = ref<PrestadorData[]>([]);
  const promocoes = ref<PromocaoData[]>([]);
  const ultimosPedidos = ref<PedidoData[]>([]);
  const notificacoes = ref<NotificacaoData[]>([]);
  const dashboard = ref<DashboardData | null>(null);

  // Estados para modal
  const modalCriarPedidoAberto = ref(false);
  const fotoPreview = ref<string | null>(null);
  const fotoFile = ref<File | null>(null);

  // Dados do novo pedido
  const novoPedido = ref<NovoPedidoData>({
    categoria_id: 0,
    descricao: '',
    endereco: '',
    foto: null,
  });

  // Opções para selects
  const categoriasOptions = ref<{ label: string; value: number }[]>([]);

  // Erros de validação
  const validationErrors = ref<ValidationError[]>([]);

  // ========== GETTERS ==========
  const categoriasPopulares = computed<CategoriaData[]>(() => {
    return categorias.value.slice(0, 4);
  });

  const promocoesAtivas = computed<PromocaoData[]>(() => {
    return promocoes.value;
  });

  const ultimosTresPedidos = computed<PedidoData[]>(() => {
    return ultimosPedidos.value.slice(0, 3);
  });

  const notificacoesNaoLidas = computed<number>(() => {
    return notificacoes.value.filter((n) => !n.lida).length;
  });

  const prestadoresDestaqueLimitados = computed<PrestadorData[]>(() => {
    return prestadoresDestaque.value.slice(0, 4);
  });

  const prestadoresTopLimitados = computed<PrestadorData[]>(() => {
    return prestadoresTop.value.slice(0, 3);
  });

  const pedidosPendentes = computed<number>(() => {
    return dashboard.value?.pedidos_pendentes || 0;
  });

  const favoritosCount = computed<number>(() => {
    return dashboard.value?.favoritos_count || 0;
  });

  const formularioPedidoValido = computed<boolean>(() => {
    return !!(
      novoPedido.value.categoria_id &&
      novoPedido.value.categoria_id > 0 &&
      novoPedido.value.descricao?.trim() &&
      novoPedido.value.endereco?.trim()
    );
  });

  const temDados = computed<boolean>(() => {
    return (
      prestadoresDestaque.value.length > 0 ||
      prestadoresTop.value.length > 0 ||
      ultimosPedidos.value.length > 0
    );
  });

  // ========== ACTIONS - DADOS AUXILIARES ==========
  const getAvatarGradients = () => [
    'linear-gradient(135deg,#667EEA,#764BA2)',
    'linear-gradient(135deg,#10B981,#059669)',
    'linear-gradient(135deg,#F59E0B,#D97706)',
    'linear-gradient(135deg,#EF4444,#DC2626)',
    'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  ];

  const getInitials = (nome: string): string => {
    return nome
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarStyle = (nome: string) => {
    const gradients = getAvatarGradients();
    return {
      background: gradients[nome.charCodeAt(0) % gradients.length],
    };
  };

  const getCatIconStyle = (cor?: string) => ({
    background: cor ? `${cor}18` : 'rgba(102,126,234,0.1)',
    color: cor || '#667EEA',
  });

  const getStatusTexto = (status: string): string => {
    const map: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      em_andamento: 'Em andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return map[status] || status;
  };

  const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const obterMediaAvaliacao = (media: string | number | null | undefined): number => {
    if (media === null || media === undefined) return 0;
    const num = typeof media === 'string' ? parseFloat(media) : media;
    return isNaN(num) ? 0 : num;
  };

  const clearErrors = (): void => {
    validationErrors.value = [];
  };

  const clearError = (field: string): void => {
    const index = validationErrors.value.findIndex((err) => err.field === field);
    if (index !== -1) {
      validationErrors.value.splice(index, 1);
    }
  };

  // ========== 🔥 LOCALIZAÇÃO ==========

  /**
   * 🔥 Obtém localização do usuário (sem fallback automático)
   */
  const obterLocalizacaoAutomatica = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      carregandoLocalizacao.value = true;

      if (!navigator.geolocation) {
        carregandoLocalizacao.value = false;
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localizacaoData.value = data;
          localizacaoObtida.value = true;
          carregandoLocalizacao.value = false;
          resolve(data);
        },
        (error) => {
          carregandoLocalizacao.value = false;
          localizacaoObtida.value = false;
          reject(new Error('Não foi possível obter sua localização: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  /**
   * 🔥 Busca localização ao abrir o modal
   */
  const buscarLocalizacaoParaPedido = async (): Promise<void> => {
    try {
      await obterLocalizacaoAutomatica();
    } catch (error) {
      // Apenas loga o erro, não bloqueia o fluxo
      console.warn('⚠️ Localização não obtida:', error);
      localizacaoObtida.value = false;
      localizacaoData.value = null;
    }
  };

  /**
   * 🔥 Limpa a localização armazenada
   */
  const limparLocalizacao = (): void => {
    localizacaoData.value = null;
    localizacaoObtida.value = false;
  };

  // ========== ACTIONS - CARREGAMENTO DE DADOS ==========

  /**
   * Endpoint: GET /categorias
   * Busca todas as categorias disponíveis
   */
  const fetchCategorias = async (forceRefresh: boolean = false): Promise<CategoriaData[]> => {
    if (categorias.value.length > 0 && !forceRefresh) {
      return categorias.value;
    }

    try {
      const response = await api.get<{ success: boolean; data: CategoriaData[] }>('/categorias');

      if (response.data.success && response.data.data) {
        categorias.value = response.data.data;

        // Atualiza opções para select
        categoriasOptions.value = categorias.value.map((c) => ({
          label: c.nome,
          value: c.id,
        }));

        return categorias.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  };

  /**
   * Endpoint: GET /prestadores/destaque
   * Busca prestadores em destaque
   */
  const fetchPrestadoresDestaque = async (): Promise<PrestadorData[]> => {
    carregandoDestaque.value = true;

    try {
      const response = await api.get<{ success: boolean; data: PrestadorData[] }>(
        '/prestadores/destaque',
      );

      if (response.data.success && response.data.data) {
        prestadoresDestaque.value = response.data.data;
        return prestadoresDestaque.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar prestadores em destaque:', error);
      return [];
    } finally {
      carregandoDestaque.value = false;
    }
  };

  /**
   * Endpoint: GET /prestadores/top
   * Busca os melhores prestadores avaliados
   */
  const fetchPrestadoresTop = async (): Promise<PrestadorData[]> => {
    carregandoTop.value = true;

    try {
      const response = await api.get<{ success: boolean; data: PrestadorData[] }>(
        '/prestadores/top',
      );

      if (response.data.success && response.data.data) {
        prestadoresTop.value = response.data.data;
        return prestadoresTop.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar top prestadores:', error);
      return [];
    } finally {
      carregandoTop.value = false;
    }
  };

  /**
   * Endpoint: GET /promocoes
   * Busca promoções ativas
   */
  const fetchPromocoes = async (): Promise<PromocaoData[]> => {
    carregandoPromocoes.value = true;

    try {
      const response = await api.get<{ success: boolean; data: PromocaoData[] }>('/promocoes');

      if (response.data.success && response.data.data) {
        promocoes.value = response.data.data;
        return promocoes.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      return [];
    } finally {
      carregandoPromocoes.value = false;
    }
  };

  /**
   * Endpoint: GET /cliente/dashboard
   * Busca dados do dashboard (pedidos pendentes, favoritos)
   */
  const fetchDashboard = async (): Promise<DashboardData | null> => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardData }>(
        '/cliente/dashboard',
      );

      if (response.data.success && response.data.data) {
        dashboard.value = response.data.data;
        return dashboard.value;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      return null;
    }
  };

  /**
   * Endpoint: GET /cliente/pedidos
   * Busca os pedidos do cliente
   */
  const fetchMeusPedidos = async (): Promise<PedidoData[]> => {
    try {
      const response = await api.get<{ success: boolean; data: PedidoData[] }>('/cliente/pedidos');

      if (response.data.success && response.data.data) {
        ultimosPedidos.value = response.data.data;
        return ultimosPedidos.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  };

  /**
   * Endpoint: GET /cliente/notificacoes
   * Busca notificações do cliente
   */
  const fetchNotificacoes = async (): Promise<NotificacaoData[]> => {
    try {
      const response = await api.get<{ success: boolean; data: NotificacaoData[] }>(
        '/cliente/notificacoes',
      );

      if (response.data.success && response.data.data) {
        notificacoes.value = response.data.data;
        return notificacoes.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  };

  /**
   * Endpoint: POST /cliente/pedidos
   * 🔥 ATUALIZADO: Cria um novo pedido com localização
   */
  // src/stores/client/cliente-inicio-store.ts

  const criarPedidoServico = async (
    data: NovoPedidoData & {
      agendado_para?: string;
    },
  ): Promise<boolean> => {
    clearErrors();

    // Validações
    if (!data.categoria_id || data.categoria_id <= 0) {
      validationErrors.value.push({
        field: 'categoria',
        message: 'Selecione uma categoria',
      });
      return false;
    }

    if (!data.descricao?.trim()) {
      validationErrors.value.push({
        field: 'descricao',
        message: 'Descrição obrigatória',
      });
      return false;
    }

    if (!data.endereco?.trim()) {
      validationErrors.value.push({
        field: 'endereco',
        message: 'Endereço obrigatório',
      });
      return false;
    }

    // 🔥 VALIDAÇÃO DO AGENDAMENTO
    if (!data.agendado_para) {
      validationErrors.value.push({
        field: 'agendado_para',
        message: 'Data e hora do serviço são obrigatórias',
      });
      return false;
    }

    carregandoCriarPedido.value = true;

    try {
      const formData = new FormData();
      formData.append('categoria_id', String(data.categoria_id));
      formData.append('descricao', data.descricao);
      formData.append('endereco', data.endereco);

      // 🔥 ENVIA O agendado_para CORRETAMENTE
      formData.append('agendado_para', data.agendado_para);

      if (data.foto) {
        formData.append('foto', data.foto);
      }

      if (localizacaoData.value) {
        formData.append('latitude', String(localizacaoData.value.lat));
        formData.append('longitude', String(localizacaoData.value.lng));
      }

      const response = await api.post<{ success: boolean; message?: string; data?: PedidoData }>(
        '/cliente/pedidos',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (response.data.success) {
        await Promise.all([fetchDashboard(), fetchMeusPedidos()]);
        limparLocalizacao();
        return true;
      }

      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      validationErrors.value.push({
        field: 'geral',
        message: axiosError.response?.data?.message || 'Erro ao criar pedido',
      });
      return false;
    } finally {
      carregandoCriarPedido.value = false;
    }
  };

  /**
   * Endpoint: POST /promocoes/validar
   * Valida e aplica um cupom de desconto
   */
  const validarCupom = async (codigo: string): Promise<boolean> => {
    try {
      const response = await api.post<{ success: boolean; data?: { desconto: number } }>(
        '/promocoes/validar',
        { codigo },
      );

      return response.data.success;
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return false;
    }
  };

  // ========== ACTIONS - MODAL E UPLOAD ==========
  const abrirModalCriarPedido = (): void => {
    novoPedido.value = {
      categoria_id: 0,
      descricao: '',
      endereco: '',
      foto: null,
    };
    fotoPreview.value = null;
    fotoFile.value = null;
    clearErrors();
    modalCriarPedidoAberto.value = true;
  };

  const fecharModalCriarPedido = (): void => {
    modalCriarPedidoAberto.value = false;
    novoPedido.value = {
      categoria_id: 0,
      descricao: '',
      endereco: '',
      foto: null,
    };
    fotoPreview.value = null;
    fotoFile.value = null;
    clearErrors();
  };

  const validarArquivo = (file: File, maxSizeMB: number = 5): boolean => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      validationErrors.value.push({
        field: 'foto',
        message: `Arquivo deve ter no máximo ${maxSizeMB}MB`,
      });
      return false;
    }
    return true;
  };

  const adicionarFoto = (file: File): boolean => {
    if (!validarArquivo(file)) return false;

    if (fotoPreview.value) {
      URL.revokeObjectURL(fotoPreview.value);
    }

    fotoFile.value = file;
    novoPedido.value.foto = file;
    fotoPreview.value = URL.createObjectURL(file);
    clearError('foto');
    return true;
  };

  const removerFoto = (): void => {
    if (fotoPreview.value) {
      URL.revokeObjectURL(fotoPreview.value);
    }
    fotoFile.value = null;
    novoPedido.value.foto = null;
    fotoPreview.value = null;
  };

  const atualizarNovoPedido = (data: Partial<NovoPedidoData>): void => {
    novoPedido.value = { ...novoPedido.value, ...data };
  };

  // ========== ACTIONS - CARREGAMENTO INICIAL ==========
  const carregarDadosIniciais = async (): Promise<void> => {
    carregandoInicial.value = true;

    try {
      // Carrega dados em paralelo para melhor performance
      await Promise.all([
        fetchCategorias(),
        fetchPrestadoresDestaque(),
        fetchPrestadoresTop(),
        fetchDashboard(),
        fetchMeusPedidos(),
        fetchNotificacoes(),
        fetchPromocoes(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      // Pequeno delay para smooth transition
      setTimeout(() => {
        carregandoInicial.value = false;
      }, 400);
    }
  };

  const resetarStore = (): void => {
    carregandoInicial.value = true;
    carregandoDestaque.value = true;
    carregandoTop.value = true;
    carregandoPromocoes.value = false;
    carregandoCriarPedido.value = false;

    // 🔥 Resetar localização
    carregandoLocalizacao.value = false;
    localizacaoObtida.value = false;
    localizacaoData.value = null;

    categorias.value = [];
    prestadoresDestaque.value = [];
    prestadoresTop.value = [];
    promocoes.value = [];
    ultimosPedidos.value = [];
    notificacoes.value = [];
    dashboard.value = null;

    modalCriarPedidoAberto.value = false;
    fotoPreview.value = null;
    fotoFile.value = null;
    novoPedido.value = {
      categoria_id: 0,
      descricao: '',
      endereco: '',
      foto: null,
    };
    categoriasOptions.value = [];
    validationErrors.value = [];
  };

  return {
    // State
    carregandoInicial,
    carregandoDestaque,
    carregandoTop,
    carregandoPromocoes,
    carregandoCriarPedido,
    carregandoLocalizacao, // 🔥 NOVO
    localizacaoObtida, // 🔥 NOVO
    localizacaoData, // 🔥 NOVO
    categorias,
    prestadoresDestaque,
    prestadoresTop,
    promocoes,
    ultimosPedidos,
    notificacoes,
    dashboard,
    modalCriarPedidoAberto,
    fotoPreview,
    fotoFile,
    novoPedido,
    categoriasOptions,
    validationErrors,

    // Getters
    categoriasPopulares,
    promocoesAtivas,
    ultimosTresPedidos,
    notificacoesNaoLidas,
    prestadoresDestaqueLimitados,
    prestadoresTopLimitados,
    pedidosPendentes,
    favoritosCount,
    formularioPedidoValido,
    temDados,

    // Actions - Helpers
    getInitials,
    getAvatarStyle,
    getCatIconStyle,
    getStatusTexto,
    formatMoney,
    obterMediaAvaliacao,
    clearErrors,
    clearError,

    // 🔥 Actions - Localização
    obterLocalizacaoAutomatica, // 🔥 NOVO
    buscarLocalizacaoParaPedido, // 🔥 NOVO
    limparLocalizacao, // 🔥 NOVO

    // Actions - API
    fetchCategorias,
    fetchPrestadoresDestaque,
    fetchPrestadoresTop,
    fetchPromocoes,
    fetchDashboard,
    fetchMeusPedidos,
    fetchNotificacoes,
    criarPedidoServico, // 🔥 ATUALIZADO
    validarCupom,

    // Actions - Modal e Upload
    abrirModalCriarPedido,
    fecharModalCriarPedido,
    adicionarFoto,
    removerFoto,
    atualizarNovoPedido,

    // Actions - Inicialização
    carregarDadosIniciais,
    resetarStore,
  };
});
