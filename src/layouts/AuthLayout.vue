<template>
  <div class="ea-auth-page">

    <!-- ===== HERO SECTION ===== -->
    <section class="ea-auth-hero">
      <div class="ea-auth-hero__bg">
        <div class="ea-auth-hero__noise"></div>
        <div class="ea-auth-hero__orb ea-auth-hero__orb--1"></div>
        <div class="ea-auth-hero__orb ea-auth-hero__orb--2"></div>
        <div class="ea-auth-hero__orb ea-auth-hero__orb--3"></div>
        <div class="ea-auth-hero__grid"></div>
      </div>

      <!-- NAVBAR NO TOPO (lado esquerdo) -->
      <div class="ea-navbar">
        <div class="ea-navbar__container">
          <button class="ea-navbar__back" @click="goBack">
            <q-icon name="arrow_back" size="20px" />
            <span>Voltar</span>
          </button>

          <div class="ea-navbar__tabs">
            <button
              class="ea-navbar__tab"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              <q-icon name="lock" size="18px" />
              <span>Entrar</span>
            </button>
            <button
              class="ea-navbar__tab"
              :class="{ active: activeTab === 'cliente' }"
              @click="activeTab = 'cliente'"
            >
              <q-icon name="person" size="18px" />
              <span>Sou Cliente</span>
            </button>
            <button
              class="ea-navbar__tab"
              :class="{ active: activeTab === 'prestador' }"
              @click="activeTab = 'prestador'"
            >
              <q-icon name="build" size="18px" />
              <span>Sou Prestador</span>
            </button>
          </div>
        </div>
      </div>

      <div class="ea-auth-hero__container">

        <!-- LADO ESQUERDO: IMAGEM + CONTEÚDO ACIMA -->
        <div class="ea-auth-hero__left">

          <!-- Badge acima da imagem (lado esquerdo) -->
          <div class="ea-left-badge">
            <span class="ea-badge__dot"></span>
            {{ currentBadgeText }}
          </div>

          <!-- Título acima da imagem -->
          <h1 class="ea-left-title">
            {{ currentTitle }}
            <span v-if="currentTitleAccent" class="ea-title-accent">{{ currentTitleAccent }}</span>
          </h1>

          <p class="ea-left-subtitle">{{ currentSubtitle }}</p>

          <!-- Imagem -->
          <div class="ea-auth-hero__image-wrapper">
            <q-img
              :src="currentImageSrc"
              class="ea-auth-hero__image"
              fit="cover"
            />
            <div class="ea-auth-hero__image-overlay"></div>

            <!-- Badge flutuante na imagem -->
            <div class="ea-image-badge">
              <q-icon name="star" size="16px" color="amber" />
              <span>+1.200 clientes</span>
            </div>
          </div>
        </div>

        <!-- LADO DIREITO: FORMULÁRIO -->
        <div class="ea-auth-hero__right">

          <!-- FORMULÁRIO DINÂMICO -->
          <div class="ea-form-card">
            <component :is="currentComponent" />
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// IMPORT DOS FORMULÁRIOS
import LoginForm from 'src/components/auth/Login.vue'
import RegisterClienteForm from 'src/components/auth/RegisterCliente.vue'
import RegisterPrestadorForm from 'src/components/auth/RegisterPrestador.vue'

defineOptions({ name: 'AuthLayout' })

const router = useRouter()
const activeTab = ref<'login' | 'cliente' | 'prestador'>('login')

// Configurações de cada tab
const tabConfig = {
  login: {
    component: LoginForm,
    title: 'Bem-vindo de volta',
    titleAccent: 'ao EstouAqui',
    subtitle: 'Faça login para aceder à sua conta',
    badgeText: 'Acesso rápido',
    imageSrc: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85'
  },
  cliente: {
    component: RegisterClienteForm,
    title: 'Criar conta',
    titleAccent: 'de cliente',
    subtitle: 'Encontre os melhores profissionais perto de si',
    badgeText: 'Gratuito',
    imageSrc: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=85'
  },
  prestador: {
    component: RegisterPrestadorForm,
    title: 'Criar conta',
    titleAccent: 'de prestador',
    subtitle: 'Ofereça os seus serviços e ganhe dinheiro',
    badgeText: 'Comece a ganhar',
    imageSrc: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85'
  }
}

const currentComponent = computed(() => tabConfig[activeTab.value].component)
const currentTitle = computed(() => tabConfig[activeTab.value].title)
const currentTitleAccent = computed(() => tabConfig[activeTab.value].titleAccent)
const currentSubtitle = computed(() => tabConfig[activeTab.value].subtitle)
const currentBadgeText = computed(() => tabConfig[activeTab.value].badgeText)
const currentImageSrc = computed(() => tabConfig[activeTab.value].imageSrc)

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
$ink: #0A0A0F;
$accent: #5B4BF5;
$gold: #F59E0B;
$radius-md: 16px;
$radius-lg: 24px;
$radius-xl: 32px;

.ea-auth-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $ink;
  min-height: 100vh;
  overflow-x: hidden;
}

.ea-auth-hero {
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
    margin-top: 80px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      margin-top: 60px;
    }
  }

  // LADO ESQUERDO - IMAGEM + CONTEÚDO
  &__left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 40px 40px 60px;
    position: relative;

    @media (max-width: 900px) {
      padding: 20px;
      align-items: center;
      text-align: center;
    }
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    border-radius: $radius-xl;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    margin-top: 32px;

    @media (max-width: 900px) {
      max-width: 100%;
    }
  }

  &__image {
    width: 100%;
    height: auto;
    display: block;
  }

  &__image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(91,75,245,0.2) 0%, rgba(10,10,15,0.4) 100%);
  }

  // LADO DIREITO - FORMULÁRIO
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
// NAVBAR (topo da página)
// =====================
.ea-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 40px;
  background: rgba(10, 10, 15, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    padding: 12px 20px;
  }

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__back {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      transform: translateX(-4px);
    }
  }

  &__tabs {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 60px;
    padding: 4px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 40px;
    background: transparent;
    border: none;
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      background: $accent;
      color: #fff;
      box-shadow: 0 4px 12px rgba(91, 75, 245, 0.3);
    }

    @media (max-width: 600px) {
      padding: 6px 12px;

      span {
        display: none;
      }
    }
  }
}

// =====================
// CONTEÚDO DO LADO ESQUERDO (acima da imagem)
// =====================
.ea-left-badge {
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
  margin-bottom: 20px;
  width: fit-content;

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
}

.ea-left-title {
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 12px;

  @media (max-width: 900px) {
    text-align: center;
  }
}

.ea-left-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 0 0 16px;
  max-width: 400px;

  @media (max-width: 900px) {
    text-align: center;
    max-width: 100%;
  }
}

// =====================
// CARD DO FORMULÁRIO
// =====================
.ea-form-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-xl;
  padding: 32px;
  width: 100%;

  @media (max-width: 900px) {
    padding: 24px;
  }
}

// =====================
// BADGE FLUTUANTE NA IMAGEM
// =====================
.ea-image-badge {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 30px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 0.75rem;
    font-weight: 500;
    color: #fff;
  }
}

// =====================
// BADGE DOT
// =====================
.ea-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 8px #4ADE80;
  flex-shrink: 0;
}

// =====================
// TITLE ACCENT
// =====================
.ea-title-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, $gold 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
