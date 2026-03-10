<template>
  <q-page class="inicio-page bg-grey-1">
    <!-- Saudação do usuário -->
    <div class="greeting-section q-pa-md">
      <div class="greeting">
        <span class="greeting-text">Olá,</span>
        <span class="user-name">{{ userName }}</span>
      </div>
      <div class="date">{{ currentDate }}</div>
    </div>

    <!-- Resumo de atividades -->
    <div class="summary-cards q-px-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-4">
          <div class="summary-card">
            <q-icon name="assignment" size="20px" color="primary" />
            <div class="summary-value">{{ resumo.pedidosAtivos }}</div>
            <div class="summary-label">Pedidos ativos</div>
          </div>
        </div>
        <div class="col-4">
          <div class="summary-card">
            <q-icon name="chat" size="20px" color="secondary" />
            <div class="summary-value">{{ resumo.mensagensNaoLidas }}</div>
            <div class="summary-label">Mensagens</div>
          </div>
        </div>
        <div class="col-4">
          <div class="summary-card">
            <q-icon name="favorite" size="20px" color="red" />
            <div class="summary-value">{{ resumo.favoritos }}</div>
            <div class="summary-label">Favoritos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Serviços em destaque -->
    <div class="section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Serviços em destaque</div>
        <q-btn
          flat
          dense
          label="Ver todos"
          class="section-link"
          to="/mobile/lista-prestadores"
          no-caps
        />
      </div>

      <div class="row q-col-gutter-sm">
        <div v-for="servico in servicosDestaque" :key="servico.id" class="col-6">
          <q-card class="service-card" flat bordered @click="verPrestador(servico.prestadorId)">
            <q-img :src="servico.imagem" height="100px" />
            <q-card-section class="q-pa-sm">
              <div class="service-title">{{ servico.titulo }}</div>
              <div class="service-provider">{{ servico.prestador }}</div>
              <div class="service-rating">
                <q-rating v-model="servico.rating" size="14px" :max="5" color="yellow" readonly />
                <span class="rating-count">({{ servico.avaliacoes }})</span>
              </div>
              <div class="service-price">{{ servico.preco }} MZN</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Promoções -->
    <div class="section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Promoções especiais</div>
        <q-btn flat dense label="Ver todas" class="section-link" to="/mobile/promocoes" no-caps />
      </div>

      <q-card class="promo-card" flat bordered>
        <q-card-section class="row items-center">
          <div class="col-8">
            <div class="promo-title">Primeiro serviço com 20% OFF</div>
            <div class="promo-subtitle">Use o cupom: BEMVINDO20</div>
          </div>
          <div class="col-4">
            <q-btn color="positive" label="Usar" size="sm" unelevated />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Prestadores mais bem avaliados -->
    <div class="section q-px-md q-mb-md">
      <div class="section-header">
        <div class="section-title">Prestadores mais avaliados</div>
        <q-btn
          flat
          dense
          label="Ver todos"
          class="section-link"
          to="/mobile/lista-prestadores"
          no-caps
        />
      </div>

      <div class="row q-col-gutter-sm">
        <div v-for="prestador in prestadoresTop" :key="prestador.id" class="col-12">
          <q-card class="provider-card" flat bordered @click="verPrestador(prestador.id)">
            <q-card-section class="row items-center q-pa-sm">
              <q-avatar size="50px" class="q-mr-sm">
                <img :src="prestador.avatar" />
              </q-avatar>
              <div class="col">
                <div class="provider-name">{{ prestador.nome }}</div>
                <div class="provider-category">{{ prestador.categoria }}</div>
                <div class="provider-rating">
                  <q-rating
                    v-model="prestador.rating"
                    size="14px"
                    :max="5"
                    color="yellow"
                    readonly
                  />
                  <span class="rating-count">({{ prestador.avaliacoes }})</span>
                </div>
              </div>
              <div class="provider-price">{{ prestador.preco }} MZN</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

defineOptions({
  name: 'MobileInicio',
});

const router = useRouter();
const authStore = useAuthStore();

const userName = computed(() => {
  return authStore.user?.nome?.split(' ')[0] || 'Utilizador';
});

const currentDate = new Date().toLocaleDateString('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

// Interfaces para tipagem
interface ServicoDestaque {
  id: number;
  titulo: string;
  prestador: string;
  prestadorId: number;
  imagem: string;
  rating: number;
  avaliacoes: number;
  preco: number;
}

interface PrestadorTop {
  id: number;
  nome: string;
  avatar: string;
  categoria: string;
  rating: number;
  avaliacoes: number;
  preco: number;
}

interface Resumo {
  pedidosAtivos: number;
  mensagensNaoLidas: number;
  favoritos: number;
}

// Dados mockados com tipagem
const resumo = ref<Resumo>({
  pedidosAtivos: 2,
  mensagensNaoLidas: 3,
  favoritos: 8,
});

const servicosDestaque = ref<ServicoDestaque[]>([
  {
    id: 1,
    titulo: 'Reparação elétrica',
    prestador: 'João Silva',
    prestadorId: 101,
    imagem: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200',
    rating: 4.8,
    avaliacoes: 23,
    preco: 1500,
  },
  {
    id: 2,
    titulo: 'Limpeza residencial',
    prestador: 'Maria Santos',
    prestadorId: 102,
    imagem: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200',
    rating: 4.9,
    avaliacoes: 45,
    preco: 1200,
  },
  {
    id: 3,
    titulo: 'Canalização',
    prestador: 'Pedro Oliveira',
    prestadorId: 103,
    imagem: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200',
    rating: 4.7,
    avaliacoes: 18,
    preco: 1800,
  },
  {
    id: 4,
    titulo: 'Pintura',
    prestador: 'Ana Costa',
    prestadorId: 104,
    imagem: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200',
    rating: 5.0,
    avaliacoes: 12,
    preco: 2000,
  },
]);

const prestadoresTop = ref<PrestadorTop[]>([
  {
    id: 101,
    nome: 'João Silva',
    avatar: 'https://cdn.quasar.dev/img/avatar.png',
    categoria: 'Eletricista',
    rating: 4.9,
    avaliacoes: 87,
    preco: 1500,
  },
  {
    id: 102,
    nome: 'Maria Santos',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    categoria: 'Limpeza',
    rating: 4.8,
    avaliacoes: 92,
    preco: 1200,
  },
  {
    id: 103,
    nome: 'Pedro Oliveira',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    categoria: 'Canalizador',
    rating: 4.9,
    avaliacoes: 76,
    preco: 1800,
  },
]);

// CORREÇÃO: Adicionar void para ignorar a Promise
const verPrestador = (id: number) => {
  void router.push(`/mobile/perfil-prestador/${id}`);
};
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
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

.inicio-page {
  padding-bottom: 16px;
}

/* Saudação */
.greeting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;

  .greeting-text {
    font-size: 1.2rem;
    color: $gray-600;
    margin-right: 5px;
  }

  .user-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-900;
  }

  .date {
    font-size: 0.8rem;
    color: $gray-500;
  }
}

/* Cards de resumo */
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid $gray-200;

  .summary-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-800;
    margin: 4px 0;
  }

  .summary-label {
    font-size: 0.7rem;
    color: $gray-500;
  }
}

/* Seções */
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

/* Cards de serviços */
.service-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;

  .service-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .service-provider {
    font-size: 0.75rem;
    color: $gray-600;
    margin: 2px 0;
  }

  .service-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px 0;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }

  .service-price {
    font-size: 0.9rem;
    font-weight: 700;
    color: $purple-primary;
    margin-top: 4px;
  }
}

/* Card de promoção */
.promo-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff2d9 100%);
  border-color: #ffd700;

  .promo-title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .promo-subtitle {
    font-size: 0.8rem;
    color: $gray-600;
  }
}

/* Cards de prestadores */
.provider-card {
  border-radius: 12px;
  margin-bottom: 8px;

  .provider-name {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .provider-category {
    font-size: 0.8rem;
    color: $gray-600;
  }

  .provider-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }

  .provider-price {
    font-size: 1rem;
    font-weight: 700;
    color: $purple-primary;
    min-width: 70px;
    text-align: right;
  }
}
</style>
