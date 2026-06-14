<template>
  <div class="precos-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="() => router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1>Meus Preços</h1>
      <button class="add-btn" @click="abrirModalServico()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </header>

    <!-- Estatísticas Rápidas -->
    <div class="stats-row">
      <div class="stat-badge">
        <span class="stat-icon">📦</span>
        <span class="stat-text">{{ servicosStore.totalServicos }} serviços</span>
      </div>
      <div class="stat-badge">
        <span class="stat-icon">✅</span>
        <span class="stat-text">{{ servicosStore.totalAtivos }} ativos</span>
      </div>
      <div class="stat-badge">
        <span class="stat-icon">💰</span>
        <span class="stat-text">Preço médio: {{ precoMedio }}</span>
      </div>
    </div>

    <!-- Lista de Serviços -->
    <div class="servicos-list">
      <div v-for="servico in servicosStore.servicos" :key="servico.id" class="servico-card">
        <div class="servico-icon" :style="{ background: getGradientForIcon(servico.icone) }">
          <span>{{ getIconeSimbolo(servico.icone) }}</span>
        </div>

        <div class="servico-info">
          <h4>{{ servico.nome }}</h4>
          <p v-if="servico.descricao" class="servico-desc">{{ truncarTexto(servico.descricao, 50) }}</p>
          <div class="servico-meta">
            <span class="servico-preco">{{ formatMoney(servico.preco) }}</span>
            <span class="servico-duracao">⏱️ {{ servico.duracao }} min</span>
            <span class="servico-status" :class="{ active: servico.ativo, inactive: !servico.ativo }">
              {{ servico.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
        </div>

        <div class="servico-actions">
          <button class="action-btn edit" @click="abrirModalServico(servico)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
          </button>
          <button class="action-btn toggle" @click="toggleServico(servico)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line v-if="servico.ativo" x1="12" y1="8" x2="12" y2="16"/>
              <line v-if="servico.ativo" x1="8" y1="12" x2="16" y2="12"/>
              <circle v-else cx="12" cy="12" r="4"/>
            </svg>
          </button>
          <button class="action-btn delete" @click="removerServico(servico.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="servicosStore.servicos.length === 0 && !servicosStore.isLoading" class="empty">
        <div class="empty-icon">🛠️</div>
        <h3>Nenhum serviço cadastrado</h3>
        <p>Adicione seus serviços e preços</p>
        <button class="empty-btn" @click="abrirModalServico()">+ Adicionar serviço</button>
      </div>

      <!-- Loading -->
      <div v-if="servicosStore.isLoading" class="loading">
        <div class="spinner"></div>
        <p>Carregando serviços...</p>
      </div>
    </div>

    <!-- Modal de Serviço -->
    <div v-if="modalVisible" class="modal" @click="fecharModal">
      <div class="modal-box" @click.stop>
        <div class="modal-header">
          <h3>{{ editando ? 'Editar' : 'Novo' }} serviço</h3>
          <button class="modal-close" @click="fecharModal">×</button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>Nome do serviço</label>
            <input type="text" v-model="formData.nome" placeholder="Ex: Limpeza completa">
          </div>

          <div class="field">
            <label>Preço (MZN)</label>
            <input type="number" v-model="formData.preco" placeholder="0">
          </div>

          <div class="field">
            <label>Duração (minutos)</label>
            <input type="number" v-model="formData.duracao" placeholder="60">
          </div>

          <div class="field">
            <label>Categoria</label>
            <select v-model="formData.categoria_id">
              <option :value="0">Selecione uma categoria</option>
              <option v-for="cat in servicosStore.minhasCategorias" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Descrição (opcional)</label>
            <textarea v-model="formData.descricao" rows="3" placeholder="Descreva o serviço..."></textarea>
          </div>

          <div class="field">
            <label>Ícone</label>
            <div class="icone-selector">
              <button
                v-for="icone in iconesDisponiveis"
                :key="icone"
                :class="['icone-option', { active: formData.icone === icone }]"
                @click="formData.icone = icone"
              >
                {{ icone }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="fecharModal">Cancelar</button>
          <button class="btn-save" @click="salvarServico" :disabled="servicosStore.isSaving">
            {{ servicosStore.isSaving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorServicosStore, type ServicoData, getGradientForIcon } from 'src/stores/prestador/prestador-servicos-store';

defineOptions({ name: 'PrestadorPrecosPage' });

const router = useRouter();
const $q = useQuasar();
const servicosStore = usePrestadorServicosStore();

const modalVisible = ref(false);
const editando = ref(false);
const editandoId = ref<number | null>(null);
const formData = ref({
  nome: '',
  preco: 0,
  duracao: 60,
  categoria_id: 0,
  descricao: '',
  icone: '🔧'
});

const iconesDisponiveis = ['🔧', '🧹', '🔌', '💧', '🎨', '📦', '🏠', '🌿', '📱', '🚗'];

const precoMedio = computed(() => {
  if (servicosStore.servicos.length === 0) return '0 Kz';
  const total = servicosStore.servicos.reduce((sum, s) => sum + s.preco, 0);
  return formatMoney(total / servicosStore.servicos.length);
});

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(value);
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
};

const getIconeSimbolo = (icone?: string): string => {
  const mapa: Record<string, string> = {
    handyman: '🔧', cleaning: '🧹', electric: '🔌', plumbing: '💧',
    painting: '🎨', moving: '📦', renovation: '🏠', gardening: '🌿',
    tech: '📱', transport: '🚗'
  };
  return mapa[icone || ''] || icone || '🔧';
};

const abrirModalServico = (servico?: ServicoData) => {
  if (servico) {
    editando.value = true;
    editandoId.value = servico.id;
    formData.value = {
      nome: servico.nome,
      preco: servico.preco,
      duracao: servico.duracao,
      categoria_id: servico.categoria_id,
      descricao: servico.descricao || '',
      icone: getIconeSimbolo(servico.icone)
    };
  } else {
    editando.value = false;
    editandoId.value = null;
    formData.value = {
      nome: '',
      preco: 0,
      duracao: 60,
      categoria_id: servicosStore.minhasCategorias[0]?.id || 0,
      descricao: '',
      icone: '🔧'
    };
  }
  modalVisible.value = true;
};

const fecharModal = () => {
  modalVisible.value = false;
};

const salvarServico = async () => {
  if (!formData.value.nome) {
    $q.notify({ type: 'warning', message: 'Nome do serviço é obrigatório' });
    return;
  }
  if (formData.value.preco <= 0) {
    $q.notify({ type: 'warning', message: 'Preço deve ser maior que zero' });
    return;
  }
  if (formData.value.categoria_id === 0) {
    $q.notify({ type: 'warning', message: 'Selecione uma categoria' });
    return;
  }

  let success = false;
  const dados = {
    nome: formData.value.nome,
    preco: formData.value.preco,
    duracao: formData.value.duracao,
    categoria_id: formData.value.categoria_id,
    descricao: formData.value.descricao,
    icone: formData.value.icone
  };

  if (editando.value && editandoId.value) {
    const result = await servicosStore.updateServico(editandoId.value, dados);
    success = !!result;
  } else {
    const result = await servicosStore.createServico(dados);
    success = !!result;
  }

  if (success) {
    $q.notify({ type: 'positive', message: editando.value ? 'Serviço atualizado!' : 'Serviço criado!' });
    fecharModal();
  } else {
    $q.notify({ type: 'negative', message: servicosStore.error || 'Erro ao salvar' });
  }
};

// ✅ CORRIGIDO: removido async pois não tem await
const toggleServico = (servico: ServicoData) => {
  const action = servico.ativo ? 'desativar' : 'ativar';

  $q.dialog({
    title: `${action === 'ativar' ? 'Ativar' : 'Desativar'} serviço`,
    message: `Tem certeza que deseja ${action} este serviço?`,
    cancel: { label: 'Cancelar', color: 'negative' },
    ok: { label: 'Confirmar', color: 'positive' }
  }).onOk(() => {
    // ✅ CORRIGIDO: chamada void para promise não flutuante
    void servicosStore.toggleServico(servico.id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: `Serviço ${action === 'ativar' ? 'ativado' : 'desativado'}!` });
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao alterar status' });
      }
    });
  });
};


const removerServico = (id: number) => {
  $q.dialog({
    title: 'Excluir serviço',
    message: 'Remover este serviço da sua lista? Esta ação não pode ser desfeita.',
    cancel: { label: 'Cancelar', color: 'negative' },
    ok: { label: 'Excluir', color: 'negative', flat: true },
    persistent: true
  }).onOk(() => {
    void servicosStore.deleteServico(id).then((success) => {
      if (success) {
        $q.notify({ type: 'positive', message: 'Serviço removido!' });
      } else {
        $q.notify({ type: 'negative', message: servicosStore.error || 'Erro ao remover' });
      }
    });
  });
};

onMounted(async () => {
  await Promise.all([
    servicosStore.fetchServicos(),
    servicosStore.fetchMinhasCategorias()
  ]);
});
</script>

<style scoped lang="scss">
$primary: #5B4BF5;
$bg: #F5F7FA;
$card: #FFFFFF;
$text: #1A1A2E;
$gray: #6B7280;
$border: #E5E9F0;
$success: #10B981;
$danger: #EF4444;

.precos-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 30px;
}

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

  h1 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: $text;
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

    &:hover {
      background: $border;
    }
  }
}

.stats-row {
  display: flex;
  gap: 12px;
  padding: 16px;

  .stat-badge {
    flex: 1;
    background: $card;
    border-radius: 30px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);

    .stat-icon { font-size: 1rem; }
    .stat-text { font-size: 0.7rem; font-weight: 500; color: $text; }
  }
}

.servicos-list {
  padding: 0 16px;
}

.servico-card {
  background: $card;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  .servico-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .servico-info {
    flex: 1;

    h4 {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 0 4px;
      color: $text;
    }

    .servico-desc {
      font-size: 0.7rem;
      color: $gray;
      margin: 0 0 6px;
    }

    .servico-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;

      .servico-preco {
        font-size: 0.8rem;
        font-weight: 700;
        color: $primary;
      }

      .servico-duracao {
        font-size: 0.65rem;
        color: $gray;
      }

      .servico-status {
        font-size: 0.6rem;
        padding: 2px 8px;
        border-radius: 20px;
        font-weight: 500;

        &.active {
          background: rgba(16, 185, 129, 0.1);
          color: $success;
        }

        &.inactive {
          background: rgba(107, 114, 128, 0.1);
          color: $gray;
        }
      }
    }
  }

  .servico-actions {
    display: flex;
    gap: 6px;

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &.edit {
        background: #F0F2F5;
        color: $text;
        &:hover { background: $border; }
      }

      &.toggle {
        background: rgba(16, 185, 129, 0.1);
        color: $success;
        &:hover { background: rgba(16, 185, 129, 0.2); }
      }

      &.delete {
        background: rgba(239, 68, 68, 0.1);
        color: $danger;
        &:hover { background: rgba(239, 68, 68, 0.2); }
      }
    }
  }
}

.empty, .loading {
  text-align: center;
  padding: 60px 20px;

  .empty-icon { font-size: 64px; margin-bottom: 16px; }
  h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
  p { font-size: 0.8rem; color: $gray; margin-bottom: 20px; }

  .empty-btn {
    padding: 10px 24px;
    background: $primary;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid $border;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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
  max-width: 360px;
  max-height: 85vh;
  overflow-y: auto;
  animation: fadeIn 0.2s;
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

.modal-body {
  padding: 16px;

  .field {
    margin-bottom: 14px;

    label {
      display: block;
      font-size: 0.7rem;
      font-weight: 500;
      margin-bottom: 4px;
      color: $gray;
    }

    input, textarea, select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid $border;
      border-radius: 12px;
      font-size: 0.8rem;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: $primary;
      }
    }

    textarea { resize: vertical; }
  }

  .icone-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .icone-option {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid $border;
      background: white;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: $primary;
        transform: scale(1.05);
      }

      &.active {
        background: $primary;
        border-color: $primary;
      }
    }
  }
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
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
}
</style>
