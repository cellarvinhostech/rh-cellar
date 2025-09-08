import { apiCache } from './cache';
import { getCookie } from './cookies';
import { API_CONFIG } from './constants';

/**
 * Versão melhorada da API com cache e observer pattern
 */

/**
 * Função utilitária para fazer requisições autenticadas com cache
 */
export async function authenticatedFetchWithCache<T>(
    url: string,
    options: RequestInit = {},
    cacheOptions: {
        ttl?: number;
        forceRefresh?: boolean;
        cacheKey?: string;
    } = {}
): Promise<T> {
    const token = getCookie(API_CONFIG.STORAGE.TOKEN_COOKIE);

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const requestOptions = {
        ...options,
        headers,
    };

    const { ttl = 5 * 60 * 1000, forceRefresh = false } = cacheOptions;

    if (forceRefresh) {
        return apiCache.forceRefresh<T>(url, requestOptions, ttl);
    }

    return apiCache.fetchWithCache<T>(url, requestOptions, ttl);
}

/**
 * Sistema de cache específico para avaliações pendentes
 */
export class PendingEvaluationsCache {
    private static instance: PendingEvaluationsCache;
    private cacheKey = 'pending-evaluations';
    private statusCachePrefix = 'evaluator-status';

    static getInstance(): PendingEvaluationsCache {
        if (!PendingEvaluationsCache.instance) {
            PendingEvaluationsCache.instance = new PendingEvaluationsCache();
        }
        return PendingEvaluationsCache.instance;
    }

    /**
     * Busca avaliações pendentes com cache
     */
    async getPendingEvaluations(): Promise<any[]> {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PENDING_EVALUATIONS}`;
        const options = {
            method: 'POST',
            body: JSON.stringify({ operation: 'readAll' })
        };

        try {
            const result = await authenticatedFetchWithCache<any>(url, options, {
                ttl: 2 * 60 * 1000, // 2 minutos para avaliações pendentes
                cacheKey: this.cacheKey
            });

            // Normaliza a resposta
            if (Array.isArray(result)) {
                return result;
            } else if (result?.success && Array.isArray(result.data)) {
                return result.data;
            } else if (result?.data) {
                if (typeof result.data === 'string') {
                    try {
                        const parsedData = JSON.parse(result.data);
                        return Array.isArray(parsedData) ? parsedData : [parsedData];
                    } catch {
                        return [result.data];
                    }
                } else {
                    return Array.isArray(result.data) ? result.data : [result.data];
                }
            }

            return [];
        } catch (error) {
            console.error('Erro ao buscar avaliações pendentes:', error);
            return [];
        }
    }

    /**
     * Busca detalhes de uma avaliação específica com cache
     */
    async getEvaluationDetails(evaluationId: string): Promise<any> {
        // Usa o mesmo endpoint do useEvaluationsAPI
        const url = 'https://integra.cellarvinhos.com/webhook/f9211713-cc4a-4cb8-8dcc-d1aa236a8fed';
        const options = {
            method: 'POST',
            body: JSON.stringify({
                operation: 'read',
                id: evaluationId
            })
        };

        const cacheKey = `evaluation-details-${evaluationId}`;

        try {
            return await authenticatedFetchWithCache<any>(url, options, {
                ttl: 3 * 60 * 1000, // 3 minutos para detalhes de avaliação
                cacheKey
            });
        } catch (error) {
            console.error(`Erro ao buscar detalhes da avaliação ${evaluationId}:`, error);
            return null;
        }
    }

    /**
     * Busca status do avaliador com cache eficiente
     */
    async getEvaluatorStatus(evaluationId: string, userId: string): Promise<'pending' | 'in_progress' | 'completed'> {
        const cacheKey = `${this.statusCachePrefix}-${evaluationId}-${userId}`;

        // Primeiro tenta buscar do cache
        const cachedStatus = apiCache.get(cacheKey);
        if (cachedStatus !== null) {
            return cachedStatus;
        }

        // Se não estiver no cache, busca os detalhes da avaliação
        const evaluationData = await this.getEvaluationDetails(evaluationId);

        if (evaluationData) {
            const evaluators = evaluationData.avaliadores?.map((item: any) => item.json) || [];
            const currentUserAsEvaluator = evaluators.find((evaluator: any) =>
                evaluator.user_id === userId
            );

            const status = currentUserAsEvaluator?.status || 'pending';

            // Armazena no cache com TTL menor para status específicos
            apiCache.set(cacheKey, status, 1 * 60 * 1000); // 1 minuto

            return status;
        }

        return 'pending';
    }

    /**
     * Atualiza o cache após uma ação (submissão de avaliação, etc.)
     */
    invalidateCache(evaluationId?: string): void {
        if (evaluationId) {
            // Invalida cache específico da avaliação
            apiCache.invalidatePattern(`evaluation-details-${evaluationId}`);
            apiCache.invalidatePattern(`${this.statusCachePrefix}-${evaluationId}`);
        }

        // Invalida lista de avaliações pendentes
        apiCache.invalidate(this.cacheKey);
    }

    /**
     * Força uma atualização completa do cache
     */
    async refreshCache(): Promise<any[]> {
        this.invalidateCache();
        return this.getPendingEvaluations();
    }

    /**
     * Subscreve para mudanças nas avaliações pendentes
     */
    subscribe(callback: (evaluations: any[]) => void): () => void {
        return apiCache.subscribe(this.cacheKey, callback);
    }

    /**
     * Subscreve para mudanças no status de um avaliador específico
     */
    subscribeToEvaluatorStatus(
        evaluationId: string,
        userId: string,
        callback: (status: string) => void
    ): () => void {
        const cacheKey = `${this.statusCachePrefix}-${evaluationId}-${userId}`;
        return apiCache.subscribe(cacheKey, callback);
    }
}

// Instância singleton
export const pendingEvaluationsCache = PendingEvaluationsCache.getInstance();
