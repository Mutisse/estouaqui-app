<template>
  <q-page class="admin-financeiro q-pa-md">
    <div class="text-h4 q-mb-md">Financeiro</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Saldo Atual</div>
            <div class="text-h3 text-positive q-mt-md">125.580 MZN</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Pendente</div>
            <div class="text-h3 text-warning q-mt-md">23.450 MZN</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Processado (mês)</div>
            <div class="text-h3 text-primary q-mt-md">45.230 MZN</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Comissões</div>
            <div class="text-h3 text-secondary q-mt-md">4.520 MZN</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Últimas Transações</div>
            <q-table
              :rows="transacoes"
              :columns="colunas"
              row-key="id"
              :rows-per-page-options="[10, 20, 50]"
            >
              <template v-slot:body-cell-valor="props">
                <q-td :props="props">
                  <span :class="props.row.tipo === 'entrada' ? 'text-positive' : 'text-negative'">
                    {{ props.row.tipo === 'entrada' ? '+' : '-' }} {{ props.row.valor }} MZN
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="props.row.status === 'concluido' ? 'positive' : 'warning'">
                    {{ props.row.status }}
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QTableColumn } from 'quasar'

defineOptions({
  name: 'AdminFinanceiro'
})

// Tipos
interface Transacao {
  id: number
  data: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  status: 'concluido' | 'processando' | 'pendente'
}

// CORREÇÃO: Tipagem correta das colunas
const colunas: QTableColumn[] = [
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'descricao',
    label: 'Descrição',
    field: 'descricao',
    align: 'left' as const,
    sortable: false
  },
  {
    name: 'valor',
    label: 'Valor (MZN)',
    field: 'valor',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
    sortable: false
  }
]

const transacoes = ref<Transacao[]>([
  { id: 1, data: '10/03/2026', descricao: 'Serviço #1234', valor: 1500, tipo: 'entrada', status: 'concluido' },
  { id: 2, data: '09/03/2026', descricao: 'Comissão #1234', valor: 150, tipo: 'saida', status: 'concluido' },
  { id: 3, data: '08/03/2026', descricao: 'Saque - João Silva', valor: 5000, tipo: 'saida', status: 'processando' }
])
</script>
