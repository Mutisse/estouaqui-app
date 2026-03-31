<template>
  <q-page class="inicio-page bg-grey-1">
    <!-- Loading inicial -->
    <div v-if="carregandoInicial" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar a sua página inicial...</p>
    </div>

    <template v-else>
      <!-- Saudação do usuário com foto -->
      <div class="greeting-section q-pa-md">
        <div class="greeting">
          <q-avatar size="48px" class="q-mr-sm">
            <img :src="authStore.userFoto || defaultAvatar" />
          </q-avatar>
          <div>
            <span class="greeting-text">Olá,</span>
            <span class="user-name">{{ userName }}</span>
            <div class="user-badge" v-if="authStore.isCliente">
              <q-icon name="check_circle" size="14px" color="positive" />
              <span>Cliente verificado</span>
            </div>
          </div>
        </div>
        <div class="date">{{ currentDate }}</div>
      </div>

      <!-- Stats Cards -->
      <div class="summary-cards q-px-md q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/meus-pedidos')">
              <q-icon name="assignment" size="20px" color="primary" />
              <div class="summary-value">{{ clienteStore.dashboard.pedidos_pendentes || 0 }}</div>
              <div class="summary-label">Pedidos ativos</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/notificacoes')">
              <q-icon name="chat" size="20px" color="secondary" />
              <div class="summary-value">{{ notificacoesNaoLidas }}</div>
              <div class="summary-label">Notificações</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/favoritos')">
              <q-icon name="favorite" size="20px" color="red" />
              <div class="summary-value">{{ clienteStore.dashboard.favoritos_count || 0 }}</div>
              <div class="summary-label">Favoritos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner promocional -->
      <div class="section q-px-md q-mb-md">
        <div class="promo-banner" @click="verPromocao">
          <div class="promo-banner-content">
            <q-icon name="emoji_people" size="32px" color="white" />
            <div>
              <div class="promo-banner-title">Ganhe 500 MZN</div>
              <div class="promo-banner-subtitle">Indique um amigo e ganhe bónus</div>
            </div>
            <q-btn flat dense label="Saber mais" text-color="white" />
          </div>
        </div>
      </div>

      <!-- Categorias populares (dados do store) -->
      <div class="section q-px-md q-mb-md" v-if="categoriasPopulares.length > 0">
        <div class="section-header">
          <div class="section-title">Categorias populares</div>
          <q-btn
            flat
            dense
            label="Ver todas"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>
        <div class="row q-col-gutter-sm">
          <div
            v-for="categoria in categoriasPopulares.slice(0, 4)"
            :key="categoria.id"
            class="col-3"
          >
            <div class="category-card" @click="buscarPorCategoria(categoria.id)">
              <q-icon
                :name="categoria.icone || 'category'"
                size="28px"
                :color="categoria.cor || 'primary'"
              />
              <div class="category-name">{{ categoria.nome }}</div>
              <div class="category-count">{{ categoria.servicos_count || 0 }} serviços</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prestadores em destaque -->
      <div class="section q-px-md q-mb-md" v-if="prestadoresDestaque.length > 0">
        <div class="section-header">
          <div class="section-title">Prestadores em destaque</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>

        <div v-if="clienteStore.loading" class="text-center q-py-md">
          <q-spinner color="primary" size="40px" />
        </div>
        <div v-else class="row q-col-gutter-sm">
          <div v-for="prestador in prestadoresDestaque" :key="prestador.id" class="col-6">
            <q-card class="service-card" flat bordered @click="verPrestador(prestador.id)">
              <q-img :src="prestador.foto || defaultImage" height="100px" />
              <q-card-section class="q-pa-sm">
                <div class="service-title">{{ prestador.nome }}</div>
                <div class="service-provider">
                  {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
                </div>
                <div class="service-rating">
                  <q-rating
                    :model-value="prestador.media_avaliacao || 0"
                    size="14px"
                    :max="5"
                    color="yellow"
                    readonly
                  />
                  <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Promoções (carrossel - DADOS REAIS DO STORE) -->
      <div class="section q-px-md q-mb-md" v-if="promocoesReais.length > 0">
        <div class="section-header">
          <div class="section-title">Promoções especiais</div>
          <q-btn flat dense label="Ver todas" class="section-link" to="/mobile/promocoes" no-caps />
        </div>

        <div class="promo-slider">
          <q-carousel
            v-model="promoSlide"
            animated
            navigation
            padding
            arrows
            height="130px"
            class="rounded-borders"
          >
            <q-carousel-slide
              v-for="(promo, index) in promocoesReais"
              :key="index"
              :name="index"
              class="no-padding"
            >
              <div class="promo-card-slide" :style="getPromoGradient(promo)">
                <div class="promo-slide-content">
                  <div class="promo-info">
                    <div class="promo-title">{{ promo.titulo }}</div>
                    <div class="promo-subtitle">{{ promo.descricao }}</div>
                    <div class="promo-code" v-if="promo.codigo">
                      <q-icon name="content_copy" size="12px" />
                      Cupom: {{ promo.codigo }}
                    </div>
                    <div class="promo-validity" v-if="promo.validade">
                      <q-icon name="event" size="10px" />
                      Válido até {{ formatDate(promo.validade) }}
                    </div>
                  </div>
                  <q-btn
                    :label="
                      promo.tipo_desconto === 'percentual'
                        ? `${promo.valor_desconto}% OFF`
                        : formatMoney(promo.valor_desconto) + ' OFF'
                    "
                    size="sm"
                    unelevated
                    color="white"
                    text-color="primary"
                    @click.stop="usarPromocao(promo)"
                  />
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <!-- Prestadores mais bem avaliados -->
      <div class="section q-px-md q-mb-md" v-if="prestadoresTop.length > 0">
        <div class="section-header">
          <div class="section-title">Top prestadores</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>

        <div v-if="clienteStore.loading" class="text-center q-py-md">
          <q-spinner color="primary" size="40px" />
        </div>
        <div v-else>
          <div
            v-for="prestador in prestadoresTop"
            :key="prestador.id"
            class="provider-card"
            @click="verPrestador(prestador.id)"
          >
            <div class="provider-item">
              <q-avatar size="50px" class="q-mr-sm">
                <img
                  :src="
                    prestador.foto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome)}&background=667eea&color=fff`
                  "
                />
              </q-avatar>
              <div class="provider-info">
                <div class="provider-name">{{ prestador.nome }}</div>
                <div class="provider-category">
                  {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
                </div>
                <div class="provider-rating">
                  <q-rating
                    :model-value="prestador.media_avaliacao || 0"
                    size="14px"
                    :max="5"
                    color="yellow"
                    readonly
                  />
                  <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Últimos pedidos (se houver) -->
      <div class="section q-px-md q-mb-md" v-if="ultimosPedidos.length > 0">
        <div class="section-header">
          <div class="section-title">Seus últimos pedidos</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/meus-pedidos"
            no-caps
          />
        </div>
        <div
          v-for="pedido in ultimosPedidos"
          :key="pedido.id"
          class="recent-order-card"
          @click="verPedido(pedido.id)"
        >
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <q-icon name="receipt" color="primary" />
            </q-avatar>
            <div class="col">
              <div class="order-number">Pedido #{{ pedido.numero }}</div>
              <div class="order-status" :class="pedido.status">
                {{ getStatusTexto(pedido.status) }}
              </div>
            </div>
            <div class="order-price">{{ formatMoney(pedido.valor) }}</div>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há dados -->
      <div
        v-if="!prestadoresDestaque.length && !prestadoresTop.length && !ultimosPedidos.length"
        class="empty-state q-pa-xl text-center"
      >
        <q-icon name="info" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Bem-vindo ao EstouAqui!</div>
        <div class="text-grey-6">
          Explore os serviços disponíveis e encontre os melhores prestadores.
        </div>
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Explorar serviços"
          to="/mobile/lista-prestadores"
        />
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useClienteStore, type CategoriaData } from 'src/stores/cliente-store';
import { usePromocaoStore, type PromocaoData } from 'src/stores/promocao-store';

defineOptions({
  name: 'MobileInicio',
});

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const clienteStore = useClienteStore();
const promocaoStore = usePromocaoStore();

const defaultImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';
const defaultAvatar = 'https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=48';

// Estados
const carregandoInicial = ref(true);
const promoSlide = ref(0);
const categoriasCarregadas = ref<CategoriaData[]>([]);

// Computed com dados reais do store
const categoriasPopulares = computed(() => {
  return categoriasCarregadas.value || [];
});

// ✅ PROMOÇÕES REAIS DO STORE (SEM MOCKS)
const promocoesReais = computed(() => {
  return promocaoStore.promocoes || [];
});

const ultimosPedidos = computed(() => {
  const pedidos = clienteStore.pedidos || [];
  return pedidos.slice(0, 3);
});

const userName = computed(() => {
  return authStore.user?.nome?.split(' ')[0] || 'Utilizador';
});

const currentDate = new Date().toLocaleDateString('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const notificacoesNaoLidas = computed(() => {
  const notificacoes = clienteStore.notificacoes;
  if (Array.isArray(notificacoes)) {
    return notificacoes.filter((n: { lida: boolean }) => !n.lida).length;
  }
  return 0;
});

const prestadoresDestaque = computed(() => {
  const prestadores = clienteStore.prestadoresDestaque;
  if (Array.isArray(prestadores)) {
    return prestadores.slice(0, 4);
  }
  return [];
});

const prestadoresTop = computed(() => {
  const prestadores = clienteStore.prestadoresTop;
  if (Array.isArray(prestadores)) {
    return prestadores.slice(0, 3);
  }
  return [];
});

// Funções auxiliares
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusTexto = (status: string) => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return statusMap[status] || status;
};

const getPromoGradient = (promo: PromocaoData) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ];
  return { background: gradients[(promo.id || 0) % gradients.length] };
};

const verPrestador = (id: number) => {
  if (id) {
    void router.push(`/mobile/perfil-prestador/${id}`);
  }
};

const verPedido = (id: number) => {
  void router.push(`/mobile/detalhes-pedido/${id}`);
};

const buscarPorCategoria = (id: number) => {
  void router.push(`/mobile/lista-prestadores?categoria=${id}`);
};

const verPromocao = () => {
  void router.push('/mobile/promocoes');
};

const usarPromocao = async (promo: PromocaoData) => {
  const result = await promocaoStore.validarCupom(promo.codigo);
  if (result) {
    $q.notify({
      type: 'positive',
      message: `Cupom ${promo.codigo} aplicado com sucesso!`,
      position: 'top',
    });
  }
};

const goTo = (path: string) => {
  void router.push(path);
};

// Carregar dados
const carregarDados = async () => {
  carregandoInicial.value = true;

  try {
    await Promise.all([
      clienteStore.fetchDashboard(),
      clienteStore.fetchPedidos(),
      clienteStore.fetchPrestadoresTop(),
      clienteStore.fetchPrestadoresDestaque(),
      clienteStore.fetchNotificacoes(),
      clienteStore.fetchFavoritos(),
      promocaoStore.fetchPromocoes(), // ✅ CARREGA PROMOÇÕES REAIS
    ]);

    const categorias = await clienteStore.fetchCategorias();
    if (categorias && categorias.length > 0) {
      categoriasCarregadas.value = categorias;
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados. Tente novamente.',
      position: 'top',
    });
  } finally {
    carregandoInicial.value = false;
  }
};

onMounted(() => {
  void carregarDados();
});
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
  background: $gray-100;
  min-height: 100vh;
}

/* Saudação */
.greeting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  background: white;

  .greeting {
    display: flex;
    align-items: center;
  }

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

  .user-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: $gray-600;
    margin-top: 2px;
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
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

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

/* Categorias */
.category-card {
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .category-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: $gray-800;
    margin-top: 8px;
  }

  .category-count {
    font-size: 0.7rem;
    color: $gray-500;
    margin-top: 2px;
  }
}

/* Banner promocional */
.promo-banner {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;

  .promo-banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;

    .promo-banner-title {
      font-size: 1rem;
      font-weight: 700;
    }

    .promo-banner-subtitle {
      font-size: 0.8rem;
      opacity: 0.9;
    }
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
  padding: 0 4px;

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

/* Cards de prestadores */
.service-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

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
}

/* Slider de promoções */
.promo-slider {
  .promo-card-slide {
    height: 100%;
    border-radius: 12px;
    padding: 16px;

    .promo-slide-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      gap: 16px;

      .promo-info {
        flex: 1;
      }

      .promo-title {
        font-size: 1rem;
        font-weight: 700;
        color: white;
      }

      .promo-subtitle {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 4px;
      }

      .promo-code {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 6px;
        font-family: monospace;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .promo-validity {
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

/* Cards de prestadores mais avaliados */
.provider-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 8px;

  &:hover {
    transform: translateY(-2px);
  }

  .provider-item {
    display: flex;
    align-items: center;
  }

  .provider-info {
    flex: 1;
    margin-left: 12px;
  }

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
}

/* Pedidos recentes */
.recent-order-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
  }

  .order-number {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-800;
  }

  .order-status {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
    margin-top: 4px;

    &.pendente {
      background: #fff3e0;
      color: #f57c00;
    }

    &.aceito {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.em_andamento {
      background: #e3f2fd;
      color: #1976d2;
    }

    &.concluido {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.cancelado {
      background: #ffebee;
      color: #d32f2f;
    }
  }

  .order-price {
    font-size: 1rem;
    font-weight: 700;
    color: $purple-primary;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}
</style>
