<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Promoções</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por código ou descrição..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="local_offer" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.total) }}</div>
          <div class="stat-label">Total Promoções</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="check_circle" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.ativas) }}</div>
          <div class="stat-label">Ativas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="schedule" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.expiradas) }}</div>
          <div class="stat-label">Expiradas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="trending_up" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(estatisticas.uso_total) }}</div>
          <div class="stat-label">Total Usos</div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <q-select
        v-model="filtros.status"
        :options="opcoesStatus"
        label="Status"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.tipo_desconto"
        :options="opcoesTipoDesconto"
        label="Tipo Desconto"
        dense
        outlined
        clearable
        class="filter-select"
        @update:model-value="onFiltroChange"
      />
      <q-btn flat label="Limpar filtros" @click="handleLimparFiltros" class="clear-btn" />
    </div>

    <div class="actions-bar">
      <q-btn color="primary" icon="add" label="Nova Promoção" @click="abrirModalNovo" />
      <q-btn flat icon="refresh" label="Atualizar" @click="recarregarDados" :loading="isLoading" />
    </div>

    <div v-if="isLoading" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p>Carregando promoções...</p>
    </div>

    <q-table
      v-else
      :rows="promocoesFiltradas"
      :columns="tableColumns"
      row-key="id"
      flat
      bordered
      :pagination="{
        rowsPerPage: paginacao.per_page,
        page: paginacao.current_page,
      }"
    >
      <template v-slot:body-cell-tipo_desconto="props">
        <q-td :props="props">
          <q-badge :color="props.row.tipo_desconto === 'percentual' ? 'blue' : 'green'">
            {{
              props.row.tipo_desconto === 'percentual'
                ? `${props.row.valor_desconto}%`
                : formatMoney(props.row.valor_desconto)
            }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-validade="props">
        <q-td :props="props">
          <div class="validade-cell">
            <span>{{ formatarData(props.row.validade_inicio) }}</span>
            <span> → </span>
            <span>{{ formatarData(props.row.validade_fim) }}</span>
            <q-badge :color="getValidadeColor(props.row)" class="q-ml-sm" size="sm">
              {{ getValidadeStatus(props.row) }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-usos="props">
        <q-td :props="props">
          <div class="usos-cell">
            <span>{{ props.row.usado_quantidade || 0 }}</span>
            <span v-if="props.row.max_usos > 0"> / {{ props.row.max_usos }}</span>
            <span v-else class="text-grey"> / ∞</span>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-ativo="props">
        <q-td :props="props">
          <q-badge :color="props.row.ativo ? 'green' : 'red'">
            {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            icon="visibility"
            color="info"
            size="sm"
            @click="() => verPromocao(props.row)"
          />
          <q-btn
            flat
            round
            icon="edit"
            color="primary"
            size="sm"
            @click="() => editarPromocao(props.row)"
          />
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="() => confirmarExclusao(props.row)"
          />
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
            Página {{ paginacao.current_page }} de {{ paginacao.last_page }} ({{ paginacao.total }}
            registos)
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

    <!-- Modal Nova/Editar Promoção -->
    <q-dialog v-model="modalVisible" persistent>
      <q-card style="min-width: 600px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar Promoção' : 'Nova Promoção' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="form-row">
            <q-input
              v-model="form.codigo"
              label="Código *"
              dense
              outlined
              class="col"
              :error="!!errors.codigo"
              :error-message="errors.codigo"
              hint="Ex: PRIMEIRA10, BLACKFRIDAY"
              uppercase
            />
            <q-select
              v-model="form.tipo_desconto"
              :options="opcoesTipoDesconto"
              label="Tipo de Desconto *"
              dense
              outlined
              class="col"
              emit-value
              map-options
              @update:model-value="onTipoDescontoChange"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model.number="form.valor_desconto"
              label="Valor do Desconto *"
              type="number"
              dense
              outlined
              class="col"
              :suffix="form.tipo_desconto === 'percentual' ? '%' : 'MZN'"
              :error="!!errors.valor_desconto"
              :error-message="errors.valor_desconto"
              min="0"
              :max="form.tipo_desconto === 'percentual' ? 100 : undefined"
            />
            <q-input
              v-model.number="form.valor_minimo"
              label="Valor mínimo do pedido"
              type="number"
              dense
              outlined
              class="col"
              suffix="MZN"
              min="0"
              hint="0 = sem valor mínimo"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model.number="form.max_usos"
              label="Limite de usos"
              type="number"
              dense
              outlined
              class="col"
              hint="0 = sem limite"
              min="0"
            />
          </div>

          <div class="form-row q-mt-md">
            <q-input
              v-model="form.validade_inicio"
              label="Data Início *"
              type="date"
              dense
              outlined
              class="col"
              :error="!!errors.validade_inicio"
              :error-message="errors.validade_inicio"
            />
            <q-input
              v-model="form.validade_fim"
              label="Data Fim *"
              type="date"
              dense
              outlined
              class="col"
              :error="!!errors.validade_fim"
              :error-message="errors.validade_fim"
            />
          </div>

          <q-input
            v-model="form.descricao"
            label="Descrição"
            type="textarea"
            dense
            outlined
            class="q-mt-md"
            rows="3"
            hint="Descrição opcional da promoção"
          />

          <div class="form-row q-mt-md">
            <q-toggle v-model="form.ativo" label="Ativo" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup @click="fecharModal" />
          <q-btn flat label="Salvar" color="primary" @click="salvarPromocao" :loading="isSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Visualizar Promoção -->
    <q-dialog v-model="viewModalVisible">
      <q-card style="min-width: 450px; max-width: 550px">
        <q-card-section
          class="view-header"
          :style="{ background: `linear-gradient(135deg, #667EEA, #1a1a2e)` }"
        >
          <div class="view-icon">
            <q-icon name="local_offer" size="48px" />
          </div>
          <div class="view-codigo">{{ promocaoVisualizacao?.codigo }}</div>
          <q-badge :color="promocaoVisualizacao?.ativo ? 'green' : 'red'" class="view-status">
            {{ promocaoVisualizacao?.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-card-section>

        <q-card-section class="view-body">
          <div class="info-group">
            <div class="info-title">Desconto</div>
            <div class="info-value highlight">
              <span v-if="promocaoVisualizacao?.tipo_desconto === 'percentual'">
                {{ promocaoVisualizacao?.valor_desconto }}% OFF
              </span>
              <span v-else> {{ formatMoney(promocaoVisualizacao?.valor_desconto || 0) }} OFF </span>
            </div>
          </div>

          <div class="info-group" v-if="promocaoVisualizacao?.descricao">
            <div class="info-title">Descrição</div>
            <div class="info-value">{{ promocaoVisualizacao.descricao }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Período de Validade</div>
            <div class="info-value">
              {{ formatarDataCompleta(promocaoVisualizacao?.validade_inicio) }}<br />
              até<br />
              {{ formatarDataCompleta(promocaoVisualizacao?.validade_fim) }}
            </div>
          </div>

          <div class="info-group">
            <div class="info-title">Condições</div>
            <div class="info-row">
              <strong>Valor mínimo:</strong>
              {{
                promocaoVisualizacao?.valor_minimo
                  ? formatMoney(promocaoVisualizacao.valor_minimo)
                  : 'Sem valor mínimo'
              }}
            </div>
            <div class="info-row">
              <strong>Limite de usos:</strong>
              <span v-if="promocaoVisualizacao?.max_usos && promocaoVisualizacao.max_usos > 0">
                {{ promocaoVisualizacao.usado_quantidade || 0 }} /
                {{ promocaoVisualizacao.max_usos }}
              </span>
              <span v-else>Sem limite</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn flat label="Editar" color="primary" @click="editarDoView" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAdminPromocoesStore } from 'src/stores/admin/admin-promocoes-store';
import type { Promocao, PromocaoForm } from 'src/stores/admin/admin-promocoes-store';

defineOptions({ name: 'AdminPromocoes' });

const $q = useQuasar();
const promocoesStore = useAdminPromocoesStore();

const {
  isLoading,
  isSaving,
  estatisticas,
  paginacao,
  filtros,
  opcoesStatus,
  opcoesTipoDesconto,
  temPaginaAnterior,
  temProximaPagina,
  promocoesFiltradas,
} = storeToRefs(promocoesStore);

const {
  carregarPromocoes,
  carregarEstatisticas,
  buscarPromocao,
  criarPromocao,
  atualizarPromocao,
  excluirPromocao,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
} = promocoesStore;

// Estados locais
const modalVisible = ref(false);
const viewModalVisible = ref(false);
const editando = ref(false);
const editandoId = ref<number | null>(null);
const promocaoVisualizacao = ref<Promocao | null>(null);

const errors = reactive({
  codigo: '',
  valor_desconto: '',
  validade_inicio: '',
  validade_fim: '',
});

const form = reactive<PromocaoForm>({
  codigo: '',
  descricao: '',
  tipo_desconto: 'percentual',
  valor_desconto: 0,
  valor_minimo: 0,
  validade_inicio: '',
  validade_fim: '',
  ativo: true,
  max_usos: 0,
});

const tableColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'tipo_desconto', label: 'Desconto', field: 'tipo_desconto', align: 'center' as const },
  { name: 'valor_minimo', label: 'Valor Mínimo', field: 'valor_minimo', align: 'right' as const },
  { name: 'validade', label: 'Validade', field: 'validade', align: 'left' as const },
  { name: 'usos', label: 'Usos', field: 'usos', align: 'center' as const },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const },
];

// Funções auxiliares
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-PT').format(num);
};

const formatMoney = (num: number): string => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(num);
};

const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
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

const getValidadeColor = (promocao: Promocao): string => {
  const hoje = new Date();
  const dataFim = new Date(promocao.validade_fim);
  const dataInicio = new Date(promocao.validade_inicio);

  if (!promocao.ativo) return 'red';
  if (dataFim < hoje) return 'orange';
  if (dataInicio > hoje) return 'blue';
  return 'green';
};

const getValidadeStatus = (promocao: Promocao): string => {
  const hoje = new Date();
  const dataFim = new Date(promocao.validade_fim);
  const dataInicio = new Date(promocao.validade_inicio);

  if (!promocao.ativo) return 'Inativa';
  if (dataFim < hoje) return 'Expirada';
  if (dataInicio > hoje) return 'Agendada';
  return 'Válida';
};

const validarForm = (): boolean => {
  let isValid = true;
  errors.codigo = '';
  errors.valor_desconto = '';
  errors.validade_inicio = '';
  errors.validade_fim = '';

  if (!form.codigo?.trim()) {
    errors.codigo = 'Código é obrigatório';
    isValid = false;
  }

  if (!form.valor_desconto || form.valor_desconto <= 0) {
    errors.valor_desconto = 'Valor do desconto deve ser maior que zero';
    isValid = false;
  }

  if (form.tipo_desconto === 'percentual' && (form.valor_desconto || 0) > 100) {
    errors.valor_desconto = 'Desconto percentual não pode ultrapassar 100%';
    isValid = false;
  }

  if (!form.validade_inicio) {
    errors.validade_inicio = 'Data de início é obrigatória';
    isValid = false;
  }

  if (!form.validade_fim) {
    errors.validade_fim = 'Data de fim é obrigatória';
    isValid = false;
  }

  if (
    form.validade_inicio &&
    form.validade_fim &&
    new Date(form.validade_inicio) > new Date(form.validade_fim)
  ) {
    errors.validade_fim = 'Data de fim deve ser posterior à data de início';
    isValid = false;
  }

  return isValid;
};

const onTipoDescontoChange = (): void => {
  if (form.tipo_desconto === 'percentual') {
    if ((form.valor_desconto || 0) > 100) {
      form.valor_desconto = 100;
    }
  }
};

// Ações de filtro
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('status', filtros.value.status);
  setFiltro('tipo_desconto', filtros.value.tipo_desconto);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// Ações de modal
const abrirModalNovo = (): void => {
  editando.value = false;
  editandoId.value = null;
  form.codigo = '';
  form.descricao = '';
  form.tipo_desconto = 'percentual';
  form.valor_desconto = 0;
  form.valor_minimo = 0;
  form.max_usos = 0;
  form.validade_inicio = '';
  form.validade_fim = '';
  form.ativo = true;
  errors.codigo = '';
  errors.valor_desconto = '';
  errors.validade_inicio = '';
  errors.validade_fim = '';
  modalVisible.value = true;
};

const editarPromocao = (promocao: Promocao): void => {
  editando.value = true;
  editandoId.value = promocao.id;
  form.codigo = promocao.codigo;
  form.descricao = promocao.descricao ?? '';
  form.tipo_desconto = promocao.tipo_desconto;
  form.valor_desconto = promocao.valor_desconto;
  form.valor_minimo = promocao.valor_minimo ?? 0;
  form.max_usos = promocao.max_usos ?? 0;

  // ✅ Usando operador de coalescência
  form.validade_inicio = promocao.validade_inicio?.split('T')[0] ?? '';
  form.validade_fim = promocao.validade_fim?.split('T')[0] ?? '';

  form.ativo = promocao.ativo;
  errors.codigo = '';
  errors.valor_desconto = '';
  errors.validade_inicio = '';
  errors.validade_fim = '';
  modalVisible.value = true;
};
const verPromocao = async (promocao: Promocao): Promise<void> => {
  const dados = await buscarPromocao(promocao.id);
  if (dados) {
    promocaoVisualizacao.value = dados;
    viewModalVisible.value = true;
  }
};

const editarDoView = (): void => {
  if (promocaoVisualizacao.value) {
    viewModalVisible.value = false;
    editarPromocao(promocaoVisualizacao.value);
  }
};

const salvarPromocao = async (): Promise<void> => {
  if (!validarForm()) return;

  try {
    const dadosParaSalvar: PromocaoForm = {
      codigo: form.codigo.toUpperCase(),
      descricao: form.descricao || '',
      tipo_desconto: form.tipo_desconto,
      valor_desconto: form.valor_desconto,
      valor_minimo: form.valor_minimo || 0,
      validade_inicio: form.validade_inicio,
      validade_fim: form.validade_fim,
      ativo: form.ativo,
      max_usos: form.max_usos || 0,
    };

    if (editando.value && editandoId.value) {
      const result = await atualizarPromocao(editandoId.value, dadosParaSalvar);
      if (result) {
        $q.notify({ type: 'positive', message: 'Promoção atualizada com sucesso!' });
        modalVisible.value = false;
        await recarregarDados();
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar promoção' });
      }
    } else {
      const result = await criarPromocao(dadosParaSalvar);
      if (result) {
        $q.notify({ type: 'positive', message: 'Promoção criada com sucesso!' });
        modalVisible.value = false;
        await recarregarDados();
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao criar promoção' });
      }
    }
  } catch (error) {
    console.error('Erro ao salvar promoção:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar promoção' });
  }
};

const confirmarExclusao = (promocao: Promocao): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir a promoção "${promocao.codigo}"? Esta ação não pode ser desfeita.`,
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(promocao.id);
  });
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirPromocao(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Promoção excluída com sucesso!' });
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir promoção' });
  }
};

const fecharModal = (): void => {
  modalVisible.value = false;
  editando.value = false;
  editandoId.value = null;
};

// Lifecycle
onMounted(() => {
  void carregarPromocoes();
  void carregarEstatisticas();
});
</script>

<style scoped lang="scss">
.page-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .search-input {
    width: 280px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
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
    &.purple {
      background: rgba(118, 75, 162, 0.1);
      color: #764ba2;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 20px;
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
  margin-bottom: 16px;
  flex-wrap: wrap;

  .filter-select {
    min-width: 150px;
  }

  .clear-btn {
    color: #6b7280;
  }
}

.actions-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;

  p {
    margin-top: 12px;
    color: #6b7280;
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;

  .pagination-info {
    font-size: 14px;
    color: #6b7280;
  }
}

.validade-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex-wrap: wrap;
}

.usos-cell {
  text-align: center;
  font-size: 13px;

  .text-grey {
    color: #9ca3af;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.view-header {
  text-align: center;
  padding: 24px;
  color: white;

  .view-icon {
    margin-bottom: 12px;
  }

  .view-codigo {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 2px;
  }
}

.view-body {
  padding: 20px;

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
    }

    .info-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .info-value {
      font-size: 14px;
      color: #1a1a2e;

      &.highlight {
        font-size: 24px;
        font-weight: 700;
        color: #667eea;
      }
    }

    .info-row {
      font-size: 13px;
      color: #374151;
      margin-bottom: 6px;
    }
  }
}
</style>
