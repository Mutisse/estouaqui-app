<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Suporte</h1>
      <div class="header-actions">
        <q-input
          v-model="filtros.search"
          placeholder="Pesquisar por título ou cliente..."
          dense
          outlined
          class="search-input"
          @update:model-value="onSearchChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          flat
          icon="refresh"
          label="Atualizar"
          @click="recarregarDados"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Abas: Tickets / Chat ao Vivo -->
    <q-tabs v-model="abaAtual" align="left" narrow-indicator class="main-tabs">
      <q-tab name="tickets" icon="confirmation_number" label="Tickets" />
      <q-tab name="chat" icon="chat" label="Chat ao Vivo">
        <q-badge v-if="totalNaoLidas > 0" color="red" floating>{{ totalNaoLidas }}</q-badge>
      </q-tab>
    </q-tabs>

    <q-separator />

    <!-- ABAS: Tickets -->
    <q-tab-panels v-model="abaAtual" animated>
      <!-- Painel de Tickets -->
      <q-tab-panel name="tickets" class="q-pa-none">
        <!-- Estatísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <q-icon name="confirmation_number" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(estatisticas?.total || 0) }}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red">
              <q-icon name="error" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(estatisticas?.abertos || 0) }}</div>
              <div class="stat-label">Abertos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">
              <q-icon name="pending" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(estatisticas?.em_andamento || 0) }}</div>
              <div class="stat-label">Em Andamento</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">
              <q-icon name="priority_high" size="28px" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(estatisticas?.urgentes || 0) }}</div>
              <div class="stat-label">Urgentes</div>
            </div>
          </div>
        </div>

        <!-- Seção de Categorias -->
        <div class="categorias-section" v-if="estatisticas?.tickets_por_categoria">
          <div class="categorias-header">
            <q-icon name="category" size="20px" color="primary" />
            <span class="categorias-title">Distribuição por Categoria</span>
          </div>
          <div class="categorias-grid">
            <div
              v-for="(count, categoria) in estatisticas.tickets_por_categoria"
              :key="categoria"
              class="categoria-item"
            >
              <span class="categoria-nome">{{ getCategoriaLabel(categoria) }}</span>
              <span class="categoria-count">{{ count }}</span>
            </div>
            <div v-if="Object.keys(estatisticas.tickets_por_categoria).length === 0" class="categoria-empty">
              <q-icon name="info" size="16px" />
              <span>Nenhuma categoria registrada</span>
            </div>
          </div>
        </div>

        <!-- Filtros -->
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
            v-model="filtros.prioridade"
            :options="opcoesPrioridade"
            label="Prioridade"
            dense
            outlined
            clearable
            class="filter-select"
            @update:model-value="onFiltroChange"
          />
          <q-select
            v-model="filtros.categoria"
            :options="opcoesCategoria"
            label="Categoria"
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

        <!-- Tabela de Tickets -->
        <div v-if="isLoading" class="loading-container">
          <q-spinner size="40px" color="primary" />
          <p>Carregando tickets...</p>
        </div>

        <q-table v-else :rows="tickets" :columns="tableColumns" row-key="id" flat bordered>
          <template v-slot:body-cell-numero="props">
            <q-td :props="props">
              <span class="ticket-numero">#{{ props.row.numero }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-prioridade="props">
            <q-td :props="props">
              <q-badge :color="getPrioridadeColor(props.row.prioridade)">
                {{ getPrioridadeLabel(props.row.prioridade) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <div class="user-cell">
                <q-avatar size="28px" class="q-mr-sm">
                  <img :src="getAvatarUrl(props.row.cliente?.nome || '')" />
                </q-avatar>
                <div>
                  <div class="user-name">{{ props.row.cliente?.nome || '—' }}</div>
                  <div class="user-email">{{ props.row.cliente?.email || '—' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              {{ getCategoriaLabel(props.row.categoria) }}
            </q-td>
          </template>

          <template v-slot:body-cell-data="props">
            <q-td :props="props">
              <div class="data-cell">
                <div>{{ formatarDataRelativa(props.row.created_at) }}</div>
                <div class="data-hora">{{ formatarHora(props.row.created_at) }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-acoes="props">
            <q-td :props="props">
              <div class="acoes-cell">
                <q-btn
                  flat
                  round
                  icon="chat"
                  color="primary"
                  size="sm"
                  @click="() => abrirTicket(props.row)"
                  title="Responder"
                />
                <q-btn
                  flat
                  round
                  icon="visibility"
                  color="info"
                  size="sm"
                  @click="() => verTicket(props.row)"
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
              <q-icon name="confirmation_number" size="48px" color="grey-5" />
              <p>Nenhum ticket encontrado</p>
            </div>
          </template>
        </q-table>

        <div class="pagination-container" v-if="paginacao.total > 0">
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
      </q-tab-panel>

      <!-- ==================== CHAT AO VIVO ==================== -->
      <q-tab-panel name="chat" class="chat-panel q-pa-none">
        <div class="chat-container">
          <!-- Lista de Conversas -->
          <div class="chat-list">
            <div class="chat-list-header">
              <q-icon name="chat" size="20px" />
              <span>Conversas Ativas</span>
              <q-badge v-if="totalNaoLidas > 0" color="red">{{ totalNaoLidas }}</q-badge>
            </div>
            <div class="chat-list-items">
              <div
                v-for="ticket in chatTickets"
                :key="ticket.id"
                class="chat-list-item"
                :class="{
                  active: chatSelecionado?.id === ticket.id,
                  'has-unread': ticket.nao_lidas > 0,
                }"
                @click="selecionarChat(ticket)"
              >
                <div class="chat-avatar">
                  <q-avatar size="40px">
                    <img :src="getAvatarUrl(ticket.cliente_nome)" />
                  </q-avatar>
                  <div v-if="ticket.nao_lidas > 0" class="unread-badge">{{ ticket.nao_lidas }}</div>
                </div>
                <div class="chat-info">
                  <div class="chat-nome">{{ ticket.cliente_nome }}</div>
                  <div class="chat-mensagem">{{ truncarTexto(ticket.ultima_mensagem, 40) }}</div>
                </div>
                <div class="chat-meta">
                  <div class="chat-data">{{ formatarHoraCurta(ticket.ultima_mensagem_data) }}</div>
                  <q-icon
                    :name="getPrioridadeIcon(ticket.prioridade)"
                    size="16px"
                    :color="getPrioridadeColor(ticket.prioridade)"
                    class="q-mt-xs"
                  />
                </div>
              </div>
              <div v-if="chatTickets.length === 0" class="no-chats">
                <q-icon name="chat_bubble_outline" size="48px" color="grey-5" />
                <p>Nenhuma conversa ativa</p>
              </div>
            </div>
          </div>

          <!-- Área do Chat -->
          <div class="chat-area">
            <div v-if="!chatSelecionado" class="chat-empty">
              <q-icon name="chat" size="64px" color="grey-4" />
              <p>Selecione uma conversa para começar</p>
            </div>

            <div v-else class="chat-active">
              <!-- Cabeçalho do Chat -->
              <div class="chat-header">
                <div class="chat-header-info">
                  <q-avatar size="36px">
                    <img :src="getAvatarUrl(chatSelecionado.cliente_nome)" />
                  </q-avatar>
                  <div>
                    <div class="chat-header-nome">{{ chatSelecionado.cliente_nome }}</div>
                    <div class="chat-header-ticket">
                      Ticket #{{ chatSelecionado.numero }} - {{ chatSelecionado.titulo }}
                    </div>
                  </div>
                </div>
                <div class="chat-header-status">
                  <q-badge :color="getStatusColor(chatSelecionado.status)">
                    {{ getStatusLabel(chatSelecionado.status) }}
                  </q-badge>
                  <q-badge :color="getPrioridadeColor(chatSelecionado.prioridade)" class="q-ml-sm">
                    {{ getPrioridadeLabel(chatSelecionado.prioridade) }}
                  </q-badge>
                </div>
              </div>

              <!-- Mensagens -->
              <div class="chat-messages" ref="chatMessagesRef">
                <div
                  v-for="msg in chatMensagens"
                  :key="msg.id"
                  class="chat-message"
                  :class="{ 'is-admin': msg.remetente_tipo === 'admin' }"
                >
                  <div class="message-avatar">
                    <q-avatar size="32px">
                      <img :src="getAvatarUrl(msg.remetente_nome)" />
                    </q-avatar>
                  </div>
                  <div class="message-bubble">
                    <div class="message-header">
                      <span class="message-name">{{ msg.remetente_nome }}</span>
                      <span class="message-time">{{ formatarHoraCompleta(msg.created_at) }}</span>
                    </div>
                    <div class="message-text">{{ msg.mensagem }}</div>
                  </div>
                </div>
              </div>

              <!-- Input de Mensagem -->
              <div class="chat-input-area">
                <q-input
                  v-model="novaChatMensagem"
                  placeholder="Digite sua mensagem..."
                  dense
                  outlined
                  class="chat-input"
                  @keyup.enter="enviarChatMensagemFn"
                  autogrow
                >
                  <template v-slot:after>
                    <q-btn
                      round
                      flat
                      icon="send"
                      color="primary"
                      @click="enviarChatMensagemFn"
                      :loading="isSending"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Modal Ticket (Conversa) -->
    <q-dialog v-model="ticketModalVisible" maximized>
      <q-card class="ticket-modal">
        <q-card-section class="ticket-header">
          <div class="ticket-header-info">
            <div class="ticket-header-left">
              <q-btn flat round icon="arrow_back" @click="ticketModalVisible = false" />
              <div>
                <div class="ticket-titulo">{{ ticketDetalhes?.titulo }}</div>
                <div class="ticket-numero">Ticket #{{ ticketDetalhes?.numero }}</div>
              </div>
            </div>
            <div class="ticket-header-actions">
              <!-- 🔥 CORRIGIDO: usando opcoesStatusFiltradas -->
              <q-select
                v-model="ticketStatus"
                :options="opcoesStatusFiltradas"
                label="Status"
                dense
                outlined
                style="width: 150px"
                emit-value
                map-options
                @update:model-value="onStatusChange"
              />
              <!-- 🔥 CORRIGIDO: usando opcoesPrioridadeFiltradas -->
              <q-select
                v-model="ticketPrioridade"
                :options="opcoesPrioridadeFiltradas"
                label="Prioridade"
                dense
                outlined
                style="width: 130px"
                emit-value
                map-options
                @update:model-value="onPrioridadeChange"
              />
              <q-btn flat icon="close" @click="ticketModalVisible = false" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="ticket-info">
          <div class="info-row">
            <span class="info-label">Cliente:</span>
            <span class="info-value">{{ ticketDetalhes?.cliente?.nome || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ ticketDetalhes?.cliente?.email || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Telefone:</span>
            <span class="info-value">{{ ticketDetalhes?.cliente?.telefone || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Categoria:</span>
            <span class="info-value">{{ getCategoriaLabel(ticketDetalhes?.categoria || '') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Criado em:</span>
            <span class="info-value">{{ formatarDataCompleta(ticketDetalhes?.created_at) }}</span>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Descrição Inicial -->
        <q-card-section class="ticket-descricao">
          <div class="descricao-header">
            <q-icon name="description" size="20px" color="primary" />
            <span>Descrição do Problema</span>
          </div>
          <div class="descricao-conteudo">
            {{ ticketDetalhes?.descricao }}
          </div>
        </q-card-section>

        <q-separator />

        <!-- Mensagens -->
        <q-card-section class="ticket-mensagens">
          <div class="mensagens-header">
            <q-icon name="chat" size="20px" color="primary" />
            <span>Conversa</span>
          </div>

          <div class="mensagens-list" ref="mensagensContainer">
            <div
              v-for="msg in mensagens"
              :key="msg.id"
              class="mensagem-item"
              :class="{ 'is-admin': msg.remetente_tipo === 'admin' }"
            >
              <div class="mensagem-avatar">
                <q-avatar size="36px">
                  <img :src="getAvatarUrl(msg.remetente_nome)" />
                </q-avatar>
              </div>
              <div class="mensagem-content">
                <div class="mensagem-header">
                  <span class="mensagem-remetente">{{ msg.remetente_nome }}</span>
                  <span class="mensagem-data"
                    >{{ formatarDataRelativa(msg.created_at) }} às
                    {{ formatarHora(msg.created_at) }}</span
                  >
                </div>
                <div class="mensagem-texto">{{ msg.mensagem }}</div>
              </div>
            </div>
          </div>

          <!-- Formulário de Resposta -->
          <div class="mensagem-form">
            <q-input
              v-model="novaMensagem"
              label="Digite sua resposta..."
              type="textarea"
              dense
              outlined
              rows="3"
              class="mensagem-input"
            />
            <div class="form-actions">
              <q-btn
                flat
                label="Enviar"
                color="primary"
                @click="enviarResposta"
                :loading="isSending"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="ticket-footer">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn
            flat
            label="Fechar Ticket"
            color="negative"
            @click="confirmarFecharTicket"
            v-if="ticketDetalhes?.status !== 'fechado'"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Detalhes -->
    <q-dialog v-model="detalhesModalVisible">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="detalhes-header">
          <div class="text-h6">Ticket #{{ ticketVisualizacao?.numero }}</div>
          <q-badge :color="getStatusColor(ticketVisualizacao?.status || 'aberto')">
            {{ getStatusLabel(ticketVisualizacao?.status || 'aberto') }}
          </q-badge>
        </q-card-section>

        <q-card-section class="detalhes-body">
          <div class="info-group">
            <div class="info-title">Título</div>
            <div class="info-value">{{ ticketVisualizacao?.titulo }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Descrição</div>
            <div class="info-value descricao">{{ ticketVisualizacao?.descricao }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Cliente</div>
            <div class="info-value">{{ ticketVisualizacao?.cliente?.nome }}</div>
            <div class="info-value small">{{ ticketVisualizacao?.cliente?.email }}</div>
          </div>

          <div class="info-group">
            <div class="info-title">Informações</div>
            <div class="info-row">
              <strong>Prioridade:</strong>
              <q-badge
                :color="getPrioridadeColor(ticketVisualizacao?.prioridade || 'media')"
                class="q-ml-sm"
              >
                {{ getPrioridadeLabel(ticketVisualizacao?.prioridade || 'media') }}
              </q-badge>
            </div>
            <div class="info-row">
              <strong>Categoria:</strong>
              {{ getCategoriaLabel(ticketVisualizacao?.categoria || '') }}
            </div>
            <div class="info-row">
              <strong>Criado em:</strong> {{ formatarDataCompleta(ticketVisualizacao?.created_at) }}
            </div>
            <div class="info-row" v-if="ticketVisualizacao?.resolvido_em">
              <strong>Resolvido em:</strong>
              {{ formatarDataCompleta(ticketVisualizacao.resolvido_em) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn flat label="Responder" color="primary" @click="responderDoDetalhes" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import {
  useAdminSuporteStore,
  type Ticket,
  type ChatTicket,
} from 'src/stores/admin/admin-suporte-store';

defineOptions({ name: 'AdminSuporte' });

const $q = useQuasar();
const suporteStore = useAdminSuporteStore();

const {
  isLoading,
  isSending,
  tickets,
  estatisticas,
  paginacao,
  filtros,
  mensagens,
  opcoesStatus,
  opcoesPrioridade,
  opcoesCategoria,
  temPaginaAnterior,
  temProximaPagina,
  totalNaoLidas,
  chatTickets,
  chatMensagens,
  chatSelecionado,
} = storeToRefs(suporteStore);

const {
  carregarTickets,
  carregarEstatisticas,
  buscarTicket,
  carregarMensagens,
  enviarMensagem,
  atualizarStatus,
  atualizarPrioridade,
  excluirTicket,
  fecharTicket,
  setFiltro,
  limparFiltros,
  mudarPagina,
  recarregarDados,
  carregarChatTickets,
  carregarChatMensagens,
  enviarChatMensagem,
  iniciarPolling,
  pararPolling,
  marcarChatLidas,
} = suporteStore;

// ===================== COMPUTADOS SEGUROS =====================
// 🔥 CORREÇÃO: Verifica se opcoesStatus existe antes de acessar .value
const opcoesStatusFiltradas = computed(() => {
  if (!opcoesStatus || typeof opcoesStatus.value === 'undefined' || !Array.isArray(opcoesStatus.value)) {
    return [];
  }
  return opcoesStatus.value.filter((s: { value: string }) => s.value !== '');
});

// 🔥 CORREÇÃO: Verifica se opcoesPrioridade existe antes de acessar .value
const opcoesPrioridadeFiltradas = computed(() => {
  if (!opcoesPrioridade || typeof opcoesPrioridade.value === 'undefined' || !Array.isArray(opcoesPrioridade.value)) {
    return [];
  }
  return opcoesPrioridade.value.filter((p: { value: string }) => p.value !== '');
});

// ===================== ESTADOS LOCAIS =====================
const abaAtual = ref('tickets');
const ticketModalVisible = ref(false);
const detalhesModalVisible = ref(false);
const ticketDetalhes = ref<Ticket | null>(null);
const ticketVisualizacao = ref<Ticket | null>(null);
const ticketStatus = ref('');
const ticketPrioridade = ref('');
const novaMensagem = ref('');
const novaChatMensagem = ref('');
const mensagensContainer = ref<HTMLElement | null>(null);
const chatMessagesRef = ref<HTMLElement | null>(null);

const tableColumns = [
  { name: 'numero', label: 'Ticket', field: 'numero', align: 'left' as const },
  { name: 'titulo', label: 'Título', field: 'titulo', align: 'left' as const },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' as const },
  { name: 'categoria', label: 'Categoria', field: 'categoria', align: 'left' as const },
  { name: 'prioridade', label: 'Prioridade', field: 'prioridade', align: 'center' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'data', label: 'Data', field: 'created_at', align: 'center' as const },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' as const },
];

// ===================== FUNÇÕES AUXILIARES =====================

// 🔥 FUNÇÃO PARA OBTER LABEL DA CATEGORIA
const getCategoriaLabel = (categoria: string): string => {
  if (!categoria) return '—';
  const labels: Record<string, string> = {
    tecnico: 'Problema Técnico',
    duvida: 'Dúvida',
    reclamacao: 'Reclamação',
    sugestao: 'Sugestão',
    financeiro: 'Financeiro',
    outros: 'Outros',
  };
  return labels[categoria] || categoria;
};

const formatNumber = (num: number): string => new Intl.NumberFormat('pt-PT').format(num);

const getAvatarUrl = (nome: string): string => {
  return `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=60&name=${encodeURIComponent(nome)}`;
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

const formatarHoraCurta = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffHoras = (hoje.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffHoras < 1) return 'agora';
  if (diffHoras < 24) return `${Math.floor(diffHoras)}h`;
  return formatarHora(dataString);
};

const formatarHoraCompleta = (dataString: string): string => {
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

const getPrioridadeIcon = (prioridade: string): string => {
  const icons: Record<string, string> = {
    baixa: 'arrow_downward',
    media: 'remove',
    alta: 'arrow_upward',
    urgente: 'warning',
  };
  return icons[prioridade] || 'flag';
};

// Funções para cores e labels
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    aberto: 'negative',
    em_andamento: 'warning',
    resolvido: 'positive',
    fechado: 'grey',
  };
  return colorMap[status] || 'grey';
};

const getPrioridadeColor = (prioridade: string): string => {
  const colorMap: Record<string, string> = {
    baixa: 'info',
    media: 'warning',
    alta: 'orange',
    urgente: 'negative',
  };
  return colorMap[prioridade] || 'grey';
};

const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  };
  return labelMap[status] || status;
};

const getPrioridadeLabel = (prioridade: string): string => {
  const labelMap: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return labelMap[prioridade] || prioridade;
};

const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  if (mensagensContainer.value) {
    mensagensContainer.value.scrollTop = mensagensContainer.value.scrollHeight;
  }
};

const scrollToBottomChat = async (): Promise<void> => {
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// ===================== AÇÕES DE FILTRO =====================
const onSearchChange = (value: string | number | null): void => {
  setFiltro('search', String(value ?? ''));
};

const onFiltroChange = (): void => {
  setFiltro('status', filtros.value.status);
  setFiltro('prioridade', filtros.value.prioridade);
  setFiltro('categoria', filtros.value.categoria);
  setFiltro('data_inicio', filtros.value.data_inicio);
  setFiltro('data_fim', filtros.value.data_fim);
};

const handleLimparFiltros = (): void => {
  limparFiltros();
};

// ===================== AÇÕES DO TICKET =====================
const abrirTicket = async (ticket: Ticket): Promise<void> => {
  const dados = await buscarTicket(ticket.id);
  if (dados) {
    ticketDetalhes.value = dados;
    ticketStatus.value = dados.status;
    ticketPrioridade.value = dados.prioridade;
    await carregarMensagens(dados.id);
    ticketModalVisible.value = true;
    await scrollToBottom();
  }
};

const verTicket = async (ticket: Ticket): Promise<void> => {
  const dados = await buscarTicket(ticket.id);
  if (dados) {
    ticketVisualizacao.value = dados;
    detalhesModalVisible.value = true;
  }
};

const onStatusChange = async (): Promise<void> => {
  if (ticketDetalhes.value && ticketStatus.value) {
    await atualizarStatus(ticketDetalhes.value.id, ticketStatus.value);
    $q.notify({ type: 'positive', message: 'Status atualizado!' });
  }
};

const onPrioridadeChange = async (): Promise<void> => {
  if (ticketDetalhes.value && ticketPrioridade.value) {
    await atualizarPrioridade(ticketDetalhes.value.id, ticketPrioridade.value);
    $q.notify({ type: 'positive', message: 'Prioridade atualizada!' });
  }
};

const enviarResposta = async (): Promise<void> => {
  if (!novaMensagem.value.trim()) {
    $q.notify({ type: 'warning', message: 'Digite uma mensagem' });
    return;
  }
  if (ticketDetalhes.value) {
    const result = await enviarMensagem(ticketDetalhes.value.id, novaMensagem.value);
    if (result) {
      novaMensagem.value = '';
      await scrollToBottom();
      $q.notify({ type: 'positive', message: 'Mensagem enviada!' });
    }
  }
};

const confirmarFecharTicket = (): void => {
  $q.dialog({
    title: 'Fechar ticket',
    message: 'Deseja fechar este ticket? O cliente não poderá mais responder.',
    cancel: true,
    ok: { label: 'Fechar', color: 'negative' },
  }).onOk(() => {
    void executarFecharTicket();
  });
};

const executarFecharTicket = async (): Promise<void> => {
  if (ticketDetalhes.value) {
    const success = await fecharTicket(ticketDetalhes.value.id);
    if (success) {
      $q.notify({ type: 'positive', message: 'Ticket fechado!' });
      ticketModalVisible.value = false;
    }
  }
};

const responderDoDetalhes = (): void => {
  if (ticketVisualizacao.value) {
    detalhesModalVisible.value = false;
    void abrirTicket(ticketVisualizacao.value);
  }
};

const confirmarExclusao = (id: number): void => {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir este ticket?',
    cancel: true,
    ok: { label: 'Excluir', color: 'negative' },
  }).onOk(() => {
    void executarExclusao(id);
  });
};

const executarExclusao = async (id: number): Promise<void> => {
  const success = await excluirTicket(id);
  if (success) {
    $q.notify({ type: 'positive', message: 'Ticket excluído!' });
  }
};

// ===================== AÇÕES DO CHAT =====================
const selecionarChat = async (ticket: ChatTicket): Promise<void> => {
  if (chatSelecionado.value) {
    pararPolling();
  }
  chatSelecionado.value = ticket;
  await carregarChatMensagens(ticket.id);
  await marcarChatLidas(ticket.id);
  await scrollToBottomChat();
  iniciarPolling(ticket.id);
};

const enviarChatMensagemFn = async (): Promise<void> => {
  if (!novaChatMensagem.value.trim() || !chatSelecionado.value) return;

  const result = await enviarChatMensagem(chatSelecionado.value.id, novaChatMensagem.value);
  if (result) {
    novaChatMensagem.value = '';
    await scrollToBottomChat();
  }
};

const carregarChatAba = (): void => {
  void carregarChatTickets();
};

const limparChatSelecionado = (): void => {
  pararPolling();
  chatSelecionado.value = null;
};

// ===================== WATCHERS =====================
watch(abaAtual, (novaAba) => {
  if (novaAba === 'chat') {
    carregarChatAba();
  } else if (novaAba === 'tickets') {
    limparChatSelecionado();
  }
});

// ===================== CICLO DE VIDA =====================
onMounted(() => {
  void carregarTickets();
  void carregarEstatisticas();
});

onUnmounted(() => {
  pararPolling();
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
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
    &.red {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
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
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
}

// Seção de Categorias
.categorias-section {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .categorias-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .categorias-title {
      font-weight: 600;
      font-size: 14px;
      color: #374151;
    }
  }

  .categorias-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .categoria-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f3f4f6;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;

      .categoria-nome {
        color: #374151;
      }

      .categoria-count {
        background: #667eea;
        color: white;
        font-weight: 600;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
      }
    }

    .categoria-empty {
      color: #9ca3af;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 0;
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

.ticket-numero {
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
}

.user-cell {
  display: flex;
  align-items: center;

  .user-name {
    font-weight: 500;
    font-size: 13px;
    color: #1a1a2e;
  }

  .user-email {
    font-size: 11px;
    color: #6b7280;
  }
}

.data-cell {
  text-align: center;

  .data-hora {
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

.main-tabs {
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 0 16px;
  margin-top: 20px;
}

.chat-panel {
  background: transparent;
  padding: 0;
}

// Chat Container
.chat-container {
  display: flex;
  height: calc(100vh - 300px);
  min-height: 500px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 20px;
}

.chat-list {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;

  .chat-list-header {
    padding: 16px;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
  }

  .chat-list-items {
    flex: 1;
    overflow-y: auto;
  }

  .chat-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f0f0f0;

    &:hover {
      background: #f0f0f0;
    }

    &.active {
      background: #667eea10;
      border-left: 3px solid #667eea;
    }

    &.has-unread {
      background: #fff8e7;
    }

    .chat-avatar {
      position: relative;

      .unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 600;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }
    }

    .chat-info {
      flex: 1;
      min-width: 0;

      .chat-nome {
        font-weight: 600;
        font-size: 14px;
        color: #1a1a2e;
      }

      .chat-mensagem {
        font-size: 12px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .chat-meta {
      text-align: right;

      .chat-data {
        font-size: 10px;
        color: #9ca3af;
      }
    }
  }

  .no-chats {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;

  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;

    p {
      margin-top: 16px;
    }
  }

  .chat-active {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: white;

    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .chat-header-nome {
        font-weight: 600;
        font-size: 16px;
        color: #1a1a2e;
      }

      .chat-header-ticket {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;

    .chat-message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.is-admin {
        flex-direction: row-reverse;

        .message-bubble {
          background: #667eea;
          color: white;

          .message-header {
            .message-name,
            .message-time {
              color: rgba(255, 255, 255, 0.8);
            }
          }
        }
      }

      .message-bubble {
        max-width: 70%;
        background: white;
        border-radius: 16px;
        padding: 10px 16px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        .message-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
          font-size: 11px;

          .message-name {
            font-weight: 600;
            color: #667eea;
          }

          .message-time {
            color: #9ca3af;
          }
        }

        .message-text {
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
      }
    }
  }

  .chat-input-area {
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    background: white;

    .chat-input {
      :deep(.q-field__control) {
        border-radius: 24px;
      }
    }
  }
}

// Modal Ticket
.ticket-modal {
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.ticket-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 16px 20px;

  .ticket-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .ticket-header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .ticket-titulo {
        font-size: 18px;
        font-weight: 600;
      }

      .ticket-numero {
        font-size: 12px;
        opacity: 0.8;
        color: white;
      }
    }

    .ticket-header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.ticket-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9fa;

  .info-row {
    .info-label {
      font-weight: 600;
      color: #374151;
      margin-right: 8px;
    }

    .info-value {
      color: #6b7280;
    }
  }
}

.ticket-descricao {
  padding: 16px 20px;

  .descricao-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
    color: #374151;
  }

  .descricao-conteudo {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #1a1a2e;
  }
}

.ticket-mensagens {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 20px;

  .mensagens-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    color: #374151;
  }

  .mensagens-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    margin-bottom: 16px;

    .mensagem-item {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.is-admin {
        .mensagem-content {
          background: #667eea10;
          border-left: 3px solid #667eea;
        }
      }

      .mensagem-content {
        flex: 1;
        background: #f8f9fa;
        border-radius: 12px;
        padding: 12px 16px;

        .mensagem-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;

          .mensagem-remetente {
            font-weight: 600;
            color: #1a1a2e;
          }

          .mensagem-data {
            font-size: 11px;
            color: #9ca3af;
          }
        }

        .mensagem-texto {
          font-size: 13px;
          color: #374151;
          line-height: 1.5;
        }
      }
    }
  }

  .mensagem-form {
    .mensagem-input {
      margin-bottom: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.ticket-footer {
  border-top: 1px solid #e5e7eb;
  padding: 12px 20px;
}

.detalhes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.detalhes-body {
  padding: 20px;

  .info-group {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 12px;
      text-transform: uppercase;
    }

    .info-value {
      font-size: 14px;
      color: #1a1a2e;

      &.descricao {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        line-height: 1.5;
      }

      &.small {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .info-row {
      font-size: 13px;
      color: #374151;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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

    .filter-select,
    .filter-date {
      width: 100%;
    }
  }

  .chat-container {
    flex-direction: column;
    height: auto;
  }

  .chat-list {
    width: 100%;
    max-height: 300px;
  }

  .chat-area {
    min-height: 400px;
  }

  .categorias-grid {
    .categoria-item {
      font-size: 12px;
      padding: 4px 10px;
    }
  }
}
</style>
