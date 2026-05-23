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
          <q-avatar size="46px" class="user-avatar">
            <img :src="authStore.userFoto || defaultAvatar" />
          </q-avatar>
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
          <div class="stat-pill__value">{{ pedidosStore.dashboard?.pedidos_pendentes || 0 }}</div>
          <div class="stat-pill__label">Pedidos ativos</div>
        </div>
        <div class="stat-pill stat-pill--purple" @click="goTo('/mobile/notificacoes')">
          <q-icon name="notifications" size="20px" class="stat-pill__icon" />
          <div class="stat-pill__value">{{ notificacoesNaoLidas }}</div>
          <div class="stat-pill__label">Notificações</div>
        </div>
        <div class="stat-pill stat-pill--red" @click="goTo('/mobile/favoritos')">
          <q-icon name="favorite" size="20px" class="stat-pill__icon" />
          <div class="stat-pill__value">{{ pedidosStore.dashboard?.favoritos_count || 0 }}</div>
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
      <div
        v-if="!prestadoresDestaque.length && !prestadoresTop.length && !ultimosPedidos.length"
        class="empty-state"
      >
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
            :rules="[(val) => !!val || 'Selecione uma categoria']"
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
            :rules="[(val) => !!val || 'Descrição obrigatória']"
          />

          <div class="field-label">Localização *</div>
          <q-input
            v-model="novoPedido.endereco"
            outlined
            dense
            placeholder="Ex: Rua da Paz, 123, Maputo"
            class="field-input q-mb-md"
            :rules="[(val) => !!val || 'Endereço obrigatório']"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/auth-store';
// ✅ IMPORTS CORRETOS - Stores separados
import {
  useClientePublicStore,
  type CategoriaData,
  type PrestadorData,
} from 'src/stores/client/cliente-public-store';
import { useClientePedidosStore, type PedidoData } from 'src/stores/client/cliente-pedidos-store';
import {
  useClienteComunicacaoStore,
  type NotificacaoData,
} from 'src/stores/client/cliente-comunicacao-store';
import { usePromocaoStore, type PromocaoData } from 'src/stores/client/promocao-store';

defineOptions({ name: 'MobileInicio' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// ✅ USANDO OS STORES CORRETOS
const publicStore = useClientePublicStore();
const pedidosStore = useClientePedidosStore();
const comunicacaoStore = useClienteComunicacaoStore();
const promocaoStore = usePromocaoStore();

const defaultImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';
const defaultAvatar = 'https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=48';

// Estados
const carregandoInicial = ref(true);
const carregandoDestaque = ref(true);
const carregandoTop = ref(true);
const categoriasCarregadas = ref<CategoriaData[]>([]);

// Estados modal
const modalCriarPedido = ref(false);
const carregandoCriarPedido = ref(false);
const fotoInput = ref<HTMLInputElement | null>(null);
const fotoPreview = ref<string | null>(null);
const fotoFile = ref<File | null>(null);
const novoPedido = ref({ categoria_id: null as number | null, descricao: '', endereco: '' });
const categoriasOptions = ref<{ label: string; value: number }[]>([]);

// Helpers
const ensureArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const obterMediaAvaliacao = (media: string | number | null | undefined): number => {
  if (media === null || media === undefined) return 0;
  const num = typeof media === 'string' ? parseFloat(media) : media;
  return isNaN(num) ? 0 : num;
};

// Computed usando stores separados
const categoriasPopulares = computed<CategoriaData[]>(() =>
  ensureArray<CategoriaData>(categoriasCarregadas.value),
);
const promocoesReais = computed<PromocaoData[]>(() =>
  ensureArray<PromocaoData>(promocaoStore.promocoes),
);
const ultimosPedidos = computed<PedidoData[]>(() =>
  ensureArray<PedidoData>(pedidosStore.pedidos).slice(0, 3),
);
const userName = computed<string>(() => authStore.user?.nome?.split(' ')[0] || 'Utilizador');
const notificacoesNaoLidas = computed<number>(
  () => ensureArray<NotificacaoData>(comunicacaoStore.notificacoes).filter((n) => !n.lida).length,
);
const prestadoresDestaque = computed<PrestadorData[]>(() =>
  ensureArray<PrestadorData>(publicStore.prestadoresDestaque).slice(0, 4),
);
const prestadoresTop = computed<PrestadorData[]>(() =>
  ensureArray<PrestadorData>(publicStore.prestadoresTop).slice(0, 3),
);

const diaSemana = computed(() => new Date().toLocaleDateString('pt-PT', { weekday: 'long' }));
const dataFormatada = computed(() =>
  new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }),
);

// Avatar helpers
const avatarGradients = [
  'linear-gradient(135deg,#667EEA,#764BA2)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#EF4444,#DC2626)',
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
];

const getAvatarStyle = (nome: string) => ({
  background: avatarGradients[nome.charCodeAt(0) % avatarGradients.length],
});

const getInitials = (nome: string) =>
  nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const getCatIconStyle = (cor?: string) => ({
  background: cor ? `${cor}18` : 'rgba(102,126,234,0.1)',
  color: cor || '#667EEA',
});

// Format helpers
const formatMoney = (value: number): string =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);

const getStatusTexto = (status: string): string => {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return map[status] || status;
};

const promoGradients = [
  'linear-gradient(135deg,#667EEA,#764BA2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
];

const getPromoGradient = (promo: PromocaoData) => ({
  background: promoGradients[Math.abs(promo?.id ?? 0) % promoGradients.length],
});

// Navegação
const goTo = (path: string) => void router.push(path);
const verPrestador = (id: number) => id && void router.push(`/mobile/perfil-prestador/${id}`);
const verPedido = (id: number) => id && void router.push(`/mobile/detalhes-pedido/${id}`);
const buscarPorCategoria = (id: number) =>
  id && void router.push(`/mobile/lista-prestadores?categoria=${id}`);
const verPromocao = () => void router.push('/mobile/promocoes');

const usarPromocao = async (promo: PromocaoData) => {
  if (!promo?.codigo) return;
  const result = await promocaoStore.validarCupom(promo.codigo);
  if (result) {
    $q.notify({ type: 'positive', message: `Cupom ${promo.codigo} aplicado!`, position: 'top' });
  }
};

// Modal
const abrirModalCriarPedido = () => {
  novoPedido.value = { categoria_id: null, descricao: '', endereco: '' };
  fotoPreview.value = null;
  fotoFile.value = null;
  modalCriarPedido.value = true;
};

const triggerFileInput = () => fotoInput.value?.click();

const handleFotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'Imagem deve ter no máximo 5MB', position: 'top' });
    return;
  }
  fotoFile.value = file;
  fotoPreview.value = URL.createObjectURL(file);
};

const removerFoto = () => {
  if (fotoPreview.value) URL.revokeObjectURL(fotoPreview.value);
  fotoPreview.value = null;
  fotoFile.value = null;
  if (fotoInput.value) fotoInput.value.value = '';
};

const criarPedido = async () => {
  if (!novoPedido.value.categoria_id) {
    $q.notify({ type: 'warning', message: 'Selecione o tipo de serviço', position: 'top' });
    return;
  }
  if (!novoPedido.value.descricao?.trim()) {
    $q.notify({ type: 'warning', message: 'Descreva o serviço que precisa', position: 'top' });
    return;
  }
  if (!novoPedido.value.endereco?.trim()) {
    $q.notify({ type: 'warning', message: 'Informe o endereço', position: 'top' });
    return;
  }
  carregandoCriarPedido.value = true;
  try {
    // ✅ Usando pedidosStore
    const resultado = await pedidosStore.criarPedidoServico({
      categoria_id: Number(novoPedido.value.categoria_id),
      descricao: novoPedido.value.descricao.trim(),
      endereco: novoPedido.value.endereco.trim(),
      foto: fotoFile.value,
    });
    if (resultado) {
      $q.notify({ type: 'positive', message: 'Pedido publicado com sucesso!', position: 'top' });
      modalCriarPedido.value = false;
      await Promise.all([pedidosStore.fetchDashboard(true), pedidosStore.fetchMeusPedidos(true)]);
    } else {
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar pedido. Tente novamente.',
        position: 'top',
      });
    }
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Erro ao criar pedido.',
      position: 'top',
    });
  } finally {
    carregandoCriarPedido.value = false;
  }
};

// Carregamento
const carregarCategoriasSelect = async () => {
  try {
    // ✅ Usando publicStore
    const cats = await publicStore.fetchCategorias();
    if (Array.isArray(cats)) {
      categoriasOptions.value = cats.map((c: CategoriaData) => ({ label: c.nome, value: c.id }));
    }
  } catch (error) {
    console.error(error);
  }
};

const carregarDados = async () => {
  carregandoInicial.value = true;
  try {
    try {
      // ✅ Usando publicStore
      const cats = await publicStore.fetchCategorias();
      categoriasCarregadas.value = Array.isArray(cats) ? cats : [];
    } catch {
      categoriasCarregadas.value = [];
    }

    await Promise.all([
      pedidosStore.fetchDashboard(),
      pedidosStore.fetchMeusPedidos(),
      comunicacaoStore.fetchNotificacoes(),
      comunicacaoStore.fetchFavoritos(),
    ]);

    await Promise.all([
      publicStore.fetchPrestadoresDestaque().finally(() => {
        carregandoDestaque.value = false;
      }),
      publicStore.fetchPrestadoresTop().finally(() => {
        carregandoTop.value = false;
      }),
    ]);

    await promocaoStore.fetchPromocoes().catch(() => {});
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    carregandoDestaque.value = false;
    carregandoTop.value = false;
  } finally {
    setTimeout(() => {
      carregandoInicial.value = false;
    }, 400);
  }
};

onMounted(() => {
  void carregarDados();
  void carregarCategoriasSelect();
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

.user-avatar {
  border: 2px solid rgba(102, 126, 234, 0.2);
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
