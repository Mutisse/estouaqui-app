<template>
  <q-page class="prestador-servicos bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Meus Serviços</div>
      <q-btn flat round icon="add" @click="adicionarServico" />
    </div>

    <!-- Lista de serviços -->
    <div class="servicos-list q-pa-md">
      <q-list bordered separator>
        <q-item v-for="servico in servicos" :key="servico.id" class="servico-item">
          <q-item-section avatar>
            <q-avatar :color="servico.ativo ? 'positive' : 'grey-4'" text-color="white" size="40px">
              <q-icon :name="servico.icone" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="servico-nome">{{ servico.nome }}</q-item-label>
            <q-item-label caption>
              <span class="servico-preco">{{ servico.preco }} MZN</span> • {{ servico.duracao }} min
            </q-item-label>
            <q-item-label caption lines="2" class="servico-descricao">
              {{ servico.descricao }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-toggle
              v-model="servico.ativo"
              color="positive"
              @update:model-value="toggleServico(servico)"
            />
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

      <div class="categorias-chips q-mt-sm">
        <q-chip
          v-for="cat in categorias"
          :key="cat.id"
          :removable="true"
          @remove="removerCategoria(cat)"
          color="primary"
          text-color="white"
          class="q-mr-xs q-mb-xs"
        >
          <q-icon :name="cat.icone" size="16px" class="q-mr-xs" />
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
            v-model="servicoForm.categoria"
            :options="categoriasOptions"
            label="Categoria"
            outlined
            dense
            option-label="nome"
            option-value="id"
            map-options
            emit-value
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
            <template v-slot:option="{ opt }">
              <q-item>
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
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarServico"
            :disable="
              !servicoForm.nome ||
              !servicoForm.preco ||
              !servicoForm.duracao ||
              !servicoForm.categoria
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
            :options="categoriasDisponiveis"
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
            :disable="!categoriaSelecionada"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'PrestadorServicos',
});

// Tipos
interface Servico {
  id: number;
  nome: string;
  categoria: number | null;
  preco: number | null;
  duracao: number | null;
  descricao: string;
  icone: string;
  ativo: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  icone: string;
}

interface ServicoForm {
  nome: string;
  categoria: number | null;
  preco: number | null;
  duracao: number | null;
  descricao: string;
  icone: string;
}

const router = useRouter();
const $q = useQuasar();

// Estados
const showServicoDialog = ref(false);
const showCategoriaDialog = ref(false);
const editandoServico = ref(false);
const servicoEditandoId = ref<number | null>(null);
const categoriaSelecionada = ref<number | null>(null);

// Dados mockados
const servicos = ref<Servico[]>([
  {
    id: 1,
    nome: 'Reparação elétrica',
    categoria: 1,
    preco: 1500,
    duracao: 60,
    descricao: 'Diagnóstico e reparação de problemas elétricos residenciais',
    icone: 'bolt',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Instalação de tomadas',
    categoria: 1,
    preco: 800,
    duracao: 30,
    descricao: 'Instalação de tomadas e interruptores',
    icone: 'electrical_services',
    ativo: true,
  },
  {
    id: 3,
    nome: 'Troca de disjuntores',
    categoria: 1,
    preco: 1200,
    duracao: 45,
    descricao: 'Substituição de disjuntores no quadro elétrico',
    icone: 'settings',
    ativo: false,
  },
]);

const categorias = ref<Categoria[]>([
  { id: 1, nome: 'Eletricista', icone: 'bolt' },
  { id: 2, nome: 'Canalizador', icone: 'water_drop' },
]);

const categoriasDisponiveis = ref<Categoria[]>([
  { id: 3, nome: 'Pintor', icone: 'brush' },
  { id: 4, nome: 'Limpeza', icone: 'cleaning_services' },
  { id: 5, nome: 'Informático', icone: 'computer' },
  { id: 6, nome: 'Cabeleireiro', icone: 'content_cut' },
]);

const categoriasOptions = ref<Categoria[]>([
  { id: 1, nome: 'Eletricista', icone: 'bolt' },
  { id: 2, nome: 'Canalizador', icone: 'water_drop' },
  { id: 3, nome: 'Pintor', icone: 'brush' },
  { id: 4, nome: 'Limpeza', icone: 'cleaning_services' },
  { id: 5, nome: 'Informático', icone: 'computer' },
  { id: 6, nome: 'Cabeleireiro', icone: 'content_cut' },
]);

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
];

const servicoForm = ref<ServicoForm>({
  nome: '',
  categoria: null,
  preco: null,
  duracao: null,
  descricao: '',
  icone: 'build',
});

const adicionarServico = () => {
  editandoServico.value = false;
  servicoEditandoId.value = null;
  servicoForm.value = {
    nome: '',
    categoria: null,
    preco: null,
    duracao: null,
    descricao: '',
    icone: 'build',
  };
  showServicoDialog.value = true;
};

// Função removida pois não está sendo usada
// const editarServico = (servico: Servico) => { ... }

const salvarServico = () => {
  if (!servicoForm.value.categoria || !servicoForm.value.preco || !servicoForm.value.duracao) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos', position: 'top' });
    return;
  }

  if (editandoServico.value && servicoEditandoId.value) {
    // Editar existente
    const index = servicos.value.findIndex((s) => s.id === servicoEditandoId.value);
    if (index !== -1) {
      const servicoExistente = servicos.value[index];
      if (servicoExistente) {
        servicos.value[index] = {
          ...(servicoForm.value as Required<ServicoForm>),
          id: servicoEditandoId.value,
          ativo: servicoExistente.ativo,
        };
      }
    }
    $q.notify({ type: 'positive', message: 'Serviço atualizado', position: 'top' });
  } else {
    // Adicionar novo
    if (servicos.value && servicos.value.length > 0) {
      const ids = servicos.value.map((s) => s.id);
      const novoId = Math.max(...ids) + 1;
      servicos.value.push({
        ...(servicoForm.value as Required<ServicoForm>),
        id: novoId,
        ativo: true,
      });
    } else {
      servicos.value = [
        {
          ...(servicoForm.value as Required<ServicoForm>),
          id: 1,
          ativo: true,
        },
      ];
    }
    $q.notify({ type: 'positive', message: 'Serviço adicionado', position: 'top' });
  }
  showServicoDialog.value = false;
};

const toggleServico = (servico: Servico) => {
  $q.notify({
    type: servico.ativo ? 'positive' : 'warning',
    message: `Serviço ${servico.ativo ? 'ativado' : 'desativado'}`,
    position: 'top',
  });
};

const editarCategorias = () => {
  $q.notify({
    type: 'info',
    message: 'Editar categorias em breve',
    position: 'top',
  });
};

const adicionarCategoria = () => {
  showCategoriaDialog.value = true;
};

const adicionarCategoriaConfirmar = () => {
  if (categoriaSelecionada.value) {
    const cat = categoriasDisponiveis.value.find((c) => c.id === categoriaSelecionada.value);
    if (cat) {
      categorias.value.push(cat);
      categoriasDisponiveis.value = categoriasDisponiveis.value.filter((c) => c.id !== cat.id);
      $q.notify({
        type: 'positive',
        message: `Categoria ${cat.nome} adicionada`,
        position: 'top',
      });
    }
  }
  showCategoriaDialog.value = false;
  categoriaSelecionada.value = null;
};

const removerCategoria = (categoria: Categoria) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Remover categoria ${categoria.nome}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    categorias.value = categorias.value.filter((c) => c.id !== categoria.id);
    categoriasDisponiveis.value.push(categoria);
    $q.notify({
      type: 'positive',
      message: 'Categoria removida',
      position: 'top',
    });
  });
};
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
