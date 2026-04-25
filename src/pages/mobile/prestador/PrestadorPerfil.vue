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
      <!-- Foto e informações principais (AuthStore) -->
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

      <!-- Estatísticas (PrestadorStore) -->
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
              <div class="stat-value">{{ stats.pedidos_pendentes || 0 }}</div>
              <div class="stat-label">Pendentes</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-item text-center">
              <div class="stat-value">{{ stats.avaliacao_media || 0 }}</div>
              <div class="stat-label">⭐ Média</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informações de contacto (AuthStore) -->
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

      <!-- Categorias que atende (PrestadorStore) -->
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

      <!-- Serviços oferecidos (PrestadorStore) -->
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
                    <div class="text-primary text-weight-bold">{{ servico.preco }} MZN</div>
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

      <!-- Disponibilidade (PrestadorStore) - FORMATADA -->
      <div class="disponibilidade-section q-pa-md">
        <div class="section-title">Disponibilidade</div>
        <div v-if="!disponibilidadeHorarios.length" class="text-grey-6 q-mt-sm text-center q-py-md">
          Nenhum horário definido
        </div>
        <div v-else class="availability-grid q-mt-sm">
          <div v-for="h in disponibilidadeHorarios" :key="h.dia" class="availability-item">
            <div class="day-badge" :class="{ active: h.ativo }">
              {{ h.dia }}
            </div>
            <div class="time-info">
              <q-icon name="schedule" size="16px" color="grey-6" />
              <span v-if="h.ativo && h.horario && h.horario !== 'Horário não definido'" class="time-text">{{ h.horario }}</span>
              <span v-else-if="h.ativo && !h.horario" class="time-text text-grey-5">Horário não definido</span>
              <span v-else class="time-text text-grey-5">Indisponível</span>
            </div>
            <div class="status-badge">
              <q-badge :color="h.ativo ? 'positive' : 'grey-5'" :outline="!h.ativo">
                {{ h.ativo ? 'Disponível' : 'Indisponível' }}
              </q-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Avaliações Recentes (PrestadorStore) - FORMATADA -->
      <div class="avaliacoes-section q-pa-md">
        <div class="section-title">Avaliações Recentes</div>
        <div v-if="avaliacoesRecentes.length === 0" class="empty-state q-mt-sm text-center q-py-md">
          <q-icon name="rate_review" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhuma avaliação ainda</div>
          <div class="text-caption text-grey-5">Quando receber avaliações, elas aparecerão aqui</div>
        </div>
        <div v-else class="row q-col-gutter-md q-mt-sm">
          <div v-for="avaliacao in avaliacoesRecentes" :key="avaliacao.id" class="col-12">
            <q-card flat bordered class="avaliacao-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col-auto">
                    <q-avatar size="40px">
                      <img :src="avaliacao.cliente.foto || 'https://cdn.quasar.dev/img/avatar.png'" />
                    </q-avatar>
                  </div>
                  <div class="col">
                    <div class="text-weight-bold">{{ avaliacao.cliente.nome }}</div>
                    <div class="rating-stars">
                      <q-rating v-model="avaliacao.nota" size="16px" :max="5" color="yellow" readonly />
                      <span class="rating-value">{{ avaliacao.nota }}/5</span>
                    </div>
                    <div class="text-caption text-grey-6">{{ formatarData(avaliacao.created_at) }}</div>
                  </div>
                </div>
                <div class="q-mt-md q-pt-sm" v-if="avaliacao.comentario">
                  <q-icon name="format_quote" size="16px" color="grey-5" class="quote-icon" />
                  <span class="comment-text">{{ avaliacao.comentario }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Próximos Serviços (PrestadorStore) -->
      <div class="proximos-servicos-section q-pa-md">
        <div class="section-title">Próximos Serviços</div>
        <div v-if="proximosServicos.length === 0" class="text-grey-6 q-mt-sm text-center q-py-md">
          Nenhum serviço agendado
        </div>
        <div v-else class="row q-col-gutter-md q-mt-sm">
          <div v-for="servico in proximosServicos" :key="servico.id" class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-weight-bold">{{ servico.cliente.nome }}</div>
                    <div class="text-caption">{{ servico.servico.nome }}</div>
                    <div class="text-caption text-grey-6">{{ servico.endereco }}</div>
                  </div>
                  <div class="col-auto text-right">
                    <div class="text-primary">{{ formatarData(servico.data) }}</div>
                    <div class="text-caption text-grey-6">{{ servico.valor }} MZN</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
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
import { api } from 'src/boot/axios';

defineOptions({ name: 'PrestadorPerfil' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// ==========================================
// ESTADOS LOCAIS (apenas UI e dados complementares)
// ==========================================
const loadingSalvar = ref(false);
const showEditDialog = ref(false);
const showPortfolioDialog = ref(false);
const portfolioSelecionado = ref<string | null>(null);

// Dados complementares (vem do /me)
const userProfissao = ref('');
const userSobre = ref('');
const userEndereco = ref('');
const userRating = ref(0);
const userTotalAvaliacoes = ref(0);
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

// ==========================================
// COMPUTEDS (consumindo stores)
// ==========================================
const loading = computed(() => prestadorStore.loading);
const userNome = computed(() => authStore.user?.nome || 'Prestador');
const userAvatar = computed(() => authStore.user?.foto || 'https://cdn.quasar.dev/img/avatar.png');
const userEmail = computed(() => authStore.user?.email || '');
const userTelefone = computed(() => authStore.user?.telefone || '');

const servicos = computed(() => prestadorStore.servicos);
const minhasCategorias = computed(() => prestadorStore.minhasCategorias);
const stats = computed(() => ({
  servicos: prestadorStore.servicos.length,
  pedidos_pendentes: prestadorStore.stats.pedidos_pendentes,
  avaliacao_media: prestadorStore.stats.avaliacao_media,
}));
const avaliacoesRecentes = computed(() => prestadorStore.avaliacoesRecentes);
const proximosServicos = computed(() => prestadorStore.proximosServicos);

// Disponibilidade formatada - CORRIGIDA (sem any e com type safety)
// Disponibilidade formatada - CORRIGIDA (conversão segura sem erro TS)
const disponibilidadeHorarios = computed(() => {
  const disp = prestadorStore.disponibilidade;
  if (!disp?.horarios_padrao) return [];

  const diasOrdem: Record<string, number> = {
    'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4,
    'sexta': 5, 'sabado': 6, 'domingo': 7
  };

  return Object.entries(disp.horarios_padrao)
    .map(([dia, data]) => {
      let ativo = false;
      let horario = '';

      // Verifica se data é um objeto (não array) com ativo/horario
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        ativo = obj.ativo === true;
        horario = typeof obj.horario === 'string' ? obj.horario : '';
      }
      // Verifica se data é string (formato simples)
      else if (typeof data === 'string') {
        horario = data;
        ativo = !!data;
      }
      // Verifica se data é array (múltiplos horários)
      else if (Array.isArray(data) && data.length > 0) {
        horario = data.filter(item => typeof item === 'string').join(', ');
        ativo = true;
      }

      return {
        dia: dia.charAt(0).toUpperCase() + dia.slice(1),
        diaKey: dia,
        ativo,
        horario: horario || 'Horário não definido',
        ordem: diasOrdem[dia.toLowerCase()] || 99
      };
    })
    .sort((a, b) => a.ordem - b.ordem);
});
// ==========================================
// MÉTODOS
// ==========================================

const formatarData = (data: string) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-MZ');
};

const carregarDadosComplementares = async () => {
  try {
    const response = await api.get('/me');
    if (response.data.success && response.data.data) {
      const userData = response.data.data;
      userProfissao.value = userData.profissao || 'Prestador de Serviços';
      userSobre.value = userData.sobre || '';
      userEndereco.value = userData.endereco || '';
      userRating.value = userData.media_avaliacao || 0;
      userTotalAvaliacoes.value = userData.total_avaliacoes || 0;

      // Portfólio do preferences
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
    console.error('Erro ao carregar dados complementares:', error);
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

const salvarPerfil = () => {
  loadingSalvar.value = true;

  api.put('/me', {
    nome: editForm.value.nome,
    profissao: editForm.value.profissao,
    telefone: editForm.value.telefone,
    email: editForm.value.email,
    endereco: editForm.value.endereco,
    sobre: editForm.value.sobre,
  })
    .then(() => {
      if (authStore.user) {
        authStore.user.nome = editForm.value.nome;
        authStore.user.email = editForm.value.email;
        authStore.user.telefone = editForm.value.telefone;
      }
      userProfissao.value = editForm.value.profissao;
      userSobre.value = editForm.value.sobre;
      userEndereco.value = editForm.value.endereco;

      $q.notify({ type: 'positive', message: 'Perfil atualizado!', position: 'top' });
      showEditDialog.value = false;
    })
    .catch((error) => {
      console.error(error);
      $q.notify({ type: 'negative', message: 'Erro ao atualizar', position: 'top' });
    })
    .finally(() => {
      loadingSalvar.value = false;
    });
};

const editarTelefone = () => editarPerfil();
const editarEmail = () => editarPerfil();
const editarLocalizacao = () => editarPerfil();
const editarSobre = () => editarPerfil();

const verPortfolio = (index: number) => {
  if (portfolio.value[index]) {
    portfolioSelecionado.value = portfolio.value[index];
    showPortfolioDialog.value = true;
  }
};

const adicionarPortfolio = () => {
  $q.notify({ type: 'info', message: 'Adicionar fotos em breve', position: 'top' });
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
onMounted(async () => {
  await prestadorStore.initialize();
  await carregarDadosComplementares();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-200: #eeeeee;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;

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
  }

  .profile-profession {
    font-size: 1rem;
    color: $gray-600;
  }
}

.stats-section .stat-item {
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

.section-title {
  font-size: 1rem;
  font-weight: 600;
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

.empty-portfolio,
.empty-servicos {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
}

// Estilos para Disponibilidade
.availability-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.availability-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
  transition: all 0.2s ease;

  &:hover {
    border-color: $purple-primary;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  .day-badge {
    min-width: 100px;
    font-weight: 600;
    color: $gray-800;
    padding: 4px 0;

    &.active {
      color: $purple-primary;
    }
  }

  .time-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;

    .time-text {
      font-size: 0.9rem;
      color: $gray-700;
    }
  }

  .status-badge {
    .q-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
    }
  }
}

// Estilos para Avaliações
.avaliacao-card {
  transition: all 0.2s ease;
  border-radius: 16px !important;

  &:hover {
    border-color: $purple-primary !important;
  }

  .rating-stars {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;

    .rating-value {
      font-size: 0.75rem;
      color: $gray-600;
    }
  }

  .quote-icon {
    vertical-align: middle;
    margin-right: 8px;
    opacity: 0.6;
  }

  .comment-text {
    font-size: 0.9rem;
    color: $gray-700;
    line-height: 1.4;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  border: 1px solid $gray-200;
  padding: 32px !important;
}
</style>
