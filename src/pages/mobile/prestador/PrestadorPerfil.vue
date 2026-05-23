<template>
  <div class="prestador-perfil">

    <!-- Cabeçalho -->
    <div class="page-header">
      <q-btn flat round icon="arrow_back" @click="router.back()" class="back-btn" />
      <h1 class="page-title">Meu Perfil</h1>
      <q-btn flat round icon="edit" @click="editarPerfil" class="edit-btn" />
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="skeleton-container">
      <div class="skeleton-avatar-container text-center q-mb-md">
        <q-skeleton type="circle" size="120px" class="inline-block" />
      </div>
      <div class="text-center q-mb-md">
        <q-skeleton type="text" width="200px" class="inline-block" />
      </div>
      <div class="text-center q-mb-lg">
        <q-skeleton type="text" width="150px" class="inline-block" />
      </div>
      <div class="stats-grid-skeleton">
        <div v-for="i in 3" :key="i">
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
      <div class="profile-header">
        <div class="avatar-container">
          <q-avatar size="120px" class="profile-avatar">
            <img :src="userAvatar" :alt="userNome" @error="handleAvatarError" />
            <q-badge floating color="positive" rounded />
          </q-avatar>
          <q-btn round dense color="primary" icon="photo_camera" size="sm" class="change-photo-btn" @click="trocarFotoPerfil" />
        </div>
        <div class="profile-name">{{ userNome }}</div>
        <div class="profile-profession">{{ userProfissao }}</div>
        <div class="profile-rating">
          <q-rating v-model="userRating" size="20px" :max="5" color="amber" readonly />
          <span class="rating-count">({{ userTotalAvaliacoes }} avaliações)</span>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--primary">
              <q-icon name="work" size="20px" />
            </div>
            <div class="stat-card__value">{{ stats.servicos }}</div>
            <div class="stat-card__label">Serviços</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--warning">
              <q-icon name="pending_actions" size="20px" />
            </div>
            <div class="stat-card__value">{{ stats.pedidos_pendentes }}</div>
            <div class="stat-card__label">Pendentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--gold">
              <q-icon name="star" size="20px" />
            </div>
            <div class="stat-card__value">{{ stats.avaliacao_media }}</div>
            <div class="stat-card__label">⭐ Média</div>
          </div>
        </div>
      </div>

      <!-- Informações de contacto -->
      <div class="info-section">
        <div class="section-title">Contacto</div>
        <div class="info-list">
          <div class="info-item">
            <div class="info-item__icon"><q-icon name="phone" size="18px" /></div>
            <div class="info-item__content">{{ userTelefone || 'Não informado' }}</div>
            <q-btn flat round icon="edit" size="sm" class="info-item__edit" @click="editarTelefone" />
          </div>
          <div class="info-item">
            <div class="info-item__icon"><q-icon name="email" size="18px" /></div>
            <div class="info-item__content">{{ userEmail || 'Não informado' }}</div>
            <q-btn flat round icon="edit" size="sm" class="info-item__edit" @click="editarEmail" />
          </div>
          <div class="info-item">
            <div class="info-item__icon"><q-icon name="location_on" size="18px" /></div>
            <div class="info-item__content">{{ userEndereco || 'Não informado' }}</div>
            <q-btn flat round icon="edit" size="sm" class="info-item__edit" @click="editarLocalizacao" />
          </div>
        </div>
      </div>

      <!-- Categorias que atende -->
      <div class="categorias-section">
        <div class="section-title">
          Áreas de Atuação
          <q-btn flat dense icon="add" size="sm" color="primary" @click="abrirSelecaoCategorias" />
        </div>
        <div v-if="carregandoCategorias" class="text-center q-py-md">
          <q-spinner size="24px" color="primary" />
          <span class="q-ml-sm">A carregar categorias...</span>
        </div>
        <div v-else class="categorias-container">
          <div v-for="cat in minhasCategorias" :key="cat.id" class="categoria-chip">
            <q-icon :name="cat.icone || 'category'" size="16px" />
            <span>{{ cat.nome }}</span>
          </div>
          <div v-if="minhasCategorias.length === 0" class="empty-message">
            <q-icon name="warning" size="20px" color="warning" />
            <span>Nenhuma categoria adicionada</span>
          </div>
        </div>
      </div>

      <!-- Sobre -->
      <div class="sobre-section">
        <div class="section-title">Sobre</div>
        <div class="sobre-card">
          <p>{{ userSobre || 'Nenhuma informação adicionada.' }}</p>
          <div class="sobre-card__actions">
            <q-btn flat dense label="Editar" icon="edit" @click="editarSobre" />
          </div>
        </div>
      </div>

      <!-- Serviços oferecidos -->
      <div class="servicos-section">
        <div class="section-title">Serviços Oferecidos</div>
        <div v-if="carregandoServicos" class="text-center q-py-md">
          <q-spinner size="24px" color="primary" />
          <span class="q-ml-sm">A carregar serviços...</span>
        </div>
        <div v-else-if="servicos.length === 0" class="empty-state">
          <q-icon name="work_off" size="48px" />
          <p>Nenhum serviço cadastrado</p>
        </div>
        <div v-else class="servicos-container">
          <div v-for="servico in servicos" :key="servico.id" class="servico-card">
            <div class="servico-card__icon">
              <q-icon :name="servico.icone || 'handyman'" size="28px" />
            </div>
            <div class="servico-card__info">
              <div class="servico-card__name">{{ servico.nome }}</div>
              <div class="servico-card__desc">{{ servico.descricao }}</div>
            </div>
            <div class="servico-card__price">
              <div class="price-value">{{ formatarPreco(servico.preco) }}</div>
              <div class="price-duration">{{ servico.duracao }} min</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfólio -->
      <div class="portfolio-section">
        <div class="section-title">Portfólio</div>
        <div v-if="portfolio.length === 0" class="empty-state">
          <q-icon name="photo_library" size="48px" />
          <p>Nenhuma foto no portfólio</p>
        </div>
        <div v-else class="portfolio-grid">
          <div v-for="(foto, index) in portfolio" :key="index" class="portfolio-item" @click="verPortfolio(index)">
            <q-img :src="foto" :ratio="1" class="portfolio-img" />
          </div>
        </div>
      </div>

      <!-- Disponibilidade -->
      <div class="disponibilidade-section">
        <div class="section-title">Disponibilidade</div>
        <div v-if="disponibilidadeHorarios.length === 0" class="empty-state">
          <q-icon name="schedule" size="32px" />
          <p>Nenhum horário definido</p>
        </div>
        <div v-else class="disponibilidade-grid">
          <div v-for="h in disponibilidadeHorarios" :key="h.dia" class="disponibilidade-card">
            <div class="disponibilidade-dia">{{ h.dia }}</div>
            <div class="disponibilidade-horario">
              <q-icon name="schedule" size="14px" />
              {{ h.horario }}
            </div>
          </div>
        </div>
      </div>

      <!-- Documentos -->
      <div class="docs-section">
        <div class="section-title">Documentos</div>
        <div class="docs-list">
          <div class="doc-item">
            <div class="doc-item__icon"><q-icon name="description" size="18px" /></div>
            <div class="doc-item__label">Documento de Identificação</div>
            <div class="doc-item__status" :class="documentoIdentidade ? 'verified' : 'pending'">
              {{ documentoIdentidade ? 'Verificado' : 'Pendente' }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Dialog para editar perfil -->
    <q-dialog v-model="showEditDialog">
      <q-card class="edit-dialog">
        <q-card-section class="edit-dialog__header">
          <div class="text-h6">Editar Perfil</div>
        </q-card-section>
        <q-card-section class="edit-dialog__content">
          <q-input v-model="editForm.nome" label="Nome completo" outlined dense />
          <q-input v-model="editForm.profissao" label="Profissão" outlined dense />
          <q-input v-model="editForm.telefone" label="Telefone" outlined dense />
          <q-input v-model="editForm.email" label="Email" type="email" outlined dense />
          <q-input v-model="editForm.endereco" label="Endereço" outlined dense />
          <q-input v-model="editForm.sobre" label="Sobre" type="textarea" outlined dense autogrow />
        </q-card-section>
        <q-card-actions align="right" class="edit-dialog__actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Salvar" color="primary" @click="salvarPerfil" :loading="loadingSalvar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para visualizar foto do portfólio -->
    <q-dialog v-model="showPortfolioDialog">
      <q-card class="portfolio-dialog">
        <q-img v-if="portfolioSelecionado" :src="portfolioSelecionado" style="max-height: 70vh" fit="contain" />
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para selecionar categorias -->
    <q-dialog v-model="showCategoriasDialog">
      <q-card class="categorias-dialog">
        <q-card-section class="categorias-dialog__header">
          <div class="text-h6">Minhas Categorias</div>
        </q-card-section>
        <q-card-section class="categorias-dialog__content">
          <div v-for="cat in todasCategorias" :key="cat.id" class="categoria-select-item" @click="toggleCategoria(cat.id)">
            <div class="categoria-select-item__icon">
              <q-icon :name="cat.icone || 'category'" :color="cat.cor || 'primary'" size="24px" />
            </div>
            <div class="categoria-select-item__info">
              <div class="categoria-select-item__name">{{ cat.nome }}</div>
              <div class="categoria-select-item__desc">{{ cat.descricao || 'Selecione esta categoria' }}</div>
            </div>
            <q-checkbox :model-value="categoriaSelecionada(cat.id)" color="primary" />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="categorias-dialog__actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Salvar" color="primary" @click="salvarCategorias" :loading="salvandoCategorias" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { usePrestadorPerfilStore } from 'src/stores/prestador/prestador-perfil-store';
import { usePrestadorServicosStore } from 'src/stores/prestador/prestador-servicos-store';
import { usePrestadorFinanceiroStore } from 'src/stores/prestador/prestador-financeiro-store';
import { usePrestadorPublicStore } from 'src/stores/prestador/prestador-public-store';
import type { ServicoData } from 'src/stores/prestador/prestador-servicos-store';
import type { CategoriaPrestadorData, PrestadorPerfilData } from 'src/stores/prestador/prestador-perfil-store';

defineOptions({ name: 'PrestadorPerfil' });

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

const perfilStore = usePrestadorPerfilStore();
const servicosStore = usePrestadorServicosStore();
const financeiroStore = usePrestadorFinanceiroStore();
const publicStore = usePrestadorPublicStore();

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

const userData = ref<PrestadorPerfilData | null>(null);
const todasCategorias = ref<CategoriaDisponivel[]>([]);
const categoriasSelecionadas = ref<number[]>([]);

const servicos = ref<ServicoData[]>([]);
const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
const stats = ref({ servicos: 0, pedidos_pendentes: 0, avaliacao_media: 0 });
const disponibilidadeHorarios = ref<DisponibilidadeHorario[]>([]);
const portfolio = ref<string[]>([]);
const documentoIdentidade = ref(false);

const editForm = ref<EditForm>({
  nome: '', profissao: '', telefone: '', email: '', endereco: '', sobre: '',
});

const gerarIniciais = (nome: string): string => {
  if (!nome || nome.trim() === '') return 'US';
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

const formatarPreco = (preco: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency', currency: 'MZN', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(preco);
};

const userNome = computed(() => userData.value?.nome || authStore.user?.nome || 'Prestador');
const userEmail = computed(() => userData.value?.email || authStore.user?.email || '');
const userTelefone = computed(() => userData.value?.telefone || authStore.user?.telefone || '');
const userProfissao = computed(() => userData.value?.profissao || 'Prestador de Serviços');
const userSobre = computed(() => userData.value?.sobre || '');
const userEndereco = computed(() => userData.value?.endereco || '');
const userRating = computed(() => userData.value?.media_avaliacao || 0);
const userTotalAvaliacoes = computed(() => userData.value?.total_avaliacoes || 0);

const userAvatar = computed(() => {
  if (avatarErro.value) {
    const iniciais = gerarIniciais(userNome.value);
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}`;
  }
  const foto = userData.value?.foto || authStore.user?.foto;
  if (foto && foto.startsWith('http')) return foto;
  if (foto && !foto.startsWith('http') && foto !== 'null' && foto !== '') {
    return foto.startsWith('/') ? foto : `/storage/${foto}`;
  }
  const iniciais = gerarIniciais(userNome.value);
  return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}`;
});

const handleAvatarError = () => { avatarErro.value = true; };

const buscarDadosUsuario = async () => {
  try {
    const perfil = await perfilStore.fetchPerfilCompleto(true);
    if (perfil) {
      userData.value = perfil;
      if (perfil.portfolio && perfil.portfolio.length > 0) {
        portfolio.value = perfil.portfolio;
      }
      avatarErro.value = false;
    }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
  }
};

// ✅ CORRIGIDO - usando o store em vez de chamar API diretamente
const buscarTodasCategorias = async () => {
  try {
    await publicStore.fetchServicoTiposOptions(true);
    todasCategorias.value = publicStore.servicoTiposOptions.map(opt => ({
      id: opt.value,
      nome: opt.label,
      icone: opt.icone,
      cor: opt.cor,
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar categorias disponíveis',
      position: 'top'
    });
  }
};

const categoriaSelecionada = (id: number) => categoriasSelecionadas.value.includes(id);

const toggleCategoria = (id: number) => {
  const index = categoriasSelecionadas.value.indexOf(id);
  if (index === -1) categoriasSelecionadas.value.push(id);
  else categoriasSelecionadas.value.splice(index, 1);
};

const abrirSelecaoCategorias = async () => {
  await buscarTodasCategorias();
  categoriasSelecionadas.value = minhasCategorias.value.map((c: CategoriaPrestadorData) => c.id);
  showCategoriasDialog.value = true;
};

const salvarCategorias = async () => {
  salvandoCategorias.value = true;
  try {
    const categoriasAtuais = minhasCategorias.value.map((c: CategoriaPrestadorData) => c.id);
    for (const catId of categoriasSelecionadas.value) {
      if (!categoriasAtuais.includes(catId)) await perfilStore.addCategoria(catId);
    }
    for (const catId of categoriasAtuais) {
      if (!categoriasSelecionadas.value.includes(catId)) await perfilStore.removeCategoria(catId);
    }
    await perfilStore.fetchMinhasCategorias(true);
    minhasCategorias.value = perfilStore.minhasCategorias;
    $q.notify({ type: 'positive', message: 'Categorias atualizadas!', position: 'top' });
    showCategoriasDialog.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar categorias', position: 'top' });
  } finally {
    salvandoCategorias.value = false;
  }
};

const carregarDados = async () => {
  loading.value = true;
  try {
    await buscarDadosUsuario();

    carregandoServicos.value = true;
    try {
      await servicosStore.fetchServicos(true);
      servicos.value = servicosStore.servicos;
      stats.value.servicos = servicosStore.servicos.length;
    } catch {
      servicos.value = [];
    } finally {
      carregandoServicos.value = false;
    }

    carregandoCategorias.value = true;
    try {
      await perfilStore.fetchMinhasCategorias(true);
      minhasCategorias.value = perfilStore.minhasCategorias;
    } catch {
      minhasCategorias.value = [];
    } finally {
      carregandoCategorias.value = false;
    }

    try {
      await financeiroStore.fetchStats(true);
      if (financeiroStore.stats) {
        stats.value.pedidos_pendentes = financeiroStore.stats.pedidos_pendentes || 0;
        stats.value.avaliacao_media = financeiroStore.stats.avaliacao_media || 0;
      }
    } catch {
      // Silencioso
    }

    try {
      await perfilStore.fetchDisponibilidade(true);
      if (perfilStore.disponibilidade?.horarios_padrao) {
        const horariosMap = perfilStore.disponibilidade.horarios_padrao;
        disponibilidadeHorarios.value = Object.entries(horariosMap)
          .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
          .map(([dia, horarios]) => ({
            dia: dia.charAt(0).toUpperCase() + dia.slice(1),
            horario: horarios.join(', '),
          }));
      } else {
        disponibilidadeHorarios.value = [];
      }
    } catch {
      disponibilidadeHorarios.value = [];
    }

    documentoIdentidade.value = true;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    loading.value = false;
  }
};

const trocarFotoPerfil = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) await uploadFotoPerfil(file);
  };
  input.click();
};

// ✅ CORRIGIDO - usando o store em vez de chamar API diretamente
const uploadFotoPerfil = async (file: File) => {
  $q.loading.show({ message: 'Enviando foto...' });
  try {
    const fotoUrl = await perfilStore.updateAvatar(file);
    if (fotoUrl) {
      if (userData.value) userData.value.foto = fotoUrl;
      if (authStore.user) authStore.user.foto = fotoUrl;
      avatarErro.value = false;
      $q.notify({ type: 'positive', message: 'Foto atualizada!', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar foto', position: 'top' });
  } finally {
    $q.loading.hide();
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

const editarTelefone = () => editarPerfil();
const editarEmail = () => editarPerfil();
const editarLocalizacao = () => editarPerfil();
const editarSobre = () => editarPerfil();

// ✅ CORRIGIDO - usando o store em vez de chamar API diretamente
const salvarPerfil = async () => {
  loadingSalvar.value = true;
  try {
    const success = await perfilStore.updateProfile({
      nome: editForm.value.nome,
      telefone: editForm.value.telefone,
      endereco: editForm.value.endereco,
    });

    if (success) {
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
      await perfilStore.fetchPerfilCompleto(true);
      $q.notify({ type: 'positive', message: 'Perfil atualizado!', position: 'top' });
      showEditDialog.value = false;
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar', position: 'top' });
  } finally {
    loadingSalvar.value = false;
  }
};

const verPortfolio = (index: number) => {
  if (portfolio.value[index]) {
    portfolioSelecionado.value = portfolio.value[index];
    showPortfolioDialog.value = true;
  }
};

onMounted(() => {
  void carregarDados();
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS DO SISTEMA
// =====================
$accent:       #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$green:        #10B981;
$gold:         #F59E0B;
$ink:          #0A0A0F;
$ink-2:        #3D3D4E;
$muted:        #9898A8;
$line:         rgba(0, 0, 0, 0.06);
$surface:      #FFFFFF;
$bg:           #F4F4F8;
$radius:       16px;
$radius-sm:    10px;
$radius-xs:    8px;

// =====================
// LAYOUT PRINCIPAL
// =====================
.prestador-perfil {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 80px;
}

// =====================
// CABEÇALHO
// =====================
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $surface;
  padding: 16px;
  border-bottom: 1px solid $line;

  .back-btn, .edit-btn {
    color: $muted;
    transition: all 0.2s;
    &:hover { color: $accent; background: $accent-light; }
  }

  .page-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: $ink;
    margin: 0;
  }
}

// =====================
// SKELETON
// =====================
.skeleton-container {
  padding: 16px;

  .inline-block { display: inline-block; }

  .stats-grid-skeleton {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// =====================
// PROFILE HEADER
// =====================
.profile-header {
  background: $surface;
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid $line;

  .profile-avatar { border: 3px solid $accent; }
  .profile-name { font-size: 1.5rem; font-weight: 700; color: $ink; margin-top: 12px; }
  .profile-profession { font-size: 0.9rem; color: $muted; margin-top: 4px; }
  .profile-rating { margin-top: 8px;
    .rating-count { font-size: 0.8rem; color: $muted; margin-left: 8px; }
  }
}

.avatar-container {
  position: relative;
  display: inline-block;

  .change-photo-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: $surface;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    &:hover { background: $accent-light; }
  }
}

// =====================
// STATS SECTION
// =====================
.stats-section {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: $surface;
  border-radius: $radius;
  padding: 16px;
  text-align: center;
  border: 1px solid $line;
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-xs;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;

    &--primary { background: rgba($accent, 0.1); color: $accent; }
    &--warning { background: rgba($gold, 0.1); color: $gold; }
    &--gold { background: rgba($gold, 0.1); color: $gold; }
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: $ink;
    line-height: 1.2;
  }

  &__label {
    font-size: 0.7rem;
    color: $muted;
    margin-top: 4px;
  }
}

// =====================
// SECTION TITLE
// =====================
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: $ink;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid $accent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// =====================
// INFO SECTION
// =====================
.info-section, .categorias-section, .sobre-section, .servicos-section,
.portfolio-section, .disponibilidade-section, .docs-section {
  padding: 16px;
  border-bottom: 1px solid $line;

  &:last-child { border-bottom: none; }
}

.info-list {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $line;

  &:last-child { border-bottom: none; }

  &__icon {
    width: 40px;
    color: $accent;
  }

  &__content {
    flex: 1;
    color: $ink;
    font-size: 0.9rem;
  }

  &__edit {
    color: $muted;
    &:hover { color: $accent; background: $accent-light; }
  }
}

// =====================
// CATEGORIAS
// =====================
.categorias-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.categoria-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba($accent, 0.1);
  color: $accent;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.empty-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $muted;
  font-size: 0.85rem;
  padding: 12px;
  background: rgba(0,0,0,0.02);
  border-radius: $radius-sm;
}

// =====================
// SOBRE CARD
// =====================
.sobre-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 16px;

  p {
    color: $ink-2;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 12px 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}

// =====================
// SERVIÇOS
// =====================
.servicos-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.servico-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;

  &:hover { transform: translateX(4px); border-color: $accent; }

  &__icon {
    width: 48px;
    height: 48px;
    background: rgba($accent, 0.1);
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $accent;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-weight: 600;
    color: $ink;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 0.75rem;
    color: $muted;
  }

  &__price {
    text-align: right;

    .price-value {
      font-weight: 700;
      color: $accent;
    }

    .price-duration {
      font-size: 0.7rem;
      color: $muted;
    }
  }
}

// =====================
// PORTFÓLIO
// =====================
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.portfolio-item {
  cursor: pointer;
  border-radius: $radius;
  overflow: hidden;
  transition: all 0.2s;

  &:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
}

.portfolio-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

// =====================
// DISPONIBILIDADE
// =====================
.disponibilidade-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.disponibilidade-card {
  background: $surface;
  border-radius: $radius;
  padding: 16px;
  text-align: center;
  border: 1px solid $line;
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); border-color: $accent; }

  .disponibilidade-dia {
    font-weight: 600;
    color: $ink;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid $accent;
    display: inline-block;
  }

  .disponibilidade-horario {
    font-size: 0.8rem;
    color: $muted;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
}

// =====================
// DOCUMENTOS
// =====================
.docs-list {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  overflow: hidden;
}

.doc-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;

  &__icon {
    width: 40px;
    color: $accent;
  }

  &__label {
    flex: 1;
    color: $ink;
    font-size: 0.9rem;
  }

  &__status {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;

    &.verified {
      background: rgba($green, 0.15);
      color: darken($green, 15%);
    }

    &.pending {
      background: rgba($gold, 0.15);
      color: darken($gold, 20%);
    }
  }
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;

  .q-icon { color: #d0d0dc; margin-bottom: 12px; }
  p { color: $muted; font-size: 0.85rem; margin: 0; }
}

// =====================
// DIALOGS
// =====================
.edit-dialog, .categorias-dialog, .portfolio-dialog {
  background: $surface;
  border-radius: $radius;
  min-width: 350px;

  &__header {
    background: $accent;
    color: #fff;
    padding: 16px;
  }

  &__content {
    padding: 16px;
  }

  &__actions {
    padding: 12px 16px;
    border-top: 1px solid $line;
  }
}

.categoria-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid $line;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: $accent-light; }

  &__icon { width: 40px; }
  &__info { flex: 1; }
  &__name { font-weight: 500; color: $ink; }
  &__desc { font-size: 0.7rem; color: $muted; }
}
</style>
