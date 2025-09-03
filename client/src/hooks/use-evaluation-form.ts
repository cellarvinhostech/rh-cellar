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
            console.log('Carregando respostas para:', { userId, evaluationId });
            const result = await getAllResponses(userId, evaluationId);
            console.log('Resultado da API:', result);

            if (result.success && result.data) {
                // Verificar se data é um array ou se está vazio
                const responseData = Array.isArray(result.data) ? result.data : [];

                if (responseData.length === 0) {
                    console.log('Nenhuma resposta encontrada - iniciando nova avaliação');
                    await markEvaluationStarted();
                    return;
                }

                const formattedResponses: EvaluationFormResponse[] = responseData.map((item: any) => {
                    let response = item.response_value;

                    // Tentar fazer parse de JSON se for uma string que parece ser JSON
                    if (typeof response === 'string' && (response.startsWith('[') || response.startsWith('{'))) {
                        try {
                            response = JSON.parse(response);
                        } catch (e) {
                            // Se falhar o parse, manter como string
                            console.log('Não foi possível fazer parse do JSON para resposta:', response);
                        }
                    }

                    return {
                        id: item.id, // Incluir o ID da resposta salva
                        questionId: item.question_id,
                        personId: item.avaliado_id,
                        response: response
                    };
                });
                console.log('Respostas formatadas:', formattedResponses);
                setResponses(formattedResponses);
                // Limpar modificações ao carregar respostas salvas
                setModifiedResponses(new Set());
            } else {
                console.log('Nenhuma resposta encontrada ou resposta inválida - avaliação não iniciada ainda');
                await markEvaluationStarted();
            }
        } catch (error) {
            console.error('Erro ao carregar respostas salvas:', error);
            // Se der erro, marcar como iniciada para não bloquear o usuário
            await markEvaluationStarted();
        }
    };

    const markEvaluationStarted = async () => {
        try {
            // Validar se userId existe
            if (!userId) {
                console.error('userId está vazio ou undefined no markEvaluationStarted');
                return;
            }

            console.log('Marcando avaliação como iniciada...');
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
                    started_at: now, // Marcar quando iniciou
                    last_activity: now // Primeira atividade
                })
            );

            await Promise.all(progressPromises);
            console.log('Avaliação marcada como iniciada para todas as pessoas');
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
                // Mark as modified only if value actually changed
                if (existing.response !== value) {
                    setModifiedResponses(prev => new Set(prev).add(responseKey));
                    // Não chamar updateLastActivity aqui - será chamado no saveDraft
                }

                return prev.map(r =>
                    r.personId === personId && r.questionId === questionId
                        ? { ...r, response: value } // Preserva o ID existente
                        : r
                );
            } else {
                // New response is always considered modified
                setModifiedResponses(prev => new Set(prev).add(responseKey));
                // Não chamar updateLastActivity aqui - será chamado no saveDraft
                return [...prev, { questionId, personId, response: value }]; // Novo item sem ID
            }
        });
    }, []);

    // Atualizar última atividade
    const updateLastActivity = useCallback(async (personId: string) => {
        try {
            // Validar se userId existe
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
                last_activity: new Date().toISOString() // Atualizar última atividade
            });
        } catch (error) {
            console.error('Erro ao atualizar última atividade:', error);
        }
    }, [responses, userId, evaluationId, formId, saveProgress]);

    const saveDraft = useCallback(async () => {
        setAutoSaving(true);
        try {
            // Validar se userId existe
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

            console.log('Respostas a serem salvas:', responsesToSave);
            console.log('Respostas modificadas:', Array.from(modifiedResponses)); if (responsesToSave.length === 0) {
                console.log('Nenhuma resposta modificada para salvar');
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

                console.log('Payload a ser enviado:', payloadData);

                if (response.id) {
                    console.log('Fazendo UPDATE para resposta ID:', response.id);
                    return updateResponseApi(response.id, payloadData);
                } else {
                    console.log('Fazendo CREATE para nova resposta');
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

            // Atualizar progresso para as pessoas que tiveram respostas salvas
            const peopleWithSavedResponses = new Set(
                responsesToSave
                    .filter((_, index) => results[index].success)
                    .map(response => response.personId)
            );

            // Atualizar progresso apenas para pessoas que tiveram respostas salvas
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
                // Calcular progresso específico para cada pessoa
                const personResponses = responses.filter(r => r.personId === person.id);
                const answeredQuestions = personResponses.filter(r => {
                    if (!r.response) return false;

                    // Para strings, verificar se não está vazia
                    if (typeof r.response === 'string') {
                        return r.response.trim() !== '';
                    }

                    // Para arrays (checkbox), verificar se tem itens
                    if (Array.isArray(r.response)) {
                        return r.response.length > 0;
                    }

                    // Para outros tipos, considerar válido se existe
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
            console.log('Iniciando finalização da avaliação...');

            // 1. Primeiro, recarregar as respostas do banco para garantir que temos os dados mais atuais
            await loadSavedResponses();
            await new Promise(resolve => setTimeout(resolve, 200));

            // 2. Filtrar e validar todas as respostas no estado local
            const allResponses = responses.filter(r => {
                if (!r.response) return false;

                // Para strings, verificar se não está vazia
                if (typeof r.response === 'string') {
                    return r.response.trim() !== '';
                }

                // Para arrays (checkbox), verificar se tem itens
                if (Array.isArray(r.response)) {
                    return r.response.length > 0;
                }

                // Para outros tipos, considerar válido se existe
                return true;
            });

            console.log(`Finalizando ${allResponses.length} respostas...`);

            // 3. Para cada resposta válida, tentar primeiro salvar/atualizar como submitted
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
                        // Se temos ID, tentar UPDATE primeiro
                        console.log(`Atualizando resposta ID: ${response.id} para submitted`);
                        return await updateResponseApi(response.id, responseData);
                    } else {
                        // Se não temos ID, criar diretamente como submitted
                        console.log(`Criando nova resposta para: ${response.personId}_${response.questionId}`);
                        return await saveResponse(responseData);
                    }
                } catch (error) {
                    console.error(`Erro ao processar resposta ${response.personId}_${response.questionId}:`, error);
                    // Se falhar UPDATE, tentar CREATE
                    if (response.id) {
                        console.log(`Tentativa de UPDATE falhou, tentando CREATE para: ${response.personId}_${response.questionId}`);
                        try {
                            return await saveResponse(responseData);
                        } catch (createError) {
                            console.error(`Falha também no CREATE:`, createError);
                            return { success: false, error: createError };
                        }
                    }
                    return { success: false, error };
                }
            });

            // 4. Aguardar todas as operações
            const results = await Promise.all(submitPromises);

            // 5. Verificar se pelo menos algumas foram bem-sucedidas
            const successCount = results.filter((result: any) => result.success).length;
            const failCount = results.filter((result: any) => !result.success).length;

            console.log(`Respostas processadas: ${successCount} sucesso, ${failCount} falhas`);

            if (successCount === 0) {
                throw new Error('Nenhuma resposta foi salva com sucesso');
            }

            if (failCount > 0) {
                console.warn(`${failCount} respostas falharam, mas continuando com ${successCount} sucessos`);
            }

            console.log('Processo de finalização das respostas concluído');

            // 6. Verificar e corrigir respostas que ficaram como 'draft'
            console.log('Verificando se todas as respostas foram finalizadas...');
            try {
                // Recarregar respostas do banco para verificar status atual
                const currentResponses = await getAllResponses(userId, evaluationId);

                if (currentResponses.success && currentResponses.data) {
                    const draftResponses = currentResponses.data.filter((resp: any) => resp.status === 'draft');

                    if (draftResponses.length > 0) {
                        console.log(`Encontradas ${draftResponses.length} respostas ainda como draft. Atualizando...`);

                        // Atualizar respostas que ainda estão como draft
                        const updatePromises = draftResponses.map(async (resp: any) => {
                            console.log(`Atualizando resposta ID ${resp.id} para submitted`);
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

                        const updateResults = await Promise.all(updatePromises);
                        const successfulUpdates = updateResults.filter((result: any) => result.success).length;
                        console.log(`${successfulUpdates} de ${draftResponses.length} respostas draft foram atualizadas para submitted`);
                    } else {
                        console.log('Todas as respostas já estão como submitted!');
                    }
                }
            } catch (verificationError) {
                console.warn('Erro na verificação final, mas continuando:', verificationError);
            }

            // 7. Limpar modificações
            setModifiedResponses(new Set());            // 8. Atualizar progresso final para cada pessoa avaliada
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
                    submitted_at: now, // Marcar quando foi submetida
                    is_submission: true // Indicador para o N8N
                });
            });

            await Promise.all(progressPromises);
            console.log('Progresso final atualizado para todas as pessoas');

            // 9. Finalizar a avaliação (marcar como concluída)
            console.log('Finalizando avaliação...');
            const submitResult = await submitEvaluation(userId, evaluationId);

            if (!submitResult.success) {
                console.error('Erro ao finalizar avaliação:', submitResult);
                throw new Error('Falha ao marcar avaliação como finalizada');
            }

            console.log('Avaliação finalizada com sucesso!');
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
    }, [responses, userId, evaluationId, formId, peopleToEvaluate, saveResponse, updateResponseApi, submitEvaluation, getAllResponses, saveProgress]); const validateForm = useCallback((requiredQuestions: string[]) => {
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
