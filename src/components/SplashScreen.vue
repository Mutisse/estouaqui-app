<template>
  <!-- SÓ RENDERIZA SE FOR PWA STANDALONE -->
  <div v-if="isPWA" class="splash-screen">
    <div class="splash-content">
      <div class="logo-container">
        <img
          src="~assets/logo.png"
          alt="EstouAqui"
          class="logo"
          :style="{ opacity: logoOpacity }"
        />
      </div>
      <div class="loading-container">
        <q-spinner color="primary" size="3em" :thickness="3" />
        <p class="loading-text">Carregando...</p>
      </div>
      <div class="version">v1.0.0</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const logoOpacity = ref(0);

// 🔥 SOMENTE PWA STANDALONE - IGNORA localStorage
const isPWA = computed(() => {
  const nav = window.navigator as NavigatorWithStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
});

onMounted(() => {
  if (isPWA.value) {
    console.log('📱 SplashScreen: PWA detectado, mostrando splash');
    setTimeout(() => {
      logoOpacity.value = 1;
    }, 100);
  } else {
    console.log('🌐 SplashScreen: Web detectado, NÃO MOSTRANDO splash');
  }
});
</script>


<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeOut 1.5s ease-in-out forwards;
  animation-delay: 1.5s;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo-container {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.5s ease;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.version {
  position: absolute;
  bottom: 40px;
  color: #999;
  font-size: 12px;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}

/* Suporte para modo escuro */
@media (prefers-color-scheme: dark) {
  .splash-screen {
    background: #1e1e1e;
  }
  .loading-text {
    color: #aaa;
  }
  .version {
    color: #666;
  }
}
</style>
