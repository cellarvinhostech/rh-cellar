import { useState, useCallback } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { API_CONFIG } from '@/utils/constants';

interface FormData {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface QuestionData {
    id: string;
    form_id: string;
    name: string;
    help_text?: string;
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'date' | 'section' | 'rating';
    required: boolean;
    options?: string[];
    question_order: number;
    created_at: string;
    updated_at: string;
}

interface EvaluationFormData {
    form: FormData;
    questions: QuestionData[];
}

export function useEvaluationQuestions() {
    const [formData, setFormData] = useState<EvaluationFormData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvaluationQuestions = useCallback(async (formId: string) => {
        if (!formId) {
            setError('ID do formulário é obrigatório');
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVALUATION_QUESTIONS}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        operation: 'getFormWithQuestions',
                        avaliacao_id: formId
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            // Debug: verificar o que está sendo retornado
            const responseText = await response.text();

            if (!responseText || responseText.trim() === '') {
                throw new Error('Resposta vazia do servidor');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Erro ao fazer parse do JSON:', parseError);
                console.error('📄 Response text:', responseText);
                throw new Error('Resposta inválida do servidor (não é JSON válido)');
            }

            if (data.success && data.form && data.questions) {
                const evaluationData: EvaluationFormData = {
                    form: {
                        id: data.form.id,
                        name: data.form.name,
                        description: data.form.description,
                        is_active: data.form.is_active,
                        created_at: data.form.created_at,
                        updated_at: data.form.updated_at,
                    },
                    questions: data.questions
                        .map((question: any) => ({
                            id: question.id,
                            form_id: question.form_id,
                            name: question.name,
                            help_text: question.help_text,
                            type: question.type,
                            required: question.required === 1 || question.required === true,
                            options: question.options && typeof question.options === 'string'
                                ? question.options.split(',').map((opt: string) => opt.trim())
                                : question.options,
                            question_order: question.question_order,
                            created_at: question.created_at,
                            updated_at: question.updated_at,
                        }))
                        .sort((a: QuestionData, b: QuestionData) => a.question_order - b.question_order),
                };

                setFormData(evaluationData);
                return evaluationData;
            } else {
                throw new Error(data.message || 'Erro ao buscar dados do formulário');
            }
        } catch (error) {
            console.error('Erro ao buscar questões da avaliação:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar formulário';
            setError(errorMessage);
            setFormData(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setFormData(null);
        setError(null);
    }, []);

    return {
        formData,
        loading,
        error,
        fetchEvaluationQuestions,
        clearData,
    };
}
