// src/stores/promocao-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';
import type { AxiosError } from 'axios';

export interface PromocaoData {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  valor_minimo: number;
  validade: string;
  ativo: boolean;
  imagem: string | null;
  icone?: string;
  created_at: string;
}

export interface CupomAplicado {
  id: number;
  codigo: string;
  titulo: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor_desconto: number;
  desconto_aplicado: number;
  valor_minimo: number;
  validade: string;
}

interface ValidarCupomResponse {
  success: boolean;
  data: {
    id: number;
    codigo: string;
    titulo: string;
    descricao: string;
    tipo_desconto: 'percentual' | 'fixo';
    valor_desconto: number;
    desconto_aplicado: number;
    valor_minimo: number;
    validade: string;
  };
  message?: string;
}

export const usePromocaoStore = defineStore('promocao', () => {
  const $q = useQuasar();
  const loading = ref(false);
  const promocoes = ref<PromocaoData[]>([]);
  const cupomAplicado = ref<CupomAplicado | null>(null);

  // Computed
  const temCupomAplicado = computed(() => cupomAplicado.value !== null);
  const valorDesconto = computed(() => cupomAplicado.value?.desconto_aplicado || 0);

  /**
   * Buscar todas as promoções ativas - CORRIGIDO COM TIMEOUT E FALLBACK
   */
  /**
   * Buscar todas as promoções ativas - VERSÃO SIMPLES
   */
  async function fetchPromocoes(): Promise<PromocaoData[]> {
    loading.value = true;

    try {
      const response = await api.get(CLIENTE_ENDPOINTS.PROMOCOES_ATIVAS);

      // Extrair dados corretamente
      const data = response.data?.data ?? response.data ?? [];
      promocoes.value = Array.isArray(data) ? data : [];

      return promocoes.value;
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      promocoes.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Buscar todas as promoções (incluindo inativas - admin) - COM TIMEOUT
   */
  async function fetchTodasPromocoes(): Promise<PromocaoData[]> {
    loading.value = true;
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.PROMOCOES, {
        timeout: 15000, // Timeout de 15 segundos
      });
      const data = response.data.data;
      promocoes.value = Array.isArray(data) ? data : [];

      // Salvar no cache local
      localStorage.setItem('promocoes_cache', JSON.stringify(promocoes.value));

      return promocoes.value;
    } catch (error) {
      console.error('Erro ao carregar todas promoções:', error);

      // Tentar cache
      const cachedPromocoes = localStorage.getItem('promocoes_cache');
      if (cachedPromocoes) {
        try {
          const parsed = JSON.parse(cachedPromocoes);
          if (Array.isArray(parsed)) {
            promocoes.value = parsed;
            return promocoes.value;
          }
        } catch (e) {
          console.error('Erro ao carregar cache:', e);
        }
      }

      promocoes.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Buscar promoção por ID - COM TIMEOUT
   */
  async function buscarPromocaoPorId(id: number): Promise<PromocaoData | null> {
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.PROMOCOES_ID(id), {
        timeout: 10000,
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Erro ao buscar promoção:', error);
      return null;
    }
  }

  /**
   * Buscar promoção por código - COM TIMEOUT
   */
  async function buscarPromocaoPorCodigo(codigo: string): Promise<PromocaoData | null> {
    try {
      const response = await api.get(CLIENTE_ENDPOINTS.PROMOCOES_CODIGO(codigo), {
        timeout: 10000,
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Erro ao buscar promoção por código:', error);
      return null;
    }
  }

  /**
   * Validar cupom - COM TIMEOUT
   */
  async function validarCupom(codigo: string, valorPedido?: number): Promise<CupomAplicado | null> {
    try {
      const response = await api.post<ValidarCupomResponse>(
        CLIENTE_ENDPOINTS.VALIDAR_CUPOM,
        {
          codigo: codigo.toUpperCase(),
          valor_pedido: valorPedido,
        },
        {
          timeout: 15000,
        },
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        const cupom: CupomAplicado = {
          id: data.id,
          codigo: data.codigo,
          titulo: data.titulo,
          tipo_desconto: data.tipo_desconto,
          valor_desconto: data.valor_desconto,
          desconto_aplicado: data.desconto_aplicado,
          valor_minimo: data.valor_minimo,
          validade: data.validade,
        };

        $q.notify({
          type: 'positive',
          message: `Cupom ${codigo} válido! ${data.desconto_aplicado > 0 ? `Desconto de ${formatMoney(data.desconto_aplicado)}` : ''}`,
          position: 'top',
          timeout: 3000,
        });

        return cupom;
      }
      return null;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      // Verificar se é timeout
      if (error.code === 'ECONNABORTED') {
        $q.notify({
          type: 'warning',
          message: 'Serviço de cupons está demorando, tente novamente',
          position: 'top',
          timeout: 3000,
        });
      } else {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Cupom inválido',
          position: 'top',
          timeout: 3000,
        });
      }
      return null;
    }
  }

  /**
   * Aplicar cupom no pedido atual
   */
  async function aplicarCupom(codigo: string, valorPedido?: number): Promise<boolean> {
    const cupom = await validarCupom(codigo, valorPedido);
    if (cupom) {
      cupomAplicado.value = cupom;
      localStorage.setItem('cupom_aplicado', JSON.stringify(cupom));
      $q.notify({
        type: 'positive',
        message: `Cupom ${cupom.codigo} aplicado com sucesso!`,
        position: 'top',
        timeout: 3000,
      });
      return true;
    }
    return false;
  }

  /**
   * Limpar cupom aplicado
   */
  function limparCupomAplicado(): void {
    cupomAplicado.value = null;
    localStorage.removeItem('cupom_aplicado');
    $q.notify({
      type: 'info',
      message: 'Cupom removido com sucesso',
      position: 'top',
      timeout: 2000,
    });
  }

  /**
   * Restaurar cupom salvo (após refresh)
   */
  function restaurarCupom(): void {
    const saved = localStorage.getItem('cupom_aplicado');
    if (saved) {
      try {
        cupomAplicado.value = JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao restaurar cupom:', e);
        cupomAplicado.value = null;
      }
    }
  }

  /**
   * Calcular desconto para um valor
   */
  function calcularDesconto(valor: number): number {
    if (!cupomAplicado.value) return 0;

    if (cupomAplicado.value.tipo_desconto === 'percentual') {
      return (valor * cupomAplicado.value.valor_desconto) / 100;
    }
    return Math.min(cupomAplicado.value.valor_desconto, valor);
  }

  /**
   * Calcular valor final após desconto
   */
  function calcularValorFinal(valor: number): number {
    const desconto = calcularDesconto(valor);
    return Math.max(0, valor - desconto);
  }

  function formatMoney(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(value);
  }

  return {
    // State
    loading,
    promocoes,
    cupomAplicado,

    // Computed
    temCupomAplicado,
    valorDesconto,

    // Actions
    fetchPromocoes,
    fetchTodasPromocoes,
    buscarPromocaoPorId,
    buscarPromocaoPorCodigo,
    validarCupom,
    aplicarCupom,
    limparCupomAplicado,
    restaurarCupom,
    calcularDesconto,
    calcularValorFinal,
  };
});
