<template>
  <q-layout view="hHh LpR fFf" class="bg-grey-2">
    <q-header elevated class="header-custom">
      <q-toolbar>
        <!-- Botão Voltar no canto esquerdo -->
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="back-btn"
          @click="goBack"
        >
          <q-tooltip class="bg-white text-primary">Voltar</q-tooltip>
        </q-btn>

        <!-- Título caprichado no centro -->
        <q-toolbar-title class="text-center">
          <span class="title-light">estou</span>
          <span class="title-bold">aqui</span>
        </q-toolbar-title>

        <!-- Botões no canto direito com tooltip -->
        <div class="auth-buttons row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            label="Sou Cliente"
            class="auth-btn cliente"
            @click="goToRegister('cliente')"
            no-caps
          >
            <q-tooltip class="bg-white text-primary" anchor="bottom middle" self="top middle">
              Não tem conta? <strong>clica aqui</strong>
            </q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            label="Sou Prestador"
            class="auth-btn prestador"
            @click="goToRegister('prestador')"
            no-caps
          >
            <q-tooltip class="bg-white text-secondary" anchor="bottom middle" self="top middle">
              Não tem conta? <strong>clica aqui</strong>
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-3 text-grey-8">
      <q-toolbar class="justify-center">
        <div class="text-caption">
          © 2026 EstouAqui - Conectamos serviços locais
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goToRegister = (tipo: string) => {
  void router.push(`/auth/register-${tipo}`);
};
</script>

<style scoped>
.header-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.back-btn {
  color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-left: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.title-light {
  font-weight: 300;
  font-size: 1.5rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
}

.title-bold {
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 1px;
  color: white;
  margin-left: 2px;
}

.auth-buttons {
  position: absolute;
  right: 16px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.auth-btn {
  border-radius: 30px;
  padding: 6px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.auth-btn.cliente {
  border: 2px solid white;
  color: white;
}

.auth-btn.cliente:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.auth-btn.prestador {
  background: white;
  color: #667eea;
}

.auth-btn.prestador:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

/* Estilo personalizado para os tooltips */
:deep(.q-tooltip) {
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  font-weight: normal;
}

:deep(.q-tooltip.text-primary) {
  color: #667eea !important;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

:deep(.q-tooltip.text-secondary) {
  color: #764ba2 !important;
  border: 1px solid rgba(118, 75, 162, 0.2);
}

:deep(.q-tooltip strong) {
  font-weight: 700;
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 599px) {
  .title-light, .title-bold {
    font-size: 1.2rem;
  }

  .auth-buttons {
    position: static;
    margin-left: auto;
  }

  .auth-btn {
    padding: 4px 10px;
    font-size: 0.8rem;
  }

  .back-btn {
    margin-left: 0;
  }
}
</style>
