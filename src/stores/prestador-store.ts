import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar, type QNotifyCreateOptions } from 'quasar';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';

// Tipos
interface DisponibilidadeDia {
  ativo: boolean;
  horario: string;
}

interface Disponibilidade {
  segunda: DisponibilidadeDia;
  terca: DisponibilidadeDia;
  quarta: DisponibilidadeDia;
  quinta: DisponibilidadeDia;
  sexta: DisponibilidadeDia;
  sabado: DisponibilidadeDia;
  domingo: DisponibilidadeDia;
}

interface PrestadorRegisterFormData {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  endereco: string;
  foto: File | null;
  descricao: string;
  categorias: string[];
  portfolio: (File | null)[];
  raio: number | null;
  disponibilidade: Disponibilidade;
  documento: File | null;
  tipo: string;
  profissao: string;
  sobre: string;
}

export const usePrestadorRegisterStore = defineStore('prestadorRegister', () => {
  const $q = useQuasar();

  const form = ref<PrestadorRegisterFormData>({
    nome: '',
    telefone: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    foto: null,
    descricao: '',
    categorias: [],
    portfolio: [null, null, null],
    raio: null,
    disponibilidade: {
      segunda: { ativo: false, horario: '' },
      terca: { ativo: false, horario: '' },
      quarta: { ativo: false, horario: '' },
      quinta: { ativo: false, horario: '' },
      sexta: { ativo: false, horario: '' },
      sabado: { ativo: false, horario: '' },
      domingo: { ativo: false, horario: '' },
    },
    documento: null,
    tipo: 'prestador',
    profissao: '',
    sobre: '',
  });

  const currentStep = ref(1);
  const loading = ref(false);
  const acceptTerms = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const photoPreview = ref<string | null>(null);
  const portfolioPreviews = ref<(string | null)[]>([null, null, null]);
  const totalSteps = ref(5);

  const progressWidth = computed(() => {
    return (currentStep.value / totalSteps.value) * 100;
  });

  const passwordStrength = computed(() => {
    const pwd = form.value.password;
    if (!pwd) return { strength: 0, class: 'weak', text: 'Fraca' };

    let strength = 0;
    if (pwd.length >= 6) strength += 25;
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

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateCurrentStep(): boolean {
    switch (currentStep.value) {
      case 1: {
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
        if (!form.value.password) {
          showNotification('warning', 'Preencha a palavra-passe');
          return false;
        }
        if (form.value.password.length < 6) {
          showNotification('warning', 'A palavra-passe deve ter pelo menos 6 caracteres');
          return false;
        }
        if (form.value.password !== form.value.confirmPassword) {
          showNotification('warning', 'As palavras-passe não coincidem');
          return false;
        }
        break;
      }

      case 2: {
        if (!form.value.foto) {
          showNotification('warning', 'Adicione uma foto de perfil');
          return false;
        }
        if (!form.value.descricao?.trim()) {
          showNotification('warning', 'Preencha a descrição do seu trabalho');
          return false;
        }
        if (form.value.categorias.length === 0) {
          showNotification('warning', 'Selecione pelo menos uma categoria');
          return false;
        }
        break;
      }

      case 3: {
        const portfolioCompleto = form.value.portfolio.every((item) => item !== null);
        if (!portfolioCompleto) {
          showNotification('warning', 'Adicione as 3 fotos do portfólio');
          return false;
        }
        break;
      }

      case 4: {
        if (!form.value.raio) {
          showNotification('warning', 'Selecione o raio de atuação');
          return false;
        }
        break;
      }

      case 5: {
        if (!acceptTerms.value) {
          showNotification('warning', 'Aceite os termos para continuar');
          return false;
        }
        break;
      }
    }
    return true;
  }

  function handleFileUpload(file: File | null) {
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = ['.jpg', '.jpeg', '.png'] as readonly string[];

    if (!acceptedTypes.includes(fileExtension)) {
      showNotification('negative', 'Formato de imagem não suportado. Use JPG ou PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('negative', 'A imagem deve ter no máximo 5MB');
      return;
    }

    form.value.foto = file;
    photoPreview.value = URL.createObjectURL(file);
  }

  function handlePortfolioUpload(file: File | null, index: number) {
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = ['.jpg', '.jpeg', '.png'] as readonly string[];

    if (!acceptedTypes.includes(fileExtension)) {
      showNotification('negative', 'Formato de imagem não suportado. Use JPG ou PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('negative', 'A imagem deve ter no máximo 5MB');
      return;
    }

    form.value.portfolio[index] = file;
    portfolioPreviews.value[index] = URL.createObjectURL(file);
  }

  function removePhoto() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    form.value.foto = null;
    photoPreview.value = null;
  }

  function removePortfolioPhoto(index: number) {
    if (portfolioPreviews.value[index]) {
      URL.revokeObjectURL(portfolioPreviews.value[index]);
    }
    form.value.portfolio[index] = null;
    portfolioPreviews.value[index] = null;
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
      formData.append('descricao', form.value.descricao);
      formData.append('categorias', JSON.stringify(form.value.categorias));
      formData.append('raio', String(form.value.raio));
      formData.append('disponibilidade', JSON.stringify(form.value.disponibilidade));

      if (form.value.foto) {
        formData.append('foto', form.value.foto);
      }

      form.value.portfolio.forEach((file, i) => {
        if (file) {
          formData.append(`portfolio[${i}]`, file);
        }
      });

      if (form.value.documento) {
        formData.append('documento', form.value.documento);
      }

      // USANDO O ENDPOINT CORRETO
      const response = await api.post(PRESTADOR_ENDPOINTS.REGISTER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  function resetForm() {
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    portfolioPreviews.value.forEach((preview) => {
      if (preview) URL.revokeObjectURL(preview);
    });

    form.value = {
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      endereco: '',
      foto: null,
      descricao: '',
      categorias: [],
      portfolio: [null, null, null],
      raio: null,
      disponibilidade: {
        segunda: { ativo: false, horario: '' },
        terca: { ativo: false, horario: '' },
        quarta: { ativo: false, horario: '' },
        quinta: { ativo: false, horario: '' },
        sexta: { ativo: false, horario: '' },
        sabado: { ativo: false, horario: '' },
        domingo: { ativo: false, horario: '' },
      },
      documento: null,
      tipo: 'prestador',
      profissao: '',
      sobre: '',
    };
    currentStep.value = 1;
    acceptTerms.value = false;
    photoPreview.value = null;
    portfolioPreviews.value = [null, null, null];
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
    portfolioPreviews,
    totalSteps,
    progressWidth,
    passwordStrength,
    validateCurrentStep,
    handleFileUpload,
    handlePortfolioUpload,
    removePhoto,
    removePortfolioPhoto,
    register,
    resetForm,
    showNotification,
  };
});
