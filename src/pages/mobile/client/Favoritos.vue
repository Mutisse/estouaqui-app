<template>
  <q-page class="favoritos-page bg-grey-1">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-cards q-pa-md">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-card-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-30"></div>
          </div>
          <div class="skeleton-menu"></div>
        </div>
      </div>
      <div class="skeleton-spinner">
        <q-spinner color="primary" size="40px" />
      </div>
    </div>

    <!-- Conteúdo original (sem loading com texto) -->
    <template v-else>
      <!-- Cabeçalho -->
      <div class="page-header q-pa-md">
        <div class="text-h5 text-bold">Meus Favoritos</div>
      </div>

      <!-- Lista de favoritos -->
      <div class="q-pa-md">
        <div v-if="favoritosList.length === 0" class="empty-state">
          <q-icon name="favorite_border" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum favorito</div>
          <div class="text-grey-6 q-mb-md">Adicione prestadores aos favoritos para vê-los aqui</div>
          <q-btn color="primary" label="Explorar serviços" to="/mobile/lista-prestadores" />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="favorito in favoritosList" :key="favorito.id" class="col-12">
            <q-card class="favorito-card" flat bordered>
              <q-card-section class="row items-center">
                <q-avatar size="60px" class="q-mr-sm">
                  <img
                    :src="favorito.prestador.foto || getAvatarUrl(favorito.prestador.nome)"
                    :alt="favorito.prestador.nome"
                  />
                </q-avatar>
                <div class="col">
                  <div class="favorito-nome">
                    {{ favorito.prestador.nome }}
                    <q-icon
                      v-if="favorito.prestador.verificado"
                      name="verified"
                      color="primary"
                      size="16px"
                    />
                  </div>
                  <div class="favorito-categoria">
                    {{ favorito.prestador.categorias?.[0]?.nome || favorito.prestador.profissao || 'Profissional' }}
                  </div>
                  <div class="favorito-rating">
                    <q-rating
                      v-model="favorito.prestador.media_avaliacao"
                      size="14px"
                      :max="5"
                      color="yellow"
                      readonly
                    />
                    <span class="rating-count">({{ favorito.prestador.total_avaliacoes || 0 }})</span>
                  </div>
                </div>
                <div>
                  <q-btn flat round icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 150px">
                        <q-item clickable v-close-popup @click="confirmarRemover(favorito)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Remover</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat dense icon="chat" label="Chat" @click="abrirChat(favorito.prestador.id)" />
                <q-btn flat dense icon="calendar_month" label="Agendar" @click="agendarServico(favorito.prestador.id)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore, type FavoritoData } from 'src/stores/cliente-store';

defineOptions({
  name: 'MobileFavoritos',
});

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();

const carregamentoInicial = ref(true);

// Computed para acessar os favoritos do store
const favoritosList = computed(() => {
  return clienteStore.favoritos || [];
});

// Gerar URL de avatar baseada no nome
const getAvatarUrl = (nome: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=fff&size=60`;
};

// Remover favorito
const removerFavorito = async (favorito: FavoritoData) => {
  try {
    const success = await clienteStore.removerFavorito(favorito.prestador.id);
    if (success) {
      $q.notify({
        type: 'positive',
        message: `${favorito.prestador.nome} removido dos favoritos`,
        position: 'top',
        timeout: 2000,
      });
      await clienteStore.fetchFavoritos();
    }
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao remover favorito',
      position: 'top',
    });
  }
};

// Confirmar remoção com dialog
const confirmarRemover = (favorito: FavoritoData) => {
  $q.dialog({
    title: 'Remover favorito',
    message: `Deseja remover ${favorito.prestador.nome} dos favoritos?`,
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: 'Remover',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void removerFavorito(favorito);
  });
};

// Abrir chat com o prestador
const abrirChat = (prestadorId: number) => {
  void router.push(`/mobile/chat/${prestadorId}`);
};

// Agendar serviço
const agendarServico = (prestadorId: number) => {
  void router.push(`/mobile/agendar/${prestadorId}`);
};

// Carregar favoritos
const carregarFavoritos = async () => {
  try {
    await clienteStore.fetchFavoritos();
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar favoritos',
      position: 'top',
    });
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

// Carregar dados ao montar
onMounted(() => {
  void carregarFavoritos();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: $gray-100;
  min-height: 100vh;
}

.skeleton-header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-title {
  width: 150px;
  height: 28px;
  border-radius: 14px;
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
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid $gray-200;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-menu {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.favoritos-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.favorito-card {
  border-radius: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .favorito-nome {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .favorito-categoria {
    font-size: 0.85rem;
    color: $gray-600;
  }

  .favorito-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}
</style>
