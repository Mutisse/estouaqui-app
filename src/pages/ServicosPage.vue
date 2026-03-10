<!-- pages/ServicosPage.vue -->
<template>
  <q-page class="servicos-page">
    <!-- Hero Section da Página de Serviços -->
    <section class="page-hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content container">
        <div class="text-center">
          <q-chip
            class="hero-chip"
            icon="miscellaneous_services"
            text-color="white"
            label="Nossos Serviços"
          />
          <h1 class="hero-title">Encontre o serviço<br />que precisa</h1>
          <p class="hero-subtitle">
            Mais de 30 categorias de profissionais qualificados em todo Moçambique
          </p>

          <!-- Barra de Pesquisa -->
          <div class="search-bar q-mt-xl">
            <q-input
              outlined
              v-model="searchQuery"
              placeholder="Pesquisar serviço..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:append>
                <q-icon name="search" color="primary" size="20px" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </section>

    <!-- Estatísticas Rápidas -->
    <section class="stats-section q-py-lg">
      <div class="container">
        <div class="row justify-center q-gutter-md">
          <div class="col-12 col-md-10">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">1.2k+</div>
                <div class="stat-label">Prestadores</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">30+</div>
                <div class="stat-label">Categorias</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">5k+</div>
                <div class="stat-label">Serviços Realizados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Todas as Categorias -->
    <section class="categories-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Explorar Categorias</div>
          <h2 class="section-title">Serviços por Categoria</h2>
          <p class="section-subtitle">Escolha a categoria e encontre o profissional ideal</p>
        </div>

        <!-- Filtros Rápidos -->
        <div class="filters-wrapper q-mb-lg">
          <q-btn-toggle
            v-model="selectedFilter"
            push
            toggle-color="primary"
            :options="[
              { label: 'Todos', value: 'all' },
              { label: 'Mais Populares', value: 'popular' },
              { label: 'Próximo de Si', value: 'near' },
            ]"
          />
        </div>

        <!-- Grid de Categorias -->
        <div class="row q-col-gutter-lg">
          <div
            v-for="(categoria, index) in filteredCategorias"
            :key="categoria.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            :data-aos="'fade-up'"
            :data-aos-delay="index * 50"
          >
            <div class="categoria-card" @click="verCategoria(categoria)">
              <!-- Imagem da Categoria -->
              <div class="categoria-image" :style="{ backgroundImage: `url(${categoria.image})` }">
                <div class="categoria-overlay">
                  <div class="categoria-icon-wrapper" :class="`bg-${categoria.color}`">
                    <q-icon :name="categoria.icon" size="28px" color="white" />
                  </div>
                </div>
              </div>

              <!-- Informações -->
              <div class="categoria-info">
                <div class="categoria-header">
                  <h3 class="categoria-nome">{{ categoria.nome }}</h3>
                  <span class="categoria-rating">
                    <q-icon name="star" color="yellow-7" size="16px" />
                    {{ categoria.rating }}
                  </span>
                </div>

                <p class="categoria-descricao">{{ categoria.descricao }}</p>

                <div class="categoria-footer">
                  <div class="categoria-stats">
                    <span class="stat">
                      <q-icon name="person" size="14px" color="grey" />
                      {{ categoria.prestadores }} prestadores
                    </span>
                    <span class="stat">
                      <q-icon name="business_center" size="14px" color="grey" />
                      {{ categoria.servicos }} serviços
                    </span>
                  </div>
                  <q-btn flat round icon="chevron_right" :color="categoria.color" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ver Mais Botão -->
        <div class="text-center q-mt-xl">
          <q-btn
            outline
            color="primary"
            label="Ver Todas as Categorias"
            size="lg"
            icon="expand_more"
            no-caps
            class="view-more-btn"
          />
        </div>
      </div>
    </section>

    <!-- Serviços em Destaque -->
    <section class="featured-section q-py-xl">
      <div class="container">
        <div class="row items-center q-mb-xl">
          <div class="col-12 col-md-6">
            <div class="section-tag">Em Destaque</div>
            <h2 class="section-title">Serviços Mais Procurados</h2>
            <p class="section-subtitle">Os profissionais mais bem avaliados perto de si</p>
          </div>
          <div class="col-12 col-md-6 text-right gt-sm">
            <!-- CORRIGIDO: removido icon-right que não existe no Quasar -->
            <q-btn flat color="primary" label="Ver Todos" icon="arrow_forward" no-caps />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="servico in featuredServices"
            :key="servico.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <div class="featured-card">
              <div class="featured-image">
                <q-img :src="servico.imagem" :ratio="16 / 9" class="rounded-12">
                  <div class="featured-badge">
                    <q-badge :color="servico.disponivel ? 'positive' : 'grey'" class="q-pa-sm">
                      {{ servico.disponivel ? 'Disponível' : 'Indisponível' }}
                    </q-badge>
                  </div>
                </q-img>
              </div>

              <div class="featured-content">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="provider-info">
                    <q-avatar size="32px">
                      <img :src="servico.providerAvatar" alt="provider" />
                    </q-avatar>
                    <span class="provider-name">{{ servico.providerName }}</span>
                  </div>
                  <div class="rating">
                    <q-icon name="star" color="yellow-7" size="16px" />
                    <span>{{ servico.rating }}</span>
                  </div>
                </div>

                <h4 class="featured-title">{{ servico.titulo }}</h4>
                <p class="featured-desc">{{ servico.descricao }}</p>

                <div class="featured-footer">
                  <div>
                    <span class="price-label">A partir de</span>
                    <span class="price-value">{{ servico.preco }} MZN</span>
                  </div>
                  <q-btn unelevated color="primary" label="Contratar" size="sm" no-caps />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Dúvidas Frequentes</div>
          <h2 class="section-title">Perguntas sobre os Serviços</h2>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-md-8">
            <q-expansion-item
              v-for="(faq, index) in faqs"
              :key="index"
              group="faq"
              icon="help_outline"
              :label="faq.pergunta"
              header-class="faq-header"
              class="q-mb-md"
            >
              <q-card class="faq-content">
                <q-card-section>
                  {{ faq.resposta }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA para Prestadores -->
    <section class="provider-cta-section q-py-xl">
      <div class="container">
        <div class="provider-cta-card">
          <div class="row items-center">
            <div class="col-12 col-md-7">
              <h3 class="cta-title">É prestador de serviços?</h3>
              <p class="cta-text">Cadastre-se agora e comece a receber clientes na sua região</p>
            </div>
            <div class="col-12 col-md-5 text-right">
              <q-btn
                unelevated
                color="white"
                text-color="primary"
                label="Quero Oferecer Serviços"
                icon="handyman"
                size="lg"
                to="/auth/register-prestador"
                no-caps
                class="cta-button"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Definindo tipos para melhorar a segurança
interface Categoria {
  id: number;
  nome: string;
  icon: string;
  color: string;
  rating: number;
  prestadores: number;
  servicos: number;
  image: string;
  descricao: string;
  categoria: string;
}

interface FeaturedService {
  id: number;
  titulo: string;
  descricao: string;
  preco: string;
  rating: number;
  providerName: string;
  providerAvatar: string;
  imagem: string;
  disponivel: boolean;
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

const router = useRouter();

// Estados
const searchQuery = ref<string>('');
const selectedFilter = ref<string>('all');

// Dados das Categorias com tipagem
const categorias = ref<Categoria[]>([
  {
    id: 1,
    nome: 'Eletricista',
    icon: 'bolt',
    color: 'warning',
    rating: 4.8,
    prestadores: 45,
    servicos: 128,
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Instalações, reparações e manutenção elétrica',
    categoria: 'construção',
  },
  {
    id: 2,
    nome: 'Canalizador',
    icon: 'water_drop',
    color: 'info',
    rating: 4.7,
    prestadores: 32,
    servicos: 96,
    image:
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Reparação de canalizações e instalação de água',
    categoria: 'construção',
  },
  {
    id: 3,
    nome: 'Pintor',
    icon: 'brush',
    color: 'accent',
    rating: 4.6,
    prestadores: 28,
    servicos: 84,
    image:
      'https://images.unsplash.com/photo-1562259929-b4ec1b3b5f4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Pintura de interiores e exteriores',
    categoria: 'construção',
  },
  {
    id: 4,
    nome: 'Informático',
    icon: 'computer',
    color: 'primary',
    rating: 4.9,
    prestadores: 56,
    servicos: 210,
    image:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Reparação de computadores e assistência técnica',
    categoria: 'tecnologia',
  },
  {
    id: 5,
    nome: 'Cabeleireiro',
    icon: 'content_cut',
    color: 'pink',
    rating: 4.8,
    prestadores: 34,
    servicos: 156,
    image:
      'https://images.unsplash.com/photo-1560869713-da86b9f3b925?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Cortes de cabelo, penteados e tratamentos',
    categoria: 'beleza',
  },
  {
    id: 6,
    nome: 'Manicure',
    icon: 'handshake',
    color: 'purple',
    rating: 4.7,
    prestadores: 41,
    servicos: 189,
    image:
      'https://images.unsplash.com/photo-1610992015732-2449b0bb0a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Unhas de gel, verniz e cuidados das mãos',
    categoria: 'beleza',
  },
  {
    id: 7,
    nome: 'Limpeza',
    icon: 'cleaning_services',
    color: 'cyan',
    rating: 4.5,
    prestadores: 23,
    servicos: 67,
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Limpeza doméstica e comercial',
    categoria: 'doméstico',
  },
  {
    id: 8,
    nome: 'Motorista',
    icon: 'local_taxi',
    color: 'teal',
    rating: 4.6,
    prestadores: 67,
    servicos: 245,
    image:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    descricao: 'Serviços de transporte e entregas',
    categoria: 'transporte',
  },
]);

// Serviços em Destaque com tipagem
const featuredServices = ref<FeaturedService[]>([
  {
    id: 1,
    titulo: 'Reparação Elétrica Urgente',
    descricao: 'Reparação de curto-circuito e instalação de disjuntores',
    preco: '1.500',
    rating: 4.9,
    providerName: 'João Silva',
    providerAvatar: 'https://i.pravatar.cc/32?img=1',
    imagem:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    disponivel: true,
  },
  {
    id: 2,
    titulo: 'Instalação de Ar Condicionado',
    descricao: 'Instalação e manutenção de AC split e janela',
    preco: '3.000',
    rating: 4.8,
    providerName: 'Maria Santos',
    providerAvatar: 'https://i.pravatar.cc/32?img=2',
    imagem:
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    disponivel: true,
  },
  {
    id: 3,
    titulo: 'Penteado para Festa',
    descricao: 'Penteados profissionais para ocasiões especiais',
    preco: '2.500',
    rating: 5.0,
    providerName: 'Ana Macie',
    providerAvatar: 'https://i.pravatar.cc/32?img=3',
    imagem:
      'https://images.unsplash.com/photo-1560869713-da86b9f3b925?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    disponivel: false,
  },
]);

// FAQs com tipagem
const faqs = ref<FAQ[]>([
  {
    pergunta: 'Como encontro um prestador de confiança?',
    resposta:
      'Todos os prestadores na plataforma passam por um processo de verificação. Além disso, pode ver as avaliações de outros clientes e o histórico de serviços realizados antes de fazer a contratação.',
  },
  {
    pergunta: 'Os preços são negociáveis?',
    resposta:
      'Os preços base são definidos pelos prestadores, mas pode negociar diretamente através do chat antes de confirmar o serviço. A plataforma sugere preços médios de mercado para cada tipo de serviço.',
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta:
      'Pode pagar em dinheiro diretamente ao prestador ou através do nosso sistema de pagamento seguro com cartão ou transferência. O pagamento só é libertado após confirmar que o serviço foi concluído.',
  },
  {
    pergunta: 'E se não gostar do serviço?',
    resposta:
      'Temos uma política de satisfação garantida. Se algo não correr como esperado, a nossa equipa de suporte intervém para encontrar a melhor solução, incluindo reembolso se aplicável.',
  },
]);

// Computed: Categorias filtradas
const filteredCategorias = computed<Categoria[]>(() => {
  let filtered = [...categorias.value];

  if (searchQuery.value) {
    filtered = filtered.filter(
      (cat) =>
        cat.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        cat.descricao.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  // Aqui pode adicionar lógica para os filtros 'popular' e 'near'
  if (selectedFilter.value === 'popular') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }

  return filtered;
});

// Métodos com tipagem correta
const verCategoria = (categoria: Categoria): void => {
  // Usando void para ignorar a Promise intencionalmente
  void router.push(`/mobile/lista-prestadores?categoria=${encodeURIComponent(categoria.nome)}`);
};
</script>

<style scoped lang="scss">
// Variáveis de cores
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.page-hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.1;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    color: white;
  }

  .hero-chip {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .search-bar {
    max-width: 600px;
    margin: 0 auto;

    .search-input {
      :deep(.q-field__control) {
        border-radius: 50px;
        padding-left: 20px;
      }
    }
  }
}

// Stats Section
.stats-section {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  margin-top: -40px;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;

  .stats-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 30px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: $purple-primary;
    line-height: 1.2;
  }

  .stat-label {
    color: #666;
    font-size: 0.9rem;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: #e0e0e0;
  }
}

// Section Styles
.section-tag {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: $purple-primary;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
}

// Filters
.filters-wrapper {
  display: flex;
  justify-content: center;
}

// Categoria Cards
.categoria-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 40px rgba(102, 126, 234, 0.15);

    .categoria-image {
      transform: scale(1.05);
    }

    .categoria-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .categoria-image {
    height: 160px;
    background-size: cover;
    background-position: center;
    position: relative;
    transition: transform 0.3s ease;
  }

  .categoria-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .categoria-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &.bg-warning {
      background: #f39c12;
    }
    &.bg-info {
      background: #3498db;
    }
    &.bg-accent {
      background: #9b59b6;
    }
    &.bg-primary {
      background: $purple-primary;
    }
    &.bg-pink {
      background: #e91e63;
    }
    &.bg-purple {
      background: $purple-secondary;
    }
    &.bg-cyan {
      background: #00bcd4;
    }
    &.bg-teal {
      background: #009688;
    }
  }

  .categoria-info {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .categoria-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .categoria-nome {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .categoria-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }

  .categoria-descricao {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .categoria-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .categoria-stats {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    color: #777;
  }
}

// Featured Services
.featured-section {
  background: #f8f9fa;
}

.featured-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.1);
  }

  .featured-image {
    position: relative;

    .featured-badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }

  .featured-content {
    padding: 20px;
  }

  .provider-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .provider-name {
    font-weight: 500;
    color: #333;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }

  .featured-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 10px 0 5px;
  }

  .featured-desc {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .featured-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }

  .price-label {
    font-size: 0.8rem;
    color: #999;
    display: block;
  }

  .price-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: $purple-primary;
  }
}

// FAQ Section
.faq-section {
  background: white;

  .faq-header {
    background: #f8f9fa;
    border-radius: 12px;
    font-weight: 500;
    color: #333;
  }

  .faq-content {
    background: white;
    border: 1px solid #eee;
    border-top: none;
    border-radius: 0 0 12px 12px;
  }
}

// Provider CTA
.provider-cta-section {
  .provider-cta-card {
    background: $purple-gradient;
    padding: 60px;
    border-radius: 30px;
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);
  }

  .cta-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 10px;
  }

  .cta-text {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .cta-button {
    padding: 15px 40px;
    border-radius: 50px;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
  }
}

// View More Button
.view-more-btn {
  border-radius: 50px;
  padding: 12px 40px;
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem !important;
  }

  .stats-section {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;

    .stats-grid {
      flex-direction: column;
      gap: 20px;
    }

    .stat-divider {
      width: 100%;
      height: 1px;
    }
  }

  .section-title {
    font-size: 2rem;
  }

  .provider-cta-card {
    padding: 30px !important;
    text-align: center;

    .text-right {
      text-align: center !important;
      margin-top: 20px;
    }
  }

  .filters-wrapper {
    .q-btn-group {
      width: 100%;

      .q-btn {
        flex: 1;
      }
    }
  }
}

// Utilitários
.rounded-12 {
  border-radius: 12px;
}
</style>
