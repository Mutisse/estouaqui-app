<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Gestão de Utilizadores</div>

    <q-card>
      <q-card-section>
        <q-input
          v-model="search"
          placeholder="Pesquisar utilizadores..."
          dense
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :filter="search"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'positive' : 'grey'">
              {{ props.value ? 'Ativo' : 'Inativo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'prestador' ? 'secondary' : 'primary'">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acoes="props">
          <q-td :props="props">
            <q-btn flat round icon="visibility" size="sm" color="primary">
              <q-tooltip>Ver detalhes</q-tooltip>
            </q-btn>
            <q-btn flat round icon="edit" size="sm" color="secondary">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round icon="block" size="sm" color="negative">
              <q-tooltip>Bloquear</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AdminUtilizadores'  // CORREÇÃO 1: Nome com múltiplas palavras
})

import { ref } from 'vue'
import type { QTableColumn } from 'quasar'  // CORREÇÃO 2: import type

interface User {
  id: number
  nome: string
  telefone: string
  tipo: 'cliente' | 'prestador' | 'admin'
  status: boolean
}

const search = ref('')

const columns: QTableColumn[] = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true
  },
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefone',
    label: 'Telefone',
    field: 'telefone',
    align: 'left',
    sortable: false
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
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

const users = ref<User[]>([
  { id: 1, nome: 'João Silva', telefone: '+258 84 123 4567', tipo: 'cliente', status: true },
  { id: 2, nome: 'Maria Santos', telefone: '+258 82 987 6543', tipo: 'prestador', status: true },
  { id: 3, nome: 'Pedro Oliveira', telefone: '+258 86 555 1234', tipo: 'prestador', status: false },
  { id: 4, nome: 'Ana Costa', telefone: '+258 84 333 2221', tipo: 'cliente', status: true },
  { id: 5, nome: 'Carlos Mendes', telefone: '+258 87 444 5555', tipo: 'admin', status: true }
])
</script>
