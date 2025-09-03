import { useState } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { API_CONFIG } from '@/utils/constants';

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
                console.error('Resposta do servidor:', errorText);
                throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
            }

            // Verificar se a resposta tem conteúdo
            const responseText = await response.text();
            console.log('Resposta raw do servidor:', responseText);

            if (!responseText.trim()) {
                // Para operações readAll, resposta vazia pode ser válida (sem dados salvos)
                if (payload.operation === 'readAll') {
                    return {
                        success: true,
                        data: [],
                        message: 'Nenhuma resposta encontrada'
                    };
                }

                // Para operações de create/update, resposta vazia pode indicar sucesso silencioso
                if (payload.operation === 'create' || payload.operation === 'update') {
                    console.warn('Resposta vazia do servidor para operação:', payload.operation);
                    return {
                        success: true,
                        message: 'Operação realizada com sucesso',
                        data: { id: null } // Retorna um ID nulo que será tratado posteriormente
                    };
                }

                throw new Error('Resposta vazia do servidor');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', responseText);
                throw new Error('Resposta inválida do servidor');
            }

            // Verificar se é array (resposta do readAll)
            if (Array.isArray(data)) {
                console.log('Processando array de respostas do readAll');
                // Processar array de objetos do N8N
                const processedData = data.map(item => {
                    if (item.success && item.data) {
                        // Fazer parse do campo data se for string
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

            // Verificar formato padrão para outras operações
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

        console.log('Payload UPDATE completo:', payload);
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

        console.log('Enviando payload para readAll:', payload);
        const result = await makeRequest(payload);
        console.log('Resposta do readAll:', result);
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
    const submitEvaluation = async (avaliador_id: string, avaliacao_id: string) => {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const payload = {
            operation: 'submitEvaluation',
            status: 'completed',
            completed_at: now,
            updated_at: now,
            avaliador_id: avaliador_id,
            avaliacao_id: avaliacao_id
        };

        console.log('Finalizando avaliação com payload:', payload);
        return await makeRequest(payload);
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
