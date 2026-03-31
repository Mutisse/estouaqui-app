<!-- src/App.vue -->
<template>
  <div v-if="loading" class="app-loading">
    <div class="loading-content">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar a sua sessão...</p>
    </div>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

const loading = ref(true);
const authStore = useAuthStore();

onMounted(async () => {
  try {
    // Verificar se tem token e restaurar usuário
    await authStore.initialize();
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loading-content {
    text-align: center;
  }
}
</style>
