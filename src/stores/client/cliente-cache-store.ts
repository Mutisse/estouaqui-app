// src/stores/cliente/cliente-cache-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

export const CLIENTE_CACHE_TTL = {
  INSTANT: 30 * 1000,
  SHORT: 2 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 30 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
};

const CACHE_PREFIX = 'cliente_cache_';

export const useClienteCacheStore = defineStore('clienteCache', () => {
  const cache = ref<Map<string, CacheItem>>(new Map());
  // ✅ Mantido para uso futuro (não removido)
  const usePersistence = ref(true);
  const currentClienteId = ref<number | null>(null);

  const stats = ref<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
  });

  function getFullKey(key: string): string {
    return `${CACHE_PREFIX}${currentClienteId.value}_${key}`;
  }

  function updateStats(): void {
    stats.value.size = cache.value.size;
  }

  function setClienteId(id: number): void {
    if (currentClienteId.value !== id) {
      currentClienteId.value = id;
      clearAll();
    }
  }

  function get<T>(key: string): T | null {
    if (!currentClienteId.value) return null;

    const fullKey = getFullKey(key);
    const item = cache.value.get(fullKey);

    if (item && (item.expiresAt > Date.now() || item.expiresAt === 0)) {
      stats.value.hits++;
      return item.data as T;
    }

    if (item) {
      cache.value.delete(fullKey);
    }

    stats.value.misses++;
    return null;
  }

  function set<T>(key: string, data: T, ttl: number = CLIENTE_CACHE_TTL.MEDIUM): void {
    if (!currentClienteId.value) return;

    const fullKey = getFullKey(key);
    const now = Date.now();
    const expiresAt = ttl === 0 ? 0 : now + ttl;

    cache.value.set(fullKey, { data, timestamp: now, expiresAt });
    updateStats();
  }

  async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CLIENTE_CACHE_TTL.MEDIUM,
    forceRefresh: boolean = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = get<T>(key);
      if (cached !== null) return cached;
    }

    const data = await fetcher();
    if (data !== null && data !== undefined) {
      set(key, data, ttl);
    }
    return data;
  }

  function invalidate(key: string): void {
    if (!currentClienteId.value) return;
    const fullKey = getFullKey(key);
    cache.value.delete(fullKey);
    updateStats();
  }

  function invalidatePattern(pattern: string): void {
    if (!currentClienteId.value) return;

    const fullPattern = getFullKey(pattern).replace('*', '');
    const keysToDelete: string[] = [];

    for (const key of cache.value.keys()) {
      if (key.includes(fullPattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.value.delete(key));
    updateStats();
  }

  function clearAll(): void {
    if (!currentClienteId.value) return;

    const prefix = getFullKey('');
    for (const key of cache.value.keys()) {
      if (key.startsWith(prefix)) {
        cache.value.delete(key);
      }
    }
    updateStats();
  }

  function getStats(): CacheStats {
    return { ...stats.value };
  }

  return {
    setClienteId,
    get,
    set,
    fetchWithCache,
    invalidate,
    invalidatePattern,
    clearAll,
    getStats,
    usePersistence, // ✅ Exportado para uso futuro
  };
});
