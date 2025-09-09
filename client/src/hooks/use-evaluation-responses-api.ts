import { useState } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { API_CONFIG } from '@/utils/constants';
import { pendingEvaluationsCache } from '@/utils/api-cache';

export interface EvaluationResponse {
    id: string;
    avaliador_id: string;
    avaliado_id: string;
    avaliacao_id: string;
    form_id: string;
    question_id: string;
    response_value: string;
    status: 'draft' | 'submitted';
    created_at: string;
    updated_at: string;
}

export interface EvaluationProgress {
    id: string;
    avaliador_id: string;
    avaliado_id: string;
    avaliacao_id: string;
    form_id: string;
    total_questions: number;
    answered_questions: number;
    progress_percentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    started_at: string | null;
    last_activity: string | null;
    completed_at: string | null;
    submitted_at: string | null;
}

export interface SaveResponseData {
    avaliador_id: string;
    avaliado_id: string;
    avaliacao_id: string;
    form_id: string;
    question_id: string;
    response_value: string;
    status?: 'draft' | 'submitted';
}

export interface SaveProgressData {
    avaliador_id: string;
    avaliado_id: string;
    avaliacao_id: string;
    form_id: string;
    total_questions: number;
    answered_questions: number;
    progress_percentage: number;
    status?: 'not_started' | 'in_progress' | 'completed';
    started_at?: string;
    last_activity?: string;
    completed_at?: string;
    submitted_at?: string;
    is_submission?: boolean; // Indicador para marcar submitted_at
}

export const useEvaluationResponsesApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeRequest = async (payload: any) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVALUATION_RESPONSES}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();

            if (!responseText.trim()) {
                if (payload.operation === 'readAll') {
                    return {
                        success: true,
                        data: [],
                        message: 'Nenhuma resposta encontrada'
                    };
                }

                if (payload.operation === 'create' || payload.operation === 'update') {
                    return {
                        success: true,
                        message: 'Operação realizada com sucesso',
                        data: { id: null }
                    };
                }

                throw new Error('Resposta vazia do servidor');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Resposta inválida do servidor');
            }

            if (Array.isArray(data)) {
                const processedData = data.map(item => {
                    if (item.success && item.data) {
                        const parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                        return parsedData;
                    }
                    return null;
                }).filter(item => item !== null);

                return {
                    success: true,
                    data: processedData,
                    message: 'Respostas carregadas com sucesso'
                };
            }

            if (!data.success) {
                throw new Error(data.message || 'Erro na operação');
            }

            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 1. CREATE - Salvar nova resposta
    const saveResponse = async (data: SaveResponseData) => {
        const payload = {
            operation: 'create',
            data: {
                ...data,
                status: data.status || 'draft'
            }
        };

        return await makeRequest(payload);
    };

    // 2. UPDATE - Atualizar resposta existente
    const updateResponse = async (id: string, data: Partial<SaveResponseData>) => {
        const payload = {
            operation: 'update',
            id,
            data
        };

        return await makeRequest(payload);
    };

    // 3. READ - Buscar resposta específica
    const getResponse = async (id: string) => {
        const payload = {
            operation: 'read',
            id
        };

        return await makeRequest(payload);
    };

    // 4. READALL - Buscar todas as respostas de um avaliador
    const getAllResponses = async (avaliador_id: string, avaliacao_id: string) => {
        const payload = {
            operation: 'readAll',
            data: {
                avaliador_id,
                avaliacao_id
            }
        };

        const result = await makeRequest(payload);
        return result;
    };

    // 5. SAVEDRAFT - Salvar progresso
    const saveProgress = async (data: SaveProgressData) => {
        const payload = {
            operation: 'saveDraft',
            data: {
                ...data,
                status: data.status || 'in_progress'
            }
        };

        return await makeRequest(payload);
    };

    // 6. SUBMITEVAL - Finalizar avaliação
    const submitEvaluation = async (avaliador_id: string, avaliacao_id: string, avaliados_ids?: string[]) => {
        try {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            console.log('=== Iniciando submitEvaluation ===');
            console.log('avaliador_id:', avaliador_id);
            console.log('avaliacao_id:', avaliacao_id);
            console.log('avaliados_ids:', avaliados_ids);

            const markCompletedPayload = {
                operation: 'markEvaluatorCompleted',
                avaliador_id: avaliador_id,
                avaliacao_id: avaliacao_id,
                avaliados_ids: avaliados_ids || [],
                status: 'completed',
                completed_at: now,
                updated_at: now
            };

            console.log('=== Executando markEvaluatorCompleted ===');
            const markResult = await makeRequest(markCompletedPayload);
            console.log('markResult:', markResult);

            const checkPayload = {
                operation: 'checkAllEvaluatorsCompleted',
                avaliacao_id: avaliacao_id,
                avaliador_id: avaliador_id,
                timestamp: now
            };

            const checkResult = await makeRequest(checkPayload);
            console.log('checkResult completo:', JSON.stringify(checkResult, null, 2));

            let resultData = checkResult;
            if (Array.isArray(checkResult) && checkResult.length > 0) {
                resultData = checkResult[0];
                console.log('checkResult é array, usando primeiro elemento:', resultData);
            }

            const allCompleted = resultData.allCompleted === 'true' || resultData.allCompleted === true;
            console.log('allCompleted:', allCompleted);

            if (allCompleted) {
                console.log('=== Todos completaram! Finalizando avaliação ===');
                const finalizePayload = {
                    operation: 'finalizeEvaluation',
                    avaliacao_id: avaliacao_id,
                    status: 'completed',
                    updated_at: now
                };

                const finalizeResult = await makeRequest(finalizePayload);
                console.log('finalizeResult:', finalizeResult);

                pendingEvaluationsCache.invalidateCache(avaliacao_id);

                return {
                    success: true,
                    message: 'Avaliação finalizada com sucesso! Todos os avaliadores completaram.',
                    allCompleted: true,
                    data: finalizeResult
                };
            } else {
                console.log('=== Nem todos completaram ainda ===');
                
                // Invalida cache
                pendingEvaluationsCache.invalidateCache(avaliacao_id);

                return {
                    success: true,
                    message: 'Sua avaliação foi salva com sucesso! Aguardando outros avaliadores.',
                    allCompleted: false,
                    data: markResult
                };
            }

        } catch (error) {
            console.error('Erro no submitEvaluation:', error);
            throw error;
        }
    };

    // 7. GETPROGRESS - Buscar progresso
    const getProgress = async (avaliador_id: string, avaliacao_id: string) => {
        const payload = {
            operation: 'getProgress',
            avaliador_id,
            avaliacao_id
        };

        return await makeRequest(payload);
    };

    // Função helper para salvar rascunho automaticamente
    const saveDraft = async (data: SaveResponseData) => {
        return await saveResponse({
            ...data,
            status: 'draft'
        });
    };

    // Função helper para finalizar resposta
    const submitResponse = async (data: SaveResponseData) => {
        return await saveResponse({
            ...data,
            status: 'submitted'
        });
    };

    return {
        // Estados
        loading,
        error,

        // Operações CRUD
        saveResponse,
        updateResponse,
        getResponse,
        getAllResponses,

        // Operações de progresso
        saveProgress,
        submitEvaluation,
        getProgress,

        // Helpers
        saveDraft,
        submitResponse,
    };
};
