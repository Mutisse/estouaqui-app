<!-- pages/mobile/PerfilPrestador.vue -->
<template>
  <q-page class="perfil-prestador-page">
    <!-- Header com imagem de capa -->
    <div class="profile-header">
      <q-btn
        class="back-btn"
        flat
        round
        icon="arrow_back"
        color="white"
        @click="router.back()"
      />
      <div class="cover-image" :style="{ backgroundImage: `url(${prestador?.capa})` }">
        <div class="cover-overlay"></div>
      </div>

      <div class="profile-info">
        <q-avatar size="100px" class="profile-avatar">
          <img :src="prestador?.avatar" :alt="prestador?.nome">
        </q-avatar>
        <h2 class="profile-name">{{ prestador?.nome }}</h2>
        <div class="profile-rating">
          <q-icon name="star" color="yellow" size="20px" />
          <span class="rating-value">{{ prestador?.rating }}</span>
          <span class="rating-count">({{ prestador?.avaliacoes }} avaliações)</span>
        </div>
      </div>
    </div>

    <!-- Informações rápidas -->
    <div class="info-cards q-pa-md">
      <div class="row q-col-gutter-sm">
        <div class="col-4">
          <div class="info-card">
            <q-icon name="location_on" color="primary" size="20px" />
            <div class="info-value">{{ prestador?.distancia }}km</div>
            <div class="info-label">distância</div>
          </div>
        </div>
        <div class="col-4">
          <div class="info-card">
            <q-icon name="work" color="primary" size="20px" />
            <div class="info-value">{{ prestador?.anosExperiencia }}</div>
            <div class="info-label">anos exp.</div>
          </div>
        </div>
        <div class="col-4">
          <div class="info-card">
            <q-icon name="check_circle" color="primary" size="20px" />
            <div class="info-value">{{ prestador?.servicosRealizados }}</div>
            <div class="info-label">serviços</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sobre -->
    <div class="section q-pa-md">
      <h3 class="section-title">Sobre</h3>
      <p class="section-text">{{ prestador?.sobre }}</p>
    </div>

    <!-- Serviços oferecidos -->
    <div class="section q-pa-md">
      <h3 class="section-title">Serviços oferecidos</h3>
      <div class="servicos-list">
        <div v-for="servico in prestador?.servicos" :key="servico.nome" class="servico-item">
          <div class="servico-info">
            <span class="servico-nome">{{ servico.nome }}</span>
            <span class="servico-preco">{{ servico.preco }} MZN</span>
          </div>
          <q-btn flat round icon="chat" color="primary" size="sm" @click="abrirChat(servico)" />
        </div>
      </div>
    </div>

    <!-- Avaliações recentes -->
    <div class="section q-pa-md">
      <div class="row items-center justify-between">
        <h3 class="section-title">Avaliações</h3>
        <q-btn flat color="primary" label="Ver todas" :to="`/mobile/avaliacoes/${prestador?.id}`" no-caps />
      </div>

      <div v-for="avaliacao in prestador?.avaliacoesRecentes" :key="avaliacao.id" class="avaliacao-item">
        <div class="row items-center q-mb-xs">
          <q-avatar size="32px" class="q-mr-sm">
            <img :src="avaliacao.clienteAvatar" :alt="avaliacao.clienteNome">
          </q-avatar>
          <div>
            <span class="cliente-nome">{{ avaliacao.clienteNome }}</span>
            <div class="avaliacao-rating">
              <q-icon v-for="i in 5" :key="i" :name="i <= avaliacao.nota ? 'star' : 'star_border'" color="yellow" size="14px" />
            </div>
          </div>
          <span class="avaliacao-data">{{ avaliacao.data }}</span>
        </div>
        <p class="avaliacao-comentario">{{ avaliacao.comentario }}</p>
      </div>
    </div>

    <!-- Botão de contacto -->
    <div class="contact-footer q-pa-md">
      <q-btn
        unelevated
        color="primary"
        label="Enviar mensagem"
        icon="chat"
        size="lg"
        class="full-width"
        :to="`/mobile/chat/${prestador?.id}`"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

defineOptions({
  name: 'PerfilPrestadorPage'
});

const router = useRouter();
const route = useRoute();

interface Servico {
  nome: string;
  preco: number;
}

interface Avaliacao {
  id: number;
  clienteNome: string;
  clienteAvatar: string;
  nota: number;
  comentario: string;
  data: string;
}

interface Prestador {
  id: number;
  nome: string;
  avatar: string;
  capa: string;
  rating: number;
  avaliacoes: number;
  distancia: number;
  anosExperiencia: number;
  servicosRealizados: number;
  sobre: string;
  servicos: Servico[];
  avaliacoesRecentes: Avaliacao[];
}

const loading = ref(true);
const prestador = ref<Prestador | null>(null);

onMounted(() => {
  // Simular carregamento de dados
  setTimeout(() => {
    prestador.value = {
      id: Number(route.params.id),
      nome: 'João Silva',
      avatar: 'https://i.pravatar.cc/150?img=1',
      capa: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      avaliacoes: 127,
      distancia: 1.2,
      anosExperiencia: 8,
      servicosRealizados: 345,
      sobre: 'Eletricista profissional com mais de 8 anos de experiência. Especialista em instalações elétricas residenciais e comerciais, reparações e manutenção. Trabalho com segurança e qualidade garantida.',
      servicos: [
        { nome: 'Instalação elétrica básica', preco: 1500 },
        { nome: 'Reparação de curto-circuito', preco: 1000 },
        { nome: 'Troca de disjuntor', preco: 800 },
        { nome: 'Instalação de lustre', preco: 1200 },
        { nome: 'Manutenção preventiva', preco: 2000 }
      ],
      avaliacoesRecentes: [
        {
          id: 1,
          clienteNome: 'Maria Santos',
          clienteAvatar: 'https://i.pravatar.cc/150?img=2',
          nota: 5,
          comentario: 'Excelente profissional! Resolveu o problema rapidamente e ainda deu dicas para evitar futuros problemas.',
          data: '02/03/2026'
        },
        {
          id: 2,
          clienteNome: 'Carlos Tembe',
          clienteAvatar: 'https://i.pravatar.cc/150?img=3',
          nota: 4,
          comentario: 'Bom trabalho, pontual e preço justo. Recomendo.',
          data: '28/02/2026'
        }
      ]
    };
    loading.value = false;
  }, 1000);
});

const abrirChat = (servico: Servico): void => {
  void router.push(`/mobile/chat/${prestador.value?.id}?servico=${servico.nome}`);
};
</script>

<style scoped lang="scss">
.perfil-prestador-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.profile-header {
  position: relative;
  min-height: 250px;

  .back-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
  }

  .cover-image {
    height: 150px;
    background-size: cover;
    background-position: center;
    position: relative;

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
    }
  }

  .profile-info {
    position: relative;
    margin-top: -50px;
    padding: 0 20px 20px;
    text-align: center;

    .profile-avatar {
      border: 4px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      margin-bottom: 10px;
    }

    .profile-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .profile-rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;

      .rating-value {
        font-weight: 600;
        color: #333;
      }

      .rating-count {
        color: #666;
        font-size: 0.9rem;
      }
    }
  }
}

.info-cards {
  .info-card {
    background: white;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);

    .info-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
      margin: 5px 0 2px;
    }

    .info-label {
      font-size: 0.8rem;
      color: #666;
    }
  }
}

.section {
  background: white;
  margin: 10px 0;

  .section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 15px;
  }

  .section-text {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

.servicos-list {
  .servico-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .servico-nome {
      color: #333;
      display: block;
    }

    .servico-preco {
      color: #667eea;
      font-weight: 600;
      font-size: 0.9rem;
    }
  }
}

.avaliacao-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .cliente-nome {
    font-weight: 600;
    color: #333;
  }

  .avaliacao-data {
    margin-left: auto;
    font-size: 0.8rem;
    color: #999;
  }

  .avaliacao-comentario {
    color: #666;
    line-height: 1.5;
    margin: 10px 0 0;
  }
}

.contact-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
  z-index: 100;
}
</style>
