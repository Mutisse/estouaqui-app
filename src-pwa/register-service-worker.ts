import { register } from 'register-service-worker';

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
    installPWA: () => void;
    showPWAInstallPrompt: () => void;
  }
}

// ============================================================
// VARIÁVEIS
// ============================================================
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let isPwaInstalled = false;

// ============================================================
// DETECTA SE A PWA JÁ ESTÁ INSTALADA
// ============================================================
if (window.matchMedia('(display-mode: standalone)').matches) {
  isPwaInstalled = true;
}

// ============================================================
// ESCUTA O EVENTO DE INSTALAÇÃO
// ============================================================
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;

  console.log('✅ PWA pronta para instalação!');

  // DISPARA EVENTO PARA O APP MOSTRAR BOTÃO
  window.dispatchEvent(new CustomEvent('pwa-ready', {
    detail: { deferredInstallPrompt: e }
  }));
});

// ============================================================
// FUNÇÃO PARA MOSTRAR O PROMPT (SÓ COM INTERAÇÃO DO USUÁRIO)
// ============================================================
function showInstallPrompt(): void {
  if (!deferredInstallPrompt) {
    console.warn('⚠️ PWA não está pronta para instalação.');
    return;
  }

  if (isPwaInstalled) {
    console.warn('⚠️ PWA já está instalada.');
    return;
  }

  // MOSTRA O PROMPT (CHAMADO POR CLICK DO USUÁRIO)
  void deferredInstallPrompt.prompt();

  void deferredInstallPrompt.userChoice
    .then((choiceResult: UserChoiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar a PWA');
        isPwaInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        window.dispatchEvent(new CustomEvent('pwa-installed'));
      } else {
        console.log('❌ Usuário recusou instalar a PWA');
      }
      deferredInstallPrompt = null;
    })
    .catch((error: Error) => {
      console.error('Erro ao instalar PWA:', error);
      deferredInstallPrompt = null;
    });
}

// ============================================================
// EXPÕE FUNÇÃO GLOBAL PARA INSTALAÇÃO (DEVE SER CHAMADA POR CLICK)
// ============================================================
window.installPWA = function(): void {
  showInstallPrompt();
};

// TAMBÉM EXPÕE COM NOME MAIS CLARO
window.showPWAInstallPrompt = function(): void {
  showInstallPrompt();
};

// ============================================================
// QUANDO A PWA FOR INSTALADA
// ============================================================
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada com sucesso!');
  isPwaInstalled = true;
  localStorage.setItem('pwa-installed', 'true');
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// ============================================================
// REGISTRO DO SERVICE WORKER
// ============================================================
register(process.env.SERVICE_WORKER_FILE, {
  ready() {
    console.log('✅ Service worker está ativo.');
  },

  registered() {
    console.log('✅ Service worker registrado.');
  },

  cached() {
    console.log('✅ Conteúdo cacheado para uso offline.');
  },

  updatefound() {
    console.log('🔄 Nova versão do service worker encontrada.');
  },

  updated() {
    console.log('✅ Nova versão disponível; recarregue a página.');
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },

  offline() {
    console.log('📴 Modo offline ativado.');
  },

  error(error: Error) {
    console.error('❌ Erro no service worker:', error);
  }
});

// ============================================================
// VERIFICA SE A PWA JÁ FOI INSTALADA
// ============================================================
if (localStorage.getItem('pwa-installed') === 'true') {
  isPwaInstalled = true;
}

console.log('📱 PWA Register Service Worker carregado!');
console.log('💡 Use window.installPWA() para instalar (com interação do usuário)');

export {};
