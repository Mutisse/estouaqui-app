<template>
  <div class="ea-register-form">
    <!-- Step 1: Dados Pessoais -->
    <div v-show="currentStep === 1">
      <div class="step-title">Dados Pessoais</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Nome Completo</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="person" size="18px" />
          </span>
          <q-input
            v-model="formData.nome"
            outlined
            dense
            placeholder="Seu nome completo"
            class="ea-input-field"
            dark
            color="white"
            :error="hasError('nome')"
            :error-message="getErrorMessage('nome')"
            @update:model-value="clearError('nome')"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <div class="ea-input-group">
            <label class="ea-input-label">Telefone</label>
            <div class="ea-input-wrapper">
              <span class="ea-input-icon">
                <q-icon name="phone" size="18px" />
              </span>
              <q-input
                v-model="formData.telefone"
                outlined
                dense
                placeholder="84 123 4567"
                class="ea-input-field"
                dark
                color="white"
                :error="hasError('telefone')"
                :error-message="getErrorMessage('telefone')"
                @update:model-value="clearError('telefone')"
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="ea-input-group">
            <label class="ea-input-label">Email</label>
            <div class="ea-input-wrapper">
              <span class="ea-input-icon">
                <q-icon name="email" size="18px" />
              </span>
              <q-input
                v-model="formData.email"
                type="email"
                outlined
                dense
                placeholder="seu@email.com"
                class="ea-input-field"
                dark
                color="white"
                :error="hasError('email')"
                :error-message="getErrorMessage('email')"
                @update:model-value="clearError('email')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Segurança -->
    <div v-show="currentStep === 2">
      <div class="step-title">Segurança</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Palavra-passe</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="lock" size="18px" />
          </span>
          <q-input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="Mínimo 6 caracteres"
            class="ea-input-field"
            dark
            color="white"
            :error="hasError('password')"
            :error-message="getErrorMessage('password')"
            @update:model-value="clearError('password')"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>
        <div class="password-strength" v-if="formData.password">
          <div class="strength-bar" :class="passwordStrength.class"></div>
          <div class="strength-text">{{ passwordStrength.text }}</div>
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Confirmar Palavra-passe</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="lock" size="18px" />
          </span>
          <q-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="Digite novamente"
            class="ea-input-field"
            dark
            color="white"
            :error="hasError('confirmPassword')"
            :error-message="getErrorMessage('confirmPassword')"
            @update:model-value="clearError('confirmPassword')"
          >
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Step 3: Perfil -->
    <div v-show="currentStep === 3">
      <div class="step-title">Localização e Perfil</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Endereço Principal</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="location_on" size="18px" />
          </span>
          <q-input
            v-model="formData.endereco"
            outlined
            dense
            placeholder="Seu endereço principal"
            class="ea-input-field"
            dark
            color="white"
          />
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label"
          >Foto de Perfil <span class="optional">(opcional)</span></label
        >
        <div class="photo-upload-area" @click="triggerFileInput">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            style="display: none"
          />
          <div class="photo-preview" v-if="photoPreview">
            <img v-if="photoPreview" :src="photoPreview" alt="Preview" />
            <q-btn
              flat
              round
              dense
              icon="close"
              size="sm"
              class="remove-photo"
              @click.stop="removePhoto"
            />
          </div>
          <div class="photo-placeholder" v-else>
            <q-icon name="camera_alt" size="32px" />
            <div class="placeholder-text">Clique para adicionar foto</div>
          </div>
        </div>
        <div v-if="hasError('foto')" class="error-message">
          {{ getErrorMessage('foto') }}
        </div>
      </div>
    </div>

    <!-- Step 4: Revisão -->
    <div v-show="currentStep === 4">
      <div class="step-title">Revise seus dados</div>

      <div class="review-card">
        <div class="review-item">
          <div class="review-label">Nome</div>
          <div class="review-value">{{ formData.nome || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Telefone</div>
          <div class="review-value">{{ formData.telefone || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Email</div>
          <div class="review-value">{{ formData.email || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Endereço</div>
          <div class="review-value">{{ formData.endereco || '—' }}</div>
        </div>
      </div>

      <div class="terms-checkbox">
        <q-checkbox
          v-model="acceptTerms"
          label="Li e aceito os Termos de Uso"
          color="primary"
          dark
          :error="hasError('terms')"
        />
        <div v-if="hasError('terms')" class="error-message">
          {{ getErrorMessage('terms') }}
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="row justify-between q-mt-lg">
      <q-btn
        v-if="currentStep > 1"
        flat
        class="nav-btn prev-btn"
        label="Voltar"
        icon="arrow_back"
        @click="prevStep"
        no-caps
      />
      <div v-else></div>

      <q-btn
        v-if="currentStep < 4"
        class="nav-btn next-btn"
        label="Continuar"
        icon="arrow_forward"
        @click="nextStep"
        no-caps
      />
      <q-btn
        v-else
        class="register-btn"
        label="Criar Conta"
        :loading="loading"
        @click="handleRegister"
        no-caps
      />
    </div>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <span>Passo {{ currentStep }} de 4</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteRegisterStore } from 'src/stores/client/cliente-register-store';

defineOptions({ name: 'RegisterClienteForm' });

const router = useRouter();
const $q = useQuasar();
const registerStore = useClienteRegisterStore();

// Estados locais do componente
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const confirmPassword = ref('');

// Bindings para a store
const loading = computed(() => registerStore.loading);
const currentStep = computed(() => registerStore.currentStep);
const acceptTerms = computed({
  get: () => registerStore.acceptTerms,
  set: (value) => (registerStore.acceptTerms = value),
});
const formData = computed({
  get: () => registerStore.formData,
  set: (value) => registerStore.updateFormData(value),
});
const photoPreview = computed(() => registerStore.photoPreview);
const passwordStrength = computed(() => registerStore.passwordStrength);
const validationErrors = computed(() => registerStore.validationErrors);

// Helper para erros
const hasError = (field: string): boolean => {
  return validationErrors.value.some(err => err.field === field);
};

const getErrorMessage = (field: string): string => {
  return validationErrors.value.find(err => err.field === field)?.message || '';
};

const clearError = (field: string): void => {
  // Remove erro específico do campo
  const index = registerStore.validationErrors.findIndex(err => err.field === field);
  if (index !== -1) {
    registerStore.validationErrors.splice(index, 1);
  }
};

// Sincroniza confirmPassword com validação
watch(confirmPassword, (newVal) => {
  if (newVal !== formData.value.password) {
    if (!validationErrors.value.some(err => err.field === 'confirmPassword')) {
      registerStore.validationErrors.push({
        field: 'confirmPassword',
        message: 'As palavras-passe não coincidem',
      });
    }
  } else {
    const index = registerStore.validationErrors.findIndex(err => err.field === 'confirmPassword');
    if (index !== -1) {
      registerStore.validationErrors.splice(index, 1);
    }
  }
});

// Navegação
const nextStep = (): void => {
  const success = registerStore.nextStep();
  if (!success) {
    // Mostra o primeiro erro de validação
    const firstError = validationErrors.value[0];
    if (firstError) {
      $q.notify({
        type: 'warning',
        message: firstError.message,
        position: 'top',
      });
    }
  }
};

const prevStep = (): void => {
  registerStore.prevStep();
};

// Upload de foto
const triggerFileInput = (): void => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const success = registerStore.uploadPhoto(file);
    if (!success) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage('foto'),
        position: 'top',
      });
    }
  }
};

const removePhoto = (): void => {
  registerStore.removePhoto();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Registro
const handleRegister = async (): Promise<void> => {
  const result = await registerStore.registerCliente();

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: result.message || 'Registo efetuado com sucesso!',
      position: 'top',
      icon: 'check_circle',
    });

    // Reseta o formulário
    registerStore.resetForm();
    confirmPassword.value = '';

    // Redireciona após 1.5 segundos
    setTimeout(() => {
      void router.push('/');
    }, 1500);
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao registar. Tente novamente.',
      position: 'top',
    });
  }
};
</script>

<style scoped lang="scss">
$accent: #5b4bf5;

.ea-register-form {
  width: 100%;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 24px;
  text-align: center;
}

.step-indicator {
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.ea-input-group {
  margin-bottom: 20px;
}

.ea-input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;

  .optional {
    font-weight: normal;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }
}

.ea-input-wrapper {
  position: relative;
}

.ea-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $accent;
  z-index: 3;
  pointer-events: none;
}

.ea-input-field {
  :deep(.q-field__control) {
    background: transparent !important;
    border-radius: 14px;
    min-height: 48px;
    padding-left: 44px;

    &::before {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.q-field__control--filled) {
    background: transparent !important;
  }

  :deep(.q-field__control--dirty) {
    background: transparent !important;
  }

  :deep(.q-field__control--focused) {
    background: transparent !important;
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field--focused .q-field__control::before) {
    border-color: $accent !important;
  }

  :deep(.q-field__native) {
    color: #fff;
    padding-left: 0;
  }

  :deep(.q-field__native::placeholder) {
    color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field__append) {
    position: absolute;
    right: 8px;
  }

  :deep(.q-field--outlined .q-field__control) {
    background: transparent !important;
  }
}

.password-strength {
  margin-top: 8px;

  .strength-bar {
    height: 3px;
    border-radius: 2px;
    transition: all 0.3s;

    &.weak {
      width: 25%;
      background: #f56565;
    }
    &.fair {
      width: 50%;
      background: #fbbf24;
    }
    &.good {
      width: 75%;
      background: #48bb78;
    }
    &.strong {
      width: 100%;
      background: #38a169;
    }
  }

  .strength-text {
    font-size: 0.7rem;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.photo-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $accent;
    background: rgba(255, 255, 255, 0.05);
  }

  .photo-preview {
    position: relative;
    display: inline-block;

    img {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #fff;
      color: #666;
    }
  }

  .photo-placeholder {
    .placeholder-text {
      margin-top: 8px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.error-message {
  font-size: 0.75rem;
  color: #f56565;
  margin-top: 4px;
}

.review-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;

  .review-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .review-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .review-value {
      font-weight: 500;
      color: #fff;
    }
  }
}

.terms-checkbox {
  margin-top: 20px;
}

.nav-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 100px;
  font-weight: 600;

  &.prev-btn {
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  &.next-btn {
    background: $accent;
    color: #fff;

    &:hover {
      background: lighten($accent, 6%);
      transform: translateY(-2px);
    }
  }
}

.register-btn {
  background: $accent;
  color: #fff;
  min-width: 140px;
  padding: 10px 20px;
  border-radius: 100px;
  font-weight: 600;

  &:hover {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
  }
}
</style>
