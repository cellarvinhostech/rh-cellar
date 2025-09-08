import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Clock, CheckCircle, AlertCircle, ChevronRight, Crown, Users, UserCheck, Building2, Calendar, FileText, PlayCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePendingEvaluationsApi } from "@/hooks/use-pending-evaluations-api";
import { useEvaluationsAPI } from "@/hooks/use-evaluations-api";
import { useEvaluationQuestions } from "@/hooks/use-evaluation-questions";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function PendingEvaluations() {
  const { pendingEvaluations, loading, error, refetch } = usePendingEvaluationsApi();
  const { fetchEvaluationById } = useEvaluationsAPI();
  const { fetchEvaluationQuestions, loading: questionsLoading } = useEvaluationQuestions();
  const [, setLocation] = useLocation();
  const { authState } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');
  const [evaluatorStatuses, setEvaluatorStatuses] = useState<Record<string, 'pending' | 'in_progress' | 'completed'>>({});
  const [loadingEvaluatorStatuses, setLoadingEvaluatorStatuses] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'pending':
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in_progress':
        return 'Em Progresso';
      case 'pending':
      default:
        return 'Pendente';
    }
  };

  const getRelacionamentoText = (relacionamento: string) => {
    switch (relacionamento) {
      case 'leader':
        return 'Liderança';
      case 'teammate':
        return 'Colega de Equipe';
      case 'subordinate':
        return 'Subordinado';
      case 'peer':
        return 'Par Hierárquico';
      case 'other':
      default:
        return 'Outro';
    }
  };

  const getRelacionamentoColor = (relacionamento: string) => {
    switch (relacionamento) {
      case 'leader':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'teammate':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'subordinate':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'peer':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'other':
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getRelacionamentoIcon = (relacionamento: string) => {
    switch (relacionamento) {
      case 'leader':
        return Crown;
      case 'teammate':
        return Users;
      case 'subordinate':
        return UserCheck;
      case 'peer':
        return Building2;
      case 'other':
      default:
        return User;
    }
  };

  const filteredEvaluations = pendingEvaluations.filter(evaluation => {
    if (selectedFilter === 'all') return true;
    
    const evaluatorStatus = evaluatorStatuses[evaluation.id] || 'pending';
    return evaluatorStatus === selectedFilter;
  });

  const checkEvaluatorStatus = async (evaluationId: string): Promise<'pending' | 'in_progress' | 'completed'> => {
    try {
      const evaluationData = await fetchEvaluationById(evaluationId);
      if (!evaluationData || !authState?.user?.id) return 'pending';

      const evaluators = evaluationData.avaliadores?.map(item => item.json) || [];
      const currentUserAsEvaluator = evaluators.find(evaluator => 
        evaluator.user_id === authState.user!.id
      );

      return currentUserAsEvaluator?.status || 'pending';
    } catch (error) {
      console.error('Erro ao verificar status do avaliador:', error);
      return 'pending';
    }
  };

  const handleStartEvaluation = async (evaluation: any) => {
    try {
      const evaluatorStatus = evaluatorStatuses[evaluation.id] || 'pending';
      
      if (evaluatorStatus === 'completed') {
        alert('Você já completou esta avaliação.');
        return;
      }

      const formData = await fetchEvaluationQuestions(evaluation.id);
      
      if (formData) {
        setLocation(`/evaluation/${evaluation.id}/form`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar formulário:', error);
      alert('Erro ao carregar formulário. Verifique o console para mais detalhes.');
    }
  };

  useEffect(() => {
    const loadEvaluatorStatuses = async () => {
      if (!authState?.user?.id || pendingEvaluations.length === 0) return;

      setLoadingEvaluatorStatuses(true);
      const statuses: Record<string, 'pending' | 'in_progress' | 'completed'> = {};
      
      for (const evaluation of pendingEvaluations) {
        try {
          const evaluationData = await fetchEvaluationById(evaluation.id);
          if (evaluationData && authState?.user?.id) {
            const evaluators = evaluationData.avaliadores?.map(item => item.json) || [];
            const currentUserAsEvaluator = evaluators.find(evaluator => 
              evaluator.user_id === authState.user!.id
            );
            statuses[evaluation.id] = currentUserAsEvaluator?.status || 'pending';
          } else {
            statuses[evaluation.id] = 'pending';
          }
        } catch (error) {
          console.error(`Erro ao verificar status da avaliação ${evaluation.id}:`, error);
          statuses[evaluation.id] = 'pending';
        }
      }
      
      setEvaluatorStatuses(statuses);
      setLoadingEvaluatorStatuses(false);
    };

    loadEvaluatorStatuses();
  }, [pendingEvaluations, authState?.user?.id, fetchEvaluationById]);

  const statusCounts = {
    all: pendingEvaluations.length,
    pending: loadingEvaluatorStatuses ? 0 : pendingEvaluations.filter(e => (evaluatorStatuses[e.id] || 'pending') === 'pending').length,
    in_progress: loadingEvaluatorStatuses ? 0 : pendingEvaluations.filter(e => (evaluatorStatuses[e.id] || 'pending') === 'in_progress').length,
    completed: loadingEvaluatorStatuses ? 0 : pendingEvaluations.filter(e => (evaluatorStatuses[e.id] || 'pending') === 'completed').length,
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Carregando avaliações</h3>
                <p className="text-slate-600 text-sm">Aguarde enquanto buscamos suas avaliações...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLocation('/')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Minhas Avaliações Pendentes</h1>
                <p className="text-slate-600 text-sm">
                  {filteredEvaluations.length === 0 && pendingEvaluations.length > 0
                    ? "Nenhuma avaliação encontrada com os filtros selecionados"
                    : pendingEvaluations.length === 0 
                    ? "Nenhuma avaliação encontrada"
                    : `${filteredEvaluations.length} de ${pendingEvaluations.length} avaliação${pendingEvaluations.length !== 1 ? 'ões' : ''} ${filteredEvaluations.length !== pendingEvaluations.length ? 'filtrada' + (filteredEvaluations.length !== 1 ? 's' : '') : 'encontrada' + (pendingEvaluations.length !== 1 ? 's' : '')}`
                  }
                </p>
              </div>
            </div>
            
            {selectedFilter !== 'pending' && (
              <button
                onClick={() => {
                  setSelectedFilter('pending');
                }}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Ver pendentes
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Erro ao carregar avaliações</p>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-2 text-red-600 hover:text-red-700 underline text-sm font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-sm font-medium text-slate-700">Filtrar por meu status:</span>
            {loadingEvaluatorStatuses ? (
              <div className="flex items-center space-x-2 text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                <span className="text-sm">Carregando status...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Todas', count: statusCounts.all },
                  { key: 'pending', label: 'Pendentes', count: statusCounts.pending },
                  { key: 'in_progress', label: 'Em Progresso', count: statusCounts.in_progress },
                  { key: 'completed', label: 'Concluídas', count: statusCounts.completed },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedFilter === filter.key
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluations List */}
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center max-w-sm mx-auto">
              <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {selectedFilter === 'all' 
                  ? 'Nenhuma avaliação encontrada'
                  : selectedFilter === 'pending'
                  ? 'Nenhuma avaliação pendente para você'
                  : selectedFilter === 'in_progress'  
                  ? 'Nenhuma avaliação em progresso'
                  : 'Nenhuma avaliação concluída por você'
                }
              </h3>
              <p className="text-slate-600 text-sm">
                {selectedFilter === 'all'
                  ? 'Você não possui avaliações no momento.'
                  : selectedFilter === 'pending'
                  ? 'Você não possui avaliações pendentes para avaliar.'
                  : selectedFilter === 'in_progress'
                  ? 'Você não possui avaliações em progresso no momento.'
                  : 'Você não completou nenhuma avaliação ainda.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
              >
                {/* Cabeçalho da Avaliação */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {evaluation.name}
                      </h3>
                      {evaluation.description && (
                        <p className="text-slate-600 text-sm mb-2">
                          {evaluation.description}
                        </p>
                      )}
                      {(evaluation.start_date || evaluation.end_data) && (
                        <p className="text-slate-500 text-xs flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {evaluation.start_date && formatDate(evaluation.start_date)}
                            {evaluation.start_date && evaluation.end_data && ' - '}
                            {evaluation.end_data && formatDate(evaluation.end_data)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                          {getStatusText(evaluation.status)}
                        </span>
                        {loadingEvaluatorStatuses ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center space-x-1">
                            <div className="w-3 h-3 border border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                            <span>Verificando...</span>
                          </span>
                        ) : evaluatorStatuses[evaluation.id] && evaluatorStatuses[evaluation.id] !== 'pending' && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(evaluatorStatuses[evaluation.id])}`}>
                            Minha: {getStatusText(evaluatorStatuses[evaluation.id])}
                          </span>
                        )}
                      </div>
                    </div>
                    {!loadingEvaluatorStatuses && ((evaluatorStatuses[evaluation.id] || 'pending') === 'pending' || (evaluatorStatuses[evaluation.id] || 'pending') === 'in_progress') ? (
                      <button
                        onClick={() => handleStartEvaluation(evaluation)}
                        disabled={questionsLoading}
                        className="btn-primary px-4 py-2 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {questionsLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Carregando...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {(evaluatorStatuses[evaluation.id] || 'pending') === 'in_progress' ? 'Continuar' : 'Avaliar Agora'}
                            </span>
                          </>
                        )}
                      </button>
                    ) : !loadingEvaluatorStatuses && (evaluatorStatuses[evaluation.id] || 'pending') === 'completed' ? (
                      <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Você já avaliou</span>
                      </div>
                    ) : loadingEvaluatorStatuses ? (
                      <div className="flex items-center space-x-2 text-slate-500 text-sm">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <span>Verificando...</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredEvaluations.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="text-sm font-medium text-slate-700">
                Total de avaliações: <span className="text-slate-900 font-semibold">{filteredEvaluations.length}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-amber-700">
                    Para avaliar: <span className="font-semibold">{statusCounts.pending}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-blue-700">
                    Em progresso: <span className="font-semibold">{statusCounts.in_progress}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-700">
                    Avaliadas por mim: <span className="font-semibold">{statusCounts.completed}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
