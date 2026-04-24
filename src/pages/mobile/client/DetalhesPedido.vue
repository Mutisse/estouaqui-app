<template>
  <q-page class="bg-grey-1">
    <div v-if="carregando" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md">A carregar detalhes do pedido...</p>
    </div>

    <div v-else-if="pedido" class="pedido-detalhes">
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

      <!-- ✅ Prestador (se já tiver) com botão de chat -->
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

// Interfaces
interface ClienteData {
  id: number;
  nome: string;
  foto: string | null;
  telefone: string;
}

interface CategoriaData {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

interface PrestadorData {
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
  cliente?: ClienteData;
  categoria?: CategoriaData;
  prestador?: PrestadorData;
}

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const carregando = ref(true);
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

// ✅ Função para ir ao chat
const irParaChat = () => {
  if (pedido.value?.prestador?.id) {
    void router.push(`/mobile/chat/${pedido.value.prestador.id}`);
  }
};

const carregarPedido = async () => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    carregando.value = false;
    return;
  }

  carregando.value = true;
  try {
    // Usar o endpoint correto baseado no tipo de usuário
    const url = authStore.isPrestador
      ? `/prestador/solicitacoes/${id}`
      : `/cliente/pedidos/${id}`;

    const response = await api.get(url);
    if (response.data.success) {
      pedido.value = response.data.data;
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
    carregando.value = false;
  }
};

onMounted(() => {
  void carregarPedido();
});
</script>

<style scoped lang="scss">
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
