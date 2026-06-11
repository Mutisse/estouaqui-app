import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';

// ===================== INTERFACES =====================

export interface ConfiguracoesGerais {
  nome_sistema: string;
  logo: string;
  favicon: string;
  email_contato: string;
  telefone_contato: string;
  whatsapp_contato: string;
  endereco: string;
  manutencao: boolean;
  mensagem_manutencao: string;
  tempo_sessao: number;
  max_tentativas_login: number;
  registro_automatico: boolean;
  verificacao_email: boolean;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  smtp_host: string;
  smtp_porta: number;
  smtp_usuario: string;
  smtp_senha: string;
  smtp_criptografia: 'tls' | 'ssl' | 'none';
  comissao: number;
  valor_minimo_saque: number;
  pagamento_automatico: boolean;
  moeda: string;
  fuso_horario: string;
  limite_pedidos_por_dia: number;
  tempo_cancelamento_pedido: number;
  nota_minima_avaliacao?: number;
  nota_maxima_avaliacao?: number;
}

export interface ConfiguracoesPrestador {
  raios_atendimento: number[];
  raio_padrao: number;
  distancia_maxima: number;
  dias_semana: Array<{ label: string; value: string }>;
  disponibilidade_padrao: {
    inicio: string;
    fim: string;
    intervalo: number;
  };
  documentos_aceitos: Array<{ label: string; value: string; extensions?: string[] }>;
  max_file_size: number;
  max_portfolio_photos: number;
  min_portfolio_photos: number;
  precisa_aprovacao: boolean;
  tempo_resposta_maximo: number;
  comissao_especial: number;
  bonus_avaliacao: number;
  tempo_minimo_servico: number;
}

export interface ConfiguracoesPagamento {
  mpesa_numero: string;
  mpesa_chave: string;
  mpesa_ativo: boolean;
  visa_ativo: boolean;
  mastercard_ativo: boolean;
  paypal_email: string;
  paypal_ativo: boolean;
  transferencia_ativo: boolean;
  deposito_ativo: boolean;
  parcelamento_maximo: number;
  juros_parcelamento: number;
}

export interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  modulo: string;
  roles: string[];
}

export interface Role {
  id: number;
  nome: string;
  descricao: string;
  permissoes: number[];
}

export interface OpcaoSelect {
  label: string;
  value: string | number;
}

// ===================== STORE =====================

export const useAdminConfiguracoesStore = defineStore('adminConfiguracoes', () => {
  // Estados
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const configuracoesGerais = ref<ConfiguracoesGerais>({
    nome_sistema: 'Estou Aqui',
    logo: '',
    favicon: '',
    email_contato: '',
    telefone_contato: '',
    whatsapp_contato: '',
    endereco: '',
    manutencao: false,
    mensagem_manutencao: 'Sistema em manutenção. Voltaremos em breve!',
    tempo_sessao: 120,
    max_tentativas_login: 5,
    registro_automatico: true,
    verificacao_email: true,
    notificacoes_email: true,
    notificacoes_push: true,
    smtp_host: '',
    smtp_porta: 587,
    smtp_usuario: '',
    smtp_senha: '',
    smtp_criptografia: 'tls',
    comissao: 10,
    valor_minimo_saque: 500,
    pagamento_automatico: false,
    moeda: 'MZN',
    fuso_horario: 'Africa/Maputo',
    limite_pedidos_por_dia: 10,
    tempo_cancelamento_pedido: 30,
    nota_minima_avaliacao: 1,
    nota_maxima_avaliacao: 5,
  });

  const configuracoesPrestador = ref<ConfiguracoesPrestador>({
    raios_atendimento: [],
    raio_padrao: 15,
    distancia_maxima: 50,
    dias_semana: [],
    disponibilidade_padrao: {
      inicio: '08:00',
      fim: '18:00',
      intervalo: 60,
    },
    documentos_aceitos: [],
    max_file_size: 5,
    max_portfolio_photos: 10,
    min_portfolio_photos: 3,
    precisa_aprovacao: true,
    tempo_resposta_maximo: 24,
    comissao_especial: 0,
    bonus_avaliacao: 5,
    tempo_minimo_servico: 30,
  });

  const configuracoesPagamento = ref<ConfiguracoesPagamento>({
    mpesa_numero: '',
    mpesa_chave: '',
    mpesa_ativo: true,
    visa_ativo: true,
    mastercard_ativo: true,
    paypal_email: '',
    paypal_ativo: false,
    transferencia_ativo: true,
    deposito_ativo: true,
    parcelamento_maximo: 3,
    juros_parcelamento: 2.5,
  });

  const permissoes = ref<Permissao[]>([]);
  const roles = ref<Role[]>([]);
  const opcoesModulos = ref<OpcaoSelect[]>([]);
  const opcoesRaios = ref<OpcaoSelect[]>([]);
  const opcoesDiasSemana = ref<OpcaoSelect[]>([]);
  const opcoesDocumentos = ref<OpcaoSelect[]>([]);
  const opcoesFusoHorario = ref<OpcaoSelect[]>([]);
  const opcoesMoeda = ref<OpcaoSelect[]>([]);
  const opcoesCriptografia = ref<OpcaoSelect[]>([]);

  // ===================== AÇÕES OTIMIZADAS =====================

  // UMA ÚNICA REQUISIÇÃO para carregar TUDO
  const recarregarDados = async (): Promise<void> => {
    isLoading.value = true;

    try {
      const response = await api.get('/admin/configuracoes/todas', { timeout: 30000 });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;

        // Configurações gerais
        if (data.configuracoes_gerais) {
          configuracoesGerais.value = { ...configuracoesGerais.value, ...data.configuracoes_gerais };
        }

        // Configurações de prestador
        if (data.configuracoes_prestador) {
          configuracoesPrestador.value = { ...configuracoesPrestador.value, ...data.configuracoes_prestador };
        }

        // Configurações de pagamento
        if (data.configuracoes_pagamento) {
          configuracoesPagamento.value = { ...configuracoesPagamento.value, ...data.configuracoes_pagamento };
        }

        // Opções para selects
        if (data.opcoes) {
          opcoesRaios.value = data.opcoes.raios || [];
          opcoesDiasSemana.value = data.opcoes.dias_semana || [];
          opcoesDocumentos.value = data.opcoes.documentos || [];
          opcoesFusoHorario.value = data.opcoes.fuso_horario || [];
          opcoesMoeda.value = data.opcoes.moeda || [];
          opcoesCriptografia.value = data.opcoes.criptografia || [];
          opcoesModulos.value = data.opcoes.modulos || [];
        }

        // Permissões
        if (data.permissoes) {
          permissoes.value = data.permissoes;
        }

        // Roles
        if (data.roles) {
          roles.value = data.roles;
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      error.value = (err as Error).message || 'Erro ao carregar dados';
    } finally {
      isLoading.value = false;
    }
  };

  // Métodos de salvamento
  const salvarConfiguracoesGerais = async (): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put('/admin/configuracoes/gerais', configuracoesGerais.value, { timeout: 30000 });
      return response.data?.success === true;
    } catch (err) {
      console.error('Erro ao salvar configurações gerais:', err);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const salvarConfiguracoesPrestador = async (): Promise<boolean> => {
    isSaving.value = true;
    try {
      const payload = {
        ...configuracoesPrestador.value,
        dias_semana: configuracoesPrestador.value.dias_semana.map(d => d.value),
        documentos_aceitos: configuracoesPrestador.value.documentos_aceitos.map(d => d.value),
      };
      const response = await api.put('/admin/configuracoes/prestador', payload, { timeout: 30000 });
      return response.data?.success === true;
    } catch (err) {
      console.error('Erro ao salvar configurações de prestador:', err);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const salvarConfiguracoesPagamento = async (): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put('/admin/configuracoes/pagamento', configuracoesPagamento.value, { timeout: 30000 });
      return response.data?.success === true;
    } catch (err) {
      console.error('Erro ao salvar configurações de pagamento:', err);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const alternarPermissao = async (permissaoId: number, role: string, ativar: boolean): Promise<boolean> => {
    try {
      const response = await api.put(`/admin/permissoes/${permissaoId}`, {
        role: role,
        ativar: ativar
      }, { timeout: 15000 });

      if (response.data?.success) {
        // Atualizar localmente
        const permissao = permissoes.value.find(p => p.id === permissaoId);
        if (permissao) {
          if (ativar) {
            if (!permissao.roles.includes(role)) {
              permissao.roles.push(role);
            }
          } else {
            const index = permissao.roles.indexOf(role);
            if (index !== -1) {
              permissao.roles.splice(index, 1);
            }
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao alternar permissão:', err);
      return false;
    }
  };

  const limparStore = (): void => {
    isLoading.value = false;
    isSaving.value = false;
    error.value = null;
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    configuracoesGerais,
    configuracoesPrestador,
    configuracoesPagamento,
    permissoes,
    roles,
    opcoesModulos,
    opcoesRaios,
    opcoesDiasSemana,
    opcoesDocumentos,
    opcoesFusoHorario,
    opcoesMoeda,
    opcoesCriptografia,

    // Ações
    recarregarDados,
    salvarConfiguracoesGerais,
    salvarConfiguracoesPrestador,
    salvarConfiguracoesPagamento,
    alternarPermissao,
    limparStore,
  };
});

export default useAdminConfiguracoesStore;
