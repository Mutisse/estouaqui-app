<!-- pages/mobile/Avaliacao.vue -->
<template>
  <q-page class="avaliacao-page">
    <!-- Header -->
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <h1 class="header-title">Avaliar serviço</h1>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar...</p>
    </div>

    <div v-else class="content q-pa-md">
      <!-- Info do prestador -->
      <div class="provider-info q-mb-lg">
        <q-avatar size="60px">
          <img :src="prestador?.avatar" :alt="prestador?.nome">
        </q-avatar>
        <div class="provider-details">
          <div class="provider-name">{{ prestador?.nome }}</div>
          <div class="service-name">{{ servico?.nome }}</div>
          <div class="service-date">{{ servico?.data }}</div>
        </div>
      </div>

      <!-- Avaliação por estrelas -->
      <div class="rating-section q-mb-lg">
        <h3 class="section-title">Como foi o serviço?</h3>
        <div class="stars-container">
          <q-icon
            v-for="n in 5"
            :key="n"
            :name="n <= rating ? 'star' : 'star_border'"
            size="48px"
            :color="n <= rating ? 'yellow-8' : 'grey-4'"
            class="star-icon"
            @click="rating = n"
          />
        </div>
        <div class="rating-label">{{ ratingLabels[rating - 1] || 'Selecione uma nota' }}</div>
      </div>

      <!-- Comentário -->
      <div class="comment-section q-mb-lg">
        <h3 class="section-title">Deixe um comentário (opcional)</h3>
        <q-input
          v-model="comentario"
          outlined
          type="textarea"
          :rows="4"
          placeholder="Conte-nos como foi a sua experiência..."
          maxlength="500"
          counter
        />
      </div>

      <!-- Recomendação -->
      <div class="recommend-section q-mb-lg">
        <h3 class="section-title">Recomendaria este profissional?</h3>
        <div class="row q-gutter-sm">
          <q-btn
            :outline="recomenda !== true"
            :flat="recomenda !== true"
            color="positive"
            label="Sim"
            icon="thumb_up"
            @click="recomenda = true"
            no-caps
          />
          <q-btn
            :outline="recomenda !== false"
            :flat="recomenda !== false"
            color="negative"
            label="Não"
            icon="thumb_down"
            @click="recomenda = false"
            no-caps
          />
        </div>
      </div>

      <!-- Categorias de avaliação (opcional) -->
      <div class="categories-section q-mb-lg">
        <h3 class="section-title">Avalie em detalhe (opcional)</h3>
        <div v-for="cat in categorias" :key="cat.nome" class="category-item">
          <span class="category-label">{{ cat.nome }}</span>
          <q-rating
            v-model="cat.valor"
            :max="5"
            size="24px"
            color="yellow-8"
            icon="star_border"
            icon-selected="star"
          />
        </div>
      </div>

      <!-- Botão de submit -->
      <q-btn
        unelevated
        color="primary"
        label="Enviar avaliação"
        size="lg"
        class="full-width submit-btn"
        :disable="rating === 0"
        :loading="submitting"
        @click="enviarAvaliacao"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'AvaliacaoPage'
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// Tipos
interface PrestadorAvaliacao {
  id: string | number;
  nome: string;
  avatar: string;
}

interface ServicoAvaliado {
  nome: string;
  data: string;
}

interface CategoriaAvaliacao {
  nome: string;
  valor: number;
}

// Estados
const loading = ref<boolean>(true);
const submitting = ref<boolean>(false);
const rating = ref<number>(0);
const comentario = ref<string>('');
const recomenda = ref<boolean | null>(null);

// Dados com tipos definidos
const prestador = ref<PrestadorAvaliacao | null>(null);
const servico = ref<ServicoAvaliado | null>(null);

const ratingLabels: string[] = [
  'Péssimo',
  'Ruim',
  'Razoável',
  'Bom',
  'Excelente!'
];

const categorias = ref<CategoriaAvaliacao[]>([
  { nome: 'Pontualidade', valor: 0 },
  { nome: 'Qualidade do trabalho', valor: 0 },
  { nome: 'Preço justo', valor: 0 },
  { nome: 'Comunicação', valor: 0 },
  { nome: 'Limpeza', valor: 0 }
]);

// Carregar dados
onMounted((): void => {
  setTimeout((): void => {
    prestador.value = {
      id: route.params.id as string,
      nome: 'João Silva',
      avatar: 'https://i.pravatar.cc/150?img=1'
    };
    servico.value = {
      nome: 'Reparação Elétrica',
      data: '10 de Março de 2026'
    };
    loading.value = false;
  }, 1000);
});

// Métodos
const enviarAvaliacao = (): void => {
  if (rating.value === 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecione uma nota',
      position: 'top'
    });
    return;
  }

  submitting.value = true;

  setTimeout((): void => {
    submitting.value = false;
    $q.notify({
      type: 'positive',
      message: 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.',
      position: 'top'
    });
    void router.push('/mobile/lista-prestadores');
  }, 2000);
};
</script>

<style scoped lang="scss">
.avaliacao-page {
  background: white;
  min-height: 100vh;
}

.header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 15px;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;

  .provider-details {
    .provider-name {
      font-weight: 600;
      color: #333;
    }
    .service-name {
      font-size: 0.9rem;
      color: #667eea;
    }
    .service-date {
      font-size: 0.8rem;
      color: #999;
    }
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px;
}

.rating-section {
  text-align: center;

  .stars-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;

    .star-icon {
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .rating-label {
    color: #666;
    font-size: 1rem;
    font-weight: 500;
  }
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .category-label {
    color: #555;
  }
}

.submit-btn {
  height: 56px;
  border-radius: 28px;
  margin-bottom: 20px;
}
</style>
