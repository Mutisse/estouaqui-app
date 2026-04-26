<template>
  <q-page class="mapa-page">
    <!-- Header -->
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="header-title">Prestadores próximos</div>
      <q-btn
        flat
        round
        icon="my_location"
        color="primary"
        @click="centralizarNaLocalizacao"
        :loading="locationStore.isLoading"
      >
        <q-tooltip>Minha localização</q-tooltip>
      </q-btn>
    </div>

    <!-- Status da localização -->
    <div v-if="locationStore.hasLocation" class="status-bar q-px-md q-py-xs">
      <div class="flex items-center">
        <q-icon name="gps_fixed" color="positive" size="16px" class="q-mr-xs" />
        <span class="text-caption">Localização atual obtida</span>
        <span v-if="locationStore.accuracy" class="text-caption q-ml-sm text-grey-7">
          (precisão: {{ locationStore.accuracy.toFixed(0) }}m)
        </span>
      </div>
    </div>

    <div v-else-if="locationStore.isLoading" class="status-bar q-px-md q-py-xs">
      <div class="flex items-center">
        <q-spinner size="16px" class="q-mr-xs" />
        <span class="text-caption">A obter localização...</span>
      </div>
    </div>

    <div v-else class="status-bar q-px-md q-py-xs bg-warning">
      <div class="flex items-center">
        <q-icon name="warning" color="warning" size="16px" class="q-mr-xs" />
        <span class="text-caption"
          >Localização não disponível. Clique no ícone de localização.</span
        >
      </div>
    </div>

    <!-- Filtro de Raio -->
    <div class="filtro-raio q-pa-md">
      <div class="row items-center justify-between">
        <div class="text-subtitle2">
          <q-icon name="radar" size="18px" class="q-mr-xs text-primary" />
          Raio de busca
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="raio in opcoesRaio"
            :key="raio.value"
            :label="raio.label"
            :color="filtroDistancia === raio.value ? 'primary' : 'grey-4'"
            :text-color="filtroDistancia === raio.value ? 'white' : 'dark'"
            :outline="filtroDistancia !== raio.value"
            dense
            rounded
            size="sm"
            @click="alterarRaio(raio.value)"
          />
        </div>
      </div>
      <div class="text-caption text-grey-6 q-mt-sm">
        Mostrando <strong>{{ prestadoresFiltrados.length }}</strong> prestadores num raio de
        <strong>{{ filtroDistancia }} km</strong>
      </div>
    </div>

    <!-- Loading do Mapa -->
    <div v-if="carregando" class="loading-container">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-sm text-grey-7">A carregar mapa...</p>
    </div>

    <!-- Mapa -->
    <div class="map-container">
      <div id="map"></div>
    </div>

    <!-- Lista de prestadores com SKELETON LOADING -->
    <div class="prestadores-list q-pa-md">
      <div class="text-subtitle1 q-mb-md">
        Prestadores encontrados ({{ prestadoresFiltrados.length }})
      </div>

      <!-- SKELETON LOADING (Facebook style) -->
      <div v-if="carregandoPrestadores" class="skeleton-container">
        <div v-for="i in 5" :key="i" class="skeleton-item">
          <q-skeleton type="circle" size="50px" />
          <div class="skeleton-content">
            <q-skeleton type="text" width="120px" height="18px" />
            <q-skeleton type="text" width="200px" height="14px" class="q-mt-sm" />
            <q-skeleton type="text" width="150px" height="12px" class="q-mt-xs" />
          </div>
        </div>
      </div>

      <!-- Lista vazia -->
      <div v-else-if="prestadoresFiltrados.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="48px" color="grey" />
        <div class="text-subtitle1 q-mt-sm">Nenhum prestador encontrado</div>
        <div class="text-caption q-mt-xs">Tente aumentar o raio de busca</div>
      </div>

      <!-- Lista de prestadores -->
      <q-list separator v-else>
        <q-item
          v-for="prestador in prestadoresFiltrados"
          :key="prestador.id"
          clickable
          v-ripple
          @click="verPerfil(prestador.id)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="
                  prestador.foto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome)}&background=667eea&color=fff`
                "
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ prestador.nome }}</q-item-label>
            <q-item-label caption>
              <div class="flex items-center gap-2">
                <div class="flex items-center">
                  <q-icon name="star" color="amber" size="14px" />
                  <span>{{ (prestador.media_avaliacao || 0).toFixed(1) }}</span>
                </div>
                <div class="flex items-center">
                  <q-icon name="place" color="blue" size="14px" />
                  <span>{{ formatarDistancia(prestador.distancia) }}</span>
                </div>
                <q-badge :color="prestador.disponivel !== false ? 'positive' : 'negative'">
                  {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
                </q-badge>
              </div>
            </q-item-label>
            <!-- ✅ MOSTRAR PROFISSÃO em vez de categorias vazias -->
            <q-item-label caption class="text-grey-7">
              <q-icon name="work" size="12px" class="q-mr-xs" />
              {{ prestador.profissao || 'Profissional' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              icon="directions"
              flat
              round
              dense
              color="primary"
              @click.stop="tracejarRota(prestador)"
              :loading="carregandoRota && prestadorRotaId === prestador.id"
            >
              <q-tooltip>Traçar rota</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClienteStore } from 'src/stores/cliente-store';
import { useLocationStore } from 'src/stores/location-store';
import type { PrestadorData } from 'src/stores/cliente-store';

defineOptions({ name: 'MapaPage' });

// Configurar ícones do Leaflet
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

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();
const locationStore = useLocationStore();

// Estados
const carregando = ref(true);
const carregandoPrestadores = ref(true);
const carregandoRota = ref(false);
const prestadorRotaId = ref<number | null>(null);
const filtroDistancia = ref(10);
const localizacaoAtual = ref<{ lat: number; lng: number } | null>(null);

// Opções
const opcoesRaio = [
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
  { label: '15km', value: 15 },
  { label: '20km', value: 20 },
  { label: '30km', value: 30 },
  { label: '50km', value: 50 },
];

// Computed
const prestadoresFiltrados = computed(() => {
  return clienteStore.prestadoresProximos.filter(
    (p) => (p.distancia || 0) <= filtroDistancia.value,
  );
});

// Variáveis do mapa
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
let userCircle: L.Circle | null = null;
let markersLayer: L.LayerGroup | null = null;

// Funções
const formatarDistancia = (distancia?: number): string => {
  if (!distancia && distancia !== 0) return '? km';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${distancia.toFixed(1)}km`;
};

const verPerfil = (prestadorId: number): void => {
  void router.push(`/mobile/perfil-prestador/${prestadorId}`);
};

const tracejarRota = (prestador: PrestadorData): void => {
  if (!localizacaoAtual.value || !prestador.latitude || !prestador.longitude) return;

  carregandoRota.value = true;
  prestadorRotaId.value = prestador.id;

  try {
    const url = `https://www.google.com/maps/dir/${localizacaoAtual.value.lat},${localizacaoAtual.value.lng}/${prestador.latitude},${prestador.longitude}`;
    window.open(url, '_blank');

    $q.notify({
      message: 'Abrindo rota no Google Maps',
      color: 'positive',
      icon: 'directions',
      timeout: 2000,
    });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao abrir rota', position: 'top' });
  } finally {
    carregandoRota.value = false;
    prestadorRotaId.value = null;
  }
};

const centralizarNaLocalizacao = (): void => {
  if (!localizacaoAtual.value || !map) return;
  map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 15);
  if (userMarker) userMarker.openPopup();
};

const criarMarcadorPrestador = (prestador: PrestadorData): L.Marker => {
  const marker = L.marker([prestador.latitude!, prestador.longitude!]);

  marker.bindPopup(`
    <div style="min-width: 180px; padding: 5px;">
      <strong>${prestador.nome}</strong><br/>
      ⭐ ${(prestador.media_avaliacao || 0).toFixed(1)}<br/>
      📍 ${formatarDistancia(prestador.distancia)}<br/>
      💼 ${prestador.profissao || 'Profissional'}<br/>
      <button onclick="window.location.href='#/mobile/perfil-prestador/${prestador.id}'"
              style="background: #667eea; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 8px; width: 100%; cursor: pointer;">
        Ver perfil
      </button>
    </div>
  `);

  return marker;
};

const criarMarcadorUsuario = (): L.Marker => {
  const marker = L.marker([0, 0]);
  marker.bindPopup(`<div style="text-align: center;"><strong>📍 Você está aqui</strong></div>`);
  return marker;
};

const atualizarMarcadores = (): void => {
  if (!map) return;

  if (markersLayer) markersLayer.clearLayers();
  else markersLayer = L.layerGroup().addTo(map);

  for (const prestador of prestadoresFiltrados.value) {
    if (prestador.latitude && prestador.longitude) {
      const marker = criarMarcadorPrestador(prestador);
      marker.addTo(markersLayer);
    }
  }
};

const atualizarLocalizacaoUsuario = (lat: number, lng: number, accuracy: number = 50): void => {
  if (!map) return;

  if (userMarker) userMarker.remove();
  if (userCircle) userCircle.remove();

  userMarker = criarMarcadorUsuario();
  userMarker.setLatLng([lat, lng]);
  userMarker.addTo(map);

  userCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: '#1976d2',
    fillColor: '#1976d2',
    fillOpacity: 0.15,
    weight: 2,
  }).addTo(map);

  localizacaoAtual.value = { lat, lng };
};

const iniciar = async (): Promise<void> => {
  carregando.value = true;

  try {
    map = L.map('map').setView([-25.9692, 32.5732], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap, CARTO',
      maxZoom: 19,
    }).addTo(map);

    const posicao = await locationStore.getCurrentLocation(true);

    if (posicao) {
      atualizarLocalizacaoUsuario(posicao.lat, posicao.lng, posicao.accuracy || 50);
      map.setView([posicao.lat, posicao.lng], 14);

      await clienteStore.fetchPrestadoresProximos(
        posicao.lat,
        posicao.lng,
        filtroDistancia.value,
        true,
      );

      atualizarMarcadores();

      $q.notify({
        type: 'positive',
        message: `${prestadoresFiltrados.value.length} prestadores encontrados`,
        position: 'top',
        timeout: 2000,
      });
    } else {
      $q.notify({
        type: 'warning',
        message: 'Clique no ícone de localização para obter sua posição',
        position: 'top',
        timeout: 3000,
      });
    }
  } catch (error) {
    console.error('Erro ao iniciar mapa:', error);
  } finally {
    carregando.value = false;
    carregandoPrestadores.value = false;

    // ✅ CORRETO
    await nextTick();
    if (map && map.getContainer()) {
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    }
  }
};

const alterarRaio = async (novoRaio: number): Promise<void> => {
  if (novoRaio === filtroDistancia.value) return;
  if (!localizacaoAtual.value) {
    $q.notify({ type: 'warning', message: 'Localização não disponível', position: 'top' });
    return;
  }

  filtroDistancia.value = novoRaio;
  carregandoPrestadores.value = true;

  try {
    await clienteStore.fetchPrestadoresProximos(
      localizacaoAtual.value.lat,
      localizacaoAtual.value.lng,
      novoRaio,
      true,
    );

    atualizarMarcadores();

    $q.notify({
      type: 'positive',
      message: `${prestadoresFiltrados.value.length} prestadores num raio de ${novoRaio} km`,
      position: 'top',
      timeout: 2000,
      icon: 'radar',
    });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao buscar prestadores', position: 'top' });
  } finally {
    carregandoPrestadores.value = false;
  }
};

watch(filtroDistancia, () => {
  atualizarMarcadores();
});

onMounted(() => {
  setTimeout(() => void iniciar(), 100);
  window.addEventListener('resize', () => {
    if (map && map.getContainer()) {
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    }
  });
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>

<style scoped lang="scss">
.mapa-page {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  z-index: 10;

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    flex: 1;
    margin-left: 10px;
  }
}

.status-bar {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.filtro-raio {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.map-container {
  height: 45vh;
  min-height: 300px;
  width: 100%;
  position: relative;
  background: #f0f0f0;
  flex-shrink: 0;

  #map {
    width: 100%;
    height: 100%;
  }
}

.prestadores-list {
  flex: 1;
  overflow-y: auto;
  background: white;
}

/* ========================================== */
/* SKELETON LOADING - ESTILO FACEBOOK */
/* ========================================== */
.skeleton-container {
  .skeleton-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .skeleton-content {
    flex: 1;
  }
}

/* Scrollbar */
.prestadores-list::-webkit-scrollbar {
  width: 6px;
}
.prestadores-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.prestadores-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
</style>
