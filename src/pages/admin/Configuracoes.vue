<template>
  <q-page class="admin-configuracoes q-pa-md">
    <div class="text-h4 q-mb-md">Configurações do Sistema</div>

    <q-card>
      <q-tabs v-model="tab" class="text-primary">
        <q-tab name="geral" label="Geral" />
        <q-tab name="comissoes" label="Comissões" />
        <q-tab name="notificacoes" label="Notificações" />
        <q-tab name="integracao" label="Integração" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Geral -->
        <q-tab-panel name="geral">
          <div class="q-gutter-md">
            <q-input v-model="config.nome" label="Nome da plataforma" outlined />
            <q-input v-model="config.email" label="Email de contato" outlined type="email" />
            <q-input v-model="config.telefone" label="Telefone" outlined />
            <q-input v-model="config.endereco" label="Endereço" outlined type="textarea" autogrow />
          </div>
        </q-tab-panel>

        <!-- Comissões -->
        <q-tab-panel name="comissoes">
          <div class="q-gutter-md">
            <q-input v-model.number="config.comissaoPadrao" label="Comissão padrão (%)" type="number" outlined suffix="%" />
            <q-select
              v-model="config.tipoComissao"
              :options="['Porcentagem', 'Valor fixo']"
              label="Tipo de comissão"
              outlined
            />
            <q-checkbox v-model="config.comissaoPrestador" label="Aplicar comissão para prestadores" />
            <q-checkbox v-model="config.comissaoCliente" label="Aplicar taxa para clientes" />
          </div>
        </q-tab-panel>

        <!-- Notificações -->
        <q-tab-panel name="notificacoes">
          <div class="q-gutter-md">
            <q-checkbox v-model="config.notifEmail" label="Notificações por email" />
            <q-checkbox v-model="config.notifSMS" label="Notificações por SMS" />
            <q-checkbox v-model="config.notifPush" label="Notificações push" />
            <q-input v-model="config.emailNotificacao" label="Email para notificações" outlined type="email" />
          </div>
        </q-tab-panel>

        <!-- Integração -->
        <q-tab-panel name="integracao">
          <div class="q-gutter-md">
            <q-input v-model="config.apiMpesa" label="API Key M-Pesa" outlined type="password" />
            <q-input v-model="config.apiMaps" label="API Key Google Maps" outlined type="password" />
            <q-input v-model="config.apiSMS" label="API Key SMS" outlined type="password" />
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" />
        <q-btn unelevated label="Salvar configurações" color="primary" @click="salvarConfiguracoes" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'AdminConfiguracoes'
})

const $q = useQuasar()
const tab = ref('geral')

const config = ref({
  nome: 'EstouAqui',
  email: 'geral@estouaqui.co.mz',
  telefone: '+258 84 123 4567',
  endereco: 'Maputo, Moçambique',
  comissaoPadrao: 10,
  tipoComissao: 'Porcentagem',
  comissaoPrestador: true,
  comissaoCliente: false,
  notifEmail: true,
  notifSMS: false,
  notifPush: true,
  emailNotificacao: 'notificacoes@estouaqui.co.mz',
  apiMpesa: '********',
  apiMaps: '********',
  apiSMS: '********'
})

const salvarConfiguracoes = () => {
  $q.notify({
    type: 'positive',
    message: 'Configurações salvas com sucesso',
    position: 'top'
  })
}
</script>
