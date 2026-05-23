<template>
  <div class="mapa-page">

    <!-- ===== TOP BAR MODERNA ===== -->
    <div class="top-bar">
      <div class="top-bar__container">
        <button class="back-button" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div class="location-info">
          <div class="location-dot" :class="{ active: locationStore.hasLocation }"></div>
          <span class="location-text">{{ locationStatusText }}</span>
        </div>
        <button class="refresh-button" @click="() => void centralizarNaLocalizacao()" :disabled="locationStore.isLoading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== RADIUS SELECTOR MODERNO ===== -->
    <div class="radius-card">
      <div class="radius-card__header">
        <div class="radius-card__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
            <circle cx="12" cy="12" r="8"/>
          </svg>
          <span>Área de busca</span>
        </div>
        <div class="radius-card__value">{{ filtroDistancia }} km</div>
      </div>
      <div class="radius-card__slider">
        <input
          type="range"
          v-model.number="filtroDistancia"
          :min="5"
          :max="50"
          :step="5"
          @input="(e: Event) => void alterarRaio(Number((e.target as HTMLInputElement).value))"
          class="radius-slider"
        />
        <div class="radius-marks">
          <span v-for="r in [5,10,15,20,30,50]" :key="r" class="radius-mark" :class="{ active: filtroDistancia >= r }">{{ r }}km</span>
        </div>
      </div>
      <div class="radius-card__stats">
        <div class="stats-count">
          <span class="count-number">{{ prestadoresFiltrados.length }}</span>
          <span class="count-label">prestadores</span>
        </div>
        <div class="stats-badge" :class="getRadiusLevelClass()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          <span>Raio {{ getRadiusLevelText() }}</span>
        </div>
      </div>
    </div>

    <!-- ===== MAPA ===== -->
    <div class="map-section">
      <div v-if="carregando" class="map-loader">
        <div class="loader"></div>
        <p>A carregar mapa...</p>
      </div>
      <div id="map" class="map-element"></div>

      <!-- Controles flutuantes -->
      <div class="map-controls">
        <button class="control-btn zoom-in" @click="zoomIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
        <div class="control-divider"></div>
        <button class="control-btn zoom-out" @click="zoomOut">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
          </svg>
        </button>
      </div>

      <button v-if="rotaAtiva" class="clear-route" @click="() => void limparRota()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span>Limpar rota</span>
      </button>
    </div>

    <!-- ===== ROUTE PANEL ===== -->
    <transition name="route-slide">
      <div v-if="instrucoesRota.length > 0" class="route-panel">
        <div class="route-panel__header">
          <div class="route-info">
            <div class="route-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
              </svg>
            </div>
            <div>
              <div class="route-title">Rota calculada</div>
              <div class="route-meta">{{ resumoRota.distancia }} km · {{ resumoRota.duracao }} min</div>
            </div>
          </div>
          <button class="route-close" @click="() => void fecharInstrucoes()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="route-steps">
          <div v-for="(inst, index) in instrucoesRota" :key="index" class="route-step">
            <div class="step-marker" :class="{ first: index === 0, last: index === instrucoesRota.length - 1 }">
              {{ index === 0 ? '📍' : index + 1 }}
            </div>
            <div class="step-content">
              <div class="step-text">{{ inst.texto }}</div>
              <div v-if="inst.distancia" class="step-distance">{{ inst.distancia }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== PROVIDERS LIST ===== -->
    <div class="providers-section">
      <div class="providers-header">
        <h3>Prestadores próximos</h3>
        <span class="providers-count">{{ prestadoresFiltrados.length }}</span>
      </div>

      <div v-if="carregandoPrestadores" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>

      <div v-else-if="prestadoresFiltrados.length === 0" class="empty-state">
        <div class="empty-illustration">🔍</div>
        <h4>Nenhum prestador encontrado</h4>
        <p>Tente aumentar o raio de busca</p>
        <button class="empty-action" @click="() => void expandirRaio(15)">
          Expandir para 15km
        </button>
      </div>

      <div v-else class="providers-list">
        <div
          v-for="prestador in prestadoresFiltrados"
          :key="prestador.id"
          class="provider-item"
          @click="() => void verPerfil(prestador.id)"
        >
          <div class="provider-avatar">
            <img :src="obterFotoPrestador(prestador)" :alt="prestador.nome" @error="(e) => handleImageError(e, prestador)" />
            <div class="status-badge" :class="prestador.disponivel !== false ? 'online' : 'offline'"></div>
          </div>
          <div class="provider-details">
            <div class="provider-row">
              <h4 class="provider-name">{{ prestador.nome }}</h4>
              <div class="provider-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                  <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                </svg>
                <span>{{ (prestador.media_avaliacao || 0).toFixed(1) }}</span>
              </div>
            </div>
            <div class="provider-row">
              <span class="provider-category">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                </svg>
                {{ prestador.profissao || 'Profissional' }}
              </span>
              <span class="provider-distance">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ formatarDistancia(prestador.distancia) }}
              </span>
            </div>
          </div>
          <button class="route-button" @click.stop="() => void tracejarRota(prestador)" :disabled="carregandoRota && prestadorRotaId === prestador.id">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClientePublicStore, type PrestadorData } from 'src/stores/client/cliente-public-store';
import { useLocationStore } from 'src/stores/location-store';

defineOptions({ name: 'MapaPage' });

interface InstrucaoRota {
  texto: string;
  icone: string;
  distancia: string;
}

const iconDefault = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = iconDefault;

const MIN_ZOOM = 12;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 13;

const router = useRouter();
const $q = useQuasar();
const publicStore = useClientePublicStore();
const locationStore = useLocationStore();

const carregando = ref(true);
const carregandoPrestadores = ref(true);
const carregandoRota = ref(false);
const prestadorRotaId = ref<number | null>(null);
const filtroDistancia = ref(10);
const localizacaoAtual = ref<{ lat: number; lng: number } | null>(null);
const imageErrors = ref<Record<number, boolean>>({});
const rotaAtiva = ref(false);
let routeLine: L.Polyline | null = null;
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
let userCircle: L.Circle | null = null;
let markersLayer: L.LayerGroup | null = null;

const instrucoesRota = ref<InstrucaoRota[]>([]);
const resumoRota = ref({ distancia: '0', duracao: '0' });

const prestadoresFiltrados = computed(() => {
  return publicStore.prestadoresProximos.filter((p) => (p.distancia || 0) <= filtroDistancia.value);
});

const locationStatusText = computed(() => {
  if (locationStore.hasLocation) return 'Localização ativa';
  if (locationStore.isLoading) return 'A obter localização...';
  return 'Localização indisponível';
});

const getRadiusLevelClass = () => {
  if (filtroDistancia.value <= 10) return 'badge-close';
  if (filtroDistancia.value <= 20) return 'badge-medium';
  return 'badge-wide';
};

const getRadiusLevelText = () => {
  if (filtroDistancia.value <= 10) return 'próximo';
  if (filtroDistancia.value <= 20) return 'médio';
  return 'amplo';
};

const expandirRaio = (novoRaio: number) => {
  filtroDistancia.value = novoRaio;
  void alterarRaio(novoRaio);
};

const zoomIn = () => {
  if (map) {
    const currentZoom = map.getZoom();
    const newZoom = Math.min(currentZoom + 1, MAX_ZOOM);
    map.setZoom(newZoom);
  }
};

const zoomOut = () => {
  if (map) {
    const currentZoom = map.getZoom();
    const newZoom = Math.max(currentZoom - 1, MIN_ZOOM);
    map.setZoom(newZoom);
  }
};

const obterIconeInstrucao = (type: string, modifier: string): string => {
  if (type === 'depart') return 'directions_car';
  if (type === 'arrive') return 'location_on';
  if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right') return 'turn_right';
  if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left') return 'turn_left';
  if (modifier === 'straight') return 'straight';
  if (modifier === 'uturn') return 'u_turn';
  return 'directions';
};

const formatarDistanciaPasso = (metros: number): string => {
  if (metros < 1000) return `${Math.round(metros)}m`;
  return `${(metros / 1000).toFixed(1)}km`;
};

const obterIniciais = (nome: string): string => {
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

const obterFotoPrestador = (prestador: PrestadorData): string => {
  if (imageErrors.value[prestador.id]) {
    const iniciais = obterIniciais(prestador.nome);
    return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
  }
  if (prestador.foto) return prestador.foto;
  const iniciais = obterIniciais(prestador.nome);
  return `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
};

const handleImageError = (event: Event, prestador: PrestadorData) => {
  const img = event.target as HTMLImageElement;
  if (!imageErrors.value[prestador.id]) {
    imageErrors.value[prestador.id] = true;
    const iniciais = obterIniciais(prestador.nome);
    img.src = `https://ui-avatars.com/api/?background=5B4BF5&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
  }
};

const formatarDistancia = (distancia?: number): string => {
  if (!distancia && distancia !== 0) return '? km';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${distancia.toFixed(1)}km`;
};

const verPerfil = (prestadorId: number): void => {
  void router.push(`/mobile/perfil-prestador/${prestadorId}`);
};

const limparRota = (): void => {
  if (routeLine && map) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
  rotaAtiva.value = false;
  instrucoesRota.value = [];
  resumoRota.value = { distancia: '0', duracao: '0' };
  $q.notify({ message: 'Rota removida', color: 'info', icon: 'layers_clear', timeout: 1500, position: 'bottom' });
};

const fecharInstrucoes = (): void => {
  instrucoesRota.value = [];
  resumoRota.value = { distancia: '0', duracao: '0' };
  limparRota();
};

const tracejarRota = (prestador: PrestadorData): void => {
  if (!localizacaoAtual.value || !prestador.latitude || !prestador.longitude) {
    $q.notify({ type: 'warning', message: 'Localização não disponível', position: 'top' });
    return;
  }

  carregandoRota.value = true;
  prestadorRotaId.value = prestador.id;

  void desenharRotaNoMapa(
    localizacaoAtual.value.lat,
    localizacaoAtual.value.lng,
    prestador.latitude,
    prestador.longitude,
    prestador.nome,
  ).finally(() => {
    carregandoRota.value = false;
    prestadorRotaId.value = null;
  });
};

const desenharRotaNoMapa = async (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  nomeDestino: string,
): Promise<void> => {
  if (!map) return;

  if (lat1 === lat2 && lng1 === lng2) {
    $q.notify({ type: 'warning', message: 'Você já está na localização deste prestador!', position: 'top' });
    return;
  }

  if (routeLine && map) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

  instrucoesRota.value = [];
  resumoRota.value = { distancia: '0', duracao: '0' };

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`,
    );
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      $q.notify({ type: 'warning', message: 'Não foi possível calcular a rota', position: 'top' });
      return;
    }

    const route = data.routes[0];
    if (!route) {
      $q.notify({ type: 'warning', message: 'Dados da rota inválidos', position: 'top' });
      return;
    }

    const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    routeLine = L.polyline(coordinates as L.LatLngExpression[], {
      color: '#5B4BF5',
      weight: 5,
      opacity: 0.8,
    }).addTo(map);

    rotaAtiva.value = true;

    const distanciaTotal = (route.distance / 1000).toFixed(1);
    const duracaoTotal = Math.round(route.duration / 60);
    resumoRota.value = { distancia: distanciaTotal, duracao: duracaoTotal.toString() };

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

    instrucoesRota.value = instrucoes;

    $q.notify({
      message: `Rota calculada: ${distanciaTotal} km, ~${duracaoTotal} min`,
      color: 'positive',
      icon: 'directions',
      timeout: 3000,
      position: 'bottom',
    });

    const bounds = L.latLngBounds(coordinates as L.LatLngExpression[]);
    map.fitBounds(bounds, { padding: [50, 50] });
  } catch (error) {
    console.error('Erro ao desenhar rota:', error);
    $q.notify({ type: 'negative', message: 'Erro ao calcular rota', position: 'top' });
  }
};

const centralizarNaLocalizacao = (): void => {
  if (!map || !localizacaoAtual.value) {
    console.warn('Mapa ou localização não disponível');
    return;
  }
  map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], DEFAULT_ZOOM);
  if (userMarker) userMarker.openPopup();

  $q.notify({
    message: 'Mapa centralizado na sua localização',
    color: 'info',
    icon: 'my_location',
    timeout: 1500,
    position: 'bottom',
  });
};

const ajustarZoomParaMarcadores = (): void => {
  if (!map) return;

  const bounds = L.latLngBounds([]);
  let hasPoints = false;

  if (localizacaoAtual.value) {
    bounds.extend([localizacaoAtual.value.lat, localizacaoAtual.value.lng]);
    hasPoints = true;
  }

  for (const prestador of prestadoresFiltrados.value) {
    if (prestador.latitude && prestador.longitude) {
      bounds.extend([prestador.latitude, prestador.longitude]);
      hasPoints = true;
    }
  }

  if (hasPoints && bounds.isValid()) {
    map.fitBounds(bounds, { padding: [50, 50] });
  } else if (localizacaoAtual.value) {
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], DEFAULT_ZOOM);
  } else {
    map.setView([-25.9692, 32.5732], DEFAULT_ZOOM);
  }
};

const criarMarcadorPrestador = (prestador: PrestadorData): L.Marker => {
  const fotoUrl = prestador.foto || obterFotoPrestador(prestador);

  const popupContent = `
    <div style="padding: 8px 12px; min-width: 180px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <img src="${fotoUrl}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
        <div>
          <strong style="font-size: 14px;">${prestador.nome}</strong>
          <div style="font-size: 12px; color: #f59e0b;">⭐ ${(prestador.media_avaliacao || 0).toFixed(1)}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #6b7280;">📍 ${formatarDistancia(prestador.distancia)}</div>
    </div>
  `;

  const marker = L.marker([prestador.latitude!, prestador.longitude!]);
  marker.bindPopup(popupContent);
  return marker;
};

const criarMarcadorUsuario = (): L.Marker => {
  // ✅ VERIFICAR SE L ESTÁ DISPONÍVEL
  if (!L || !L.marker) {
    console.error('Leaflet não está disponível');
    return {} as L.Marker;
  }

  const marker = L.marker([0, 0]);
  marker.bindPopup(`<div style="padding: 6px 12px; font-weight: 500;">📍 Você está aqui</div>`);
  return marker;
};

const atualizarMarcadores = (): void => {
  if (!map) return;
  if (markersLayer) markersLayer.clearLayers();
  else markersLayer = L.layerGroup().addTo(map);

  let temPrestadores = false;
  for (const prestador of prestadoresFiltrados.value) {
    if (prestador.latitude && prestador.longitude) {
      const marker = criarMarcadorPrestador(prestador);
      marker.addTo(markersLayer);
      temPrestadores = true;
    }
  }
  if (temPrestadores) {
    setTimeout(() => ajustarZoomParaMarcadores(), 100);
  } else if (localizacaoAtual.value) {
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], DEFAULT_ZOOM);
  }
};

// ✅ FUNÇÃO CORRIGIDA
const atualizarLocalizacaoUsuario = (lat: number, lng: number, accuracy: number = 50): void => {
  // ✅ VERIFICAÇÃO MAIS RÍGIDA
  if (!map || !map.getContainer()) {
    console.warn('Mapa não está pronto para atualizar localização');
    return;
  }

  try {
    if (userMarker) userMarker.remove();
    if (userCircle) userCircle.remove();

    userMarker = criarMarcadorUsuario();
    userMarker.setLatLng([lat, lng]);
    userMarker.addTo(map);

    userCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#5B4BF5',
      fillColor: '#5B4BF5',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);

    localizacaoAtual.value = { lat, lng };
    setTimeout(() => ajustarZoomParaMarcadores(), 100);
  } catch (error) {
    console.error('Erro ao atualizar localização do usuário:', error);
  }
};

// ✅ FUNÇÃO INICIAR CORRIGIDA
const iniciar = async (): Promise<void> => {
  carregando.value = true;
  try {
    // ✅ AGUARDAR O PRÓXIMO TICK PARA O DOM ESTAR PRONTO
    await nextTick();

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Elemento do mapa não encontrado');
      carregando.value = false;
      return;
    }

    map = L.map('map', {
      zoomControl: false,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    }).setView([-25.9692, 32.5732], DEFAULT_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap, CARTO',
      maxZoom: MAX_ZOOM,
    }).addTo(map);

    // ✅ FORÇAR INVALIDATE SIZE APÓS CRIAR
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);

    const posicao = await locationStore.getCurrentLocation(true);
    if (posicao) {
      // ✅ SÓ ATUALIZAR LOCALIZAÇÃO DEPOIS QUE O MAPA ESTIVER PRONTO
      atualizarLocalizacaoUsuario(posicao.lat, posicao.lng, posicao.accuracy || 50);
      await publicStore.fetchPrestadoresProximos(posicao.lat, posicao.lng, filtroDistancia.value, true);
      atualizarMarcadores();
    } else {
      if (map) map.setView([-25.9692, 32.5732], DEFAULT_ZOOM);
    }
  } catch (error) {
    console.error('Erro ao iniciar mapa:', error);
  } finally {
    carregando.value = false;
    carregandoPrestadores.value = false;
  }
};

const alterarRaio = async (novoRaio: number): Promise<void> => {
  if (novoRaio === filtroDistancia.value) return;
  if (!localizacaoAtual.value) {
    $q.notify({ type: 'warning', message: 'Localização não disponível', position: 'top' });
    return;
  }
  if (rotaAtiva.value) limparRota();

  carregandoPrestadores.value = true;
  try {
    await publicStore.fetchPrestadoresProximos(localizacaoAtual.value.lat, localizacaoAtual.value.lng, novoRaio, true);
    atualizarMarcadores();
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao buscar prestadores', position: 'top' });
  } finally {
    carregandoPrestadores.value = false;
  }
};

watch(prestadoresFiltrados, () => atualizarMarcadores(), { deep: true });

onMounted(() => {
  setTimeout(() => void iniciar(), 100);
  window.addEventListener('resize', () => {
    if (map && map.getContainer()) {
      setTimeout(() => { if (map) map.invalidateSize(); }, 200);
    }
  });
});

onUnmounted(() => {
  if (routeLine && map) map.removeLayer(routeLine);
  if (map) map.remove();
});
</script>

<style scoped lang="scss">
// =====================
// VARIABLES
// =====================
$primary: #5B4BF5;
$primary-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;

// =====================
// GLOBAL
// =====================
.mapa-page {
  background: $white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

// =====================
// TOP BAR
// =====================
.top-bar {
  padding: 12px 20px;
  background: $white;
  border-bottom: 1px solid $border;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.back-button, .refresh-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gray-light;
  border: none;
  cursor: pointer;
  color: $gray;
  transition: all 0.2s;

  &:hover {
    background: $primary-light;
    color: $primary;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $gray;

  &.active {
    background: $success;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
}

.location-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: $dark;
}

// =====================
// RADIUS CARD
// =====================
.radius-card {
  background: $white;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid $border;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: $dark;

    svg {
      color: $primary;
    }
  }

  &__value {
    font-size: 1.1rem;
    font-weight: 700;
    color: $primary;
  }

  &__slider {
    margin-bottom: 16px;
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.radius-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: $border;
  border-radius: 4px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: $primary;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(91, 75, 245, 0.3);
  }
}

.radius-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
}

.radius-mark {
  font-size: 0.6rem;
  color: $gray;
  transition: color 0.2s;

  &.active {
    color: $primary;
    font-weight: 500;
  }
}

.stats-count {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .count-number {
    font-size: 1.2rem;
    font-weight: 700;
    color: $dark;
  }

  .count-label {
    font-size: 0.7rem;
    color: $gray;
  }
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;

  &.badge-close {
    background: rgba(16, 185, 129, 0.1);
    color: $success;
  }

  &.badge-medium {
    background: rgba(91, 75, 245, 0.1);
    color: $primary;
  }

  &.badge-wide {
    background: rgba(245, 158, 11, 0.1);
    color: $warning;
  }
}

// =====================
// MAP SECTION
// =====================
.map-section {
  position: relative;
  height: 35vh;
  min-height: 260px;
  background: $gray-light;
  margin: 0 16px;
  border-radius: 20px;
  overflow: hidden;
}

.map-element {
  width: 100%;
  height: 100%;
}

.map-loader {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  p {
    font-size: 0.8rem;
    color: $gray;
  }
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid $primary-light;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: $white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.control-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $white;
  border: none;
  cursor: pointer;
  color: $gray;
  transition: all 0.2s;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

.control-divider {
  height: 1px;
  background: $border;
  margin: 0;
}

.clear-route {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: $white;
  border: none;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 500;
  color: $danger;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    background: $danger;
    color: $white;
  }
}

// =====================
// ROUTE PANEL
// =====================
.route-panel {
  position: absolute;
  bottom: 20px;
  left: 16px;
  right: 16px;
  background: $white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: $primary;
    color: $white;
  }
}

.route-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.route-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-title {
  font-size: 0.85rem;
  font-weight: 600;
}

.route-meta {
  font-size: 0.7rem;
  opacity: 0.8;
}

.route-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  color: $white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.route-steps {
  overflow-y: auto;
  padding: 12px 0;
}

.route-step {
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.step-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: $primary-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: $primary;

  &.first {
    background: $success;
    color: $white;
    font-size: 0.8rem;
  }

  &.last {
    background: $warning;
    color: $white;
  }
}

.step-content {
  flex: 1;
}

.step-text {
  font-size: 0.8rem;
  color: $dark;
  line-height: 1.4;
}

.step-distance {
  font-size: 0.65rem;
  color: $gray;
  margin-top: 2px;
}

.route-slide-enter-active, .route-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.route-slide-enter-from, .route-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

// =====================
// PROVIDERS SECTION
// =====================
.providers-section {
  flex: 1;
  overflow-y: auto;
  background: $white;
  margin-top: 8px;
  border-radius: 20px 20px 0 0;
}

.providers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  background: $white;
  z-index: 5;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

.providers-count {
  background: $primary-light;
  color: $primary;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

// =====================
// PROVIDER CARD
// =====================
.providers-list {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $white;
  border-radius: 16px;
  border: 1px solid $border;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateX(4px);
    border-color: $primary;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.provider-avatar {
  position: relative;
  flex-shrink: 0;

  img {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.status-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid $white;

  &.online {
    background: $success;
  }

  &.offline {
    background: $gray;
  }
}

.provider-details {
  flex: 1;
}

.provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.provider-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: $dark;
  margin: 0;
}

.provider-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 500;
  color: $dark;
}

.provider-category, .provider-distance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: $gray;
}

.route-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gray-light;
  border: none;
  cursor: pointer;
  color: $gray;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: $primary-light;
    color: $primary;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// =====================
// SKELETON
// =====================
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-list {
  padding: 12px 16px;
}

.skeleton-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border;
}

.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(90deg, $border 25%, $gray-light 50%, $border 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-lines {
  flex: 1;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  margin: 6px 0;
  background: linear-gradient(90deg, $border 25%, $gray-light 50%, $border 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-60 { width: 60%; }
.w-80 { width: 80%; }
.w-40 { width: 40%; }

// =====================
// EMPTY STATE
// =====================
.empty-state {
  text-align: center;
  padding: 48px 20px;

  .empty-illustration {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.8rem;
    color: $gray;
    margin-bottom: 16px;
  }
}

.empty-action {
  background: $primary-light;
  color: $primary;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $primary;
    color: $white;
  }
}

// =====================
// SCROLLBAR
// =====================
.providers-section::-webkit-scrollbar {
  width: 4px;
}

.providers-section::-webkit-scrollbar-track {
  background: $border;
}

.providers-section::-webkit-scrollbar-thumb {
  background: $primary;
  border-radius: 4px;
}
</style>
