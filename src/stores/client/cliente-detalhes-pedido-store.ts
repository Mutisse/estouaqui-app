// stores/client/cliente-detalhes-pedido-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface ClienteInfo {
  id: number;
  nome: string;
  foto: string | null;
  telefone: string;
  email?: string;
}

export interface PrestadorInfo {
  id: number;
  nome: string;
  foto: string | null;
  telefone: string;
  email?: string;
  media_avaliacao?: number;
  verificado?: boolean;
}

export interface CategoriaInfo {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

export interface PedidoDetalhesData {
  id: number;
  numero: string;
  status: 'pendente' | 'aceito' | 'em_andamento' | 'concluido' | 'cancelado';
  descricao: string | null;
  foto: string | null;
  data: string;
  endereco: string;
  observacoes: string | null;
  valor: number | null;
  created_at: string;
  updated_at?: string;
  cliente?: ClienteInfo;
  categoria?: CategoriaInfo;
  prestador?: PrestadorInfo;
}

export interface PedidoHistorico {
  id: number;
  pedido_id: number;
  status: string;
  observacao?: string;
  created_at: string;
}

export interface AvaliacaoPedido {
  id: number;
  nota: number;
  comentario?: string;
  created_at: string;
  cliente_id?: number;
  prestador_id?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useDetalhesPedidoStore = defineStore('clienteDetalhesPedido', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const pedido = ref<PedidoDetalhesData | null>(null);
  const historico = ref<PedidoHistorico[]>([]);
  const avaliacao = ref<AvaliacaoPedido | null>(null);
  const erro = ref<string | null>(null);

  // ===================== GETTERS =====================

  const statusLabel = computed(() => {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return statusMap[pedido.value?.status || ''] || pedido.value?.status || 'Desconhecido';
  });

  const statusColor = computed(() => {
    const colorMap: Record<string, string> = {
      pendente: 'orange',
      aceito: 'primary',
      em_andamento: 'info',
      concluido: 'positive',
      cancelado: 'negative'
    };
    return colorMap[pedido.value?.status || ''] || 'grey';
  });

  const podeCancelar = computed(() => {
    const status = pedido.value?.status;
    return status === 'pendente' || status === 'aceito';
  });

  const podeAvaliar = computed(() => {
    return pedido.value?.status === 'concluido' && !avaliacao.value;
  });

  const valorFormatado = computed(() => {
    const valor = pedido.value?.valor;
    if (!valor) return 'A combinar';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(valor);
  });

  const dataFormatada = computed(() => {
    const data = pedido.value?.created_at;
    if (!data) return '';
    return formatarData(data);
  });

  const dataServicoFormatada = computed(() => {
    const data = pedido.value?.data;
    if (!data) return '';
    return formatarDataCompleta(data);
  });

  const hasPrestador = computed(() => !!pedido.value?.prestador);
  const hasCategoria = computed(() => !!pedido.value?.categoria);
  const hasFoto = computed(() => !!pedido.value?.foto);

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

  const formatarData = (data: string): string => {
    if (!data) return '';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const formatarDataCompleta = (data: string): string => {
    if (!data) return '';
    try {
      const date = new Date(data);
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

      if (date.toDateString() === hoje.toDateString()) {
        return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === amanha.toDateString()) {
        return `Amanhã, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  };

  const getAvatarUrl = (nome: string, foto?: string | null): string => {
    if (foto) return foto;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff`;
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

  // ===================== AÇÕES - BUSCA DE DADOS =====================

  /**
   * ✅ CORRIGIDO: Buscar cliente que fez o pedido
   * Rota: GET /api/pedidos/{pedidoId}/cliente
   */
  const buscarClienteDoPedido = async (pedidoId: number): Promise<ClienteInfo | undefined> => {
    try {
      const response = await api.get(`/pedidos/${pedidoId}/cliente`);
      if (response.data?.success && response.data.data) {
        return {
          id: response.data.data.id,
          nome: response.data.data.nome,
          foto: response.data.data.foto || null,
          telefone: response.data.data.telefone || '',
          email: response.data.data.email,
        };
      }
      return undefined;
    } catch (error) {
      console.error('Erro ao buscar cliente do pedido:', error);
      return undefined;
    }
  };

  /**
   * ✅ Buscar prestador
   * Rota: GET /api/prestadores/{id}
   */
  const buscarPrestadorInfo = async (prestadorId: number): Promise<PrestadorInfo | undefined> => {
    try {
      const response = await api.get(`/prestadores/${prestadorId}`);
      if (response.data?.success && response.data.data) {
        return {
          id: response.data.data.id,
          nome: response.data.data.nome,
          foto: response.data.data.foto || null,
          telefone: response.data.data.telefone || '',
          email: response.data.data.email,
          media_avaliacao: response.data.data.media_avaliacao,
          verificado: response.data.data.verificado,
        };
      }
      return undefined;
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      return undefined;
    }
  };

  /**
   * ✅ Buscar categoria
   * Rota: GET /api/categorias/{id}
   */
  const buscarCategoriaInfo = async (categoriaId: number): Promise<CategoriaInfo | undefined> => {
    try {
      const response = await api.get(`/categorias/${categoriaId}`);
      if (response.data?.success && response.data.data) {
        return {
          id: response.data.data.id,
          nome: response.data.data.nome,
          icone: response.data.data.icone || 'category',
          cor: response.data.data.cor || 'primary',
        };
      }
      return undefined;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return undefined;
    }
  };

  /**
   * ✅ Buscar histórico do pedido
   * Rota: GET /api/pedidos/{id}/historico
   */
  const buscarHistoricoPedido = async (pedidoId: number): Promise<PedidoHistorico[]> => {
    try {
      const response = await api.get(`/pedidos/${pedidoId}/historico`);
      if (response.data?.success && response.data.data) {
        historico.value = response.data.data;
        return historico.value;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  /**
   * ✅ Buscar avaliação do pedido
   * Rota: GET /api/pedidos/{pedidoId}/avaliacao
   */
  const buscarAvaliacaoPedido = async (pedidoId: number): Promise<AvaliacaoPedido | null> => {
    try {
      const response = await api.get(`/pedidos/${pedidoId}/avaliacao`);
      if (response.data?.success && response.data.data) {
        avaliacao.value = response.data.data;
        return avaliacao.value;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      return null;
    }
  };

  // ===================== AÇÕES - PRINCIPAIS =====================

  const carregarPedido = async (pedidoId: number, tipoUsuario: 'cliente' | 'prestador'): Promise<PedidoDetalhesData | null> => {
    carregando.value = true;
    carregamentoInicial.value = true;
    erro.value = null;

    try {
      const endpoint = tipoUsuario === 'cliente'
        ? `/cliente/pedidos/${pedidoId}`
        : `/prestador/pedidos/${pedidoId}`;

      const response = await api.get(endpoint);

      if (response.data?.success && response.data.data) {
        const dados = response.data.data;

        const detalhes: PedidoDetalhesData = {
          id: dados.id,
          numero: dados.numero,
          status: dados.status,
          descricao: dados.descricao || null,
          foto: dados.foto || null,
          data: dados.data,
          endereco: dados.endereco,
          observacoes: dados.observacoes || null,
          valor: dados.valor,
          created_at: dados.created_at,
          updated_at: dados.updated_at,
        };

        // ✅ Buscar cliente usando a rota correta (se não veio no pedido)
        if (dados.cliente_id && !dados.cliente) {
          const clienteInfo = await buscarClienteDoPedido(pedidoId);
          if (clienteInfo) detalhes.cliente = clienteInfo;
        } else if (dados.cliente) {
          detalhes.cliente = dados.cliente;
        }

        // ✅ Buscar prestador (se não veio no pedido)
        if (dados.prestador_id && !dados.prestador) {
          const prestadorInfo = await buscarPrestadorInfo(dados.prestador_id);
          if (prestadorInfo) detalhes.prestador = prestadorInfo;
        } else if (dados.prestador) {
          detalhes.prestador = dados.prestador;
        }

        // ✅ Buscar categoria (se não veio no pedido)
        if (dados.categoria_id && !dados.categoria) {
          const categoriaInfo = await buscarCategoriaInfo(dados.categoria_id);
          if (categoriaInfo) detalhes.categoria = categoriaInfo;
        } else if (dados.categoria) {
          detalhes.categoria = dados.categoria;
        }

        pedido.value = detalhes;

        // ✅ Buscar histórico e avaliação em paralelo
        await Promise.all([
          buscarHistoricoPedido(pedidoId),
          buscarAvaliacaoPedido(pedidoId),
        ]);

        return pedido.value;
      }

      throw new Error('Pedido não encontrado');
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  // ===================== AÇÕES - INTERAÇÕES =====================

  const cancelarPedido = async (motivo?: string): Promise<boolean> => {
    if (!pedido.value) return false;

    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post(`/pedidos/${pedido.value.id}/cancelar`, { motivo });

      if (response.data?.success) {
        pedido.value.status = 'cancelado';
        await buscarHistoricoPedido(pedido.value.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const reagendarPedido = async (novaData: string, horario?: string): Promise<boolean> => {
    if (!pedido.value) return false;

    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.put(`/pedidos/${pedido.value.id}/reagendar`, {
        data: novaData,
        horario,
      });

      if (response.data?.success) {
        pedido.value.data = novaData;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao reagendar pedido:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  const enviarAvaliacao = async (nota: number, comentario: string): Promise<boolean> => {
    if (!pedido.value) return false;

    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post(`/pedidos/${pedido.value.id}/avaliar`, {
        nota,
        comentario,
      });

      if (response.data?.success) {
        avaliacao.value = {
          id: response.data.avaliacao_id,
          nota,
          comentario,
          created_at: new Date().toISOString(),
        };
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      erro.value = getErrorMessage(error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  // ===================== AÇÕES - UTILITÁRIOS =====================

  const limparStore = (): void => {
    pedido.value = null;
    historico.value = [];
    avaliacao.value = null;
    erro.value = null;
    carregando.value = false;
    carregamentoInicial.value = true;
  };

  return {
    carregando,
    carregamentoInicial,
    pedido,
    historico,
    avaliacao,
    erro,

    statusLabel,
    statusColor,
    podeCancelar,
    podeAvaliar,
    valorFormatado,
    dataFormatada,
    dataServicoFormatada,
    hasPrestador,
    hasCategoria,
    hasFoto,

    getAvatarUrl,
    getInitials,
    formatarData,
    formatarDataCompleta,
    getErrorMessage,

    // ✅ Ações corrigidas
    buscarClienteDoPedido,
    buscarPrestadorInfo,
    buscarCategoriaInfo,
    buscarHistoricoPedido,
    buscarAvaliacaoPedido,
    carregarPedido,

    cancelarPedido,
    reagendarPedido,
    enviarAvaliacao,

    limparStore,
  };
});

export default useDetalhesPedidoStore;
