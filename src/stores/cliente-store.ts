import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ClienteRegisterFormData,
  ClientePasswordStrength,
  ClienteRegisterResponse,
} from 'src/types/cliente-register.types';
import { CLIENTE_VALIDATION, CLIENTE_STEPS } from 'src/types/cliente-register.types';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

export const useClienteRegisterStore = defineStore('clienteRegister', () => {
  const $q = useQuasar();

  const form = ref<ClienteRegisterFormData>({
    nome: '',
    telefone: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    foto: null,
    tipo: 'cliente',
  });

  const currentStep = ref(1);
  const loading = ref(false);
  const acceptTerms = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const photoPreview = ref<string | null>(null);
  const totalSteps = ref(CLIENTE_STEPS.length);

  const progressWidth = computed(() => {
    return (currentStep.value / totalSteps.value) * 100;
  });

  const passwordStrength = computed((): ClientePasswordStrength => {
    const pwd = form.value.password;
    if (!pwd) return { strength: 0, class: 'weak', text: 'Fraca' };

    let strength = 0;
    if (pwd.length >= CLIENTE_VALIDATION.PASSWORD_MIN_LENGTH) strength += 25;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) strength += 25;

    let strengthClass: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let strengthText = 'Fraca';

    if (strength <= 25) {
      strengthClass = 'weak';
      strengthText = 'Fraca';
    } else if (strength <= 50) {
      strengthClass = 'fair';
      strengthText = 'Razoável';
    } else if (strength <= 75) {
      strengthClass = 'good';
      strengthText = 'Boa';
    } else {
      strengthClass = 'strong';
      strengthText = 'Forte';
    }

    return { strength, class: strengthClass, text: strengthText };
  });

  const isFormValid = computed(() => {
    return (
      form.value.nome &&
      form.value.telefone &&
      form.value.email &&
      form.value.password &&
      form.value.password === form.value.confirmPassword &&
      acceptTerms.value
    );
  });

  function setFormField<K extends keyof ClienteRegisterFormData>(
    field: K,
    value: ClienteRegisterFormData[K],
  ) {
    form.value[field] = value;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (currentStep.value < totalSteps.value) {
      currentStep.value++;
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  function goToStep(step: number) {
    if (step < currentStep.value) {
      currentStep.value = step;
    }
  }

  function validateCurrentStep(): boolean {
    switch (currentStep.value) {
      case 1:
        if (!form.value.nome?.trim()) {
          showNotification('warning', 'Preencha o nome completo');
          return false;
        }
        if (!form.value.telefone?.trim()) {
          showNotification('warning', 'Preencha o telefone');
          return false;
        }
        if (!form.value.email?.trim()) {
          showNotification('warning', 'Preencha o email');
          return false;
        }
        if (!isValidEmail(form.value.email)) {
          showNotification('warning', 'Email inválido');
          return false;
        }
        break;

      case 2:
        if (!form.value.password) {
          showNotification('warning', 'Preencha a palavra-passe');
          return false;
        }
        if (form.value.password.length < CLIENTE_VALIDATION.PASSWORD_MIN_LENGTH) {
          showNotification(
            'warning',
            `A palavra-passe deve ter pelo menos ${CLIENTE_VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
          );
          return false;
        }
        if (form.value.password !== form.value.confirmPassword) {
          showNotification('warning', 'As palavras-passe não coincidem');
          return false;
        }
        break;

      case 3:
        break;

      case 4:
        if (!acceptTerms.value) {
          showNotification('warning', 'Aceite os termos para continuar');
          return false;
        }
        break;
    }
    return true;
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function handleFileUpload(file: File | null) {
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const acceptedTypes = CLIENTE_VALIDATION.PHOTO_ACCEPTED_TYPES as readonly string[];
    if (!acceptedTypes.includes(fileExtension)) {
      showNotification('negative', 'Formato de imagem não suportado. Use JPG ou PNG');
      return;
    }

    if (file.size > CLIENTE_VALIDATION.PHOTO_MAX_SIZE) {
      showNotification('negative', 'A imagem deve ter no máximo 5MB');
      return;
    }

    form.value.foto = file;
    photoPreview.value = URL.createObjectURL(file);
  }

  function removePhoto() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    form.value.foto = null;
    photoPreview.value = null;
  }

  async function register(): Promise<boolean> {
    if (!validateCurrentStep()) return false;

    loading.value = true;
    try {
      const formData = new FormData();

      formData.append('nome', form.value.nome);
      formData.append('telefone', form.value.telefone);
      formData.append('email', form.value.email);
      formData.append('password', form.value.password);
      formData.append('endereco', form.value.endereco || '');
      formData.append('tipo', form.value.tipo);

      if (form.value.foto) {
        formData.append('foto', form.value.foto);
      }

      const response = await api.post<ClienteRegisterResponse>(
        CLIENTE_ENDPOINTS.REGISTER,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.success) {
        showNotification(
          'positive',
          response.data.message || 'Registo efetuado com sucesso!',
          'check_circle',
        );
        resetForm();
        return true;
      } else {
        showNotification('negative', response.data.error || 'Erro ao registar');
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;

      if (err.response) {
        const errorMessage =
          err.response.data?.error || err.response.data?.message || 'Erro no servidor';
        showNotification('negative', errorMessage);
      } else if (err.request) {
        showNotification('negative', 'Erro de conexão. Verifique sua internet.');
      } else {
        showNotification('negative', err.message || 'Erro ao registar');
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // MÉTODOS REMOVIDOS (foram movidos para auth-store)
  // - checkEmailAvailability
  // - checkPhoneAvailability
  // - uploadPhoto
  // - resendVerificationEmail
  // ==========================================

  function resetForm() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }

    form.value = {
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      endereco: '',
      foto: null,
      tipo: 'cliente',
    };
    currentStep.value = 1;
    acceptTerms.value = false;
    photoPreview.value = null;
    showPassword.value = false;
    showConfirmPassword.value = false;
  }

  function showNotification(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    icon?: string,
  ) {
    const options: QNotifyCreateOptions = {
      type,
      message,
      position: 'top',
      timeout: 3000,
    };

    if (icon) {
      options.icon = icon;
    }

    $q.notify(options);
  }

  return {
    form,
    currentStep,
    loading,
    acceptTerms,
    showPassword,
    showConfirmPassword,
    photoPreview,
    totalSteps,
    progressWidth,
    passwordStrength,
    isFormValid,
    setFormField,
    nextStep,
    prevStep,
    goToStep,
    handleFileUpload,
    removePhoto,
    register,
    resetForm,
    showNotification,
  };
});
