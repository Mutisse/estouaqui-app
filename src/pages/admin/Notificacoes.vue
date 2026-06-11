<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Notificações</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por título ou mensagem..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="send" label="Enviar Notificação" @click="abrirModalEnvio" />
        <q-btn
          flat
          icon="done_all"
          label="Marcar todas como lidas"
          @click="confirmarMarcarTodasLidas"
          :loading="isSending"
        />
        <q-btn
          flat
          icon="refresh"
          label="Atualizar"
          @click="recarregarDados"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="notifications" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="mark_email_read" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.lidas) }}</div>
          <div class="stat-label">Lidas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="mark_as_unread" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.nao_lidas) }}</div>
          <div class="stat-label">Não Lidas</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <q-select
        v-model="filtros.tipo"
        :options="opcoesTipo"
        label="Tipo"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.lida"
        :options="opcoesLida"
        label="Status"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="filtros.data_inicio"
        label="Data Início"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-input
        v-model="filtros.data_fim"
        label="Data Fim"
        type="date"
        dense
        outlined
        class="filter-date"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando notificações...</p>
    </div>

    <!-- Tabela -->
    <q-table v-else :rows="notificacoes" :columns="tableColumns" row-key="id" flat bordered>
      <template v-slot:body-cell-lida="props">
        <q-td :props="props">
          <q-badge :color="props.row.read_at ? 'green' : 'red'">
            <q-icon :name="props.row.read_at ? 'done' : 'schedule'" size="12px" class="q-mr-xs" />
            {{ props.row.read_at ? 'Lida' : 'Não lida' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-mensagem="props">
        <q-td :props="props">
          <div class="mensagem-cell">
            {{ truncarTexto(props.row.message, 80) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-data="props">
        <q-td :props="props">
          <div class="data-cell">
            <div class="data-principal">{{ formatarDataRelativa(props.row.created_at) }}</div>
            <div class="data-detalhe">{{ formatarHora(props.row.created_at) }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <div class="acoes-cell">
            <q-btn
              v-if="!props.row.read_at"
              flat
              round
              icon="mark_email_read"
              color="primary"
              size="sm"
              @click="() => marcarLida(props.row.id)"
              title="Marcar como lida"
            />
            <q-btn
              flat
              round
              icon="visibility"
              color="info"
              size="sm"
              @click="() => verDetalhes(props.row)"
              title="Ver detalhes"
            />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="() => confirmarExclusao(props.row.id)"
              title="Excluir"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="no-data">
          <q-icon name="notifications_off" size="48px" color="grey-5" />
          <p>Nenhuma notificação encontrada</p>
        </div>
      </template>
    </q-table>

    <!-- Paginação -->
    <div class="pagination-container" v-if="paginacao.total > 0">
      <q-btn
        flat
        icon="chevron_left"
        :disable="!temPaginaAnterior"
        @click="() => mudarPagina(paginacao.current_page - 1)"
      />
      <span class="pagination-info">
        Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{
          paginacao.total
        }}
        registos)
      </span>
      <q-btn
        flat
        icon="chevron_right"
        :disable="!temProximaPagina"
        @click="() => mudarPagina(paginacao.current_page + 1)"
      />
    </div>

    <!-- Modal Enviar Notificação -->
    <q-dialog v-model="envioModalVisible" persistent>
      <q-card style="min-width: 550px; max-width: 700px">
        <q-card-section class="modal-header">
          <div class="text-h6">✉️ Enviar Notificação</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="form-row">
            <q-select
              v-model="formEnvio.tipo_usuario"
              :options="opcoesTipoUsuario"
              label="Destinatários"
              dense
              outlined
              class="col"
              emit-value
              map-options
            />
            <q-select
              v-model="formEnvio.type"
              :options="opcoesTemplate"
              label="Template (opcional)"
              dense
              outlined
              class="col"
              emit-value
              map-options
              clearable
              @update:model-value="onTemplateChange"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model="formEnvio.title"
              label="Título *"
              dense
              outlined
              class="col"
              :error="!!errors.title"
              :error-message="errors.title"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model="formEnvio.message"
              label="Mensagem *"
              type="textarea"
              dense
              outlined
              class="col"
              rows="4"
              :error="!!errors.message"
              :error-message="errors.message"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-select
              v-model="formEnvio.canais"
              :options="opcoesCanais"
              label="Canais de envio"
              dense
              outlined
              multiple
              use-chips
              stack-label
              class="col"
            />
          </div>

          <!-- Pré-visualização -->
          <div class="preview-card q-mt-md" v-if="formEnvio.message">
            <div class="preview-header">
              <q-icon :name="getIconPreview(formEnvio.type)" size="20px" />
              <span class="preview-title">{{ formEnvio.title || 'Pré-visualização' }}</span>
            </div>
            <div class="preview-body">
              {{ formEnvio.message }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModalEnvio" />
          <q-btn flat label="Enviar" color="primary" @click="executarEnvio" :loading="isSending" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Detalhes -->
    <q-dialog v-model="detalhesModalVisible">
      <q-card style="min-width: 450px; max-width: 550px">
        <q-card-section class="modal-header detalhes-header">
          <div class="text-h6">📬 Detalhes da Notificação</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="detalhes-body">
          <div class="info-group">
            <div class="info-title">Título</div>
            <div class="info-value">{{ notificacaoDetalhes?.title }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Mensagem</div>
            <div class="info-value message">
              {{ notificacaoDetalhes?.message }}
            </div>
          </div>

          <div
            class="info-group"
            v-if="notificacaoDetalhes?.data && Object.keys(notificacaoDetalhes.data).length"
          >
            <div class="info-title">Dados Adicionais</div>
            <div class="info-value data">
              <pre>{{ JSON.stringify(notificacaoDetalhes?.data, null, 2) }}</pre>
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Informações</div>
            <div class="info-row">
              <strong>Tipo:</strong>
              <q-badge :color="getTipoColor(notificacaoDetalhes?.type)" class="q-ml-sm">
                {{ notificacaoDetalhes?.type || 'manual' }}
              </q-badge>
            </div>
            <div class="info-row">
              <strong>Status:</strong>
              <q-badge :color="notificacaoDetalhes?.read_at ? 'green' : 'red'" class="q-ml-sm">
                {{ notificacaoDetalhes?.read_at ? 'Lida' : 'Não lida' }}
              </q-badge>
            </div>
            <div class="info-row">
              <strong>Data de envio:</strong>
              {{ formatarDataCompleta(notificacaoDetalhes?.created_at) }}
            </div>
            <div class="info-row" v-if="notificacaoDetalhes?.read_at">
              <strong>Lida em:</strong> {{ formatarDataCompleta(notificacaoDetalhes.read_at) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn
            v-if="!notificacaoDetalhes?.read_at"
            flat
            label="Marcar como lida"
            color="primary"
            @click="marcarLidaModal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import {
  useAdminNotificacoesStore,
  type EnviarNotificacaoData,
  type Notificacao,
} from 'src/stores/admin/admin-notificacoes-store';

defineOptions({ name: 'AdminNotificacoes' });

const $q = useQuasar();
const notificacoesStore = useAdminNotificacoesStore();

const {
  isLoading,
  isSending,
  notificacoes,
  templates,
  estatisticas,
  paginacao,
  filtros,
  opcoesTipo,
  opcoesLida,
  opcoesTipoUsuario,
  temPaginaAnterior,
  temProximaPagina,
} = storeToRefs(notificacoesStore);

const {
  carregarNotificacoes,
  carregarEstatisticas,
  carregarTemplates,
  marcarComoLida,
  marcarTodasComoLidas,
  enviarNotificacao,
  excluirNotificacao,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  buscarNotificacao,
} = notificacoesStore;

// Estados locais
const envioModalVisible = ref(false);
const detalhesModalVisible = ref(false);
const notificacaoDetalhes = ref<Notificacao | null>(null);

const errors = reactive({
  title: '',
  message: '',
});

// ✅ CORRIGIDO: Definir o tipo correto para formEnvio
const formEnvio = ref<{
  tipo_usuario: 'todos' | 'cliente' | 'prestador' | 'admin';
  type: string;
  title: string;
  message: string;
  canais: string[];
}>({
  tipo_usuario: 'todos',
  type: '',
  title: '',
  message: '',
  canais: ['database'],
});

const opcoesTemplate = computed(() => {
  return templates.value.map((t) => ({
    label: `${t.icon || '📬'} ${t.title_pt}`,
    value: t.type,
  }));
});

const opcoesCanais = [
  { label: '💾 Banco de Dados', value: 'database', icon: 'storage' },
  { label: '📱 Notificação Push', value: 'push', icon: 'notifications_active' },
  { label: '📧 Email', value: 'email', icon: 'email' },
  { label: '📱 SMS', value: 'sms', icon: 'sms' },
];

const tableColumns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left' as const,
    sortable: true,
    style: 'width: 60px',
  },
  {
    name: 'title',
    label: 'Título',
    field: 'title',
    align: 'left' as const,
    style: 'min-width: 180px',
  },
  {
    name: 'mensagem',
    label: 'Mensagem',
    field: 'message',
    align: 'left' as const,
    style: 'min-width: 250px',
  },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const, style: 'width: 120px' },
  { name: 'lida', label: 'Status', field: 'lida', align: 'center' as const, style: 'width: 100px' },
  {
    name: 'data',
    label: 'Data',
    field: 'created_at',
    align: 'center' as const,
    style: 'width: 120px',
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: 'acoes',
    align: 'center' as const,
    style: 'width: 120px',
  },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '—';
  if (texto.length <= max) return texto;
  return texto.substring(0, max) + '...';
};

const formatarDataRelativa = (dataString: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatarHora = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const formatarDataCompleta = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getIconPreview = (type: string): string => {
  const icons: Record<string, string> = {
    pedido_confirmado: 'check_circle',
    pedido_cancelado: 'cancel',
    novo_prestador_pendente: 'person_add',
    alerta_seguranca: 'security',
    relatorio_semanal: 'assessment',
    promocao_nova: 'local_offer',
    pagamento_recebido: 'payments',
  };
  return icons[type] || 'notifications';
};

const getTipoColor = (type?: string): string => {
  if (type?.includes('pedido')) return 'primary';
  if (type?.includes('promocao')) return 'warning';
  if (type?.includes('alerta') || type?.includes('seguranca')) return 'negative';
  if (type?.includes('relatorio')) return 'info';
  return 'grey';
};

const validarFormEnvio = (): boolean => {
  let isValid = true;
  errors.title = '';
  errors.message = '';

  if (!formEnvio.value.title.trim()) {
    errors.title = 'Título é obrigatório';
    isValid = false;
  }

  if (!formEnvio.value.message.trim()) {
    errors.message = 'Mensagem é obrigatória';
    isValid = false;
  }

  return isValid;
};

const onTemplateChange = (): void => {
  const template = templates.value.find((t) => t.type === formEnvio.value.type);
  if (template) {
    formEnvio.value.title = template.title_pt;
    formEnvio.value.message = template.body_pt;
  }
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('tipo', filtros.value.tipo);
  setFiltro('lida', filtros.value.lida);
  setFiltro('data_inicio', filtros.value.data_inicio);
  setFiltro('data_fim', filtros.value.data_fim);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Ações de notificações
const abrirModalEnvio = (): void => {
  formEnvio.value = {
    tipo_usuario: 'todos',
    type: '',
    title: '',
    message: '',
    canais: ['database'],
  };
  errors.title = '';
  errors.message = '';
  envioModalVisible.value = true;
};

const fecharModalEnvio = (): void => {
  envioModalVisible.value = false;
};

// ✅ CORRIGIDO: Agora o tipo está correto
const executarEnvio = async (): Promise<void> => {
  if (!validarFormEnvio()) return;

  const data: EnviarNotificacaoData = {
    tipo_usuario: formEnvio.value.tipo_usuario, // Agora é do tipo correto
    type: formEnvio.value.type || 'manual',
    data: {
      title: formEnvio.value.title,
      body: formEnvio.value.message,
    },
    channels: formEnvio.value.canais,
  };

  const success = await enviarNotificacao(data);
  if (success) {
    $q.notify({ type: 'positive', message: 'Notificação enviada com sucesso!' });
    envioModalVisible.value = false;
    fecharModalEnvio();
  }
};

const marcarLida = async (id: number): Promise<void> => {
  const success = await marcarComoLida(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Notificação marcada como lida!' });
  }
};

const confirmarMarcarTodasLidas = (): void => {
  $q.dialog({
    title: 'Marcar todas como lidas',
    message: 'Deseja marcar todas as notificações como lidas? Esta ação não pode ser desfeita.',
    cancel: true,
    ok: { label: 'Confirmar', color: 'primary' },
  }).onOk(() => {
    void executarMarcarTodasLidas();
  });
};

const executarMarcarTodasLidas = async (): Promise<void> => {
  const success = await marcarTodasComoLidas();
  if (success) {
    $q.notify({ type: 'positive', message: 'Todas notificações marcadas como lidas!' });
  }
};

const verDetalhes = async (notificacao: Notificacao): Promise<void> => {
  const dados = await buscarNotificacao(notificacao.id);
  if (dados) {
    notificacaoDetalhes.value = dados;
    detalhesModalVisible.value = true;
  }
};

const marcarLidaModal = async (): Promise<void> => {
  if (notificacaoDetalhes.value) {
    await marcarLida(notificacaoDetalhes.value.id);
    detalhesModalVisible.value = false;
    notificacaoDetalhes.value = null;
  }
};

const confirmarExclusao = (id: number): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.',
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(id);
  });
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirNotificacao(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Notificação excluída com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir notificação' });
  }
};

// Lifecycle
onMounted(() => {
  void carregarNotificacoes();
  void carregarEstatisticas();
  void carregarTemplates();
});
</script>

<style scoped lang="scss">
.page-container {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .search-input {
      width: 280px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.orange {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .filter-select {
    min-width: 160px;
  }

  .filter-date {
    width: 160px;
  }

  .clear-btn {
    color: #6b7280;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 16px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.mensagem-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #374151;
  font-size: 13px;
}

.data-cell {
  .data-principal {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a2e;
  }
  .data-detalhe {
    font-size: 11px;
    color: #9ca3af;
  }
}

.acoes-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.no-data {
  text-align: center;
  padding: 48px;
  color: #9ca3af;

  p {
    margin-top: 12px;
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin-top: 20px;

  .pagination-info {
    font-size: 14px;
    color: #6b7280;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.modal-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.preview-card {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  .preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #e5e7eb;

    .preview-title {
      font-weight: 600;
      font-size: 14px;
      color: #1a1a2e;
    }
  }

  .preview-body {
    padding: 16px;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
  }
}

.detalhes-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  .text-h6 {
    color: white;
  }
}

.detalhes-body {
  padding: 20px;

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .info-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 14px;
      color: #1a1a2e;

      &.message {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        line-height: 1.5;
      }

      &.data pre {
        background: #1e1e2e;
        color: #fff;
        padding: 12px;
        border-radius: 8px;
        font-size: 11px;
        overflow-x: auto;
        margin: 0;
      }
    }

    .info-row {
      font-size: 13px;
      color: #374151;
      margin-bottom: 8px;

      strong {
        display: inline-block;
        width: 100px;
      }
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;

    .header-actions {
      flex-direction: column;
      align-items: stretch;

      .search-input {
        width: 100%;
      }
    }
  }

  .filters-bar {
    flex-direction: column;

    .filter-select,
    .filter-date {
      width: 100%;
    }
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .mensagem-cell {
    max-width: 150px;
  }
}
</style>
