import React, { useState } from "react";
import { ArrowLeft, User, Clock, CheckCircle, AlertCircle, ChevronRight, Crown, Users, UserCheck, Building2, Calendar, FileText, PlayCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePendingEvaluations } from "@/hooks/use-pending-evaluations";
import { useEvaluationQuestions } from "@/hooks/use-evaluation-questions";
import { useLocation } from "wouter";

export default function PendingEvaluations() {
  const { pendingEvaluations, loading, error, refetch } = usePendingEvaluations();
  const { fetchEvaluationQuestions, loading: questionsLoading } = useEvaluationQuestions();
  const [, setLocation] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');

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

  // Agrupar avaliações por avaliacao_id
  const groupedEvaluations = pendingEvaluations.reduce((acc, evaluation) => {
    const key = evaluation.avaliacao_id;
    if (!acc[key]) {
      acc[key] = {
        avaliacao_id: evaluation.avaliacao_id,
        avaliacao_name: evaluation.avaliacao_name,
        avaliacao_description: evaluation.avaliacao_description,
        avaliacao_start_date: evaluation.avaliacao_start_date,
        avaliacao_end_date: evaluation.avaliacao_end_date,
        avaliacao_form_id: evaluation.avaliacao_form_id,
        people: [],
        totalPeople: 0,
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0,
      };
    }
    
    acc[key].people.push(evaluation);
    acc[key].totalPeople++;
    
    if (evaluation.status === 'pending') acc[key].pendingCount++;
    else if (evaluation.status === 'in_progress') acc[key].inProgressCount++;
    else if (evaluation.status === 'completed') acc[key].completedCount++;
    
    return acc;
  }, {} as Record<string, any>);

  const evaluationsList = Object.values(groupedEvaluations);

  // Filtrar por status
  const filteredEvaluations = evaluationsList.filter(evaluation => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return evaluation.pendingCount > 0;
    if (selectedFilter === 'in_progress') return evaluation.inProgressCount > 0;
    if (selectedFilter === 'completed') return evaluation.completedCount > 0;
    return true;
  });

  const handleStartEvaluation = async (evaluation: any) => {
    try {
      // Buscar o formulário e suas questões
      const formData = await fetchEvaluationQuestions(evaluation.avaliacao_id);
      
      if (formData) {
        // Navegar para a página de avaliação
        setLocation(`/evaluation/${evaluation.avaliacao_id}/form`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar formulário:', error);
      alert('Erro ao carregar formulário. Verifique o console para mais detalhes.');
    }
  };

  const statusCounts = {
    all: evaluationsList.length,
    pending: evaluationsList.filter(e => e.pendingCount > 0).length,
    in_progress: evaluationsList.filter(e => e.inProgressCount > 0).length,
    completed: evaluationsList.filter(e => e.completedCount > 0 && e.pendingCount === 0 && e.inProgressCount === 0).length,
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
                  {filteredEvaluations.length === 0 && evaluationsList.length > 0
                    ? "Nenhuma avaliação encontrada com os filtros selecionados"
                    : evaluationsList.length === 0 
                    ? "Nenhuma avaliação encontrada"
                    : `${filteredEvaluations.length} de ${evaluationsList.length} avaliação${evaluationsList.length !== 1 ? 'ões' : ''} ${filteredEvaluations.length !== evaluationsList.length ? 'filtrada' + (filteredEvaluations.length !== 1 ? 's' : '') : 'encontrada' + (evaluationsList.length !== 1 ? 's' : '')}`
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
                Limpar filtros
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
            <span className="text-sm font-medium text-slate-700">Filtrar por status:</span>
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
                  : `Nenhuma avaliação ${getStatusText(selectedFilter).toLowerCase()}`
                }
              </h3>
              <p className="text-slate-600 text-sm">
                {selectedFilter === 'all'
                  ? 'Você não possui avaliações pendentes no momento.'
                  : `Não há avaliações com este status no momento.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => (
              <div
                key={evaluation.avaliacao_id}
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
                        {evaluation.avaliacao_name}
                      </h3>
                      {evaluation.avaliacao_description && (
                        <p className="text-slate-600 text-sm mb-2">
                          {evaluation.avaliacao_description}
                        </p>
                      )}
                      {(evaluation.avaliacao_start_date || evaluation.avaliacao_end_date) && (
                        <p className="text-slate-500 text-xs flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {evaluation.avaliacao_start_date && formatDate(evaluation.avaliacao_start_date)}
                            {evaluation.avaliacao_start_date && evaluation.avaliacao_end_date && ' - '}
                            {evaluation.avaliacao_end_date && formatDate(evaluation.avaliacao_end_date)}
                          </span>
                        </p>
                      )}
                      <p className="text-slate-500 text-xs flex items-center space-x-1 mt-1">
                        <User className="w-3 h-3" />
                        <span>
                          {evaluation.totalPeople} pessoa{evaluation.totalPeople !== 1 ? 's' : ''} para avaliar
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {evaluation.pendingCount > 0 && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            Pendente
                          </span>
                        )}
                        {evaluation.inProgressCount > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            Em progresso
                          </span>
                        )}
                        {evaluation.completedCount > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Concluída
                          </span>
                        )}
                      </div>
                    </div>
                    {evaluation.pendingCount > 0 && (
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
                            <span>Avaliar Agora</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {evaluationsList.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="text-sm font-medium text-slate-700">
                Total de avaliações: <span className="text-slate-900 font-semibold">{evaluationsList.length}</span>
                <span className="text-slate-500 ml-2">
                  ({pendingEvaluations.length} pessoa{pendingEvaluations.length !== 1 ? 's' : ''} para avaliar)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-amber-700">
                    Com pendentes: <span className="font-semibold">{statusCounts.pending}</span>
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
                    Concluídas: <span className="font-semibold">{statusCounts.completed}</span>
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
