<!-- pages/mobile/client/Avaliacao.vue -->
<template>
  <q-page class="avaliacao-page">
    <!-- Header -->
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <h1 class="header-title">Avaliar serviço</h1>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md text-grey-7">A carregar dados do serviço...</p>
    </div>

    <div v-else-if="erro" class="text-center q-pa-xl">
      <q-icon name="error" size="64px" color="negative" />
      <p class="text-h6 q-mt-md">{{ erro }}</p>
      <q-btn flat color="primary" label="Voltar" @click="router.back()" />
    </div>

    <div v-else class="content q-pa-md">
      <!-- Info do prestador -->
      <div class="provider-info q-mb-lg">
        <q-avatar size="60px">
          <img :src="prestador?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador?.nome || '')}&background=667eea&color=fff`" :alt="prestador?.nome">
        </q-avatar>
        <div class="provider-details">
          <div class="provider-name">{{ prestador?.nome || 'Prestador' }}</div>
          <div class="service-name">{{ servico?.nome || 'Serviço' }}</div>
          <div class="service-date">{{ formatarData(servico?.data) }}</div>
        </div>
      </div>

      <!-- Avaliação por estrelas -->
      <div class="rating-section q-mb-lg">
        <h3 class="section-title">Como foi o serviço?</h3>
        <div class="stars-container">
          <q-icon
            v-for="n in 5"
            :key="n"
            :name="n <= avaliacao.nota ? 'star' : 'star_border'"
            size="48px"
            :color="n <= avaliacao.nota ? 'yellow-8' : 'grey-4'"
            class="star-icon"
            @click="avaliacao.nota = n"
          />
        </div>
        <div class="rating-label">{{ ratingLabels[avaliacao.nota - 1] || 'Selecione uma nota' }}</div>
      </div>

      <!-- Comentário -->
      <div class="comment-section q-mb-lg">
        <h3 class="section-title">Deixe um comentário (opcional)</h3>
        <q-input
          v-model="avaliacao.comentario"
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
            :outline="!avaliacao.recomenda"
            :flat="!avaliacao.recomenda"
            color="positive"
            label="Sim"
            icon="thumb_up"
            @click="avaliacao.recomenda = true"
            no-caps
          />
          <q-btn
            :outline="avaliacao.recomenda !== false"
            :flat="avaliacao.recomenda !== false"
            color="negative"
            label="Não"
            icon="thumb_down"
            @click="avaliacao.recomenda = false"
            no-caps
          />
        </div>
      </div>

      <!-- Categorias de avaliação (opcional) -->
      <div class="categories-section q-mb-lg">
        <h3 class="section-title">Avalie em detalhe (opcional)</h3>
        <div v-for="cat in categoriasAvaliacao" :key="cat.nome" class="category-item">
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
        :disable="avaliacao.nota === 0"
        :loading="submitting"
        @click="enviarAvaliacao"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';

defineOptions({
  name: 'AvaliacaoPage'
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

// Tipos
interface PrestadorAvaliacao {
  id: string | number;
  nome: string;
  foto: string | null;
}

interface ServicoAvaliado {
  id: string | number;
  nome: string;
  data: string;
  prestador_id: string | number;
}

interface CategoriaAvaliacao {
  nome: string;
  valor: number;
}

// Estados
const loading = ref(true);
const submitting = ref(false);
const erro = ref<string | null>(null);
const prestador = ref<PrestadorAvaliacao | null>(null);
const servico = ref<ServicoAvaliado | null>(null);
const jaAvaliou = ref(false);

// Formulário de avaliação
const avaliacao = reactive({
  nota: 0,
  comentario: '',
  recomenda: null as boolean | null
});

// Categorias de avaliação
const categoriasAvaliacao = ref<CategoriaAvaliacao[]>([
  { nome: 'Pontualidade', valor: 0 },
  { nome: 'Qualidade do trabalho', valor: 0 },
  { nome: 'Preço justo', valor: 0 },
  { nome: 'Comunicação', valor: 0 },
  { nome: 'Limpeza', valor: 0 }
]);

const ratingLabels = [
  'Péssimo',
  'Ruim',
  'Razoável',
  'Bom',
  'Excelente!'
];

// Funções auxiliares
const formatarData = (data?: string): string => {
  if (!data) return 'Data não informada';
  try {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return data;
  }
};

const getCategoriasArray = (): string[] => {
  return categoriasAvaliacao.value
    .filter(cat => cat.valor > 0)
    .map(cat => cat.nome);
};

// Carregar dados do serviço
const carregarDados = async (): Promise<void> => {
  loading.value = true;
  erro.value = null;

  const pedidoId = route.params.id as string;

  if (!pedidoId) {
    erro.value = 'ID do pedido não informado';
    loading.value = false;
    return;
  }

  try {
    // Buscar detalhes do pedido
    const response = await api.get(CLIENTE_ENDPOINTS.PEDIDO_DETALHES(pedidoId));

    if (response.data.success) {
      const pedido = response.data.data;
      servico.value = {
        id: pedido.id,
        nome: pedido.servico?.nome || 'Serviço',
        data: pedido.created_at,
        prestador_id: pedido.prestador_id
      };

      // Buscar detalhes do prestador
      const prestadorResponse = await api.get(CLIENTE_ENDPOINTS.PRESTADOR_DETALHES(pedido.prestador_id));
      if (prestadorResponse.data.success) {
        prestador.value = {
          id: prestadorResponse.data.data.id,
          nome: prestadorResponse.data.data.nome,
          foto: prestadorResponse.data.data.foto
        };
      }

      // Verificar se já avaliou este pedido
      const checkResponse = await api.get(CLIENTE_ENDPOINTS.CHECK_PEDIDO_AVALIACAO(pedidoId));
      if (checkResponse.data.success && checkResponse.data.data.avaliado) {
        jaAvaliou.value = true;
        erro.value = 'Você já avaliou este serviço.';
        loading.value = false;
        return;
      }
    } else {
      erro.value = response.data.error || 'Erro ao carregar dados do pedido';
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    erro.value = 'Erro ao carregar dados. Verifique sua conexão.';
  } finally {
    loading.value = false;
  }
};

// Enviar avaliação
const enviarAvaliacao = async (): Promise<void> => {
  if (avaliacao.nota === 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecione uma nota',
      position: 'top'
    });
    return;
  }

  if (!servico.value?.prestador_id) {
    $q.notify({
      type: 'negative',
      message: 'Erro: Prestador não identificado',
      position: 'top'
    });
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      pedido_id: route.params.id,
      prestador_id: servico.value.prestador_id,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario,
      categorias: getCategoriasArray(),
      recomenda: avaliacao.recomenda
    };

    const response = await api.post(CLIENTE_ENDPOINTS.CRIAR_AVALIACAO, payload);

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.',
        position: 'top'
      });

      // Voltar para a página anterior após 2 segundos
      setTimeout(() => {
        void router.push('/mobile/meus-pedidos');
      }, 2000);
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.error || 'Erro ao enviar avaliação',
        position: 'top'
      });
    }
  } catch (err) {
    const error = err as { response?: { data?: { error?: string } }; message?: string };
    console.error('Erro ao enviar avaliação:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || error.message || 'Erro ao enviar avaliação',
      position: 'top'
    });
  } finally {
    submitting.value = false;
  }
};

// Carregar dados ao montar
onMounted(() => {
  // Verificar se está autenticado
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Faça login para avaliar',
      position: 'top'
    });
    void router.push('/auth/login');
    return;
  }

  // Verificar se é cliente
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
