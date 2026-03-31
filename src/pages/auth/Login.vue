<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="login-container">
      <q-card class="login-card" flat>
        <!-- Header com gradiente -->
        <q-card-section class="login-header">
          <div class="header-icon">
            <q-icon name="login" size="32px" color="white" />
          </div>
          <div class="header-title">Bem-vindo de volta!</div>
          <div class="header-subtitle">Entre na sua conta</div>
        </q-card-section>

        <!-- Formulário -->
        <q-card-section class="q-px-xl q-py-lg">
          <div class="logo-mini q-mb-lg">
            <span class="text-bold text-grey-9">Estou</span>
            <span class="text-bold text-primary">Aqui</span>
          </div>

          <!-- Campo de Login (Email ou Telefone) -->
          <div class="input-label">Email ou Telefone</div>
          <q-input
            v-model="login"
            placeholder="seu@email.com ou 84 123 4567"
            outlined
            dense
            class="custom-input"
            :rules="[(val) => !!val || 'Email ou telefone é obrigatório']"
            bg-color="white"
            @keyup.enter="handleLogin"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="grey-6" size="20px" />
            </template>
          </q-input>

          <!-- Dica do formato esperado -->
          <div class="input-hint" v-if="login && !isValidEmail(login) && !isValidPhone(login)">
            Formato inválido. Use email (exemplo@email.com) ou telefone (84 123 4567)
          </div>

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
            label="Entrar"
            class="login-btn q-mt-lg"
            :loading="loading"
            @click="handleLogin"
            no-caps
            :disable="!isFormValid"
          />
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
defineOptions({
  name: 'AuthLogin',
});

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

// Form state
const login = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const globalLoading = ref(false);
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
let lockUntil: Date | null = null;

// Validações
const isValidEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isValidPhone = (value: string) => {
  const phoneRegex = /^(\+258)?\s?[82][0-9]\s?[0-9]{3}\s?[0-9]{4}$|^[82][0-9]{8}$/;
  return phoneRegex.test(value.replace(/\s/g, ''));
};

const isFormValid = computed(() => {
  if (!login.value || !password.value) return false;
  return isValidEmail(login.value) || isValidPhone(login.value);
});

// Verificar se a conta está bloqueada por tentativas
const isAccountLocked = (): boolean => {
  if (lockUntil && new Date() < lockUntil) {
    const remainingMinutes = Math.ceil((lockUntil.getTime() - new Date().getTime()) / 60000);
    $q.notify({
      type: 'warning',
      message: `Muitas tentativas falhas. Tente novamente em ${remainingMinutes} minutos.`,
      position: 'top',
      timeout: 5000,
    });
    return true;
  }
  return false;
};

// Incrementar tentativas de login
const incrementLoginAttempts = () => {
  loginAttempts++;
  if (loginAttempts >= MAX_ATTEMPTS) {
    lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloqueia por 15 minutos
    $q.notify({
      type: 'error',
      message: 'Muitas tentativas falhas. Conta bloqueada por 15 minutos.',
      position: 'top',
      timeout: 5000,
    });
  }
};

// Resetar tentativas após login bem-sucedido
const resetLoginAttempts = () => {
  loginAttempts = 0;
  lockUntil = null;
};

// Verificar se o usuário já está autenticado
const checkExistingAuth = async () => {
  if (authStore.isAuthenticated && authStore.user) {
    if (authStore.isPrestador) {
      await router.push('/mobile/prestador/dashboard');
    } else if (authStore.isCliente) {
      await router.push('/mobile/inicio');
    }
  }
};

// ✅ FUNÇÃO SEPARADA PARA RECUPERAÇÃO DE SENHA (sem async direto no .onOk)
const processarRecuperacaoSenha = (contacto: string) => {
  globalLoading.value = true;

  // Chamar API de recuperação de senha
  import('src/boot/axios')
    .then(({ api }) => {
      return api.post('/auth/forgot-password', {
        email: isValidEmail(contacto) ? contacto : undefined,
        telefone: !isValidEmail(contacto) ? contacto : undefined,
      });
    })
    .then((response) => {
      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || `Instruções enviadas para ${contacto}`,
          position: 'top',
          icon: 'mail',
          timeout: 4000,
        });
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.error || 'Erro ao enviar instruções',
          position: 'top',
          timeout: 4000,
        });
      }
    })
    .catch((error) => {
      console.error('Erro ao recuperar senha:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar instruções. Tente novamente.',
        position: 'top',
        timeout: 4000,
      });
    })
    .finally(() => {
      globalLoading.value = false;
    });
};

// Login
const handleLogin = async () => {
  if (!login.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  if (!isValidEmail(login.value) && !isValidPhone(login.value)) {
    $q.notify({
      type: 'warning',
      message: 'Use um email válido ou telefone (84 123 4567)',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  if (isAccountLocked()) {
    return;
  }

  loading.value = true;

  try {
    const success = await authStore.login(login.value, password.value);

    if (success) {
      await new Promise(resolve => setTimeout(resolve, 100));

      const user = authStore.user;

      if (user?.tipo === 'admin') {
        await authStore.logout();
        incrementLoginAttempts();
        $q.notify({
          type: 'error',
          message: 'Acesso negado. Utilize a página de login administrativo.',
          position: 'top',
          icon: 'error',
          timeout: 5000,
        });
        login.value = '';
        password.value = '';
        loading.value = false;
        return;
      }

      resetLoginAttempts();
      $q.notify({
        type: 'positive',
        message: 'Login efetuado com sucesso!',
        position: 'top',
        icon: 'check_circle',
        timeout: 3000,
      });

      if (user?.tipo === 'prestador') {
        await router.push('/mobile/prestador/dashboard');
      } else {
        await router.push('/mobile/inicio');
      }
    } else {
      incrementLoginAttempts();
    }
  } catch (error) {
    console.error('Erro no login:', error);
    incrementLoginAttempts();
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

// Recuperar senha - CORRIGIDO
const forgotPassword = () => {
  $q.dialog({
    title: 'Recuperar Palavra-passe',
    message: 'Digite seu email ou número de telefone para receber instruções:',
    prompt: {
      model: '',
      type: 'text',
      isValid: (val: string) => isValidEmail(val) || isValidPhone(val),
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
  }).onOk((contacto) => {
    // ✅ CHAMAR FUNÇÃO SEPARADA (não async)
    processarRecuperacaoSenha(contacto);
  });
};

// Inicialização
onMounted(() => {
  void checkExistingAuth();
});
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
  max-width: 450px;
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
    width: 70px;
    height: 70px;
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
    font-size: 1rem;
  }
}

.logo-mini {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  text-align: center;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: $gray-700;
  margin-bottom: 5px;
}

.input-hint {
  font-size: 0.75rem;
  color: #f56565;
  margin-top: 2px;
  margin-left: 10px;
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
  font-size: 1.1rem;
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
  }

  .q-card-section {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
</style>
