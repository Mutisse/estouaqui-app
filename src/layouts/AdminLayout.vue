<template>
  <div class="admin-shell">
    <!-- Botão para abrir sidebar em mobile -->
    <div class="mobile-menu-btn" @click="sidebarAberta = !sidebarAberta">
      <i class="material-icons">menu</i>
    </div>

    <!-- Overlay para fechar sidebar em mobile -->
    <div class="sidebar-overlay" :class="{ active: sidebarAberta }" @click="sidebarAberta = false"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ mobile: sidebarAberta }">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="brand-icon">EA</div>
          <div>
            <div class="brand-name">EstouAqui</div>
            <div class="brand-tag">{{ isRoot ? 'Root Admin' : 'Gestor' }}</div>
          </div>
        </div>
        <div class="sidebar-close" @click="sidebarAberta = false">
          <i class="material-icons">close</i>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- PRINCIPAL (NEGÓCIO) -->
        <div class="nav-section">
          <div class="nav-section-label">Principal</div>

          <router-link to="/admin/dashboard" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">dashboard</i>
            <span>Dashboard</span>
          </router-link>

          <router-link to="/admin/pedidos" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">receipt_long</i>
            <span>Pedidos</span>
            <span v-if="pedidosPendentes > 0" class="nav-badge">{{ pedidosPendentes }}</span>
          </router-link>

          <router-link to="/admin/prestadores" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">handyman</i>
            <span>Prestadores</span>
            <span v-if="pendentesVerificacao > 0" class="nav-badge">{{ pendentesVerificacao }}</span>
          </router-link>

          <router-link to="/admin/utilizadores" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">group</i>
            <span>Clientes</span>
          </router-link>

          <router-link to="/admin/servicos" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">miscellaneous_services</i>
            <span>Serviços</span>
          </router-link>
        </div>

        <!-- GESTÃO (NEGÓCIO) -->
        <div class="nav-section">
          <div class="nav-section-label">Gestão</div>

          <router-link to="/admin/categorias" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">category</i>
            <span>Categorias</span>
          </router-link>

          <router-link to="/admin/promocoes" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">local_offer</i>
            <span>Promoções</span>
          </router-link>

          <router-link to="/admin/avaliacoes" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">star_outline</i>
            <span>Avaliações</span>
            <span v-if="avaliacoesPendentes > 0" class="nav-badge">{{ avaliacoesPendentes }}</span>
          </router-link>

          <router-link to="/admin/financeiro" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">money</i>
            <span>Financeiro</span>
          </router-link>

          <router-link to="/admin/relatorios" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">bar_chart</i>
            <span>Relatórios</span>
          </router-link>

          <router-link to="/admin/estatisticas" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">pie_chart</i>
            <span>Estatísticas</span>
          </router-link>
        </div>

        <!-- SUPORTE (NEGÓCIO) -->
        <div class="nav-section">
          <div class="nav-section-label">Suporte</div>

          <router-link to="/admin/suporte" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">support_agent</i>
            <span>Tickets</span>
            <span v-if="ticketsAbertos > 0" class="nav-badge">{{ ticketsAbertos }}</span>
          </router-link>

          <router-link to="/admin/notificacoes" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">notifications_none</i>
            <span>Notificações</span>
          </router-link>
        </div>

        <!-- SISTEMA (APENAS ROOT) -->
        <div v-if="isRoot" class="nav-section">
          <div class="nav-section-label">Sistema</div>

          <router-link to="/admin/configuracoes" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">settings</i>
            <span>Configurações</span>
          </router-link>

          <router-link to="/admin/permissoes" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">security</i>
            <span>Permissões</span>
          </router-link>

          <router-link to="/admin/backups" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">backup</i>
            <span>Backups</span>
          </router-link>

          <router-link to="/admin/logs" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">history</i>
            <span>Logs do Sistema</span>
          </router-link>

          <router-link to="/admin/monitoring" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">monitor_heart</i>
            <span>Monitoramento</span>
            <span v-if="alertasAtivos > 0" class="nav-badge warning">{{ alertasAtivos }}</span>
          </router-link>

          <router-link to="/admin/performance" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">speed</i>
            <span>Performance</span>
          </router-link>
        </div>

        <!-- PERFIL (AMBOS) -->
        <div class="nav-section">
          <div class="nav-section-label">Conta</div>

          <router-link to="/admin/perfil" class="nav-item" active-class="active" @click="sidebarAberta = false">
            <i class="material-icons nav-icon">person</i>
            <span>Meu Perfil</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-pill">
          <div v-if="fotoPerfil" class="admin-avatar-img">
            <img :src="fotoPerfil" :alt="adminNome" />
          </div>
          <div v-else class="admin-av">{{ adminInitials }}</div>
          <div>
            <div class="admin-name">{{ adminNome }}</div>
            <div class="admin-role">{{ adminRole }}</div>
          </div>
          <q-btn flat round dense icon="logout" size="sm" class="logout-btn" @click="sair">
            <q-tooltip>Sair</q-tooltip>
          </q-btn>
        </div>
      </div>
    </aside>

    <!-- CONTEÚDO DIREITO -->
    <div class="content-area">
      <header class="topbar">
        <div class="topbar-left">
          <div class="topbar-title">{{ tituloPagina }}</div>
          <div class="topbar-sub">Bem-vindo de volta, {{ adminNome }} · {{ dataHoje }}</div>
        </div>
        <div class="topbar-right">
          <div class="tb-search" @click="focarBusca">
            <i class="material-icons" style="font-size: 16px;">search</i>
            <span>Pesquisar...</span>
            <span class="tb-shortcut">⌘K</span>
          </div>

          <!-- DROPDOWN DE NOTIFICAÇÕES COM EFEITO DE ROTAÇÃO -->
          <q-btn-dropdown
            flat
            round
            class="tb-btn notification-dropdown"
            :class="{ 'has-notification': notificacoesNaoLidas > 0, 'dropdown-open': dropdownAberto }"
            no-caps
            @before-show="dropdownAberto = true"
            @before-hide="dropdownAberto = false"
          >
            <template v-slot:label>
              <i
                class="material-icons notification-icon-animated"
                :class="{ 'icon-rotated': dropdownAberto }"
                style="font-size: 20px;"
              >
                {{ notificacoesNaoLidas > 0 ? 'notifications_active' : 'notifications_none' }}
              </i>
              <span v-if="notificacoesNaoLidas > 0" class="notification-badge">{{ notificacoesNaoLidas }}</span>
            </template>

            <div class="notification-dropdown-content">
              <div class="notification-header">
                <span class="title">Notificações</span>
                <button class="mark-all" @click="marcarTodasComoLidas" v-if="notificacoesNaoLidas > 0">
                  Marcar todas como lidas
                </button>
              </div>

              <div class="notification-list" v-if="notificacoes.length > 0">
                <div
                  v-for="notif in notificacoes.slice(0, 10)"
                  :key="notif.id"
                  class="notification-item"
                  :class="{ unread: notif.lida === 0 || notif.lida === false }"
                  @click="irParaNotificacao(notif)"
                >
                  <div class="notification-icon" :class="getNotificationIconClass(notif.tipo)">
                    <i class="material-icons" style="font-size: 20px;">{{ getNotificationIcon(notif.tipo) }}</i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notif.titulo }}</div>
                    <div class="notification-message">{{ truncarTexto(notif.mensagem, 60) }}</div>
                    <div class="notification-time">{{ formatarDataRelativa(notif.created_at) }}</div>
                  </div>
                  <div v-if="notif.lida === 0 || notif.lida === false" class="notification-unread-dot"></div>
                </div>
              </div>

              <div v-else class="notification-empty">
                <i class="material-icons" style="font-size: 40px; color: grey;">notifications_off</i>
                <p>Nenhuma notificação</p>
              </div>

              <div class="notification-footer" v-if="notificacoes.length > 5">
                <button class="view-all" @click="irPara('/admin/notificacoes')">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          </q-btn-dropdown>

          <q-btn
            flat
            round
            class="tb-btn"
            @click="atualizarDados"
            :loading="adminStore.isLoading"
            aria-label="Atualizar"
          >
            <i class="material-icons" style="font-size: 20px;">refresh</i>
            <q-tooltip>Atualizar dados</q-tooltip>
          </q-btn>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/login-store';
import { useAdminStore } from 'src/stores/admin/admin-store';
import { useAdminPerfilStore } from 'src/stores/admin/admin-perfil-store';
import { useQuasar } from 'quasar';

// Interface para notificação
interface Notificacao {
  id: number;
  user_id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean | number;
  data?: {
    pedido_id?: number;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

defineOptions({ name: 'AdminLayout' });

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const adminStore = useAdminStore();
const perfilStore = useAdminPerfilStore(); // ✅ Adicionar store de perfil
const $q = useQuasar();

// ==================== RESPONSIVIDADE =====================
const sidebarAberta = ref(false);
const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    sidebarAberta.value = false;
  }
};

window.addEventListener('resize', handleResize);

// ===================== ESTADO DO DROPDOWN =====================
const dropdownAberto = ref(false);

// ===================== FOTO DO PERFIL =====================
const fotoTimestamp = ref(Date.now());

// ✅ CORRIGIDO: Buscar foto do perfilStore (mais atualizado)
const fotoPerfil = computed(() => {
  const foto = perfilStore.perfil?.foto || authStore.user?.foto;
  if (foto && foto !== 'null' && foto !== '') {
    // Se já tem URL completa
    if (foto.startsWith('http')) {
      return `${foto}${foto.includes('?') ? '&' : '?'}t=${fotoTimestamp.value}`;
    }
    // Se é caminho relativo
    return `http://localhost:8000/storage/${foto}?t=${fotoTimestamp.value}`;
  }
  return '';
});

// ✅ Watch para quando a foto do perfil mudar
watch(
  () => perfilStore.perfil?.foto,
  () => {
    fotoTimestamp.value = Date.now();
    console.log('Foto do perfil atualizada:', perfilStore.perfil?.foto);
  },
  { immediate: true }
);

// ===================== NOTIFICAÇÕES =====================
const notificacoes = ref<Notificacao[]>([]);
const notificacoesNaoLidas = ref(0);
let intervalo: ReturnType<typeof setInterval> | null = null;

const carregarNotificacoes = async (): Promise<void> => {
  try {
    const { api } = await import('src/boot/axios');
    const response = await api.get('/admin/notificacoes?per_page=20');
    if (response.data?.success) {
      notificacoes.value = response.data.data;
      notificacoesNaoLidas.value = notificacoes.value.filter((n: Notificacao) => !n.lida).length;
    }
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
};

const marcarComoLida = async (id: number): Promise<void> => {
  try {
    const { api } = await import('src/boot/axios');
    await api.put(`/admin/notificacoes/${id}/marcar-lida`);
    await carregarNotificacoes();
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};

const marcarTodasComoLidas = async (): Promise<void> => {
  try {
    const { api } = await import('src/boot/axios');
    await api.put('/admin/notificacoes/marcar-todas-lidas');
    await carregarNotificacoes();
    $q.notify({ type: 'positive', message: 'Todas notificações marcadas como lidas!' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
  }
};

const irParaNotificacao = (notificacao: Notificacao): void => {
  if (!notificacao.lida) {
    void marcarComoLida(notificacao.id);
  }
  if (notificacao.data?.pedido_id) {
    void router.push(`/admin/pedidos/${notificacao.data.pedido_id}`);
  } else {
    void router.push('/admin/notificacoes');
  }
};

const getNotificationIcon = (tipo: string): string => {
  const icons: Record<string, string> = {
    pedido: 'shopping_cart',
    promocao: 'local_offer',
    sistema: 'settings',
    avaliacao: 'star',
    pagamento: 'payments',
    suporte: 'support_agent',
    seguranca: 'security'
  };
  return icons[tipo] || 'notifications';
};

const getNotificationIconClass = (tipo: string): string => {
  const classes: Record<string, string> = {
    pedido: 'icon-pedido',
    promocao: 'icon-promocao',
    sistema: 'icon-sistema',
    avaliacao: 'icon-avaliacao',
    pagamento: 'icon-pagamento',
    suporte: 'icon-suporte'
  };
  return classes[tipo] || 'icon-default';
};

const truncarTexto = (texto: string, max: number): string => {
  if (!texto) return '';
  if (texto.length <= max) return texto;
  return texto.substring(0, max) + '...';
};

const formatarDataRelativa = (dataString: string): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

// ===================== DADOS DO USUÁRIO =====================
const isRoot = computed(() => authStore.user?.tipo === 'root');

// ✅ Buscar nome do perfilStore
const adminNome = computed(() => {
  const nome = perfilStore.perfil?.nome || authStore.user?.nome;
  return nome?.split(' ')[0] || 'Administrador';
});

const adminRole = computed(() => {
  if (isRoot.value) return 'Root Administrator';
  return 'Business Manager';
});

// ✅ Buscar iniciais do perfilStore
const adminInitials = computed(() => {
  const nome = perfilStore.perfil?.nome || authStore.user?.nome || 'AD';
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();
});

const dataHoje = computed(() =>
  new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
);

// ===================== DADOS DO DASHBOARD =====================
const pendentesVerificacao = computed(() => adminStore.dashboard.prestadores_pendentes);
const pedidosPendentes = computed(() => adminStore.dashboard.pedidos_pendentes);
const ticketsAbertos = computed(() => adminStore.dashboard.tickets_abertos);
const alertasAtivos = computed(() => adminStore.dashboard.alertas_ativos || 0);
const avaliacoesPendentes = computed(() => adminStore.dashboard.avaliacoes_pendentes || 0);

// ===================== TÍTULO DA PÁGINA =====================
const tituloPagina = computed(() => {
  const path = route.path;
  const titulos: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/utilizadores': 'Clientes',
    '/admin/prestadores': 'Prestadores',
    '/admin/pedidos': 'Pedidos',
    '/admin/servicos': 'Serviços',
    '/admin/categorias': 'Categorias',
    '/admin/promocoes': 'Promoções',
    '/admin/relatorios': 'Relatórios',
    '/admin/avaliacoes': 'Avaliações',
    '/admin/financeiro': 'Financeiro',
    '/admin/estatisticas': 'Estatísticas',
    '/admin/suporte': 'Suporte',
    '/admin/notificacoes': 'Notificações',
    '/admin/configuracoes': 'Configurações',
    '/admin/permissoes': 'Permissões',
    '/admin/backups': 'Backups',
    '/admin/logs': 'Logs do Sistema',
    '/admin/monitoring': 'Monitoramento',
    '/admin/performance': 'Performance',
    '/admin/perfil': 'Meu Perfil'
  };
  return titulos[path] || 'Dashboard';
});

// ===================== ACTIONS =====================
const irPara = (path: string) => void router.push(path);
const focarBusca = () =>
  $q.notify({ type: 'info', message: 'Busca global em breve', position: 'top' });
const atualizarDados = async (): Promise<void> => {
  await adminStore.recarregarDados();
  await perfilStore.carregarPerfil(); // ✅ Atualizar perfil também
  await carregarNotificacoes();
  $q.notify({ type: 'positive', message: 'Dados atualizados!', position: 'top', timeout: 2000 });
};

const sair = async (): Promise<void> => {
  await authStore.logout();
  perfilStore.limparStore(); // ✅ Limpar store de perfil
  void router.push('/admin/login');
};

// ✅ Carregar perfil ao montar o componente
const carregarPerfil = async (): Promise<void> => {
  try {
    await perfilStore.carregarPerfil();
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
};

// ===================== LIFECYCLE =====================
onMounted(async () => {
  await Promise.all([
    adminStore.recarregarDados(),
    carregarPerfil(), // ✅ Carregar perfil
    carregarNotificacoes()
  ]);

  intervalo = setInterval(() => {
    void carregarNotificacoes();
  }, 30000);
});

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo);
  }
  window.removeEventListener('resize', handleResize);
});
</script>
<style scoped lang="scss">
// ─── TOKENS ───────────────────────────────────────────────────────────────
$a: #667eea;
$a2: #764ba2;
$a-l: rgba(102, 126, 234, 0.09);
$a-m: rgba(102, 126, 234, 0.18);
$green: #10b981;
$gl: rgba(16, 185, 129, 0.1);
$gold: #f59e0b;
$gol: rgba(245, 158, 11, 0.1);
$red: #ef4444;
$rl: rgba(239, 68, 68, 0.1);
$teal: #06b6d4;
$tl: rgba(6, 182, 212, 0.1);
$purple: #764ba2;
$pl: rgba(118, 75, 162, 0.1);
$slate: #607d8b;
$sll: #eceff1;
$ink: #0d0d1a;
$ink2: #3d3d55;
$muted: #9898b2;
$line: rgba(0, 0, 0, 0.07);
$sur: #ffffff;
$bg: #f2f2f7;
$sidebar: #16163a;
$r: 12px;
$rs: 8px;

// ─── ANIMAÇÃO DO ÍCONE (VIRAR DE CABEÇA PARA BAIXO) ───────────────────────
.notification-icon-animated {
  transition: transform 0.3s ease-in-out;
  display: inline-block;
}

.notification-icon-animated.icon-rotated {
  transform: rotate(180deg);
}

// ─── SHIMMER ──────────────────────────────────────────────────────────────
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

%shimmer {
  background: linear-gradient(90deg, #e4e4ec 25%, #f0f0f6 50%, #e4e4ec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

// ─── SHELL ────────────────────────────────────────────────────────────────
.admin-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: $bg;
  position: relative;
}

// ─── MOBILE MENU BUTTON ───────────────────────────────────────────────────
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: $a;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  i {
    color: white;
    font-size: 24px;
  }
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &.active {
    opacity: 1;
    visibility: visible;
  }
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────
.sidebar {
  background: $sidebar;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1002;
  scrollbar-width: none;
  transition: transform 0.3s ease;
  &::-webkit-scrollbar { display: none; }
}

.sidebar-brand {
  padding: 22px 18px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-close {
  display: none;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);

  i {
    color: white;
    font-size: 18px;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: $a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}
.brand-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 14px 0;
}

.nav-section {
  padding: 0 12px;
  margin-bottom: 4px;
}
.nav-section-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 10px 8px 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: $rs;
  cursor: pointer;
  transition: all 0.18s;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-bottom: 2px;
  text-decoration: none;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
  }
  &.active {
    background: $a;
    color: #fff;
    font-weight: 500;
  }
  &.active .nav-icon { color: #fff; }

  .nav-icon {
    font-size: 18px;
    width: 20px;
    flex-shrink: 0;
  }
  span { flex: 1; }
}

.nav-badge {
  margin-left: auto;
  background: $red;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  &.warning { background: $gold; }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.admin-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px;
  border-radius: $rs;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.06); }
}

.admin-avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.admin-av {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.admin-name {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}
.admin-role {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}
.logout-btn {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.4) !important;
}

// ─── CONTENT AREA ─────────────────────────────────────────────────────────
.content-area {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────
.topbar {
  background: $sur;
  border-bottom: 1px solid $line;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: $ink;
  line-height: 1.1;
}
.topbar-sub {
  font-size: 11px;
  color: $muted;
  margin-top: 1px;
  text-transform: capitalize;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tb-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $bg;
  border: 1px solid $line;
  border-radius: $rs;
  padding: 7px 12px;
  font-size: 12px;
  color: $muted;
  cursor: pointer;
  min-width: 190px;
  transition: all 0.2s;

  &:hover {
    border-color: $a;
    background: $a-l;
  }

  .tb-shortcut {
    margin-left: auto;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
  }
}

.tb-btn {
  width: 36px;
  height: 36px;
  border-radius: $rs !important;
  background: $bg !important;
  border: 1px solid $line !important;
  color: $muted !important;
  position: relative;

  &:hover {
    color: $a !important;
    border-color: $a !important;
    background: $a-l !important;
  }
}

.tb-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $red;
  border: 1.5px solid $sur;
}

// ─── NOTIFICATION DROPDOWN ─────────────────────────────────────────────────
.notification-dropdown {
  position: relative;

  .notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: bold;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  &.has-notification {
    color: $a !important;
  }
}

.notification-dropdown-content {
  width: 380px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;

  .title {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
  }

  .mark-all {
    font-size: 11px;
    color: $a;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: #f8f9fa;
  }

  &.unread {
    background: rgba(102, 126, 234, 0.05);

    .notification-title {
      font-weight: 600;
      color: $a;
    }
  }
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-pedido {
    background: rgba(102, 126, 234, 0.1);
    color: $a;
  }
  &.icon-promocao {
    background: rgba(245, 158, 11, 0.1);
    color: $gold;
  }
  &.icon-sistema {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
  &.icon-avaliacao {
    background: rgba(16, 185, 129, 0.1);
    color: $green;
  }
  &.icon-pagamento {
    background: rgba(6, 182, 212, 0.1);
    color: $teal;
  }
  &.icon-suporte {
    background: rgba(239, 68, 68, 0.1);
    color: $red;
  }
  &.icon-default {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;

  .notification-title {
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .notification-message {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notification-time {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 4px;
  }
}

.notification-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $a;
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;

  p {
    margin-top: 8px;
    font-size: 13px;
  }
}

.notification-footer {
  padding: 10px 16px;
  text-align: center;
  border-top: 1px solid #e5e7eb;

  .view-all {
    font-size: 12px;
    color: $a;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
.main-content {
  padding: 24px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  flex: 1;
}

// ==================== RESPONSIVO (TELAS MENORES) ====================
@media (max-width: 768px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 260px;
    transform: translateX(-100%);
    z-index: 1002;
    height: 100vh;

    &.mobile {
      transform: translateX(0);
    }
  }

  .sidebar-close {
    display: flex;
  }

  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .topbar {
    padding: 0 16px;
    height: 52px;
  }

  .topbar-title {
    font-size: 16px;
  }

  .topbar-sub {
    font-size: 10px;
  }

  .tb-search {
    min-width: auto;
    padding: 6px 10px;

    span:not(.tb-shortcut) {
      display: none;
    }
  }

  .notification-dropdown-content {
    width: 95vw;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }

  .topbar {
    padding: 0 12px;
  }

  .topbar-title {
    font-size: 14px;
  }

  .topbar-sub {
    display: none;
  }

  .tb-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
