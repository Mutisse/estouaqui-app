<template>
  <q-page class="admin-perfil q-pa-md">
    <div class="text-h4 q-mb-md">Meu Perfil</div>

    <q-card>
      <q-card-section>
        <div class="row items-center">
          <q-avatar size="100px">
            <img src="https://cdn.quasar.dev/img/avatar.png" />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h5">Administrador</div>
            <div class="text-grey-7">admin@estouaqui.co.mz</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="perfil.nome" label="Nome completo" outlined />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="perfil.email" label="Email" outlined type="email" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="perfil.telefone" label="Telefone" outlined />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="perfil.cargo" label="Cargo" outlined />
          </div>
          <div class="col-12">
            <q-input v-model="perfil.bio" label="Bio" outlined type="textarea" autogrow />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" />
        <q-btn unelevated label="Salvar alterações" color="primary" @click="salvarPerfil" />
      </q-card-actions>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Alterar palavra-passe</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="senha.atual" label="Palavra-passe atual" outlined type="password" />
        <q-input v-model="senha.nova" label="Nova palavra-passe" outlined type="password" class="q-mt-md" />
        <q-input v-model="senha.confirmar" label="Confirmar nova palavra-passe" outlined type="password" class="q-mt-md" />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn unelevated label="Alterar palavra-passe" color="secondary" @click="alterarSenha" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'AdminPerfil'
})

const $q = useQuasar()

const perfil = ref({
  nome: 'Administrador',
  email: 'admin@estouaqui.co.mz',
  telefone: '+258 84 000 0000',
  cargo: 'Administrador do Sistema',
  bio: 'Responsável pela gestão da plataforma EstouAqui.'
})

const senha = ref({
  atual: '',
  nova: '',
  confirmar: ''
})

const salvarPerfil = () => {
  $q.notify({
    type: 'positive',
    message: 'Perfil atualizado com sucesso',
    position: 'top'
  })
}

const alterarSenha = () => {
  if (!senha.value.atual || !senha.value.nova || !senha.value.confirmar) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos',
      position: 'top'
    })
    return
  }

  if (senha.value.nova !== senha.value.confirmar) {
    $q.notify({
      type: 'warning',
      message: 'As palavras-passe não coincidem',
      position: 'top'
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Palavra-passe alterada com sucesso',
    position: 'top'
  })

  senha.value = { atual: '', nova: '', confirmar: '' }
}
</script>
