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
      <div class="text-center text-grey-6 q-mt-md">
        <q-spinner color="primary" size="24px" class="q-mr-sm" />
        A carregar perfil...
      </div>
    </div>

    <template v-else>
      <!-- Foto e informações principais -->
      <div class="profile-header q-pa-md text-center">
        <div class="avatar-container">
          <q-avatar size="120px" class="profile-avatar">
            <img :src="userAvatar" :alt="userNome" @error="handleAvatarError" />
            <q-badge floating color="positive" rounded />
          </q-avatar>
          <q-btn
            round
            dense
            color="primary"
            icon="photo_camera"
            size="sm"
            class="change-photo-btn"
            @click="trocarFotoPerfil"
          />
        </div>
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

      <!-- Categorias que atende - CORRIGIDO com loading -->
      <div class="categorias-section q-pa-md">
        <div class="section-title">Áreas de Atuação</div>
        <div v-if="carregandoCategorias" class="text-center q-py-md">
          <q-spinner size="24px" color="primary" />
          <span class="q-ml-sm">A carregar categorias...</span>
        </div>
        <div v-else>
          <div class="row q-col-gutter-sm q-mt-sm">
            <div v-for="cat in minhasCategorias" :key="cat.id" class="col-auto">
              <q-chip :color="cat.cor || 'primary'" text-color="white" icon="check_circle">
                {{ cat.nome }}
              </q-chip>
            </div>
            <div v-if="minhasCategorias.length === 0" class="col-12">
              <div class="text-grey-6 text-center q-py-md">
                <q-icon name="warning" size="24px" class="q-mr-sm" color="warning" />
                Nenhuma categoria adicionada
                <div class="text-caption q-mt-sm">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Adicionar categorias"
                    icon="add"
                    @click="abrirSelecaoCategorias"
                  />
                </div>
              </div>
            </div>
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
        <div v-if="carregandoServicos" class="text-center q-py-md">
          <q-spinner size="24px" color="primary" />
          <span class="q-ml-sm">A carregar serviços...</span>
        </div>
        <div v-else-if="servicos.length === 0" class="empty-servicos q-mt-sm text-center">
          <q-icon name="work_off" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Nenhum serviço cadastrado</div>
          <q-btn
            flat
            color="primary"
            label="Adicionar serviço"
            icon="add"
            class="q-mt-sm"
            @click="adicionarServico"
          />
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
                    <div class="text-primary text-weight-bold">
                      {{ formatarPreco(servico.preco) }}
                    </div>
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
          <q-btn
            flat
            color="primary"
            label="Adicionar fotos"
            icon="add"
            class="q-mt-sm"
            @click="adicionarPortfolio"
          />
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
        <div
          v-if="disponibilidadeHorarios.length === 0"
          class="text-grey-6 q-mt-sm text-center q-py-md"
        >
          <q-icon name="schedule" size="24px" class="q-mr-sm" />
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
          <q-item clickable v-ripple @click="uploadDocumento">
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
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para selecionar categorias -->
    <q-dialog v-model="showCategoriasDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Minhas Categorias</div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="cat in todasCategorias" :key="cat.id" clickable v-ripple>
              <q-item-section avatar>
                <q-icon :name="cat.icone || 'category'" :color="cat.cor || 'primary'" />
              </q-item-section>
              <q-item-section>{{ cat.nome }}</q-item-section>
              <q-item-section side>
                <q-checkbox
                  :model-value="categoriaSelecionada(cat.id)"
                  @update:model-value="toggleCategoria(cat.id)"
                  color="primary"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarCategorias"
            :loading="salvandoCategorias"
          />
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

// Interfaces definidas localmente para evitar 'any'
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

// Interface para categoria disponível (evita 'any')
interface CategoriaDisponivel {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  descricao?: string;
  slug?: string;
}

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const prestadorStore = usePrestadorStore();

// Estados
const loading = ref(true);
const carregandoCategorias = ref(false);
const carregandoServicos = ref(false);
const loadingSalvar = ref(false);
const salvandoCategorias = ref(false);
const showEditDialog = ref(false);
const showPortfolioDialog = ref(false);
const showCategoriasDialog = ref(false);
const portfolioSelecionado = ref<string | null>(null);
const avatarErro = ref(false);

// Dados do usuário
const userData = ref<UserData | null>(null);
const todasCategorias = ref<CategoriaDisponivel[]>([]);
const categoriasSelecionadas = ref<number[]>([]);

// Função para gerar iniciais do nome
const gerarIniciais = (nome: string): string => {
  if (!nome || nome.trim() === '') {
    return 'US';
  }

  const partes = nome.trim().split(' ');

  if (partes.length === 1) {
    const primeiraParte = partes[0];
    if (primeiraParte && primeiraParte.length >= 2) {
      return primeiraParte.substring(0, 2).toUpperCase();
    } else if (primeiraParte && primeiraParte.length === 1) {
      return (primeiraParte[0] + 'U').toUpperCase();
    }
    return 'US';
  }

  const primeiraLetra = partes[0]?.[0] || '';
  const ultimaParte = partes[partes.length - 1];
  const ultimaLetra = ultimaParte?.[0] || '';

  return (primeiraLetra + ultimaLetra).toUpperCase();
};

// Computed properties
const userNome = computed(() => userData.value?.nome || authStore.user?.nome || 'Prestador');
const userEmail = computed(() => userData.value?.email || authStore.user?.email || '');
const userTelefone = computed(() => userData.value?.telefone || authStore.user?.telefone || '');
const userProfissao = computed(() => userData.value?.profissao || 'Prestador de Serviços');
const userSobre = computed(() => userData.value?.sobre || '');
const userEndereco = computed(() => userData.value?.endereco || '');
const userRating = computed(() => userData.value?.media_avaliacao || 0);
const userTotalAvaliacoes = computed(() => userData.value?.total_avaliacoes || 0);

// Avatar com fallback inteligente
const userAvatar = computed(() => {
  if (avatarErro.value) {
    const iniciais = gerarIniciais(userNome.value);
    return `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}`;
  }

  const foto = userData.value?.foto || authStore.user?.foto;

  if (foto && foto.startsWith('http')) {
    return foto;
  }

  if (foto && !foto.startsWith('http') && foto !== 'null' && foto !== '') {
    const path = foto.startsWith('/') ? foto : `/storage/${foto}`;
    return path;
  }

  const iniciais = gerarIniciais(userNome.value);
  return `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}`;
});

// Tratamento de erro da imagem
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  avatarErro.value = true;
  const iniciais = gerarIniciais(userNome.value);
  img.src = `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}`;
};

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

      if (userData.value?.preferences?.portfolio) {
        portfolio.value = userData.value.preferences.portfolio.map((path: string) =>
          path.startsWith('http') ? path : `/storage/${path}`,
        );
      }

      avatarErro.value = false;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
  }
};

// Buscar todas as categorias disponíveis
const buscarTodasCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    if (response.data && response.data.data) {
      todasCategorias.value = response.data.data as CategoriaDisponivel[];
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
  }
};

// Verificar se categoria está selecionada
const categoriaSelecionada = (id: number) => {
  return categoriasSelecionadas.value.includes(id);
};

// Alternar seleção de categoria
const toggleCategoria = (id: number) => {
  const index = categoriasSelecionadas.value.indexOf(id);
  if (index === -1) {
    categoriasSelecionadas.value.push(id);
  } else {
    categoriasSelecionadas.value.splice(index, 1);
  }
};

// Abrir diálogo de seleção de categorias
const abrirSelecaoCategorias = async () => {
  await buscarTodasCategorias();
  categoriasSelecionadas.value = minhasCategorias.value.map((c) => c.id);
  showCategoriasDialog.value = true;
};

// Salvar categorias selecionadas
const salvarCategorias = async () => {
  salvandoCategorias.value = true;
  try {
    const categoriasAtuais = minhasCategorias.value.map((c) => c.id);

    // Adicionar novas categorias
    for (const catId of categoriasSelecionadas.value) {
      if (!categoriasAtuais.includes(catId)) {
        await prestadorStore.addCategoria(catId);
      }
    }

    // Remover categorias que não estão mais selecionadas
    for (const catId of categoriasAtuais) {
      if (!categoriasSelecionadas.value.includes(catId)) {
        await prestadorStore.removeCategoria(catId);
      }
    }

    // Recarregar categorias
    await prestadorStore.fetchMinhasCategorias(true);
    minhasCategorias.value = prestadorStore.minhasCategorias;

    $q.notify({
      type: 'positive',
      message: 'Categorias atualizadas!',
      position: 'top',
    });

    showCategoriasDialog.value = false;
  } catch (error) {
    console.error('Erro ao salvar categorias:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar categorias',
      position: 'top',
    });
  } finally {
    salvandoCategorias.value = false;
  }
};

// Carregar dados usando a store - CORRIGIDO
const carregarDados = async () => {
  loading.value = true;

  const loadingNotify = $q.notify({
    type: 'info',
    message: 'A carregar perfil...',
    position: 'top',
    timeout: 0,
    spinner: true,
  });

  try {
    console.log('🚀 Iniciando carregamento do perfil...');

    // 1. Buscar dados básicos do usuário
    await buscarDadosUsuario();
    console.log('✅ Dados do usuário carregados');

    // 2. Inicializar store
    await prestadorStore.initialize();
    console.log('✅ Store inicializada');

    // 3. Buscar serviços (com loading individual)
    carregandoServicos.value = true;
    try {
      await prestadorStore.fetchServicos(true);
      servicos.value = prestadorStore.servicos;
      stats.value.servicos = prestadorStore.servicos.length;
      console.log(`✅ Serviços carregados: ${servicos.value.length}`);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      servicos.value = [];
    } finally {
      carregandoServicos.value = false;
    }

    // 4. Buscar categorias (CRÍTICO - com loading individual)
    carregandoCategorias.value = true;
    try {
      await prestadorStore.fetchMinhasCategorias(true);
      minhasCategorias.value = prestadorStore.minhasCategorias;
      console.log(`✅ Categorias carregadas: ${minhasCategorias.value.length}`);

      // Fallback: tentar recuperar do userData se vier vazio
      if (minhasCategorias.value.length === 0 && userData.value?.preferences?.categorias) {
        console.log('⚠️ Categorias vazias, tentando fallback do preferences...');
        const categoriasIds = userData.value.preferences.categorias as number[];
        if (Array.isArray(categoriasIds) && categoriasIds.length > 0) {
          const categoriasResponse = await api.get('/categorias');
          if (categoriasResponse.data?.data) {
            const todas = categoriasResponse.data.data as CategoriaDisponivel[];
            minhasCategorias.value = todas
              .filter((cat: CategoriaDisponivel) => categoriasIds.includes(cat.id))
              .map((cat: CategoriaDisponivel) => ({
                id: cat.id,
                nome: cat.nome,
                icone: cat.icone || 'category',
                cor: cat.cor || 'primary',
              }));
            console.log(
              `🔄 Recuperadas ${minhasCategorias.value.length} categorias do preferences`,
            );
          }
        }
      }
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err);
      minhasCategorias.value = [];
    } finally {
      carregandoCategorias.value = false;
    }

    // 5. Buscar estatísticas
    try {
      await prestadorStore.fetchStats(true);
      if (prestadorStore.stats) {
        stats.value.pedidos_pendentes = prestadorStore.stats.pedidos_pendentes || 0;
        stats.value.avaliacao_media = prestadorStore.stats.avaliacao_media || 0;
      }
      console.log('✅ Stats carregados');
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    }

    // 6. Buscar disponibilidade (com fallback) - CORRIGIDO
    try {
      await prestadorStore.fetchDisponibilidade(true);
      if (prestadorStore.disponibilidade?.horarios_padrao) {
        const horariosMap = prestadorStore.disponibilidade.horarios_padrao;
        disponibilidadeHorarios.value = Object.entries(horariosMap)
          .filter((entry): entry is [string, string[]] => {
            const [, horarios] = entry;
            return Array.isArray(horarios) && horarios.length > 0;
          })
          .map(([dia, horarios]) => ({
            dia: dia.charAt(0).toUpperCase() + dia.slice(1),
            horario: horarios.join(', '),
          }));
      } else {
        disponibilidadeHorarios.value = [];
      }
      console.log(`✅ Disponibilidade carregada: ${disponibilidadeHorarios.value.length} dias`);
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
      disponibilidadeHorarios.value = [];
    }

    documentoIdentidade.value = true;

    $q.notify({
      type: 'positive',
      message: 'Perfil carregado com sucesso!',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('❌ Erro FATAL ao carregar dados do perfil:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do perfil. Recarregue a página.',
      position: 'top',
      timeout: 5000,
      actions: [{ label: 'Recarregar', color: 'white', handler: () => window.location.reload() }],
    });
  } finally {
    loading.value = false;
    loadingNotify();
  }
};

// Função de debug
const debugDados = () => {
  console.group('🔍 DEBUG - Dados do Perfil');
  console.log('User Data:', userData.value);
  console.log('Categorias (minhasCategorias):', minhasCategorias.value);
  console.log('Serviços:', servicos.value);
  console.log('Disponibilidade:', disponibilidadeHorarios.value);
  console.log('Stats:', stats.value);
  console.log('Portfolio:', portfolio.value);
  console.log('Store initialized:', prestadorStore.initialized);
  console.log('Store loading:', prestadorStore.loading);
  console.groupEnd();
};

// Trocar foto de perfil
const trocarFotoPerfil = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await uploadFotoPerfil(file);
    }
  };
  input.click();
};

// Upload da foto
const uploadFotoPerfil = async (file: File) => {
  const formData = new FormData();
  formData.append('foto', file);

  $q.loading.show({ message: 'Enviando foto...' });

  try {
    const response = await api.post('/me/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success && response.data.data?.foto) {
      userData.value!.foto = response.data.data.foto;
      if (authStore.user) {
        authStore.user.foto = response.data.data.foto;
      }
      avatarErro.value = false;
      $q.notify({ type: 'positive', message: 'Foto atualizada!', position: 'top' });
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    $q.notify({ type: 'negative', message: 'Erro ao atualizar foto', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

// Upload de documento
const uploadDocumento = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,application/pdf';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('documento', file);

      $q.loading.show({ message: 'Enviando documento...' });

      try {
        const response = await api.post('/me/documento', formData);
        if (response.data.success) {
          documentoIdentidade.value = true;
          $q.notify({ type: 'positive', message: 'Documento enviado!', position: 'top' });
        }
      } catch (error) {
        console.error('Erro ao enviar documento:', error);
        $q.notify({ type: 'negative', message: 'Erro ao enviar documento', position: 'top' });
      } finally {
        $q.loading.hide();
      }
    }
  };
  input.click();
};

// Função para adicionar serviço
const adicionarServico = () => {
  $q.notify({
    type: 'info',
    message: 'Adicionar serviço em breve',
    position: 'top',
  });
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
      if (userData.value) {
        userData.value.nome = editForm.value.nome;
        userData.value.email = editForm.value.email;
        userData.value.telefone = editForm.value.telefone;
        userData.value.profissao = editForm.value.profissao;
        userData.value.sobre = editForm.value.sobre;
        userData.value.endereco = editForm.value.endereco;
      }

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
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      $q.notify({ type: 'info', message: 'Upload de múltiplas fotos em breve', position: 'top' });
    }
  };
  input.click();
};

onMounted(() => {
  void carregarDados().then(() => {
    debugDados();
  });
});
</script>

<style scoped lang="scss">
.prestador-perfil {
  min-height: 100vh;
  padding-bottom: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #eeeeee;
  position: sticky;
  top: 0;
  z-index: 10;
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

.avatar-container {
  position: relative;
  display: inline-block;

  .change-photo-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &:hover {
      background: #f5f5f5;
    }
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
  margin-bottom: 8px;
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
