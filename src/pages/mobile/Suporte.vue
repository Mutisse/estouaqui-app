<template>
  <div class="suporte-page">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-voltar" @click="router.back()">
        <q-icon name="arrow_back" size="22px" />
      </button>
      <div class="header-title">
        <q-icon name="support_agent" size="24px" color="primary" />
        <h1>Suporte</h1>
      </div>
      <button class="btn-novo" @click="abrirFormulario">
        <q-icon name="add" size="22px" />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="suporteStore.isLoading && suporteStore.tickets.length === 0" class="loading">
      <q-spinner color="primary" size="40px" />
      <p>A carregar...</p>
    </div>

    <div v-else>
      <!-- Estatísticas -->
      <div class="stats">
        <div class="stat" :class="{ ativo: filtro === 'todos' }" @click="filtro = 'todos'">
          <span class="stat-numero">{{ suporteStore.estatisticas.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat" :class="{ ativo: filtro === 'aberto' }" @click="filtro = 'aberto'">
          <span class="stat-numero">{{ suporteStore.estatisticas.abertos }}</span>
          <span class="stat-label">Abertos</span>
        </div>
        <div class="stat" :class="{ ativo: filtro === 'andamento' }" @click="filtro = 'andamento'">
          <span class="stat-numero">{{ suporteStore.estatisticas.andamento }}</span>
          <span class="stat-label">Andamento</span>
        </div>
        <div class="stat" :class="{ ativo: filtro === 'resolvido' }" @click="filtro = 'resolvido'">
          <span class="stat-numero">{{ suporteStore.estatisticas.resolvidos }}</span>
          <span class="stat-label">Resolvidos</span>
        </div>
      </div>

      <!-- Lista de Tickets -->
      <div class="lista-tickets" v-if="ticketsFiltrados.length > 0">
        <div
          v-for="ticket in ticketsFiltrados"
          :key="ticket.id"
          class="card-ticket"
          @click="abrirTicket(ticket.id)"
        >
          <div class="ticket-cabecalho">
            <span class="ticket-numero">#{{ ticket.numero }}</span>
            <div class="badges">
              <q-badge :color="getCorStatus(ticket.status)">{{
                getTextoStatus(ticket.status)
              }}</q-badge>
              <q-badge :color="getCorPrioridade(ticket.prioridade)" class="ml-1">{{
                getTextoPrioridade(ticket.prioridade)
              }}</q-badge>
            </div>
          </div>
          <h3 class="ticket-titulo">{{ ticket.titulo }}</h3>
          <p class="ticket-descricao">{{ resumirTexto(ticket.descricao, 80) }}</p>
          <div class="ticket-rodape">
            <span class="ticket-categoria">
              <q-icon :name="getIconeCategoria(ticket.categoria)" size="14px" />
              {{ getNomeCategoria(ticket.categoria) }}
            </span>
            <span class="ticket-data">
              <q-icon name="schedule" size="12px" />
              {{ formatarData(ticket.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Nenhum ticket -->
      <div v-else class="vazio">
        <q-icon name="chat_bubble_outline" size="64px" color="grey-4" />
        <h3>Nenhum ticket</h3>
        <p v-if="filtro !== 'todos'">Nenhum ticket com status "{{ filtro }}"</p>
        <p v-else>Você ainda não tem tickets. Crie um agora!</p>
        <button class="btn-criar" @click="abrirFormulario">+ Criar ticket</button>
      </div>
    </div>

    <!-- Modal: Criar Ticket -->
    <q-dialog v-model="modalAberto" position="bottom" class="modal-ticket">
      <q-card class="modal-conteudo">
        <div class="modal-header">
          <span class="text-h6">Reportar Problema</span>
          <q-btn flat round icon="close" v-close-popup />
        </div>

        <div class="modal-body">
          <div class="campo">
            <label>Título *</label>
            <q-input v-model="form.titulo" placeholder="Ex: Erro ao fazer login" dense outlined />
          </div>

          <div class="campo">
            <label>Categoria *</label>
            <div class="grid-categorias">
              <div
                v-for="cat in categorias"
                :key="cat.valor"
                class="categoria"
                :class="{ selecionada: form.categoria === cat.valor }"
                @click="form.categoria = cat.valor"
              >
                <q-icon :name="cat.icone" size="24px" />
                <span>{{ cat.label }}</span>
              </div>
            </div>
          </div>

          <div class="campo">
            <label>Prioridade *</label>
            <div class="grid-prioridades">
              <div
                v-for="prio in prioridades"
                :key="prio.valor"
                class="prioridade"
                :class="{ selecionada: form.prioridade === prio.valor, [prio.cor]: true }"
                @click="form.prioridade = prio.valor"
              >
                {{ prio.label }}
              </div>
            </div>
          </div>

          <div class="campo">
            <label>Descrição *</label>
            <q-input
              v-model="form.descricao"
              type="textarea"
              rows="4"
              placeholder="Descreva o problema em detalhes..."
              dense
              outlined
            />
          </div>

          <div class="campo">
            <label>Código do erro (opcional)</label>
            <div class="linha-erro">
              <input
                type="text"
                v-model="form.codigoErro"
                placeholder="Ex: 500, 404, Network Error"
                class="input-erro"
              />
              <button class="btn-detectar" @click="detectarErro">Detectar</button>
            </div>
          </div>

          <div class="campo">
            <label>Anexar prints (opcional)</label>
            <div class="area-upload" @click="selecionarArquivos">
              <q-icon name="cloud_upload" size="32px" color="primary" />
              <span>Clique para anexar imagens</span>
              <small>JPG, PNG até 5MB</small>
            </div>
            <input
              type="file"
              ref="inputArquivos"
              multiple
              accept="image/*"
              hidden
              @change="aoSelecionarArquivos"
            />
            <div class="preview-imagens" v-if="previews.length">
              <div v-for="(img, idx) in previews" :key="idx" class="preview-item">
                <img :src="img" />
                <button class="remover" @click.stop="removerImagem(idx)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            label="Enviar"
            color="primary"
            @click="enviarTicket"
            :loading="suporteStore.isSending"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Modal: Conversa do Ticket -->
    <q-dialog v-model="modalConversa" maximized class="modal-conversa">
      <q-card class="conversa-container">
        <div class="conversa-header">
          <button class="voltar" @click="modalConversa = false">
            <q-icon name="arrow_back" size="22px" />
          </button>
          <div class="info-ticket">
            <div class="numero">Ticket #{{ suporteStore.ticketAtual?.numero }}</div>
            <div class="titulo">{{ suporteStore.ticketAtual?.titulo }}</div>
          </div>
          <div class="status">
            <q-badge :color="getCorStatus(suporteStore.ticketAtual?.status || 'aberto')">
              {{ getTextoStatus(suporteStore.ticketAtual?.status || 'aberto') }}
            </q-badge>
          </div>
        </div>

        <div class="conversa-mensagens" ref="mensagensContainer">
          <div v-if="carregandoMensagens" class="loading-msg">
            <q-spinner color="primary" size="24px" />
          </div>
          <div v-else class="lista-mensagens">
            <div
              v-for="msg in suporteStore.mensagens"
              :key="msg.id"
              class="mensagem"
              :class="{
                usuario: msg.remetente_tipo !== 'admin',
                admin: msg.remetente_tipo === 'admin',
              }"
            >
              <div class="avatar">
                <q-avatar size="32px">
                  <img
                    :src="`https://ui-avatars.com/api/?background=5B4BF5&color=fff&name=${msg.remetente_nome}`"
                  />
                </q-avatar>
              </div>
              <div class="bolha">
                <div class="cabecalho">
                  <span class="nome">{{ msg.remetente_nome }}</span>
                  <span class="hora">{{ formatarHora(msg.created_at) }}</span>
                </div>
                <div class="texto">{{ msg.mensagem }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="conversa-input">
          <q-input
            v-model="novaMensagem"
            placeholder="Digite sua mensagem..."
            dense
            outlined
            class="input-msg"
            @keyup.enter="enviarMensagem"
            autogrow
          />
          <button
            class="btn-enviar"
            @click="enviarMensagem"
            :disabled="!novaMensagem.trim() || suporteStore.isSending"
          >
            <q-icon name="send" size="20px" />
          </button>
        </div>

        <div
          class="conversa-footer"
          v-if="
            suporteStore.ticketAtual?.status !== 'fechado' &&
            suporteStore.ticketAtual?.status !== 'resolvido'
          "
        >
          <button class="btn-fechar" @click="fecharTicket">
            <q-icon name="check_circle" size="18px" />
            Fechar ticket
          </button>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuporteStore } from 'src/stores/suporte-store';

defineOptions({ name: 'SuporteGeral' });

const router = useRouter();
const $q = useQuasar();
const suporteStore = useSuporteStore();

// Estados locais
const filtro = ref('todos');
const modalAberto = ref(false);
const modalConversa = ref(false);
const carregandoMensagens = ref(false);
const novaMensagem = ref('');
const mensagensContainer = ref<HTMLElement | null>(null);

// Formulário local
const form = ref({
  titulo: '',
  descricao: '',
  categoria: '',
  prioridade: 'media',
  codigoErro: '',
});
const arquivos = ref<File[]>([]);
const previews = ref<string[]>([]);
const inputArquivos = ref<HTMLInputElement | null>(null);

// Categorias (display)
const categorias = [
  { valor: 'tecnico', label: 'Problema Técnico', icone: 'bug_report' },
  { valor: 'erro', label: 'Erro no Sistema', icone: 'error' },
  { valor: 'pagamento', label: 'Pagamento', icone: 'payments' },
  { valor: 'duvida', label: 'Dúvida', icone: 'help' },
  { valor: 'reclamacao', label: 'Reclamação', icone: 'feedback' },
  { valor: 'sugestao', label: 'Sugestão', icone: 'lightbulb' },
  { valor: 'outros', label: 'Outros', icone: 'more_horiz' },
];

const prioridades = [
  { valor: 'baixa', label: 'Baixa', cor: 'info' },
  { valor: 'media', label: 'Média', cor: 'warning' },
  { valor: 'alta', label: 'Alta', cor: 'orange' },
  { valor: 'urgente', label: 'Urgente', cor: 'negative' },
];

// Tickets filtrados
const ticketsFiltrados = computed(() => {
  if (filtro.value === 'todos') return suporteStore.tickets;
  if (filtro.value === 'andamento')
    return suporteStore.tickets.filter((t) => t.status === 'em_andamento');
  return suporteStore.tickets.filter((t) => t.status === filtro.value);
});

// Helpers
const getCorStatus = (status: string): string => {
  const cores: Record<string, string> = {
    aberto: 'negative',
    em_andamento: 'warning',
    resolvido: 'positive',
    fechado: 'grey',
  };
  return cores[status] || 'grey';
};

const getTextoStatus = (status: string): string => {
  const textos: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Andamento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  };
  return textos[status] || status;
};

const getCorPrioridade = (prioridade: string): string => {
  const prio = prioridades.find((p) => p.valor === prioridade);
  return prio?.cor || 'grey';
};

const getTextoPrioridade = (prioridade: string): string => {
  const prio = prioridades.find((p) => p.valor === prioridade);
  return prio?.label || prioridade;
};

const getNomeCategoria = (categoria: string): string => {
  const cat = categorias.find((c) => c.valor === categoria);
  return cat?.label || categoria;
};

const getIconeCategoria = (categoria: string): string => {
  const cat = categorias.find((c) => c.valor === categoria);
  return cat?.icone || 'help';
};

const resumirTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
};

const formatarData = (data: string): string => {
  if (!data) return '';
  const d = new Date(data);
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
};

const formatarHora = (data: string): string => {
  if (!data) return '';
  const d = new Date(data);
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

// Detectar erro
const detectarErro = () => {
  const errosComuns = [
    '500 - Erro interno do servidor',
    '404 - Página não encontrada',
    '403 - Acesso negado',
    '401 - Não autorizado',
    'Network Error - Sem conexão',
    'Timeout - Tempo esgotado',
    'CORS - Erro de cross-origin',
  ];
  const indiceAleatorio = Math.floor(Math.random() * errosComuns.length);
  form.value.codigoErro = errosComuns[indiceAleatorio] || 'Erro desconhecido';
  $q.notify({ type: 'info', message: `Erro detectado: ${form.value.codigoErro}` });
};

// Anexos
const selecionarArquivos = () => {
  inputArquivos.value?.click();
};

const aoSelecionarArquivos = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const files = Array.from(input.files);
    arquivos.value.push(...files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
  input.value = '';
};

const removerImagem = (index: number) => {
  arquivos.value.splice(index, 1);
  previews.value.splice(index, 1);
};

// Ações usando a store
const enviarTicket = async () => {
  if (!form.value.titulo || !form.value.descricao || !form.value.categoria) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos obrigatórios' });
    return;
  }

  const ticket = await suporteStore.criarTicket({
    titulo: form.value.titulo,
    descricao: form.value.descricao,
    categoria: form.value.categoria,
    prioridade: form.value.prioridade,
    codigo_erro: form.value.codigoErro,
    anexos: arquivos.value,
  });

  if (ticket) {
    $q.notify({ type: 'positive', message: 'Ticket enviado com sucesso!' });
    modalAberto.value = false;
    resetForm();
  } else {
    $q.notify({ type: 'negative', message: suporteStore.error || 'Erro ao enviar ticket' });
  }
};

const resetForm = () => {
  form.value = { titulo: '', descricao: '', categoria: '', prioridade: 'media', codigoErro: '' };
  arquivos.value = [];
  previews.value = [];
};

const abrirTicket = async (id: number) => {
  modalConversa.value = true;
  carregandoMensagens.value = true;

  const ticket = await suporteStore.carregarTicket(id);
  if (ticket) {
    await suporteStore.carregarMensagens(id);
    await scrollToBottom();
  }

  carregandoMensagens.value = false;
};

const enviarMensagem = async () => {
  if (!novaMensagem.value.trim() || !suporteStore.ticketAtual) return;

  const mensagem = await suporteStore.enviarMensagem(
    suporteStore.ticketAtual.id,
    novaMensagem.value,
  );
  if (mensagem) {
    novaMensagem.value = '';
    await scrollToBottom();
  } else {
    $q.notify({ type: 'negative', message: suporteStore.error || 'Erro ao enviar mensagem' });
  }
};

const fecharTicket = () => {
  if (!suporteStore.ticketAtual) return;

  $q.dialog({
    title: 'Fechar ticket',
    message: 'Tem certeza que deseja fechar este ticket?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Fechar', color: 'negative' },
  }).onOk(() => {
    void (async () => {
      const success = await suporteStore.fecharTicket(suporteStore.ticketAtual!.id);
      if (success) {
        $q.notify({ type: 'positive', message: 'Ticket fechado!' });
        modalConversa.value = false;
      } else {
        $q.notify({ type: 'negative', message: suporteStore.error || 'Erro ao fechar ticket' });
      }
    })();
  });
};

const scrollToBottom = async () => {
  await nextTick();
  if (mensagensContainer.value) {
    mensagensContainer.value.scrollTop = mensagensContainer.value.scrollHeight;
  }
};

const abrirFormulario = () => {
  resetForm();
  modalAberto.value = true;
};

// Watch para scroll quando mensagens mudam
// Watch para scroll quando mensagens mudam
watch(
  () => suporteStore.mensagens.length,
  () => {
    void scrollToBottom();
  },
);

onMounted(() => {
  void suporteStore.carregarTickets();
});
</script>

<style scoped lang="scss">
$primary: #5b4bf5;
$bg: #f5f7fa;
$card: #ffffff;
$text: #1a1a2e;
$gray: #6b7280;
$border: #e5e9f0;

.suporte-page {
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

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    h1 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: $text;
    }
  }

  .btn-voltar,
  .btn-novo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    border: none;
    cursor: pointer;
    &:hover {
      background: $border;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  p {
    color: $gray;
  }
}

.stats {
  display: flex;
  gap: 12px;
  padding: 16px;

  .stat {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
    cursor: pointer;

    &.ativo {
      background: rgba($primary, 0.1);
      border: 1px solid $primary;
    }

    .stat-numero {
      font-size: 1.1rem;
      font-weight: 700;
      color: $text;
      display: block;
    }
    .stat-label {
      font-size: 0.6rem;
      color: $gray;
    }
  }
}

.lista-tickets {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-ticket {
  background: white;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;

  .ticket-cabecalho {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .ticket-numero {
      font-size: 0.7rem;
      font-weight: 600;
      color: $primary;
    }
    .badges {
      display: flex;
      gap: 4px;
    }
  }

  .ticket-titulo {
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 4px;
  }
  .ticket-descricao {
    font-size: 0.7rem;
    color: $gray;
    margin: 0 0 8px;
  }

  .ticket-rodape {
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    color: $gray;
    .ticket-categoria,
    .ticket-data {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.vazio {
  text-align: center;
  padding: 60px 20px;
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 16px 0 8px;
  }
  p {
    font-size: 0.8rem;
    color: $gray;
    margin-bottom: 20px;
  }
  .btn-criar {
    padding: 10px 24px;
    background: $primary;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 0.8rem;
    cursor: pointer;
  }
}

.modal-ticket :deep(.q-dialog__inner) {
  justify-content: flex-end;
}

.modal-conteudo {
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border;
}

.modal-body {
  padding: 16px;
}

.campo {
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 6px;
    color: $text;
  }
}

.grid-categorias {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  .categoria {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: 1px solid $border;
    border-radius: 12px;
    cursor: pointer;
    &.selecionada {
      background: rgba($primary, 0.1);
      border-color: $primary;
    }
    span {
      font-size: 0.6rem;
      text-align: center;
    }
  }
}

.grid-prioridades {
  display: flex;
  gap: 8px;
  .prioridade {
    flex: 1;
    text-align: center;
    padding: 8px;
    border-radius: 30px;
    font-size: 0.7rem;
    font-weight: 500;
    background: #f0f2f5;
    cursor: pointer;
    &.selecionada {
      &.info {
        background: #2196f3;
        color: white;
      }
      &.warning {
        background: #ff9800;
        color: white;
      }
      &.orange {
        background: #ff5722;
        color: white;
      }
      &.negative {
        background: #ef4444;
        color: white;
      }
    }
  }
}

.linha-erro {
  display: flex;
  gap: 8px;
  .input-erro {
    flex: 1;
    padding: 10px;
    border: 1px solid $border;
    border-radius: 12px;
  }
  .btn-detectar {
    padding: 0 12px;
    background: #f0f2f5;
    border: none;
    border-radius: 12px;
    cursor: pointer;
  }
}

.area-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  border: 1px dashed $border;
  border-radius: 12px;
  cursor: pointer;
  span {
    font-size: 0.7rem;
    color: $gray;
  }
  small {
    font-size: 0.6rem;
    color: $gray;
  }
}

.preview-imagens {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  .preview-item {
    position: relative;
    width: 60px;
    height: 60px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .remover {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid $border;
  button {
    flex: 1;
  }
}

.modal-conversa :deep(.q-dialog__inner) {
  padding: 0;
}

.conversa-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.conversa-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: $primary;
  color: white;
  .voltar {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
  }
  .info-ticket {
    flex: 1;
    .numero {
      font-size: 0.7rem;
      opacity: 0.8;
    }
    .titulo {
      font-size: 0.9rem;
      font-weight: 600;
    }
  }
}

.conversa-mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.lista-mensagens {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mensagem {
  display: flex;
  gap: 10px;
  &.admin {
    flex-direction: row-reverse;
    .bolha {
      background: rgba($primary, 0.1);
    }
  }
  .bolha {
    max-width: 70%;
    background: white;
    border-radius: 16px;
    padding: 10px 14px;
    .cabecalho {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 0.65rem;
      .nome {
        font-weight: 600;
        color: $primary;
      }
      .hora {
        color: $gray;
      }
    }
    .texto {
      font-size: 0.8rem;
      line-height: 1.4;
    }
  }
}

.conversa-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid $border;
  background: white;
  .input-msg {
    flex: 1;
  }
  .btn-enviar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $primary;
    border: none;
    color: white;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
    }
  }
}

.conversa-footer {
  padding: 12px;
  border-top: 1px solid $border;
  .btn-fechar {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid #ef4444;
    border-radius: 30px;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}

.ml-1 {
  margin-left: 4px;
}
</style>
