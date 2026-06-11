<template>
  <div class="permissoes-page">
    <!-- Cabeçalho -->
    <div class="page-header">
      <div>
      
        <p class="page-subtitle">Gerencie permissões e papéis de acesso do sistema</p>
      </div>
      <div class="header-actions">
        <q-btn
          flat
          round
          :loading="isLoading"
          @click="recarregar"
          icon="refresh"
        >
          <q-tooltip>Recarregar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="tabAtual" class="custom-tabs" dense>
      <q-tab name="permissoes" label="Permissões" />
      <q-tab name="roles" label="Papéis (Roles)" />
      <q-tab name="matriz" label="Matriz de Permissões" />
    </q-tabs>

    <q-separator />

    <!-- Conteúdo das Tabs -->
    <q-tab-panels v-model="tabAtual" animated>
      <!-- ==================== TAB: PERMISSÕES (ACCORDION) ==================== -->
      <q-tab-panel name="permissoes" class="q-pa-none q-pt-md">
        <q-list class="modulos-list" v-if="!isLoading">
          <q-expansion-item
            v-for="(perms, modulo) in permissoesPorModulo"
            :key="modulo"
            expand-icon="expand_more"
            default-closed
            class="modulo-expansion-item"
          >
            <template v-slot:header>
              <div class="modulo-expansion-header">
                <div class="modulo-icon">
                  <i class="material-icons">{{ getModuloIcon(modulo) }}</i>
                </div>
                <div class="modulo-info">
                  <div class="modulo-title">{{ modulo }}</div>
                  <div class="modulo-count">{{ perms.length }} permissões</div>
                </div>
              </div>
            </template>

            <div class="permissoes-grid">
              <div v-for="permissao in perms" :key="permissao.id" class="permissao-card">
                <div class="permissao-header">
                  <div class="permissao-icon" :class="getPermissaoIconClass(permissao.nome)">
                    <i class="material-icons">{{ getPermissaoIcon(permissao.nome) }}</i>
                  </div>
                  <div class="permissao-info">
                    <div class="permissao-nome">{{ formatarNomePermissao(permissao.nome) }}</div>
                    <div class="permissao-descricao">{{ permissao.descricao || '—' }}</div>
                  </div>
                </div>
                <div class="permissao-roles">
                  <span class="roles-label">Papéis com acesso:</span>
                  <div class="roles-chips">
                    <q-chip
                      v-for="roleName in permissao.roles"
                      :key="roleName"
                      size="sm"
                      :color="getRoleColor(roleName)"
                      text-color="white"
                    >
                      {{ roleName }}
                    </q-chip>
                    <span v-if="!permissao.roles?.length" class="no-roles">
                      Nenhum papel tem esta permissão
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-list>

        <!-- Loading skeleton -->
        <div v-else class="skeleton-container">
          <div v-for="i in 4" :key="i" class="skeleton-modulo">
            <div class="skeleton-header"></div>
          </div>
        </div>
      </q-tab-panel>

      <!-- ==================== TAB: ROLES ==================== -->
      <q-tab-panel name="roles" class="q-pa-none q-pt-md">
        <div v-if="isLoading" class="skeleton-roles">
          <div v-for="i in 4" :key="i" class="skeleton-role-card"></div>
        </div>
        <div v-else class="roles-grid">
          <div v-for="role in rolesList" :key="role.id" class="role-card">
            <div class="role-header">
              <div class="role-avatar" :class="getRoleColorClass(role.nome)">
                <i class="material-icons">{{ getRoleIcon(role.nome) }}</i>
              </div>
              <div class="role-info">
                <div class="role-nome">{{ role.nome }}</div>
                <div class="role-descricao">{{ role.descricao || '—' }}</div>
              </div>
              <q-btn flat round dense icon="edit" @click="editarRole(role)">
                <q-tooltip>Editar papel</q-tooltip>
              </q-btn>
            </div>
            <div class="role-permissoes">
              <span class="perm-label">Permissões ({{ role.permissoes?.length || 0 }})</span>
              <div class="perm-chips">
                <q-chip
                  v-for="permId in role.permissoes"
                  :key="permId"
                  size="sm"
                  outline
                  :label="getPermissaoNomePorId(permId)"
                />
                <span v-if="!role.permissoes?.length" class="no-perms">
                  Nenhuma permissão atribuída
                </span>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- ==================== TAB: MATRIZ ==================== -->
      <q-tab-panel name="matriz" class="q-pa-none q-pt-md">
        <div class="matriz-container">
          <div class="matriz-scroll">
            <table class="matriz-table">
              <thead>
                <tr>
                  <th class="fixed-col">Permissão</th>
                  <th v-for="role in rolesList" :key="role.id" class="role-col">
                    <div class="role-header-cell">
                      <div class="role-avatar-small" :class="getRoleColorClass(role.nome)">
                        {{ role.nome.charAt(0).toUpperCase() }}
                      </div>
                      <span>{{ role.nome }}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="permissao in permissoesList" :key="permissao.id">
                  <td class="fixed-col">
                    <div class="permissao-cell">
                      <div class="perm-nome">{{ formatarNomePermissao(permissao.nome) }}</div>
                      <div class="perm-modulo">{{ permissao.modulo }}</div>
                    </div>
                  </td>
                  <td v-for="role in rolesList" :key="role.id" class="role-cell">
                    <q-checkbox
                      :model-value="getValorMatriz(permissao.id, role.nome)"
                      @update:model-value="togglePermissao(permissao.id, role.nome, $event)"
                      :disable="isSaving"
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Modal Editar Role -->
    <q-dialog v-model="editarRoleDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Editar Papel</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="roleEdit.nome"
            label="Nome do Papel"
            dense
            outlined
            :disable="roleEdit.nome === 'root' || roleEdit.nome === 'admin'"
          />
          <q-input
            v-model="roleEdit.descricao"
            label="Descrição"
            dense
            outlined
            class="q-mt-md"
          />

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Permissões</div>
            <div class="permissoes-tree">
              <div v-for="(perms, modulo) in permissoesPorModulo" :key="modulo" class="modulo-group">
                <div class="modulo-label">{{ modulo }}</div>
                <div class="perm-list">
                  <q-checkbox
                    v-for="perm in perms"
                    :key="perm.id"
                    :model-value="roleEdit.permissoes?.includes(perm.id)"
                    @update:model-value="togglePermissaoNoModal(perm.id)"
                    :label="formatarNomePermissao(perm.nome)"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Salvar" color="primary" @click="salvarRole" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePermissaoStore, type Role } from 'src/stores/admin/permissao-store';

defineOptions({ name: 'PermissoesPage' });

const $q = useQuasar();
const permissaoStore = usePermissaoStore();

// ==================== ESTADO LOCAL ====================
const tabAtual = ref('permissoes');
const editarRoleDialog = ref(false);
const isSaving = ref(false);

const roleEdit = ref<Role>({
  id: 0,
  nome: '',
  descricao: '',
  permissoes: []
});

const matrizPermissoes = ref<Record<number, Record<string, boolean>>>({});

// ==================== COMPUTED ====================
const isLoading = computed(() => permissaoStore.isLoading);
const permissoesList = computed(() => permissaoStore.permissoes);
const rolesList = computed(() => permissaoStore.roles);
const permissoesPorModulo = computed(() => permissaoStore.getPermissoesPorModulo());

// ==================== MÉTODOS ====================
const recarregar = async (): Promise<void> => {
  await permissaoStore.carregarTudo();
  inicializarMatriz();
};

const inicializarMatriz = (): void => {
  const matriz: Record<number, Record<string, boolean>> = {};
  for (const permissao of permissoesList.value) {
    const permissaoId = permissao.id;
    matriz[permissaoId] = {};
    for (const role of rolesList.value) {
      if (matriz[permissaoId]) {
        matriz[permissaoId][role.nome] = permissao.roles?.includes(role.nome) || false;
      }
    }
  }
  matrizPermissoes.value = matriz;
};

const getValorMatriz = (permissaoId: number, roleNome: string): boolean => {
  return matrizPermissoes.value[permissaoId]?.[roleNome] || false;
};

const togglePermissao = async (permissaoId: number, roleNome: string, ativar: boolean): Promise<void> => {
  isSaving.value = true;

  if (!matrizPermissoes.value[permissaoId]) {
    matrizPermissoes.value[permissaoId] = {};
  }
  matrizPermissoes.value[permissaoId][roleNome] = ativar;

  const success = await permissaoStore.atualizarPermissao(permissaoId, roleNome, ativar);

  if (success) {
    $q.notify({
      type: 'positive',
      message: ativar ? 'Permissão concedida' : 'Permissão removida',
      timeout: 2000
    });
  } else {
    if (matrizPermissoes.value[permissaoId]) {
      matrizPermissoes.value[permissaoId][roleNome] = !ativar;
    }
    $q.notify({ type: 'negative', message: 'Erro ao atualizar permissão' });
  }
  isSaving.value = false;
};

const togglePermissaoNoModal = (permissaoId: number): void => {
  if (!roleEdit.value.permissoes) {
    roleEdit.value.permissoes = [];
  }
  const index = roleEdit.value.permissoes.indexOf(permissaoId);
  if (index === -1) {
    roleEdit.value.permissoes.push(permissaoId);
  } else {
    roleEdit.value.permissoes.splice(index, 1);
  }
};

const editarRole = (role: Role): void => {
  roleEdit.value = {
    ...role,
    permissoes: [...(role.permissoes || [])]
  };
  editarRoleDialog.value = true;
};

const salvarRole = async (): Promise<void> => {
  isSaving.value = true;
  const success = await permissaoStore.atualizarRole(roleEdit.value.id, {
    nome: roleEdit.value.nome,
    descricao: roleEdit.value.descricao,
    permissoes: roleEdit.value.permissoes
  });
  if (success) {
    editarRoleDialog.value = false;
    inicializarMatriz();
    $q.notify({ type: 'positive', message: 'Papel atualizado com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar papel' });
  }
  isSaving.value = false;
};

const getPermissaoNomePorId = (id: number): string => {
  const permissao = permissoesList.value.find(p => p.id === id);
  return permissao ? formatarNomePermissao(permissao.nome) : `ID ${id}`;
};

const formatarNomePermissao = (nome: string): string => {
  const nomes: Record<string, string> = {
    ver_usuarios: 'Ver Usuários',
    criar_usuarios: 'Criar Usuários',
    editar_usuarios: 'Editar Usuários',
    excluir_usuarios: 'Excluir Usuários',
    ver_pedidos: 'Ver Pedidos',
    editar_pedidos: 'Editar Pedidos',
    ver_prestadores: 'Ver Prestadores',
    editar_prestadores: 'Editar Prestadores',
    ver_avaliacoes: 'Ver Avaliações',
    editar_avaliacoes: 'Editar Avaliações',
    ver_financeiro: 'Ver Financeiro',
    editar_financeiro: 'Editar Financeiro',
    ver_relatorios: 'Ver Relatórios',
    editar_configuracoes: 'Editar Configurações',
    ver_logs: 'Ver Logs',
    gerenciar_permissoes: 'Gerenciar Permissões'
  };
  return nomes[nome] || nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getModuloIcon = (modulo: string): string => {
  const icons: Record<string, string> = {
    Usuários: 'group',
    Pedidos: 'shopping_cart',
    Prestadores: 'handyman',
    Avaliações: 'star',
    Financeiro: 'payments',
    Relatórios: 'bar_chart',
    Configurações: 'settings',
    Logs: 'history',
    Permissões: 'security'
  };
  return icons[modulo] || 'folder';
};

const getPermissaoIcon = (nome: string): string => {
  if (nome.includes('ver')) return 'visibility';
  if (nome.includes('criar')) return 'add';
  if (nome.includes('editar')) return 'edit';
  if (nome.includes('excluir')) return 'delete';
  return 'lock';
};

const getPermissaoIconClass = (nome: string): string => {
  return 'icon-' + (nome.split('_')[0] || 'default');
};

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    root: 'negative',
    admin: 'primary',
    gestor: 'warning',
    prestador: 'positive',
    cliente: 'info'
  };
  return colors[role] || 'grey';
};

const getRoleColorClass = (role: string): string => {
  return `role-${role}`;
};

const getRoleIcon = (role: string): string => {
  const icons: Record<string, string> = {
    root: 'security',
    admin: 'admin_panel_settings',
    gestor: 'manage_accounts',
    prestador: 'handyman',
    cliente: 'person'
  };
  return icons[role] || 'account_circle';
};

// ==================== LIFECYCLE ====================
onMounted(async () => {
  await permissaoStore.carregarTudo();
  inicializarMatriz();
});
</script>

<style scoped lang="scss">
$primary: #667eea;
$primary-light: rgba(102, 126, 234, 0.1);
$green: #10b981;
$green-light: rgba(16, 185, 129, 0.1);
$red: #ef4444;
$red-light: rgba(239, 68, 68, 0.1);
$yellow: #f59e0b;
$yellow-light: rgba(245, 158, 11, 0.1);
$slate: #64748b;
$slate-light: rgba(100, 116, 139, 0.1);
$ink: #1e293b;
$muted: #94a3b8;
$bg: #f8fafc;
$border: #e2e8f0;

.permissoes-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: $ink;
    margin: 0;
  }

  .page-subtitle {
    font-size: 13px;
    color: $muted;
    margin-top: 4px;
  }
}

.custom-tabs {
  .q-tab {
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    min-height: 40px;
  }
}

// ==================== ACCORDION MODULES ====================
.modulos-list {
  width: 100%;
}

.modulo-expansion-item {
  margin-bottom: 12px;
  border: 1px solid $border;
  border-radius: 12px;
  overflow: hidden;

  :deep(.q-expansion-item__toggle-icon) {
    margin-right: 16px;
    color: $primary;
  }

  :deep(.q-expansion-item__header) {
    padding: 0;
  }
}

.modulo-expansion-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  width: 100%;
  cursor: pointer;
  background: white;

  &:hover {
    background: $bg;
  }
}

.modulo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: $primary-light;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    color: $primary;
    font-size: 22px;
  }
}

.modulo-info {
  flex: 1;
}

.modulo-title {
  font-size: 16px;
  font-weight: 600;
  color: $ink;
}

.modulo-count {
  font-size: 11px;
  color: $muted;
}

.permissoes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
  padding: 16px;
  background: $bg;
}

.permissao-card {
  background: white;
  border-radius: 10px;
  border: 1px solid $border;
  padding: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.permissao-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.permissao-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-ver { background: $primary-light; color: $primary; }
  &.icon-criar { background: $green-light; color: $green; }
  &.icon-editar { background: $yellow-light; color: $yellow; }
  &.icon-excluir { background: $red-light; color: $red; }
  &.icon-default { background: $slate-light; color: $slate; }

  i { font-size: 18px; }
}

.permissao-info {
  flex: 1;

  .permissao-nome {
    font-size: 13px;
    font-weight: 600;
    color: $ink;
  }

  .permissao-descricao {
    font-size: 11px;
    color: $muted;
    margin-top: 2px;
  }
}

.permissao-roles {
  .roles-label {
    font-size: 10px;
    color: $muted;
    display: block;
    margin-bottom: 6px;
  }

  .roles-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .no-roles {
    font-size: 11px;
    color: $muted;
    font-style: italic;
  }
}

// Roles Grid
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.role-card {
  background: white;
  border-radius: 12px;
  border: 1px solid $border;
  padding: 16px;

  .role-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .role-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    i { font-size: 22px; color: white; }

    &.role-root { background: linear-gradient(135deg, #ef4444, #b91c1c); }
    &.role-admin { background: linear-gradient(135deg, #667eea, #4c51bf); }
    &.role-gestor { background: linear-gradient(135deg, #f59e0b, #d97706); }
    &.role-prestador { background: linear-gradient(135deg, #10b981, #059669); }
    &.role-cliente { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  }

  .role-info {
    flex: 1;

    .role-nome {
      font-size: 15px;
      font-weight: 600;
      color: $ink;
      text-transform: capitalize;
    }

    .role-descricao {
      font-size: 11px;
      color: $muted;
    }
  }

  .role-permissoes {
    .perm-label {
      font-size: 11px;
      color: $muted;
      display: block;
      margin-bottom: 8px;
    }

    .perm-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .no-perms {
      font-size: 11px;
      color: $muted;
      font-style: italic;
    }
  }
}

// Matriz
.matriz-container {
  overflow-x: auto;
}

.matriz-scroll {
  overflow-x: auto;
}

.matriz-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;

  th, td {
    padding: 10px 8px;
    border-bottom: 1px solid $border;
    text-align: center;
  }

  th {
    background: $bg;
    font-weight: 600;
    font-size: 12px;
    color: $ink;
  }

  .fixed-col {
    text-align: left;
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
  }

  .role-col {
    min-width: 90px;
  }

  .role-header-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .role-avatar-small {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: white;

    &.role-root { background: $red; }
    &.role-admin { background: $primary; }
    &.role-gestor { background: $yellow; }
    &.role-prestador { background: $green; }
    &.role-cliente { background: #3b82f6; }
  }

  .permissao-cell {
    .perm-nome {
      font-size: 12px;
      font-weight: 500;
      color: $ink;
    }
    .perm-modulo {
      font-size: 10px;
      color: $muted;
    }
  }
}

// Modal
.permissoes-tree {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 12px;
}

.modulo-group {
  margin-bottom: 16px;

  .modulo-label {
    font-weight: 600;
    font-size: 12px;
    color: $primary;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid $border;
  }

  .perm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 8px;
  }
}

// Skeletons
.skeleton-container {
  .skeleton-modulo {
    margin-bottom: 16px;
    .skeleton-header {
      height: 60px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
    }
  }
}

.skeleton-roles {
  .skeleton-role-card {
    height: 120px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
    margin-bottom: 16px;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
