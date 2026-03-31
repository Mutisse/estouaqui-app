// src/stores/cache-store.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const useCacheStore = defineStore('cache', () => {
  const cache = ref<Map<string, CacheItem>>(new Map());
  const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  /**
   * Obter item do cache
   */
  function get<T>(key: string): T | null {
    const item = cache.value.get(key);

    if (!item) return null;

    // Verificar se expirou
    if (Date.now() > item.expiry) {
      cache.value.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Salvar item no cache
   */
  function set<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TIME): void {
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Remover item do cache
   */
  function remove(key: string): void {
    cache.value.delete(key);
  }

  /**
   * Limpar todo o cache
   */
  function clear(): void {
    cache.value.clear();
  }

  /**
   * Limpar cache expirado
   */
  function clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of cache.value.entries()) {
      if (now > item.expiry) {
        cache.value.delete(key);
      }
    }
  }

  /**
   * Buscar com cache (wrapper)
   */
  async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_CACHE_TIME,
    forceRefresh: boolean = false
  ): Promise<T> {
    // Se não for força refresh, tenta pegar do cache
    if (!forceRefresh) {
      const cached = get<T>(key);
      if (cached !== null) {
        console.log(`📦 Cache hit: ${key}`);
        return cached;
      }
    }

    
    // Buscar da API
    const data = await fetcher();

    // Salvar no cache
    set(key, data, ttl);

    return data;
  }

  return {
    cache,
    get,
    set,
    remove,
    clear,
    clearExpired,
    fetchWithCache,
  };
});
