<template>
  <q-page class="admin-logs q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="receipt" size="32px" class="q-mr-sm" />
          Logs do Sistema
        </div>
        <div class="page-subtitle">Registro de atividades e eventos do sistema</div>
      </div>
      <q-btn
        label="Atualizar"
        icon="refresh"
        color="grey-7"
        outline
        @click="carregarLogs"
        :loading="adminStore.loading"
      />
    </div>

    <q-card class="logs-card">
      <q-card-section>
        <div class="row q-gutter-sm items-end">
          <q-select
            v-model="filtros.nivel"
            :options="nivelOptions"
            label="Nível"
            dense
            outlined
            clearable
            class="col-12 col-md-2"
            @update:model-value="aplicarFiltros"
          />
          <q-input
            v-model="filtros.data"
            label="Data"
            dense
            outlined
            class="col-12 col-md-2"
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filtros.data" @update:model-value="aplicarFiltros" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="filtros.usuario"
            label="Usuário"
            dense
            outlined
            clearable
            class="col-12 col-md-3"
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input
            v-model="filtros.acao"
            label="Ação"
            dense
            outlined
            clearable
            class="col-12 col-md-3"
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <div class="col-12 col-md-1">
            <q-btn
              color="primary"
              icon="search"
              label="Filtrar"
              dense
              @click="aplicarFiltros"
              class="full-width"
            />
          </div>
          <div class="col-12 col-md-1">
            <q-btn
              color="secondary"
              icon="download"
              label="Exportar"
              flat
              dense
              @click="exportarLogs"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="stats-section" v-if="logsFiltrados.length > 0">
        <div class="row q-gutter-sm">
          <q-chip size="sm" color="info" text-color="white" icon="info">
            Info: {{ contarPorNivel('Info') }}
          </q-chip>
          <q-chip size="sm" color="warning" text-color="white" icon="warning">
            Aviso: {{ contarPorNivel('Aviso') }}
          </q-chip>
          <q-chip size="sm" color="negative" text-color="white" icon="error">
            Erro: {{ contarPorNivel('Erro') }}
          </q-chip>
          <q-chip size="sm" color="grey" text-color="white" icon="receipt">
            Total: {{ logsFiltrados.length }}
          </q-chip>
        </div>
      </q-card-section>

      <q-table
        :rows="logsFiltrados"
        :columns="colunas"
        row-key="id"
        :loading="adminStore.loading"
        :rows-per-page-options="[10, 20, 50, 100]"
        class="logs-table"
      >
        <template v-slot:body-cell-data="props">
          <q-td :props="props">
            <div class="data-cell">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              {{ formatarData(props.row.data) }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-nivel="props">
          <q-td :props="props">
            <q-badge :color="getNivelCor(props.row.nivel)" class="nivel-badge">
              <q-icon :name="getNivelIcon(props.row.nivel)" size="12px" class="q-mr-xs" />
              {{ props.row.nivel }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-usuario="props">
          <q-td :props="props">
            <div class="usuario-cell">
              <q-icon name="person" size="14px" class="q-mr-xs" />
              {{ props.row.usuario }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-acao="props">
          <q-td :props="props">
            <div class="acao-cell">
              <span>{{ props.row.acao }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-ip="props">
          <q-td :props="props">
            <q-chip size="sm" dense :color="getIpCor(props.row.ip)" text-color="white">
              {{ props.row.ip }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-center q-pa-md">
            <q-icon name="receipt" size="48px" color="grey" />
            <div class="text-subtitle1 q-mt-sm">Nenhum log encontrado</div>
            <div class="text-caption text-grey">Tente ajustar os filtros ou verifique se há logs registrados</div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'

defineOptions({
  name: 'AdminLogs'
})

const $q = useQuasar()
const adminStore = useAdminStore()

// Filtros
const filtros = ref({
  nivel: null as string | null,
  data: '',
  usuario: '',
  acao: ''
})

// Opções de nível
const nivelOptions = [
  { label: 'Info', value: 'Info' },
  { label: 'Aviso', value: 'Aviso' },
  { label: 'Erro', value: 'Erro' }
]

// Logs filtrados
const logsFiltrados = computed(() => {
  let logs = adminStore.logs

  if (filtros.value.nivel) {
    logs = logs.filter(log => log.nivel === filtros.value.nivel)
  }

  if (filtros.value.data) {
    logs = logs.filter(log => log.data.includes(filtros.value.data))
  }

  if (filtros.value.usuario) {
    logs = logs.filter(log =>
      log.usuario.toLowerCase().includes(filtros.value.usuario.toLowerCase())
    )
  }

  if (filtros.value.acao) {
    logs = logs.filter(log =>
      log.acao.toLowerCase().includes(filtros.value.acao.toLowerCase())
    )
  }

  return logs
})

// Contar por nível
const contarPorNivel = (nivel: string) => {
  return logsFiltrados.value.filter(log => log.nivel === nivel).length
}

// Formatar data
const formatarData = (data: string) => {
  if (!data) return '-'
  try {
    return new Date(data).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return data
  }
}

// Cor do nível
const getNivelCor = (nivel: string) => {
  switch (nivel) {
    case 'Info': return 'info'
    case 'Aviso': return 'warning'
    case 'Erro': return 'negative'
    default: return 'grey'
  }
}

// Ícone do nível
const getNivelIcon = (nivel: string) => {
  switch (nivel) {
    case 'Info': return 'info'
    case 'Aviso': return 'warning'
    case 'Erro': return 'error'
    default: return 'receipt'
  }
}

// Cor do IP
const getIpCor = (ip: string) => {
  if (ip.includes('192.168') || ip.includes('10.') || ip.includes('172.')) {
    return 'positive'
  }
  return 'primary'
}

// Colunas da tabela
const colunas: QTableColumn[] = [
  {
    name: 'data',
    label: 'Data/Hora',
    field: 'data',
    align: 'left',
    sortable: true
  },
  {
    name: 'nivel',
    label: 'Nível',
    field: 'nivel',
    align: 'center',
    sortable: true
  },
  {
    name: 'usuario',
    label: 'Usuário',
    field: 'usuario',
    align: 'left',
    sortable: true
  },
  {
    name: 'acao',
    label: 'Ação',
    field: 'acao',
    align: 'left',
    sortable: false
  },
  {
    name: 'ip',
    label: 'IP',
    field: 'ip',
    align: 'center',
    sortable: false
  }
]

// Carregar logs
const carregarLogs = async () => {
  try {
    await adminStore.fetchLogs()
    $q.notify({
      type: 'positive',
      message: 'Logs atualizados com sucesso!',
      position: 'top',
      timeout: 2000
    })
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar logs',
      position: 'top'
    })
  }
}

// Aplicar filtros
const aplicarFiltros = () => {
  $q.notify({
    type: 'info',
    message: 'Filtros aplicados',
    position: 'top',
    timeout: 1500
  })
}

// Exportar logs
const exportarLogs = () => {
  if (logsFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Não há logs para exportar',
      position: 'top'
    })
    return
  }

  const dados = logsFiltrados.value.map(log => ({
    Data: formatarData(log.data),
    Nível: log.nivel,
    Usuário: log.usuario,
    Ação: log.acao,
    IP: log.ip
  }))

  if (dados.length === 0 || !dados[0]) {
    $q.notify({
      type: 'warning',
      message: 'Não há dados para exportar',
      position: 'top'
    })
    return
  }

  const headers = Object.keys(dados[0]) as (keyof typeof dados[0])[]

  const csv = [
    headers.join(','),
    ...dados.map(row => headers.map(header => row[header]).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.setAttribute('download', `logs_${new Date().toISOString().slice(0, 19)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: `${dados.length} logs exportados com sucesso!`,
    position: 'top'
  })
}

// Carregar dados ao montar
onMounted(() => {
  void carregarLogs()
})
</script>

<style scoped lang="scss">
.admin-logs {
  max-width: 1400px;
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
}

.logs-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.stats-section {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.logs-table {
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

.data-cell {
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.85rem;
}

.nivel-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.usuario-cell {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.acao-cell {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .admin-logs {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .acao-cell {
    max-width: 200px;
  }
}
</style>
