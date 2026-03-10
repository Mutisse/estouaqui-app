<!-- pages/ContactosPage.vue -->
<template>
  <q-page class="contactos-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content container">
        <div class="text-center">
          <q-chip
            class="hero-chip"
            icon="contact_phone"
            text-color="white"
            label="Fale Connosco"
          />
          <h1 class="hero-title">Entre em contacto<br />connosco</h1>
          <p class="hero-subtitle">
            Estamos aqui para ajudar. Envie a sua mensagem ou utilize um dos contactos abaixo
          </p>
        </div>
      </div>
    </section>

    <!-- Informações de Contacto -->
    <section class="info-section q-py-xl">
      <div class="container">
        <div class="row q-col-gutter-lg">
          <div v-for="(info, index) in contactInfo" :key="index" class="col-12 col-md-4">
            <div class="info-card">
              <div class="info-icon-wrapper">
                <q-icon :name="info.icon" size="32px" :color="info.color" />
              </div>
              <h3 class="info-title">{{ info.titulo }}</h3>
              <p class="info-detail">{{ info.detalhe }}</p>
              <p v-if="info.detalhe2" class="info-detail">{{ info.detalhe2 }}</p>
              <q-btn
                v-if="info.acao"
                flat
                :color="info.color"
                :label="info.acao"
                :icon="info.acaoIcon"
                :href="info.link"
                target="_blank"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Formulário de Contacto e Mapa -->
    <section class="form-section q-py-xl">
      <div class="container">
        <div class="row q-col-gutter-xl">
          <!-- Formulário -->
          <div class="col-12 col-md-6">
            <div class="form-wrapper">
              <div class="section-tag">Envie Mensagem</div>
              <h2 class="section-title">Fale connosco</h2>
              <p class="section-subtitle">Preencha o formulário abaixo e responderemos o mais breve possível</p>

              <q-form @submit="onSubmit" class="q-mt-lg">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.nome"
                      outlined
                      label="Nome completo"
                      placeholder="Digite seu nome"
                      :rules="[val => !!val || 'Nome é obrigatório']"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="primary" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.email"
                      outlined
                      label="E-mail"
                      placeholder="Digite seu e-mail"
                      type="email"
                      :rules="[
                        val => !!val || 'E-mail é obrigatório',
                        val => /.+@.+\..+/.test(val) || 'E-mail inválido'
                      ]"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="email" color="primary" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="form.telefone"
                      outlined
                      label="Telefone"
                      placeholder="+258 84 000 0000"
                      :rules="[val => !!val || 'Telefone é obrigatório']"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="phone" color="primary" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-select
                      v-model="form.assunto"
                      outlined
                      label="Assunto"
                      :options="assuntos"
                      :rules="[val => !!val || 'Assunto é obrigatório']"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="topic" color="primary" />
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="form.mensagem"
                      outlined
                      label="Mensagem"
                      placeholder="Digite sua mensagem..."
                      type="textarea"
                      :rows="5"
                      :rules="[val => !!val || 'Mensagem é obrigatória']"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="message" color="primary" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-btn
                      unelevated
                      color="primary"
                      label="Enviar Mensagem"
                      type="submit"
                      size="lg"
                      class="full-width submit-btn"
                      :loading="submitting"
                      no-caps
                    />
                  </div>
                </div>
              </q-form>
            </div>
          </div>

          <!-- Mapa e Localização -->
          <div class="col-12 col-md-6">
            <div class="map-wrapper">
              <div class="section-tag">Onde Estamos</div>
              <h2 class="section-title">A nossa localização</h2>
              <p class="section-subtitle">Visite-nos ou envie correspondência</p>

              <div class="map-container q-mt-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.498978042231!2d32.57364931502924!3d-25.96229198356079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69b3f6b9b9b9b%3A0x9b9b9b9b9b9b9b9b!2sMaputo%2C%20Mo%C3%A7ambique!5e0!3m2!1spt-PT!2s!4v1620000000000!5m2!1spt-PT!2s"
                  width="100%"
                  height="450"
                  style="border:0; border-radius: 20px;"
                  :allowfullscreen="true"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Localização do EstouAqui em Maputo"
                ></iframe>
              </div>

              <!-- Horário de Funcionamento -->
              <div class="hours-card q-mt-lg">
                <div class="hours-header">
                  <q-icon name="schedule" size="24px" color="primary" />
                  <h4 class="hours-title">Horário de Funcionamento</h4>
                </div>
                <div class="hours-grid">
                  <div v-for="(hour, index) in horario" :key="index" class="hour-item">
                    <span class="hour-day">{{ hour.dia }}</span>
                    <span class="hour-time">{{ hour.horario }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Rápida -->
    <section class="faq-mini-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Dúvidas Rápidas</div>
          <h2 class="section-title">Antes de contactar</h2>
          <p class="section-subtitle">Consulte as respostas para as perguntas mais frequentes</p>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-md-8">
            <q-list bordered separator class="faq-mini-list">
              <q-expansion-item
                v-for="(faq, index) in faqs"
                :key="index"
                icon="help"
                :label="faq.pergunta"
                header-class="faq-mini-header"
              >
                <q-card class="faq-mini-content">
                  <q-card-section>
                    {{ faq.resposta }}
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </div>
    </section>

    <!-- Redes Sociais -->
    <section class="social-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-lg">
          <div class="section-tag">Redes Sociais</div>
          <h2 class="section-title">Siga-nos nas redes</h2>
        </div>

        <div class="social-grid">
          <a v-for="(social, index) in redesSociais" :key="index"
             :href="social.link"
             target="_blank"
             rel="noopener noreferrer"
             class="social-item"
             :style="{ backgroundColor: social.color }">
            <q-icon :name="social.icon" size="32px" color="white" />
            <span class="social-name">{{ social.nome }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Suporte Rápido -->
    <section class="support-section q-py-xl">
      <div class="container">
        <div class="support-card">
          <div class="row items-center">
            <div class="col-12 col-md-8">
              <div class="support-icon">
                <q-icon name="support_agent" size="48px" color="white" />
              </div>
              <h3 class="support-title">Precisa de ajuda urgente?</h3>
              <p class="support-text">A nossa equipa de suporte está disponível 24/7 para ajudar</p>
            </div>
            <div class="col-12 col-md-4 text-right">
              <q-btn
                unelevated
                color="white"
                text-color="primary"
                label="WhatsApp"
                icon="fab fa-whatsapp"
                size="lg"
                href="https://wa.me/258841234567"
                target="_blank"
                rel="noopener noreferrer"
                class="support-btn"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'ContactosPage'
});

const $q = useQuasar();

// Tipos
interface ContactInfo {
  icon: string;
  color: string;
  titulo: string;
  detalhe: string;
  detalhe2?: string;
  acao?: string;
  acaoIcon?: string;
  link?: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  assunto: string | null;
  mensagem: string;
}

interface Horario {
  dia: string;
  horario: string;
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

interface RedeSocial {
  nome: string;
  icon: string;
  color: string;
  link: string;
}

// Informações de contacto
const contactInfo = ref<ContactInfo[]>([
  {
    icon: 'location_on',
    color: 'primary',
    titulo: 'Morada',
    detalhe: 'Av. 24 de Julho, nº 123',
    detalhe2: 'Maputo - Moçambique',
    acao: 'Ver no mapa',
    acaoIcon: 'map',
    link: 'https://goo.gl/maps/example'
  },
  {
    icon: 'phone',
    color: 'secondary',
    titulo: 'Telefone',
    detalhe: '+258 84 123 4567',
    detalhe2: '+258 87 123 4567',
    acao: 'Ligar agora',
    acaoIcon: 'call',
    link: 'tel:+258841234567'
  },
  {
    icon: 'email',
    color: 'positive',
    titulo: 'E-mail',
    detalhe: 'geral@estouaqui.co.mz',
    detalhe2: 'suporte@estouaqui.co.mz',
    acao: 'Enviar e-mail',
    acaoIcon: 'send',
    link: 'mailto:geral@estouaqui.co.mz'
  }
]);

// Formulário
const form = ref<FormData>({
  nome: '',
  email: '',
  telefone: '',
  assunto: null,
  mensagem: ''
});

const assuntos = ref<string[]>([
  'Dúvida sobre serviços',
  'Problema com prestador',
  'Quero ser prestador',
  'Parcerias',
  'Reclamação',
  'Sugestão',
  'Outro'
]);

const submitting = ref<boolean>(false);

// Horário
const horario = ref<Horario[]>([
  { dia: 'Segunda - Sexta', horario: '08:00 - 18:00' },
  { dia: 'Sábado', horario: '09:00 - 13:00' },
  { dia: 'Domingo', horario: 'Fechado' }
]);

// FAQs
const faqs = ref<FAQ[]>([
  {
    pergunta: 'Como posso me tornar prestador?',
    resposta: 'Basta clicar em "Quero Oferecer Serviços" no menu superior e preencher o formulário de registo. Após verificação dos documentos, poderá começar a oferecer serviços.'
  },
  {
    pergunta: 'Quanto tempo demora o suporte?',
    resposta: 'Normalmente respondemos em até 2 horas durante o horário comercial. Para emergências, utilize o WhatsApp.'
  },
  {
    pergunta: 'Posso visitar a vossa sede?',
    resposta: 'Sim! Estamos abertos para visitas de segunda a sexta, das 9h às 17h. Recomendamos agendar com antecedência.'
  },
  {
    pergunta: 'Como reportar um problema?',
    resposta: 'Pode reportar através deste formulário, WhatsApp ou e-mail. Teremos todo o prazer em ajudar.'
  }
]);

// Redes Sociais
const redesSociais = ref<RedeSocial[]>([
  { nome: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2', link: 'https://facebook.com/estouaqui' },
  { nome: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f', link: 'https://instagram.com/estouaqui' },
  { nome: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0077b5', link: 'https://linkedin.com/company/estouaqui' },
  { nome: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2', link: 'https://twitter.com/estouaqui' },
  { nome: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000', link: 'https://youtube.com/estouaqui' },
  { nome: 'TikTok', icon: 'fab fa-tiktok', color: '#000000', link: 'https://tiktok.com/@estouaqui' }
]);

// Métodos
const onSubmit = (): void => {
  submitting.value = true;

  // Simular envio do formulário
  setTimeout(() => {
    submitting.value = false;
    $q.notify({
      type: 'positive',
      message: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
      position: 'top',
      timeout: 3000
    });

    // Limpar formulário
    form.value = {
      nome: '',
      email: '',
      telefone: '',
      assunto: null,
      mensagem: ''
    };
  }, 2000);
};
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.page-hero {
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  background: $purple-gradient;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.1;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    color: white;
  }

  .hero-chip {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
}

// Section Styles
.section-tag {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: $purple-primary;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1rem;
  color: #666;
}

// Info Cards
.info-section {
  background: white;

  .info-card {
    background: #f8f9fa;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
    }
  }

  .info-icon-wrapper {
    width: 70px;
    height: 70px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }

  .info-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }

  .info-detail {
    color: #666;
    margin-bottom: 5px;
  }
}

// Form Section
.form-section {
  background: #f8f9fa;

  .form-wrapper {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  }

  .submit-btn {
    height: 56px;
    border-radius: 28px;
    font-weight: 600;
  }

  .map-wrapper {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  }

  .map-container {
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .hours-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 15px;

    .hours-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;

      .hours-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
        margin: 0;
      }
    }

    .hours-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .hour-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .hour-day {
        font-weight: 500;
        color: #555;
      }

      .hour-time {
        color: $purple-primary;
        font-weight: 500;
      }
    }
  }
}

// FAQ Mini
.faq-mini-section {
  background: white;

  .faq-mini-list {
    border-radius: 15px;
    overflow: hidden;
  }

  .faq-mini-header {
    background: #f8f9fa;
    font-weight: 500;
  }

  .faq-mini-content {
    background: white;
    color: #666;
  }
}

// Social Section
.social-section {
  background: #f8f9fa;

  .social-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }

  .social-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    border-radius: 15px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    }

    .social-name {
      color: white;
      font-weight: 500;
    }
  }
}

// Support Section
.support-section {
  background: white;

  .support-card {
    background: $purple-gradient;
    padding: 50px;
    border-radius: 30px;
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);
  }

  .support-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
  }

  .support-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 10px;
  }

  .support-text {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .support-btn {
    padding: 15px 40px;
    border-radius: 50px;
    font-weight: 600;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
  }
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem !important;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .form-wrapper,
  .map-wrapper {
    padding: 20px !important;
  }

  .support-card {
    padding: 30px !important;
    text-align: center;

    .text-right {
      text-align: center !important;
      margin-top: 20px;
    }
  }

  .social-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}
</style>
