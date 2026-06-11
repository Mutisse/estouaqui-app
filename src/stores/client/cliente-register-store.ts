// src/stores/client/cliente-register-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

// ========== TIPOS ==========
export interface ClienteRegisterData {
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
  password: string;
  confirmPassword?: string; // Adicionado para validação
  foto?: File | null;
}

export interface ClienteRegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PasswordStrength {
  class: 'weak' | 'fair' | 'good' | 'strong' | '';
  text: string;
  score: number;
}

// Tipo para resposta da API
interface ApiRegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
}

// ========== STORE ==========
export const useClienteRegisterStore = defineStore('clienteRegister', () => {
  // ========== STATE ==========
  const loading = ref(false);
  const currentStep = ref(1);
  const acceptTerms = ref(false);
  const registerSuccess = ref(false);
  const validationErrors = ref<ValidationError[]>([]);

  // Dados do formulário
  const formData = ref<ClienteRegisterData>({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    password: '',
    confirmPassword: '',
    foto: null,
  });

  // Estado para preview da foto
  const photoPreview = ref<string | null>(null);

  // ========== GETTERS ==========
  const isFormValid = computed((): boolean => {
    // Validação básica para todos os campos obrigatórios
    const hasBasicData = !!(
      formData.value.nome &&
      formData.value.telefone &&
      formData.value.email &&
      formData.value.password
    );

    const hasValidPassword = formData.value.password.length >= 6;
    const hasValidConfirm = formData.value.password === formData.value.confirmPassword;
    const hasTermsAccepted = acceptTerms.value;

    return hasBasicData && hasValidPassword && hasValidConfirm && hasTermsAccepted;
  });

  const isStepValid = computed((): Record<number, boolean> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return {
      1: !!(
        formData.value.nome &&
        formData.value.telefone &&
        formData.value.email &&
        emailRegex.test(formData.value.email)
      ),
      2: !!(
        formData.value.password.length >= 6 &&
        formData.value.password === formData.value.confirmPassword
      ),
      3: true, // Endereço e foto são opcionais
      4: acceptTerms.value,
    };
  });

  const passwordStrength = computed((): PasswordStrength => {
    const pwd = formData.value.password;
    if (!pwd) return { class: '', text: '', score: 0 };

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { class: 'weak', text: 'Fraca', score };
    if (score === 3) return { class: 'fair', text: 'Razoável', score };
    if (score === 4) return { class: 'good', text: 'Boa', score };
    return { class: 'strong', text: 'Forte', score };
  });

  // ========== ACTIONS ==========

  /**
   * Valida o passo atual do formulário
   */
  const validateStep = (step: number): boolean => {
    validationErrors.value = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (step) {
      case 1: {
        if (!formData.value.nome) {
          validationErrors.value.push({ field: 'nome', message: 'Nome é obrigatório' });
          return false;
        }
        if (!formData.value.telefone) {
          validationErrors.value.push({ field: 'telefone', message: 'Telefone é obrigatório' });
          return false;
        }
        if (!formData.value.email) {
          validationErrors.value.push({ field: 'email', message: 'Email é obrigatório' });
          return false;
        }
        if (!emailRegex.test(formData.value.email)) {
          validationErrors.value.push({ field: 'email', message: 'Email inválido' });
          return false;
        }
        break;
      }

      case 2: {
        if (!formData.value.password || formData.value.password.length < 6) {
          validationErrors.value.push({
            field: 'password',
            message: 'Palavra-passe deve ter pelo menos 6 caracteres',
          });
          return false;
        }
        if (formData.value.password !== formData.value.confirmPassword) {
          validationErrors.value.push({
            field: 'confirmPassword',
            message: 'As palavras-passe não coincidem',
          });
          return false;
        }
        break;
      }

      case 4: {
        if (!acceptTerms.value) {
          validationErrors.value.push({
            field: 'terms',
            message: 'Aceite os termos para continuar',
          });
          return false;
        }
        break;
      }

      default: {
        break;
      }
    }

    return true;
  };

  /**
   * Avança para o próximo passo
   */
  const nextStep = (): boolean => {
    if (validateStep(currentStep.value)) {
      if (currentStep.value < 4) {
        currentStep.value++;
        return true;
      }
    }
    return false;
  };

  /**
   * Volta para o passo anterior
   */
  const prevStep = (): void => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  /**
   * Define o passo atual
   */
  const setStep = (step: number): void => {
    if (step >= 1 && step <= 4) {
      currentStep.value = step;
    }
  };

  /**
   * Processa upload da foto
   */
  const uploadPhoto = (file: File): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      validationErrors.value.push({
        field: 'foto',
        message: 'Arquivo deve ter no máximo 5MB',
      });
      return false;
    }

    formData.value.foto = file;

    // Limpa preview antigo
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }

    photoPreview.value = URL.createObjectURL(file);
    return true;
  };

  /**
   * Remove a foto atual
   */
  const removePhoto = (): void => {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    formData.value.foto = null;
    photoPreview.value = null;
  };

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (data: Partial<ClienteRegisterData>): void => {
    formData.value = { ...formData.value, ...data };
  };

  /**
   * Atualiza campo específico
   */
  const updateField = <K extends keyof ClienteRegisterData>(
    field: K,
    value: ClienteRegisterData[K],
  ): void => {
    formData.value[field] = value;
  };

  /**
   * Reseta o formulário
   */
  const resetForm = (): void => {
    formData.value = {
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      password: '',
      confirmPassword: '',
      foto: null,
    };
    photoPreview.value = null;
    currentStep.value = 1;
    acceptTerms.value = false;
    registerSuccess.value = false;
    validationErrors.value = [];
  };

  /**
   * Endpoint: Registro de cliente
   * POST /api/clientes/register
   */
  // src/stores/client/cliente-register-store.ts

  const registerCliente = async (): Promise<ClienteRegisterResponse> => {
    // Valida último passo
    if (!validateStep(4)) {
      return {
        success: false,
        error: validationErrors.value[0]?.message || 'Validação falhou',
      };
    }

    loading.value = true;
    registerSuccess.value = false;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.value.nome);
      formDataToSend.append('telefone', formData.value.telefone);
      formDataToSend.append('email', formData.value.email);
      formDataToSend.append('password', formData.value.password);

     

      if (formData.value.endereco) {
        formDataToSend.append('endereco', formData.value.endereco);
      }

      if (formData.value.foto) {
        formDataToSend.append('foto', formData.value.foto);
      }

      // Usar mesma rota /auth/register (backend detecta automaticamente)
      const response = await api.post<ApiRegisterResponse>(
        '/auth/register', // mesma rota!
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (response.data.success) {
        registerSuccess.value = true;

        const result: ClienteRegisterResponse = {
          success: true,
          message: response.data.message || 'Registo efetuado com sucesso!',
        };

        if (response.data.data) {
          result.data = response.data.data;
        }

        return result;
      } else {
        return {
          success: false,
          error: response.data.error || 'Erro ao registar',
        };
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      console.error('Erro no registo:', axiosError);

      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Erro ao registar. Tente novamente.',
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Verifica se email já existe (opcional - endpoint de validação)
   * GET /api/clientes/check-email?email=...
   */
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await api.get<{ exists: boolean }>(
        `/clientes/check-email?email=${encodeURIComponent(email)}`,
      );
      return response.data.exists;
    } catch {
      return false;
    }
  };

  /**
   * Verifica se telefone já existe (opcional - endpoint de validação)
   * GET /api/clientes/check-telefone?telefone=...
   */
  const checkTelefoneExists = async (telefone: string): Promise<boolean> => {
    try {
      const response = await api.get<{ exists: boolean }>(
        `/clientes/check-telefone?telefone=${encodeURIComponent(telefone)}`,
      );
      return response.data.exists;
    } catch {
      return false;
    }
  };

  return {
    // State
    loading,
    currentStep,
    acceptTerms,
    registerSuccess,
    validationErrors,
    formData,
    photoPreview,

    // Getters
    isFormValid,
    isStepValid,
    passwordStrength,

    // Actions
    validateStep,
    nextStep,
    prevStep,
    setStep,
    uploadPhoto,
    removePhoto,
    updateFormData,
    updateField,
    resetForm,
    registerCliente,
    checkEmailExists,
    checkTelefoneExists,
  };
});
