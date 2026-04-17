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
  const STORAGE_PREFIX = 'app_cache_'; // Prefixo para localStorage

  /**
   * Carregar cache do localStorage na inicialização
   */
  function loadFromStorage(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item) as CacheItem;
            // Só carrega se não expirou
            if (Date.now() <= parsed.expiry) {
              const cacheKey = key.replace(STORAGE_PREFIX, '');
              cache.value.set(cacheKey, parsed);
            } else {
              // Remove expirado
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cache do localStorage:', error);
    }
  }

  /**
   * Salvar cache no localStorage
   */
  function persistToStorage(key: string, item: CacheItem): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      // Se estourar quota, limpar caches antigos
      cleanOldCache();
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item));
      } catch (retryError) {
        console.error('Ainda sem espaço após limpeza:', retryError);
      }
    }
  }

  /**
   * Obter item do cache
   */
  function get<T>(key: string): T | null {
    const item = cache.value.get(key);

    if (!item) return null;

    // Verificar se expirou
    if (Date.now() > item.expiry) {
      cache.value.delete(key);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }

    return item.data as T;
  }

  /**
   * Salvar item no cache
   */
  function set<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TIME): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    cache.value.set(key, item as CacheItem);
    persistToStorage(key, item as CacheItem);
  }

  /**
   * Remover item do cache
   */
  function remove(key: string): void {
    cache.value.delete(key);
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }

  /**
   * Invalidar item do cache
   */
  function invalidate(key: string): void {
    remove(key);
  }

  /**
   * Invalidar múltiplos itens do cache por padrão
   */
  function invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const toDelete: string[] = [];

    for (const key of cache.value.keys()) {
      if (regex.test(key)) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      cache.value.delete(key);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }
  }

  /**
   * Limpar todo o cache
   */
  function clear(): void {
    cache.value.clear();

    // Remove todos os itens do localStorage com nosso prefixo
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Limpar cache expirado
   */
  function clearExpired(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, item] of cache.value.entries()) {
      if (now > item.expiry) {
        toDelete.push(key);
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      }
    }

    for (const key of toDelete) {
      cache.value.delete(key);
    }
  }

  /**
   * Limpar caches antigos (quando localStorage está cheio)
   */
  function cleanOldCache(): void {
    const items: { key: string; timestamp: number }[] = [];

    for (const [key, item] of cache.value.entries()) {
      items.push({ key, timestamp: item.timestamp });
    }

    // Ordena por timestamp (mais antigo primeiro)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Remove os 20% mais antigos
    const toRemove = Math.ceil(items.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const item = items[i];
      if (item) {
        cache.value.delete(item.key);
        localStorage.removeItem(`${STORAGE_PREFIX}${item.key}`);
      }
    }
  }

  /**
   * Verificar se item existe no cache e não expirou
   */
  function has(key: string): boolean {
    const item = cache.value.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      cache.value.delete(key);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return false;
    }

    return true;
  }

  /**
   * Obter estatísticas do cache
   */
  function getStats(): { size: number; keys: string[]; memorySize: number } {
    const keys = Array.from(cache.value.keys());
    let memorySize = 0;

    // Estimar tamanho em memória (aproximado)
    for (const [key, item] of cache.value.entries()) {
      memorySize += key.length * 2;
      try {
        memorySize += JSON.stringify(item.data).length * 2;
      } catch {
        // Ignora erros de stringify
      }
    }

    return {
      size: cache.value.size,
      keys,
      memorySize,
    };
  }

  /**
   * Buscar com cache (wrapper)
   */
  async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_CACHE_TIME,
    forceRefresh: boolean = false,
  ): Promise<T> {
    // Se não for força refresh, tenta pegar do cache
    if (!forceRefresh) {
      const cached = get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    try {
      // Buscar da API
      const data = await fetcher();

      // Só salva no cache se os dados não forem vazios/undefined
      if (data !== null && data !== undefined) {
        set(key, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`Erro ao buscar dados para ${key}:`, error);
      throw error;
    }
  }

  // Inicializar: carregar cache do localStorage
  loadFromStorage();

  // Limpar cache expirado a cada 10 minutos
  if (typeof window !== 'undefined') {
    setInterval(
      () => {
        clearExpired();
      },
      10 * 60 * 1000,
    );
  }

  return {
    cache,
    get,
    set,
    remove,
    invalidate,
    invalidatePattern,
    clear,
    clearExpired,
    cleanOldCache,
    has,
    getStats,
    fetchWithCache,
  };
});
