<template>
  <q-page class="pedidos-disponiveis-page bg-grey-1">
    <!-- Header -->
    <div class="page-header q-pa-md">
      <div class="text-h6 text-bold">Pedidos Disponíveis</div>
      <div class="text-caption text-grey-6">Encontre serviços perto de si</div>
    </div>

    <!-- Barra de pesquisa -->
    <div class="search-section q-px-md q-mb-md">
      <q-input
        v-model="filtros.busca"
        outlined
        dense
        placeholder="Pesquisar por serviço, localização..."
        class="search-input"
        @update:model-value="aplicarFiltros"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
        <template v-slot:append v-if="filtros.busca">
          <q-icon name="close" class="cursor-pointer" color="grey-6" @click="limparBusca" />
        </template>
      </q-input>
    </div>

    <!-- Filtros -->
    <div class="filters-section q-px-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <!-- Filtro por categoria -->
        <div class="col-6">
          <q-select
            v-model="filtros.categoria_id"
            :options="categoriasOptions"
            label="Categoria"
            outlined
            dense
            emit-value
            map-options
            clearable
            placeholder="Todas categorias"
            @update:model-value="aplicarFiltros"
          />
        </div>

        <!-- Filtro por raio -->
        <div class="col-6">
          <q-select
            v-model="filtros.raio"
            :options="raioOptions"
            label="Raio (km)"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="aplicarFiltros"
          />
        </div>
      </div>

      <!-- Ordenação -->
      <div class="sort-section q-mt-sm">
        <q-btn
          v-for="opt in opcoesOrdenacao"
          :key="opt.value"
          :flat="filtros.ordenacao !== opt.value"
          :outline="filtros.ordenacao === opt.value"
          :color="filtros.ordenacao === opt.value ? 'primary' : 'grey-7'"
          :label="opt.label"
          size="sm"
          dense
          no-caps
          class="q-mr-sm q-mb-sm"
          @click="
            filtros.ordenacao = opt.value;
            aplicarFiltros();
          "
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar pedidos disponíveis...</p>
    </div>

    <!-- Lista de pedidos -->
    <div v-else-if="pedidosFiltrados.length === 0" class="empty-state q-pa-xl text-center">
      <q-icon name="search_off" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido encontrado</div>
      <div class="text-grey-6">Tente ajustar os filtros ou ampliar o raio de busca</div>
    </div>

    <div v-else class="pedidos-list q-px-md">
      <div
        v-for="pedido in pedidosFiltrados"
        :key="pedido.id"
        class="pedido-card q-mb-md"
        @click="abrirDetalhes(pedido)"
      >
        <!-- Cabeçalho do card -->
        <div class="pedido-header row items-center">
          <q-avatar size="45px" class="q-mr-sm">
            <img
              :src="
                pedido.cliente?.foto ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.cliente?.nome || 'Cliente')}&background=667eea&color=fff`
              "
            />
          </q-avatar>
          <div class="col">
            <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
            <div class="pedido-data">{{ formatarData(pedido.created_at) }}</div>
          </div>
          <div class="pedido-categoria">
            <q-chip :color="pedido.categoria?.cor || 'primary'" text-color="white" size="sm">
              {{ pedido.categoria?.nome || 'Serviço' }}
            </q-chip>
          </div>
        </div>

        <!-- Descrição -->
        <div class="pedido-descricao q-mt-sm">
          <div class="descricao-text">{{ pedido.descricao || 'Sem descrição' }}</div>
        </div>

        <!-- Localização -->
        <div class="pedido-localizacao row items-center q-mt-sm">
          <q-icon name="location_on" size="16px" color="grey-6" />
          <span class="text-caption text-grey-7">{{ pedido.endereco }}</span>
        </div>

        <!-- Footer do card -->
        <div class="pedido-footer row justify-between items-center q-mt-md">
          <div class="pedido-status">
            <q-badge color="positive" outline>Aberto</q-badge>
          </div>
          <q-btn
            color="primary"
            label="Fazer Proposta"
            size="sm"
            unelevated
            no-caps
            @click.stop="abrirModalProposta(pedido)"
          />
        </div>
      </div>
    </div>

    <!-- Modal para fazer proposta -->
    <q-dialog v-model="modalProposta.visivel" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 100%; border-radius: 20px">
        <q-card-section
          class="q-pa-md"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <div class="text-h6 text-white">Enviar Proposta</div>
          <div class="text-subtitle2 text-white" style="opacity: 0.9">
            Para: {{ modalProposta.pedido?.cliente?.nome }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="info-pedido q-mb-md">
            <div class="text-weight-bold">Serviço:</div>
            <div>{{ modalProposta.pedido?.categoria?.nome }}</div>
            <div class="text-weight-bold q-mt-sm">Descrição:</div>
            <div class="text-caption">{{ modalProposta.pedido?.descricao }}</div>
          </div>

          <q-input
            v-model="novaProposta.valor"
            type="number"
            outlined
            dense
            label="Valor (MZN) *"
            class="q-mb-md"
            :rules="[(val) => val > 0 || 'Valor obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="grey-6" />
            </template>
          </q-input>

          <q-input
            v-model="novaProposta.mensagem"
            type="textarea"
            outlined
            dense
            label="Mensagem (opcional)"
            placeholder="Descreva como pode ajudar..."
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup class="text-grey-7" />
          <q-btn
            unelevated
            label="Enviar Proposta"
            color="primary"
            :loading="carregandoEnvio"
            @click="enviarProposta"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorStore, type PedidoDisponivelData } from 'src/stores/prestador-store';
import { api } from 'src/boot/axios';

// Interface para categoria da API
interface CategoriaApiData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string | null;
  ativo: boolean;
  servicos_count: number;
}

defineOptions({
  name: 'PedidosDisponiveisPage',
});

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// Estados
const carregando = ref(true);
const carregandoEnvio = ref(false);
const pedidos = ref<PedidoDisponivelData[]>([]);

// Opções para selects
const categoriasOptions = ref<{ label: string; value: number }[]>([]);
const raioOptions = ref<{ label: string; value: number }[]>([
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
]);

const opcoesOrdenacao = [
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Mais antigos', value: 'antigos' },
  { label: 'Mais próximos', value: 'proximos' },
];

// Filtros
const filtros = reactive({
  busca: '',
  categoria_id: null as number | null,
  raio: 10,
  ordenacao: 'recentes',
});

// Modal de proposta
const modalProposta = reactive({
  visivel: false,
  pedido: null as PedidoDisponivelData | null,
});

const novaProposta = reactive({
  valor: 0,
  mensagem: '',
});

// Computed para pedidos filtrados
const pedidosFiltrados = computed(() => {
  let resultado = [...pedidos.value];

  if (filtros.busca) {
    const buscaLower = filtros.busca.toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.descricao?.toLowerCase().includes(buscaLower) ||
        p.endereco?.toLowerCase().includes(buscaLower) ||
        p.cliente?.nome?.toLowerCase().includes(buscaLower),
    );
  }

  if (filtros.categoria_id) {
    resultado = resultado.filter((p) => p.categoria?.id === filtros.categoria_id);
  }

  switch (filtros.ordenacao) {
    case 'recentes':
      resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'antigos':
      resultado.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case 'proximos':
      // TODO: Implementar ordenação por distância quando tiver geolocalização
      break;
  }

  return resultado;
});

// Funções auxiliares
const formatarData = (data: string) => {
  if (!data) return '';
  try {
    const date = new Date(data);
    const hoje = new Date();
    const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0)
      return `Hoje, ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  } catch {
    return data;
  }
};

const limparBusca = () => {
  filtros.busca = '';
  aplicarFiltros();
};

const aplicarFiltros = () => {
  // Os filtros são reativos, o computed já atualiza automaticamente
};

// Carregar categorias
const carregarCategorias = async () => {
  try {
    const response = await api.get('/public/categorias');
    if (response.data.success && Array.isArray(response.data.data)) {
      categoriasOptions.value = response.data.data.map((cat: CategoriaApiData) => ({
        label: cat.nome,
        value: cat.id,
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

// Carregar pedidos disponíveis
const carregarPedidosDisponiveis = async () => {
  carregando.value = true;
  try {
    await prestadorStore.fetchPedidosDisponiveis();
    pedidos.value = prestadorStore.pedidosDisponiveis;
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar pedidos disponíveis',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

// Abrir detalhes do pedido
const abrirDetalhes = (pedido: PedidoDisponivelData) => {
  console.log('Ver detalhes do pedido:', pedido.id);
};

// Abrir modal para fazer proposta
const abrirModalProposta = (pedido: PedidoDisponivelData) => {
  modalProposta.pedido = pedido;
  novaProposta.valor = 0;
  novaProposta.mensagem = '';
  modalProposta.visivel = true;
};

// Enviar proposta
const enviarProposta = async () => {
  if (!novaProposta.valor || novaProposta.valor <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Informe um valor válido',
      position: 'top',
    });
    return;
  }

  if (!modalProposta.pedido) return;

  carregandoEnvio.value = true;

  try {
    const propostaData: { pedido_id: number; valor: number; mensagem?: string } = {
      pedido_id: modalProposta.pedido.id,
      valor: novaProposta.valor,
    };

    if (novaProposta.mensagem && novaProposta.mensagem.trim()) {
      propostaData.mensagem = novaProposta.mensagem.trim();
    }

    const success = await prestadorStore.enviarProposta(propostaData);

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Proposta enviada com sucesso!',
        position: 'top',
      });
      modalProposta.visivel = false;
      pedidos.value = pedidos.value.filter((p) => p.id !== modalProposta.pedido?.id);
    }
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar proposta',
      position: 'top',
    });
  } finally {
    carregandoEnvio.value = false;
  }
};

// ✅ VERSÃO SIMPLIFICADA - SEM initialize()
onMounted(async () => {
  // Verifica se está autenticado
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, faça login para continuar',
      position: 'top',
    });
    await router.push('/auth/login');
    return;
  }

  // Verifica se é prestador
  if (!authStore.isPrestador) {
    $q.notify({
      type: 'warning',
      message: 'Apenas prestadores podem aceder a esta página',
      position: 'top',
    });
    await router.push('/mobile/prestador/dashboard');
    return;
  }

  // Carrega apenas os dados necessários para esta página
  await Promise.all([carregarCategorias(), carregarPedidosDisponiveis()]);
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.pedidos-disponiveis-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 30px;
  }
}

.filters-section {
  .sort-section {
    display: flex;
    flex-wrap: wrap;
  }
}

.pedido-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .pedido-cliente {
    font-weight: 600;
    color: $gray-800;
  }

  .pedido-data {
    font-size: 0.7rem;
    color: $gray-500;
  }

  .pedido-descricao {
    .descricao-text {
      font-size: 0.85rem;
      color: $gray-700;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .pedido-localizacao {
    gap: 4px;
  }

  .pedido-footer {
    border-top: 1px solid $gray-200;
    padding-top: 12px;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}

.info-pedido {
  background: $gray-50;
  padding: 12px;
  border-radius: 12px;
}
</style>
