<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="register-container">
      <!-- Card de Registo Multi-step -->
      <q-card class="register-card" flat>
        <!-- Header com Step Indicator -->
        <q-card-section class="register-header">
          <div class="header-icon">
            <q-icon name="person_add" size="32px" color="white" />
          </div>
          <div class="header-title">Criar Conta de Cliente</div>
          <div class="header-subtitle">Passo {{ currentStep }} de {{ totalSteps }}</div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
          </div>
        </q-card-section>

        <!-- Step Indicators -->
        <div class="step-indicators">
          <div
            v-for="step in steps"
            :key="step.number"
            class="step-item"
            :class="{
              'active': step.number === currentStep,
              'completed': step.number < currentStep
            }"
            @click="goToStep(step.number)"
          >
            <div class="step-circle">
              <q-icon v-if="step.number < currentStep" name="check" size="16px" />
              <span v-else>{{ step.number }}</span>
            </div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Formulário Multi-step -->
        <q-card-section class="q-px-xl q-py-lg">
          <!-- Step 1: Dados Pessoais -->
          <div v-show="currentStep === 1">
            <div class="step-content">
              <div class="step-title">Dados Pessoais</div>

              <div class="row q-col-gutter-md">
                <!-- Nome Completo -->
                <div class="col-12">
                  <div class="input-label">Nome Completo</div>
                  <q-input
                    v-model="form.nome"
                    placeholder="Seu nome completo"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[val => !!val || 'Nome é obrigatório']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <!-- Telefone e Email -->
                <div class="col-12 col-md-6">
                  <div class="input-label">Número de Telefone</div>
                  <q-input
                    v-model="form.telefone"
                    placeholder="84 123 4567"
                    prefix="+258"
                    mask="## ### ####"
                    unmasked-value
                    outlined
                    dense
                    class="custom-input"
                    :rules="[val => !!val || 'Telefone é obrigatório']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <div class="input-label">Email <span class="optional">(opcional)</span></div>
                  <q-input
                    v-model="form.email"
                    placeholder="seu@email.com"
                    type="email"
                    outlined
                    dense
                    class="custom-input"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Segurança -->
          <div v-show="currentStep === 2">
            <div class="step-content">
              <div class="step-title">Segurança</div>

              <div class="row q-col-gutter-md">
                <!-- Password -->
                <div class="col-12">
                  <div class="input-label">Palavra-passe</div>
                  <q-input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[val => val.length >= 6 || 'Mínimo 6 caracteres']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="grey-6" size="20px" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        color="grey-6"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>
                  <div class="password-strength" v-if="form.password">
                    <div class="strength-bar" :class="passwordStrengthClass"></div>
                    <div class="strength-text">{{ passwordStrengthText }}</div>
                  </div>
                </div>

                <!-- Confirmar Password -->
                <div class="col-12">
                  <div class="input-label">Confirmar Palavra-passe</div>
                  <q-input
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Digite novamente"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[val => val === form.password || 'As palavras-passe não coincidem']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="grey-6" size="20px" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        color="grey-6"
                        @click="showConfirmPassword = !showConfirmPassword"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Localização e Perfil -->
          <div v-show="currentStep === 3">
            <div class="step-content">
              <div class="step-title">Localização e Perfil</div>

              <div class="row q-col-gutter-md">
                <!-- Endereço -->
                <div class="col-12">
                  <div class="input-label">Endereço Principal</div>
                  <q-input
                    v-model="form.endereco"
                    placeholder="Seu endereço principal"
                    outlined
                    dense
                    class="custom-input"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_on" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <!-- Foto de Perfil -->
                <div class="col-12">
                  <div class="input-label">Foto de Perfil <span class="optional">(opcional)</span></div>
                  <div class="photo-upload-area" @click="triggerFileInput">
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      @change="handleFileUpload"
                      style="display: none"
                    />
                    <div class="photo-preview" v-if="form.foto">
                      <!-- CORREÇÃO: Adicionada verificação para photoPreview -->
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
                      <q-icon name="camera_alt" size="48px" color="grey-4" />
                      <div class="placeholder-text">Clique para adicionar foto</div>
                      <div class="placeholder-hint">JPG, PNG até 5MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Revisão -->
          <div v-show="currentStep === 4">
            <div class="step-content">
              <div class="step-title">Revise seus dados</div>

              <div class="review-card">
                <div class="review-section">
                  <div class="review-icon">
                    <q-icon name="person" size="20px" color="primary" />
                  </div>
                  <div class="review-content">
                    <div class="review-label">Nome Completo</div>
                    <div class="review-value">{{ form.nome || '—' }}</div>
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-icon">
                    <q-icon name="phone" size="20px" color="primary" />
                  </div>
                  <div class="review-content">
                    <div class="review-label">Telefone</div>
                    <div class="review-value">{{ form.telefone ? '+258 ' + form.telefone : '—' }}</div>
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-icon">
                    <q-icon name="email" size="20px" color="primary" />
                  </div>
                  <div class="review-content">
                    <div class="review-label">Email</div>
                    <div class="review-value">{{ form.email || 'Não informado' }}</div>
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-icon">
                    <q-icon name="location_on" size="20px" color="primary" />
                  </div>
                  <div class="review-content">
                    <div class="review-label">Endereço</div>
                    <div class="review-value">{{ form.endereco || 'Não informado' }}</div>
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-icon">
                    <q-icon name="photo" size="20px" color="primary" />
                  </div>
                  <div class="review-content">
                    <div class="review-label">Foto de Perfil</div>
                    <div class="review-value">{{ form.foto ? form.foto.name : 'Não informada' }}</div>
                  </div>
                </div>
              </div>

              <div class="terms-checkbox">
                <q-checkbox
                  v-model="acceptTerms"
                  label="Li e aceito os Termos de Uso e Política de Privacidade"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Navigation Buttons -->
        <q-card-section class="q-px-xl q-pb-xl">
          <div class="row justify-between">
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
              v-if="currentStep < totalSteps"
              class="nav-btn next-btn"
              :label="'Continuar'"
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
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RegisterCliente'
})

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Step control
const currentStep = ref(1)
const totalSteps = 4
const steps = [
  { number: 1, label: 'Dados' },
  { number: 2, label: 'Segurança' },
  { number: 3, label: 'Perfil' },
  { number: 4, label: 'Revisão' }
]

// Form state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const acceptTerms = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)

interface FormData {
  nome: string
  telefone: string
  email: string
  password: string
  confirmPassword: string
  endereco: string
  foto: File | null
  tipo: string
}

const form = ref<FormData>({
  nome: '',
  telefone: '',
  email: '',
  password: '',
  confirmPassword: '',
  endereco: '',
  foto: null,
  tipo: 'cliente'
})

// Progress bar
const progressWidth = computed(() => {
  return (currentStep.value / totalSteps) * 100
})

// Password strength
const passwordStrength = computed(() => {
  const pwd = form.value.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 6) strength += 25
  if (pwd.length >= 8) strength += 25
  if (/[A-Z]/.test(pwd)) strength += 25
  if (/[0-9!@#$%^&*]/.test(pwd)) strength += 25
  return strength
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return 'weak'
  if (strength <= 50) return 'fair'
  if (strength <= 75) return 'good'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return 'Fraca'
  if (strength <= 50) return 'Razoável'
  if (strength <= 75) return 'Boa'
  return 'Forte'
})

// Navigation methods
const nextStep = () => {
  if (!validateStep()) return
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const goToStep = (step: number) => {
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

// Validation
const validateStep = () => {
  switch (currentStep.value) {
    case 1:
      if (!form.value.nome || !form.value.telefone) {
        $q.notify({
          type: 'warning',
          message: 'Preencha nome e telefone',
          position: 'top'
        })
        return false
      }
      break
    case 2:
      if (!form.value.password || form.value.password.length < 6) {
        $q.notify({
          type: 'warning',
          message: 'A palavra-passe deve ter pelo menos 6 caracteres',
          position: 'top'
        })
        return false
      }
      if (form.value.password !== form.value.confirmPassword) {
        $q.notify({
          type: 'warning',
          message: 'As palavras-passe não coincidem',
          position: 'top'
        })
        return false
      }
      break
  }
  return true
}

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      $q.notify({
        type: 'negative',
        message: 'A imagem deve ter no máximo 5MB',
        position: 'top'
      })
      return
    }
    form.value.foto = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

const removePhoto = () => {
  form.value.foto = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Registration
const handleRegister = async () => {
  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message: 'Aceite os termos para continuar',
      position: 'top'
    })
    return
  }

  loading.value = true
  try {
    const success = await authStore.register(form.value)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Registo efetuado com sucesso!',
        position: 'top',
        icon: 'check_circle'
      })
      void router.push('/auth/login')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Erro ao registar',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}


</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.register-container {
  width: 100%;
  max-width: 700px;
  padding: 20px;
}

.register-card {
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  background: white;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.15);
  }
}

.register-header {
  background: $purple-gradient;
  padding: 30px 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .header-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 5px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .header-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
}

.progress-container {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 15px;

  .progress-bar {
    height: 100%;
    background: white;
    transition: width 0.3s ease;
  }
}

.step-indicators {
  display: flex;
  padding: 20px 40px;
  background: $gray-50;
  border-bottom: 1px solid $gray-200;

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      right: -30px;
      width: 60px;
      height: 2px;
      background: $gray-300;
    }

    &.completed:not(:last-child)::after {
      background: $purple-primary;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      border: 2px solid $gray-300;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: $gray-600;
      margin-bottom: 8px;
      transition: all 0.3s ease;
    }

    &.active .step-circle {
      border-color: $purple-primary;
      background: $purple-primary;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    &.completed .step-circle {
      border-color: $purple-primary;
      background: $purple-primary;
      color: white;
    }

    .step-label {
      font-size: 0.8rem;
      color: $gray-600;
      font-weight: 500;
    }

    &.active .step-label {
      color: $purple-primary;
      font-weight: 600;
    }
  }
}

.step-content {
  min-height: 350px;

  .step-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 2px solid $gray-200;
  }
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: $gray-700;
  margin-bottom: 5px;

  .optional {
    color: $gray-500;
    font-weight: normal;
    font-size: 0.8rem;
  }
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 15px;
    border: 1px solid $gray-200;
    transition: all 0.3s ease;

    &:hover {
      border-color: $purple-primary;
    }
  }

  :deep(.q-field__control:focus-within) {
    border-color: $purple-primary;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  :deep(.q-field__prepend) {
    padding-right: 10px;
  }
}

.password-strength {
  margin-top: 5px;

  .strength-bar {
    height: 4px;
    border-radius: 2px;
    transition: all 0.3s ease;

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
    font-size: 0.8rem;
    color: $gray-600;
    margin-top: 2px;
  }
}

.photo-upload-area {
  border: 2px dashed $gray-300;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: $purple-primary;
    background: rgba(102, 126, 234, 0.05);
  }

  .photo-preview {
    position: relative;
    display: inline-block;

    img {
      width: 120px;
      height: 120px;
      border-radius: 15px;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);

      &:hover {
        background: $gray-100;
      }
    }
  }

  .photo-placeholder {
    .placeholder-text {
      margin-top: 10px;
      color: $gray-600;
      font-weight: 500;
    }

    .placeholder-hint {
      font-size: 0.8rem;
      color: $gray-500;
      margin-top: 5px;
    }
  }
}

.review-card {
  background: $gray-50;
  border-radius: 20px;
  padding: 20px;

  .review-section {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid $gray-200;

    &:last-child {
      border-bottom: none;
    }

    .review-icon {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .review-content {
      flex: 1;

      .review-label {
        font-size: 0.8rem;
        color: $gray-500;
        margin-bottom: 2px;
      }

      .review-value {
        font-size: 1rem;
        font-weight: 500;
        color: $gray-800;
      }
    }
  }
}

.terms-checkbox {
  margin-top: 20px;

  :deep(.q-checkbox__label) {
    font-size: 0.9rem;
    color: $gray-600;
  }
}

.nav-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;

  &.prev-btn {
    color: $gray-600;
    border: 2px solid $gray-300;

    &:hover {
      border-color: $purple-primary;
      color: $purple-primary;
    }
  }

  &.next-btn {
    background: $purple-gradient;
    color: white;
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
    }
  }
}

.register-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  background: $purple-gradient;
  color: white;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 599px) {
  .register-header {
    padding: 20px;

    .header-title {
      font-size: 1.5rem;
    }
  }

  .step-indicators {
    padding: 15px;

    .step-item {
      .step-circle {
        width: 30px;
        height: 30px;
        font-size: 0.9rem;
      }

      .step-label {
        font-size: 0.7rem;
      }

      &:not(:last-child)::after {
        width: 30px;
        right: -15px;
      }
    }
  }

  .q-card-section {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
</style>
