<!-- pages/ContactosPage.vue -->
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
          Fale Connosco
        </div>

        <h1 class="sp-hero__heading">
          Entre em contacto<br />
          <span class="sp-heading-accent">connosco</span>
        </h1>

        <p class="sp-hero__sub">
          Estamos aqui para ajudar. Envie a sua mensagem ou utilize um dos contactos abaixo
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

    <!-- ===== INFORMAÇÕES DE CONTACTO ===== -->
    <section class="sp-section sp-contact-info">
      <div class="sp-container">
        <div class="sp-contact-info__grid">
          <div v-for="info in contactInfo" :key="info.titulo" class="sp-info-card">
            <div class="sp-info-card__icon" :style="`background: ${info.bg}`">
              <span>{{ info.emoji }}</span>
            </div>
            <h3 class="sp-info-card__title">{{ info.titulo }}</h3>
            <p class="sp-info-card__detail">{{ info.detalhe }}</p>
            <p v-if="info.detalhe2" class="sp-info-card__detail">{{ info.detalhe2 }}</p>
            <a v-if="info.link" :href="info.link" target="_blank" class="sp-info-card__link">
              {{ info.acao }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FORMULÁRIO E MAPA ===== -->
    <section class="sp-section sp-contact-form">
      <div class="sp-container">
        <div class="sp-contact-form__grid">
          <!-- Formulário -->
          <div class="sp-form-wrapper">
            <div class="sp-section-label">Envie Mensagem</div>
            <h2 class="sp-section-title">Fale connosco</h2>
            <p class="sp-contact-form__sub">
              Preencha o formulário abaixo e responderemos o mais breve possível
            </p>

            <form @submit.prevent="onSubmit" class="sp-form">
              <div class="sp-form__row">
                <div class="sp-form__group sp-form__group--half">
                  <label class="sp-form__label">Nome completo</label>
                  <input
                    v-model="form.nome"
                    type="text"
                    class="sp-form__input"
                    placeholder="Digite seu nome"
                    required
                  />
                </div>
                <div class="sp-form__group sp-form__group--half">
                  <label class="sp-form__label">E-mail</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="sp-form__input"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
              </div>

              <div class="sp-form__row">
                <div class="sp-form__group">
                  <label class="sp-form__label">Telefone</label>
                  <input
                    v-model="form.telefone"
                    type="tel"
                    class="sp-form__input"
                    placeholder="+258 84 000 0000"
                    required
                  />
                </div>
              </div>

              <div class="sp-form__row">
                <div class="sp-form__group">
                  <label class="sp-form__label">Assunto</label>
                  <select v-model="form.assunto" class="sp-form__input sp-form__select" required>
                    <option value="" disabled selected>Selecione um assunto</option>
                    <option v-for="assunto in assuntos" :key="assunto" :value="assunto">
                      {{ assunto }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="sp-form__row">
                <div class="sp-form__group">
                  <label class="sp-form__label">Mensagem</label>
                  <textarea
                    v-model="form.mensagem"
                    class="sp-form__input sp-form__textarea"
                    rows="5"
                    placeholder="Digite sua mensagem..."
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" class="sp-btn-solid sp-form__btn" :disabled="submitting">
                {{ submitting ? 'Enviando...' : 'Enviar Mensagem' }}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>

          <!-- Mapa e Localização -->
          <div class="sp-map-wrapper">
            <div class="sp-section-label">Onde Estamos</div>
            <h2 class="sp-section-title">A nossa localização</h2>
            <p class="sp-contact-form__sub">Visite-nos ou envie correspondência</p>

            <!-- No template, substitua o iframe por este: -->
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.498978042231!2d32.57364931502924!3d-25.96229198356079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69b3f6b9b9b9b%3A0x9b9b9b9b9b9b9b9b!2sMaputo%2C%20Mo%C3%A7ambique!5e0!3m2!1spt-PT!2s!4v1620000000000!5m2!1spt-PT!2s"
              width="100%"
              height="300"
              style="border: 0; border-radius: 16px"
              :allowfullscreen="true"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Localização do EstouAqui em Maputo"
            ></iframe>

            <!-- Horário de Funcionamento -->
            <div class="sp-hours-card">
              <div class="sp-hours-card__header">
                <span class="sp-hours-card__icon">⏰</span>
                <h4 class="sp-hours-card__title">Horário de Funcionamento</h4>
              </div>
              <div class="sp-hours-card__list">
                <div v-for="hour in horario" :key="hour.dia" class="sp-hours-card__item">
                  <span class="sp-hours-card__day">{{ hour.dia }}</span>
                  <span class="sp-hours-card__time">{{ hour.horario }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== REDES SOCIAIS ===== -->
    <section class="sp-section sp-social">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Redes Sociais</div>
          <h2 class="sp-section-title">Siga-nos nas redes</h2>
        </div>

        <div class="sp-social__grid">
          <a
            v-for="social in redesSociais"
            :key="social.nome"
            :href="social.link"
            target="_blank"
            rel="noopener noreferrer"
            class="sp-social-card"
            :style="`background: ${social.color}`"
          >
            <span class="sp-social-card__icon">{{ social.emoji }}</span>
            <span class="sp-social-card__name">{{ social.nome }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===== FAQ RÁPIDA ===== -->
    <section class="sp-section sp-faq">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Dúvidas Rápidas</div>
          <h2 class="sp-section-title">Antes de contactar</h2>
          <p class="sp-section-sub">Consulte as respostas para as perguntas mais frequentes</p>
        </div>

        <div class="sp-faq__list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="sp-faq-item"
            :class="{ 'sp-faq-item--open': openFaq === i }"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <div class="sp-faq-item__q">
              <span>{{ faq.pergunta }}</span>
              <span class="sp-faq-item__chevron">{{ openFaq === i ? '−' : '+' }}</span>
            </div>
            <div class="sp-faq-item__a" v-show="openFaq === i">
              {{ faq.resposta }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SUPORTE RÁPIDO / CTA ===== -->
    <section class="sp-cta-section sp-cta-section--support">
      <div class="sp-cta-section__bg">
        <div class="sp-cta__orb sp-cta__orb--1"></div>
        <div class="sp-cta__orb sp-cta__orb--2"></div>
      </div>
      <div class="sp-container sp-cta__inner sp-cta__inner--row">
        <div class="sp-cta__left">
          <div class="sp-cta__label">Suporte 24/7</div>
          <h2 class="sp-cta__title">Precisa de ajuda<br />urgente?</h2>
          <p class="sp-cta__sub">A nossa equipa de suporte está disponível para ajudar</p>
        </div>
        <div class="sp-cta__right">
          <a
            href="https://wa.me/258841234567"
            target="_blank"
            class="sp-cta-white sp-cta-white--whatsapp"
          >
            <span>WhatsApp</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

defineOptions({ name: 'ContactosPage' });

const $q = useQuasar();
const openFaq = ref(-1);
const submitting = ref(false);

const stats = [
  { value: '24/7', label: 'Suporte' },
  { value: '< 2h', label: 'Tempo de resposta' },
  { value: '98%', label: 'Satisfação' },
  { value: '3', label: 'Canais de apoio' },
];

const contactInfo = [
  {
    emoji: '📍',
    bg: '#EDE9FE',
    titulo: 'Morada',
    detalhe: 'Av. 24 de Julho, nº 123',
    detalhe2: 'Maputo - Moçambique',
    acao: 'Ver no mapa',
    link: 'https://goo.gl/maps/example',
  },
  {
    emoji: '📞',
    bg: '#DBEAFE',
    titulo: 'Telefone',
    detalhe: '+258 84 123 4567',
    detalhe2: '+258 87 123 4567',
    acao: 'Ligar agora',
    link: 'tel:+258841234567',
  },
  {
    emoji: '✉️',
    bg: '#D1FAE5',
    titulo: 'E-mail',
    detalhe: 'geral@estouaqui.co.mz',
    detalhe2: 'suporte@estouaqui.co.mz',
    acao: 'Enviar e-mail',
    link: 'mailto:geral@estouaqui.co.mz',
  },
];

const assuntos = [
  'Dúvida sobre serviços',
  'Problema com prestador',
  'Quero ser prestador',
  'Parcerias',
  'Reclamação',
  'Sugestão',
  'Outro',
];

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  assunto: '',
  mensagem: '',
});

const horario = [
  { dia: 'Segunda - Sexta', horario: '08:00 - 18:00' },
  { dia: 'Sábado', horario: '09:00 - 13:00' },
  { dia: 'Domingo', horario: 'Fechado' },
];

const faqs = [
  {
    pergunta: 'Como posso me tornar prestador?',
    resposta:
      'Basta clicar em "Sou Prestador" no menu superior e preencher o formulário de registo. Após verificação dos documentos, poderá começar a oferecer serviços.',
  },
  {
    pergunta: 'Quanto tempo demora o suporte?',
    resposta:
      'Normalmente respondemos em até 2 horas durante o horário comercial. Para emergências, utilize o WhatsApp.',
  },
  {
    pergunta: 'Posso visitar a vossa sede?',
    resposta:
      'Sim! Estamos abertos para visitas de segunda a sexta, das 9h às 17h. Recomendamos agendar com antecedência.',
  },
  {
    pergunta: 'Como reportar um problema?',
    resposta:
      'Pode reportar através deste formulário, WhatsApp ou e-mail. Teremos todo o prazer em ajudar.',
  },
];

const redesSociais = [
  { nome: 'Facebook', emoji: '📘', color: '#1877f2', link: 'https://facebook.com/estouaqui' },
  { nome: 'Instagram', emoji: '📷', color: '#e4405f', link: 'https://instagram.com/estouaqui' },
  {
    nome: 'LinkedIn',
    emoji: '🔗',
    color: '#0077b5',
    link: 'https://linkedin.com/company/estouaqui',
  },
  { nome: 'Twitter', emoji: '🐦', color: '#1da1f2', link: 'https://twitter.com/estouaqui' },
  { nome: 'YouTube', emoji: '📺', color: '#ff0000', link: 'https://youtube.com/estouaqui' },
  { nome: 'TikTok', emoji: '🎵', color: '#000000', link: 'https://tiktok.com/@estouaqui' },
];

const onSubmit = () => {
  submitting.value = true;

  setTimeout(() => {
    submitting.value = false;
    $q.notify({
      type: 'positive',
      message: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
      position: 'top',
      timeout: 3000,
    });

    form.value = {
      nome: '',
      email: '',
      telefone: '',
      assunto: '',
      mensagem: '',
    };
  }, 2000);
};
</script>

<style scoped lang="scss">
// =====================
//  TOKENS (mesmo padrão)
// =====================
$ink: #0a0a0f;
$ink-2: #3d3d4e;
$ink-3: #7b7b8e;
$surface: #ffffff;
$surface-2: #f7f7fa;
$surface-3: #ededf2;
$accent: #5b4bf5;
$accent-lt: #ede9fe;
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
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);

    &--1 {
      width: 500px;
      height: 500px;
      top: -150px;
      right: -80px;
      background: radial-gradient(circle, rgba(91, 75, 245, 0.4) 0%, transparent 70%);
    }
    &--2 {
      width: 350px;
      height: 350px;
      bottom: 0;
      left: -60px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%);
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
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
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
    color: rgba(255, 255, 255, 0.55);
    margin: 0 0 40px;
    max-width: 520px;
    line-height: 1.6;
  }

  &__stats {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: 40px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.sp-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  flex-shrink: 0;
}

.sp-heading-accent {
  background: linear-gradient(135deg, $accent 0%, #a78bfa 50%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sp-stat {
  padding: 28px 20px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-right: none;
  }

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
    color: rgba(255, 255, 255, 0.35);
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
//  CONTACT INFO CARDS
// =====================
.sp-contact-info {
  background: $surface-2;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
}

.sp-info-card {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-lg;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(91, 75, 245, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
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
    font-size: 1.2rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 12px;
  }

  &__detail {
    font-size: 0.9rem;
    color: $ink-2;
    margin: 0 0 4px;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 20px;
    color: $accent;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: gap 0.2s;

    &:hover {
      gap: 10px;
    }
  }
}

// =====================
//  FORM & MAP
// =====================
.sp-contact-form {
  background: $surface;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  &__sub {
    font-size: 0.9rem;
    color: $ink-3;
    margin: 8px 0 0;
  }
}

.sp-form-wrapper {
  .sp-section-label,
  .sp-section-title {
    text-align: left;
  }
}

.sp-form {
  margin-top: 32px;

  &__row {
    margin-bottom: 20px;
  }

  &__group {
    &--half {
      @media (min-width: 769px) {
        display: inline-block;
        width: calc(50% - 10px);
        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  &__label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: $ink-2;
    margin-bottom: 8px;
  }

  &__input {
    width: 100%;
    padding: 14px 16px;
    font-size: 0.9rem;
    font-family: inherit;
    border: 1.5px solid $surface-3;
    border-radius: $radius-md;
    background: $surface;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: $accent;
      box-shadow: 0 0 0 3px rgba(91, 75, 245, 0.1);
    }
  }

  &__textarea {
    resize: vertical;
  }

  &__select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237B7B8E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: $accent;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 14px 32px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: all 0.25s;

    &:hover:not(:disabled) {
      background: lighten($accent, 6%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(91, 75, 245, 0.35);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.sp-map-wrapper {
  .sp-section-label,
  .sp-section-title {
    text-align: left;
  }
}

.sp-map-container {
  margin: 24px 0;
  overflow: hidden;
  border-radius: $radius-md;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.sp-hours-card {
  background: $surface-2;
  border-radius: $radius-md;
  padding: 24px;
  border: 1.5px solid $surface-3;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__icon {
    font-size: 1.3rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $ink;
    margin: 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed $surface-3;

    &:last-child {
      border-bottom: none;
    }
  }

  &__day {
    font-size: 0.9rem;
    color: $ink-2;
  }

  &__time {
    font-size: 0.9rem;
    font-weight: 600;
    color: $accent;
  }
}

// =====================
//  SOCIAL
// =====================
.sp-social {
  background: $surface-2;

  &__grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 560px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.sp-social-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: $radius-md;
  text-decoration: none;
  transition: all 0.25s;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  &__icon {
    font-size: 1.3rem;
  }

  &__name {
    color: #fff;
    font-size: 0.85rem;
    font-weight: 500;
  }
}

// =====================
//  FAQ
// =====================
.sp-faq {
  background: $surface;

  &__list {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.sp-faq-item {
  background: $surface-2;
  border: 1.5px solid $surface-3;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;

  &--open {
    border-color: rgba(91, 75, 245, 0.3);
    .sp-faq-item__q {
      color: $accent;
    }
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
//  CTA / SUPORTE
// =====================
.sp-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 100px 0;

  &--support {
    .sp-cta__inner--row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 48px;
      flex-wrap: wrap;
      text-align: left;
    }
  }
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
    width: 450px;
    height: 450px;
    top: -150px;
    left: -80px;
    background: radial-gradient(circle, rgba(91, 75, 245, 0.4) 0%, transparent 70%);
  }
  &--2 {
    width: 350px;
    height: 350px;
    bottom: -100px;
    right: -60px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%);
  }
}

.sp-cta__inner {
  position: relative;
  z-index: 2;
}

.sp-cta__label {
  display: inline-block;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: rgba(91, 75, 245, 0.15);
  border: 1px solid rgba(91, 75, 245, 0.3);
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
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  margin: 0;
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
    box-shadow: 0 12px 28px rgba(255, 255, 255, 0.15);
  }

  &--whatsapp {
    background: #25d366;
    color: #fff;

    &:hover {
      background: darken(#25d366, 5%);
      box-shadow: 0 12px 28px rgba(37, 211, 102, 0.3);
    }
  }
}

// =====================
//  UTILITIES
// =====================
.sp-btn-solid {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: $accent;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(91, 75, 245, 0.35);
  }
}
</style>
