import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { API_CONFIG } from '@/utils/constants';
import { useAuth } from '@/hooks/use-auth';

export interface PendingEvaluation {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_data?: string; // Note: API retorna "end_data" não "end_date"
    form_id: string;
    meta?: number | null;
    peso_lider: number;
    peso_equipe: number;
    peso_outros: number;
    status: 'pending' | 'in_progress' | 'completed';
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export const usePendingEvaluationsApi = () => {
    const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();

    const fetchPendingEvaluations = async () => {
        if (!authState?.user?.id) {
            setError('Usuário não autenticado');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PENDING_EVALUATIONS}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        operation: 'readAll'
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const responseText = await response.text();

            if (!responseText.trim()) {
                setPendingEvaluations([]);
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Resposta inválida do servidor');
            }

            let evaluationsData = [];

            if (Array.isArray(data)) {
                evaluationsData = data;
            } else if (data.success && Array.isArray(data.data)) {
                evaluationsData = data.data;
            } else if (data.data) {
                // Se data for uma string, tentar fazer parse
                if (typeof data.data === 'string') {
                    try {
                        const parsedData = JSON.parse(data.data);
                        evaluationsData = Array.isArray(parsedData) ? parsedData : [parsedData];
                    } catch {
                        evaluationsData = [data.data];
                    }
                } else {
                    evaluationsData = Array.isArray(data.data) ? data.data : [data.data];
                }
            }

            setPendingEvaluations(evaluationsData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            console.error('Erro ao buscar avaliações pendentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        fetchPendingEvaluations();
    };

    useEffect(() => {
        if (authState?.user?.id) {
            fetchPendingEvaluations();
        }
    }, [authState?.user?.id]);

    return {
        pendingEvaluations,
        loading,
        error,
        refetch,
        fetchPendingEvaluations
    };
};
