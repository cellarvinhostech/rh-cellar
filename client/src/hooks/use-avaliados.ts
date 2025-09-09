import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { API_CONFIG } from '@/utils/constants';
import { useAuth } from '@/hooks/use-auth';

const AVALIADOS_API_URL = 'https://integra.cellarvinhos.com/webhook/ea02db38-ee04-4531-8106-e640db7a397b';
const EVALUATORS_API_URL = 'https://integra.cellarvinhos.com/webhook/e8b30622-565e-4c2e-a51b-b589ebd2de5a';

export interface Avaliado {
    id: string;
    user_id: string;
    avaliacao_id: string;
    status: 'pending' | 'in_progress' | 'completed';
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
    name?: string;
    department?: string;
}export const useAvaliados = (evaluationId?: string, avaliadorId?: string) => {
    const [avaliados, setAvaliados] = useState<Avaliado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();

    const fetchAvaliados = async () => {
        if (!authState?.user?.id || !evaluationId) {
            setError('Usuário não autenticado ou avaliação não especificada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const evaluatorsResponse = await authenticatedFetch(EVALUATORS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: 'readAll'
                }),
            });

            if (!evaluatorsResponse.ok) {
                throw new Error(`Erro na requisição de avaliadores: ${evaluatorsResponse.status}`);
            }

            const evaluatorsData = await evaluatorsResponse.json();
            let evaluatorsList = [];
            
            if (Array.isArray(evaluatorsData)) {
                evaluatorsList = evaluatorsData;
            } else if (evaluatorsData.success && Array.isArray(evaluatorsData.data)) {
                evaluatorsList = evaluatorsData.data;
            }

            const myEvaluatorRelations = evaluatorsList.filter((rel: any) => 
                rel.user_id === authState.user!.id && 
                rel.avaliacao_id === evaluationId
            );

            if (myEvaluatorRelations.length === 0) {
                console.log('Usuário não é avaliador nesta avaliação');
                setAvaliados([]);
                return;
            }

            const avaliadosIds = myEvaluatorRelations.map((rel: any) => rel.avaliado_id);

            const avaliadosResponse = await authenticatedFetch(AVALIADOS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: 'readAll'
                }),
            });

            if (!avaliadosResponse.ok) {
                throw new Error(`Erro na requisição de avaliados: ${avaliadosResponse.status}`);
            }

            const avaliadosData = await avaliadosResponse.json();

            let dataArray = [];
            if (Array.isArray(avaliadosData)) {
                dataArray = avaliadosData;
            } else if (avaliadosData.success && Array.isArray(avaliadosData.data)) {
                dataArray = avaliadosData.data;
            }

            if (dataArray.length > 0) {
                const filteredData = dataArray.filter((item: any) => 
                    item.avaliacao_id === evaluationId && 
                    avaliadosIds.includes(item.id)
                );


                const usersResponse = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}`,
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

                if (!usersResponse.ok) {
                    throw new Error(`Erro na requisição de usuários: ${usersResponse.status}`);
                }

                const usersData = await usersResponse.json();
                let users = [];

                if (Array.isArray(usersData)) {
                    users = usersData;
                } else if (usersData.success && Array.isArray(usersData.data)) {
                    users = usersData.data;
                }

                const departmentsResponse = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`,
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

                if (!departmentsResponse.ok) {
                    throw new Error(`Erro na requisição de departamentos: ${departmentsResponse.status}`);
                }

                const departmentsData = await departmentsResponse.json();
                let departments = [];

                if (Array.isArray(departmentsData)) {
                    departments = departmentsData;
                } else if (departmentsData.success && Array.isArray(departmentsData.data)) {
                    departments = departmentsData.data;
                }

                const avaliadosWithUserData = filteredData.map((avaliado: any) => {
                    const user = users.find((u: any) => u.id === avaliado.user_id);
                    const department = user?.department_id ? departments.find((d: any) => d.id === user.department_id) : null;

                    return {
                        ...avaliado,
                        name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : `Usuário ${avaliado.user_id.slice(0, 8)}`,
                        department: department?.name || department?.nome || 'Sem departamento'
                    };
                });

                setAvaliados(avaliadosWithUserData);
            } else {
                setAvaliados([]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            console.error('Erro ao buscar avaliados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authState?.user?.id) {
            fetchAvaliados();
        }
    }, [authState?.user?.id, evaluationId, avaliadorId]);

    return {
        avaliados,
        loading,
        error,
        refetch: fetchAvaliados
    };
};
