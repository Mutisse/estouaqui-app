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
        <q-icon
          name="gps_fixed"
          color="positive"
          size="16px"
          class="q-mr-xs notranslate material-icons"
        />
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
        <q-icon
          name="warning"
          color="warning"
          size="16px"
          class="q-mr-xs notranslate material-icons"
        />
        <span class="text-caption"
          >Localização não disponível. Clique no ícone de localização.</span
        >
      </div>
    </div>

    <!-- Filtro de Raio -->
    <div class="filtro-raio q-pa-md">
      <div class="row items-center justify-between">
        <div class="text-subtitle2">
          <q-icon
            name="radar"
            size="18px"
            class="q-mr-xs text-primary notranslate material-icons"
          />
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

    <!-- Botão para limpar rota -->
    <div class="map-actions">
      <q-btn
        round
        dense
        color="primary"
        icon="layers_clear"
        size="sm"
        class="clear-route-btn"
        @click="limparRota"
        v-if="rotaAtiva"
      >
        <q-tooltip>Limpar rota</q-tooltip>
      </q-btn>
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

    <!-- PAINEL DE INSTRUÇÕES DA ROTA (SÓ ISTO QUE PEDIU) -->
    <div v-if="instrucoesRota.length > 0" class="route-instructions-panel">
      <div class="panel-header">
        <q-icon name="directions" class="notranslate material-icons" />
        <span>Instruções da rota</span>
        <q-btn flat round dense icon="close" size="sm" @click="fecharInstrucoes" />
      </div>
      <div class="panel-content">
        <div class="route-summary">
          <div>
            <q-icon name="straighten" class="notranslate material-icons" />
            {{ resumoRota.distancia }} km
          </div>
          <div>
            <q-icon name="schedule" class="notranslate material-icons" />
            {{ resumoRota.duracao }} min
          </div>
        </div>
        <q-list dense>
          <q-item v-for="(inst, index) in instrucoesRota" :key="index">
            <q-item-section avatar>
              <q-icon :name="inst.icone" class="notranslate material-icons" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ inst.texto }}</q-item-label>
              <q-item-label caption v-if="inst.distancia">{{ inst.distancia }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Lista de prestadores -->
    <div class="prestadores-list q-pa-md">
      <div class="text-subtitle1 q-mb-md">
        Prestadores encontrados ({{ prestadoresFiltrados.length }})
      </div>

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

      <div v-else-if="prestadoresFiltrados.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="48px" color="grey" class="notranslate material-icons" />
        <div class="text-subtitle1 q-mt-sm">Nenhum prestador encontrado</div>
        <div class="text-caption q-mt-xs">Tente aumentar o raio de busca</div>
      </div>

      <q-list separator v-else>
        <q-item
          v-for="prestador in prestadoresFiltrados"
          :key="prestador.id"
          clickable
          v-ripple
          @click="verPerfil(prestador.id)"
        >
          <q-item-section avatar>
            <q-avatar size="50px">
              <img
                :src="obterFotoPrestador(prestador)"
                :alt="prestador.nome"
                @error="(e) => handleImageError(e, prestador)"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ prestador.nome }}</q-item-label>
            <q-item-label caption>
              <div class="flex items-center gap-2">
                <div class="flex items-center">
                  <q-icon
                    name="star"
                    color="amber"
                    size="14px"
                    class="notranslate material-icons"
                  />
                  <span>{{ (prestador.media_avaliacao || 0).toFixed(1) }}</span>
                </div>
                <div class="flex items-center">
                  <q-icon
                    name="place"
                    color="blue"
                    size="14px"
                    class="notranslate material-icons"
                  />
                  <span>{{ formatarDistancia(prestador.distancia) }}</span>
                </div>
                <q-badge :color="prestador.disponivel !== false ? 'positive' : 'negative'">
                  {{ prestador.disponivel !== false ? 'Disponível' : 'Indisponível' }}
                </q-badge>
              </div>
            </q-item-label>
            <q-item-label caption class="text-grey-7">
              <q-icon name="work" size="12px" class="q-mr-xs notranslate material-icons" />
              {{ prestador.profissao || 'Profissional' }}
            </q-item-label>
          </q-item-section>

          <!-- SÓ UM BOTÃO: Desenhar rota -->
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

// Interface para instrução da rota
interface InstrucaoRota {
  texto: string;
  icone: string;
  distancia: string;
}

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
const imageErrors = ref<Record<number, boolean>>({});
const rotaAtiva = ref(false);
let routeLine: L.Polyline | null = null;
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
let userCircle: L.Circle | null = null;
let markersLayer: L.LayerGroup | null = null;

// Estados para instruções
const instrucoesRota = ref<InstrucaoRota[]>([]);
const resumoRota = ref({ distancia: '0', duracao: '0' });

// Opções
const opcoesRaio = [
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
  { label: '15km', value: 15 },
  { label: '20km', value: 20 },
  { label: '30km', value: 30 },
  { label: '50km', value: 50 },
];

// FUNÇÃO PARA OBTER ÍCONE DA INSTRUÇÃO
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

// FORMATAR DISTÂNCIA
const formatarDistanciaPasso = (metros: number): string => {
  if (metros < 1000) return `${Math.round(metros)} metros`;
  return `${(metros / 1000).toFixed(1)} km`;
};

// FUNÇÃO PARA OBTER INICIAIS DO NOME
const obterIniciais = (nome: string): string => {
  if (!nome || nome.trim() === '') return '??';
  const partes = nome.trim().split(' ');
  const primeiraParte = partes[0];
  if (!primeiraParte) return '??';
  if (partes.length === 1) {
    if (primeiraParte.length >= 2) {
      return primeiraParte.substring(0, 2).toUpperCase();
    }
    return (primeiraParte[0] || '?') + '?';
  }
  const ultimaParte = partes[partes.length - 1];
  if (!ultimaParte) {
    if (primeiraParte.length >= 2) {
      return primeiraParte.substring(0, 2).toUpperCase();
    }
    return (primeiraParte[0] || '?') + '?';
  }
  const primeiraLetra = primeiraParte[0] || '';
  const ultimaLetra = ultimaParte[0] || '';
  if (!primeiraLetra && !ultimaLetra) return '??';
  if (!primeiraLetra) return (ultimaLetra + '?').toUpperCase();
  if (!ultimaLetra) return (primeiraLetra + '?').toUpperCase();
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

// FUNÇÃO PARA OBTER FOTO DO PRESTADOR
const obterFotoPrestador = (prestador: PrestadorData): string => {
  if (imageErrors.value[prestador.id]) {
    const iniciais = obterIniciais(prestador.nome);
    return `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
  }
  if (prestador.foto) return prestador.foto;
  const iniciais = obterIniciais(prestador.nome);
  return `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
};

// TRATAMENTO DE ERRO DE IMAGEM
const handleImageError = (event: Event, prestador: PrestadorData) => {
  const img = event.target as HTMLImageElement;
  if (!imageErrors.value[prestador.id]) {
    imageErrors.value[prestador.id] = true;
    const iniciais = obterIniciais(prestador.nome);
    img.src = `https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=50&name=${encodeURIComponent(iniciais)}`;
  }
};

// Computed
const prestadoresFiltrados = computed(() => {
  return clienteStore.prestadoresProximos.filter(
    (p) => (p.distancia || 0) <= filtroDistancia.value,
  );
});

// Funções
const formatarDistancia = (distancia?: number): string => {
  if (!distancia && distancia !== 0) return '? km';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${distancia.toFixed(1)}km`;
};

const verPerfil = (prestadorId: number): void => {
  void router.push(`/mobile/perfil-prestador/${prestadorId}`);
};

// FUNÇÃO PARA LIMPAR A ROTA
const limparRota = (): void => {
  if (routeLine && map) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
  rotaAtiva.value = false;
  instrucoesRota.value = [];
  resumoRota.value = { distancia: '0', duracao: '0' };
  $q.notify({
    message: 'Rota removida do mapa',
    color: 'info',
    icon: 'layers_clear',
    timeout: 1500,
  });
};

// FUNÇÃO PARA FECHAR INSTRUÇÕES
const fecharInstrucoes = (): void => {
  instrucoesRota.value = [];
  resumoRota.value = { distancia: '0', duracao: '0' };
  limparRota();
};

// FUNÇÃO PARA TRAÇAR ROTA
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
// FUNÇÃO PARA DESENHAR ROTA E MOSTRAR INSTRUÇÕES (CORRIGIDA)
const desenharRotaNoMapa = async (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  nomeDestino: string,
): Promise<void> => {
  if (!map) return;

  // ✅ VERIFICAR SE É O MESMO PONTO
  if (lat1 === lat2 && lng1 === lng2) {
    $q.notify({
      type: 'warning',
      message: 'Você já está na localização deste prestador!',
      position: 'top',
    });
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

    // Desenhar a linha da rota
    const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    routeLine = L.polyline(coordinates as L.LatLngExpression[], {
      color: '#667eea',
      weight: 5,
      opacity: 0.8,
    }).addTo(map);

    rotaAtiva.value = true;

    // Resumo da rota
    const distanciaTotal = (route.distance / 1000).toFixed(1);
    const duracaoTotal = Math.round(route.duration / 60);
    resumoRota.value = { distancia: distanciaTotal, duracao: duracaoTotal.toString() };

    // 🎯 EXTRAIR INSTRUÇÕES PASSO A PASSO
    const instrucoes: InstrucaoRota[] = [];

    // Instrução de partida
    instrucoes.push({
      texto: '📍 Sair da localização atual',
      icone: 'directions_car',
      distancia: '',
    });

    // Percorrer cada passo da rota
    for (const leg of route.legs) {
      for (const step of leg.steps) {
        // ✅ VERIFICAR SE step.maneuver EXISTE
        if (!step.maneuver) continue;

        let texto = step.maneuver.instruction || '';

        // ✅ VERIFICAR SE texto EXISTE ANTES DE USAR replace
        if (texto && typeof texto === 'string') {
          texto = texto.replace(/^[A-Za-z]+/, '').trim();
          texto = texto.charAt(0).toUpperCase() + texto.slice(1);
        } else {
          // Se não tiver instrução, criar uma genérica
          if (step.maneuver.type === 'turn') {
            texto = `Vire à ${step.maneuver.modifier === 'right' ? 'direita' : 'esquerda'}`;
          } else if (step.maneuver.type === 'new name') {
            texto = 'Continue';
          } else {
            texto = 'Siga em frente';
          }
        }

        // Adicionar nome da rua/avenida se existir
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

    // Instrução de chegada
    instrucoes.push({
      texto: `🏁 Chegada ao destino: ${nomeDestino}`,
      icone: 'location_on',
      distancia: '',
    });

    instrucoesRota.value = instrucoes;

    // Notificação
    $q.notify({
      message: `🚗 Rota traçada: ${distanciaTotal} km, ~${duracaoTotal} min`,
      color: 'positive',
      icon: 'directions',
      timeout: 3000,
      position: 'bottom',
    });

    // Ajustar zoom para a rota
    const bounds = L.latLngBounds(coordinates as L.LatLngExpression[]);
    map.fitBounds(bounds, { padding: [50, 50] });
  } catch (error) {
    console.error('Erro ao desenhar rota:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao calcular rota. Tente novamente.',
      position: 'top',
    });
  }
};
const centralizarNaLocalizacao = (): void => {
  if (!localizacaoAtual.value || !map) return;
  map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 14);
  if (userMarker) userMarker.openPopup();
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
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 13);
  } else {
    map.setView([-25.9692, 32.5732], 13);
  }
};

const criarMarcadorPrestador = (prestador: PrestadorData): L.Marker => {
  const fotoUrl = prestador.foto || obterFotoPrestador(prestador);
  const iniciais = obterIniciais(prestador.nome);

  const popupContent = `
    <div style="min-width: 220px; padding: 8px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <img src="${fotoUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
             onerror="this.src='https://ui-avatars.com/api/?background=667eea&color=fff&bold=true&size=40&name=${encodeURIComponent(iniciais)}'">
        <div>
          <strong>${prestador.nome}</strong><br/>
          <span style="font-size: 12px; color: #666;">⭐ ${(prestador.media_avaliacao || 0).toFixed(1)}</span>
        </div>
      </div>
      <div style="font-size: 12px; margin-bottom: 8px;">
        <div>📍 ${formatarDistancia(prestador.distancia)}</div>
        <div>💼 ${prestador.profissao || 'Profissional'}</div>
      </div>
    </div>
  `;

  const marker = L.marker([prestador.latitude!, prestador.longitude!]);
  marker.bindPopup(popupContent);
  return marker;
};

const criarMarcadorUsuario = (): L.Marker => {
  const marker = L.marker([0, 0]);
  marker.bindPopup(
    `<div style="text-align: center; padding: 5px;"><strong>📍 Você está aqui</strong></div>`,
  );
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
    map.setView([localizacaoAtual.value.lat, localizacaoAtual.value.lng], 13);
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
  setTimeout(() => ajustarZoomParaMarcadores(), 100);
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
      if (map) map.setView([-25.9692, 32.5732], 13);
    }
  } catch (error) {
    console.error('Erro ao iniciar mapa:', error);
  } finally {
    carregando.value = false;
    carregandoPrestadores.value = false;
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
  if (rotaAtiva.value) limparRota();

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

watch(prestadoresFiltrados, () => atualizarMarcadores(), { deep: true });
watch(filtroDistancia, () => atualizarMarcadores());

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
  if (routeLine && map) map.removeLayer(routeLine);
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

.map-actions {
  position: absolute;
  top: 180px;
  right: 16px;
  z-index: 1000;

  .clear-route-btn {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
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

.route-instructions-panel {
  position: absolute;
  bottom: 20px;
  left: 10px;
  right: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 40vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #667eea;
    color: white;
    font-weight: bold;
    border-radius: 12px 12px 0 0;

    span {
      flex: 1;
    }
  }

  .panel-content {
    overflow-y: auto;
    padding: 8px 0;
  }

  .route-summary {
    display: flex;
    gap: 16px;
    padding: 12px;
    background: #f5f5f5;
    margin: 8px;
    border-radius: 8px;

    div {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .q-item {
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }
}

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
