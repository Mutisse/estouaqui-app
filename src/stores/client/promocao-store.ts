// stores/client/promocao-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';

export interface PromocaoData {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  valor_minimo: number;
  maximo_uso: number | null;
  usado_vezes: number;
  validade: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ValidacaoCupomResult {
  valido: boolean;
  desconto: number;
  mensagem?: string;
  tipo_desconto?: 'percentual' | 'fixo';
  valor_minimo?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const usePromocaoStore = defineStore('promocao', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregamentoInicial = ref(true);
  const promocoes = ref<PromocaoData[]>([]);
  const ultimoCupomValidado = ref<ValidacaoCupomResult | null>(null);
  const erro = ref<string | null>(null);

  // ===================== GETTERS =====================

  const promocoesAtivas = computed(() => {
    const hoje = new Date();
    return promocoes.value.filter(promo => {
      const dataValidade = new Date(promo.validade);
      return promo.ativo && dataValidade >= hoje;
    });
  });

  const promocoesExpiradas = computed(() => {
    const hoje = new Date();
    return promocoes.value.filter(promo => {
      const dataValidade = new Date(promo.validade);
      return !promo.ativo || dataValidade < hoje;
    });
  });

  const temPromocoes = computed(() => promocoesAtivas.value.length > 0);
  const totalPromocoes = computed(() => promocoesAtivas.value.length);

  const maioresDescontos = computed(() => {
    return [...promocoesAtivas.value]
      .sort((a, b) => {
        const descontoA = a.tipo_desconto === 'percentual' ? a.valor_desconto : (a.valor_desconto / 100);
        const descontoB = b.tipo_desconto === 'percentual' ? b.valor_desconto : (b.valor_desconto / 100);
        return descontoB - descontoA;
      })
      .slice(0, 3);
  });

  const promocoesDestaque = computed(() => {
    return promocoesAtivas.value.filter(promo => {
      if (promo.tipo_desconto === 'percentual') {
        return promo.valor_desconto >= 20;
      }
      return promo.valor_desconto >= 500;
    });
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

  const formatarDesconto = (promo: PromocaoData): string => {
    if (promo.tipo_desconto === 'percentual') {
      return `${promo.valor_desconto}% OFF`;
    }
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(promo.valor_desconto);
  };

  const formatarData = (data: string): string => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const isPromocaoDestaque = (promo: PromocaoData): boolean => {
    if (promo.tipo_desconto === 'percentual') {
      return promo.valor_desconto >= 20;
    }
    return promo.valor_desconto >= 500;
  };

  const isPromocaoValida = (promo: PromocaoData): boolean => {
    const hoje = new Date();
    const dataValidade = new Date(promo.validade);
    return promo.ativo && dataValidade >= hoje;
  };

  // ===================== AÇÕES =====================

  const fetchPromocoes = async (ativas: boolean = true): Promise<PromocaoData[]> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get('/promocoes', {
        params: { ativas }
      });

      if (response.data?.success && response.data.data) {
        promocoes.value = response.data.data;
        return promocoes.value;
      }

      promocoes.value = [];
      return [];
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregando.value = false;
    }
  };

  const fetchPromocaoPorCodigo = async (codigo: string): Promise<PromocaoData | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.get(`/promocoes/${codigo}`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar promoção:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  const validarCupom = async (codigo: string): Promise<ValidacaoCupomResult | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post('/promocoes/validar', { codigo });

      if (response.data?.success) {
        const resultado: ValidacaoCupomResult = {
          valido: response.data.valido,
          desconto: response.data.desconto || 0,
          mensagem: response.data.mensagem,
          tipo_desconto: response.data.tipo_desconto,
          valor_minimo: response.data.valor_minimo,
        };
        ultimoCupomValidado.value = resultado;

        if (resultado.valido) {
          return resultado;
        } else {
          throw new Error(resultado.mensagem || 'Cupom inválido');
        }
      }

      throw new Error('Erro ao validar cupom');
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      erro.value = getErrorMessage(error);

      // Notificação de erro será tratada na página
      return {
        valido: false,
        desconto: 0,
        mensagem: erro.value || 'Cupom inválido',
      };
    } finally {
      carregando.value = false;
    }
  };

  const aplicarCupom = async (codigo: string, valorPedido: number): Promise<{ sucesso: boolean; valorFinal: number; desconto: number; mensagem?: string }> => {
    carregando.value = true;
    erro.value = null;

    try {
      const response = await api.post('/promocoes/aplicar', {
        codigo,
        valor_pedido: valorPedido,
      });

      if (response.data?.success) {
        return {
          sucesso: true,
          valorFinal: response.data.valor_final,
          desconto: response.data.desconto,
          mensagem: response.data.mensagem,
        };
      }

      return {
        sucesso: false,
        valorFinal: valorPedido,
        desconto: 0,
        mensagem: response.data?.mensagem || 'Erro ao aplicar cupom',
      };
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      erro.value = getErrorMessage(error);
      return {
        sucesso: false,
        valorFinal: valorPedido,
        desconto: 0,
        mensagem: erro.value || 'Erro ao aplicar cupom',
      };
    } finally {
      carregando.value = false;
    }
  };

  const limparUltimoCupom = (): void => {
    ultimoCupomValidado.value = null;
  };

  const limparErro = (): void => {
    erro.value = null;
  };

  const limparStore = (): void => {
    promocoes.value = [];
    ultimoCupomValidado.value = null;
    erro.value = null;
    carregando.value = false;
    carregamentoInicial.value = true;
  };

  const carregarDadosIniciais = async (): Promise<void> => {
    carregamentoInicial.value = true;
    try {
      await fetchPromocoes(true);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      erro.value = getErrorMessage(error);
    } finally {
      setTimeout(() => {
        carregamentoInicial.value = false;
      }, 500);
    }
  };

  return {
    // Estados
    carregando,
    carregamentoInicial,
    promocoes,
    ultimoCupomValidado,
    erro,

    // Getters
    promocoesAtivas,
    promocoesExpiradas,
    temPromocoes,
    totalPromocoes,
    maioresDescontos,
    promocoesDestaque,

    // Utilitários
    formatarDesconto,
    formatarData,
    formatarMoeda,
    isPromocaoDestaque,
    isPromocaoValida,
    getErrorMessage,

    // Ações
    fetchPromocoes,
    fetchPromocaoPorCodigo,
    validarCupom,
    aplicarCupom,
    limparUltimoCupom,
    limparErro,
    limparStore,
    carregarDadosIniciais,
  };
});

export default usePromocaoStore;
