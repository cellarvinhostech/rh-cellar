import { useState, useEffect } from 'react';
import { useEvaluationsAPI } from '@/hooks/use-evaluations-api';
import { useAuth } from '@/hooks/use-auth';

export interface EvaluatorStatuses {
    [evaluationId: string]: 'pending' | 'in_progress' | 'completed';
}

export const useEvaluatorStatuses = (evaluations: any[]) => {
    const { fetchEvaluationById } = useEvaluationsAPI();
    const { authState } = useAuth();
    const [evaluatorStatuses, setEvaluatorStatuses] = useState<EvaluatorStatuses>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadEvaluatorStatuses = async () => {
            if (!authState?.user?.id || evaluations.length === 0) {
                setEvaluatorStatuses({});
                return;
            }

            setLoading(true);
            const statuses: EvaluatorStatuses = {};

            for (const evaluation of evaluations) {
                try {
                    const evaluationData = await fetchEvaluationById(evaluation.id);
                    if (evaluationData && authState?.user?.id) {
                        const evaluators = evaluationData.avaliadores?.map(item => item.json) || [];
                        const currentUserAsEvaluator = evaluators.find(evaluator =>
                            evaluator.user_id === authState.user!.id
                        );
                        statuses[evaluation.id] = currentUserAsEvaluator?.status || 'pending';
                    } else {
                        statuses[evaluation.id] = 'pending';
                    }
                } catch (error) {
                    console.error(`Erro ao verificar status da avaliação ${evaluation.id}:`, error);
                    statuses[evaluation.id] = 'pending';
                }
            }

            setEvaluatorStatuses(statuses);
            setLoading(false);
        };

        loadEvaluatorStatuses();
    }, [evaluations, authState?.user?.id, fetchEvaluationById]);

    const getCountByStatus = (status: 'pending' | 'in_progress' | 'completed'): number => {
        return evaluations.filter(e => (evaluatorStatuses[e.id] || 'pending') === status).length;
    };

    const getEvaluationStatus = (evaluationId: string): 'pending' | 'in_progress' | 'completed' => {
        return evaluatorStatuses[evaluationId] || 'pending';
    };

    return {
        evaluatorStatuses,
        loading,
        getCountByStatus,
        getEvaluationStatus,
        pendingCount: getCountByStatus('pending'),
        inProgressCount: getCountByStatus('in_progress'),
        completedCount: getCountByStatus('completed'),
    };
};
