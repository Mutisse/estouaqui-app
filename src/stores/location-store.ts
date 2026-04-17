// stores/location-store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { Map as LeafletMap } from 'leaflet';

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  source?: 'gps' | 'ip' | 'network' | 'cache' | 'default';
}

export interface LocationError {
  code: number;
  message: string;
}

export const useLocationStore = defineStore('location', () => {
  const $q = useQuasar();

  // Estado
  const currentLocation = ref<LocationCoords | null>(null);
  const isTracking = ref(false);
  const isLoading = ref(false);
  const error = ref<LocationError | null>(null);
  const accuracy = ref<number | null>(null);
  const lastUpdate = ref<number | null>(null);
  const locationSource = ref<string | null>(null);

  // Configurações
  let watchId: number | null = null;

  // Computed
  const hasLocation = computed(() => currentLocation.value !== null);
  const isHighAccuracy = computed(() => (accuracy.value || 0) < 50);

  // Detectar se é dispositivo móvel
  const isMobileDevice = computed(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  });

  // Opções padrão para GPS - ALTA PRECISÃO
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  // Opções alternativas para rede (menos precisas, mais rápidas)
  const networkOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 30000,
  };

  // Obter localização por GPS (navegador)
  const getLocationByGPS = (): Promise<LocationCoords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords;

          resolve({
            lat: latitude,
            lng: longitude,
            accuracy: acc,
            timestamp: Date.now(),
            source: 'gps'
          });
        },
        (_error) => {
          let userMessage = '';
          switch (_error.code) {
            case 1:
              userMessage = 'Permissão negada. Ative o GPS.';
              break;
            case 2:
              userMessage = 'GPS sem sinal. Saia para área aberta.';
              break;
            case 3:
              userMessage = 'Timeout. Tentando método alternativo...';
              break;
          }

          if (userMessage) {
            $q.notify({
              type: 'warning',
              message: userMessage,
              position: 'top',
              timeout: 3000,
            });
          }

          resolve(null);
        },
        defaultOptions
      );
    });
  };

  // Obter localização por rede (menos precisa, mas funciona em PC)
  const getLocationByNetwork = (): Promise<LocationCoords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords;
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy: acc,
            timestamp: Date.now(),
            source: 'network'
          });
        },
        () => {
          resolve(null);
        },
        networkOptions
      );
    });
  };

  // Obter localização por IP (fallback)
  const getLocationByIP = async (): Promise<LocationCoords | null> => {
    try {
      const services = [
        'https://ipapi.co/json/',
        'https://freeipapi.com/api/json/'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            signal: AbortSignal.timeout(3000),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.latitude && data.longitude) {
              return {
                lat: data.latitude,
                lng: data.longitude,
                accuracy: 1000,
                timestamp: Date.now(),
                source: 'ip'
              };
            }
          }
        } catch {
          continue;
        }
      }

      throw new Error('IP geolocation failed');
    } catch {
      return null;
    }
  };

  // Obter localização padrão (Maputo)
  const getDefaultLocation = (): LocationCoords => {
    return {
      lat: -25.9692,
      lng: 32.5732,
      accuracy: 5000,
      timestamp: Date.now(),
      source: 'default'
    };
  };

  // Função principal - obtém localização com fallback inteligente
  const getCurrentLocation = async (
    forceRefresh: boolean = false,
  ): Promise<LocationCoords | null> => {
    if (!forceRefresh && currentLocation.value && !isLoading.value) {
      return currentLocation.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      let location: LocationCoords | null = null;

      // ESTRATÉGIA 1: Tentar GPS primeiro
      location = await getLocationByGPS();

      // ESTRATÉGIA 2: Tentar rede
      if (!location) {
        location = await getLocationByNetwork();
      }

      // ESTRATÉGIA 3: Tentar IP
      if (!location) {
        location = await getLocationByIP();
      }

      // ESTRATÉGIA 4: Usar localização padrão
      if (!location) {
        location = getDefaultLocation();

        $q.notify({
          type: 'warning',
          message: 'Usando localização aproximada (Maputo)',
          position: 'top',
          timeout: 3000,
        });
      }

      // Atualizar estado
      currentLocation.value = location;
      accuracy.value = location.accuracy || null;
      lastUpdate.value = location.timestamp || Date.now();
      locationSource.value = location.source || null;

      if (location.source !== 'default') {
        const fonte = location.source === 'gps' ? 'GPS' : location.source === 'network' ? 'Rede' : location.source === 'ip' ? 'IP' : 'Padrão';

        $q.notify({
          type: 'positive',
          message: `Localização obtida via ${fonte}!`,
          position: 'top',
          timeout: 2000,
        });
      }

      return location;
    } catch (err) {
      error.value = {
        code: -1,
        message: err instanceof Error ? err.message : 'Erro desconhecido',
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Iniciar rastreamento em tempo real
  const startTracking = (onLocationChange?: (location: LocationCoords) => void): boolean => {
    if (!navigator.geolocation) {
      $q.notify({
        type: 'negative',
        message: 'Geolocalização não suportada',
        position: 'top',
      });
      return false;
    }

    if (watchId !== null) {
      stopTracking();
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;

        const newLocation: LocationCoords = {
          lat: latitude,
          lng: longitude,
          accuracy: acc,
          timestamp: Date.now(),
          source: 'gps'
        };

        currentLocation.value = newLocation;
        accuracy.value = acc;
        lastUpdate.value = Date.now();
        locationSource.value = 'gps';

        if (onLocationChange) {
          onLocationChange(newLocation);
        }
      },
      (watchError) => {
        let mensagem = '';
        switch (watchError.code) {
          case 1:
            mensagem = 'Permissão negada. Ative a localização.';
            break;
          case 2:
            mensagem = 'GPS sem sinal. Saia para área aberta.';
            break;
          case 3:
            mensagem = 'Timeout. Tentando novamente...';
            break;
          default:
            mensagem = 'Erro ao obter localização';
        }

        $q.notify({
          type: 'warning',
          message: mensagem,
          position: 'top',
          timeout: 3000,
        });
      },
      defaultOptions
    );

    isTracking.value = true;

    $q.notify({
      type: 'positive',
      message: 'Rastreamento GPS ativado!',
      position: 'top',
      timeout: 2000,
      icon: 'gps_active',
    });

    return true;
  };

  // Parar rastreamento
  const stopTracking = (): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    isTracking.value = false;
  };

  // Centralizar no mapa
  const centerOnLocation = (map: LeafletMap, location: LocationCoords, zoom: number = 15): void => {
    if (map && location) {
      map.setView([location.lat, location.lng], zoom);
    }
  };

  // Calcular distância
  const calculateDistance = (loc1: LocationCoords, loc2: LocationCoords): number => {
    const R = 6371;
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearError = (): void => {
    error.value = null;
  };

  const reset = (): void => {
    stopTracking();
    currentLocation.value = null;
    isLoading.value = false;
    error.value = null;
    accuracy.value = null;
    lastUpdate.value = null;
    locationSource.value = null;
  };

  return {
    currentLocation,
    isTracking,
    isLoading,
    error,
    accuracy,
    lastUpdate,
    locationSource,
    hasLocation,
    isHighAccuracy,
    isMobileDevice,
    getCurrentLocation,
    startTracking,
    stopTracking,
    centerOnLocation,
    calculateDistance,
    clearError,
    reset,
  };
});
