<template>
  <div class="configuracoes-page">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregando" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-list">
        <div v-for="i in 4" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== HEADER ===== -->
      <div class="page-header">
        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 class="page-title">Configurações</h1>
        <div class="placeholder"></div>
      </div>

      <!-- ===== LISTA DE CONFIGURAÇÕES ===== -->
      <div class="configuracoes-list">
        <!-- SEÇÃO NOTIFICAÇÕES -->
        <div class="config-section">
          <div class="section-title">Notificações</div>

          <div class="config-item">
            <div class="item-left">
              <div class="item-icon email-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Notificações por Email</div>
                <div class="item-description">Receba atualizações sobre pedidos e promoções</div>
              </div>
            </div>
            <q-toggle
              v-model="configuracoes.notificacoes_email"
              color="primary"
              @update:model-value="(val) => salvarConfiguracao('notificacoes_email', val)"
            />
          </div>

          <div class="config-item">
            <div class="item-left">
              <div class="item-icon push-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Notificações Push</div>
                <div class="item-description">Alertas instantâneos no seu dispositivo</div>
              </div>
            </div>
            <q-toggle
              v-model="configuracoes.notificacoes_push"
              color="primary"
              @update:model-value="(val) => salvarConfiguracao('notificacoes_push', val)"
            />
          </div>
        </div>

        <!-- SEÇÃO APARÊNCIA -->
        <div class="config-section">
          <div class="section-title">Aparência</div>

          <div class="config-item select-item">
            <div class="item-left">
              <div class="item-icon theme-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Tema</div>
                <div class="item-description">Escolha o tema do aplicativo</div>
              </div>
            </div>
            <q-select
              v-model="configuracoes.tema"
              :options="opcoesTema"
              dense
              outlined
              borderless
              class="theme-select"
              @update:model-value="(val) => salvarConfiguracao('tema', val)"
            />
          </div>
        </div>

        <!-- SEÇÃO IDIOMA -->
        <div class="config-section">
          <div class="section-title">Idioma</div>

          <div class="config-item select-item">
            <div class="item-left">
              <div class="item-icon language-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Idioma</div>
                <div class="item-description">Escolha o idioma do aplicativo</div>
              </div>
            </div>
            <q-select
              v-model="configuracoes.idioma"
              :options="opcoesIdioma"
              dense
              outlined
              borderless
              class="language-select"
              @update:model-value="(val) => salvarConfiguracao('idioma', val)"
            />
          </div>
        </div>

        <!-- SEÇÃO CONTA -->
        <div class="config-section">
          <div class="section-title">Conta</div>

          <!-- EDITAR PERFIL -->
          <div class="config-item clickable" @click="irParaEditarPerfil">
            <div class="item-left">
              <div class="item-icon profile-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Editar Perfil</div>
                <div class="item-description">Altere seus dados pessoais</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>

          <!-- MEU ENDEREÇO -->
          <div class="config-item clickable" @click="irParaEndereco">
            <div class="item-left">
              <div class="item-icon address-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Meu Endereço</div>
                <div class="item-description">Atualize seu endereço de entrega</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>

          <!-- EXCLUIR CONTA -->
          <div class="config-item clickable delete-account-item" @click="confirmarExcluirConta">
            <div class="item-left">
              <div class="item-icon delete-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </div>
              <div class="item-info">
                <div class="item-title">Excluir Conta</div>
                <div class="item-description text-negative">Remova permanentemente sua conta e todos os dados</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        <!-- VERSÃO DO APP -->
        <div class="app-version">
          Versão 1.0.0
        </div>
      </div>
    </template>

    <!-- ===== MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ===== -->
    <q-dialog v-model="excluirDialog" persistent>
      <q-card class="delete-dialog-card" style="min-width: 300px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-negative">Excluir Conta</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-body1">Tem certeza que deseja excluir sua conta?</p>
          <p class="text-caption text-grey-7">Esta ação é irreversível e todos os seus dados serão permanentemente removidos.</p>

          <div class="q-mt-md">
            <q-input
              v-model="confirmacaoTexto"
              outlined
              dense
              placeholder='Digite "EXCLUIR" para confirmar'
              class="q-mb-md"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            label="Excluir Conta"
            color="negative"
            :disable="confirmacaoTexto !== 'EXCLUIR'"
            :loading="excluindo"
            @click="executarExcluirConta"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePerfilStore } from 'src/stores/client/cliente-perfil-store';
import { api, } from 'src/boot/axios';

defineOptions({ name: 'MobileConfiguracoes' });

const router = useRouter();
const perfilStore = usePerfilStore();
const $q = useQuasar();

// ===================== TIPOS =====================
type TemaType = 'light' | 'dark' | 'system';
type IdiomaType = 'pt' | 'en';

// ===================== ESTADOS =====================
const carregando = ref(false);
const salvando = ref(false);
const excluindo = ref(false);
const excluirDialog = ref(false);
const confirmacaoTexto = ref('');

// ===================== CONFIGURAÇÕES =====================
const configuracoes = reactive({
  notificacoes_email: true,
  notificacoes_push: true,
  idioma: 'pt' as IdiomaType,
  tema: 'system' as TemaType,
});

const opcoesTema = [
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
  { label: 'Sistema', value: 'system' },
];

const opcoesIdioma = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
];

// ===================== FUNÇÕES =====================
const carregarConfiguracoes = async () => {
  carregando.value = true;
  try {
    const config = await perfilStore.fetchConfiguracoes();
    if (config) {
      configuracoes.notificacoes_email = config.notificacoes_email ?? true;
      configuracoes.notificacoes_push = config.notificacoes_push ?? true;
      configuracoes.idioma = (config.idioma as IdiomaType) || 'pt';
      configuracoes.tema = (config.tema as TemaType) || 'system';
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar configurações',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

const salvarConfiguracao = async (campo: string, valor: boolean | string) => {
  salvando.value = true;
  try {
    await perfilStore.atualizarConfiguracoes({ [campo]: valor });

    if (campo === 'tema') {
      aplicarTema(valor as string);
    }

    $q.notify({
      type: 'positive',
      message: 'Configuração salva!',
      position: 'top',
      timeout: 1000,
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar configuração',
      position: 'top',
    });
  } finally {
    salvando.value = false;
  }
};

const aplicarTema = (tema: string) => {
  if (tema === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (tema === 'light') {
    document.body.classList.remove('dark-mode');
  } else {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
};

const irParaEditarPerfil = () => {
  void router.push('/mobile/perfil');
};

const irParaEndereco = () => {
  void router.push('/mobile/enderecos');
};

// ===================== EXCLUIR CONTA =====================
const confirmarExcluirConta = () => {
  confirmacaoTexto.value = '';
  excluirDialog.value = true;
};

const executarExcluirConta = async () => {
  if (confirmacaoTexto.value !== 'EXCLUIR') {
    $q.notify({
      type: 'warning',
      message: 'Digite "EXCLUIR" para confirmar a exclusão',
      position: 'top',
    });
    return;
  }

  excluindo.value = true;

  try {
    // Chamar API para excluir conta
    const response = await api.delete('/perfil/conta');

    if (response.data?.success) {
      // Limpar store
      await perfilStore.logoutAndClear();

      $q.notify({
        type: 'positive',
        message: 'Sua conta foi excluída com sucesso',
        position: 'top',
      });

      // Fechar dialog
      excluirDialog.value = false;

      // Redirecionar para login
      void router.push('/auth/login');
    } else {
      throw new Error(response.data?.message || 'Erro ao excluir conta');
    }
  } catch (error: unknown) {
    console.error('Erro ao excluir conta:', error);

    // Tipo seguro para erro
    let mensagemErro = 'Erro ao excluir conta. Tente novamente mais tarde.';

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        mensagemErro = axiosError.response.data.message;
      }
    } else if (error instanceof Error) {
      mensagemErro = error.message;
    }

    $q.notify({
      type: 'negative',
      message: mensagemErro,
      position: 'top',
      timeout: 4000,
    });
  } finally {
    excluindo.value = false;
  }
};

onMounted(() => {
  void carregarConfiguracoes();
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;
$danger: #ef4444;
$dark: #0a0a0f;
$gray: #6b7280;
$gray-light: #f3f4f6;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 12px;

// ===================== SKELETON =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading { background: $bg; min-height: 100vh; }
.skeleton-header {
  background: $white; padding: 16px; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid $border;
}
.skeleton-back-btn, .skeleton-title {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-title { width: 120px; border-radius: 12px; }
.skeleton-list { padding: 16px; }
.skeleton-item {
  display: flex; align-items: center; gap: 12px; padding: 16px;
  background: $white; border-bottom: 1px solid $border;
}
.skeleton-icon { width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; }
.skeleton-text { flex: 1; height: 20px; border-radius: 10px; background: #e0e0e0; }

// ===================== LAYOUT =====================
.configuracoes-page { background: $bg; min-height: 100vh; }

// ===================== HEADER =====================
.page-header {
  background: $white; padding: 12px 16px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid $border; position: sticky; top: 0; z-index: 10;

  .back-btn {
    width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: $gray-light; border: none; cursor: pointer; color: $gray; transition: all 0.2s;
    &:hover { background: rgba($accent, 0.1); color: $accent; }
  }

  .page-title { font-size: 1.1rem; font-weight: 600; color: $dark; margin: 0; }

  .placeholder { width: 40px; }
}

// ===================== CONFIGURAÇÕES =====================
.configuracoes-list {
  padding-bottom: 40px;
}

.config-section {
  background: $white;
  margin-bottom: 12px;
  padding: 0 16px;

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: $gray;
    padding: 12px 0 8px;
  }
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &.clickable {
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba($accent, 0.05);
      margin: 0 -16px;
      padding: 14px 16px;
    }
  }

  &.delete-account-item:hover {
    background: rgba($danger, 0.1);
  }

  .item-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
  }

  .item-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    color: $gray;
  }

  .email-icon, .push-icon { background: rgba($accent, 0.1); color: $accent; }
  .theme-icon { background: rgba(#f59e0b, 0.1); color: #f59e0b; }
  .language-icon { background: rgba(#10b981, 0.1); color: #10b981; }
  .profile-icon { background: rgba($accent, 0.1); color: $accent; }
  .address-icon { background: rgba(#8b5cf6, 0.1); color: #8b5cf6; }
  .delete-icon { background: rgba($danger, 0.1); color: $danger; }

  .item-info {
    flex: 1;

    .item-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: $dark;
      margin-bottom: 2px;
    }

    .item-description {
      font-size: 0.7rem;
      color: $gray;
    }
  }
}

.config-item.select-item {
  .theme-select, .language-select {
    width: 110px;

    :deep(.q-field__control) {
      min-height: 32px;
      background: $gray-light;
      border-radius: 20px;
    }

    :deep(.q-field__native) {
      font-size: 0.8rem;
      padding-left: 12px;
    }
  }
}

// ===================== VERSÃO =====================
.app-version {
  text-align: center;
  padding: 30px 20px;
  font-size: 0.7rem;
  color: $gray;
}

// ===================== DELETE DIALOG =====================
.delete-dialog-card {
  background: $white;

  .text-negative {
    color: $danger;
  }
}
</style>
