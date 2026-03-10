<!-- pages/admin/auth/AdminLogin.vue -->
<template>
  <q-layout view="lHh Lpr lFf" class="admin-login-layout">
    <!-- Header com gradiente -->
    <q-header class="admin-header">
      <q-toolbar>
        <q-toolbar-title class="text-center text-white">
          <div class="row items-center justify-center q-gutter-sm">
            <q-icon name="admin_panel_settings" size="32px" />
            <span class="text-h6">EstouAqui Admin</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center admin-page">
        <!-- Background com efeito -->
        <div class="admin-bg">
          <div class="admin-bg-overlay"></div>
        </div>

        <!-- Card de Login -->
        <q-card class="admin-login-card" bordered>
          <!-- Barra superior decorativa -->
          <div class="admin-card-topbar"></div>

          <q-card-section class="text-center q-pt-xl">
            <div class="admin-logo-wrapper">
              <q-icon name="admin_panel_settings" size="64px" class="admin-logo-icon" />
            </div>
            <div class="text-h5 text-weight-bold q-mt-md">Acesso Restrito</div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs">Área administrativa</div>
          </q-card-section>

          <q-card-section class="q-px-xl q-pb-xl">
            <q-form @submit="handleAdminLogin" class="q-gutter-md">
              <!-- Email -->
              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                dense
                :rules="[(val) => !!val || 'Email é obrigatório']"
                bg-color="white"
                class="admin-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" class="admin-input-icon" />
                </template>
              </q-input>

              <!-- Password -->
              <q-input
                v-model="password"
                label="Palavra-passe"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                class="admin-input"
                bg-color="white"
                :rules="[(val) => !!val || 'Palavra-passe é obrigatória']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" class="admin-input-icon" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <!-- Lembrar-me -->
              <div class="row items-center justify-between q-mt-sm">
                <q-checkbox
                  v-model="remember"
                  label="Lembrar-me"
                  color="admin-primary"
                  size="sm"
                />
                <q-btn
                  flat
                  label="Esqueceu a palavra-passe?"
                  color="admin-primary"
                  size="sm"
                  @click="recoverPassword"
                  no-caps
                />
              </div>

              <!-- Botão de Login -->
              <q-btn
                type="submit"
                label="Acessar Painel"
                color="admin-primary"
                class="full-width admin-login-btn"
                size="lg"
                :loading="loading"
                :disable="loading"
                no-caps
              >
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>

              <!-- Aviso de segurança - VERMELHO -->
              <div class="text-center q-mt-md">
                <q-badge
                  outline
                  class="admin-security-badge q-pa-sm"
                >
                  <q-icon name="security" size="16px" class="q-mr-xs" />
                  Acesso restrito a administradores
                </q-badge>
              </div>
            </q-form>
          </q-card-section>

          <!-- Informações de contato -->
          <q-card-section class="bg-grey-2 text-center q-py-md">
            <div class="text-caption text-grey-7">
              <q-icon name="support_agent" size="16px" class="q-mr-xs" />
              Suporte: admin@estouaqui.co.mz
            </div>
          </q-card-section>
        </q-card>

        <!-- Footer -->
        <div class="admin-footer">
          <div class="text-caption text-white">
            © 2026 EstouAqui - Todos os direitos reservados
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AdminLogin'
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const loading = ref(false)

const handleAdminLogin = async (): Promise<void> => {
  if (!email.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top',
      icon: 'warning'
    })
    return
  }

  loading.value = true
  try {
    const success = await authStore.login(email.value, password.value)

    if (success) {
      const user = authStore.user

      if (user?.tipo === 'admin') {
        $q.notify({
          type: 'positive',
          message: 'Bem-vindo ao painel administrativo!',
          position: 'top',
          icon: 'check_circle'
        })
        void router.push('/admin/dashboard')
      } else {
        authStore.logout()
        $q.notify({
          type: 'negative',
          message: 'Acesso negado. Esta área é apenas para administradores.',
          position: 'top',
          icon: 'block'
        })
      }
    } else {
      $q.notify({
        type: 'negative',
        message: 'Email ou palavra-passe incorretos',
        position: 'top',
        icon: 'error'
      })
    }
  } catch (err: unknown) {
    // Agora a variável 'err' é usada para log
    console.error('Erro no login:', err)

    let errorMessage = 'Erro ao fazer login. Tente novamente.'

    // Se for um erro de rede ou erro conhecido, podemos personalizar a mensagem
    if (err instanceof Error) {
      errorMessage = err.message
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const recoverPassword = (): void => {
  $q.dialog({
    title: 'Recuperar Palavra-passe',
    message: 'Digite seu email para receber instruções de recuperação:',
    prompt: {
      model: '',
      type: 'email',
      isValid: (val: string) => /.+@.+\..+/.test(val)
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    },
    ok: {
      label: 'Enviar',
      color: 'admin-primary',
      unelevated: true
    },
    persistent: true
  }).onOk((email: string) => {
    $q.notify({
      type: 'info',
      message: `Instruções enviadas para ${email}`,
      position: 'top',
      icon: 'mail'
    })
  })
}
</script>

<style scoped lang="scss">
// Cores exclusivas para o admin (diferentes do site principal)
$admin-primary: #1e3c72;
$admin-secondary: #2a5298;
$admin-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
$admin-danger: #dc3545; // Vermelho para o badge
$admin-warning: #f39c12;
$admin-dark: #0a1a2f;

.admin-login-layout {
  background: $admin-dark;
}

.admin-header {
  background: $admin-gradient !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-page {
  min-height: 100vh;
  position: relative;
  background: $admin-dark;
}

.admin-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');

  &-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 10% 20%, rgba(30, 60, 114, 0.4) 0%, rgba(10, 26, 47, 0.9) 90%);
  }
}

.admin-login-card {
  width: 450px;
  max-width: 90vw;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  animation: slideIn 0.5s ease-out;

  .admin-card-topbar {
    height: 8px;
    background: $admin-gradient;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
}

.admin-logo-wrapper {
  width: 100px;
  height: 100px;
  background: rgba(30, 60, 114, 0.1);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  .admin-logo-icon {
    color: $admin-primary;
    animation: pulse 2s infinite;
  }
}

.admin-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    border: 2px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(30, 60, 114, 0.3);
    }

    &:focus-within {
      border-color: $admin-primary;
    }
  }

  :deep(.q-field__native) {
    padding: 12px 0;
  }

  .admin-input-icon {
    color: $admin-primary;
  }
}

.admin-login-btn {
  height: 56px;
  border-radius: 28px;
  background: $admin-gradient;
  font-weight: 600;
  text-transform: none;
  font-size: 1.1rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(30, 60, 114, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(30, 60, 114, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

// Badge de segurança VERMELHO
.admin-security-badge {
  background: transparent !important;
  border: 1px solid $admin-danger !important;
  color: $admin-danger !important;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .q-icon {
    color: $admin-danger;
  }

  &:hover {
    background: rgba($admin-danger, 0.05) !important;
  }
}

.admin-footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

// Animações
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// Responsividade
@media (max-width: 768px) {
  .admin-login-card {
    margin: 20px;

    .q-px-xl {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
  }

  .admin-footer {
    bottom: 10px;
  }
}
</style>
