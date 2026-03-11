<template>
  <q-page class="admin-servicos q-pa-md">
    <div class="text-h4 q-mb-md">Gestão de Serviços</div>

    <q-card>
      <q-card-section>
        <q-btn color="primary" icon="add" label="Novo Serviço" @click="novoServico" />
      </q-card-section>

      <q-table
        :rows="servicos"
        :columns="colunas"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:body-cell-preco="props">
          <q-td :props="props">{{ props.row.preco }} MZN</q-td>
        </template>

        <template v-slot:body-cell-duracao="props">
          <q-td :props="props">{{ props.row.duracao }} min</q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.ativo ? 'positive' : 'grey'">
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <q-btn flat round icon="edit" size="sm" color="secondary" @click="editarServico(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round icon="delete" size="sm" color="negative" @click="removerServico(props.row)">
              <q-tooltip>Remover</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'

defineOptions({
  name: 'AdminServicos'
})

// Tipos
interface Servico {
  id: number
  nome: string
  categoria: string
  preco: number
  duracao: string
  total: number
  ativo: boolean
}

const $q = useQuasar()
const loading = ref(false)

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
    name: 'categoria',
    label: 'Categoria',
    field: 'categoria',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'preco',
    label: 'Preço (MZN)',
    field: 'preco',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'duracao',
    label: 'Duração',
    field: 'duracao',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'ativo',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: 'acoes',
    align: 'center' as const,
    sortable: false
  }
]

const servicos = ref<Servico[]>([
  { id: 1, nome: 'Reparação elétrica', categoria: 'Eletricista', preco: 1500, duracao: '60', total: 45, ativo: true },
  { id: 2, nome: 'Instalação de tomada', categoria: 'Eletricista', preco: 800, duracao: '30', total: 32, ativo: true },
  { id: 3, nome: 'Limpeza residencial', categoria: 'Limpeza', preco: 1200, duracao: '120', total: 28, ativo: true },
  { id: 4, nome: 'Pintura de parede', categoria: 'Pintor', preco: 2000, duracao: '180', total: 15, ativo: false }
])

const novoServico = () => {
  $q.notify({
    type: 'info',
    message: 'Novo serviço em breve',
    position: 'top'
  })
}

const editarServico = (servico: Servico) => {
  $q.notify({
    type: 'info',
    message: `Editar ${servico.nome}`,
    position: 'top'
  })
}

const removerServico = (servico: Servico) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: `Remover o serviço "${servico.nome}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Aqui você implementaria a lógica de remoção
    $q.notify({
      type: 'positive',
      message: 'Serviço removido',
      position: 'top'
    })
  })
}
</script>
