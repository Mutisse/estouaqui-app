<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="login-container">
      <q-card class="login-card" flat>
        <!-- Header com gradiente -->
        <q-card-section class="login-header">
          <div class="header-icon">
            <q-icon name="admin_panel_settings" size="48px" color="white" />
          </div>
          <div class="header-title">Área Administrativa</div>
          <div class="header-subtitle">Acesso restrito a administradores</div>
        </q-card-section>

        <!-- Formulário -->
        <q-card-section class="q-px-xl q-py-lg">
          <div class="logo-mini q-mb-lg">
            <span class="text-bold text-grey-9">Estou</span>
            <span class="text-bold text-primary">Aqui</span>
            <span class="admin-tag">ADMIN</span>
          </div>

          <!-- Campo de Email -->
          <div class="input-label">Email de Administrador</div>
          <q-input
            v-model="email"
            placeholder="admin@estouaqui.com"
            outlined
            dense
            class="custom-input"
            :rules="[(val) => !!val || 'Email é obrigatório']"
            bg-color="white"
            @keyup.enter="handleLogin"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="grey-6" size="20px" />
            </template>
          </q-input>

          <!-- Campo de Password -->
          <div class="input-label q-mt-md">Palavra-passe</div>
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Digite sua palavra-passe"
            outlined
            dense
            class="custom-input"
            :rules="[(val) => !!val || 'Palavra-passe é obrigatória']"
            bg-color="white"
            @keyup.enter="handleLogin"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="grey-6" size="20px" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Link para recuperar senha -->
          <div class="forgot-password">
            <q-btn
              flat
              dense
              label="Esqueceu a palavra-passe?"
              class="forgot-btn"
              @click="forgotPassword"
              no-caps
            />
          </div>

          <!-- Botão de Login -->
          <q-btn
            label="Entrar como Administrador"
            class="login-btn q-mt-lg"
            :loading="loading"
            @click="handleLogin"
            no-caps
            :disable="!isFormValid"
          />

          <!-- Link para voltar ao site principal -->
          <div class="back-to-site q-mt-md text-center">
            <q-btn
              flat
              dense
              icon="arrow_back"
              label="Voltar para o site"
              class="back-btn"
              @click="goBackToSite"
              no-caps
            />
          </div>
        </q-card-section>

        <!-- Footer com informações de segurança -->
        <q-card-section class="q-px-xl q-pb-md">
          <div class="security-note text-center">
            <q-icon name="security" size="14px" class="q-mr-xs" />
            <span class="text-caption text-grey-6">Conexão segura • Acesso restrito</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading global -->
    <q-inner-loading :showing="globalLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'AdminLogin',
});

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

// Form state
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const globalLoading = ref(false);

// Validações
const isValidEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isFormValid = computed(() => {
  return isValidEmail(email.value) && password.value.length >= 6;
});

// Login
const handleLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  if (!isValidEmail(email.value)) {
    $q.notify({
      type: 'warning',
      message: 'Email inválido',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  loading.value = true;

  try {
    const success = await authStore.login(email.value, password.value);

    if (success) {
      // Verificar se o usuário é administrador
      if (authStore.isAdmin) {
        $q.notify({
          type: 'positive',
          message: 'Login efetuado com sucesso!',
          position: 'top',
          icon: 'check_circle',
          timeout: 3000,
        });
        await router.push('/admin/dashboard');
      } else {
        // Se não for admin, fazer logout e mostrar erro
        await authStore.logout();
        $q.notify({
          type: 'negative',
          message: 'Acesso negado. Esta área é restrita para administradores.',
          position: 'top',
          icon: 'error',
          timeout: 4000,
        });
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Erro ao fazer login',
      position: 'top',
      timeout: 4000,
    });
  } finally {
    loading.value = false;
  }
};

// Recuperar senha
const forgotPassword = () => {
  $q.dialog({
    title: 'Recuperar Palavra-passe',
    message: 'Digite seu email de administrador para receber instruções:',
    prompt: {
      model: '',
      type: 'text',
      isValid: (val: string) => isValidEmail(val),
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: 'Enviar',
      color: 'primary',
      unelevated: true,
    },
    persistent: true,
  }).onOk((emailRecuperacao) => {
    // TODO: Chamar API de recuperação de senha
    $q.notify({
      type: 'info',
      message: `Instruções enviadas para ${emailRecuperacao}`,
      position: 'top',
      icon: 'mail',
      timeout: 4000,
    });
  });
};

// Voltar para o site principal
const goBackToSite = () => {
  void router.push('/');
};
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 20px;
}

.login-card {
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  background: white;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.15);
  }
}

.login-header {
  background: $purple-gradient;
  padding: 40px 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  .header-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .header-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 5px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .header-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }
}

.logo-mini {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  text-align: center;
  position: relative;

  .admin-tag {
    font-size: 0.7rem;
    background: #f56565;
    color: white;
    padding: 2px 8px;
    border-radius: 20px;
    margin-left: 8px;
    vertical-align: middle;
  }
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: $gray-700;
  margin-bottom: 5px;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 15px;
    border: 1px solid $gray-200;
    transition: all 0.3s ease;

    &:hover {
      border-color: $purple-primary;
    }
  }

  :deep(.q-field__control:focus-within) {
    border-color: $purple-primary;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  :deep(.q-field__prepend) {
    padding-right: 10px;
  }
}

.forgot-password {
  text-align: right;
  margin-top: 5px;

  .forgot-btn {
    color: $gray-600;
    font-size: 0.85rem;
    transition: all 0.3s ease;

    &:hover {
      color: $purple-primary;
    }
  }
}

.login-btn {
  width: 100%;
  background: $purple-gradient;
  color: white;
  padding: 12px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.back-btn {
  color: $gray-600;
  font-size: 0.85rem;

  &:hover {
    color: $purple-primary;
  }
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gray-500;
  font-size: 0.7rem;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 599px) {
  .login-header {
    padding: 30px 20px;

    .header-title {
      font-size: 1.5rem;
    }

    .header-icon {
      width: 60px;
      height: 60px;
    }
  }

  .q-card-section {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }

  .logo-mini {
    font-size: 1.2rem;
  }
}
</style>
