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
            :rules="[(val: string) => !!val || 'Nome é obrigatório']"
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
                :rules="[(val: string) => !!val || 'Telefone é obrigatório']"
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
                :rules="[(val: string) => !!val || 'Email é obrigatório']"
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
            :rules="[(val: string) => val.length >= 6 || 'Mínimo 6 caracteres']"
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
          <div class="strength-bar" :class="passwordStrengthClass"></div>
          <div class="strength-text">{{ passwordStrengthText }}</div>
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Confirmar Palavra-passe</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="lock" size="18px" />
          </span>
          <q-input
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="Digite novamente"
            class="ea-input-field"
            dark
            color="white"
            :rules="[
              (val: string) => val === formData.password || 'As palavras-passe não coincidem',
            ]"
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
          <div class="photo-preview" v-if="formData.foto">
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
        />
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';
import type { AxiosError } from 'axios';

defineOptions({ name: 'RegisterClienteForm' });

const router = useRouter();
const $q = useQuasar();

// Estados do formulário
const currentStep = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const acceptTerms = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const photoPreview = ref<string | null>(null);

const formData = ref({
  nome: '',
  telefone: '',
  email: '',
  endereco: '',
  password: '',
  confirmPassword: '',
  foto: null as File | null,
});

// Computed para força da palavra-passe
const passwordStrengthClass = computed(() => {
  const pwd = formData.value.password;
  if (!pwd) return '';
  if (pwd.length < 6) return 'weak';
  if (pwd.length < 8) return 'fair';
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
  return 'good';
});

const passwordStrengthText = computed(() => {
  const pwd = formData.value.password;
  if (!pwd) return '';
  if (pwd.length < 6) return 'Fraca';
  if (pwd.length < 8) return 'Razoável';
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'Forte';
  return 'Boa';
});

// Validação do passo atual
const validateStep = (): boolean => {
  switch (currentStep.value) {
    case 1: {
      // ✅ Adicionado bloco com chaves
      if (!formData.value.nome) {
        $q.notify({ type: 'warning', message: 'Preencha o nome completo', position: 'top' });
        return false;
      }
      if (!formData.value.telefone) {
        $q.notify({ type: 'warning', message: 'Preencha o telefone', position: 'top' });
        return false;
      }
      if (!formData.value.email) {
        $q.notify({ type: 'warning', message: 'Preencha o email', position: 'top' });
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.value.email)) {
        $q.notify({ type: 'warning', message: 'Email inválido', position: 'top' });
        return false;
      }
      break;
    }
    case 2: {
      // ✅ Adicionado bloco com chaves
      if (!formData.value.password || formData.value.password.length < 6) {
        $q.notify({
          type: 'warning',
          message: 'Palavra-passe deve ter pelo menos 6 caracteres',
          position: 'top',
        });
        return false;
      }
      if (formData.value.password !== formData.value.confirmPassword) {
        $q.notify({ type: 'warning', message: 'As palavras-passe não coincidem', position: 'top' });
        return false;
      }
      break;
    }
    case 4: {
      // ✅ Adicionado bloco com chaves
      if (!acceptTerms.value) {
        $q.notify({ type: 'warning', message: 'Aceite os termos para continuar', position: 'top' });
        return false;
      }
      break;
    }
  }
  return true;
};

const nextStep = () => {
  if (validateStep()) {
    currentStep.value++;
  }
};

const prevStep = () => {
  currentStep.value--;
};

// Upload de foto
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      $q.notify({ type: 'negative', message: 'Arquivo deve ter no máximo 5MB', position: 'top' });
      return;
    }
    formData.value.foto = file;
    photoPreview.value = URL.createObjectURL(file);
  }
};

const removePhoto = () => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  formData.value.foto = null;
  photoPreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

// Registo
const handleRegister = async () => {
  if (!validateStep()) return;

  loading.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.value.nome);
    formDataToSend.append('telefone', formData.value.telefone);
    formDataToSend.append('email', formData.value.email);
    formDataToSend.append('password', formData.value.password);
    formDataToSend.append('endereco', formData.value.endereco || '');
    formDataToSend.append('tipo', 'cliente');

    if (formData.value.foto) {
      formDataToSend.append('foto', formData.value.foto);
    }

    const response = await api.post(CLIENTE_ENDPOINTS.REGISTER, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message || 'Registo efetuado com sucesso!',
        position: 'top',
        icon: 'check_circle',
      });
      setTimeout(() => {
        void router.push('/');
      }, 1500);
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.error || 'Erro ao registar',
        position: 'top',
      });
    }
  } catch (err) {
    // ✅ Substituído 'any' pelo tipo correto
    const error = err as AxiosError<{ error?: string; message?: string }>;
    console.error('Erro no registo:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || error.message || 'Erro ao registar. Tente novamente.',
      position: 'top',
    });
  } finally {
    loading.value = false;
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
