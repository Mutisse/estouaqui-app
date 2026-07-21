// src/pwa/register-service-worker.ts
import { register } from 'register-service-worker';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UserChoiceResult {
  outcome: 'accepted' | 'dismissed';
}

declare global {
  interface Window {
    installPWA: () => void;
    dismissInstallBanner: () => void;
  }
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

// 🔥 CAPTURA O EVENTO
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new CustomEvent('pwa-ready'));
});

// 🔥 FUNÇÃO PARA INSTALAR
window.installPWA = function(): void {
  if (!deferredInstallPrompt) {
    alert(
      '📱 Para instalar o EstouAqui:\n\n' +
      '🔹 Chrome/Edge: Clique no ícone de instalação na barra de endereço\n' +
      '🔹 Safari: Toque em "Compartilhar" > "Adicionar à Tela de Início"'
    );
    return;
  }

  void deferredInstallPrompt.prompt();

  void deferredInstallPrompt.userChoice
    .then((choiceResult: UserChoiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        window.dispatchEvent(new CustomEvent('pwa-installed'));
        window.dispatchEvent(new CustomEvent('pwa-banner-update'));
      }
      deferredInstallPrompt = null;
    })
    .catch(() => {
      deferredInstallPrompt = null;
    });
};

// 🔥 FUNÇÃO PARA DISPENSAR
window.dismissInstallBanner = function(): void {
  localStorage.setItem('pwa-install-banner-dismissed', 'true');
  window.dispatchEvent(new CustomEvent('pwa-banner-update'));
};

window.addEventListener('appinstalled', () => {
  localStorage.setItem('pwa-installed', 'true');
  window.dispatchEvent(new CustomEvent('pwa-installed'));
  window.dispatchEvent(new CustomEvent('pwa-banner-update'));
});

register(process.env.SERVICE_WORKER_FILE, {
  ready() {},
  registered() {},
  cached() {},
  updatefound() {},
  updated() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  offline() {},
  error() {}
});

export {};
