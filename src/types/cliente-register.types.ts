// Tipos para o formulário de registro de cliente
export interface ClienteRegisterFormData {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  endereco: string;
  foto: File | null;
  tipo: 'cliente'; // Fixed as 'cliente'
}

// Interface para os passos do formulário de cliente
export interface ClienteRegisterStep {
  number: number;
  label: string;
}

// Interface para validação de cada passo do cliente
export interface ClienteStepValidation {
  validateDadosPessoais: (form: ClienteRegisterFormData) => boolean;
  validateSeguranca: (form: ClienteRegisterFormData) => boolean;
  validateLocalizacaoPerfil: (form: ClienteRegisterFormData) => boolean;
  validateRevisao: (form: ClienteRegisterFormData, acceptTerms: boolean) => boolean;
}

// Enum para os passos do cliente
export enum ClienteStepNumber {
  DADOS_PESSOAIS = 1,
  SEGURANCA = 2,
  LOCALIZACAO_PERFIL = 3,
  REVISAO = 4,
}

// Interface para o estado da senha do cliente
export interface ClientePasswordStrength {
  strength: number;
  class: 'weak' | 'fair' | 'good' | 'strong';
  text: string;
}

// Interface para as opções de notificação específicas do cliente
export interface ClienteNotificationOptions {
  type: 'positive' | 'negative' | 'warning' | 'info';
  message: string;
  position: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  icon?: string;
}

// Interface para resposta do registro de cliente
export interface ClienteRegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
  error?: string;
}

// Interface para o preview da foto do cliente
export interface ClientePhotoPreview {
  file: File | null;
  previewUrl: string | null;
}

// Constantes para validação do cliente
export const CLIENTE_VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  PHOTO_ACCEPTED_TYPES: ['.jpg', '.jpeg', '.png'],
  PHONE_MASK: '## ### ####',
  PHONE_PREFIX: '+258',
} as const;

// Constantes para os steps do cliente
export const CLIENTE_STEPS: ClienteRegisterStep[] = [
  { number: ClienteStepNumber.DADOS_PESSOAIS, label: 'Dados' },
  { number: ClienteStepNumber.SEGURANCA, label: 'Segurança' },
  { number: ClienteStepNumber.LOCALIZACAO_PERFIL, label: 'Perfil' },
  { number: ClienteStepNumber.REVISAO, label: 'Revisão' },
];
