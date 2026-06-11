<template>
  <q-page class="inicio-page">
    <!-- Skeleton Loading -->
    <div v-if="carregandoInicial" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-text">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-60"></div>
        </div>
        <div class="skeleton-date"></div>
      </div>
      <div class="skeleton-stats">
        <div v-for="i in 3" :key="i" class="skeleton-stat-pill">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-30"></div>
        </div>
      </div>
      <div class="skeleton-banner"></div>
      <div class="skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-20"></div>
        </div>
        <div class="skeleton-cats">
          <div v-for="i in 4" :key="i" class="skeleton-cat">
            <div class="skeleton-cat-icon"></div>
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-20"></div>
        </div>
        <div class="skeleton-dest">
          <div v-for="i in 4" :key="i" class="skeleton-dest-card">
            <div class="skeleton-dest-img"></div>
            <div class="skeleton-dest-info">
              <div class="skeleton-line w-80"></div>
              <div class="skeleton-line w-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__left">
          <!-- Avatar com fallback igual ao perfil -->
          <div class="user-avatar-wrapper">
            <div
              v-if="avatarError"
              class="avatar-placeholder-header"
              :style="{ background: avatarColor }"
            >
              {{ avatarIniciais }}
            </div>
            <q-avatar v-else size="46px" class="user-avatar">
              <img :src="avatarUrlComTimestamp" alt="Avatar" @error="avatarError = true" />
            </q-avatar>
          </div>
          <div>
            <div class="header-sub">Olá,</div>
            <div class="header-name">{{ userName }}</div>
            <div v-if="authStore.isCliente" class="header-badge">
              <span class="badge-dot"></span>
              Cliente verificado
            </div>
          </div>
        </div>
        <div class="header-date">{{ diaSemana }}<br />{{ dataFormatada }}</div>
      </div>

      <!-- Stats Pills -->
      <div class="stats-row">
        <div class="stat-pill stat-pill--primary" @click="goTo('/mobile/meus-pedidos')">
          <q-icon name="assignment" size="20px" class="stat-pill__icon" />
          <div class="stat-pill__value">{{ pedidosPendentes }}</div>
          <div class="stat-pill__label">Pedidos ativos</div>
        </div>
        <div class="stat-pill stat-pill--purple" @click="goTo('/mobile/notificacoes')">
          <q-icon name="notifications" size="20px" class="stat-pill__icon" />
          <div class="stat-pill__value">{{ notificacoesNaoLidas }}</div>
          <div class="stat-pill__label">Notificações</div>
        </div>
        <div class="stat-pill stat-pill--red" @click="goTo('/mobile/favoritos')">
          <q-icon name="favorite" size="20px" class="stat-pill__icon" />
          <div class="stat-pill__value">{{ favoritosCount }}</div>
          <div class="stat-pill__label">Favoritos</div>
        </div>
      </div>

      <!-- Banner promocional -->
      <div class="promo-banner" @click="verPromocao">
        <div class="promo-banner__icon">
          <q-icon name="emoji_people" size="24px" color="white" />
        </div>
        <div class="promo-banner__body">
          <div class="promo-banner__title">Ganhe 500 MZN</div>
          <div class="promo-banner__sub">Indique um amigo e ganhe bónus</div>
        </div>
        <div class="promo-banner__cta">Saber mais</div>
      </div>

      <!-- Categorias populares -->
      <div v-if="categoriasPopulares.length > 0" class="page-section">
        <div class="section-header">
          <h2 class="section-title">Categorias populares</h2>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todas →"
            class="section-link"
            to="/mobile/lista-prestadores"
          />
        </div>
        <div class="cats-grid">
          <div
            v-for="categoria in categoriasPopulares.slice(0, 4)"
            :key="categoria.id"
            class="cat-card"
            @click="buscarPorCategoria(categoria.id)"
          >
            <div class="cat-card__icon" :style="getCatIconStyle(categoria.cor)">
              <q-icon :name="categoria.icone || 'category'" size="22px" />
            </div>
            <div class="cat-card__name">{{ categoria.nome }}</div>
            <div class="cat-card__count">{{ categoria.servicos_count || 0 }} serv.</div>
          </div>
        </div>
      </div>

      <!-- Prestadores em destaque -->
      <div v-if="prestadoresDestaque.length > 0" class="page-section">
        <div class="section-header">
          <h2 class="section-title">Prestadores em destaque</h2>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todos →"
            class="section-link"
            to="/mobile/lista-prestadores"
          />
        </div>
        <div v-if="carregandoDestaque" class="loading-center">
          <q-spinner color="primary" size="36px" />
        </div>
        <div v-else class="dest-grid">
          <div
            v-for="prestador in prestadoresDestaque"
            :key="prestador.id"
            class="dest-card"
            @click="verPrestador(prestador.id)"
          >
            <div class="dest-card__img">
              <q-img :src="prestador.foto || defaultImage" height="90px" fit="cover" />
            </div>
            <div class="dest-card__body">
              <div class="dest-card__name">{{ prestador.nome }}</div>
              <div class="dest-card__cat">
                {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
              </div>
              <div class="dest-card__stars">
                <q-rating
                  :model-value="obterMediaAvaliacao(prestador.media_avaliacao)"
                  size="12px"
                  :max="5"
                  color="amber-6"
                  readonly
                />
                <span class="dest-card__count">({{ prestador.total_avaliacoes || 0 }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promoções especiais -->
      <div v-if="promocoesReais.length > 0" class="page-section">
        <div class="section-header">
          <h2 class="section-title">Promoções especiais</h2>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todas →"
            class="section-link"
            to="/mobile/promocoes"
          />
        </div>
        <div class="promo-list">
          <div
            v-for="(promo, index) in promocoesReais"
            :key="index"
            class="promo-slide"
            :style="getPromoGradient(promo)"
            @click="usarPromocao(promo)"
          >
            <div class="promo-slide__info">
              <div class="promo-slide__title">{{ promo.titulo }}</div>
              <div class="promo-slide__sub">{{ promo.descricao }}</div>
              <div v-if="promo.codigo" class="promo-slide__code">
                <q-icon name="content_copy" size="11px" />
                {{ promo.codigo }}
              </div>
            </div>
            <div class="promo-slide__disc">
              {{
                promo.tipo_desconto === 'percentual'
                  ? `${promo.valor_desconto}% OFF`
                  : formatMoney(promo.valor_desconto) + ' OFF'
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Top prestadores -->
      <div v-if="prestadoresTop.length > 0" class="page-section">
        <div class="section-header">
          <h2 class="section-title">Top prestadores</h2>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todos →"
            class="section-link"
            to="/mobile/lista-prestadores"
          />
        </div>
        <div v-if="carregandoTop" class="loading-center">
          <q-spinner color="primary" size="36px" />
        </div>
        <div v-else class="top-list">
          <div
            v-for="(prestador, index) in prestadoresTop"
            :key="prestador.id"
            class="top-card"
            @click="verPrestador(prestador.id)"
          >
            <div class="top-card__avatar" :style="getAvatarStyle(prestador.nome)">
              {{ getInitials(prestador.nome) }}
            </div>
            <div class="top-card__info">
              <div class="top-card__name">{{ prestador.nome }}</div>
              <div class="top-card__cat">
                {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
                · ★ {{ obterMediaAvaliacao(prestador.media_avaliacao).toFixed(1) }}
              </div>
            </div>
            <div class="top-badge">Top #{{ index + 1 }}</div>
          </div>
        </div>
      </div>

      <!-- Últimos pedidos -->
      <div v-if="ultimosPedidos.length > 0" class="page-section">
        <div class="section-header">
          <h2 class="section-title">Seus últimos pedidos</h2>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todos →"
            class="section-link"
            to="/mobile/meus-pedidos"
          />
        </div>
        <div class="orders-list">
          <div
            v-for="pedido in ultimosPedidos"
            :key="pedido.id"
            class="order-card"
            @click="verPedido(pedido.id)"
          >
            <div class="order-card__icon">
              <q-icon name="receipt_long" size="20px" />
            </div>
            <div class="order-card__info">
              <div class="order-card__num">Pedido #{{ pedido.numero }}</div>
              <span class="order-status" :class="`order-status--${pedido.status}`">
                {{ getStatusTexto(pedido.status) }}
              </span>
            </div>
            <div class="order-card__price">
              {{ pedido.valor ? formatMoney(pedido.valor) : 'A definir' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-if="!temDados" class="empty-state">
        <q-icon name="explore" size="56px" class="empty-state__icon" />
        <h3 class="empty-state__title">Bem-vindo ao EstouAqui!</h3>
        <p class="empty-state__text">
          Explore os serviços disponíveis e encontre os melhores prestadores.
        </p>
        <q-btn
          unelevated
          color="primary"
          label="Explorar serviços"
          to="/mobile/lista-prestadores"
          class="q-mt-sm"
          no-caps
        />
      </div>
    </template>

    <!-- FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="abrirModalCriarPedido"
        class="fab-btn"
        aria-label="Criar novo pedido"
      />
    </q-page-sticky>

    <!-- Modal criar pedido -->
    <q-dialog v-model="modalCriarPedido" persistent>
      <q-card class="modal-pedido">
        <div class="modal-pedido__head">
          <div class="modal-pedido__title">Novo pedido de serviço</div>
          <div class="modal-pedido__sub">Descreva o que precisa</div>
        </div>

        <q-card-section class="modal-pedido__body">
          <div class="field-label">Tipo de serviço *</div>
          <q-select
            v-model="novoPedido.categoria_id"
            :options="categoriasOptions"
            label="Selecione a categoria"
            outlined
            dense
            class="field-input q-mb-md"
            emit-value
            map-options
          />

          <div class="field-label">Descrição *</div>
          <q-input
            v-model="novoPedido.descricao"
            type="textarea"
            outlined
            dense
            placeholder="Ex: Preciso de um canalizador para reparar uma fuga..."
            class="field-input q-mb-md"
            rows="3"
          />

          <div class="field-label">Localização *</div>
          <q-input
            v-model="novoPedido.endereco"
            outlined
            dense
            placeholder="Ex: Rua da Paz, 123, Maputo"
            class="field-input q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="grey-5" />
            </template>
          </q-input>

          <div class="field-label">Foto (opcional)</div>
          <div class="photo-upload" @click="triggerFileInput">
            <input
              ref="fotoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFotoUpload"
            />
            <div v-if="fotoPreview" class="photo-upload__preview">
              <img :src="fotoPreview" alt="Preview" />
              <q-btn
                flat
                round
                dense
                icon="close"
                size="sm"
                class="photo-upload__remove"
                @click.stop="removerFoto"
              />
            </div>
            <div v-else class="photo-upload__placeholder">
              <q-icon name="add_a_photo" size="28px" color="grey-4" />
              <div class="photo-upload__text">Clique para adicionar foto</div>
              <div class="photo-upload__hint">JPG, PNG até 5MB</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-pedido__actions">
          <q-btn flat no-caps label="Cancelar" v-close-popup class="btn-cancel" />
          <q-btn
            unelevated
            no-caps
            label="Publicar pedido"
            color="primary"
            :loading="carregandoCriarPedido"
            @click="criarPedido"
            class="btn-publish"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { useClienteInicioStore } from 'src/stores/client/cliente-inicio-store';

defineOptions({ name: 'MobileInicio' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const inicioStore = useClienteInicioStore();

// ===================== ESTADOS PARA AVATAR =====================
const avatarError = ref(false);
const fotoTimestamp = ref(Date.now());

// ===================== COMPUTED PARA AVATAR =====================
const avatarUrl = computed(() => {
  if (authStore.user?.foto) {
    if (authStore.user.foto.startsWith('http')) {
      return authStore.user.foto;
    }
    return `http://localhost:8000/storage/${authStore.user.foto}`;
  }
  return '';
});

const avatarUrlComTimestamp = computed(() => {
  if (!avatarUrl.value) return '';
  return `${avatarUrl.value}${avatarUrl.value.includes('?') ? '&' : '?'}t=${fotoTimestamp.value}`;
});

const avatarColor = computed(() => {
  const colors = [
    '#5B4BF5',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
  ];
  const nome = authStore.user?.nome || '';
  const index = Math.abs(nome.length) % colors.length;
  return colors[index] || '#5B4BF5';
});

// Computed para as iniciais do avatar (com segurança)
const avatarIniciais = computed(() => {
  const nome = authStore.user?.nome || '';
  if (!nome.trim()) return 'U';

  const partes = nome.trim().split(' ');

  if (partes.length === 1) {
    // ✅ Verificação segura para partes[0]
    const primeiraParte = partes[0];
    if (primeiraParte && primeiraParte.length > 0) {
      return primeiraParte.charAt(0).toUpperCase();
    }
    return 'U';
  }

  const primeiraLetra = partes[0]?.charAt(0) || '';
  const ultimaLetra = partes[partes.length - 1]?.charAt(0) || '';

  if (!primeiraLetra && !ultimaLetra) return 'U';
  if (!primeiraLetra) return ultimaLetra.toUpperCase();
  if (!ultimaLetra) return primeiraLetra.toUpperCase();

  return (primeiraLetra + ultimaLetra).toUpperCase();
});

// ===================== WATCH para atualizar avatar quando foto mudar =====================
watch(
  () => authStore.user?.foto,
  () => {
    fotoTimestamp.value = Date.now();
    avatarError.value = false;
  },
);

// Referências DOM
const fotoInput = ref<HTMLInputElement | null>(null);

// Bindings para a store
const carregandoInicial = computed(() => inicioStore.carregandoInicial);
const carregandoDestaque = computed(() => inicioStore.carregandoDestaque);
const carregandoTop = computed(() => inicioStore.carregandoTop);
const carregandoCriarPedido = computed(() => inicioStore.carregandoCriarPedido);
const modalCriarPedido = computed({
  get: () => inicioStore.modalCriarPedidoAberto,
  set: (value) => {
    if (value) {
      inicioStore.abrirModalCriarPedido();
    } else {
      inicioStore.fecharModalCriarPedido();
    }
  },
});

// Dados da store
const categoriasPopulares = computed(() => inicioStore.categoriasPopulares);
const prestadoresDestaque = computed(() => inicioStore.prestadoresDestaqueLimitados);
const prestadoresTop = computed(() => inicioStore.prestadoresTopLimitados);
const promocoesReais = computed(() => inicioStore.promocoesAtivas);
const ultimosPedidos = computed(() => inicioStore.ultimosTresPedidos);
const notificacoesNaoLidas = computed(() => inicioStore.notificacoesNaoLidas);
const pedidosPendentes = computed(() => inicioStore.pedidosPendentes);
const favoritosCount = computed(() => inicioStore.favoritosCount);
const temDados = computed(() => inicioStore.temDados);

const categoriasOptions = computed(() => inicioStore.categoriasOptions);
const fotoPreview = computed(() => inicioStore.fotoPreview);
const novoPedido = computed({
  get: () => inicioStore.novoPedido,
  set: (value) => inicioStore.atualizarNovoPedido(value),
});

// Computed locais
const userName = computed<string>(() => authStore.user?.nome?.split(' ')[0] || 'Utilizador');
const diaSemana = computed(() => new Date().toLocaleDateString('pt-PT', { weekday: 'long' }));
const dataFormatada = computed(() =>
  new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }),
);

// Constantes
const defaultImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';

// Navegação
const goTo = (path: string) => void router.push(path);
const verPrestador = (id: number) => id && void router.push(`/mobile/perfil-prestador/${id}`);
const verPedido = (id: number) => id && void router.push(`/mobile/detalhes-pedido/${id}`);
const buscarPorCategoria = (id: number) =>
  id && void router.push(`/mobile/lista-prestadores?categoria=${id}`);
const verPromocao = () => void router.push('/mobile/promocoes');

// Ações do modal
const abrirModalCriarPedido = () => inicioStore.abrirModalCriarPedido();
const triggerFileInput = () => fotoInput.value?.click();

const handleFotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const success = inicioStore.adicionarFoto(file);
    if (!success) {
      $q.notify({
        type: 'negative',
        message: 'Arquivo deve ter no máximo 5MB',
        position: 'top',
      });
    }
  }
};

const removerFoto = () => inicioStore.removerFoto();

const criarPedido = async () => {
  const success = await inicioStore.criarPedidoServico(inicioStore.novoPedido);

  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Pedido publicado com sucesso!',
      position: 'top',
    });
    inicioStore.fecharModalCriarPedido();
  } else {
    const error = inicioStore.validationErrors[0];
    $q.notify({
      type: 'negative',
      message: error?.message || 'Erro ao criar pedido. Tente novamente.',
      position: 'top',
    });
  }
};

const usarPromocao = async (promo: { codigo: string }) => {
  if (!promo?.codigo) return;
  const result = await inicioStore.validarCupom(promo.codigo);
  if (result) {
    $q.notify({
      type: 'positive',
      message: `Cupom ${promo.codigo} aplicado!`,
      position: 'top',
    });
  }
};

// Helpers de estilo
const getCatIconStyle = (cor?: string) => inicioStore.getCatIconStyle(cor);
const getAvatarStyle = (nome: string) => inicioStore.getAvatarStyle(nome);
const getInitials = (nome: string) => inicioStore.getInitials(nome);
const formatMoney = (value: number) => inicioStore.formatMoney(value);
const getStatusTexto = (status: string) => inicioStore.getStatusTexto(status);
const obterMediaAvaliacao = (media: string | number | null | undefined) =>
  inicioStore.obterMediaAvaliacao(media);

const getPromoGradient = (promo: { id: number }) => {
  const gradients = [
    'linear-gradient(135deg,#667EEA,#764BA2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
  ];
  return {
    background: gradients[Math.abs(promo.id) % gradients.length],
  };
};

// Inicialização
onMounted(() => {
  void inicioStore.carregarDadosIniciais();
});

onUnmounted(() => {
  inicioStore.resetarStore();
});
</script>

<style scoped lang="scss">
// =====================
// TOKENS
// =====================
$primary: #667eea;
$primary-2: #764ba2;
$primary-light: rgba(102, 126, 234, 0.09);
$primary-mid: rgba(102, 126, 234, 0.18);
$green: #10b981;
$green-light: rgba(16, 185, 129, 0.1);
$gold: #f59e0b;
$red: #ef4444;
$ink: #0f0f1a;
$ink-2: #3d3d55;
$muted: #9898b0;
$line: rgba(0, 0, 0, 0.07);
$surface: #ffffff;
$bg: #f3f3f8;
$radius: 14px;
$radius-sm: 10px;
$radius-xs: 8px;

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

%shimmer {
  background: linear-gradient(90deg, #e4e4ec 25%, #f0f0f6 50%, #e4e4ec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-loading {
  background: $bg;
  min-height: 100vh;
}

.skeleton-header {
  background: $surface;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid $line;
}
.skeleton-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  flex-shrink: 0;
  @extend %shimmer;
}
.skeleton-header-text {
  flex: 1;
}
.skeleton-date {
  width: 70px;
  height: 32px;
  border-radius: $radius-xs;
  @extend %shimmer;
}

.skeleton-stats {
  display: flex;
  gap: 8px;
  padding: 14px 16px;
  .skeleton-stat-pill {
    flex: 1;
    background: $surface;
    border-radius: $radius-sm;
    padding: 12px 8px;
    text-align: center;
    border: 1px solid $line;
  }
}
.skeleton-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin: 0 auto 8px;
  @extend %shimmer;
}

.skeleton-banner {
  height: 88px;
  border-radius: $radius;
  margin: 0 16px 20px;
  @extend %shimmer;
}

.skeleton-section {
  background: $surface;
  border-radius: $radius;
  margin: 0 16px 16px;
  padding: 16px;
  border: 1px solid $line;
}
.skeleton-section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.skeleton-cats {
  display: flex;
  gap: 8px;
}
.skeleton-cat {
  flex: 1;
  text-align: center;
}
.skeleton-cat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin: 0 auto 8px;
  @extend %shimmer;
}

.skeleton-dest {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.skeleton-dest-card {
  border-radius: $radius-sm;
  overflow: hidden;
  border: 1px solid $line;
  background: $surface;
}
.skeleton-dest-img {
  height: 90px;
  @extend %shimmer;
}
.skeleton-dest-info {
  padding: 10px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  margin: 5px 0;
  @extend %shimmer;
  &.w-20 {
    width: 20%;
  }
  &.w-30 {
    width: 30%;
  }
  &.w-40 {
    width: 40%;
  }
  &.w-50 {
    width: 50%;
  }
  &.w-60 {
    width: 60%;
  }
  &.w-80 {
    width: 80%;
  }
}

// =====================
// LAYOUT
// =====================
.inicio-page {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 20px;
}

// =====================
// HEADER
// =====================
.page-header {
  background: $surface;
  padding: 20px 16px 16px;
  border-bottom: 1px solid $line;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

// =====================
// AVATAR HEADER
// =====================
.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.avatar-placeholder-header {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-sub {
  font-size: 11px;
  color: $muted;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1px;
}
.header-name {
  font-size: 18px;
  font-weight: 700;
  color: $ink;
  line-height: 1.2;
}
.header-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: $green;
  margin-top: 2px;
  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $green;
  }
}
.header-date {
  font-size: 11px;
  color: $muted;
  text-align: right;
  line-height: 1.6;
  text-transform: capitalize;
}

// =====================
// STATS PILLS
// =====================
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 16px;
}

.stat-pill {
  background: $surface;
  border-radius: $radius-sm;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid $line;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-1px);
  }

  &__icon {
    margin-bottom: 6px;
  }
  &__value {
    font-size: 20px;
    font-weight: 700;
    color: $ink;
    line-height: 1;
  }
  &__label {
    font-size: 10px;
    color: $muted;
    margin-top: 3px;
    line-height: 1.3;
  }

  &--primary .stat-pill__icon {
    color: $primary;
  }
  &--purple .stat-pill__icon {
    color: $primary-2;
  }
  &--red .stat-pill__icon {
    color: $red;
  }
}

// =====================
// PROMO BANNER
// =====================
.promo-banner {
  background: $primary;
  border-radius: $radius;
  padding: 16px;
  margin: 0 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::after,
  &::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }
  &::after {
    width: 90px;
    height: 90px;
    right: -15px;
    top: -20px;
  }
  &::before {
    width: 60px;
    height: 60px;
    right: 40px;
    bottom: -25px;
    background: rgba(255, 255, 255, 0.05);
  }

  &__icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__body {
    flex: 1;
    position: relative;
    z-index: 1;
  }
  &__title {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }
  &__sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
  &__cta {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    white-space: nowrap;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }
}

// =====================
// SECTION
// =====================
.page-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: $ink;
    margin: 0;
  }
  .section-link {
    font-size: 12px;
    color: $primary;
    font-weight: 500;
    padding: 3px 8px !important;
    border-radius: $radius-xs !important;
    &:hover {
      background: $primary-light !important;
    }
  }
}

.loading-center {
  text-align: center;
  padding: 20px 0;
}

// =====================
// CATEGORIAS
// =====================
.cats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 0 16px;
}

.cat-card {
  background: $surface;
  border-radius: $radius-sm;
  padding: 12px 6px;
  text-align: center;
  cursor: pointer;
  border: 1px solid $line;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: $primary;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
  }
  &__name {
    font-size: 11px;
    font-weight: 500;
    color: $ink;
    margin-bottom: 2px;
  }
  &__count {
    font-size: 10px;
    color: $muted;
  }
}

// =====================
// DESTAQUE GRID
// =====================
.dest-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 16px;
}

.dest-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &__body {
    padding: 10px 12px;
  }
  &__name {
    font-size: 13px;
    font-weight: 500;
    color: $ink;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__cat {
    font-size: 11px;
    color: $muted;
    margin-bottom: 4px;
  }
  &__stars {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  &__count {
    font-size: 10px;
    color: $muted;
  }
}

// =====================
// PROMOÇÕES
// =====================
.promo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.promo-slide {
  border-radius: $radius;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &__info {
    flex: 1;
  }
  &__title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }
  &__sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 5px;
  }
  &__code {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.75);
    font-family: monospace;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  &__disc {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    white-space: nowrap;
  }
}

// =====================
// TOP LIST
// =====================
.top-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.top-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $primary-light;
  }

  &__avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  &__info {
    flex: 1;
    min-width: 0;
  }
  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $ink;
    margin-bottom: 2px;
  }
  &__cat {
    font-size: 11px;
    color: $muted;
  }
}

.top-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  background: $primary-light;
  color: $primary;
  white-space: nowrap;
}

// =====================
// ORDERS LIST
// =====================
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.order-card {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $primary-light;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-xs;
    background: $primary-light;
    color: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__info {
    flex: 1;
  }
  &__num {
    font-size: 13px;
    font-weight: 500;
    color: $ink;
    margin-bottom: 3px;
  }
  &__price {
    font-size: 14px;
    font-weight: 700;
    color: $primary;
    white-space: nowrap;
  }
}

.order-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--pendente {
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
  }
  &--aceito {
    background: $green-light;
    color: darken($green, 15%);
  }
  &--em_andamento {
    background: $primary-light;
    color: $primary;
  }
  &--concluido {
    background: $green-light;
    color: darken($green, 15%);
  }
  &--cancelado {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
  }
}

// =====================
// FAB
// =====================
.fab-btn {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
  transition: all 0.3s !important;
  &:hover {
    transform: scale(1.06);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5) !important;
  }
}

// =====================
// EMPTY STATE
// =====================
.empty-state {
  background: $surface;
  border-radius: $radius;
  border: 1px solid $line;
  margin: 20px 16px;
  padding: 40px 24px;
  text-align: center;

  &__icon {
    color: #ccc;
    margin-bottom: 14px;
  }
  &__title {
    font-size: 17px;
    font-weight: 600;
    color: $ink;
    margin-bottom: 6px;
  }
  &__text {
    font-size: 13px;
    color: $muted;
    line-height: 1.5;
  }
}

// =====================
// MODAL
// =====================
.modal-pedido {
  min-width: 320px;
  max-width: 480px;
  width: 100%;
  border-radius: 20px !important;
  overflow: hidden;

  &__head {
    padding: 18px 20px 16px;
    background: linear-gradient(135deg, $primary, $primary-2);
  }
  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }
  &__sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
  }
  &__body {
    padding: 16px 20px;
  }
  &__actions {
    padding: 8px 20px 20px !important;
    gap: 8px;
  }
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: $ink-2;
  margin-bottom: 5px;
}
.field-input {
  border-radius: $radius-xs !important;
}

.btn-cancel {
  padding: 8px 16px !important;
  border-radius: $radius-xs !important;
  color: $muted !important;
  font-size: 13px !important;
}
.btn-publish {
  padding: 8px 20px !important;
  border-radius: $radius-xs !important;
  font-size: 13px !important;
  font-weight: 600 !important;
}

.photo-upload {
  border: 1.5px dashed $line;
  border-radius: $radius-sm;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: $bg;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    background: $primary-light;
  }

  &__preview {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 200px;
    height: 140px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: $radius-xs;
    }
  }
  &__remove {
    position: absolute;
    top: -8px;
    right: -8px;
    background: $surface !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
  }
  &__placeholder {
  }
  &__text {
    font-size: 13px;
    color: $muted;
    font-weight: 500;
    margin-top: 8px;
  }
  &__hint {
    font-size: 11px;
    color: lighten($muted, 10%);
    margin-top: 3px;
  }
}
</style>
