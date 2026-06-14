<template>
  <div class="portfolio-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="() => router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="header-title">
        <h1>Portfólio</h1>
        <p>{{ portfolioStore.items.length }} {{ portfolioStore.items.length === 1 ? 'trabalho' : 'trabalhos' }}</p>
      </div>
      <button class="add-btn" @click="abrirModalAdicionar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </header>

    <!-- Loading -->
    <div v-if="portfolioStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>

    <!-- Grid -->
    <div v-else-if="portfolioStore.items.length > 0" class="portfolio-grid">
      <div
        v-for="item in portfolioStore.items"
        :key="item.id"
        class="portfolio-card"
        @click="abrirDetalhes(item)"
      >
        <div class="card-image">
          <img :src="item.url" :alt="item.titulo || 'Trabalho'">
          <button class="delete-btn" @click.stop="removerFoto(item.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="card-badge" v-if="item.titulo">{{ item.titulo.charAt(0) }}</div>
        </div>
        <div class="card-info">
          <h4 v-if="item.titulo" class="card-title">{{ truncarTexto(item.titulo, 35) }}</h4>
          <p v-if="item.descricao" class="card-desc">{{ truncarTexto(item.descricao, 50) }}</p>
          <div class="card-meta">
            <span class="card-date">{{ formatarData(item.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty">
      <div class="empty-icon">📷</div>
      <h3>Sem trabalhos ainda</h3>
      <p>Adicione fotos dos seus serviços</p>
      <button class="empty-btn" @click="abrirModalAdicionar">+ Adicionar</button>
    </div>

    <!-- Modal Adicionar -->
    <div v-if="modalVisible" class="modal" @click="fecharModal">
      <div class="modal-box" @click.stop>
        <div class="modal-header">
          <h3>Nova foto</h3>
          <button class="modal-close" @click="fecharModal">×</button>
        </div>
        <div class="modal-body">
          <div class="upload" @click="selecionarArquivo">
            <input type="file" ref="fileInput" @change="onFileSelected" accept="image/jpeg,image/png,image/jpg" hidden>
            <div v-if="!previewUrl" class="upload-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Toque para adicionar</span>
            </div>
            <img v-else :src="previewUrl" class="upload-preview">
          </div>
          <div class="field">
            <input type="text" v-model="formData.titulo" placeholder="Título (ex: Limpeza de sofá)">
          </div>
          <div class="field">
            <textarea v-model="formData.descricao" rows="3" placeholder="Descrição (ex: Serviço realizado com excelência)"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="fecharModal">Cancelar</button>
          <button class="btn-save" @click="salvarFoto" :disabled="!selectedFile || portfolioStore.isLoading">
            {{ portfolioStore.isLoading ? 'Enviando...' : 'Publicar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="detalhesVisible" class="modal" @click="fecharDetalhes">
      <div class="modal-details" @click.stop>
        <img :src="detalhesItem?.url" class="details-img">
        <div class="details-content">
          <h3>{{ detalhesItem?.titulo || 'Sem título' }}</h3>
          <p>{{ detalhesItem?.descricao || 'Sem descrição' }}</p>
          <div class="details-footer">
            <span>{{ formatarData(detalhesItem?.created_at) }}</span>
            <button class="details-delete" @click="removerFoto(detalhesItem?.id || '')">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorPortfolioStore, type PortfolioItem } from 'src/stores/prestador/prestador-portfolio-store';

defineOptions({ name: 'PrestadorPortfolioPage' });

const router = useRouter();
const $q = useQuasar();
const portfolioStore = usePrestadorPortfolioStore();

const modalVisible = ref(false);
const detalhesVisible = ref(false);
const detalhesItem = ref<PortfolioItem | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const formData = ref({ titulo: '', descricao: '' });

const formatarData = (data?: string): string => {
  if (!data) return '';
  const date = new Date(data);
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
};

const abrirModalAdicionar = (): void => { modalVisible.value = true; };
const fecharModal = (): void => {
  modalVisible.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
  formData.value = { titulo: '', descricao: '' };
};

const abrirDetalhes = (item: PortfolioItem): void => {
  detalhesItem.value = item;
  detalhesVisible.value = true;
};
const fecharDetalhes = (): void => {
  detalhesVisible.value = false;
  detalhesItem.value = null;
};

const selecionarArquivo = (): void => { fileInput.value?.click(); };

const onFileSelected = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      $q.notify({ type: 'warning', message: 'Máximo 5MB' });
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const salvarFoto = async (): Promise<void> => {
  if (!selectedFile.value) {
    $q.notify({ type: 'warning', message: 'Selecione uma foto' });
    return;
  }
  const success = await portfolioStore.addPortfolioItem(selectedFile.value, formData.value.titulo, formData.value.descricao);
  if (success) {
    $q.notify({ type: 'positive', message: 'Foto publicada!' });
    fecharModal();
  } else {
    $q.notify({ type: 'negative', message: portfolioStore.error || 'Erro' });
  }
};

const removerFoto = (id: string | number): void => {
  $q.dialog({
    title: 'Excluir',
    message: 'Remover esta foto do portfólio?',
    cancel: { label: 'Não', color: 'negative' },
    ok: { label: 'Sim', color: 'negative', flat: true }
  }).onOk(() => {
    void portfolioStore.removePortfolioItem(id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Removida!' });
        fecharDetalhes();
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao remover' });
      }
    }).catch(() => {
      $q.notify({ type: 'negative', message: 'Erro ao remover' });
    });
  });
};

onMounted(() => { void portfolioStore.fetchPortfolio(); });
</script>

<style scoped lang="scss">
$primary: #5B4BF5;
$bg: #F5F7FA;
$card: #FFFFFF;
$text: #1A1A2E;
$gray: #6B7280;
$border: #E5E9F0;

.portfolio-page {
  min-height: 100vh;
  background: $bg;
}

// Header
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-title {
    text-align: center;
    h1 { font-size: 1.1rem; font-weight: 700; margin: 0; color: $text; }
    p { font-size: 0.65rem; color: $gray; margin: 2px 0 0; }
  }

  .back-btn, .add-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F0F2F5;
    border: none;
    cursor: pointer;
    color: $text;
    &:hover { background: $border; }
  }
}

// Loading
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid $border;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
  }
  p { color: $gray; font-size: 0.8rem; }
}
@keyframes spin { to { transform: rotate(360deg); } }

// Grid - 3 colunas para cards pequenos
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px;
}

// Card
.portfolio-card {
  background: $card;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:active { transform: scale(0.98); }

  .card-image {
    position: relative;
    aspect-ratio: 1;
    background: $border;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .delete-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      &:hover { background: #EF4444; }
    }

    .card-badge {
      position: absolute;
      bottom: 6px;
      left: 6px;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: $primary;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover .delete-btn { opacity: 1; }
  }

  .card-info {
    padding: 8px;

    .card-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: $text;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-desc {
      font-size: 0.6rem;
      color: $gray;
      margin: 0 0 4px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-date {
        font-size: 0.55rem;
        color: #9CA3AF;
      }
    }
  }
}

// Empty
.empty {
  text-align: center;
  padding: 60px 20px;
  .empty-icon { font-size: 64px; margin-bottom: 16px; }
  h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; color: $text; }
  p { font-size: 0.8rem; color: $gray; margin-bottom: 20px; }
  .empty-btn {
    padding: 10px 24px;
    background: $primary;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    &:hover { background: #4A3BD4; }
  }
}

// Modal
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 340px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.modal-details {
  background: white;
  border-radius: 20px;
  width: 85%;
  max-width: 320px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;

  .details-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .details-content {
    padding: 16px;

    h3 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: $text;
    }

    p {
      font-size: 0.75rem;
      color: $gray;
      line-height: 1.4;
      margin: 0 0 12px;
    }

    .details-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span { font-size: 0.6rem; color: #9CA3AF; }

      .details-delete {
        padding: 6px 16px;
        background: #EF4444;
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.7rem;
        cursor: pointer;
        &:hover { background: #DC2626; }
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
  h3 { margin: 0; font-size: 1rem; font-weight: 600; }
  .modal-close {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: #F0F2F5;
    font-size: 18px;
    cursor: pointer;
  }
}

.modal-body { padding: 16px; }

.upload {
  border: 1.5px dashed $border;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
  &:hover { border-color: $primary; background: #F5F3FF; }

  .upload-placeholder {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: $gray;
    svg { color: $border; }
    span { font-size: 0.75rem; }
  }

  .upload-preview {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 14px;
  }
}

.field {
  margin-bottom: 12px;
  input, textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid $border;
    border-radius: 12px;
    font-size: 0.8rem;
    font-family: inherit;
    transition: all 0.2s;
    &:focus { outline: none; border-color: $primary; box-shadow: 0 0 0 2px rgba(91,75,245,0.1); }
  }
  textarea { resize: vertical; }
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid $border;

  button {
    flex: 1;
    padding: 10px;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-cancel {
    background: transparent;
    border: 1px solid $border;
    color: $gray;
    &:hover { background: #F0F2F5; }
  }
  .btn-save {
    background: $primary;
    color: white;
    border: none;
    &:hover:not(:disabled) { background: #4A3BD4; }
    &:disabled { opacity: 0.6; }
  }
}
</style>
