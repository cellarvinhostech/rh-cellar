import { useState, useEffect, useCallback } from 'react';
import { useEvaluationResponsesApi } from './use-evaluation-responses-api';

export interface EvaluationFormResponse {
    id?: string; // ID da resposta salva no banco
    questionId: string;
    personId: string;
    response: string | string[] | any; // Suporta diferentes tipos de resposta
}

export interface PersonToEvaluate {
    id: string;
    name: string;
    department: string;
    relacionamento: string;
}

export const useEvaluationForm = (
    evaluationId: string,
    formId: string,
    userId: string,
    peopleToEvaluate: PersonToEvaluate[]
) => {
    const [responses, setResponses] = useState<EvaluationFormResponse[]>([]);
    const [modifiedResponses, setModifiedResponses] = useState<Set<string>>(new Set()); // Track modified responses
    const [saving, setSaving] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const {
        saveResponse,
        updateResponse: updateResponseApi,
        getAllResponses,
        saveProgress,
        submitEvaluation,
        getProgress,
        loading,
        error
    } = useEvaluationResponsesApi();

    useEffect(() => {
        if (userId && evaluationId) {
            loadSavedResponses();
        }
    }, [evaluationId, formId, userId]);

    const loadSavedResponses = async () => {
        try {
            const result = await getAllResponses(userId, evaluationId);

            if (result.success && result.data) {
                const responseData = Array.isArray(result.data) ? result.data : [];

                if (responseData.length === 0) {
                    await markEvaluationStarted();
                    return;
                }

                const formattedResponses: EvaluationFormResponse[] = responseData.map((item: any) => {
                    let response = item.response_value;

                    if (typeof response === 'string' && (response.startsWith('[') || response.startsWith('{'))) {
                        try {
                            response = JSON.parse(response);
                        } catch (e) {
                            // Keep as string if parsing fails
                        }
                    }

                    return {
                        id: item.id,
                        questionId: item.question_id,
                        personId: item.avaliado_id,
                        response: response
                    };
                });
                setResponses(formattedResponses);
                setModifiedResponses(new Set());
            } else {
                await markEvaluationStarted();
            }
        } catch (error) {
            console.error('Erro ao carregar respostas salvas:', error);
            await markEvaluationStarted();
        }
    };

    const markEvaluationStarted = async () => {
        try {
            if (!userId) {
                console.error('userId está vazio ou undefined no markEvaluationStarted');
                return;
            }

            const now = new Date().toISOString();

            const progressPromises = peopleToEvaluate.map(person =>
                saveProgress({
                    avaliador_id: userId,
                    avaliado_id: person.id,
                    avaliacao_id: evaluationId,
                    form_id: formId,
                    total_questions: 0,
                    answered_questions: 0,
                    progress_percentage: 0,
                    status: 'in_progress',
                    started_at: now,
                    last_activity: now
                })
            );

            await Promise.all(progressPromises);
        } catch (error) {
            console.error('Erro ao marcar avaliação como iniciada:', error);
        }
    }; const getPersonResponse = useCallback((personId: string, questionId: string): string => {
        const response = responses.find(
            r => r.personId === personId && r.questionId === questionId
        );
        return response?.response || '';
    }, [responses]);

    const updateResponse = useCallback((personId: string, questionId: string, value: string) => {
        const responseKey = `${personId}_${questionId}`;

        setResponses(prev => {
            const existing = prev.find(r => r.personId === personId && r.questionId === questionId);

            if (existing) {
                if (existing.response !== value) {
                    setModifiedResponses(prev => new Set(prev).add(responseKey));
                }

                return prev.map(r =>
                    r.personId === personId && r.questionId === questionId
                        ? { ...r, response: value }
                        : r
                );
            } else {
                setModifiedResponses(prev => new Set(prev).add(responseKey));
                return [...prev, { questionId, personId, response: value }];
            }
        });
    }, []);

    const updateLastActivity = useCallback(async (personId: string) => {
        try {
            if (!userId) {
                console.error('userId está vazio ou undefined no updateLastActivity');
                return;
            }

            const totalQuestions = responses.length;
            const answeredQuestions = responses.filter(r =>
                r.personId === personId &&
                r.response &&
                (typeof r.response === 'string' ? r.response.trim() !== '' : true)
            ).length;

            const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

            await saveProgress({
                avaliador_id: userId,
                avaliado_id: personId,
                avaliacao_id: evaluationId,
                form_id: formId,
                total_questions: totalQuestions,
                answered_questions: answeredQuestions,
                progress_percentage: progressPercentage,
                status: 'in_progress',
                last_activity: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao atualizar última atividade:', error);
        }
    }, [responses, userId, evaluationId, formId, saveProgress]);

    const saveDraft = useCallback(async () => {
        setAutoSaving(true);
        try {
            if (!userId) {
                console.error('userId está vazio ou undefined no saveDraft');
                setAutoSaving(false);
                return;
            }

            const responsesToSave = responses.filter(response => {
                const responseKey = `${response.personId}_${response.questionId}`;

                if (!modifiedResponses.has(responseKey)) {
                    return false;
                }

                if (!response.response) {
                    return false;
                }

                if (typeof response.response === 'string') {
                    return response.response.trim() !== '';
                }

                if (Array.isArray(response.response)) {
                    return response.response.length > 0;
                }

                return true;
            });

            if (responsesToSave.length === 0) {
                setAutoSaving(false);
                return;
            }

            const promises = responsesToSave.map(response => {
                const responseValue = Array.isArray(response.response)
                    ? JSON.stringify(response.response)
                    : String(response.response);

                const payloadData = {
                    avaliador_id: userId,
                    avaliado_id: response.personId,
                    avaliacao_id: evaluationId,
                    form_id: formId,
                    question_id: response.questionId,
                    response_value: responseValue,
                    status: 'draft' as const
                };

                if (response.id) {
                    return updateResponseApi(response.id, payloadData);
                } else {
                    return saveResponse(payloadData);
                }
            });

            const results = await Promise.all(promises);

            const savedResponseKeys = new Set<string>();

            results.forEach((result, index) => {
                const response = responsesToSave[index];
                const responseKey = `${response.personId}_${response.questionId}`;

                if (result.success) {
                    savedResponseKeys.add(responseKey);

                    if (result.data && result.data.id && !response.id) {
                        setResponses(prev => prev.map(r =>
                            r.personId === response.personId && r.questionId === response.questionId
                                ? { ...r, id: result.data.id }
                                : r
                        ));
                    }
                }
            });

            setModifiedResponses(prev => {
                const newSet = new Set(prev);
                savedResponseKeys.forEach(key => newSet.delete(key));
                return newSet;
            });

            const peopleWithSavedResponses = new Set(
                responsesToSave
                    .filter((_, index) => results[index].success)
                    .map(response => response.personId)
            );

            const progressPromises = Array.from(peopleWithSavedResponses).map(personId =>
                updateLastActivity(personId)
            );

            await Promise.all(progressPromises);

            setLastSaved(new Date());
        } catch (error) {
            console.error('Erro ao salvar rascunho:', error);
        } finally {
            setAutoSaving(false);
        }
    }, [responses, modifiedResponses, userId, evaluationId, formId, saveResponse, updateResponseApi, updateLastActivity]);

    const handleResponse = useCallback((personId: string, questionId: string, value: string) => {
        updateResponse(personId, questionId, value);
    }, [updateResponse]);

    const saveFormProgress = useCallback(async (totalQuestions: number) => {
        try {
            const progressPromises = peopleToEvaluate.map(person => {
                const personResponses = responses.filter(r => r.personId === person.id);
                const answeredQuestions = personResponses.filter(r => {
                    if (!r.response) return false;

                    if (typeof r.response === 'string') {
                        return r.response.trim() !== '';
                    }

                    if (Array.isArray(r.response)) {
                        return r.response.length > 0;
                    }

                    return true;
                }).length;

                const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
                const now = new Date().toISOString();

                return saveProgress({
                    avaliador_id: userId,
                    avaliado_id: person.id,
                    avaliacao_id: evaluationId,
                    form_id: formId,
                    total_questions: totalQuestions,
                    answered_questions: answeredQuestions,
                    progress_percentage: progressPercentage,
                    status: answeredQuestions === 0 ? 'in_progress' :
                        answeredQuestions === totalQuestions ? 'completed' : 'in_progress',
                    last_activity: now,
                    completed_at: answeredQuestions === totalQuestions ? now : undefined
                });
            });

            await Promise.all(progressPromises);
        } catch (error) {
            console.error('Erro ao salvar progresso:', error);
        }
    }, [responses, userId, evaluationId, formId, peopleToEvaluate, saveProgress]);

    const submitForm = useCallback(async () => {
        setSaving(true);
        try {
            await loadSavedResponses();
            await new Promise(resolve => setTimeout(resolve, 200));

            const allResponses = responses.filter(r => {
                if (!r.response) return false;

                if (typeof r.response === 'string') {
                    return r.response.trim() !== '';
                }

                if (Array.isArray(r.response)) {
                    return r.response.length > 0;
                }

                return true;
            });

            const submitPromises = allResponses.map(async (response) => {
                const responseValue = Array.isArray(response.response)
                    ? JSON.stringify(response.response)
                    : String(response.response);

                const responseData = {
                    avaliador_id: userId,
                    avaliado_id: response.personId,
                    avaliacao_id: evaluationId,
                    form_id: formId,
                    question_id: response.questionId,
                    response_value: responseValue,
                    status: 'submitted' as const
                };

                try {
                    if (response.id) {
                        return await updateResponseApi(response.id, responseData);
                    } else {
                        return await saveResponse(responseData);
                    }
                } catch (error) {
                    if (response.id) {
                        try {
                            return await saveResponse(responseData);
                        } catch (createError) {
                            return { success: false, error: createError };
                        }
                    }
                    return { success: false, error };
                }
            });

            const results = await Promise.all(submitPromises);

            const successCount = results.filter((result: any) => result.success).length;
            const failCount = results.filter((result: any) => !result.success).length;

            if (successCount === 0) {
                throw new Error('Nenhuma resposta foi salva com sucesso');
            }

            try {
                const currentResponses = await getAllResponses(userId, evaluationId);

                if (currentResponses.success && currentResponses.data) {
                    const draftResponses = currentResponses.data.filter((resp: any) => resp.status === 'draft');

                    if (draftResponses.length > 0) {
                        const updatePromises = draftResponses.map(async (resp: any) => {
                            return updateResponseApi(resp.id, {
                                avaliador_id: userId,
                                avaliado_id: resp.avaliado_id,
                                avaliacao_id: evaluationId,
                                form_id: resp.form_id,
                                question_id: resp.question_id,
                                response_value: resp.response_value,
                                status: 'submitted'
                            });
                        });

                        await Promise.all(updatePromises);
                    }
                }
            } catch (verificationError) {
                console.warn('Erro na verificação final, mas continuando:', verificationError);
            }

            setModifiedResponses(new Set());

            const now = new Date().toISOString();
            const progressPromises = peopleToEvaluate.map(person => {
                const personResponses = responses.filter(r => r.personId === person.id);
                return saveProgress({
                    avaliador_id: userId,
                    avaliado_id: person.id,
                    avaliacao_id: evaluationId,
                    form_id: formId,
                    total_questions: personResponses.length,
                    answered_questions: personResponses.length,
                    progress_percentage: 100,
                    status: 'completed',
                    last_activity: now,
                    completed_at: now,
                    submitted_at: now,
                    is_submission: true
                });
            });

            await Promise.all(progressPromises);

            const avaliadosIds = peopleToEvaluate.map(person => person.id);
            const submitResult = await submitEvaluation(userId, evaluationId, avaliadosIds);

            if (!submitResult.success) {
                console.error('Erro ao finalizar avaliação:', submitResult);
                throw new Error('Falha ao marcar avaliação como finalizada');
            }

            return { success: true, message: 'Avaliação enviada com sucesso!' };

        } catch (error) {
            console.error('Erro ao finalizar avaliação:', error);
            return {
                success: false,
                error,
                message: error instanceof Error ? error.message : 'Erro desconhecido ao finalizar avaliação'
            };
        } finally {
            setSaving(false);
        }
    }, [responses, userId, evaluationId, formId, peopleToEvaluate, saveResponse, updateResponseApi, submitEvaluation, getAllResponses, saveProgress]);

    const validateForm = useCallback((requiredQuestions: string[]) => {
        const missingResponses: string[] = [];

        requiredQuestions.forEach(questionId => {
            peopleToEvaluate.forEach(person => {
                const response = getPersonResponse(person.id, questionId);
                if (!response || response.trim() === '') {
                    missingResponses.push(`Questão ${questionId} para ${person.name}`);
                }
            });
        });

        return {
            isValid: missingResponses.length === 0,
            missingResponses
        };
    }, [peopleToEvaluate, getPersonResponse]);

    return {
        responses,

        loading: loading || saving,
        autoSaving,
        lastSaved,
        error,

        getPersonResponse,
        handleResponse,
        updateResponse,
        saveDraft,

        saveFormProgress,
        submitForm,
        validateForm,

        loadSavedResponses,
    };
};
