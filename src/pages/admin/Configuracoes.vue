<template>
  <q-page class="admin-configuracoes q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="settings" size="32px" class="q-mr-sm" />
          Configurações do Sistema
        </div>
        <div class="page-subtitle">Gerencie as configurações da plataforma</div>
      </div>
      <q-btn
        label="Atualizar"
        icon="refresh"
        color="grey-7"
        outline
        @click="carregarConfiguracoes"
        :loading="adminStore.loading"
      />
    </div>

    <q-card class="config-card">
      <q-tabs v-model="tab" class="config-tabs" dense>
        <q-tab name="geral" label="Geral" icon="info" />
        <q-tab name="comissoes" label="Comissões" icon="percent" />
        <q-tab name="notificacoes" label="Notificações" icon="notifications" />
        <q-tab name="integracao" label="Integração" icon="api" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Geral -->
        <q-tab-panel name="geral" class="q-pa-lg">
          <div class="q-gutter-md">
            <q-input
              v-model="configForm.nome"
              label="Nome da plataforma"
              outlined
              dense
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="configForm.email"
              label="Email de contato"
              outlined
              dense
              type="email"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="configForm.telefone"
              label="Telefone"
              outlined
              dense
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="phone" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="configForm.endereco"
              label="Endereço"
              outlined
              dense
              type="textarea"
              autogrow
              rows="2"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="primary" />
              </template>
            </q-input>
          </div>
        </q-tab-panel>

        <!-- Comissões -->
        <q-tab-panel name="comissoes" class="q-pa-lg">
          <div class="q-gutter-md">
            <q-input
              v-model.number="configForm.comissao_padrao"
              label="Comissão padrão"
              type="number"
              outlined
              dense
              suffix="%"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="percent" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="info" size="16px" color="grey">
                  <q-tooltip>Valor percentual cobrado sobre cada serviço</q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <q-select
              v-model="configForm.tipo_comissao"
              :options="tipoComissaoOptions"
              label="Tipo de comissão"
              outlined
              dense
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>

            <q-checkbox
              v-model="configForm.comissao_prestador"
              label="Aplicar comissão para prestadores"
              :loading="salvando"
            />

            <q-checkbox
              v-model="configForm.comissao_cliente"
              label="Aplicar taxa para clientes"
              :loading="salvando"
            />
          </div>
        </q-tab-panel>

        <!-- Notificações -->
        <q-tab-panel name="notificacoes" class="q-pa-lg">
          <div class="q-gutter-md">
            <div class="text-subtitle1 q-mb-sm">
              <q-icon name="notifications_active" size="18px" class="q-mr-sm" />
              Canais de Notificação
            </div>

            <q-checkbox
              v-model="configForm.notif_email"
              label="Notificações por email"
              :loading="salvando"
            />
            <q-checkbox
              v-model="configForm.notif_sms"
              label="Notificações por SMS"
              :loading="salvando"
            />
            <q-checkbox
              v-model="configForm.notif_push"
              label="Notificações push"
              :loading="salvando"
            />

            <q-input
              v-model="configForm.email_notificacao"
              label="Email para notificações"
              outlined
              dense
              type="email"
              class="q-mt-md"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="mail" color="primary" />
              </template>
            </q-input>
          </div>
        </q-tab-panel>

        <!-- Integração -->
        <q-tab-panel name="integracao" class="q-pa-lg">
          <div class="q-gutter-md">
            <div class="text-subtitle1 q-mb-sm">
              <q-icon name="security" size="18px" class="q-mr-sm" />
              Chaves de API
            </div>

            <q-input
              v-model="configForm.api_mpesa"
              label="API Key M-Pesa"
              outlined
              dense
              type="password"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="smartphone" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="visibility"
                  class="cursor-pointer"
                  @click="toggleVisibility('mpesa')"
                />
              </template>
            </q-input>

            <q-input
              v-model="configForm.api_maps"
              label="API Key Google Maps"
              outlined
              dense
              type="password"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="map" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="visibility"
                  class="cursor-pointer"
                  @click="toggleVisibility('maps')"
                />
              </template>
            </q-input>

            <q-input
              v-model="configForm.api_sms"
              label="API Key SMS"
              outlined
              dense
              type="password"
              :loading="salvando"
            >
              <template v-slot:prepend>
                <q-icon name="sms" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="visibility"
                  class="cursor-pointer"
                  @click="toggleVisibility('sms')"
                />
              </template>
            </q-input>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="resetarFormulario" />
        <q-btn
          unelevated
          label="Salvar configurações"
          color="primary"
          @click="salvarConfiguracoes"
          :loading="salvando"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'
import type { ConfiguracoesData } from 'src/stores/admin-store'

defineOptions({
  name: 'AdminConfiguracoes'
})

const $q = useQuasar()
const adminStore = useAdminStore()

// Estados
const tab = ref('geral')
const salvando = ref(false)
const showMpesa = ref(false)
const showMaps = ref(false)
const showSms = ref(false)

// Tipos de comissão
const tipoComissaoOptions = ['Porcentagem', 'Valor fixo']

// Formulário de configurações (estendido com campos extras)
const configForm = reactive({
  // Campos base do store
  nome: '',
  email: '',
  telefone: '',
  endereco: '',
  comissao_padrao: 0,
  tipo_comissao: '',

  // Campos extras
  comissao_prestador: true,
  comissao_cliente: false,
  notif_email: true,
  notif_sms: false,
  notif_push: true,
  email_notificacao: '',
  api_mpesa: '',
  api_maps: '',
  api_sms: ''
})

// Funções auxiliares
const toggleVisibility = (key: string) => {
  if (key === 'mpesa') showMpesa.value = !showMpesa.value
  if (key === 'maps') showMaps.value = !showMaps.value
  if (key === 'sms') showSms.value = !showSms.value
}

// Carregar configurações
const carregarConfiguracoes = async () => {
  try {
    const data = await adminStore.fetchConfiguracoes()
    if (data) {
      configForm.nome = data.nome || ''
      configForm.email = data.email || ''
      configForm.telefone = data.telefone || ''
      configForm.endereco = data.endereco || ''
      configForm.comissao_padrao = data.comissao_padrao || 0
      configForm.tipo_comissao = data.tipo_comissao || 'Porcentagem'

      // Carregar dados extras do localStorage (ou API)
      carregarConfiguracoesExtras()
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar configurações',
      position: 'top'
    })
  }
}

// Carregar configurações extras (mock - substituir por API real)
const carregarConfiguracoesExtras = () => {
  // Valores padrão
  configForm.comissao_prestador = true
  configForm.comissao_cliente = false
  configForm.notif_email = true
  configForm.notif_sms = false
  configForm.notif_push = true
  configForm.email_notificacao = 'notificacoes@estouaqui.co.mz'
  configForm.api_mpesa = '********'
  configForm.api_maps = '********'
  configForm.api_sms = '********'
}

// Resetar formulário
const resetarFormulario = () => {
  void carregarConfiguracoes()
  $q.notify({
    type: 'info',
    message: 'Alterações canceladas',
    position: 'top'
  })
}

// Salvar configurações
const salvarConfiguracoes = async () => {
  salvando.value = true

  try {
    // Dados principais a serem salvos no store
    const dadosPrincipais: Partial<ConfiguracoesData> = {
      nome: configForm.nome,
      email: configForm.email,
      telefone: configForm.telefone,
      endereco: configForm.endereco,
      comissao_padrao: configForm.comissao_padrao,
      tipo_comissao: configForm.tipo_comissao
    }

    const result = await adminStore.updateConfiguracoes(dadosPrincipais)

    if (result) {
      // Salvar dados extras (mock - substituir por chamada API real)
      salvarConfiguracoesExtras()

      $q.notify({
        type: 'positive',
        message: 'Configurações salvas com sucesso!',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar configurações',
      position: 'top'
    })
  } finally {
    salvando.value = false
  }
}

// Salvar configurações extras (mock - substituir por API real)
const salvarConfiguracoesExtras = () => {
  console.log('Configurações extras salvas:', {
    comissao_prestador: configForm.comissao_prestador,
    comissao_cliente: configForm.comissao_cliente,
    notif_email: configForm.notif_email,
    notif_sms: configForm.notif_sms,
    notif_push: configForm.notif_push,
    email_notificacao: configForm.email_notificacao
  })
}

// Carregar dados ao montar
onMounted(() => {
  void carregarConfiguracoes()
})
</script>

<style scoped lang="scss">
.admin-configuracoes {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .page-title-section {
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 4px;
    }
  }
}

.config-card {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .config-tabs {
    background: #f8f9fa;

    :deep(.q-tab) {
      font-size: 0.9rem;
      padding: 12px 24px;

      &.q-tab--active {
        color: #1976d2;

        .q-tab__indicator {
          background-color: #1976d2;
        }
      }
    }
  }

  :deep(.q-tab-panels) {
    background: white;
  }

  :deep(.q-tab-panel) {
    padding: 24px;
  }

  :deep(.q-field) {
    margin-bottom: 16px;
  }

  :deep(.q-checkbox) {
    margin: 8px 0;
  }
}

// Responsivo
@media (max-width: 768px) {
  .admin-configuracoes {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-card {
    .config-tabs :deep(.q-tab) {
      padding: 8px 12px;
      font-size: 0.8rem;
    }

    :deep(.q-tab-panel) {
      padding: 16px;
    }
  }
}
</style>
