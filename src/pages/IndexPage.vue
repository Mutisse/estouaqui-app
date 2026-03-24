<template>
  <q-page>
    <!-- Hero Section com Imagem de Fundo -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="container">
          <div class="row justify-center items-center text-center">
            <div class="col-12 col-md-8">
              <!-- Logo animada -->
              <div class="logo-wrapper q-mb-lg">
                <div class="hero-logo">
                  <q-icon name="location_on" size="60px" class="hero-logo-icon" />
                </div>
                <q-icon name="bolt" size="30px" class="hero-logo-spark" />
              </div>

              <!-- Título com gradiente -->
              <div class="hero-title q-mb-md">
                <span class="hero-title-main">Estou</span>
                <span class="hero-title-accent">Aqui</span>
              </div>

              <!-- Subtítulo -->
              <div class="hero-subtitle q-mb-xl">
                Conectamos clientes e prestadores de serviços em Moçambique
              </div>

              <!-- Botões de Ação com efeito glassmorphism -->
              <div class="row justify-center q-gutter-md">
                <q-btn
                  class="hero-btn hero-btn-primary"
                  label="Preciso de um Serviço"
                  size="xl"
                  to="/auth/register-cliente"
                  icon="person_search"
                  no-caps
                />
                <q-btn
                  class="hero-btn hero-btn-secondary"
                  label="Quero Oferecer Serviços"
                  size="xl"
                  to="/auth/register-prestador"
                  icon="handyman"
                  no-caps
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção de Boas-vindas com cards elegantes -->
    <section class="welcome-section q-py-xl">
      <div class="container q-pa-md">
        <div class="row items-center">
          <div class="col-12 col-md-6">
            <div class="section-tag">Bem-vindo ao futuro dos serviços</div>
            <div class="section-title q-mb-md">
              A plataforma que conecta você aos melhores profissionais
            </div>
            <div class="section-subtitle q-mb-lg">
              Seja para uma reparação urgente, um serviço de beleza ou ajuda doméstica,
              o EstouAqui ajuda você a encontrar o profissional ideal, perto de si,
              de forma rápida e segura.
            </div>

            <!-- Cards de estatísticas internas -->
            <div class="row q-gutter-md q-mb-lg">
              <div class="col">
                <div class="stat-mini-card">
                  <div class="stat-mini-value">500+</div>
                  <div class="stat-mini-label">Prestadores</div>
                </div>
              </div>
              <div class="col">
                <div class="stat-mini-card">
                  <div class="stat-mini-value">1.2k+</div>
                  <div class="stat-mini-label">Clientes</div>
                </div>
              </div>
              <div class="col">
                <div class="stat-mini-card">
                  <div class="stat-mini-value">3k+</div>
                  <div class="stat-mini-label">Serviços</div>
                </div>
              </div>
            </div>

            <div class="row q-gutter-md">
              <q-btn flat class="action-btn-outline" label="Saiba Mais" icon="info" to="/sobre" no-caps />
              <q-btn unelevated class="action-btn-primary" label="Ver Serviços" icon="list" to="/servicos" no-caps />
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="image-wrapper">
              <q-img
                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                class="featured-image"
              />
              <div class="image-decoration"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Como Funciona com cards em gradiente -->
    <section class="how-it-works q-py-xl">
      <div class="container q-pa-md">
        <div class="text-center q-mb-xl">
          <div class="section-tag center">Processo Simples</div>
          <div class="section-title center">Como Funciona</div>
          <div class="section-subtitle center">Três passos simples para resolver suas necessidades</div>
        </div>

        <div class="row q-col-gutter-xl">
          <div v-for="(step, index) in steps" :key="index" class="col-12 col-md-4">
            <div class="step-wrapper" :class="{ 'step-delay': index > 0 }">
              <div class="step-number">{{ index + 1 }}</div>
              <q-card class="step-card" flat>
                <q-card-section class="text-center q-pa-xl">
                  <div class="step-icon-wrapper">
                    <q-icon :name="step.icon" size="48px" :class="`step-icon-${step.color}`" />
                  </div>
                  <div class="step-title q-mt-lg">{{ step.title }}</div>
                  <p class="step-description">{{ step.description }}</p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorias Populares com design moderno -->
    <section class="categories-section q-py-xl">
      <div class="container q-pa-md">
        <div class="text-center q-mb-xl">
          <div class="section-tag center">Serviços em Destaque</div>
          <div class="section-title center">Categorias Populares</div>
          <div class="section-subtitle center">Os serviços mais procurados em Maputo</div>
        </div>

        <div class="row q-col-gutter-lg">
          <div v-for="(cat, index) in categorias" :key="cat.nome"
               class="col-6 col-md-3"
               :data-aos="'fade-up'"
               :data-aos-delay="index * 50">
            <div class="category-card-wrapper" @click="buscarPorCategoria(cat.nome)">
              <div class="category-card">
                <div class="category-icon-wrapper" :class="`category-icon-${cat.color}`">
                  <q-icon :name="cat.icon" size="32px" />
                </div>
                <div class="category-info">
                  <div class="category-name">{{ cat.nome }}</div>
                  <div class="category-count">{{ cat.count }}+ serviços</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Porquê Escolher com cards interativos -->
    <section class="why-us-section q-py-xl">
      <div class="container q-pa-md">
        <div class="text-center q-mb-xl">
          <div class="section-tag center">Nossos Diferenciais</div>
          <div class="section-title center">Porquê Escolher o EstouAqui?</div>
        </div>

        <div class="row q-col-gutter-xl">
          <div v-for="(reason, index) in reasons" :key="index" class="col-12 col-md-4">
            <div class="reason-card">
              <div class="reason-icon-wrapper" :class="`reason-icon-${reason.color}`">
                <q-icon :name="reason.icon" size="32px" color="white" />
              </div>
              <div class="reason-content">
                <div class="reason-title">{{ reason.title }}</div>
                <div class="reason-description">{{ reason.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final com design impactante -->
    <section class="final-cta-section q-py-xl">
      <div class="container">
        <div class="cta-card">
          <div class="row items-center justify-between">
            <div class="col-12 col-md-7">
              <div class="cta-title">Pronto para começar?</div>
              <div class="cta-subtitle">Junte-se à maior comunidade de serviços locais de Moçambique</div>
            </div>
            <div class="col-12 col-md-5">
              <div class="row justify-end q-gutter-md">
                <q-btn
                  class="cta-btn cta-btn-primary"
                  label="Criar Conta de Cliente"
                  to="/auth/register-cliente"
                  icon="person"
                  no-caps
                />
                <q-btn
                  class="cta-btn cta-btn-secondary"
                  label="Registar como Prestador"
                  to="/auth/register-prestador"
                  icon="work"
                  no-caps
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HomePage'
})

import { useRouter } from 'vue-router'

const router = useRouter()

const steps = [
  {
    icon: 'search',
    color: 'primary',
    title: 'Encontre',
    description: 'Pesquise por prestadores perto de si, filtre por categoria e veja avaliações'
  },
  {
    icon: 'chat',
    color: 'secondary',
    title: 'Conecte',
    description: 'Converse com o prestador, combine detalhes, preço e horário'
  },
  {
    icon: 'star',
    color: 'positive',
    title: 'Avalie',
    description: 'Após o serviço, avalie o profissional e ajude a comunidade'
  }
]

const categorias = [
  { nome: 'Eletricista', icon: 'bolt', color: 'warning', count: 45 },
  { nome: 'Canalizador', icon: 'water_drop', color: 'info', count: 32 },
  { nome: 'Pintor', icon: 'brush', color: 'accent', count: 28 },
  { nome: 'Informático', icon: 'computer', color: 'primary', count: 56 },
  { nome: 'Cabeleireiro', icon: 'content_cut', color: 'pink', count: 34 },
  { nome: 'Manicure', icon: 'handshake', color: 'purple', count: 41 },
  { nome: 'Limpeza', icon: 'cleaning_services', color: 'cyan', count: 23 },
  { nome: 'Motorista', icon: 'local_taxi', color: 'teal', count: 67 }
]

const reasons = [
  {
    icon: 'security',
    color: 'primary',
    title: 'Segurança',
    description: 'Todos os prestadores passam por verificação e têm avaliações reais'
  },
  {
    icon: 'speed',
    color: 'secondary',
    title: 'Rapidez',
    description: 'Encontre profissionais próximos em poucos cliques com geolocalização'
  },
  {
    icon: 'support_agent',
    color: 'positive',
    title: 'Suporte',
    description: 'Equipa dedicada para ajudar em qualquer dúvida ou problema'
  }
]

const buscarPorCategoria = (categoria: string) => {
 void  router.push(`/mobile/lista-prestadores?categoria=${categoria}`)
}
</script>

<style scoped lang="scss">
// Variáveis de cores em tons de cinza com roxo
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

$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
  }
}

.logo-wrapper {
  position: relative;
  display: inline-block;

  .hero-logo {
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 2px solid rgba(255, 255, 255, 0.3);

    .hero-logo-icon {
      color: white;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
    }
  }

  .hero-logo-spark {
    position: absolute;
    top: -10px;
    right: -10px;
    color: #ffd700;
    animation: pulse 2s infinite;
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;

  .hero-title-main {
    color: white;
    text-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .hero-title-accent {
    background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.hero-btn {
  min-width: 250px;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;

  &-primary {
    background: white;
    color: $purple-primary;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
    }
  }

  &-secondary {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
  }
}

// Welcome Section
.welcome-section {
  background: $gray-50;
  position: relative;

  .image-wrapper {
    position: relative;

    .featured-image {
      border-radius: 30px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
    }

    .image-decoration {
      position: absolute;
      top: 30px;
      right: -30px;
      width: 100%;
      height: 100%;
      border: 2px solid $purple-primary;
      border-radius: 30px;
      z-index: -1;
    }
  }
}

.section-tag {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: $purple-primary;
  font-weight: 600;
  margin-bottom: 1rem;

  &.center {
    text-align: center;
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $gray-900;

  &.center {
    text-align: center;
  }
}

.section-subtitle {
  font-size: 1.1rem;
  color: $gray-600;
  line-height: 1.6;

  &.center {
    text-align: center;
  }
}

.stat-mini-card {
  background: white;
  padding: 15px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);

  .stat-mini-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: $purple-primary;
  }

  .stat-mini-label {
    font-size: 0.9rem;
    color: $gray-600;
  }
}

.action-btn-outline {
  color: $purple-primary;
  border: 2px solid $purple-primary;
  border-radius: 30px;
  padding: 10px 30px;

  &:hover {
    background: $purple-primary;
    color: white;
  }
}

.action-btn-primary {
  background: $purple-gradient;
  color: white;
  border-radius: 30px;
  padding: 10px 30px;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
  }
}

// How it works
.how-it-works {
  background: white;

  .step-wrapper {
    position: relative;
    height: 100%;

    .step-number {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      background: $purple-gradient;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
      z-index: 2;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
  }

  .step-card {
    height: 100%;
    border-radius: 30px;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 40px rgba(0,0,0,0.1);

      .step-icon-wrapper {
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  .step-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: all 0.3s ease;

    .step-icon-primary { color: $purple-primary; }
    .step-icon-secondary { color: $purple-secondary; }
    .step-icon-positive { color: #48bb78; }
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $gray-800;
  }

  .step-description {
    color: $gray-600;
    line-height: 1.6;
  }
}

// Categories
.categories-section {
  background: $gray-100;

  .category-card-wrapper {
    cursor: pointer;

    .category-card {
      background: white;
      padding: 20px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 30px rgba(102, 126, 234, 0.15);

        .category-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }
      }
    }
  }

  .category-icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &.category-icon-warning { background: rgba(255, 193, 7, 0.1); color: #f39c12; }
    &.category-icon-info { background: rgba(33, 150, 243, 0.1); color: #3498db; }
    &.category-icon-accent { background: rgba(156, 39, 176, 0.1); color: #9b59b6; }
    &.category-icon-primary { background: rgba(102, 126, 234, 0.1); color: $purple-primary; }
    &.category-icon-pink { background: rgba(233, 30, 99, 0.1); color: #e91e63; }
    &.category-icon-purple { background: rgba(118, 75, 162, 0.1); color: $purple-secondary; }
    &.category-icon-cyan { background: rgba(0, 188, 212, 0.1); color: #00bcd4; }
    &.category-icon-teal { background: rgba(0, 150, 136, 0.1); color: #009688; }
  }

  .category-info {
    flex: 1;

    .category-name {
      font-size: 1rem;
      font-weight: 600;
      color: $gray-800;
    }

    .category-count {
      font-size: 0.8rem;
      color: $gray-500;
    }
  }
}

// Why us
.why-us-section {
  background: white;

  .reason-card {
    background: $gray-50;
    padding: 40px 30px;
    border-radius: 30px;
    text-align: center;
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 40px rgba(102, 126, 234, 0.1);

      .reason-icon-wrapper {
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  .reason-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    transition: all 0.3s ease;

    &.reason-icon-primary { background: $purple-gradient; }
    &.reason-icon-secondary { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }
    &.reason-icon-positive { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); }
  }

  .reason-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $gray-800;
    margin-bottom: 10px;
  }

  .reason-description {
    color: $gray-600;
    line-height: 1.6;
  }
}

// Final CTA
.final-cta-section {
  background: $gray-100;

  .cta-card {
    background: $purple-gradient;
    padding: 60px;
    border-radius: 40px;
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);

    .cta-title {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 10px;
    }

    .cta-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .cta-btn {
      padding: 15px 30px;
      border-radius: 50px;
      font-weight: 600;
      transition: all 0.3s ease;

      &-primary {
        background: white;
        color: $purple-primary;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
      }

      &-secondary {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      }
    }
  }
}

// Animações
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-btn {
    min-width: 200px;
    font-size: 1rem;
    padding: 10px 20px;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-card {
    padding: 30px !important;
    text-align: center;

    .row {
      flex-direction: column;
      gap: 20px;
    }

    .col-12.col-md-5 .row {
      justify-content: center !important;
    }
  }

  .image-decoration {
    display: none;
  }
}
</style>
