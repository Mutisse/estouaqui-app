<template>
  <q-page class="avaliacao-page">
    <!-- Skeleton Loading (enquanto carrega) -->
    <div v-if="carregamentoInicial" class="skeleton-loading">
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
      <div class="skeleton-spinner">
        <q-spinner color="primary" size="40px" />
      </div>
    </div>

    <!-- Conteúdo original (sem loading text) -->
    <template v-else>
      <div class="header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="router.back()" />
        <h1 class="header-title">Avaliar serviço</h1>
      </div>

      <div v-if="erro" class="text-center q-pa-xl">
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
            <div class="service-name">{{ servico?.servicoNome || 'Serviço' }}</div>
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
    </template>
  </q-page>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useClientePedidosStore, type PedidoData, type AvaliacaoData } from 'src/stores/client/cliente-pedidos-store';
import { useClientePublicStore, type PrestadorData } from 'src/stores/client/cliente-public-store';

defineOptions({
  name: 'AvaliacaoPage'
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const pedidosStore = useClientePedidosStore();
const publicStore = useClientePublicStore();

// Tipos
interface ServicoAvaliado {
  id: number;
  servicoNome: string;
  data: string;
  prestadorId: number;
}

interface CategoriaAvaliacao {
  nome: string;
  valor: number;
}

// Estados
const carregamentoInicial = ref(true);
const submitting = ref(false);
const erro = ref<string | null>(null);
const prestador = ref<PrestadorData | null>(null);
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

// ✅ Função para verificar se já avaliou - SEM ANY
const verificarJaAvaliou = async (pedidoId: number): Promise<boolean> => {
  try {
    await pedidosStore.fetchAvaliacoes();
    const avaliacoes = pedidosStore.avaliacoes;

    // ✅ SOLUÇÃO CORRETA: Verificar se a avaliação existe com type guard
    const jaAvaliou = avaliacoes.some((avaliacao: AvaliacaoData) => {
      return avaliacao.pedido_id === pedidoId;
    });

    return jaAvaliou;
  } catch {
    return false;
  }
};

// Carregar dados usando os stores
const carregarDados = async (): Promise<void> => {
  erro.value = null;

  const pedidoId = route.params.id as string;

  if (!pedidoId) {
    erro.value = 'ID do pedido não informado';
    carregamentoInicial.value = false;
    return;
  }

  const id = Number(pedidoId);

  try {
    await pedidosStore.fetchMeusPedidos();
    const pedidoEncontrado = pedidosStore.pedidos.find((p: PedidoData) => p.id === id);

    if (pedidoEncontrado) {
      servico.value = {
        id: pedidoEncontrado.id,
        servicoNome: pedidoEncontrado.servico?.nome || 'Serviço',
        data: pedidoEncontrado.created_at,
        prestadorId: pedidoEncontrado.prestador?.id || 0
      };

      if (servico.value.prestadorId) {
        const prestadorData = await publicStore.fetchPrestadorDetalhes(servico.value.prestadorId);
        if (prestadorData) {
          prestador.value = prestadorData;
        }
      }

      const avaliou = await verificarJaAvaliou(id);
      if (avaliou) {
        jaAvaliou.value = true;
        erro.value = 'Você já avaliou este serviço.';
        carregamentoInicial.value = false;
        return;
      }
    } else {
      erro.value = 'Pedido não encontrado';
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    erro.value = 'Erro ao carregar dados. Verifique sua conexão.';
  } finally {
    setTimeout(() => {
      carregamentoInicial.value = false;
    }, 500);
  }
};

// Enviar avaliação usando o store
const enviarAvaliacao = async (): Promise<void> => {
  if (avaliacao.nota === 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecione uma nota',
      position: 'top'
    });
    return;
  }

  if (!servico.value?.prestadorId) {
    $q.notify({
      type: 'negative',
      message: 'Erro: Prestador não identificado',
      position: 'top'
    });
    return;
  }

  const pedidoId = route.params.id as string;

  submitting.value = true;

  try {
    const result = await pedidosStore.criarAvaliacao({
      prestador_id: servico.value.prestadorId,
      pedido_id: Number(pedidoId),
      nota: avaliacao.nota,
      comentario: avaliacao.comentario
    });

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
        message: 'Erro ao enviar avaliação',
        position: 'top'
      });
    }
  } catch (err) {
    console.error('Erro ao enviar avaliação:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar avaliação',
      position: 'top'
    });
  } finally {
    submitting.value = false;
  }
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

.skeleton-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
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
