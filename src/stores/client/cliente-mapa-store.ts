// stores/client/cliente-mapa-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { AxiosError } from 'axios';
import type L from 'leaflet';

export interface PrestadorMapaItem {
  id: number;
  nome: string;
  foto: string | null;
  disponivel: boolean;
  verificado: boolean;
  media_avaliacao: number | null;
  total_avaliacoes: number;
  distancia?: number;
  latitude?: number;
  longitude?: number;
  profissao?: string;
  categorias?: Array<{ id: number; nome: string }>;
}

export interface LocalizacaoUsuario {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface InstrucaoRota {
  texto: string;
  icone: string;
  distancia: string;
}

export interface ResumoRota {
  distancia: string;
  duracao: string;
}

export interface FiltrosMapa {
  raio_busca: number;
  exibir_apenas_disponiveis: boolean;
  rating_minimo: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useMapaStore = defineStore('clienteMapa', () => {
  // ===================== ESTADOS =====================
  const carregando = ref(false);
  const carregandoMapa = ref(true);
  const carregandoPrestadores = ref(false);
  const carregandoRota = ref(false);
  const prestadorRotaId = ref<number | null>(null);
  const prestadores = ref<PrestadorMapaItem[]>([]);
  const localizacao = ref<LocalizacaoUsuario | null>(null);
  const erro = ref<string | null>(null);
  const imageErrors = ref<Record<number, boolean>>({});

  // Estado do mapa (referências)
  let mapInstance: L.Map | null = null;
  let userMarkerInstance: L.Marker | null = null;
  let userCircleInstance: L.Circle | null = null;
  let markersLayerInstance: L.LayerGroup | null = null;
  let routeLineInstance: L.Polyline | null = null;

  const rotaAtiva = ref(false);
  const instrucoesRota = ref<InstrucaoRota[]>([]);
  const resumoRota = ref<ResumoRota>({ distancia: '0', duracao: '0' });

  // Filtros
  const filtros = ref<FiltrosMapa>({
    raio_busca: 10,
    exibir_apenas_disponiveis: false,
    rating_minimo: 0,
  });

  // ===================== GETTERS =====================

  const prestadoresFiltrados = computed(() => {
    let resultado = [...prestadores.value];

    if (filtros.value.exibir_apenas_disponiveis) {
      resultado = resultado.filter((p) => p.disponivel === true);
    }

    if (filtros.value.rating_minimo > 0) {
      resultado = resultado.filter((p) => (p.media_avaliacao || 0) >= filtros.value.rating_minimo);
    }

    if (filtros.value.raio_busca < 50) {
      resultado = resultado.filter((p) => (p.distancia || 0) <= filtros.value.raio_busca);
    }

    return resultado;
  });

  const hasLocation = computed(() => localizacao.value !== null);

  const locationStatusText = computed(() => {
    if (hasLocation.value) return 'Localização ativa';
    if (carregando.value) return 'A obter localização...';
    return 'Localização indisponível';
  });

  const prestadoresCount = computed(() => prestadoresFiltrados.value.length);

  const raioTexto = computed(() => {
    if (filtros.value.raio_busca <= 10) return 'Próximo';
    if (filtros.value.raio_busca <= 20) return 'Médio';
    return 'Amplo';
  });

  const raioClasse = computed(() => {
    if (filtros.value.raio_busca <= 10) return 'close';
    if (filtros.value.raio_busca <= 20) return 'medium';
    return 'wide';
  });

  // ===================== FUNÇÕES AUXILIARES =====================

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse;
      return data?.message || data?.error || error.message || 'Erro na requisição';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

  const getInitials = (nome: string): string => {
    if (!nome || nome.trim() === '') return '??';
    const partes = nome.trim().split(' ');
    const primeiraParte = partes[0];
    if (!primeiraParte) return '??';
    if (partes.length === 1) {
      if (primeiraParte.length >= 2) return primeiraParte.substring(0, 2).toUpperCase();
      return (primeiraParte[0] || '?') + '?';
    }
    const ultimaParte = partes[partes.length - 1];
    if (!ultimaParte) {
      if (primeiraParte.length >= 2) return primeiraParte.substring(0, 2).toUpperCase();
      return (primeiraParte[0] || '?') + '?';
    }
    const primeiraLetra = primeiraParte[0] || '';
    const ultimaLetra = ultimaParte[0] || '';
    if (!primeiraLetra && !ultimaLetra) return '??';
    if (!primeiraLetra) return (ultimaLetra + '?').toUpperCase();
    if (!ultimaLetra) return (primeiraLetra + '?').toUpperCase();
    return (primeiraLetra + ultimaLetra).toUpperCase();
  };

  const getAvatarUrl = (prestador: PrestadorMapaItem): string => {
    if (imageErrors.value[prestador.id]) {
      const iniciais = getInitials(prestador.nome);
      return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
    }
    if (prestador.foto) return prestador.foto;
    const iniciais = getInitials(prestador.nome);
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
  };

  const handleImageError = (prestadorId: number): void => {
    imageErrors.value[prestadorId] = true;
  };

  const formatarDistancia = (distancia?: number): string => {
    if (!distancia && distancia !== 0) return '? km';
    if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
    return `${distancia.toFixed(1)}km`;
  };

  const formatarDistanciaPasso = (metros: number): string => {
    if (metros < 1000) return `${Math.round(metros)}m`;
    return `${(metros / 1000).toFixed(1)}km`;
  };

  // ===================== AÇÕES - LOCALIZAÇÃO =====================

  const obterLocalizacao = async (): Promise<LocalizacaoUsuario | null> => {
    carregando.value = true;
    erro.value = null;

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não é suportada pelo seu navegador');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const localizacaoData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      localizacao.value = localizacaoData;
      return localizacaoData;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregando.value = false;
    }
  };

  // ===================== AÇÕES - PRESTADORES =====================

  const buscarPrestadoresProximos = async (): Promise<PrestadorMapaItem[]> => {
    if (!localizacao.value) {
      console.warn('Localização não disponível para buscar prestadores');
      return [];
    }

    carregandoPrestadores.value = true;
    erro.value = null;

    try {
      // ✅ Token é enviado automaticamente pelo interceptor do axios
      const response = await api.get('/prestadores/proximos', {
        params: {
          latitude: localizacao.value.lat,
          longitude: localizacao.value.lng,
          raio: filtros.value.raio_busca,
        },
      });

      if (response.data?.success && response.data.data) {
        prestadores.value = response.data.data;
        return prestadores.value;
      }

      prestadores.value = [];
      return [];
    } catch (error) {
      console.error('Erro ao buscar prestadores próximos:', error);
      erro.value = getErrorMessage(error);
      return [];
    } finally {
      carregandoPrestadores.value = false;
    }
  };

  const atualizarRaioBusca = async (novoRaio: number): Promise<void> => {
    filtros.value.raio_busca = novoRaio;
    await buscarPrestadoresProximos();
  };

  // ===================== AÇÕES - ROTAS =====================

  const obterIconeInstrucao = (type: string, modifier: string): string => {
    if (type === 'depart') return 'directions_car';
    if (type === 'arrive') return 'location_on';
    if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right')
      return 'turn_right';
    if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left')
      return 'turn_left';
    if (modifier === 'straight') return 'straight';
    if (modifier === 'uturn') return 'u_turn';
    return 'directions';
  };

  const calcularRota = async (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    nomeDestino: string,
  ): Promise<{
    rota: Array<[number, number]>;
    instrucoes: InstrucaoRota[];
    distancia: string;
    duracao: string;
  } | null> => {
    carregandoRota.value = true;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`,
      );
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Não foi possível calcular a rota');
      }

      const route = data.routes[0];
      if (!route) {
        throw new Error('Dados da rota inválidos');
      }

      const coordinates = route.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number],
      );

      const distanciaTotal = (route.distance / 1000).toFixed(1);
      const duracaoTotal = Math.round(route.duration / 60);

      const instrucoes: InstrucaoRota[] = [];

      instrucoes.push({
        texto: 'Sair da localização atual',
        icone: 'directions_car',
        distancia: '',
      });

      for (const leg of route.legs) {
        for (const step of leg.steps) {
          if (!step.maneuver) continue;

          let texto = step.maneuver.instruction || '';

          if (texto && typeof texto === 'string') {
            texto = texto.replace(/^[A-Za-z]+/, '').trim();
            texto = texto.charAt(0).toUpperCase() + texto.slice(1);
          } else {
            if (step.maneuver.type === 'turn') {
              texto = `Vire à ${step.maneuver.modifier === 'right' ? 'direita' : 'esquerda'}`;
            } else if (step.maneuver.type === 'new name') {
              texto = 'Continue';
            } else {
              texto = 'Siga em frente';
            }
          }

          if (step.name && step.name !== '' && texto && !texto.includes(step.name)) {
            if (step.maneuver.type === 'turn' || step.maneuver.type === 'new name') {
              texto = `${texto} na ${step.name}`;
            }
          }

          instrucoes.push({
            texto: texto,
            icone: obterIconeInstrucao(step.maneuver.type, step.maneuver.modifier),
            distancia: step.distance ? formatarDistanciaPasso(step.distance) : '',
          });
        }
      }

      instrucoes.push({
        texto: `Chegada ao destino: ${nomeDestino}`,
        icone: 'location_on',
        distancia: '',
      });

      return {
        rota: coordinates,
        instrucoes,
        distancia: distanciaTotal,
        duracao: duracaoTotal.toString(),
      };
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      erro.value = getErrorMessage(error);
      return null;
    } finally {
      carregandoRota.value = false;
    }
  };

  const limparRota = (): void => {
    if (routeLineInstance && mapInstance) {
      mapInstance.removeLayer(routeLineInstance);
      routeLineInstance = null;
    }
    rotaAtiva.value = false;
    instrucoesRota.value = [];
    resumoRota.value = { distancia: '0', duracao: '0' };
  };

  const fecharInstrucoes = (): void => {
    instrucoesRota.value = [];
    resumoRota.value = { distancia: '0', duracao: '0' };
    limparRota();
  };

  // ===================== AÇÕES - MAPA =====================

  const setMapInstance = (map: L.Map): void => {
    mapInstance = map;
  };

  const getUserMarker = (): L.Marker | null => userMarkerInstance;
  const setUserMarker = (marker: L.Marker): void => {
    userMarkerInstance = marker;
  };

  const getUserCircle = (): L.Circle | null => userCircleInstance;
  const setUserCircle = (circle: L.Circle): void => {
    userCircleInstance = circle;
  };

  const getMarkersLayer = (): L.LayerGroup | null => markersLayerInstance;
  const setMarkersLayer = (layer: L.LayerGroup): void => {
    markersLayerInstance = layer;
  };

  const getRouteLine = (): L.Polyline | null => routeLineInstance;
  const setRouteLine = (line: L.Polyline | null): void => {
    routeLineInstance = line;
  };

  const setRotaAtiva = (ativa: boolean): void => {
    rotaAtiva.value = ativa;
  };

  const setInstrucoesRota = (instrucoes: InstrucaoRota[]): void => {
    instrucoesRota.value = instrucoes;
  };

  const setResumoRota = (resumo: ResumoRota): void => {
    resumoRota.value = resumo;
  };

  const setPrestadorRotaId = (id: number | null): void => {
    prestadorRotaId.value = id;
  };

  // ===================== AÇÕES - UTILITÁRIOS =====================

  const resetImageError = (prestadorId: number): void => {
    delete imageErrors.value[prestadorId];
  };

  const limparStore = (): void => {
    prestadores.value = [];
    localizacao.value = null;
    erro.value = null;
    imageErrors.value = {};
    rotaAtiva.value = false;
    instrucoesRota.value = [];
    resumoRota.value = { distancia: '0', duracao: '0' };
    prestadorRotaId.value = null;
    carregando.value = false;
    carregandoMapa.value = true;
    carregandoPrestadores.value = false;
    carregandoRota.value = false;

    filtros.value = {
      raio_busca: 10,
      exibir_apenas_disponiveis: false,
      rating_minimo: 0,
    };

    mapInstance = null;
    userMarkerInstance = null;
    userCircleInstance = null;
    markersLayerInstance = null;
    routeLineInstance = null;
  };

  const carregarDadosIniciais = async (): Promise<void> => {
    carregandoMapa.value = true;
    try {
      const loc = await obterLocalizacao();
      if (loc) {
        await buscarPrestadoresProximos();
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      erro.value = getErrorMessage(error);
    } finally {
      carregandoMapa.value = false;
    }
  };

  return {
    carregando,
    carregandoMapa,
    carregandoPrestadores,
    carregandoRota,
    prestadorRotaId,
    prestadores,
    localizacao,
    erro,
    imageErrors,
    filtros,
    rotaAtiva,
    instrucoesRota,
    resumoRota,

    prestadoresFiltrados,
    hasLocation,
    locationStatusText,
    prestadoresCount,
    raioTexto,
    raioClasse,

    getInitials,
    getAvatarUrl,
    handleImageError,
    resetImageError,
    formatarDistancia,
    getErrorMessage,

    obterLocalizacao,
    buscarPrestadoresProximos,
    atualizarRaioBusca,
    calcularRota,
    limparRota,
    fecharInstrucoes,
    setPrestadorRotaId,
    setRotaAtiva,
    setInstrucoesRota,
    setResumoRota,
    setMapInstance,
    getUserMarker,
    setUserMarker,
    getUserCircle,
    setUserCircle,
    getMarkersLayer,
    setMarkersLayer,
    getRouteLine,
    setRouteLine,
    limparStore,
    carregarDadosIniciais,
  };
});

export default useMapaStore;
