<template>
  <div class="perfil-prestador-page">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="prestadorStore.carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-cover"></div>
        <div class="skeleton-avatar"></div>
        <div class="skeleton-name"></div>
        <div class="skeleton-rating"></div>
      </div>
      <div class="skeleton-favorite-btn"></div>
      <div class="skeleton-info-cards">
        <div v-for="i in 4" :key="i" class="skeleton-info-card"></div>
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
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <template v-if="prestadorStore.prestador">
        <!-- Header com imagem de capa -->
        <div class="profile-header">
          <button class="back-btn" @click="() => void router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div class="cover-image" :style="{ backgroundImage: `url(${coverImage})` }">
            <div class="cover-overlay"></div>
          </div>

          <div class="profile-info">
            <div class="profile-avatar">
              <img
                :src="prestadorStore.avatarUrl"
                :alt="prestadorStore.prestador.nome"
                @error="prestadorStore.avatarError = true"
              />
            </div>
            <div class="profile-name-wrapper">
              <h2 class="profile-name">{{ prestadorStore.prestador.nome }}</h2>
              <svg v-if="prestadorStore.prestador.verificado" width="20" height="20" viewBox="0 0 24 24" fill="#5B4BF5" class="verified-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="profile-rating">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
              </svg>
              <span class="rating-value">{{ prestadorStore.mediaFormatada }}</span>
              <span class="rating-count">({{ prestadorStore.prestador.total_avaliacoes || 0 }} avaliações)</span>
            </div>
          </div>
        </div>

        <!-- Botão de favorito -->
        <div class="favorite-btn-wrapper">
          <button
            class="favorite-btn"
            :class="{ active: prestadorStore.isFavorito }"
            :disabled="prestadorStore.favoritoLoading"
            @click="() => void toggleFavorito()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" :fill="prestadorStore.isFavorito ? '#EF4444' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ prestadorStore.isFavorito ? 'Favorito' : 'Adicionar aos favoritos' }}</span>
          </button>
        </div>

        <!-- Informações rápidas -->
        <div class="info-cards">
          <div class="info-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
              <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
            </svg>
            <div class="info-value">{{ prestadorStore.prestador.profissao || 'Profissional' }}</div>
            <div class="info-label">profissão</div>
          </div>
          <div class="info-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="info-value" :style="{ color: prestadorStore.statusCor }">{{ prestadorStore.statusFormatado }}</div>
            <div class="info-label">status</div>
          </div>
          <div class="info-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div class="info-value">{{ prestadorStore.prestador.verificado ? 'Verificado' : 'Não verificado' }}</div>
            <div class="info-label">verificação</div>
          </div>
          <div class="info-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
            </svg>
            <div class="info-value">{{ prestadorStore.prestador.raio || 10 }} km</div>
            <div class="info-label">raio de ação</div>
          </div>
        </div>

        <!-- Sobre -->
        <div v-if="prestadorStore.prestador.sobre" class="section">
          <h3 class="section-title">Sobre</h3>
          <p class="section-text">{{ prestadorStore.prestador.sobre }}</p>
        </div>

        <!-- Especialidades -->
        <div class="section">
          <h3 class="section-title">Especialidades</h3>
          <div class="categorias-list">
            <div v-for="categoria in prestadorStore.prestador.categorias" :key="categoria.id" class="categoria-chip" :style="prestadorStore.getChipStyle(categoria.cor)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
              </svg>
              {{ categoria.nome }}
            </div>
            <div v-if="!prestadorStore.prestador.categorias?.length" class="empty-chip">
              Nenhuma categoria definida
            </div>
          </div>
        </div>

        <!-- Serviços oferecidos -->
        <div v-if="prestadorStore.servicosOrdenados.length" class="section">
          <h3 class="section-title">Serviços oferecidos</h3>
          <div class="servicos-list">
            <div v-for="servico in prestadorStore.servicosOrdenados" :key="servico.id" class="servico-item">
              <div class="servico-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                  <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                </svg>
              </div>
              <div class="servico-info">
                <div class="servico-nome">{{ servico.nome }}</div>
                <div class="servico-preco">{{ prestadorStore.formatarPreco(servico.preco) }}</div>
              </div>
              <div class="servico-duracao">{{ servico.duracao }} min</div>
            </div>
          </div>
        </div>

        <!-- Portfólio - CORRIGIDO -->
        <div v-if="portfolioItems.length" class="section">
          <h3 class="section-title">Portfólio</h3>
          <div class="portfolio-grid">
            <div v-for="(item, idx) in portfolioItems.slice(0, 6)" :key="idx" class="portfolio-item" @click="() => void verImagem(item.url)">
              <img :src="item.url" :alt="item.titulo || `Portfólio ${idx + 1}`" />
              <div class="portfolio-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div v-if="item.titulo" class="portfolio-title">{{ item.titulo }}</div>
            </div>
          </div>
        </div>

        <!-- Contato -->
        <div class="section">
          <h3 class="section-title">Contato</h3>
          <div class="contato-list">
            <div v-if="prestadorStore.prestador.telefone" class="contato-item" @click="ligar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{{ prestadorStore.prestador.telefone }}</span>
            </div>
            <div v-if="prestadorStore.prestador.email" class="contato-item" @click="enviarEmail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{{ prestadorStore.prestador.email }}</span>
            </div>
          </div>
        </div>

        <!-- Últimas avaliações -->
        <div v-if="prestadorStore.ultimasAvaliacoes.length" class="section">
          <h3 class="section-title">Últimas avaliações</h3>
          <div class="avaliacoes-list">
            <div v-for="avaliacao in prestadorStore.ultimasAvaliacoes" :key="avaliacao.id" class="avaliacao-item">
              <div class="avaliacao-header">
                <div class="avaliacao-avatar" :style="prestadorStore.getAvatarStyle(avaliacao.cliente?.nome || '')">
                  {{ prestadorStore.getInitials(avaliacao.cliente?.nome || 'C') }}
                </div>
                <div class="avaliacao-info">
                  <div class="avaliacao-nome">{{ avaliacao.cliente?.nome || 'Cliente' }}</div>
                  <div class="avaliacao-stars">
                    <template v-for="star in 5" :key="star">
                      <svg v-if="star <= avaliacao.nota" width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                      </svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2">
                        <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                      </svg>
                    </template>
                  </div>
                </div>
                <div class="avaliacao-data">{{ prestadorStore.formatarData(avaliacao.created_at) }}</div>
              </div>
              <p v-if="avaliacao.comentario" class="avaliacao-comentario">{{ avaliacao.comentario }}</p>
            </div>
          </div>
          <button v-if="prestadorStore.prestador.total_avaliacoes > 3" class="view-all-btn" @click="() => void verTodasAvaliacoes()">
            Ver todas as avaliações
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="bottom-spacer"></div>
      </template>

      <!-- Erro -->
      <div v-else class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16" r="1" fill="#EF4444" stroke="none"/>
        </svg>
        <h3>{{ prestadorStore.erro || 'Prestador não encontrado' }}</h3>
        <button class="back-action" @click="() => void router.back()">Voltar</button>
      </div>
    </template>

    <!-- Botão flutuante do chat -->
    <button v-if="prestadorStore.prestador" class="chat-fab" @click="() => void abrirChat()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorStore, type PortfolioItem } from 'src/stores/client/cliente-prestador-store';

defineOptions({ name: 'PerfilPrestadorPage' });

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const prestadorStore = usePrestadorStore();

const prestadorId = computed(() => Number(route.params.id));
const coverImage = 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

// ✅ Computed para normalizar o portfólio (garantir que tem url)
const portfolioItems = computed(() => {
  if (!prestadorStore.prestador?.portfolio) return [];
  return prestadorStore.prestador.portfolio.filter((item): item is PortfolioItem => !!item.url);
});

const toggleFavorito = async () => {
  if (!prestadorStore.prestador) return;

  const success = await prestadorStore.toggleFavorito(prestadorId.value);

  if (success) {
    $q.notify({
      type: 'positive',
      message: prestadorStore.isFavorito ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
      position: 'top',
      timeout: 2000
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao alterar favorito',
      position: 'top'
    });
  }
};

const ligar = () => {
  if (prestadorStore.prestador?.telefone) {
    window.location.href = `tel:${prestadorStore.prestador.telefone}`;
  }
};

const enviarEmail = () => {
  if (prestadorStore.prestador?.email) {
    window.location.href = `mailto:${prestadorStore.prestador.email}`;
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

const carregarDados = async () => {
  try {
    await prestadorStore.fetchPrestadorDetalhes(prestadorId.value);
    await prestadorStore.verificarFavorito(prestadorId.value);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perfil do prestador',
      position: 'top'
    });
  }
};

onMounted(() => {
  void carregarDados();
});

onUnmounted(() => {
  prestadorStore.limparStore();
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

.skeleton-loading {
  background: $gray-light;
  min-height: 100vh;
}

.skeleton-header { position: relative; min-height: 250px; }
.skeleton-back-btn {
  position: absolute; top: 10px; left: 10px; width: 40px; height: 40px; border-radius: 50%;
  background: rgba(0,0,0,0.3); z-index: 10;
}
.skeleton-cover {
  height: 150px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-avatar {
  position: absolute; top: 100px; left: 50%; transform: translateX(-50%);
  width: 100px; height: 100px; border-radius: 50%;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
  border: 4px solid white; z-index: 5;
}
.skeleton-name {
  position: absolute; top: 210px; left: 50%; transform: translateX(-50%);
  width: 150px; height: 24px; border-radius: 12px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-rating {
  position: absolute; top: 245px; left: 50%; transform: translateX(-50%);
  width: 120px; height: 20px; border-radius: 10px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-favorite-btn {
  margin: 16px auto; width: 180px; height: 40px; border-radius: 30px;
  background: linear-gradient(90deg, #d0d0d0 25%, #e0e0e0 50%, #d0d0d0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-info-cards {
  display: flex; gap: 12px; padding: 0 16px; margin-bottom: 16px;
}
.skeleton-info-card {
  flex: 1; height: 80px; background: white; border-radius: $radius-sm;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.skeleton-section {
  background: white; margin: 12px; border-radius: $radius-sm; padding: 16px;
}
.skeleton-line {
  height: 14px; border-radius: 7px; margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.skeleton-chip {
  width: 100px; height: 32px; border-radius: 16px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-servico {
  display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid $border;
}
.skeleton-servico-icon {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-servico-info { flex: 1; }
.w-40 { width: 40%; } .w-60 { width: 60%; } .w-80 { width: 80%; }

// =====================
// LAYOUT PRINCIPAL
// =====================
.perfil-prestador-page {
  background: $gray-light;
  min-height: 100vh;
  padding-bottom: 0;
  position: relative;
}

// =====================
// PROFILE HEADER
// =====================
.profile-header {
  position: relative;
  min-height: 250px;

  .back-btn {
    position: absolute; top: 10px; left: 10px; z-index: 10;
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
    border: none; cursor: pointer; color: white;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;

    &:hover { background: rgba(0,0,0,0.6); transform: scale(1.05); }
  }

  .cover-image {
    height: 150px; background-size: cover; background-position: center; position: relative;
    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
    }
  }

  .profile-info {
    position: relative; margin-top: -50px; padding: 0 20px 20px; text-align: center;
  }

  .profile-avatar {
    width: 100px; height: 100px; margin: 0 auto 10px;
    img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  }

  .profile-name-wrapper {
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .profile-name {
    font-size: 1.5rem; font-weight: 700; color: $dark; margin: 0;
  }

  .verified-icon { margin-top: 4px; }

  .profile-rating {
    display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 5px;
    .rating-value { font-weight: 600; color: $dark; }
    .rating-count { color: $gray; font-size: 0.85rem; }
  }
}

// =====================
// FAVORITE BUTTON
// =====================
.favorite-btn-wrapper {
  display: flex; justify-content: center; margin: 16px 0;

  .favorite-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 20px; border-radius: 30px;
    background: white; border: 1px solid $border;
    font-size: 0.85rem; font-weight: 500; color: $gray;
    cursor: pointer; transition: all 0.2s;

    &:hover { border-color: $danger; color: $danger; }
    &.active { background: rgba(239,68,68,0.1); border-color: $danger; color: $danger; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}

// =====================
// INFO CARDS
// =====================
.info-cards {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 0 16px; margin-bottom: 16px;

  .info-card {
    background: white; padding: 12px 8px; border-radius: $radius-sm; text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);

    svg { margin-bottom: 8px; }
    .info-value { font-size: 0.8rem; font-weight: 600; color: $dark; margin: 5px 0 2px; word-break: break-word; }
    .info-label { font-size: 0.65rem; color: $gray; text-transform: uppercase; letter-spacing: 0.5px; }
  }
}

// =====================
// SECTIONS
// =====================
.section {
  background: white; margin: 12px; border-radius: $radius; padding: 20px;

  .section-title {
    font-size: 1rem; font-weight: 600; color: $dark; margin: 0 0 16px;
    padding-left: 10px; border-left: 3px solid $accent;
  }

  .section-text { color: $gray; line-height: 1.6; margin: 0; font-size: 0.9rem; }
}

// =====================
// CATEGORIAS
// =====================
.categorias-list {
  display: flex; flex-wrap: wrap; gap: 10px;

  .categoria-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 30px;
    font-size: 0.8rem; font-weight: 500;
  }

  .empty-chip {
    color: $gray; font-size: 0.85rem; padding: 8px 0;
  }
}

// =====================
// SERVIÇOS
// =====================
.servicos-list {
  .servico-item {
    display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid $border;
    &:last-child { border-bottom: none; }

    .servico-icon {
      width: 44px; height: 44px; background: $accent-light; border-radius: $radius-xs;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .servico-info { flex: 1; }
    .servico-nome { font-weight: 500; color: $dark; margin-bottom: 2px; }
    .servico-preco { font-size: 0.75rem; color: $accent; font-weight: 600; }
    .servico-duracao { font-size: 0.75rem; color: $gray; }
  }
}

// =====================
// PORTFÓLIO
// =====================
.portfolio-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;

  .portfolio-item {
    position: relative; cursor: pointer; border-radius: $radius-xs; overflow: hidden; aspect-ratio: 1;

    img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }

    .portfolio-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s;
    }

    .portfolio-title {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      padding: 8px; font-size: 0.7rem; color: white; text-align: center;
      opacity: 0; transition: opacity 0.3s;
    }

    &:hover {
      img { transform: scale(1.05); }
      .portfolio-overlay { opacity: 1; }
      .portfolio-title { opacity: 1; }
    }
  }
}

// =====================
// CONTATO
// =====================
.contato-list {
  .contato-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid $border;
    cursor: pointer; transition: all 0.2s;
    &:last-child { border-bottom: none; }
    &:hover { transform: translateX(4px); }

    span { color: $dark; font-size: 0.9rem; }
    svg { flex-shrink: 0; }
  }
}

// =====================
// AVALIAÇÕES
// =====================
.avaliacoes-list {
  .avaliacao-item { padding: 14px 0; border-bottom: 1px solid $border; &:last-child { border-bottom: none; } }

  .avaliacao-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 10px;

    .avaliacao-avatar {
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .avaliacao-info { flex: 1; }
    .avaliacao-nome { font-weight: 500; color: $dark; font-size: 0.85rem; margin-bottom: 4px; }
    .avaliacao-stars { display: flex; gap: 2px; }
    .avaliacao-data { font-size: 0.7rem; color: $gray; }
  }

  .avaliacao-comentario {
    margin: 0; font-size: 0.85rem; color: $gray; line-height: 1.5; padding-left: 52px;
  }
}

.view-all-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; margin-top: 16px; padding: 10px;
  background: none; border: 1px solid $border; border-radius: $radius-sm;
  font-size: 0.8rem; font-weight: 500; color: $accent; cursor: pointer;
  transition: all 0.2s;

  &:hover { background: $accent-light; border-color: $accent; }
}

// =====================
// BOTTOM SPACER & FAB
// =====================
.bottom-spacer { height: 80px; }

.chat-fab {
  position: fixed !important; bottom: 90px !important; right: 20px !important;
  z-index: 9999 !important;
  width: 56px; height: 56px; border-radius: 50%;
  background: $accent; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(91, 75, 245, 0.4);
  transition: all 0.2s;

  &:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(91, 75, 245, 0.5); }
}

// =====================
// ERROR STATE
// =====================
.error-state {
  text-align: center; padding: 60px 20px;

  h3 { font-size: 1.2rem; font-weight: 600; color: $dark; margin: 16px 0 20px; }

  .back-action {
    background: $accent; color: white; border: none; padding: 10px 24px; border-radius: 30px;
    font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    &:hover { background: lighten($accent, 6%); transform: translateY(-2px); }
  }
}
</style>
