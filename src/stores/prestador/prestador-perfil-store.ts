// stores/prestador/prestador-perfil-store.ts

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

export interface PortfolioItem {
  id: number;
  url: string;
  path?: string;
  titulo?: string;
  descricao?: string;
  created_at?: string;
}

export interface PerfilPrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao: string;
  sobre: string;
  latitude: number | null;
  longitude: number | null;
  raio_atendimento: number;
  disponivel: boolean;
  verificado: boolean;
  media_avaliacao: number;
  total_avaliacoes: number;
  endereco: string;
  portfolio: PortfolioItem[];
  categorias: CategoriaPrestadorData[];
  servicos: ServicoData[];
  disponibilidade: DisponibilidadeData | null;
  documento_verificado: boolean;
  status_documento?: string;
  created_at?: string;
  updated_at?: string;
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
  latitude?: number | null;
  longitude?: number | null;
  raio_atendimento?: number;
}

export interface CategoriaDisponivel {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  descricao?: string;
}

// ===================== EXPORTAÇÕES PARA O FRONTEND =====================

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

export const diasDaSemana: { key: string; label: string }[] = [
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

  const perfil = ref<PerfilPrestadorData | null>(null);
  const portfolio = ref<PortfolioItem[]>([]);
  const servicos = ref<ServicoData[]>([]);
  const minhasCategorias = ref<CategoriaPrestadorData[]>([]);
  const disponibilidade = ref<DisponibilidadeData | null>(null);
  const documentoVerificado = ref(false);

  const stats = ref<StatsData>({
    servicos: 0,
    pedidos_pendentes: 0,
    avaliacao_media: 0,
  });

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

  const latitude = computed(() => perfil.value?.latitude ?? null);
  const longitude = computed(() => perfil.value?.longitude ?? null);
  const raioAtendimento = computed(() => perfil.value?.raio_atendimento ?? 10);
  const disponivel = computed(() => perfil.value?.disponivel ?? true);

  const disponibilidadeHorariosFormatados = computed(() => {
    if (!disponibilidade.value?.horarios_padrao) return [];
    const diasMap: Record<string, string> = {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo',
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
        const data = response.data.data;
        perfil.value = {
          ...data,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          raio_atendimento: data.raio_atendimento ?? 10,
          disponivel: data.disponivel ?? true,
          verificado: data.verificado ?? false,
          status_documento: data.status_documento ?? 'pendente',
        };
        portfolio.value = data.portfolio || [];
        servicos.value = data.servicos || [];
        minhasCategorias.value = data.categorias || [];
        disponibilidade.value = data.disponibilidade || null;
        documentoVerificado.value = data.documento_verificado || false;
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
    } catch {
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
    } catch {
      return [];
    }
  };

  const fetchDisponibilidade = async (
    forceRefresh = false,
  ): Promise<DisponibilidadeData | null> => {
    if (dadosCarregados.value && !forceRefresh && disponibilidade.value) {
      return disponibilidade.value;
    }
    try {
      const response = await api.get('/prestador/perfil/disponibilidade');
      if (response.data?.success && response.data.data) {
        disponibilidade.value = response.data.data;
      }
      return disponibilidade.value;
    } catch {
      return null;
    }
  };

  // ===================== SERVIÇOS =====================

  const adicionarServico = async (servico: Omit<ServicoData, 'id'>): Promise<boolean> => {
    try {
      const response = await api.post('/prestador/servicos', servico);
      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      return false;
    }
  };

  // ===================== CATEGORIAS =====================

  const addCategoria = async (categoriaId: number): Promise<boolean> => {
    try {
      const response = await api.post('/prestador/perfil/categorias', {
        categoria_id: categoriaId,
      });
      if (response.data?.success) {
        await fetchMinhasCategorias(true);
        return true;
      }
      return false;
    } catch {
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
    } catch {
      return false;
    }
  };

  // ===================== PORTFÓLIO =====================

  const addPortfolio = async (file: File): Promise<PortfolioItem | null> => {
    const formData = new FormData();
    formData.append('foto', file);
    try {
      const response = await api.post('/prestador/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success && response.data.data) {
        const newItem: PortfolioItem = response.data.data;
        portfolio.value.push(newItem);
        return newItem;
      }
      return null;
    } catch {
      return null;
    }
  };

  const removePortfolio = async (index: number): Promise<boolean> => {
    try {
      const item = portfolio.value[index];
      if (!item) return false;
      const response = await api.delete(`/prestador/portfolio/${item.id}`);
      if (response.data?.success) {
        portfolio.value.splice(index, 1);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const atualizarPortfolio = async (
    id: number,
    data: { titulo?: string; descricao?: string },
  ): Promise<PortfolioItem | null> => {
    try {
      const response = await api.put(`/prestador/portfolio/${id}`, data);
      if (response.data?.success && response.data.data) {
        const index = portfolio.value.findIndex((item) => item.id === id);
        if (index !== -1) {
          portfolio.value[index] = { ...portfolio.value[index], ...response.data.data };
        }
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar portfólio:', error);
      return null;
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
    } catch {
      return null;
    }
  };

  // ===================== 🔥 PERFIL - CORRIGIDO (SEM 'any') =====================

  /**
   * 🔥 ATUALIZAR PERFIL - Envia todos os campos
   */
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      // 🔥 CONSTRUIR OBJETO COM TODOS OS CAMPOS - TIPADO
      const payload: UpdateProfileData = {};

      if (data.nome !== undefined) payload.nome = data.nome;
      if (data.telefone !== undefined) payload.telefone = data.telefone;
      if (data.email !== undefined) payload.email = data.email;
      if (data.profissao !== undefined) payload.profissao = data.profissao;
      if (data.sobre !== undefined) payload.sobre = data.sobre;
      if (data.endereco !== undefined) payload.endereco = data.endereco;
      if (data.latitude !== undefined) payload.latitude = data.latitude;
      if (data.longitude !== undefined) payload.longitude = data.longitude;
      if (data.raio_atendimento !== undefined) payload.raio_atendimento = data.raio_atendimento;

      console.log('📤 Atualizando perfil:', payload);

      const response = await api.put('/prestador/perfil', payload);

      if (response.data?.success) {
        await fetchPerfilCompleto(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return false;
    }
  };

  // ===================== LOGOUT E EXCLUSÃO =====================

  const logout = async (): Promise<boolean> => {
    try {
      await authStore.logout();
      limparStore();
      return true;
    } catch {
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
    } catch {
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

  // ===================== 🔥 BUSCAR TODAS AS CATEGORIAS =====================

  const buscarTodasCategorias = async (): Promise<CategoriaDisponivel[]> => {
    try {
      const response = await api.get('/categorias');
      if (response.data?.success && response.data.data) {
        return response.data.data.map(
          (cat: {
            id: number;
            nome: string;
            icone?: string;
            cor?: string;
            descricao?: string;
          }) => ({
            id: cat.id,
            nome: cat.nome,
            icone: cat.icone || 'category',
            cor: cat.cor || 'primary',
            descricao: cat.descricao || '',
          }),
        );
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  };

  return {
    // Estados
    isLoading,
    error,
    perfil,
    portfolio,
    servicos,
    minhasCategorias,
    disponibilidade,
    documentoVerificado,
    stats,
    dadosCarregados,
    ultimaAtualizacao,

    // Getters
    nomeCompleto,
    email,
    telefone,
    profissao,
    sobre,
    endereco,
    rating,
    totalAvaliacoes,
    foto,
    latitude,
    longitude,
    raioAtendimento,
    disponivel,
    disponibilidadeHorariosFormatados,

    // READ
    fetchPerfilCompleto,
    fetchStats,
    fetchMinhasCategorias,
    fetchDisponibilidade,

    // SERVIÇOS
    adicionarServico,
    atualizarServico,
    removerServico,

    // CATEGORIAS
    addCategoria,
    removeCategoria,
    buscarTodasCategorias,

    // PORTFÓLIO
    addPortfolio,
    removePortfolio,
    atualizarPortfolio,

    // FOTO
    updateAvatar,

    // 🔥 PERFIL (CORRIGIDO)
    updateProfile,

    // DISPONIBILIDADE
    updateDisponibilidade,

    // LOGOUT
    logout,
    deleteAccount,
    limparStore,
    carregarTodosDados,
  };
});

export default usePrestadorPerfilStore;
