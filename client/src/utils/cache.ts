type CacheKey = string;
type CacheValue = any;
type CacheObserver = (data: CacheValue) => void;

interface CacheEntry {
    data: CacheValue;
    timestamp: number;
    ttl: number;
}

interface CacheObservers {
    [key: CacheKey]: Set<CacheObserver>;
}

class ApiCache {
    private cache: Map<CacheKey, CacheEntry> = new Map();
    private observers: CacheObservers = {};
    private pendingRequests: Map<CacheKey, Promise<any>> = new Map();

    /**
     * Gera chave de cache baseada na URL e parâmetros
     */
    private generateKey(url: string, options?: RequestInit): CacheKey {
        const method = options?.method || 'GET';
        const body = options?.body || '';
        return `${method}:${url}:${body}`;
    }

    /**
     * Verifica se um item do cache ainda é válido
     */
    private isValid(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp < entry.ttl;
    }

    /**
     * Adiciona um observer para uma chave específica
     */
    subscribe(key: CacheKey, observer: CacheObserver): () => void {
        if (!this.observers[key]) {
            this.observers[key] = new Set();
        }
        this.observers[key].add(observer);

        // Retorna função para remover o observer
        return () => {
            if (this.observers[key]) {
                this.observers[key].delete(observer);
                if (this.observers[key].size === 0) {
                    delete this.observers[key];
                }
            }
        };
    }

    /**
     * Notifica todos os observers de uma chave
     */
    private notify(key: CacheKey, data: CacheValue): void {
        if (this.observers[key]) {
            this.observers[key].forEach(observer => observer(data));
        }
    }

    /**
     * Armazena dados no cache
     */
    set(key: CacheKey, data: CacheValue, ttl: number = 5 * 60 * 1000): void {
        const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };

        this.cache.set(key, entry);
        this.notify(key, data);
    }

    /**
     * Recupera dados do cache
     */
    get(key: CacheKey): CacheValue | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (!this.isValid(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Invalida uma entrada específica do cache
     */
    invalidate(key: CacheKey): void {
        this.cache.delete(key);
    }

    /**
     * Invalida entradas do cache baseado em padrão
     */
    invalidatePattern(pattern: string): void {
        const keysToDelete: CacheKey[] = [];

        this.cache.forEach((_, key) => {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => {
            this.cache.delete(key);
        });
    }

    /**
     * Limpa todo o cache
     */
    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    /**
     * Função principal para fazer requisições com cache
     */
    async fetchWithCache<T>(
        url: string,
        options: RequestInit = {},
        ttl: number = 5 * 60 * 1000 // 5 minutos por padrão
    ): Promise<T> {
        const key = this.generateKey(url, options);

        // Verifica se já existe no cache
        const cachedData = this.get(key);
        if (cachedData !== null) {
            return cachedData;
        }

        // Verifica se já existe uma requisição pendente para evitar requests duplicados
        const pendingRequest = this.pendingRequests.get(key);
        if (pendingRequest) {
            return pendingRequest;
        }

        // Faz a requisição
        const requestPromise = this.makeRequest<T>(url, options)
            .then(data => {
                this.set(key, data, ttl);
                this.pendingRequests.delete(key);
                return data;
            })
            .catch(error => {
                this.pendingRequests.delete(key);
                throw error;
            });

        this.pendingRequests.set(key, requestPromise);
        return requestPromise;
    }

    /**
     * Faz a requisição HTTP real
     */
    private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        if (!text.trim()) {
            return [] as T;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error('Resposta inválida do servidor');
        }
    }

    /**
     * Força uma nova requisição, ignorando o cache
     */
    async forceRefresh<T>(url: string, options: RequestInit = {}, ttl: number = 5 * 60 * 1000): Promise<T> {
        const key = this.generateKey(url, options);
        this.invalidate(key);
        return this.fetchWithCache<T>(url, options, ttl);
    }
}

// Instância singleton do cache
export const apiCache = new ApiCache();

// Tipos para facilitar o uso
export type { CacheKey, CacheObserver };
export { ApiCache };
