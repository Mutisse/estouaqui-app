<template>
  <q-page class="avaliacao-page">
    <!-- Skeleton Loading -->
    <div v-if="store.carregamentoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-back-btn"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-provider">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-provider-details">
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-30"></div>
        </div>
      </div>
      <div class="skeleton-rating-section">
        <div class="skeleton-line w-40 center"></div>
        <div class="skeleton-stars">
          <div v-for="i in 5" :key="i" class="skeleton-star"></div>
        </div>
      </div>
      <div class="skeleton-comment-section">
        <div class="skeleton-line w-50"></div>
        <div class="skeleton-textarea"></div>
      </div>
      <div class="skeleton-recommend-section">
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-buttons">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
      <div class="skeleton-submit-btn"></div>
    </div>

    <!-- Conteúdo principal -->
    <template v-else>
      <div class="header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="router.back()" />
        <h1 class="header-title">Avaliar serviço</h1>
      </div>

      <div v-if="store.erro" class="text-center q-pa-xl">
        <q-icon name="error" size="64px" color="negative" />
        <p class="text-h6 q-mt-md">{{ store.erro }}</p>
        <q-btn flat color="primary" label="Voltar" @click="router.back()" />
      </div>

      <div v-else class="content q-pa-md">
        <!-- Info do prestador -->
        <div class="provider-info q-mb-lg">
          <q-avatar size="60px">
            <img :src="store.getAvatarUrl(store.prestador?.nome || '', store.prestador?.foto)" :alt="store.prestador?.nome">
          </q-avatar>
          <div class="provider-details">
            <div class="provider-name">{{ store.prestador?.nome || 'Prestador' }}</div>
            <div class="service-name">{{ store.servico?.servicoNome || 'Serviço' }}</div>
            <div class="service-date">{{ store.formatarData(store.servico?.data) }}</div>
          </div>
        </div>

        <!-- Avaliação por estrelas -->
        <div class="rating-section q-mb-lg">
          <h3 class="section-title">Como foi o serviço?</h3>
          <div class="stars-container">
            <q-icon
              v-for="n in 5"
              :key="n"
              :name="n <= store.formulario.nota ? 'star' : 'star_border'"
              size="48px"
              :color="n <= store.formulario.nota ? 'yellow-8' : 'grey-4'"
              class="star-icon"
              @click="store.setNota(n)"
            />
          </div>
          <div class="rating-label">{{ store.ratingLabel }}</div>
        </div>

        <!-- Comentário -->
        <div class="comment-section q-mb-lg">
          <h3 class="section-title">Deixe um comentário (opcional)</h3>
          <q-input
            :model-value="store.formulario.comentario"
            @update:model-value="store.setComentario"
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
              :outline="store.formulario.recomenda !== true"
              :flat="store.formulario.recomenda !== true"
              color="positive"
              label="Sim"
              icon="thumb_up"
              @click="store.setRecomenda(true)"
              no-caps
            />
            <q-btn
              :outline="store.formulario.recomenda !== false"
              :flat="store.formulario.recomenda !== false"
              color="negative"
              label="Não"
              icon="thumb_down"
              @click="store.setRecomenda(false)"
              no-caps
            />
          </div>
        </div>

        <!-- Categorias de avaliação -->
        <div class="categories-section q-mb-lg">
          <h3 class="section-title">Avalie em detalhe (opcional)</h3>
          <div v-for="(cat, idx) in store.categoriasAvaliacao" :key="cat.nome" class="category-item">
            <span class="category-label">{{ cat.nome }}</span>
            <q-rating
              :model-value="cat.valor"
              @update:model-value="(val: number) => store.setCategoriaValor(idx, val)"
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
          :disable="!store.podeEnviar"
          :loading="store.enviando"
          @click="enviarAvaliacao"
          no-caps
        />
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { useAvaliacaoStore } from 'src/stores/client/cliente-avaliacao-store';

defineOptions({
  name: 'AvaliacaoPage'
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();
const store = useAvaliacaoStore();

const enviarAvaliacao = async (): Promise<void> => {
  if (!store.podeEnviar) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecione uma nota',
      position: 'top'
    });
    return;
  }

  if (!store.servico?.prestadorId) {
    $q.notify({
      type: 'negative',
      message: 'Erro: Prestador não identificado',
      position: 'top'
    });
    return;
  }

  const pedidoId = route.params.id as string;

  const result = await store.enviarAvaliacao(
    Number(pedidoId),
    store.servico.prestadorId,
    store.formulario.nota,
    store.formulario.comentario,
    store.formulario.recomenda,
    store.categoriasAvaliacao
  );

  if (result) {
    $q.notify({
      type: 'positive',
      message: 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.',
      position: 'top'
    });

    setTimeout(() => {
      void router.push('/mobile/meus-pedidos');
    }, 2000);
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro || 'Erro ao enviar avaliação',
      position: 'top'
    });
  }
};

const carregarDados = async (): Promise<void> => {
  const pedidoId = route.params.id as string;

  if (!pedidoId) {
    store.erro = 'ID do pedido não informado';
    store.carregamentoInicial = false;
    return;
  }

  await store.carregarDados(Number(pedidoId));
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Faça login para avaliar',
      position: 'top'
    });
    void router.push('/auth/login');
    return;
  }

  if (!authStore.isCliente) {
    $q.notify({
      type: 'negative',
      message: 'Apenas clientes podem avaliar serviços',
      position: 'top'
    });
    void router.push('/mobile/home');
    return;
  }

  void carregarDados();
});

onUnmounted(() => {
  store.limparStore();
});
</script>

<style scoped lang="scss">
.avaliacao-page {
  background: white;
  min-height: 100vh;
}

/* ========================================== */
/* SKELETON LOADING STYLES */
/* ========================================== */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-loading {
  background: white;
  min-height: 100vh;
}

.skeleton-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 150px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-provider {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-provider-details {
  flex: 1;
}

.skeleton-rating-section {
  text-align: center;
  padding: 0 16px;
  margin-bottom: 24px;
}

.skeleton-stars {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.skeleton-star {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-comment-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.skeleton-textarea {
  width: 100%;
  height: 100px;
  border-radius: 12px;
  margin-top: 10px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-recommend-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.skeleton-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.skeleton-btn {
  width: 80px;
  height: 36px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-submit-btn {
  margin: 0 16px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  margin: 6px 0;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.center {
  margin: 0 auto;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

/* ========================================== */
/* ESTILOS ORIGINAIS */
/* ========================================== */

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
