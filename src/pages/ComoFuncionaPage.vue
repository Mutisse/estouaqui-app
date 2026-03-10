<!-- pages/ComoFuncionaPage.vue -->
<template>
  <q-page class="como-funciona-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content container">
        <div class="text-center">
          <q-chip class="hero-chip" icon="help_outline" text-color="white" label="Guia Rápido" />
          <h1 class="hero-title">Como funciona<br>o EstouAqui?</h1>
          <p class="hero-subtitle">Descubra como é fácil encontrar ou oferecer serviços na nossa plataforma</p>
        </div>
      </div>
    </section>

    <!-- Visão Geral -->
    <section class="overview-section q-py-xl">
      <div class="container">
        <div class="row items-center">
          <div class="col-12 col-md-6">
            <div class="section-tag">Processo Simples</div>
            <h2 class="section-title">Conectamos clientes e prestadores em 3 passos</h2>
            <p class="section-subtitle">Uma plataforma intuitiva e segura para encontrar os melhores profissionais perto de si</p>

            <div class="overview-stats row q-mt-lg">
              <div v-for="(step, index) in overviewSteps" :key="index" class="col-4">
                <div class="stat-circle">
                  <span class="stat-number">{{ step.number }}</span>
                </div>
                <div class="stat-label">{{ step.label }}</div>
              </div>
            </div>

            <!-- Botões de ação -->
            <div class="row q-gutter-md q-mt-xl">
              <q-btn
                unelevated
                color="primary"
                label="Sou Cliente"
                icon="person"
                to="/auth/register-cliente"
                no-caps
              />
              <q-btn
                outline
                color="primary"
                label="Sou Prestador"
                icon="handyman"
                to="/auth/register-prestador"
                no-caps
              />
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="video-wrapper">
              <q-video
                :ratio="16/9"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=example"
                class="rounded-video"
              />
              <div class="video-decoration"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Passo a Passo Detalhado -->
    <section class="steps-detailed-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Passo a Passo</div>
          <h2 class="section-title">Como utilizar a plataforma</h2>
          <p class="section-subtitle">Siga estes passos simples para começar</p>
        </div>

        <div class="steps-timeline">
          <div v-for="(step, index) in detailedSteps" :key="index"
               class="step-item"
               :class="{ 'step-reverse': index % 2 !== 0 }">
            <div class="row items-center">
              <div class="col-12 col-md-6" :class="{ 'order-md-2': index % 2 !== 0 }">
                <div class="step-content">
                  <div class="step-number-badge">{{ step.number }}</div>
                  <h3 class="step-title">{{ step.title }}</h3>
                  <p class="step-description">{{ step.description }}</p>

                  <div class="step-features">
                    <div v-for="(item, i) in step.items" :key="i" class="step-feature-item">
                      <q-icon :name="step.icons[i]" :color="step.iconColor" size="20px" class="q-mr-sm" />
                      <span>{{ item }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6" :class="{ 'order-md-1': index % 2 !== 0 }">
                <div class="step-image-wrapper">
                  <q-img
                    :src="step.image"
                    :alt="step.title"
                    class="step-image"
                    ratio="4/3"
                  />
                  <div class="step-image-decoration"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefícios -->
    <section class="benefits-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Vantagens</div>
          <h2 class="section-title">Porquê escolher o EstouAqui?</h2>
        </div>

        <div class="row q-col-gutter-lg">
          <div v-for="(benefit, index) in benefits" :key="index" class="col-12 col-md-4">
            <div class="benefit-card">
              <div class="benefit-icon-wrapper">
                <q-icon :name="benefit.icon" size="40px" :color="benefit.color" />
              </div>
              <h4 class="benefit-title">{{ benefit.title }}</h4>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Para Clientes vs Para Prestadores -->
    <section class="comparison-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Dois Lados</div>
          <h2 class="section-title">Escolha o seu perfil</h2>
        </div>

        <div class="row q-col-gutter-xl">
          <!-- Card Cliente -->
          <div class="col-12 col-md-6">
            <div class="profile-card client-card">
              <div class="profile-header">
                <div class="profile-icon">
                  <q-icon name="person_search" size="48px" color="white" />
                </div>
                <h3 class="profile-title">Sou Cliente</h3>
                <p class="profile-subtitle">Preciso de um serviço</p>
              </div>

              <div class="profile-features">
                <div v-for="(feature, index) in clientFeatures" :key="index" class="feature-item">
                  <q-icon name="check_circle" color="positive" size="20px" />
                  <span>{{ feature }}</span>
                </div>
              </div>

              <div class="text-center q-mt-lg">
                <q-btn
                  unelevated
                  color="white"
                  text-color="primary"
                  label="Criar Conta de Cliente"
                  to="/auth/register-cliente"
                  size="lg"
                  class="profile-btn"
                  no-caps
                />
              </div>
            </div>
          </div>

          <!-- Card Prestador -->
          <div class="col-12 col-md-6">
            <div class="profile-card provider-card">
              <div class="profile-header">
                <div class="profile-icon">
                  <q-icon name="handyman" size="48px" color="white" />
                </div>
                <h3 class="profile-title">Sou Prestador</h3>
                <p class="profile-subtitle">Quero oferecer serviços</p>
              </div>

              <div class="profile-features">
                <div v-for="(feature, index) in providerFeatures" :key="index" class="feature-item">
                  <q-icon name="check_circle" color="positive" size="20px" />
                  <span>{{ feature }}</span>
                </div>
              </div>

              <div class="text-center q-mt-lg">
                <q-btn
                  unelevated
                  color="white"
                  text-color="secondary"
                  label="Registar como Prestador"
                  to="/auth/register-prestador"
                  size="lg"
                  class="profile-btn"
                  no-caps
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Estatísticas -->
    <section class="stats-highlight-section q-py-xl">
      <div class="container">
        <div class="stats-grid">
          <div v-for="(stat, index) in statistics" :key="index" class="stat-highlight-item">
            <div class="stat-highlight-value">{{ stat.value }}</div>
            <div class="stat-highlight-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Perguntas Frequentes -->
    <section class="faq-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Dúvidas</div>
          <h2 class="section-title">Perguntas Frequentes</h2>
          <p class="section-subtitle">Tire as suas dúvidas sobre a plataforma</p>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-md-8">
            <q-expansion-item
              v-for="(faq, index) in faqs"
              :key="index"
              group="faq"
              icon="help"
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

    <!-- Call to Action -->
    <section class="cta-section q-py-xl">
      <div class="container">
        <div class="cta-card">
          <div class="row items-center justify-between">
            <div class="col-12 col-md-7">
              <h3 class="cta-title">Pronto para começar?</h3>
              <p class="cta-text">Junte-se a milhares de moçambicanos que já utilizam a plataforma</p>
            </div>
            <div class="col-12 col-md-5 text-right">
              <q-btn
                unelevated
                color="primary"
                label="Criar Conta Grátis"
                icon="person_add"
                size="lg"
                to="/auth/register-cliente"
                class="cta-button"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'ComoFuncionaPage'
})

// Overview steps
const overviewSteps = [
  { number: '1', label: 'Encontre' },
  { number: '2', label: 'Conecte' },
  { number: '3', label: 'Avalie' }
]

// Dados detalhados dos passos
const detailedSteps = [
  {
    number: '01',
    title: 'Encontre o profissional ideal',
    description: 'Utilize os filtros de pesquisa para encontrar prestadores perto de si',
    items: [
      'Pesquise por categoria de serviço',
      'Filtre por localização e avaliação',
      'Veja perfis com fotos e portfólio',
      'Compare preços e disponibilidade'
    ],
    icons: ['search', 'location_on', 'photo_library', 'compare_arrows'],
    iconColor: 'primary',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '02',
    title: 'Conecte-se e combine',
    description: 'Converse diretamente com o prestador e acerte todos os detalhes',
    items: [
      'Chat integrado e seguro',
      'Combine preço e horário',
      'Partilhe fotos e localização',
      'Receba orçamentos personalizados'
    ],
    icons: ['chat', 'attach_money', 'share', 'request_quote'],
    iconColor: 'secondary',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '03',
    title: 'Avalie e ajude a comunidade',
    description: 'Após o serviço, partilhe a sua experiência',
    items: [
      'Avalie o profissional',
      'Deixe um comentário detalhado',
      'Ajude outros clientes',
      'Construa uma comunidade de confiança'
    ],
    icons: ['star', 'rate_review', 'people', 'verified'],
    iconColor: 'positive',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
]

// Benefícios
const benefits = [
  {
    icon: 'security',
    color: 'primary',
    title: 'Segurança',
    description: 'Verificamos todos os prestadores para garantir a sua tranquilidade.'
  },
  {
    icon: 'speed',
    color: 'secondary',
    title: 'Rapidez',
    description: 'Encontre profissionais próximos em poucos cliques.'
  },
  {
    icon: 'support_agent',
    color: 'positive',
    title: 'Suporte 24/7',
    description: 'Equipa dedicada para ajudar em qualquer situação.'
  },
  {
    icon: 'payments',
    color: 'warning',
    title: 'Pagamento Seguro',
    description: 'Múltiplas opções de pagamento com garantia de devolução.'
  },
  {
    icon: 'star',
    color: 'accent',
    title: 'Qualidade',
    description: 'Avaliações reais de clientes para ajudar na escolha.'
  },
  {
    icon: 'location_on',
    color: 'info',
    title: 'Geolocalização',
    description: 'Encontre profissionais perto de si ou em qualquer região.'
  }
]

// Features para clientes
const clientFeatures = [
  'Encontre profissionais perto de si',
  'Veja avaliações reais de outros clientes',
  'Compare preços e orçamentos',
  'Comunique diretamente pelo chat',
  'Serviço garantido ou dinheiro de volta'
]

// Features para prestadores
const providerFeatures = [
  'Aumente sua visibilidade local',
  'Receba clientes qualificados',
  'Gerencie sua agenda',
  'Construa sua reputação',
  'Receba pagamentos seguros'
]

// Estatísticas
const statistics = [
  { value: '1.2k+', label: 'Prestadores' },
  { value: '5k+', label: 'Serviços Realizados' },
  { value: '98%', label: 'Satisfação' },
  { value: '30+', label: 'Categorias' }
]

// FAQs
const faqs = ref([
  {
    pergunta: 'O serviço é gratuito?',
    resposta: 'Sim! O registo é completamente gratuito tanto para clientes como para prestadores. Apenas cobramos uma pequena comissão sobre os serviços realizados através da plataforma.'
  },
  {
    pergunta: 'Como garantir a qualidade dos prestadores?',
    resposta: 'Todos os prestadores passam por um processo de verificação de identidade e documentos. Além disso, o sistema de avaliações garante transparência e qualidade.'
  },
  {
    pergunta: 'Posso cancelar um serviço?',
    resposta: 'Sim, pode cancelar até 24 horas antes sem custos. Cancelamentos em cima da hora podem estar sujeitos a uma taxa de compensação para o prestador.'
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta: 'Pode pagar em dinheiro diretamente ao prestador ou através do nosso sistema de pagamento online seguro com cartão ou transferência.'
  },
  {
    pergunta: 'E se houver algum problema?',
    resposta: 'A nossa equipa de suporte está disponível 24/7 para ajudar a resolver qualquer questão. Temos uma política de satisfação garantida.'
  }
])
</script>

<style scoped lang="scss">
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
  min-height: 50vh;
  display: flex;
  align-items: center;
  background: $purple-gradient;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
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
    text-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
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
  max-width: 600px;
  margin: 0 auto;
}

// Overview Section
.overview-section {
  background: white;
  padding: 80px 0;

  .overview-stats {
    text-align: center;

    .stat-circle {
      width: 70px;
      height: 70px;
      background: $purple-gradient;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

      .stat-number {
        color: white;
        font-size: 1.8rem;
        font-weight: bold;
      }
    }

    .stat-label {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }
  }

  .video-wrapper {
    position: relative;
    padding-left: 30px;

    .rounded-video {
      border-radius: 20px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .video-decoration {
      position: absolute;
      top: -20px;
      left: 10px;
      width: 100%;
      height: 100%;
      border: 2px solid $purple-primary;
      border-radius: 30px;
      z-index: -1;
    }
  }
}

// Steps Timeline
.steps-detailed-section {
  background: #f8f9fa;
  padding: 80px 0;

  .step-item {
    margin-bottom: 100px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .step-number-badge {
    font-size: 4rem;
    font-weight: 800;
    color: rgba(102, 126, 234, 0.1);
    line-height: 1;
    margin-bottom: 10px;
  }

  .step-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
  }

  .step-description {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 25px;
    line-height: 1.6;
  }

  .step-features {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .step-feature-item {
    display: flex;
    align-items: center;
    font-size: 1rem;
    color: #555;
  }

  .step-image-wrapper {
    position: relative;
    padding: 20px;

    .step-image {
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .step-image-decoration {
      position: absolute;
      bottom: -10px;
      right: -10px;
      width: 80%;
      height: 80%;
      border: 2px solid $purple-primary;
      border-radius: 20px;
      z-index: -1;
    }
  }
}

// Benefits Section
.benefits-section {
  background: white;
  padding: 80px 0;

  .benefit-card {
    background: #f8f9fa;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);

      .benefit-icon-wrapper {
        transform: scale(1.1);
      }
    }
  }

  .benefit-icon-wrapper {
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }

  .benefit-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  .benefit-description {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

// Comparison Section
.comparison-section {
  background: #f8f9fa;
  padding: 80px 0;

  .profile-card {
    background: white;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    height: 100%;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(102, 126, 234, 0.15);
    }

    .profile-header {
      padding: 40px;
      text-align: center;
      color: white;
    }

    .profile-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      backdrop-filter: blur(10px);
    }

    .profile-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .profile-subtitle {
      font-size: 1rem;
      opacity: 0.9;
    }

    .profile-features {
      padding: 40px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      font-size: 1rem;
      color: #333;
    }

    .profile-btn {
      margin: 0 40px 40px;
      width: calc(100% - 80px);
      border-radius: 50px;
      padding: 15px;
    }
  }

  .client-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .profile-header {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .provider-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    .profile-header {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}

// Stats Highlight
.stats-highlight-section {
  background: white;
  padding: 60px 0;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    text-align: center;
  }

  .stat-highlight-item {
    padding: 20px;
  }

  .stat-highlight-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: $purple-primary;
    margin-bottom: 5px;
  }

  .stat-highlight-label {
    font-size: 1rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// FAQ Section
.faq-section {
  background: #f8f9fa;
  padding: 80px 0;

  .faq-header {
    background: white;
    border-radius: 12px;
    font-weight: 500;
    color: #333;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  }

  .faq-content {
    background: white;
    border: 1px solid #eee;
    border-radius: 0 0 12px 12px;
    margin-top: 2px;
  }
}

// CTA Section
.cta-section {
  padding: 60px 0;

  .cta-card {
    background: white;
    padding: 60px;
    border-radius: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    border: 2px solid #f0f0f0;
  }

  .cta-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }

  .cta-text {
    font-size: 1.1rem;
    color: #666;
  }

  .cta-button {
    padding: 15px 40px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
  }
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem !important;
  }

  .section-title {
    font-size: 2rem;
  }

  .step-item {
    margin-bottom: 60px;

    .step-title {
      font-size: 1.5rem;
    }
  }

  .step-reverse {
    .order-md-2 {
      order: 1;
    }
    .order-md-1 {
      order: 2;
    }
  }

  .video-wrapper {
    padding-left: 0 !important;
    margin-top: 30px;
  }

  .cta-card {
    padding: 30px !important;
    text-align: center;

    .text-right {
      text-align: center !important;
      margin-top: 20px;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 20px;
  }

  .profile-btn {
    margin: 0 20px 30px !important;
    width: calc(100% - 40px) !important;
  }
}
</style>
