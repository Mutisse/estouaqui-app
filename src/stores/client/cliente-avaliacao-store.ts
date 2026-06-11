// stores/client/cliente-avaliacao-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface AvaliacaoData {
  id: number;
  pedido_id: number;
  prestador_id: number;
  cliente_id: number;
  nota: number;
  comentario?: string;
  recomenda?: boolean;
  created_at: string;
  categorias?: Record<string, number>;
  cliente?: {
    id: number;
    nome: string;
    foto?: string;
  };
  prestador?: {
    id: number;
    nome: string;
    foto?: string;
  };
}

export interface CategoriaAvaliacao {
  nome: string;
  valor: number;
}

export interface ServicoAvaliado {
  id: number;
  servicoNome: string;
  data: string;
  prestadorId: number;
  pedidoNumero?: string;
}

export interface PrestadorInfo {
  id: number;
  nome: string;
  foto: string | null;
  telefone?: string;
  media_avaliacao?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useAvaliacaoStore = defineStore('clienteAvaliacao', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const enviando = ref(false);
  const avaliacaoAtual = ref<AvaliacaoData | null>(null);
  const prestador = ref<PrestadorInfo | null>(null);
  const servico = ref<ServicoAvaliado | null>(null);
  const jaAvaliou = ref(false);
  const erro = ref<string | null>(null);

  // Categorias padrão para avaliação
  const categoriasPadrao: CategoriaAvaliacao[] = [
    { nome: 'Pontualidade', valor: 0 },
    { nome: 'Qualidade do trabalho', valor: 0 },
    { nome: 'Preço justo', valor: 0 },
    { nome: 'Comunicação', valor: 0 },
    { nome: 'Limpeza', valor: 0 }
  ];

  const categoriasAvaliacao = ref<CategoriaAvaliacao[]>([...categoriasPadrao]);

  // Formulário de avaliação
  const formulario = ref({
    nota: 0,
    comentario: '',
    recomenda: null as boolean | null
  });

  // ===================== GETTERS =====================

  const notaFormatada = computed(() => {
    return formulario.value.nota.toFixed(1);
  });

  const ratingLabel = computed(() => {
    const labels = [
      'Péssimo',
      'Ruim',
      'Razoável',
      'Bom',
      'Excelente!'
    ];
    return labels[formulario.value.nota - 1] || 'Selecione uma nota';
  });

  const podeEnviar = computed(() => {
    return formulario.value.nota > 0 && !enviando.value && !jaAvaliou.value;
  });

  const mediaCategorias = computed(() => {
    if (categoriasAvaliacao.value.length === 0) return 0;
    const soma = categoriasAvaliacao.value.reduce((acc, cat) => acc + cat.valor, 0);
    return soma / categoriasAvaliacao.value.length;
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

  const formatarData = (data?: string): string => {
    if (!data) return 'Data não informada';
    try {
      return new Date(data).toLocaleDateString('pt-PT', {
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=60`;
  };

  const resetFormulario = (): void => {
    formulario.value = {
      nota: 0,
      comentario: '',
      recomenda: null as boolean | null
    };
    categoriasAvaliacao.value = [...categoriasPadrao];
  };

  // ===================== AÇÕES - MANIPULAÇÃO DO FORMULÁRIO =====================

  const setNota = (nota: number): void => {
    formulario.value.nota = nota;
  };

  const setComentario = (value: string | number | null): void => {
    formulario.value.comentario = value !== null ? String(value) : '';
  };

  const setRecomenda = (recomenda: boolean): void => {
    formulario.value.recomenda = recomenda;
  };

  const setCategoriaValor = (index: number, valor: number): void => {
    if (categoriasAvaliacao.value[index]) {
      categoriasAvaliacao.value[index].valor = valor;
    }
  };

  // ===================== AÇÕES - BUSCA DE DADOS =====================

  const fetchPedidoInfo = async (pedidoId: number): Promise<ServicoAvaliado | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/cliente/pedidos/${pedidoId}`);

      if (response.data?.success && response.data.data) {
        const dados = response.data.data;
        return {
          id: dados.id,
          servicoNome: dados.servico?.nome || 'Serviço',
          data: dados.created_at,
          prestadorId: dados.prestador?.id || 0,
          pedidoNumero: dados.numero
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const fetchPrestadorInfo = async (prestadorId: number): Promise<PrestadorInfo | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/prestadores/${prestadorId}`);

      if (response.data?.success && response.data.data) {
        const dados = response.data.data;
        const prestadorInfo: PrestadorInfo = {
          id: dados.id,
          nome: dados.nome,
          foto: dados.foto || null,
          telefone: dados.telefone,
          media_avaliacao: dados.media_avaliacao
        };
        prestador.value = prestadorInfo;
        return prestadorInfo;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  /**
   * ✅ CORRIGIDO: Verificar se já existe avaliação para o pedido
   * Rota: GET /api/pedidos/{pedidoId}/avaliacao
   */
  const verificarJaAvaliou = async (pedidoId: number): Promise<boolean> => {
    carregando.value = true;

    try {
      const response = await api.get(`/pedidos/${pedidoId}/avaliacao`);

      if (response.data?.success) {
        jaAvaliou.value = response.data.data !== null;
        if (jaAvaliou.value && response.data.data) {
          avaliacaoAtual.value = response.data.data;
        }
        return jaAvaliou.value;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar avaliação:', error);
      return false;
    } finally {
      carregando.value = false;
    }
  };

  // ===================== AÇÕES - ENVIO DE AVALIAÇÃO =====================

  /**
   * ✅ CORRIGIDO: Enviar avaliação para o pedido
   * Rota: POST /api/pedidos/{pedidoId}/avaliar
   */
  const enviarAvaliacao = async (
    pedidoId: number,
    prestadorId: number,
    nota: number,
    comentario: string,
    recomenda?: boolean | null,
    categorias?: CategoriaAvaliacao[]
  ): Promise<AvaliacaoData | null> => {
    enviando.value = true;
    erro.value = null;

    try {
      // Payload com os dados da avaliação
      const payload: Record<string, unknown> = {
        nota,
        comentario
      };

      if (recomenda !== null && recomenda !== undefined) {
        payload.recomenda = recomenda;
      }

      if (categorias && categorias.length > 0) {
        const categoriasObj: Record<string, number> = {};
        categorias.forEach(cat => {
          if (cat.valor > 0) {
            categoriasObj[cat.nome] = cat.valor;
          }
        });
        if (Object.keys(categoriasObj).length > 0) {
          payload.categorias = categoriasObj;
        }
      }

      const response = await api.post(`/pedidos/${pedidoId}/avaliar`, payload);

      if (response.data?.success && response.data.data) {
        avaliacaoAtual.value = response.data.data;
        jaAvaliou.value = true;
        return avaliacaoAtual.value;
      }

      throw new Error('Erro ao enviar avaliação');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      enviando.value = false;
    }
  };

  // ===================== AÇÕES - CARREGAMENTO INICIAL =====================

  const carregarDados = async (pedidoId: number): Promise<boolean> => {
    carregamentoInicial.value = true;
    erro.value = null;
    jaAvaliou.value = false;

    try {
      // Verificar se já avaliou
      const jaAvaliouAntes = await verificarJaAvaliou(pedidoId);
      if (jaAvaliouAntes) {
        erro.value = 'Você já avaliou este serviço.';
        carregamentoInicial.value = false;
        return false;
      }

      // Buscar informações do pedido
      const servicoInfo = await fetchPedidoInfo(pedidoId);
      if (!servicoInfo) {
        erro.value = 'Pedido não encontrado';
        carregamentoInicial.value = false;
        return false;
      }

      servico.value = servicoInfo;

      // Buscar informações do prestador
      if (servicoInfo.prestadorId) {
        await fetchPrestadorInfo(servicoInfo.prestadorId);
      }

      return true;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      erro.value = 'Erro ao carregar dados. Verifique sua conexão.';
      return false;
    } finally {
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  // ===================== AÇÕES - UTILITÁRIOS =====================

  const limparStore = (): void => {
    avaliacaoAtual.value = null;
    prestador.value = null;
    servico.value = null;
    jaAvaliou.value = false;
    erro.value = null;
    carregando.value = false;
    carregamentoInicial.value = true;
    enviando.value = false;
    resetFormulario();
  };

  return {
    // Estados
    carregando,
    carregamentoInicial,
    enviando,
    avaliacaoAtual,
    prestador,
    servico,
    jaAvaliou,
    erro,
    categoriasAvaliacao,
    formulario,

    // Getters
    notaFormatada,
    ratingLabel,
    podeEnviar,
    mediaCategorias,

    // Utilitários
    formatarData,
    getAvatarUrl,
    getErrorMessage,
    resetFormulario,

    // Ações de manipulação do formulário
    setNota,
    setComentario,
    setRecomenda,
    setCategoriaValor,

    // Ações de busca
    fetchPedidoInfo,
    fetchPrestadorInfo,
    verificarJaAvaliou,

    // Ação de envio
    enviarAvaliacao,

    // Ação principal
    carregarDados,

    // Limpeza
    limparStore,
  };
});

export default useAvaliacaoStore;
