// src/boot/pwa-install.ts
import { boot } from 'quasar/wrappers';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let installBannerVisible = false;

// 🔥 FUNÇÃO PARA MOSTRAR O BANNER
export function showInstallBanner(): boolean {
  return installBannerVisible;
}

// 🔥 FUNÇÃO PARA INSTALAR
export function installPWA(): void {
  if (deferredInstallPrompt) {
    // 🔥 CORRIGIDO: Adiciona .catch() para tratar erro
    deferredInstallPrompt
      .prompt()
      .then(() => {
        return deferredInstallPrompt?.userChoice;
      })
      .then((choiceResult) => {
        if (choiceResult?.outcome === 'accepted') {
          console.log('✅ PWA instalado com sucesso!');
          localStorage.setItem('pwa-installed', 'true');
          installBannerVisible = false;
        } else {
          console.log('❌ Usuário recusou instalação');
        }
        deferredInstallPrompt = null;
      })
      .catch((error) => {
        console.error('❌ Erro ao instalar PWA:', error);
        deferredInstallPrompt = null;
      });
  } else {
    alert(
      '📱 Para instalar o EstouAqui:\n\n' +
      '🔹 Chrome/Edge: Clique no ícone de instalação na barra de endereço\n' +
      '🔹 Safari: Toque em "Compartilhar" > "Adicionar à Tela de Início"'
    );
  }
}

// 🔥 FUNÇÃO PARA DISPENSAR BANNER
export function dismissInstallBanner(): void {
  installBannerVisible = false;
  localStorage.setItem('pwa-install-banner-dismissed', 'true');
  // DISPARA EVENTO PARA ATUALIZAR O COMPONENTE
  window.dispatchEvent(new CustomEvent('pwa-banner-update'));
}

export default boot(() => {
  console.log('🚀 Boot PWA Install iniciado...');

  // 🔥 ESCUTA O EVENTO DE INSTALAÇÃO
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    console.log('🔄 beforeinstallprompt disparado');
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;

    // 🔥 MOSTRA O BANNER APÓS 3 SEGUNDOS
    setTimeout(() => {
      if (
        !localStorage.getItem('pwa-installed') &&
        !localStorage.getItem('pwa-install-banner-dismissed') &&
        !window.matchMedia('(display-mode: standalone)').matches
      ) {
        console.log('📢 Mostrando banner de instalação');
        installBannerVisible = true;
        // DISPARA EVENTO PARA O COMPONENTE
        window.dispatchEvent(new CustomEvent('pwa-banner-update'));
      }
    }, 3000);
  });

  // 🔥 QUANDO INSTALADO
  window.addEventListener('appinstalled', () => {
    console.log('✅ App instalado!');
    localStorage.setItem('pwa-installed', 'true');
    installBannerVisible = false;
    window.dispatchEvent(new CustomEvent('pwa-banner-update'));
  });

  // 🔥 DISPONIBILIZA AS FUNÇÕES GLOBALMENTE
  window.installPWA = installPWA;
  window.dismissInstallBanner = dismissInstallBanner;
});

declare global {
  interface Window {
    installPWA: () => void;
    dismissInstallBanner: () => void;
  }
}
