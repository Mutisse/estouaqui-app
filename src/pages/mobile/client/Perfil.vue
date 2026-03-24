<template>
  <q-page class="perfil-page bg-grey-1">
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
            <div class="stat-value">{{ userStats.servicos }}</div>
            <div class="stat-label">Serviços</div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-card">
            <div class="stat-value">{{ userStats.avaliacoes }}</div>
            <div class="stat-label">Avaliações</div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-card">
            <div class="stat-value">{{ userStats.anos }}</div>
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
          <q-item-section>Favoritos</q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="goTo('pagamentos')">
          <q-item-section avatar>
            <q-icon name="payments" color="positive" />
          </q-item-section>
          <q-item-section>Pagamentos</q-item-section>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'MobilePerfil',
});

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

// Dados mockados - substituir pela API depois
const userAvatar = ref('https://cdn.quasar.dev/img/avatar.png');
const userData = ref({
  nome: authStore.user?.nome || 'João Silva',
  telefone: authStore.user?.telefone || '+258 84 123 4567',
  tipo: authStore.user?.tipo || 'cliente',
});

const userStats = ref({
  servicos: 23,
  avaliacoes: 45,
  anos: 2,
});

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

// ✅ CORREÇÃO: tratar a Promise do logout
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
    void authStore
      .logout()
      .then(() => {
        void router.push('/auth/login');
        $q.notify({
          type: 'positive',
          message: 'Logout realizado com sucesso',
          position: 'top',
          timeout: 2000,
        });
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao realizar logout',
          position: 'top',
          timeout: 2000,
        });
      });
  });
};
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
