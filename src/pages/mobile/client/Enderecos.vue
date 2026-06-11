<template>
  <div class="endereco-page">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregando" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-avatar"></div>
      </div>
      <div class="skeleton-form">
        <div class="skeleton-line w-100"></div>
        <div class="skeleton-line w-50"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== HEADER COM FOTO ===== -->
      <div class="page-header">
        <button class="back-btn" @click="router.back()">
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
        <h1 class="page-title">Meu Endereço</h1>

        <!-- ✅ FOTO DE PERFIL - LADO DIREITO -->
        <div class="profile-avatar" @click="irParaPerfil">
          <img
            v-if="perfilStore.userData?.foto"
            :src="perfilStore.userData.foto"
            alt="Foto de perfil"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder" :style="{ backgroundColor: perfilStore.avatarColor }">
            <span class="avatar-iniciais">{{ perfilStore.iniciaisNome }}</span>
          </div>
        </div>
      </div>

      <!-- ===== FORMULÁRIO DE ENDEREÇO ===== -->
      <div class="endereco-form">
        <div class="form-group">
          <label class="form-label">Rua / Avenida</label>
          <q-input
            v-model="enderecoForm.rua"
            outlined
            dense
            placeholder="Nome da rua"
            :disable="!modoEdicao"
            :readonly="!modoEdicao"
            class="custom-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">Número</label>
            <q-input
              v-model="enderecoForm.numero"
              outlined
              dense
              placeholder="Número"
              :disable="!modoEdicao"
              :readonly="!modoEdicao"
              class="custom-input"
            />
          </div>
          <div class="form-group half">
            <label class="form-label">Complemento</label>
            <q-input
              v-model="enderecoForm.complemento"
              outlined
              dense
              placeholder="Apto, Bloco..."
              :disable="!modoEdicao"
              :readonly="!modoEdicao"
              class="custom-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Bairro</label>
          <q-input
            v-model="enderecoForm.bairro"
            outlined
            dense
            placeholder="Bairro"
            :disable="!modoEdicao"
            :readonly="!modoEdicao"
            class="custom-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">Cidade</label>
            <q-input
              v-model="enderecoForm.cidade"
              outlined
              dense
              placeholder="Cidade"
              :disable="!modoEdicao"
              :readonly="!modoEdicao"
              class="custom-input"
            />
          </div>
          <div class="form-group half">
            <label class="form-label">Província</label>
            <q-input
              v-model="enderecoForm.provincia"
              outlined
              dense
              placeholder="Província"
              :disable="!modoEdicao"
              :readonly="!modoEdicao"
              class="custom-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ponto de referência</label>
          <q-input
            v-model="enderecoForm.ponto_referencia"
            outlined
            dense
            placeholder="Ex: Perto do mercado"
            :disable="!modoEdicao"
            :readonly="!modoEdicao"
            class="custom-input"
          />
          <div class="field-hint">
            📍 Um ponto de referência ajuda os prestadores a encontrar você
          </div>
        </div>

        <!-- BOTÕES DE AÇÃO -->
        <div class="form-actions">
          <!-- Botão ATUALIZAR - aparece apenas quando NÃO está em modo edição -->
          <q-btn
            v-if="!modoEdicao"
            unelevated
            label="Atualizar Endereço"
            color="primary"
            @click="ativarModoEdicao"
            class="action-btn update-btn"
          />

          <!-- Botões SALVAR e CANCELAR - aparecem apenas no modo edição -->
          <template v-else>
            <q-btn flat label="Cancelar" @click="cancelarEdicao" class="cancel-btn" />
            <q-btn
              unelevated
              label="Salvar Alterações"
              color="positive"
              @click="salvarEndereco"
              :loading="salvando"
              class="action-btn save-btn"
            />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePerfilStore } from 'src/stores/client/cliente-perfil-store';

defineOptions({ name: 'MobileEndereco' });

const router = useRouter();
const perfilStore = usePerfilStore();
const $q = useQuasar();

// ===================== ESTADOS =====================
const carregando = ref(false);
const salvando = ref(false);
const modoEdicao = ref(false); // false = visualização, true = edição

// ===================== BACKUP DO ENDEREÇO ORIGINAL =====================
const enderecoOriginal = reactive({
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  provincia: '',
  ponto_referencia: '',
});

// ===================== FORMULÁRIO =====================
const enderecoForm = reactive({
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  provincia: '',
  ponto_referencia: '',
});

// ===================== FUNÇÕES =====================
const irParaPerfil = () => {
  void router.push('/mobile/perfil');
};

const carregarEndereco = async () => {
  carregando.value = true;
  try {
    // Busca o perfil do usuário (que contém o endereço)
    const perfil = await perfilStore.fetchPerfil();

    // Se o usuário tiver endereço, carrega os dados
    if (perfil && perfil.endereco) {
      const dados = {
        rua: perfil.endereco.rua || '',
        numero: perfil.endereco.numero || '',
        complemento: perfil.endereco.complemento || '',
        bairro: perfil.endereco.bairro || '',
        cidade: perfil.endereco.cidade || '',
        provincia: perfil.endereco.provincia || '',
        ponto_referencia: perfil.endereco.ponto_referencia || '',
      };

      // Preenche o formulário
      Object.assign(enderecoForm, dados);
      // Faz backup dos dados originais
      Object.assign(enderecoOriginal, dados);
    }
  } catch (error) {
    console.error('Erro ao carregar endereço:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar endereço',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

const ativarModoEdicao = () => {
  modoEdicao.value = true;
};

const cancelarEdicao = () => {
  $q.notify({
    type: 'warning',
    message: '❌ Edição cancelada',
    position: 'top',
  });
  // Restaura os dados originais
  Object.assign(enderecoForm, enderecoOriginal);
  // Desativa modo edição
  modoEdicao.value = false;
};

const salvarEndereco = async () => {
  salvando.value = true;

  try {
    // Atualiza o perfil do usuário com o novo endereço
    await perfilStore.atualizarPerfil({
      endereco: {
        rua: enderecoForm.rua,
        numero: enderecoForm.numero,
        complemento: enderecoForm.complemento,
        bairro: enderecoForm.bairro,
        cidade: enderecoForm.cidade,
        provincia: enderecoForm.provincia,
        ponto_referencia: enderecoForm.ponto_referencia,
      },
    });

    // Atualiza o backup com os novos dados
    Object.assign(enderecoOriginal, enderecoForm);

    $q.notify({
      type: 'positive',
      message: 'Endereço atualizado com sucesso!',
      position: 'top',
    });

    // Desativa modo edição
    modoEdicao.value = false;
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar endereço',
      position: 'top',
    });
  } finally {
    salvando.value = false;
  }
};

onMounted(() => {
  void carregarEndereco();
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;
$positive: #10b981;
$danger: #ef4444;
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;

// ===================== SKELETON =====================
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: $bg;
  min-height: 100vh;
}
.skeleton-header {
  background: $white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border;
}
.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-title {
  width: 120px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.skeleton-line {
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.w-100 {
  width: 100%;
}
.w-50 {
  width: 50%;
}
.w-60 {
  width: 60%;
}
.w-80 {
  width: 80%;
}

// ===================== LAYOUT =====================
.endereco-page {
  background: $bg;
  min-height: 100vh;
}

// ===================== HEADER COM FOTO =====================
.page-header {
  background: $white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .back-btn {
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
      background: rgba($accent, 0.1);
      color: $accent;
    }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }

  // ✅ ESTILOS DA FOTO DE PERFIL
  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    overflow: hidden;
    flex-shrink: 0;

    &:hover {
      transform: scale(1.05);
      opacity: 0.9;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      .avatar-iniciais {
        font-size: 1rem;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
      }
    }
  }
}

// ===================== FORMULÁRIO =====================
.endereco-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 0;

  .form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: $dark;
    margin-bottom: 8px;
  }

  .field-hint {
    font-size: 0.7rem;
    color: $gray;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.form-row {
  display: flex;
  gap: 16px;

  .half {
    flex: 1;
  }
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: $white;
  }

  :deep(.q-field__native) {
    font-size: 0.9rem;
  }

  // Estilo para campos desabilitados (modo visualização)
  :deep(.q-field--disabled) {
    .q-field__control {
      background: $gray-light;
      opacity: 0.8;
    }
    .q-field__native {
      color: $dark;
    }
  }
}

// ===================== BOTÕES =====================
.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;

  .action-btn {
    flex: 1;
    border-radius: 30px;
    padding: 12px;
    font-size: 1rem;
    font-weight: 500;
  }

  .update-btn {
    background: $accent;
    width: 100%;

    &:hover {
      background: darken($accent, 5%);
    }
  }

  .save-btn {
    background: $positive;
    flex: 2;

    &:hover {
      background: darken($positive, 5%);
    }
  }

  .cancel-btn {
    flex: 1;
    border-radius: 30px;
    background: $gray-light;
    color: $gray;

    &:hover {
      background: rgba($danger, 0.1);
      color: $danger;
    }
  }
}
</style>
