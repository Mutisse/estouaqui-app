<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Backups</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar backup..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn color="primary" icon="backup" label="Novo Backup" @click="abrirModalBackupManual" :loading="isProcessing" />
        <q-btn flat icon="settings" label="Configurações" @click="abrirConfiguracoes" />
        <q-btn flat icon="refresh" label="Atualizar" @click="recarregarDados" :loading="isLoading" />
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="database" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
          <div class="stat-label">Total Backups</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="storage" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalTamanhoFormatado }}</div>
          <div class="stat-label">Espaço Total</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="schedule" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatarDataRelativa(estatisticas.ultimo_backup) }}</div>
          <div class="stat-label">Último Backup</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="trending_up" size="28px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatarTamanho(estatisticas.media_diaria) }}/dia</div>
          <div class="stat-label">Média Diária</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <q-select
        v-model="filtros.tipo"
        :options="opcoesTipoBackup"
        label="Tipo"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.status"
        :options="opcoesStatusBackup"
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
      <p>Carregando backups...</p>
    </div>

    <!-- Tabela -->
    <q-table
      v-else
      :rows="backups"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-nome="props">
        <q-td :props="props">
          <div class="backup-nome">
            <q-icon :name="getBackupIcon(props.row.tipo)" size="20px" class="q-mr-sm" />
            {{ props.row.nome }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-tamanho="props">
        <q-td :props="props">
          {{ props.row.tamanho_formatado || formatarTamanho(props.row.tamanho) }}
        </q-td>
      </template>

      <template v-slot:body-cell-tipo="props">
        <q-td :props="props">
          <q-badge :color="getTipoColor(props.row.tipo)">
            {{ getTipoLabel(props.row.tipo) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            <q-icon :name="getStatusIcon(props.row.status)" size="12px" class="q-mr-xs" />
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-data="props">
        <q-td :props="props">
          <div class="data-cell">
            <div>{{ formatarDataRelativa(props.row.created_at) }}</div>
            <div class="data-detalhe">{{ formatarHora(props.row.created_at) }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <div class="acoes-cell">
            <q-btn flat round icon="download" color="primary" size="sm" @click="() => baixarBackup(props.row)" title="Baixar" />
            <q-btn flat round icon="restore" color="warning" size="sm" @click="() => confirmarRestaurar(props.row)" title="Restaurar" />
            <q-btn flat round icon="delete" color="negative" size="sm" @click="() => confirmarExclusao(props.row.id)" title="Excluir" />
          </div>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="pagination-container">
          <q-btn
            flat
            icon="chevron_left"
            :disable="!temPaginaAnterior"
            @click="() => mudarPagina(paginacao.current_page - 1)"
          />
          <span class="pagination-info">
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }}
            ({{ paginacao.total }} registos)
          </span>
          <q-btn
            flat
            icon="chevron_right"
            :disable="!temProximaPagina"
            @click="() => mudarPagina(paginacao.current_page + 1)"
          />
        </div>
      </template>
    </q-table>

    <!-- ==================== MODAL CONFIGURAÇÕES ==================== -->
    <q-dialog v-model="configModalVisible">
      <q-card style="min-width: 550px; max-width: 700px;">
        <q-card-section class="modal-header">
          <div class="text-h6">
            <q-icon name="settings" class="q-mr-sm" />
            Configurações de Backup
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="form-row">
            <q-toggle v-model="configuracoes.ativo" label="Ativar Backup Automático" />
          </div>

          <div v-if="configuracoes.ativo">
            <div class="form-row q-mt-md">
              <q-select
                v-model="configuracoes.frequencia"
                :options="opcoesFrequencia"
                label="Frequência"
                dense
                outlined
                class="col"
                emit-value
                map-options
              />
              <q-input
                v-model="configuracoes.horario"
                label="Horário"
                type="time"
                dense
                outlined
                class="col"
              />
            </div>

            <div class="form-row q-mt-md" v-if="configuracoes.frequencia === 'semanal'">
              <q-select
                v-model="configuracoes.dia_semana"
                :options="opcoesDiasSemana"
                label="Dia da Semana"
                dense
                outlined
                class="col"
                emit-value
                map-options
              />
            </div>

            <div class="form-row q-mt-md" v-if="configuracoes.frequencia === 'mensal'">
              <q-input
                v-model.number="configuracoes.dia_mes"
                label="Dia do Mês"
                type="number"
                dense
                outlined
                class="col"
                min="1"
                max="28"
              />
            </div>
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model.number="configuracoes.manter_ultimos"
              label="Manter últimos backups"
              type="number"
              dense
              outlined
              class="col"
              min="1"
              max="365"
              suffix="dias"
            />
            <q-select
              v-model="configuracoes.destino"
              :options="opcoesDestino"
              label="Destino do Backup"
              dense
              outlined
              class="col"
              emit-value
              map-options
            />
          </div>

          <div class="checkbox-group q-mt-md">
            <q-checkbox v-model="configuracoes.incluir_database" label="Banco de Dados" />
            <q-checkbox v-model="configuracoes.incluir_uploads" label="Uploads (Imagens/Documentos)" />
            <q-checkbox v-model="configuracoes.incluir_logs" label="Logs do Sistema" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Salvar" color="primary" @click="salvarConfiguracoes" :loading="isProcessing" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ==================== MODAL BACKUP MANUAL ==================== -->
    <q-dialog v-model="backupManualModalVisible">
      <q-card style="min-width: 450px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            <q-icon name="backup" class="q-mr-sm" color="primary" />
            Backup Manual
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="form-row">
            <q-input v-model="backupManualNome" label="Nome do Backup (opcional)" dense outlined hint="Deixe em branco para nome automático" />
          </div>

          <div class="checkbox-group q-mt-md">
            <q-checkbox v-model="backupManualIncluir.database" label="Banco de Dados" />
            <q-checkbox v-model="backupManualIncluir.uploads" label="Uploads" />
            <q-checkbox v-model="backupManualIncluir.logs" label="Logs" />
          </div>

          <div class="form-row q-mt-md">
            <q-select
              v-model="backupManualDestino"
              :options="opcoesDestino"
              label="Destino"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Criar Backup" color="primary" @click="criarBackupManual" :loading="isProcessing" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ==================== MODAL RESTAURAR ==================== -->
    <q-dialog v-model="restaurarModalVisible">
      <q-card style="min-width: 450px">
        <q-card-section class="modal-header">
          <div class="text-h6">
            <q-icon name="restore" class="q-mr-sm" color="warning" />
            Restaurar Backup
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="restaurar-info">
            <p><strong>Backup:</strong> {{ backupSelecionado?.nome }}</p>
            <p><strong>Data:</strong> {{ formatarDataCompleta(backupSelecionado?.created_at) }}</p>
            <p><strong>Tamanho:</strong> {{ backupSelecionado?.tamanho_formatado }}</p>
          </div>

          <div class="alert-warning q-mt-md">
            <q-icon name="warning" color="warning" />
            <span>Atenção! Esta ação irá sobrescrever os dados atuais do sistema.</span>
          </div>

          <div class="form-row q-mt-md">
            <q-checkbox v-model="restaurarConfirmado" label="Confirmo que desejo restaurar este backup" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Restaurar" color="warning" @click="executarRestauracao" :loading="isProcessing" :disable="!restaurarConfirmado" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminBackupsStore, type Backup } from 'src/stores/admin/admin-backups-store';

defineOptions({ name: 'AdminBackups' });

const $q = useQuasar();
const backupsStore = useAdminBackupsStore();

const {
  isLoading,
  isProcessing,
  backups,
  configuracoes,
  estatisticas,
  paginacao,
  filtros,
  opcoesFrequencia,
  opcoesDestino,
  opcoesDiasSemana,
  temPaginaAnterior,
  temProximaPagina,
  totalTamanhoFormatado,
} = storeToRefs(backupsStore);

const {
  carregarBackups,
  carregarEstatisticas,
  carregarConfiguracoes,
  criarBackup,
  downloadBackup,
  excluirBackup,
  salvarConfiguracoes,
  restaurarBackup,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  formatarTamanho,
} = backupsStore;

// Estados locais
const configModalVisible = ref(false);
const backupManualModalVisible = ref(false);
const restaurarModalVisible = ref(false);

// ✅ CORRIGIDO: Tipo Backup em vez de any
const backupSelecionado = ref<Backup | null>(null);
const restaurarConfirmado = ref(false);

const backupManualNome = ref('');
const backupManualDestino = ref('local');
const backupManualIncluir = reactive({
  database: true,
  uploads: true,
  logs: true,
});

// Opções para filtros
const opcoesTipoBackup = [
  { label: 'Todos', value: '' },
  { label: 'Manual', value: 'manual' },
  { label: 'Agendado', value: 'agendado' },
  { label: 'Automático', value: 'auto' },
];

const opcoesStatusBackup = [
  { label: 'Todos', value: '' },
  { label: 'Completado', value: 'completado' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Falhou', value: 'falhou' },
];

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, style: 'width: 60px' },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const },
  { name: 'tamanho', label: 'Tamanho', field: 'tamanho', align: 'right' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'data', label: 'Data', field: 'created_at', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const, style: 'width: 120px' },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatarDataRelativa = (dataString: string | null): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

const formatarHora = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const getBackupIcon = (tipo: string): string => {
  const icons: Record<string, string> = {
    manual: 'person',
    agendado: 'schedule',
    auto: 'settings',
  };
  return icons[tipo] || 'backup';
};

const getTipoColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    manual: 'primary',
    agendado: 'info',
    auto: 'purple',
  };
  return colors[tipo] || 'grey';
};

const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    manual: 'Manual',
    agendado: 'Agendado',
    auto: 'Automático',
  };
  return labels[tipo] || tipo;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completado: 'positive',
    em_andamento: 'warning',
    falhou: 'negative',
  };
  return colors[status] || 'grey';
};

const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    completado: 'check',
    em_andamento: 'sync',
    falhou: 'error',
  };
  return icons[status] || 'info';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    completado: 'Completado',
    em_andamento: 'Em andamento',
    falhou: 'Falhou',
  };
  return labels[status] || status;
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('tipo', filtros.value.tipo);
  setFiltro('status', filtros.value.status);
  setFiltro('data_inicio', filtros.value.data_inicio);
  setFiltro('data_fim', filtros.value.data_fim);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Ações de backup
const abrirModalBackupManual = (): void => {
  backupManualNome.value = '';
  backupManualIncluir.database = true;
  backupManualIncluir.uploads = true;
  backupManualIncluir.logs = true;
  backupManualDestino.value = 'local';
  backupManualModalVisible.value = true;
};

const criarBackupManual = async (): Promise<void> => {
  const result = await criarBackup('manual');
  if (result) {
    backupManualModalVisible.value = false;
    $q.notify({ type: 'positive', message: 'Backup criado com sucesso!' });
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao criar backup' });
  }
};

// ✅ CORRIGIDO: Tipo Backup em vez de any
const baixarBackup = async (backup: Backup): Promise<void> => {
  try {
    await downloadBackup(backup);
    $q.notify({ type: 'positive', message: 'Download iniciado!' });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao baixar backup' });
  }
};

// ✅ CORRIGIDO: Tipo Backup em vez de any
const confirmarRestaurar = (backup: Backup): void => {
  backupSelecionado.value = backup;
  restaurarConfirmado.value = false;
  restaurarModalVisible.value = true;
};

const executarRestauracao = async (): Promise<void> => {
  if (!backupSelecionado.value) return;

  const success = await restaurarBackup(backupSelecionado.value.id);
  restaurarModalVisible.value = false;

  if (success) {
    $q.notify({ type: 'positive', message: 'Backup restaurado com sucesso!' });
    await recarregarDados();
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao restaurar backup' });
  }
};

// ✅ CORRIGIDO: onOk sem async/await direto
const confirmarExclusao = (id: number): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.',
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(id);
  });
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirBackup(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Backup excluído com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir backup' });
  }
};

const abrirConfiguracoes = (): void => {
  configModalVisible.value = true;
};

// Lifecycle
onMounted(() => {
  void carregarBackups();
  void carregarEstatisticas();
  void carregarConfiguracoes();
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
      width: 250px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  transition: transform 0.2s, box-shadow 0.2s;

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

    &.blue { background: rgba(102, 126, 234, 0.1); color: #667eea; }
    &.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.purple { background: rgba(118, 75, 162, 0.1); color: #764ba2; }
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stat-label {
      font-size: 12px;
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
    min-width: 150px;
  }

  .filter-date {
    width: 150px;
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

.backup-nome {
  display: flex;
  align-items: center;
}

.data-cell {
  text-align: center;

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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.alert-warning {
  background: #fff3e0;
  border-left: 4px solid #f59e0b;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #92400e;

  span {
    font-size: 13px;
  }
}

.restaurar-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;

  p {
    margin: 4px 0;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;

    .header-actions {
      flex-direction: column;

      .search-input {
        width: 100%;
      }
    }
  }

  .filters-bar {
    flex-direction: column;

    .filter-select, .filter-date {
      width: 100%;
    }
  }
}
</style>
