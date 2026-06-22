<template>
  <div class="perfil-utilizador-page">
    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="isLoading" class="skeleton-container">
      <!-- Skeleton Header -->
      <div class="skeleton-card skeleton-header">
        <div class="skeleton-avatar-wrapper">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-status"></div>
        </div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-badge"></div>
          <div class="skeleton-line skeleton-sub"></div>
        </div>
      </div>

      <div class="skeleton-card skeleton-actions">
        <div class="skeleton-actions-grid">
          <div v-for="i in 5" :key="i" class="skeleton-btn"></div>
        </div>
      </div>

      <div class="skeleton-card skeleton-info">
        <div class="skeleton-card-header">
          <div class="skeleton-line skeleton-title"></div>
        </div>
        <div class="skeleton-info-grid">
          <div v-for="i in 6" :key="i" class="skeleton-info-item">
            <div class="skeleton-line skeleton-label"></div>
            <div class="skeleton-line skeleton-value"></div>
          </div>
        </div>
      </div>

      <div v-for="i in 4" :key="i" class="skeleton-card skeleton-section">
        <div class="skeleton-section-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-chevron"></div>
        </div>
      </div>
    </div>

    <!-- ===== CONTEÚDO ===== -->
    <div v-else-if="utilizador" class="perfil-content">
      <!-- ===== CARD DE CABEÇALHO ===== -->
      <div class="perfil-card header-card">
        <div class="perfil-avatar-wrapper">
          <q-avatar size="100px" class="perfil-avatar">
            <img :src="getAvatarUrl(utilizador.nome)" />
          </q-avatar>
          <div class="perfil-status">
            <q-badge :color="getStatusBadgeColor(utilizador.status)" class="status-badge">
              <q-icon :name="getStatusIcon(utilizador.status)" size="14px" />
              {{ getStatusLabel(utilizador.status) }}
            </q-badge>
          </div>
        </div>

        <div class="perfil-header-info">
          <div class="perfil-nome-wrapper">
            <h2 class="perfil-nome">{{ utilizador.nome }}</h2>
            <q-badge :color="getTipoColor(utilizador.tipo)" class="tipo-badge">
              <q-icon :name="getTipoIcon(utilizador.tipo)" size="14px" />
              {{ getTipoLabel(utilizador.tipo) }}
            </q-badge>
            <q-badge v-if="utilizador.verificado" color="green" class="verified-badge">
              <q-icon name="verified" size="14px" />
              Verificado
            </q-badge>
          </div>
          <div class="perfil-sub-info">
            <span class="perfil-profissao" v-if="utilizador.profissao">
              <q-icon name="work" size="16px" />
              {{ utilizador.profissao }}
            </span>
            <span class="perfil-data">
              <q-icon name="calendar_today" size="16px" />
              Registado em {{ formatarData(utilizador.created_at) }}
            </span>
            <span class="perfil-id">
              <q-icon name="fingerprint" size="16px" />
              ID: {{ utilizador.id }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== AÇÕES RÁPIDAS ===== -->
      <div class="actions-card">
        <div class="actions-grid">
          <q-btn
            v-if="!utilizador.verificado"
            unelevated
            color="primary"
            icon="verified"
            label="Verificar"
            @click="handleVerificar"
            class="action-btn btn-verificar"
          />

          <template v-if="utilizador.tipo === 'prestador'">
            <q-btn
              v-if="!utilizador.verificado"
              unelevated
              color="positive"
              icon="check_circle"
              label="Aprovar"
              @click="handleAprovar"
              class="action-btn btn-aprovar"
            />
            <q-btn
              v-if="utilizador.status === 'pendente'"
              unelevated
              color="negative"
              icon="cancel"
              label="Reprovar"
              @click="handleReprovar"
              class="action-btn btn-reprovar"
            />
          </template>

          <q-btn
            v-if="utilizador.status === 'desativado'"
            unelevated
            color="positive"
            icon="play_arrow"
            label="Ativar"
            @click="handleAtivar"
            class="action-btn btn-ativar"
          />
          <q-btn
            v-if="utilizador.status === 'ativo'"
            unelevated
            color="warning"
            icon="pause"
            label="Desativar"
            @click="handleDesativar"
            class="action-btn btn-desativar"
          />

          <q-btn
            v-if="utilizador.status === 'bloqueado'"
            unelevated
            color="positive"
            icon="lock_open"
            label="Desbloquear"
            @click="handleDesbloquear"
            class="action-btn btn-desbloquear"
          />
          <q-btn
            v-if="utilizador.status !== 'bloqueado' && utilizador.status !== 'desativado'"
            unelevated
            color="negative"
            icon="lock"
            label="Bloquear"
            @click="handleBloquear"
            class="action-btn btn-bloquear"
          />

          <q-btn
            unelevated
            color="negative"
            icon="delete"
            label="Excluir"
            @click="handleExcluir"
            class="action-btn btn-excluir"
          />
        </div>
      </div>

      <!-- ===== INFORMAÇÕES PESSOAIS ===== -->
      <div class="perfil-card info-card">
        <div class="card-header">
          <h3>📋 Informações Pessoais</h3>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">
              <q-icon name="person" size="18px" />
              Nome completo
            </label>
            <div class="info-value">{{ utilizador.nome }}</div>
          </div>

          <div class="info-item">
            <label class="info-label">
              <q-icon name="email" size="18px" />
              Email
            </label>
            <div class="info-value">{{ utilizador.email }}</div>
          </div>

          <div class="info-item">
            <label class="info-label">
              <q-icon name="phone" size="18px" />
              Telefone
            </label>
            <div class="info-value">{{ utilizador.telefone || 'Não informado' }}</div>
          </div>

          <div class="info-item">
            <label class="info-label">
              <q-icon name="badge" size="18px" />
              Tipo
            </label>
            <div class="info-value">
              <q-badge :color="getTipoColor(utilizador.tipo)">
                {{ getTipoLabel(utilizador.tipo) }}
              </q-badge>
            </div>
          </div>

          <div class="info-item" v-if="utilizador.profissao">
            <label class="info-label">
              <q-icon name="work" size="18px" />
              Profissão
            </label>
            <div class="info-value">{{ utilizador.profissao }}</div>
          </div>

          <div class="info-item full-width" v-if="utilizador.sobre">
            <label class="info-label">
              <q-icon name="description" size="18px" />
              Sobre
            </label>
            <div class="info-value texto">{{ utilizador.sobre }}</div>
          </div>
        </div>
      </div>

      <!-- ===== 1. STATUS E VERIFICAÇÃO ===== -->
      <div class="perfil-card expandable-section">
        <div class="section-header" @click="toggleSection('status')">
          <div class="section-title">
            <q-icon :name="sections.status ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            <h3>🔐 Status e Verificação</h3>
          </div>
          <div class="section-badge">
            <q-badge :color="getStatusBadgeColor(utilizador.status)" outline>
              {{ getStatusLabel(utilizador.status) }}
            </q-badge>
          </div>
        </div>

        <div v-show="sections.status" class="section-content">
          <div class="info-grid two-cols">
            <div class="info-item">
              <label class="info-label">
                <q-icon name="info" size="18px" />
                Status
              </label>
              <div class="info-value">
                <q-badge :color="getStatusBadgeColor(utilizador.status)">
                  <q-icon :name="getStatusIcon(utilizador.status)" size="14px" />
                  {{ getStatusLabel(utilizador.status) }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="verified" size="18px" />
                Verificação
              </label>
              <div class="info-value">
                <q-badge :color="utilizador.verificado ? 'green' : 'orange'">
                  <q-icon :name="utilizador.verificado ? 'verified' : 'pending'" size="14px" />
                  {{ utilizador.verificado ? 'Verificado' : 'Pendente' }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="check_circle" size="18px" />
                Disponível
              </label>
              <div class="info-value">
                <q-badge :color="utilizador.disponivel ? 'green' : 'red'">
                  {{ utilizador.disponivel ? 'Disponível' : 'Indisponível' }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="star" size="18px" />
                Avaliação
              </label>
              <div class="info-value">
                {{ (utilizador.media_avaliacao || 0).toFixed(1) }} ⭐
                <span class="text-caption">({{ utilizador.total_avaliacoes || 0 }} avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 2. LOCALIZAÇÃO ===== -->
      <div class="perfil-card expandable-section" v-if="utilizador.latitude || utilizador.longitude || utilizador.raio_atendimento">
        <div class="section-header" @click="toggleSection('localizacao')">
          <div class="section-title">
            <q-icon :name="sections.localizacao ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            <h3>📍 Localização</h3>
          </div>
        </div>

        <div v-show="sections.localizacao" class="section-content">
          <div class="info-grid two-cols">
            <div class="info-item" v-if="utilizador.latitude">
              <label class="info-label">
                <q-icon name="gps_fixed" size="18px" />
                Latitude
              </label>
              <div class="info-value">{{ utilizador.latitude }}</div>
            </div>

            <div class="info-item" v-if="utilizador.longitude">
              <label class="info-label">
                <q-icon name="gps_fixed" size="18px" />
                Longitude
              </label>
              <div class="info-value">{{ utilizador.longitude }}</div>
            </div>

            <div class="info-item" v-if="utilizador.raio_atendimento">
              <label class="info-label">
                <q-icon name="radio_button_checked" size="18px" />
                Raio de atendimento
              </label>
              <div class="info-value">{{ utilizador.raio_atendimento }} km</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 3. CATEGORIAS ===== -->
      <div class="perfil-card expandable-section" v-if="categorias.length > 0">
        <div class="section-header" @click="toggleSection('categorias')">
          <div class="section-title">
            <q-icon :name="sections.categorias ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            <h3>🏷️ Categorias</h3>
          </div>
          <div class="section-badge">
            <q-badge color="primary" outline>{{ categorias.length }}</q-badge>
          </div>
        </div>

        <div v-show="sections.categorias" class="section-content">
          <div class="categorias-list">
            <div
              v-for="cat in categorias"
              :key="cat.id"
              class="categoria-chip"
              :style="{ background: cat.cor ? cat.cor + '20' : '#5B4BF520', color: cat.cor || '#5B4BF5' }"
            >
              <q-icon :name="cat.icone || 'category'" size="16px" />
              {{ cat.nome }}
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 4. SERVIÇOS ===== -->
      <div class="perfil-card expandable-section" v-if="servicos.length > 0">
        <div class="section-header" @click="toggleSection('servicos')">
          <div class="section-title">
            <q-icon :name="sections.servicos ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            <h3>🛠️ Serviços Oferecidos</h3>
          </div>
          <div class="section-badge">
            <q-badge color="primary" outline>{{ servicos.length }}</q-badge>
          </div>
        </div>

        <div v-show="sections.servicos" class="section-content">
          <div class="servicos-list">
            <div
              v-for="servico in servicos"
              :key="servico.id"
              class="servico-item"
            >
              <div class="servico-icon">
                <q-icon name="handyman" size="20px" color="primary" />
              </div>
              <div class="servico-info">
                <div class="servico-nome">{{ servico.nome }}</div>
                <div class="servico-desc" v-if="servico.descricao">{{ servico.descricao }}</div>
              </div>
              <div class="servico-detalhes">
                <div class="servico-preco">{{ formatarPreco(servico.preco) }}</div>
                <div class="servico-duracao">{{ servico.duracao }} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 5. CONFIGURAÇÕES ===== -->
      <div class="perfil-card expandable-section" v-if="configuracoes">
        <div class="section-header" @click="toggleSection('configuracoes')">
          <div class="section-title">
            <q-icon :name="sections.configuracoes ? 'expand_less' : 'expand_more'" size="20px" class="section-icon" />
            <h3>⚙️ Configurações</h3>
          </div>
        </div>

        <div v-show="sections.configuracoes" class="section-content">
          <div class="info-grid two-cols">
            <div class="info-item">
              <label class="info-label">
                <q-icon name="notifications" size="18px" />
                Notificações Email
              </label>
              <div class="info-value">
                <q-badge :color="configuracoes.notificacoes_email ? 'green' : 'red'">
                  {{ configuracoes.notificacoes_email ? 'Ativo' : 'Inativo' }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="notifications_active" size="18px" />
                Notificações Push
              </label>
              <div class="info-value">
                <q-badge :color="configuracoes.notificacoes_push ? 'green' : 'red'">
                  {{ configuracoes.notificacoes_push ? 'Ativo' : 'Inativo' }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="language" size="18px" />
                Idioma
              </label>
              <div class="info-value">
                <q-badge color="primary">
                  {{ configuracoes.idioma?.toUpperCase() || 'PT' }}
                </q-badge>
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <q-icon name="palette" size="18px" />
                Tema
              </label>
              <div class="info-value">
                <q-badge color="primary">
                  {{ configuracoes.tema || 'System' }}
                </q-badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== BOTÃO VOLTAR ===== -->
      <div class="back-section">
        <q-btn flat icon="arrow_back" label="Voltar para lista" @click="router.back()" />
      </div>
    </div>

    <!-- ===== ERRO ===== -->
    <div v-else class="error-state">
      <q-icon name="error" size="64px" color="negative" />
      <h3>Utilizador não encontrado</h3>
      <q-btn flat label="Voltar para lista" @click="router.back()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAdminUtilizadoresStore } from 'src/stores/admin/admin-utilizadores-store';
import type { Utilizador } from 'src/stores/admin/admin-utilizadores-store';

defineOptions({ name: 'PerfilUtilizador' });

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const store = useAdminUtilizadoresStore();

const isLoading = ref(false);
const utilizador = ref<Utilizador | null>(null);

// ===================== SEÇÕES EXPANSÍVEIS =====================
const sections = ref({
  status: false,
  localizacao: false,
  categorias: false,
  servicos: false,
  configuracoes: false,
});

const toggleSection = (section: keyof typeof sections.value): void => {
  sections.value[section] = !sections.value[section];
};

// ===================== COMPUTEDS =====================

const categorias = computed(() => {
  return utilizador.value?.categorias || [];
});

const servicos = computed(() => {
  return utilizador.value?.servicos || [];
});

const configuracoes = computed(() => {
  return utilizador.value?.configuracoes || null;
});

// ===================== FUNÇÕES AUXILIARES =====================

const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'purple';
    case 'admin': return 'red';
    case 'root': return 'dark';
    default: return 'blue';
  }
};

const getTipoLabel = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'Prestador';
    case 'admin': return 'Administrador';
    case 'root': return 'Root';
    default: return 'Cliente';
  }
};

const getTipoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'prestador': return 'handyman';
    case 'admin': return 'admin_panel_settings';
    case 'root': return 'verified';
    default: return 'person';
  }
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    bloqueado: 'Bloqueado',
    desativado: 'Desativado',
    reprovado: 'Reprovado',
  };
  return map[status] || status;
};

const getStatusIcon = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'check_circle',
    pendente: 'pending',
    bloqueado: 'lock',
    desativado: 'pause',
    reprovado: 'cancel',
  };
  return map[status] || 'info';
};

const getStatusBadgeColor = (status: string): string => {
  const map: Record<string, string> = {
    ativo: 'positive',
    pendente: 'warning',
    bloqueado: 'negative',
    desativado: 'grey',
    reprovado: 'negative',
  };
  return map[status] || 'info';
};

const getAvatarUrl = (nome: string): string =>
  `https://ui-avatars.com/api/?background=667EEA&color=fff&bold=true&size=120&name=${encodeURIComponent(nome)}`;

const formatarData = (dataString?: string): string => {
  if (!dataString) return '—';
  const date = new Date(dataString);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatarPreco = (preco: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(preco);
};

// ===================== CARREGAR DADOS =====================

const carregarPerfil = async (): Promise<void> => {
  const id = route.params.id;
  if (!id) {
    $q.notify({ type: 'warning', message: 'ID do utilizador não encontrado' });
    router.back();
    return;
  }

  isLoading.value = true;
  try {
    const data = await store.buscarUtilizador(Number(id));
    if (data) {
      utilizador.value = data;
      console.log('📊 Dados do utilizador:', data);
    } else {
      $q.notify({ type: 'negative', message: 'Utilizador não encontrado' });
      router.back();
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar perfil' });
    router.back();
  } finally {
    isLoading.value = false;
  }
};

// ===================== AÇÕES DE STATUS =====================

const handleVerificar = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Verificar Utilizador',
    message: `Deseja verificar o utilizador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Verificar', color: 'primary', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.verificarUtilizador(utilizador.value!.id);
      if (success) {
        await carregarPerfil();
        $q.notify({ type: 'positive', message: '✅ Utilizador verificado!', position: 'top' });
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao verificar', position: 'top' });
      }
    })();
  });
};

const handleAprovar = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Aprovar Prestador',
    message: `Deseja aprovar o prestador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.aprovarUtilizador(utilizador.value!.id);
      if (success) {
        await carregarPerfil();
        $q.notify({ type: 'positive', message: '✅ Prestador aprovado!', position: 'top' });
      }
    })();
  });
};

const handleReprovar = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Reprovar Prestador',
    message: `Deseja reprovar o prestador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Reprovar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.reprovarUtilizador(utilizador.value!.id);
      if (success) {
        await carregarPerfil();
        $q.notify({ type: 'negative', message: '❌ Prestador reprovado!', position: 'top' });
      }
    })();
  });
};

const handleAtivar = (): void => {
  if (!utilizador.value) return;
  void (async () => {
    const success = await store.ativarUtilizador(utilizador.value!.id);
    if (success) {
      await carregarPerfil();
      $q.notify({ type: 'positive', message: `✅ ${utilizador.value!.nome} ativado!`, position: 'top' });
    }
  })();
};

const handleDesativar = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Desativar Utilizador',
    message: `Deseja desativar o utilizador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Desativar', color: 'warning', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.desativarUtilizador(utilizador.value!.id);
      if (success) {
        await carregarPerfil();
        $q.notify({ type: 'warning', message: `⚫ ${utilizador.value!.nome} desativado!`, position: 'top' });
      }
    })();
  });
};

const handleBloquear = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Bloquear Utilizador',
    message: `Deseja bloquear o utilizador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Bloquear', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.bloquearUtilizador(utilizador.value!.id);
      if (success) {
        await carregarPerfil();
        $q.notify({ type: 'negative', message: `🔴 ${utilizador.value!.nome} bloqueado!`, position: 'top' });
      }
    })();
  });
};

const handleDesbloquear = (): void => {
  if (!utilizador.value) return;
  void (async () => {
    const success = await store.desbloquearUtilizador(utilizador.value!.id);
    if (success) {
      await carregarPerfil();
      $q.notify({ type: 'positive', message: `✅ ${utilizador.value!.nome} desbloqueado!`, position: 'top' });
    }
  })();
};

const handleExcluir = (): void => {
  if (!utilizador.value) return;
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o utilizador "${utilizador.value.nome}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      const success = await store.removerUtilizador(utilizador.value!.id);
      if (success) {
        $q.notify({ type: 'positive', message: '🗑️ Utilizador excluído!', position: 'top' });
        router.back();
      }
    })();
  });
};

// ===================== LIFECYCLE =====================

onMounted(() => {
  void carregarPerfil();
});
</script>

<style scoped lang="scss">
// ===================== VARIABLES =====================
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.08);
$accent-hover: #4A3DD4;
$green: #10B981;
$green-light: rgba(16, 185, 129, 0.1);
$gold: #F59E0B;
$gold-light: rgba(245, 158, 11, 0.1);
$red: #EF4444;
$red-light: rgba(239, 68, 68, 0.1);
$ink: #0A0A0F;
$ink-2: #3D3D4E;
$muted: #9898A8;
$gray: #6B7280;
$gray-light: #F3F4F6;
$line: rgba(0, 0, 0, 0.06);
$surface: #FFFFFF;
$bg: #F4F4F8;
$radius: 16px;
$radius-sm: 10px;
$radius-xs: 8px;
$shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.1);

// ===== SKELETON =====
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-container {
  max-width: 900px;
  margin: 0 auto;
}

.skeleton-card {
  background: $surface;
  border-radius: $radius;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: $shadow;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 24px;

  .skeleton-avatar-wrapper {
    flex-shrink: 0;
    position: relative;

    .skeleton-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 30px;
      height: 16px;
      border-radius: 20px;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
  }

  .skeleton-info {
    flex: 1;

    .skeleton-line {
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 10px;
    }

    .skeleton-name { width: 60%; height: 28px; border-radius: 14px; }
    .skeleton-badge { width: 40%; height: 24px; border-radius: 12px; }
    .skeleton-sub { width: 70%; height: 16px; }
  }
}

.skeleton-actions .skeleton-actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .skeleton-btn {
    width: 120px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}

.skeleton-info .skeleton-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid $line;

  .skeleton-title { width: 30%; height: 20px; }
}

.skeleton-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;

  .skeleton-info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .skeleton-label { width: 40%; height: 12px; }
    .skeleton-value { width: 70%; height: 18px; }
  }
}

.skeleton-section .skeleton-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;

  .skeleton-title { width: 40%; height: 20px; }
  .skeleton-chevron {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}

// ===== CONTEÚDO PRINCIPAL =====
.perfil-utilizador-page {
  padding: 20px;
  background: $bg;
  min-height: 100vh;
}

.perfil-content {
  max-width: 900px;
  margin: 0 auto;
}

// ===== PERFIL CARD =====
.perfil-card {
  background: $surface;
  border-radius: $radius;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: $shadow;
  border: 1px solid $line;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: $shadow-hover;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid $line;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $ink;
    }

    .badge-count {
      font-size: 12px;
      color: $gray;
      background: $gray-light;
      padding: 2px 12px;
      border-radius: 20px;
    }
  }
}

// ===== HEADER CARD =====
.header-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 24px;

  .perfil-avatar-wrapper {
    flex-shrink: 0;
    position: relative;

    .perfil-avatar {
      border: 3px solid $accent;
      box-shadow: 0 4px 16px rgba($accent, 0.3);
    }

    .perfil-status {
      position: absolute;
      bottom: -4px;
      right: -4px;

      .status-badge {
        padding: 4px 10px;
        font-size: 11px;
        border-radius: 20px;
      }
    }
  }

  .perfil-header-info {
    flex: 1;

    .perfil-nome-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .perfil-nome {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: $ink;
      }

      .tipo-badge {
        padding: 4px 12px;
        font-size: 12px;
        border-radius: 20px;
      }

      .verified-badge {
        padding: 4px 12px;
        font-size: 12px;
        border-radius: 20px;
        background: $green;
        color: white;
      }
    }

    .perfil-sub-info {
      display: flex;
      gap: 20px;
      margin-top: 8px;
      color: $gray;
      font-size: 14px;
      flex-wrap: wrap;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        .q-icon {
          color: $muted;
          font-size: 16px;
        }
      }
    }
  }
}

// ===== AÇÕES RÁPIDAS =====
.actions-card {
  background: $surface;
  border-radius: $radius;
  padding: 16px 24px;
  margin-bottom: 20px;
  box-shadow: $shadow;
  border: 1px solid $line;

  .actions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;

    .action-btn {
      min-width: 120px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: none;
      font-size: 13px;
      padding: 8px 16px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.btn-verificar { background: $accent; color: white; }
      &.btn-aprovar { background: $green; color: white; }
      &.btn-reprovar { background: $red; color: white; }
      &.btn-ativar { background: $green; color: white; }
      &.btn-desativar { background: $gold; color: white; }
      &.btn-bloquear { background: $red; color: white; }
      &.btn-desbloquear { background: $green; color: white; }
      &.btn-excluir { background: $red; color: white; }
    }
  }
}

// ===== INFO CARD =====
.info-card .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;

  &.two-cols {
    grid-template-columns: 1fr 1fr;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &.full-width { grid-column: 1 / -1; }

    .info-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      .q-icon {
        font-size: 18px;
        color: $accent;
      }
    }

    .info-value {
      font-size: 15px;
      color: $ink;
      padding: 4px 0;

      &.texto {
        line-height: 1.6;
        white-space: pre-wrap;
        background: $gray-light;
        padding: 12px 16px;
        border-radius: $radius-xs;
      }
    }
  }
}

// ===== INFO GRID 2 COLUNAS - CORRIGIDO =====
.info-grid.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    background: $bg;
    border-radius: $radius-xs;
    border: 1px solid $line;
    transition: all 0.25s ease;

    &:hover {
      border-color: $accent;
      background: $accent-light;
      transform: translateY(-1px);
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 600;
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.6px;

      .q-icon {
        font-size: 14px;
        color: $accent;
      }
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: $ink;
      padding: 2px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .q-badge {
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 500;

        .q-icon {
          font-size: 13px;
        }
      }

      .text-caption {
        font-size: 11px;
        color: $gray;
        font-weight: 400;
      }

      .text-grey-6 {
        color: $gray;
      }
    }
  }
}

// ===== SEÇÕES EXPANSÍVEIS =====
.expandable-section {
  padding: 0;
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: $accent-light;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;

      .section-icon {
        color: $accent;
        transition: transform 0.3s;
        font-size: 20px;
      }

      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: $ink;
      }
    }

    .section-badge {
      display: flex;
      align-items: center;
    }
  }

  .section-content {
    padding: 0 24px 24px;
    border-top: 1px solid $line;
    animation: slideDown 0.3s ease;
  }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

// ===== CATEGORIAS =====
.categorias-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 4px;

  .categoria-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

// ===== SERVIÇOS =====
.servicos-list {
  padding-top: 4px;

  .servico-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid $line;
    transition: background 0.2s;

    &:hover {
      background: $accent-light;
      padding-left: 8px;
      padding-right: 8px;
      border-radius: $radius-xs;
    }

    &:last-child { border-bottom: none; }

    .servico-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba($accent, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        background: $accent;
        color: white;
      }
    }

    .servico-info {
      flex: 1;

      .servico-nome {
        font-weight: 600;
        color: $ink;
        margin-bottom: 2px;
      }

      .servico-desc {
        font-size: 13px;
        color: $gray;
      }
    }

    .servico-detalhes {
      text-align: right;
      flex-shrink: 0;

      .servico-preco {
        font-weight: 700;
        color: $accent;
        font-size: 16px;
      }

      .servico-duracao {
        font-size: 12px;
        color: $gray;
      }
    }
  }
}

// ===== BACK SECTION =====
.back-section {
  text-align: center;
  margin-top: 16px;
  padding: 16px;

  .q-btn {
    color: $gray;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      color: $accent;
      background: $accent-light;
    }
  }
}

// ===== ERROR STATE =====
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: $surface;
  border-radius: $radius;
  box-shadow: $shadow;

  h3 {
    margin: 16px 0 20px;
    color: $ink;
  }

  .q-icon {
    color: $red;
  }
}

// ===== RESPONSIVIDADE =====
@media (max-width: 768px) {
  .header-card {
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;

    .perfil-avatar-wrapper {
      margin-bottom: 8px;
    }

    .perfil-header-info {
      .perfil-nome-wrapper {
        justify-content: center;
      }

      .perfil-sub-info {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }

  .info-card .info-grid,
  .info-grid.two-cols {
    grid-template-columns: 1fr;
  }

  .actions-card {
    .actions-grid {
      justify-content: center;

      .action-btn {
        min-width: 100px;
        flex: 1 1 auto;
        font-size: 12px;
        padding: 8px 12px;
      }
    }
  }

  .servico-item {
    flex-wrap: wrap;

    .servico-detalhes {
      width: 100%;
      text-align: left;
      padding-left: 60px;
    }
  }

  .expandable-section {
    .section-header {
      padding: 14px 16px;

      .section-title h3 {
        font-size: 14px;
      }
    }

    .section-content {
      padding: 0 16px 16px;
    }
  }

  .skeleton-header {
    flex-direction: column;
    text-align: center;

    .skeleton-info .skeleton-name,
    .skeleton-info .skeleton-badge,
    .skeleton-info .skeleton-sub {
      margin-left: auto;
      margin-right: auto;
    }
  }

  .skeleton-info .skeleton-info-grid,
  .skeleton-status .skeleton-status-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-actions .skeleton-actions-grid {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .perfil-utilizador-page {
    padding: 12px;
  }

  .perfil-card {
    padding: 16px;
  }

  .header-card {
    padding: 16px;

    .perfil-avatar-wrapper .perfil-avatar {
      width: 80px;
      height: 80px;
    }

    .perfil-header-info .perfil-nome-wrapper .perfil-nome {
      font-size: 20px;
    }
  }

  .actions-card {
    padding: 12px;

    .actions-grid {
      .action-btn {
        min-width: 80px;
        font-size: 11px;
        padding: 6px 10px;

        .q-icon {
          font-size: 16px !important;
        }
      }
    }
  }

  .info-card .info-grid .info-item .info-value {
    font-size: 14px;
  }

  .info-grid.two-cols .info-item {
    padding: 10px 12px;
  }

  .servicos-list .servico-item {
    padding: 10px 0;

    .servico-info .servico-nome {
      font-size: 14px;
    }

    .servico-detalhes .servico-preco {
      font-size: 14px;
    }
  }

  .categorias-list .categoria-chip {
    font-size: 12px;
    padding: 6px 12px;
  }
}

// ===== SCROLLBAR =====
.servicos-list::-webkit-scrollbar,
.skeleton-container::-webkit-scrollbar {
  width: 6px;
}

.servicos-list::-webkit-scrollbar-track,
.skeleton-container::-webkit-scrollbar-track {
  background: $gray-light;
  border-radius: 10px;
}

.servicos-list::-webkit-scrollbar-thumb,
.skeleton-container::-webkit-scrollbar-thumb {
  background: $accent;
  border-radius: 10px;
}

.servicos-list::-webkit-scrollbar-thumb:hover,
.skeleton-container::-webkit-scrollbar-thumb:hover {
  background: $accent-hover;
}
</style>
