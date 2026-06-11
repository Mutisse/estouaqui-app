<template>
  <q-layout view="hHh lpR fFf" class="ea-layout">

    <!-- ===== HEADER ===== -->
    <q-header class="ea-header" :class="{ 'ea-header--scrolled': scrolled }">
      <q-toolbar class="ea-toolbar ea-container">

        <!-- Logo -->
        <div class="ea-logo cursor-pointer" @click="goToHome">
          <span class="ea-logo__dot"></span>
          <span class="ea-logo__text">Estou<strong>Aqui</strong></span>
        </div>

        <!-- Nav central — desktop -->
        <nav class="ea-nav gt-sm">
          <router-link to="/" class="ea-nav__link" exact>Início</router-link>
          <router-link to="/servicos" class="ea-nav__link">Serviços</router-link>
          <router-link to="/como-funciona" class="ea-nav__link">Como Funciona</router-link>
        </nav>

        <!-- Auth — desktop -->
        <div class="ea-auth gt-sm">
          <router-link to="/auth/login" class="ea-auth__login">Entrar</router-link>
          <router-link to="/auth/register-cliente" class="ea-auth__register">
            Criar conta
            <q-icon name="arrow_forward" size="14px" />
          </router-link>
        </div>

        <!-- Hamburger — mobile -->
        <q-btn flat round class="lt-md ea-hamburger" @click="drawerOpen = !drawerOpen">
          <div class="ea-ham-icon" :class="{ 'ea-ham-icon--open': drawerOpen }">
            <span></span><span></span><span></span>
          </div>
        </q-btn>

      </q-toolbar>
    </q-header>

    <!-- ===== MOBILE DRAWER ===== -->
    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      behavior="mobile"
      class="ea-drawer"
      :width="280"
    >
      <div class="ea-drawer__inner">
        <!-- Logo -->
        <div class="ea-drawer__logo">
          <div class="ea-logo">
            <span class="ea-logo__dot"></span>
            <span class="ea-logo__text">Estou<strong>Aqui</strong></span>
          </div>
        </div>

        <!-- Close button -->
        <div class="ea-drawer__close">
          <q-btn flat round icon="close" color="white" @click="drawerOpen = false" />
        </div>

        <!-- Navigation -->
        <nav class="ea-drawer__nav">
          <router-link v-close-popup to="/" class="ea-drawer__link" exact>
            <q-icon name="home" size="20px" class="ea-drawer__icon" />
            <span>Início</span>
          </router-link>
          <router-link v-close-popup to="/servicos" class="ea-drawer__link">
            <q-icon name="build" size="20px" class="ea-drawer__icon" />
            <span>Serviços</span>
          </router-link>
          <router-link v-close-popup to="/como-funciona" class="ea-drawer__link">
            <q-icon name="help" size="20px" class="ea-drawer__icon" />
            <span>Como Funciona</span>
          </router-link>
        </nav>

        <div class="ea-drawer__divider"></div>

        <!-- Auth buttons -->
        <div class="ea-drawer__auth">
          <router-link v-close-popup to="/auth/login" class="ea-drawer__btn-ghost">
            Entrar
          </router-link>
          <router-link v-close-popup to="/auth/register-cliente" class="ea-drawer__btn-solid">
            Criar conta
          </router-link>
        </div>

        <div class="ea-drawer__footer">
          <span>© 2026 EstouAqui</span>
        </div>
      </div>
    </q-drawer>

    <!-- ===== PAGE ===== -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- ===== FOOTER ===== -->
    <footer class="ea-footer">
      <div class="ea-footer__top">
        <div class="ea-container ea-footer__grid">

          <!-- Brand -->
          <div class="ea-footer__brand">
            <div class="ea-footer__logo">
              <span class="ea-logo__dot ea-logo__dot--sm"></span>
              <span class="ea-logo__text ea-logo__text--light">Estou<strong>Aqui</strong></span>
            </div>
            <p class="ea-footer__tagline">
              Conectamos clientes e prestadores de serviços em Moçambique — rápido, seguro e sem complicações.
            </p>
            <div class="ea-footer__social">
              <a href="#" class="ea-social-btn" aria-label="Facebook">
                <q-icon name="facebook" size="18px" />
              </a>
              <a href="#" class="ea-social-btn" aria-label="Instagram">
                <q-icon name="instagram" size="18px" />
              </a>
              <a href="#" class="ea-social-btn" aria-label="LinkedIn">
                <q-icon name="linkedin" size="18px" />
              </a>
            </div>
          </div>

          <!-- Links -->
          <div class="ea-footer__col">
            <div class="ea-footer__col-title">Plataforma</div>
            <router-link to="/" class="ea-footer__link">Início</router-link>
            <router-link to="/servicos" class="ea-footer__link">Serviços</router-link>
            <router-link to="/como-funciona" class="ea-footer__link">Como Funciona</router-link>
          </div>

          <!-- Para quem -->
          <div class="ea-footer__col">
            <div class="ea-footer__col-title">Para si</div>
            <router-link to="/auth/register-cliente" class="ea-footer__link">Sou Cliente</router-link>
            <router-link to="/auth/register-prestador" class="ea-footer__link">Sou Prestador</router-link>
            <router-link to="/auth/login" class="ea-footer__link">Entrar</router-link>
          </div>

          <!-- Contacto -->
          <div class="ea-footer__col">
            <div class="ea-footer__col-title">Contacto</div>
            <a href="tel:+258841234567" class="ea-footer__link ea-footer__link--icon">
              <q-icon name="phone" size="14px" />
              +258 84 123 4567
            </a>
            <a href="mailto:geral@estouaqui.co.mz" class="ea-footer__link ea-footer__link--icon">
              <q-icon name="email" size="14px" />
              geral@estouaqui.co.mz
            </a>
            <span class="ea-footer__link ea-footer__link--icon">
              <q-icon name="location_on" size="14px" />
              Maputo, Moçambique
            </span>
          </div>

        </div>
      </div>

      <div class="ea-footer__bottom">
        <div class="ea-container ea-footer__bottom-inner">
          <span>© 2026 EstouAqui · Todos os direitos reservados</span>
          <div class="ea-footer__legal">
            <a href="/privacidade" class="ea-footer__legal-link">Privacidade</a>
            <a href="/termos" class="ea-footer__legal-link">Termos</a>
            <!-- ✅ LINK ADMIN DISCRETO -->
            <router-link to="/admin/login" class="ea-footer__legal-link ea-footer__admin-link">
              Admin
            </router-link>
          </div>
        </div>
      </div>
    </footer>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawerOpen = ref(false)
const scrolled = ref(false)

function goToHome() {
  void router.push('/')
}

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
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
$accent: #5B4BF5;
$accent-light: #EDE9FE;
$radius-sm: 8px;
$radius-md: 14px;
$radius-lg: 20px;

// =====================
//  LAYOUT
// =====================
.ea-layout {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $ink;
}

.ea-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

// =====================
//  HEADER
// =====================
.ea-header {
  background: $ink !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  transition: background 0.35s ease, box-shadow 0.35s ease;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  &--scrolled {
    background: rgba(10, 10, 15, 0.88) !important;
    backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  }
}

.ea-toolbar {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0;
  padding-bottom: 0;
}

// =====================
//  LOGO
// =====================
.ea-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: $accent;
    box-shadow: 0 0 10px rgba(91,75,245,0.9);
    flex-shrink: 0;

    &--sm {
      width: 7px;
      height: 7px;
    }
  }

  &__text {
    font-size: 1.35rem;
    color: #fff;
    letter-spacing: -0.025em;
    font-weight: 400;
    strong { font-weight: 800; }

    &--light {
      font-size: 1.25rem;
    }
  }
}

// =====================
//  NAV
// =====================
.ea-nav {
  display: flex;
  align-items: center;
  gap: 4px;

  &__link {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 7px 14px;
    border-radius: 100px;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }

    &.router-link-active,
    &.router-link-exact-active {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }
  }
}

// =====================
//  AUTH BUTTONS
// =====================
.ea-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  &__login {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 100px;
    transition: all 0.2s;

    &:hover { color: #fff; background: rgba(255,255,255,0.08); }
  }

  &__register {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $accent;
    color: #fff;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 9px 20px;
    border-radius: 100px;
    transition: all 0.25s;

    &:hover {
      background: lighten($accent, 6%);
      box-shadow: 0 8px 24px rgba(91,75,245,0.4);
      transform: translateY(-1px);
    }
  }
}

// =====================
//  HAMBURGER
// =====================
.ea-hamburger {
  color: rgba(255,255,255,0.8) !important;
}

.ea-ham-icon {
  width: 22px;
  height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;

  span {
    display: block;
    height: 2px;
    background: rgba(255,255,255,0.85);
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-origin: center;
  }

  &--open {
    span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  }
}

// =====================
//  DRAWER
// =====================
.ea-drawer {
  background: $ink !important;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.3) !important;

  .q-drawer__content {
    background: $ink !important;
  }

  &__inner {
    padding: 24px 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $ink;
    position: relative;
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    padding-top: 20px;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    padding: 12px 16px;
    border-radius: $radius-md;
    transition: all 0.2s;

    .ea-drawer__icon {
      width: 24px;
      color: rgba(255,255,255,0.5);
    }

    span {
      flex: 1;
    }

    &:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);

      .ea-drawer__icon {
        color: $accent;
      }
    }

    &.router-link-active {
      color: #fff;
      background: rgba(91, 75, 245, 0.15);

      .ea-drawer__icon {
        color: $accent;
      }
    }
  }

  &__divider {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin: 24px 0;
  }

  &__auth {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__btn-ghost {
    display: block;
    text-align: center;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px;
    transition: all 0.2s;

    &:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
      border-color: rgba(255,255,255,0.3);
    }
  }

  &__btn-solid {
    display: block;
    text-align: center;
    color: #fff;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 12px;
    background: $accent;
    border-radius: 100px;
    transition: all 0.2s;

    &:hover {
      background: lighten($accent, 6%);
      transform: translateY(-1px);
    }
  }

  &__footer {
    margin-top: 32px;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.2);
    text-align: center;
  }
}

// =====================
//  FOOTER
// =====================
.ea-footer {
  background: $ink;
  font-family: 'DM Sans', 'Nunito', sans-serif;
  border-top: 1px solid rgba(255,255,255,0.06);

  &__top {
    padding: 80px 0 60px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.4fr;
    gap: 48px;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    @media (max-width: 560px) {
      grid-template-columns: 1fr;
      gap: 36px;
    }
  }

  &__brand {
    .ea-footer__logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
  }

  &__tagline {
    font-size: 0.875rem;
    color: rgba(255,255,255,0.4);
    line-height: 1.7;
    margin: 0 0 24px;
    max-width: 300px;
  }

  &__social {
    display: flex;
    gap: 10px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__col-title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 4px;
  }

  &__link {
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: 0.88rem;
    transition: color 0.2s;
    line-height: 1.4;

    &:hover { color: #fff; }

    &--icon {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: default;

      .q-icon { flex-shrink: 0; opacity: 0.5; }

      &[href]:hover { color: #fff; cursor: pointer;
        .q-icon { opacity: 1; }
      }
    }
  }

  &__bottom {
    padding: 20px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  &__bottom-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.2);

    @media (max-width: 560px) {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
  }

  &__legal {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  &__legal-link {
    color: rgba(255,255,255,0.2);
    text-decoration: none;
    font-size: 0.8rem;
    transition: color 0.2s;

    &:hover {
      color: rgba(255,255,255,0.6);
    }
  }

  // ✅ LINK ADMIN DISCRETO
  &__admin-link {
    margin-left: 4px;
    padding-left: 20px;
    border-left: 1px solid rgba(255,255,255,0.1);
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    opacity: 0.5;
    transition: opacity 0.2s, color 0.2s;

    &:hover {
      opacity: 1;
      color: $accent;
    }
  }
}

.ea-social-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: $accent;
    border-color: $accent;
    color: #fff;
    transform: translateY(-2px);
  }
}
</style>
