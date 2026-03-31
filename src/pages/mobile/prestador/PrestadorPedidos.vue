<template>
  <q-page class="prestador-pedidos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Pedidos Recebidos</div>
      <q-btn flat round icon="more_vert" @click="opcoes" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">Carregando pedidos...</div>
    </div>

    <template v-else>
      <!-- Tabs de filtro -->
      <q-tabs
        v-model="tab"
        class="filter-tabs"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="pendentes" label="Pendentes">
          <q-badge v-if="contadores.pendentes > 0" color="red" floating>{{
            contadores.pendentes
          }}</q-badge>
        </q-tab>
        <q-tab name="confirmados" label="Confirmados">
          <q-badge v-if="contadores.confirmados > 0" color="green" floating>{{
            contadores.confirmados
          }}</q-badge>
        </q-tab>
        <q-tab name="concluidos" label="Concluídos" />
        <q-tab name="cancelados" label="Cancelados" />
      </q-tabs>

      <!-- Lista de pedidos -->
      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <!-- Pendentes -->
        <q-tab-panel name="pendentes" class="q-pa-md">
          <div v-if="pedidosPendentes.length === 0" class="empty-state">
            <q-icon name="inbox" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido pendente</div>
            <div class="text-grey-6 q-mt-sm">Quando receber novos pedidos, aparecerão aqui</div>
          </div>

          <div v-else class="pedidos-list">
            <q-card
              v-for="pedido in pedidosPendentes"
              :key="pedido.id"
              class="pedido-card q-mb-md"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center">
                  <q-avatar size="50px" class="q-mr-md">
                    <img :src="pedido.cliente?.foto || 'https://cdn.quasar.dev/img/avatar.png'" alt="avatar" />
                  </q-avatar>
                  <div class="col">
                    <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                    <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                    <div class="pedido-info">
                      <q-icon name="schedule" size="14px" class="q-mr-xs" />
                      {{ formatarData(pedido.data) }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="pedido-detalhes">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="detalhe-label">Duração</div>
                      <div class="detalhe-valor">{{ obterDuracaoServico(pedido) }} min</div>
                    </div>
                    <div class="col-6">
                      <div class="detalhe-label">Valor</div>
                      <div class="detalhe-valor text-primary">{{ formatarValor(pedido.valor) }} MZN</div>
                    </div>
                  </div>
                  <div class="row q-mt-sm">
                    <div class="col-12">
                      <div class="detalhe-label">Localização</div>
                      <div class="detalhe-valor flex items-center">
                        <q-icon name="location_on" size="16px" class="q-mr-xs text-grey-6" />
                        {{ pedido.endereco || 'Endereço não informado' }}
                      </div>
                    </div>
                  </div>
                  <div v-if="pedido.observacoes" class="row q-mt-sm">
                    <div class="col-12">
                      <div class="detalhe-label">Observações</div>
                      <div class="detalhe-valor">{{ pedido.observacoes }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  flat
                  label="Recusar"
                  color="negative"
                  icon="close"
                  @click="recusarPedido(pedido)"
                  :loading="loadingAcao === pedido.id"
                />
                <q-btn
                  unelevated
                  label="Aceitar"
                  color="positive"
                  icon="check"
                  @click="aceitarPedido(pedido)"
                  :loading="loadingAcao === pedido.id"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Confirmados -->
        <q-tab-panel name="confirmados" class="q-pa-md">
          <div v-if="pedidosConfirmados.length === 0" class="empty-state">
            <q-icon name="check_circle" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido confirmado</div>
            <div class="text-grey-6 q-mt-sm">Os pedidos que aceitar aparecerão aqui</div>
          </div>

          <div v-else class="pedidos-list">
            <q-card
              v-for="pedido in pedidosConfirmados"
              :key="pedido.id"
              class="pedido-card q-mb-md"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center">
                  <q-avatar size="50px" class="q-mr-md">
                    <img :src="pedido.cliente?.foto || 'https://cdn.quasar.dev/img/avatar.png'" alt="avatar" />
                  </q-avatar>
                  <div class="col">
                    <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                    <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                    <div class="pedido-info">
                      <q-icon name="schedule" size="14px" class="q-mr-xs" />
                      {{ formatarData(pedido.data) }}
                    </div>
                  </div>
                  <div class="pedido-status confirmado">
                    <q-icon name="check_circle" size="16px" class="q-mr-xs" />
                    Confirmado
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="pedido-detalhes">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="detalhe-label">Duração</div>
                      <div class="detalhe-valor">{{ obterDuracaoServico(pedido) }} min</div>
                    </div>
                    <div class="col-6">
                      <div class="detalhe-label">Valor</div>
                      <div class="detalhe-valor text-primary">{{ formatarValor(pedido.valor) }} MZN</div>
                    </div>
                  </div>
                  <div class="row q-mt-sm">
                    <div class="col-12">
                      <div class="detalhe-label">Localização</div>
                      <div class="detalhe-valor flex items-center">
                        <q-icon name="location_on" size="16px" class="q-mr-xs text-grey-6" />
                        {{ pedido.endereco || 'Endereço não informado' }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md">
                <q-btn flat label="Chat" icon="chat" color="primary" @click="abrirChat(pedido)" />
                <q-btn
                  flat
                  label="Iniciar"
                  icon="play_arrow"
                  color="positive"
                  @click="iniciarServico(pedido)"
                  :loading="loadingAcao === pedido.id"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Concluídos -->
        <q-tab-panel name="concluidos" class="q-pa-md">
          <div v-if="pedidosConcluidos.length === 0" class="empty-state">
            <q-icon name="task_alt" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido concluído</div>
            <div class="text-grey-6 q-mt-sm">Histórico de serviços realizados</div>
          </div>

          <div v-else class="pedidos-list">
            <q-card
              v-for="pedido in pedidosConcluidos"
              :key="pedido.id"
              class="pedido-card q-mb-md"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center">
                  <q-avatar size="50px" class="q-mr-md">
                    <img :src="pedido.cliente?.foto || 'https://cdn.quasar.dev/img/avatar.png'" alt="avatar" />
                  </q-avatar>
                  <div class="col">
                    <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                    <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                    <div class="pedido-info">
                      <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
                      {{ formatarData(pedido.data) }}
                    </div>
                  </div>
                  <div class="pedido-status concluido">
                    <q-icon name="task_alt" size="16px" class="q-mr-xs" />
                    Concluído
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row items-center">
                  <q-icon name="star" color="yellow" size="16px" />
                  <span class="text-caption text-grey-6 q-ml-sm">Aguardando avaliação do cliente</span>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  flat
                  label="Ver detalhes"
                  icon="visibility"
                  color="primary"
                  @click="verDetalhes(pedido)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Cancelados -->
        <q-tab-panel name="cancelados" class="q-pa-md">
          <div v-if="pedidosCancelados.length === 0" class="empty-state">
            <q-icon name="cancel" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">Nenhum pedido cancelado</div>
          </div>

          <div v-else class="pedidos-list">
            <q-card
              v-for="pedido in pedidosCancelados"
              :key="pedido.id"
              class="pedido-card q-mb-md"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center">
                  <q-avatar size="50px" class="q-mr-md">
                    <img :src="pedido.cliente?.foto || 'https://cdn.quasar.dev/img/avatar.png'" alt="avatar" />
                  </q-avatar>
                  <div class="col">
                    <div class="pedido-cliente">{{ pedido.cliente?.nome || 'Cliente' }}</div>
                    <div class="pedido-servico">{{ pedido.servico?.nome || 'Serviço' }}</div>
                    <div class="pedido-info">
                      <q-icon name="schedule" size="14px" class="q-mr-xs" />
                      {{ formatarData(pedido.data) }}
                    </div>
                  </div>
                  <div class="pedido-status cancelado">
                    <q-icon name="cancel" size="16px" class="q-mr-xs" />
                    Cancelado
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- Botão flutuante para configurações -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="settings" color="primary" @click="configurarNotificacoes">
        <q-tooltip>Configurar notificações</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore } from 'src/stores/prestador-store';
import type { SolicitacaoData } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorPedidos',
});

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estado
const tab = ref('pendentes');
const loadingAcao = ref<number | null>(null);
const loading = ref(false);

// Função auxiliar para obter duração do serviço
const obterDuracaoServico = (pedido: SolicitacaoData): number => {
  // Se o serviço tem duração, usa ela
  if (pedido.servico && 'duracao' in pedido.servico && typeof pedido.servico.duracao === 'number') {
    return pedido.servico.duracao;
  }
  // Caso contrário, valor padrão
  return 60;
};

// Computed para pedidos filtrados por status
const pedidosPendentes = computed(() =>
  prestadorStore.solicitacoes.filter(p => p.status === 'pendente')
);

const pedidosConfirmados = computed(() =>
  prestadorStore.solicitacoes.filter(p => p.status === 'aceito' || p.status === 'confirmado')
);

const pedidosConcluidos = computed(() =>
  prestadorStore.solicitacoes.filter(p => p.status === 'concluido')
);

const pedidosCancelados = computed(() =>
  prestadorStore.solicitacoes.filter(p => p.status === 'cancelado')
);

// Contadores
const contadores = computed(() => ({
  pendentes: pedidosPendentes.value.length,
  confirmados: pedidosConfirmados.value.length,
  concluidos: pedidosConcluidos.value.length,
  cancelados: pedidosCancelados.value.length,
}));

// Formatação
const formatarData = (dataString: string) => {
  const date = new Date(dataString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffHours < 48) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Ações
const aceitarPedido = (pedido: SolicitacaoData) => {
  loadingAcao.value = pedido.id;

  $q.dialog({
    title: 'Confirmar aceitação',
    message: `Deseja aceitar o pedido de ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Aceitar',
      color: 'positive',
      unelevated: true,
    },
  }).onOk(() => {
    prestadorStore.aceitarSolicitacao(pedido.id)
      .then((success) => {
        if (success) {
          $q.notify({
            type: 'positive',
            message: 'Pedido aceito com sucesso!',
            position: 'top',
            icon: 'check_circle',
          });
        }
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao aceitar pedido',
          position: 'top',
        });
      })
      .finally(() => {
        loadingAcao.value = null;
      });
  }).onCancel(() => {
    loadingAcao.value = null;
  });
};

const recusarPedido = (pedido: SolicitacaoData) => {
  loadingAcao.value = pedido.id;

  $q.dialog({
    title: 'Confirmar recusa',
    message: `Deseja recusar o pedido de ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Recusar',
      color: 'negative',
      unelevated: true,
    },
  }).onOk(() => {
    prestadorStore.recusarSolicitacao(pedido.id)
      .then((success) => {
        if (success) {
          $q.notify({
            type: 'negative',
            message: 'Pedido recusado',
            position: 'top',
            icon: 'cancel',
          });
        }
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao recusar pedido',
          position: 'top',
        });
      })
      .finally(() => {
        loadingAcao.value = null;
      });
  }).onCancel(() => {
    loadingAcao.value = null;
  });
};

// ✅ CORREÇÃO: Função iniciarServico agora recebe o pedido como parâmetro
const iniciarServico = (pedido: SolicitacaoData) => {
  $q.dialog({
    title: 'Iniciar serviço',
    message: `Confirmar início do serviço para ${pedido.cliente?.nome || 'cliente'}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // TODO: Implementar chamada para iniciar serviço
    // await prestadorStore.iniciarServico(pedido.id);
    $q.notify({
      type: 'positive',
      message: 'Serviço iniciado!',
      position: 'top',
      icon: 'play_circle',
    });
  });
};

const abrirChat = (pedido: SolicitacaoData) => {
  void router.push(`/mobile/chat/${pedido.cliente_id}`);
};

const verDetalhes = (pedido: SolicitacaoData) => {
  // TODO: Abrir modal com detalhes do pedido
  $q.notify({
    type: 'info',
    message: `Pedido #${pedido.numero || pedido.id}`,
    position: 'top',
  });
};

const opcoes = (): void => {
  $q.dialog({
    title: 'Opções',
    message: 'Configurações de pedidos',
    options: {
      type: 'radio',
      model: 'notificacoes',
      items: [
        { label: 'Notificações em tempo real', value: 'notificacoes' },
        { label: 'Modo não perturbe', value: 'dnd' },
        { label: 'Aceitar automaticamente', value: 'auto' },
      ],
    },
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Configuração salva',
      position: 'top',
    });
  });
};

const configurarNotificacoes = (): void => {
  $q.notify({
    type: 'info',
    message: 'Configurações de notificação em breve',
    position: 'top',
  });
};

// Carregar dados
const carregarPedidos = async () => {
  loading.value = true;
  try {
    await prestadorStore.fetchSolicitacoes();
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar pedidos',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

// Inicialização
onMounted(() => {
  void carregarPedidos();
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

.prestador-pedidos {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.filter-tabs {
  background: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.pedido-card {
  border-radius: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
  }

  .pedido-cliente {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .pedido-servico {
    font-size: 0.9rem;
    color: $purple-primary;
    margin: 2px 0;
  }

  .pedido-info {
    font-size: 0.8rem;
    color: $gray-600;
    display: flex;
    align-items: center;
  }
}

.pedido-detalhes {
  background: $gray-50;
  border-radius: 12px;
  padding: 12px;

  .detalhe-label {
    font-size: 0.7rem;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detalhe-valor {
    font-size: 0.9rem;
    font-weight: 500;
    color: $gray-800;
  }
}

.pedido-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;

  &.confirmado {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.concluido {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.cancelado {
    background: #ffebee;
    color: #c62828;
  }
}

// Animações
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pedido-card {
  animation: slideIn 0.3s ease;
}

// Responsividade
@media (max-width: 599px) {
  .pedido-card {
    .row.q-col-gutter-sm > .col-6 {
      width: 100%;
    }
  }
}
</style>
