<template>
  <div v-if="showBanner" class="install-banner">
    <div class="banner-content">
      <div class="banner-icon">
        <q-icon name="install_mobile" size="24px" />
      </div>
      <div class="banner-text">
        <div class="text-subtitle1">Instale o EstouAqui</div>
        <div class="text-caption">Tenha acesso rápido e offline</div>
      </div>
      <div class="banner-actions">
        <q-btn flat dense label="Agora não" @click="handleDismiss" />
        <q-btn flat dense label="Instalar" color="primary" @click="handleInstall" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showBanner = ref(false);

declare global {
  interface Window {
    installPWA: () => void;
    dismissInstallBanner: () => void;
  }
}

const checkAndShowBanner = () => {
  // 🔥 VERIFICA SE PODE MOSTRAR O BANNER
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstalled = localStorage.getItem('pwa-installed') === 'true';
  const isDismissed = localStorage.getItem('pwa-install-banner-dismissed') === 'true';

  // 🔥 MOSTRA O BANNER SE NÃO ESTIVER INSTALADO
  showBanner.value = !isStandalone && !isInstalled && !isDismissed;
};

const handleInstall = () => {
  if (window.installPWA) {
    window.installPWA();
    showBanner.value = false;
  }
};

const handleDismiss = () => {
  if (window.dismissInstallBanner) {
    window.dismissInstallBanner();
    showBanner.value = false;
  }
};

onMounted(() => {
  // 🔥 VERIFICA IMEDIATAMENTE
  checkAndShowBanner();

  // 🔥 VERIFICA NOVAMENTE APÓS 3 SEGUNDOS
  setTimeout(checkAndShowBanner, 3000);

  // 🔥 ESCUTA EVENTOS
  window.addEventListener('pwa-banner-update', checkAndShowBanner);
  window.addEventListener('pwa-ready', checkAndShowBanner);
  window.addEventListener('appinstalled', checkAndShowBanner);
});

onUnmounted(() => {
  window.removeEventListener('pwa-banner-update', checkAndShowBanner);
  window.removeEventListener('pwa-ready', checkAndShowBanner);
  window.removeEventListener('appinstalled', checkAndShowBanner);
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
