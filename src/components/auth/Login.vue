<!-- pages/auth/Login.vue -->
<template>
  <q-form @submit="handleLogin" class="ea-login-form">

    <!-- Campo Email/Telefone -->
    <div class="ea-input-group">
      <label class="ea-input-label">Email ou Telefone</label>
      <div class="ea-input-wrapper">
        <span class="ea-input-icon">
          <q-icon name="mail" size="18px" />
        </span>
        <q-input
          v-model="login"
          type="text"
          dense
          outlined
          placeholder="seu@email.com ou 84 123 4567"
          class="ea-input-field"
          hide-bottom-space
          :error="loginError"
          :error-message="loginErrorMessage"
          @update:model-value="validateLogin"
          dark
          color="white"
        />
      </div>
    </div>

    <!-- Campo Password -->
    <div class="ea-input-group">
      <label class="ea-input-label">Palavra-passe</label>
      <div class="ea-input-wrapper">
        <span class="ea-input-icon">
          <q-icon name="lock" size="18px" />
        </span>
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          dense
          outlined
          placeholder="Digite sua palavra-passe"
          class="ea-input-field"
          hide-bottom-space
          dark
          color="white"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer ea-password-eye"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Esqueceu senha -->
    <div class="ea-forgot">
      <button type="button" class="ea-forgot__btn" @click="forgotPassword">
        Esqueceu a palavra-passe?
      </button>
    </div>

    <!-- Botão Login -->
    <q-btn
      type="submit"
      label="Entrar"
      class="ea-login-btn"
      :loading="loading"
      :disable="!isFormValid"
      no-caps
    />

  </q-form>

  <!-- Loading global -->
  <q-inner-loading :showing="globalLoading">
    <q-spinner size="50px" color="primary" />
  </q-inner-loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

defineOptions({ name: 'LoginForm' });

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

// Form state
const login = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const globalLoading = ref(false);
const loginError = ref(false);
const loginErrorMessage = ref('');

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

const validateLogin = () => {
  if (!login.value) {
    loginError.value = false;
    loginErrorMessage.value = '';
    return;
  }

  if (!isValidEmail(login.value) && !isValidPhone(login.value)) {
    loginError.value = true;
    loginErrorMessage.value = 'Use um email válido ou telefone (84 123 4567)';
  } else {
    loginError.value = false;
    loginErrorMessage.value = '';
  }
};

const isFormValid = computed(() => {
  if (!login.value || !password.value) return false;
  return isValidEmail(login.value) || isValidPhone(login.value);
});

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

const incrementLoginAttempts = () => {
  loginAttempts++;
  if (loginAttempts >= MAX_ATTEMPTS) {
    lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    $q.notify({
      type: 'error',
      message: 'Muitas tentativas falhas. Conta bloqueada por 15 minutos.',
      position: 'top',
      timeout: 5000,
    });
  }
};

const resetLoginAttempts = () => {
  loginAttempts = 0;
  lockUntil = null;
};

const checkExistingAuth = async () => {
  if (authStore.isAuthenticated && authStore.user) {
    if (authStore.isPrestador) {
      await router.push('/mobile/prestador/dashboard');
    } else if (authStore.isCliente) {
      await router.push('/mobile/inicio');
    }
  }
};

const processarRecuperacaoSenha = (contacto: string) => {
  globalLoading.value = true;

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

  if (isAccountLocked()) return;

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
      $q.notify({
        type: 'negative',
        message: 'Email/Telefone ou palavra-passe incorretos',
        position: 'top',
        timeout: 4000,
      });
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
    processarRecuperacaoSenha(contacto);
  });
};

onMounted(() => {
  void checkExistingAuth();
});
</script>

<style scoped lang="scss">
$accent: #5B4BF5;

.ea-login-form {
  width: 100%;
}

.ea-input-group {
  margin-bottom: 20px;
}

.ea-input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.ea-input-wrapper {
  position: relative;
}

.ea-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $accent;
  z-index: 2;
  pointer-events: none;
}

.ea-input-field {
  :deep(.q-field__control) {
    background: transparent !important;  /* FUNDO TRANSPARENTE */
    border-radius: 14px;
    padding-left: 44px;

    &::before {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field--focused .q-field__control::before) {
    border-color: $accent !important;
  }

  :deep(.q-field__native) {
    color: #fff;
    padding-left: 0;
  }

  :deep(.q-field__native::placeholder) {
    color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field__append) {
    position: absolute;
    right: 8px;
  }

  // Remove o fundo branco padrão do Quasar
  :deep(.q-field--outlined .q-field__control) {
    background: transparent !important;
  }

  :deep(.q-field--outlined .q-field__control:before) {
    background: transparent !important;
  }
}

.ea-password-eye {
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
}

.ea-forgot {
  text-align: right;
  margin-top: 4px;
  margin-bottom: 24px;

  &__btn {
    background: none;
    border: none;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: $accent;
    }
  }
}

.ea-login-btn {
  background: $accent;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 100px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.25s;

  &:hover:not(:disabled) {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(91, 75, 245, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}
</style>
