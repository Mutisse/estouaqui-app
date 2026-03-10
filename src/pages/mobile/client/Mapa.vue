<!-- pages/mobile/Mapa.vue -->
<template>
  <q-page class="mapa-page">
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="header-title">Mapa de prestadores</div>
    </div>

    <div class="map-container">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d14348.000000000001!2d32.5733!3d-25.9623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sprestadores%20de%20servi%C3%A7os%20em%20Maputo!5e0!3m2!1spt-PT!2s!4v1620000000000!5m2!1spt-PT!2s"
        width="100%"
        height="100%"
        style="border:0;"
        :allowfullscreen="true"
        loading="lazy"
        title="Mapa de prestadores"
      ></iframe>
    </div>

    <div class="prestadores-list q-pa-md">
      <div class="text-subtitle1 q-mb-md">Prestadores próximos (5)</div>
      <q-list separator>
        <q-item
          v-for="n in 5"
          :key="n"
          clickable
          v-ripple
          :to="'/mobile/perfil-prestador/' + n"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="`https://i.pravatar.cc/150?img=${n}`" alt="avatar">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Prestador {{ n }}</q-item-label>
            <q-item-label caption>
              <q-icon name="star" color="yellow" size="16px" /> 4.8 - 1.2km
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary">Disponível</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({
  name: 'MapaPage'
});

const router = useRouter();
</script>

<style scoped lang="scss">
.mapa-page {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
  }
}

.map-container {
  height: 40vh;
  flex-shrink: 0;
}

.prestadores-list {
  flex: 1;
  overflow-y: auto;
}
</style>
