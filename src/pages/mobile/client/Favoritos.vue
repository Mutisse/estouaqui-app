<template>
  <q-page class="favoritos-page bg-grey-1">
    <!-- Cabeçalho -->
    <div class="page-header q-pa-md">
      <div class="text-h5 text-bold">Meus Favoritos</div>
    </div>

    <!-- Lista de favoritos -->
    <div class="q-pa-md">
      <div v-if="favoritos.length === 0" class="empty-state">
        <q-icon name="favorite_border" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">Nenhum favorito</div>
        <div class="text-grey-6 q-mb-md">Adicione prestadores aos favoritos para vê-los aqui</div>
        <q-btn color="primary" label="Explorar serviços" to="/mobile/lista-prestadores" />
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="item in favoritos" :key="item.id" class="col-12">
          <q-card class="favorito-card" flat bordered>
            <q-card-section class="row items-center">
              <q-avatar size="60px" class="q-mr-sm">
                <img :src="item.avatar" />
              </q-avatar>
              <div class="col">
                <div class="favorito-nome">{{ item.nome }}</div>
                <div class="favorito-categoria">{{ item.categoria }}</div>
                <div class="favorito-rating">
                  <q-rating v-model="item.rating" size="14px" :max="5" color="yellow" readonly />
                  <span class="rating-count">({{ item.avaliacoes }})</span>
                </div>
              </div>
              <div>
                <q-btn flat round icon="more_vert">
                  <q-menu>
                    <q-list style="min-width: 150px">
                      <q-item clickable v-close-popup @click="removerFavorito(item)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Remover</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat dense icon="chat" label="Chat" @click="abrirChat(item)" />
              <q-btn flat dense icon="calendar_month" label="Agendar" @click="agendar" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'MobileFavoritos'
})

// Interface para tipagem dos favoritos
interface Favorito {
  id: number
  nome: string
  avatar: string
  categoria: string
  rating: number
  avaliacoes: number
  preco: number
}

const router = useRouter()
const $q = useQuasar()

// Dados mockados com tipagem correta
const favoritos = ref<Favorito[]>([
  {
    id: 1,
    nome: 'João Silva',
    avatar: 'https://cdn.quasar.dev/img/avatar.png',
    categoria: 'Eletricista',
    rating: 4.9,
    avaliacoes: 87,
    preco: 1500
  },
  {
    id: 2,
    nome: 'Maria Santos',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    categoria: 'Limpeza',
    rating: 4.8,
    avaliacoes: 92,
    preco: 1200
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    categoria: 'Canalizador',
    rating: 4.9,
    avaliacoes: 76,
    preco: 1800
  }
])

// Funções com tipagem correta
const removerFavorito = (item: Favorito) => {
  $q.dialog({
    title: 'Remover favorito',
    message: `Deseja remover ${item.nome} dos favoritos?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    favoritos.value = favoritos.value.filter(f => f.id !== item.id)
    $q.notify({
      type: 'positive',
      message: 'Removido dos favoritos',
      position: 'top'
    })
  })
}

const abrirChat = (item: Favorito) => {
  void router.push(`/mobile/chat/${item.id}`)
}

const agendar = () => {
  $q.notify({
    type: 'info',
    message: 'Agendamento em breve',
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

.favoritos-page {
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid $gray-200;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.favorito-card {
  border-radius: 12px;
  margin-bottom: 12px;

  .favorito-nome {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-800;
  }

  .favorito-categoria {
    font-size: 0.85rem;
    color: $gray-600;
  }

  .favorito-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;

    .rating-count {
      font-size: 0.7rem;
      color: $gray-500;
    }
  }
}
</style>
