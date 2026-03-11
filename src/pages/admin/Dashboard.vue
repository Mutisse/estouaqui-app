<template>
  <q-page class="admin-dashboard q-pa-md">
    <!-- Cabeçalho com saudação -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 text-bold">Dashboard</div>
        <div class="text-subtitle1 text-grey-7">Bem-vindo de volta, Administrador</div>
      </div>
      <q-btn
        flat
        round
        icon="refresh"
        @click="carregarDados"
        :loading="loading"
      >
        <q-tooltip>Atualizar dados</q-tooltip>
      </q-btn>
    </div>

    <!-- Cards de estatísticas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" flat bordered>
          <q-card-section class="text-center">
            <q-icon name="people" size="40px" color="primary" />
            <div class="text-h6 q-mt-sm">Total Utilizadores</div>
            <div class="text-h3 text-bold text-primary">{{ formatNumber(stats.totalUsers) }}</div>
            <div class="text-caption text-grey-7">+12% este mês</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" flat bordered>
          <q-card-section class="text-center">
            <q-icon name="handyman" size="40px" color="secondary" />
            <div class="text-h6 q-mt-sm">Prestadores</div>
            <div class="text-h3 text-bold text-secondary">{{ formatNumber(stats.totalPrestadores) }}</div>
            <div class="text-caption text-grey-7">{{ stats.prestadoresAtivos }} ativos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" flat bordered>
          <q-card-section class="text-center">
            <q-icon name="assignment" size="40px" color="positive" />
            <div class="text-h6 q-mt-sm">Serviços Hoje</div>
            <div class="text-h3 text-bold text-positive">{{ formatNumber(stats.servicosHoje) }}</div>
            <div class="text-caption text-grey-7">{{ stats.servicosPendentes }} pendentes</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" flat bordered>
          <q-card-section class="text-center">
            <q-icon name="star" size="40px" color="yellow-8" />
            <div class="text-h6 q-mt-sm">Avaliação Média</div>
            <div class="text-h3 text-bold text-yellow-8">{{ stats.avaliacaoMedia.toFixed(1) }}</div>
            <div class="text-caption text-grey-7">{{ stats.totalAvaliacoes }} avaliações</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos e estatísticas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Atividade dos Últimos 7 Dias</div>
          </q-card-section>
          <q-card-section>
            <div class="grafico-container">
              <div class="row items-end justify-around" style="height: 200px;">
                <div v-for="(item, index) in atividadeSemanal" :key="index" class="grafico-coluna">
                  <div
                    class="coluna"
                    :style="{ height: item.altura + 'px', backgroundColor: item.cor }"
                  ></div>
                  <div class="text-caption text-center q-mt-sm">{{ item.dia }}</div>
                  <div class="text-caption text-center text-bold">{{ item.valor }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Distribuição por Tipo</div>
          </q-card-section>
          <q-card-section>
            <div class="distribuicao-container">
              <div class="row items-center q-mb-sm">
                <div class="col-6 text-grey-7">Clientes</div>
                <div class="col-6 text-right text-bold">{{ stats.totalClientes }}</div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-6 text-grey-7">Prestadores</div>
                <div class="col-6 text-right text-bold">{{ stats.totalPrestadores }}</div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-6 text-grey-7">Admins</div>
                <div class="col-6 text-right text-bold">{{ stats.totalAdmins }}</div>
              </div>
              <q-separator class="q-my-md" />
              <div class="row items-center">
                <div class="col-6 text-grey-7">Total</div>
                <div class="col-6 text-right text-bold text-primary">{{ stats.totalUsers }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Últimos utilizadores e serviços recentes -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Últimos Utilizadores</div>
            <q-btn flat dense icon="chevron_right" label="Ver todos" to="/admin/utilizadores" no-caps />
          </q-card-section>
          <q-list separator>
            <q-item v-for="user in ultimosUtilizadores" :key="user.id" clickable v-ripple>
              <q-item-section avatar>
                <q-avatar>
                  <img :src="user.avatar" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.nome }}</q-item-label>
                <q-item-label caption lines="1">{{ user.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="user.tipo === 'prestador' ? 'secondary' : 'primary'">
                  {{ user.tipo === 'prestador' ? 'Prestador' : 'Cliente' }}
                </q-badge>
                <div class="text-caption text-grey-7 q-mt-xs">{{ user.data }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Serviços Recentes</div>
            <q-btn flat dense icon="chevron_right" label="Ver todos" to="/admin/servicos" no-caps />
          </q-card-section>
          <q-list separator>
            <q-item v-for="servico in servicosRecentes" :key="servico.id" clickable v-ripple>
              <q-item-section avatar>
                <q-avatar :color="servico.statusCor" text-color="white">
                  <q-icon :name="servico.icone" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ servico.servico }}</q-item-label>
                <q-item-label caption>{{ servico.cliente }} • {{ servico.prestador }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-bold text-primary">{{ servico.valor }} MZN</div>
                <q-badge :color="servico.statusCor">{{ servico.status }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- Ações rápidas -->
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Ações Rápidas</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="primary"
                icon="person_add"
                label="Novo Admin"
                class="full-width"
                @click="novaAcao('admin')"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="secondary"
                icon="handyman"
                label="Verificar Prestador"
                class="full-width"
                @click="novaAcao('prestador')"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="positive"
                icon="category"
                label="Nova Categoria"
                class="full-width"
                @click="novaAcao('categoria')"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="warning"
                icon="receipt"
                label="Relatório"
                class="full-width"
                @click="novaAcao('relatorio')"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="info"
                icon="settings"
                label="Configurações"
                class="full-width"
                @click="novaAcao('config')"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-btn
                flat
                color="negative"
                icon="support"
                label="Suporte"
                class="full-width"
                @click="novaAcao('suporte')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'AdminDashboard'
})

const $q = useQuasar()
const loading = ref(false)

// Interface para estatísticas
interface Stats {
  totalUsers: number
  totalClientes: number
  totalPrestadores: number
  totalAdmins: number
  prestadoresAtivos: number
  servicosHoje: number
  servicosPendentes: number
  avaliacaoMedia: number
  totalAvaliacoes: number
}

// Dados mockados
const stats = ref<Stats>({
  totalUsers: 12580,
  totalClientes: 8450,
  totalPrestadores: 4120,
  totalAdmins: 10,
  prestadoresAtivos: 3890,
  servicosHoje: 234,
  servicosPendentes: 56,
  avaliacaoMedia: 4.8,
  totalAvaliacoes: 15234
})

const atividadeSemanal = ref([
  { dia: 'Seg', valor: 45, altura: 90, cor: '#667eea' },
  { dia: 'Ter', valor: 62, altura: 124, cor: '#667eea' },
  { dia: 'Qua', valor: 58, altura: 116, cor: '#667eea' },
  { dia: 'Qui', valor: 71, altura: 142, cor: '#667eea' },
  { dia: 'Sex', valor: 84, altura: 168, cor: '#667eea' },
  { dia: 'Sáb', valor: 53, altura: 106, cor: '#764ba2' },
  { dia: 'Dom', valor: 38, altura: 76, cor: '#764ba2' }
])

const ultimosUtilizadores = ref([
  { id: 1, nome: 'João Silva', email: 'joao.silva@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar.png', data: 'Hoje, 10:30' },
  { id: 2, nome: 'Maria Santos', email: 'maria.santos@email.com', tipo: 'cliente', avatar: 'https://cdn.quasar.dev/img/avatar2.jpg', data: 'Hoje, 09:15' },
  { id: 3, nome: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar3.jpg', data: 'Ontem, 16:45' },
  { id: 4, nome: 'Ana Costa', email: 'ana.costa@email.com', tipo: 'cliente', avatar: 'https://cdn.quasar.dev/img/avatar4.jpg', data: 'Ontem, 14:20' },
  { id: 5, nome: 'Carlos Mendes', email: 'carlos.mendes@email.com', tipo: 'prestador', avatar: 'https://cdn.quasar.dev/img/avatar5.jpg', data: '2 dias atrás' }
])

const servicosRecentes = ref([
  { id: 1, servico: 'Reparação elétrica', cliente: 'João Silva', prestador: 'Maria Santos', valor: 1500, status: 'Concluído', statusCor: 'positive', icone: 'bolt' },
  { id: 2, servico: 'Instalação de tomada', cliente: 'Pedro Oliveira', prestador: 'Ana Costa', valor: 800, status: 'Em andamento', statusCor: 'warning', icone: 'electrical_services' },
  { id: 3, servico: 'Limpeza residencial', cliente: 'Maria Santos', prestador: 'Carlos Mendes', valor: 1200, status: 'Pendente', statusCor: 'info', icone: 'cleaning_services' },
  { id: 4, servico: 'Pintura de parede', cliente: 'Ana Costa', prestador: 'João Silva', valor: 2000, status: 'Concluído', statusCor: 'positive', icone: 'brush' },
  { id: 5, servico: 'Troca de disjuntor', cliente: 'Carlos Mendes', prestador: 'Pedro Oliveira', valor: 950, status: 'Cancelado', statusCor: 'negative', icone: 'settings' }
])

// Métodos
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-PT').format(num)
}

// CORREÇÃO: Remover async pois não tem await
const carregarDados = () => {
  loading.value = true
  // Simular carregamento
  setTimeout(() => {
    loading.value = false
    $q.notify({
      type: 'positive',
      message: 'Dados atualizados',
      position: 'top'
    })
  }, 1000)
}

const novaAcao = (tipo: string) => {
  const acoes: Record<string, string> = {
    admin: 'Criar novo administrador',
    prestador: 'Verificar prestador pendente',
    categoria: 'Criar nova categoria',
    relatorio: 'Gerar relatório',
    config: 'Configurações do sistema',
    suporte: 'Abrir suporte'
  }
  $q.notify({
    type: 'info',
    message: acoes[tipo] || 'Ação em desenvolvimento',
    position: 'top'
  })
}

onMounted(() => {
  // Simular carregamento inicial
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  border-radius: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  }
}

.grafico-container {
  .grafico-coluna {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 60px;

    .coluna {
      width: 30px;
      border-radius: 8px 8px 0 0;
      transition: height 0.3s ease;
    }
  }
}

.distribuicao-container {
  padding: 8px;
}
</style>
