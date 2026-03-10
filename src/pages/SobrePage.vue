<!-- pages/SobrePage.vue -->
<template>
  <q-page class="sobre-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content container">
        <div class="text-center">
          <q-chip
            class="hero-chip"
            icon="info"
            text-color="white"
            label="Sobre Nós"
          />
          <h1 class="hero-title">Quem somos<br />e o que fazemos</h1>
          <p class="hero-subtitle">
            Conheça a história do EstouAqui e a nossa missão em Moçambique
          </p>
        </div>
      </div>
    </section>

    <!-- Nossa História -->
    <section class="history-section q-py-xl">
      <div class="container">
        <div class="row items-center">
          <div class="col-12 col-md-6">
            <div class="section-tag">Nossa História</div>
            <h2 class="section-title">Como tudo começou</h2>
            <p class="history-text">
              O EstouAqui nasceu em 2024 com um objetivo simples: conectar clientes e prestadores de serviços em Moçambique de forma rápida, segura e eficiente.
            </p>
            <p class="history-text">
              Tudo começou quando o nosso fundador, Maputo, precisava de um eletricista urgente e não encontrava profissionais de confiança. Percebemos que milhares de moçambicanos enfrentavam o mesmo problema diariamente.
            </p>
            <p class="history-text">
              Hoje, somos a maior plataforma de serviços locais do país, com mais de 1.200 prestadores verificados e 5.000 serviços realizados com sucesso.
            </p>

            <div class="founder-quote q-mt-lg">
              <q-icon name="format_quote" size="48px" color="primary" />
              <p class="quote-text">
                "Acreditamos que todos merecem acesso a serviços de qualidade, e todos os profissionais merecem oportunidades para crescer."
              </p>
              <div class="quote-author">— Carlos Tembe, Fundador</div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="image-wrapper">
              <q-img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                class="about-image"
                ratio="4/3"
              />
              <div class="image-decoration"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Missão, Visão e Valores -->
    <section class="mission-section q-py-xl">
      <div class="container">
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-4">
            <div class="mission-card">
              <div class="mission-icon-wrapper">
                <q-icon name="track_changes" size="48px" color="primary" />
              </div>
              <h3 class="mission-title">Missão</h3>
              <p class="mission-text">
                Democratizar o acesso a serviços de qualidade em Moçambique, conectando clientes a profissionais verificados e criando oportunidades de negócio para prestadores locais.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="mission-card">
              <div class="mission-icon-wrapper">
                <q-icon name="visibility" size="48px" color="secondary" />
              </div>
              <h3 class="mission-title">Visão</h3>
              <p class="mission-text">
                Ser a principal referência em serviços locais em África, reconhecida pela qualidade, confiança e inovação na conexão entre pessoas e profissionais.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="mission-card">
              <div class="mission-icon-wrapper">
                <q-icon name="favorite" size="48px" color="positive" />
              </div>
              <h3 class="mission-title">Valores</h3>
              <ul class="values-list">
                <li v-for="value in values" :key="value" class="value-item">
                  <q-icon name="check_circle" color="positive" size="20px" />
                  {{ value }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Números que nos definem -->
    <section class="numbers-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Em Números</div>
          <h2 class="section-title">O EstouAqui em números</h2>
        </div>

        <div class="numbers-grid">
          <div v-for="(number, index) in numbers" :key="index" class="number-item">
            <div class="number-value">{{ number.value }}</div>
            <div class="number-label">{{ number.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Equipa -->
    <section class="team-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Equipa</div>
          <h2 class="section-title">Quem faz o EstouAqui</h2>
          <p class="section-subtitle">Conheça as pessoas por trás da plataforma</p>
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <div v-for="(member, index) in team" :key="index" class="col-12 col-sm-6 col-md-3">
            <div class="team-card">
              <q-avatar size="120px" class="team-avatar">
                <img :src="member.avatar" :alt="member.nome">
              </q-avatar>
              <h4 class="team-name">{{ member.nome }}</h4>
              <p class="team-role">{{ member.cargo }}</p>
              <p class="team-bio">{{ member.bio }}</p>
              <div class="team-social">
                <q-btn round flat icon="fab fa-linkedin-in" size="sm" color="primary" />
                <q-btn round flat icon="fab fa-twitter" size="sm" color="primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Porquê Escolher-nos -->
    <section class="why-choose-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Diferenciais</div>
          <h2 class="section-title">Porquê escolher o EstouAqui?</h2>
        </div>

        <div class="row q-col-gutter-lg">
          <div v-for="(reason, index) in reasons" :key="index" class="col-12 col-md-6 col-lg-3">
            <div class="reason-card">
              <div class="reason-icon-wrapper" :style="{ backgroundColor: reason.color + '20' }">
                <q-icon :name="reason.icon" :color="reason.color" size="32px" />
              </div>
              <h4 class="reason-title">{{ reason.title }}</h4>
              <p class="reason-description">{{ reason.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Parceiros -->
    <section class="partners-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Parceiros</div>
          <h2 class="section-title">Quem confia em nós</h2>
        </div>

        <div class="partners-grid">
          <div v-for="(partner, index) in partners" :key="index" class="partner-item">
            <q-img :src="partner.logo" :alt="partner.nome" class="partner-logo" />
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="timeline-section q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-tag">Linha do Tempo</div>
          <h2 class="section-title">A nossa jornada</h2>
        </div>

        <div class="timeline">
          <div v-for="(event, index) in timeline" :key="index" class="timeline-item">
            <div class="timeline-badge">
              <span class="timeline-year">{{ event.ano }}</span>
            </div>
            <div class="timeline-content">
              <h4 class="timeline-title">{{ event.titulo }}</h4>
              <p class="timeline-description">{{ event.descricao }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="cta-section q-py-xl">
      <div class="container">
        <div class="cta-card">
          <div class="row items-center justify-between">
            <div class="col-12 col-md-7">
              <h3 class="cta-title">Faça parte desta história</h3>
              <p class="cta-text">Junte-se a nós e ajude a construir o futuro dos serviços em Moçambique</p>
            </div>
            <div class="col-12 col-md-5 text-right">
              <q-btn
                unelevated
                color="primary"
                label="Criar Conta Grátis"
                icon="person_add"
                size="lg"
                to="/auth/register-cliente"
                class="cta-button"
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

defineOptions({
  name: 'SobrePage'
});

// Valores
const values = ref<string[]>([
  'Confiança e Transparência',
  'Qualidade e Excelência',
  'Inovação constante',
  'Compromisso com a comunidade',
  'Respeito e ética'
]);

// Números
const numbers = ref([
  { value: '2024', label: 'Ano de Fundação' },
  { value: '1.2k+', label: 'Prestadores' },
  { value: '5k+', label: 'Serviços Realizados' },
  { value: '30+', label: 'Categorias' },
  { value: '98%', label: 'Satisfação' },
  { value: '3', label: 'Cidades' }
]);

// Equipa
const team = ref([
  {
    nome: 'Carlos Tembe',
    cargo: 'Fundador & CEO',
    bio: 'Empreendedor social com paixão por conectar pessoas e criar oportunidades.',
    avatar: 'https://i.pravatar.cc/120?img=7'
  },
  {
    nome: 'Amélia Macuácua',
    cargo: 'Diretora de Operações',
    bio: 'Especialista em gestão de projetos e otimização de processos.',
    avatar: 'https://i.pravatar.cc/120?img=5'
  },
  {
    nome: 'João Mondlane',
    cargo: 'CTO',
    bio: 'Engenheiro de software com experiência em plataformas de marketplace.',
    avatar: 'https://i.pravatar.cc/120?img=8'
  },
  {
    nome: 'Helena Nhampossa',
    cargo: 'Marketing',
    bio: 'Especialista em crescimento e comunicação estratégica.',
    avatar: 'https://i.pravatar.cc/120?img=6'
  }
]);

// Razões para escolher
const reasons = ref([
  {
    icon: 'security',
    color: '#667eea',
    title: 'Segurança',
    description: 'Verificamos todos os prestadores para sua tranquilidade.'
  },
  {
    icon: 'speed',
    color: '#764ba2',
    title: 'Rapidez',
    description: 'Encontre profissionais próximos em minutos.'
  },
  {
    icon: 'support_agent',
    color: '#48bb78',
    title: 'Suporte Dedicado',
    description: 'Equipa pronta para ajudar 24/7.'
  },
  {
    icon: 'payments',
    color: '#f39c12',
    title: 'Pagamento Seguro',
    description: 'Múltiplas opções com garantia de devolução.'
  }
]);

// Parceiros
const partners = ref([
  { nome: 'Vodacom', logo: 'https://via.placeholder.com/150x80?text=Vodacom' },
  { nome: 'Millennium BIM', logo: 'https://via.placeholder.com/150x80?text=BIM' },
  { nome: 'Standard Bank', logo: 'https://via.placeholder.com/150x80?text=Standard+Bank' },
  { nome: 'EMATUM', logo: 'https://via.placeholder.com/150x80?text=EMATUM' },
  { nome: 'Mcel', logo: 'https://via.placeholder.com/150x80?text=Mcel' },
  { nome: 'Movitel', logo: 'https://via.placeholder.com/150x80?text=Movitel' }
]);

// Timeline
const timeline = ref([
  {
    ano: '2024',
    titulo: 'Fundação',
    descricao: 'O EstouAqui é fundado em Maputo com a missão de revolucionar o setor de serviços.'
  },
  {
    ano: '2024',
    titulo: 'Lançamento',
    descricao: 'Plataforma é lançada oficialmente com 10 categorias de serviços.'
  },
  {
    ano: '2025',
    titulo: 'Expansão',
    descricao: 'Alcance de 500 prestadores e expansão para Matola e Boane.'
  },
  {
    ano: '2025',
    titulo: 'Marco',
    descricao: 'Atingimos 1.000 serviços realizados com sucesso.'
  },
  {
    ano: '2026',
    titulo: 'Crescimento',
    descricao: 'Mais de 1.200 prestadores e 5.000 serviços realizados.'
  }
]);
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
  min-height: 50vh;
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
    background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
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
    font-size: 3.5rem;
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
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
}

// History Section
.history-section {
  background: white;
  padding: 80px 0;

  .history-text {
    color: #666;
    line-height: 1.8;
    margin-bottom: 1rem;
  }

  .image-wrapper {
    position: relative;
    padding: 20px;

    .about-image {
      border-radius: 20px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
    }

    .image-decoration {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 80%;
      height: 80%;
      border: 2px solid $purple-primary;
      border-radius: 20px;
      z-index: -1;
    }
  }

  .founder-quote {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 20px;
    position: relative;

    .quote-text {
      font-size: 1.2rem;
      font-style: italic;
      color: #333;
      margin: 10px 0;
    }

    .quote-author {
      color: $purple-primary;
      font-weight: 600;
    }
  }
}

// Mission Section
.mission-section {
  background: #f8f9fa;
  padding: 80px 0;

  .mission-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    height: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 40px rgba(102, 126, 234, 0.1);
    }
  }

  .mission-icon-wrapper {
    width: 80px;
    height: 80px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .mission-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
  }

  .mission-text {
    color: #666;
    line-height: 1.6;
  }

  .values-list {
    list-style: none;
    padding: 0;

    .value-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      color: #555;
    }
  }
}

// Numbers Section
.numbers-section {
  background: white;
  padding: 60px 0;

  .numbers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 30px;
    text-align: center;
  }

  .number-item {
    padding: 20px;
  }

  .number-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: $purple-primary;
    margin-bottom: 5px;
  }

  .number-label {
    font-size: 1rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// Team Section
.team-section {
  background: #f8f9fa;
  padding: 80px 0;

  .team-card {
    background: white;
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    height: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 40px rgba(102, 126, 234, 0.1);
    }
  }

  .team-avatar {
    margin: 0 auto 20px;
    border: 3px solid $purple-primary;
  }

  .team-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
  }

  .team-role {
    color: $purple-primary;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .team-bio {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 15px;
  }

  .team-social {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}

// Why Choose Section
.why-choose-section {
  background: white;
  padding: 80px 0;

  .reason-card {
    text-align: center;
    height: 100%;
  }

  .reason-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .reason-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }

  .reason-description {
    color: #666;
    line-height: 1.6;
  }
}

// Partners Section
.partners-section {
  background: #f8f9fa;
  padding: 60px 0;

  .partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 30px;
    align-items: center;
  }

  .partner-item {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
    }
  }

  .partner-logo {
    max-width: 100%;
    height: auto;
  }
}

// Timeline Section
.timeline-section {
  background: white;
  padding: 80px 0;

  .timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;

    &::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: $purple-gradient;
    }
  }

  .timeline-item {
    position: relative;
    padding-left: 60px;
    margin-bottom: 40px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .timeline-badge {
    position: absolute;
    left: 0;
    width: 40px;
    height: 40px;
    background: $purple-gradient;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  .timeline-year {
    color: white;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .timeline-content {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
  }

  .timeline-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
  }

  .timeline-description {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

// CTA Section
.cta-section {
  padding: 60px 0;
  background: #f8f9fa;

  .cta-card {
    background: white;
    padding: 60px;
    border-radius: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    border: 2px solid #f0f0f0;
  }

  .cta-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }

  .cta-text {
    font-size: 1.1rem;
    color: #666;
  }

  .cta-button {
    padding: 15px 40px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
  }
}

// Responsividade
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem !important;
  }

  .section-title {
    font-size: 2rem;
  }

  .numbers-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 20px;
  }

  .partners-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .cta-card {
    padding: 30px !important;
    text-align: center;

    .text-right {
      text-align: center !important;
      margin-top: 20px;
    }
  }

  .image-wrapper {
    margin-top: 30px;
  }

  .timeline {
    &::before {
      left: 15px !important;
    }
  }

  .timeline-item {
    padding-left: 45px !important;
  }

  .timeline-badge {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>
