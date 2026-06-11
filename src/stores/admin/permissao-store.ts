// src/stores/admin/permissao-store.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';

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

export const usePermissaoStore = defineStore('permissao', () => {
  // ==================== ESTADO ====================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const permissoes = ref<Permissao[]>([]);
  const roles = ref<Role[]>([]);
  const modulos = ref<string[]>([]);

  // ==================== AÇÕES ====================

  /**
   * Carregar todas as permissões
   */
  const carregarPermissoes = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await api.get('/admin/permissoes');
      if (response.data?.success) {
        permissoes.value = response.data.data;
        // Extrair módulos únicos
        const modulosSet = new Set(permissoes.value.map(p => p.modulo).filter(Boolean));
        modulos.value = Array.from(modulosSet);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Carregar todos os papéis (roles)
   */
  const carregarRoles = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await api.get('/admin/roles');
      if (response.data?.success) {
        roles.value = response.data.data;
      }
    } catch (error) {
      console.error('Erro ao carregar papéis:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Carregar tudo (permissoes + roles)
   */
  const carregarTudo = async (): Promise<void> => {
    await Promise.all([carregarPermissoes(), carregarRoles()]);
  };

  /**
   * Atualizar permissão para um role específico
   */
  const atualizarPermissao = async (permissaoId: number, roleNome: string, ativar: boolean): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put(`/admin/permissoes/${permissaoId}`, {
        role: roleNome,
        ativar: ativar
      });
      if (response.data?.success) {
        await carregarPermissoes();
        await carregarRoles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Atualizar papel (role)
   */
  const atualizarRole = async (roleId: number, data: Partial<Role>): Promise<boolean> => {
    isSaving.value = true;
    try {
      const response = await api.put(`/admin/roles/${roleId}`, data);
      if (response.data?.success) {
        await carregarRoles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Verificar se um role tem uma permissão específica
   */
  const roleTemPermissao = (roleNome: string, permissaoNome: string): boolean => {
    const permissao = permissoes.value.find(p => p.nome === permissaoNome);
    if (!permissao) return false;
    return permissao.roles?.includes(roleNome) || false;
  };

  /**
   * Obter permissões agrupadas por módulo
   */
  const getPermissoesPorModulo = (): Record<string, Permissao[]> => {
    const grouped: Record<string, Permissao[]> = {};
    for (const permissao of permissoes.value) {
      const modulo = permissao.modulo || 'Geral';
      if (!grouped[modulo]) {
        grouped[modulo] = [];
      }
      grouped[modulo].push(permissao);
    }
    return grouped;
  };

  /**
   * Obter matriz de permissões (roles x permissoes)
   */
  const getMatrizPermissoes = (): { role: Role; permissoes: Permissao[] }[] => {
    return roles.value.map(role => ({
      role,
      permissoes: permissoes.value.filter(p => p.roles?.includes(role.nome))
    }));
  };

  return {
    // Estado
    isLoading,
    isSaving,
    permissoes,
    roles,
    modulos,
    // Ações
    carregarPermissoes,
    carregarRoles,
    carregarTudo,
    atualizarPermissao,
    atualizarRole,
    // Helpers
    roleTemPermissao,
    getPermissoesPorModulo,
    getMatrizPermissoes,
  };
});
