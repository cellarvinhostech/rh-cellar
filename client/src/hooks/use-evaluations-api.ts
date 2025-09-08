import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/utils/api';
import { queryClient } from '@/lib/queryClient';
import type { APIEvaluation, EvaluationAPIRequest, APIEvaluated, EvaluatedAPIRequest, APIEvaluationWithEvaluated, APIEvaluator, EvaluatorAPIRequest } from '@/types/hr';

const EVALUATIONS_API_URL = 'https://integra.cellarvinhos.com/webhook/f9211713-cc4a-4cb8-8dcc-d1aa236a8fed';
const EVALUATED_API_URL = 'https://integra.cellarvinhos.com/webhook/ea02db38-ee04-4531-8106-e640db7a397b';
const EVALUATORS_API_URL = 'https://integra.cellarvinhos.com/webhook/e8b30622-565e-4c2e-a51b-b589ebd2de5a';

export function useEvaluationsAPI() {
  const [evaluations, setEvaluations] = useState<APIEvaluation[]>([]);
  const [evaluationWithEvaluated, setEvaluationWithEvaluated] = useState<APIEvaluationWithEvaluated | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const makeRequest = async (requestData: EvaluationAPIRequest): Promise<any> => {
    try {
      const response = await authenticatedFetch(EVALUATIONS_API_URL, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  };

  const makeEvaluatedRequest = async (requestData: EvaluatedAPIRequest): Promise<any> => {
    try {
      const response = await authenticatedFetch(EVALUATED_API_URL, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na requisição de avaliados:', error);
      throw error;
    }
  };

  const makeEvaluatorRequest = async (requestData: EvaluatorAPIRequest): Promise<any> => {
    try {
      const response = await authenticatedFetch(EVALUATORS_API_URL, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na requisição de avaliadores:', error);
      throw error;
    }
  };

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest({ operation: 'readAll' });

      if (Array.isArray(response)) {

        const validEvaluations = response.filter((evaluation: any) =>
          evaluation &&
          typeof evaluation === 'object' &&
          evaluation.id &&
          evaluation.name
        );
        setEvaluations(validEvaluations);
      } else if (response.success && Array.isArray(response.data)) {

        const validEvaluations = response.data.filter((evaluation: any) =>
          evaluation &&
          typeof evaluation === 'object' &&
          evaluation.id &&
          evaluation.name
        );
        setEvaluations(validEvaluations);
      } else {
        setEvaluations([]);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setError('Erro ao carregar avaliações');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEvaluationById = useCallback(async (id: string): Promise<APIEvaluationWithEvaluated | null> => {
    try {
      const response = await makeRequest({ operation: 'read', id });

      if (Array.isArray(response) && response.length > 0) {
        const evaluationData = response[0] as APIEvaluationWithEvaluated;
        setEvaluationWithEvaluated(evaluationData);
        return evaluationData;
      } else if (response && response.avaliacao) {
        setEvaluationWithEvaluated(response);
        return response;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a avaliação.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const getEvaluatedEmployees = useCallback((): APIEvaluated[] => {
    if (!evaluationWithEvaluated?.avaliados) return [];
    return evaluationWithEvaluated.avaliados.map(item => item.json);
  }, [evaluationWithEvaluated]);

  const isEmployeeEvaluated = useCallback((userId: string): boolean => {
    const evaluatedList = getEvaluatedEmployees();
    return evaluatedList.some(evaluated => evaluated.user_id === userId);
  }, [getEvaluatedEmployees]);

  const getEvaluators = useCallback((): APIEvaluator[] => {
    if (!evaluationWithEvaluated?.avaliadores) return [];
    return evaluationWithEvaluated.avaliadores.map(item => item.json);
  }, [evaluationWithEvaluated]);

  const getEvaluatorsByEvaluatedId = useCallback((evaluatedId: string): {
    leaders: APIEvaluator[];
    teammates: APIEvaluator[];
    others: APIEvaluator[];
    self: APIEvaluator[];
  } => {
    const allEvaluators = getEvaluators();
    const evaluatedEvaluators = allEvaluators.filter(evaluator =>
      evaluator.avaliado_id === evaluatedId
    );

    return {
      leaders: evaluatedEvaluators.filter(evaluator => evaluator.relacionamento === 'leader'),
      teammates: evaluatedEvaluators.filter(evaluator => evaluator.relacionamento === 'teammate'),
      others: evaluatedEvaluators.filter(evaluator => evaluator.relacionamento === 'other'),
      self: evaluatedEvaluators.filter(evaluator => evaluator.relacionamento === 'self')
    };
  }, [getEvaluators]);

  const isUserEvaluatorOfEvaluated = useCallback((userId: string, evaluatedId: string): boolean => {
    const evaluators = getEvaluators();
    return evaluators.some(evaluator =>
      evaluator.user_id === userId && evaluator.avaliado_id === evaluatedId
    );
  }, [getEvaluators]);

  const createEvaluation = async (data: Partial<APIEvaluation>) => {
    try {
      const response = await makeRequest({ operation: 'create', data });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação criada com sucesso!"
        });

        await fetchEvaluations();
        return response;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEvaluation = async (id: string, data: Partial<APIEvaluation>) => {
    try {
      const response = await makeRequest({ operation: 'update', id, data });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação atualizada com sucesso!"
        });

        await fetchEvaluations();
        return response;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteEvaluation = async (id: string) => {
    try {
      const response = await makeRequest({ operation: 'delete', id });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação excluída com sucesso!"
        });

        await fetchEvaluations();
        return response;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createEvaluated = async (userId: string, evaluationId: string) => {
    try {

      const response = await makeEvaluatedRequest({
        operation: 'create',
        data: {
          user_id: userId,
          avaliacao_id: evaluationId,
          status: 'pending'
        }
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Funcionário adicionado à avaliação com sucesso!"
        });
        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao criar avaliado:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário à avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createMultipleEvaluated = async (userIds: string[], evaluationId: string) => {
    try {

      const evaluatedData = userIds.map(userId => ({
        user_id: userId,
        avaliacao_id: evaluationId,
        status: 'pending' as const
      }));

      const response = await makeEvaluatedRequest({
        operation: 'createMultiple',
        data: evaluatedData
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: `${userIds.length} funcionário(s) adicionado(s) à avaliação!`
        });

        await fetchEvaluationById(evaluationId);

        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao criar múltiplos avaliados:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionários à avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteEvaluated = async (evaluatedId: string, evaluationId: string) => {
    try {

      const response = await makeEvaluatedRequest({
        operation: 'delete',
        id: evaluatedId
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Funcionário removido da avaliação com sucesso!"
        });

        await fetchEvaluationById(evaluationId);

        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao remover avaliado:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário da avaliação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createEvaluator = async (
    userId: string,
    evaluationId: string,
    evaluatedId: string,
    relacionamento: 'leader' | 'teammate' | 'other'
  ) => {
    try {

      const response = await makeEvaluatorRequest({
        operation: 'create',
        data: {
          user_id: userId,
          avaliacao_id: evaluationId,
          avaliado_id: evaluatedId,
          relacionamento,
          status: 'pending'
        }
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliador adicionado com sucesso!"
        });

        queryClient.invalidateQueries({ queryKey: [EVALUATIONS_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATED_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATORS_API_URL] });

        await fetchEvaluationById(evaluationId);

        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao criar avaliador:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar avaliador.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createMultipleEvaluators = async (
    evaluators: Array<{
      userId: string;
      relacionamento: 'leader' | 'teammate' | 'other' | 'self';
    }>,
    evaluationId: string,
    evaluatedId: string
  ) => {
    try {

      const evaluatorsData = evaluators.map(evaluator => ({
        user_id: evaluator.userId,
        avaliacao_id: evaluationId,
        avaliado_id: evaluatedId,
        relacionamento: evaluator.relacionamento,
        status: 'pending' as const
      }));

      const response = await makeEvaluatorRequest({
        operation: 'createMultiple',
        data: evaluatorsData
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: `${evaluators.length} avaliador(es) adicionado(s) com sucesso!`
        });

        queryClient.invalidateQueries({ queryKey: [EVALUATIONS_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATED_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATORS_API_URL] });

        await fetchEvaluationById(evaluationId);

        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao criar múltiplos avaliadores:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar avaliadores.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteEvaluator = async (evaluatorId: string, evaluationId: string) => {
    try {

      const response = await makeEvaluatorRequest({
        operation: 'delete',
        id: evaluatorId
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliador removido com sucesso!"
        });

        queryClient.invalidateQueries({ queryKey: [EVALUATIONS_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATED_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATORS_API_URL] });

        // Comentado para evitar recarregamento desnecessário quando usando remoção otimista
        // A interface já foi atualizada otimisticamente, só recarrega em caso de erro
        // await fetchEvaluationById(evaluationId);

        return response;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao remover avaliador:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover avaliador.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  return {
    evaluations,
    evaluationWithEvaluated,
    loading,
    error,
    fetchEvaluations,
    fetchEvaluationById,
    getEvaluatedEmployees,
    isEmployeeEvaluated,
    getEvaluators,
    getEvaluatorsByEvaluatedId,
    isUserEvaluatorOfEvaluated,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    createEvaluated,
    createMultipleEvaluated,
    deleteEvaluated,
    createEvaluator,
    createMultipleEvaluators,
    deleteEvaluator,
    refetch: fetchEvaluations
  };
}
