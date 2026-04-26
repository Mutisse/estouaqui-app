<template>
  <q-page class="inicio-page bg-grey-1">
    <!-- Skeleton Loading (mostra enquanto carrega) -->
    <div v-if="carregandoInicial" class="skeleton-loading">
      <!-- Skeleton Header -->
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-text">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
        </div>
        <div class="skeleton-date"></div>
      </div>

      <!-- Skeleton Stats Cards -->
      <div class="skeleton-stats">
        <div v-for="i in 3" :key="i" class="skeleton-stat-card">
          <div class="skeleton-icon"></div>
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-30"></div>
        </div>
      </div>

      <!-- Skeleton Banner -->
      <div class="skeleton-banner"></div>

      <!-- Skeleton Categories -->
      <div class="skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-20"></div>
        </div>
        <div class="skeleton-categorias">
          <div v-for="i in 4" :key="i" class="skeleton-categoria-item">
            <div class="skeleton-category-icon"></div>
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Prestadores -->
      <div class="skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-20"></div>
        </div>
        <div class="skeleton-prestadores">
          <div v-for="i in 2" :key="i" class="skeleton-prestador-card">
            <div class="skeleton-card-img"></div>
            <div class="skeleton-card-info">
              <div class="skeleton-line w-80"></div>
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-40"></div>
            </div>
          </div>
        </div>
      </div>

      
    </div>

    <!-- Conteúdo real -->
    <template v-else>
      <!-- Saudação do usuário com foto -->
      <div class="greeting-section q-pa-md">
        <div class="greeting">
          <q-avatar size="48px" class="q-mr-sm">
            <img :src="authStore.userFoto || defaultAvatar" />
          </q-avatar>
          <div>
            <span class="greeting-text">Olá,</span>
            <span class="user-name">{{ userName }}</span>
            <div class="user-badge" v-if="authStore.isCliente">
              <q-icon name="check_circle" size="14px" color="positive" />
              <span>Cliente verificado</span>
            </div>
          </div>
        </div>
        <div class="date">{{ currentDate }}</div>
      </div>

      <!-- Stats Cards -->
      <div class="summary-cards q-px-md q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/meus-pedidos')">
              <q-icon name="assignment" size="20px" color="primary" />
              <div class="summary-value">{{ clienteStore.dashboard?.pedidos_pendentes || 0 }}</div>
              <div class="summary-label">Pedidos ativos</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/notificacoes')">
              <q-icon name="chat" size="20px" color="secondary" />
              <div class="summary-value">{{ notificacoesNaoLidas }}</div>
              <div class="summary-label">Notificações</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card" @click="goTo('/mobile/favoritos')">
              <q-icon name="favorite" size="20px" color="red" />
              <div class="summary-value">{{ clienteStore.dashboard?.favoritos_count || 0 }}</div>
              <div class="summary-label">Favoritos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner promocional -->
      <div class="section q-px-md q-mb-md">
        <div class="promo-banner" @click="verPromocao">
          <div class="promo-banner-content">
            <q-icon name="emoji_people" size="32px" color="white" />
            <div>
              <div class="promo-banner-title">Ganhe 500 MZN</div>
              <div class="promo-banner-subtitle">Indique um amigo e ganhe bónus</div>
            </div>
            <q-btn flat dense label="Saber mais" text-color="white" />
          </div>
        </div>
      </div>

      <!-- Categorias populares -->
      <div class="section q-px-md q-mb-md" v-if="categoriasPopulares.length > 0">
        <div class="section-header">
          <div class="section-title">Categorias populares</div>
          <q-btn
            flat
            dense
            label="Ver todas"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>
        <div class="row q-col-gutter-sm">
          <div
            v-for="categoria in categoriasPopulares.slice(0, 4)"
            :key="categoria.id"
            class="col-3"
          >
            <div class="category-card" @click="buscarPorCategoria(categoria.id)">
              <q-icon
                :name="categoria.icone || 'category'"
                size="28px"
                :color="categoria.cor || 'primary'"
              />
              <div class="category-name">{{ categoria.nome }}</div>
              <div class="category-count">{{ categoria.servicos_count || 0 }} serviços</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prestadores em destaque -->
      <div class="section q-px-md q-mb-md" v-if="prestadoresDestaque.length > 0">
        <div class="section-header">
          <div class="section-title">Prestadores em destaque</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>

        <div v-if="carregandoDestaque" class="text-center q-py-md">
          <q-spinner color="primary" size="40px" />
        </div>
        <div v-else class="row q-col-gutter-sm">
          <div v-for="prestador in prestadoresDestaque" :key="prestador.id" class="col-6">
            <q-card class="service-card" flat bordered @click="verPrestador(prestador.id)">
              <q-img :src="prestador.foto || defaultImage" height="100px" />
              <q-card-section class="q-pa-sm">
                <div class="service-title">{{ prestador.nome }}</div>
                <div class="service-provider">
                  {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
                </div>
                <div class="service-rating">
                  <q-rating
                    :model-value="obterMediaAvaliacao(prestador.media_avaliacao)"
                    size="14px"
                    :max="5"
                    color="yellow"
                    readonly
                  />
                  <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Promoções (carrossel) -->
      <div class="section q-px-md q-mb-md" v-if="promocoesReais.length > 0">
        <div class="section-header">
          <div class="section-title">Promoções especiais</div>
          <q-btn flat dense label="Ver todas" class="section-link" to="/mobile/promocoes" no-caps />
        </div>

        <div class="promo-slider">
          <q-carousel
            v-model="promoSlide"
            animated
            navigation
            padding
            arrows
            height="130px"
            class="rounded-borders"
          >
            <q-carousel-slide
              v-for="(promo, index) in promocoesReais"
              :key="index"
              :name="index"
              class="no-padding"
            >
              <div class="promo-card-slide" :style="getPromoGradient(promo)">
                <div class="promo-slide-content">
                  <div class="promo-info">
                    <div class="promo-title">{{ promo.titulo }}</div>
                    <div class="promo-subtitle">{{ promo.descricao }}</div>
                    <div class="promo-code" v-if="promo.codigo">
                      <q-icon name="content_copy" size="12px" />
                      Cupom: {{ promo.codigo }}
                    </div>
                    <div class="promo-validity" v-if="promo.validade">
                      <q-icon name="event" size="10px" />
                      Válido até {{ formatDate(promo.validade) }}
                    </div>
                  </div>
                  <q-btn
                    :label="
                      promo.tipo_desconto === 'percentual'
                        ? `${promo.valor_desconto}% OFF`
                        : formatMoney(promo.valor_desconto) + ' OFF'
                    "
                    size="sm"
                    unelevated
                    color="white"
                    text-color="primary"
                    @click.stop="usarPromocao(promo)"
                  />
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <!-- Prestadores mais bem avaliados -->
      <div class="section q-px-md q-mb-md" v-if="prestadoresTop.length > 0">
        <div class="section-header">
          <div class="section-title">Top prestadores</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/lista-prestadores"
            no-caps
          />
        </div>

        <div v-if="carregandoTop" class="text-center q-py-md">
          <q-spinner color="primary" size="40px" />
        </div>
        <div v-else>
          <div
            v-for="prestador in prestadoresTop"
            :key="prestador.id"
            class="provider-card"
            @click="verPrestador(prestador.id)"
          >
            <div class="provider-item">
              <q-avatar size="50px" class="q-mr-sm">
                <img
                  :src="
                    prestador.foto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome)}&background=667eea&color=fff`
                  "
                />
              </q-avatar>
              <div class="provider-info">
                <div class="provider-name">{{ prestador.nome }}</div>
                <div class="provider-category">
                  {{ prestador.categorias?.[0]?.nome || prestador.profissao || 'Profissional' }}
                </div>
                <div class="provider-rating">
                  <q-rating
                    :model-value="obterMediaAvaliacao(prestador.media_avaliacao)"
                    size="14px"
                    :max="5"
                    color="yellow"
                    readonly
                  />
                  <span class="rating-count">({{ prestador.total_avaliacoes || 0 }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Últimos pedidos -->
      <div class="section q-px-md q-mb-md" v-if="ultimosPedidos.length > 0">
        <div class="section-header">
          <div class="section-title">Seus últimos pedidos</div>
          <q-btn
            flat
            dense
            label="Ver todos"
            class="section-link"
            to="/mobile/meus-pedidos"
            no-caps
          />
        </div>
        <div
          v-for="pedido in ultimosPedidos"
          :key="pedido.id"
          class="recent-order-card"
          @click="verPedido(pedido.id)"
        >
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <q-icon name="receipt" color="primary" />
            </q-avatar>
            <div class="col">
              <div class="order-number">Pedido #{{ pedido.numero }}</div>
              <div class="order-status" :class="pedido.status">
                {{ getStatusTexto(pedido.status) }}
              </div>
            </div>
            <div class="order-price">
              {{ pedido.valor ? formatMoney(pedido.valor) : 'A definir' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há dados -->
      <div
        v-if="!prestadoresDestaque.length && !prestadoresTop.length && !ultimosPedidos.length"
        class="empty-state q-pa-xl text-center"
      >
        <q-icon name="info" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Bem-vindo ao EstouAqui!</div>
        <div class="text-grey-6">
          Explore os serviços disponíveis e encontre os melhores prestadores.
        </div>
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Explorar serviços"
          to="/mobile/lista-prestadores"
        />
      </div>
    </template>

    <!-- Botão flutuante (+) para criar pedido -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        size="18px"
        @click="abrirModalCriarPedido"
        class="fab-button"
      />
    </q-page-sticky>

    <!-- Modal para criar pedido -->
    <q-dialog v-model="modalCriarPedido" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 100%; border-radius: 20px">
        <q-card-section
          class="q-pa-md"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <div class="text-h6 text-white">Novo Pedido de Serviço</div>
          <div class="text-subtitle2 text-white" style="opacity: 0.9">Descreva o que precisa</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <!-- Categoria -->
          <div class="input-label">Tipo de Serviço *</div>
          <q-select
            v-model="novoPedido.categoria_id"
            :options="categoriasOptions"
            label="Selecione a categoria"
            outlined
            dense
            class="q-mb-md"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Selecione uma categoria']"
          />

          <!-- Descrição -->
          <div class="input-label">Descrição *</div>
          <q-input
            v-model="novoPedido.descricao"
            type="textarea"
            outlined
            dense
            placeholder="Ex: Preciso de um canalizador para reparar uma fuga de água..."
            class="q-mb-md"
            :rules="[(val) => !!val || 'Descrição é obrigatória']"
            rows="3"
          />

          <!-- Endereço -->
          <div class="input-label">Localização *</div>
          <q-input
            v-model="novoPedido.endereco"
            outlined
            dense
            placeholder="Ex: Rua da Paz, 123, Maputo"
            class="q-mb-md"
            :rules="[(val) => !!val || 'Endereço é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="grey-6" />
            </template>
          </q-input>

          <!-- Foto (opcional) -->
          <div class="input-label">Foto (opcional)</div>
          <div class="photo-upload-area" @click="triggerFileInput">
            <input
              ref="fotoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFotoUpload"
            />
            <div class="photo-preview" v-if="fotoPreview">
              <img
                :src="fotoPreview"
                alt="Preview"
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px"
              />
              <q-btn
                flat
                round
                dense
                icon="close"
                size="sm"
                class="remove-photo"
                @click.stop="removerFoto"
              />
            </div>
            <div class="photo-placeholder" v-else>
              <q-icon name="add_a_photo" size="32px" color="grey-5" />
              <div class="placeholder-text">Clique para adicionar foto</div>
              <div class="placeholder-hint">JPG, PNG até 5MB</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup class="text-grey-7" />
          <q-btn
            unelevated
            label="Publicar Pedido"
            color="primary"
            :loading="carregandoCriarPedido"
            @click="criarPedido"
            class="q-px-md"
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
import {
  useClienteStore,
  type CategoriaData,
  type PrestadorData,
  type PedidoData,
  type NotificacaoData,
} from 'src/stores/cliente-store';
import { usePromocaoStore, type PromocaoData } from 'src/stores/promocao-store';

defineOptions({
  name: 'MobileInicio',
});

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const clienteStore = useClienteStore();
const promocaoStore = usePromocaoStore();

const defaultImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';
const defaultAvatar = 'https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=48';

// Estados
const carregandoInicial = ref(true);
const carregandoDestaque = ref(true);
const carregandoTop = ref(true);
const promoSlide = ref(0);
const categoriasCarregadas = ref<CategoriaData[]>([]);

// Estados para criar pedido
const modalCriarPedido = ref(false);
const carregandoCriarPedido = ref(false);
const fotoInput = ref<HTMLInputElement | null>(null);
const fotoPreview = ref<string | null>(null);
const fotoFile = ref<File | null>(null);

const novoPedido = ref({
  categoria_id: null as number | null,
  descricao: '',
  endereco: '',
});

// Options para selects
const categoriasOptions = ref<{ label: string; value: number }[]>([]);

// Função auxiliar para garantir que é array
const ensureArray = <T,>(value: T[] | null | undefined): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

// Função auxiliar para converter media_avaliacao para número
const obterMediaAvaliacao = (media: string | number | null | undefined): number => {
  if (media === null || media === undefined) return 0;
  const num = typeof media === 'string' ? parseFloat(media) : media;
  return isNaN(num) ? 0 : num;
};

// Computed com dados reais do store
const categoriasPopulares = computed<CategoriaData[]>(() => {
  return ensureArray<CategoriaData>(categoriasCarregadas.value);
});

// Promoções reais do store
const promocoesReais = computed<PromocaoData[]>(() => {
  return ensureArray<PromocaoData>(promocaoStore.promocoes);
});

// Últimos pedidos
const ultimosPedidos = computed<PedidoData[]>(() => {
  const pedidos = ensureArray<PedidoData>(clienteStore.pedidos);
  return pedidos.slice(0, 3);
});

const userName = computed<string>(() => {
  return authStore.user?.nome?.split(' ')[0] || 'Utilizador';
});

const currentDate = new Date().toLocaleDateString('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

// Notificações não lidas
const notificacoesNaoLidas = computed<number>(() => {
  const notificacoes = ensureArray<NotificacaoData>(clienteStore.notificacoes);
  return notificacoes.filter((n) => !n.lida).length;
});

// Prestadores destaque
const prestadoresDestaque = computed<PrestadorData[]>(() => {
  const prestadores = ensureArray<PrestadorData>(clienteStore.prestadoresDestaque);
  return prestadores.slice(0, 4);
});

// Prestadores top
const prestadoresTop = computed<PrestadorData[]>(() => {
  const prestadores = ensureArray<PrestadorData>(clienteStore.prestadoresTop);
  return prestadores.slice(0, 3);
});

// Funções auxiliares
const formatMoney = (value: number): string => {
  if (!value && value !== 0) return '0 MZN';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusTexto = (status: string): string => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return statusMap[status] || status;
};

const getPromoGradient = (promo: PromocaoData): { background: string } => {
  const gradients: string[] = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ];

  const id = promo?.id ?? 0;
  const index = Math.abs(id) % gradients.length;
  return { background: gradients[index]! };
};

const verPrestador = (id: number): void => {
  if (id) {
    void router.push(`/mobile/perfil-prestador/${id}`);
  }
};

const verPedido = (id: number): void => {
  if (id) {
    void router.push(`/mobile/detalhes-pedido/${id}`);
  }
};

const buscarPorCategoria = (id: number): void => {
  if (id) {
    void router.push(`/mobile/lista-prestadores?categoria=${id}`);
  }
};

const verPromocao = (): void => {
  void router.push('/mobile/promocoes');
};

const usarPromocao = async (promo: PromocaoData): Promise<void> => {
  if (!promo?.codigo) return;

  const result = await promocaoStore.validarCupom(promo.codigo);
  if (result) {
    $q.notify({
      type: 'positive',
      message: `Cupom ${promo.codigo} aplicado com sucesso!`,
      position: 'top',
    });
  }
};

const goTo = (path: string): void => {
  void router.push(path);
};

// Métodos para criar pedido
const abrirModalCriarPedido = () => {
  novoPedido.value = {
    categoria_id: null,
    descricao: '',
    endereco: '',
  };
  fotoPreview.value = null;
  fotoFile.value = null;
  modalCriarPedido.value = true;
};

const triggerFileInput = () => {
  fotoInput.value?.click();
};

const handleFotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'A imagem deve ter no máximo 5MB', position: 'top' });
    return;
  }

  fotoFile.value = file;
  fotoPreview.value = URL.createObjectURL(file);
};

const removerFoto = () => {
  if (fotoPreview.value) {
    URL.revokeObjectURL(fotoPreview.value);
  }
  fotoPreview.value = null;
  fotoFile.value = null;
  if (fotoInput.value) {
    fotoInput.value.value = '';
  }
};

const criarPedido = async () => {
  if (!novoPedido.value.categoria_id) {
    $q.notify({ type: 'warning', message: 'Selecione o tipo de serviço', position: 'top' });
    return;
  }

  if (!novoPedido.value.descricao || novoPedido.value.descricao.trim() === '') {
    $q.notify({ type: 'warning', message: 'Descreva o serviço que precisa', position: 'top' });
    return;
  }

  if (!novoPedido.value.endereco || novoPedido.value.endereco.trim() === '') {
    $q.notify({ type: 'warning', message: 'Informe o endereço', position: 'top' });
    return;
  }

  carregandoCriarPedido.value = true;

  try {
    const resultado = await clienteStore.criarPedidoServico({
      categoria_id: Number(novoPedido.value.categoria_id),
      descricao: novoPedido.value.descricao.trim(),
      endereco: novoPedido.value.endereco.trim(),
      foto: fotoFile.value,
    });

    if (resultado) {
      $q.notify({
        type: 'positive',
        message: 'Pedido publicado com sucesso! Prestadores vão analisar.',
        position: 'top',
      });
      modalCriarPedido.value = false;
      await clienteStore.fetchDashboard(true);
      await clienteStore.fetchMeusPedidos(true);
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
      message: err.response?.data?.message || 'Erro ao criar pedido. Tente novamente.',
      position: 'top',
    });
  } finally {
    carregandoCriarPedido.value = false;
  }
};

// Carregar categorias para o select
const carregarCategoriasSelect = async () => {
  try {
    const categorias = await clienteStore.fetchCategorias();
    if (categorias && Array.isArray(categorias)) {
      categoriasOptions.value = categorias.map((cat: CategoriaData) => ({
        label: cat.nome,
        value: cat.id,
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

// Carregamento faseado COM SKELETON
const carregarDados = async (): Promise<void> => {
  carregandoInicial.value = true;

  try {
    // Carregar categorias primeiro
    try {
      const categorias = await clienteStore.fetchCategorias();
      if (categorias && Array.isArray(categorias)) {
        categoriasCarregadas.value = categorias;
      } else {
        categoriasCarregadas.value = [];
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      categoriasCarregadas.value = [];
    }

    // Carregar outros dados em paralelo
    await Promise.all([
      clienteStore.fetchDashboard(),
      clienteStore.fetchMeusPedidos(),
      clienteStore.fetchNotificacoes(),
      clienteStore.fetchFavoritos(),
    ]);

    // Carregar prestadores
    await Promise.all([
      clienteStore.fetchPrestadoresDestaque().finally(() => {
        carregandoDestaque.value = false;
      }),
      clienteStore.fetchPrestadoresTop().finally(() => {
        carregandoTop.value = false;
      }),
    ]);

    // Carregar promoções
    await promocaoStore.fetchPromocoes().catch(() => {});
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    carregandoDestaque.value = false;
    carregandoTop.value = false;
  } finally {
    // Delay mínimo para o skeleton ser visível (evita flicker)
    setTimeout(() => {
      carregandoInicial.value = false;
    }, 500);
  }
};

// Iniciar carregamento
onMounted(() => {
  void carregarDados();
  void carregarCategoriasSelect();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.inicio-page {
  padding-bottom: 16px;
  background: $gray-100;
  min-height: 100vh;
}

/* ========================================== */
/* SKELETON LOADING STYLES (SEM TEXTO) */
/* ========================================== */

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-loading {
  background: $gray-100;
  min-height: 100vh;
  padding: 0;
}

.skeleton-header {
  background: white;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-text {
  flex: 1;
}

.skeleton-date {
  width: 80px;
  height: 20px;
  border-radius: 10px;
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

.skeleton-stats {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.skeleton-stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  border: 1px solid $gray-200;
}

.skeleton-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 auto 8px auto;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-banner {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  height: 100px;
  border-radius: 16px;
  margin: 0 16px 24px 16px;
}

.skeleton-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skeleton-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skeleton-categorias {
  display: flex;
  gap: 12px;
}

.skeleton-categoria-item {
  flex: 1;
  text-align: center;
}

.skeleton-category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 8px auto;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-prestadores {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-prestador-card {
  display: flex;
  gap: 12px;
  padding: 8px;
}

.skeleton-card-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-card-info {
  flex: 1;
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

.w-20 { width: 20%; }
.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }

/* ========================================== */
/* ESTILOS NORMAIS (mantidos) */
/* ========================================== */

.greeting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  background: white;

  .greeting {
    display: flex;
    align-items: center;
  }

  .greeting-text {
    font-size: 1.2rem;
    color: $gray-600;
    margin-right: 5px;
  }

  .user-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-900;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: $gray-600;
    margin-top: 2px;
  }

  .date {
    font-size: 0.8rem;
    color: $gray-500;
  }
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid $gray-200;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .summary-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: $gray-800;
    margin: 4px 0;
  }

  .summary-label {
    font-size: 0.7rem;
    color: $gray-500;
  }
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .category-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: $gray-800;
    margin-top: 8px;
  }

  .category-count {
    font-size: 0.7rem;
    color: $gray-500;
    margin-top: 2px;
  }
}

.promo-banner {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;

  .promo-banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;

    .promo-banner-title {
      font-size: 1rem;
      font-weight: 700;
    }

    .promo-banner-subtitle {
      font-size: 0.8rem;
      opacity: 0.9;
    }
  }
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .section-link {
    color: $purple-primary;
    font-size: 0.8rem;
  }
}

.service-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .service-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .service-provider {
    font-size: 0.75rem;
    color: $gray-600;
    margin: 2px 0;
  }

  .service-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px 0;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}

.promo-slider {
  .promo-card-slide {
    height: 100%;
    border-radius: 12px;
    padding: 16px;

    .promo-slide-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      gap: 16px;

      .promo-info {
        flex: 1;
      }

      .promo-title {
        font-size: 1rem;
        font-weight: 700;
        color: white;
      }

      .promo-subtitle {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 4px;
      }

      .promo-code {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 6px;
        font-family: monospace;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .promo-validity {
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.provider-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 8px;

  &:hover {
    transform: translateY(-2px);
  }

  .provider-item {
    display: flex;
    align-items: center;
  }

  .provider-info {
    flex: 1;
    margin-left: 12px;
  }

  .provider-name {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .provider-category {
    font-size: 0.8rem;
    color: $gray-600;
  }

  .provider-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}

.recent-order-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-2px);
  }

  .order-number {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-800;
  }

  .order-status {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
    margin-top: 4px;

    &.pendente {
      background: #fff3e0;
      color: #f57c00;
    }

    &.aceito {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.em_andamento {
      background: #e3f2fd;
      color: #1976d2;
    }

    &.concluido {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.cancelado {
      background: #ffebee;
      color: #d32f2f;
    }
  }

  .order-price {
    font-size: 1rem;
    font-weight: 700;
    color: $purple-primary;
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  margin: 20px;
}

.fab-button {
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.5);
  }
}

.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: $gray-700;
  margin-bottom: 5px;
}

.photo-upload-area {
  border: 2px dashed $gray-300;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: $gray-50;

  &:hover {
    border-color: $purple-primary;
    background: rgba(102, 126, 234, 0.05);
  }

  .photo-preview {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 200px;
    height: 150px;

    .remove-photo {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .photo-placeholder {
    .placeholder-text {
      margin-top: 10px;
      color: $gray-600;
      font-weight: 500;
    }

    .placeholder-hint {
      font-size: 0.7rem;
      color: $gray-500;
      margin-top: 5px;
    }
  }
}
</style>
