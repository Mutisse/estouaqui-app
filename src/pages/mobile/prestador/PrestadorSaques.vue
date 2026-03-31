<template>
  <q-page class="prestador-saques bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Realizar Saque</div>
      <q-btn flat round icon="help" @click="ajuda" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">Carregando dados...</div>
    </div>

    <template v-else>
      <!-- Saldo disponível -->
      <div class="saldo-info q-pa-md text-center">
        <div class="saldo-label">Saldo disponível para saque</div>
        <div class="saldo-valor">{{ formatarValor(saldoDisponivel) }} MZN</div>
      </div>

      <!-- Formulário de saque -->
      <q-card flat bordered class="saque-form q-ma-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Dados do saque</div>

          <q-select
            v-model="formaPagamento"
            :options="formasPagamentoOptions"
            label="Forma de pagamento"
            outlined
            dense
            class="q-mb-md"
            emit-value
            map-options
            option-label="label"
            option-value="value"
          >
            <template v-slot:option="{ opt }">
              <q-item>
                <q-item-section avatar>
                  <q-icon :name="opt.icone" :color="opt.cor" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              <div v-if="formaPagamento" class="row items-center">
                <q-icon
                  :name="getFormaPagamentoIcone(formaPagamento)"
                  :color="getFormaPagamentoCor(formaPagamento)"
                  class="q-mr-sm"
                />
                {{ getFormaPagamentoLabel(formaPagamento) }}
              </div>
            </template>
          </q-select>

          <q-input
            v-model="valorSaque"
            label="Valor do saque (MZN)"
            type="number"
            outlined
            dense
            :rules="[
              (val) => val > 0 || 'Valor inválido',
              (val) => val <= saldoDisponivel || 'Saldo insuficiente',
            ]"
          >
            <template v-slot:append>
              <q-btn flat dense label="Máx" @click="valorSaque = saldoDisponivel" />
            </template>
          </q-input>

          <!-- Campos específicos para cada forma de pagamento -->
          <template v-if="formaPagamento === 'mpesa'">
            <q-input
              v-model="mpesaNumero"
              label="Número do M-Pesa"
              prefix="+258"
              mask="## ### ####"
              unmasked-value
              outlined
              dense
              class="q-mt-md"
              :rules="[(val) => !!val || 'Número é obrigatório']"
            />
            <q-input v-model="mpesaNome" label="Nome do titular" outlined dense class="q-mt-md" />
          </template>

          <template v-else-if="formaPagamento === 'bancario'">
            <q-input v-model="contaBanco" label="Banco" outlined dense class="q-mt-md" />
            <q-input v-model="contaNumero" label="Número da conta" outlined dense class="q-mt-md" />
            <q-input v-model="contaTitular" label="Nome do titular" outlined dense class="q-mt-md" />
          </template>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" @click="router.back()" />
          <q-btn
            unelevated
            label="Solicitar saque"
            color="primary"
            @click="solicitarSaque"
            :loading="salvando"
            :disable="!podeSolicitar"
          />
        </q-card-actions>
      </q-card>

      <!-- Histórico de saques -->
      <div class="historico-saques q-pa-md">
        <div class="section-header">
          <div class="section-title">Últimos saques</div>
          <q-btn flat dense label="Ver todos" icon="chevron_right" @click="verTodos" />
        </div>

        <div v-if="carregandoHistorico" class="text-center q-py-md">
          <q-spinner size="32px" />
        </div>

        <div v-else-if="historicoSaques.length === 0" class="empty-state q-pa-md text-center">
          <q-icon name="payments" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhum saque realizado</div>
        </div>

        <q-list v-else bordered separator class="historico-list">
          <q-item v-for="saque in historicoSaques" :key="saque.id">
            <q-item-section avatar>
              <q-icon :name="getIconePorMetodo(saque.metodo)" :color="getCorPorStatus(saque.status)" size="24px" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ getLabelPorMetodo(saque.metodo) }}</q-item-label>
              <q-item-label caption>{{ formatarData(saque.created_at) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="saque-valor">{{ formatarValor(saque.valor) }} MZN</div>
              <q-badge :color="getCorPorStatus(saque.status)">{{ getLabelPorStatus(saque.status) }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorSaques',
});

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const loading = ref(true);
const salvando = ref(false);
const carregandoHistorico = ref(false);
const formaPagamento = ref('mpesa');
const valorSaque = ref<number | null>(null);

// Campos M-Pesa
const mpesaNumero = ref('');
const mpesaNome = ref('');

// Campos conta bancária
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');

// Dados do store
const ganhos = computed(() => prestadorStore.ganhos);
const historicoSaquesStore = computed(() => prestadorStore.historicoSaques);

// Opções de formas de pagamento (hardcoded mas pode vir da API)
const formasPagamentoOptions = [
  { label: 'M-Pesa', value: 'mpesa', icone: 'phone_android', cor: 'positive' },
  { label: 'Conta bancária', value: 'bancario', icone: 'account_balance', cor: 'primary' },
];

// Computed
const saldoDisponivel = computed(() => {
  return ganhos.value.total - ganhos.value.pendente;
});

const historicoSaques = computed(() => {
  return historicoSaquesStore.value.slice(0, 5);
});

const podeSolicitar = computed(() => {
  if (!valorSaque.value || valorSaque.value <= 0 || valorSaque.value > saldoDisponivel.value) {
    return false;
  }

  if (formaPagamento.value === 'mpesa') {
    return !!mpesaNumero.value;
  }

  if (formaPagamento.value === 'bancario') {
    return !!contaBanco.value && !!contaNumero.value && !!contaTitular.value;
  }

  return true;
});

// Funções auxiliares
const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const formatarData = (dataString: string) => {
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getIconePorMetodo = (metodo: string): string => {
  if (metodo === 'mpesa') return 'phone_android';
  if (metodo === 'bancario') return 'account_balance';
  return 'payments';
};

const getLabelPorMetodo = (metodo: string): string => {
  if (metodo === 'mpesa') return 'M-Pesa';
  if (metodo === 'bancario') return 'Conta bancária';
  return 'Outro';
};

const getCorPorStatus = (status: string): string => {
  switch (status) {
    case 'pendente': return 'warning';
    case 'processando': return 'info';
    case 'concluido': return 'positive';
    case 'cancelado': return 'negative';
    default: return 'grey';
  }
};

const getLabelPorStatus = (status: string): string => {
  switch (status) {
    case 'pendente': return 'Pendente';
    case 'processando': return 'Processando';
    case 'concluido': return 'Concluído';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

const getFormaPagamentoLabel = (value: string): string => {
  const opt = formasPagamentoOptions.find(f => f.value === value);
  return opt?.label || value;
};

const getFormaPagamentoIcone = (value: string): string => {
  const opt = formasPagamentoOptions.find(f => f.value === value);
  return opt?.icone || 'payments';
};

const getFormaPagamentoCor = (value: string): string => {
  const opt = formasPagamentoOptions.find(f => f.value === value);
  return opt?.cor || 'grey';
};

// Ações
const carregarDados = async () => {
  loading.value = true;
  try {
    await Promise.all([
      prestadorStore.fetchGanhos(),
      prestadorStore.fetchHistoricoSaques(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// ✅ CORREÇÃO: Função separada para processar o saque
const processarSaque = () => {
  if (!valorSaque.value) return;

  let conta = '';
  if (formaPagamento.value === 'mpesa') {
    conta = mpesaNumero.value;
  } else if (formaPagamento.value === 'bancario') {
    conta = `${contaBanco.value} - ${contaNumero.value} - ${contaTitular.value}`;
  }

  salvando.value = true;

  prestadorStore.solicitarSaque({
    valor: valorSaque.value,
    metodo: formaPagamento.value as 'mpesa' | 'bancario',
    conta: conta,
  })
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Saque solicitado com sucesso!',
        position: 'top',
      });

      // Reset form
      valorSaque.value = null;
      mpesaNumero.value = '';
      mpesaNome.value = '';
      contaBanco.value = '';
      contaNumero.value = '';
      contaTitular.value = '';

      // Recarregar dados
      return carregarDados();
    })
    .catch((error) => {
      console.error('Erro ao solicitar saque:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao solicitar saque',
        position: 'top',
      });
    })
    .finally(() => {
      salvando.value = false;
    });
};

const solicitarSaque = () => {
  if (!valorSaque.value) return;

  $q.dialog({
    title: 'Confirmar saque',
    message: `Solicitar saque de ${formatarValor(valorSaque.value)} MZN via ${getFormaPagamentoLabel(formaPagamento.value)}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Confirmar',
      color: 'positive',
      unelevated: true,
    },
  }).onOk(() => {
    processarSaque();
  });
};

const ajuda = () => {
  $q.dialog({
    title: 'Ajuda - Saques',
    message: 'Os saques podem levar até 2 dias úteis para processamento. O valor mínimo para saque é de 500 MZN.',
    cancel: true,
    ok: {
      label: 'Entendi',
      flat: true,
    },
  });
};

const verTodos = () => {
  $q.notify({
    type: 'info',
    message: 'Histórico completo em breve',
    position: 'top',
  });
};

// Inicialização
onMounted(async () => {
  await carregarDados();
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

.prestador-saques {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

.saldo-info {
  .saldo-label {
    font-size: 0.9rem;
    color: $gray-600;
  }

  .saldo-valor {
    font-size: 2.5rem;
    font-weight: 700;
    color: $purple-primary;
  }
}

.saque-form {
  border-radius: 16px;
}

.historico-list {
  border-radius: 12px;
  overflow: hidden;
}

.saque-valor {
  font-weight: 600;
  color: $gray-800;
  margin-bottom: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }
}
</style>
