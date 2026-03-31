<template>
  <q-page class="prestador-servicos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meus Serviços</div>
      <q-btn flat round icon="add" @click="adicionarServico" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">Carregando serviços...</div>
    </div>

    <template v-else>
      <!-- Lista de serviços -->
      <div class="servicos-list q-pa-md">
        <div v-if="servicos.length === 0" class="empty-state">
          <q-icon name="handyman" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Nenhum serviço cadastrado</div>
          <div class="text-grey-6 q-mt-sm">Clique no botão + para adicionar um serviço</div>
        </div>

        <q-list v-else bordered separator>
          <q-item v-for="servico in servicos" :key="servico.id" class="servico-item">
            <q-item-section avatar>
              <q-avatar :color="servico.ativo ? 'positive' : 'grey-4'" text-color="white" size="40px">
                <q-icon :name="servico.icone || 'handyman'" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="servico-nome">{{ servico.nome }}</q-item-label>
              <q-item-label caption>
                <span class="servico-preco">{{ formatarValor(servico.preco) }} MZN</span> • {{ servico.duracao }} min
              </q-item-label>
              <q-item-label caption lines="2" class="servico-descricao">
                {{ servico.descricao || 'Sem descrição' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="editarServico(servico)"
                />
                <q-toggle
                  :model-value="servico.ativo"
                  color="positive"
                  @update:model-value="toggleServico(servico)"
                  :loading="loadingAcao === servico.id"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Categorias de serviço -->
      <div class="categorias-section q-pa-md">
        <div class="section-header">
          <div class="section-title">Categorias que atendo</div>
          <q-btn flat dense label="Editar" icon="edit" @click="editarCategorias" />
        </div>

        <div v-if="loadingCategorias" class="text-center q-mt-md">
          <q-spinner size="24px" />
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
      <q-card style="min-width: 350px">
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

          <div class="row q-gutter-sm">
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

// Dados do store
const servicos = computed(() => prestadorStore.servicos);
const minhasCategorias = computed(() => prestadorStore.minhasCategorias);
const loading = computed(() => prestadorStore.loading);

// Lista de todas as categorias disponíveis (vem da API)
const todasCategorias = ref<CategoriaPrestadorData[]>([]);
const loadingTodasCategorias = ref(false);

// Categorias disponíveis para adicionar (excluindo as que já tenho)
const categoriasParaAdicionar = computed(() => {
  const minhasIds = new Set(minhasCategorias.value.map(c => c.id));
  return todasCategorias.value.filter(c => !minhasIds.has(c.id));
});

// Categorias disponíveis para o select do serviço
const categoriasDisponiveis = computed(() => {
  return todasCategorias.value;
});

const iconeOptions = [
  'bolt',
  'water_drop',
  'brush',
  'cleaning_services',
  'computer',
  'content_cut',
  'electrical_services',
  'settings',
  'build',
  'handyman',
  'yard',
  'car_repair',
  'school',
  'photo_camera',
  'construction',
  'home',
  'paint',
  'plumbing',
  'electrical',
];

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

  prestadorStore.toggleServico(servico.id)
    .then((success) => {
      if (success) {
        $q.notify({
          type: servico.ativo ? 'positive' : 'warning',
          message: `Serviço ${servico.ativo ? 'ativado' : 'desativado'}`,
          position: 'top',
        });
      }
    })
    .catch(() => {
      // Reverter o toggle se falhar
      servico.ativo = !servico.ativo;
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
  await Promise.all([
    prestadorStore.fetchServicos(),
    prestadorStore.fetchMinhasCategorias(),
    carregarTodasCategorias(),
  ]);
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
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  text-align: center;
}

.servico-item {
  .servico-nome {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .servico-preco {
    font-weight: 600;
    color: $purple-primary;
  }

  .servico-descricao {
    font-size: 0.8rem;
    color: $gray-600;
    margin-top: 4px;
  }
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
</style>
