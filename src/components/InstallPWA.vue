<template>
  <div v-if="showInstallBanner" class="install-banner">
    <div class="banner-content">
      <div class="banner-icon">
        <q-icon name="install_mobile" size="24px" />
      </div>
      <div class="banner-text">
        <div class="text-subtitle1">Instale o EstouAqui</div>
        <div class="text-caption">Tenha acesso rápido e offline</div>
      </div>
      <div class="banner-actions">
        <q-btn flat dense label="Agora não" @click="dismissBanner" />
        <q-btn flat dense label="Instalar" color="primary" @click="installApp" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// ============================================================
// TIPOS
// ============================================================
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UserChoiceResult {
  outcome: 'accepted' | 'dismissed';
}

// ============================================================
// EXTENDE A INTERFACE WINDOW
// ============================================================
declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent;
  }
}

// ============================================================
// STATE
// ============================================================
const showInstallBanner = ref(false);
const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null);
let bannerTimeout: ReturnType<typeof setTimeout> | null = null;

// ============================================================
// FUNÇÃO PARA MOSTRAR O BANNER APÓS 3 SEGUNDOS
// ============================================================
function showBannerAfterDelay(): void {
  // Verifica se já está instalado
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallBanner.value = false;
    return;
  }

  // Verifica se já foi mostrado
  if (localStorage.getItem('pwa-install-banner-dismissed')) {
    showInstallBanner.value = false;
    return;
  }

  // Verifica se já foi instalado
  if (localStorage.getItem('pwa-installed') === 'true') {
    showInstallBanner.value = false;
    return;
  }

  // Verifica se a PWA está pronta para instalação
  if (!deferredInstallPrompt.value) {
    // Se não estiver pronta, tenta novamente após 2 segundos
    setTimeout(() => {
      showBannerAfterDelay();
    }, 2000);
    return;
  }

  // Mostra o banner após 3 segundos
  bannerTimeout = setTimeout(() => {
    showInstallBanner.value = true;
  }, 3000);
}

// ============================================================
// HANDLERS
// ============================================================
function handlePwaReady(event: Event): void {
  const customEvent = event as CustomEvent<{ deferredInstallPrompt: BeforeInstallPromptEvent }>;
  deferredInstallPrompt.value = customEvent.detail?.deferredInstallPrompt || null;

  console.log('✅ PWA pronta para instalação!');

  // Mostra o banner após 3 segundos
  showBannerAfterDelay();
}

function handlePwaInstalled(): void {
  showInstallBanner.value = false;
  deferredInstallPrompt.value = null;
  localStorage.setItem('pwa-installed', 'true');
}

// ============================================================
// INSTALAÇÃO (CHAMADA POR CLICK DO USUÁRIO)
// ============================================================
async function installApp(): Promise<void> {
  if (!deferredInstallPrompt.value) {
    console.warn('⚠️ PWA não está pronta para instalação.');
    return;
  }

  try {
    // AGORA COM INTERAÇÃO DO USUÁRIO (CLICK)
    await deferredInstallPrompt.value.prompt();
    const choiceResult: UserChoiceResult = await deferredInstallPrompt.value.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalar a PWA');
      localStorage.setItem('pwa-installed', 'true');
      showInstallBanner.value = false;
    } else {
      console.log('❌ Usuário recusou instalar a PWA');
    }
  } catch (error) {
    console.error('Erro ao instalar PWA:', error);
  } finally {
    deferredInstallPrompt.value = null;
  }
}

function dismissBanner(): void {
  showInstallBanner.value = false;
  localStorage.setItem('pwa-install-banner-dismissed', 'true');
}

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(() => {
  // Verifica se já está instalado
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallBanner.value = false;
    return;
  }

  // Verifica se já foi instalado antes
  if (localStorage.getItem('pwa-installed') === 'true') {
    showInstallBanner.value = false;
    return;
  }

  // Verifica se o banner foi dispensado
  if (localStorage.getItem('pwa-install-banner-dismissed')) {
    showInstallBanner.value = false;
    return;
  }

  // ESCUTA EVENTOS
  window.addEventListener('pwa-ready', handlePwaReady);
  window.addEventListener('pwa-installed', handlePwaInstalled);

  // SE O EVENTO JÁ TIVER OCORRIDO ANTES DO onMounted
  // Verifica se já tem o deferredInstallPrompt disponível
  if (window.deferredInstallPrompt) {
    deferredInstallPrompt.value = window.deferredInstallPrompt;
    showBannerAfterDelay();
  }
});

onUnmounted(() => {
  window.removeEventListener('pwa-ready', handlePwaReady);
  window.removeEventListener('pwa-installed', handlePwaInstalled);
  if (bannerTimeout) {
    clearTimeout(bannerTimeout);
  }
});
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  padding: 16px 20px;
  animation: slideUp 0.5s ease-in-out;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.banner-icon {
  color: #1976d2;
  flex-shrink: 0;
}

.banner-icon .q-icon {
  font-size: 28px;
}

.banner-text {
  flex: 1;
}

.banner-text .text-subtitle1 {
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
}

.banner-text .text-caption {
  font-size: 13px;
  color: #666;
}

.banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.banner-actions .q-btn {
  font-weight: 600;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .install-banner {
    padding: 12px 16px;
  }

  .banner-content {
    flex-wrap: wrap;
    gap: 8px;
  }

  .banner-text .text-subtitle1 {
    font-size: 14px;
  }

  .banner-text .text-caption {
    font-size: 12px;
  }

  .banner-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
