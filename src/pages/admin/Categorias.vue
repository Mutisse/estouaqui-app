<template>
  <q-page class="admin-categorias q-pa-md">
    <div class="text-h4 q-mb-md">Gestão de Categorias</div>

    <q-card>
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">Lista de Categorias</div>
          <q-btn color="primary" icon="add" label="Nova Categoria" @click="novaCategoria" />
        </div>
      </q-card-section>

      <q-table
        :rows="categorias"
        :columns="colunas"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
      >
        <!-- Ícone -->
        <template v-slot:body-cell-icone="props">
          <q-td :props="props">
            <q-icon :name="props.row.icone" size="24px" :color="props.row.cor" />
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.ativo ? 'positive' : 'grey'">
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Ações -->
        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <q-btn flat round icon="edit" size="sm" color="secondary" @click="editarCategoria(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round icon="delete" size="sm" color="negative" @click="removerCategoria(props.row)">
              <q-tooltip>Remover</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para nova/editar categoria -->
    <q-dialog v-model="mostrarDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editando ? 'Editar' : 'Nova' }} Categoria</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.nome"
            label="Nome da categoria"
            outlined
            dense
            :rules="[val => !!val || 'Nome é obrigatório']"
          />

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            dense
            type="textarea"
            autogrow
          />

          <q-select
            v-model="form.icone"
            :options="iconeOptions"
            label="Ícone"
            outlined
            dense
            options-dense
            emit-value
            map-options
          >
            <template v-slot:option="{ opt }">
              <q-item>
                <q-item-section avatar>
                  <q-icon :name="opt.value" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ opt }">
              <div class="row items-center">
                <q-icon :name="opt.value" class="q-mr-sm" />
                {{ opt.label }}
              </div>
            </template>
          </q-select>

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
                <q-item-section>
                  <q-badge :color="opt.value" style="width: 20px; height: 20px;" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ opt }">
              <div class="row items-center">
                <q-badge :color="opt.value" style="width: 16px; height: 16px;" class="q-mr-sm" />
                {{ opt.label }}
              </div>
            </template>
          </q-select>

          <q-toggle v-model="form.ativo" label="Ativo" left-label />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarCategoria"
            :disable="!form.nome"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'

defineOptions({
  name: 'AdminCategorias'
})

const $q = useQuasar()

// Tipos
interface Categoria {
  id: number
  nome: string
  descricao: string
  icone: string
  cor: string
  total: number
  ativo: boolean
}

// Tipo para o formulário (sem o id e total)
type CategoriaForm = Omit<Categoria, 'id' | 'total'>

// Estados
const loading = ref(false)
const mostrarDialog = ref(false)
const editando = ref(false)
const categoriaEditandoId = ref<number | null>(null)

// Dados mockados
const categorias = ref<Categoria[]>([
  { id: 1, nome: 'Eletricista', descricao: 'Serviços elétricos', icone: 'bolt', cor: 'warning', total: 45, ativo: true },
  { id: 2, nome: 'Canalizador', descricao: 'Serviços de canalização', icone: 'water_drop', cor: 'info', total: 32, ativo: true },
  { id: 3, nome: 'Pintor', descricao: 'Pintura residencial', icone: 'brush', cor: 'accent', total: 28, ativo: true },
  { id: 4, nome: 'Informático', descricao: 'Suporte técnico', icone: 'computer', cor: 'primary', total: 56, ativo: true },
  { id: 5, nome: 'Cabeleireiro', descricao: 'Cortes e penteados', icone: 'content_cut', cor: 'pink', total: 34, ativo: true },
  { id: 6, nome: 'Manicure', descricao: 'Unhas e cuidados', icone: 'handshake', cor: 'purple', total: 41, ativo: true },
  { id: 7, nome: 'Limpeza', descricao: 'Limpeza doméstica', icone: 'cleaning_services', cor: 'cyan', total: 23, ativo: false },
  { id: 8, nome: 'Motorista', descricao: 'Entregas e transporte', icone: 'local_taxi', cor: 'teal', total: 67, ativo: true }
])

// Opções
const iconeOptions = [
  { label: 'Bolt', value: 'bolt' },
  { label: 'Water Drop', value: 'water_drop' },
  { label: 'Brush', value: 'brush' },
  { label: 'Computer', value: 'computer' },
  { label: 'Content Cut', value: 'content_cut' },
  { label: 'Handshake', value: 'handshake' },
  { label: 'Cleaning Services', value: 'cleaning_services' },
  { label: 'Local Taxi', value: 'local_taxi' },
  { label: 'Build', value: 'build' },
  { label: 'Handyman', value: 'handyman' }
]

const corOptions = [
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Accent', value: 'accent' },
  { label: 'Primary', value: 'primary' },
  { label: 'Pink', value: 'pink' },
  { label: 'Purple', value: 'purple' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Teal', value: 'teal' },
  { label: 'Positive', value: 'positive' },
  { label: 'Secondary', value: 'secondary' }
]

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'icone', label: 'Ícone', field: 'icone', align: 'center' as const, sortable: false },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'descricao', label: 'Descrição', field: 'descricao', align: 'left' as const, sortable: false },
  { name: 'total', label: 'Total', field: 'total', align: 'center' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'ativo', align: 'center' as const, sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const, sortable: false }
]

// Formulário
const form = ref<CategoriaForm>({
  nome: '',
  descricao: '',
  icone: 'bolt',
  cor: 'primary',
  ativo: true
})

// Métodos
const novaCategoria = () => {
  editando.value = false
  categoriaEditandoId.value = null
  form.value = {
    nome: '',
    descricao: '',
    icone: 'bolt',
    cor: 'primary',
    ativo: true
  }
  mostrarDialog.value = true
}

const editarCategoria = (categoria: Categoria) => {
  editando.value = true
  categoriaEditandoId.value = categoria.id
  form.value = {
    nome: categoria.nome,
    descricao: categoria.descricao,
    icone: categoria.icone,
    cor: categoria.cor,
    ativo: categoria.ativo
  }
  mostrarDialog.value = true
}

const salvarCategoria = () => {
  if (!form.value.nome) {
    $q.notify({
      type: 'warning',
      message: 'Nome é obrigatório',
      position: 'top'
    })
    return
  }

  if (editando.value && categoriaEditandoId.value) {
    // Editar existente
    const index = categorias.value.findIndex(c => c.id === categoriaEditandoId.value)
    // CORREÇÃO: Verificar se o índice é válido antes de acessar
    if (index !== -1) {
      const categoriaExistente = categorias.value[index]
      if (categoriaExistente) {
        const totalExistente = categoriaExistente.total
        categorias.value[index] = {
          ...categoriaExistente,
          ...form.value,
          id: categoriaEditandoId.value,
          total: totalExistente
        }
        $q.notify({
          type: 'positive',
          message: 'Categoria atualizada',
          position: 'top'
        })
      }
    }
  } else {
    // Nova categoria - calcular novo id e definir total como 0
    const novoId = categorias.value.length > 0
      ? Math.max(...categorias.value.map(c => c.id)) + 1
      : 1

    categorias.value.push({
      id: novoId,
      ...form.value,
      total: 0
    })
    $q.notify({
      type: 'positive',
      message: 'Categoria criada',
      position: 'top'
    })
  }
  mostrarDialog.value = false
}

const removerCategoria = (categoria: Categoria) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: `Remover a categoria "${categoria.nome}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    categorias.value = categorias.value.filter(c => c.id !== categoria.id)
    $q.notify({
      type: 'positive',
      message: 'Categoria removida',
      position: 'top'
    })
  })
}
</script>
