<template>
  <div class="modern-login">
    <!-- Background Dinâmico -->
    <div class="modern-bg">
      <div class="modern-bg__gradient"></div>
      <canvas ref="canvasRef" class="modern-bg__canvas"></canvas>
    </div>

    <div class="modern-container">
      <!-- LADO ESQUERDO - Status Visual -->
      <div class="modern-left">
        <div class="modern-status">
          <div class="modern-status__badge">
            <q-icon name="circle" size="8px" class="live-icon" />
            <span>LIVE • 1.234 online</span>
          </div>

          <div class="modern-visual">
            <!-- Dashboard Visual 3D -->
            <div class="visual-container">
              <div class="visual-orb">
                <div class="visual-orb__inner">
                  <q-icon name="analytics" size="48px" />
                </div>
                <div class="orb-pulse"></div>
              </div>

              <!-- Cards flutuantes -->
              <div class="floating-card card-1">
                <q-icon name="trending_up" size="20px" />
                <span class="card-value">+245%</span>
                <span class="card-label">crescimento</span>
              </div>

              <div class="floating-card card-2">
                <q-icon name="people" size="20px" />
                <span class="card-value">12.4k</span>
                <span class="card-label">usuários</span>
              </div>

              <div class="floating-card card-3">
                <q-icon name="star" size="20px" />
                <span class="card-value">4.98</span>
                <span class="card-label">avaliação</span>
              </div>

              <div class="floating-card card-4">
                <q-icon name="verified" size="20px" />
                <span class="card-value">100%</span>
                <span class="card-label">seguro</span>
              </div>
            </div>

            <!-- Texto Dinâmico -->
            <div class="visual-text">
              <h2>
                Gestão
                <span class="gradient-text">inteligente</span>
                <br>para seu negócio
              </h2>
              <p>Plataforma completa para administração de serviços com métricas em tempo real</p>
            </div>

            <!-- Stats Row -->
            <div class="stats-row">
              <div class="stat-item">
                <q-icon name="check_circle" size="22px" class="stat-icon" />
                <div>
                  <strong>1.200+</strong>
                  <span>clientes</span>
                </div>
              </div>
              <div class="stat-item">
                <q-icon name="security" size="22px" class="stat-icon" />
                <div>
                  <strong>99.9%</strong>
                  <span>uptime</span>
                </div>
              </div>
              <div class="stat-item">
                <q-icon name="support_agent" size="22px" class="stat-icon" />
                <div>
                  <strong>24/7</strong>
                  <span>suporte</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Depoimento -->
          <div class="testimonial">
            <q-icon name="format_quote" size="28px" class="quote-icon" />
            <p>"Melhor plataforma de gestão que já usei. Interface incrível e suporte impecável!"</p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <q-icon name="person" size="24px" />
              </div>
              <div>
                <strong>Ana Rodrigues</strong>
                <span>CEO • TechSolutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LADO DIREITO - Autenticação Moderna -->
      <div class="modern-right">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">
              <div class="logo-icon">
                <q-icon name="admin_panel_settings" size="28px" />
              </div>
              <span>EstouAqui</span>
              <span class="logo-badge">ADMIN</span>
            </div>
            <h1>Acessar plataforma</h1>
            <p>Insira suas credenciais para continuar</p>
          </div>

          <!-- Social Login com Ícones -->
          <div class="social-login">
            <button class="social-btn google">
              <q-icon name="fab fa-google" size="18px" />
              Google
            </button>
            <button class="social-btn microsoft">
              <q-icon name="fab fa-microsoft" size="18px" />
              Microsoft
            </button>
            <button class="social-btn apple">
              <q-icon name="fab fa-apple" size="18px" />
              Apple
            </button>
          </div>

          <div class="divider">
            <span></span>
            <span>ou continuar com email</span>
            <span></span>
          </div>

          <!-- Formulário -->
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <div class="input-icon">
                <q-icon name="email" size="18px" />
              </div>
              <input
                v-model="email"
                type="email"
                placeholder="Email institucional"
                class="modern-input"
                :class="{ 'input-error': emailError }"
                @focus="emailError = false"
              />
              <div class="input-focus"></div>
            </div>

            <div class="input-group">
              <div class="input-icon">
                <q-icon name="lock" size="18px" />
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Palavra-passe"
                class="modern-input"
                :class="{ 'input-error': passwordError }"
                @focus="passwordError = false"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
              <div class="input-focus"></div>
            </div>

            <!-- Password Strength -->
            <div v-if="password" class="password-strength">
              <div class="strength-bars">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="strength-bar"
                  :class="{ active: i <= passwordStrength.level }"
                ></div>
              </div>
              <span class="strength-label">
                <q-icon :name="passwordStrength.icon" size="14px" />
                {{ passwordStrength.label }}
              </span>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe" />
                <span class="checkmark">
                  <q-icon name="check" size="12px" />
                </span>
                <span>Lembrar acesso</span>
              </label>
              <button type="button" class="forgot-link" @click="forgotPassword">
                <q-icon name="help_outline" size="14px" />
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="!loading">
                <q-icon name="login" size="18px" />
                Entrar na plataforma
              </span>
              <span v-else>
                <q-icon name="autorenew" size="18px" class="spin" />
                Autenticando...
              </span>
              <q-icon name="arrow_forward" size="18px" class="btn-arrow" />
            </button>
          </form>

          <div class="login-footer">
            <div class="footer-item">
              <q-icon name="lock" size="12px" />
              <span>Conexão TLS 1.3</span>
            </div>
            <div class="footer-item">
              <q-icon name="verified" size="12px" />
              <span>Acesso auditado</span>
            </div>
            <div class="footer-item">
              <q-icon name="access_time" size="12px" />
              <span>Sessão: 30min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/login-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

// Form state
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const emailError = ref(false);
const passwordError = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Password strength
const passwordStrength = computed(() => {
  const pass = password.value;
  let level = 0;
  let label = '';
  let icon = '';

  if (pass.length >= 6) level++;
  if (pass.length >= 8) level++;
  if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) level++;
  if (pass.match(/[^A-Za-z0-9]/)) level++;

  switch(level) {
    case 1:
      label = 'Fraca';
      icon = 'sentiment_very_dissatisfied';
      break;
    case 2:
      label = 'Média';
      icon = 'sentiment_neutral';
      break;
    case 3:
      label = 'Boa';
      icon = 'sentiment_satisfied';
      break;
    case 4:
      label = 'Forte';
      icon = 'sentiment_very_satisfied';
      break;
    default:
      label = '';
      icon = '';
  }

  return { level, label, icon };
});

// Validação
const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// Background particles animation
let animationId: number | null = null;

const initCanvas = (): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particles: Array<{
    x: number;
    y: number;
    radius: number;
    alpha: number;
    speedX: number;
    speedY: number;
  }> = [];

  const resizeCanvas = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticles = (): void => {
    particles = [];
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }
  };

  const animate = (): void => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${particle.alpha})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  };

  const handleResize = (): void => {
    resizeCanvas();
    createParticles();
  };

  window.addEventListener('resize', handleResize);
  resizeCanvas();
  createParticles();
  animate();

  // Cleanup listener on component unmount
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });
};

// Login handler
const handleLogin = async (): Promise<void> => {
  emailError.value = !email.value || !isValidEmail(email.value);
  passwordError.value = !password.value || password.value.length < 6;

  if (emailError.value || passwordError.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos corretamente',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  loading.value = true;

  try {
    const success = await authStore.login(email.value, password.value);

    if (success && authStore.user) {
      if (authStore.isAdmin || authStore.user.tipo === 'root') {
        if (rememberMe.value) {
          localStorage.setItem('admin_remember', email.value);
        }

        $q.notify({
          type: 'positive',
          message: 'Login efetuado com sucesso!',
          position: 'top',
          timeout: 2000,
        });

        await router.push('/admin/dashboard');
      } else {
        await authStore.logout();
        $q.notify({
          type: 'error',
          message: 'Acesso negado. Área restrita a administradores.',
          position: 'top',
          timeout: 4000,
        });
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 4000,
    });
  } finally {
    loading.value = false;
  }
};

// Forgot password
const forgotPassword = (): void => {
  $q.dialog({
    title: 'Recuperar palavra-passe',
    message: 'Digite seu email para receber as instruções:',
    prompt: {
      model: '',
      type: 'email',
      isValid: (val: string) => isValidEmail(val),
    },
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Enviar', color: 'primary', unelevated: true },
  }).onOk((emailRec: string) => {
    // Removemos o async e usamos then/catch para evitar o erro ESLint
    const sendResetEmail = async (): Promise<void> => {
      try {
        const { api } = await import('src/boot/axios');
        await api.post('/auth/forgot-password-admin', { email: emailRec });

        $q.notify({
          type: 'positive',
          message: `Instruções enviadas para ${emailRec}`,
          position: 'top',
        });
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erro ao enviar instruções',
          position: 'top',
        });
      }
    };

    void sendResetEmail();
  });
};

// Load saved credentials
const loadSavedCredentials = (): void => {
  const saved = localStorage.getItem('admin_remember');
  if (saved) {
    email.value = saved;
    rememberMe.value = true;
  }
};

// Check existing session
const checkExistingAdminSession = async (): Promise<void> => {
  if (authStore.isAuthenticated && (authStore.isAdmin || authStore.user?.tipo === 'root')) {
    await router.push('/admin/dashboard');
  }
};

// Lifecycle
onMounted(() => {
  loadSavedCredentials();
  void checkExistingAdminSession();
  initCanvas();
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped lang="scss">
.modern-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0f;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;
}

// Background
.modern-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  &__gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
  }

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}

// Container
.modern-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  min-height: 100vh;
  align-items: center;
}

// LADO ESQUERDO
.modern-left {
  padding: 40px;
}

.modern-status {
  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    color: #a78bfa;
    margin-bottom: 48px;

    .live-icon {
      color: #10b981;
      animation: pulse 2s ease-in-out infinite;
    }
  }
}

.modern-visual {
  margin-bottom: 48px;
}

.visual-container {
  position: relative;
  height: 280px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-orb {
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(99, 102, 241, 0.3);

  &__inner {
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
  }
}

.orb-pulse {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 1px solid rgba(99, 102, 241, 0.4);
  animation: pulse-ring 2s ease-out infinite;
}

.floating-card {
  position: absolute;
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: float 4s ease-in-out infinite;

  .q-icon {
    color: #818cf8;
  }

  .card-value {
    font-weight: 700;
    color: #fff;
    font-size: 14px;
  }

  .card-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }
}

.card-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.card-2 {
  top: 40%;
  right: 0;
  animation-delay: 0.5s;
}

.card-3 {
  bottom: 10%;
  left: 15%;
  animation-delay: 1s;
}

.card-4 {
  bottom: 25%;
  right: 10%;
  animation-delay: 1.5s;
}

.visual-text {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 12px;

    .gradient-text {
      background: linear-gradient(135deg, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.5;
  }
}

.stats-row {
  display: flex;
  justify-content: space-around;
  gap: 24px;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .stat-icon {
    color: #818cf8;
  }

  div {
    display: flex;
    flex-direction: column;

    strong {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    span {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

.testimonial {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  position: relative;

  .quote-icon {
    color: #818cf8;
    opacity: 0.3;
    position: absolute;
    top: 16px;
    left: 16px;
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 16px;
    padding-left: 32px;
  }

  .testimonial-author {
    display: flex;
    align-items: center;
    gap: 12px;

    .author-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    div {
      strong {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #fff;
      }

      span {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

// LADO DIREITO
.modern-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 24px;

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    span {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }

    .logo-badge {
      font-size: 10px;
      font-weight: 700;
      background: rgba(99, 102, 241, 0.2);
      padding: 4px 10px;
      border-radius: 20px;
      color: #a78bfa;
    }
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    transform: translateY(-2px);
  }

  .q-icon {
    color: inherit;
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;

  span {
    &:first-child, &:last-child {
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
    }

    &:nth-child(2) {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.login-form {
  .input-group {
    position: relative;
    margin-bottom: 20px;

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: rgba(255, 255, 255, 0.3);
      pointer-events: none;
    }

    .modern-input {
      width: 100%;
      padding: 14px 14px 14px 44px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      font-size: 14px;
      color: #fff;
      transition: all 0.2s;
      outline: none;

      &:focus {
        border-color: rgba(99, 102, 241, 0.5);

        + .input-focus {
          opacity: 1;
        }
      }

      &.input-error {
        border-color: #ef4444;
      }
    }

    .password-toggle {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.3);
      transition: color 0.2s;

      &:hover {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .input-focus {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 2px;
      transition: width 0.3s, opacity 0.3s;
      opacity: 0;
    }

    &:focus-within .input-focus {
      width: calc(100% - 28px);
      opacity: 1;
    }
  }
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: -8px;
  margin-bottom: 20px;

  .strength-bars {
    display: flex;
    gap: 4px;
    flex: 1;

    .strength-bar {
      flex: 1;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      transition: background 0.2s;

      &.active {
        &:nth-child(1).active { background: #ef4444; }
        &:nth-child(2).active { background: #f59e0b; }
        &:nth-child(3).active { background: #3b82f6; }
        &:nth-child(4).active { background: #10b981; }
      }
    }
  }

  .strength-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);

  input {
    display: none;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;

    .q-icon {
      opacity: 0;
      transition: opacity 0.2s;
      color: #fff;
    }
  }

  input:checked + .checkmark .q-icon {
    opacity: 1;
  }
}

.forgot-link {
  background: none;
  border: none;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: #a78bfa;
  }
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  .btn-arrow {
    transition: transform 0.2s;
  }

  &:hover .btn-arrow {
    transform: translateX(4px);
  }
}

.login-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .footer-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);

    .q-icon {
      color: rgba(99, 102, 241, 0.6);
    }
  }
}

// Animações
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Responsivo
@media (max-width: 1024px) {
  .modern-container {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .modern-left {
    padding: 20px;
    order: 2;
  }

  .modern-right {
    order: 1;
  }

  .stats-row {
    flex-wrap: wrap;
    justify-content: center;
  }

  .visual-container {
    height: auto;
    min-height: 280px;
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 24px;
  }

  .social-login {
    grid-template-columns: 1fr;
  }

  .stats-row {
    flex-direction: column;
  }

  .floating-card {
    display: none;
  }
}
</style>
