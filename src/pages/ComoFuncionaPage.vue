<!-- pages/ComoFuncionaPage.vue -->
<template>
  <q-page class="cf-page">

    <!-- ===== HERO ===== -->
    <section class="cf-hero">
      <div class="cf-hero__bg">
        <div class="cf-hero__orb cf-hero__orb--1"></div>
        <div class="cf-hero__orb cf-hero__orb--2"></div>
        <div class="cf-hero__grid"></div>
      </div>

      <div class="cf-hero__content cf-container">
        <div class="cf-hero__badge">
          <span class="cf-badge__dot"></span>
          Guia Rápido
        </div>

        <h1 class="cf-hero__heading">
          Como funciona<br>
          <span class="cf-heading-accent">o EstouAqui?</span>
        </h1>

        <p class="cf-hero__sub">
          Descubra como é fácil encontrar ou oferecer serviços na nossa plataforma
        </p>

        <div class="cf-hero__actions">
          <router-link to="/auth/register-cliente" class="cf-cta-primary">
            <span>Sou Cliente</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </router-link>
          <router-link to="/auth/register-prestador" class="cf-cta-ghost">
            Sou Prestador
          </router-link>
        </div>
      </div>

      <!-- Hero stats -->
      <div class="cf-hero__stats cf-container">
        <div v-for="(stat, i) in heroStats" :key="i" class="cf-stat">
          <span class="cf-stat__val">{{ stat.value }}</span>
          <span class="cf-stat__label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ===== VISÃO GERAL / 3 PASSOS ===== -->
    <section class="cf-section cf-overview">
      <div class="cf-container">
        <div class="cf-section-header">
          <div class="cf-section-label">Processo Simples</div>
          <h2 class="cf-section-title">Conectamos clientes e prestadores em 3 passos</h2>
          <p class="cf-section-sub">Uma plataforma intuitiva e segura para encontrar os melhores profissionais perto de si</p>
        </div>

        <div class="cf-steps-preview">
          <div v-for="(step, i) in overviewSteps" :key="i" class="cf-step-preview">
            <div class="cf-step-preview__circle">
              <span class="cf-step-preview__num">{{ step.number }}</span>
            </div>
            <div class="cf-step-preview__label">{{ step.label }}</div>
            <div v-if="i < overviewSteps.length - 1" class="cf-step-preview__line"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PASSO A PASSO DETALHADO ===== -->
    <section class="cf-section cf-timeline">
      <div class="cf-container">
        <div class="cf-section-header">
          <div class="cf-section-label">Passo a Passo</div>
          <h2 class="cf-section-title">Como utilizar a plataforma</h2>
          <p class="cf-section-sub">Siga estes passos simples para começar</p>
        </div>

        <div class="cf-timeline__list">
          <div
            v-for="(step, i) in detailedSteps"
            :key="i"
            class="cf-timeline-item"
            :class="{ 'cf-timeline-item--reverse': i % 2 !== 0 }"
          >
            <div class="cf-timeline-item__content">
              <div class="cf-step-badge">{{ step.number }}</div>
              <h3 class="cf-timeline-item__title">{{ step.title }}</h3>
              <p class="cf-timeline-item__desc">{{ step.description }}</p>
              <div class="cf-timeline-item__features">
                <div v-for="(item, j) in step.items" :key="j" class="cf-feature-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{{ item }}</span>
                </div>
              </div>
            </div>
            <div class="cf-timeline-item__image">
              <div class="cf-timeline-img-wrapper">
                <q-img :src="step.image" :ratio="4/3" class="cf-timeline-img" />
                <div class="cf-timeline-img__decor"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== BENEFÍCIOS ===== -->
    <section class="cf-section cf-benefits">
      <div class="cf-container">
        <div class="cf-section-header">
          <div class="cf-section-label">Vantagens</div>
          <h2 class="cf-section-title">Porquê escolher o EstouAqui?</h2>
        </div>

        <div class="cf-benefits__grid">
          <div v-for="(benefit, i) in benefits" :key="i" class="cf-benefit-card">
            <div class="cf-benefit-card__icon" :style="`background: ${benefit.bg}`">
              <span>{{ benefit.emoji }}</span>
            </div>
            <h4 class="cf-benefit-card__title">{{ benefit.title }}</h4>
            <p class="cf-benefit-card__desc">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PERFIS: CLIENTE vs PRESTADOR ===== -->
    <section class="cf-section cf-profiles">
      <div class="cf-container">
        <div class="cf-section-header">
          <div class="cf-section-label">Dois Lados</div>
          <h2 class="cf-section-title">Escolha o seu perfil</h2>
        </div>

        <div class="cf-profiles__grid">
          <!-- Cliente -->
          <div class="cf-profile-card cf-profile-card--client">
            <div class="cf-profile-card__header">
              <div class="cf-profile-card__icon">🔍</div>
              <h3 class="cf-profile-card__title">Sou Cliente</h3>
              <p class="cf-profile-card__sub">Preciso de um serviço</p>
            </div>
            <div class="cf-profile-card__features">
              <div v-for="(feature, i) in clientFeatures" :key="i" class="cf-profile-feature">
                <span class="cf-profile-feature__check">✓</span>
                <span>{{ feature }}</span>
              </div>
            </div>
            <router-link to="/auth/register-cliente" class="cf-profile-card__btn cf-profile-card__btn--light">
              Criar conta de cliente
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
          </div>

          <!-- Prestador -->
          <div class="cf-profile-card cf-profile-card--provider">
            <div class="cf-profile-card__header">
              <div class="cf-profile-card__icon">🔧</div>
              <h3 class="cf-profile-card__title">Sou Prestador</h3>
              <p class="cf-profile-card__sub">Quero oferecer serviços</p>
            </div>
            <div class="cf-profile-card__features">
              <div v-for="(feature, i) in providerFeatures" :key="i" class="cf-profile-feature">
                <span class="cf-profile-feature__check">✓</span>
                <span>{{ feature }}</span>
              </div>
            </div>
            <router-link to="/auth/register-prestador" class="cf-profile-card__btn cf-profile-card__btn--dark">
              Registar como prestador
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section class="cf-section cf-faq">
      <div class="cf-container">
        <div class="cf-section-header">
          <div class="cf-section-label">Dúvidas</div>
          <h2 class="cf-section-title">Perguntas Frequentes</h2>
          <p class="cf-section-sub">Tire as suas dúvidas sobre a plataforma</p>
        </div>

        <div class="cf-faq__list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="cf-faq-item"
            :class="{ 'cf-faq-item--open': openFaq === i }"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <div class="cf-faq-item__q">
              <span>{{ faq.pergunta }}</span>
              <span class="cf-faq-item__chevron">{{ openFaq === i ? '−' : '+' }}</span>
            </div>
            <div class="cf-faq-item__a" v-show="openFaq === i">
              {{ faq.resposta }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="cf-cta-section">
      <div class="cf-cta-section__bg">
        <div class="cf-cta__orb cf-cta__orb--1"></div>
        <div class="cf-cta__orb cf-cta__orb--2"></div>
      </div>
      <div class="cf-container cf-cta__inner">
        <div class="cf-cta__label">Comece hoje</div>
        <h2 class="cf-cta__title">Pronto para<br>começar?</h2>
        <p class="cf-cta__sub">Junte-se a milhares de moçambicanos que já utilizam a plataforma</p>
        <div class="cf-cta__btns">
          <router-link to="/auth/register-cliente" class="cf-cta-white">
            Criar conta grátis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </router-link>
          <router-link to="/auth/register-prestador" class="cf-cta-outline-white">
            Sou prestador
          </router-link>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ComoFuncionaPage' })

const openFaq = ref(-1)

const heroStats = [
  { value: '1.2k+', label: 'Prestadores' },
  { value: '5k+', label: 'Serviços Realizados' },
  { value: '98%', label: 'Satisfação' },
  { value: '30+', label: 'Categorias' },
]

const overviewSteps = [
  { number: '1', label: 'Encontre' },
  { number: '2', label: 'Conecte' },
  { number: '3', label: 'Avalie' },
]

const detailedSteps = [
  {
    number: '01',
    title: 'Encontre o profissional ideal',
    description: 'Utilize os filtros de pesquisa para encontrar prestadores perto de si',
    items: [
      'Pesquise por categoria de serviço',
      'Filtre por localização e avaliação',
      'Veja perfis com fotos e portfólio',
      'Compare preços e disponibilidade',
    ],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d9?auto=format&fit=crop&w=800&q=80',
  },
  {
    number: '02',
    title: 'Conecte-se e combine',
    description: 'Converse diretamente com o prestador e acerte todos os detalhes',
    items: [
      'Chat integrado e seguro',
      'Combine preço e horário',
      'Partilhe fotos e localização',
      'Receba orçamentos personalizados',
    ],
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
  },
  {
    number: '03',
    title: 'Avalie e ajude a comunidade',
    description: 'Após o serviço, partilhe a sua experiência',
    items: [
      'Avalie o profissional',
      'Deixe um comentário detalhado',
      'Ajude outros clientes',
      'Construa uma comunidade de confiança',
    ],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  },
]

const benefits = [
  { emoji: '🔒', bg: '#EDE9FE', title: 'Segurança', description: 'Verificamos todos os prestadores para garantir a sua tranquilidade.' },
  { emoji: '⚡', bg: '#FEF3C7', title: 'Rapidez', description: 'Encontre profissionais próximos em poucos cliques.' },
  { emoji: '💬', bg: '#DBEAFE', title: 'Suporte 24/7', description: 'Equipa dedicada para ajudar em qualquer situação.' },
  { emoji: '💰', bg: '#D1FAE5', title: 'Pagamento Seguro', description: 'Múltiplas opções de pagamento com garantia de devolução.' },
  { emoji: '⭐', bg: '#FCE7F3', title: 'Qualidade', description: 'Avaliações reais de clientes para ajudar na escolha.' },
  { emoji: '📍', bg: '#CCFBF1', title: 'Geolocalização', description: 'Encontre profissionais perto de si ou em qualquer região.' },
]

const clientFeatures = [
  'Encontre profissionais perto de si',
  'Veja avaliações reais de outros clientes',
  'Compare preços e orçamentos',
  'Comunique diretamente pelo chat',
  'Serviço garantido ou dinheiro de volta',
]

const providerFeatures = [
  'Aumente sua visibilidade local',
  'Receba clientes qualificados',
  'Gerencie sua agenda',
  'Construa sua reputação',
  'Receba pagamentos seguros',
]

const faqs = [
  { pergunta: 'O serviço é gratuito?', resposta: 'Sim! O registo é completamente gratuito tanto para clientes como para prestadores. Apenas cobramos uma pequena comissão sobre os serviços realizados através da plataforma.' },
  { pergunta: 'Como garantir a qualidade dos prestadores?', resposta: 'Todos os prestadores passam por um processo de verificação de identidade e documentos. Além disso, o sistema de avaliações garante transparência e qualidade.' },
  { pergunta: 'Posso cancelar um serviço?', resposta: 'Sim, pode cancelar até 24 horas antes sem custos. Cancelamentos em cima da hora podem estar sujeitos a uma taxa de compensação para o prestador.' },
  { pergunta: 'Como funciona o pagamento?', resposta: 'Pode pagar em dinheiro diretamente ao prestador ou através do nosso sistema de pagamento online seguro com cartão ou transferência.' },
  { pergunta: 'E se houver algum problema?', resposta: 'A nossa equipa de suporte está disponível 24/7 para ajudar a resolver qualquer questão. Temos uma política de satisfação garantida.' },
]
</script>

<style scoped lang="scss">
// =====================
//  TOKENS (mesmo padrão das outras páginas)
// =====================
$ink: #0A0A0F;
$ink-2: #3D3D4E;
$ink-3: #7B7B8E;
$surface: #FFFFFF;
$surface-2: #F7F7FA;
$surface-3: #EDEDF2;
$accent: #5B4BF5;
$accent-lt: #EDE9FE;
$radius-sm: 8px;
$radius-md: 14px;
$radius-lg: 20px;
$radius-xl: 28px;

// =====================
//  BASE
// =====================
.cf-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $surface;
  color: $ink;
  overflow-x: hidden;
}

.cf-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

// =====================
//  HERO
// =====================
.cf-hero {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 120px 0 0;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);

    &--1 {
      width: 500px; height: 500px;
      top: -150px; right: -80px;
      background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
    }
    &--2 {
      width: 350px; height: 350px;
      bottom: 0; left: -60px;
      background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-bottom: 60px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
    font-size: 0.82rem;
    font-weight: 500;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 24px;
    width: fit-content;
  }

  &__heading {
    font-size: clamp(2.6rem, 5.5vw, 4.8rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  &__sub {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.55);
    margin: 0 0 40px;
    max-width: 520px;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__stats {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 40px;

    @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  }
}

.cf-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 6px #4ADE80;
  flex-shrink: 0;
}

.cf-heading-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cf-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: $accent;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.25s;

  &:hover {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(91,75,245,0.35);
  }
}

.cf-cta-ghost {
  display: inline-flex;
  align-items: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.95rem;
  font-weight: 500;
  padding: 12px 24px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 100px;
  text-decoration: none;
  background: rgba(255,255,255,0.05);
  transition: all 0.25s;

  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
  }
}

.cf-stat {
  padding: 28px 20px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.06);

  &:last-child { border-right: none; }

  &__val {
    display: block;
    font-size: 1.7rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  &__label {
    display: block;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.35);
    margin-top: 4px;
  }
}

// =====================
//  SECTIONS SHARED
// =====================
.cf-section {
  padding: 96px 0;
}

.cf-section-header {
  text-align: center;
  margin-bottom: 52px;
}

.cf-section-label {
  display: inline-block;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: $accent-lt;
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 14px;
}

.cf-section-title {
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  font-weight: 800;
  color: $ink;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px;
}

.cf-section-sub {
  font-size: 1rem;
  color: $ink-3;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

// =====================
//  OVERVIEW / 3 PASSOS
// =====================
.cf-overview {
  background: $surface-2;
}

.cf-steps-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;

  @media (max-width: 560px) {
    gap: 20px;
  }
}

.cf-step-preview {
  text-align: center;
  position: relative;

  &__circle {
    width: 80px;
    height: 80px;
    background: $accent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 12px 24px rgba(91,75,245,0.25);
  }

  &__num {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
  }

  &__label {
    font-size: 1rem;
    font-weight: 600;
    color: $ink;
  }

  &__line {
    position: absolute;
    top: 40px;
    right: -40px;
    width: 40px;
    height: 2px;
    background: $surface-3;

    @media (max-width: 560px) {
      display: none;
    }
  }
}

// =====================
//  TIMELINE
// =====================
.cf-timeline {
  background: $surface;
}

.cf-timeline__list {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.cf-timeline-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  &--reverse {
    .cf-timeline-item__image {
      order: 1;
    }
    .cf-timeline-item__content {
      order: 2;
    }
    @media (max-width: 768px) {
      .cf-timeline-item__image { order: 2; }
      .cf-timeline-item__content { order: 1; }
    }
  }

  &__content {
    padding: 0 20px;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 700;
    color: $ink;
    margin: 16px 0 12px;
  }

  &__desc {
    font-size: 1rem;
    color: $ink-3;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__image {
    position: relative;
  }
}

.cf-step-badge {
  font-size: 4rem;
  font-weight: 800;
  color: rgba(91,75,245,0.12);
  line-height: 1;
}

.cf-feature-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: $ink-2;

  svg {
    color: $accent;
    flex-shrink: 0;
  }
}

.cf-timeline-img-wrapper {
  position: relative;
  padding: 20px;
}

.cf-timeline-img {
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.1);
}

.cf-timeline-img__decor {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 70%;
  height: 70%;
  border: 2px solid rgba(91,75,245,0.2);
  border-radius: $radius-lg;
  z-index: -1;
}

// =====================
//  BENEFITS
// =====================
.cf-benefits {
  background: $surface-2;
}

.cf-benefits__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.cf-benefit-card {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-lg;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(91,75,245,0.2);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 20px;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 8px;
  }

  &__desc {
    font-size: 0.85rem;
    color: $ink-3;
    line-height: 1.6;
    margin: 0;
  }
}

// =====================
//  PROFILES
// =====================
.cf-profiles {
  background: $surface;
}

.cf-profiles__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.cf-profile-card {
  border-radius: $radius-xl;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
  }

  &--client {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &--provider {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &__header {
    padding: 48px 32px 32px;
    text-align: center;
    color: #fff;
  }

  &__icon {
    font-size: 3rem;
    background: rgba(255,255,255,0.15);
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    backdrop-filter: blur(8px);
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  &__sub {
    font-size: 0.9rem;
    opacity: 0.85;
  }

  &__features {
    background: $surface;
    padding: 32px;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 0 32px 40px;
    padding: 14px 24px;
    border-radius: 100px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.25s;

    &--light {
      background: #fff;
      color: #667eea;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255,255,255,0.3);
      }
    }

    &--dark {
      background: rgba(0,0,0,0.3);
      color: #fff;
      backdrop-filter: blur(8px);

      &:hover {
        background: rgba(0,0,0,0.4);
        transform: translateY(-2px);
      }
    }
  }
}

.cf-profile-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 0.9rem;
  color: $ink-2;
  border-bottom: 1px solid $surface-3;

  &:last-child {
    border-bottom: none;
  }

  &__check {
    width: 22px;
    height: 22px;
    background: #D1FAE5;
    color: #065F46;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }
}

// =====================
//  FAQ
// =====================
.cf-faq {
  background: $surface-2;
}

.cf-faq__list {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-faq-item {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;

  &--open {
    border-color: rgba(91,75,245,0.3);
    .cf-faq-item__q { color: $accent; }
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    font-size: 0.95rem;
    font-weight: 600;
    color: $ink;
    gap: 12px;
    user-select: none;
  }

  &__chevron {
    font-size: 1.3rem;
    font-weight: 400;
    color: $ink-3;
    flex-shrink: 0;
  }

  &__a {
    padding: 0 22px 18px;
    font-size: 0.88rem;
    color: $ink-3;
    line-height: 1.7;
    border-top: 1px solid $surface-3;
    padding-top: 14px;
  }
}

// =====================
//  CTA FINAL
// =====================
.cf-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 100px 0;
}

.cf-cta-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cf-cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);

  &--1 {
    width: 450px; height: 450px;
    top: -150px; left: -80px;
    background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
  }
  &--2 {
    width: 350px; height: 350px;
    bottom: -100px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
  }
}

.cf-cta__inner {
  position: relative;
  z-index: 2;
  text-align: center;
}

.cf-cta__label {
  display: inline-block;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: rgba(91,75,245,0.15);
  border: 1px solid rgba(91,75,245,0.3);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 18px;
}

.cf-cta__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 16px;
}

.cf-cta__sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  margin: 0 0 32px;
}

.cf-cta__btns {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cf-cta-white {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  color: $ink;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.25s;

  &:hover {
    background: $accent-lt;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255,255,255,0.15);
  }
}

.cf-cta-outline-white {
  display: inline-flex;
  align-items: center;
  color: rgba(255,255,255,0.55);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 14px 28px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s;

  &:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.06);
  }
}
</style>
