<template>
  <div class="favoritos-page">

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-cards">
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
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- ===== CABEÇALHO ===== -->
      <div class="page-header">
        <h1 class="page-title">Meus Favoritos</h1>
        <button v-if="favoritosList.length > 0" class="clear-all-btn" @click="confirmarRemoverTodos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          </svg>
          Limpar todos
        </button>
      </div>

      <!-- ===== LISTA DE FAVORITOS ===== -->
      <div class="favoritos-content">
        <div v-if="favoritosList.length === 0" class="empty-state">
          <div class="empty-icon">❤️</div>
          <h3>Nenhum favorito</h3>
          <p>Adicione prestadores aos favoritos para vê-los aqui</p>
          <button class="explore-btn" @click="() => void router.push('/mobile/lista-prestadores')">
            Explorar serviços
          </button>
        </div>

        <div v-else class="favoritos-list">
          <div v-for="favorito in favoritosList" :key="favorito.id" class="favorito-card">
            <div class="favorito-card__header">
              <div class="favorito-avatar">
                <div
                  v-if="!favorito.prestador.foto"
                  class="avatar-placeholder"
                  :style="getAvatarStyle(favorito.prestador.nome)"
                >
                  {{ getInitials(favorito.prestador.nome) }}
                </div>
                <q-avatar v-else size="56px">
                  <img :src="favorito.prestador.foto" :alt="favorito.prestador.nome" />
                </q-avatar>
              </div>
              <div class="favorito-info">
                <div class="favorito-name">
                  {{ favorito.prestador.nome }}
                  <svg v-if="favorito.prestador.verificado" width="16" height="16" viewBox="0 0 24 24" fill="#5B4BF5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="favorito-category">
                  {{ favorito.prestador.categorias?.[0]?.nome || favorito.prestador.profissao || 'Profissional' }}
                </div>
                <div class="favorito-rating">
                  <div class="stars">
                    <svg v-for="star in 5" :key="star" width="14" height="14" viewBox="0 0 24 24"
                      :fill="star <= (favorito.prestador.media_avaliacao || 0) ? '#F59E0B' : 'none'"
                      stroke="#D1D5DB" stroke-width="1.5">
                      <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                    </svg>
                  </div>
                  <span class="rating-count">({{ favorito.prestador.total_avaliacoes || 0 }})</span>
                </div>
              </div>
              <button class="menu-btn" @click.stop="toggleMenu(favorito.id)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>

              <!-- Menu flutuante -->
              <div v-if="activeMenuId === favorito.id" class="floating-menu" @click.stop>
                <div class="floating-menu__item" @click="() => void confirmarRemover(favorito)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
                  </svg>
                  Remover
                </div>
              </div>
            </div>
            <div class="favorito-card__actions">
              <button class="action-btn chat" @click="() => void abrirChat(favorito.prestador.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Chat
              </button>
              <button class="action-btn schedule" @click="() => void agendarServico(favorito.prestador.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <circle cx="12" cy="15" r="1"/>
                  <circle cx="16" cy="15" r="1"/>
                  <circle cx="8" cy="15" r="1"/>
                </svg>
                Agendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteComunicacaoStore, type FavoritoData } from 'src/stores/client/cliente-comunicacao-store';

defineOptions({ name: 'MobileFavoritos' });

const router = useRouter();
const $q = useQuasar();
const comunicacaoStore = useClienteComunicacaoStore();

const carregamentoInicial = ref(true);
const activeMenuId = ref<number | null>(null);

const favoritosList = computed(() => comunicacaoStore.favoritos || []);

const avatarGradients = [
  'linear-gradient(135deg, #5B4BF5, #9F7AEA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA)',
];

const getAvatarStyle = (nome: string) => {
  const idx = Math.abs((nome?.charCodeAt(0) || 0)) % avatarGradients.length;
  return { background: avatarGradients[idx] };
};

const getInitials = (nome: string): string => {
  if (!nome || nome.trim() === '') return 'U';
  const partes = nome.trim().split(' ');
  if (partes.length === 1 && partes[0]) {
    return partes[0].charAt(0).toUpperCase();
  }
  const primeiraLetra = partes[0]?.charAt(0) || '';
  const ultimaLetra = partes[partes.length - 1]?.charAt(0) || '';
  if (!primeiraLetra && !ultimaLetra) return 'U';
  if (!primeiraLetra) return ultimaLetra.toUpperCase();
  if (!ultimaLetra) return primeiraLetra.toUpperCase();
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

const toggleMenu = (id: number) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
  setTimeout(() => {
    const closeMenu = () => {
      activeMenuId.value = null;
      document.removeEventListener('click', closeMenu);
    };
    document.addEventListener('click', closeMenu, { once: true });
  }, 100);
};

const removerFavorito = async (favorito: FavoritoData) => {
  try {
    const success = await comunicacaoStore.removerFavorito(favorito.prestador.id);
    if (success) {
      activeMenuId.value = null;
      $q.notify({
        type: 'positive',
        message: `${favorito.prestador.nome} removido dos favoritos`,
        position: 'top',
        timeout: 2000,
      });
      await comunicacaoStore.fetchFavoritos();
    }
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    $q.notify({ type: 'negative', message: 'Erro ao remover favorito', position: 'top' });
  }
};

const confirmarRemover = (favorito: FavoritoData) => {
  activeMenuId.value = null;
  $q.dialog({
    title: 'Remover favorito',
    message: `Deseja remover ${favorito.prestador.nome} dos favoritos?`,
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => { void removerFavorito(favorito); });
};

const confirmarRemoverTodos = () => {
  $q.dialog({
    title: 'Limpar favoritos',
    message: `Deseja remover todos os ${favoritosList.value.length} favoritos?`,
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Remover todos', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => { void removerTodosFavoritos(); });
};

const removerTodosFavoritos = async () => {
  try {
    let sucessos = 0;
    for (const favorito of favoritosList.value) {
      const success = await comunicacaoStore.removerFavorito(favorito.prestador.id);
      if (success) sucessos++;
    }
    if (sucessos > 0) {
      $q.notify({
        type: 'positive',
        message: `${sucessos} favorito(s) removido(s)`,
        position: 'top',
        timeout: 2000,
      });
      await comunicacaoStore.fetchFavoritos();
    }
  } catch (error) {
    console.error('Erro ao remover favoritos:', error);
    $q.notify({ type: 'negative', message: 'Erro ao remover favoritos', position: 'top' });
  }
};

const abrirChat = (prestadorId: number) => {
  void router.push(`/mobile/chat/${prestadorId}`);
};

const agendarServico = (prestadorId: number) => {
  void router.push(`/mobile/agendar/${prestadorId}`);
};

const carregarFavoritos = async () => {
  try {
    await comunicacaoStore.fetchFavoritos();
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar favoritos', position: 'top' });
  } finally {
    setTimeout(() => { carregamentoInicial.value = false; }, 500);
  }
};

onMounted(() => {
  void carregarFavoritos();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$bg: #F4F4F8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

%shimmer {
  background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-loading { background: $bg; min-height: 100vh; }
.skeleton-header { background: $white; padding: 16px; border-bottom: 1px solid $border; }
.skeleton-title { width: 150px; height: 28px; border-radius: 14px; @extend %shimmer; }
.skeleton-cards { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.skeleton-card {
  background: $white; border-radius: $radius-sm; padding: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid $border;
}
.skeleton-avatar { width: 56px; height: 56px; border-radius: 50%; @extend %shimmer; }
.skeleton-card-info { flex: 1; }
.skeleton-line { height: 14px; border-radius: 7px; margin: 6px 0; @extend %shimmer; }
.skeleton-menu { width: 40px; height: 40px; border-radius: 50%; @extend %shimmer; }
.w-30 { width: 30%; } .w-40 { width: 40%; } .w-50 { width: 50%; } .w-60 { width: 60%; }

// =====================
// LAYOUT PRINCIPAL
// =====================
.favoritos-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 16px;
  border-bottom: 1px solid $border;

  .page-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $dark;
    margin: 0;
  }

  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba($danger, 0.1);
    border: none;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    color: $danger;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: rgba($danger, 0.2); }
  }
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  h3 { font-size: 1rem; font-weight: 600; color: $dark; margin-bottom: 8px; }
  p { font-size: 0.8rem; color: $gray; margin-bottom: 20px; }

  .explore-btn {
    background: $accent;
    color: $white;
    border: none;
    padding: 10px 24px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: lighten($accent, 6%); transform: translateY(-2px); }
  }
}

// =====================
// FAVORITOS LIST
// =====================
.favoritos-content { padding: 16px; }

.favoritos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// =====================
// FAVORITO CARD
// =====================
.favorito-card {
  background: $white;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    border-color: $accent;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    position: relative;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid $border;
  }
}

.favorito-avatar { flex-shrink: 0; }

.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: $white;
  text-transform: uppercase;
}

.favorito-info { flex: 1; }

.favorito-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.95rem;
  font-weight: 600;
  color: $dark;
  margin-bottom: 2px;
}

.favorito-category {
  font-size: 0.8rem;
  color: $gray;
  margin-bottom: 4px;
}

.favorito-rating {
  display: flex;
  align-items: center;
  gap: 6px;

  .stars { display: flex; gap: 2px; }
  .rating-count { font-size: 0.7rem; color: $gray; }
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gray-light;
  border: none;
  cursor: pointer;
  color: $gray;
  transition: all 0.2s;

  &:hover { background: $accent-light; color: $accent; }
}

// =====================
// FLOATING MENU
// =====================
.floating-menu {
  position: absolute;
  top: 50px;
  right: 16px;
  background: $white;
  border-radius: $radius-sm;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid $border;
  z-index: 100;
  min-width: 140px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    font-size: 0.85rem;
    font-weight: 500;
    color: $danger;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: rgba($danger, 0.05); }
  }
}

// =====================
// ACTION BUTTONS
// =====================
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.chat { color: $accent; &:hover { background: $accent-light; } }
  &.schedule { color: $success; &:hover { background: rgba($success, 0.1); } }
}

// =====================
// SCROLLBAR
// =====================
.favoritos-page::-webkit-scrollbar {
  width: 4px;
}

.favoritos-page::-webkit-scrollbar-track {
  background: $border;
}

.favoritos-page::-webkit-scrollbar-thumb {
  background: $accent;
  border-radius: 4px;
}
</style>
