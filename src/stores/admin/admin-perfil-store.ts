import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

export interface PerfilAdmin {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  foto: string | null;
  tipo: 'root' | 'admin' | 'prestador' | 'cliente';
  verificado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Atividade {
  id: number;
  descricao: string;
  tipo: 'login' | 'atualizacao' | 'criacao' | 'exclusao';
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface AlterarSenhaData {
  senha_atual: string;
  nova_senha: string;
  nova_senha_confirmation: string;
}

export interface AtualizarPerfilData {
  nome: string;
  email: string;
  telefone?: string;
}

export const useAdminPerfilStore = defineStore('adminPerfil', () => {
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const isSavingSenha = ref(false);
  const error = ref<string | null>(null);
  const perfil = ref<PerfilAdmin | null>(null);
  const atividades = ref<Atividade[]>([]);

  const carregarPerfil = async (): Promise<PerfilAdmin | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: PerfilAdmin }>('/admin/perfil');
      if (response.data?.success) {
        perfil.value = response.data.data;

        if (authStore.user) {
          authStore.user.nome = response.data.data.nome;
          authStore.user.email = response.data.data.email;
          authStore.user.telefone = response.data.data.telefone || '';
          authStore.user.foto = response.data.data.foto || '';
          localStorage.setItem('auth_user', JSON.stringify(authStore.user));
        }

        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar perfil';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const carregarAtividades = async (): Promise<Atividade[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: Atividade[] }>('/admin/atividades');
      if (response.data?.success) {
        atividades.value = response.data.data;
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar atividades';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const atualizarPerfil = async (data: AtualizarPerfilData): Promise<PerfilAdmin | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const response = await api.put<{ success: boolean; data: PerfilAdmin }>('/admin/perfil', data);
      if (response.data?.success) {
        perfil.value = response.data.data;

        if (authStore.user) {
          authStore.user.nome = response.data.data.nome;
          authStore.user.email = response.data.data.email;
          authStore.user.telefone = response.data.data.telefone || '';
          localStorage.setItem('auth_user', JSON.stringify(authStore.user));
        }

        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar perfil';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const alterarSenha = async (data: AlterarSenhaData): Promise<boolean> => {
    isSavingSenha.value = true;
    error.value = null;

    try {
      const response = await api.put<{ success: boolean; message: string }>('/admin/perfil/senha', {
        senha_atual: data.senha_atual,
        nova_senha: data.nova_senha,
        nova_senha_confirmation: data.nova_senha_confirmation,
      });

      return response.data?.success || false;
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      error.value = (err as AxiosError).message || 'Erro ao alterar senha';
      return false;
    } finally {
      isSavingSenha.value = false;
    }
  };

  const atualizarFoto = async (file: File): Promise<string | null> => {
    isSaving.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post<{ success: boolean; foto: string }>('/admin/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && perfil.value) {
        perfil.value.foto = response.data.foto;

        if (authStore.user) {
          authStore.user.foto = response.data.foto;
          localStorage.setItem('auth_user', JSON.stringify(authStore.user));
        }

        return response.data.foto;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      error.value = (err as AxiosError).message || 'Erro ao atualizar foto';
      return null;
    } finally {
      isSaving.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    await Promise.all([
      carregarPerfil(),
      carregarAtividades(),
    ]);
  };

  const limparStore = (): void => {
    perfil.value = null;
    atividades.value = [];
    error.value = null;
  };

  return {
    isLoading,
    isSaving,
    isSavingSenha,
    error,
    perfil,
    atividades,
    carregarPerfil,
    carregarAtividades,
    atualizarPerfil,
    alterarSenha,
    atualizarFoto,
    recarregarDados,
    limparStore,
  };
});

export default useAdminPerfilStore;
