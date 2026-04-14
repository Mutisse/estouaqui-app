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
        @click="centralizarNaLocalizacao"
        :loading="buscandoLocalizacao"
      />
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading-container">
      <q-spinner color="primary" size="50px" />
      <p class="q-mt-md">A carregar mapa...</p>
    </div>

    <!-- Container do mapa -->
    <div class="map-container" :class="{ hidden: carregando }">
      <div id="map"></div>
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
          @click="recarregarPrestadores"
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
              <img :src="prestador.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(prestador.nome)}&background=667eea&color=fff`" />
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
        <div class="text-subtitle1 q-mt-sm">Nenhum prestador encontrado</div>
        <q-btn flat color="primary" label="Tentar novamente" @click="recarregarPrestadores" class="q-mt-md" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClienteStore } from 'src/stores/cliente-store';
import type { PrestadorData } from 'src/stores/cliente-store';

defineOptions({
  name: 'MapaPage'
});

// CORREÇÃO DOS ÍCONES DO LEAFLET
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const router = useRouter();
const $q = useQuasar();
const clienteStore = useClienteStore();

// Estados
const carregando = ref(true);
const carregandoPrestadores = ref(false);
const buscandoLocalizacao = ref(false);
const localizacaoAtual = ref<{ lat: number; lng: number } | null>(null);

// Computed do store
const prestadoresProximos = computed(() => clienteStore.prestadoresProximos);

// Variáveis do mapa
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let userMarker: L.Marker | null = null;
// Array para manter referência dos marcadores e seus prestadores
const markersMap = new Map<number, L.Marker>();

// Formatar distância
const formatarDistancia = (distancia?: number): string => {
  if (!distancia) return '? km';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${distancia.toFixed(1)}km`;
};

// Centralizar no prestador (CORRIGIDO)
const centralizarNoPrestador = (prestador: PrestadorData): void => {
  if (!map || !prestador.lat || !prestador.lng) return;

  map.setView([prestador.lat, prestador.lng], 16);

  // Busca o marcador pelo ID do prestador
  const marker = markersMap.get(prestador.id);
  if (marker) {
    marker.openPopup();
  }
};

// Recarregar prestadores usando o store
const recarregarPrestadores = async (): Promise<void> => {
  if (localizacaoAtual.value) {
    carregandoPrestadores.value = true;
    try {
      await clienteStore.fetchPrestadoresProximos(
        localizacaoAtual.value.lat,
        localizacaoAtual.value.lng,
        10
      );
      atualizarMarcadores(prestadoresProximos.value);
    } catch (error) {
      console.error('Erro ao recarregar prestadores:', error);
    } finally {
      carregandoPrestadores.value = false;
    }
  }
};

// Centralizar na localização atual
const centralizarNaLocalizacao = (): void => {
  if (map && localizacaoAtual.value) {
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 14);
    if (userMarker) {
      userMarker.openPopup();
    }
  }
};

// Criar ícone 3D para prestador
const criarIcone3DPrestador = (prestador: PrestadorData): L.DivIcon => {
  const avaliacao = (prestador.media_avaliacao || 0).toFixed(1);
  const cor = prestador.disponivel !== false ? '#667eea' : '#999';

  return L.divIcon({
    className: 'marker-3d-prestador',
    html: `
      <div class="marker-3d" style="background: ${cor};">
        <div class="marker-3d-inner">
          <span class="marker-3d-rating">⭐ ${avaliacao}</span>
        </div>
        <div class="marker-3d-shadow"></div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

// Criar ícone 3D para usuário
const criarIcone3DUsuario = (): L.DivIcon => {
  return L.divIcon({
    className: 'marker-3d-usuario',
    html: `
      <div class="marker-3d-user">
        <div class="marker-3d-user-pulse"></div>
        <div class="marker-3d-user-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Atualizar marcadores dos prestadores (CORRIGIDO)
const atualizarMarcadores = (prestadores: PrestadorData[]): void => {
  if (!map) return;

  // Limpa todos os marcadores existentes
  if (markersLayer) {
    markersLayer.clearLayers();
  } else {
    markersLayer = L.layerGroup().addTo(map);
  }

  // Limpa o mapa de referências
  markersMap.clear();

  // Adiciona novos marcadores
  for (const prestador of prestadores) {
    if (prestador.lat && prestador.lng) {
      const icon = criarIcone3DPrestador(prestador);
      const marker = L.marker([prestador.lat, prestador.lng], { icon });

      marker.bindPopup(`
        <div style="min-width: 220px; padding: 5px;">
          <strong style="font-size: 16px;">${prestador.nome}</strong><br/>
          <div style="margin: 8px 0;">
            ⭐ <strong>${(prestador.media_avaliacao || 0).toFixed(1)}</strong> / 5.0
          </div>
          <div style="margin: 5px 0; color: #666;">
            📍 ${formatarDistancia(prestador.distancia)} de distância
          </div>
          <div style="margin: 5px 0; color: #666;">
            ${prestador.categorias?.map(c => c.nome).join(', ') || 'Sem categorias'}
          </div>
          <hr style="margin: 8px 0;"/>
          <a href="/mobile/perfil-prestador/${prestador.id}" style="color: #667eea; text-decoration: none;">
            👤 Ver perfil completo →
          </a>
        </div>
      `, { maxWidth: 280 });

      marker.addTo(markersLayer);

      // Armazena referência do marcador pelo ID do prestador
      markersMap.set(prestador.id, marker);

      // Adiciona animação de bounce ao criar
      setTimeout(() => {
        const element = marker.getElement();
        if (element) {
          element.classList.add('marker-bounce');
          setTimeout(() => {
            element.classList.remove('marker-bounce');
          }, 1000);
        }
      }, 100 * prestadores.indexOf(prestador));
    }
  }
};

// Adicionar marcador 3D do usuário
const adicionarMarcadorUsuario = (lat: number, lng: number): void => {
  if (!map) return;

  if (userMarker) {
    userMarker.remove();
  }

  const userIcon = criarIcone3DUsuario();
  userMarker = L.marker([lat, lng], { icon: userIcon });
  userMarker.bindPopup(`
    <div style="text-align: center; padding: 5px;">
      <strong>📍 Você está aqui</strong><br/>
      <small>Posição atual</small>
    </div>
  `).addTo(map);
};

// Inicializar o mapa
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
    map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 200);

    console.log('Mapa inicializado com sucesso');
    return true;

  } catch (error) {
    console.error('Erro ao inicializar mapa:', error);
    return false;
  }
};

// Obter localização do usuário
const obterLocalizacaoUsuario = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada, usando localização padrão');
      resolve({ lat: -8.839988, lng: 13.289437 });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Localização obtida:', latitude, longitude);
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Erro na geolocalização:', error.code, error.message);

        let mensagem = '';
        if (error.code === 1) {
          mensagem = 'Permissão de localização negada. Usando localização padrão.';
        } else if (error.code === 2) {
          mensagem = 'Posição indisponível. Usando localização padrão.';
        } else {
          mensagem = 'Erro ao obter localização. Usando localização padrão.';
        }

        void $q.notify({
          type: 'warning',
          message: mensagem,
          position: 'top',
          timeout: 3000
        });

        resolve({ lat: -8.839988, lng: 13.289437 });
      },
      options
    );
  });
};

// Função principal para iniciar o mapa
const iniciar = async (): Promise<void> => {
  carregando.value = true;

  await new Promise(resolve => setTimeout(resolve, 100));

  const posicao = await obterLocalizacaoUsuario();
  localizacaoAtual.value = posicao;

  const mapaOk = inicializarMapa(posicao.lat, posicao.lng);

  if (mapaOk && map) {
    adicionarMarcadorUsuario(posicao.lat, posicao.lng);

    // Usando o store para buscar prestadores próximos
    carregandoPrestadores.value = true;
    try {
      await clienteStore.fetchPrestadoresProximos(posicao.lat, posicao.lng, 10);
      atualizarMarcadores(prestadoresProximos.value);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
    } finally {
      carregandoPrestadores.value = false;
    }
  }

  carregando.value = false;

  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 500);
};

// Evento de redimensionamento
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
  void iniciar();
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
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.map-container {
  height: 50vh;
  min-height: 350px;
  width: 100%;
  position: relative;
  background: #f0f0f0;
  flex-shrink: 0;

  &.hidden {
    display: none;
  }

  #map {
    width: 100%;
    height: 100%;
    background: #e5e5e5;
  }
}

.prestadores-list {
  flex: 1;
  overflow-y: auto;
  background: white;
}

// ESTILOS DOS MARCADORES 3D
:deep(.marker-3d-prestador) {
  z-index: 1000;

  .marker-3d {
    position: relative;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    &::before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      background: rgba(102, 126, 234, 0.4);
      border-radius: 50%;
      animation: pulse-ring 1.5s infinite;
    }

    .marker-3d-inner {
      background: rgba(255,255,255,0.95);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);

      .marker-3d-rating {
        font-size: 11px;
        font-weight: bold;
        color: #333;
      }
    }

    .marker-3d-shadow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 8px;
      background: rgba(0,0,0,0.2);
      border-radius: 50%;
      filter: blur(3px);
    }
  }
}

:deep(.marker-3d-usuario) {
  z-index: 2000;

  .marker-3d-user {
    position: relative;
    width: 40px;
    height: 40px;

    .marker-3d-user-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(25, 118, 210, 0.4);
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    .marker-3d-user-inner {
      position: absolute;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border: 3px solid white;
      animation: float 2s ease-in-out infinite;

      svg {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
      }
    }
  }
}

// Animações
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
  }
}

:deep(.marker-bounce) {
  animation: bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
}

// Hover effects
:deep(.marker-3d-prestador .marker-3d:hover) {
  transform: scale(1.1);
  transition: transform 0.3s ease;
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
</style>
