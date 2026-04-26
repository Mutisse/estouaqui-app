<template>
  <q-page class="prestador-servicos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meus Serviços</div>
      <q-btn flat round icon="add" @click="adicionarServico" />
    </div>

    <!-- Skeleton Loading (igual Facebook/Instagram) -->
    <div v-if="loading" class="skeleton-container q-pa-md">
      <div class="row q-col-gutter-md">
        <div v-for="i in 4" :key="i" class="col-12 col-sm-6">
          <div class="skeleton-card">
            <!-- Avatar skeleton -->
            <div class="row items-start q-gutter-sm">
              <div class="skeleton-avatar"></div>
              <div class="col">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text-short"></div>
              </div>
            </div>
            <!-- Animation shimmer -->
            <div class="skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Lista de serviços em GRADE 2 COLUNAS -->
      <div class="servicos-grid q-pa-md">
        <div v-if="servicos.length === 0" class="empty-state">
          <q-icon name="handyman" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum serviço cadastrado</div>
          <div class="text-grey-6 q-mt-sm">Clique no botão + para adicionar um serviço</div>
        </div>

        <!-- GRID 2 COLUNAS RESPONSIVO -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="servico in servicos"
            :key="servico.id"
            class="col-12 col-sm-6"
          >
            <q-card class="servico-card" :class="{ 'inativo': !servico.ativo }">
              <!-- Status indicator -->
              <div class="status-badge" :class="servico.ativo ? 'active' : 'inactive'">
                {{ servico.ativo ? 'Ativo' : 'Inativo' }}
              </div>

              <q-card-section class="q-pt-md">
                <div class="row items-start no-wrap">
                  <q-avatar
                    :color="servico.ativo ? 'primary' : 'grey-4'"
                    text-color="white"
                    size="56px"
                    class="servico-avatar"
                  >
                    <q-icon :name="servico.icone || 'handyman'" size="32px" />
                  </q-avatar>

                  <div class="col q-ml-sm">
                    <div class="servico-nome text-bold">{{ servico.nome }}</div>
                    <div class="servico-preco">
                      {{ formatarValor(servico.preco) }} MZN
                    </div>
                    <div class="servico-duracao">
                      <q-icon name="schedule" size="14px" class="q-mr-xs" />
                      {{ servico.duracao }} min
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="servico-descricao">
                  {{ servico.descricao || 'Sem descrição' }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right" class="q-pa-sm">
                <q-btn
                  flat
                  dense
                  icon="edit"
                  label="Editar"
                  color="primary"
                  @click="editarServico(servico)"
                />
                <q-toggle
                  :model-value="servico.ativo"
                  color="positive"
                  @update:model-value="toggleServico(servico)"
                  :loading="loadingAcao === servico.id"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Categorias de serviço -->
      <div class="categorias-section q-pa-md">
        <div class="section-header">
          <div class="section-title">Categorias que atendo</div>
          <q-btn flat dense label="Editar" icon="edit" @click="editarCategorias" />
        </div>

        <!-- Skeleton para categorias -->
        <div v-if="loadingCategorias" class="skeleton-categories">
          <div class="row q-col-gutter-sm">
            <div v-for="i in 5" :key="i" class="col-auto">
              <div class="skeleton-chip"></div>
            </div>
          </div>
        </div>

        <div v-else class="categorias-chips q-mt-sm">
          <q-chip
            v-for="cat in minhasCategorias"
            :key="cat.id"
            :removable="true"
            @remove="removerCategoria(cat)"
            color="primary"
            text-color="white"
            class="q-mr-xs q-mb-xs"
          >
            <q-icon :name="cat.icone || 'category'" size="16px" class="q-mr-xs" />
            {{ cat.nome }}
          </q-chip>

          <q-chip
            clickable
            icon="add"
            label="Adicionar"
            color="grey-3"
            text-color="grey-8"
            @click="adicionarCategoria"
          />
        </div>
      </div>
    </template>

    <!-- Dialog para adicionar/editar serviço -->
    <q-dialog v-model="showServicoDialog" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 90%">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editandoServico ? 'Editar' : 'Novo' }} Serviço</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="servicoForm.nome"
            label="Nome do serviço"
            outlined
            dense
            :rules="[(val) => !!val || 'Nome é obrigatório']"
          />

          <q-select
            v-model="servicoForm.categoria_id"
            :options="categoriasDisponiveis"
            label="Categoria"
            outlined
            dense
            option-label="nome"
            option-value="id"
            map-options
            emit-value
            :rules="[(val) => !!val || 'Categoria é obrigatória']"
          />

          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input
                v-model.number="servicoForm.preco"
                label="Preço (MZN)"
                type="number"
                outlined
                dense
                :rules="[(val) => val > 0 || 'Preço inválido']"
              />
            </div>
            <div class="col">
              <q-input
                v-model.number="servicoForm.duracao"
                label="Duração (min)"
                type="number"
                outlined
                dense
                :rules="[(val) => val > 0 || 'Duração inválida']"
              />
            </div>
          </div>

          <q-input
            v-model="servicoForm.descricao"
            label="Descrição"
            type="textarea"
            outlined
            dense
            autogrow
          />

          <q-select
            v-model="servicoForm.icone"
            :options="iconeOptions"
            label="Ícone"
            outlined
            dense
            options-dense
            use-input
            fill-input
            @filter="filterIcones"
          >
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section avatar>
                  <q-icon :name="opt" />
                </q-item-section>
                <q-item-section>{{ opt }}</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              <div v-if="servicoForm.icone" class="row items-center">
                <q-icon :name="servicoForm.icone" class="q-mr-sm" />
                {{ servicoForm.icone }}
              </div>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup @click="fecharDialog" />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarServico"
            :loading="loadingSalvar"
            :disable="
              !servicoForm.nome ||
              !servicoForm.preco ||
              !servicoForm.duracao ||
              !servicoForm.categoria_id
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para adicionar categorias -->
    <q-dialog v-model="showCategoriaDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Adicionar Categoria</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="categoriaSelecionada"
            :options="categoriasParaAdicionar"
            option-label="nome"
            option-value="id"
            label="Selecione uma categoria"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Adicionar"
            color="primary"
            @click="adicionarCategoriaConfirmar"
            :loading="loadingAdicionarCategoria"
            :disable="!categoriaSelecionada"
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
import { usePrestadorStore } from 'src/stores/prestador-store';
import type { ServicoData, CategoriaPrestadorData } from 'src/stores/prestador-store';
import { api } from 'src/boot/axios';

defineOptions({
  name: 'PrestadorServicos',
});

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const showServicoDialog = ref(false);
const showCategoriaDialog = ref(false);
const editandoServico = ref(false);
const servicoEditandoId = ref<number | null>(null);
const categoriaSelecionada = ref<number | null>(null);
const loadingSalvar = ref(false);
const loadingAcao = ref<number | null>(null);
const loadingCategorias = ref(false);
const loadingAdicionarCategoria = ref(false);
const iconeFiltro = ref('');

// Dados do store
const servicos = computed(() => prestadorStore.servicos);
const minhasCategorias = computed(() => prestadorStore.minhasCategorias);
const loading = computed(() => prestadorStore.loading);

// Lista de todas as categorias disponíveis (vem da API)
const todasCategorias = ref<CategoriaPrestadorData[]>([]);
const loadingTodasCategorias = ref(false);

// Ícones disponíveis
const todosIcones = ref([
  'bolt', 'water_drop', 'brush', 'cleaning_services', 'computer', 'content_cut',
  'electrical_services', 'settings', 'build', 'handyman', 'yard', 'car_repair',
  'school', 'photo_camera', 'construction', 'home', 'paint', 'plumbing',
  'electrical', 'kitchen', 'local_laundry_service', 'ac_unit', 'sports_mma',
  'pets', 'spa', 'restaurant', 'event', 'mic', 'music_note', 'videocam',
  'security', 'move_to_inbox', 'shopping_cart', 'delivery_dining'
]);

const iconeOptions = computed(() => {
  if (!iconeFiltro.value) return todosIcones.value;
  return todosIcones.value.filter(icon =>
    icon.toLowerCase().includes(iconeFiltro.value.toLowerCase())
  );
});

const filterIcones = (val: string, update: (fn: () => void) => void) => {
  iconeFiltro.value = val;
  update(() => {});
};

// Categorias disponíveis para adicionar (excluindo as que já tenho)
const categoriasParaAdicionar = computed(() => {
  const minhasIds = new Set(minhasCategorias.value.map(c => c.id));
  return todasCategorias.value.filter(c => !minhasIds.has(c.id));
});

// Categorias disponíveis para o select do serviço
const categoriasDisponiveis = computed(() => {
  return todasCategorias.value;
});

// Formulário de serviço
const servicoForm = ref({
  nome: '',
  categoria_id: null as number | null,
  preco: null as number | null,
  duracao: null as number | null,
  descricao: '',
  icone: 'handyman',
});

// Formatação
const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Carregar categorias da API
const carregarTodasCategorias = async () => {
  loadingTodasCategorias.value = true;
  try {
    const response = await api.get('/prestadores/categorias');
    if (response.data.success && Array.isArray(response.data.data)) {
      todasCategorias.value = response.data.data;
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  } finally {
    loadingTodasCategorias.value = false;
  }
};

// Ações de serviço
const adicionarServico = () => {
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

const editarServico = (servico: ServicoData) => {
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

const salvarServico = () => {
  if (!servicoForm.value.categoria_id || !servicoForm.value.preco || !servicoForm.value.duracao) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos', position: 'top' });
    return;
  }

  loadingSalvar.value = true;

  const dados = {
    nome: servicoForm.value.nome,
    categoria_id: servicoForm.value.categoria_id,
    preco: servicoForm.value.preco,
    duracao: servicoForm.value.duracao,
    descricao: servicoForm.value.descricao,
    icone: servicoForm.value.icone,
  };

  if (editandoServico.value && servicoEditandoId.value) {
    prestadorStore.updateServico(servicoEditandoId.value, dados)
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Serviço atualizado', position: 'top' });
          showServicoDialog.value = false;
        }
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar serviço', position: 'top' });
      })
      .finally(() => {
        loadingSalvar.value = false;
      });
  } else {
    prestadorStore.createServico(dados)
      .then((result) => {
        if (result) {
          $q.notify({ type: 'positive', message: 'Serviço adicionado', position: 'top' });
          showServicoDialog.value = false;
        }
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: 'Erro ao adicionar serviço', position: 'top' });
      })
      .finally(() => {
        loadingSalvar.value = false;
      });
  }
};

const toggleServico = (servico: ServicoData) => {
  loadingAcao.value = servico.id;
  const novoStatus = !servico.ativo;

  prestadorStore.toggleServico(servico.id)
    .then((success) => {
      if (success) {
        servico.ativo = novoStatus;
        $q.notify({
          type: novoStatus ? 'positive' : 'warning',
          message: `Serviço ${novoStatus ? 'ativado' : 'desativado'}`,
          position: 'top',
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Erro ao alterar status',
          position: 'top',
        });
      }
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: 'Erro ao alterar status',
        position: 'top',
      });
    })
    .finally(() => {
      loadingAcao.value = null;
    });
};

const fecharDialog = () => {
  showServicoDialog.value = false;
  servicoForm.value = {
    nome: '',
    categoria_id: null,
    preco: null,
    duracao: null,
    descricao: '',
    icone: 'handyman',
  };
};

// Ações de categorias
const editarCategorias = () => {
  $q.notify({
    type: 'info',
    message: 'Clique no + para adicionar novas categorias',
    position: 'top',
  });
};

const adicionarCategoria = () => {
  categoriaSelecionada.value = null;
  showCategoriaDialog.value = true;
};

const adicionarCategoriaConfirmar = () => {
  if (!categoriaSelecionada.value) return;

  loadingAdicionarCategoria.value = true;

  prestadorStore.addCategoria(categoriaSelecionada.value)
    .then((success) => {
      if (success) {
        const cat = categoriasParaAdicionar.value.find(c => c.id === categoriaSelecionada.value);
        if (cat) {
          $q.notify({
            type: 'positive',
            message: `Categoria ${cat.nome} adicionada`,
            position: 'top',
          });
        }
        showCategoriaDialog.value = false;
      }
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: 'Erro ao adicionar categoria',
        position: 'top',
      });
    })
    .finally(() => {
      loadingAdicionarCategoria.value = false;
    });
};

const removerCategoria = (categoria: CategoriaPrestadorData) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Remover categoria ${categoria.nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    prestadorStore.removeCategoria(categoria.id)
      .then((success) => {
        if (success) {
          $q.notify({
            type: 'positive',
            message: 'Categoria removida',
            position: 'top',
          });
        }
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover categoria',
          position: 'top',
        });
      });
  });
};

// Carregar dados
const carregarDados = async () => {
  loadingCategorias.value = true;
  await Promise.all([
    prestadorStore.fetchServicos(),
    prestadorStore.fetchMinhasCategorias(),
    carregarTodasCategorias(),
  ]);
  loadingCategorias.value = false;
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

.prestador-servicos {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
  position: sticky;
  top: 0;
  z-index: 10;
}

// Skeleton Loading (estilo Facebook/Instagram)
.skeleton-container {
  .skeleton-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $gray-200;
    flex-shrink: 0;
  }

  .skeleton-title {
    width: 70%;
    height: 16px;
    background: $gray-200;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  .skeleton-text {
    width: 90%;
    height: 12px;
    background: $gray-200;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-text-short {
    width: 50%;
    height: 12px;
    background: $gray-200;
    border-radius: 4px;
  }

  .skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
}

.skeleton-chip {
  width: 80px;
  height: 32px;
  background: $gray-200;
  border-radius: 16px;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// Grid de serviços
.servicos-grid {
  padding-bottom: 80px;
}

.servico-card {
  border-radius: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  &.inativo {
    opacity: 0.7;
    background: $gray-100;
  }

  .status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 20px;
    font-weight: 500;

    &.active {
      background: #4caf50;
      color: white;
    }

    &.inactive {
      background: $gray-500;
      color: white;
    }
  }

  .servico-avatar {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .servico-nome {
    font-size: 1rem;
    line-height: 1.3;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .servico-preco {
    font-size: 1.1rem;
    font-weight: 700;
    color: $purple-primary;
    margin: 4px 0;
  }

  .servico-duracao {
    font-size: 0.75rem;
    color: $gray-600;
    display: flex;
    align-items: center;
  }

  .servico-descricao {
    font-size: 0.8rem;
    color: $gray-600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 8px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }
}

.categorias-chips {
  display: flex;
  flex-wrap: wrap;
}

// Responsivo
@media (max-width: 600px) {
  .servico-card {
    .servico-nome {
      font-size: 0.9rem;
    }

    .servico-preco {
      font-size: 0.95rem;
    }
  }
}
</style>
