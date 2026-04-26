<template>
  <q-page class="perfil-page bg-grey-1">
    <!-- Skeleton Loading (mostra enquanto carrega) -->
    <div v-if="isLoading" class="skeleton-loading">
      <!-- Skeleton Header -->
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-info">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-50"></div>
        </div>
      </div>

      <!-- Skeleton Stats -->
      <div class="skeleton-stats">
        <div v-for="i in 3" :key="i" class="skeleton-stat-card">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>

      <!-- Skeleton Menu Items -->
      <div class="skeleton-menu">
        <div v-for="i in 5" :key="i" class="skeleton-menu-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-70"></div>
          <div class="skeleton-chevron"></div>
        </div>
      </div>

      <!-- Skeleton Logout Button -->
      <div class="skeleton-logout-btn"></div>

      
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <!-- Carregando interno -->
      <div v-if="carregando" class="text-center q-pa-xl">
        <q-spinner color="primary" size="50px" />
        <p class="q-mt-md text-grey-7">A carregar perfil...</p>
      </div>

      <template v-else>
        <!-- Cabeçalho do perfil -->
        <div class="profile-header q-pa-md">
          <div class="row items-center">
            <q-avatar size="80px" class="profile-avatar">
              <img :src="userAvatar" alt="Avatar" />
            </q-avatar>
            <div class="q-ml-md">
              <div class="profile-name">{{ userData.nome }}</div>
              <div class="profile-type">
                {{ userData.tipo === 'prestador' ? 'Prestador de Serviços' : 'Cliente' }}
              </div>
              <div class="profile-phone">{{ userData.telefone }}</div>
            </div>
          </div>

          <q-btn
            flat
            dense
            icon="edit"
            label="Editar perfil"
            class="edit-profile-btn q-mt-md"
            @click="editarPerfil"
            no-caps
          />
        </div>

        <!-- Estatísticas do usuário -->
        <div class="stats-section q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-value">{{ clienteStore.dashboard.total_pedidos || 0 }}</div>
                <div class="stat-label">Serviços</div>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-value">{{ clienteStore.dashboard.avaliacoes_feitas || 0 }}</div>
                <div class="stat-label">Avaliações</div>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-value">{{ formatAnos() }}</div>
                <div class="stat-label">Anos</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informações adicionais -->
        <div class="info-section q-pa-md">
          <q-list bordered separator class="info-list">
            <q-item clickable v-ripple @click="goTo('meus-pedidos')">
              <q-item-section avatar>
                <q-icon name="assignment" color="primary" />
              </q-item-section>
              <q-item-section>Meus Pedidos</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="goTo('favoritos')">
              <q-item-section avatar>
                <q-icon name="favorite" color="red" />
              </q-item-section>
              <q-item-section
                >Favoritos ({{ clienteStore.dashboard.favoritos_count || 0 }})</q-item-section
              >
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="goTo('enderecos')">
              <q-item-section avatar>
                <q-icon name="location_on" color="grey-7" />
              </q-item-section>
              <q-item-section>Meus Endereços</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="goTo('configuracoes')">
              <q-item-section avatar>
                <q-icon name="settings" color="grey-7" />
              </q-item-section>
              <q-item-section>Configurações</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="ajuda">
              <q-item-section avatar>
                <q-icon name="help" color="info" />
              </q-item-section>
              <q-item-section>Ajuda</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Botão de sair -->
        <div class="q-pa-md">
          <q-btn
            flat
            dense
            icon="logout"
            label="Sair da conta"
            class="logout-btn"
            @click="confirmLogout"
            no-caps
          />
        </div>
      </template>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useClienteStore } from 'src/stores/cliente-store';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'MobilePerfil',
});

const router = useRouter();
const authStore = useAuthStore();
const clienteStore = useClienteStore();
const $q = useQuasar();

// Estado de loading do skeleton
const isLoading = ref(true);
const carregando = ref(false);

// Dados do usuário vindos do authStore
const userData = computed(() => ({
  nome: authStore.user?.nome || 'Utilizador',
  telefone: authStore.user?.telefone || 'Não informado',
  tipo: authStore.user?.tipo || 'cliente',
  foto: authStore.user?.foto || null,
}));

const userAvatar = computed(() => {
  const foto = userData.value.foto;
  if (foto) return foto;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.value.nome)}&background=667eea&color=fff&size=80`;
});

// Função para calcular anos (mock)
const formatAnos = () => {
  return 2;
};

const goTo = (rota: string) => {
  void router.push(`/mobile/${rota}`);
};

const editarPerfil = () => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidade em desenvolvimento',
    position: 'top',
  });
};

const ajuda = () => {
  $q.notify({
    type: 'info',
    message: 'Ajuda disponível em breve',
    position: 'top',
  });
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    await router.push('/auth/login');
    $q.notify({
      type: 'positive',
      message: 'Logout realizado com sucesso',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao realizar logout',
      position: 'top',
      timeout: 2000,
    });
  }
};

const confirmLogout = () => {
  $q.dialog({
    title: 'Confirmar saída',
    message: 'Tem certeza que deseja sair da sua conta?',
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: 'Sair',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void handleLogout();
  });
};


// Carregar dados iniciais com skeleton
const carregarDadosIniciais = async () => {
  isLoading.value = true;

  try {
    await clienteStore.fetchDashboard();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 600);
  }
};

onMounted(() => {
  void carregarDadosIniciais();
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

// ==========================================
// SKELETON LOADING STYLES
// ==========================================

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 0;
}

.skeleton-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid $gray-200;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-info {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 8px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-stats {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.skeleton-stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid $gray-200;
}

.skeleton-menu {
  background: white;
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid $gray-200;
}

.skeleton-menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid $gray-200;

  &:last-child {
    border-bottom: none;
  }
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-chevron {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-logout-btn {
  margin: 16px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.w-40 {
  width: 40%;
}
.w-50 {
  width: 50%;
}
.w-60 {
  width: 60%;
}
.w-70 {
  width: 70%;
}

// ==========================================
// ESTILOS NORMAIS (mantidos)
// ==========================================

.perfil-page {
  padding-bottom: 16px;
}

.profile-header {
  background: white;
  border-bottom: 1px solid $gray-200;

  .profile-avatar {
    border: 3px solid $purple-primary;
  }

  .profile-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-900;
  }

  .profile-type {
    font-size: 0.9rem;
    color: $purple-primary;
    font-weight: 500;
  }

  .profile-phone {
    font-size: 0.85rem;
    color: $gray-600;
  }

  .edit-profile-btn {
    width: 100%;
    border: 1px solid $gray-300;
    border-radius: 20px;
    color: $gray-700;

    &:hover {
      background: $gray-100;
    }
  }
}

.stats-section {
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    border: 1px solid $gray-200;

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: $purple-primary;
    }

    .stat-label {
      font-size: 0.8rem;
      color: $gray-600;
    }
  }
}

.info-section {
  .info-list {
    border-radius: 12px;
    overflow: hidden;
  }
}

.logout-btn {
  width: 100%;
  color: #f44336;
  border: 1px solid #ffcdd2;
  border-radius: 20px;

  &:hover {
    background: #ffebee;
  }
}
</style>
