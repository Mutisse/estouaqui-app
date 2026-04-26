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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

const loading = ref(true);
const authStore = useAuthStore();

onMounted(() => {
  try {
    authStore.initialize();
  } catch {
    // Erro silencioso
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 600);
  }
});
</script>

<style scoped lang="scss">
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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

.w-50 { width: 50%; }
.w-40 { width: 40%; }
.w-30 { width: 30%; }
.w-60 { width: 60%; }
</style>
