<template>
  <q-page class="mapa-page">
    <!-- Header -->
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
      <p class="text-caption">Aguarde, obtendo localização...</p>
    </div>

    <!-- Mapa -->
    <div v-else class="map-container">
      <div id="map" style="width: 100%; height: 100%;"></div>
    </div>

    <!-- Lista de prestadores -->
    <div class="prestadores-list q-pa-md">
      <div class="text-subtitle1 q-mb-md flex items-center justify-between">
        <span>Prestadores próximos ({{ prestadoresProximos.length }})</span>
        <q-btn
          size="sm"
          flat
          dense
          icon="refresh"
          @click="atualizarLista"
          :loading="carregandoPrestadores"
        />
      </div>

      <q-list separator v-if="prestadoresProximos.length > 0">
        <q-item
          v-for="prestador in prestadoresProximos"
          :key="prestador.id"
          clickable
          v-ripple
          @click="centralizarNoPrestador(prestador)"
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
              {{ (prestador.media_avaliacao || 0).toFixed(1) }}
              <q-icon name="place" size="14px" class="q-ml-sm" />
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
          Nenhum prestador encontrado
        </div>
        <q-btn
          flat
          color="primary"
          label="Tentar novamente"
          @click="atualizarLista"
          class="q-mt-md"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ CORREÇÃO: Tipo correto para o ícone do Leaflet
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

// Configurar ícones do Leaflet - SEM ANY
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

defineOptions({
  name: 'MapaPage',
});

const router = useRouter();
const $q = useQuasar();

// Interfaces
interface PrestadorMapa {
  id: number;
  nome: string;
  foto: string | null;
  media_avaliacao: number;
  distancia?: number;
  categorias?: { id: number; nome: string }[];
  disponivel?: boolean;
  lat?: number;
  lng?: number;
}

// Estados
const carregando = ref(true);
const carregandoPrestadores = ref(false);
const buscandoLocalizacao = ref(false);
const prestadoresProximos = ref<PrestadorMapa[]>([]);
const localizacaoAtual = ref<{ lat: number; lng: number } | null>(null);

// Variáveis do mapa
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let userMarker: L.Marker | null = null;

// Formatar distância
const formatarDistancia = (distancia?: number): string => {
  if (!distancia) return '? km';
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  }
  return `${distancia.toFixed(1)}km`;
};

// Centralizar no prestador
const centralizarNoPrestador = (prestador: PrestadorMapa): void => {
  if (!map) return;

  const lat = prestador.lat;
  const lng = prestador.lng;

  if (lat && lng) {
    map.setView([lat, lng], 16);

    const marker = markers.find(m => {
      const latLng = m.getLatLng();
      return Math.abs(latLng.lat - lat) < 0.0001 && Math.abs(latLng.lng - lng) < 0.0001;
    });

    if (marker) {
      marker.openPopup();
    }
  }
};

// Atualizar lista
const atualizarLista = (): void => {
  if (localizacaoAtual.value) {
    void buscarPrestadoresProximos(
      localizacaoAtual.value.lat,
      localizacaoAtual.value.lng
    );
  }
};

// Inicializar mapa (síncrono)
const inicializarMapa = (lat: number, lng: number): boolean => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Container do mapa não encontrado!');
    return false;
  }

  if (map) {
    map.remove();
    map = null;
  }

  try {
    map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);

    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="background-color: #1976d2; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<strong>📍 Sua localização</strong>').openPopup();

    return true;
  } catch (error) {
    console.error('Erro ao criar mapa:', error);
    return false;
  }
};

// Adicionar marcadores dos prestadores
const adicionarMarcadores = (prestadores: PrestadorMapa[]): void => {
  if (!map) return;

  markers.forEach((marker) => marker.remove());
  markers = [];

  prestadores.forEach((prestador) => {
    const lat = prestador.lat;
    const lng = prestador.lng;

    if (lat && lng && map) {
      const bgColor = prestador.disponivel !== false ? '#667eea' : '#999';

      const prestadorIcon = L.divIcon({
        className: 'prestador-marker',
        html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); cursor: pointer;">
                <span style="color: white; font-size: 11px; font-weight: bold;">⭐ ${(prestador.media_avaliacao || 0).toFixed(1)}</span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: prestadorIcon }).addTo(map);

      const popupContent = `
        <div style="min-width: 220px;">
          <strong>${prestador.nome}</strong><br/>
          ⭐ ${(prestador.media_avaliacao || 0).toFixed(1)}<br/>
          ${prestador.categorias?.map((c) => c.nome).join(', ') || 'Sem categorias'}<br/>
          <hr/>
          <a href="/mobile/perfil-prestador/${prestador.id}" style="color: #667eea;">Ver perfil →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.push(marker);
    }
  });

  if (markers.length > 0 && localizacaoAtual.value && map) {
    const allPoints: L.LatLngExpression[] = [
      [localizacaoAtual.value.lat, localizacaoAtual.value.lng],
      ...markers.map(m => m.getLatLng())
    ];
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50] });
  }
};

// ✅ CORRIGIDO: Buscar prestadores próximos
const buscarPrestadoresProximos = async (lat: number, lng: number): Promise<void> => {
  carregandoPrestadores.value = true;

  try {
    const response = await api.get('/prestadores/proximos', {
      params: {
        lat: lat,
        lng: lng,
        raio: 10
      }
    });

    let prestadores: PrestadorMapa[] = [];

    if (response.data.success && Array.isArray(response.data.data)) {
      prestadores = response.data.data;
    } else if (Array.isArray(response.data)) {
      prestadores = response.data;
    }

    prestadoresProximos.value = prestadores;

    if (prestadores.length > 0 && map) {
      adicionarMarcadores(prestadores);
    }
  } catch (err) {
    console.error('Erro ao buscar prestadores:', err);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar prestadores',
      position: 'top',
    });
    prestadoresProximos.value = [];
  } finally {
    carregandoPrestadores.value = false;
  }
};

// ✅ CORRIGIDO: Função sem async desnecessário
const iniciarMapaComLocalizacao = (): void => {
  carregando.value = true;

  if (!navigator.geolocation) {
    $q.notify({
      type: 'negative',
      message: 'Seu navegador não suporta geolocalização',
      position: 'top'
    });
    carregando.value = false;
    return;
  }

  const options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 60000
  };

  // ✅ CORRIGIDO: Função sem async (usa void para promises)
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      localizacaoAtual.value = { lat: latitude, lng: longitude };

      void nextTick().then(() => {
        const mapaInicializado = inicializarMapa(latitude, longitude);

        if (mapaInicializado) {
          void buscarPrestadoresProximos(latitude, longitude);
        }

        carregando.value = false;

        $q.notify({
          type: 'positive',
          message: 'Localização obtida!',
          position: 'top',
          timeout: 1500
        });
      });
    },
    (error) => {
      console.error('Erro de localização:', error.code, error.message);

      let mensagem = '';
      if (error.code === 1) {
        mensagem = 'Permissão negada. Use coordenadas padrão.';
      } else {
        mensagem = 'Usando localização padrão (Luanda)';
      }

      const fallbackLat = -8.839988;
      const fallbackLng = 13.289437;
      localizacaoAtual.value = { lat: fallbackLat, lng: fallbackLng };

      void nextTick().then(() => {
        inicializarMapa(fallbackLat, fallbackLng);
        void buscarPrestadoresProximos(fallbackLat, fallbackLng);
        carregando.value = false;
      });

      $q.notify({
        type: 'warning',
        message: mensagem,
        position: 'top',
        timeout: 3000
      });
    },
    options
  );
};

// Obter localização manual
const obterLocalizacaoAtual = (): void => {
  if (map && localizacaoAtual.value) {
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 15);
    if (userMarker) {
      userMarker.openPopup();
    }
  } else {
    iniciarMapaComLocalizacao();
  }
};

// Redimensionar mapa
const handleResize = (): void => {
  if (map) {
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 200);
  }
};

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    iniciarMapaComLocalizacao();
  }, 100);

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  window.removeEventListener('resize', handleResize);
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
  gap: 15px;
  flex-shrink: 0;
  padding: 12px 16px;
  z-index: 10;

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    flex: 1;
  }
}

.loading-container {
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
  background: #f0f0f0;

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

:deep(.user-marker) {
  z-index: 1000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.prestador-marker) {
  cursor: pointer;
}

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
