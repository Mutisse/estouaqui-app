import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/login-store';

// ===================== INTERFACES =====================

export interface CategoriaPrestadorData {
  id: number;
  nome: string;
  icone?: string;
  cor?: string;
  slug?: string;
  descricao?: string;
}

export interface DisponibilidadeData {
  horarios_padrao: Record<string, string[]>;
  disponivel_fim_de_semana?: boolean;
}

export interface ServicoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  icone?: string;
}

export interface PerfilPrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao: string;
  sobre: string;
  endereco: string;
  media_avaliacao: number;
  total_avaliacoes: number;
  portfolio: string[];
  categorias: CategoriaPrestadorData[];
  servicos: ServicoData[];
  disponibilidade: DisponibilidadeData | null;
  documento_verificado: boolean;
}

export interface StatsData {
  servicos: number;
  pedidos_pendentes: number;
  avaliacao_media: number;
}

export interface UpdateProfileData {
  nome?: string;
  telefone?: string;
  email?: string;
  profissao?: string;
  sobre?: string;
  endereco?: string;
}

// Opções de horários para disponibilidade
export const opcoesHorarios = [
  { label: '08:00 - 09:00', value: '08:00-09:00' },
  { label: '09:00 - 10:00', value: '09:00-10:00' },
  { label: '10:00 - 11:00', value: '10:00-11:00' },
  { label: '11:00 - 12:00', value: '11:00-12:00' },
  { label: '12:00 - 13:00', value: '12:00-13:00' },
  { label: '13:00 - 14:00', value: '13:00-14:00' },
  { label: '14:00 - 15:00', value: '14:00-15:00' },
  { label: '15:00 - 16:00', value: '15:00-16:00' },
  { label: '16:00 - 17:00', value: '16:00-17:00' },
  { label: '17:00 - 18:00', value: '17:00-18:00' },
  { label: '18:00 - 19:00', value: '18:00-19:00' },
  { label: '19:00 - 20:00', value: '19:00-20:00' },
];

// Opções de ícones para serviços
export const iconeOptions = [
  { label: '🛠️ Ferramentas', value: 'handyman' },
  { label: '🔧 Chave Inglesa', value: 'build' },
  { label: '⚡ Eletricista', value: 'bolt' },
  { label: '💧 Canalizador', value: 'water_drop' },
  { label: '🎨 Pintor', value: 'brush' },
  { label: '🧹 Limpeza', value: 'cleaning_services' },
  { label: '📦 Mudanças', value: 'moving' },
  { label: '🔒 Segurança', value: 'security' },
];

export const diasDaSemana = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

// ===================== STORE =====================

export const usePrestadorPerfilStore = defineStore('prestadorPerfil', () => {
  const authStore = useAuthStore();

  // ===================== ESTADOS =====================
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Dados do perfil
  const perfil = ref<PerfilPrestadorData | null>(null);
  const portfolio = ref<string[]>([]);
  const servicos = ref<ServicoData[]>([]);
  const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
  const disponibilidade = ref<DisponibilidadeData | null>(null);
  const documentoVerificado = ref(false);

  // Estatísticas
  const stats = ref<StatsData>({
    servicos: 0,
    pedidos_pendentes: 0,
    avaliacao_media: 0,
  });

  // Controle de dados carregados
  const dadosCarregados = ref(false);
  const ultimaAtualizacao = ref<Date | null>(null);

  // ===================== GETTERS =====================

  const nomeCompleto = computed(() => perfil.value?.nome || authStore.user?.nome || 'Prestador');
  const email = computed(() => perfil.value?.email || authStore.user?.email || '');
  const telefone = computed(() => perfil.value?.telefone || authStore.user?.telefone || '');
  const profissao = computed(() => perfil.value?.profissao || 'Prestador de Serviços');
  const sobre = computed(() => perfil.value?.sobre || '');
  const endereco = computed(() => perfil.value?.endereco || '');
  const rating = computed(() => perfil.value?.media_avaliacao || 0);
  const totalAvaliacoes = computed(() => perfil.value?.total_avaliacoes || 0);
  const foto = computed(() => perfil.value?.foto || authStore.user?.foto || null);

  const disponibilidadeHorariosFormatados = computed(() => {
    if (!disponibilidade.value?.horarios_padrao) return [];

    const diasMap: Record<string, string> = {
      monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
      thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo'
    };

    return Object.entries(disponibilidade.value.horarios_padrao)
      .filter(([, horarios]) => horarios.length > 0)
      .map(([dia, horarios]) => ({
        dia: diasMap[dia] || dia.charAt(0).toUpperCase() + dia.slice(1),
        horario: horarios.join(', '),
      }));
  });

  // ===================== READ =====================

  const fetchPerfilCompleto = async (forceRefresh = false): Promise<PerfilPrestadorData | null> => {
    if (dadosCarregados.value && !forceRefresh) return perfil.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/prestador/perfil');

      if (response.data?.success && response.data.data) {
        perfil.value = response.data.data;
        portfolio.value = response.data.data.portfolio || [];
        servicos.value = response.data.data.servicos || [];
        minhasCategorias.value = response.data.data.categorias || [];
        disponibilidade.value = response.data.data.disponibilidade || null;
        documentoVerificado.value = response.data.data.documento_verificado || false;
        dadosCarregados.value = true;
        ultimaAtualizacao.value = new Date();
        return perfil.value;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      error.value = (err as AxiosError).message || 'Erro ao carregar perfil';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStats = async (forceRefresh = false): Promise<StatsData> => {
    if (dadosCarregados.value && !forceRefresh && stats.value.servicos > 0) {
      return stats.value;
    }

    try {
      const response = await api.get('/prestador/perfil/stats');
      if (response.data?.success && response.data.data) {
        stats.value = {
          servicos: response.data.data.servicos || 0,
          pedidos_pendentes: response.data.data.pedidos_pendentes || 0,
          avaliacao_media: response.data.data.avaliacao_media || 0,
        };
      }
      return stats.value;
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
      return stats.value;
    }
  };

  const fetchMinhasCategorias = async (forceRefresh = false): Promise<CategoriaPrestadorData[]> => {
    if (dadosCarregados.value && !forceRefresh && minhasCategorias.value.length > 0) {
      return minhasCategorias.value;
    }

    try {
      const response = await api.get('/prestador/perfil/categorias');
      if (response.data?.success && response.data.data) {
        minhasCategorias.value = response.data.data;
      }
      return minhasCategorias.value;
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      return [];
    }
  };

  const fetchDisponibilidade = async (forceRefresh = false): Promise<DisponibilidadeData | null> => {
    if (dadosCarregados.value && !forceRefresh && disponibilidade.value) {
      return disponibilidade.value;
    }

    try {
      const response = await api.get('/prestador/perfil/disponibilidade');
      if (response.data?.success && response.data.data) {
        disponibilidade.value = response.data.data;
      }
      return disponibilidade.value;
    } catch (err) {
      console.error('Erro ao buscar disponibilidade:', err);
      return null;
    }
  };

  // ===================== SERVIÇOS CRUD =====================

  const adicionarServico = async (servico: Omit<ServicoData, 'id'>): Promise<boolean> => {
    try {
      const response = await api.post('/prestador/servicos', servico);
      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao adicionar serviço:', err);
      return false;
    }
  };

  const atualizarServico = async (id: number, servico: Partial<ServicoData>): Promise<boolean> => {
    try {
      const response = await api.put(`/prestador/servicos/${id}`, servico);
      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      return false;
    }
  };

  const removerServico = async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/prestador/servicos/${id}`);
      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
      return false;
    }
  };

  // ===================== DISPONIBILIDADE =====================

  const updateDisponibilidade = async (data: DisponibilidadeData): Promise<boolean> => {
    try {
      const response = await api.put('/prestador/perfil/disponibilidade', data);
      if (response.data?.success) {
        disponibilidade.value = data;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      return false;
    }
  };

  // ===================== CATEGORIAS =====================

  const addCategoria = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.post('/prestador/perfil/categorias', { categoria_id: categoriaId });
      if (response.data?.success) {
        await fetchMinhasCategorias(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      return false;
    }
  };

  const removeCategoria = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/prestador/perfil/categorias/${categoriaId}`);
      if (response.data?.success) {
        await fetchMinhasCategorias(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      return false;
    }
  };

  // ===================== PORTFÓLIO =====================

  const addPortfolio = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await api.post('/prestador/perfil/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data.data?.url) {
        portfolio.value.push(response.data.data.url);
        return response.data.data.url;
      }
      return null;
    } catch (err) {
      console.error('Erro ao adicionar ao portfólio:', err);
      return null;
    }
  };

  const removePortfolio = async (index: number): Promise<boolean> => {
    try {
      const fotoUrl = portfolio.value[index];
      if (!fotoUrl) return false;

      const response = await api.delete('/prestador/perfil/portfolio', {
        data: { url: fotoUrl }
      });

      if (response.data?.success) {
        portfolio.value.splice(index, 1);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover do portfólio:', err);
      return false;
    }
  };

  // ===================== FOTO =====================

  const updateAvatar = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await api.post('/prestador/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data.data?.foto) {
        const fotoUrl = response.data.data.foto;
        if (perfil.value) perfil.value.foto = fotoUrl;
        if (authStore.user) authStore.user.foto = fotoUrl;
        return fotoUrl;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      return null;
    }
  };

  // ===================== PERFIL =====================

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      const response = await api.put('/prestador/perfil', data);
      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      return false;
    }
  };

  // ===================== LOGOUT E EXCLUSÃO =====================

  const logout = async (): Promise<boolean> => {
    try {
      await authStore.logout();
      limparStore();
      return true;
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const response = await api.delete('/prestador/perfil/conta');
      if (response.data?.success) {
        limparStore();
        await authStore.logout();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      return false;
    }
  };

  const limparStore = (): void => {
    perfil.value = null;
    portfolio.value = [];
    servicos.value = [];
    minhasCategorias.value = [];
    disponibilidade.value = null;
    documentoVerificado.value = false;
    stats.value = { servicos: 0, pedidos_pendentes: 0, avaliacao_media: 0 };
    dadosCarregados.value = false;
    ultimaAtualizacao.value = null;
    error.value = null;
  };

  const carregarTodosDados = async (): Promise<void> => {
    isLoading.value = true;
    try {
      await Promise.all([
        fetchPerfilCompleto(true),
        fetchStats(true),
        fetchMinhasCategorias(true),
        fetchDisponibilidade(true),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Estados
    isLoading, error, perfil, portfolio, servicos, minhasCategorias,
    disponibilidade, documentoVerificado, stats, dadosCarregados, ultimaAtualizacao,

    // Getters
    nomeCompleto, email, telefone, profissao, sobre, endereco,
    rating, totalAvaliacoes, foto, disponibilidadeHorariosFormatados,

    // READ
    fetchPerfilCompleto, fetchStats, fetchMinhasCategorias, fetchDisponibilidade,

    // SERVIÇOS
    adicionarServico, atualizarServico, removerServico,

    // CATEGORIAS
    addCategoria, removeCategoria,

    // PORTFÓLIO
    addPortfolio, removePortfolio,

    // FOTO
    updateAvatar,

    // PERFIL
    updateProfile,

    // DISPONIBILIDADE
    updateDisponibilidade,

    // LOGOUT
    logout, deleteAccount, limparStore, carregarTodosDados,
  };
});

export default usePrestadorPerfilStore;
