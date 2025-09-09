import { useState, useEffect, useCallback } from 'react';
import { pendingEvaluationsCache } from '@/utils/api-cache';
import { useAuth } from '@/hooks/use-auth';
import type { PendingEvaluation, EvaluatorStatuses } from '@/types/evaluations';

/**
 * Hook para avaliações pendentes com cache avançado
 */
export const usePendingEvaluations = () => {
    const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();

    const fetchPendingEvaluations = useCallback(async (forceRefresh = false) => {
        if (!authState?.user?.id) {
            setError('Usuário não autenticado');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let evaluations: PendingEvaluation[];

            if (forceRefresh) {
                evaluations = await pendingEvaluationsCache.refreshCache();
            } else {
                evaluations = await pendingEvaluationsCache.getPendingEvaluations();
            }

            setPendingEvaluations(evaluations);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            console.error('Erro ao buscar avaliações pendentes:', error);
        } finally {
            setLoading(false);
        }
    }, [authState?.user?.id]);

    const refetch = useCallback(() => {
        fetchPendingEvaluations(true);
    }, [fetchPendingEvaluations]);

    // Carrega dados iniciais
    useEffect(() => {
        if (authState?.user?.id) {
            fetchPendingEvaluations();
        }
    }, [authState?.user?.id, fetchPendingEvaluations]);

    // Subscreve para atualizações do cache
    useEffect(() => {
        const unsubscribe = pendingEvaluationsCache.subscribe((evaluations) => {
            setPendingEvaluations(evaluations);
        });

        return unsubscribe;
    }, []);

    return {
        pendingEvaluations,
        loading,
        error,
        refetch,
        fetchPendingEvaluations
    };
};

/**
 * Hook para status dos avaliadores com cache avançado
 */
export const useEvaluatorStatuses = (evaluations: PendingEvaluation[]) => {
    const { authState } = useAuth();
    const [evaluatorStatuses, setEvaluatorStatuses] = useState<EvaluatorStatuses>({});
    const [loading, setLoading] = useState(false);

    const loadEvaluatorStatuses = useCallback(async () => {
        if (!authState?.user?.id || evaluations.length === 0) {
            setEvaluatorStatuses({});
            return;
        }

        setLoading(true);
        const statuses: EvaluatorStatuses = {};

        // Carrega status em paralelo para melhor performance
        const statusPromises = evaluations.map(async (evaluation) => {
            try {
                const status = await pendingEvaluationsCache.getEvaluatorStatus(
                    evaluation.id,
                    authState.user!.id
                );
                return { evaluationId: evaluation.id, status };
            } catch (error) {
                console.error(`Erro ao verificar status da avaliação ${evaluation.id}:`, error);
                return { evaluationId: evaluation.id, status: 'pending' as const };
            }
        });

        try {
            const results = await Promise.all(statusPromises);
            results.forEach(({ evaluationId, status }) => {
                statuses[evaluationId] = status;
            });
            setEvaluatorStatuses(statuses);
        } catch (error) {
            console.error('Erro ao carregar status dos avaliadores:', error);
        } finally {
            setLoading(false);
        }
    }, [evaluations, authState?.user?.id]);

    useEffect(() => {
        loadEvaluatorStatuses();
    }, [loadEvaluatorStatuses]);

    // Funções utilitárias
    const getEvaluationStatus = useCallback((evaluationId: string) => {
        return evaluatorStatuses[evaluationId] || 'pending';
    }, [evaluatorStatuses]);

    const getCountByStatus = useCallback((status: 'pending' | 'in_progress' | 'completed'): number => {
        return Object.values(evaluatorStatuses).filter(s => s === status).length;
    }, [evaluatorStatuses]);

    const pendingCount = getCountByStatus('pending');
    const inProgressCount = getCountByStatus('in_progress');
    const completedCount = getCountByStatus('completed');

    // Invalida cache quando uma avaliação é submetida
    const invalidateEvaluationCache = useCallback((evaluationId: string) => {
        pendingEvaluationsCache.invalidateCache(evaluationId);
        loadEvaluatorStatuses();
    }, [loadEvaluatorStatuses]);

    return {
        evaluatorStatuses,
        loading,
        getEvaluationStatus,
        getCountByStatus,
        pendingCount,
        inProgressCount,
        completedCount,
        invalidateEvaluationCache,
        refetch: loadEvaluatorStatuses
    };
};
