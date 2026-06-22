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
          <div class="location-dot" :class="{ active: store.hasLocation }"></div>
          <span class="location-text">{{ store.locationStatusText }}</span>
        </div>
        <button class="refresh-button" @click="() => void centralizarNaLocalizacao()" :disabled="store.carregando">
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
        <div class="radius-card__value">{{ store.filtros.raio_busca }} km</div>
      </div>
      <div class="radius-card__slider">
        <input
          type="range"
          v-model.number="store.filtros.raio_busca"
          :min="1"
          :max="50"
          :step="1"
          @input="() => void onRaioChange()"
          class="radius-slider"
        />
        <div class="radius-marks">
          <span v-for="r in [1,5,10,20,30,50]" :key="r" class="radius-mark" :class="{ active: store.filtros.raio_busca >= r }">{{ r }}km</span>
        </div>
      </div>
      <div class="radius-card__stats">
        <div class="stats-count">
          <span class="count-number">{{ store.prestadoresCount }}</span>
          <span class="count-label">prestadores</span>
        </div>
        <div class="stats-badge" :class="`badge-${store.raioClasse}`">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          <span>Raio {{ store.raioTexto }}</span>
        </div>
      </div>
      <div class="radius-card__auto">
        <label class="auto-zoom-label">
          <input type="checkbox" v-model="autoZoomRadius" @change="toggleAutoZoomRadius" />
          <span>Ajustar zoom automaticamente pelo raio</span>
        </label>
      </div>
    </div>

    <!-- ===== MAPA ===== -->
    <div class="map-section">
      <div v-if="store.carregandoMapa" class="map-loader">
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

      <!-- Botão Limpar Rota -->
      <button v-if="store.rotaAtiva" class="clear-route" @click="() => void limparRota()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        <span>Limpar rota</span>
      </button>

      <!-- Botão Ver Rota -->
      <button
        v-if="store.rotaAtiva && !mostrarPainelInstrucoes && store.instrucoesRota.length > 0"
        class="show-route-btn"
        @click="abrirPainelInstrucoes"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
          <circle cx="12" cy="12" r="8"/>
        </svg>
        <span>Ver rota</span>
      </button>
    </div>

    <!-- ===== ROUTE PANEL ===== -->
    <transition name="route-slide">
      <div v-if="mostrarPainelInstrucoes && store.instrucoesRota.length > 0" class="route-panel">
        <div class="route-panel__header">
          <div class="route-info">
            <div class="route-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 22v-4M4 12H2M6 12H4M20 12h-2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
              </svg>
            </div>
            <div>
              <div class="route-title">Instruções da rota</div>
              <div class="route-meta">{{ store.resumoRota.distancia }} km · {{ store.resumoRota.duracao }} min</div>
            </div>
          </div>
          <button class="route-close" @click="fecharPainelInstrucoes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="route-steps">
          <div v-for="(inst, index) in store.instrucoesRota" :key="index" class="route-step">
            <div class="step-marker" :class="{ first: index === 0, last: index === store.instrucoesRota.length - 1 }">
              {{ index === 0 ? '🚗' : index === store.instrucoesRota.length - 1 ? '🏁' : index }}
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
        <span class="providers-count">{{ store.prestadoresCount }}</span>
      </div>

      <div v-if="store.carregandoPrestadores" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>

      <div v-else-if="store.prestadoresFiltrados.length === 0" class="empty-state">
        <div class="empty-illustration">🔍</div>
        <h4>Nenhum prestador encontrado</h4>
        <p>Tente aumentar o raio de busca</p>
        <button class="empty-action" @click="() => void expandirRaio(15)">
          Expandir para 15km
        </button>
      </div>

      <div v-else class="providers-list">
        <div
          v-for="prestador in store.prestadoresFiltrados"
          :key="prestador.id"
          class="provider-item"
          @click="() => void verPerfil(prestador.id)"
        >
          <div class="provider-avatar">
            <img :src="store.getAvatarUrl(prestador)" :alt="prestador.nome" @error="() => store.handleImageError(prestador.id)" />
            <div class="status-badge" :class="prestador.disponivel !== false ? 'online' : 'offline'"></div>
          </div>
          <div class="provider-details">
            <div class="provider-row">
              <h4 class="provider-name">{{ prestador.nome }}</h4>
              <div class="provider-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                  <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                </svg>
                <span>{{ (Number(prestador.media_avaliacao) || 0).toFixed(1) }}</span>
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
                {{ store.formatarDistancia(prestador.distancia) }}
              </span>
            </div>
          </div>
          <button class="route-button" @click.stop="() => void tracejarRota(prestador)" :disabled="store.carregandoRota && store.prestadorRotaId === prestador.id">
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
import { onMounted, onUnmounted, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapaStore, type PrestadorMapaItem } from 'src/stores/client/cliente-mapa-store';

defineOptions({ name: 'MapaPage' });

const MIN_ZOOM = 8;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 12;

const router = useRouter();
const $q = useQuasar();
const store = useMapaStore();

let map: L.Map | null = null;
let raioCircle: L.Circle | null = null;
let isAutoUpdating = false;
let rotaLine: L.Polyline | null = null;
let isMapInitialized = false;
const autoZoomRadius = ref(true);
const mostrarPainelInstrucoes = ref(false);

// ===================== FUNÇÕES AUXILIARES =====================

const formatarDistanciaPasso = (metros: number): string => {
  if (metros < 1000) return `${Math.round(metros)}m`;
  return `${(metros / 1000).toFixed(1)}km`;
};

// ===================== FUNÇÕES DO RAIO =====================

const calcularZoomPorRaio = (raioKm: number): number => {
  if (raioKm <= 2) return 15;
  if (raioKm <= 5) return 13;
  if (raioKm <= 10) return 12;
  if (raioKm <= 20) return 11;
  if (raioKm <= 30) return 10;
  if (raioKm <= 50) return 9;
  return 8;
};

const atualizarRaioCircle = (lat: number, lng: number, raioKm: number): void => {
  if (!map || !isMapInitialized) return;
  if (raioCircle) map.removeLayer(raioCircle);
  const raioMetros = raioKm * 1000;
  raioCircle = L.circle([lat, lng], {
    radius: raioMetros,
    color: '#5B4BF5',
    fillColor: '#5B4BF5',
    fillOpacity: 0.1,
    weight: 2,
    opacity: 0.6,
    dashArray: '8, 6',
  }).addTo(map);
  raioCircle.bindTooltip(`${raioKm} km`, { permanent: false, direction: 'center' });
};

const ajustarZoomParaRaio = (): void => {
  if (!autoZoomRadius.value || !map || !store.localizacao || isAutoUpdating || !isMapInitialized) return;
  isAutoUpdating = true;
  const zoomIdeal = calcularZoomPorRaio(store.filtros.raio_busca);
  map.setView([store.localizacao.lat, store.localizacao.lng], zoomIdeal);
  setTimeout(() => { isAutoUpdating = false; }, 500);
};

const toggleAutoZoomRadius = () => {
  if (autoZoomRadius.value && store.localizacao && isMapInitialized) ajustarZoomParaRaio();
};

// ===================== CONFIGURAÇÃO DO LEAFLET =====================

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

// ===================== FUNÇÃO PRINCIPAL: TRAÇAR ROTA =====================

const tracejarRota = async (prestador: PrestadorMapaItem): Promise<void> => {
  if (!store.localizacao) {
    $q.notify({ type: 'warning', message: 'Localização não disponível', position: 'top' });
    return;
  }

  if (!prestador.latitude || !prestador.longitude) {
    $q.notify({ type: 'warning', message: 'Prestador sem localização', position: 'top' });
    return;
  }

  store.setPrestadorRotaId(prestador.id);
  store.carregandoRota = true;

  try {
    const latUsuario = store.localizacao.lat;
    const lngUsuario = store.localizacao.lng;
    const latPrestador = Number(prestador.latitude);
    const lngPrestador = Number(prestador.longitude);

    const url = `https://router.project-osrm.org/route/v1/driving/${lngUsuario},${latUsuario};${lngPrestador},${latPrestador}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Não foi possível calcular a rota');
    }

    const route = data.routes[0];

    // 1. DESENHAR A ROTA NO MAPA
    const coordinates = route.geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]] as [number, number]
    );

    const distanciaTotal = (route.distance / 1000).toFixed(1);
    const duracaoTotal = Math.round(route.duration / 60);

    if (rotaLine && map && isMapInitialized) map.removeLayer(rotaLine);
    if (store.getRouteLine() && map && isMapInitialized) map.removeLayer(store.getRouteLine()!);

    if (map && isMapInitialized) {
      rotaLine = L.polyline(coordinates, {
        color: '#5B4BF5',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      store.setRouteLine(rotaLine);
      store.setRotaAtiva(true);

      // Ajustar zoom para ver a rota
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // 2. GERAR INSTRUÇÕES
    const instrucoes: Array<{ texto: string; icone: string; distancia: string }> = [];

    instrucoes.push({
      texto: '🚗 Sair da localização atual',
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
            texto = 'Continue em frente';
          } else {
            texto = 'Siga em frente';
          }
        }

        if (step.name && step.name !== '' && texto && !texto.includes(step.name)) {
          if (step.maneuver.type === 'turn' || step.maneuver.type === 'new name') {
            texto = `${texto} na ${step.name}`;
          }
        }

        const distanciaPasso = step.distance ? formatarDistanciaPasso(step.distance) : '';

        instrucoes.push({
          texto: texto,
          icone: step.maneuver.modifier || 'directions',
          distancia: distanciaPasso,
        });
      }
    }

    instrucoes.push({
      texto: `🏁 Chegada ao destino: ${prestador.nome}`,
      icone: 'location_on',
      distancia: '',
    });

    store.setInstrucoesRota(instrucoes);
    store.setResumoRota({
      distancia: distanciaTotal,
      duracao: duracaoTotal.toString(),
    });

    // Fechar painel se estiver aberto
    mostrarPainelInstrucoes.value = false;

    $q.notify({
      message: `🛣️ Rota calculada: ${distanciaTotal} km, ~${duracaoTotal} min`,
      color: 'positive',
      icon: 'directions',
      timeout: 3000,
      position: 'bottom',
      actions: [{
        label: 'Ver rota',
        color: 'white',
        handler: () => {
          mostrarPainelInstrucoes.value = true;
        }
      }]
    });

  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao calcular rota. Tente novamente.',
      position: 'top'
    });
  } finally {
    store.setPrestadorRotaId(null);
    store.carregandoRota = false;
  }
};

// ===================== FUNÇÕES DO PAINEL =====================

const abrirPainelInstrucoes = (): void => {
  if (store.instrucoesRota.length > 0) {
    mostrarPainelInstrucoes.value = true;
  }
};

const fecharPainelInstrucoes = (): void => {
  mostrarPainelInstrucoes.value = false;
};

// ===================== FUNÇÃO PARA LIMPAR ROTA =====================

const limparRota = (): void => {
  if (rotaLine && map && isMapInitialized) {
    map.removeLayer(rotaLine);
    rotaLine = null;
  }
  if (store.getRouteLine() && map && isMapInitialized) {
    map.removeLayer(store.getRouteLine()!);
    store.setRouteLine(null);
  }

  store.limparRota();
  mostrarPainelInstrucoes.value = false;

  $q.notify({
    message: 'Rota removida do mapa',
    color: 'info',
    icon: 'layers_clear',
    timeout: 1500,
    position: 'bottom'
  });
};

// ===================== FUNÇÕES DOS MARCADORES =====================

const criarMarcadorPrestador = (prestador: PrestadorMapaItem): L.Marker => {
  const lat = Number(prestador.latitude);
  const lng = Number(prestador.longitude);

  const fotoUrl = store.getAvatarUrl(prestador);
  const avaliacao = Number(prestador.media_avaliacao) || 0;

  const popupContent = `
    <div style="padding: 8px 12px; min-width: 200px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <img src="${fotoUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
        <div>
          <strong style="font-size: 14px;">${prestador.nome}</strong>
          <div style="font-size: 12px; color: #f59e0b;">⭐ ${avaliacao.toFixed(1)}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">
        📍 ${store.formatarDistancia(prestador.distancia)}
      </div>
      <button class="route-popup-btn" style="
        width: 100%;
        padding: 8px 12px;
        background: #5B4BF5;
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      ">
        🚗 Traçar rota
      </button>
    </div>
  `;

  const marker = L.marker([lat, lng]);
  marker.bindPopup(popupContent);

  marker.on('click', () => {
    void tracejarRota(prestador);
  });

  return marker;
};

const criarMarcadorUsuario = (): L.Marker => {
  const marker = L.marker([0, 0]);
  marker.bindPopup(`<div style="padding: 6px 12px; font-weight: 500;">📍 Você está aqui</div>`);
  return marker;
};

const atualizarMarcadores = (): void => {
  if (!map || !isMapInitialized) return;

  let markersLayer = store.getMarkersLayer();
  if (markersLayer) {
    markersLayer.clearLayers();
  } else {
    markersLayer = L.layerGroup().addTo(map);
    store.setMarkersLayer(markersLayer);
  }

  for (const prestador of store.prestadoresFiltrados) {
    if (prestador.latitude && prestador.longitude) {
      const marker = criarMarcadorPrestador(prestador);
      marker.addTo(markersLayer);
    }
  }
};

const atualizarLocalizacaoUsuario = (lat: number, lng: number, accuracy: number = 50): void => {
  if (!map || !isMapInitialized) return;

  try {
    const userMarker = store.getUserMarker();
    if (userMarker) userMarker.remove();

    const userCircle = store.getUserCircle();
    if (userCircle) userCircle.remove();

    const newMarker = criarMarcadorUsuario();
    newMarker.setLatLng([lat, lng]);
    newMarker.addTo(map);
    store.setUserMarker(newMarker);

    const newCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    store.setUserCircle(newCircle);

    atualizarRaioCircle(lat, lng, store.filtros.raio_busca);
    if (autoZoomRadius.value) ajustarZoomParaRaio();
  } catch (error) {
    console.error('Erro ao atualizar localização do usuário:', error);
  }
};

// ===================== FUNÇÕES DO MAPA =====================

const zoomIn = (): void => {
  if (map && isMapInitialized) map.setZoom(Math.min(map.getZoom() + 1, MAX_ZOOM));
};

const zoomOut = (): void => {
  if (map && isMapInitialized) map.setZoom(Math.max(map.getZoom() - 1, MIN_ZOOM));
};

const centralizarNaLocalizacao = (): void => {
  if (!map || !store.localizacao || !isMapInitialized) return;
  map.setView([store.localizacao.lat, store.localizacao.lng], DEFAULT_ZOOM);
  if (store.getUserMarker()) store.getUserMarker()?.openPopup();
  $q.notify({ message: 'Mapa centralizado na sua localização', color: 'info', icon: 'my_location', timeout: 1500, position: 'bottom' });
};

const verPerfil = (prestadorId: number): void => {
  void router.push(`/mobile/perfil-prestador/${prestadorId}`);
};

const expandirRaio = (novoRaio: number): void => {
  if (autoZoomRadius.value) autoZoomRadius.value = false;
  store.filtros.raio_busca = novoRaio;
  void onRaioChange();
};

const onRaioChange = async (): Promise<void> => {
  if (!store.localizacao) {
    $q.notify({ type: 'warning', message: 'Localização não disponível', position: 'top' });
    return;
  }
  if (store.rotaAtiva) limparRota();
  atualizarRaioCircle(store.localizacao.lat, store.localizacao.lng, store.filtros.raio_busca);
  if (autoZoomRadius.value) ajustarZoomParaRaio();
  await store.atualizarRaioBusca(store.filtros.raio_busca);
  atualizarMarcadores();
};

// ===================== INICIAR MAPA CORRIGIDO =====================

const iniciarMapa = async (): Promise<void> => {
  if (isMapInitialized) {
    console.warn('Mapa já está inicializado');
    return;
  }

  store.carregandoMapa = true;
  try {
    // 🔥 AGUARDAR O DOM SER RENDERIZADO
    await nextTick();

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Elemento do mapa não encontrado');
      store.carregandoMapa = false;
      return;
    }

    // 🔥 VERIFICAR SE O CONTAINER ESTÁ VISÍVEL
    if (mapContainer.offsetHeight === 0 || mapContainer.offsetWidth === 0) {
      console.warn('Container do mapa não está visível, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 300));
      // Tentar novamente
      const mapContainerRetry = document.getElementById('map');
      if (!mapContainerRetry || mapContainerRetry.offsetHeight === 0) {
        throw new Error('Container do mapa não está disponível');
      }
    }

    // 🔥 INICIALIZAR MAPA APENAS SE O CONTAINER EXISTIR
    map = L.map('map', {
      zoomControl: false,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    }).setView([-25.9692, 32.5732], DEFAULT_ZOOM);

    isMapInitialized = true;
    store.setMapInstance(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap, CARTO',
      maxZoom: MAX_ZOOM,
    }).addTo(map);

    // 🔥 FORÇAR O MAPA A CALCULAR O TAMANHO CORRETO
    const forceResize = () => {
      if (map && isMapInitialized) {
        try {
          map.invalidateSize();
          console.log('✅ Mapa redimensionado com sucesso');
        } catch (error) {
          console.warn('Erro ao redimensionar mapa:', error);
        }
      }
    };

    setTimeout(forceResize, 300);
    setTimeout(forceResize, 800);

    await store.carregarDadosIniciais();

    if (store.localizacao) {
      atualizarLocalizacaoUsuario(
        store.localizacao.lat,
        store.localizacao.lng,
        store.localizacao.accuracy
      );
      atualizarMarcadores();
    }

    console.log('✅ Mapa inicializado com sucesso');

  } catch (error) {
    console.error('Erro ao iniciar mapa:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar o mapa',
      position: 'top'
    });
  } finally {
    store.carregandoMapa = false;
  }
};

// ===================== CICLO DE VIDA =====================

onMounted(() => {
  // 🔥 CORRIGIDO: Dar tempo para o DOM renderizar
  const intervalId = setInterval(() => {
    const mapContainer = document.getElementById('map');
    if (mapContainer && mapContainer.offsetHeight > 0) {
      clearInterval(intervalId);
      void iniciarMapa();
    }
  }, 100);

  // Timeout de segurança - se não carregar em 5 segundos, tentar mesmo assim
  setTimeout(() => {
    clearInterval(intervalId);
    if (!isMapInitialized) {
      void iniciarMapa();
    }
  }, 5000);

  window.addEventListener('resize', () => {
    if (map && isMapInitialized) {
      setTimeout(() => {
        try {
          if (map) map.invalidateSize();
        } catch (error) {
          console.warn('Erro no resize do mapa:', error);
        }
      }, 200);
    }
  });
});

onUnmounted(() => {
  try {
    if (rotaLine && map && isMapInitialized) map.removeLayer(rotaLine);
    if (raioCircle && map && isMapInitialized) map.removeLayer(raioCircle);
    if (map) {
      map.remove();
      map = null;
    }
    isMapInitialized = false;
    store.limparStore();
  } catch (error) {
    console.warn('Erro ao limpar mapa:', error);
  }
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
    margin-bottom: 12px;
  }

  &__auto {
    border-top: 1px solid $border;
    padding-top: 12px;
    margin-top: 4px;
  }
}

.auto-zoom-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: $gray;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: $primary;
  }

  &:hover {
    color: $dark;
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

.show-route-btn {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: $primary;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  color: $white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(91, 75, 245, 0.3);
  transition: all 0.2s;
  z-index: 500;

  &:hover {
    background: darken($primary, 10%);
    transform: scale(1.02);
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
