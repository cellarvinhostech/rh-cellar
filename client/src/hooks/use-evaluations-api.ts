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

  // Função para fazer requisições à API
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

  // Função para fazer requisições à API de avaliados
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

  // Função para fazer requisições à API de avaliadores
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

  // Buscar todas as avaliações
  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest({ operation: 'readAll' });
      console.log('Resposta da API de avaliações:', response);

      // A API retorna diretamente um array de avaliações
      if (Array.isArray(response)) {
        console.log('Definindo avaliações:', response);
        // Filtrar apenas avaliações válidas (com propriedades obrigatórias)
        const validEvaluations = response.filter((evaluation: any) =>
          evaluation &&
          typeof evaluation === 'object' &&
          evaluation.id &&
          evaluation.name
        );
        setEvaluations(validEvaluations);
      } else if (response.success && Array.isArray(response.data)) {
        console.log('Definindo avaliações via response.data:', response.data);
        // Filtrar apenas avaliações válidas (com propriedades obrigatórias)
        const validEvaluations = response.data.filter((evaluation: any) =>
          evaluation &&
          typeof evaluation === 'object' &&
          evaluation.id &&
          evaluation.name
        );
        setEvaluations(validEvaluations);
      } else {
        console.log('Nenhum dado de avaliação encontrado, definindo array vazio');
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

  // Buscar avaliação específica com avaliados
  const fetchEvaluationById = useCallback(async (id: string): Promise<APIEvaluationWithEvaluated | null> => {
    try {
      const response = await makeRequest({ operation: 'read', id });
      console.log('Resposta da API para avaliação específica:', response);

      // A nova estrutura vem como array com um objeto contendo avaliacao e avaliados
      if (Array.isArray(response) && response.length > 0) {
        const evaluationData = response[0] as APIEvaluationWithEvaluated;
        setEvaluationWithEvaluated(evaluationData);
        return evaluationData;
      } else if (response && response.avaliacao) {
        // Caso a resposta venha diretamente como objeto
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

  // Função helper para obter lista de avaliados da avaliação atual
  const getEvaluatedEmployees = useCallback((): APIEvaluated[] => {
    if (!evaluationWithEvaluated?.avaliados) return [];
    return evaluationWithEvaluated.avaliados.map(item => item.json);
  }, [evaluationWithEvaluated]);

  // Função helper para verificar se um funcionário já está sendo avaliado
  const isEmployeeEvaluated = useCallback((userId: string): boolean => {
    const evaluatedList = getEvaluatedEmployees();
    return evaluatedList.some(evaluated => evaluated.user_id === userId);
  }, [getEvaluatedEmployees]);

  // Função helper para obter lista de avaliadores da avaliação atual
  const getEvaluators = useCallback((): APIEvaluator[] => {
    if (!evaluationWithEvaluated?.avaliadores) return [];
    return evaluationWithEvaluated.avaliadores.map(item => item.json);
  }, [evaluationWithEvaluated]);

  // Função helper para obter avaliadores de um avaliado específico
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

  // Função helper para verificar se um funcionário já é avaliador de um avaliado específico
  const isUserEvaluatorOfEvaluated = useCallback((userId: string, evaluatedId: string): boolean => {
    const evaluators = getEvaluators();
    return evaluators.some(evaluator =>
      evaluator.user_id === userId && evaluator.avaliado_id === evaluatedId
    );
  }, [getEvaluators]);

  // Criar nova avaliação
  const createEvaluation = async (data: Partial<APIEvaluation>) => {
    try {
      const response = await makeRequest({ operation: 'create', data });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação criada com sucesso!"
        });

        // Recarregar lista
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

  // Atualizar avaliação
  const updateEvaluation = async (id: string, data: Partial<APIEvaluation>) => {
    try {
      const response = await makeRequest({ operation: 'update', id, data });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação atualizada com sucesso!"
        });

        // Recarregar lista
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

  // Deletar avaliação
  const deleteEvaluation = async (id: string) => {
    try {
      const response = await makeRequest({ operation: 'delete', id });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliação excluída com sucesso!"
        });

        // Recarregar lista
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

  // Criar novo avaliado
  const createEvaluated = async (userId: string, evaluationId: string) => {
    try {
      console.log('Criando avaliado:', { userId, evaluationId });

      const response = await makeEvaluatedRequest({
        operation: 'create',
        data: {
          user_id: userId,
          avaliacao_id: evaluationId,
          status: 'pending'
        }
      });

      console.log('Resposta da criação de avaliado:', response);

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

  // Criar múltiplos avaliados em uma única requisição
  const createMultipleEvaluated = async (userIds: string[], evaluationId: string) => {
    try {
      console.log('Criando múltiplos avaliados:', { userIds, evaluationId });

      // Preparar array de dados dos avaliados
      const evaluatedData = userIds.map(userId => ({
        user_id: userId,
        avaliacao_id: evaluationId,
        status: 'pending' as const
      }));

      // Enviar todos os avaliados em um único request
      const response = await makeEvaluatedRequest({
        operation: 'createMultiple',
        data: evaluatedData
      });

      console.log('Resposta da criação múltipla de avaliados:', response);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: `${userIds.length} funcionário(s) adicionado(s) à avaliação!`
        });

        // Recarregar os dados da avaliação para atualizar a lista de avaliados
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

  // Remover avaliado
  const deleteEvaluated = async (evaluatedId: string, evaluationId: string) => {
    try {
      console.log('Removendo avaliado:', { evaluatedId, evaluationId });

      const response = await makeEvaluatedRequest({
        operation: 'delete',
        id: evaluatedId
      });

      console.log('Resposta da remoção de avaliado:', response);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Funcionário removido da avaliação com sucesso!"
        });

        // Recarregar os dados da avaliação para atualizar a lista de avaliados
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

  // Criar avaliador
  const createEvaluator = async (
    userId: string,
    evaluationId: string,
    evaluatedId: string,
    relacionamento: 'leader' | 'teammate' | 'other' | 'self'
  ) => {
    try {
      console.log('Criando avaliador:', { userId, evaluationId, evaluatedId, relacionamento });

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

      console.log('Resposta da criação de avaliador:', response);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliador adicionado com sucesso!"
        });

        // Forçar atualização dos dados invalidando o cache
        queryClient.invalidateQueries({ queryKey: [EVALUATIONS_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATED_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATORS_API_URL] });

        // Recarregar os dados da avaliação para atualizar a lista de avaliadores
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

  // Criar múltiplos avaliadores em uma única requisição
  const createMultipleEvaluators = async (
    evaluators: Array<{
      userId: string;
      relacionamento: 'leader' | 'teammate' | 'other' | 'self';
    }>,
    evaluationId: string,
    evaluatedId: string
  ) => {
    try {
      console.log('Criando múltiplos avaliadores:', { evaluators, evaluationId, evaluatedId });

      // Preparar array de dados dos avaliadores
      const evaluatorsData = evaluators.map(evaluator => ({
        user_id: evaluator.userId,
        avaliacao_id: evaluationId,
        avaliado_id: evaluatedId,
        relacionamento: evaluator.relacionamento,
        status: 'pending' as const
      }));

      // Enviar todos os avaliadores em um único request
      const response = await makeEvaluatorRequest({
        operation: 'createMultiple',
        data: evaluatorsData
      });

      console.log('Resposta da criação múltipla de avaliadores:', response);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: `${evaluators.length} avaliador(es) adicionado(s) com sucesso!`
        });

        // Forçar atualização dos dados invalidando o cache
        queryClient.invalidateQueries({ queryKey: [EVALUATIONS_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATED_API_URL] });
        queryClient.invalidateQueries({ queryKey: [EVALUATORS_API_URL] });

        // Recarregar os dados da avaliação para obter os IDs reais dos avaliadores
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

  // Remover avaliador
  const deleteEvaluator = async (evaluatorId: string, evaluationId: string) => {
    try {
      console.log('Removendo avaliador:', { evaluatorId, evaluationId });

      const response = await makeEvaluatorRequest({
        operation: 'delete',
        id: evaluatorId
      });

      console.log('Resposta da remoção de avaliador:', response);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Avaliador removido com sucesso!"
        });

        // Forçar atualização dos dados invalidando o cache
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

  // Carregar avaliações na inicialização
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
