<template>
  <q-page class="admin-perfil q-pa-md">
    <div class="page-header">
      <div class="page-title-section">
        <div class="page-title">
          <q-icon name="account_circle" size="32px" class="q-mr-sm" />
          Meu Perfil
        </div>
        <div class="page-subtitle">Gerencie suas informações pessoais</div>
      </div>
      <q-btn
        label="Atualizar"
        icon="refresh"
        color="grey-7"
        outline
        @click="carregarPerfil"
        :loading="carregando"
      />
    </div>

    <q-card class="perfil-card">
      <q-card-section>
        <div class="row items-center">
          <q-avatar size="100px" class="avatar-container">
            <img :src="authStore.userFoto || 'https://cdn.quasar.dev/img/avatar.png'" />
            <div class="avatar-edit" @click="editarFoto">
              <q-icon name="edit" size="16px" color="white" />
            </div>
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h5">{{ authStore.userNome || 'Administrador' }}</div>
            <div class="text-grey-7">{{ authStore.user?.email }}</div>
            <q-badge :color="getTipoColor(authStore.user?.tipo)" class="q-mt-sm">
              <q-icon :name="getTipoIcon(authStore.user?.tipo)" size="12px" class="q-mr-xs" />
              {{ getTipoLabel(authStore.user?.tipo) }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6 q-mb-md">Informações Pessoais</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="perfil.nome"
              label="Nome completo"
              outlined
              dense
              :loading="salvandoPerfil"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="perfil.email"
              label="Email"
              outlined
              dense
              type="email"
              :loading="salvandoPerfil"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="perfil.telefone"
              label="Telefone"
              outlined
              dense
              :loading="salvandoPerfil"
            >
              <template v-slot:prepend>
                <q-icon name="phone" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="perfil.cargo"
              label="Cargo"
              outlined
              dense
              readonly
              disable
            >
              <template v-slot:prepend>
                <q-icon name="work" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="lock" size="16px" color="grey" />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-input
              v-model="perfil.bio"
              label="Bio"
              outlined
              dense
              type="textarea"
              autogrow
              rows="3"
              :loading="salvandoPerfil"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="resetarFormulario" />
        <q-btn
          unelevated
          label="Salvar alterações"
          color="primary"
          @click="salvarPerfil"
          :loading="salvandoPerfil"
        />
      </q-card-actions>
    </q-card>

    <q-card class="senha-card q-mt-md">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="lock" size="20px" class="q-mr-sm" />
          Alterar palavra-passe
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="senha.atual"
          label="Palavra-passe atual"
          outlined
          dense
          type="password"
          :loading="alterandoSenha"
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="secondary" />
          </template>
        </q-input>

        <q-input
          v-model="senha.nova"
          label="Nova palavra-passe"
          outlined
          dense
          type="password"
          class="q-mt-md"
          :loading="alterandoSenha"
        >
          <template v-slot:prepend>
            <q-icon name="vpn_key" color="secondary" />
          </template>
        </q-input>

        <q-input
          v-model="senha.confirmar"
          label="Confirmar nova palavra-passe"
          outlined
          dense
          type="password"
          class="q-mt-md"
          :loading="alterandoSenha"
        >
          <template v-slot:prepend>
            <q-icon name="verified" color="secondary" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="senha.nova && senha.confirmar"
              :name="senha.nova === senha.confirmar ? 'check_circle' : 'error'"
              :color="senha.nova === senha.confirmar ? 'positive' : 'negative'"
              size="20px"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          unelevated
          label="Alterar palavra-passe"
          color="secondary"
          @click="alterarSenha"
          :loading="alterandoSenha"
        />
      </q-card-actions>
    </q-card>

    <!-- Dialog para editar foto -->
    <q-dialog v-model="mostrarDialogFoto" persistent>
      <q-card style="min-width: 400px" class="foto-dialog">
        <q-card-section class="dialog-header bg-primary text-white">
          <div class="text-h6">
            <q-icon name="photo_camera" class="q-mr-sm" />
            Editar Foto de Perfil
          </div>
          <q-btn flat round dense icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md text-center">
          <q-avatar size="150px" class="q-mb-md">
            <img :src="novaFotoPreview || authStore.userFoto || 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>

          <q-file
            v-model="novaFoto"
            label="Selecionar imagem"
            accept="image/*"
            outlined
            dense
            @update:model-value="previewFoto"
          >
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
          </q-file>
          <div class="text-caption text-grey q-mt-sm">Formatos aceitos: JPG, PNG. Máx 2MB</div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Salvar" color="primary" @click="salvarFoto" :loading="salvandoFoto" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'

defineOptions({
  name: 'AdminPerfil'
})

const $q = useQuasar()
const authStore = useAuthStore()

// Estados
const carregando = ref(false)
const salvandoPerfil = ref(false)
const alterandoSenha = ref(false)
const salvandoFoto = ref(false)
const mostrarDialogFoto = ref(false)
const novaFoto = ref<File | null>(null)
const novaFotoPreview = ref<string | null>(null)

// Formulário de perfil
const perfil = reactive({
  nome: '',
  email: '',
  telefone: '',
  cargo: 'Administrador do Sistema',
  bio: 'Responsável pela gestão da plataforma EstouAqui.'
})

// Formulário de senha
const senha = reactive({
  atual: '',
  nova: '',
  confirmar: ''
})

// Funções auxiliares
const getTipoLabel = (tipo?: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    prestador: 'Prestador',
    cliente: 'Cliente'
  }
  return labels[tipo || ''] || 'Usuário'
}

const getTipoColor = (tipo?: string) => {
  const colors: Record<string, string> = {
    admin: 'primary',
    prestador: 'secondary',
    cliente: 'info'
  }
  return colors[tipo || ''] || 'grey'
}

const getTipoIcon = (tipo?: string) => {
  const icons: Record<string, string> = {
    admin: 'admin_panel_settings',
    prestador: 'handyman',
    cliente: 'person'
  }
  return icons[tipo || ''] || 'person'
}

// Carregar dados do usuário
const carregarPerfil = async () => {
  carregando.value = true
  try {
    await authStore.verifyToken()
    if (authStore.user) {
      perfil.nome = authStore.user.nome || ''
      perfil.email = authStore.user.email || ''
      perfil.telefone = authStore.user.telefone || ''
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perfil',
      position: 'top'
    })
  } finally {
    carregando.value = false
  }
}

// Resetar formulário
const resetarFormulario = () => {
  if (authStore.user) {
    perfil.nome = authStore.user.nome || ''
    perfil.email = authStore.user.email || ''
    perfil.telefone = authStore.user.telefone || ''
  }
  $q.notify({
    type: 'info',
    message: 'Alterações canceladas',
    position: 'top'
  })
}

// Salvar perfil
const salvarPerfil = async () => {
  if (!perfil.nome || !perfil.email) {
    $q.notify({
      type: 'warning',
      message: 'Nome e email são obrigatórios',
      position: 'top'
    })
    return
  }

  salvandoPerfil.value = true
  try {
    // TODO: Implementar endpoint de atualização de perfil
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
      position: 'top'
    })
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar perfil',
      position: 'top'
    })
  } finally {
    salvandoPerfil.value = false
  }
}

// Editar foto
const editarFoto = () => {
  novaFoto.value = null
  novaFotoPreview.value = null
  mostrarDialogFoto.value = true
}

// Preview da foto
const previewFoto = (file: File | null) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      novaFotoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    novaFotoPreview.value = null
  }
}

// Salvar foto
const salvarFoto = async () => {
  if (!novaFoto.value) {
    mostrarDialogFoto.value = false
    return
  }

  salvandoFoto.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', novaFoto.value)

    // TODO: Implementar endpoint de upload de foto
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Foto atualizada com sucesso!',
      position: 'top'
    })
    mostrarDialogFoto.value = false
    await carregarPerfil()
  } catch (error) {
    console.error('Erro ao salvar foto:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar foto',
      position: 'top'
    })
  } finally {
    salvandoFoto.value = false
  }
}

// Alterar senha
const alterarSenha = async () => {
  if (!senha.atual || !senha.nova || !senha.confirmar) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top'
    })
    return
  }

  if (senha.nova !== senha.confirmar) {
    $q.notify({
      type: 'warning',
      message: 'As palavras-passe não coincidem',
      position: 'top'
    })
    return
  }

  if (senha.nova.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'A nova palavra-passe deve ter no mínimo 6 caracteres',
      position: 'top'
    })
    return
  }

  alterandoSenha.value = true
  try {
    // TODO: Implementar endpoint de alteração de senha
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Palavra-passe alterada com sucesso!',
      position: 'top'
    })

    senha.atual = ''
    senha.nova = ''
    senha.confirmar = ''
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao alterar palavra-passe',
      position: 'top'
    })
  } finally {
    alterandoSenha.value = false
  }
}

// Observar mudanças na senha para validação em tempo real
watch([() => senha.nova, () => senha.confirmar], () => {
  // Validação em tempo real (apenas para UI)
})

// Carregar dados ao montar
onMounted(() => {
  void carregarPerfil() // ✅ CORREÇÃO: adicionado 'void'
})
</script>

<style scoped lang="scss">
.admin-perfil {
  max-width: 900px;
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

.perfil-card,
.senha-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 20px;
  }
}

.avatar-container {
  position: relative;
  cursor: pointer;

  .avatar-edit {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
  }

  &:hover .avatar-edit {
    opacity: 1;
  }
}

.foto-dialog {
  border-radius: 16px;
  overflow: hidden;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
  }

  .dialog-actions {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
  }
}

@media (max-width: 768px) {
  .admin-perfil {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .foto-dialog {
    min-width: 90vw;
    max-width: 90vw;
  }
}
</style>
