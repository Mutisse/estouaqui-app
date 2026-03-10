<template>
  <q-page class="prestador-perfil bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meu Perfil</div>
      <q-btn flat round icon="edit" @click="editarPerfil" />
    </div>

    <!-- Foto e informações principais -->
    <div class="profile-header q-pa-md text-center">
      <q-avatar size="120px" class="profile-avatar">
        <img :src="perfil.avatar" alt="Avatar">
        <q-badge floating color="positive" rounded />
      </q-avatar>
      <div class="profile-name q-mt-md">{{ perfil.nome }}</div>
      <div class="profile-profession">{{ perfil.profissao }}</div>
      <div class="profile-rating q-mt-sm">
        <q-rating v-model="perfil.avaliacao" size="20px" :max="5" color="yellow" readonly />
        <span class="q-ml-sm">({{ perfil.totalAvaliacoes }} avaliações)</span>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-section q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-4">
          <div class="stat-item text-center">
            <div class="stat-value">{{ perfil.servicos }}</div>
            <div class="stat-label">Serviços</div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-item text-center">
            <div class="stat-value">{{ perfil.clientes }}</div>
            <div class="stat-label">Clientes</div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-item text-center">
            <div class="stat-value">{{ perfil.experiencia }}</div>
            <div class="stat-label">Anos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Informações de contacto -->
    <div class="info-section q-pa-md">
      <div class="section-title">Contacto</div>
      <q-list bordered separator class="info-list q-mt-sm">
        <q-item>
          <q-item-section avatar>
            <q-icon name="phone" color="primary" />
          </q-item-section>
          <q-item-section>{{ perfil.telefone }}</q-item-section>
          <q-item-section side>
            <q-btn flat round icon="edit" size="sm" @click="editarTelefone" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="email" color="primary" />
          </q-item-section>
          <q-item-section>{{ perfil.email }}</q-item-section>
          <q-item-section side>
            <q-btn flat round icon="edit" size="sm" @click="editarEmail" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="location_on" color="primary" />
          </q-item-section>
          <q-item-section>{{ perfil.localizacao }}</q-item-section>
          <q-item-section side>
            <q-btn flat round icon="edit" size="sm" @click="editarLocalizacao" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Sobre -->
    <div class="sobre-section q-pa-md">
      <div class="section-title">Sobre</div>
      <q-card flat bordered class="sobre-card q-mt-sm">
        <q-card-section>
          <p>{{ perfil.sobre }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat dense label="Editar" icon="edit" @click="editarSobre" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Portfólio -->
    <div class="portfolio-section q-pa-md">
      <div class="section-title">Portfólio</div>
      <div class="row q-col-gutter-sm q-mt-sm">
        <div v-for="n in 3" :key="n" class="col-4">
          <q-img
            :src="`https://picsum.photos/200/200?random=${n}`"
            :ratio="1"
            class="portfolio-img"
            @click="verPortfolio(n)"
          />
        </div>
      </div>
      <q-btn
        flat
        color="primary"
        label="Ver mais"
        icon="photo_library"
        class="full-width q-mt-md"
        @click="verPortfolioCompleto"
      />
    </div>

    <!-- Documentos -->
    <div class="docs-section q-pa-md">
      <div class="section-title">Documentos</div>
      <q-list bordered separator class="docs-list q-mt-sm">
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="description" color="primary" />
          </q-item-section>
          <q-item-section>Documento de Identificação</q-item-section>
          <q-item-section side>
            <q-badge color="positive">Verificado</q-badge>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="badge" color="primary" />
          </q-item-section>
          <q-item-section>Certificado Profissional</q-item-section>
          <q-item-section side>
            <q-btn flat round icon="upload" size="sm" @click="uploadDocumento" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

defineOptions({
  name: 'PrestadorPerfil'
})

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// CORREÇÃO: Usar dados mockados completos
const perfil = ref({
  avatar: 'https://cdn.quasar.dev/img/avatar.png',
  nome: authStore.user?.nome || 'João Silva',
  profissao: 'Eletricista Profissional',
  avaliacao: 4.8,
  totalAvaliacoes: 87,
  servicos: 156,
  clientes: 98,
  experiencia: 5,
  telefone: authStore.user?.telefone || '+258 84 123 4567',
  email: 'joao.silva@email.com',  // Valor fixo
  localizacao: 'Maputo, Moçambique',
  sobre: 'Sou eletricista com mais de 5 anos de experiência em instalações e reparações residenciais e comerciais. Trabalho com qualidade, segurança e pontualidade.'
})

const editarPerfil = () => {
  $q.notify({
    type: 'info',
    message: 'Editar perfil em breve',
    position: 'top'
  })
}

const editarTelefone = () => {
  $q.notify({
    type: 'info',
    message: 'Editar telefone em breve',
    position: 'top'
  })
}

const editarEmail = () => {
  $q.notify({
    type: 'info',
    message: 'Editar email em breve',
    position: 'top'
  })
}

const editarLocalizacao = () => {
  $q.notify({
    type: 'info',
    message: 'Editar localização em breve',
    position: 'top'
  })
}

const editarSobre = () => {
  $q.notify({
    type: 'info',
    message: 'Editar sobre em breve',
    position: 'top'
  })
}

const verPortfolio = (n: number) => {
  $q.notify({
    type: 'info',
    message: `Ver foto ${n} do portfólio`,
    position: 'top'
  })
}

const verPortfolioCompleto = () => {
  $q.notify({
    type: 'info',
    message: 'Portfólio completo em breve',
    position: 'top'
  })
}

const uploadDocumento = () => {
  $q.notify({
    type: 'info',
    message: 'Upload de documento em breve',
    position: 'top'
  })
}
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

.prestador-perfil {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.profile-header {
  background: white;

  .profile-avatar {
    border: 3px solid $purple-primary;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: $gray-900;
  }

  .profile-profession {
    font-size: 1rem;
    color: $gray-600;
  }
}

.stats-section {
  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid $gray-200;

    .stat-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: $purple-primary;
    }

    .stat-label {
      font-size: 0.8rem;
      color: $gray-600;
    }
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-800;
}

.info-list, .docs-list {
  border-radius: 12px;
  overflow: hidden;
}

.sobre-card {
  border-radius: 12px;
}

.portfolio-img {
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>
