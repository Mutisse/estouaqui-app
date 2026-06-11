<template>
  <div class="prestador-saques">
    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="page-title">Realizar Saque</h1>
      <button class="help-btn" @click="ajuda">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="loading" class="skeleton-container">
      <div class="skeleton-saldo">
        <div class="skeleton-label"></div>
        <div class="skeleton-value"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-input"></div>
        <div class="skeleton-input"></div>
        <div class="skeleton-input"></div>
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col"><div class="skeleton-button"></div></div>
          <div class="col"><div class="skeleton-button primary"></div></div>
        </div>
        <div class="skeleton-shimmer"></div>
      </div>
      <div class="skeleton-historico">
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

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== SALDO DISPONÍVEL ===== -->
      <div class="saldo-info">
        <div class="saldo-label">Saldo disponível para saque</div>
        <div class="saldo-value">{{ formatarValor(saldoDisponivel) }} MZN</div>
        <div v-if="ganhos.pendente > 0" class="saldo-detalhe">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {{ formatarValor(ganhos.pendente) }} MZN pendentes
        </div>
      </div>

      <!-- ===== FORMULÁRIO DE SAQUE ===== -->
      <div class="saque-card">
        <h3 class="saque-card__title">Dados do saque</h3>

        <!-- Forma de pagamento -->
        <div class="payment-methods">
          <button
            v-for="opcao in formasPagamentoOptions"
            :key="opcao.value"
            class="payment-method-btn"
            :class="{ active: formaPagamento === opcao.value }"
            @click="formaPagamento = opcao.value"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                v-if="opcao.value === 'mpesa'"
                d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"
              />
              <rect v-else x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {{ opcao.label }}
          </button>
        </div>

        <!-- Valor do saque -->
        <div class="input-group">
          <label class="input-label">Valor do saque (MZN)</label>
          <div class="valor-input-wrapper">
            <input
              type="number"
              v-model.number="valorSaque"
              :min="VALOR_MINIMO_SAQUE"
              :max="saldoDisponivel"
              class="valor-input"
              placeholder="0"
            />
            <button class="max-btn" @click="valorSaque = saldoDisponivel">Máximo</button>
          </div>
          <div class="input-hint" v-if="valorSaque && valorSaque < VALOR_MINIMO_SAQUE">
            Valor mínimo de {{ formatarValor(VALOR_MINIMO_SAQUE) }} MZN
          </div>
          <div class="input-hint error" v-if="valorSaque && valorSaque > saldoDisponivel">
            Saldo insuficiente
          </div>
        </div>

        <!-- Campos M-Pesa -->
        <template v-if="formaPagamento === 'mpesa'">
          <div class="input-group">
            <label class="input-label">Número do M-Pesa</label>
            <div class="phone-input">
              <span class="phone-prefix">+258</span>
              <input
                type="tel"
                v-model="mpesaNumero"
                placeholder="84 123 4567"
                class="phone-number"
                maxlength="12"
              />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Nome do titular</label>
            <input
              type="text"
              v-model="mpesaNome"
              placeholder="Como aparece no documento"
              class="text-input"
            />
          </div>
        </template>

        <!-- Campos Conta Bancária -->
        <template v-else-if="formaPagamento === 'bancario'">
          <div class="input-group">
            <label class="input-label">Banco</label>
            <select v-model="contaBanco" class="select-input">
              <option value="">Selecione o banco</option>
              <option v-for="banco in bancosOptions" :key="banco.value" :value="banco.value">
                {{ banco.label }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label">Número da conta</label>
            <input
              type="text"
              v-model="contaNumero"
              placeholder="Número da conta"
              class="text-input"
            />
          </div>
          <div class="input-group">
            <label class="input-label">Nome do titular</label>
            <input
              type="text"
              v-model="contaTitular"
              placeholder="Como aparece no documento"
              class="text-input"
            />
          </div>
          <div class="input-group">
            <label class="input-label">IBAN (opcional)</label>
            <input type="text" v-model="contaIban" placeholder="IBAN" class="text-input" />
          </div>
        </template>

        <div class="saque-actions">
          <button class="cancel-btn" @click="() => void router.back()">Cancelar</button>
          <button class="submit-btn" :disabled="!podeSolicitar" @click="solicitarSaque">
            <span v-if="!salvando">Solicitar saque</span>
            <div v-else class="btn-spinner"></div>
          </button>
        </div>
      </div>

      <!-- ===== HISTÓRICO DE SAQUES ===== -->
      <div class="historico-section">
        <div class="historico-header">
          <h3>Últimos saques</h3>
          <button class="view-all" @click="verTodos">Ver todos →</button>
        </div>

        <div v-if="carregandoHistorico" class="loading-history">
          <div class="loader-small"></div>
          <p>Carregando histórico...</p>
        </div>

        <div v-else-if="historicoSaques.length === 0" class="empty-history">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D1D5DB"
            stroke-width="1.5"
          >
            <path
              d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"
            />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <p>Nenhum saque realizado</p>
          <span>Seus saques aparecerão aqui</span>
        </div>

        <div v-else class="historico-list">
          <div
            v-for="saque in historicoSaques"
            :key="saque.id"
            class="historico-item"
            @click="() => verDetalhesSaque(saque)"
          >
            <div class="historico-item__icon" :class="getCorPorStatus(saque.status)">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"
                />
              </svg>
            </div>
            <div class="historico-item__info">
              <div class="historico-item__title">{{ getLabelPorMetodo(saque.metodo) }}</div>
              <div class="historico-item__date">{{ formatarData(saque.created_at) }}</div>
              <div v-if="saque.numero" class="historico-item__number">Nº: {{ saque.numero }}</div>
            </div>
            <div class="historico-item__right">
              <div class="historico-item__value">{{ formatarValor(saque.valor) }} MZN</div>
              <div class="historico-item__status" :class="getCorPorStatus(saque.status)">
                {{ getLabelPorStatus(saque.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== DIALOG DE DETALHES ===== -->
    <div class="dialog-overlay" v-if="showDetalhesDialog" @click="showDetalhesDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>Detalhes do Saque</h3>
          <button class="dialog-close" @click="showDetalhesDialog = false">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="dialog-row">
            <span class="dialog-label">Número:</span>
            <span class="dialog-value">{{ saqueDetalhes?.numero || '---' }}</span>
          </div>
          <div class="dialog-row">
            <span class="dialog-label">Valor:</span>
            <span class="dialog-value highlight"
              >{{ formatarValor(saqueDetalhes?.valor || 0) }} MZN</span
            >
          </div>
          <div class="dialog-row">
            <span class="dialog-label">Forma:</span>
            <span class="dialog-value">{{ getLabelPorMetodo(saqueDetalhes?.metodo || '') }}</span>
          </div>
          <div class="dialog-row">
            <span class="dialog-label">Status:</span>
            <span class="dialog-value">
              <span class="status-badge" :class="getCorPorStatus(saqueDetalhes?.status || '')">
                {{ getLabelPorStatus(saqueDetalhes?.status || '') }}
              </span>
            </span>
          </div>
          <div class="dialog-row">
            <span class="dialog-label">Data:</span>
            <span class="dialog-value">{{
              formatarDataCompleta(saqueDetalhes?.created_at || '')
            }}</span>
          </div>
          <div class="dialog-row">
            <span class="dialog-label">Conta:</span>
            <span class="dialog-value">{{ saqueDetalhes?.conta || '---' }}</span>
          </div>
          <div v-if="saqueDetalhes?.descricao" class="dialog-row">
            <span class="dialog-label">Descrição:</span>
            <span class="dialog-value">{{ saqueDetalhes?.descricao }}</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn" @click="showDetalhesDialog = false">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  usePrestadorSaquesStore,
  VALOR_MINIMO_SAQUE,
  formasPagamentoOptions,
  bancosOptions,
  type SaqueData,
} from 'src/stores/prestador/prestador-saques-store';

defineOptions({ name: 'PrestadorSaques' });

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

// ✅ APENAS UM STORE!
const saquesStore = usePrestadorSaquesStore();

// Estados locais
const loading = ref(true);
const salvando = ref(false);
const carregandoHistorico = ref(false);
const formaPagamento = ref<string>('mpesa');
const valorSaque = ref<number | null>(null);

// Formulário M-Pesa
const mpesaNumero = ref('');
const mpesaNome = ref('');

// Formulário Conta Bancária
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');
const contaIban = ref('');

// Dialog
const showDetalhesDialog = ref(false);
const saqueDetalhes = ref<SaqueDetalhes | null>(null);

// Computed - removido 'carregando' não usado
const saldoDisponivel = computed(() => saquesStore.saldoDisponivel);
const ganhos = computed(() => saquesStore.ganhos);
const historicoSaques = computed(() => saquesStore.ultimosSaques);

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

// Utilitários
const formatarValor = (valor: number): string => {
  return saquesStore.formatarValor(valor);
};

const getLabelPorMetodo = (metodo: string): string => {
  return saquesStore.getLabelPorMetodo(metodo);
};

const getCorPorStatus = (status: string): string => {
  return saquesStore.getCorPorStatus(status);
};

const getLabelPorStatus = (status: string): string => {
  return saquesStore.getLabelPorStatus(status);
};

const formatarData = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatarDataCompleta = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ✅ CORRIGIDO: Tipagem correta com SaqueData
const verDetalhesSaque = (saque: SaqueData): void => {
  const detalhes: SaqueDetalhes = {
    id: saque.id,
    numero: saque.numero,
    valor: saque.valor,
    metodo: saque.metodo,
    status: saque.status,
    created_at: saque.created_at,
    conta: saque.conta,
  };
  if (saque.descricao && saque.descricao.trim() !== '') {
    detalhes.descricao = saque.descricao;
  }
  saqueDetalhes.value = detalhes;
  showDetalhesDialog.value = true;
};

const carregarDados = async (): Promise<void> => {
  loading.value = true;
  try {
    await saquesStore.carregarTodosDados();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados', position: 'top' });
  } finally {
    loading.value = false;
  }
};

const processarSaque = async (): Promise<void> => {
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
  try {
    const result = await saquesStore.solicitarSaque({
      valor: valorSaque.value,
      metodo: formaPagamento.value as 'mpesa' | 'bancario',
      conta: conta,
    });

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Saque solicitado com sucesso!',
        position: 'top',
        icon: 'check_circle',
      });
      valorSaque.value = null;
      mpesaNumero.value = '';
      mpesaNome.value = '';
      contaBanco.value = '';
      contaNumero.value = '';
      contaTitular.value = '';
      contaIban.value = '';
      await carregarDados();
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao solicitar saque', position: 'top' });
  } finally {
    salvando.value = false;
  }
};

const solicitarSaque = (): void => {
  if (!valorSaque.value) return;

  $q.dialog({
    title: 'Confirmar saque',
    message: `Solicitar saque de <strong>${formatarValor(valorSaque.value)} MZN</strong> via <strong>${getLabelPorMetodo(formaPagamento.value)}</strong>?<br><br>
    <span class="text-caption text-grey">Os saques podem levar até 2 dias úteis para processamento.</span>`,
    html: true,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Confirmar', color: 'positive', unelevated: true },
    persistent: true,
  }).onOk(() => {
    void processarSaque();
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
    ok: { label: 'Entendi', flat: true },
  });
};

const verTodos = (): void => {
  $q.notify({ type: 'info', message: 'Histórico completo disponível em breve', position: 'top' });
};

onMounted(async () => {
  await carregarDados();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10b981;
$warning: #f59e0b;
$danger: #ef4444;
$info: #3b82f6;
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-container {
  .skeleton-saldo {
    background: $white;
    margin-bottom: 16px;
    padding: 20px;
    text-align: center;
  }
  .skeleton-label {
    width: 120px;
    height: 14px;
    background: $gray-light;
    border-radius: 4px;
    margin: 0 auto 12px;
  }
  .skeleton-value {
    width: 180px;
    height: 48px;
    background: $gray-light;
    border-radius: 8px;
    margin: 0 auto;
  }
  .skeleton-card {
    background: $white;
    border-radius: $radius;
    padding: 20px;
    margin: 16px;
    position: relative;
    overflow: hidden;
  }
  .skeleton-title {
    width: 150px;
    height: 20px;
    background: $gray-light;
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
    background: $gray-light;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .skeleton-button {
    width: 100%;
    height: 44px;
    background: $border;
    border-radius: 8px;
    &.primary {
      background: $gray-light;
    }
  }
  .skeleton-link {
    width: 80px;
    height: 20px;
    background: $gray-light;
    border-radius: 4px;
  }
  .skeleton-historico {
    background: $white;
    padding: 16px;
  }
  .skeleton-history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $border;
  }
  .skeleton-avatar {
    width: 44px;
    height: 44px;
    background: $gray-light;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .skeleton-text {
    width: 60%;
    height: 14px;
    background: $gray-light;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  .skeleton-text-short {
    width: 40%;
    height: 12px;
    background: $gray-light;
    border-radius: 4px;
  }
  .skeleton-badge {
    width: 70px;
    height: 24px;
    background: $gray-light;
    border-radius: 12px;
    flex-shrink: 0;
  }
  .skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: shimmer 1.5s infinite;
  }
}

// =====================
// LAYOUT PRINCIPAL
// =====================
.prestador-saques {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;

  .back-btn,
  .help-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

// =====================
// SALDO INFO
// =====================
.saldo-info {
  background: $white;
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid $border;

  .saldo-label {
    font-size: 0.85rem;
    color: $gray;
    margin-bottom: 8px;
  }

  .saldo-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: $accent;
    margin-bottom: 8px;
  }

  .saldo-detalhe {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.75rem;
    color: $gray;
  }
}

// =====================
// SAQUE CARD
// =====================
.saque-card {
  background: $white;
  margin: 16px;
  border-radius: $radius;
  padding: 20px;
  border: 1px solid $border;

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin: 0 0 16px;
  }
}

.payment-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.payment-method-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: $gray-light;
  border: 1px solid $border;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $accent-light;
  }
  &.active {
    background: $accent;
    border-color: $accent;
    color: $white;
  }
}

.input-group {
  margin-bottom: 16px;

  .input-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: $dark;
    margin-bottom: 6px;
  }

  .input-hint {
    font-size: 0.7rem;
    color: $gray;
    margin-top: 4px;
    &.error {
      color: $danger;
    }
  }
}

.valor-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  .valor-input {
    flex: 1;
    padding: 12px;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
    &:focus {
      border-color: $accent;
    }
  }

  .max-btn {
    padding: 8px 16px;
    background: $accent-light;
    border: none;
    border-radius: $radius-xs;
    font-size: 0.8rem;
    font-weight: 500;
    color: $accent;
    cursor: pointer;
    &:hover {
      background: rgba($accent, 0.15);
    }
  }
}

.phone-input {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  border-radius: $radius-xs;
  overflow: hidden;

  .phone-prefix {
    padding: 12px;
    background: $gray-light;
    color: $gray;
    border-right: 1px solid $border;
  }

  .phone-number {
    flex: 1;
    padding: 12px;
    border: none;
    outline: none;
    font-size: 0.9rem;
    &:focus {
      background: $accent-light;
    }
  }
}

.text-input,
.select-input {
  width: 100%;
  padding: 12px;
  border: 1px solid $border;
  border-radius: $radius-xs;
  font-size: 0.9rem;
  outline: none;
  background: $white;
  &:focus {
    border-color: $accent;
  }
}

.saque-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .cancel-btn {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $radius-sm;
    font-size: 0.9rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;
    &:hover {
      background: $gray-light;
    }
  }

  .submit-btn {
    flex: 1;
    padding: 12px;
    background: $accent;
    border: none;
    border-radius: $radius-sm;
    font-size: 0.9rem;
    font-weight: 600;
    color: $white;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
      transform: translateY(-1px);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// =====================
// HISTÓRICO
// =====================
.historico-section {
  background: $white;
  margin: 16px;
  border-radius: $radius;
  padding: 16px;
  border: 1px solid $border;
}

.historico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }

  .view-all {
    font-size: 0.75rem;
    color: $accent;
    background: none;
    border: none;
    cursor: pointer;
  }
}

.loading-history {
  text-align: center;
  padding: 32px;

  .loader-small {
    width: 32px;
    height: 32px;
    border: 2px solid $border;
    border-top-color: $accent;
    border-radius: 50%;
    margin: 0 auto 12px;
    animation: spin 0.6s linear infinite;
  }

  p {
    color: $gray;
    font-size: 0.85rem;
    margin: 0;
  }
}

.empty-history {
  text-align: center;
  padding: 32px;

  svg {
    margin-bottom: 12px;
  }
  p {
    font-weight: 500;
    color: $dark;
    margin: 0 0 4px;
  }
  span {
    font-size: 0.8rem;
    color: $gray;
  }
}

.historico-list {
  .historico-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $border;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: $gray-light;
      margin: 0 -8px;
      padding: 12px 8px;
      border-radius: $radius-xs;
    }
    &:last-child {
      border-bottom: none;
    }

    &__icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.warning {
        background: rgba($warning, 0.1);
        color: $warning;
      }
      &.info {
        background: rgba($info, 0.1);
        color: $info;
      }
      &.success {
        background: rgba($success, 0.1);
        color: $success;
      }
      &.danger {
        background: rgba($danger, 0.1);
        color: $danger;
      }
      &.grey {
        background: rgba($gray, 0.1);
        color: $gray;
      }
    }

    &__info {
      flex: 1;

      &__title {
        font-weight: 600;
        font-size: 0.85rem;
        color: $dark;
      }

      &__date {
        font-size: 0.7rem;
        color: $gray;
        margin-top: 2px;
      }

      &__number {
        font-size: 0.65rem;
        color: $gray;
        margin-top: 2px;
      }
    }

    &__right {
      text-align: right;
      flex-shrink: 0;
    }

    &__value {
      font-weight: 600;
      font-size: 0.9rem;
      color: $dark;
    }

    &__status {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-block;
      margin-top: 4px;

      &.warning {
        background: rgba($warning, 0.1);
        color: $warning;
      }
      &.info {
        background: rgba($info, 0.1);
        color: $info;
      }
      &.success {
        background: rgba($success, 0.1);
        color: $success;
      }
      &.danger {
        background: rgba($danger, 0.1);
        color: $danger;
      }
      &.grey {
        background: rgba($gray, 0.1);
        color: $gray;
      }
    }
  }
}

// =====================
// DIALOG
// =====================
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: $white;
  border-radius: $radius;
  width: 90%;
  max-width: 360px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .dialog-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    &:hover {
      background: $border;
    }
  }
}

.dialog-body {
  padding: 16px;

  .dialog-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.85rem;

    .dialog-label {
      color: $gray;
    }

    .dialog-value {
      color: $dark;
      text-align: right;

      &.highlight {
        color: $accent;
        font-weight: 600;
      }
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.7rem;

      &.warning {
        background: rgba($warning, 0.1);
        color: $warning;
      }
      &.info {
        background: rgba($info, 0.1);
        color: $info;
      }
      &.success {
        background: rgba($success, 0.1);
        color: $success;
      }
      &.danger {
        background: rgba($danger, 0.1);
        color: $danger;
      }
    }
  }
}

.dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid $border;

  .dialog-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: none;
    border-radius: $radius-xs;
    font-weight: 500;
    color: $accent;
    cursor: pointer;
    &:hover {
      background: $accent-light;
    }
  }
}
</style>
