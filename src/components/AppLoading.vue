<!-- src/components/AppLoading.vue -->
<template>
  <div class="app-loading">
    <div class="loading-content">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar a sua sessão...</p>
      <p class="q-mt-sm text-grey-5 text-caption">Aguarde um momento</p>
    </div>
  </div>
</template>

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
