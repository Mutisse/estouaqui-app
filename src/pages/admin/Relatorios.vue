<template>
  <q-page class="admin-relatorios q-pa-md">
    <div class="text-h4 q-mb-md">Relatórios</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Período</div>
            <q-select
              v-model="periodo"
              :options="periodos"
              label="Selecione"
              dense
              outlined
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-9">
        <q-card>
          <q-card-section>
            <div class="text-h6">Resumo do Período</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-4">
                <div class="text-center">
                  <div class="text-grey-7">Receita Total</div>
                  <div class="text-h4 text-positive">125.500 MZN</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center">
                  <div class="text-grey-7">Serviços</div>
                  <div class="text-h4">234</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center">
                  <div class="text-grey-7">Novos Utilizadores</div>
                  <div class="text-h4">56</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <q-tabs v-model="tabRelatorio" class="text-primary">
              <q-tab name="servicos" label="Serviços" />
              <q-tab name="prestadores" label="Prestadores" />
              <q-tab name="financeiro" label="Financeiro" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tabRelatorio" animated>
              <q-tab-panel name="servicos">
                <q-btn color="primary" icon="download" label="Exportar" flat @click="exportarRelatorio" />
                <!-- Tabela de serviços -->
              </q-tab-panel>

              <q-tab-panel name="prestadores">
                <q-btn color="primary" icon="download" label="Exportar" flat @click="exportarRelatorio" />
                <!-- Tabela de prestadores -->
              </q-tab-panel>

              <q-tab-panel name="financeiro">
                <q-btn color="primary" icon="download" label="Exportar" flat @click="exportarRelatorio" />
                <!-- Tabela financeira -->
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'AdminRelatorios'
})

const $q = useQuasar()
const periodo = ref('mes')
const tabRelatorio = ref('servicos')

const periodos = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mês', value: 'mes' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Personalizado', value: 'custom' }
]

const exportarRelatorio = () => {
  $q.notify({
    type: 'positive',
    message: 'Relatório exportado com sucesso',
    position: 'top'
  })
}
</script>
