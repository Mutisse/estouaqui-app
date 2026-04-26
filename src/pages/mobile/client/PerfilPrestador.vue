<template>
  <q-page class="perfil-prestador-page">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-cover"></div>
        <div class="skeleton-avatar"></div>
        <div class="skeleton-name"></div>
        <div class="skeleton-rating"></div>
      </div>
      <div class="skeleton-favorite-btn"></div>
      <div class="skeleton-info-cards">
        <div v-for="i in 3" :key="i" class="skeleton-info-card"></div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-chips">
          <div v-for="i in 4" :key="i" class="skeleton-chip"></div>
        </div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-line w-40"></div>
        <div v-for="i in 2" :key="i" class="skeleton-servico">
          <div class="skeleton-servico-icon"></div>
          <div class="skeleton-servico-info">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-spinner">
        <q-spinner color="primary" size="40px" />
      </div>
    </div>

    <!-- Conteúdo original (sem loading com texto) -->
    <template v-else>
      <template v-if="prestador">
        <!-- Header com imagem de capa -->
        <div class="profile-header">
          <q-btn class="back-btn" flat round icon="arrow_back" color="white" @click="router.back" />
          <div class="cover-image" :style="{ backgroundImage: `url(${coverImage})` }">
            <div class="cover-overlay"></div>
          </div>

          <div class="profile-info">
            <q-avatar size="100px" class="profile-avatar">
              <img :src="prestador.foto || defaultAvatar" :alt="prestador.nome" />
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
              <span class="rating-value">{{ mediaFormatada }}</span>
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
                <q-icon name="work" color="primary" size="20px" />
                <div class="info-value">{{ prestador.profissao || 'Profissional' }}</div>
                <div class="info-label">profissão</div>
              </div>
            </div>
            <div class="col-4">
              <div class="info-card">
                <q-icon name="check_circle" color="primary" size="20px" />
                <div class="info-value">
                  {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
                </div>
                <div class="info-label">status</div>
              </div>
            </div>
            <div class="col-4">
              <div class="info-card">
                <q-icon name="verified_user" color="primary" size="20px" />
                <div class="info-value">
                  {{ prestador.verificado ? 'Verificado' : 'Não verificado' }}
                </div>
                <div class="info-label">verificação</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sobre -->
        <div class="section q-pa-md" v-if="prestador.sobre">
          <h3 class="section-title">Sobre</h3>
          <p class="section-text">{{ prestador.sobre }}</p>
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

        <!-- Serviços oferecidos -->
        <div class="section q-pa-md" v-if="prestador.servicos && prestador.servicos.length">
          <h3 class="section-title">Serviços oferecidos</h3>
          <div class="servicos-list">
            <div v-for="servico in prestador.servicos" :key="servico.id" class="servico-item">
              <q-icon :name="servico.icone || 'handyman'" color="primary" size="24px" />
              <div class="servico-info">
                <div class="servico-nome">{{ servico.nome }}</div>
                <div class="servico-preco">{{ formatarPreco(servico.preco) }}</div>
              </div>
              <div class="servico-duracao">{{ servico.duracao }} min</div>
            </div>
          </div>
        </div>

        <!-- Portfolio -->
        <div class="section q-pa-md" v-if="prestador.portfolio && prestador.portfolio.length">
          <h3 class="section-title">Portfólio</h3>
          <div class="portfolio-grid">
            <img
              v-for="(img, idx) in prestador.portfolio"
              :key="idx"
              :src="img"
              class="portfolio-image"
              @click="verImagem(img)"
            />
          </div>
        </div>

        <!-- Contato -->
        <div class="section q-pa-md">
          <h3 class="section-title">Contato</h3>
          <div class="contato-list">
            <div class="contato-item" @click="ligar" v-if="prestador.telefone">
              <q-icon name="phone" color="primary" size="24px" />
              <span>{{ prestador.telefone }}</span>
            </div>
            <div class="contato-item" @click="enviarEmail" v-if="prestador.email">
              <q-icon name="email" color="primary" size="24px" />
              <span>{{ prestador.email }}</span>
            </div>
          </div>
        </div>

        <!-- Últimas avaliações -->
        <div class="section q-pa-md" v-if="prestador.avaliacoes && prestador.avaliacoes.length">
          <h3 class="section-title">Últimas avaliações</h3>
          <div class="avaliacoes-list">
            <div
              v-for="avaliacao in prestador.avaliacoes.slice(0, 3)"
              :key="avaliacao.id"
              class="avaliacao-item"
            >
              <div class="avaliacao-header">
                <q-avatar size="32px">
                  <img
                    :src="avaliacao.cliente?.foto || defaultAvatar"
                    :alt="avaliacao.cliente?.nome"
                  />
                </q-avatar>
                <div class="avaliacao-info">
                  <div class="avaliacao-nome">{{ avaliacao.cliente?.nome || 'Cliente' }}</div>
                  <div class="avaliacao-stars">
                    <q-icon
                      v-for="star in 5"
                      :key="star"
                      :name="star <= avaliacao.nota ? 'star' : 'star_border'"
                      color="yellow"
                      size="16px"
                    />
                  </div>
                </div>
                <div class="avaliacao-data">{{ formatarData(avaliacao.created_at) }}</div>
              </div>
              <p class="avaliacao-comentario" v-if="avaliacao.comentario">
                {{ avaliacao.comentario }}
              </p>
            </div>
          </div>
          <q-btn
            v-if="prestador.total_avaliacoes > 3"
            flat
            color="primary"
            label="Ver todas as avaliações"
            class="full-width q-mt-md"
            @click="verTodasAvaliacoes"
            no-caps
          />
        </div>

        <div class="bottom-spacer"></div>
      </template>

      <!-- Erro -->
      <div v-else class="text-center q-pa-xl">
        <q-icon name="error" size="64px" color="negative" />
        <p class="text-h6 q-mt-md">Prestador não encontrado</p>
        <q-btn color="primary" label="Voltar" @click="router.back" />
      </div>
    </template>
  </q-page>

  <!-- ✅ BOTÃO FLUTUANTE (FAB) - CANTO INFERIOR DIREITO -->
  <q-btn
    fab
    color="primary"
    icon="chat"
    class="chat-fab"
    @click="abrirChat"
  >
    <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
      💬 Conversar com {{ prestador?.nome?.split(' ')[0] || 'prestador' }}
    </q-tooltip>
  </q-btn>
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

const carregamentoInicial = ref(true);
const prestador = ref<PrestadorData | null>(null);
const isFavorito = ref(false);
const favoritoLoading = ref(false);

const prestadorId = computed(() => Number(route.params.id));

const defaultAvatar = 'https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=100';

const coverImage =
  'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const mediaFormatada = computed(() => {
  const media = prestador.value?.media_avaliacao;
  if (media === null || media === undefined) return '0';
  const num = typeof media === 'string' ? parseFloat(media) : media;
  if (isNaN(num)) return '0';
  return num.toFixed(1);
});

const formatarPreco = (preco: number) => {
  if (!preco && preco !== 0) return 'A combinar';
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(preco);
};

const formatarData = (data: string) => {
  if (!data) return '';
  const date = new Date(data);
  return date.toLocaleDateString('pt-PT');
};

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

const verImagem = (img: string) => {
  $q.dialog({
    component: 'q-img',
    componentProps: { src: img, style: 'max-width: 90vw; max-height: 90vh;' },
  });
};

const verTodasAvaliacoes = () => {
  void router.push(`/mobile/prestador/${prestadorId.value}/avaliacoes`);
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
    $q.notify({ type: 'negative', message: 'Erro ao alterar favorito', position: 'top' });
  } finally {
    favoritoLoading.value = false;
  }
};

const verificarFavorito = async () => {
  try {
    isFavorito.value = await clienteStore.checkFavorito(prestadorId.value);
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
  }
};

const carregarPrestador = async () => {
  carregamentoInicial.value = true;
  try {
    const data = await clienteStore.fetchPrestadorDetalhes(prestadorId.value);
    if (data) {
      prestador.value = data;
      await verificarFavorito();
    } else {
      $q.notify({ type: 'negative', message: 'Prestador não encontrado', position: 'top' });
    }
  } catch (error) {
    console.error('Erro ao carregar prestador:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perfil do prestador',
      position: 'top',
    });
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

onMounted(() => {
  carregarPrestador().catch((error) => {
    console.error('Erro no onMounted:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar página', position: 'top' });
  });
});
</script>

<style scoped lang="scss">
// ✅ TODAS AS VARIÁVEIS DEFINIDAS
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
  position: relative;
  min-height: 250px;
}

.skeleton-back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.skeleton-cover {
  height: 150px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-avatar {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border: 4px solid white;
  z-index: 5;
}

.skeleton-name {
  position: absolute;
  top: 210px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-rating {
  position: absolute;
  top: 245px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-favorite-btn {
  margin: 16px auto;
  width: 180px;
  height: 40px;
  border-radius: 30px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info-cards {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.skeleton-info-card {
  flex: 1;
  height: 80px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.skeleton-section {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.skeleton-chip {
  width: 100px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-servico {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $gray-200;
}

.skeleton-servico-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-servico-info {
  flex: 1;
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

.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

/* ========================================== */
/* ESTILOS ORIGINAIS (mantidos sem alterações) */
/* ========================================== */

.perfil-prestador-page {
  background: $gray-100;
  min-height: 100vh;
  padding-bottom: 0;
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
      font-size: 0.85rem;
      font-weight: 700;
      color: $gray-800;
      margin: 5px 0 2px;
      word-break: break-word;
    }

    .info-label {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}

.section {
  background: white;
  margin: 12px 12px;
  border-radius: 12px;
  padding: 16px;

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

.servicos-list {
  .servico-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $gray-200;

    &:last-child {
      border-bottom: none;
    }

    .servico-info {
      flex: 1;

      .servico-nome {
        font-weight: 500;
        color: $gray-800;
      }

      .servico-preco {
        font-size: 0.8rem;
        color: $purple-primary;
        font-weight: 600;
      }
    }

    .servico-duracao {
      font-size: 0.8rem;
      color: $gray-500;
    }
  }
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  .portfolio-image {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }
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

.avaliacoes-list {
  .avaliacao-item {
    padding: 12px 0;
    border-bottom: 1px solid $gray-200;

    &:last-child {
      border-bottom: none;
    }

    .avaliacao-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .avaliacao-info {
        flex: 1;

        .avaliacao-nome {
          font-weight: 500;
          color: $gray-800;
          font-size: 0.9rem;
        }
      }

      .avaliacao-data {
        font-size: 0.7rem;
        color: $gray-500;
      }
    }

    .avaliacao-comentario {
      margin: 0;
      font-size: 0.85rem;
      color: $gray-600;
      line-height: 1.4;
      padding-left: 44px;
    }
  }
}

.bottom-spacer {
  height: 80px;
}

// ✅ BOTÃO FLUTUANTE - CANTO INFERIOR DIREITO
.chat-fab {
  position: fixed !important;
  bottom: 100px !important;
  right: 20px !important;
  z-index: 9999 !important;
  margin: 0 !important;
}
</style>
