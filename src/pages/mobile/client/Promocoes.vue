<!-- src/pages/mobile/client/Promocoes.vue -->
<template>
  <q-page class="promocoes-page">
    <!-- Skeleton Loading -->
    <div v-if="promocaoStore.carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-placeholder"></div>
      </div>
      <div class="skeleton-hero"></div>
      <div class="skeleton-cupom"></div>
      <div class="skeleton-section-header">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-20"></div>
      </div>
      <div class="skeleton-grid">
        <div v-for="i in 2" :key="i" class="skeleton-card">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-code"></div>
          <div class="skeleton-details">
            <div class="skeleton-line w-30"></div>
            <div class="skeleton-line w-40"></div>
          </div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <template v-else>
      <!-- Cabeçalho com gradiente -->
      <div class="page-header">
        <q-btn flat round icon="arrow_back" text-color="white" @click="router.back" />
        <div class="text-h6 text-bold text-white">Promoções</div>
        <div style="width: 40px"></div>
      </div>

      <!-- Banner de destaque -->
      <div class="hero-banner">
        <div class="hero-content">
          <q-icon name="local_offer" size="40px" />
          <div class="hero-text">
            <div class="hero-title">Ofertas Imperdíveis</div>
            <div class="hero-subtitle">Aproveite os descontos exclusivos</div>
          </div>
        </div>
      </div>

      <!-- Validação de cupom -->
      <div class="cupom-section">
        <div class="cupom-card">
          <div class="cupom-icon-wrapper">
            <q-icon name="confirmation_number" size="28px" class="cupom-icon" />
          </div>
          <div class="cupom-info">
            <div class="cupom-title">Tem um cupom?</div>
            <div class="cupom-subtitle">Digite o código para ganhar desconto</div>
          </div>
          <q-btn
            unelevated
            label="Validar"
            color="primary"
            @click="abrirModalCupom"
            no-caps
            class="cupom-btn"
          />
        </div>
      </div>

      <!-- Lista de promoções -->
      <div class="promocoes-container">
        <div class="section-header">
          <div class="section-title">
            <q-icon name="stars" size="20px" color="primary" />
            <span>Promoções Ativas</span>
          </div>
          <div class="section-count">{{ promocaoStore.totalPromocoes }} ofertas</div>
        </div>

        <div v-if="promocaoStore.temPromocoes === false" class="empty-state">
          <div class="empty-icon">
            <q-icon name="local_offer" size="80px" />
          </div>
          <div class="empty-title">Nenhuma promoção ativa</div>
          <div class="empty-text">Volte em breve para novas ofertas exclusivas</div>
        </div>

        <div v-else class="promocoes-grid">
          <div
            v-for="promo in promocaoStore.promocoesAtivas"
            :key="promo.id"
            class="promo-card"
            :class="{ featured: promocaoStore.isPromocaoDestaque(promo) }"
          >
            <div class="promo-card-inner">
              <!-- Badge de destaque -->
              <div class="promo-badge" v-if="promocaoStore.isPromocaoDestaque(promo)">
                <q-icon name="stars" size="14px" />
                <span>Destaque</span>
              </div>

              <!-- Ícone de promoção -->
              <div
                class="promo-icon"
                :class="{ 'icon-percent': promo.tipo_desconto === 'percentual' }"
              >
                <q-icon
                  :name="promo.tipo_desconto === 'percentual' ? 'percent' : 'sell'"
                  size="32px"
                />
              </div>

              <!-- Conteúdo principal -->
              <div class="promo-info">
                <div class="promo-title">{{ promo.titulo }}</div>
                <div class="promo-description">{{ promo.descricao }}</div>

                <!-- Código do cupom -->
                <div class="promo-code" @click="copiarCodigo(promo.codigo)">
                  <span class="code-label">Cupom</span>
                  <span class="code-value">{{ promo.codigo }}</span>
                  <q-icon name="content_copy" size="16px" class="copy-icon" />
                </div>

                <!-- Detalhes da promoção -->
                <div class="promo-details">
                  <div
                    class="discount-badge"
                    :class="{ 'discount-high': promocaoStore.isPromocaoDestaque(promo) }"
                  >
                    <q-icon
                      :name="promo.tipo_desconto === 'percentual' ? 'percent' : 'attach_money'"
                      size="14px"
                    />
                    {{ promocaoStore.formatarDesconto(promo) }}
                  </div>
                  <div class="min-value" v-if="promo.valor_minimo > 0">
                    <q-icon name="shopping_cart" size="12px" />
                    Mínimo: {{ promocaoStore.formatarMoeda(promo.valor_minimo) }}
                  </div>
                  <div class="valid-until">
                    <q-icon name="event" size="12px" />
                    {{ promocaoStore.formatarData(promo.validade) }}
                  </div>
                </div>
              </div>

              <!-- Botão de ação -->
              <q-btn
                class="use-btn"
                :class="{ 'btn-featured': promocaoStore.isPromocaoDestaque(promo) }"
                unelevated
                label="Usar cupom"
                @click="usarCupom(promo.codigo)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para validar cupom -->
      <q-dialog v-model="modalCupom" persistent>
        <q-card class="cupom-modal">
          <q-card-section class="modal-header">
            <div class="modal-icon">
              <q-icon name="confirmation_number" size="32px" color="primary" />
            </div>
            <div class="modal-title">Validar cupom</div>
            <div class="modal-subtitle">Digite o código promocional</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="codigoCupom"
              label="Código do cupom"
              outlined
              dense
              autofocus
              placeholder="Ex: BEMVINDO20"
              @keyup.enter="validarCupom"
              class="cupom-input"
            >
              <template v-slot:prepend>
                <q-icon name="confirmation_number" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="modal-actions">
            <q-btn flat label="Cancelar" v-close-popup class="cancel-btn" />
            <q-btn
              unelevated
              label="Validar"
              color="primary"
              :loading="validando"
              @click="validarCupom"
              class="validate-btn"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePromocaoStore } from 'src/stores/client/promocao-store';

defineOptions({
  name: 'MobilePromocoes',
});

const router = useRouter();
const $q = useQuasar();
const promocaoStore = usePromocaoStore();

// Estados
const modalCupom = ref(false);
const codigoCupom = ref('');
const validando = ref(false);

const copiarCodigo = async (codigo: string) => {
  try {
    await navigator.clipboard.writeText(codigo);
    $q.notify({
      type: 'positive',
      message: `Cupom ${codigo} copiado!`,
      position: 'top',
      timeout: 2000,
      icon: 'content_copy',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao copiar cupom',
      position: 'top',
    });
  }
};

const usarCupom = (codigo: string) => {
  codigoCupom.value = codigo;
  modalCupom.value = true;
};

const abrirModalCupom = () => {
  codigoCupom.value = '';
  modalCupom.value = true;
};

const validarCupom = async () => {
  if (!codigoCupom.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Digite um código de cupom',
      position: 'top',
    });
    return;
  }

  validando.value = true;
  try {
    const result = await promocaoStore.validarCupom(codigoCupom.value.toUpperCase());
    if (result && result.valido) {
      modalCupom.value = false;
      $q.notify({
        type: 'positive',
        message: result.mensagem || `Cupom válido! Desconto de ${result.desconto}%`,
        position: 'top',
        timeout: 3000,
      });
    } else {
      $q.notify({
        type: 'negative',
        message: result?.mensagem || 'Cupom inválido',
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao validar cupom',
      position: 'top',
    });
  } finally {
    validando.value = false;
  }
};

// Carregar dados
const carregarDados = async () => {
  await promocaoStore.carregarDadosIniciais();
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-dark: #5a67d8;
$pink-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
$blue-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
$green-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
$orange-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

.promocoes-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fc 0%, #f1f3f9 100%);
  padding-bottom: 24px;
}

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: linear-gradient(180deg, #f8f9fc 0%, #f1f3f9 100%);
  min-height: 100vh;
}

.skeleton-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.skeleton-title {
  width: 100px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.skeleton-placeholder {
  width: 40px;
  height: 40px;
}

.skeleton-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20px 16px;
  border-radius: 24px;
  height: 100px;
  position: relative;
  overflow: hidden;
}

.skeleton-cupom {
  background: white;
  margin: 0 16px 24px;
  border-radius: 20px;
  height: 80px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.skeleton-section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0 20px 20px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-grid {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.skeleton-icon {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-code {
  width: 120px;
  height: 40px;
  border-radius: 40px;
  margin: 12px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}

.skeleton-btn {
  width: 100%;
  height: 44px;
  border-radius: 40px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-20 {
  width: 20%;
}
.w-30 {
  width: 30%;
}
.w-40 {
  width: 40%;
}
.w-60 {
  width: 60%;
}
.w-80 {
  width: 80%;
}

/* ========================================== */
/* ESTILOS ORIGINAIS */
/* ========================================== */

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20px 16px;
  border-radius: 24px;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
    color: white;

    .hero-title {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .hero-subtitle {
      font-size: 0.8rem;
      opacity: 0.9;
    }
  }
}

.cupom-section {
  padding: 0 16px;
  margin-bottom: 24px;

  .cupom-card {
    background: white;
    border-radius: 20px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
    }

    .cupom-icon-wrapper {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      .cupom-icon {
        color: $purple-primary;
      }
    }

    .cupom-info {
      flex: 1;

      .cupom-title {
        font-weight: 700;
        font-size: 1rem;
        color: #1a1a2e;
      }

      .cupom-subtitle {
        font-size: 0.75rem;
        color: #6c757d;
      }
    }

    .cupom-btn {
      border-radius: 30px;
      padding: 8px 20px;
    }
  }
}

.promocoes-container {
  padding: 0 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 20px;
    padding: 0 4px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .section-count {
      font-size: 0.75rem;
      color: #6c757d;
      background: #e9ecef;
      padding: 4px 10px;
      border-radius: 20px;
    }
  }
}

.promocoes-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.promo-card {
  border-radius: 24px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
  }

  &.featured {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .promo-card-inner {
      color: white;

      .promo-title,
      .promo-description {
        color: white;
      }

      .promo-code {
        background: rgba(255, 255, 255, 0.2);
        .code-label,
        .code-value,
        .copy-icon {
          color: white;
        }
      }

      .min-value,
      .valid-until {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .promo-card-inner {
    padding: 20px;
    position: relative;
  }

  .promo-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .promo-icon {
    width: 56px;
    height: 56px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    &.icon-percent {
      background: rgba(102, 126, 234, 0.2);
    }
  }

  .promo-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  .promo-description {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 16px;
  }

  .promo-code {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(102, 126, 234, 0.1);
    padding: 8px 16px;
    border-radius: 40px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.2);
    }

    .code-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      color: $purple-primary;
    }

    .code-value {
      font-family: monospace;
      font-weight: 700;
      letter-spacing: 1px;
      font-size: 0.9rem;
      color: $purple-primary;
    }

    .copy-icon {
      color: $purple-primary;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  .promo-details {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .discount-badge {
      background: rgba(102, 126, 234, 0.15);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: $purple-primary;

      &.discount-high {
        background: #f093fb20;
        color: #f5576c;
      }
    }

    .min-value,
    .valid-until {
      font-size: 0.7rem;
      color: #6c757d;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .use-btn {
    width: 100%;
    border-radius: 40px;
    background: $purple-primary;
    color: white;
    font-weight: 600;
    padding: 10px;

    &:hover {
      background: $purple-dark;
    }

    &.btn-featured {
      background: white;
      color: $purple-primary;

      &:hover {
        background: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    margin-bottom: 20px;
    color: #dee2e6;
  }

  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
  }

  .empty-text {
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.cupom-modal {
  border-radius: 28px;
  max-width: 90vw;
  width: 320px;

  .modal-header {
    text-align: center;
    padding-top: 32px;

    .modal-icon {
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #6c757d;
    }
  }

  .cupom-input {
    margin-top: 8px;
  }

  .modal-actions {
    padding: 16px 24px 24px;
    gap: 12px;

    .cancel-btn {
      color: #6c757d;
    }

    .validate-btn {
      border-radius: 30px;
      padding: 8px 24px;
    }
  }
}
</style>
