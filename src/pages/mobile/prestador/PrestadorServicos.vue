<template>
  <div class="prestador-servicos">
    <!-- ===== CABEÇALHO MODERNO ===== -->
    <header class="modern-header">
      <button class="header-btn" @click="() => void router.back()">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="header-center">
        <h1>Meus Serviços</h1>
        <p>Gerencie seus serviços e preços</p>
      </div>
      <button class="header-btn add-btn" @click="adicionarServico">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </header>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="servicosStore.isLoading" class="skeleton-container">
      <div class="skeleton-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card-modern">
          <div class="skeleton-icon"></div>
          <div class="skeleton-content">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-50"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-btn"></div>
            <div class="skeleton-toggle"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>
      <!-- ===== LISTA DE SERVIÇOS ===== -->
      <div class="servicos-container">
        <div v-if="servicosStore.servicos.length === 0" class="empty-state-modern">
          <div class="empty-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              stroke-width="1.2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>Nenhum serviço cadastrado</h3>
          <p>Clique no botão + para adicionar seu primeiro serviço</p>
        </div>

        <div v-else class="servicos-grid-modern">
          <div
            v-for="servico in servicosStore.servicos"
            :key="servico.id"
            class="servico-card-modern"
            :class="{ inactive: !servico.ativo }"
          >
            <!-- Badge de status -->
            <div class="status-chip" :class="servico.ativo ? 'active' : 'inactive'">
              <span class="status-dot"></span>
              {{ servico.ativo ? 'Ativo' : 'Inativo' }}
            </div>

            <!-- Conteúdo do card -->
            <div class="card-content">
              <div
                class="icon-wrapper"
                :style="{
                  background: servico.ativo ? getGradientForIcon(servico.icone) : '#E5E7EB',
                }"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>

              <div class="servico-info">
                <h3 class="servico-nome">{{ servico.nome }}</h3>
                <div class="servico-preco">
                  <span class="preco-label">Preço</span>
                  <span class="preco-valor">{{ formatarValor(servico.preco) }} MZN</span>
                </div>
                <div class="servico-duracao">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{{ servico.duracao }} minutos</span>
                </div>
              </div>
            </div>

            <!-- Descrição -->
            <div class="servico-descricao" v-if="servico.descricao">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>{{ servico.descricao }}</p>
            </div>

            <!-- Ações -->
            <div class="card-actions">
              <button class="action-btn edit" @click="editarServico(servico)">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                </svg>
                Editar
              </button>
              <label class="toggle-switch-modern">
                <input
                  type="checkbox"
                  :checked="servico.ativo"
                  @change="() => toggleServico(servico)"
                />
                <span class="toggle-slider-modern"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO DE CATEGORIAS ===== -->
      <div class="categorias-section-modern">
        <div class="section-header-modern">
          <div class="section-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
            Categorias que atendo
          </div>
          <button class="edit-cat-btn" @click="editarCategorias">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
            </svg>
            Editar
          </button>
        </div>

        <div v-if="carregandoCategorias" class="skeleton-categories">
          <div class="skeleton-chip" v-for="i in 5" :key="i"></div>
        </div>

        <div v-else class="categorias-scroll">
          <div
            v-for="cat in servicosStore.minhasCategorias"
            :key="cat.id"
            class="categoria-chip"
            :style="{ background: cat.cor || '#667eea' + '15', color: cat.cor || '#667eea' }"
          >
            <span class="chip-icon">{{ cat.icone || '🏷️' }}</span>
            <span>{{ cat.nome }}</span>
            <button class="chip-remove" @click="removerCategoria(cat)">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <button class="add-chip" @click="adicionarCategoria">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    </template>

    <!-- ===== MODAL DE SERVIÇO ===== -->
    <div class="modal-overlay" v-if="showServicoDialog" @click="showServicoDialog = false">
      <div class="modal-content-modern" @click.stop>
        <div class="modal-header-modern">
          <div class="modal-icon" :style="{ background: getGradientForIcon('handyman') }">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h3>{{ editandoServico ? 'Editar' : 'Novo' }} Serviço</h3>
            <p>Preencha os dados do serviço</p>
          </div>
          <button class="modal-close" @click="showServicoDialog = false">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body-modern">
          <div class="input-group-modern">
            <label class="input-label-modern">Nome do serviço</label>
            <input
              type="text"
              v-model="servicoForm.nome"
              placeholder="Ex: Limpeza Residencial"
              class="modern-input"
            />
          </div>

          <div class="input-group-modern">
            <label class="input-label-modern">Categoria</label>
            <select v-model="servicoForm.categoria_id" class="modern-select">
              <option :value="null">Selecione uma categoria</option>
              <option
                v-for="cat in servicosStore.todasCategoriasDisponiveis"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.nome }}
              </option>
            </select>
          </div>

          <div class="row-modern">
            <div class="col-modern">
              <div class="input-group-modern">
                <label class="input-label-modern">Preço (MZN)</label>
                <div class="price-input">
                  <span class="price-prefix">MZN</span>
                  <input type="number" v-model.number="servicoForm.preco" placeholder="0" />
                </div>
              </div>
            </div>
            <div class="col-modern">
              <div class="input-group-modern">
                <label class="input-label-modern">Duração (min)</label>
                <div class="duration-input">
                  <input type="number" v-model.number="servicoForm.duracao" placeholder="60" />
                  <span class="duration-suffix">min</span>
                </div>
              </div>
            </div>
          </div>

          <div class="input-group-modern">
            <label class="input-label-modern">Descrição</label>
            <textarea
              v-model="servicoForm.descricao"
              rows="3"
              placeholder="Descreva o serviço..."
              class="modern-textarea"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer-modern">
          <button class="cancel-btn" @click="showServicoDialog = false">Cancelar</button>
          <button
            class="save-btn"
            @click="salvarServico"
            :disabled="
              !servicoForm.nome ||
              !servicoForm.preco ||
              !servicoForm.duracao ||
              !servicoForm.categoria_id
            "
          >
            <div v-if="servicosStore.isSaving" class="spinner-small"></div>
            <span v-else>{{ editandoServico ? 'Atualizar' : 'Adicionar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL DE CATEGORIA ===== -->
    <div class="modal-overlay" v-if="showCategoriaDialog" @click="showCategoriaDialog = false">
      <div class="modal-content-modern small" @click.stop>
        <div class="modal-header-modern">
          <div class="modal-icon small">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
            >
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </div>
          <div>
            <h3>Adicionar Categoria</h3>
            <p>Selecione uma categoria para atender</p>
          </div>
          <button class="modal-close" @click="showCategoriaDialog = false">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body-modern">
          <div class="input-group-modern">
            <label class="input-label-modern">Categoria</label>
            <select v-model="categoriaSelecionada" class="modern-select">
              <option :value="null">Selecione uma categoria</option>
              <option
                v-for="cat in servicosStore.categoriasParaAdicionar"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer-modern">
          <button class="cancel-btn" @click="showCategoriaDialog = false">Cancelar</button>
          <button
            class="save-btn"
            @click="adicionarCategoriaConfirmar"
            :disabled="!categoriaSelecionada"
          >
            <div v-if="adicionandoCategoria" class="spinner-small"></div>
            <span v-else>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  usePrestadorServicosStore,
  type ServicoData,
  type CategoriaPrestadorData,
  getGradientForIcon,
} from 'src/stores/prestador/prestador-servicos-store';

defineOptions({ name: 'PrestadorServicos' });

const router = useRouter();
const $q = useQuasar();

// ✅ APENAS UM STORE!
const servicosStore = usePrestadorServicosStore();

// Estados locais
const showServicoDialog = ref(false);
const showCategoriaDialog = ref(false);
const editandoServico = ref(false);
const servicoEditandoId = ref<number | null>(null);
const categoriaSelecionada = ref<number | null>(null);
const carregandoCategorias = ref(false);
const adicionandoCategoria = ref(false);

// Formulário de serviço
const servicoForm = ref({
  nome: '',
  categoria_id: null as number | null,
  preco: null as number | null,
  duracao: null as number | null,
  descricao: '',
  icone: 'handyman',
});

const formatarValor = (valor: number): string => {
  return valor.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ===================== CATEGORIAS =====================

const editarCategorias = (): void => {
  $q.notify({
    type: 'info',
    message: 'Clique no + para adicionar novas categorias',
    position: 'top',
  });
};

const adicionarCategoria = (): void => {
  categoriaSelecionada.value = null;
  showCategoriaDialog.value = true;
};

const adicionarCategoriaConfirmar = async (): Promise<void> => {
  if (!categoriaSelecionada.value) return;

  adicionandoCategoria.value = true;
  try {
    const success = await servicosStore.addCategoria(categoriaSelecionada.value);
    if (success) {
      // ✅ CORRIGIDO: categoriasParaAdicionar já é um computed, use diretamente
      const cat = servicosStore.categoriasParaAdicionar.find(
        (c: CategoriaPrestadorData) => c.id === categoriaSelecionada.value,
      );
      if (cat)
        $q.notify({
          type: 'positive',
          message: `Categoria ${cat.nome} adicionada`,
          position: 'top',
        });
      showCategoriaDialog.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao adicionar categoria', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao adicionar categoria', position: 'top' });
  } finally {
    adicionandoCategoria.value = false;
  }
};

const removerCategoria = (categoria: CategoriaPrestadorData): void => {
  $q.dialog({
    title: 'Confirmar',
    message: `Remover categoria ${categoria.nome}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
  }).onOk(() => {
    servicosStore
      .removeCategoria(categoria.id)
      .then(() => $q.notify({ type: 'positive', message: 'Categoria removida', position: 'top' }))
      .catch(() =>
        $q.notify({ type: 'negative', message: 'Erro ao remover categoria', position: 'top' }),
      );
  });
};

// ===================== SERVIÇOS =====================

const adicionarServico = (): void => {
  editandoServico.value = false;
  servicoEditandoId.value = null;
  servicoForm.value = {
    nome: '',
    categoria_id: null,
    preco: null,
    duracao: null,
    descricao: '',
    icone: 'handyman',
  };
  showServicoDialog.value = true;
};

const editarServico = (servico: ServicoData): void => {
  editandoServico.value = true;
  servicoEditandoId.value = servico.id;
  servicoForm.value = {
    nome: servico.nome,
    categoria_id: servico.categoria_id,
    preco: servico.preco,
    duracao: servico.duracao,
    descricao: servico.descricao || '',
    icone: servico.icone || 'handyman',
  };
  showServicoDialog.value = true;
};

const salvarServico = async (): Promise<void> => {
  if (
    !servicoForm.value.categoria_id ||
    !servicoForm.value.preco ||
    !servicoForm.value.duracao ||
    !servicoForm.value.nome
  ) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos', position: 'top' });
    return;
  }

  const dados = {
    nome: servicoForm.value.nome,
    categoria_id: servicoForm.value.categoria_id,
    preco: servicoForm.value.preco,
    duracao: servicoForm.value.duracao,
    descricao: servicoForm.value.descricao,
    icone: servicoForm.value.icone,
  };

  try {
    let success = false;
    if (editandoServico.value && servicoEditandoId.value) {
      const result = await servicosStore.updateServico(servicoEditandoId.value, dados);
      success = !!result;
    } else {
      const result = await servicosStore.createServico(dados);
      success = !!result;
    }

    if (success) {
      $q.notify({
        type: 'positive',
        message: editandoServico.value ? 'Serviço atualizado' : 'Serviço adicionado',
        position: 'top',
      });
      showServicoDialog.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao salvar serviço', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar serviço', position: 'top' });
  }
};

const toggleServico = async (servico: ServicoData): Promise<void> => {
  try {
    const success = await servicosStore.toggleServico(servico.id);
    if (success) {
      servico.ativo = !servico.ativo;
      $q.notify({
        type: 'positive',
        message: `Serviço ${servico.ativo ? 'ativado' : 'desativado'}`,
        position: 'top',
      });
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao alterar status', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao alterar status', position: 'top' });
  }
};

// ===================== CARREGAMENTO INICIAL =====================

const carregarDadosIniciais = async (): Promise<void> => {
  carregandoCategorias.value = true;
  try {
    await servicosStore.carregarTodosDados();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    carregandoCategorias.value = false;
  }
};

onMounted(() => {
  void carregarDadosIniciais();
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10b981;
$success-light: rgba(16, 185, 129, 0.1);
$warning: #f59e0b;
$danger: #ef4444;
$dark: #1a1a2e;
$gray: #6b7280;
$gray-light: #f9fafb;
$border: #e5e7eb;
$white: #ffffff;
$bg: #f3f4f6;
$radius: 20px;
$radius-sm: 14px;
$radius-xs: 10px;

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.prestador-servicos {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 40px;
}

.modern-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: $white;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;

    &:hover {
      background: $accent-light;
      color: $accent;
    }

    &.add-btn:hover {
      background: $accent;
      color: $white;
    }
  }

  .header-center {
    text-align: center;

    h1 {
      font-size: 1.2rem;
      font-weight: 700;
      color: $dark;
      margin: 0;
    }

    p {
      font-size: 0.7rem;
      color: $gray;
      margin: 2px 0 0;
    }
  }
}

.skeleton-container {
  padding: 16px;

  .skeleton-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skeleton-card-modern {
    background: $white;
    border-radius: $radius;
    padding: 20px;
    display: flex;
    gap: 16px;
    position: relative;
    overflow: hidden;

    .skeleton-icon {
      width: 56px;
      height: 56px;
      border-radius: $radius-sm;
      background: $gray-light;
    }

    .skeleton-content {
      flex: 1;
    }
    .skeleton-line {
      height: 14px;
      background: $gray-light;
      border-radius: 7px;
      margin: 8px 0;
    }

    .skeleton-actions {
      display: flex;
      gap: 12px;
      align-items: center;

      .skeleton-btn {
        width: 60px;
        height: 32px;
        background: $gray-light;
        border-radius: 8px;
      }
      .skeleton-toggle {
        width: 44px;
        height: 24px;
        background: $gray-light;
        border-radius: 12px;
      }
    }
  }
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

.servicos-container {
  padding: 16px;
}

.empty-state-modern {
  text-align: center;
  padding: 60px 24px;

  .empty-icon {
    margin-bottom: 24px;
    opacity: 0.5;
  }
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }
  p {
    font-size: 0.85rem;
    color: $gray;
  }
}

.servicos-grid-modern {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.servico-card-modern {
  background: $white;
  border-radius: $radius;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid $border;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &.inactive {
    opacity: 0.7;
    background: $gray-light;
  }

  .status-chip {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 500;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.active {
      background: $success-light;
      color: $success;
      .status-dot {
        background: $success;
      }
    }

    &.inactive {
      background: rgba($gray, 0.1);
      color: $gray;
      .status-dot {
        background: $gray;
      }
    }
  }

  .card-content {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: $radius-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .servico-info {
      flex: 1;
    }

    .servico-nome {
      font-size: 1rem;
      font-weight: 700;
      color: $dark;
      margin: 0 0 8px;
    }

    .servico-preco {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;

      .preco-label {
        font-size: 0.7rem;
        color: $gray;
      }

      .preco-valor {
        font-size: 1.1rem;
        font-weight: 700;
        color: $accent;
      }
    }

    .servico-duracao {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      color: $gray;
    }
  }

  .servico-descricao {
    display: flex;
    gap: 8px;
    padding: 12px 0;
    border-top: 1px solid $border;
    margin-bottom: 12px;

    svg {
      color: $gray;
      flex-shrink: 0;
    }
    p {
      font-size: 0.75rem;
      color: $gray;
      margin: 0;
      line-height: 1.4;
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid $border;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: transparent;
      border: none;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      color: $gray;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: $accent-light;
        color: $accent;
      }
    }
  }
}

.toggle-switch-modern {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider-modern {
      background-color: $success;

      &:before {
        transform: translateX(24px);
      }
    }
  }

  .toggle-slider-modern {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $border;
    transition: 0.3s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
}

.categorias-section-modern {
  background: $white;
  margin: 16px;
  border-radius: $radius;
  padding: 20px;
  border: 1px solid $border;
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: $dark;
  }

  .edit-cat-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: $gray-light;
    border: none;
    border-radius: 20px;
    font-size: 0.7rem;
    color: $gray;
    cursor: pointer;

    &:hover {
      background: $accent-light;
      color: $accent;
    }
  }
}

.categorias-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.categoria-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(91, 75, 245, 0.1);
  color: $accent;

  .chip-icon {
    font-size: 1rem;
  }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
    color: currentColor;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}

.add-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  background: $gray-light;
  border: 1px dashed $border;
  color: $gray;
  cursor: pointer;

  &:hover {
    background: $accent-light;
    border-color: $accent;
    color: $accent;
  }
}

.skeleton-chip {
  width: 80px;
  height: 36px;
  background: $gray-light;
  border-radius: 30px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content-modern {
  background: $white;
  border-radius: $radius;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &.small {
    max-width: 400px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header-modern {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, $accent, darken($accent, 10%));
  position: relative;

  .modal-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;

    &.small {
      width: 40px;
      height: 40px;
    }
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $white;
    margin: 0;
  }

  p {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 2px 0 0;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    color: $white;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.modal-body-modern {
  padding: 20px;
}

.input-group-modern {
  margin-bottom: 16px;

  .input-label-modern {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }
}

.modern-input,
.modern-select,
.modern-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid $border;
  border-radius: $radius-xs;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: $accent;
  }
}

.row-modern {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .col-modern {
    flex: 1;
  }
}

.price-input,
.duration-input {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  border-radius: $radius-xs;
  overflow: hidden;

  .price-prefix {
    padding: 10px 12px;
    background: $gray-light;
    color: $gray;
    border-right: 1px solid $border;
  }

  input {
    flex: 1;
    padding: 10px;
    border: none;
    outline: none;
    font-size: 0.85rem;
  }

  .duration-suffix {
    padding: 10px 12px;
    background: $gray-light;
    color: $gray;
    border-left: 1px solid $border;
  }
}

.modern-textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer-modern {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid $border;

  .cancel-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-weight: 500;
    color: $gray;
    cursor: pointer;

    &:hover {
      background: $gray-light;
    }
  }

  .save-btn {
    flex: 1;
    padding: 10px;
    background: $accent;
    border: none;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-weight: 600;
    color: $white;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.6s linear infinite;
}
</style>
