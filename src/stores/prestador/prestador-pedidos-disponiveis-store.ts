import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface CategoriaPedido {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
}

export interface ClientePedido {
  id: number;
  nome: string;
  foto: string | null;
  telefone?: string;
}

export interface PedidoDisponivelData {
  id: number;
  cliente_id: number;
  categoria_id: number;
  descricao: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  distancia_km?: number;
  status: string;
  created_at: string;
  cliente?: ClientePedido;
  categoria?: CategoriaPedido;
  proposta_enviada?: boolean;
  proposta_data?: string | null;
  proposta_id?: number | null;
  proposta_status?: string | null;
}

export interface PropostaData {
  pedido_id: number;
  valor: number;
  mensagem?: string;
}

export interface PropostaExistenteResponse {
  enviou: boolean;
  proposta: {
    id: number;
    valor: number;
    mensagem: string;
    status: string;
    created_at: string;
  } | null;
}

export interface FiltrosPedidos {
  categoriaId: number | null;
  raio: number;
  ordenacao: string;
}

export interface RaioOption {
  label: string;
  value: number;
}

export interface OrdenacaoOption {
  label: string;
  value: string;
}

// ===================== STORE =====================

export const usePrestadorPedidosDisponiveisStore = defineStore(
  'prestadorPedidosDisponiveis',
  () => {
    const authStore = useAuthStore();

    // ===================== ESTADOS =====================
    const isLoading = ref(false);
    const isSending = ref(false);
    const error = ref<string | null>(null);

    // Dados principais
    const pedidos = ref<PedidoDisponivelData[]>([]);
    const dadosCarregados = ref(false);
    const ultimaAtualizacao = ref<Date | null>(null);

    // Dados vindos do backend
    const raioOptions = ref<RaioOption[]>([]);
    const ordenacaoOptions = ref<OrdenacaoOption[]>([]);
    const carregandoConfiguracoes = ref(false);

    // Filtros
    const filtros = ref<FiltrosPedidos>({
      categoriaId: null,
      raio: 10,
      ordenacao: 'distancia',
    });

    // Modal de proposta
    const modalProposta = ref({
      visivel: false,
      pedido: null as PedidoDisponivelData | null,
    });

    const novaProposta = ref<PropostaData>({
      pedido_id: 0,
      valor: 0,
      mensagem: '',
    });

    // Cache de propostas já verificadas
    const propostasCache = ref<Map<number, PropostaExistenteResponse>>(new Map());

    // ===================== GETTERS =====================

    const pedidosFiltrados = computed(() => {
      let resultado = [...pedidos.value];

      // Filtrar por categoria
      if (filtros.value.categoriaId) {
        resultado = resultado.filter((p) => p.categoria?.id === filtros.value.categoriaId);
      }

      // Filtrar por raio
      if (filtros.value.raio) {
        resultado = resultado.filter((p) => {
          if (p.distancia_km === undefined || p.distancia_km === null) return true;
          return p.distancia_km <= filtros.value.raio;
        });
      }

      // Ordenar
      if (filtros.value.ordenacao === 'distancia') {
        resultado.sort((a, b) => (a.distancia_km ?? 9999) - (b.distancia_km ?? 9999));
      } else if (filtros.value.ordenacao === 'distancia_desc') {
        resultado.sort((a, b) => (b.distancia_km ?? -1) - (a.distancia_km ?? -1));
      } else if (filtros.value.ordenacao === 'data') {
        resultado.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      }

      return resultado;
    });

    const totalPedidosDisponiveis = computed(() => pedidosFiltrados.value.length);
    const temPedidosDisponiveis = computed(() => pedidosFiltrados.value.length > 0);
    const ultimoPedido = computed(() => pedidos.value[0] || null);

    // ===================== CONFIGURAÇÕES DO BACKEND =====================

    const fetchRaioOptions = async (): Promise<void> => {
      try {
        const response = await api.get('/configuracoes/raio-options');

        if (response.data?.success && response.data.data) {
          raioOptions.value = response.data.data;
          if (raioOptions.value.length > 0 && filtros.value.raio === 10) {
            filtros.value.raio = raioOptions.value[0]?.value || 10;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar opções de raio:', err);
        raioOptions.value = [
          { label: '5 km', value: 5 },
          { label: '10 km', value: 10 },
          { label: '20 km', value: 20 },
          { label: '30 km', value: 30 },
          { label: '50 km', value: 50 },
        ];
      }
    };

    const fetchOrdenacaoOptions = async (): Promise<void> => {
      try {
        const response = await api.get('/configuracoes/ordenacao-options');

        if (response.data?.success && response.data.data) {
          ordenacaoOptions.value = response.data.data;
          if (ordenacaoOptions.value.length > 0 && filtros.value.ordenacao === 'distancia') {
            filtros.value.ordenacao = ordenacaoOptions.value[0]?.value || 'distancia';
          }
        }
      } catch (err) {
        console.error('Erro ao buscar opções de ordenação:', err);
        ordenacaoOptions.value = [
          { label: 'Mais próximos', value: 'distancia' },
          { label: 'Mais recentes', value: 'data' },
          { label: 'Maior distância', value: 'distancia_desc' },
        ];
      }
    };

    const carregarConfiguracoes = async (): Promise<void> => {
      carregandoConfiguracoes.value = true;
      try {
        await Promise.all([fetchRaioOptions(), fetchOrdenacaoOptions()]);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        carregandoConfiguracoes.value = false;
      }
    };

    // ===================== VERIFICAÇÃO DE PROPOSTAS =====================

    /**
     * Verifica se o prestador já enviou proposta para um pedido específico
     */
    const verificarPropostaExistente = async (
      pedidoId: number,
    ): Promise<PropostaExistenteResponse> => {
      if (propostasCache.value.has(pedidoId)) {
        return propostasCache.value.get(pedidoId)!;
      }

      try {
        const response = await api.get(`/prestador/propostas/check/${pedidoId}`);
        const resultado = {
          enviou: response.data?.enviou || false,
          proposta: response.data?.proposta || null,
        };
        propostasCache.value.set(pedidoId, resultado);
        return resultado;
      } catch (err: unknown) {
        // 🔥 404 significa que não existe proposta - não é erro!
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            const resultado = { enviou: false, proposta: null };
            propostasCache.value.set(pedidoId, resultado);
            return resultado;
          }
        }
        console.error('Erro ao verificar proposta:', err);
        return { enviou: false, proposta: null };
      }
    };
    /**
     * Verifica propostas para múltiplos pedidos (CORRIGIDO)
     */
    const verificarPropostasMultiplas = async (
      pedidosList: PedidoDisponivelData[],
    ): Promise<void> => {
      const promises = pedidosList.map((pedido) => verificarPropostaExistente(pedido.id));
      const resultados = await Promise.all(promises);

      pedidosList.forEach((pedido, index) => {
        const resultado = resultados[index];
        // 🔥 CORREÇÃO: Verificar se resultado existe
        if (resultado) {
          pedido.proposta_enviada = resultado.enviou;
          pedido.proposta_data = resultado.proposta?.created_at ?? null;
          pedido.proposta_id = resultado.proposta?.id ?? null;
          pedido.proposta_status = resultado.proposta?.status ?? null;
        } else {
          pedido.proposta_enviada = false;
          pedido.proposta_data = null;
          pedido.proposta_id = null;
          pedido.proposta_status = null;
        }
      });
    };

    // ===================== AÇÕES PRINCIPAIS =====================

    const fetchPedidosDisponiveis = async (): Promise<void> => {
      if (!authStore.isPrestador) return;

      isLoading.value = true;
      error.value = null;

      try {
        const response = await api.get('/prestador/pedidos-disponiveis');

        if (response.data?.success && response.data.data) {
          pedidos.value = response.data.data;
          dadosCarregados.value = true;
          ultimaAtualizacao.value = new Date();
          await verificarPropostasMultiplas(pedidos.value);
        } else if (Array.isArray(response.data)) {
          pedidos.value = response.data;
          dadosCarregados.value = true;
          ultimaAtualizacao.value = new Date();
          await verificarPropostasMultiplas(pedidos.value);
        } else {
          throw new Error('Resposta da API inválida');
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos disponíveis:', err);
        const axiosError = err as AxiosError;
        error.value = axiosError.message || 'Erro ao carregar pedidos';
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const enviarProposta = async (proposta: PropostaData): Promise<boolean> => {
      isSending.value = true;
      error.value = null;

      try {
        const response = await api.post('/prestador/propostas', proposta);

        if (response.data?.success) {
          // Remover o pedido da lista após enviar proposta
          const index = pedidos.value.findIndex((p) => p.id === proposta.pedido_id);
          if (index !== -1) {
            pedidos.value.splice(index, 1);
          }
          propostasCache.value.delete(proposta.pedido_id);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao enviar proposta:', err);
        const axiosError = err as AxiosError;
        error.value = axiosError.message || 'Erro ao enviar proposta';
        return false;
      } finally {
        isSending.value = false;
      }
    };

    const aplicarFiltros = async (): Promise<void> => {
      await fetchPedidosDisponiveis();
    };

    const limparFiltros = (): void => {
      filtros.value = {
        categoriaId: null,
        raio: raioOptions.value[0]?.value || 10,
        ordenacao: ordenacaoOptions.value[0]?.value || 'distancia',
      };
    };

    const atualizarFiltro = <K extends keyof FiltrosPedidos>(
      chave: K,
      valor: FiltrosPedidos[K],
    ): void => {
      filtros.value[chave] = valor;
    };

    /**
     * Abre o modal de proposta COM verificação prévia
     */
    const abrirModalProposta = async (pedido: PedidoDisponivelData): Promise<boolean> => {
      const { enviou, proposta } = await verificarPropostaExistente(pedido.id);

      if (enviou) {
        error.value = `Você já enviou uma proposta para este pedido em ${proposta?.created_at}`;
        return false;
      }

      modalProposta.value = {
        visivel: true,
        pedido,
      };
      novaProposta.value = {
        pedido_id: pedido.id,
        valor: 0,
        mensagem: '',
      };
      error.value = null;
      return true;
    };

    const fecharModalProposta = (): void => {
      modalProposta.value = {
        visivel: false,
        pedido: null,
      };
      novaProposta.value = {
        pedido_id: 0,
        valor: 0,
        mensagem: '',
      };
    };

    const enviarPropostaModal = async (): Promise<boolean> => {
      if (!novaProposta.value.pedido_id || novaProposta.value.valor <= 0) {
        error.value = 'Informe um valor válido';
        return false;
      }

      return enviarProposta(novaProposta.value);
    };

    const recarregarDados = async (): Promise<void> => {
      await fetchPedidosDisponiveis();
    };

    const carregarTodosDados = async (): Promise<void> => {
      isLoading.value = true;
      try {
        await Promise.all([carregarConfiguracoes(), fetchPedidosDisponiveis()]);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const limparStore = (): void => {
      pedidos.value = [];
      dadosCarregados.value = false;
      ultimaAtualizacao.value = null;
      error.value = null;
      propostasCache.value.clear();
      limparFiltros();
      fecharModalProposta();
    };

    return {
      // Estados
      isLoading,
      isSending,
      error,
      pedidos,
      dadosCarregados,
      ultimaAtualizacao,
      filtros,
      modalProposta,
      novaProposta,
      raioOptions,
      ordenacaoOptions,
      carregandoConfiguracoes,

      // Getters
      pedidosFiltrados,
      totalPedidosDisponiveis,
      temPedidosDisponiveis,
      ultimoPedido,

      // Actions
      fetchPedidosDisponiveis,
      enviarProposta,
      aplicarFiltros,
      limparFiltros,
      atualizarFiltro,
      abrirModalProposta,
      fecharModalProposta,
      enviarPropostaModal,
      recarregarDados,
      carregarTodosDados,
      carregarConfiguracoes,
      fetchRaioOptions,
      fetchOrdenacaoOptions,
      verificarPropostaExistente,
      limparStore,
    };
  },
);

export default usePrestadorPedidosDisponiveisStore;
