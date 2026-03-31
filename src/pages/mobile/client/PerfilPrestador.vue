<template>
  <q-page class="perfil-prestador-page">
    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar perfil do prestador...</p>
    </div>

    <template v-else-if="prestador">
      <!-- Header com imagem de capa -->
      <div class="profile-header">
        <q-btn
          class="back-btn"
          flat
          round
          icon="arrow_back"
          color="white"
          @click="router.back"
        />
        <div class="cover-image" :style="{ backgroundImage: `url(${coverImage})` }">
          <div class="cover-overlay"></div>
        </div>

        <div class="profile-info">
          <q-avatar size="100px" class="profile-avatar">
            <img :src="prestador.foto || defaultAvatar" :alt="prestador.nome">
          </q-avatar>
          <div class="profile-name-wrapper">
            <h2 class="profile-name">{{ prestador.nome }}</h2>
            <q-icon
              v-if="prestador.verificado"
              name="verified"
              color="primary"
              size="20px"
              class="verified-icon"
            />
          </div>
          <div class="profile-rating">
            <q-icon name="star" color="yellow" size="20px" />
            <span class="rating-value">{{ prestador.media_avaliacao?.toFixed(1) || 0 }}</span>
            <span class="rating-count">({{ prestador.total_avaliacoes || 0 }} avaliações)</span>
          </div>
        </div>
      </div>

      <!-- Botão de favorito -->
      <div class="favorite-btn-wrapper q-pa-md">
        <q-btn
          :color="isFavorito ? 'red' : 'grey-4'"
          :icon="isFavorito ? 'favorite' : 'favorite_border'"
          :label="isFavorito ? 'Favorito' : 'Adicionar aos favoritos'"
          outline
          no-caps
          class="favorite-btn"
          :loading="favoritoLoading"
          @click="toggleFavorito"
        />
      </div>

      <!-- Informações rápidas -->
      <div class="info-cards q-px-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="info-card">
              <q-icon name="location_on" color="primary" size="20px" />
              <div class="info-value">{{ prestador.distancia || '--' }}km</div>
              <div class="info-label">distância</div>
            </div>
          </div>
          <div class="col-4">
            <div class="info-card">
              <q-icon name="work" color="primary" size="20px" />
              <div class="info-value">{{ prestador.profissao || 'Profissional' }}</div>
              <div class="info-label">profissão</div>
            </div>
          </div>
          <div class="col-4">
            <div class="info-card">
              <q-icon name="check_circle" color="primary" size="20px" />
              <div class="info-value">{{ prestador.disponivel ? 'Disponível' : 'Indisponível' }}</div>
              <div class="info-label">status</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sobre -->
      <div class="section q-pa-md">
        <h3 class="section-title">Sobre</h3>
        <p class="section-text">{{ prestador.sobre || 'Nenhuma descrição fornecida.' }}</p>
      </div>

      <!-- Categorias -->
      <div class="section q-pa-md">
        <h3 class="section-title">Especialidades</h3>
        <div class="categorias-list">
          <q-chip
            v-for="categoria in prestador.categorias"
            :key="categoria.id"
            color="primary"
            text-color="white"
            dense
          >
            {{ categoria.nome }}
          </q-chip>
          <q-chip v-if="!prestador.categorias?.length" color="grey-3" text-color="grey-7" dense>
            Nenhuma categoria definida
          </q-chip>
        </div>
      </div>

      <!-- Contato -->
      <div class="section q-pa-md">
        <h3 class="section-title">Contato</h3>
        <div class="contato-list">
          <div class="contato-item" @click="ligar">
            <q-icon name="phone" color="primary" size="24px" />
            <span>{{ prestador.telefone }}</span>
          </div>
          <div class="contato-item" @click="enviarEmail">
            <q-icon name="email" color="primary" size="24px" />
            <span>{{ prestador.email }}</span>
          </div>
        </div>
      </div>

      <!-- Botão de contacto -->
      <div class="contact-footer q-pa-md">
        <q-btn
          unelevated
          color="primary"
          label="Enviar mensagem"
          icon="chat"
          size="lg"
          class="full-width"
          @click="abrirChat"
          no-caps
        />
      </div>
    </template>

    <!-- Erro -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error" size="64px" color="negative" />
      <p class="text-h6 q-mt-md">Prestador não encontrado</p>
      <q-btn color="primary" label="Voltar" @click="router.back" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore, type PrestadorData } from 'src/stores/cliente-store';

defineOptions({
  name: 'PerfilPrestadorPage',
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const clienteStore = useClienteStore();

const loading = ref(true);
const prestador = ref<PrestadorData | null>(null);
const isFavorito = ref(false);
const favoritoLoading = ref(false);

const prestadorId = computed(() => Number(route.params.id));

const defaultAvatar = 'https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=100';

const coverImage = computed(() => {
  // Imagem de capa padrão
  return 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
});

// Funções auxiliares
const ligar = () => {
  if (prestador.value?.telefone) {
    window.location.href = `tel:${prestador.value.telefone}`;
  }
};

const enviarEmail = () => {
  if (prestador.value?.email) {
    window.location.href = `mailto:${prestador.value.email}`;
  }
};

const abrirChat = () => {
  void router.push(`/mobile/chat/${prestadorId.value}`);
};

const toggleFavorito = async () => {
  if (!prestador.value) return;

  favoritoLoading.value = true;
  try {
    if (isFavorito.value) {
      const success = await clienteStore.removerFavorito(prestadorId.value);
      if (success) {
        isFavorito.value = false;
        $q.notify({
          type: 'positive',
          message: 'Removido dos favoritos',
          position: 'top',
          timeout: 2000,
        });
      }
    } else {
      const success = await clienteStore.adicionarFavorito(prestadorId.value);
      if (success) {
        isFavorito.value = true;
        $q.notify({
          type: 'positive',
          message: 'Adicionado aos favoritos',
          position: 'top',
          timeout: 2000,
        });
      }
    }
  } catch (error) {
    console.error('Erro ao alterar favorito:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao alterar favorito',
      position: 'top',
    });
  } finally {
    favoritoLoading.value = false;
  }
};

// Verificar se o prestador está nos favoritos
const verificarFavorito = async () => {
  try {
    isFavorito.value = await clienteStore.checkFavorito(prestadorId.value);
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
  }
};

// Carregar dados do prestador
const carregarPrestador = async () => {
  loading.value = true;
  try {
    const data = await clienteStore.fetchPrestadorDetalhes(prestadorId.value);
    if (data) {
      prestador.value = data;
      await verificarFavorito();
    }
  } catch (error) {
    console.error('Erro ao carregar prestador:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perfil do prestador',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void carregarPrestador();
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

.perfil-prestador-page {
  background: $gray-100;
  min-height: 100vh;
  padding-bottom: 80px;
}

.profile-header {
  position: relative;
  min-height: 250px;

  .back-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
  }

  .cover-image {
    height: 150px;
    background-size: cover;
    background-position: center;
    position: relative;

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
    }
  }

  .profile-info {
    position: relative;
    margin-top: -50px;
    padding: 0 20px 20px;
    text-align: center;

    .profile-avatar {
      border: 4px solid white;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;
    }

    .profile-name-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .profile-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: $gray-900;
      margin: 0;
    }

    .verified-icon {
      margin-top: 4px;
    }

    .profile-rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 5px;

      .rating-value {
        font-weight: 600;
        color: $gray-800;
      }

      .rating-count {
        color: $gray-600;
        font-size: 0.9rem;
      }
    }
  }
}

.favorite-btn-wrapper {
  display: flex;
  justify-content: center;

  .favorite-btn {
    border-radius: 30px;
    padding: 8px 24px;
  }
}

.info-cards {
  .info-card {
    background: white;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    .info-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: $gray-800;
      margin: 5px 0 2px;
    }

    .info-label {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}

.section {
  background: white;
  margin: 12px 0;

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
    margin: 0 0 12px;
  }

  .section-text {
    color: $gray-600;
    line-height: 1.6;
    margin: 0;
  }
}

.categorias-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contato-list {
  .contato-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $gray-200;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    span {
      color: $gray-700;
      font-size: 0.9rem;
    }

    &:hover {
      background: $gray-50;
    }
  }
}

.contact-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}
</style>
