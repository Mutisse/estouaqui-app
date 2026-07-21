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
    showPWAInstallPrompt: () => void;
  }
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let isPwaInstalled = false;

if (window.matchMedia('(display-mode: standalone)').matches) {
  isPwaInstalled = true;
}

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new CustomEvent('pwa-ready', {
    detail: { deferredInstallPrompt: e }
  }));
});

function showInstallPrompt(): void {
  if (!deferredInstallPrompt || isPwaInstalled) {
    return;
  }

  void deferredInstallPrompt.prompt();

  void deferredInstallPrompt.userChoice
    .then((choiceResult: UserChoiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        isPwaInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        window.dispatchEvent(new CustomEvent('pwa-installed'));
      }
      deferredInstallPrompt = null;
    })
    .catch(() => {
      deferredInstallPrompt = null;
    });
}

window.installPWA = function(): void {
  showInstallPrompt();
};

window.showPWAInstallPrompt = function(): void {
  showInstallPrompt();
};

window.addEventListener('appinstalled', () => {
  isPwaInstalled = true;
  localStorage.setItem('pwa-installed', 'true');
  window.dispatchEvent(new CustomEvent('pwa-installed'));
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

if (localStorage.getItem('pwa-installed') === 'true') {
  isPwaInstalled = true;
}

export {};
