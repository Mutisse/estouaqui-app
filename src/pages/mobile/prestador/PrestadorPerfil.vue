<template>
  <q-page class="prestador-perfil bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meu Perfil</div>
      <q-btn flat round icon="edit" @click="editarPerfil" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">Carregando perfil...</div>
    </div>

    <template v-else>
      <!-- Foto e informações principais -->
      <div class="profile-header q-pa-md text-center">
        <q-avatar size="120px" class="profile-avatar">
          <img :src="userAvatar" alt="Avatar" />
          <q-badge floating color="positive" rounded />
        </q-avatar>
        <div class="profile-name q-mt-md">{{ userNome }}</div>
        <div class="profile-profession">{{ userProfissao }}</div>
        <div class="profile-rating q-mt-sm">
          <q-rating v-model="userRating" size="20px" :max="5" color="yellow" readonly />
          <span class="q-ml-sm">({{ userTotalAvaliacoes }} avaliações)</span>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.servicos || 0 }}</div>
              <div class="stat-label">Serviços</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.clientes || 0 }}</div>
              <div class="stat-label">Clientes</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.experiencia || 0 }}</div>
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
            <q-item-section>{{ userTelefone || 'Não informado' }}</q-item-section>
            <q-item-section side>
              <q-btn flat round icon="edit" size="sm" @click="editarTelefone" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="email" color="primary" />
            </q-item-section>
            <q-item-section>{{ userEmail || 'Não informado' }}</q-item-section>
            <q-item-section side>
              <q-btn flat round icon="edit" size="sm" @click="editarEmail" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="location_on" color="primary" />
            </q-item-section>
            <q-item-section>{{ userEndereco || 'Não informado' }}</q-item-section>
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
            <p>{{ userSobre || 'Nenhuma informação adicionada.' }}</p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat dense label="Editar" icon="edit" @click="editarSobre" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Portfólio -->
      <div class="portfolio-section q-pa-md">
        <div class="section-title">Portfólio</div>
        <div v-if="portfolio.length === 0" class="empty-portfolio q-mt-sm text-center">
          <q-icon name="photo_library" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhuma foto no portfólio</div>
          <q-btn flat color="primary" label="Adicionar fotos" icon="add" class="q-mt-sm" @click="adicionarPortfolio" />
        </div>
        <div v-else class="row q-col-gutter-sm q-mt-sm">
          <div v-for="(foto, index) in portfolio" :key="index" class="col-4">
            <q-img
              :src="foto"
              :ratio="1"
              class="portfolio-img"
              @click="verPortfolio(index)"
            />
          </div>
        </div>
        <q-btn
          v-if="portfolio.length > 0"
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
          <q-item clickable v-ripple @click="verDocumento('identidade')">
            <q-item-section avatar>
              <q-icon name="description" color="primary" />
            </q-item-section>
            <q-item-section>Documento de Identificação</q-item-section>
            <q-item-section side>
              <q-badge :color="documentoIdentidade ? 'positive' : 'grey-5'">
                {{ documentoIdentidade ? 'Verificado' : 'Pendente' }}
              </q-badge>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="badge" color="primary" />
            </q-item-section>
            <q-item-section>Certificado Profissional</q-item-section>
            <q-item-section side>
              <q-btn flat round icon="upload" size="sm" @click.stop="uploadDocumento" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>

    <!-- Dialog para editar perfil -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Editar Perfil</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editForm.nome"
            label="Nome completo"
            outlined
            dense
          />
          <q-input
            v-model="editForm.profissao"
            label="Profissão"
            outlined
            dense
          />
          <q-input
            v-model="editForm.telefone"
            label="Telefone"
            outlined
            dense
          />
          <q-input
            v-model="editForm.email"
            label="Email"
            type="email"
            outlined
            dense
          />
          <q-input
            v-model="editForm.endereco"
            label="Endereço"
            outlined
            dense
          />
          <q-input
            v-model="editForm.sobre"
            label="Sobre"
            type="textarea"
            outlined
            dense
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarPerfil"
            :loading="loadingSalvar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar sobre -->
    <q-dialog v-model="showSobreDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Editar Sobre</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="editSobre"
            label="Sobre você"
            type="textarea"
            outlined
            dense
            autogrow
            rows="4"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarSobre"
            :loading="loadingSalvar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para visualizar foto do portfólio -->
    <q-dialog v-model="showPortfolioDialog">
      <q-card style="max-width: 90vw; width: 500px">
        <q-card-section class="q-pa-none">
          <q-img
            v-if="portfolioSelecionado"
            :src="portfolioSelecionado"
            style="max-height: 70vh"
            fit="contain"
          />
          <div v-else class="text-center q-pa-md">
            <q-icon name="broken_image" size="64px" color="grey-4" />
            <div class="text-grey-6 q-mt-sm">Imagem não disponível</div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorStore } from 'src/stores/prestador-store';
import { api } from 'src/boot/axios';

defineOptions({
  name: 'PrestadorPerfil',
});

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// Estados
const loading = ref(true);
const loadingSalvar = ref(false);
const showEditDialog = ref(false);
const showSobreDialog = ref(false);
const showPortfolioDialog = ref(false);
const editSobre = ref('');
const portfolioSelecionado = ref<string | null>(null); // ✅ Corrigido: pode ser string ou null

// Dados do usuário (auth-store)
const userNome = computed(() => authStore.user?.nome || 'Prestador');
const userAvatar = computed(() => authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');
const userEmail = computed(() => authStore.user?.email || '');
const userTelefone = computed(() => authStore.user?.telefone || '');
const userRating = ref(0);
const userTotalAvaliacoes = ref(0);
const userProfissao = ref('');
const userSobre = ref('');
const userEndereco = ref('');

// Estatísticas
const stats = ref({
  servicos: 0,
  clientes: 0,
  experiencia: 0,
});

// Portfólio
const portfolio = ref<string[]>([]);
const documentoIdentidade = ref(false);

// Formulário de edição
const editForm = ref({
  nome: '',
  profissao: '',
  telefone: '',
  email: '',
  endereco: '',
  sobre: '',
});

// Carregar dados do prestador
const carregarDados = async () => {
  loading.value = true;
  try {
    // Carregar estatísticas
    const statsData = await prestadorStore.fetchStats();
    if (statsData) {
      const servicos = await prestadorStore.fetchServicos();
      stats.value = {
        servicos: servicos.length,
        clientes: 0,
        experiencia: 0,
      };
    }

    // Carregar informações adicionais do perfil
    const response = await api.get('/me');
    if (response.data.success && response.data.data) {
      const userData = response.data.data;
      userProfissao.value = userData.profissao || 'Prestador de Serviços';
      userSobre.value = userData.sobre || '';
      userEndereco.value = userData.endereco || '';
      userRating.value = userData.media_avaliacao || 0;
      userTotalAvaliacoes.value = userData.total_avaliacoes || 0;

      // Carregar portfólio se existir
      if (userData.preferences) {
        const prefs = typeof userData.preferences === 'string'
          ? JSON.parse(userData.preferences)
          : userData.preferences;
        if (prefs.portfolio && Array.isArray(prefs.portfolio)) {
          portfolio.value = prefs.portfolio.map((path: string) =>
            path.startsWith('http') ? path : `/storage/${path}`
          );
        }
      }
    }

    documentoIdentidade.value = true;
  } catch (error) {
    console.error('Erro ao carregar dados do perfil:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do perfil',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

// Ações
const editarPerfil = () => {
  editForm.value = {
    nome: userNome.value,
    profissao: userProfissao.value,
    telefone: userTelefone.value,
    email: userEmail.value,
    endereco: userEndereco.value,
    sobre: userSobre.value,
  };
  showEditDialog.value = true;
};

const salvarPerfil = () => {
  loadingSalvar.value = true;

  const dados = {
    nome: editForm.value.nome,
    profissao: editForm.value.profissao,
    telefone: editForm.value.telefone,
    email: editForm.value.email,
    endereco: editForm.value.endereco,
    sobre: editForm.value.sobre,
  };

  api.put('/me', dados)
    .then(() => {
      if (authStore.user) {
        authStore.user.nome = editForm.value.nome;
        authStore.user.email = editForm.value.email;
        authStore.user.telefone = editForm.value.telefone;
      }
      userProfissao.value = editForm.value.profissao;
      userSobre.value = editForm.value.sobre;
      userEndereco.value = editForm.value.endereco;

      $q.notify({
        type: 'positive',
        message: 'Perfil atualizado com sucesso!',
        position: 'top',
      });
      showEditDialog.value = false;
    })
    .catch((error) => {
      console.error('Erro ao atualizar perfil:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar perfil',
        position: 'top',
      });
    })
    .finally(() => {
      loadingSalvar.value = false;
    });
};

const editarTelefone = () => {
  editForm.value = {
    nome: userNome.value,
    profissao: userProfissao.value,
    telefone: userTelefone.value,
    email: userEmail.value,
    endereco: userEndereco.value,
    sobre: userSobre.value,
  };
  showEditDialog.value = true;
};

const editarEmail = () => {
  editForm.value = {
    nome: userNome.value,
    profissao: userProfissao.value,
    telefone: userTelefone.value,
    email: userEmail.value,
    endereco: userEndereco.value,
    sobre: userSobre.value,
  };
  showEditDialog.value = true;
};

const editarLocalizacao = () => {
  editForm.value = {
    nome: userNome.value,
    profissao: userProfissao.value,
    telefone: userTelefone.value,
    email: userEmail.value,
    endereco: userEndereco.value,
    sobre: userSobre.value,
  };
  showEditDialog.value = true;
};

const editarSobre = () => {
  editSobre.value = userSobre.value;
  showSobreDialog.value = true;
};

const salvarSobre = () => {
  loadingSalvar.value = true;

  api.put('/me', { sobre: editSobre.value })
    .then(() => {
      userSobre.value = editSobre.value;
      $q.notify({
        type: 'positive',
        message: 'Sobre atualizado com sucesso!',
        position: 'top',
      });
      showSobreDialog.value = false;
    })
    .catch((error) => {
      console.error('Erro ao atualizar sobre:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar sobre',
        position: 'top',
      });
    })
    .finally(() => {
      loadingSalvar.value = false;
    });
};

const verPortfolio = (index: number) => {
  // ✅ Correção: verificar se o índice existe
  if (portfolio.value[index]) {
    portfolioSelecionado.value = portfolio.value[index];
    showPortfolioDialog.value = true;
  } else {
    $q.notify({
      type: 'warning',
      message: 'Imagem não disponível',
      position: 'top',
    });
  }
};

const verPortfolioCompleto = () => {
  $q.notify({
    type: 'info',
    message: 'Portfólio completo em breve',
    position: 'top',
  });
};

const adicionarPortfolio = () => {
  $q.notify({
    type: 'info',
    message: 'Adicionar fotos ao portfólio em breve',
    position: 'top',
  });
};

const uploadDocumento = () => {
  $q.notify({
    type: 'info',
    message: 'Upload de documento em breve',
    position: 'top',
  });
};

const verDocumento = (tipo: string) => {
  $q.notify({
    type: 'info',
    message: `Visualizar ${tipo === 'identidade' ? 'documento de identificação' : 'documento'}`,
    position: 'top',
  });
};

// Inicialização
onMounted(() => {
  void carregarDados();
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
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

.info-list,
.docs-list {
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

.empty-portfolio {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}
</style>
