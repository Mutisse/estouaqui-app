<template>
  <div>
    <!-- SPLASH SCREEN - SÓ APARECE EM PWA -->
    <SplashScreen v-if="showSplash" />

    <!-- LOADING SKELETON (SÓ MOSTRA SE loading É TRUE E NÃO É PWA) -->
    <div v-else-if="loading && !isPWA" class="skeleton-loading-simple">
      <div class="skeleton-header-simple">
        <div class="skeleton-avatar-simple"></div>
        <div class="skeleton-text">
          <div class="skeleton-line-simple w-50"></div>
          <div class="skeleton-line-simple w-30"></div>
        </div>
      </div>
      <div class="skeleton-cards">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-card-avatar"></div>
          <div class="skeleton-card-text">
            <div class="skeleton-line-simple w-60"></div>
            <div class="skeleton-line-simple w-40"></div>
            <div class="skeleton-line-simple w-30"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ROUTER VIEW - MOSTRA IMEDIATAMENTE NA WEB -->
    <router-view v-else />

    <!-- ============================================================
         COMPONENTE PWA - INSTALAÇÃO
         ============================================================ -->
    <InstallPWA />

    <!-- MODAL DE REPORTAR ERRO -->
    <ReportarErroModal
      v-model="showErrorModal"
      :erro-capturado="currentError"
      @enviado="onErrorReported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import ReportarErroModal from 'src/components/ReportarErroModal.vue';
import InstallPWA from 'src/components/InstallPWA.vue';
import SplashScreen from 'src/components/SplashScreen.vue';
import type { AxiosError } from 'axios';

defineOptions({ name: 'App' });

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

interface ErrorInfo {
  mensagem: string;
  codigo: string;
  stack: string;
  url: string;
  contexto?: string;
  userAgent: string;
  timestamp: string;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const loading = ref(false);
const showSplash = ref(false);
const showErrorModal = ref(false);
const currentError = ref<ErrorInfo | null>(null);

let lastErrorTime = 0;
const ERROR_COOLDOWN = 5000;

// 🔥 DETECTA PWA - SOMENTE STANDALONE (IGNORA localStorage)
const isPWA = computed(() => {
  const nav = window.navigator as NavigatorWithStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
});

// 🔥 VERIFICA SE PODE INSTALAR (NA WEB)
const canInstall = computed(() => {
  return !isPWA.value && 'serviceWorker' in navigator;
});

// Capturar erros do Vue
onErrorCaptured((err, instance, info) => {
  console.error('Erro capturado pelo Vue:', err, info);
  abrirModalErro(err instanceof Error ? err : new Error(String(err)), info);
  return false;
});

const handleGlobalError = (event: ErrorEvent) => {
  console.error('Erro global capturado:', event.error);
  abrirModalErro(event.error || new Error(event.message), 'global');
  event.preventDefault();
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Promise rejeitada:', event.reason);
  const erro = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  abrirModalErro(erro, 'promise');
  event.preventDefault();
};

const abrirModalErro = (erro: Error, contexto?: string) => {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_COOLDOWN) {
    console.log('Erro ignorado (cooldown)');
    return;
  }
  lastErrorTime = now;

  let mensagem = erro.message || 'Erro desconhecido';
  let codigo = '';
  const stack = erro.stack || '';

  const axiosError = erro as AxiosError;
  if (axiosError.response) {
    codigo = String(axiosError.response.status);
    const responseData = axiosError.response.data as { message?: string };
    mensagem = responseData?.message || mensagem;
  } else if (axiosError.request) {
    codigo = 'NETWORK';
    mensagem = 'Erro de rede - sem resposta do servidor';
  } else if (axiosError.code) {
    codigo = axiosError.code;
  }

  const statusMatch = mensagem.match(/(\d{3})/);
  if (statusMatch && statusMatch[1] && !codigo) {
    codigo = statusMatch[1];
  }

  const errorData: ErrorInfo = {
    mensagem: mensagem,
    codigo: codigo,
    stack: stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  if (contexto) {
    errorData.contexto = contexto;
  }

  currentError.value = errorData;
  showErrorModal.value = true;
};

const onErrorReported = (success: boolean) => {
  if (success) {
    console.log('Erro reportado com sucesso ao suporte!');
    $q.notify({
      type: 'positive',
      message: 'Erro reportado! O suporte irá analisar.',
      position: 'top',
      timeout: 3000,
    });
  }
};

const reportarErroManual = () => {
  currentError.value = {
    mensagem: 'Reporte manual do utilizador',
    codigo: 'MANUAL',
    stack: '',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
  showErrorModal.value = true;
};

declare global {
  interface Window {
    reportarErro: () => void;
  }
}

window.reportarErro = reportarErroManual;

// 🔥 FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Inicializando app...');
    console.log('📱 isPWA:', isPWA.value);
    console.log('📱 canInstall:', canInstall.value);

    // 🔥 SÓ MOSTRA SPLASH SE FOR PWA
    if (isPWA.value) {
      loading.value = true;
      console.log('📱 PWA DETECTADO - Mostrando Splash Screen');
      showSplash.value = true;
      // Aguarda 2 segundos para o splash
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      console.log('🌐 WEB NORMAL - Carregando conteúdo imediato');
      loading.value = false;
      showSplash.value = false;
    }

    // 🔥 INICIALIZA AUTENTICAÇÃO
    authStore.initialize();

    // 🔥 SE TIVER TOKEN, BUSCA USUÁRIO
    if (authStore.token) {
      console.log('🔑 Token encontrado, buscando usuário...');
      await authStore.fetchUser();
      console.log('👤 Usuário:', authStore.user?.nome);
      console.log('📌 Tipo:', authStore.user?.tipo);
    } else {
      console.log('❌ Nenhum token encontrado');
    }

    // 🔥 REDIRECIONAMENTO - SÓ NO PWA
    if (isPWA.value) {
      console.log('🔄 Redirecionando PWA...');

      if (!authStore.isAuthenticated) {
        console.log('➡️ Usuário NÃO logado → /auth/login');
        await router.replace('/auth/login');
      } else {
        const userType = authStore.user?.tipo;

        if (userType === 'admin' || userType === 'root') {
          console.log('➡️ Admin → /admin/dashboard');
          await router.replace('/admin/dashboard');
        } else if (userType === 'prestador') {
          console.log('➡️ Prestador → /mobile/prestador/dashboard');
          await router.replace('/mobile/prestador/dashboard');
        } else {
          console.log('➡️ Cliente → /mobile/inicio');
          await router.replace('/mobile/inicio');
        }
      }

      // Aguarda o redirecionamento
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 🔥 ESCONDE TUDO
    showSplash.value = false;
    loading.value = false;

    console.log('✅ App inicializado com sucesso!');
  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
    abrirModalErro(err as Error, 'init');
    showSplash.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  console.log('🔄 App montado - Iniciando...');

  // 🔥 INICIA APLICAÇÃO
  void initializeApp();

  // 🔥 LISTENERS GLOBAIS
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>

<style scoped lang="scss">
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading-simple {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
}

.skeleton-header-simple {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-avatar-simple {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  flex: 1;
}

.skeleton-line-simple {
  height: 14px;
  border-radius: 7px;
  margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
}

.skeleton-card-avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-text {
  flex: 1;
}

.w-50 {
  width: 50%;
}
.w-40 {
  width: 40%;
}
.w-30 {
  width: 30%;
}
.w-60 {
  width: 60%;
}
</style>
