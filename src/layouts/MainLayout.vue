<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-1">
    <!-- Header Elegante -->
    <q-header
      elevated
      class="text-grey-9"
      style="
        background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
      "
    >
      <q-toolbar class="container header-content">
        <!-- LOGO - Esquerda -->
        <div class="logo-wrapper cursor-pointer" @click="goToHome">
          <div class="logo-icon">
            <q-icon name="location_on" size="28px" color="grey-8" />
          </div>
          <div class="logo-text">
            <span class="text-bold text-grey-9">Estou</span>
            <span class="text-bold text-primary">Aqui</span>
          </div>
        </div>

        <!-- MENU - Centralizado -->
        <div class="menu-center gt-sm">
          <div class="menu-items row items-center q-gutter-md">
            <q-btn flat label="Início" to="/" class="menu-btn" no-caps />
            <q-btn flat label="Serviços" to="/servicos" class="menu-btn" no-caps />
            <q-btn flat label="Sobre" to="/sobre" class="menu-btn" no-caps />
            <q-btn flat label="Como Funciona" to="/como-funciona" class="menu-btn" no-caps />

            <q-btn flat label="Contactos" to="/contactos" class="menu-btn" no-caps />
          </div>
        </div>

        <!-- AUTH - Direita -->
        <div class="auth-right row items-center q-gutter-sm">
          <q-btn flat icon="login" label="Entrar" to="/auth/login" class="auth-btn gt-xs" no-caps />
          <q-btn
            outline
            color="primary"
            icon="person_add"
            label="Registar"
            to="/auth/register-cliente"
            class="auth-btn gt-xs"
            no-caps
          />

          <!-- Menu Mobile -->
          <q-btn flat round icon="menu" class="lt-md">
            <q-menu>
              <q-list style="min-width: 250px" class="mobile-menu">
                <q-item-label header class="text-grey-7">Menu</q-item-label>
                <q-item clickable v-close-popup to="/">
                  <q-item-section avatar><q-icon name="home" color="grey-7" /></q-item-section>
                  <q-item-section>Início</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/servicos">
                  <q-item-section avatar
                    ><q-icon name="miscellaneous_services" color="grey-7"
                  /></q-item-section>
                  <q-item-section>Serviços</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/como-funciona">
                  <q-item-section avatar><q-icon name="help" color="grey-7" /></q-item-section>
                  <q-item-section>Como Funciona</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/contactos">
                  <q-item-section avatar
                    ><q-icon name="contact_phone" color="grey-7"
                  /></q-item-section>
                  <q-item-section>Contactos</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/sobre">
                  <q-item-section avatar><q-icon name="info" color="grey-7" /></q-item-section>
                  <q-item-section>Sobre</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup to="/auth/login">
                  <q-item-section avatar><q-icon name="login" color="grey-7" /></q-item-section>
                  <q-item-section>Entrar</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/auth/register-cliente">
                  <q-item-section avatar
                    ><q-icon name="person_add" color="grey-7"
                  /></q-item-section>
                  <q-item-section>Registar</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer (mantido igual) -->
    <q-footer class="footer" style="background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)">
      <div class="container q-pa-xl">
        <div class="row q-col-gutter-xl">
          <!-- Sobre -->
          <div class="col-12 col-md-4">
            <div class="footer-logo q-mb-md">
              <span class="text-h5 text-bold text-white">Estou</span>
              <span class="text-h5 text-bold text-primary">Aqui</span>
            </div>
            <p class="text-grey-4">Conectamos clientes e prestadores de serviços em Moçambique.</p>
            <div class="social-icons row q-gutter-sm q-mt-md">
              <q-btn round flat icon="fab fa-facebook-f" class="social-btn" text-color="white" />
              <q-btn round flat icon="fab fa-instagram" class="social-btn" text-color="white" />
              <q-btn round flat icon="fab fa-linkedin-in" class="social-btn" text-color="white" />
            </div>
          </div>

          <!-- Links Rápidos -->
          <div class="col-6 col-md-2">
            <div class="text-subtitle1 text-bold text-white q-mb-md">Links</div>
            <q-list dense class="footer-links">
              <q-item class="q-pa-none q-mb-sm" to="/">Início</q-item>
              <q-item class="q-pa-none q-mb-sm" to="/servicos">Serviços</q-item>
              <q-item class="q-pa-none q-mb-sm" to="/como-funciona">Como Funciona</q-item>
              <q-item class="q-pa-none q-mb-sm" to="/sobre">Sobre</q-item>
            </q-list>
          </div>

          <!-- Contactos -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 text-bold text-white q-mb-md">Contactos</div>
            <div class="contact-info">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="phone" size="18px" color="primary" />
                <span class="text-grey-4">+258 84 123 4567</span>
              </div>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="email" size="18px" color="primary" />
                <span class="text-grey-4">geral@estouaqui.co.mz</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-icon name="location_on" size="18px" color="primary" />
                <span class="text-grey-4">Maputo, Moçambique</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="copyright" style="border-top: 1px solid rgba(255, 255, 255, 0.1)">
        <div class="container q-pa-md text-center text-grey-5 text-caption">
          © 2026 EstouAqui. Todos os direitos reservados.
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToHome() {
  void router.push('/');
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* Logo - Esquerda */
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.logo-text {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

/* Menu - Centro */
.menu-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.menu-items {
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

.menu-btn {
  color: #4a5568;
  font-weight: 500;
  border-radius: 30px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.menu-btn.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Auth - Direita */
.auth-right {
  flex: 0 0 auto;
}

.auth-btn {
  border-radius: 30px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Footer */
.footer {
  position: relative;
  width: 100%;
}

.footer-links .q-item {
  color: #9ca3af;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 30px;
  padding: 0;
}

.footer-links .q-item:hover {
  color: white;
  transform: translateX(5px);
}

.social-btn {
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: var(--q-primary);
  transform: translateY(-3px);
}

/* Mobile */
@media (max-width: 767px) {
  .logo-text {
    font-size: 1.2rem;
  }

  .mobile-menu {
    border-radius: 12px;
  }
}
</style>
