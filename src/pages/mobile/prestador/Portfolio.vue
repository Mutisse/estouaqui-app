<template>
  <div class="portfolio-page">

    <!-- 🔥 HEADER COM FOTO DE FUNDO -->
    <header class="header-cover" :style="headerStyle">
      <div class="header-overlay"></div>
      <div class="header-top">
        <button class="hbtn" @click="() => router.back()" aria-label="Voltar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="hbtn add" @click="abrirModalAdicionar" aria-label="Adicionar trabalho">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div class="header-title-wrap">
        <div class="header-eyebrow">Prestador · {{ prestadorNome }}</div>
        <h1>Meu Portfólio</h1>
      </div>
    </header>

    <!-- Stats flutuantes -->
    <div class="stats-float">
      <div class="stat-cell accent">
        <div class="stat-cell-val">{{ portfolioStore.items.length }}</div>
        <div class="stat-cell-lbl">{{ portfolioStore.items.length === 1 ? 'Trabalho' : 'Trabalhos' }}</div>
      </div>
      <div class="stat-cell gold">
        <div class="stat-cell-val">{{ avaliacaoMedia.toFixed(1) }}</div>
        <div class="stat-cell-lbl">Avaliação</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-val">{{ totalVisualizacoes }}</div>
        <div class="stat-cell-lbl">Visualizações</div>
      </div>
    </div>

    <!-- Filtros por categoria -->
    <div v-if="categorias.length > 1" class="filters">
      <button
        v-for="cat in categorias"
        :key="cat.nome"
        class="filter-pill"
        :class="{ active: filtroAtivo === cat.nome }"
        @click="filtroAtivo = cat.nome"
      >
        {{ cat.nome }} <span class="count">{{ cat.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="portfolioStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>

    <!-- Grid -->
    <template v-else-if="itensFiltrados.length > 0">
      <div class="sec-label">
        <h2>Trabalhos recentes</h2>
        <span>Mais recentes primeiro</span>
      </div>

      <div class="portfolio-grid">
        <div
          v-for="(item, index) in itensFiltrados"
          :key="item.id"
          class="portfolio-card"
          :class="{ tall: index % 3 === 0 }"
          @click="abrirDetalhes(item)"
        >
          <div class="card-image">
            <img :src="item.url" :alt="item.titulo || 'Trabalho'">
            <button class="delete-btn" @click.stop="removerFoto(item.id)" aria-label="Remover foto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="card-badge" v-if="ehRecente(item.created_at)">
              <span class="dot"></span>{{ formatarData(item.created_at) }}
            </div>
          </div>
          <div class="card-info">
            <div v-if="item.categoria" class="card-cat">{{ item.categoria }}</div>
            <h4 v-if="item.titulo" class="card-title">{{ truncarTexto(item.titulo, 35) }}</h4>
            <p v-if="item.descricao" class="card-desc">{{ truncarTexto(item.descricao, 60) }}</p>
            <div class="card-meta">
              <span class="card-date">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ formatarData(item.created_at) }}
              </span>
              <span class="card-views">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ item.visualizacoes ?? 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="empty">
      <div class="empty-icon">📷</div>
      <h3>Sem trabalhos ainda</h3>
      <p>Adicione fotos dos seus serviços</p>
      <button class="empty-btn" @click="abrirModalAdicionar">+ Adicionar</button>
    </div>

    <!-- FAB -->
    <div class="fab-wrap">
      <button class="fab" @click="abrirModalAdicionar">
        <span class="plus">+</span> Novo trabalho
      </button>
    </div>

    <!-- Modal Adicionar -->
    <div v-if="modalVisible" class="modal" @click="fecharModal">
      <div class="modal-box" @click.stop>
        <div class="modal-header">
          <div>
            <h3>Adicionar trabalho</h3>
            <p class="modal-subtitle">Mostre a qualidade do seu serviço</p>
          </div>
          <button class="modal-close" @click="fecharModal" aria-label="Fechar">×</button>
        </div>
        <div class="modal-body">
          <div class="upload" @click="selecionarArquivo">
            <input type="file" ref="fileInput" @change="onFileSelected" accept="image/jpeg,image/png,image/jpg" hidden>
            <div v-if="!previewUrl" class="upload-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span class="upload-txt">Toque para adicionar uma foto</span>
              <span class="upload-hint">JPG, PNG até 5MB</span>
            </div>
            <img v-else :src="previewUrl" class="upload-preview">
          </div>
          <div class="field">
            <label class="field-label">Título</label>
            <input type="text" v-model="formData.titulo" placeholder="Ex: Limpeza de sofá">
          </div>
          <div class="field">
            <label class="field-label">Descrição</label>
            <textarea
              v-model="formData.descricao"
              rows="3"
              placeholder="Descreva o serviço realizado"
              maxlength="500"
            ></textarea>
            <div class="char-counter">{{ formData.descricao.length }}/500</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="fecharModal">Cancelar</button>
          <button class="btn-save" @click="salvarFoto" :disabled="!selectedFile || portfolioStore.isLoading">
            {{ portfolioStore.isLoading ? 'Enviando...' : '✓ Publicar trabalho' }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/login-store';
import { usePrestadorPortfolioStore, type PortfolioItem } from 'src/stores/prestador/prestador-portfolio-store';
import { usePrestadorPerfilStore } from 'src/stores/prestador/prestador-perfil-store';

defineOptions({ name: 'PrestadorPortfolioPage' });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const portfolioStore = usePrestadorPortfolioStore();
const perfilStore = usePrestadorPerfilStore();

const modalVisible = ref(false);
const detalhesVisible = ref(false);
const detalhesItem = ref<PortfolioItem | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const formData = ref({ titulo: '', descricao: '' });
const filtroAtivo = ref('Todos');
const fotoTimestamp = ref(Date.now());

const prestadorNome = computed(() => authStore.user?.nome?.split(' ')[0] || 'Prestador');

// 🔥 HEADER COM FOTO DE FUNDO
const headerStyle = computed(() => {
  const foto = perfilStore.foto;

  if (foto && foto !== 'null' && foto !== '' && !foto.includes('ui-avatars')) {
    return {
      backgroundImage: `url(${foto}?t=${fotoTimestamp.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  return {
    background: 'linear-gradient(135deg, #0A0A0F 0%, #1A1A35 60%, #241B4D 100%)',
  };
});

// ─── Stats derivadas ─────────────────────────────────────────────────────
const avaliacaoMedia = computed(() => {
  const items = portfolioStore.items;
  const comNota = items.filter(i => i.avaliacao);
  if (!comNota.length) return 0;
  return comNota.reduce((acc, i) => acc + (i.avaliacao ?? 0), 0) / comNota.length;
});

const totalVisualizacoes = computed(() => {
  return portfolioStore.items.reduce((acc, i) => acc + (i.visualizacoes ?? 0), 0);
});

// ─── Categorias / filtros ────────────────────────────────────────────────
const categorias = computed(() => {
  const items = portfolioStore.items;
  const counts: Record<string, number> = { Todos: items.length };
  items.forEach(i => {
    if (i.categoria) counts[i.categoria] = (counts[i.categoria] || 0) + 1;
  });
  return Object.entries(counts).map(([nome, count]) => ({ nome, count }));
});

const itensFiltrados = computed(() => {
  const items = portfolioStore.items;
  if (filtroAtivo.value === 'Todos') return items;
  return items.filter(i => i.categoria === filtroAtivo.value);
});

// ─── Helpers ─────────────────────────────────────────────────────────────
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

const ehRecente = (data?: string): boolean => {
  if (!data) return false;
  const diff = Math.floor((Date.now() - new Date(data).getTime()) / 86400000);
  return diff <= 2;
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
};

// ─── Modal Adicionar ─────────────────────────────────────────────────────
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

// 🔥 SALVAR FOTO - COM VALIDAÇÃO COMPLETA
const salvarFoto = async (): Promise<void> => {
  if (!selectedFile.value) {
    $q.notify({ type: 'warning', message: 'Selecione uma foto' });
    return;
  }

  if (selectedFile.value.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'warning', message: 'A imagem deve ter no máximo 5MB' });
    return;
  }

  // 🔥 VALIDAR DESCRIÇÃO (MÁXIMO 500 CARACTERES)
  if (formData.value.descricao.length > 500) {
    $q.notify({
      type: 'warning',
      message: 'A descrição deve ter no máximo 500 caracteres'
    });
    return;
  }

  $q.loading.show({ message: 'Publicando trabalho...' });

  try {
    const success = await portfolioStore.addPortfolioItem(
      selectedFile.value,
      formData.value.titulo,
      formData.value.descricao
    );

    $q.loading.hide();

    if (success) {
      $q.notify({ type: 'positive', message: '📸 Foto publicada com sucesso!' });
      fecharModal();
    } else {
      $q.notify({
        type: 'negative',
        message: portfolioStore.error || 'Erro ao publicar foto'
      });
    }
  } catch (error) {
    $q.loading.hide();
    console.error('❌ Erro ao salvar:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao publicar foto. Tente novamente.'
    });
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

// 🔥 CARREGAR DADOS
onMounted(async () => {
  try {
    await perfilStore.carregarTodosDados();
    console.log('✅ Perfil carregado:', perfilStore.foto);
    await portfolioStore.fetchPortfolio();
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
});
</script>

<style scoped lang="scss">
// ─── TOKENS ───────────────────────────────────────────────────────────────
$a:        #5B4BF5;
$a2:       #9F7AEA;
$a-l:      rgba(91, 75, 245, 0.08);
$ink:      #0A0A0F;
$ink2:     #3D3D55;
$muted:    #9898B0;
$line:     rgba(0, 0, 0, 0.07);
$sur:      #FFFFFF;
$bg:       #F4F4F8;
$green:    #10B981;
$gold:     #F59E0B;
$red:      #EF4444;
$r:        16px;
$rs:       11px;

.portfolio-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 90px;
}

// ─── HEADER COVER COM OVERLAY ──────────────────────────────────────────
.header-cover {
  position: relative;
  padding: 16px 16px 56px;
  overflow: hidden;
  min-height: 180px;

  .header-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(10,10,15,0.75) 0%, rgba(26,26,53,0.85) 60%, rgba(36,27,77,0.9) 100%);
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(91,75,245,.35) 0%, transparent 70%);
    top: -80px; right: -60px;
    pointer-events: none;
    z-index: 1;
  }

  .header-top, .header-title-wrap {
    position: relative;
    z-index: 2;
  }
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.hbtn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.14);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff;
  backdrop-filter: blur(6px);
  transition: background .2s;

  &:hover { background: rgba(255,255,255,.18); }
  &.add { background: $a; border-color: $a; }
  &.add:hover { background: #4A3BD4; }
}

.header-title-wrap {
  margin-top: 18px;
  position: relative;
  z-index: 1;

  .header-eyebrow {
    font-size: 10.5px;
    color: rgba(255,255,255,.5);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 3px;
  }
  h1 {
    font-size: 24px; font-weight: 700; color: #fff; margin: 0;
  }
}

// ─── STATS FLUTUANTES ───────────────────────────────────────────────────────
.stats-float {
  position: relative;
  margin: -40px 16px 16px;
  background: $sur;
  border-radius: $r;
  box-shadow: 0 12px 28px rgba(10,10,15,.12);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  z-index: 2;
}

.stat-cell {
  padding: 14px 8px;
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0; top: 20%; bottom: 20%;
    width: 1px; background: $line;
  }

  &-val { font-size: 19px; font-weight: 700; color: $ink; line-height: 1; }
  &-lbl { font-size: 9.5px; color: $muted; margin-top: 4px; }

  &.accent &-val { color: $a; }
  &.gold &-val { color: $gold; }
}

// ─── FILTROS ────────────────────────────────────────────────────────────────
.filters {
  display: flex;
  gap: 7px;
  padding: 0 16px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.filter-pill {
  flex-shrink: 0;
  font-size: 12px; font-weight: 500;
  padding: 7px 15px;
  border-radius: 20px;
  border: 1px solid $line;
  background: $sur;
  color: $ink2;
  cursor: pointer;
  white-space: nowrap;
  transition: all .2s;

  &.active { background: $ink; color: #fff; border-color: $ink; }
  .count { opacity: .55; margin-left: 3px; }
}

// ─── LOADING ────────────────────────────────────────────────────────────────
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .spinner {
    width: 32px; height: 32px;
    border: 3px solid $line;
    border-top-color: $a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
  }
  p { color: $muted; font-size: 0.8rem; }
}
@keyframes spin { to { transform: rotate(360deg); } }

// ─── SECTION LABEL ──────────────────────────────────────────────────────────
.sec-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 10px;

  h2 { font-size: 14px; font-weight: 700; color: $ink; }
  span { font-size: 11px; color: $muted; }
}

// ─── GRID ───────────────────────────────────────────────────────────────────
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;
  padding: 0 16px 22px;
}

.portfolio-card {
  background: $sur;
  border-radius: $r;
  overflow: hidden;
  border: 1px solid $line;
  cursor: pointer;
  transition: all .25s;
  position: relative;

  &:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(10,10,15,.1); }
  &:active { transform: scale(0.98); }

  &.tall .card-image { aspect-ratio: 0.78; }

  .card-image {
    position: relative;
    aspect-ratio: 1;
    background: $line;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.35) 100%);
      pointer-events: none;
    }

    img { width: 100%; height: 100%; object-fit: cover; }

    .delete-btn {
      position: absolute;
      top: 8px; right: 8px;
      width: 26px; height: 26px;
      border-radius: 50%;
      background: rgba(255,255,255,.92);
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: $red;
      box-shadow: 0 2px 6px rgba(0,0,0,.12);
      z-index: 2;
      opacity: 0;
      transition: opacity .2s;
    }

    &:hover .delete-btn { opacity: 1; }

    .card-badge {
      position: absolute;
      bottom: 8px; left: 8px;
      background: rgba(255,255,255,.95);
      color: $ink;
      font-size: 9.5px; font-weight: 700;
      padding: 3px 9px;
      border-radius: 10px;
      z-index: 2;
      display: flex; align-items: center; gap: 4px;

      .dot { width: 5px; height: 5px; border-radius: 50%; background: $green; }
    }
  }

  .card-info {
    padding: 11px 12px;

    .card-cat {
      font-size: 9.5px; font-weight: 600; color: $a;
      text-transform: uppercase; letter-spacing: .04em;
      margin-bottom: 3px;
    }

    .card-title {
      font-size: 13px; font-weight: 600; color: $ink;
      margin: 0 0 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .card-desc {
      font-size: 10.5px; color: $muted;
      margin: 0 0 8px; line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 8px; border-top: 1px solid $line;

      .card-date {
        font-size: 9.5px; color: #B0B0C0;
        display: flex; align-items: center; gap: 3px;
      }
      .card-views {
        font-size: 9.5px; color: $muted; font-weight: 500;
        display: flex; align-items: center; gap: 3px;
      }
    }
  }
}

// ─── EMPTY ──────────────────────────────────────────────────────────────────
.empty {
  text-align: center;
  padding: 60px 20px;

  .empty-icon { font-size: 64px; margin-bottom: 16px; }
  h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; color: $ink; }
  p { font-size: 0.8rem; color: $muted; margin-bottom: 20px; }

  .empty-btn {
    padding: 10px 24px;
    background: $a;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 0.8rem; font-weight: 500;
    cursor: pointer;
    &:hover { background: #4A3BD4; }
  }
}

// ─── FAB ────────────────────────────────────────────────────────────────────
.fab-wrap {
  position: sticky;
  bottom: 16px;
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
  pointer-events: none;
  z-index: 5;
}

.fab {
  pointer-events: auto;
  display: flex; align-items: center; gap: 8px;
  padding: 14px 20px;
  border-radius: 30px;
  background: $ink;
  color: #fff;
  border: none;
  box-shadow: 0 10px 28px rgba(10,10,15,.3);
  cursor: pointer;
  font-size: 13px; font-weight: 600;

  .plus { font-size: 18px; line-height: 1; }
  &:hover { background: #1A1A35; }
}

// ─── MODAL ──────────────────────────────────────────────────────────────────
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 22px;
  width: 90%; max-width: 340px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(10,10,15,.15);
  animation: fadeIn 0.2s ease;
}

.modal-details {
  background: white;
  border-radius: 20px;
  width: 85%; max-width: 320px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;

  .details-img { width: 100%; aspect-ratio: 1; object-fit: cover; }

  .details-content {
    padding: 16px;

    h3 { font-size: 0.9rem; font-weight: 600; margin: 0 0 8px; color: $ink; }
    p { font-size: 0.75rem; color: $muted; line-height: 1.4; margin: 0 0 12px; }

    .details-footer {
      display: flex; justify-content: space-between; align-items: center;

      span { font-size: 0.6rem; color: #9CA3AF; }

      .details-delete {
        padding: 6px 16px;
        background: $red;
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
  to   { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 18px 14px;
  background: linear-gradient(135deg, $ink, #241B4D);

  h3 { margin: 0; font-size: 16px; font-weight: 700; color: #fff; }
  .modal-subtitle { font-size: 11px; color: rgba(255,255,255,.55); margin-top: 2px; }

  .modal-close {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,.12);
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    flex-shrink: 0;
  }
}

.modal-body { padding: 18px; }

.upload {
  border: 1.5px dashed $line;
  border-radius: 18px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  background: $bg;
  transition: all 0.2s;
  &:hover { border-color: $a; background: $a-l; }

  .upload-placeholder {
    padding: 30px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    color: $ink2;
    svg { color: $muted; margin-bottom: 4px; }
    .upload-txt { font-size: 12.5px; font-weight: 500; }
    .upload-hint { font-size: 10.5px; color: $muted; margin-top: 3px; }
  }

  .upload-preview {
    width: 100%; height: 140px;
    object-fit: cover;
    border-radius: 14px;
  }
}

.field {
  margin-bottom: 11px;

  .field-label {
    font-size: 11px; font-weight: 500; color: $ink2;
    margin-bottom: 5px; display: block;
  }

  input, textarea {
    width: 100%;
    padding: 11px 13px;
    border: 1px solid $line;
    border-radius: 13px;
    font-size: 12.5px;
    font-family: inherit;
    background: $bg;
    transition: all 0.2s;
    &:focus { outline: none; border-color: $a; background: $a-l; }
  }
  textarea {
    resize: vertical;
  }
}

.char-counter {
  text-align: right;
  font-size: 11px;
  color: $muted;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 14px 18px 18px;

  button {
    border-radius: 30px;
    font-size: 12.5px; font-weight: 500;
    cursor: pointer;
    padding: 11px;
  }

  .btn-cancel {
    flex: 1;
    background: transparent;
    border: 1px solid $line;
    color: $muted;
    &:hover { background: $bg; }
  }
  .btn-save {
    flex: 1.4;
    background: $ink;
    color: white;
    border: none;
    font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    &:hover:not(:disabled) { background: #1A1A35; }
    &:disabled { opacity: 0.6; }
  }
}
</style>
