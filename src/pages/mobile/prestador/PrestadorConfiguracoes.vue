<template>
  <q-page class="prestador-configuracoes bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="text-h5 text-bold">Configurações</div>
      <q-btn flat round icon="more_vert" @click="opcoes" />
    </div>

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
          <q-toggle v-model="config.notificacoesPush" color="primary" />
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
          <q-toggle v-model="config.notificacoesSMS" color="primary" />
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
          <q-toggle v-model="config.notificacoesEmail" color="primary" />
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
          <q-toggle v-model="config.aceitarAutomatico" color="secondary" />
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
          <q-toggle v-model="config.modoNaoPerturbe" color="secondary" />
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
          <q-toggle v-model="config.perfilPublico" color="info" />
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
          <q-toggle v-model="config.mostrarLocalizacao" color="info" />
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
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'PrestadorConfiguracoes'
})

const router = useRouter()
const $q = useQuasar()

const config = ref({
  notificacoesPush: true,
  notificacoesSMS: false,
  notificacoesEmail: true,
  aceitarAutomatico: false,
  modoNaoPerturbe: false,
  perfilPublico: true,
  mostrarLocalizacao: true,
  mpesaConfigurado: true,
  contaConfigurada: false,
  idioma: 'pt'
})

const idiomas = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' }
]

const opcoes = () => {
  $q.notify({
    type: 'info',
    message: 'Opções em breve',
    position: 'top'
  })
}

const configurarMPesa = () => {
  $q.notify({
    type: 'info',
    message: 'Configuração do M-Pesa em breve',
    position: 'top'
  })
}

const configurarConta = () => {
  $q.notify({
    type: 'info',
    message: 'Configuração de conta bancária em breve',
    position: 'top'
  })
}

const termosUso = () => {
  $q.notify({
    type: 'info',
    message: 'Termos de Uso em breve',
    position: 'top'
  })
}

const politicaPrivacidade = () => {
  $q.notify({
    type: 'info',
    message: 'Política de Privacidade em breve',
    position: 'top'
  })
}

const versao = () => {
  $q.notify({
    type: 'info',
    message: 'Versão 1.0.0',
    position: 'top'
  })
}

const salvarConfiguracoes = () => {
  $q.notify({
    type: 'positive',
    message: 'Configurações salvas com sucesso!',
    position: 'top'
  })
}
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
