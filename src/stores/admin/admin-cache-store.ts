// src/stores/admin/admin-cache-store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

export const ADMIN_CACHE_TTL = {
  INSTANT: 30 * 1000, // 30 segundos
  SHORT: 2 * 60 * 1000, // 2 minutos
  MEDIUM: 5 * 60 * 1000, // 5 minutos
  LONG: 15 * 60 * 1000, // 15 minutos
  VERY_LONG: 60 * 60 * 1000, // 1 hora
};

const CACHE_PREFIX = 'admin_cache_';

export const useAdminCacheStore = defineStore('adminCache', () => {
  const cache = ref<Map<string, CacheItem>>(new Map());
  const usePersistence = ref(true);
  const currentAdminId = ref<number | null>(null);

  const stats = ref<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
  });

  function getFullKey(key: string): string {
    return `${CACHE_PREFIX}${currentAdminId.value}_${key}`;
  }

  function updateStats(): void {
    stats.value.size = cache.value.size;
  }

  function setAdminId(id: number): void {
    if (currentAdminId.value !== id) {
      currentAdminId.value = id;
      clearAll();
    }
  }

  function saveToPersistence(fullKey: string, item: CacheItem): void {
    if (!usePersistence.value) return;
    try {
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Erro ao salvar cache persistente:', error);
    }
  }

  function loadFromPersistence(fullKey: string): CacheItem | undefined {
    if (!usePersistence.value) return undefined;
    try {
      const data = localStorage.getItem(fullKey);
      if (data) {
        const item = JSON.parse(data) as CacheItem;
        if (item.expiresAt > Date.now() || item.expiresAt === 0) {
          cache.value.set(fullKey, item);
          updateStats();
          return item;
        } else {
          localStorage.removeItem(fullKey);
          return undefined;
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  // ✅ APENAS UMA DECLARAÇÃO DA FUNÇÃO GET
  function get<T>(key: string): T | null {
    if (!currentAdminId.value) return null;

    const fullKey = getFullKey(key);
    let item = cache.value.get(fullKey);

    if (!item) {
      const persisted = loadFromPersistence(fullKey);
      if (persisted) {
        item = persisted;
      }
    }

    if (item && (item.expiresAt > Date.now() || item.expiresAt === 0)) {
      stats.value.hits++;
      return item.data as T;
    }

    if (item) {
      cache.value.delete(fullKey);
      localStorage.removeItem(fullKey);
    }

    stats.value.misses++;
    return null;
  }

  function set<T>(key: string, data: T, ttl: number = ADMIN_CACHE_TTL.MEDIUM): void {
    if (!currentAdminId.value) return;

    const fullKey = getFullKey(key);
    const now = Date.now();
    const expiresAt = ttl === 0 ? 0 : now + ttl;

    const cacheItem: CacheItem = { data, timestamp: now, expiresAt };
    cache.value.set(fullKey, cacheItem);
    saveToPersistence(fullKey, cacheItem);
    updateStats();
  }

  async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = ADMIN_CACHE_TTL.MEDIUM,
    forceRefresh: boolean = false,
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
    if (!currentAdminId.value) return;
    const fullKey = getFullKey(key);
    cache.value.delete(fullKey);
    localStorage.removeItem(fullKey);
    updateStats();
  }

  function invalidatePattern(pattern: string): void {
    if (!currentAdminId.value) return;

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
    });
    updateStats();
  }

  function clearAll(): void {
    if (!currentAdminId.value) return;

    const prefix = getFullKey('');
    for (const key of cache.value.keys()) {
      if (key.startsWith(prefix)) {
        cache.value.delete(key);
        localStorage.removeItem(key);
      }
    }
    updateStats();
  }

  function getStats(): CacheStats {
    return { ...stats.value };
  }

  return {
    setAdminId,
    usePersistence,
    get,
    set,
    fetchWithCache,
    invalidate,
    invalidatePattern,
    clearAll,
    getStats,
  };
});
