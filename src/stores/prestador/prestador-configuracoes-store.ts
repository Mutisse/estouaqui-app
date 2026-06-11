// src/stores/prestador/prestador-configuracoes-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface ConfiguracoesData {
  notificacoes_push: boolean;
  notificacoes_sms: boolean;
  notificacoes_email: boolean;
  aceitar_automatico: boolean;
  modo_nao_perturbe: boolean;
  perfil_publico: boolean;
  mostrar_localizacao: boolean;
  mpesa_configurado: boolean;
  mpesa_numero?: string | null;
  mpesa_nome?: string | null;
  conta_configurada: boolean;
  conta_banco?: string | null;
  conta_numero?: string | null;
  conta_titular?: string | null;
  idioma: string;
}

export interface DisponibilidadeConfigData {
  tempo_minimo_agendamento: number;
  tempo_entre_servicos: number;
  notificar_antes: number;
  aceitar_agendamento_automatico: boolean;
  dias_antecedencia: number;
}

export interface MpesaData {
  numero: string;
  nome: string;
}

export interface ContaData {
  banco: string;
  numero: string;
  titular: string;
}

// ===================== STORE =====================

export const usePrestadorConfiguracoesStore = defineStore('prestadorConfiguracoes', () => {
  const authStore = useAuthStore();

  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);

  const configuracoes = ref<ConfiguracoesData>({
    notificacoes_push: true,
    notificacoes_sms: false,
    notificacoes_email: true,
    aceitar_automatico: false,
    modo_nao_perturbe: false,
    perfil_publico: true,
    mostrar_localizacao: true,
    mpesa_configurado: false,
    conta_configurada: false,
    idioma: 'pt',
  });

  const mpesaData = ref<MpesaData>({ numero: '', nome: '' });
  const contaData = ref<ContaData>({ banco: '', numero: '', titular: '' });

  const disponibilidadeConfig = ref<DisponibilidadeConfigData>({
    tempo_minimo_agendamento: 60,
    tempo_entre_servicos: 15,
    notificar_antes: 30,
    aceitar_agendamento_automatico: false,
    dias_antecedencia: 30,
  });

  // ===================== GETTERS =====================

  const hasChanges = ref(false);
  const temConfiguracoesSalvas = computed(() => dadosCarregados.value);
  const mpesaEstaConfigurado = computed(() => configuracoes.value.mpesa_configurado);
  const contaEstaConfigurada = computed(() => configuracoes.value.conta_configurada);

  // ===================== AÇÕES =====================

  /**
   * Carrega todas as configurações do prestador
   * GET /api/prestador/preferencias
   */
  const carregarConfiguracoes = async (): Promise<void> => {
    if (!authStore.isPrestador) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/preferencias');

      if (response.data?.success && response.data.data) {
        const prefs = response.data.data;
        configuracoes.value = {
          notificacoes_push: prefs.notificacoes_push ?? true,
          notificacoes_sms: prefs.notificacoes_sms ?? false,
          notificacoes_email: prefs.notificacoes_email ?? true,
          aceitar_automatico: prefs.aceitar_automatico ?? false,
          modo_nao_perturbe: prefs.modo_nao_perturbe ?? false,
          perfil_publico: prefs.perfil_publico ?? true,
          mostrar_localizacao: prefs.mostrar_localizacao ?? true,
          mpesa_configurado: prefs.mpesa_configurado ?? false,
          mpesa_numero: prefs.mpesa_numero ?? null,
          mpesa_nome: prefs.mpesa_nome ?? null,
          conta_configurada: prefs.conta_configurada ?? false,
          conta_banco: prefs.conta_banco ?? null,
          conta_numero: prefs.conta_numero ?? null,
          conta_titular: prefs.conta_titular ?? null,
          idioma: prefs.idioma ?? 'pt',
        };

        if (configuracoes.value.mpesa_numero) {
          mpesaData.value = {
            numero: configuracoes.value.mpesa_numero,
            nome: configuracoes.value.mpesa_nome || '',
          };
        }

        if (configuracoes.value.conta_banco) {
          contaData.value = {
            banco: configuracoes.value.conta_banco,
            numero: configuracoes.value.conta_numero || '',
            titular: configuracoes.value.conta_titular || '',
          };
        }

        dadosCarregados.value = true;
        hasChanges.value = false;
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar configurações';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Salva todas as configurações do prestador
   * PUT /api/prestador/preferencias
   */
  const salvarConfiguracoes = async (): Promise<boolean> => {
    if (!authStore.isPrestador) return false;
    if (!hasChanges.value) return true;

    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put('/prestador/preferencias', {
        notificacoes_push: configuracoes.value.notificacoes_push,
        notificacoes_sms: configuracoes.value.notificacoes_sms,
        notificacoes_email: configuracoes.value.notificacoes_email,
        aceitar_automatico: configuracoes.value.aceitar_automatico,
        modo_nao_perturbe: configuracoes.value.modo_nao_perturbe,
        perfil_publico: configuracoes.value.perfil_publico,
        mostrar_localizacao: configuracoes.value.mostrar_localizacao,
        idioma: configuracoes.value.idioma,
      });

      if (response.data?.success) {
        hasChanges.value = false;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      error.value = (err as AxiosError).message || 'Erro ao salvar configurações';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Salva configuração do M-Pesa
   * PUT /api/prestador/preferencias
   */
  const salvarMpesa = async (data: MpesaData): Promise<boolean> => {
    if (!authStore.isPrestador) return false;

    isSaving.value = true;
    try {
      const response = await api.put('/prestador/preferencias', {
        mpesa_numero: data.numero,
        mpesa_nome: data.nome,
        mpesa_configurado: true,
      });

      if (response.data?.success) {
        configuracoes.value.mpesa_configurado = true;
        configuracoes.value.mpesa_numero = data.numero;
        configuracoes.value.mpesa_nome = data.nome;
        mpesaData.value = { numero: data.numero, nome: data.nome };
        hasChanges.value = true;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao salvar M-Pesa:', err);
      error.value = (err as AxiosError).message || 'Erro ao configurar M-Pesa';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Remove configuração do M-Pesa
   * DELETE /api/prestador/preferencias/mpesa
   */
  const removerMpesa = async (): Promise<boolean> => {
    if (!authStore.isPrestador) return false;

    isSaving.value = true;
    try {
      const response = await api.delete('/prestador/preferencias/mpesa');

      if (response.data?.success) {
        configuracoes.value.mpesa_configurado = false;
        configuracoes.value.mpesa_numero = null;
        configuracoes.value.mpesa_nome = null;
        mpesaData.value = { numero: '', nome: '' };
        hasChanges.value = true;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover M-Pesa:', err);
      error.value = (err as AxiosError).message || 'Erro ao remover M-Pesa';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Salva configuração da conta bancária
   * PUT /api/prestador/preferencias
   */
  const salvarConta = async (data: ContaData): Promise<boolean> => {
    if (!authStore.isPrestador) return false;

    isSaving.value = true;
    try {
      const response = await api.put('/prestador/preferencias', {
        conta_banco: data.banco,
        conta_numero: data.numero,
        conta_titular: data.titular,
        conta_configurada: true,
      });

      if (response.data?.success) {
        configuracoes.value.conta_configurada = true;
        configuracoes.value.conta_banco = data.banco;
        configuracoes.value.conta_numero = data.numero;
        configuracoes.value.conta_titular = data.titular;
        contaData.value = { banco: data.banco, numero: data.numero, titular: data.titular };
        hasChanges.value = true;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
      error.value = (err as AxiosError).message || 'Erro ao configurar conta';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Remove configuração da conta bancária
   * DELETE /api/prestador/preferencias/conta
   */
  const removerConta = async (): Promise<boolean> => {
    if (!authStore.isPrestador) return false;

    isSaving.value = true;
    try {
      const response = await api.delete('/prestador/preferencias/conta');

      if (response.data?.success) {
        configuracoes.value.conta_configurada = false;
        configuracoes.value.conta_banco = null;
        configuracoes.value.conta_numero = null;
        configuracoes.value.conta_titular = null;
        contaData.value = { banco: '', numero: '', titular: '' };
        hasChanges.value = true;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover conta:', err);
      error.value = (err as AxiosError).message || 'Erro ao remover conta';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Exclui permanentemente a conta do prestador
   * DELETE /api/prestador/perfil/conta
   */
  const excluirConta = async (): Promise<boolean> => {
    if (!authStore.isPrestador) return false;

    isSaving.value = true;
    try {
      const response = await api.delete('/prestador/perfil/conta');

      if (response.data?.success) {
        await authStore.logout();
        limparStore();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      error.value = (err as AxiosError).message || 'Erro ao excluir conta';
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Atualiza um campo específico da configuração
   */
  const atualizarConfiguracao = <K extends keyof ConfiguracoesData>(
    campo: K,
    valor: ConfiguracoesData[K]
  ): void => {
    if (configuracoes.value[campo] !== valor) {
      configuracoes.value[campo] = valor;
      hasChanges.value = true;
    }
  };

  /**
   * Reseta o flag de alterações pendentes
   */
  const resetHasChanges = (): void => {
    hasChanges.value = false;
  };

  /**
   * Limpa todos os dados do store
   */
  const limparStore = (): void => {
    configuracoes.value = {
      notificacoes_push: true,
      notificacoes_sms: false,
      notificacoes_email: true,
      aceitar_automatico: false,
      modo_nao_perturbe: false,
      perfil_publico: true,
      mostrar_localizacao: true,
      mpesa_configurado: false,
      conta_configurada: false,
      idioma: 'pt',
    };
    mpesaData.value = { numero: '', nome: '' };
    contaData.value = { banco: '', numero: '', titular: '' };
    disponibilidadeConfig.value = {
      tempo_minimo_agendamento: 60,
      tempo_entre_servicos: 15,
      notificar_antes: 30,
      aceitar_agendamento_automatico: false,
      dias_antecedencia: 30,
    };
    dadosCarregados.value = false;
    hasChanges.value = false;
    error.value = null;
  };

  /**
   * Carrega todos os dados do prestador
   */
  const carregarTodosDados = async (): Promise<void> => {
    await carregarConfiguracoes();
  };

  return {
    // Estados
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    configuracoes,
    mpesaData,
    contaData,
    disponibilidadeConfig,
    hasChanges,

    // Getters
    temConfiguracoesSalvas,
    mpesaEstaConfigurado,
    contaEstaConfigurada,

    // Actions
    carregarConfiguracoes,
    salvarConfiguracoes,
    salvarMpesa,
    removerMpesa,
    salvarConta,
    removerConta,
    excluirConta,
    atualizarConfiguracao,
    resetHasChanges,
    limparStore,
    carregarTodosDados,
  };
});

export default usePrestadorConfiguracoesStore;
