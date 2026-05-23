<!-- pages/SobrePage.vue -->
<template>
  <q-page class="sp-page">

    <!-- ===== HERO ===== -->
    <section class="sp-hero">
      <div class="sp-hero__bg">
        <div class="sp-hero__orb sp-hero__orb--1"></div>
        <div class="sp-hero__orb sp-hero__orb--2"></div>
        <div class="sp-hero__grid"></div>
      </div>

      <div class="sp-hero__content sp-container">
        <div class="sp-hero__badge">
          <span class="sp-badge__dot"></span>
          Sobre Nós
        </div>

        <h1 class="sp-hero__heading">
          Quem somos<br>
          <span class="sp-heading-accent">e o que fazemos</span>
        </h1>

        <p class="sp-hero__sub">
          Conheça a história do EstouAqui e a nossa missão em Moçambique
        </p>
      </div>

      <!-- Stats pills -->
      <div class="sp-hero__stats sp-container">
        <div v-for="(stat, i) in stats" :key="i" class="sp-stat">
          <span class="sp-stat__val">{{ stat.value }}</span>
          <span class="sp-stat__label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ===== NOSSA HISTÓRIA ===== -->
    <section class="sp-section sp-history">
      <div class="sp-container">
        <div class="sp-history__grid">
          <div class="sp-history__content">
            <div class="sp-section-label">Nossa História</div>
            <h2 class="sp-section-title">Como tudo começou</h2>
            <p class="sp-history__text">
              O EstouAqui nasceu em 2024 com um objetivo simples: conectar clientes e prestadores de serviços em Moçambique de forma rápida, segura e eficiente.
            </p>
            <p class="sp-history__text">
              Tudo começou quando o nosso fundador, em Maputo, precisava de um eletricista urgente e não encontrava profissionais de confiança. Percebemos que milhares de moçambicanos enfrentavam o mesmo problema diariamente.
            </p>
            <p class="sp-history__text">
              Hoje, somos a maior plataforma de serviços locais do país, com mais de 1.200 prestadores verificados e 5.000 serviços realizados com sucesso.
            </p>

            <div class="sp-quote">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M10 11h-4v-4h4v4zm8 0h-4v-4h4v4z"/>
                <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              </svg>
              <p class="sp-quote__text">
                "Acreditamos que todos merecem acesso a serviços de qualidade, e todos os profissionais merecem oportunidades para crescer."
              </p>
              <div class="sp-quote__author">— Carlos Tembe, Fundador</div>
            </div>
          </div>
          <div class="sp-history__image">
            <div class="sp-image-wrapper">
              <q-img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                class="sp-history-img"
                :ratio="4/3"
              />
              <div class="sp-image-decor"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MISSÃO, VISÃO, VALORES ===== -->
    <section class="sp-section sp-mission">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Propósito</div>
          <h2 class="sp-section-title">Missão, Visão e Valores</h2>
        </div>

        <div class="sp-mission__grid">
          <div class="sp-mission-card">
            <div class="sp-mission-card__icon" style="background: #EDE9FE">🎯</div>
            <h3 class="sp-mission-card__title">Missão</h3>
            <p class="sp-mission-card__text">
              Democratizar o acesso a serviços de qualidade em Moçambique, conectando clientes a profissionais verificados.
            </p>
          </div>

          <div class="sp-mission-card">
            <div class="sp-mission-card__icon" style="background: #DBEAFE">👁️</div>
            <h3 class="sp-mission-card__title">Visão</h3>
            <p class="sp-mission-card__text">
              Ser a principal referência em serviços locais em África, reconhecida pela qualidade, confiança e inovação.
            </p>
          </div>

          <div class="sp-mission-card">
            <div class="sp-mission-card__icon" style="background: #D1FAE5">💎</div>
            <h3 class="sp-mission-card__title">Valores</h3>
            <ul class="sp-values-list">
              <li v-for="value in values" :key="value">
                <span class="sp-values-list__check">✓</span>
                {{ value }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== NÚMEROS ===== -->
    <section class="sp-section sp-numbers">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Em Números</div>
          <h2 class="sp-section-title">O EstouAqui em números</h2>
        </div>

        <div class="sp-numbers__grid">
          <div v-for="(num, i) in numbers" :key="i" class="sp-number-card">
            <div class="sp-number-card__value">{{ num.value }}</div>
            <div class="sp-number-card__label">{{ num.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== EQUIPA ===== -->
    <section class="sp-section sp-team">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Equipa</div>
          <h2 class="sp-section-title">Quem faz o EstouAqui</h2>
          <p class="sp-section-sub">Conheça as pessoas por trás da plataforma</p>
        </div>

        <div class="sp-team__grid">
          <div v-for="member in team" :key="member.nome" class="sp-team-card">
            <div class="sp-team-card__avatar">
              <img :src="member.avatar" :alt="member.nome">
            </div>
            <h4 class="sp-team-card__name">{{ member.nome }}</h4>
            <p class="sp-team-card__role">{{ member.cargo }}</p>
            <p class="sp-team-card__bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== DIFERENCIAIS ===== -->
    <section class="sp-section sp-diffs">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Diferenciais</div>
          <h2 class="sp-section-title">Porquê escolher o EstouAqui?</h2>
        </div>

        <div class="sp-diffs__grid">
          <div v-for="reason in reasons" :key="reason.title" class="sp-diff-card">
            <div class="sp-diff-card__icon" :style="`background: ${reason.bg}`">{{ reason.emoji }}</div>
            <h4 class="sp-diff-card__title">{{ reason.title }}</h4>
            <p class="sp-diff-card__desc">{{ reason.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== LINHA DO TEMPO (estilo FAQ) ===== -->
    <section class="sp-section sp-timeline">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Linha do Tempo</div>
          <h2 class="sp-section-title">A nossa jornada</h2>
        </div>

        <div class="sp-timeline__list">
          <div
            v-for="(event, i) in timeline"
            :key="i"
            class="sp-timeline-item"
            :class="{ 'sp-timeline-item--open': openTimeline === i }"
            @click="openTimeline = openTimeline === i ? -1 : i"
          >
            <div class="sp-timeline-item__q">
              <div class="sp-timeline-item__year">{{ event.ano }}</div>
              <span class="sp-timeline-item__title">{{ event.titulo }}</span>
              <span class="sp-timeline-item__chevron">{{ openTimeline === i ? '−' : '+' }}</span>
            </div>
            <div class="sp-timeline-item__a" v-show="openTimeline === i">
              {{ event.descricao }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="sp-cta-section">
      <div class="sp-cta-section__bg">
        <div class="sp-cta__orb sp-cta__orb--1"></div>
        <div class="sp-cta__orb sp-cta__orb--2"></div>
      </div>
      <div class="sp-container sp-cta__inner">
        <div class="sp-cta__label">Faça parte</div>
        <h2 class="sp-cta__title">Faça parte<br>desta história</h2>
        <p class="sp-cta__sub">Junte-se a nós e ajude a construir o futuro dos serviços em Moçambique</p>
        <div class="sp-cta__btns">
          <router-link to="/auth/register-cliente" class="sp-cta-white">
            Criar conta grátis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </router-link>
          <router-link to="/auth/register-prestador" class="sp-cta-ghost">
            Sou prestador
          </router-link>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'SobrePage' })

const openTimeline = ref(-1)

const stats = [
  { value: '2024', label: 'Ano de Fundação' },
  { value: '1.2k+', label: 'Prestadores' },
  { value: '5k+', label: 'Serviços Realizados' },
  { value: '98%', label: 'Satisfação' },
]

const values = [
  'Confiança e Transparência',
  'Qualidade e Excelência',
  'Inovação constante',
  'Compromisso com a comunidade',
  'Respeito e ética',
]

const numbers = [
  { value: '2024', label: 'Fundação' },
  { value: '1.2k+', label: 'Prestadores' },
  { value: '5k+', label: 'Serviços' },
  { value: '30+', label: 'Categorias' },
  { value: '98%', label: 'Satisfação' },
  { value: '3', label: 'Cidades' },
]

const team = [
  {
    nome: 'Carlos Tembe',
    cargo: 'Fundador & CEO',
    bio: 'Empreendedor social com paixão por conectar pessoas e criar oportunidades.',
    avatar: 'https://i.pravatar.cc/120?img=7',
  },
  {
    nome: 'Amélia Macuácua',
    cargo: 'Diretora de Operações',
    bio: 'Especialista em gestão de projetos e otimização de processos.',
    avatar: 'https://i.pravatar.cc/120?img=5',
  },
  {
    nome: 'João Mondlane',
    cargo: 'CTO',
    bio: 'Engenheiro de software com experiência em plataformas de marketplace.',
    avatar: 'https://i.pravatar.cc/120?img=8',
  },
  {
    nome: 'Helena Nhampossa',
    cargo: 'Marketing',
    bio: 'Especialista em crescimento e comunicação estratégica.',
    avatar: 'https://i.pravatar.cc/120?img=6',
  },
]

const reasons = [
  { emoji: '🔒', bg: '#EDE9FE', title: 'Segurança', description: 'Verificamos todos os prestadores para sua tranquilidade.' },
  { emoji: '⚡', bg: '#FEF3C7', title: 'Rapidez', description: 'Encontre profissionais próximos em minutos.' },
  { emoji: '💬', bg: '#DBEAFE', title: 'Suporte Dedicado', description: 'Equipa pronta para ajudar 24/7.' },
  { emoji: '💰', bg: '#D1FAE5', title: 'Pagamento Seguro', description: 'Múltiplas opções com garantia de devolução.' },
]

const timeline = [
  { ano: '2024', titulo: 'Fundação', descricao: 'O EstouAqui é fundado em Maputo com a missão de revolucionar o setor de serviços.' },
  { ano: '2024', titulo: 'Lançamento', descricao: 'Plataforma é lançada oficialmente com 10 categorias de serviços.' },
  { ano: '2025', titulo: 'Expansão', descricao: 'Alcance de 500 prestadores e expansão para Matola e Boane.' },
  { ano: '2025', titulo: 'Marco', descricao: 'Atingimos 1.000 serviços realizados com sucesso.' },
  { ano: '2026', titulo: 'Crescimento', descricao: 'Mais de 1.200 prestadores e 5.000 serviços realizados.' },
]
</script>

<style scoped lang="scss">
// =====================
//  TOKENS (mesmo padrão)
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
.sp-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $surface;
  color: $ink;
  overflow-x: hidden;
}

.sp-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

// =====================
//  HERO
// =====================
.sp-hero {
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

.sp-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 6px #4ADE80;
  flex-shrink: 0;
}

.sp-heading-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sp-stat {
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
.sp-section {
  padding: 96px 0;
}

.sp-section-header {
  text-align: center;
  margin-bottom: 52px;
}

.sp-section-label {
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

.sp-section-title {
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  font-weight: 800;
  color: $ink;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px;
}

.sp-section-sub {
  font-size: 1rem;
  color: $ink-3;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

// =====================
//  HISTORY
// =====================
.sp-history {
  background: $surface;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  &__content {
    .sp-section-label,
    .sp-section-title {
      text-align: left;
    }
  }

  &__text {
    font-size: 0.95rem;
    color: $ink-2;
    line-height: 1.7;
    margin-bottom: 16px;
  }
}

.sp-quote {
  background: $surface-2;
  border-radius: $radius-md;
  padding: 28px;
  margin-top: 32px;
  border-left: 3px solid $accent;

  svg {
    color: $accent;
    margin-bottom: 12px;
    opacity: 0.6;
  }

  &__text {
    font-size: 1rem;
    font-style: italic;
    color: $ink;
    line-height: 1.6;
    margin: 0 0 12px;
  }

  &__author {
    font-size: 0.85rem;
    font-weight: 600;
    color: $accent;
  }
}

.sp-history__image {
  position: relative;
}

.sp-image-wrapper {
  position: relative;
  padding: 20px;
}

.sp-history-img {
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.1);
}

.sp-image-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 70%;
  height: 70%;
  border: 2px solid rgba(91,75,245,0.2);
  border-radius: $radius-lg;
  z-index: -1;
}

// =====================
//  MISSION
// =====================
.sp-mission {
  background: $surface-2;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
}

.sp-mission-card {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-lg;
  padding: 40px 32px;
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
    font-size: 1.8rem;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 16px;
  }

  &__text {
    font-size: 0.9rem;
    color: $ink-3;
    line-height: 1.7;
    margin: 0;
  }
}

.sp-values-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: $ink-2;
    padding: 8px 0;
    border-bottom: 1px solid $surface-3;

    &:last-child {
      border-bottom: none;
    }
  }

  &__check {
    width: 20px;
    height: 20px;
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
//  NUMBERS
// =====================
.sp-numbers {
  background: $surface;

  &__grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 560px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.sp-number-card {
  background: $surface-2;
  border-radius: $radius-md;
  padding: 28px 16px;
  text-align: center;
  transition: all 0.25s;
  border: 1.5px solid transparent;

  &:hover {
    border-color: rgba(91,75,245,0.2);
    transform: translateY(-4px);
  }

  &__value {
    font-size: 2rem;
    font-weight: 800;
    color: $accent;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  &__label {
    font-size: 0.8rem;
    color: $ink-3;
  }
}

// =====================
//  TEAM
// =====================
.sp-team {
  background: $surface-2;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }
}

.sp-team-card {
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

  &__avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid $accent;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__name {
    font-size: 1.1rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 4px;
  }

  &__role {
    font-size: 0.8rem;
    color: $accent;
    font-weight: 600;
    margin-bottom: 12px;
  }

  &__bio {
    font-size: 0.85rem;
    color: $ink-3;
    line-height: 1.6;
    margin: 0;
  }
}

// =====================
//  DIFFERENTIALS
// =====================
.sp-diffs {
  background: $surface;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }
}

.sp-diff-card {
  text-align: center;
  padding: 32px 24px;
  background: $surface-2;
  border-radius: $radius-md;
  transition: all 0.25s;
  border: 1.5px solid transparent;

  &:hover {
    border-color: rgba(91,75,245,0.2);
    transform: translateY(-4px);
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin: 0 auto 20px;
  }

  &__title {
    font-size: 1rem;
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
//  TIMELINE (estilo FAQ)
// =====================
.sp-timeline {
  background: $surface-2;

  &__list {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.sp-timeline-item {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;

  &--open {
    border-color: rgba(91,75,245,0.3);
    .sp-timeline-item__q { color: $accent; }
  }

  &__q {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
    font-size: 0.95rem;
    font-weight: 600;
    color: $ink;
    user-select: none;
  }

  &__year {
    background: $accent-lt;
    color: $accent;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__title {
    flex: 1;
  }

  &__chevron {
    font-size: 1.3rem;
    font-weight: 400;
    color: $ink-3;
    flex-shrink: 0;
    line-height: 1;
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
.sp-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 100px 0;
}

.sp-cta-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sp-cta__orb {
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

.sp-cta__inner {
  position: relative;
  z-index: 2;
  text-align: center;
}

.sp-cta__label {
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

.sp-cta__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 16px;
}

.sp-cta__sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  margin: 0 0 32px;
}

.sp-cta__btns {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sp-cta-white {
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

.sp-cta-ghost {
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
