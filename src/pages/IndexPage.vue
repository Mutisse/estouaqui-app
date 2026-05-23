<template>
  <q-page class="ea-page">

    <!-- ===== HERO ===== -->
    <section class="ea-hero">
      <div class="ea-hero__bg">
        <div class="ea-hero__noise"></div>
        <div class="ea-hero__orb ea-hero__orb--1"></div>
        <div class="ea-hero__orb ea-hero__orb--2"></div>
        <div class="ea-hero__orb ea-hero__orb--3"></div>
        <div class="ea-hero__grid"></div>
      </div>

      <!-- Hero image right side -->
      <div class="ea-hero__image-side">
        <q-img
          src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=85"
          class="ea-hero__photo"
          fit="cover"
        />
        <div class="ea-hero__image-overlay"></div>
      </div>

      <div class="ea-hero__content ea-container">
        <div class="ea-hero__badge">
          <span class="ea-badge__dot"></span>
          Já disponível em Maputo
        </div>

        <h1 class="ea-hero__heading">
          O profissional certo,<br>
          <span class="ea-heading-accent">perto de si</span>
        </h1>

        <p class="ea-hero__sub">
          Conectamos clientes e prestadores de serviços em Moçambique —<br class="ea-br-hide">
          rápido, seguro e sem complicações.
        </p>

        <div class="ea-hero__actions">
          <a href="/auth/register-cliente" class="ea-cta-primary">
            <span>Preciso de um serviço</span>
            <q-icon name="arrow_forward" size="18px" />
          </a>
          <a href="/auth/register-prestador" class="ea-cta-ghost">
            Oferecer serviços
          </a>
        </div>

        <div class="ea-hero__trust">
          <div class="ea-trust-avatars">
            <div class="ea-trust-av" style="background:#C8B6E2">A</div>
            <div class="ea-trust-av" style="background:#B6D4E2">M</div>
            <div class="ea-trust-av" style="background:#E2C8B6">F</div>
            <div class="ea-trust-av" style="background:#B6E2C8">J</div>
          </div>
          <span class="ea-trust-text"><strong>1.200+</strong> clientes satisfeitos este mês</span>
        </div>
      </div>

      <div class="ea-hero__cards-float">
        <div class="ea-float-card ea-float-card--1">
          <div class="ea-float-card__icon">
            <q-icon name="bolt" size="20px" />
          </div>
          <div>
            <div class="ea-float-card__title">João Maputo</div>
            <div class="ea-float-card__sub">Eletricista · 4.9 ★</div>
          </div>
        </div>
        <div class="ea-float-card ea-float-card--2">
          <div class="ea-float-card__icon">
            <q-icon name="check_circle" size="20px" />
          </div>
          <div>
            <div class="ea-float-card__title">Serviço concluído</div>
            <div class="ea-float-card__sub">há 2 minutos</div>
          </div>
        </div>
        <div class="ea-float-card ea-float-card--3">
          <div class="ea-float-card__icon">
            <q-icon name="location_on" size="20px" />
          </div>
          <div>
            <div class="ea-float-card__title">3 perto de si</div>
            <div class="ea-float-card__sub">Disponíveis agora</div>
          </div>
        </div>
      </div>

      <div class="ea-hero__scroll-hint">
        <div class="ea-scroll-line"></div>
        <span>Explorar</span>
      </div>
    </section>

    <!-- ===== STATS BAR ===== -->
    <section class="ea-stats-bar">
      <div class="ea-container ea-stats-bar__inner">
        <div v-for="(stat, i) in stats" :key="i" class="ea-stat">
          <div class="ea-stat__value">{{ stat.value }}</div>
          <div class="ea-stat__label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- ===== CATEGORIAS ===== -->
    <section class="ea-section ea-categories">
      <div class="ea-container">
        <div class="ea-section-header">
          <div class="ea-section-label">Categorias</div>
          <h2 class="ea-section-title">Os serviços mais procurados</h2>
          <p class="ea-section-sub">Tudo o que precisa, a um clique de distância</p>
        </div>

        <div class="ea-cat-grid">
          <div
            v-for="(cat, i) in categorias"
            :key="cat.nome"
            class="ea-cat-card"
            :style="`--cat-color: ${cat.hex}; --cat-bg: ${cat.bgHex}; animation-delay: ${i * 0.04}s`"
            @click="buscarPorCategoria(cat.nome)"
          >
            <div class="ea-cat-card__icon">
              <q-icon :name="cat.icon" size="28px" />
            </div>
            <div class="ea-cat-card__name">{{ cat.nome }}</div>
            <div class="ea-cat-card__count">{{ cat.count }}+ serviços</div>
            <div class="ea-cat-card__arrow">
              <q-icon name="arrow_forward" size="16px" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== COMO FUNCIONA ===== -->
    <section class="ea-section ea-how">
      <div class="ea-container">
        <div class="ea-section-header">
          <div class="ea-section-label">Processo</div>
          <h2 class="ea-section-title">Em 3 passos simples</h2>
        </div>

        <div class="ea-steps">
          <div v-for="(step, i) in steps" :key="i" class="ea-step">
            <div class="ea-step__num">0{{ i + 1 }}</div>
            <div class="ea-step__connector" v-if="i < steps.length - 1"></div>
            <div class="ea-step__icon">
              <q-icon :name="step.icon" size="32px" />
            </div>
            <div class="ea-step__title">{{ step.title }}</div>
            <p class="ea-step__desc">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== DESTAQUES / WHY ===== -->
    <section class="ea-section ea-why">
      <div class="ea-container ea-why__inner">
        <div class="ea-why__left">
          <div class="ea-section-label">Porquê nós</div>
          <h2 class="ea-section-title">Construído para<br>Moçambique</h2>
          <p class="ea-why__body">
            Uma plataforma pensada para a realidade local — com geolocalização inteligente, pagamento flexível e suporte em português.
          </p>
          <a href="/sobre" class="ea-link-arrow">Saber mais <span>→</span></a>

          <div class="ea-why__image-block">
            <q-img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80"
              class="ea-why__img"
              :ratio="4/3"
            />
            <div class="ea-why__img-badge">
              <span>⭐ 4.8</span>
              <span>Avaliação média</span>
            </div>
          </div>
        </div>

        <div class="ea-why__right">
          <div v-for="(r, i) in reasons" :key="i" class="ea-reason" :style="`animation-delay: ${i * 0.1}s`">
            <div class="ea-reason__icon" :style="`background: ${r.bg}`">
              <q-icon :name="r.icon" size="20px" />
            </div>
            <div>
              <div class="ea-reason__title">{{ r.title }}</div>
              <div class="ea-reason__desc">{{ r.description }}</div>
            </div>
          </div>

          <!-- Mini testimonial -->
          <div class="ea-testimonial">
            <p class="ea-testimonial__text">"Encontrei um eletricista em menos de 10 minutos. Serviço excelente e preço justo!"</p>
            <div class="ea-testimonial__author">
              <div class="ea-testimonial__av">AM</div>
              <div>
                <div class="ea-testimonial__name">Ana Mahumane</div>
                <div class="ea-testimonial__role">Cliente · Maputo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="ea-cta-section">
      <div class="ea-cta-section__bg">
        <div class="ea-cta__orb ea-cta__orb--1"></div>
        <div class="ea-cta__orb ea-cta__orb--2"></div>
      </div>
      <div class="ea-container ea-cta__inner">
        <div class="ea-cta__label">Comece hoje</div>
        <h2 class="ea-cta__title">Pronto para<br>começar?</h2>
        <p class="ea-cta__sub">Junte-se à maior comunidade de serviços locais de Moçambique</p>
        <div class="ea-cta__btns">
          <a href="/auth/register-cliente" class="ea-cta-white">
            Criar conta de cliente
            <q-icon name="arrow_forward" size="16px" />
          </a>
          <a href="/auth/register-prestador" class="ea-cta-outline-white">
            Registar como prestador
          </a>
        </div>
        <div class="ea-cta__note">Gratuito • Sem cartão de crédito • Acesso imediato</div>
      </div>
    </section>

  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomePage' })
import { useRouter } from 'vue-router'
const router = useRouter()

const stats = [
  { value: '500+', label: 'Prestadores verificados' },
  { value: '1.2k+', label: 'Clientes activos' },
  { value: '3k+', label: 'Serviços realizados' },
  { value: '4.8★', label: 'Avaliação média' },
]

const steps = [
  { icon: 'search', title: 'Encontre', description: 'Pesquise por categoria, localização ou nome. Veja perfis e avaliações reais.' },
  { icon: 'chat', title: 'Conecte', description: 'Converse com o prestador, combine horário, local e preço.' },
  { icon: 'star', title: 'Avalie', description: 'Após o serviço, avalie e ajude a comunidade a crescer.' },
]

const categorias = [
  { nome: 'Eletricista',    icon: 'bolt',        hex: '#F59E0B', bgHex: '#FEF3C7', count: 45 },
  { nome: 'Canalizador',   icon: 'water_drop',   hex: '#3B82F6', bgHex: '#DBEAFE', count: 32 },
  { nome: 'Pintor',        icon: 'brush',       hex: '#8B5CF6', bgHex: '#EDE9FE', count: 28 },
  { nome: 'Informático',   icon: 'computer',    hex: '#10B981', bgHex: '#D1FAE5', count: 56 },
  { nome: 'Cabeleireiro',  icon: 'content_cut', hex: '#EC4899', bgHex: '#FCE7F3', count: 34 },
  { nome: 'Manicure',      icon: 'spa',         hex: '#F472B6', bgHex: '#FDF2F8', count: 41 },
  { nome: 'Limpeza',       icon: 'cleaning_services', hex: '#06B6D4', bgHex: '#CFFAFE', count: 23 },
  { nome: 'Motorista',     icon: 'directions_car', hex: '#14B8A6', bgHex: '#CCFBF1', count: 67 },
]

const reasons = [
  { icon: 'verified',     bg: '#EDE9FE', title: 'Prestadores verificados', description: 'Todos passam por verificação de identidade e têm avaliações auténticas.' },
  { icon: 'location_on',  bg: '#D1FAE5', title: 'Geolocalização inteligente', description: 'Encontra os profissionais mais próximos de si em tempo real.' },
  { icon: 'bolt',         bg: '#FEF3C7', title: 'Resposta em minutos', description: 'A maioria dos prestadores responde em menos de 15 minutos.' },
  { icon: 'support_agent',bg: '#DBEAFE', title: 'Suporte dedicado', description: 'Equipa de suporte disponível para resolver qualquer questão.' },
]

const buscarPorCategoria = (categoria: string) => {
  void router.push(`/mobile/lista-prestadores?categoria=${categoria}`)
}
</script>

<style scoped lang="scss">
// =====================
//  TOKENS
// =====================
$ink: #0A0A0F;
$ink-2: #3D3D4E;
$ink-3: #7B7B8E;
$surface: #FFFFFF;
$surface-2: #F7F7FA;
$surface-3: #EDEDF2;
$accent: #5B4BF5;      // electric violet
$accent-2: #7C3AED;
$accent-light: #EDE9FE;
$gold: #F59E0B;
$radius-sm: 10px;
$radius-md: 16px;
$radius-lg: 24px;
$radius-xl: 32px;

// =====================
//  RESET / BASE
// =====================
.ea-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $surface;
  color: $ink;
  overflow-x: hidden;
}

.ea-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
}

// =====================
//  HERO
// =====================
.ea-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $ink;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  &__noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);

    &--1 {
      width: 600px; height: 600px;
      top: -200px; right: -100px;
      background: radial-gradient(circle, rgba(91,75,245,0.45) 0%, transparent 70%);
    }
    &--2 {
      width: 400px; height: 400px;
      bottom: 100px; left: -100px;
      background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    }
    &--3 {
      width: 300px; height: 300px;
      top: 40%; right: 30%;
      background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
    }
  }

  &__image-side {
    position: absolute;
    top: 0;
    right: 0;
    width: 48%;
    height: 100%;
    z-index: 1;

    @media (max-width: 900px) {
      width: 100%;
      opacity: 0.18;
    }
  }

  &__photo {
    width: 100%;
    height: 100%;
  }

  &__image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, $ink 0%, $ink 10%, rgba(10,10,15,0.55) 60%, transparent 100%);

    @media (max-width: 900px) {
      background: transparent;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 100px 24px 160px;
    max-width: 640px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.85);
    font-size: 0.85rem;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 28px;
    backdrop-filter: blur(10px);
    width: fit-content;
  }

  &__heading {
    font-size: clamp(3rem, 6vw, 5.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 24px;
  }

  &__sub {
    font-size: clamp(1.05rem, 2vw, 1.25rem);
    color: rgba(255,255,255,0.6);
    line-height: 1.6;
    margin: 0 0 40px;
    max-width: 560px;
  }

  &__actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 48px;
  }

  &__trust {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__cards-float {
    position: absolute;
    right: 6%;
    top: 50%;
    transform: translateY(-45%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 3;

    @media (max-width: 1024px) {
      display: none;
    }
  }

  &__scroll-hint {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 5;
    color: rgba(255,255,255,0.3);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
}

// Hero badge dot
.ea-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 8px #4ADE80;
  flex-shrink: 0;
}

// Heading accent
.ea-heading-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// CTAs
.ea-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: $accent;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.25s;
  box-shadow: 0 0 0 0 rgba(91,75,245,0);

  &:hover {
    background: lighten($accent, 5%);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(91,75,245,0.45);
  }
}
.ea-cta-ghost {
  display: inline-flex;
  align-items: center;
  color: rgba(255,255,255,0.75);
  font-size: 1rem;
  font-weight: 500;
  padding: 14px 24px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 100px;
  text-decoration: none;
  backdrop-filter: blur(8px);
  background: rgba(255,255,255,0.05);
  transition: all 0.25s;

  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
  }
}

// Trust avatars
.ea-trust-avatars {
  display: flex;

  .ea-trust-av {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 700;
    color: $ink;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid $ink;
    margin-left: -8px;

    &:first-child { margin-left: 0; }
  }
}
.ea-trust-text {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  strong { color: rgba(255,255,255,0.85); }
}

// Float cards
.ea-float-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(20px);
  border-radius: $radius-md;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 240px;
  animation: ea-float linear infinite;

  &--1 { animation-duration: 6s; animation-delay: 0s; }
  &--2 { animation-duration: 7s; animation-delay: -2s; }
  &--3 { animation-duration: 8s; animation-delay: -4s; }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $accent;
  }
  &__title { font-size: 0.9rem; font-weight: 600; color: #fff; }
  &__sub { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
}

@keyframes ea-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

// Scroll hint line
.ea-scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.3));
}

// =====================
//  STATS BAR
// =====================
.ea-stats-bar {
  background: $ink;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 32px 0;

  &__inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;

    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px 0;
    }
  }
}
.ea-stat {
  text-align: center;
  padding: 0 20px;
  border-right: 1px solid rgba(255,255,255,0.06);

  &:last-child { border-right: none; }

  &__value {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  &__label {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.4);
    margin-top: 4px;
  }
}

// =====================
//  SECTIONS SHARED
// =====================
.ea-section {
  padding: 100px 0;
}

.ea-section-header {
  text-align: center;
  margin-bottom: 60px;
}

.ea-section-label {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: $accent-light;
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 16px;
}

.ea-section-title {
  font-size: clamp(1.9rem, 3.5vw, 2.8rem);
  font-weight: 800;
  color: $ink;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 14px;
}

.ea-section-sub {
  font-size: 1.05rem;
  color: $ink-3;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

// =====================
//  CATEGORIES
// =====================
.ea-categories {
  background: $surface-2;
}

.ea-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr 1fr; gap: 10px; }
}

.ea-cat-card {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-md;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--cat-bg) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.25s;
  }

  &:hover {
    border-color: var(--cat-color);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);

    &::before { opacity: 1; }

    .ea-cat-card__arrow { opacity: 1; transform: translateX(0); }
  }

  &__icon {
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
    color: var(--cat-color);
  }

  &__name {
    font-size: 0.95rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  &__count {
    font-size: 0.8rem;
    color: $ink-3;
    position: relative;
    z-index: 1;
  }

  &__arrow {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--cat-color);
    opacity: 0;
    transform: translateX(-6px);
    transition: all 0.2s;
    z-index: 1;
  }
}

// =====================
//  HOW IT WORKS
// =====================
.ea-how {
  background: $surface;
}

.ea-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.ea-step {
  position: relative;
  text-align: center;

  &__num {
    font-size: 0.72rem;
    font-weight: 800;
    color: $accent;
    letter-spacing: 0.08em;
    margin-bottom: 20px;
  }

  &__connector {
    position: absolute;
    top: 68px;
    right: -24px;
    width: 48px;
    height: 1px;
    background: linear-gradient(to right, $surface-3, transparent);

    @media (max-width: 768px) { display: none; }
  }

  &__icon {
    width: 72px;
    height: 72px;
    background: $surface-2;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    border: 1.5px solid $surface-3;
    transition: all 0.25s;
    color: $accent;
  }

  &:hover .ea-step__icon {
    background: $accent-light;
    border-color: $accent;
    transform: scale(1.05);
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 10px;
  }

  &__desc {
    font-size: 0.9rem;
    color: $ink-3;
    line-height: 1.6;
    max-width: 260px;
    margin: 0 auto;
  }
}

// =====================
//  WHY US
// =====================
.ea-why {
  background: $surface-2;

  &__inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 48px;
    }
  }

  &__left {
    .ea-section-label, .ea-section-title { text-align: left; }
  }

  &__body {
    font-size: 1rem;
    color: $ink-2;
    line-height: 1.7;
    margin: 0 0 24px;
  }

  &__image-block {
    position: relative;
    margin-top: 40px;

    .ea-why__img {
      border-radius: $radius-lg;
      overflow: hidden;
      box-shadow: 0 24px 48px rgba(0,0,0,0.1);
    }
  }

  &__img-badge {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: $surface;
    border-radius: $radius-md;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);

    span:first-child {
      font-size: 1.2rem;
      font-weight: 800;
      color: $ink;
    }
    span:last-child {
      font-size: 0.78rem;
      color: $ink-3;
    }
  }
}

.ea-link-arrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $accent;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: gap 0.2s;
  &:hover { gap: 10px; }
}

.ea-reason {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 24px;
  background: $surface;
  border-radius: $radius-md;
  border: 1.5px solid $surface-3;
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    border-color: $accent;
    box-shadow: 0 8px 24px rgba(91,75,245,0.08);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: $accent;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 0.85rem;
    color: $ink-3;
    line-height: 1.5;
  }
}

.ea-testimonial {
  background: $ink;
  border-radius: $radius-md;
  padding: 28px;
  margin-top: 8px;

  &__text {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.8);
    line-height: 1.6;
    font-style: italic;
    margin: 0 0 20px;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__av {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: $accent;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #fff;
  }

  &__role {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.45);
  }
}

// =====================
//  FINAL CTA
// =====================
.ea-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 120px 0;
  text-align: center;
}

.ea-cta-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ea-cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);

  &--1 {
    width: 500px; height: 500px;
    top: -200px; left: -100px;
    background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
  }
  &--2 {
    width: 400px; height: 400px;
    bottom: -150px; right: -50px;
    background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
  }
}

.ea-cta__inner {
  position: relative;
  z-index: 2;
}

.ea-cta__label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: rgba(91,75,245,0.15);
  border: 1px solid rgba(91,75,245,0.3);
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
}

.ea-cta__title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 20px;
}

.ea-cta__sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.5);
  margin: 0 0 48px;
  line-height: 1.6;
}

.ea-cta__btns {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.ea-cta-white {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  color: $ink;
  font-size: 1rem;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.25s;

  &:hover {
    background: #f0effe;
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(255,255,255,0.15);
  }
}

.ea-cta-outline-white {
  display: inline-flex;
  align-items: center;
  color: rgba(255,255,255,0.75);
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 32px;
  border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 100px;
  text-decoration: none;
  backdrop-filter: blur(8px);
  background: rgba(255,255,255,0.05);
  transition: all 0.25s;

  &:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.08);
  }
}

.ea-cta__note {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.04em;
}

// =====================
//  UTILITIES
// =====================
.ea-br-hide {
  @media (max-width: 600px) { display: none; }
}
</style>
