<template>
  <q-page class="admin-servicos q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="construction" size="32px" class="q-mr-sm" />
          Gestão de Serviços
        </div>
        <div class="page-subtitle">Gerencie os serviços oferecidos na plataforma</div>
      </div>
      <div class="header-actions">
        <q-btn
          label="Atualizar"
          icon="refresh"
          color="grey-7"
          outline
          @click="carregarServicos"
          :loading="adminStore.loading"
        />
        <q-btn
          label="Novo Serviço"
          icon="add"
          color="primary"
          glossy
          @click="novoServico"
        />
      </div>
    </div>

    <q-card class="servicos-card">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">Lista de Serviços</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasOptions"
              label="Filtrar por categoria"
              dense
              outlined
              clearable
              class="filter-select"
              style="min-width: 150px"
              @update:model-value="carregarServicos"
            />
            <q-select
              v-model="filtroAtivo"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              clearable
              class="filter-select"
              style="min-width: 120px"
              @update:model-value="carregarServicos"
            />
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="adminStore.servicos"
        :columns="colunas"
        row-key="id"
        :loading="adminStore.loading"
        :rows-per-page-options="[10, 20, 50]"
        class="servicos-table"
      >
        <!-- Nome do serviço -->
        <template v-slot:body-cell-nome="props">
          <q-td :props="props">
            <div class="servico-nome">
              <q-icon :name="getIconeCategoria(props.row.categoria?.nome)" size="20px" class="q-mr-sm" :color="getCorCategoria(props.row.categoria?.nome)" />
              <span class="text-weight-medium">{{ props.row.nome }}</span>
            </div>
          </q-td>
        </template>

        <!-- Categoria com cor -->
        <template v-slot:body-cell-categoria="props">
          <q-td :props="props">
            <q-chip
              size="sm"
              :color="getCorCategoria(props.row.categoria?.nome)"
              text-color="white"
              dense
            >
              {{ props.row.categoria?.nome || 'Sem categoria' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Preço -->
        <template v-slot:body-cell-preco="props">
          <q-td :props="props">
            <div class="preco-value">
              <strong>{{ formatMoney(props.row.preco) }}</strong>
            </div>
          </q-td>
        </template>

        <!-- Duração -->
        <template v-slot:body-cell-duracao="props">
          <q-td :props="props">
            <div class="duracao-value">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              {{ props.row.duracao }} min
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-ativo="props">
          <q-td :props="props">
            <q-badge :color="props.row.ativo ? 'positive' : 'grey'" class="status-badge">
              <q-icon :name="props.row.ativo ? 'check_circle' : 'cancel'" size="12px" class="q-mr-xs" />
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-badge>
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
                color="secondary"
                @click="editarServico(props.row)"
              >
                <q-tooltip>Editar serviço</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="removerServico(props.row)"
              >
                <q-tooltip>Remover serviço</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-center q-pa-md">
            <q-icon name="construction" size="48px" color="grey" />
            <div class="text-subtitle1 q-mt-sm">Nenhum serviço encontrado</div>
            <div class="text-caption text-grey">Clique em "Novo Serviço" para adicionar</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para novo/editar serviço -->
    <q-dialog v-model="mostrarDialog" persistent transition="scale">
      <q-card style="min-width: 500px" class="servico-dialog">
        <q-card-section class="dialog-header bg-primary text-white">
          <div class="text-h6">
            <q-icon :name="editando ? 'edit' : 'add'" class="q-mr-sm" />
            {{ editando ? 'Editar' : 'Novo' }} Serviço
          </div>
          <q-btn flat round dense icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            v-model="form.nome"
            label="Nome do serviço"
            outlined
            dense
            :rules="[val => !!val || 'Nome é obrigatório']"
            counter
            maxlength="100"
          >
            <template v-slot:prepend>
              <q-icon name="title" color="primary" />
            </template>
          </q-input>

          <q-select
            v-model="form.categoria_id"
            :options="categoriasSelectOptions"
            label="Categoria"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Selecione uma categoria']"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="primary" />
            </template>
          </q-select>

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
              <q-icon name="description" color="primary" />
            </template>
          </q-input>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="form.preco"
                label="Preço (MZN)"
                outlined
                dense
                type="number"
                :rules="[val => val > 0 || 'Preço deve ser maior que 0']"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="col-6">
              <q-input
                v-model.number="form.duracao"
                label="Duração (minutos)"
                outlined
                dense
                type="number"
                :rules="[val => val >= 5 || 'Duração mínima de 5 minutos']"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <q-toggle v-model="form.ativo" label="Serviço ativo" left-label color="primary" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarServico"
            :disable="!form.nome || !form.categoria_id || !form.preco"
            :loading="salvando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'
import type { ServicoData, CategoriaData, CreateServicoData } from 'src/stores/admin-store'

defineOptions({
  name: 'AdminServicos'
})

const $q = useQuasar()
const adminStore = useAdminStore()

// Estados
const mostrarDialog = ref(false)
const editando = ref(false)
const salvando = ref(false)
const servicoEditandoId = ref<number | null>(null)
const filtroCategoria = ref<number | null>(null)
const filtroAtivo = ref<boolean | null>(null)

// Opções para filtros
const statusOptions = [
  { label: 'Ativos', value: true },
  { label: 'Inativos', value: false }
]

// Categorias para os filtros e select
const categoriasSelectOptions = ref<{ label: string; value: number }[]>([])
const categoriasOptions = computed(() => [
  ...categoriasSelectOptions.value,
  { label: 'Todas', value: null }
])

// Funções auxiliares para cores e ícones
const getCorCategoria = (nomeCategoria?: string): string => {
  const cores: Record<string, string> = {
    'Eletricista': 'warning',
    'Canalizador': 'info',
    'Pintor': 'accent',
    'Informático': 'primary',
    'Limpeza': 'positive',
    'Motorista': 'secondary',
    'Cabeleireiro': 'pink',
    'Manicure': 'purple'
  }
  return cores[nomeCategoria || ''] || 'grey'
}

const getIconeCategoria = (nomeCategoria?: string): string => {
  const icones: Record<string, string> = {
    'Eletricista': 'bolt',
    'Canalizador': 'water_drop',
    'Pintor': 'brush',
    'Informático': 'computer',
    'Limpeza': 'cleaning_services',
    'Motorista': 'local_taxi',
    'Cabeleireiro': 'content_cut',
    'Manicure': 'handshake'
  }
  return icones[nomeCategoria || ''] || 'handyman'
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0
  }).format(value)
}

// Colunas da tabela
const colunas: QTableColumn[] = [
  { name: 'nome', label: 'Serviço', field: 'nome', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoria', field: 'categoria', align: 'left', sortable: true },
  { name: 'preco', label: 'Preço', field: 'preco', align: 'center', sortable: true },
  { name: 'duracao', label: 'Duração', field: 'duracao', align: 'center', sortable: true },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center', sortable: false },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', sortable: false }
]

// Formulário
const form = reactive({
  nome: '',
  categoria_id: null as number | null,
  descricao: '',
  preco: 0,
  duracao: 30,
  ativo: true
})

// Carregar categorias para os selects
const carregarCategorias = async () => {
  try {
    const cats = await adminStore.fetchCategorias()
    categoriasSelectOptions.value = cats.map((cat: CategoriaData) => ({
      label: cat.nome,
      value: cat.id
    }))
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

// Carregar serviços
const carregarServicos = async () => {
  try {
    const params: {
      categoria?: number;
      ativo?: boolean;
    } = {}
    if (filtroCategoria.value) params.categoria = filtroCategoria.value
    if (filtroAtivo.value !== null) params.ativo = filtroAtivo.value

    await adminStore.fetchServicos(params)
  } catch (error) {
    console.error('Erro ao carregar serviços:', error)
  }
}

// Novo serviço
const novoServico = () => {
  editando.value = false
  servicoEditandoId.value = null
  form.nome = ''
  form.categoria_id = null
  form.descricao = ''
  form.preco = 0
  form.duracao = 30
  form.ativo = true
  mostrarDialog.value = true
}

// Editar serviço
const editarServico = (servico: ServicoData) => {
  editando.value = true
  servicoEditandoId.value = servico.id
  form.nome = servico.nome
  form.categoria_id = servico.categoria?.id || null
  form.descricao = servico.descricao || ''
  form.preco = servico.preco
  form.duracao = servico.duracao
  form.ativo = servico.ativo
  mostrarDialog.value = true
}

// Salvar serviço
const salvarServico = async () => {
  if (!form.nome || !form.categoria_id || !form.preco) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos obrigatórios',
      position: 'top'
    })
    return
  }

  salvando.value = true
  try {
    // Criar objeto com os campos necessários para CreateServicoData
    const data: CreateServicoData = {
      prestador_id: 1, // ID do prestador - você precisa definir como pegar isso
      categoria_id: form.categoria_id,
      nome: form.nome,
      descricao: form.descricao,
      preco: form.preco,
      duracao: form.duracao
    }

    if (editando.value && servicoEditandoId.value) {
      // TODO: Implementar update de serviço quando disponível
      $q.notify({
        type: 'info',
        message: 'Edição de serviço em desenvolvimento',
        position: 'top'
      })
    } else {
      const result = await adminStore.createServico(data)
      if (result) {
        $q.notify({
          type: 'positive',
          message: 'Serviço criado com sucesso!',
          position: 'top'
        })
        await carregarServicos()
        mostrarDialog.value = false
      }
    }
  } catch (err) {
    console.error('Erro ao salvar serviço:', err)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço',
      position: 'top'
    })
  } finally {
    salvando.value = false
  }
}

// Remover serviço
const removerServico = (servico: ServicoData) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: `Remover o serviço "${servico.nome}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'Remoção de serviço em desenvolvimento',
      position: 'top'
    })
  })
}

// Carregar dados ao montar
onMounted(() => {
  void carregarCategorias()
  void carregarServicos()
})
</script>

<style scoped lang="scss">
.admin-servicos {
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

.servicos-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.filter-select {
  min-width: 150px;
}

.servicos-table {
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

.servico-nome {
  display: flex;
  align-items: center;
}

.preco-value {
  color: #2e7d32;
  font-weight: 600;
}

.duracao-value {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

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

.servico-dialog {
  border-radius: 16px;
  overflow: hidden;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
  }

  .dialog-actions {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
  }
}

// Responsivo
@media (max-width: 768px) {
  .admin-servicos {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
  }

  .servico-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }
}
</style>
