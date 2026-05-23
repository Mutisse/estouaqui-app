// src/stores/prestador/prestador-cache-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

// ==========================================
// INTERFACES
// ==========================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  oldestKey: string | null;
  newestKey: string | null;
}

// ==========================================
// CONFIGURAÇÃO
// ==========================================

export const PRESTADOR_CACHE_TTL = {
  INSTANT: 30 * 1000,
  SHORT: 5 * 60 * 1000,
  MEDIUM: 15 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
  SESSION: 0,
};

const CACHE_PREFIX = 'prestador_cache_';

export const usePrestadorCacheStore = defineStore('prestadorCache', () => {
  // ==========================================
  // STATE
  // ==========================================

  const cache = ref<Map<string, CacheItem<unknown>>>(new Map());
  const usePersistence = ref(true);
  const currentPrestadorId = ref<number | null>(null);

  const stats = ref<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    oldestKey: null,
    newestKey: null,
  });

  // ==========================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ==========================================

  function getFullKey(key: string): string {
    return `${CACHE_PREFIX}${currentPrestadorId.value}_${key}`;
  }

  function updateStats(): void {
    const keys = Array.from(cache.value.keys());
    stats.value.size = cache.value.size;
    stats.value.oldestKey = keys[0] || null;
    stats.value.newestKey = keys[keys.length - 1] || null;
  }

  function getTTLFromKey(key: string): number {
    if (key.includes('stats') || key.includes('notificacoes')) {
      return PRESTADOR_CACHE_TTL.INSTANT;
    }
    if (key.includes('solicitacoes') || key.includes('pedidos')) {
      return PRESTADOR_CACHE_TTL.SHORT;
    }
    if (key.includes('agenda') || key.includes('disponibilidade')) {
      return PRESTADOR_CACHE_TTL.MEDIUM;
    }
    if (key.includes('servicos') || key.includes('categorias')) {
      return PRESTADOR_CACHE_TTL.LONG;
    }
    if (key.includes('aux_') || key.includes('options')) {
      return PRESTADOR_CACHE_TTL.VERY_LONG;
    }
    return PRESTADOR_CACHE_TTL.MEDIUM;
  }

  function saveToPersistence(fullKey: string, item: CacheItem<unknown>): void {
    if (!usePersistence.value) return;

    try {
      const ttl = getTTLFromKey(fullKey);
      if (ttl === PRESTADOR_CACHE_TTL.SESSION) {
        sessionStorage.setItem(fullKey, JSON.stringify(item));
      } else {
        localStorage.setItem(fullKey, JSON.stringify(item));
      }
    } catch (error) {
      console.warn('Erro ao salvar cache persistente:', error);
    }
  }

  function loadFromPersistence(fullKey: string): CacheItem<unknown> | null {
    if (!usePersistence.value) return null;

    try {
      let data = sessionStorage.getItem(fullKey);

      if (!data) {
        data = localStorage.getItem(fullKey);
      }

      if (data) {
        const item = JSON.parse(data) as CacheItem<unknown>;

        if (item.expiresAt > Date.now() || item.expiresAt === 0) {
          cache.value.set(fullKey, item);
          updateStats();
          return item;
        } else {
          removeItem(fullKey);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.warn('Erro ao carregar cache persistente:', error);
      return null;
    }
  }

  function removeItem(fullKey: string): void {
    cache.value.delete(fullKey);
    localStorage.removeItem(fullKey);
    sessionStorage.removeItem(fullKey);
    updateStats();
  }

  // ==========================================
  // MÉTODOS PÚBLICOS
  // ==========================================

  function setPrestadorId(id: number): void {
    if (currentPrestadorId.value !== id) {
      currentPrestadorId.value = id;
      clearAll();
    }
  }

  function get<T>(key: string): T | null {
    if (!currentPrestadorId.value) {
      console.warn('PrestadorCache: ID do prestador não definido');
      return null;
    }

    const fullKey = getFullKey(key);

    // Tenta pegar da memória
    const cachedItem = cache.value.get(fullKey);
    let item: CacheItem<unknown> | null = cachedItem || null;

    // Se não tem na memória, tenta persistente
    if (!item) {
      item = loadFromPersistence(fullKey);
    }

    // Verifica se o item existe e não expirou
    if (item && (item.expiresAt > Date.now() || item.expiresAt === 0)) {
      stats.value.hits++;
      // TypeScript já sabe que item.data é do tipo T pela assinatura da função
      return item.data as T;
    }

    // Remove se expirou
    if (item) {
      removeItem(fullKey);
    }

    stats.value.misses++;
    return null;
  }

  function set<T>(
    key: string,
    data: T,
    ttl: number = PRESTADOR_CACHE_TTL.MEDIUM,
    options?: { etag?: string; lastModified?: string },
  ): void {
    if (!currentPrestadorId.value) {
      console.warn('PrestadorCache: ID do prestador não definido');
      return;
    }

    const fullKey = getFullKey(key);
    const now = Date.now();
    const expiresAt = ttl === 0 ? 0 : now + ttl;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt,
      ...(options?.etag && { etag: options.etag }),
      ...(options?.lastModified && { lastModified: options.lastModified }),
    };

    cache.value.set(fullKey, cacheItem as CacheItem<unknown>);
    saveToPersistence(fullKey, cacheItem as CacheItem<unknown>);
    updateStats();
  }

  async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = PRESTADOR_CACHE_TTL.MEDIUM,
    forceRefresh: boolean = false,
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    const data = await fetcher();

    if (data !== null && data !== undefined) {
      set(key, data, ttl);
    }

    return data;
  }

  function invalidatePattern(pattern: string): void {
    if (!currentPrestadorId.value) return;

    const fullPattern = getFullKey(pattern).replace('*', '');
    const keysToDelete: string[] = [];

    for (const key of cache.value.keys()) {
      if (key.includes(fullPattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      cache.value.delete(key);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    updateStats();
  }

  function clearAll(): void {
    if (!currentPrestadorId.value) return;

    const prefix = getFullKey('');

    for (const key of cache.value.keys()) {
      if (key.startsWith(prefix)) {
        cache.value.delete(key);
      }
    }

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) keysToRemove.push(key);
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) keysToRemove.push(key);
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    updateStats();
  }

  function cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of cache.value.entries()) {
      if (item.expiresAt !== 0 && item.expiresAt <= now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      cache.value.delete(key);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    updateStats();
  }

  function getStats(): CacheStats {
    return { ...stats.value };
  }

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    setPrestadorId,
    usePersistence,
    get,
    set,
    fetchWithCache,
    invalidatePattern,
    clearAll,
    cleanExpired,
    getStats,
  };
});
