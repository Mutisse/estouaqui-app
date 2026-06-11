<template>
  <div class="bg-grey-1">
    <!-- Skeleton Loading -->
    <div v-if="store.carregamentoInicial" class="skeleton-loading">
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

    <!-- Conteúdo principal -->
    <template v-else>
      <div v-if="store.pedido" class="pedido-detalhes">
        <!-- Header -->
        <div class="header-gradient q-pa-md">
          <q-btn flat round dense icon="arrow_back" color="white" @click="$router.back()" />
          <div class="text-h6 text-white q-mt-sm">Detalhes do Pedido</div>
          <div class="text-subtitle2 text-white" style="opacity: 0.9">#{{ store.pedido.numero }}</div>
        </div>

        <!-- Status -->
        <div class="status-card q-ma-md">
          <div class="row items-center justify-between">
            <div class="text-weight-bold">Status:</div>
            <q-badge :color="store.statusColor" class="q-px-md q-py-sm">
              {{ store.statusLabel }}
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
                <img :src="store.getAvatarUrl(store.pedido.cliente?.nome || 'Cliente', store.pedido.cliente?.foto)" />
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ store.pedido.cliente?.nome || 'Cliente' }}</div>
                <div class="text-caption text-grey-6">{{ store.pedido.cliente?.telefone || 'Sem telefone' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Prestador (se já tiver) com botão de chat -->
        <q-card v-if="store.hasPrestador" class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="handyman" size="20px" class="q-mr-sm" />
              Prestador
            </div>
            <div class="row items-center justify-between q-mt-md">
              <div class="row items-center">
                <q-avatar size="50px" class="q-mr-md">
                  <img :src="store.getAvatarUrl(store.pedido.prestador?.nome || 'Prestador', store.pedido.prestador?.foto)" />
                </q-avatar>
                <div>
                  <div class="text-weight-bold">{{ store.pedido.prestador?.nome || 'Prestador' }}</div>
                  <div class="text-caption text-grey-6">{{ store.pedido.prestador?.telefone || 'Sem telefone' }}</div>
                  <div class="row items-center q-mt-xs" v-if="store.pedido.prestador?.media_avaliacao">
                    <q-rating v-model="store.pedido.prestador.media_avaliacao" size="14px" :max="5" color="yellow" readonly />
                    <span class="text-caption text-grey-6 q-ml-xs">({{ store.pedido.prestador.media_avaliacao }})</span>
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
              <div class="text-weight-bold">{{ store.pedido.categoria?.nome || 'Categoria não definida' }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">{{ store.pedido.descricao || 'Sem descrição' }}</div>
              <div v-if="store.pedido.valor" class="text-caption text-primary q-mt-sm">
                Valor: {{ store.valorFormatado }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Data do Serviço -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="event" size="20px" class="q-mr-sm" />
              Data do Serviço
            </div>
            <div class="q-mt-md">
              <div class="text-caption">{{ store.dataServicoFormatada }}</div>
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
              <div class="text-caption">{{ store.pedido.endereco }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Observações -->
        <q-card v-if="store.pedido.observacoes" class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="notes" size="20px" class="q-mr-sm" />
              Observações
            </div>
            <div class="q-mt-md">
              <div class="text-caption">{{ store.pedido.observacoes }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Data do Pedido -->
        <q-card class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="calendar_today" size="20px" class="q-mr-sm" />
              Data do Pedido
            </div>
            <div class="q-mt-md">
              <div class="text-caption">{{ store.dataFormatada }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Foto do Pedido -->
        <q-card v-if="store.hasFoto" class="info-card q-mb-md q-mx-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary">
              <q-icon name="photo" size="20px" class="q-mr-sm" />
              Foto do Serviço
            </div>
            <div class="q-mt-md text-center">
              <img :src="store.pedido.foto!" class="foto-pedido" />
            </div>
          </q-card-section>
        </q-card>

        <!-- Botões de Ação -->
        <div class="action-buttons q-pa-md q-gutter-md">
          <q-btn
            v-if="store.podeCancelar"
            label="Cancelar Pedido"
            color="negative"
            outline
            icon="cancel"
            class="full-width"
            @click="confirmarCancelamento"
          />
          <q-btn
            v-if="store.podeAvaliar"
            label="Avaliar Serviço"
            color="positive"
            icon="star"
            class="full-width"
            @click="irParaAvaliacao"
          />
        </div>
      </div>

      <div v-else class="empty-state text-center q-pa-xl">
        <q-icon name="error" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Pedido não encontrado</div>
        <q-btn
          label="Voltar"
          color="primary"
          flat
          class="q-mt-md"
          @click="$router.back()"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { useDetalhesPedidoStore } from 'src/stores/client/cliente-detalhes-pedido-store';

defineOptions({ name: 'DetalhesPedidoPage' });

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const store = useDetalhesPedidoStore();

const irParaChat = () => {
  if (store.pedido?.prestador?.id) {
    void router.push(`/mobile/chat/${store.pedido.prestador.id}`);
  } else {
    $q.notify({
      type: 'warning',
      message: 'Prestador não disponível para chat',
      position: 'top'
    });
  }
};

const irParaAvaliacao = () => {
  if (store.pedido?.id) {
    void router.push(`/mobile/avaliacao/${store.pedido.id}`);
  }
};

const confirmarCancelamento = () => {
  $q.dialog({
    title: 'Cancelar Pedido',
    message: 'Tem certeza que deseja cancelar este pedido?',
    cancel: { label: 'Não', flat: true },
    ok: { label: 'Sim, cancelar', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void executarCancelamento();
  });
};

const executarCancelamento = async () => {
  try {
    const success = await store.cancelarPedido();
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Pedido cancelado com sucesso!',
        position: 'top',
        timeout: 2000
      });
    } else {
      $q.notify({
        type: 'negative',
        message: store.erro || 'Erro ao cancelar pedido',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao cancelar pedido',
      position: 'top'
    });
  }
};

const carregarDados = async () => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    return;
  }

  const pedidoId = Number(id);
  const tipoUsuario = authStore.isPrestador ? 'prestador' : 'cliente';

  await store.carregarPedido(pedidoId, tipoUsuario);
};

onMounted(() => {
  void carregarDados();
});

onUnmounted(() => {
  store.limparStore();
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

.action-buttons {
  margin-bottom: 20px;
}
</style>
