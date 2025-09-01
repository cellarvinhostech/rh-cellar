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
  department_name?: string;
  status: 'pending' | 'in_progress' | 'completed';
  relacionamento: 'leader' | 'teammate' | 'other';
  avaliacao_id: string;
  avaliacao_name: string;
  avaliacao_description?: string;
  avaliacao_start_date: string;
  avaliacao_end_date: string;
  avaliacao_form_id: string;
}

export function usePendingEvaluations() {
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  const isEvaluationActive = (evaluation: PendingEvaluationSummary) => {
    const now = new Date();
    const startDate = evaluation.avaliacao_start_date ? new Date(evaluation.avaliacao_start_date) : null;
    const endDate = evaluation.avaliacao_end_date ? new Date(evaluation.avaliacao_end_date) : null;

    if (!startDate) return true;

    if (endDate && now > endDate) return false;

    if (now < startDate) return false;

    return true;
  };

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
        const pendingEvaluationsData = JSON.parse(storedPendingEvaluations);

        if (Array.isArray(pendingEvaluationsData)) {
          const pendingEvaluationsSummary: PendingEvaluationSummary[] = pendingEvaluationsData.map((evaluation: any) => {
            const evaluatedName = evaluation.first_name && evaluation.last_name
              ? `${evaluation.first_name} ${evaluation.last_name}`.trim()
              : 'Funcionário';

            return {
              id: evaluation.id || '',
              evaluationName: evaluation.avaliacao_name || 'Avaliação sem nome',
              evaluatedName,
              evaluatedId: evaluation.avaliado_id,
              department_name: evaluation.department_name,
              status: evaluation.status,
              relacionamento: evaluation.relacionamento,
              avaliacao_id: evaluation.avaliacao_id,
              avaliacao_name: evaluation.avaliacao_name,
              avaliacao_description: evaluation.avaliacao_description,
              avaliacao_start_date: evaluation.avaliacao_start_date,
              avaliacao_end_date: evaluation.avaliacao_end_date,
              avaliacao_form_id: evaluation.avaliacao_form_id,
            };
          });

          setPendingEvaluations(pendingEvaluationsSummary);
          setLoading(false);
          return;
        }
      }

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

      if (data.success && Array.isArray(data.pending_evaluations)) {
        const pendingEvaluationsSummary: PendingEvaluationSummary[] = data.pending_evaluations.map((evaluation: any) => {
          const evaluatedName = evaluation.first_name && evaluation.last_name
            ? `${evaluation.first_name} ${evaluation.last_name}`.trim()
            : 'Funcionário';

          return {
            id: evaluation.id || '',
            evaluationName: evaluation.avaliacao_name || 'Avaliação sem nome',
            evaluatedName,
            evaluatedId: evaluation.avaliado_id,
            department_name: evaluation.department_name,
            status: evaluation.status,
            relacionamento: evaluation.relacionamento,
            avaliacao_id: evaluation.avaliacao_id,
            avaliacao_name: evaluation.avaliacao_name,
            avaliacao_description: evaluation.avaliacao_description,
            avaliacao_start_date: evaluation.avaliacao_start_date,
            avaliacao_end_date: evaluation.avaliacao_end_date,
            avaliacao_form_id: evaluation.avaliacao_form_id,
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

  const activeEvaluations = pendingEvaluations.filter(isEvaluationActive);

  return {
    pendingEvaluations: activeEvaluations,
    loading,
    error,
    refetch: fetchPendingEvaluations,
    pendingCount: activeEvaluations.length
  };
}
