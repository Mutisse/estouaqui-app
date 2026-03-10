<template>
  <div class="fullscreen bg-gradient flex flex-center">
    <!-- Elementos decorativos de fundo -->
    <div class="bg-decoration"></div>
    <div class="bg-decoration-2"></div>
    <div class="bg-decoration-3"></div>

    <div class="error-container text-center">
      <!-- Ilustração animada -->
      <div class="illustration">
        <div class="compass">
          <q-icon name="explore" size="120px" color="white" />
          <div class="compass-needle"></div>
        </div>
        <div class="dots">
          <div class="dot" v-for="n in 4" :key="n"></div>
        </div>
      </div>

      <!-- Código de erro com gradiente -->
      <div class="error-code">
        <span class="digit" v-for="(digit, index) in '404'" :key="index"
              :style="{ animationDelay: index * 0.2 + 's' }">
          {{ digit }}
        </span>
      </div>

      <!-- Mensagem de erro -->
      <div class="error-message">
        <span class="message-light">Oops! </span>
        <span class="message-bold">Página não encontrada</span>
      </div>

      <!-- Descrição -->
      <div class="error-description">
        A página que você está procurando pode ter sido removida,
        teve o nome alterado ou está temporariamente indisponível.
      </div>

      <!-- Botões de ação -->
      <div class="action-buttons q-mt-xl">
        <q-btn
          class="btn-home"
          unelevated
          to="/"
          label="Voltar para o Início"
          no-caps
          icon="home"
          size="lg"
        >
          <q-tooltip class="bg-white text-primary" anchor="top middle" self="bottom middle">
            Ir para a página inicial
          </q-tooltip>
        </q-btn>

        <q-btn
          class="btn-back q-ml-md"
          unelevated
          @click="goBack"
          label="Voltar"
          no-caps
          icon="arrow_back"
          size="lg"
        >
          <q-tooltip class="bg-white text-primary" anchor="top middle" self="bottom middle">
            Voltar para a página anterior
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Links úteis -->
      <div class="useful-links q-mt-xl">
        <span class="links-label">Talvez você queira:</span>
        <div class="links-list">
          <q-btn flat dense label="Página Inicial" to="/" class="link-btn" no-caps />
          <span class="link-separator">•</span>
          <q-btn flat dense label="Serviços" to="/servicos" class="link-btn" no-caps />
          <span class="link-separator">•</span>
          <q-btn flat dense label="Contactos" to="/contactos" class="link-btn" no-caps />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$purple-gradient-light: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);

.bg-gradient {
  background: $purple-gradient;
  position: relative;
  overflow: hidden;
}

/* Elementos decorativos de fundo */
.bg-decoration {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  top: -200px;
  right: -200px;
  animation: float 20s infinite ease-in-out;
}

.bg-decoration-2 {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  bottom: -100px;
  left: -100px;
  animation: float 15s infinite ease-in-out reverse;
}

.bg-decoration-3 {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 10s infinite;
}

.error-container {
  position: relative;
  z-index: 10;
  max-width: 800px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 60px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 1s ease;
}

/* Ilustração animada */
.illustration {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 40px;
}

.compass {
  position: relative;
  width: 100%;
  height: 100%;
  animation: spin 10s linear infinite;
}

.compass-needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 60px;
  background: white;
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(45deg);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
  }
}

.dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;

  &:nth-child(1) { top: 20%; left: 80%; animation-delay: 0s; }
  &:nth-child(2) { top: 80%; left: 20%; animation-delay: 0.5s; }
  &:nth-child(3) { top: 15%; left: 15%; animation-delay: 1s; }
  &:nth-child(4) { top: 85%; left: 85%; animation-delay: 1.5s; }
}

/* Código de erro */
.error-code {
  font-size: 8rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.digit {
  display: inline-block;
  background: $purple-gradient-light;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: bounceDigit 2s infinite;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 4px;
    background: white;
    border-radius: 2px;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
}

/* Mensagem de erro */
.error-message {
  font-size: 2.5rem;
  margin-bottom: 20px;

  .message-light {
    font-weight: 300;
    color: rgba(255, 255, 255, 0.9);
  }

  .message-bold {
    font-weight: 700;
    color: white;
    text-decoration: underline;
    text-decoration-color: #ffd700;
    text-underline-offset: 10px;
  }
}

.error-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Botões de ação */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-home, .btn-back {
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-home {
  background: white;
  color: $purple-primary;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);

    &::before {
      left: 100%;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
}

.btn-back {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
}

/* Links úteis */
.useful-links {
  text-align: center;
}

.links-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-right: 15px;
}

.links-list {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.link-btn {
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: white;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover {
    color: #ffd700;

    &::after {
      width: 80%;
      background: #ffd700;
    }
  }
}

.link-separator {
  color: rgba(255, 255, 255, 0.5);
}

/* Animações */
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounceDigit {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsividade */
@media (max-width: 768px) {
  .error-container {
    padding: 30px 20px;
    margin: 20px;
  }

  .error-code {
    font-size: 6rem;
  }

  .error-message {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .btn-home, .btn-back {
    width: 100%;
  }

  .links-list {
    margin-top: 10px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }

  .error-message {
    font-size: 1.5rem;
  }

  .error-description {
    font-size: 1rem;
  }
}
</style>
