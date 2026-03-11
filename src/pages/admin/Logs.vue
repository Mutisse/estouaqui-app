<template>
  <q-page class="admin-logs q-pa-md">
    <div class="text-h4 q-mb-md">Logs do Sistema</div>

    <q-card>
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-select
            v-model="nivel"
            :options="['Todos', 'Info', 'Aviso', 'Erro']"
            label="Nível"
            dense
            outlined
            class="col-3"
          />
          <q-input
            v-model="data"
            label="Data"
            dense
            outlined
            class="col-3"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="data" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn color="primary" icon="search" label="Filtrar" class="col-2" />
          <q-btn color="secondary" icon="download" label="Exportar" flat class="col-2" />
        </div>
      </q-card-section>

      <q-table
        :rows="logs"
        :columns="colunas"
        row-key="id"
        :rows-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:body-cell-nivel="props">
          <q-td :props="props">
            <q-badge :color="getNivelCor(props.row.nivel)">
              {{ props.row.nivel }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QTableColumn } from 'quasar'  // CORREÇÃO: import type

defineOptions({
  name: 'AdminLogs'
})

// Tipos
interface LogEntry {
  id: number
  data: string
  nivel: string
  usuario: string
  acao: string
  ip: string
}

const nivel = ref('Todos')
const data = ref('')

// CORREÇÃO: Tipagem correta das colunas
const colunas: QTableColumn[] = [
  {
    name: 'data',
    label: 'Data/Hora',
    field: 'data',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'nivel',
    label: 'Nível',
    field: 'nivel',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'usuario',
    label: 'Usuário',
    field: 'usuario',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'acao',
    label: 'Ação',
    field: 'acao',
    align: 'left' as const,
    sortable: false
  },
  {
    name: 'ip',
    label: 'IP',
    field: 'ip',
    align: 'center' as const,
    sortable: false
  }
]

const logs = ref<LogEntry[]>([
  { id: 1, data: '10/03/2026 14:23:45', nivel: 'Info', usuario: 'admin@estouaqui.co.mz', acao: 'Login realizado', ip: '192.168.1.100' },
  { id: 2, data: '10/03/2026 13:15:22', nivel: 'Aviso', usuario: 'sistema', acao: 'Tentativa de acesso negado', ip: '192.168.1.105' },
  { id: 3, data: '10/03/2026 10:05:11', nivel: 'Erro', usuario: 'joao.silva@email.com', acao: 'Falha no pagamento', ip: '192.168.1.110' }
])

const getNivelCor = (nivel: string) => {
  switch (nivel) {
    case 'Info': return 'info'
    case 'Aviso': return 'warning'
    case 'Erro': return 'negative'
    default: return 'grey'
  }
}
</script>
