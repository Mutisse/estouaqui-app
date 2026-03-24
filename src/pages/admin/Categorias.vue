<template>
  <q-page class="admin-categorias q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="category" size="32px" class="q-mr-sm" />
          Gestão de Categorias
        </div>
        <div class="page-subtitle">Gerencie as categorias de serviços da plataforma</div>
      </div>
      <div class="header-actions">
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarCategorias"
          :loading="adminStore.loading"
        />
        <q-btn
          label="Nova Categoria"
          icon="add"
          color="primary"
          glossy
          @click="novaCategoria"
        />
      </div>
    </div>

    <q-card class="categorias-card">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">Lista de Categorias</div>
        </div>
      </q-card-section>

      <q-table
        :rows="adminStore.categorias"
        :columns="colunas"
        row-key="id"
        :loading="adminStore.loading"
        :rows-per-page-options="[10, 20, 50]"
        class="categorias-table"
      >
        <!-- Primeira coluna: Ícone com cor da categoria -->
        <template v-slot:body-cell-icone="props">
          <q-td :props="props">
            <div class="icon-wrapper" :style="{ backgroundColor: getCorClara(props.row.cor) }">
              <q-icon
                :name="props.row.icone"
                size="28px"
                :color="props.row.cor"
                class="icon-animated"
              />
            </div>
          </q-td>
        </template>

        <!-- Nome com cor -->
        <template v-slot:body-cell-nome="props">
          <q-td :props="props">
            <div class="nome-wrapper">
              <span class="nome-text" :style="{ color: getCorEscura(props.row.cor) }">
                {{ props.row.nome }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- Descrição -->
        <template v-slot:body-cell-descricao="props">
          <q-td :props="props">
            <div class="descricao-text">
              {{ props.row.descricao || 'Sem descrição' }}
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-ativo="props">
          <q-td :props="props">
            <q-badge :color="props.row.ativo ? props.row.cor : 'grey'" class="status-badge">
              <q-icon :name="props.row.ativo ? 'check_circle' : 'cancel'" size="12px" class="q-mr-xs" />
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Total de serviços -->
        <template v-slot:body-cell-servicos_count="props">
          <q-td :props="props">
            <q-chip size="sm" :color="props.row.cor" text-color="white" dense>
              {{ props.row.servicos_count || 0 }} serviços
            </q-chip>
          </q-td>
        </template>

        <!-- Ações -->
        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn
                flat
                round
                icon="edit"
                size="sm"
                :color="props.row.cor"
                @click="editarCategoria(props.row)"
              >
                <q-tooltip>Editar categoria</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="removerCategoria(props.row)"
              >
                <q-tooltip>Remover categoria</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-center q-pa-md">
            <q-icon name="category" size="48px" color="grey" />
            <div class="text-subtitle1 q-mt-sm">Nenhuma categoria encontrada</div>
            <div class="text-caption text-grey">Clique em "Nova Categoria" para adicionar</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para nova/editar categoria -->
    <q-dialog v-model="mostrarDialog" persistent transition="scale">
      <q-card style="min-width: 500px" class="categoria-dialog">
        <q-card-section class="dialog-header" :class="form.cor">
          <div class="text-h6 text-white">
            <q-icon :name="editando ? 'edit' : 'add'" class="q-mr-sm" />
            {{ editando ? 'Editar' : 'Nova' }} Categoria
          </div>
          <q-btn flat round dense icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            v-model="form.nome"
            label="Nome da categoria"
            outlined
            dense
            :rules="[val => !!val || 'Nome é obrigatório']"
            counter
            maxlength="50"
          >
            <template v-slot:prepend>
              <q-icon name="title" :color="form.cor" />
            </template>
          </q-input>

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            dense
            type="textarea"
            autogrow
            rows="3"
          >
            <template v-slot:prepend>
              <q-icon name="description" :color="form.cor" />
            </template>
          </q-input>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.icone"
                :options="iconeOptions"
                label="Ícone"
                outlined
                dense
                options-dense
                emit-value
                map-options
                use-input
                hide-selected
                fill-input
                input-debounce="0"
              >
                <template v-slot:option="{ opt }">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon :name="opt.value" size="20px" :color="form.cor" />
                    </q-item-section>
                    <q-item-section>{{ opt.label }}</q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <div class="row items-center">
                    <q-icon :name="opt.value" class="q-mr-sm" size="20px" :color="form.cor" />
                    {{ opt.label }}
                  </div>
                </template>
              </q-select>
            </div>

            <div class="col-6">
              <q-select
                v-model="form.cor"
                :options="corOptions"
                label="Cor"
                outlined
                dense
                options-dense
                emit-value
                map-options
              >
                <template v-slot:option="{ opt }">
                  <q-item>
                    <q-item-section avatar>
                      <div class="color-preview" :style="{ backgroundColor: getCorValue(opt.value) }" />
                    </q-item-section>
                    <q-item-section>{{ opt.label }}</q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <div class="row items-center">
                    <div class="color-preview-small" :style="{ backgroundColor: getCorValue(opt.value) }" />
                    {{ opt.label }}
                  </div>
                </template>
              </q-select>
            </div>
          </div>

          <q-toggle v-model="form.ativo" label="Categoria ativa" left-label :color="form.cor" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            :color="form.cor"
            @click="salvarCategoria"
            :disable="!form.nome"
            :loading="salvando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'
import type { CategoriaData } from 'src/stores/admin-store'

defineOptions({
  name: 'AdminCategorias'
})

const $q = useQuasar()
const adminStore = useAdminStore()

// Estados
const mostrarDialog = ref(false)
const editando = ref(false)
const salvando = ref(false)
const categoriaEditandoId = ref<number | null>(null)

// Função para converter nome da cor para valor CSS
const getCorValue = (corNome: string): string => {
  const cores: Record<string, string> = {
    primary: '#1976d2',
    secondary: '#9c27b0',
    positive: '#2e7d32',
    warning: '#ed6c02',
    info: '#0288d1',
    pink: '#c2185b',
    purple: '#7b1fa2',
    cyan: '#0097a7',
    teal: '#00796b',
    red: '#d32f2f',
    'light-blue': '#0288d1',
    lime: '#afb42b',
    brown: '#795548',
    indigo: '#3f51b5'
  }
  return cores[corNome] || corNome
}

// Função para obter cor clara de fundo (20% opacidade)
const getCorClara = (corNome: string): string => {
  const cores: Record<string, string> = {
    primary: 'rgba(25, 118, 210, 0.1)',
    secondary: 'rgba(156, 39, 176, 0.1)',
    positive: 'rgba(46, 125, 50, 0.1)',
    warning: 'rgba(237, 108, 2, 0.1)',
    info: 'rgba(2, 136, 209, 0.1)',
    pink: 'rgba(194, 24, 91, 0.1)',
    purple: 'rgba(123, 31, 162, 0.1)',
    cyan: 'rgba(0, 151, 167, 0.1)',
    teal: 'rgba(0, 121, 107, 0.1)',
    red: 'rgba(211, 47, 47, 0.1)',
    'light-blue': 'rgba(2, 136, 209, 0.1)',
    lime: 'rgba(175, 180, 43, 0.1)',
    brown: 'rgba(121, 85, 72, 0.1)',
    indigo: 'rgba(63, 81, 181, 0.1)'
  }
  return cores[corNome] || 'rgba(0, 0, 0, 0.05)'
}

// Função para obter cor escura para o texto
const getCorEscura = (corNome: string): string => {
  const cores: Record<string, string> = {
    primary: '#1565c0',
    secondary: '#7b1fa2',
    positive: '#2b5e2e',
    warning: '#e65c00',
    info: '#0277bd',
    pink: '#ad1457',
    purple: '#6a1b9a',
    cyan: '#00838f',
    teal: '#00695c',
    red: '#c62828',
    'light-blue': '#0277bd',
    lime: '#9e9d24',
    brown: '#6d4c41',
    indigo: '#3949ab'
  }
  return cores[corNome] || '#2c3e50'
}

// Opções de ícones com nomes amigáveis
const iconeOptions = [
  { label: '⚡ Raio', value: 'bolt' },
  { label: '💧 Água', value: 'water_drop' },
  { label: '🖌️ Pincel', value: 'brush' },
  { label: '💻 Computador', value: 'computer' },
  { label: '✂️ Tesoura', value: 'content_cut' },
  { label: '🤝 Aperto de mão', value: 'handshake' },
  { label: '🧹 Limpeza', value: 'cleaning_services' },
  { label: '🚕 Táxi', value: 'local_taxi' },
  { label: '🔨 Construção', value: 'build' },
  { label: '🛠️ Reparos', value: 'handyman' },
  { label: '🌿 Jardinagem', value: 'yard' },
  { label: '📷 Fotografia', value: 'photo_camera' },
  { label: '🎉 Eventos', value: 'celebration' },
  { label: '❤️ Saúde', value: 'favorite' },
  { label: '📚 Educação', value: 'school' }
]

// Opções de cores com nomes amigáveis e valores CSS
const corOptions = [
  { label: '🔵 Azul', value: 'primary' },
  { label: '🟣 Roxo', value: 'secondary' },
  { label: '🟢 Verde', value: 'positive' },
  { label: '🟡 Laranja', value: 'warning' },
  { label: '🔷 Ciano', value: 'info' },
  { label: '🌸 Rosa', value: 'pink' },
  { label: '🟣 Violeta', value: 'purple' },
  { label: '🟢 Turquesa', value: 'cyan' },
  { label: '🟢 Verde água', value: 'teal' },
  { label: '🔴 Vermelho', value: 'red' },
  { label: '🔵 Azul claro', value: 'light-blue' },
  { label: '🟢 Verde limão', value: 'lime' },
  { label: '🟠 Marrom', value: 'brown' },
  { label: '🟣 Índigo', value: 'indigo' }
]

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'icone', label: 'Ícone', field: 'icone', align: 'center', sortable: false },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
  { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left', sortable: false },
  { name: 'servicos_count', label: 'Serviços', field: 'servicos_count', align: 'center', sortable: true },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center', sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', sortable: false }
]

// Formulário
const form = reactive({
  nome: '',
  descricao: '',
  icone: 'bolt',
  cor: 'primary',
  ativo: true
})

// Carregar categorias
const carregarCategorias = async () => {
  try {
    await adminStore.fetchCategorias()
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

// Nova categoria
const novaCategoria = () => {
  editando.value = false
  categoriaEditandoId.value = null
  form.nome = ''
  form.descricao = ''
  form.icone = 'bolt'
  form.cor = 'primary'
  form.ativo = true
  mostrarDialog.value = true
}

// Editar categoria
const editarCategoria = (categoria: CategoriaData) => {
  editando.value = true
  categoriaEditandoId.value = categoria.id
  form.nome = categoria.nome
  form.descricao = categoria.descricao || ''
  form.icone = categoria.icone || 'bolt'
  form.cor = categoria.cor || 'primary'
  form.ativo = categoria.ativo
  mostrarDialog.value = true
}

// Salvar categoria
const salvarCategoria = async () => {
  if (!form.nome) {
    $q.notify({
      type: 'warning',
      message: 'Nome é obrigatório',
      position: 'top'
    })
    return
  }

  salvando.value = true
  try {
    if (editando.value && categoriaEditandoId.value) {
      const result = await adminStore.updateCategoria(categoriaEditandoId.value, {
        nome: form.nome,
        descricao: form.descricao,
        icone: form.icone,
        cor: form.cor,
        ativo: form.ativo
      })
      if (result) {
        $q.notify({
          type: 'positive',
          message: 'Categoria atualizada com sucesso!',
          position: 'top'
        })
      }
    } else {
      const result = await adminStore.createCategoria({
        nome: form.nome,
        descricao: form.descricao,
        icone: form.icone,
        cor: form.cor
      })
      if (result) {
        $q.notify({
          type: 'positive',
          message: 'Categoria criada com sucesso!',
          position: 'top'
        })
      }
    }
    await carregarCategorias()
    mostrarDialog.value = false
  } catch (err) {
    console.error('Erro ao salvar categoria:', err)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar categoria',
      position: 'top'
    })
  } finally {
    salvando.value = false
  }
}

// Remover categoria
const removerCategoria = (categoria: CategoriaData) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: `Remover a categoria "${categoria.nome}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        const result = await adminStore.deleteCategoria(categoria.id)
        if (result) {
          $q.notify({
            type: 'positive',
            message: 'Categoria removida com sucesso!',
            position: 'top'
          })
          await carregarCategorias()
        }
      } catch (err) {
        console.error('Erro ao remover categoria:', err)
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover categoria',
          position: 'top'
        })
      }
    })()
  })
}

// Carregar dados ao montar
onMounted(() => {
  void carregarCategorias()
})
</script>

<style scoped lang="scss">
.admin-categorias {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .page-title-section {
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 4px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.categorias-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.categorias-table {
  :deep(.q-table) {
    thead tr th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #e9ecef;
    }

    tbody tr {
      transition: background 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }
    }

    td {
      padding: 12px 16px;
      vertical-align: middle;
    }
  }
}

// Primeira coluna com fundo colorido
.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin: 0 auto;
  transition: all 0.3s ease;

  .icon-animated {
    transition: transform 0.2s ease;
  }

  &:hover {
    transform: scale(1.05);

    .icon-animated {
      transform: scale(1.1);
    }
  }
}

// Nome com cor
.nome-wrapper {
  .nome-text {
    font-weight: 600;
    font-size: 1rem;
    transition: color 0.2s ease;
  }
}

.descricao-text {
  color: #6c757d;
  font-size: 0.875rem;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Badge de status
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

// Botões de ação
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;

  .q-btn {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

// Diálogo
.categoria-dialog {
  border-radius: 16px;
  overflow: hidden;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;

    &.primary { background: linear-gradient(135deg, #1976d2, #64b5f6); }
    &.secondary { background: linear-gradient(135deg, #9c27b0, #ce93d8); }
    &.positive { background: linear-gradient(135deg, #2e7d32, #81c784); }
    &.warning { background: linear-gradient(135deg, #ed6c02, #ffb74d); }
    &.info { background: linear-gradient(135deg, #0288d1, #4fc3f7); }
    &.pink { background: linear-gradient(135deg, #c2185b, #f48fb1); }
    &.purple { background: linear-gradient(135deg, #7b1fa2, #ba68c8); }
    &.cyan { background: linear-gradient(135deg, #0097a7, #4dd0e1); }
    &.teal { background: linear-gradient(135deg, #00796b, #4db6ac); }
    &.red { background: linear-gradient(135deg, #d32f2f, #ef9a9a); }
    &.light-blue { background: linear-gradient(135deg, #0288d1, #81d4fa); }
    &.lime { background: linear-gradient(135deg, #afb42b, #e6ee9c); }
    &.brown { background: linear-gradient(135deg, #795548, #bcaaa4); }
    &.indigo { background: linear-gradient(135deg, #3f51b5, #9fa8da); }
  }

  .dialog-actions {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
  }
}

// Preview de cores
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.color-preview-small {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

// Responsivo
@media (max-width: 768px) {
  .admin-categorias {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .categoria-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }

  .descricao-text {
    max-width: 150px;
  }
}
</style>
