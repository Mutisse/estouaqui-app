<template>
  <div class="bg-grey-1">
    <!-- Skeleton Loading (sem spinner) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-number"></div>
      </div>
      <div class="skeleton-status-card q-ma-md">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-30"></div>
      </div>
      <div class="skeleton-card q-mb-md q-mx-md">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-avatar-row">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-card-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-card q-mb-md q-mx-md">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-card-info">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-80"></div>
        </div>
      </div>
      <div class="skeleton-card q-mb-md q-mx-md">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-line w-70"></div>
      </div>
    </div>

    <!-- Conteúdo original -->
    <template v-else>
      <div v-if="pedido" class="pedido-detalhes">
        <!-- Header -->
        <div class="header-gradient q-pa-md">
          <q-btn flat round dense icon="arrow_back" color="white" @click="$router.back()" />
          <div class="text-h6 text-white q-mt-sm">Detalhes do Pedido</div>
          <div class="text-subtitle2 text-white" style="opacity: 0.9">#{{ pedido.numero }}</div>
        </div>

        <!-- Status -->
        <div class="status-card q-ma-md">
          <div class="row items-center justify-between">
            <div class="text-weight-bold">Status:</div>
            <q-badge :color="statusColor" class="q-px-md q-py-sm">
              {{ statusLabel }}
            </q-badge>
          </div>
        </div>

        <!-- Cliente -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="person" size="20px" class="q-mr-sm" />
              Cliente
            </div>
            <div class="row items-center q-mt-md">
              <q-avatar size="50px" class="q-mr-md">
                <img :src="pedido.cliente?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.cliente?.nome || 'Cliente')}&background=667eea&color=fff`" />
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                <div class="text-caption text-grey-6">{{ pedido.cliente?.telefone || 'Sem telefone' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Prestador (se já tiver) com botão de chat -->
        <q-card v-if="pedido.prestador" class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="handyman" size="20px" class="q-mr-sm" />
              Prestador
            </div>
            <div class="row items-center justify-between q-mt-md">
              <div class="row items-center">
                <q-avatar size="50px" class="q-mr-md">
                  <img :src="pedido.prestador?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.prestador?.nome || 'Prestador')}&background=667eea&color=fff`" />
                </q-avatar>
                <div>
                  <div class="text-weight-bold">{{ pedido.prestador?.nome || 'Prestador' }}</div>
                  <div class="text-caption text-grey-6">{{ pedido.prestador?.telefone || 'Sem telefone' }}</div>
                  <div class="row items-center q-mt-xs" v-if="pedido.prestador?.media_avaliacao">
                    <q-rating v-model="pedido.prestador.media_avaliacao" size="14px" :max="5" color="yellow" readonly />
                    <span class="text-caption text-grey-6 q-ml-xs">({{ pedido.prestador.media_avaliacao }})</span>
                  </div>
                </div>
              </div>
              <q-btn
                color="primary"
                icon="chat"
                label="Conversar"
                unelevated
                dense
                @click="irParaChat"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Serviço -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="work" size="20px" class="q-mr-sm" />
              Serviço
            </div>
            <div class="q-mt-md">
              <div class="text-weight-bold">{{ pedido.categoria?.nome || 'Categoria não definida' }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">{{ pedido.descricao || 'Sem descrição' }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Localização -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="location_on" size="20px" class="q-mr-sm" />
              Localização
            </div>
            <div class="q-mt-md">
              <div class="text-caption">{{ pedido.endereco }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Data -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="calendar_today" size="20px" class="q-mr-sm" />
              Data do Pedido
            </div>
            <div class="q-mt-md">
              <div class="text-caption">{{ formatarData(pedido.created_at) }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Foto do Pedido -->
        <q-card v-if="pedido.foto" class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="photo" size="20px" class="q-mr-sm" />
              Foto do Serviço
            </div>
            <div class="q-mt-md text-center">
              <img :src="pedido.foto" class="foto-pedido" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-else class="empty-state text-center q-pa-xl">
        <q-icon name="error" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Pedido não encontrado</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';
import { useClientePedidosStore, type PedidoData } from 'src/stores/client/cliente-pedidos-store';
import { usePrestadorServicosStore, type SolicitacaoData } from 'src/stores/prestador/prestador-servicos-store';

// ==========================================
// INTERFACES LOCAIS
// ==========================================

interface ClienteInfo {
  id: number;
  nome: string;
  foto: string | null;
  telefone: string;
}

interface CategoriaInfo {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

interface PrestadorInfo {
  id: number;
  nome: string;
  foto: string | null;
  telefone: string;
  media_avaliacao?: number;
}

interface PedidoDetalhesData {
  id: number;
  numero: string;
  status: string;
  descricao: string | null;
  foto: string | null;
  data: string;
  endereco: string;
  observacoes: string | null;
  valor: number | null;
  created_at: string;
  cliente?: ClienteInfo;
  categoria?: CategoriaInfo;
  prestador?: PrestadorInfo;
}

// ✅ Tipo para acessar propriedades opcionais sem usar 'any'
type DadosComIds = (PedidoData | SolicitacaoData) & {
  cliente_id?: number;
  prestador_id?: number;
  categoria_id?: number;
};

// ==========================================
// SETUP
// ==========================================

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const clientePedidosStore = useClientePedidosStore();
const prestadorServicosStore = usePrestadorServicosStore();

const carregamentoInicial = ref(true);
const pedido = ref<PedidoDetalhesData | null>(null);

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

const formatarData = (data: string) => {
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

const irParaChat = () => {
  if (pedido.value?.prestador?.id) {
    void router.push(`/mobile/chat/${pedido.value.prestador.id}`);
  }
};

// ==========================================
// BUSCAR DADOS ADICIONAIS
// ==========================================

const buscarClienteInfo = async (clienteId: number): Promise<ClienteInfo | undefined> => {
  try {
    const response = await api.get(`/users/${clienteId}`);
    if (response.data.success && response.data.data) {
      return {
        id: response.data.data.id,
        nome: response.data.data.nome,
        foto: response.data.data.foto || null,
        telefone: response.data.data.telefone || '',
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const buscarPrestadorInfo = async (prestadorId: number): Promise<PrestadorInfo | undefined> => {
  try {
    const response = await api.get(`/prestadores/${prestadorId}`);
    if (response.data.success && response.data.data) {
      return {
        id: response.data.data.id,
        nome: response.data.data.nome,
        foto: response.data.data.foto || null,
        telefone: response.data.data.telefone || '',
        media_avaliacao: response.data.data.media_avaliacao,
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const buscarCategoriaInfo = async (categoriaId: number): Promise<CategoriaInfo | undefined> => {
  try {
    const response = await api.get(`/categorias/${categoriaId}`);
    if (response.data.success && response.data.data) {
      return {
        id: response.data.data.id,
        nome: response.data.data.nome,
        icone: response.data.data.icone || 'category',
        cor: response.data.data.cor || 'primary',
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// ==========================================
// CARREGAR PEDIDO
// ==========================================

const carregarPedido = async () => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    carregamentoInicial.value = false;
    return;
  }

  const pedidoId = Number(id);

  try {
    let dados: PedidoData | SolicitacaoData | null = null;

    if (authStore.isPrestador) {
      await prestadorServicosStore.fetchSolicitacoes();
      dados = prestadorServicosStore.solicitacoes.find(
        (s: SolicitacaoData) => s.id === pedidoId
      ) || null;
    } else {
      await clientePedidosStore.fetchMeusPedidos();
      dados = clientePedidosStore.pedidos.find(
        (p: PedidoData) => p.id === pedidoId
      ) || null;
    }

    if (dados) {
      // ✅ Sem 'any' - usando o tipo DadosComIds
      const dadosComIds = dados as DadosComIds;

      const detalhes: PedidoDetalhesData = {
        id: dados.id,
        numero: dados.numero,
        status: dados.status,
        descricao: 'descricao' in dados ? (dados.descricao || null) : null,
        foto: 'foto' in dados ? (dados.foto || null) : null,
        data: dados.data,
        endereco: dados.endereco,
        observacoes: 'observacoes' in dados ? (dados.observacoes || null) : null,
        valor: dados.valor,
        created_at: dados.created_at,
      };

      // Buscar cliente
      const clienteId = dadosComIds.cliente_id;
      if (clienteId) {
        const clienteInfo = await buscarClienteInfo(clienteId);
        if (clienteInfo) detalhes.cliente = clienteInfo;
      }

      // Buscar prestador
      const prestadorId = dadosComIds.prestador_id;
      if (prestadorId) {
        const prestadorInfo = await buscarPrestadorInfo(prestadorId);
        if (prestadorInfo) detalhes.prestador = prestadorInfo;
      }

      // Buscar categoria
      const categoriaId = dadosComIds.categoria_id;
      if (categoriaId) {
        const categoriaInfo = await buscarCategoriaInfo(categoriaId);
        if (categoriaInfo) detalhes.categoria = categoriaInfo;
      }

      pedido.value = detalhes;
    } else {
      pedido.value = null;
    }
  } catch (error) {
    console.error('Erro ao carregar pedido:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar detalhes do pedido',
      position: 'top'
    });
    pedido.value = null;
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

onMounted(() => {
  void carregarPedido();
});
</script>

<style scoped lang="scss">
/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: #f5f5f5;
  min-height: 100vh;
}

.skeleton-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.skeleton-title {
  width: 180px;
  height: 24px;
  border-radius: 12px;
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.skeleton-number {
  width: 100px;
  height: 16px;
  border-radius: 8px;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-status-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
  padding: 16px;
}

.skeleton-card-header {
  width: 120px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 16px;
}

.skeleton-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-80 { width: 80%; }

/* ========================================== */
/* ESTILOS ORIGINAIS */
/* ========================================== */

.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
}

.info-card {
  border-radius: 16px;
  border: 1px solid #eee;
}

.foto-pedido {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}
</style>
