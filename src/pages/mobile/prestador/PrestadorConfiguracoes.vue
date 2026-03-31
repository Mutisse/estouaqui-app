<template>
  <q-page class="prestador-configuracoes bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Configurações</div>
      <q-btn flat round icon="more_vert" @click="opcoes" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <div class="text-grey-6 q-mt-md">Carregando configurações...</div>
    </div>

    <template v-else>
      <!-- Lista de configurações -->
      <q-list bordered separator class="config-list q-ma-md">
        <!-- Notificações -->
        <q-item-label header class="config-header">Notificações</q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="notifications" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Notificações push</q-item-label>
            <q-item-label caption>Receber alertas de novos pedidos</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.notificacoesPush" color="primary" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="sms" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Notificações por SMS</q-item-label>
            <q-item-label caption>Receber alertas via mensagem</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.notificacoesSMS" color="primary" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="email" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Notificações por email</q-item-label>
            <q-item-label caption>Receber resumos semanais</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.notificacoesEmail" color="primary" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <!-- Disponibilidade -->
        <q-item-label header class="config-header">Disponibilidade</q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="schedule" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Aceitar pedidos automaticamente</q-item-label>
            <q-item-label caption>Novos pedidos são aceitos automaticamente</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.aceitarAutomatico" color="secondary" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="do_not_disturb" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Modo não perturbe</q-item-label>
            <q-item-label caption>Não receber novos pedidos</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.modoNaoPerturbe" color="secondary" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <!-- Privacidade -->
        <q-item-label header class="config-header">Privacidade</q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="public" color="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Perfil público</q-item-label>
            <q-item-label caption>Aparecer nas buscas de clientes</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.perfilPublico" color="info" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="location_on" color="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mostrar localização exata</q-item-label>
            <q-item-label caption>Apenas após aceitar pedido</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.mostrarLocalizacao" color="info" @update:model-value="configuracaoAlterada" />
          </q-item-section>
        </q-item>

        <!-- Pagamentos -->
        <q-item-label header class="config-header">Pagamentos</q-item-label>

        <q-item clickable v-ripple @click="configurarMPesa">
          <q-item-section avatar>
            <q-icon name="phone_android" color="positive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>M-Pesa</q-item-label>
            <q-item-label caption>Configurar número para saques</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge v-if="config.mpesaConfigurado" color="positive">Configurado</q-badge>
            <q-badge v-else color="grey">Não configurado</q-badge>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="configurarConta">
          <q-item-section avatar>
            <q-icon name="account_balance" color="positive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Conta bancária</q-item-label>
            <q-item-label caption>Dados para transferência</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge v-if="config.contaConfigurada" color="positive">Configurado</q-badge>
            <q-badge v-else color="grey">Não configurado</q-badge>
          </q-item-section>
        </q-item>

        <!-- Idioma -->
        <q-item-label header class="config-header">Idioma</q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="language" color="warning" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Idioma do app</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="config.idioma"
              :options="idiomas"
              dense
              borderless
              options-dense
              emit-value
              map-options
              @update:model-value="configuracaoAlterada"
            />
          </q-item-section>
        </q-item>

        <!-- Sobre -->
        <q-item-label header class="config-header">Sobre</q-item-label>

        <q-item clickable v-ripple @click="termosUso">
          <q-item-section avatar>
            <q-icon name="description" color="grey-7" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Termos de Uso</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="politicaPrivacidade">
          <q-item-section avatar>
            <q-icon name="privacy_tip" color="grey-7" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Política de Privacidade</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="versao">
          <q-item-section avatar>
            <q-icon name="info" color="grey-7" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Versão do app</q-item-label>
            <q-item-label caption>1.0.0</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Botão salvar -->
      <div class="q-pa-md">
        <q-btn
          unelevated
          color="primary"
          label="Salvar configurações"
          class="full-width"
          size="lg"
          @click="salvarConfiguracoes"
          :loading="salvando"
          no-caps
        />
      </div>
    </template>

    <!-- Dialog para configuração de M-Pesa -->
    <q-dialog v-model="showMpesaDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Configurar M-Pesa</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="mpesaNumero"
            label="Número do M-Pesa"
            prefix="+258"
            mask="## ### ####"
            unmasked-value
            outlined
            dense
            :rules="[(val) => !!val || 'Número é obrigatório']"
          />
          <q-input
            v-model="mpesaNome"
            label="Nome do titular"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarMpesa"
            :loading="salvandoMpesa"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para configuração de Conta Bancária -->
    <q-dialog v-model="showContaDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Configurar Conta Bancária</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="contaBanco"
            label="Banco"
            outlined
            dense
            :rules="[(val) => !!val || 'Banco é obrigatório']"
          />
          <q-input
            v-model="contaNumero"
            label="Número da conta"
            outlined
            dense
            :rules="[(val) => !!val || 'Número da conta é obrigatório']"
          />
          <q-input
            v-model="contaTitular"
            label="Nome do titular"
            outlined
            dense
            :rules="[(val) => !!val || 'Nome do titular é obrigatório']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar"
            color="primary"
            @click="salvarConta"
            :loading="salvandoConta"
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
import { usePrestadorStore } from 'src/stores/prestador-store';
import { api } from 'src/boot/axios';
import type { ConfiguracoesDisponibilidade } from 'src/stores/prestador-store';

defineOptions({
  name: 'PrestadorConfiguracoes'
});

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

// Estados
const loading = ref(true);
const salvando = ref(false);
const salvandoMpesa = ref(false);
const salvandoConta = ref(false);
const showMpesaDialog = ref(false);
const showContaDialog = ref(false);
const configuracaoModificada = ref(false);

// Campos M-Pesa
const mpesaNumero = ref('');
const mpesaNome = ref('');

// Campos conta bancária
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');

// Configurações
const config = ref({
  notificacoesPush: true,
  notificacoesSMS: false,
  notificacoesEmail: true,
  aceitarAutomatico: false,
  modoNaoPerturbe: false,
  perfilPublico: true,
  mostrarLocalizacao: true,
  mpesaConfigurado: false,
  contaConfigurada: false,
  idioma: 'pt'
});

const idiomas = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' }
];

// Computed para verificar se há alterações
const hasChanges = computed(() => configuracaoModificada.value);

// Função para marcar que houve alteração
const configuracaoAlterada = () => {
  configuracaoModificada.value = true;
};

// Carregar configurações do usuário
const carregarConfiguracoes = async () => {
  loading.value = true;
  try {
    // Buscar preferências do usuário
    const response = await api.get('/preferences');
    if (response.data.success && response.data.data) {
      const prefs = response.data.data;

      config.value = {
        notificacoesPush: prefs.notificacoes_push ?? true,
        notificacoesSMS: prefs.notificacoes_sms ?? false,
        notificacoesEmail: prefs.notificacoes_email ?? true,
        aceitarAutomatico: prefs.aceitar_automatico ?? false,
        modoNaoPerturbe: prefs.modo_nao_perturbe ?? false,
        perfilPublico: prefs.perfil_publico ?? true,
        mostrarLocalizacao: prefs.mostrar_localizacao ?? true,
        mpesaConfigurado: prefs.mpesa_configurado ?? false,
        contaConfigurada: prefs.conta_configurada ?? false,
        idioma: prefs.idioma ?? 'pt'
      };
    }

    // Buscar disponibilidade do prestador
    await prestadorStore.fetchDisponibilidade();
    if (prestadorStore.disponibilidade) {
      config.value.aceitarAutomatico = prestadorStore.disponibilidade.configuracoes?.aceitar_agendamento_automatico ?? false;
    }

  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  } finally {
    loading.value = false;
  }
};

// Salvar configurações
const salvarConfiguracoes = async () => {
  if (!hasChanges.value) {
    $q.notify({
      type: 'info',
      message: 'Nenhuma alteração para salvar',
      position: 'top'
    });
    return;
  }

  salvando.value = true;
  try {
    // Salvar preferências
    await api.put('/preferences', {
      notificacoes_push: config.value.notificacoesPush,
      notificacoes_sms: config.value.notificacoesSMS,
      notificacoes_email: config.value.notificacoesEmail,
      aceitar_automatico: config.value.aceitarAutomatico,
      modo_nao_perturbe: config.value.modoNaoPerturbe,
      perfil_publico: config.value.perfilPublico,
      mostrar_localizacao: config.value.mostrarLocalizacao,
      idioma: config.value.idioma
    });

    // Salvar disponibilidade - criar objeto completo com valores padrão
    const configuracoesAtuais = prestadorStore.disponibilidade?.configuracoes;
    const configuracoesCompletas: ConfiguracoesDisponibilidade = {
      tempo_minimo_agendamento: configuracoesAtuais?.tempo_minimo_agendamento ?? 60,
      tempo_entre_servicos: configuracoesAtuais?.tempo_entre_servicos ?? 15,
      notificar_antes: configuracoesAtuais?.notificar_antes ?? 30,
      aceitar_agendamento_automatico: config.value.aceitarAutomatico,
      dias_antecedencia: configuracoesAtuais?.dias_antecedencia ?? 30
    };

    await prestadorStore.updateDisponibilidade({
      configuracoes: configuracoesCompletas
    });

    configuracaoModificada.value = false;

    $q.notify({
      type: 'positive',
      message: 'Configurações salvas com sucesso!',
      position: 'top'
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar configurações',
      position: 'top'
    });
  } finally {
    salvando.value = false;
  }
};

// Configurar M-Pesa
const configurarMPesa = () => {
  // Carregar dados existentes
  mpesaNumero.value = '';
  mpesaNome.value = '';
  showMpesaDialog.value = true;
};

const salvarMpesa = async () => {
  if (!mpesaNumero.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha o número do M-Pesa',
      position: 'top'
    });
    return;
  }

  salvandoMpesa.value = true;
  try {
    // Salvar dados do M-Pesa
    await api.put('/preferences', {
      mpesa_numero: mpesaNumero.value,
      mpesa_nome: mpesaNome.value,
      mpesa_configurado: true
    });

    config.value.mpesaConfigurado = true;
    configuracaoModificada.value = true;
    showMpesaDialog.value = false;

    $q.notify({
      type: 'positive',
      message: 'M-Pesa configurado com sucesso!',
      position: 'top'
    });
  } catch (error) {
    console.error('Erro ao salvar M-Pesa:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao configurar M-Pesa',
      position: 'top'
    });
  } finally {
    salvandoMpesa.value = false;
  }
};

// Configurar Conta Bancária
const configurarConta = () => {
  contaBanco.value = '';
  contaNumero.value = '';
  contaTitular.value = '';
  showContaDialog.value = true;
};

const salvarConta = async () => {
  if (!contaBanco.value || !contaNumero.value || !contaTitular.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top'
    });
    return;
  }

  salvandoConta.value = true;
  try {
    // Salvar dados da conta bancária
    await api.put('/preferences', {
      conta_banco: contaBanco.value,
      conta_numero: contaNumero.value,
      conta_titular: contaTitular.value,
      conta_configurada: true
    });

    config.value.contaConfigurada = true;
    configuracaoModificada.value = true;
    showContaDialog.value = false;

    $q.notify({
      type: 'positive',
      message: 'Conta bancária configurada com sucesso!',
      position: 'top'
    });
  } catch (error) {
    console.error('Erro ao salvar conta:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao configurar conta',
      position: 'top'
    });
  } finally {
    salvandoConta.value = false;
  }
};

// Ações
const opcoes = () => {
  $q.notify({
    type: 'info',
    message: 'Opções em breve',
    position: 'top'
  });
};

const termosUso = () => {
  $q.notify({
    type: 'info',
    message: 'Termos de Uso em breve',
    position: 'top'
  });
};

const politicaPrivacidade = () => {
  $q.notify({
    type: 'info',
    message: 'Política de Privacidade em breve',
    position: 'top'
  });
};

const versao = () => {
  $q.notify({
    type: 'info',
    message: 'Versão 1.0.0',
    position: 'top'
  });
};

// Inicialização
onMounted(async () => {
  await carregarConfiguracoes();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
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

.prestador-configuracoes {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid $gray-200;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.config-list {
  border-radius: 16px;
  overflow: hidden;
}

.config-header {
  background: $gray-100;
  color: $gray-700;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}
</style>
