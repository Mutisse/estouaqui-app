<template>
  <div class="prestador-perfil">
    <!-- Cabeçalho -->
    <div class="page-header">
      <q-btn flat round icon="arrow_back" @click="router.back()" class="back-btn" />
      <h1 class="page-title">Meu Perfil</h1>
      <div class="header-actions">
        <q-btn flat round icon="bar_chart" @click="irParaRelatorioFinanceiro" class="finance-btn" />
        <q-btn flat round icon="settings" @click="irParaConfiguracoes" class="settings-btn" />
        <q-btn flat round icon="logout" @click="confirmarLogout" class="logout-btn" />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="perfilStore.isLoading && !perfilStore.dadosCarregados" class="skeleton-container">
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
            <img :src="userAvatar" :alt="perfilStore.nomeCompleto" @error="handleAvatarError" />
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
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>
        <div class="profile-name">{{ perfilStore.nomeCompleto }}</div>
        <div class="profile-profession">{{ perfilStore.profissao }}</div>
        <div class="profile-rating">
          <q-rating v-model="perfilStore.rating" size="20px" :max="5" color="amber" readonly />
          <span class="rating-count">({{ perfilStore.totalAvaliacoes }} avaliações)</span>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--primary">
              <q-icon name="work" size="20px" />
            </div>
            <div class="stat-card__value">{{ perfilStore.stats.servicos }}</div>
            <div class="stat-card__label">Serviços</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--warning">
              <q-icon name="pending_actions" size="20px" />
            </div>
            <div class="stat-card__value">{{ perfilStore.stats.pedidos_pendentes }}</div>
            <div class="stat-card__label">Pendentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--gold">
              <q-icon name="star" size="20px" />
            </div>
            <div class="stat-card__value">{{ perfilStore.stats.avaliacao_media.toFixed(1) }}</div>
            <div class="stat-card__label">⭐ Média</div>
          </div>
        </div>
      </div>

      <!-- Botão Relatório Financeiro -->
      <div class="finance-report-section">
        <button class="finance-report-btn" @click="irParaRelatorioFinanceiro">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>Relatório Financeiro</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Botão Editar Perfil -->
      <button class="edit-profile-btn" @click="toggleEditMode">
        <svg v-if="!editMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
        </svg>
        <span>{{ editMode ? 'Cancelar' : 'Editar perfil' }}</span>
      </button>

      <!-- Formulário de Edição -->
      <transition name="slide-fade">
        <div v-if="editMode" class="edit-form-section">
          <div class="edit-form-header">
            <h3>Editar informações</h3>
          </div>
          <div class="edit-form-body">
            <div class="form-group">
              <label class="form-label">Nome completo</label>
              <q-input v-model="editForm.nome" outlined dense placeholder="Seu nome completo" :error="!!errors.nome" :error-message="errors.nome" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <q-input v-model="editForm.email" type="email" outlined dense placeholder="seu@email.com" :error="!!errors.email" :error-message="errors.email" />
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <q-input v-model="editForm.telefone" outlined dense placeholder="84 000 0000" :error="!!errors.telefone" :error-message="errors.telefone" />
            </div>
            <div class="form-group">
              <label class="form-label">Endereço</label>
              <q-input v-model="editForm.endereco" outlined dense placeholder="Seu endereço" />
            </div>
            <div class="form-group">
              <label class="form-label">Profissão</label>
              <q-input v-model="editForm.profissao" outlined dense placeholder="Ex: Canalizador, Eletricista..." />
            </div>
            <div class="form-group">
              <label class="form-label">Sobre mim</label>
              <q-input v-model="editForm.sobre" type="textarea" outlined dense placeholder="Fale um pouco sobre você..." rows="3" maxlength="500" />
              <div class="char-counter">{{ editForm.sobre?.length || 0 }}/500</div>
            </div>
            <div class="edit-actions">
              <q-btn flat label="Cancelar" @click="toggleEditMode" class="cancel-btn" />
              <q-btn unelevated label="Salvar alterações" color="primary" @click="salvarPerfil" :loading="loadingSalvar" class="save-btn" />
            </div>
          </div>
        </div>
      </transition>

      <!-- ===== SEÇÕES COLAPSÁVEIS ===== -->

      <!-- 1. CONTACTO -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('contacto')">
          <div class="section-title">
            <q-icon :name="sections.contacto ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Contacto
          </div>
        </div>
        <div v-show="sections.contacto" class="section-content">
          <div class="info-list">
            <div class="info-item">
              <div class="info-item__icon"><q-icon name="phone" size="18px" /></div>
              <div class="info-item__content">{{ perfilStore.telefone || 'Não informado' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item__icon"><q-icon name="email" size="18px" /></div>
              <div class="info-item__content">{{ perfilStore.email || 'Não informado' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item__icon"><q-icon name="location_on" size="18px" /></div>
              <div class="info-item__content">{{ perfilStore.endereco || 'Não informado' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. ÁREAS DE ATUAÇÃO -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('categorias')">
          <div class="section-title">
            <q-icon :name="sections.categorias ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Áreas de Atuação
          </div>
          <q-btn flat dense icon="edit" size="sm" color="primary" @click.stop="abrirEdicaoCategorias" />
        </div>
        <div v-show="sections.categorias" class="section-content">
          <transition name="slide-fade">
            <div v-if="editCategoriasMode" class="edit-categorias-section">
              <div class="edit-categorias-header">
                <h4>Selecione suas áreas de atuação</h4>
                <q-btn flat round dense icon="close" @click="fecharEdicaoCategorias" />
              </div>
              <div class="edit-categorias-body">
                <div v-if="carregandoCategorias" class="text-center q-py-md">
                  <q-spinner size="24px" color="primary" />
                  <span class="q-ml-sm">A carregar categorias...</span>
                </div>
                <div v-else class="categorias-grid-3col">
                  <div v-for="cat in todasCategorias" :key="cat.id" class="categoria-card" :class="{ selected: categoriaSelecionada(cat.id) }" @click="toggleCategoria(cat.id)">
                    <div class="categoria-card__icon">
                      <q-icon :name="cat.icone || 'category'" size="28px" :color="categoriaSelecionada(cat.id) ? 'primary' : 'grey'" />
                    </div>
                    <div class="categoria-card__info">
                      <div class="categoria-card__name">{{ cat.nome }}</div>
                      <div class="categoria-card__desc">{{ cat.descricao || 'Clique para selecionar' }}</div>
                    </div>
                    <div class="categoria-card__check">
                      <q-icon v-if="categoriaSelecionada(cat.id)" name="check_circle" size="20px" color="primary" />
                      <q-icon v-else name="radio_button_unchecked" size="20px" color="grey" />
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <q-btn flat label="Cancelar" @click="fecharEdicaoCategorias" />
                  <q-btn unelevated label="Salvar" color="primary" @click="salvarCategoriasExpansivel" :loading="salvandoCategorias" />
                </div>
              </div>
            </div>
          </transition>

          <div v-if="carregandoCategorias && !editCategoriasMode" class="text-center q-py-md">
            <q-spinner size="24px" color="primary" />
            <span class="q-ml-sm">A carregar categorias...</span>
          </div>
          <div v-else class="categorias-grid-3col-view">
            <div v-for="cat in perfilStore.minhasCategorias" :key="cat.id" class="categoria-chip-view">
              <q-icon :name="cat.icone || 'category'" size="16px" />
              <span>{{ cat.nome }}</span>
            </div>
            <div v-if="perfilStore.minhasCategorias.length === 0" class="empty-message-full">
              <q-icon name="warning" size="20px" color="warning" />
              <span>Nenhuma categoria adicionada. Clique em editar para selecionar.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. SOBRE -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('sobre')">
          <div class="section-title">
            <q-icon :name="sections.sobre ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Sobre
          </div>
        </div>
        <div v-show="sections.sobre" class="section-content">
          <div class="sobre-card">
            <p>{{ perfilStore.sobre || 'Nenhuma informação adicionada.' }}</p>
          </div>
        </div>
      </div>

      <!-- 4. SERVIÇOS OFERECIDOS -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('servicos')">
          <div class="section-title">
            <q-icon :name="sections.servicos ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Serviços Oferecidos
          </div>
          <q-btn flat dense icon="add" size="sm" color="primary" @click.stop="abrirFormServico" />
        </div>
        <div v-show="sections.servicos" class="section-content">
          <transition name="slide-fade">
            <div v-if="showServicoForm" class="edit-servico-section">
              <div class="edit-servico-header">
                <h4>{{ editandoServico ? 'Editar Serviço' : 'Novo Serviço' }}</h4>
                <q-btn flat round dense icon="close" @click="fecharFormServico" />
              </div>
              <div class="edit-servico-body">
                <div class="form-row">
                  <q-input v-model="servicoForm.nome" label="Nome do serviço" outlined dense class="col" />
                  <q-input v-model="servicoForm.duracao" label="Duração (min)" type="number" outlined dense class="col" />
                </div>
                <q-input v-model="servicoForm.descricao" label="Descrição" type="textarea" outlined dense rows="2" />
                <div class="form-row">
                  <q-input v-model="servicoForm.preco" label="Preço (MZN)" type="number" outlined dense class="col" />
                  <q-select v-model="servicoForm.icone" :options="iconeOptions" label="Ícone" outlined dense class="col" />
                </div>
                <div class="edit-actions">
                  <q-btn flat label="Cancelar" @click="fecharFormServico" />
                  <q-btn unelevated label="Salvar" color="primary" @click="salvarServico" :loading="salvandoServico" />
                </div>
              </div>
            </div>
          </transition>

          <div v-if="carregandoServicos" class="text-center q-py-md">
            <q-spinner size="24px" color="primary" />
            <span class="q-ml-sm">A carregar serviços...</span>
          </div>
          <div v-else-if="perfilStore.servicos.length === 0" class="empty-state-small">
            <q-icon name="work_off" size="32px" />
            <p>Nenhum serviço cadastrado</p>
          </div>
          <div v-else class="servicos-container">
            <div v-for="servico in perfilStore.servicos" :key="servico.id" class="servico-card">
              <div class="servico-card__icon">
                <q-icon :name="servico.icone || 'handyman'" size="28px" />
              </div>
              <div class="servico-card__info">
                <div class="servico-card__name">{{ servico.nome }}</div>
                <div class="servico-card__desc">{{ servico.descricao || 'Serviço profissional' }}</div>
              </div>
              <div class="servico-card__price">
                <div class="price-value">{{ formatarPreco(servico.preco) }}</div>
                <div class="price-duration">{{ servico.duracao }} min</div>
              </div>
              <div class="servico-card__actions">
                <q-btn flat round icon="edit" size="sm" color="primary" @click.stop="handleEditarServico(servico)" />
                <q-btn flat round icon="delete" size="sm" color="negative" @click.stop="handleRemoverServico(servico.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. PORTFÓLIO -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('portfolio')">
          <div class="section-title">
            <q-icon :name="sections.portfolio ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Portfólio
          </div>
          <q-btn flat dense icon="add" size="sm" color="primary" @click.stop="adicionarFotoPortfolio" />
        </div>
        <div v-show="sections.portfolio" class="section-content">
          <div v-if="perfilStore.portfolio.length === 0" class="empty-state-small">
            <q-icon name="photo_library" size="32px" />
            <p>Nenhuma foto no portfólio</p>
          </div>
          <div v-else class="portfolio-grid">
            <div v-for="(foto, index) in perfilStore.portfolio" :key="index" class="portfolio-item" @click="verPortfolio(index)">
              <q-img :src="obterUrlFoto(foto)" ratio="1" class="portfolio-img" />
              <div class="portfolio-overlay">
                <div class="portfolio-actions">
                  <q-btn flat round dense icon="edit" size="sm" color="white" @click.stop="abrirEditarPortfolio(foto, index)" />
                  <q-btn flat round dense icon="delete" size="sm" color="negative" @click.stop="removerFotoPortfolio(index)" />
                </div>
              </div>
              <div v-if="foto.titulo || foto.descricao" class="portfolio-info">
                <div v-if="foto.titulo" class="portfolio-titulo">{{ foto.titulo }}</div>
                <div v-if="foto.descricao" class="portfolio-descricao">{{ foto.descricao }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL EDITAR PORTFÓLIO -->
      <q-dialog v-model="showEditPortfolioModal">
        <q-card class="edit-portfolio-modal">
          <q-card-section class="edit-portfolio-header">
            <div class="text-h6">Editar item do portfólio</div>
            <q-btn flat round dense icon="close" @click="fecharEditarPortfolio" />
          </q-card-section>
          <q-card-section class="edit-portfolio-body">
            <div class="portfolio-preview">
              <q-img :src="portfolioEditForm.url || ''" style="max-height: 200px; max-width: 100%; object-fit: cover; border-radius: 8px;" />
            </div>
            <div class="form-group">
              <label class="form-label">Título</label>
              <q-input v-model="portfolioEditForm.titulo" outlined dense placeholder="Digite um título para esta foto" maxlength="100" />
              <div class="char-counter">{{ portfolioEditForm.titulo?.length || 0 }}/100</div>
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <q-input v-model="portfolioEditForm.descricao" type="textarea" outlined dense placeholder="Descreva esta foto..." rows="3" maxlength="500" />
              <div class="char-counter">{{ portfolioEditForm.descricao?.length || 0 }}/500</div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="edit-portfolio-actions">
            <q-btn flat label="Cancelar" @click="fecharEditarPortfolio" />
            <q-btn unelevated label="Salvar" color="primary" @click="salvarEdicaoPortfolio" :loading="salvandoPortfolio" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 6. DISPONIBILIDADE -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('disponibilidade')">
          <div class="section-title">
            <q-icon :name="sections.disponibilidade ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Disponibilidade
          </div>
          <q-btn flat dense icon="edit" size="sm" color="primary" @click.stop="editarDisponibilidade" />
        </div>
        <div v-show="sections.disponibilidade" class="section-content">
          <transition name="slide-fade">
            <div v-if="editDisponibilidade" class="edit-disponibilidade-section">
              <div class="edit-disponibilidade-header">
                <h4>Editar Horários de Disponibilidade</h4>
                <q-btn flat round dense icon="close" @click="cancelarEditarDisponibilidade" />
              </div>
              <div class="edit-disponibilidade-body">
                <div class="disponibilidade-grid-editor">
                  <div v-for="dia in diasDaSemana" :key="dia.key" class="disponibilidade-edit-item">
                    <div class="dia-info">
                      <div class="dia-label">{{ dia.label }}</div>
                      <q-toggle v-model="disponibilidadeAtiva[dia.key]" color="primary" />
                    </div>
                    <div v-if="disponibilidadeAtiva[dia.key]" class="horarios-inputs">
                      <q-select v-model="disponibilidadeHorariosSelecionados[dia.key]" :options="opcoesHorarios" label="Selecione os horários" multiple outlined dense use-chips stack-label emit-value map-options class="horarios-select" />
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <q-btn flat label="Cancelar" @click="cancelarEditarDisponibilidade" />
                  <q-btn unelevated label="Salvar" color="primary" @click="salvarDisponibilidade" :loading="salvandoDisponibilidade" />
                </div>
              </div>
            </div>
          </transition>

          <div v-if="perfilStore.disponibilidadeHorariosFormatados.length === 0" class="empty-state-small">
            <q-icon name="schedule" size="32px" />
            <p>Nenhum horário definido</p>
          </div>
          <div v-else class="disponibilidade-grid-view">
            <div v-for="h in perfilStore.disponibilidadeHorariosFormatados" :key="h.dia" class="disponibilidade-card">
              <div class="disponibilidade-dia">{{ h.dia }}</div>
              <div class="disponibilidade-horario">
                <q-icon name="schedule" size="14px" />
                {{ h.horario }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. DOCUMENTOS -->
      <div class="collapsible-section">
        <div class="section-header" @click="toggleSection('documentos')">
          <div class="section-title">
            <q-icon :name="sections.documentos ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            Documentos
          </div>
        </div>
        <div v-show="sections.documentos" class="section-content">
          <div class="docs-list">
            <div class="doc-item">
              <div class="doc-item__icon"><q-icon name="description" size="18px" /></div>
              <div class="doc-item__label">Documento de Identificação</div>
              <div class="doc-item__status" :class="perfilStore.documentoVerificado ? 'verified' : 'pending'">
                {{ perfilStore.documentoVerificado ? 'Verificado' : 'Pendente' }}
              </div>
              <q-btn v-if="!perfilStore.documentoVerificado" flat dense label="Enviar" size="sm" color="primary" @click="uploadDocumento" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  usePrestadorPerfilStore,
  opcoesHorarios,
  iconeOptions,
  diasDaSemana,
  type PortfolioItem,
  type CategoriaDisponivel,
} from 'src/stores/prestador/prestador-perfil-store';

defineOptions({ name: 'PrestadorPerfil' });

interface EditFormData {
  nome: string;
  profissao: string;
  telefone: string;
  email: string;
  endereco: string;
  sobre: string;
}

interface ServicoForm {
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  icone: string;
}

interface ServicoItem {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  icone?: string;
}

interface PortfolioEditForm {
  id: number | null;
  url: string;
  titulo: string;
  descricao: string;
  path: string;
  index: number;
}

const router = useRouter();
const $q = useQuasar();
const perfilStore = usePrestadorPerfilStore();

const sections = ref({
  contacto: true,
  categorias: true,
  sobre: true,
  servicos: true,
  portfolio: true,
  disponibilidade: true,
  documentos: false,
});

const editMode = ref(false);
const avatarError = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const fotoTimestamp = ref(Date.now());

const editCategoriasMode = ref(false);
const editDisponibilidade = ref(false);
const disponibilidadeAtiva = ref<Record<string, boolean>>({});
const disponibilidadeHorariosSelecionados = ref<Record<string, string[]>>({});

const showServicoForm = ref(false);
const editandoServico = ref(false);
const servicoEditandoId = ref<number | null>(null);

const showEditPortfolioModal = ref(false);
const salvandoPortfolio = ref(false);
const portfolioEditForm = reactive<PortfolioEditForm>({
  id: null,
  url: '',
  titulo: '',
  descricao: '',
  path: '',
  index: -1,
});

const todasCategorias = ref<CategoriaDisponivel[]>([]);
const categoriasSelecionadas = ref<number[]>([]);

const editForm = reactive<EditFormData>({
  nome: '',
  profissao: '',
  telefone: '',
  email: '',
  endereco: '',
  sobre: '',
});

const servicoForm = reactive<ServicoForm>({
  nome: '',
  descricao: '',
  preco: 0,
  duracao: 60,
  icone: 'handyman',
});

const errors = reactive({ nome: '', email: '', telefone: '' });

const carregandoCategorias = ref(false);
const carregandoServicos = ref(false);
const loadingSalvar = ref(false);
const salvandoCategorias = ref(false);
const salvandoDisponibilidade = ref(false);
const salvandoServico = ref(false);

const obterUrlFoto = (foto: string | PortfolioItem): string => {
  if (!foto) return '';
  if (typeof foto === 'string') return foto;
  if (foto.url) return foto.url;
  if (foto.path) {
    if (foto.path.startsWith('http')) return foto.path;
    return `http://localhost:8000/storage/${foto.path}`;
  }
  return '';
};

const userAvatar = computed(() => {
  if (avatarError.value) {
    const iniciais = gerarIniciais(perfilStore.nomeCompleto);
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}&t=${fotoTimestamp.value}`;
  }
  const foto = perfilStore.foto;
  if (foto && foto.startsWith('http')) return `${foto}?t=${fotoTimestamp.value}`;
  if (foto && !foto.startsWith('http') && foto !== 'null' && foto !== '') {
    return `${foto.startsWith('/') ? foto : `/storage/${foto}`}?t=${fotoTimestamp.value}`;
  }
  const iniciais = gerarIniciais(perfilStore.nomeCompleto);
  return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=120&name=${encodeURIComponent(iniciais)}&t=${fotoTimestamp.value}`;
});

const gerarIniciais = (nome: string): string => {
  if (!nome || nome.trim() === '') return 'US';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) {
    const primeiraParte = partes[0];
    if (primeiraParte && primeiraParte.length >= 2) return primeiraParte.substring(0, 2).toUpperCase();
    if (primeiraParte && primeiraParte.length === 1) return (primeiraParte[0] + 'U').toUpperCase();
    return 'US';
  }
  const primeiraLetra = partes[0]?.[0] || '';
  const ultimaLetra = partes[partes.length - 1]?.[0] || '';
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

const formatarPreco = (preco: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(preco);
};

const handleAvatarError = () => { avatarError.value = true; };

const carregarDadosNoForm = () => {
  editForm.nome = perfilStore.nomeCompleto;
  editForm.profissao = perfilStore.profissao;
  editForm.telefone = perfilStore.telefone;
  editForm.email = perfilStore.email;
  editForm.endereco = perfilStore.endereco;
  editForm.sobre = perfilStore.sobre;
};

const validarForm = (): boolean => {
  let isValid = true;
  errors.nome = '';
  errors.email = '';
  errors.telefone = '';

  if (!editForm.nome.trim()) { errors.nome = 'Nome é obrigatório'; isValid = false; }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!editForm.email.trim()) { errors.email = 'Email é obrigatório'; isValid = false; }
  else if (!emailRegex.test(editForm.email)) { errors.email = 'Email inválido'; isValid = false; }
  if (!editForm.telefone.trim()) { errors.telefone = 'Telefone é obrigatório'; isValid = false; }

  return isValid;
};

const toggleSection = (section: keyof typeof sections.value) => { sections.value[section] = !sections.value[section]; };
const toggleEditMode = () => { if (editMode.value) carregarDadosNoForm(); editMode.value = !editMode.value; };

const irParaConfiguracoes = () => void router.push('/mobile/prestador/configuracoes');
const irParaRelatorioFinanceiro = () => void router.push('/mobile/prestador/relatorio-financeiro');

const confirmarLogout = () => {
  $q.dialog({
    title: 'Sair da conta',
    message: 'Tem certeza que deseja sair?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await perfilStore.logout();
      if (success) {
        $q.notify({ type: 'positive', message: 'Logout efetuado!', position: 'top' });
        void router.push('/auth/login');
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao sair', position: 'top' });
      }
    })();
  });
};

const trocarFotoPerfil = () => fileInput.value?.click();

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { $q.notify({ type: 'negative', message: 'A foto deve ter no máximo 5MB', position: 'top' }); return; }
  if (!file.type.startsWith('image/')) { $q.notify({ type: 'negative', message: 'Selecione uma imagem válida', position: 'top' }); return; }

  $q.loading.show({ message: 'Enviando foto...' });
  try {
    const fotoUrl = await perfilStore.updateAvatar(file);
    if (fotoUrl) {
      avatarError.value = false;
      fotoTimestamp.value = Date.now();
      $q.notify({ type: 'positive', message: 'Foto atualizada!', position: 'top' });
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar foto', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar foto', position: 'top' });
  } finally {
    $q.loading.hide();
    if (fileInput.value) fileInput.value.value = '';
  }
};

const salvarPerfil = async () => {
  if (!validarForm()) return;
  loadingSalvar.value = true;
  try {
    const success = await perfilStore.updateProfile({ nome: editForm.nome, telefone: editForm.telefone, endereco: editForm.endereco });
    if (success) {
      $q.notify({ type: 'positive', message: 'Perfil atualizado!', position: 'top' });
      editMode.value = false;
      await perfilStore.fetchPerfilCompleto(true);
      carregarDadosNoForm();
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar perfil', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar', position: 'top' });
  } finally {
    loadingSalvar.value = false;
  }
};

// 🔥 BUSCAR CATEGORIAS - USANDO A STORE
const buscarTodasCategorias = async () => {
  carregandoCategorias.value = true;
  try {
    const result = await perfilStore.buscarTodasCategorias();
    todasCategorias.value = result;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar categorias', position: 'top' });
  } finally {
    carregandoCategorias.value = false;
  }
};

const categoriaSelecionada = (id: number) => categoriasSelecionadas.value.includes(id);
const toggleCategoria = (id: number) => {
  const index = categoriasSelecionadas.value.indexOf(id);
  if (index === -1) categoriasSelecionadas.value.push(id);
  else categoriasSelecionadas.value.splice(index, 1);
};

const abrirEdicaoCategorias = async () => {
  await buscarTodasCategorias();
  categoriasSelecionadas.value = perfilStore.minhasCategorias.map((c) => c.id);
  editCategoriasMode.value = true;
};
const fecharEdicaoCategorias = () => { editCategoriasMode.value = false; };

const salvarCategoriasExpansivel = async () => {
  salvandoCategorias.value = true;
  try {
    const atuais = perfilStore.minhasCategorias.map((c) => c.id);
    for (const id of categoriasSelecionadas.value) { if (!atuais.includes(id)) await perfilStore.addCategoria(id); }
    for (const id of atuais) { if (!categoriasSelecionadas.value.includes(id)) await perfilStore.removeCategoria(id); }
    await perfilStore.fetchMinhasCategorias(true);
    $q.notify({ type: 'positive', message: 'Categorias atualizadas!', position: 'top' });
    editCategoriasMode.value = false;
  } catch { $q.notify({ type: 'negative', message: 'Erro ao atualizar categorias', position: 'top' }); }
  finally { salvandoCategorias.value = false; }
};

// ===================== PORTFÓLIO =====================

const adicionarFotoPortfolio = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      $q.loading.show({ message: 'Adicionando foto...' });
      try {
        const result = await perfilStore.addPortfolio(file);
        $q.loading.hide();
        if (result) {
          $q.notify({ type: 'positive', message: 'Foto adicionada!', position: 'top' });
          const index = perfilStore.portfolio.length - 1;
          const item = perfilStore.portfolio[index];
          if (item) {
            abrirEditarPortfolio(item, index);
          }
        } else {
          $q.notify({ type: 'negative', message: 'Erro ao adicionar foto', position: 'top' });
        }
      } catch {
        $q.loading.hide();
        $q.notify({ type: 'negative', message: 'Erro ao adicionar foto', position: 'top' });
      }
    }
  };
  input.click();
};

const abrirEditarPortfolio = (foto: PortfolioItem, index: number) => {
  portfolioEditForm.id = foto.id || null;
  portfolioEditForm.url = obterUrlFoto(foto);
  portfolioEditForm.titulo = foto.titulo || '';
  portfolioEditForm.descricao = foto.descricao || '';
  portfolioEditForm.path = foto.path || '';
  portfolioEditForm.index = index;
  showEditPortfolioModal.value = true;
};

const fecharEditarPortfolio = () => {
  showEditPortfolioModal.value = false;
  portfolioEditForm.id = null;
  portfolioEditForm.url = '';
  portfolioEditForm.titulo = '';
  portfolioEditForm.descricao = '';
  portfolioEditForm.path = '';
  portfolioEditForm.index = -1;
};

const salvarEdicaoPortfolio = async () => {
  salvandoPortfolio.value = true;
  try {
    const index = portfolioEditForm.index;
    const item = perfilStore.portfolio[index];
    if (!item) {
      $q.notify({ type: 'negative', message: 'Item não encontrado', position: 'top' });
      return;
    }

    const result = await perfilStore.atualizarPortfolio(item.id, {
      titulo: portfolioEditForm.titulo,
      descricao: portfolioEditForm.descricao,
    });

    if (result) {
      $q.notify({ type: 'positive', message: 'Portfólio atualizado!', position: 'top' });
      fecharEditarPortfolio();
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar portfólio', position: 'top' });
    }
  } catch (error) {
    console.error('Erro ao salvar edição do portfólio:', error);
    $q.notify({ type: 'negative', message: 'Erro ao atualizar portfólio', position: 'top' });
  } finally {
    salvandoPortfolio.value = false;
  }
};

const removerFotoPortfolio = (index: number) => {
  $q.dialog({
    title: 'Remover foto',
    message: 'Deseja remover esta foto do portfólio?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      $q.loading.show({ message: 'Removendo foto...' });
      const success = await perfilStore.removePortfolio(index);
      $q.loading.hide();
      $q.notify({ type: success ? 'positive' : 'negative', message: success ? 'Foto removida!' : 'Erro ao remover foto', position: 'top' });
    })();
  });
};

const verPortfolio = (index: number) => {
  const foto = perfilStore.portfolio[index];
  if (foto) {
    abrirEditarPortfolio(foto, index);
  }
};

// ===================== SERVIÇOS =====================

const abrirFormServico = () => {
  editandoServico.value = false;
  servicoForm.nome = '';
  servicoForm.descricao = '';
  servicoForm.preco = 0;
  servicoForm.duracao = 60;
  servicoForm.icone = 'handyman';
  showServicoForm.value = true;
};

const handleEditarServico = (servico: ServicoItem) => {
  editandoServico.value = true;
  servicoEditandoId.value = servico.id;
  servicoForm.nome = servico.nome;
  servicoForm.descricao = servico.descricao || '';
  servicoForm.preco = servico.preco;
  servicoForm.duracao = servico.duracao;
  servicoForm.icone = servico.icone || 'handyman';
  showServicoForm.value = true;
};

const fecharFormServico = () => { showServicoForm.value = false; };

const salvarServico = async () => {
  if (!servicoForm.nome.trim()) { $q.notify({ type: 'warning', message: 'Nome do serviço é obrigatório', position: 'top' }); return; }
  if (servicoForm.preco <= 0) { $q.notify({ type: 'warning', message: 'Preço deve ser maior que zero', position: 'top' }); return; }
  if (servicoForm.duracao <= 0) { $q.notify({ type: 'warning', message: 'Duração deve ser maior que zero', position: 'top' }); return; }

  salvandoServico.value = true;
  try {
    let success = false;
    if (editandoServico.value && servicoEditandoId.value) { success = await perfilStore.atualizarServico(servicoEditandoId.value, servicoForm); }
    else { success = await perfilStore.adicionarServico(servicoForm); }
    if (success) {
      $q.notify({ type: 'positive', message: editandoServico.value ? 'Serviço atualizado!' : 'Serviço adicionado!', position: 'top' });
      showServicoForm.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao salvar serviço', position: 'top' });
    }
  } catch { $q.notify({ type: 'negative', message: 'Erro ao salvar serviço', position: 'top' }); }
  finally { salvandoServico.value = false; }
};

const handleRemoverServico = (servicoId: number) => {
  $q.dialog({
    title: 'Remover serviço',
    message: 'Tem certeza que deseja remover?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      $q.loading.show({ message: 'Removendo...' });
      const success = await perfilStore.removerServico(servicoId);
      $q.loading.hide();
      $q.notify({ type: success ? 'positive' : 'negative', message: success ? 'Serviço removido!' : 'Erro ao remover', position: 'top' });
    })();
  });
};

// ===================== DISPONIBILIDADE =====================

const editarDisponibilidade = () => {
  const horarios = perfilStore.disponibilidade?.horarios_padrao || {};
  diasDaSemana.forEach((dia) => {
    const hrs = horarios[dia.key];
    disponibilidadeAtiva.value[dia.key] = !!(hrs && hrs.length > 0);
    disponibilidadeHorariosSelecionados.value[dia.key] = hrs || [];
  });
  editDisponibilidade.value = true;
};

const cancelarEditarDisponibilidade = () => { editDisponibilidade.value = false; };

const salvarDisponibilidade = async () => {
  salvandoDisponibilidade.value = true;
  try {
    const horarios: Record<string, string[]> = {};
    diasDaSemana.forEach((dia) => {
      horarios[dia.key] = disponibilidadeAtiva.value[dia.key] ? disponibilidadeHorariosSelecionados.value[dia.key] || [] : [];
    });
    const success = await perfilStore.updateDisponibilidade({ horarios_padrao: horarios });
    if (success) {
      $q.notify({ type: 'positive', message: 'Disponibilidade atualizada!', position: 'top' });
      editDisponibilidade.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar disponibilidade', position: 'top' });
    }
  } catch { $q.notify({ type: 'negative', message: 'Erro ao atualizar disponibilidade', position: 'top' }); }
  finally { salvandoDisponibilidade.value = false; }
};

// ===================== DOCUMENTOS =====================

const uploadDocumento = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,.pdf';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { $q.notify({ type: 'negative', message: 'Documento deve ter no máximo 5MB', position: 'top' }); return; }
      $q.loading.show({ message: 'Enviando documento...' });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      $q.loading.hide();
      $q.notify({ type: 'positive', message: 'Documento enviado! Aguarde verificação.', position: 'top' });
    }
  };
  input.click();
};

// ===================== CARREGAR DADOS =====================

const carregarDados = async () => {
  try {
    await perfilStore.carregarTodosDados();
    carregarDadosNoForm();
  } catch { $q.notify({ type: 'negative', message: 'Erro ao carregar perfil', position: 'top' }); }
};

onMounted(() => { void carregarDados(); });
</script>

<style scoped lang="scss">
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.08);
$green: #10b981;
$gold: #f59e0b;
$ink: #0a0a0f;
$ink-2: #3d3d4e;
$muted: #9898a8;
$gray: #6b7280;
$dark: #0a0a0f;
$gray-light: #f3f4f6;
$line: rgba(0, 0, 0, 0.06);
$surface: #ffffff;
$bg: #f4f4f8;
$radius: 16px;
$radius-sm: 10px;
$radius-xs: 8px;

.prestador-perfil { background: $bg; min-height: 100vh; padding-bottom: 80px; }

.page-header {
  display: flex; align-items: center; justify-content: space-between; background: $surface; padding: 16px;
  border-bottom: 1px solid $line; position: sticky; top: 0; z-index: 10;
  .back-btn, .settings-btn, .logout-btn, .finance-btn { color: $muted; transition: all 0.2s; &:hover { color: $accent; background: $accent-light; } }
  .header-actions { display: flex; gap: 4px; }
  .page-title { font-size: 1.2rem; font-weight: 600; color: $ink; margin: 0; }
}

.skeleton-container { padding: 16px; .inline-block { display: inline-block; } .stats-grid-skeleton { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; } }

.profile-header { background: $surface; padding: 24px 16px; text-align: center; border-bottom: 1px solid $line;
  .profile-avatar { border: 3px solid $accent; }
  .profile-name { font-size: 1.5rem; font-weight: 700; color: $ink; margin-top: 12px; }
  .profile-profession { font-size: 0.9rem; color: $muted; margin-top: 4px; }
  .profile-rating { margin-top: 8px; .rating-count { font-size: 0.8rem; color: $muted; margin-left: 8px; } }
}

.avatar-container { position: relative; display: inline-block;
  .change-photo-btn { position: absolute; bottom: 4px; right: 4px; background: $surface; box-shadow: 0 2px 4px rgba(0,0,0,0.1); &:hover { background: $accent-light; } }
}

.stats-section { padding: 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card {
  background: $surface; border-radius: $radius; padding: 16px; text-align: center; border: 1px solid $line; transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  &__icon { width: 40px; height: 40px; border-radius: $radius-xs; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
  &__icon--primary { background: rgba($accent, 0.1); color: $accent; }
  &__icon--warning { background: rgba($gold, 0.1); color: $gold; }
  &__icon--gold { background: rgba($gold, 0.1); color: $gold; }
  &__value { font-size: 1.5rem; font-weight: 700; color: $ink; line-height: 1.2; }
  &__label { font-size: 0.7rem; color: $muted; margin-top: 4px; }
}

.finance-report-section { padding: 0 16px 16px; }
.finance-report-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px;
  background: linear-gradient(135deg, $accent, #4a3bd4); border: none; border-radius: 40px;
  font-size: 0.9rem; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba($accent, 0.3);
  svg { stroke: white; }
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba($accent, 0.4); }
  &:active { transform: translateY(0); }
}

.edit-profile-btn {
  width: calc(100% - 32px); margin: 0 16px 20px; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px; background: $surface; border: 1px solid $line; border-radius: 30px; font-size: 0.85rem;
  font-weight: 500; color: $gray; cursor: pointer; transition: all 0.2s;
  &:hover { background: $accent-light; border-color: $accent; color: $accent; }
}

.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }

.edit-form-section, .edit-servico-section, .edit-disponibilidade-section, .edit-categorias-section {
  background: $surface; margin: 0 16px 20px; border-radius: $radius; border: 1px solid $line; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.edit-form-header, .edit-servico-header, .edit-disponibilidade-header, .edit-categorias-header {
  display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid $line; background: $bg;
  h3, h4 { font-size: 1rem; font-weight: 600; color: $ink; margin: 0; }
}

.edit-form-body, .edit-servico-body, .edit-disponibilidade-body, .edit-categorias-body { padding: 16px; }

.form-group { margin-bottom: 16px; &:last-child { margin-bottom: 0; } }
.form-label { display: block; font-size: 0.8rem; font-weight: 500; color: $dark; margin-bottom: 6px; }
.form-row { display: flex; gap: 12px; margin-bottom: 12px; .col { flex: 1; } }
.char-counter { font-size: 0.7rem; color: $muted; text-align: right; margin-top: 4px; }

.edit-actions { display: flex; gap: 12px; margin-top: 20px;
  .cancel-btn { flex: 1; border-radius: 30px; background: $gray-light; color: $gray; }
  .save-btn { flex: 1; border-radius: 30px; }
}

.collapsible-section { background: $surface; margin-bottom: 8px; border-bottom: 1px solid $line;
  .section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; cursor: pointer; transition: background 0.2s;
    &:hover { background: $accent-light; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 600; color: $ink; margin: 0; padding: 0; border-left: none;
      .section-icon { color: $accent; } }
  }
  .section-content { padding: 0 16px 16px 16px; }
}

.info-list { background: $bg; border-radius: $radius; overflow: hidden; border: 1px solid $line; }
.info-item { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid $line; background: $surface;
  &:last-child { border-bottom: none; }
  &__icon { width: 40px; color: $accent; }
  &__content { flex: 1; color: $ink; font-size: 0.9rem; }
}

.categorias-grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
.categoria-card {
  display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: $radius; border: 1px solid $line;
  cursor: pointer; transition: all 0.2s; background: $surface;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: $accent; }
  &.selected { background: rgba($accent, 0.05); border-color: $accent; box-shadow: 0 2px 8px rgba($accent, 0.2); }
  &__icon { flex-shrink: 0; }
  &__info { flex: 1; min-width: 0; }
  &__name { font-weight: 600; color: $ink; font-size: 0.85rem; margin-bottom: 2px; }
  &__desc { font-size: 0.7rem; color: $muted; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__check { flex-shrink: 0; }
}
.categorias-grid-3col-view { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
.categoria-chip-view { display: flex; align-items: center; gap: 8px; background: rgba($accent, 0.1); color: $accent; padding: 10px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
.empty-message-full { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 8px; color: $muted; font-size: 0.85rem; padding: 30px; background: $bg; border-radius: $radius; text-align: center; }

.sobre-card { background: $bg; border-radius: $radius; padding: 16px; border: 1px solid $line; p { color: $ink-2; font-size: 0.9rem; line-height: 1.5; margin: 0; } }

.servicos-container { display: flex; flex-direction: column; gap: 12px; }
.servico-card {
  background: $surface; border-radius: $radius; border: 1px solid $line; padding: 16px; display: flex; align-items: center; gap: 16px; transition: all 0.2s;
  &:hover { transform: translateX(4px); border-color: $accent; }
  &__icon { width: 48px; height: 48px; background: rgba($accent, 0.1); border-radius: $radius-sm; display: flex; align-items: center; justify-content: center; color: $accent; }
  &__info { flex: 1; }
  &__name { font-weight: 600; color: $ink; margin-bottom: 4px; }
  &__desc { font-size: 0.75rem; color: $muted; }
  &__price { text-align: right; .price-value { font-weight: 700; color: $accent; } .price-duration { font-size: 0.7rem; color: $muted; } }
  &__actions { display: flex; gap: 4px; }
}

.portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.portfolio-item {
  position: relative; cursor: pointer; border-radius: $radius; overflow: hidden; transition: all 0.2s;
  &:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .portfolio-overlay {
    position: absolute; top: 0; right: 0; padding: 8px; opacity: 0; transition: opacity 0.3s;
    .portfolio-actions { display: flex; gap: 4px; background: rgba(0,0,0,0.7); padding: 6px; border-radius: 8px; }
  }
  &:hover .portfolio-overlay { opacity: 1; }
  .portfolio-info {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 12px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white; font-size: 0.75rem;
    .portfolio-titulo { font-weight: 600; }
    .portfolio-descricao { font-size: 0.65rem; opacity: 0.8; margin-top: 2px; }
  }
}
.portfolio-img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; }

.edit-portfolio-modal {
  min-width: 350px; max-width: 500px; width: 100%; border-radius: 20px !important; overflow: hidden;
  .edit-portfolio-header {
    display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;
    background: linear-gradient(135deg, $accent, #4a3bd4); color: white;
    .text-h6 { color: white; margin: 0; }
    .q-btn { color: rgba(255,255,255,0.8); &:hover { color: white; background: rgba(255,255,255,0.2); } }
  }
  .edit-portfolio-body { padding: 20px;
    .portfolio-preview { text-align: center; margin-bottom: 16px; }
  }
  .edit-portfolio-actions { padding: 8px 20px 20px; gap: 8px; }
}

.disponibilidade-grid-view { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; @media (max-width: 480px) { grid-template-columns: 1fr; } }
.disponibilidade-card { background: $surface; border-radius: $radius; padding: 16px; text-align: center; border: 1px solid $line;
  .disponibilidade-dia { font-weight: 600; color: $ink; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid $accent; display: inline-block; }
  .disponibilidade-horario { font-size: 0.8rem; color: $muted; display: flex; align-items: center; justify-content: center; gap: 4px; }
}
.disponibilidade-grid-editor { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; @media (max-width: 768px) { grid-template-columns: 1fr; } }
.disponibilidade-edit-item { border-bottom: 1px solid $line; padding-bottom: 16px;
  .dia-info { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; .dia-label { font-weight: 600; color: $ink; font-size: 0.9rem; } }
  .horarios-inputs { .horarios-select { width: 100%; } }
}

.docs-list { background: $surface; border-radius: $radius; border: 1px solid $line; overflow: hidden; }
.doc-item { display: flex; align-items: center; padding: 14px 16px; gap: 8px;
  &__icon { width: 40px; color: $accent; }
  &__label { flex: 1; color: $ink; font-size: 0.9rem; }
  &__status { font-size: 0.7rem; font-weight: 600; padding: 4px 10px; border-radius: 20px;
    &.verified { background: rgba($green, 0.15); color: darken($green, 15%); }
    &.pending { background: rgba($gold, 0.15); color: darken($gold, 20%); }
  }
}

.empty-state-small { text-align: center; padding: 30px 20px; background: $bg; border-radius: $radius;
  .q-icon { color: #d0d0dc; margin-bottom: 8px; }
  p { color: $muted; font-size: 0.8rem; margin: 0; }
}
</style>
