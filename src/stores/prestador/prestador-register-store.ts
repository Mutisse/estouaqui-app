import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

export interface ValidationError {
  field: string;
  message: string;
}

export interface DisponibilidadeItem {
  ativo: boolean;
  horario: string;
}

export interface FormData {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  descricao: string;
  categorias: number[];
  raio: number | null;
  documento: File | null;
}

export interface PasswordStrength {
  class: string;
  text: string;
}

export interface PrestadorRegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: number;
      nome: string;
      email: string;
      tipo: string;
    };
  };
}

interface CategoriaAPI {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
}

export const usePrestadorRegisterStore = defineStore('prestadorRegister', () => {
  // ===================== ESTADOS =====================
  const loading = ref(false);
  const currentStep = ref(1);
  const acceptTerms = ref(false);

  const formData = ref<FormData>({
    nome: '',
    telefone: '',
    email: '',
    password: '',
    confirmPassword: '',
    descricao: '',
    categorias: [],
    raio: null,
    documento: null,
  });

  const fotoPerfil = ref<File | null>(null);
  const fotoPreview = ref<string | null>(null);
  const portfolio = ref<File[]>([
    null as unknown as File,
    null as unknown as File,
    null as unknown as File,
  ]);
  const portfolioPreviews = ref<(string | null)[]>([null, null, null]);

  const disponibilidade = ref<Record<string, DisponibilidadeItem>>({});
  const validationErrors = ref<ValidationError[]>([]);

  // Dados auxiliares - APENAS CATEGORIAS (vêm do backend)
  const categoriasOptions = ref<Array<{ label: string; value: number }>>([]);

  // 🔥 REMOVIDO: raioOptions, diasSemana - AGORA SÃO DEFINIDOS NO COMPONENTE

  const dadosCarregados = ref(false);
  const carregandoCategorias = ref(false);
  const carregandoLocalizacao = ref(false);
  const localizacaoObtida = ref(false);
  const localizacaoData = ref<{ lat: number; lng: number } | null>(null);

  // ===================== GETTERS =====================

  const passwordStrength = computed(() => {
    const password = formData.value.password;

    if (!password) {
      return { class: '', text: '' } as PasswordStrength;
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { class: 'weak', text: 'Muito fraca' },
      1: { class: 'weak', text: 'Fraca' },
      2: { class: 'fair', text: 'Média' },
      3: { class: 'good', text: 'Boa' },
      4: { class: 'strong', text: 'Forte' },
      5: { class: 'strong', text: 'Muito forte' },
    } as const;

    const index = Math.min(Math.floor(strength), 5);
    return strengthMap[index as keyof typeof strengthMap];
  });

  // ===================== VALIDAÇÕES =====================

  const validateStep1 = (): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.value.nome.trim()) {
      errors.push({ field: 'nome', message: 'Nome é obrigatório' });
    } else if (formData.value.nome.length < 3) {
      errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 3 caracteres' });
    }

    if (!formData.value.telefone.trim()) {
      errors.push({ field: 'telefone', message: 'Telefone é obrigatório' });
    } else if (!/^[0-9]{9,12}$/.test(formData.value.telefone.replace(/\D/g, ''))) {
      errors.push({ field: 'telefone', message: 'Telefone inválido' });
    }

    if (!formData.value.email.trim()) {
      errors.push({ field: 'email', message: 'Email é obrigatório' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.push({ field: 'email', message: 'Email inválido' });
    }

    if (!formData.value.password) {
      errors.push({ field: 'password', message: 'Palavra-passe é obrigatória' });
    } else if (formData.value.password.length < 6) {
      errors.push({ field: 'password', message: 'Palavra-passe deve ter pelo menos 6 caracteres' });
    }

    if (formData.value.password !== formData.value.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Palavras-passe não coincidem' });
    }

    validationErrors.value = errors;
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.value.descricao.trim()) {
      errors.push({ field: 'descricao', message: 'Descrição é obrigatória' });
    } else if (formData.value.descricao.length < 20) {
      errors.push({ field: 'descricao', message: 'Descrição deve ter pelo menos 20 caracteres' });
    }

    if (formData.value.categorias.length === 0) {
      errors.push({ field: 'categorias', message: 'Selecione pelo menos uma categoria' });
    }

    validationErrors.value = errors;
    return errors.length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: ValidationError[] = [];
    const validPortfolio = portfolio.value.filter((p) => p !== null);

    if (validPortfolio.length < 3) {
      errors.push({ field: 'portfolio', message: 'Adicione pelo menos 3 fotos ao portfólio' });
    }

    validationErrors.value = errors;
    return errors.length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.value.raio) {
      errors.push({ field: 'raio', message: 'Selecione o raio de atuação' });
    }

    if (!localizacaoObtida.value || !localizacaoData.value) {
      errors.push({
        field: 'localizacao',
        message: 'Defina sua localização (clique em "Obter localização" ou insira manualmente)',
      });
    }

    validationErrors.value = errors;
    return errors.length === 0;
  };

  const validateStep5 = (): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.value.documento) {
      errors.push({ field: 'documento', message: 'Documento de identificação é obrigatório' });
    }

    if (!acceptTerms.value) {
      errors.push({ field: 'terms', message: 'Aceite os Termos de Uso' });
    }

    validationErrors.value = errors;
    return errors.length === 0;
  };

  // ===================== NAVEGAÇÃO =====================

  const nextStep = (): boolean => {
    let isValid = false;

    switch (currentStep.value) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep.value < 5) {
      currentStep.value++;
    }

    return isValid;
  };

  const prevStep = (): void => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  // ===================== DISPONIBILIDADE =====================

  const getDisponibilidadeAtivo = (diaKey: string): boolean => {
    return disponibilidade.value[diaKey]?.ativo || false;
  };

  const setDisponibilidadeAtivo = (diaKey: string, value: boolean): void => {
    if (!disponibilidade.value[diaKey]) {
      disponibilidade.value[diaKey] = { ativo: false, horario: '09:00-18:00' };
    }
    disponibilidade.value[diaKey].ativo = value;
  };

  const getDisponibilidadeHorario = (diaKey: string): string => {
    return disponibilidade.value[diaKey]?.horario || '09:00-18:00';
  };

  const setDisponibilidadeHorario = (diaKey: string, value: string): void => {
    if (!disponibilidade.value[diaKey]) {
      disponibilidade.value[diaKey] = { ativo: false, horario: '09:00-18:00' };
    }
    disponibilidade.value[diaKey].horario = value;
  };

  // ===================== LOCALIZAÇÃO =====================

  const obterLocalizacaoAutomatica = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      carregandoLocalizacao.value = true;

      if (!navigator.geolocation) {
        carregandoLocalizacao.value = false;
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          localizacaoData.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localizacaoObtida.value = true;
          carregandoLocalizacao.value = false;
          resolve(localizacaoData.value);
        },
        (error) => {
          carregandoLocalizacao.value = false;
          localizacaoObtida.value = false;
          reject(new Error('Não foi possível obter sua localização: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  const definirLocalizacaoManual = (lat: number, lng: number): void => {
    localizacaoData.value = { lat, lng };
    localizacaoObtida.value = true;
  };

  const limparLocalizacao = (): void => {
    localizacaoData.value = null;
    localizacaoObtida.value = false;
  };

  // ===================== ENDPOINTS =====================

  const carregarCategorias = async (): Promise<void> => {
    carregandoCategorias.value = true;
    try {
      const response = await api.get('/categorias');

      if (response.data?.success && response.data.data) {
        categoriasOptions.value = response.data.data.map((cat: CategoriaAPI) => ({
          label: cat.nome,
          value: cat.id,
        }));
      } else if (Array.isArray(response.data)) {
        categoriasOptions.value = response.data.map((cat: CategoriaAPI) => ({
          label: cat.nome,
          value: cat.id,
        }));
      } else {
        throw new Error('Resposta da API de categorias inválida');
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      throw new Error('Não foi possível carregar as categorias. Tente novamente.');
    } finally {
      carregandoCategorias.value = false;
    }
  };

  const carregarDadosAuxiliares = async (): Promise<void> => {
    if (dadosCarregados.value) return;

    try {
      await carregarCategorias();
      dadosCarregados.value = true;
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      throw error;
    }
  };

  const getCategoriaNome = (id: number): string => {
    const categoria = categoriasOptions.value.find((c) => c.value === id);
    return categoria?.label || 'Categoria';
  };

  // ===================== UPLOADS =====================

  const uploadFotoPerfil = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Formato inválido. Use JPG ou PNG',
      });
      return false;
    }

    if (file.size > maxSize) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Arquivo muito grande. Máximo 2MB',
      });
      return false;
    }

    fotoPerfil.value = file;
    fotoPreview.value = URL.createObjectURL(file);
    return true;
  };

  const uploadPortfolio = (file: File, index: number): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Formato inválido. Use JPG ou PNG',
      });
      return false;
    }

    if (file.size > maxSize) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Arquivo muito grande. Máximo 2MB',
      });
      return false;
    }

    portfolio.value[index] = file;
    portfolioPreviews.value[index] = URL.createObjectURL(file);
    return true;
  };

  const uploadDocumento = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Formato inválido. Use PDF, JPG ou PNG',
      });
      return false;
    }

    if (file.size > maxSize) {
      validationErrors.value.push({
        field: 'arquivo',
        message: 'Arquivo muito grande. Máximo 5MB',
      });
      return false;
    }

    formData.value.documento = file;
    return true;
  };

  const removerFotoPerfil = (): void => {
    fotoPerfil.value = null;
    if (fotoPreview.value) {
      URL.revokeObjectURL(fotoPreview.value);
      fotoPreview.value = null;
    }
  };

  const removerPortfolio = (index: number): void => {
    portfolio.value[index] = null as unknown as File;
    const previewUrl = portfolioPreviews.value[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      portfolioPreviews.value[index] = null;
    }
  };

  const removerDocumento = (): void => {
    formData.value.documento = null;
  };

  const getDocumentIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'image';
    return 'description';
  };

  // ===================== REGISTO PRINCIPAL =====================

  const registrarPrestador = async (): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => {
    if (
      !validateStep1() ||
      !validateStep2() ||
      !validateStep3() ||
      !validateStep4() ||
      !validateStep5()
    ) {
      return { success: false, error: 'Preencha todos os campos corretamente' };
    }

    loading.value = true;

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('nome', formData.value.nome);
      formDataToSend.append('telefone', formData.value.telefone);
      formDataToSend.append('email', formData.value.email);
      formDataToSend.append('password', formData.value.password);
      formDataToSend.append('password_confirmation', formData.value.confirmPassword);

      formDataToSend.append('sobre', formData.value.descricao);
      formDataToSend.append('categorias', JSON.stringify(formData.value.categorias));
      formDataToSend.append('raio_atendimento', String(formData.value.raio));
      formDataToSend.append('disponibilidade', JSON.stringify(disponibilidade.value));

      if (localizacaoData.value) {
        formDataToSend.append('latitude', String(localizacaoData.value.lat));
        formDataToSend.append('longitude', String(localizacaoData.value.lng));
      }

      if (fotoPerfil.value) {
        formDataToSend.append('foto', fotoPerfil.value);
      }

      const portfolioFiles = portfolio.value.filter((p) => p !== null);
      portfolioFiles.forEach((file) => {
        formDataToSend.append('portfolio[]', file);
      });

      if (formData.value.documento) {
        formDataToSend.append('documento', formData.value.documento);
      }

      const response = await api.post<PrestadorRegisterResponse>('/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return { success: true, message: response.data.message || 'Registo efetuado com sucesso!' };
      }

      return { success: false, error: response.data.message || 'Erro ao registar' };
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;
      console.error('Erro no registo:', axiosError);

      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        return { success: false, error: firstError || 'Erro de validação' };
      }

      return {
        success: false,
        error: axiosError.response?.data?.message || 'Erro ao registar. Tente novamente.',
      };
    } finally {
      loading.value = false;
    }
  };

  // ===================== RESET =====================

  const resetForm = (): void => {
    formData.value = {
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      descricao: '',
      categorias: [],
      raio: null,
      documento: null,
    };

    fotoPerfil.value = null;
    if (fotoPreview.value) {
      URL.revokeObjectURL(fotoPreview.value);
      fotoPreview.value = null;
    }

    portfolio.value = [null as unknown as File, null as unknown as File, null as unknown as File];

    portfolioPreviews.value.forEach((preview) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    portfolioPreviews.value = [null, null, null];

    disponibilidade.value = {};
    currentStep.value = 1;
    acceptTerms.value = false;
    validationErrors.value = [];
    localizacaoObtida.value = false;
    localizacaoData.value = null;
    dadosCarregados.value = false;
  };

  return {
    // Estados
    loading,
    currentStep,
    acceptTerms,
    formData,
    fotoPreview,
    portfolioPreviews,
    passwordStrength,
    validationErrors,
    carregandoCategorias,
    carregandoLocalizacao,
    localizacaoObtida,
    localizacaoData,
    categoriasOptions,
    dadosCarregados,

    // Navegação
    nextStep,
    prevStep,

    // Disponibilidade
    getDisponibilidadeAtivo,
    setDisponibilidadeAtivo,
    getDisponibilidadeHorario,
    setDisponibilidadeHorario,

    // Localização
    obterLocalizacaoAutomatica,
    definirLocalizacaoManual,
    limparLocalizacao,

    // Endpoints
    carregarCategorias,
    carregarDadosAuxiliares,
    getCategoriaNome,

    // Uploads
    uploadFotoPerfil,
    uploadPortfolio,
    uploadDocumento,
    removerFotoPerfil,
    removerPortfolio,
    removerDocumento,
    getDocumentIcon,

    // Registo
    registrarPrestador,

    // Reset
    resetForm,
  };
});

export default usePrestadorRegisterStore;
