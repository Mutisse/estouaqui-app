<template>
  <q-page class="prestador-dashboard bg-grey-1">
    <!-- Cabeçalho com saudação -->
    <div class="header-greeting q-pa-md">
      <div>
        <div class="greeting-small">Bem-vindo de volta,</div>
        <div class="greeting-name">{{ prestadorNome }}</div>
      </div>
    </div>

    <!-- Cards de resumo -->
    <div class="summary-cards q-px-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-card class="summary-card" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="pending_actions" size="32px" color="primary" />
              <div class="summary-value">{{ resumo.pedidosPendentes }}</div>
              <div class="summary-label">Pedidos pendentes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="summary-card" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="32px" color="positive" />
              <div class="summary-value">{{ resumo.servicosHoje }}</div>
              <div class="summary-label">Serviços hoje</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="summary-card" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="star" size="32px" color="yellow" />
              <div class="summary-value">{{ resumo.avaliacaoMedia }}</div>
              <div class="summary-label">Avaliação média</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="summary-card" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="payments" size="32px" color="secondary" />
              <div class="summary-value">{{ resumo.ganhosMes }} MZN</div>
              <div class="summary-label">Ganhos do mês</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Próximos serviços -->
    <div class="section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Próximos serviços</div>
        <q-btn flat dense label="Ver todos" class="section-link" to="/mobile/prestador/agenda" no-caps />
      </div>

      <q-list bordered separator>
        <q-item
          v-for="servico in proximosServicos"
          :key="servico.id"
          clickable
          v-ripple
          @click="verServico(servico.id)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="servico.clienteAvatar" :alt="servico.cliente">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ servico.cliente }}</q-item-label>
            <q-item-label caption>
              <q-icon name="schedule" size="14px" /> {{ servico.horario }}
            </q-item-label>
            <q-item-label caption class="text-primary">
              {{ servico.servico }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge :color="servico.status === 'confirmado' ? 'positive' : 'warning'">
              {{ servico.status }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Ações rápidas -->
    <div class="quick-actions q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Ações rápidas</div>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-card class="action-card" flat bordered @click="irPara('disponibilidade')">
            <q-card-section class="text-center">
              <q-icon name="schedule" size="32px" color="primary" />
              <div class="action-label">Definir disponibilidade</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="action-card" flat bordered @click="irPara('servicos')">
            <q-card-section class="text-center">
              <q-icon name="construction" size="32px" color="secondary" />
              <div class="action-label">Gerir serviços</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="action-card" flat bordered @click="irPara('portfolio')">
            <q-card-section class="text-center">
              <q-icon name="photo_library" size="32px" color="positive" />
              <div class="action-label">Portfólio</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="action-card" flat bordered @click="irPara('precos')">
            <q-card-section class="text-center">
              <q-icon name="attach_money" size="32px" color="warning" />
              <div class="action-label">Definir preços</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Avaliações recentes -->
    <div class="section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Avaliações recentes</div>
        <q-btn flat dense label="Ver todas" class="section-link" to="/mobile/prestador/avaliacoes" no-caps />
      </div>

      <q-list bordered separator>
        <q-item v-for="avaliacao in avaliacoesRecentes" :key="avaliacao.id">
          <q-item-section avatar>
            <q-avatar>
              <img :src="avaliacao.clienteAvatar" :alt="avaliacao.cliente">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ avaliacao.cliente }}</q-item-label>
            <q-item-label caption>
              <q-rating v-model="avaliacao.nota" size="14px" :max="5" color="yellow" readonly />
              <span class="q-ml-xs">{{ avaliacao.data }}</span>
            </q-item-label>
            <q-item-label caption lines="2">
              "{{ avaliacao.comentario }}"
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

defineOptions({
  name: 'PrestadorDashboard'
})

const router = useRouter()
const authStore = useAuthStore()

const prestadorNome = ref(authStore.user?.nome || 'João Silva')

// Dados mockados
const resumo = ref({
  pedidosPendentes: 3,
  servicosHoje: 2,
  avaliacaoMedia: 4.8,
  ganhosMes: 12500
})

const proximosServicos = ref([
  {
    id: 1,
    cliente: 'Maria Santos',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    horario: 'Hoje, 14:30',
    servico: 'Reparação elétrica',
    status: 'confirmado'
  },
  {
    id: 2,
    cliente: 'Pedro Oliveira',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    horario: 'Hoje, 16:00',
    servico: 'Instalação de tomada',
    status: 'pendente'
  },
  {
    id: 3,
    cliente: 'Ana Costa',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    horario: 'Amanhã, 09:30',
    servico: 'Troca de disjuntor',
    status: 'confirmado'
  }
])

const avaliacoesRecentes = ref([
  {
    id: 1,
    cliente: 'Carlos Mendes',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    nota: 5,
    data: '2 dias atrás',
    comentario: 'Excelente profissional, muito atencioso e pontual.'
  },
  {
    id: 2,
    cliente: 'Sofia Rodrigues',
    clienteAvatar: 'https://cdn.quasar.dev/img/avatar6.jpg',
    nota: 4,
    data: '5 dias atrás',
    comentario: 'Bom trabalho, recomendo.'
  }
])

const verServico = (id: number) => {
  void router.push(`/mobile/prestador/pedidos/${id}`)
}

const irPara = (rota: string) => {
  void router.push(`/mobile/prestador/${rota}`)
}
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.prestador-dashboard {
  min-height: 100vh;
}

.header-greeting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;

  .greeting-small {
    font-size: 0.9rem;
    color: $gray-600;
  }

  .greeting-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: $gray-900;
  }
}

.summary-card {
  border-radius: 12px;

  .summary-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-800;
    margin: 8px 0 4px;
  }

  .summary-label {
    font-size: 0.8rem;
    color: $gray-600;
  }
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .section-link {
    color: $purple-primary;
    font-size: 0.8rem;
  }
}

.action-card {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .action-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: $gray-700;
    margin-top: 8px;
  }
}
</style>
