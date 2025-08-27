import { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '@/utils/api';
import { useAuth } from './use-auth';
import type { APIEvaluator } from '@/types/hr';

const EVALUATORS_API_URL = 'https://integra.cellarvinhos.com/webhook/e8b30622-565e-4c2e-a51b-b589ebd2de5a';

interface PendingEvaluationSummary {
  id: string;
  evaluationName: string;
  evaluatedName: string;
  evaluatedId: string;
  status: 'pending' | 'in_progress' | 'completed';
  relacionamento: 'leader' | 'teammate' | 'other';
}

export function usePendingEvaluations() {
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  const fetchPendingEvaluations = useCallback(async () => {
    if (!authState.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const storedPendingEvaluations = localStorage.getItem('pending_evaluations');
      
      if (storedPendingEvaluations) {
        console.log('Usando dados das avaliações do localStorage');
        const pendingEvaluationsData = JSON.parse(storedPendingEvaluations);
        
        if (Array.isArray(pendingEvaluationsData)) {
          const pendingEvaluationsSummary: PendingEvaluationSummary[] = pendingEvaluationsData.map((evaluation: any) => {
            const evaluatedName = evaluation.first_name && evaluation.last_name 
              ? `${evaluation.first_name} ${evaluation.last_name}`.trim()
              : 'Funcionário';

            return {
              id: evaluation.id || '',
              evaluationName: 'Avaliação de Performance Q3 2025',
              evaluatedName,
              evaluatedId: evaluation.avaliado_id,
              status: evaluation.status,
              relacionamento: evaluation.relacionamento
            };
          });

          setPendingEvaluations(pendingEvaluationsSummary);
          setLoading(false);
          return;
        }
      }

      console.log('Fazendo requisição para a API de avaliações');
      const response = await authenticatedFetch(EVALUATORS_API_URL, {
        method: 'POST',
        body: JSON.stringify({
          operation: 'readAll'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados das avaliações pendentes - RAW:', data);
      console.log('data.success:', data.success);
      console.log('data.pending_evaluations:', data.pending_evaluations);
      console.log('Array.isArray(data.pending_evaluations):', Array.isArray(data.pending_evaluations));

      if (data.success && Array.isArray(data.pending_evaluations)) {
        const pendingEvaluationsSummary: PendingEvaluationSummary[] = data.pending_evaluations.map((evaluation: any) => {
          const evaluatedName = evaluation.first_name && evaluation.last_name 
            ? `${evaluation.first_name} ${evaluation.last_name}`.trim()
            : 'Funcionário';

          return {
            id: evaluation.id || '',
            evaluationName: 'Avaliação de Performance Q3 2025',
            evaluatedName,
            evaluatedId: evaluation.avaliado_id,
            status: evaluation.status,
            relacionamento: evaluation.relacionamento
          };
        });

        setPendingEvaluations(pendingEvaluationsSummary);
      } else {
        setPendingEvaluations([]);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações pendentes:', error);
      setError('Erro ao carregar avaliações pendentes');
      setPendingEvaluations([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    fetchPendingEvaluations();
  }, [fetchPendingEvaluations]);

  return {
    pendingEvaluations,
    loading,
    error,
    refetch: fetchPendingEvaluations,
    pendingCount: pendingEvaluations.length
  };
}
