<template>
  <q-page class="prestador-saques bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Realizar Saque</div>
      <q-btn flat round icon="help" @click="ajuda" />
    </div>

    <!-- Saldo disponível -->
    <div class="saldo-info q-pa-md text-center">
      <div class="saldo-label">Saldo disponível para saque</div>
      <div class="saldo-valor">{{ saldoDisponivel }} MZN</div>
    </div>

    <!-- Formulário de saque -->
    <q-card flat bordered class="saque-form q-ma-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Dados do saque</div>

        <q-select
          v-model="formaPagamento"
          :options="formasPagamento"
          label="Forma de pagamento"
          outlined
          dense
          class="q-mb-md"
          emit-value
          map-options
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
                :name="formasPagamento.find((f) => f.value === formaPagamento)?.icone"
                :color="formasPagamento.find((f) => f.value === formaPagamento)?.cor"
                class="q-mr-sm"
              />
              {{ formasPagamento.find((f) => f.value === formaPagamento)?.label }}
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

        <template v-else-if="formaPagamento === 'conta'">
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

      <q-list bordered separator class="historico-list">
        <q-item v-for="saque in historicoSaques" :key="saque.id">
          <q-item-section avatar>
            <q-icon :name="saque.icone" :color="saque.cor" size="24px" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ saque.forma }}</q-item-label>
            <q-item-label caption>{{ saque.data }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="saque-valor">{{ saque.valor }} MZN</div>
            <q-badge :color="saque.statusCor">{{ saque.status }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'PrestadorSaques',
});

const router = useRouter();
const $q = useQuasar();

const saldoDisponivel = ref(12580);
const formaPagamento = ref('mpesa');
const valorSaque = ref<number | null>(null);

// Campos M-Pesa
const mpesaNumero = ref('');
const mpesaNome = ref('');

// Campos conta bancária
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');

const formasPagamento = [
  { label: 'M-Pesa', value: 'mpesa', icone: 'phone_android', cor: 'positive' },
  { label: 'Conta bancária', value: 'conta', icone: 'account_balance', cor: 'primary' },
  { label: 'Dinheiro', value: 'dinheiro', icone: 'payments', cor: 'warning' },
];

const historicoSaques = ref([
  {
    id: 1,
    forma: 'M-Pesa',
    icone: 'phone_android',
    cor: 'positive',
    data: '10 Mar 2026',
    valor: 2500,
    status: 'Concluído',
    statusCor: 'positive',
  },
  {
    id: 2,
    forma: 'Conta bancária',
    icone: 'account_balance',
    cor: 'primary',
    data: '5 Mar 2026',
    valor: 5000,
    status: 'Processando',
    statusCor: 'warning',
  },
]);

const podeSolicitar = computed(() => {
  if (!valorSaque.value || valorSaque.value <= 0 || valorSaque.value > saldoDisponivel.value) {
    return false;
  }

  if (formaPagamento.value === 'mpesa') {
    return !!mpesaNumero.value;
  }

  if (formaPagamento.value === 'conta') {
    return !!contaBanco.value && !!contaNumero.value && !!contaTitular.value;
  }

  return true;
});

const solicitarSaque = () => {
  $q.dialog({
    title: 'Confirmar saque',
    message: `Solicitar saque de ${valorSaque.value} MZN?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
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
  });
};

const ajuda = () => {
  $q.dialog({
    title: 'Ajuda - Saques',
    message:
      'Os saques podem levar até 2 dias úteis para processamento. O valor mínimo para saque é de 500 MZN.',
    cancel: true,
  });
};

const verTodos = () => {
  $q.notify({
    type: 'info',
    message: 'Histórico completo em breve',
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
