<template>
  <q-page class="prestador-perfil bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meu Perfil</div>
      <q-btn flat round icon="edit" @click="editarPerfil" />
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="skeleton-container q-pa-md">
      <div class="skeleton-avatar-container text-center q-mb-md">
        <q-skeleton type="circle" size="120px" class="inline-block" />
      </div>
      <div class="text-center q-mb-md">
        <q-skeleton type="text" width="200px" class="inline-block" />
      </div>
      <div class="text-center q-mb-lg">
        <q-skeleton type="text" width="150px" class="inline-block" />
      </div>
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="i in 3" :key="i" class="col-4">
          <q-skeleton type="rect" height="70px" />
        </div>
      </div>
      <div v-for="i in 4" :key="i" class="q-mb-md">
        <q-skeleton type="text" width="120px" class="q-mb-sm" />
        <q-skeleton type="rect" height="60px" />
      </div>
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
              <div class="stat-value">{{ stats.servicos }}</div>
              <div class="stat-label">Serviços</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.pedidos_pendentes }}</div>
              <div class="stat-label">Pendentes</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.avaliacao_media }}</div>
              <div class="stat-label">⭐ Média</div>
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

      <!-- Categorias que atende -->
      <div class="categorias-section q-pa-md">
        <div class="section-title">Áreas de Atuação</div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div v-for="cat in minhasCategorias" :key="cat.id" class="col-auto">
            <q-chip :color="cat.cor" text-color="white" icon="check_circle">
              {{ cat.nome }}
            </q-chip>
          </div>
          <div v-if="minhasCategorias.length === 0" class="col-12">
            <div class="text-grey-6 text-center q-py-md">Nenhuma categoria adicionada</div>
          </div>
        </div>
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

      <!-- Serviços oferecidos -->
      <div class="servicos-section q-pa-md">
        <div class="section-title">Serviços Oferecidos</div>
        <div v-if="servicos.length === 0" class="empty-servicos q-mt-sm text-center">
          <q-icon name="work_off" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhum serviço cadastrado</div>
        </div>
        <div v-else class="row q-col-gutter-md q-mt-sm">
          <div v-for="servico in servicos" :key="servico.id" class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center">
                  <div class="col-auto">
                    <q-icon :name="servico.icone || 'handyman'" size="32px" color="primary" />
                  </div>
                  <div class="col">
                    <div class="text-weight-bold">{{ servico.nome }}</div>
                    <div class="text-caption text-grey-6">{{ servico.descricao }}</div>
                  </div>
                  <div class="col-auto">
                    <div class="text-primary text-weight-bold">{{ formatarPreco(servico.preco) }}</div>
                    <div class="text-caption text-grey-6">{{ servico.duracao }} min</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
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
            <q-img :src="foto" :ratio="1" class="portfolio-img" @click="verPortfolio(index)" />
          </div>
        </div>
      </div>

      <!-- Disponibilidade -->
      <div class="disponibilidade-section q-pa-md">
        <div class="section-title">Disponibilidade</div>
        <div v-if="disponibilidadeHorarios.length === 0" class="text-grey-6 q-mt-sm text-center q-py-md">
          Nenhum horário definido
        </div>
        <div v-else class="row q-col-gutter-sm q-mt-sm">
          <div v-for="h in disponibilidadeHorarios" :key="h.dia" class="col-6 col-md-4">
            <q-chip outline class="full-width">
              <strong>{{ h.dia }}:</strong> {{ h.horario }}
            </q-chip>
          </div>
        </div>
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
              <q-badge :color="documentoIdentidade ? 'positive' : 'grey-5'">
                {{ documentoIdentidade ? 'Verificado' : 'Pendente' }}
              </q-badge>
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
          <q-input v-model="editForm.nome" label="Nome completo" outlined dense />
          <q-input v-model="editForm.profissao" label="Profissão" outlined dense />
          <q-input v-model="editForm.telefone" label="Telefone" outlined dense />
          <q-input v-model="editForm.email" label="Email" type="email" outlined dense />
          <q-input v-model="editForm.endereco" label="Endereço" outlined dense />
          <q-input v-model="editForm.sobre" label="Sobre" type="textarea" outlined dense autogrow />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Salvar" color="primary" @click="salvarPerfil" :loading="loadingSalvar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para visualizar foto do portfólio -->
    <q-dialog v-model="showPortfolioDialog">
      <q-card style="max-width: 90vw; width: 500px">
        <q-card-section class="q-pa-none">
          <q-img v-if="portfolioSelecionado" :src="portfolioSelecionado" style="max-height: 70vh" fit="contain" />
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
import type { ServicoData, CategoriaPrestadorData } from 'src/stores/prestador-store';
import { api } from 'src/boot/axios';

defineOptions({
  name: 'PrestadorPerfil',
});

interface DisponibilidadeHorario {
  dia: string;
  horario: string;
}

interface EditForm {
  nome: string;
  profissao: string;
  telefone: string;
  email: string;
  endereco: string;
  sobre: string;
}

interface Preferences {
  portfolio?: string[];
  [key: string]: unknown;
}

interface UserData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  tipo: string;
  profissao?: string;
  sobre?: string;
  endereco?: string;
  media_avaliacao?: number;
  total_avaliacoes?: number;
  preferences?: Preferences;
}

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// Estados
const loading = ref(true);
const loadingSalvar = ref(false);
const showEditDialog = ref(false);
const showPortfolioDialog = ref(false);
const portfolioSelecionado = ref<string | null>(null);

// Dados do usuário
const userData = ref<UserData | null>(null);

// Computed properties
const userNome = computed(() => userData.value?.nome || authStore.user?.nome || 'Prestador');
const userAvatar = computed(() => userData.value?.foto || authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');
const userEmail = computed(() => userData.value?.email || authStore.user?.email || '');
const userTelefone = computed(() => userData.value?.telefone || authStore.user?.telefone || '');
const userProfissao = computed(() => userData.value?.profissao || 'Prestador de Serviços');
const userSobre = computed(() => userData.value?.sobre || '');
const userEndereco = computed(() => userData.value?.endereco || '');
const userRating = computed(() => userData.value?.media_avaliacao || 0);
const userTotalAvaliacoes = computed(() => userData.value?.total_avaliacoes || 0);

// Dados do prestador-store
const servicos = ref<ServicoData[]>([]);
const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
const stats = ref({
  servicos: 0,
  pedidos_pendentes: 0,
  avaliacao_media: 0,
});
const disponibilidadeHorarios = ref<DisponibilidadeHorario[]>([]);

// Portfólio
const portfolio = ref<string[]>([]);
const documentoIdentidade = ref(false);

// Formulário de edição
const editForm = ref<EditForm>({
  nome: '',
  profissao: '',
  telefone: '',
  email: '',
  endereco: '',
  sobre: '',
});

const formatarPreco = (preco: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(preco);
};

// Buscar dados do usuário
const buscarDadosUsuario = async () => {
  try {
    const response = await api.get('/me');
    if (response.data && response.data.data) {
      userData.value = response.data.data as UserData;

      // Portfolio do preferences - SEM ANY
      if (userData.value?.preferences?.portfolio) {
        portfolio.value = userData.value.preferences.portfolio.map((path: string) =>
          path.startsWith('http') ? path : `/storage/${path}`
        );
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
  }
};

// Carregar dados usando APENAS a store
const carregarDados = async () => {
  loading.value = true;
  try {
    // 1. Buscar dados do usuário
    await buscarDadosUsuario();

    // 2. Inicializar a store (carrega servicos, categorias, stats, disponibilidade)
    await prestadorStore.initialize();

    // 3. Buscar serviços da store
    await prestadorStore.fetchServicos();
    servicos.value = prestadorStore.servicos;
    stats.value.servicos = prestadorStore.servicos.length;

    // 4. Buscar categorias da store
    await prestadorStore.fetchMinhasCategorias();
    minhasCategorias.value = prestadorStore.minhasCategorias;

    // 5. Buscar estatísticas da store
    await prestadorStore.fetchStats();
    if (prestadorStore.stats) {
      stats.value.pedidos_pendentes = prestadorStore.stats.pedidos_pendentes || 0;
      stats.value.avaliacao_media = prestadorStore.stats.avaliacao_media || 0;
    }

    // 6. Buscar disponibilidade da store
    await prestadorStore.fetchDisponibilidade();
    if (prestadorStore.disponibilidade?.horarios_padrao) {
      const horariosMap = prestadorStore.disponibilidade.horarios_padrao;
      disponibilidadeHorarios.value = Object.entries(horariosMap).map(([dia, horarios]) => ({
        dia: dia.charAt(0).toUpperCase() + dia.slice(1),
        horario: Array.isArray(horarios) ? horarios.join(', ') : String(horarios),
      }));
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

const salvarPerfil = async () => {
  loadingSalvar.value = true;
  try {
    const response = await api.put('/me', {
      nome: editForm.value.nome,
      profissao: editForm.value.profissao,
      telefone: editForm.value.telefone,
      email: editForm.value.email,
      endereco: editForm.value.endereco,
      sobre: editForm.value.sobre,
    });

    if (response.data.success) {
      // Atualizar userData
      if (userData.value) {
        userData.value.nome = editForm.value.nome;
        userData.value.email = editForm.value.email;
        userData.value.telefone = editForm.value.telefone;
        userData.value.profissao = editForm.value.profissao;
        userData.value.sobre = editForm.value.sobre;
        userData.value.endereco = editForm.value.endereco;
      }

      // Atualizar authStore
      if (authStore.user) {
        authStore.user.nome = editForm.value.nome;
        authStore.user.email = editForm.value.email;
        authStore.user.telefone = editForm.value.telefone;
      }

      $q.notify({ type: 'positive', message: 'Perfil atualizado!', position: 'top' });
      showEditDialog.value = false;
    }
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Erro ao atualizar', position: 'top' });
  } finally {
    loadingSalvar.value = false;
  }
};

const editarTelefone = () => editarPerfil();
const editarEmail = () => editarPerfil();
const editarLocalizacao = () => editarPerfil();
const editarSobre = () => {
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

const verPortfolio = (index: number) => {
  if (portfolio.value[index]) {
    portfolioSelecionado.value = portfolio.value[index];
    showPortfolioDialog.value = true;
  }
};

const adicionarPortfolio = () => {
  $q.notify({ type: 'info', message: 'Adicionar fotos em breve', position: 'top' });
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
.prestador-perfil {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #eeeeee;
}

.skeleton-container {
  .inline-block {
    display: inline-block;
  }

  .q-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.profile-header {
  background: white;

  .profile-avatar {
    border: 3px solid #667eea;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #212121;
  }

  .profile-profession {
    font-size: 1rem;
    color: #757575;
  }
}

.stats-section {
  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #eeeeee;

    .stat-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #757575;
    }
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
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
  border: 1px solid #eeeeee;
}
</style>
