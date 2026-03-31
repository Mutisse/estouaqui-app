<!-- pages/mobile/client/Mapa.vue -->
<template>
  <q-page class="mapa-page">
    <div class="header q-pa-md">
      <q-btn flat round icon="arrow_back" @click="router.back()" />
      <div class="header-title">Mapa de prestadores</div>
      <q-btn
        flat
        round
        icon="my_location"
        @click="obterLocalizacaoAtual"
        :loading="buscandoLocalizacao"
      />
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading-container">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md">A carregar prestadores próximos...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="erro" class="error-container">
      <q-icon name="error" size="64px" color="negative" />
      <p class="text-h6 q-mt-md">{{ erro }}</p>
      <q-btn flat color="primary" label="Tentar novamente" @click="obterLocalizacaoAtual" />
    </div>

    <!-- Conteúdo -->
    <template v-else>
      <div class="map-container" ref="mapContainer">
        <div id="map" class="map"></div>
      </div>

      <div class="prestadores-list q-pa-md">
        <div class="text-subtitle1 q-mb-md">
          Prestadores próximos ({{ prestadoresProximos.length }})
        </div>

        <q-list separator v-if="prestadoresProximos.length > 0">
          <q-item
            v-for="prestador in prestadoresProximos"
            :key="prestador.id"
            clickable
            v-ripple
            :to="'/mobile/perfil-prestador/' + prestador.id"
          >
            <q-item-section avatar>
              <q-avatar>
                <img
                  :src="
                    prestador.foto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome)}&background=667eea&color=fff`
                  "
                  :alt="prestador.nome"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ prestador.nome }}</q-item-label>
              <q-item-label caption>
                <q-icon name="star" color="yellow" size="16px" />
                {{ (prestador.media_avaliacao || 0).toFixed(1) }} -
                {{ formatarDistancia(prestador.distancia) }}
              </q-item-label>
              <q-item-label caption class="text-grey-6">
                {{ prestador.categorias?.map((c) => c.nome).join(', ') || 'Sem categorias' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge :color="prestador.disponivel !== false ? 'positive' : 'grey'">
                {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center q-pa-xl">
          <q-icon name="location_off" size="48px" color="grey" />
          <div class="text-subtitle1 q-mt-sm text-grey">
            Nenhum prestador encontrado nas proximidades
          </div>
          <div class="text-caption text-grey">
            Tente ampliar o raio de busca ou verifique sua localização
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useClienteStore } from 'src/stores/cliente-store';
import type { PrestadorData } from 'src/stores/cliente-store';

// Interface para os objetos do Leaflet (com métodos completos)
interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
  addTo: (element: HTMLElement) => void;
}

interface LeafletPopup {
  openPopup: () => void;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string) => LeafletMarker & LeafletPopup;
  remove: () => void;
}

interface LeafletIconReturn {
  addTo: (map: LeafletMap) => void;
}

interface LeafletDivIcon {
  (options: {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }): LeafletIconReturn;
}

interface LeafletTileLayer {
  (url: string, options?: { attribution: string }): {
    addTo: (map: LeafletMap) => void;
  };
}

declare global {
  interface Window {
    L: {
      map: (id: string) => LeafletMap;
      tileLayer: LeafletTileLayer;
      marker: (latlng: [number, number], options?: { icon?: LeafletIconReturn }) => LeafletMarker;
      divIcon: LeafletDivIcon;
    };
  }
}

defineOptions({
  name: 'MapaPage',
});

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();

// Estados
const carregando = ref(false);
const buscandoLocalizacao = ref(false);
const erro = ref<string | null>(null);
const prestadoresProximos = ref<PrestadorData[]>([]);
let map: LeafletMap | null = null;
let markers: LeafletMarker[] = [];
let userMarker: LeafletMarker | null = null;

// Funções auxiliares
const formatarDistancia = (distancia?: number) => {
  if (!distancia) return 'distância não calculada';
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  }
  return `${distancia.toFixed(1)}km`;
};

// Inicializar mapa
const inicializarMapa = (lat: number, lng: number) => {
  if (map) {
    map.remove();
  }

  // Verificar se Leaflet está carregado
  if (!window.L) {
    console.error('Leaflet não carregado');
    return;
  }

  const L = window.L;

  // Criar mapa
  map = L.map('map').setView([lat, lng], 13);

  // Adicionar tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Marcador do usuário
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: '<div style="background-color: #1976d2; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
  const popup = userMarker.bindPopup('<strong>Sua localização</strong>');
  popup.openPopup();
};

// Adicionar marcadores dos prestadores
const adicionarMarcadores = (prestadores: PrestadorData[]) => {
  if (!window.L) return;

  const L = window.L;

  // Remover marcadores antigos
  markers.forEach((marker) => marker.remove());
  markers = [];

  prestadores.forEach((prestador) => {
    // ✅ AGORA lat e lng são propriedades da interface PrestadorData
    const lat = prestador.lat;
    const lng = prestador.lng;

    if (lat && lng) {
      const prestadorIcon = L.divIcon({
        className: 'prestador-marker',
        html: `<div style="background-color: #667eea; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 12px; font-weight: bold;">${(prestador.media_avaliacao || 0).toFixed(1)}</span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: prestadorIcon }).addTo(map as LeafletMap);
      marker.bindPopup(`
        <strong>${prestador.nome}</strong><br/>
        ${prestador.categorias?.map((c) => c.nome).join(', ') || 'Sem categorias'}<br/>
        <a href="/mobile/perfil-prestador/${prestador.id}">Ver perfil</a>
      `);
      markers.push(marker);
    }
  });
};

// Obter localização do usuário
const obterLocalizacaoAtual = () => {
  if (!navigator.geolocation) {
    erro.value = 'Seu navegador não suporta geolocalização';
    return;
  }

  buscandoLocalizacao.value = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Inicializar mapa
      inicializarMapa(latitude, longitude);

      // Buscar prestadores próximos
      void buscarPrestadoresProximos(latitude, longitude);

      buscandoLocalizacao.value = false;
    },
    (error: GeolocationPositionError) => {
      console.error('Erro ao obter localização:', error);
      if (error.code === 1) {
        erro.value = 'Permissão de localização negada. Ative para usar o mapa.';
      } else if (error.code === 2) {
        erro.value = 'Localização indisponível. Verifique se o GPS está ativo.';
      } else {
        erro.value = 'Não foi possível obter sua localização.';
      }
      buscandoLocalizacao.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

// Buscar prestadores próximos
const buscarPrestadoresProximos = async (lat: number, lng: number) => {
  carregando.value = true;
  erro.value = null;

  try {
    const prestadores = await clienteStore.fetchPrestadoresProximos(lat, lng);
    prestadoresProximos.value = prestadores;

    if (prestadores.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Nenhum prestador encontrado nas proximidades',
        position: 'top',
      });
    } else {
      // Adicionar marcadores no mapa
      adicionarMarcadores(prestadores);
    }
  } catch (err) {
    console.error('Erro ao buscar prestadores:', err);
    erro.value = 'Erro ao buscar prestadores próximos';
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar prestadores próximos',
      position: 'top',
    });
  } finally {
    carregando.value = false;
  }
};

// Carregar Leaflet dinamicamente
const carregarLeaflet = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'));
    document.body.appendChild(script);
  });
};

// Carregar mapa ao montar
onMounted(async () => {
  try {
    await carregarLeaflet();
    obterLocalizacaoAtual();
  } catch (err) {
    console.error('Erro ao carregar Leaflet:', err);
    erro.value = 'Erro ao carregar o mapa';
  }
});

// Limpar mapa ao desmontar
onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped lang="scss">
.mapa-page {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  padding: 12px 16px;

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    flex: 1;
  }
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.map-container {
  height: 45vh;
  flex-shrink: 0;
  position: relative;

  .map {
    width: 100%;
    height: 100%;
  }
}

.prestadores-list {
  flex: 1;
  overflow-y: auto;
  background: white;
}

:deep(.user-marker) {
  z-index: 1000;
}

:deep(.prestador-marker) {
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

// Scrollbar
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

.prestadores-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
