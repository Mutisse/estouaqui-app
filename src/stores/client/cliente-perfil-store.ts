// stores/client/cliente-perfil-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/login-store';

export interface PerfilUser {
  id: number;
  nome: string;
  telefone: string;
  tipo: 'cliente' | 'prestador';
  foto: string | null;
  email?: string;
  created_at?: string;
  profissao?: string;
  sobre?: string;
  endereco?: Endereco | null;
}

export interface Endereco {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  provincia: string;
  ponto_referencia?: string;
  complemento?: string;
  principal: boolean;
}

export interface UpdatePerfilData {
  nome?: string;
  email?: string;
  telefone?: string;
  profissao?: string;
  sobre?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    provincia?: string;
    ponto_referencia?: string;
  };
}

export interface DashboardData {
  total_pedidos: number;
  avaliacoes_feitas: number;
  favoritos_count: number;
  anos_registro?: number;
  servicos_concluidos?: number;
  avaliacoes_recebidas?: number;
}

export interface Configuracoes {
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  idioma: 'pt' | 'en';
  tema: 'light' | 'dark' | 'system';
}

export const usePerfilStore = defineStore('clientePerfil', () => {
  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const userData = ref<PerfilUser | null>(null);
  const dashboard = ref<DashboardData | null>(null);
  const enderecos = ref<Endereco[]>([]);
  const configuracoes = ref<Configuracoes>({
    notificacoes_email: true,
    notificacoes_push: true,
    idioma: 'pt',
    tema: 'system',
  });

  // ===================== GETTERS =====================
  const nomeCompleto = computed(() => userData.value?.nome || 'Utilizador');

  const iniciaisNome = computed(() => {
    const nome = userData.value?.nome || '';
    if (!nome.trim()) return 'U';
    const partes = nome.trim().split(' ');

    if (partes.length === 1) {
      const primeiraLetra = partes[0]?.charAt(0);
      return primeiraLetra ? primeiraLetra.toUpperCase() : 'U';
    }

    const primeiraLetra = partes[0]?.charAt(0) || '';
    const ultimaParte = partes[partes.length - 1];
    const ultimaLetra = ultimaParte?.charAt(0) || '';

    if (!primeiraLetra && !ultimaLetra) return 'U';
    if (!primeiraLetra) return ultimaLetra.toUpperCase();
    if (!ultimaLetra) return primeiraLetra.toUpperCase();

    return (primeiraLetra + ultimaLetra).toUpperCase();
  });

  const telefoneFormatado = computed(() => {
    const tel = userData.value?.telefone || '';
    if (!tel) return 'Não informado';
    if (tel.length === 9) {
      return tel.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return tel;
  });

  const anosRegistro = computed(() => {
    if (!userData.value?.created_at) return 0;
    const anoRegistro = new Date(userData.value.created_at).getFullYear();
    const anoAtual = new Date().getFullYear();
    return anoAtual - anoRegistro;
  });

  const avatarColor = computed(() => {
    const colors = [
      '#5B4BF5', '#10B981', '#F59E0B', '#EF4444',
      '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
    ];
    const nome = userData.value?.nome || '';
    const index = Math.abs(nome.length) % colors.length;
    return colors[index] || '#5B4BF5';
  });

  const avatarUrl = computed(() => {
    if (userData.value?.foto) return userData.value.foto;
    const nome = encodeURIComponent(nomeCompleto.value);
    const bgColor = avatarColor.value.replace('#', '');
    return `https://ui-avatars.com/api/?background=${bgColor}&color=fff&bold=true&size=80&name=${nome}`;
  });

  // ===================== AÇÕES =====================

  const fetchPerfil = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/perfil');
      if (response.data?.success) {
        userData.value = response.data.data;
        return response.data.data;
      }
      throw new Error('Erro ao carregar perfil');
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDashboard = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/perfil/dashboard');
      if (response.data?.success) {
        dashboard.value = response.data.data;
        return response.data.data;
      }
      throw new Error('Erro ao carregar dashboard');
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllPerfilData = async () => {
    isLoading.value = true;
    try {
      const [perfilRes, dashboardRes, enderecosRes, configRes] = await Promise.all([
        api.get('/perfil').catch(() => ({ data: { success: true, data: null } })),
        api.get('/perfil/dashboard').catch(() => ({ data: { success: true, data: null } })),
        api.get('/perfil/enderecos').catch(() => ({ data: { success: true, data: [] } })),
        api.get('/perfil/configuracoes').catch(() => ({ data: { success: true, data: configuracoes.value } })),
      ]);

      if (perfilRes.data?.success && perfilRes.data.data) userData.value = perfilRes.data.data;
      if (dashboardRes.data?.success && dashboardRes.data.data) dashboard.value = dashboardRes.data.data;
      if (enderecosRes.data?.success) enderecos.value = enderecosRes.data.data;
      if (configRes.data?.success) configuracoes.value = { ...configuracoes.value, ...configRes.data.data };

      return {
        perfil: userData.value,
        dashboard: dashboard.value,
        enderecos: enderecos.value,
        configuracoes: configuracoes.value,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ ATUALIZADO: Aceita endereço
  const atualizarPerfil = async (dados: UpdatePerfilData) => {
    isSaving.value = true;
    try {
      const response = await api.put('/perfil', dados);
      if (response.data?.success && response.data.data) {
        userData.value = { ...userData.value, ...response.data.data } as PerfilUser;
        return response.data.data;
      }
      throw new Error('Erro ao atualizar perfil');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarFoto = async (file: File): Promise<string | null> => {
    isSaving.value = true;
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post('/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('📸 Resposta upload foto:', response.data);

      if (response.data?.success && response.data.data?.foto) {
        const novaFotoUrl = response.data.data.foto;

        if (userData.value) {
          userData.value.foto = novaFotoUrl;
        }

        console.log('✅ Foto atualizada:', novaFotoUrl);
        return novaFotoUrl;
      }

      throw new Error(response.data?.message || 'Erro ao atualizar foto');
    } catch (error) {
      console.error('❌ Erro ao atualizar foto:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const removerFoto = async () => {
    isSaving.value = true;
    try {
      const response = await api.delete('/perfil/foto');
      if (response.data?.success && userData.value) {
        userData.value.foto = null;
        return true;
      }
      throw new Error('Erro ao remover foto');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== ENDEREÇOS =====================

  const fetchEnderecos = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/perfil/enderecos');
      if (response.data?.success) {
        enderecos.value = response.data.data || [];
        return enderecos.value;
      }
      throw new Error('Erro ao carregar endereços');
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const adicionarEndereco = async (endereco: Omit<Endereco, 'id'>) => {
    isSaving.value = true;
    try {
      const response = await api.post('/perfil/enderecos', endereco);
      if (response.data?.success && response.data.data) {
        enderecos.value.push(response.data.data);
        return response.data.data;
      }
      throw new Error('Erro ao adicionar endereço');
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const atualizarEndereco = async (id: number, endereco: Partial<Endereco>) => {
    isSaving.value = true;
    try {
      const response = await api.put(`/perfil/enderecos/${id}`, endereco);
      if (response.data?.success && response.data.data) {
        const index = enderecos.value.findIndex(e => e.id === id);
        if (index !== -1) {
          enderecos.value[index] = { ...enderecos.value[index], ...response.data.data };
        }
        return response.data.data;
      }
      throw new Error('Erro ao atualizar endereço');
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const removerEndereco = async (id: number) => {
    isSaving.value = true;
    try {
      const response = await api.delete(`/perfil/enderecos/${id}`);
      if (response.data?.success) {
        enderecos.value = enderecos.value.filter(e => e.id !== id);
        return true;
      }
      throw new Error('Erro ao remover endereço');
    } catch (error) {
      console.error('Erro ao remover endereço:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const definirEnderecoPrincipal = async (id: number) => {
    isSaving.value = true;
    try {
      const response = await api.put(`/perfil/enderecos/${id}/principal`);
      if (response.data?.success) {
        enderecos.value.forEach(e => {
          e.principal = e.id === id;
        });
        return true;
      }
      throw new Error('Erro ao definir endereço principal');
    } catch (error) {
      console.error('Erro ao definir endereço principal:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  // ===================== CONFIGURAÇÕES =====================

  const fetchConfiguracoes = async () => {
    isLoading.value = true;
    try {
      const response = await api.get('/perfil/configuracoes');
      if (response.data?.success) {
        configuracoes.value = { ...configuracoes.value, ...response.data.data };
        return configuracoes.value;
      }
      throw new Error('Erro ao carregar configurações');
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const atualizarConfiguracoes = async (dados: Partial<Configuracoes>) => {
    isSaving.value = true;
    try {
      const response = await api.put('/perfil/configuracoes', dados);
      if (response.data?.success) {
        configuracoes.value = { ...configuracoes.value, ...response.data.data };
        return configuracoes.value;
      }
      throw new Error('Erro ao atualizar configurações');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const refreshFavoritosCount = async () => {
    try {
      await fetchDashboard();
      return dashboard.value?.favoritos_count || 0;
    } catch (error) {
      console.error('Erro ao atualizar contagem de favoritos:', error);
      return 0;
    }
  };

  const clearPerfilData = () => {
    userData.value = null;
    dashboard.value = null;
    enderecos.value = [];
    configuracoes.value = {
      notificacoes_email: true,
      notificacoes_push: true,
      idioma: 'pt',
      tema: 'system',
    };
    isLoading.value = false;
    isSaving.value = false;
  };

  const logoutAndClear = async () => {
    const authStore = useAuthStore();
    try {
      await authStore.logout();
      clearPerfilData();
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isSaving,
    userData,
    dashboard,
    enderecos,
    configuracoes,
    nomeCompleto,
    iniciaisNome,
    telefoneFormatado,
    anosRegistro,
    avatarColor,
    avatarUrl,
    fetchPerfil,
    fetchDashboard,
    fetchAllPerfilData,
    atualizarPerfil,
    atualizarFoto,
    removerFoto,
    fetchEnderecos,
    adicionarEndereco,
    atualizarEndereco,
    removerEndereco,
    definirEnderecoPrincipal,
    fetchConfiguracoes,
    atualizarConfiguracoes,
    refreshFavoritosCount,
    clearPerfilData,
    logoutAndClear,
  };
});

export default usePerfilStore;
