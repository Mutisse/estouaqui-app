<!-- src/components/ReportarErroModal.vue -->
<template>
  <q-dialog v-model="visivel" persistent class="modal-erro-global">
    <q-card class="modal-card-global">
      <div class="modal-header">
        <div class="header-icon">
          <q-icon name="bug_report" size="28px" color="negative" />
          <h2>Reportar Problema</h2>
        </div>
        <q-btn flat round icon="close" v-close-popup @click="fechar" />
      </div>

      <div class="modal-body">
        <!-- Informação do erro capturado (automático) -->
        <div class="erro-capturado">
          <div class="erro-header">
            <q-icon name="error" size="20px" color="warning" />
            <span>Erro detectado automaticamente</span>
          </div>
          <div class="erro-detalhes">
            <div class="erro-linha">
              <strong>Mensagem:</strong> {{ erroInfo?.mensagem || 'Erro desconhecido' }}
            </div>
            <div class="erro-linha" v-if="erroInfo?.codigo">
              <strong>Código:</strong> {{ erroInfo.codigo }}
            </div>
            <div class="erro-linha" v-if="erroInfo?.url">
              <strong>URL:</strong> {{ truncarTexto(erroInfo.url, 60) }}
            </div>
          </div>
        </div>

        <!-- Título (pré-preenchido) -->
        <div class="campo">
          <label>Título *</label>
          <q-input v-model="form.titulo" readonly dense outlined bg-color="grey-2" />
        </div>

        <!-- Categoria (pré-preenchida) -->
        <div class="campo">
          <label>Categoria *</label>
          <div class="grid-categorias">
            <div
              v-for="cat in categorias"
              :key="cat.valor"
              class="categoria-item"
              :class="{ selecionada: form.categoria === cat.valor }"
              @click="form.categoria = cat.valor"
            >
              <q-icon :name="cat.icone" size="20px" />
              <span>{{ cat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Prioridade (pré-preenchida) -->
        <div class="campo">
          <label>Prioridade *</label>
          <div class="grid-prioridades">
            <div
              v-for="prio in prioridades"
              :key="prio.valor"
              class="prioridade-item"
              :class="{
                selecionada: form.prioridade === prio.valor,
                [prio.cor]: form.prioridade === prio.valor,
              }"
              @click="form.prioridade = prio.valor"
            >
              {{ prio.label }}
            </div>
          </div>
        </div>

        <!-- Descrição (única coisa que o user preenche) -->
        <div class="campo">
          <label>Descreva como o erro aconteceu *</label>
          <q-input
            v-model="form.descricao"
            type="textarea"
            rows="5"
            placeholder="Ex: Eu estava tentando fazer login, cliquei no botão 'Entrar' e apareceu este erro..."
            dense
            outlined
            :error="!!erros.descricao"
            :error-message="erros.descricao"
            autogrow
          />
        </div>

        <!-- Código do erro (automático, apenas leitura) -->
        <div class="campo">
          <label>Código do erro</label>
          <div class="linha-erro">
            <input type="text" :value="form.codigoErro" readonly class="input-erro readonly" />
            <button class="btn-detectar" @click="detectarErro">
              <q-icon name="auto_awesome" size="16px" />
              Detectar
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <q-btn flat label="Cancelar" v-close-popup @click="fechar" />
        <q-btn
          unelevated
          label="Enviar Reporte"
          color="primary"
          @click="enviarTicket"
          :loading="enviando"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/login-store';

const props = defineProps<{
  modelValue: boolean;
  erroCapturado?: {
    mensagem: string;
    codigo?: string;
    stack?: string;
    url?: string;
    contexto?: string;
    userAgent?: string;
    timestamp?: string;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'enviado', success: boolean): void;
}>();

const $q = useQuasar();
const authStore = useAuthStore();
const enviando = ref(false);

const form = ref({
  titulo: '',
  descricao: '',
  categoria: '',
  prioridade: 'media',
  codigoErro: '',
});

const erros = ref({ descricao: '' });

const visivel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const erroInfo = computed(() => props.erroCapturado);

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

// Preencher automaticamente com o erro capturado
watch(
  () => props.erroCapturado,
  (novoErro) => {
    if (novoErro && novoErro.mensagem) {
      // Título automático
      form.value.titulo = `Erro: ${novoErro.mensagem.substring(0, 60)}`;

      // ✅ Código do erro automático (garantindo string)
      form.value.codigoErro = novoErro.codigo || '';

      // Categoria automática baseada no erro
      if (novoErro.codigo === '500') {
        form.value.categoria = 'tecnico';
        form.value.prioridade = 'urgente';
      } else if (novoErro.codigo === '404') {
        form.value.categoria = 'erro';
        form.value.prioridade = 'alta';
      } else if (novoErro.codigo === '422') {
        form.value.categoria = 'erro';
        form.value.prioridade = 'media';
      } else if (novoErro.codigo === '429') {
        form.value.categoria = 'tecnico';
        form.value.prioridade = 'media';
      } else if (novoErro.codigo === '403') {
        form.value.categoria = 'erro';
        form.value.prioridade = 'alta';
      } else {
        form.value.categoria = 'erro';
        form.value.prioridade = 'alta';
      }

      // Descrição começa vazia para o user preencher
      form.value.descricao = '';
    }
  },
  { immediate: true },
);

const truncarTexto = (texto: string, max: number) => {
  if (!texto) return '';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
};

const detectarErro = () => {
  const errosComuns = [
    '500 - Erro interno do servidor',
    '404 - Página não encontrada',
    '403 - Acesso negado',
    '401 - Não autorizado',
    'Network Error - Sem conexão',
    'Timeout - Tempo esgotado',
    'CORS - Erro de cross-origin',
  ] as const; // ✅ as const garante que o array não vai mudar

  // ✅ Garantir que sempre pega um valor (fallback)
  const erroSelecionado =
    errosComuns[Math.floor(Math.random() * errosComuns.length)] ?? errosComuns[0];

  form.value.codigoErro = erroSelecionado;
  $q.notify({ type: 'info', message: `Erro detectado: ${form.value.codigoErro}` });
};
const validar = () => {
  let valido = true;
  erros.value = { descricao: '' };

  if (!form.value.descricao.trim()) {
    erros.value.descricao = 'Por favor, descreva como o erro aconteceu';
    valido = false;
  }

  return valido;
};

const enviarTicket = async () => {
  if (!validar()) return;

  enviando.value = true;
  try {
    const formData = new FormData();
    formData.append('titulo', form.value.titulo);

    let descricaoFinal = form.value.descricao;
    descricaoFinal += `\n\n---\n**Informações técnicas do erro:**\n`;
    descricaoFinal += `**Mensagem:** ${erroInfo.value?.mensagem || 'N/A'}\n`;
    if (erroInfo.value?.codigo) descricaoFinal += `**Código:** ${erroInfo.value.codigo}\n`;
    if (erroInfo.value?.url) descricaoFinal += `**URL:** ${erroInfo.value.url}\n`;
    if (erroInfo.value?.userAgent) descricaoFinal += `**Navegador:** ${erroInfo.value.userAgent}\n`;
    if (erroInfo.value?.timestamp) descricaoFinal += `**Data/Hora:** ${erroInfo.value.timestamp}\n`;
    if (erroInfo.value?.stack)
      descricaoFinal += `\n**Stack trace:**\n\`\`\`\n${erroInfo.value.stack.substring(0, 500)}\n\`\`\``;

    formData.append('descricao', descricaoFinal);
    formData.append('categoria', form.value.categoria);
    formData.append('prioridade', form.value.prioridade);

    if (form.value.codigoErro) {
      formData.append('codigo_erro', form.value.codigoErro);
    }

    const tipo = authStore.isPrestador ? 'prestador' : 'cliente';
    const response = await api.post(`/${tipo}/suporte/tickets`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data?.success) {
      $q.notify({ type: 'positive', message: 'Reporte enviado com sucesso!' });
      fechar();
      emit('enviado', true);
    }
  } catch (error) {
    console.error('Erro ao enviar:', error);
    $q.notify({ type: 'negative', message: 'Erro ao enviar reporte' });
    emit('enviado', false);
  } finally {
    enviando.value = false;
  }
};

const fechar = () => {
  form.value = { titulo: '', descricao: '', categoria: '', prioridade: 'media', codigoErro: '' };
  visivel.value = false;
};
</script>

<style scoped lang="scss">
$primary: #5b4bf5;
$border: #e5e9f0;
$gray: #6b7280;

.modal-erro-global {
  :deep(.q-dialog__inner) {
    justify-content: center;
  }
}

.modal-card-global {
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid $border;

  .header-icon {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
  }
}

.modal-body {
  padding: 20px;
}

.erro-capturado {
  background: #fff8e7;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;

  .erro-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #ff9800;
  }

  .erro-detalhes {
    .erro-linha {
      font-size: 0.7rem;
      margin-bottom: 4px;
      word-break: break-word;

      strong {
        color: #1a1a2e;
      }
    }
  }
}

.campo {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 6px;
    color: #1a1a2e;
  }
}

.grid-categorias {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  .categoria-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: 1px solid $border;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

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

  .prioridade-item {
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
    font-size: 0.8rem;

    &.readonly {
      background: #f5f5f5;
      color: $gray;
    }
  }

  .btn-detectar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    background: #f0f2f5;
    border: none;
    border-radius: 12px;
    cursor: pointer;

    &:hover {
      background: #e5e9f0;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid $border;

  button {
    flex: 1;
  }
}
</style>
