// src/stores/cliente/cliente-public-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { useClienteCacheStore, CLIENTE_CACHE_TTL } from './cliente-cache-store';
import { CLIENTE_ENDPOINTS } from 'src/router/Api/cliente-endpoints';

export interface CategoriaData {
  id: number;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  descricao: string;
  ativo: boolean;
  servicos_count: number;
}

// ✅ INTERFACE COMPLETA DO PRESTADOR
export interface PrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  media_avaliacao: number;
  total_avaliacoes: number;
  verificado: boolean;
  disponivel?: boolean;
  categorias?: { id: number; nome: string; icone?: string; cor?: string }[];
  distancia?: number;
  latitude?: number;
  longitude?: number;
  raio?: number;
  servicos?: {
    id: number;
    nome: string;
    preco: number;
    duracao: number;
    descricao?: string;
    icone?: string;
  }[];
  portfolio?: string[];
  avaliacoes?: {
    id: number;
    nota: number;
    comentario?: string;
    created_at: string;
    cliente?: { id: number; nome: string; foto: string | null };
  }[];
}

// ✅ INTERFACE RAW ATUALIZADA
interface RawPrestadorData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string | null;
  profissao?: string;
  sobre?: string;
  media_avaliacao: number;
  total_avaliacoes: number;
  verificado: boolean;
  categorias?: { id: number; nome: string }[];
  distancia?: number;
  disponivel?: boolean;
  latitude?: number;
  longitude?: number;
  servicos?: {
    id: number;
    nome: string;
    preco: number;
    duracao: number;
    descricao?: string;
    icone?: string;
  }[];
  portfolio?: string[];
  avaliacoes?: {
    id: number;
    nota: number;
    comentario?: string;
    created_at: string;
    cliente?: { id: number; nome: string; foto: string | null };
  }[];
}

export const useClientePublicStore = defineStore('clientePublic', () => {
  const cacheStore = useClienteCacheStore();

  const loading = ref(false);
  const prestadoresTop = ref<PrestadorData[]>([]);
  const prestadoresDestaque = ref<PrestadorData[]>([]);
  const prestadoresProximos = ref<PrestadorData[]>([]);
  const categorias = ref<CategoriaData[]>([]);

  function extractDataFromResponse<T>(response: unknown): T {
    if (!response) return [] as T;
    if (Array.isArray(response)) return response as T;
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;
      if (obj.success === true && obj.data !== undefined) {
        return obj.data as T;
      }
      if (obj.data !== undefined) {
        return obj.data as T;
      }
    }
    return [] as T;
  }

  function gerarIniciais(nome: string): string {
    if (!nome || nome.trim() === '') return '??';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) {
      const primeiraParte = partes[0];
      if (primeiraParte && primeiraParte.length >= 2) {
        return primeiraParte.substring(0, 2).toUpperCase();
      }
      return (primeiraParte?.[0] || '?') + '?';
    }
    const primeiraLetra = partes[0]?.[0] || '';
    const ultimaParte = partes[partes.length - 1];
    const ultimaLetra = ultimaParte?.[0] || '';
    return (primeiraLetra + ultimaLetra).toUpperCase();
  }

  function processarFotoPrestador(prestador: RawPrestadorData): string | null {
    if (prestador.foto && prestador.foto !== 'null' && prestador.foto !== '') {
      if (prestador.foto.startsWith('http')) {
        return prestador.foto;
      }
      return `/storage/${prestador.foto}`;
    }
    const iniciais = gerarIniciais(prestador.nome);
    return `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=56&name=${encodeURIComponent(iniciais)}`;
  }

  // ==========================================
  // CATEGORIAS
  // ==========================================

  async function fetchCategorias(forceRefresh: boolean = false): Promise<CategoriaData[]> {
    const data = await cacheStore.fetchWithCache<CategoriaData[]>(
      'categorias',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.CATEGORIAS_PUBLICAS);
          const result = extractDataFromResponse<CategoriaData[]>(response.data);
          categorias.value = Array.isArray(result) ? result : [];
          return categorias.value;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.VERY_LONG,
      forceRefresh,
    );
    return data;
  }

  // ==========================================
  // PRESTADORES
  // ==========================================

  async function fetchPrestadoresTop(forceRefresh: boolean = false): Promise<PrestadorData[]> {
    const data = await cacheStore.fetchWithCache<PrestadorData[]>(
      'prestadores_top',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_TOP);
          const dados = extractDataFromResponse<RawPrestadorData[]>(response.data);
          const result = dados.map((prestador: RawPrestadorData) => ({
            ...prestador,
            foto: processarFotoPrestador(prestador),
            disponivel: prestador.disponivel !== undefined ? prestador.disponivel : true,
            categorias: prestador.categorias || [],
            servicos: prestador.servicos || [],
            portfolio: prestador.portfolio || [],
            avaliacoes: prestador.avaliacoes || [],
          })) as PrestadorData[];
          prestadoresTop.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchPrestadoresDestaque(forceRefresh: boolean = false): Promise<PrestadorData[]> {
    const data = await cacheStore.fetchWithCache<PrestadorData[]>(
      'prestadores_destaque',
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_DESTAQUE);
          const dados = extractDataFromResponse<RawPrestadorData[]>(response.data);
          const result = dados.map((prestador: RawPrestadorData) => ({
            ...prestador,
            foto: processarFotoPrestador(prestador),
            disponivel: prestador.disponivel !== undefined ? prestador.disponivel : true,
            categorias: prestador.categorias || [],
            servicos: prestador.servicos || [],
            portfolio: prestador.portfolio || [],
            avaliacoes: prestador.avaliacoes || [],
          })) as PrestadorData[];
          prestadoresDestaque.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.MEDIUM,
      forceRefresh,
    );
    return data;
  }

  async function fetchPrestadoresProximos(
    lat: number,
    lng: number,
    raio: number = 10,
    forceRefresh: boolean = false,
  ): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_proximos_${lat}_${lng}_${raio}`;

    const data = await cacheStore.fetchWithCache<PrestadorData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const url = CLIENTE_ENDPOINTS.PRESTADORES_PROXIMOS_LOCAL(lat, lng, raio);
          const response = await api.get(url);
          const dados = extractDataFromResponse<RawPrestadorData[]>(response.data);
          const result = dados.map((prestador: RawPrestadorData) => ({
            ...prestador,
            foto: processarFotoPrestador(prestador),
            disponivel: prestador.disponivel !== undefined ? prestador.disponivel : true,
            categorias: prestador.categorias || [],
            servicos: prestador.servicos || [],
            portfolio: prestador.portfolio || [],
            avaliacoes: prestador.avaliacoes || [],
          })) as PrestadorData[];
          prestadoresProximos.value = result;
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  async function fetchPrestadorDetalhes(id: number): Promise<PrestadorData | null> {
    const cacheKey = `prestador_detalhes_${id}`;

    const data = await cacheStore.fetchWithCache<PrestadorData | null>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PRESTADOR_DETALHES(id.toString()));
          let prestadorRaw = response.data.data;
          if (prestadorRaw && prestadorRaw.data && !Array.isArray(prestadorRaw.data)) {
            prestadorRaw = prestadorRaw.data;
          }
          if (!prestadorRaw) return null;

          const result: PrestadorData = {
            id: prestadorRaw.id,
            nome: prestadorRaw.nome,
            email: prestadorRaw.email,
            telefone: prestadorRaw.telefone,
            foto: prestadorRaw.foto,
            profissao: prestadorRaw.profissao,
            sobre: prestadorRaw.sobre,
            media_avaliacao: prestadorRaw.media_avaliacao || 0,
            total_avaliacoes: prestadorRaw.total_avaliacoes || 0,
            verificado: prestadorRaw.verificado || false,
            disponivel: prestadorRaw.disponivel !== undefined ? prestadorRaw.disponivel : true,
            latitude: prestadorRaw.latitude,
            longitude: prestadorRaw.longitude,
            categorias: prestadorRaw.categorias || [],
            raio: prestadorRaw.raio || 10,
            servicos: prestadorRaw.servicos || [],
            portfolio: prestadorRaw.portfolio || [],
            avaliacoes: prestadorRaw.avaliacoes || [],
          };
          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.LONG,
    );
    return data;
  }

  async function buscarPrestadoresPorNome(
    busca: string,
    forceRefresh: boolean = false,
  ): Promise<PrestadorData[]> {
    const cacheKey = `prestadores_busca_${busca}`;

    const data = await cacheStore.fetchWithCache<PrestadorData[]>(
      cacheKey,
      async () => {
        loading.value = true;
        try {
          const response = await api.get(CLIENTE_ENDPOINTS.PRESTADORES_BY_BUSCA(busca));
          const dados = extractDataFromResponse<RawPrestadorData[]>(response.data);

          const result = dados.map((prestador: RawPrestadorData) => ({
            ...prestador,
            foto: processarFotoPrestador(prestador),
            disponivel: prestador.disponivel !== undefined ? prestador.disponivel : true,
            categorias: prestador.categorias || [],
            servicos: prestador.servicos || [],
            portfolio: prestador.portfolio || [],
            avaliacoes: prestador.avaliacoes || [],
          })) as PrestadorData[];

          return result;
        } finally {
          loading.value = false;
        }
      },
      CLIENTE_CACHE_TTL.SHORT,
      forceRefresh,
    );
    return data;
  }

  return {
    loading,
    prestadoresTop,
    prestadoresDestaque,
    prestadoresProximos,
    categorias,
    fetchCategorias,
    fetchPrestadoresTop,
    fetchPrestadoresDestaque,
    fetchPrestadoresProximos,
    fetchPrestadorDetalhes,
    buscarPrestadoresPorNome,
  };
});
