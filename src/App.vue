<template>
  <div v-if="loading" class="skeleton-loading-simple">
    <!-- Skeleton do header -->
    <div class="skeleton-header-simple">
      <div class="skeleton-avatar-simple"></div>
      <div class="skeleton-text">
        <div class="skeleton-line-simple w-50"></div>
        <div class="skeleton-line-simple w-30"></div>
      </div>
    </div>

    <!-- Skeleton dos cards -->
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
  <router-view v-else />

  <!-- Modal Global de Reportar Erro -->
  <ReportarErroModal
    v-model="showErrorModal"
    :erro-capturado="currentError"
    @enviado="onErrorReported"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import ReportarErroModal from 'src/components/ReportarErroModal.vue';
import type { AxiosError } from 'axios';

defineOptions({ name: 'App' });

const $q = useQuasar();
const authStore = useAuthStore();

interface ErrorInfo {
  mensagem: string;
  codigo: string;
  stack: string;
  url: string;
  contexto?: string; // ✅ opcional
  userAgent: string;
  timestamp: string;
}

const loading = ref(true);
const showErrorModal = ref(false);
const currentError = ref<ErrorInfo | null>(null);

// Flag para evitar múltiplos modals do mesmo erro
let lastErrorTime = 0;
const ERROR_COOLDOWN = 5000; // 5 segundos

// Capturar erros do Vue (onErrorCaptured)
// ✅ Opção 1: Remover a asserção (mais simples)
onErrorCaptured((err, instance, info) => {
  console.error('Erro capturado pelo Vue:', err, info);
  abrirModalErro(err instanceof Error ? err : new Error(String(err)), info);
  return false;
});
// Capturar erros globais do JavaScript
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Erro global capturado:', event.error);
  abrirModalErro(event.error || new Error(event.message), 'global');
  event.preventDefault();
};

// Capturar promessas rejeitadas
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Promise rejeitada:', event.reason);
  const erro = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  abrirModalErro(erro, 'promise');
  event.preventDefault();
};

// Abrir modal com informações do erro
const abrirModalErro = (erro: Error, contexto?: string) => {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_COOLDOWN) {
    console.log('Erro ignorado (cooldown)');
    return;
  }
  lastErrorTime = now;

  // Extrair informações do erro
  let mensagem = erro.message || 'Erro desconhecido';
  let codigo = '';
  const stack = erro.stack || '';

  // Tentar extrair código de status de erros HTTP/Axios
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

  // Tentar extrair código de erro de APIs
  const statusMatch = mensagem.match(/(\d{3})/);
  if (statusMatch && statusMatch[1] && !codigo) {
    codigo = statusMatch[1];
  }

  // ✅ Criar objeto sem undefined (só incluir contexto se existir)
  const errorData: ErrorInfo = {
    mensagem: mensagem,
    codigo: codigo,
    stack: stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  // ✅ Só adicionar contexto se existir (evita undefined)
  if (contexto) {
    errorData.contexto = contexto;
  }

  currentError.value = errorData;
  showErrorModal.value = true;
};

// Quando o reporte é enviado com sucesso
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

// Botão manual para reportar erro
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

// Expor função global para debug
declare global {
  interface Window {
    reportarErro: () => void;
  }
}

window.reportarErro = reportarErroManual;

// Inicialização
onMounted(() => {
  try {
    authStore.initialize();
  } catch (err) {
    console.error('Erro na inicialização:', err);
    abrirModalErro(err as Error, 'init');
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 600);
  }

  // Registrar handlers de erro
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
