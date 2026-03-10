<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Dashboard Administrativo</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <q-icon name="people" size="40px" color="primary" />
            <div class="text-h6">Total Utilizadores</div>
            <div class="text-h4">{{ stats.totalUsers || '1,234' }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <q-icon name="handyman" size="40px" color="secondary" />
            <div class="text-h6">Prestadores</div>
            <div class="text-h4">{{ stats.totalPrestadores || '456' }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <q-icon name="assignment" size="40px" color="positive" />
            <div class="text-h6">Serviços Hoje</div>
            <div class="text-h4">{{ stats.servicosHoje || '89' }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="text-center">
            <q-icon name="star" size="40px" color="yellow" />
            <div class="text-h6">Avaliação Média</div>
            <div class="text-h4">{{ stats.avaliacaoMedia || '4.8' }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-mt-md q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Últimos Utilizadores</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="n in 5" :key="n">
              <q-item-section avatar>
                <q-avatar><q-icon name="person" /></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Utilizador {{ n }}</q-item-label>
                <q-item-label caption>Registado há {{ n }} dias</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="n % 2 === 0 ? 'primary' : 'secondary'">
                  {{ n % 2 === 0 ? 'Cliente' : 'Prestador' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Serviços Recentes</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="n in 5" :key="n">
              <q-item-section avatar>
                <q-avatar><q-icon name="assignment" /></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Serviço #{{ 1000 + n }}</q-item-label>
                <q-item-label caption>Concluído</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive">{{ n * 500 }} MZN</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

defineOptions({
  name: 'AdminDashboard'
})

interface Stats {
  totalUsers: number
  totalPrestadores: number
  servicosHoje: number
  avaliacaoMedia: number
}

const stats = ref<Stats>({
  totalUsers: 0,
  totalPrestadores: 0,
  servicosHoje: 0,
  avaliacaoMedia: 0
})

const carregarDados = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
}

onMounted(() => {
  // CORREÇÃO: Usar void para ignorar a Promise
  void carregarDados()
  // ^^^^ ADICIONADO void
})
</script>
