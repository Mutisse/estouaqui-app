<template>
  <q-page class="prestador-pedidos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Pedidos Recebidos</div>
      <q-btn flat round icon="more_vert" @click="opcoes" />
    </div>

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
                  <img :src="pedido.clienteAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-cliente">{{ pedido.cliente }}</div>
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-info">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    {{ pedido.data }} às {{ pedido.hora }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="pedido-detalhes">
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="detalhe-label">Duração</div>
                    <div class="detalhe-valor">{{ pedido.duracao }} min</div>
                  </div>
                  <div class="col-6">
                    <div class="detalhe-label">Valor</div>
                    <div class="detalhe-valor text-primary">{{ pedido.valor }} MZN</div>
                  </div>
                </div>
                <div class="row q-mt-sm">
                  <div class="col-12">
                    <div class="detalhe-label">Localização</div>
                    <div class="detalhe-valor flex items-center">
                      <q-icon name="location_on" size="16px" class="q-mr-xs text-grey-6" />
                      {{ pedido.localizacao }}
                    </div>
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
              />
              <q-btn
                unelevated
                label="Aceitar"
                color="positive"
                icon="check"
                @click="aceitarPedido(pedido)"
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
                  <img :src="pedido.clienteAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-cliente">{{ pedido.cliente }}</div>
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-info">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    {{ pedido.data }} às {{ pedido.hora }}
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
                    <div class="detalhe-valor">{{ pedido.duracao }} min</div>
                  </div>
                  <div class="col-6">
                    <div class="detalhe-label">Valor</div>
                    <div class="detalhe-valor text-primary">{{ pedido.valor }} MZN</div>
                  </div>
                </div>
                <div class="row q-mt-sm">
                  <div class="col-12">
                    <div class="detalhe-label">Localização</div>
                    <div class="detalhe-valor flex items-center">
                      <q-icon name="location_on" size="16px" class="q-mr-xs text-grey-6" />
                      {{ pedido.localizacao }}
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
                  <img :src="pedido.clienteAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-cliente">{{ pedido.cliente }}</div>
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-info">
                    <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
                    {{ pedido.data }}
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
                <q-rating v-model="pedido.avaliacao" size="16px" :max="5" color="yellow" readonly />
                <span class="text-caption text-grey-6 q-ml-sm"
                  >{{ pedido.avaliacao }} ({{ pedido.totalAvaliacoes }})</span
                >
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
                  <img :src="pedido.clienteAvatar" />
                </q-avatar>
                <div class="col">
                  <div class="pedido-cliente">{{ pedido.cliente }}</div>
                  <div class="pedido-servico">{{ pedido.servico }}</div>
                  <div class="pedido-info">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    {{ pedido.data }} às {{ pedido.hora }}
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

    <!-- Botão flutuante para configurações -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="settings" color="primary" @click="configurarNotificacoes">
        <q-tooltip>Configurar notificações</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'PrestadorPedidos',
});

// Tipos
interface PedidoBase {
  id: number;
  cliente: string;
  clienteAvatar: string;
  servico: string;
  data: string;
  hora: string;
  duracao: number;
  valor: number;
  localizacao: string;
}

interface PedidoPendente extends PedidoBase {
  // Sem campos extras
}

interface PedidoConfirmado extends PedidoBase {
  // Sem campos extras
}

interface PedidoConcluido extends PedidoBase {
  avaliacao: number;
  totalAvaliacoes: number;
}

interface PedidoCancelado extends PedidoBase {
  motivo?: string;
}

interface Contadores {
  pendentes: number;
  confirmados: number;
  concluidos: number;
  cancelados: number;
}

const router = useRouter();
const $q = useQuasar();

// Estado
const tab = ref('pendentes');

// Dados mockados
const pedidosPendentes = ref<PedidoPendente[]>([
  {
    id: 1,
    cliente: 'Maria Santos',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    servico: 'Reparação elétrica',
    data: 'Hoje',
    hora: '14:30',
    duracao: 60,
    valor: 1500,
    localizacao: 'Av. 24 de Julho, Maputo',
  },
  {
    id: 2,
    cliente: 'Pedro Oliveira',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    servico: 'Instalação de tomada',
    data: 'Amanhã',
    hora: '09:00',
    duracao: 30,
    valor: 800,
    localizacao: 'Bairro Central, Matola',
  },
  {
    id: 3,
    cliente: 'Ana Costa',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    servico: 'Troca de disjuntor',
    data: '12 Mar',
    hora: '15:30',
    duracao: 45,
    valor: 1200,
    localizacao: 'Bairro da Coop, Maputo',
  },
]);

const pedidosConfirmados = ref<PedidoConfirmado[]>([
  {
    id: 4,
    cliente: 'Carlos Mendes',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    servico: 'Reparação geral',
    data: 'Hoje',
    hora: '16:00',
    duracao: 90,
    valor: 2000,
    localizacao: 'Bairro dos Pescadores, Maputo',
  },
]);

const pedidosConcluidos = ref<PedidoConcluido[]>([
  {
    id: 5,
    cliente: 'Sofia Rodrigues',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar6.jpg',
    servico: 'Instalação elétrica',
    data: '10 Mar 2026',
    hora: '10:00',
    duracao: 120,
    valor: 2500,
    localizacao: 'Bairro Triunfo, Matola',
    avaliacao: 5,
    totalAvaliacoes: 12,
  },
  {
    id: 6,
    cliente: 'Ricardo Sousa',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar.png',
    servico: 'Troca de fiação',
    data: '8 Mar 2026',
    hora: '14:00',
    duracao: 180,
    valor: 3500,
    localizacao: 'Bairro Central, Maputo',
    avaliacao: 4,
    totalAvaliacoes: 8,
  },
]);

const pedidosCancelados = ref<PedidoCancelado[]>([
  {
    id: 7,
    cliente: 'Fernando Lima',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    servico: 'Reparação emergencial',
    data: '5 Mar 2026',
    hora: '19:00',
    duracao: 60,
    valor: 1800,
    localizacao: 'Bairro da Machava, Maputo',
    motivo: 'Cliente desistiu',
  },
]);

// Contadores
const contadores = computed<Contadores>(() => ({
  pendentes: pedidosPendentes.value.length,
  confirmados: pedidosConfirmados.value.length,
  concluidos: pedidosConcluidos.value.length,
  cancelados: pedidosCancelados.value.length,
}));

// Ações
const aceitarPedido = (pedido: PedidoPendente) => {
  $q.dialog({
    title: 'Confirmar aceitação',
    message: `Deseja aceitar o pedido de ${pedido.cliente}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Aceitar',
      color: 'positive',
      unelevated: true,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
  }).onOk(() => {
    // Remover dos pendentes e adicionar aos confirmados
    const index = pedidosPendentes.value.findIndex((p) => p.id === pedido.id);
    if (index !== -1) {
      const [pedidoAceito] = pedidosPendentes.value.splice(index, 1);
      pedidosConfirmados.value.push(pedidoAceito);

      $q.notify({
        type: 'positive',
        message: 'Pedido aceito com sucesso!',
        position: 'top',
        icon: 'check_circle',
      });
    }
  });
};

const recusarPedido = (pedido: PedidoPendente) => {
  $q.dialog({
    title: 'Confirmar recusa',
    message: `Deseja recusar o pedido de ${pedido.cliente}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Recusar',
      color: 'negative',
      unelevated: true,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
  }).onOk(() => {
    // Remover dos pendentes e adicionar aos cancelados
    const index = pedidosPendentes.value.findIndex((p) => p.id === pedido.id);
    if (index !== -1) {
      const [pedidoRecusado] = pedidosPendentes.value.splice(index, 1);
      pedidosCancelados.value.push({
        ...pedidoRecusado,
        motivo: 'Recusado pelo prestador',
      });

      $q.notify({
        type: 'negative',
        message: 'Pedido recusado',
        position: 'top',
        icon: 'cancel',
      });
    }
  });
};

const abrirChat = (pedido: PedidoConfirmado) => {
  void router.push(`/mobile/chat/${pedido.id}`);
};

const iniciarServico = (pedido: PedidoConfirmado) => {
  $q.dialog({
    title: 'Iniciar serviço',
    message: 'Confirmar início do serviço?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Remover dos confirmados e adicionar aos concluídos (simulado)
    const index = pedidosConfirmados.value.findIndex((p) => p.id === pedido.id);
    if (index !== -1) {
      const [pedidoIniciado] = pedidosConfirmados.value.splice(index, 1);

      $q.notify({
        type: 'positive',
        message: 'Serviço iniciado! Boa trabalho!',
        position: 'top',
        icon: 'play_circle',
        timeout: 3000,
      });

      // Simular conclusão após 3 segundos (apenas para demonstração)
      setTimeout(() => {
        pedidosConcluidos.value.push({
          ...pedidoIniciado,
          avaliacao: 5,
          totalAvaliacoes: 1,
        });

        $q.notify({
          type: 'positive',
          message: 'Serviço concluído!',
          position: 'top',
          icon: 'task_alt',
        });
      }, 3000);
    }
  });
};

const verDetalhes = (pedido: PedidoConcluido) => {
  $q.notify({
    type: 'info',
    message: `Detalhes do serviço #${pedido.id}`,
    position: 'top',
  });
};

const opcoes = () => {
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

const configurarNotificacoes = () => {
  $q.notify({
    type: 'info',
    message: 'Configurações de notificação em breve',
    position: 'top',
  });
};
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
