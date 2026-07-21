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
import { ref, onMounted } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UserChoiceResult {
  outcome: 'accepted' | 'dismissed';
}

const showInstallBanner = ref(false);
const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null);

async function installApp(): Promise<void> {
  if (!deferredInstallPrompt.value) {
    alert(
      '📱 Para instalar o EstouAqui:\n\n' +
      '🔹 Chrome/Edge: Clique no ícone de instalação na barra de endereço\n' +
      '🔹 Safari: Toque em "Compartilhar" > "Adicionar à Tela de Início"'
    );
    return;
  }

  try {
    await deferredInstallPrompt.value.prompt();
    const choiceResult: UserChoiceResult = await deferredInstallPrompt.value.userChoice;

    if (choiceResult.outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
      showInstallBanner.value = false;
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

onMounted(() => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  if (localStorage.getItem('pwa-installed') === 'true') {
    return;
  }

  if (localStorage.getItem('pwa-install-banner-dismissed')) {
    return;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt.value = e as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa-installed', 'true');
    showInstallBanner.value = false;
  });

  setTimeout(() => {
    if (!localStorage.getItem('pwa-installed') &&
        !localStorage.getItem('pwa-install-banner-dismissed')) {
      showInstallBanner.value = true;
    }
  }, 3000);
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
