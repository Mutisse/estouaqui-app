// src/stores/admin/admin-store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/login-store';

export interface DashboardStats {
  total_usuarios: number;
  total_prestadores: number;
  total_clientes: number;
  total_pedidos: number;
  pedidos_pendentes: number;
  pedidos_concluidos: number;
  ganhos_totais: number;
  ganhos_mes: number;
  prestadores_pendentes: number;
  tickets_abertos: number;
  notificacoes_nao_lidas: number;
  alertas_ativos: number;
  avaliacoes_pendentes: number;
}

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  const dashboard = ref<DashboardStats>({
    total_usuarios: 0,
    total_prestadores: 0,
    total_clientes: 0,
    total_pedidos: 0,
    pedidos_pendentes: 0,
    pedidos_concluidos: 0,
    ganhos_totais: 0,
    ganhos_mes: 0,
    prestadores_pendentes: 0,
    tickets_abertos: 0,
    notificacoes_nao_lidas: 0,
    alertas_ativos: 0,
    avaliacoes_pendentes: 0,
  });

  const atividadeSemanal = ref([]);
  const distribuicaoPorTipo = ref([]);
  const ultimosUtilizadores = ref([]);
  const servicosRecentes = ref([]);

  const totalUsuarios = computed(() => dashboard.value.total_usuarios);
  const totalPrestadores = computed(() => dashboard.value.total_prestadores);
  const totalClientes = computed(() => dashboard.value.total_clientes);
  const totalPedidos = computed(() => dashboard.value.total_pedidos);

  const cardsPrincipais = computed(() => [
    { title: 'Usuários', value: dashboard.value.total_usuarios, icon: 'group', colorKey: 'blue', trend: 8 },
    { title: 'Prestadores', value: dashboard.value.total_prestadores, icon: 'handyman', colorKey: 'green', trend: 12 },
    { title: 'Pedidos', value: dashboard.value.total_pedidos, icon: 'receipt_long', colorKey: 'gold', trend: -3 },
    { title: 'Ganhos', value: dashboard.value.ganhos_mes, icon: 'payments', colorKey: 'teal', trend: 15, isCurrency: true },
  ]);

  const cardsSecundarios = computed(() => [
    { title: 'Clientes', value: dashboard.value.total_clientes, icon: 'person', colorKey: 'purple' },
    { title: 'Pedidos Pendentes', value: dashboard.value.pedidos_pendentes, icon: 'pending_actions', colorKey: 'gold' },
    { title: 'Prestadores Pendentes', value: dashboard.value.prestadores_pendentes, icon: 'verified_user', colorKey: 'red' },
    { title: 'Tickets Abertos', value: dashboard.value.tickets_abertos, icon: 'support_agent', colorKey: 'slate' },
    { title: 'Avaliações Pendentes', value: dashboard.value.avaliacoes_pendentes, icon: 'star_outline', colorKey: 'orange' },
  ]);

  const atividadeFormatada = computed(() => atividadeSemanal.value);

  const carregarDashboard = async (forceRefresh = false): Promise<void> => {
    if (dadosCarregados.value && !forceRefresh) return;
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    try {
      // ✅ ROTA CORRETA: /admin/dashboard/stats
      const response = await api.get('/admin/dashboard/stats');
      if (response.data?.success && response.data.data) {
        const data = response.data.data;
        dashboard.value = {
          total_usuarios: data.total_usuarios || 0,
          total_prestadores: data.total_prestadores || 0,
          total_clientes: data.total_clientes || 0,
          total_pedidos: data.total_pedidos || 0,
          pedidos_pendentes: data.pedidos_pendentes || 0,
          pedidos_concluidos: data.pedidos_concluidos || 0,
          ganhos_totais: data.ganhos_totais || 0,
          ganhos_mes: data.ganhos_mes || 0,
          prestadores_pendentes: data.prestadores_pendentes || 0,
          tickets_abertos: data.tickets_abertos || 0,
          notificacoes_nao_lidas: data.notificacoes_nao_lidas || 0,
          alertas_ativos: data.alertas_ativos || 0,
          avaliacoes_pendentes: data.avaliacoes_pendentes || 0,
        };
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const recarregarDados = async (): Promise<void> => {
    dadosCarregados.value = false;
    await carregarDashboard(true);
  };

  return {
    isLoading,
    isSaving,
    error,
    dadosCarregados,
    ultimaAtualizacao,
    dashboard,
    atividadeSemanal,
    distribuicaoPorTipo,
    ultimosUtilizadores,
    servicosRecentes,
    totalUsuarios,
    totalPrestadores,
    totalClientes,
    totalPedidos,
    cardsPrincipais,
    cardsSecundarios,
    atividadeFormatada,
    carregarDashboard,
    recarregarDados,
  };
});

export default useAdminStore;
