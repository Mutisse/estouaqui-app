<template>
  <div class="ea-error-page">

    <!-- ===== HERO BG (mesmo padrão) ===== -->
    <section class="ea-error-hero">
      <div class="ea-error-hero__bg">
        <div class="ea-error-hero__noise"></div>
        <div class="ea-error-hero__orb ea-error-hero__orb--1"></div>
        <div class="ea-error-hero__orb ea-error-hero__orb--2"></div>
        <div class="ea-error-hero__orb ea-error-hero__orb--3"></div>
        <div class="ea-error-hero__grid"></div>
      </div>

      <div class="ea-error-hero__container">

        <!-- LADO ESQUERDO: IMAGEM LOCAL -->
        <div class="ea-error-hero__left">
          <div class="ea-error-image">
            <q-img
              src="/404_page-not-found-768x432.png"
              class="error-image"
              fit="contain"
              spinner-color="primary"
            />
            <div class="ea-error-image__overlay"></div>
          </div>
        </div>

        <!-- LADO DIREITO: CONTEÚDO -->
        <div class="ea-error-hero__right">

          <!-- Badge -->
          <div class="ea-error-badge">
            <span class="ea-badge__dot"></span>
            Erro 404
          </div>

          <!-- Código do erro -->
          <div class="ea-error-code">
            <span class="digit" v-for="(digit, index) in '404'" :key="index">
              {{ digit }}
            </span>
          </div>

          <!-- Mensagem -->
          <h1 class="ea-error-title">
            Página não <span class="ea-title-accent">encontrada</span>
          </h1>

          <p class="ea-error-description">
            A página que você está procurando pode ter sido removida,<br>
            teve o nome alterado ou está temporariamente indisponível.
          </p>

          <!-- Botões -->
          <div class="ea-error-buttons">
            <q-btn
              class="ea-btn-primary"
              unelevated
              to="/"
              label="Voltar para o Início"
              no-caps
              icon="home"
              size="lg"
            />
            <q-btn
              class="ea-btn-outline"
              unelevated
              @click="goBack"
              label="Voltar"
              no-caps
              icon="arrow_back"
              size="lg"
            />
          </div>

          <!-- Links úteis -->
          <div class="ea-error-links">
            <span class="links-label">Talvez você queira:</span>
            <div class="links-list">
              <router-link to="/" class="ea-link">Início</router-link>
              <span class="separator">•</span>
              <router-link to="/servicos" class="ea-link">Serviços</router-link>
              <span class="separator">•</span>
              <router-link to="/contactos" class="ea-link">Contactos</router-link>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'ErrorNotFound' });

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
$ink: #0A0A0F;
$accent: #5B4BF5;
$gold: #F59E0B;
$radius-md: 16px;
$radius-lg: 24px;
$radius-xl: 32px;

.ea-error-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $ink;
  min-height: 100vh;
  overflow-x: hidden;
}

.ea-error-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
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
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);

    &--1 {
      width: 500px; height: 500px;
      top: -200px; left: -150px;
      background: radial-gradient(circle, rgba(91,75,245,0.3) 0%, transparent 70%);
    }
    &--2 {
      width: 400px; height: 400px;
      bottom: -100px; right: -100px;
      background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
    }
    &--3 {
      width: 300px; height: 300px;
      top: 50%; right: 30%;
      background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    }
  }

  &__container {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    width: 100%;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;

    @media (max-width: 900px) {
      padding: 20px;
      min-height: 300px;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px 60px 40px;
    max-width: 600px;

    @media (max-width: 900px) {
      padding: 40px 24px;
      max-width: 100%;
      align-items: center;
      text-align: center;
    }
  }
}

// =====================
// IMAGEM DE ERRO - LOCAL
// =====================
.ea-error-image {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: $radius-lg;
  overflow: hidden;

  .error-image {
    width: 100%;
    height: auto;
    display: block;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(10, 10, 15, 0.2) 0%,
      rgba(10, 10, 15, 0.05) 100%);
    border-radius: $radius-lg;
    pointer-events: none;
  }
}

// =====================
// BADGE
// =====================
.ea-error-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(91, 75, 245, 0.15);
  border: 1px solid rgba(91, 75, 245, 0.3);
  color: $accent;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
  width: fit-content;

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
}

.ea-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 8px #4ADE80;
  flex-shrink: 0;
}

// =====================
// CÓDIGO DO ERRO
// =====================
.ea-error-code {
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 800;
  line-height: 1;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;

  @media (max-width: 900px) {
    justify-content: center;
  }

  .digit {
    display: inline-block;
    background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: bounceDigit 2s infinite;
    position: relative;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes bounceDigit {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
}

// =====================
// TÍTULO
// =====================
.ea-error-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 16px;

  @media (max-width: 900px) {
    text-align: center;
  }
}

.ea-title-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// =====================
// DESCRIÇÃO
// =====================
.ea-error-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 0 0 32px;

  @media (max-width: 900px) {
    text-align: center;
  }
}

// =====================
// BOTÕES
// =====================
.ea-error-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: center;
  }
}

.ea-btn-primary {
  background: $accent;
  color: white;
  padding: 12px 28px;
  border-radius: 100px;
  font-weight: 600;
  transition: all 0.25s;

  &:hover {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(91, 75, 245, 0.4);
  }
}

.ea-btn-outline {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 28px;
  border-radius: 100px;
  font-weight: 600;
  transition: all 0.25s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-2px);
  }
}

// =====================
// LINKS ÚTEIS
// =====================
.ea-error-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: center;
  }

  .links-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .links-list {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ea-link {
    color: $accent;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: lighten($accent, 15%);
      text-decoration: underline;
    }
  }

  .separator {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
  }
}
</style>
