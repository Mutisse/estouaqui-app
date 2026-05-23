<template>
  <div class="perfil-page">

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="isLoading" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-info">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-50"></div>
        </div>
      </div>
      <div class="skeleton-stats">
        <div v-for="i in 3" :key="i" class="skeleton-stat-card">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>
      <div class="skeleton-menu">
        <div v-for="i in 5" :key="i" class="skeleton-menu-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-70"></div>
          <div class="skeleton-chevron"></div>
        </div>
      </div>
      <div class="skeleton-logout-btn"></div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <div v-if="carregando" class="loading-state">
        <div class="loader"></div>
        <p>A carregar perfil...</p>
      </div>

      <template v-else>

        <!-- ===== CABEÇALHO DO PERFIL ===== -->
        <div class="profile-header">
          <div class="profile-header__top">
            <div class="profile-avatar">
              <div v-if="avatarError" class="avatar-placeholder" :style="{ background: getAvatarColor(userData.nome) }">
                {{ getInitials(userData.nome) }}
              </div>
              <q-avatar v-else size="80px">
                <img :src="userAvatar" alt="Avatar" @error="avatarError = true" />
              </q-avatar>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ userData.nome }}</h2>
              <div class="profile-type" :class="userData.tipo">
                {{ userData.tipo === 'prestador' ? 'Prestador de Serviços' : 'Cliente' }}
              </div>
              <div class="profile-phone">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {{ userData.telefone || 'Não informado' }}
              </div>
            </div>
          </div>
          <button class="edit-profile-btn" @click="editarPerfil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
            Editar perfil
          </button>
        </div>

        <!-- ===== ESTATÍSTICAS ===== -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__value">{{ pedidosStore.dashboard?.total_pedidos || 0 }}</div>
              <div class="stat-card__label">Serviços</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__value">{{ pedidosStore.dashboard?.avaliacoes_feitas || 0 }}</div>
              <div class="stat-card__label">Avaliações</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__value">{{ formatAnos() }}</div>
              <div class="stat-card__label">Anos</div>
            </div>
          </div>
        </div>

        <!-- ===== MENU DE OPÇÕES ===== -->
        <div class="menu-section">
          <div class="menu-item" @click="() => void goTo('meus-pedidos')">
            <div class="menu-item__icon menu-item__icon--primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="menu-item__label">Meus Pedidos</div>
            <div class="menu-item__chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div class="menu-item" @click="() => void goTo('favoritos')">
            <div class="menu-item__icon menu-item__icon--red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div class="menu-item__label">Favoritos ({{ pedidosStore.dashboard?.favoritos_count || 0 }})</div>
            <div class="menu-item__chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div class="menu-item" @click="() => void goTo('enderecos')">
            <div class="menu-item__icon menu-item__icon--grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="menu-item__label">Meus Endereços</div>
            <div class="menu-item__chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div class="menu-item" @click="() => void goTo('configuracoes')">
            <div class="menu-item__icon menu-item__icon--grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div class="menu-item__label">Configurações</div>
            <div class="menu-item__chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div class="menu-item" @click="ajuda">
            <div class="menu-item__icon menu-item__icon--info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="menu-item__label">Ajuda</div>
            <div class="menu-item__chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- ===== BOTÃO DE SAIR ===== -->
        <div class="logout-section">
          <button class="logout-btn" @click="confirmLogout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair da conta
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useClientePedidosStore } from 'src/stores/client/cliente-pedidos-store';
import { useQuasar } from 'quasar';

defineOptions({ name: 'MobilePerfil' });

const router = useRouter();
const authStore = useAuthStore();
const pedidosStore = useClientePedidosStore();
const $q = useQuasar();

const isLoading = ref(true);
const carregando = ref(false);
const avatarError = ref(false);

const userData = computed(() => ({
  nome: authStore.user?.nome || 'Utilizador',
  telefone: authStore.user?.telefone || 'Não informado',
  tipo: (authStore.user?.tipo as 'cliente' | 'prestador') || 'cliente',
  foto: authStore.user?.foto || null,
}));

const userAvatar = computed(() => {
  const foto = userData.value.foto;
  if (foto && !avatarError.value) return foto;
  const iniciais = getInitials(userData.value.nome);
  return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=80&name=${encodeURIComponent(iniciais)}`;
});

// Funções corrigidas - sem erros de undefined
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

const getAvatarColor = (nome: string): string => {
  const colors = [
    '#5B4BF5', '#10B981', '#F59E0B', '#EF4444',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'
  ];
  const index = Math.abs(nome.length) % colors.length;
  return colors[index] || '#5B4BF5';
};

const formatAnos = () => 2;

const goTo = (rota: string) => {
  void router.push(`/mobile/${rota}`);
};

const editarPerfil = () => {
  $q.notify({ type: 'info', message: 'Funcionalidade em desenvolvimento', position: 'top' });
};

const ajuda = () => {
  $q.notify({ type: 'info', message: 'Ajuda disponível em breve', position: 'top' });
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    await router.push('/auth/login');
    $q.notify({ type: 'positive', message: 'Logout realizado com sucesso', position: 'top', timeout: 2000 });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    $q.notify({ type: 'negative', message: 'Erro ao realizar logout', position: 'top', timeout: 2000 });
  }
};

const confirmLogout = () => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: { label: 'Cancelar', color: 'grey-7', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => { void handleLogout(); });
};

const carregarDadosIniciais = async () => {
  isLoading.value = true;
  try {
    await pedidosStore.fetchDashboard();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setTimeout(() => { isLoading.value = false; }, 600);
  }
};

onMounted(() => {
  void carregarDadosIniciais();
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
$info: #3B82F6;
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
.skeleton-header {
  background: $white; padding: 16px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid $border;
}
.skeleton-avatar { width: 80px; height: 80px; border-radius: 50%; @extend %shimmer; }
.skeleton-header-info { flex: 1; }
.skeleton-line { height: 14px; border-radius: 7px; margin: 8px 0; @extend %shimmer; }
.skeleton-stats { padding: 16px; display: flex; gap: 12px; }
.skeleton-stat-card { flex: 1; background: $white; border-radius: $radius-sm; padding: 16px; text-align: center; border: 1px solid $border; }
.skeleton-menu { background: $white; margin: 16px; border-radius: $radius-sm; overflow: hidden; border: 1px solid $border; }
.skeleton-menu-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid $border; &:last-child { border-bottom: none; } }
.skeleton-icon { width: 24px; height: 24px; border-radius: 50%; @extend %shimmer; }
.skeleton-chevron { width: 16px; height: 16px; border-radius: 2px; @extend %shimmer; }
.skeleton-logout-btn { margin: 16px; height: 40px; border-radius: 20px; @extend %shimmer; }
.w-40 { width: 40%; } .w-50 { width: 50%; } .w-60 { width: 60%; } .w-70 { width: 70%; }

// =====================
// LAYOUT PRINCIPAL
// =====================
.perfil-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

.loading-state {
  text-align: center; padding: 60px 20px;
  .loader { width: 40px; height: 40px; border: 3px solid $accent-light; border-top-color: $accent; border-radius: 50%; margin: 0 auto 16px; animation: spin 0.8s linear infinite; }
  p { color: $gray; font-size: 0.85rem; }
}
@keyframes spin { to { transform: rotate(360deg); } }

// =====================
// PROFILE HEADER
// =====================
.profile-header {
  background: $white;
  padding: 24px 16px;
  border-bottom: 1px solid $border;

  &__top {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: $white;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: $dark;
  margin: 0 0 4px;
}

.profile-type {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 4px;

  &.prestador { color: $accent; }
  &.cliente { color: $success; }
}

.profile-phone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: $gray;
}

.edit-profile-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px;
  background: $white;
  border: 1px solid $border;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
  color: $gray;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: $accent-light; border-color: $accent; color: $accent; }
}

// =====================
// STATS SECTION
// =====================
.stats-section { padding: 16px; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: $white;
  border-radius: $radius-sm;
  padding: 14px;
  text-align: center;
  border: 1px solid $border;
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  &__value {
    font-size: 1.3rem;
    font-weight: 700;
    color: $accent;
    line-height: 1.2;
  }

  &__label {
    font-size: 0.7rem;
    color: $gray;
    margin-top: 4px;
  }
}

// =====================
// MENU SECTION
// =====================
.menu-section {
  background: $white;
  margin: 0 16px 16px;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child { border-bottom: none; }
  &:hover { background: $accent-light; }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-xs;
    display: flex;
    align-items: center;
    justify-content: center;

    &--primary { background: rgba($accent, 0.1); color: $accent; }
    &--red { background: rgba($danger, 0.1); color: $danger; }
    &--grey { background: rgba($gray, 0.1); color: $gray; }
    &--info { background: rgba($info, 0.1); color: $info; }
  }

  &__label {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
    color: $dark;
  }

  &__chevron {
    color: $gray;
  }
}

// =====================
// LOGOUT SECTION
// =====================
.logout-section { padding: 0 16px; }

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba($danger, 0.05);
  border: 1px solid rgba($danger, 0.2);
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  color: $danger;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: rgba($danger, 0.1); border-color: $danger; }
}

// =====================
// SCROLLBAR
// =====================
.perfil-page::-webkit-scrollbar {
  width: 4px;
}

.perfil-page::-webkit-scrollbar-track {
  background: $border;
}

.perfil-page::-webkit-scrollbar-thumb {
  background: $accent;
  border-radius: 4px;
}
</style>
