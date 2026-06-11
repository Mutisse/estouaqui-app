<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Meu Perfil</h1>
      <div class="header-actions">
        <q-btn flat icon="refresh" label="Atualizar" @click="handleRecarregar" :loading="isLoading" />
      </div>
    </div>

    <div v-if="isLoading && !perfil" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando seu perfil...</p>
    </div>

    <div v-else>
      <div class="profile-grid">
        <!-- Coluna da Foto -->
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <q-avatar size="140px" class="profile-avatar">
              <img :src="fotoPerfil" :alt="userNome" />
            </q-avatar>
            <q-btn
              round
              dense
              color="primary"
              icon="photo_camera"
              size="sm"
              class="change-photo-btn"
              @click="trocarFoto"
              :loading="isSaving"
            />
          </div>
          <div class="avatar-info">
            <h3>{{ userNome }}</h3>
            <p class="user-role">
              <q-badge :color="userTipo === 'root' ? 'red' : 'primary'">
                {{ getTipoLabel(userTipo) }}
              </q-badge>
            </p>
            <p class="user-email">{{ userEmail }}</p>
          </div>
        </div>

        <!-- Coluna do Formulário -->
        <div class="profile-form-section">
          <q-tabs v-model="tab" align="left" narrow-indicator class="profile-tabs">
            <q-tab name="dados" icon="person" label="Dados Pessoais" />
            <q-tab name="seguranca" icon="lock" label="Segurança" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <!-- Dados Pessoais -->
            <q-tab-panel name="dados">
              <div class="form-row">
                <q-input
                  v-model="form.nome"
                  label="Nome Completo"
                  outlined
                  dense
                  :error="!!errors.nome"
                  :error-message="errors.nome"
                />
              </div>
              <div class="form-row">
                <q-input
                  v-model="form.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                  :error="!!errors.email"
                  :error-message="errors.email"
                />
              </div>
              <div class="form-row">
                <q-input
                  v-model="form.telefone"
                  label="Telefone"
                  outlined
                  dense
                  mask="(##) #####-####"
                  hint="Formato: (84) 91234-5678"
                />
              </div>
              <div class="form-actions">
                <q-btn color="primary" label="Salvar Alterações" @click="salvarPerfil" :loading="isSaving" />
              </div>
            </q-tab-panel>

            <!-- Segurança -->
            <q-tab-panel name="seguranca">
              <div class="form-row">
                <q-input
                  v-model="senhaForm.senha_atual"
                  label="Senha Atual"
                  type="password"
                  outlined
                  dense
                  :error="!!errors.senha_atual"
                  :error-message="errors.senha_atual"
                />
              </div>
              <div class="form-row">
                <q-input
                  v-model="senhaForm.nova_senha"
                  label="Nova Senha"
                  type="password"
                  outlined
                  dense
                  :error="!!errors.nova_senha"
                  :error-message="errors.nova_senha"
                  hint="Mínimo 6 caracteres"
                />
              </div>
              <div class="form-row">
                <q-input
                  v-model="senhaForm.nova_senha_confirmation"
                  label="Confirmar Nova Senha"
                  type="password"
                  outlined
                  dense
                  :error="!!errors.nova_senha_confirmation"
                  :error-message="errors.nova_senha_confirmation"
                />
              </div>
              <div class="form-actions">
                <q-btn color="primary" label="Alterar Senha" @click="alterarSenha" :loading="isSavingSenha" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>

      <!-- Atividade Recente -->
      <div class="activity-card" v-if="atividades.length > 0">
        <div class="card-header">
          <h3>Atividade Recente</h3>
          <q-icon name="history" size="20px" color="grey" />
        </div>
        <div class="activity-list">
          <div v-for="item in atividades.slice(0, 5)" :key="item.id" class="activity-item">
            <div class="activity-icon" :class="item.tipo">
              <q-icon :name="getIconAtividade(item.tipo)" size="16px" />
            </div>
            <div class="activity-info">
              <div class="activity-desc">{{ item.descricao }}</div>
              <div class="activity-date">{{ formatarDataRelativa(item.created_at) }}</div>
            </div>
            <div class="activity-ip">{{ item.ip }}</div>
          </div>
        </div>
      </div>

      <!-- Informações da Sessão -->
      <div class="info-card">
        <div class="card-header">
          <h3>Informações da Sessão</h3>
          <q-icon name="security" size="20px" color="grey" />
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Última atualização:</span>
            <span class="info-value">{{ formatarDataCompleta(perfil?.updated_at) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Conta criada:</span>
            <span class="info-value">{{ formatarDataCompleta(perfil?.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <q-badge :color="perfil?.verificado ? 'green' : 'orange'">
              {{ perfil?.verificado ? 'Verificado' : 'Pendente' }}
            </q-badge>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <q-inner-loading :showing="isSaving || isSavingSenha">
      <q-spinner size="40px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminPerfilStore, type AtualizarPerfilData, type AlterarSenhaData } from 'src/stores/admin/admin-perfil-store';
import { useAuthStore } from 'src/stores/login-store';

defineOptions({ name: 'AdminPerfil' });

const $q = useQuasar();
const perfilStore = useAdminPerfilStore();
const authStore = useAuthStore();

const {
  isLoading,
  isSaving,
  isSavingSenha,
  perfil,
  atividades,
} = storeToRefs(perfilStore);

const {
  carregarPerfil,
  carregarAtividades,
  atualizarPerfil,
  alterarSenha: alterarSenhaStore,
  atualizarFoto,
  recarregarDados,
} = perfilStore;

// ===================== ESTADOS =====================

const tab = ref('dados');
const fotoTimestamp = ref(Date.now());

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
});

const senhaForm = reactive({
  senha_atual: '',
  nova_senha: '',
  nova_senha_confirmation: '',
});

const errors = reactive({
  nome: '',
  email: '',
  senha_atual: '',
  nova_senha: '',
  nova_senha_confirmation: '',
});

// ===================== FOTO - SIMPLES E DIRETA =====================

// Força atualização da foto quando ela mudar
watch(
  () => perfil.value?.foto,
  () => {
    fotoTimestamp.value = Date.now();
  }
);

const fotoPerfil = computed(() => {
  const foto = perfil.value?.foto || authStore.user?.foto;

  if (foto && foto !== '') {
    // Se já for URL completa, usa direto
    if (foto.startsWith('http')) {
      return `${foto}?t=${fotoTimestamp.value}`;
    }
    // Se for caminho relativo, constrói URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const caminho = foto.startsWith('/') ? foto : `/${foto}`;
    return `${baseUrl}${caminho}?t=${fotoTimestamp.value}`;
  }

  // Fallback
  return `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=140&name=${encodeURIComponent(userNome.value)}`;
});

const userNome = computed(() => perfil.value?.nome || authStore.user?.nome || 'Administrador');
const userEmail = computed(() => perfil.value?.email || authStore.user?.email || '');
const userTipo = computed(() => perfil.value?.tipo || authStore.user?.tipo || 'admin');

// ===================== FUNÇÕES AUXILIARES =====================

const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    root: 'Root Admin',
    admin: 'Administrador',
    prestador: 'Prestador',
    cliente: 'Cliente',
  };
  return labels[tipo] || tipo;
};

const getIconAtividade = (tipo: string): string => {
  const icons: Record<string, string> = {
    login: 'login',
    atualizacao: 'edit',
    criacao: 'add',
    exclusao: 'delete',
  };
  return icons[tipo] || 'info';
};

const formatarDataRelativa = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT');
};

const formatarDataCompleta = (dataString?: string): string => {
  if (!dataString) return '—';
  return new Date(dataString).toLocaleString('pt-PT');
};

// ===================== VALIDAÇÕES =====================

const validarFormulario = (): boolean => {
  let isValid = true;
  errors.nome = '';
  errors.email = '';

  if (!form.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'Email é obrigatório';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email inválido';
    isValid = false;
  }

  return isValid;
};

const validarSenha = (): boolean => {
  let isValid = true;
  errors.senha_atual = '';
  errors.nova_senha = '';
  errors.nova_senha_confirmation = '';

  if (!senhaForm.senha_atual) {
    errors.senha_atual = 'Senha atual é obrigatória';
    isValid = false;
  }

  if (!senhaForm.nova_senha) {
    errors.nova_senha = 'Nova senha é obrigatória';
    isValid = false;
  } else if (senhaForm.nova_senha.length < 6) {
    errors.nova_senha = 'A nova senha deve ter pelo menos 6 caracteres';
    isValid = false;
  }

  if (senhaForm.nova_senha !== senhaForm.nova_senha_confirmation) {
    errors.nova_senha_confirmation = 'As senhas não coincidem';
    isValid = false;
  }

  return isValid;
};

// ===================== AÇÕES =====================

const carregarDados = async (): Promise<void> => {
  const dados = await carregarPerfil();
  if (dados) {
    form.nome = dados.nome;
    form.email = dados.email;
    form.telefone = dados.telefone || '';
  }
  await carregarAtividades();
};

const handleRecarregar = (): void => {
  void recarregarDados().then(() => {
    if (perfil.value) {
      form.nome = perfil.value.nome;
      form.email = perfil.value.email;
      form.telefone = perfil.value.telefone || '';
    }
    $q.notify({ type: 'positive', message: 'Dados atualizados!' });
  });
};

const salvarPerfil = async (): Promise<void> => {
  if (!validarFormulario()) return;

  const data: AtualizarPerfilData = {
    nome: form.nome,
    email: form.email,
  };

  if (form.telefone && form.telefone.trim() !== '') {
    data.telefone = form.telefone;
  }

  const result = await atualizarPerfil(data);
  if (result) {
    $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso!' });
    await carregarAtividades();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar perfil' });
  }
};

const alterarSenha = async (): Promise<void> => {
  if (!validarSenha()) return;

  const data: AlterarSenhaData = {
    senha_atual: senhaForm.senha_atual,
    nova_senha: senhaForm.nova_senha,
    nova_senha_confirmation: senhaForm.nova_senha_confirmation,
  };

  const success = await alterarSenhaStore(data);
  if (success) {
    $q.notify({ type: 'positive', message: 'Senha alterada com sucesso!' });
    senhaForm.senha_atual = '';
    senhaForm.nova_senha = '';
    senhaForm.nova_senha_confirmation = '';
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao alterar senha. Verifique sua senha atual.' });
  }
};

const trocarFoto = (): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        $q.notify({ type: 'negative', message: 'A imagem deve ter no máximo 5MB' });
        return;
      }

      const result = await atualizarFoto(file);
      if (result) {
        // Atualizar timestamp para forçar recarregar a imagem
        fotoTimestamp.value = Date.now();
        $q.notify({ type: 'positive', message: 'Foto atualizada com sucesso!' });
        await carregarDados();
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar foto' });
      }
    }
  };
  input.click();
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
.page-container {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 12px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.profile-avatar-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .avatar-container {
    position: relative;
    display: inline-block;

    .profile-avatar {
      border: 4px solid #e5e7eb;
    }

    .change-photo-btn {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .avatar-info {
    margin-top: 20px;

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .user-role {
      margin-bottom: 8px;
    }

    .user-email {
      font-size: 13px;
      color: #6b7280;
    }
  }
}

.profile-form-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .profile-tabs {
    margin-bottom: 16px;
  }

  .form-row {
    margin-bottom: 20px;
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.activity-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.login {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        &.atualizacao {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        &.criacao {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        &.exclusao {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      }

      .activity-info {
        flex: 1;

        .activity-desc {
          font-size: 14px;
          color: #1f2937;
        }

        .activity-date {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
      }

      .activity-ip {
        font-size: 11px;
        color: #9ca3af;
        font-family: monospace;
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 6px;
      }
    }
  }
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-label {
        font-size: 12px;
        color: #6b7280;
      }

      .info-value {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr !important;
  }

  .activity-item {
    flex-wrap: wrap;

    .activity-ip {
      margin-left: 52px;
    }
  }
}
</style>
