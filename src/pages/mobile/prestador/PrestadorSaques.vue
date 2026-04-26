<template>
  <q-page class="prestador-saques bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Realizar Saque</div>
      <q-btn flat round icon="help" @click="ajuda" />
    </div>

    <!-- Skeleton Loading (igual Facebook/Instagram) -->
    <div v-if="loading" class="skeleton-container">
      <!-- Saldo skeleton -->
      <div class="skeleton-saldo q-pa-md text-center">
        <div class="skeleton-label"></div>
        <div class="skeleton-value"></div>
      </div>

      <!-- Form skeleton -->
      <div class="skeleton-card q-ma-md">
        <div class="skeleton-title"></div>
        <div class="skeleton-input"></div>
        <div class="skeleton-input"></div>
        <div class="skeleton-input"></div>
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col">
            <div class="skeleton-button"></div>
          </div>
          <div class="col">
            <div class="skeleton-button primary"></div>
          </div>
        </div>
        <div class="skeleton-shimmer"></div>
      </div>

      <!-- Histórico skeleton -->
      <div class="skeleton-historico q-pa-md">
        <div class="row justify-between items-center q-mb-md">
          <div class="skeleton-title small"></div>
          <div class="skeleton-link"></div>
        </div>
        <div v-for="i in 3" :key="i" class="skeleton-history-item">
          <div class="skeleton-avatar"></div>
          <div class="col">
            <div class="skeleton-text"></div>
            <div class="skeleton-text-short"></div>
          </div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Saldo disponível -->
      <div class="saldo-info q-pa-md text-center">
        <div class="saldo-label">Saldo disponível para saque</div>
        <div class="saldo-valor">{{ formatarValor(saldoDisponivel) }} MZN</div>
        <div class="saldo-detalhe" v-if="ganhos.pendente > 0">
          <q-icon name="schedule" size="14px" class="q-mr-xs" />
          {{ formatarValor(ganhos.pendente) }} MZN pendentes
        </div>
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
              (val) => val >= VALOR_MINIMO_SAQUE || `Valor mínimo de ${formatarValor(VALOR_MINIMO_SAQUE)} MZN`,
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
            >
              <template v-slot:prepend>
                <q-icon name="phone_android" color="positive" />
              </template>
            </q-input>
            <q-input
              v-model="mpesaNome"
              label="Nome do titular"
              outlined
              dense
              class="q-mt-md"
              placeholder="Como aparece no documento"
            />
          </template>

          <template v-else-if="formaPagamento === 'bancario'">
            <q-select
              v-model="contaBanco"
              :options="bancosOptions"
              label="Banco"
              outlined
              dense
              class="q-mt-md"
              emit-value
              map-options
              option-label="label"
              option-value="value"
            />
            <q-input
              v-model="contaNumero"
              label="Número da conta"
              outlined
              dense
              class="q-mt-md"
              mask="#### #### #### ####"
              unmasked-value
            />
            <q-input
              v-model="contaTitular"
              label="Nome do titular"
              outlined
              dense
              class="q-mt-md"
              placeholder="Como aparece no documento"
            />
            <q-input
              v-model="contaIban"
              label="IBAN (opcional)"
              outlined
              dense
              class="q-mt-md"
            />
          </template>
        </q-card-section>

        <q-separator />

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
          <div class="text-h6 text-grey-7 q-mt-sm">Nenhum saque realizado</div>
          <div class="text-grey-6 q-mt-xs">Seus saques aparecerão aqui</div>
        </div>

        <q-list v-else bordered separator class="historico-list">
          <q-item v-for="saque in historicoSaques" :key="saque.id" clickable @click="verDetalhesSaque(saque)">
            <q-item-section avatar>
              <q-avatar :color="getCorPorStatus(saque.status)" text-color="white" icon="payments" size="40px" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">{{ getLabelPorMetodo(saque.metodo) }}</q-item-label>
              <q-item-label caption>{{ formatarData(saque.created_at) }}</q-item-label>
              <q-item-label caption v-if="saque.numero" class="text-caption">
                Nº: {{ saque.numero }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="saque-valor">{{ formatarValor(saque.valor) }} MZN</div>
              <q-badge :color="getCorPorStatus(saque.status)" class="q-mt-xs">
                {{ getLabelPorStatus(saque.status) }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>

    <!-- Dialog de detalhes do saque -->
    <q-dialog v-model="showDetalhesDialog">
      <q-card style="min-width: 300px; max-width: 400px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalhes do Saque</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <div class="row justify-between">
            <span class="text-grey-7">Número:</span>
            <span class="text-bold">{{ saqueDetalhes?.numero || '---' }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">Valor:</span>
            <span class="text-bold text-primary">{{ formatarValor(saqueDetalhes?.valor || 0) }} MZN</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">Forma:</span>
            <span>{{ getLabelPorMetodo(saqueDetalhes?.metodo || '') }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">Status:</span>
            <q-badge :color="getCorPorStatus(saqueDetalhes?.status || '')">
              {{ getLabelPorStatus(saqueDetalhes?.status || '') }}
            </q-badge>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">Data:</span>
            <span>{{ formatarDataCompleta(saqueDetalhes?.created_at || '') }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">Conta:</span>
            <span class="text-caption">{{ saqueDetalhes?.conta || '---' }}</span>
          </div>
          <div v-if="saqueDetalhes?.descricao" class="row">
            <span class="text-grey-7">Descrição:</span>
            <span class="q-ml-sm">{{ saqueDetalhes?.descricao }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore, type SaqueData } from 'src/stores/prestador-store';
import type { GanhosData } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorSaques',
});

interface FormaPagamentoOption {
  label: string;
  value: string;
  icone: string;
  cor: string;
}

interface BancoOption {
  label: string;
  value: string;
}

interface SaqueDetalhes {
  id: number;
  numero: string;
  valor: number;
  metodo: string;
  status: string;
  created_at: string;
  conta: string;
  descricao?: string;
}

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Constantes
const VALOR_MINIMO_SAQUE = 500;

// Estados
const loading = ref(true);
const salvando = ref(false);
const carregandoHistorico = ref(false);
const formaPagamento = ref<string>('mpesa');
const valorSaque = ref<number | null>(null);

// Campos M-Pesa
const mpesaNumero = ref('');
const mpesaNome = ref('');

// Campos conta bancária
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');
const contaIban = ref('');

// Dialog detalhes
const showDetalhesDialog = ref(false);
const saqueDetalhes = ref<SaqueDetalhes | null>(null);

// Dados do store
const ganhos = computed<GanhosData>(() => prestadorStore.ganhos);
const historicoSaquesStore = computed<SaqueData[]>(() => prestadorStore.historicoSaques);

// Opções de bancos
const bancosOptions = ref<BancoOption[]>([
  { label: 'BCI - Banco Comercial e de Investimentos', value: 'bci' },
  { label: 'BIM - Banco Internacional de Moçambique', value: 'bim' },
  { label: 'Millennium BIM', value: 'millennium' },
  { label: 'Standard Bank', value: 'standard' },
  { label: 'Moza Banco', value: 'moza' },
  { label: 'ABS - African Banking Corporation', value: 'abs' },
  { label: 'First National Bank (FNB)', value: 'fnb' },
  { label: 'Banco Unico', value: 'unico' },
  { label: 'Ecobank', value: 'eco' },
  { label: 'Banco de Oportunidades', value: 'oportunidades' },
]);

// Opções de formas de pagamento
const formasPagamentoOptions = ref<FormaPagamentoOption[]>([
  { label: 'M-Pesa', value: 'mpesa', icone: 'phone_android', cor: 'positive' },
  { label: 'Conta bancária', value: 'bancario', icone: 'account_balance', cor: 'primary' },
]);

// Computed
const saldoDisponivel = computed(() => {
  return (ganhos.value?.total || 0) - (ganhos.value?.pendente || 0);
});

const historicoSaques = computed(() => {
  return (historicoSaquesStore.value || []).slice(0, 5);
});

const podeSolicitar = computed(() => {
  if (!valorSaque.value || valorSaque.value <= 0) return false;
  if (valorSaque.value > saldoDisponivel.value) return false;
  if (valorSaque.value < VALOR_MINIMO_SAQUE) return false;

  if (formaPagamento.value === 'mpesa') {
    const numeroLimpo = mpesaNumero.value.replace(/\D/g, '');
    return !!numeroLimpo && numeroLimpo.length >= 9;
  }

  if (formaPagamento.value === 'bancario') {
    return !!contaBanco.value && !!contaNumero.value && !!contaTitular.value;
  }

  return false;
});

// Funções auxiliares
const formatarValor = (valor: number): string => {
  if (!valor && valor !== 0) return '0';
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const formatarData = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatarDataCompleta = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getLabelPorMetodo = (metodo: string): string => {
  if (metodo === 'mpesa') return 'M-Pesa';
  if (metodo === 'bancario') return 'Conta bancária';
  return 'Outro';
};

const getCorPorStatus = (status: string): string => {
  const statusLower = status?.toLowerCase() || '';
  switch (statusLower) {
    case 'pendente': return 'warning';
    case 'processando': return 'info';
    case 'concluido': return 'positive';
    case 'cancelado': return 'negative';
    default: return 'grey';
  }
};

const getLabelPorStatus = (status: string): string => {
  const statusLower = status?.toLowerCase() || '';
  switch (statusLower) {
    case 'pendente': return 'Pendente';
    case 'processando': return 'Processando';
    case 'concluido': return 'Concluído';
    case 'cancelado': return 'Cancelado';
    default: return status || 'Desconhecido';
  }
};

const getFormaPagamentoLabel = (value: string): string => {
  const opt = formasPagamentoOptions.value.find(f => f.value === value);
  return opt?.label || value;
};

const getFormaPagamentoIcone = (value: string): string => {
  const opt = formasPagamentoOptions.value.find(f => f.value === value);
  return opt?.icone || 'payments';
};

const getFormaPagamentoCor = (value: string): string => {
  const opt = formasPagamentoOptions.value.find(f => f.value === value);
  return opt?.cor || 'grey';
};

const verDetalhesSaque = (saque: SaqueData): void => {
  saqueDetalhes.value = {
    id: saque.id,
    numero: saque.numero,
    valor: saque.valor,
    metodo: saque.metodo,
    status: saque.status,
    created_at: saque.created_at,
    conta: saque.conta,
    descricao: saque.descricao,
  };
  showDetalhesDialog.value = true;
};

// Carregar dados
const carregarDados = async (): Promise<void> => {
  loading.value = true;
  try {
    await Promise.all([
      prestadorStore.fetchGanhos(true),
      prestadorStore.fetchHistoricoSaques(true),
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

// Processar saque
const processarSaque = (): void => {
  if (!valorSaque.value) return;

  let conta = '';
  if (formaPagamento.value === 'mpesa') {
    const numeroLimpo = mpesaNumero.value.replace(/\D/g, '');
    conta = `+258 ${numeroLimpo.substring(0, 2)} ${numeroLimpo.substring(2, 5)} ${numeroLimpo.substring(5)}`;
    if (mpesaNome.value) conta += ` (${mpesaNome.value})`;
  } else if (formaPagamento.value === 'bancario') {
    conta = `${contaBanco.value} | Conta: ${contaNumero.value} | Titular: ${contaTitular.value}`;
    if (contaIban.value) conta += ` | IBAN: ${contaIban.value}`;
  }

  salvando.value = true;

  prestadorStore.solicitarSaque({
    valor: valorSaque.value,
    metodo: formaPagamento.value as 'mpesa' | 'bancario',
    conta: conta,
  })
    .then((result) => {
      if (result) {
        $q.notify({
          type: 'positive',
          message: 'Saque solicitado com sucesso!',
          position: 'top',
          icon: 'check_circle',
        });

        // Reset form
        valorSaque.value = null;
        mpesaNumero.value = '';
        mpesaNome.value = '';
        contaBanco.value = '';
        contaNumero.value = '';
        contaTitular.value = '';
        contaIban.value = '';

        // Recarregar dados
        return carregarDados();
      }
    })
    .catch((error) => {
      console.error('Erro ao solicitar saque:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.error || 'Erro ao solicitar saque',
        position: 'top',
      });
    })
    .finally(() => {
      salvando.value = false;
    });
};

const solicitarSaque = (): void => {
  if (!valorSaque.value) return;

  $q.dialog({
    title: 'Confirmar saque',
    message: `Solicitar saque de <strong>${formatarValor(valorSaque.value)} MZN</strong> via <strong>${getFormaPagamentoLabel(formaPagamento.value)}</strong>?<br><br>
    <span class="text-caption text-grey">Os saques podem levar até 2 dias úteis para processamento.</span>`,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
    ok: {
      label: 'Confirmar',
      color: 'positive',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    processarSaque();
  });
};

const ajuda = (): void => {
  $q.dialog({
    title: 'Ajuda - Saques',
    message: `
      <ul style="margin: 0; padding-left: 20px;">
        <li>Valor mínimo para saque: <strong>${formatarValor(VALOR_MINIMO_SAQUE)} MZN</strong></li>
        <li>Os saques podem levar até 2 dias úteis para processamento</li>
        <li>Você receberá uma notificação quando o saque for processado</li>
        <li>Certifique-se que os dados da conta estão corretos</li>
        <li>Em caso de dúvidas, contacte o suporte</li>
      </ul>
    `,
    html: true,
    cancel: true,
    ok: {
      label: 'Entendi',
      flat: true,
    },
  });
};

const verTodos = (): void => {
  $q.notify({
    type: 'info',
    message: 'Histórico completo disponível em breve',
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
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
  position: sticky;
  top: 0;
  z-index: 10;
}

// ==========================================
// SKELETON LOADING (Facebook/Instagram style)
// ==========================================

.skeleton-container {
  .skeleton-saldo {
    background: white;
    margin-bottom: 16px;
  }

  .skeleton-label {
    width: 120px;
    height: 14px;
    background: $gray-200;
    border-radius: 4px;
    margin: 0 auto 12px;
  }

  .skeleton-value {
    width: 180px;
    height: 48px;
    background: $gray-200;
    border-radius: 8px;
    margin: 0 auto;
  }

  .skeleton-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .skeleton-title {
    width: 150px;
    height: 20px;
    background: $gray-200;
    border-radius: 4px;
    margin-bottom: 16px;

    &.small {
      width: 100px;
      height: 16px;
      margin-bottom: 0;
    }
  }

  .skeleton-input {
    width: 100%;
    height: 48px;
    background: $gray-200;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .skeleton-button {
    width: 100%;
    height: 40px;
    background: $gray-300;
    border-radius: 8px;

    &.primary {
      background: $gray-300;
    }
  }

  .skeleton-link {
    width: 80px;
    height: 20px;
    background: $gray-200;
    border-radius: 4px;
  }

  .skeleton-historico {
    background: white;
  }

  .skeleton-history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $gray-200;
  }

  .skeleton-avatar {
    width: 40px;
    height: 40px;
    background: $gray-200;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skeleton-text {
    width: 60%;
    height: 14px;
    background: $gray-200;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-text-short {
    width: 40%;
    height: 12px;
    background: $gray-200;
    border-radius: 4px;
  }

  .skeleton-badge {
    width: 70px;
    height: 24px;
    background: $gray-200;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// ==========================================
// ESTILOS PRINCIPAIS
// ==========================================

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
  padding: 40px 20px;
}

.saldo-info {
  background: white;
  border-bottom: 1px solid $gray-200;

  .saldo-label {
    font-size: 0.85rem;
    color: $gray-600;
    margin-bottom: 4px;
  }

  .saldo-valor {
    font-size: 2.5rem;
    font-weight: 700;
    color: $purple-primary;
  }

  .saldo-detalhe {
    font-size: 0.75rem;
    color: $gray-500;
    margin-top: 8px;
  }
}

.saque-form {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.historico-list {
  border-radius: 12px;
  overflow: hidden;

  .q-item {
    transition: background 0.2s ease;

    &:hover {
      background: $gray-100;
    }
  }
}

.saque-valor {
  font-weight: 600;
  color: $gray-800;
  margin-bottom: 4px;
  font-size: 0.9rem;
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

// Responsivo
@media (max-width: 600px) {
  .saldo-info .saldo-valor {
    font-size: 1.8rem;
  }

  .saque-form {
    margin: 12px;
  }
}
</style>
