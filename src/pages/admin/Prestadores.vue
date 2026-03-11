<template>
  <q-page class="admin-prestadores q-pa-md">
    <div class="text-h4 q-mb-md">Gestão de Prestadores</div>

    <!-- Filtros e busca -->
    <div class="row q-mb-md q-gutter-sm">
      <q-input
        v-model="filtros.busca"
        placeholder="Buscar prestador..."
        dense
        outlined
        class="col"
        @update:model-value="debounceBuscar"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        color="primary"
        icon="filter_list"
        label="Filtros"
        outline
        @click="abrirFiltros"
      />
      <q-btn color="primary" icon="add" label="Novo" @click="novoPrestador" />
    </div>

    <!-- Tabela de prestadores -->
    <q-table
      :rows="prestadores"
      :columns="colunas"
      row-key="id"
      :filter="filtros.busca"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50]"
      v-model:pagination="paginacao"
      @request="carregarPrestadores"
    >
      <!-- Status -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.verificado ? 'positive' : 'warning'">
            {{ props.row.verificado ? 'Verificado' : 'Pendente' }}
          </q-badge>
        </q-td>
      </template>

      <!-- Avaliação -->
      <template v-slot:body-cell-avaliacao="props">
        <q-td :props="props">
          <q-rating v-model="props.row.avaliacao" size="16px" :max="5" color="yellow" readonly />
          <span class="q-ml-xs">({{ props.row.totalAvaliacoes }})</span>
        </q-td>
      </template>

      <!-- Ações -->
      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <q-btn flat round icon="visibility" size="sm" color="primary" @click="verPrestador(props.row)">
            <q-tooltip>Ver detalhes</q-tooltip>
          </q-btn>
          <q-btn flat round icon="edit" size="sm" color="secondary" @click="editarPrestador(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round icon="block" size="sm" color="negative" @click="bloquearPrestador(props.row)">
            <q-tooltip>Bloquear</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog de filtros -->
    <q-dialog v-model="mostrarFiltros">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Filtros</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="filtros.status"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <q-select
            v-model="filtros.categoria"
            :options="categoriasOptions"
            label="Categoria"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <q-input
            v-model.number="filtros.avaliacaoMin"
            label="Avaliação mínima"
            type="number"
            outlined
            dense
            :min="0"
            :max="5"
          />

          <q-select
            v-model="filtros.ordenar"
            :options="ordenacaoOptions"
            label="Ordenar por"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Limpar" color="grey-7" @click="limparFiltros" />
          <q-btn unelevated label="Aplicar" color="primary" @click="aplicarFiltros" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de detalhes do prestador -->
    <q-dialog v-model="mostrarDetalhes" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalhes do Prestador</div>
        </q-card-section>

        <q-card-section v-if="prestadorSelecionado">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4 text-center">
              <q-avatar size="120px">
                <img :src="prestadorSelecionado.avatar" />
              </q-avatar>
              <div class="text-h6 q-mt-md">{{ prestadorSelecionado.nome }}</div>
              <div class="text-grey-7">{{ prestadorSelecionado.email }}</div>
              <div class="text-grey-7">{{ prestadorSelecionado.telefone }}</div>
            </div>

            <div class="col-12 col-md-8">
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status</q-item-label>
                    <q-item-label>
                      <q-badge :color="prestadorSelecionado.verificado ? 'positive' : 'warning'">
                        {{ prestadorSelecionado.verificado ? 'Verificado' : 'Pendente' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Avaliação</q-item-label>
                    <q-item-label>
                      <q-rating v-model="prestadorSelecionado.avaliacao" size="20px" :max="5" color="yellow" readonly />
                      ({{ prestadorSelecionado.totalAvaliacoes }} avaliações)
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Serviços realizados</q-item-label>
                    <q-item-label>{{ prestadorSelecionado.totalServicos }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Categorias</q-item-label>
                    <q-item-label>
                      <q-chip
                        v-for="cat in prestadorSelecionado.categorias"
                        :key="cat"
                        size="sm"
                        color="primary"
                        text-color="white"
                      >
                        {{ cat }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Documentos</q-item-label>
                    <q-item-label>
                      <q-btn flat dense icon="description" label="Ver documentos" @click="verDocumentos" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row q-mt-md q-gutter-sm">
                <q-btn
                  unelevated
                  :color="prestadorSelecionado.verificado ? 'warning' : 'positive'"
                  :label="prestadorSelecionado.verificado ? 'Suspender' : 'Verificar'"
                  @click="alternarVerificacao"
                />
                <q-btn flat label="Voltar" color="grey-7" v-close-popup />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'

defineOptions({
  name: 'AdminPrestadores'
})

const $q = useQuasar()

// Tipos
interface Prestador {
  id: number
  nome: string
  email: string
  telefone: string
  avatar: string
  verificado: boolean
  avaliacao: number
  totalAvaliacoes: number
  totalServicos: number
  categorias: string[]
}

// Estados
const loading = ref(false)
const mostrarFiltros = ref(false)
const mostrarDetalhes = ref(false)
const prestadorSelecionado = ref<Prestador | null>(null)

// Paginação
const paginacao = ref({
  sortBy: 'nome',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Filtros
const filtros = reactive({
  busca: '',
  status: null,
  categoria: null,
  avaliacaoMin: null,
  ordenar: 'nome_asc'
})

const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Verificados', value: 'verificado' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Bloqueados', value: 'bloqueado' }
]

const categoriasOptions = [
  { label: 'Eletricista', value: 'eletricista' },
  { label: 'Canalizador', value: 'canalizador' },
  { label: 'Pintor', value: 'pintor' },
  { label: 'Informático', value: 'informatico' }
]

const ordenacaoOptions = [
  { label: 'Nome (A-Z)', value: 'nome_asc' },
  { label: 'Nome (Z-A)', value: 'nome_desc' },
  { label: 'Melhor avaliação', value: 'avaliacao_desc' },
  { label: 'Mais serviços', value: 'servicos_desc' }
]

// CORREÇÃO: Tipagem correta das colunas
const colunas: QTableColumn[] = [
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'telefone',
    label: 'Telefone',
    field: 'telefone',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'status',
    label: 'Status',
    field: 'verificado',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'avaliacao',
    label: 'Avaliação',
    field: 'avaliacao',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: 'acoes',
    align: 'center' as const,
    sortable: false
  }
]

// Dados mockados
const prestadores = ref<Prestador[]>([
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '+258 84 123 4567',
    avatar: 'https://cdn.quasar.dev/img/avatar.png',
    verificado: true,
    avaliacao: 4.8,
    totalAvaliacoes: 87,
    totalServicos: 156,
    categorias: ['Eletricista', 'Informático']
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '+258 82 987 6543',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    verificado: false,
    avaliacao: 4.5,
    totalAvaliacoes: 23,
    totalServicos: 45,
    categorias: ['Limpeza', 'Baby-sitter']
  }
])

// Métodos
const carregarPrestadores = () => {
  // Implementar chamada API
}

const debounceBuscar = () => {
  // Implementar debounce
}

const abrirFiltros = () => {
  mostrarFiltros.value = true
}

const limparFiltros = () => {
  filtros.status = null
  filtros.categoria = null
  filtros.avaliacaoMin = null
  filtros.ordenar = 'nome_asc'
}

const aplicarFiltros = () => {
  mostrarFiltros.value = false
  carregarPrestadores()
}

const novoPrestador = () => {
  $q.notify({
    type: 'info',
    message: 'Novo prestador em breve',
    position: 'top'
  })
}

const verPrestador = (prestador: Prestador) => {
  prestadorSelecionado.value = prestador
  mostrarDetalhes.value = true
}

const editarPrestador = (prestador: Prestador) => {
  $q.notify({
    type: 'info',
    message: `Editar ${prestador.nome}`,
    position: 'top'
  })
}

const bloquearPrestador = (prestador: Prestador) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Bloquear o prestador ${prestador.nome}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Prestador bloqueado',
      position: 'top'
    })
  })
}

const verDocumentos = () => {
  $q.notify({
    type: 'info',
    message: 'Documentos em breve',
    position: 'top'
  })
}

const alternarVerificacao = () => {
  if (prestadorSelecionado.value) {
    prestadorSelecionado.value.verificado = !prestadorSelecionado.value.verificado
    $q.notify({
      type: 'positive',
      message: prestadorSelecionado.value.verificado ? 'Prestador verificado' : 'Prestador suspenso',
      position: 'top'
    })
  }
}
</script>
