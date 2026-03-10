<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Estatísticas</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Utilizadores por Mês</div>
          </q-card-section>
          <q-card-section>
            <div v-for="mes in meses" :key="mes.nome" class="row items-center q-mb-sm">
              <div class="col-3">{{ mes.nome }}</div>
              <div class="col-6">
                <q-linear-progress :value="mes.valor / 100" size="20px" color="primary" />
              </div>
              <div class="col-3 text-right">{{ mes.valor }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Serviços por Categoria</div>
          </q-card-section>
          <q-card-section>
            <div v-for="cat in categorias" :key="cat.nome" class="row items-center q-mb-sm">
              <div class="col-4">{{ cat.nome }}</div>
              <div class="col-6">
                <q-linear-progress :value="cat.valor / 50" size="20px" color="secondary" />
              </div>
              <div class="col-2 text-right">{{ cat.valor }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Resumo Financeiro</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-subtitle2">Receita Mensal</div>
                  <div class="text-h4 text-positive">125.500 MZN</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-subtitle2">Comissões</div>
                  <div class="text-h4 text-primary">12.550 MZN</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-subtitle2">Ticket Médio</div>
                  <div class="text-h4 text-secondary">1.450 MZN</div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AdminEstatisticas'
})

interface Mes {
  nome: string
  valor: number
}

interface Categoria {
  nome: string
  valor: number
}

const meses: Mes[] = [
  { nome: 'Janeiro', valor: 45 },
  { nome: 'Fevereiro', valor: 52 },
  { nome: 'Março', valor: 68 },
  { nome: 'Abril', valor: 72 },
  { nome: 'Maio', valor: 85 },
  { nome: 'Junho', valor: 94 }
]

const categorias: Categoria[] = [
  { nome: 'Eletricista', valor: 45 },
  { nome: 'Canalizador', valor: 32 },
  { nome: 'Limpeza', valor: 28 },
  { nome: 'Cabeleireiro', valor: 22 },
  { nome: 'Informático', valor: 18 }
]
</script>
