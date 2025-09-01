import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Star, ChevronLeft, ChevronRight, Save, Send, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEvaluationQuestions } from "@/hooks/use-evaluation-questions";
import { usePendingEvaluations } from "@/hooks/use-pending-evaluations";
import { useLocation } from "wouter";

interface EvaluationFormProps {
  evaluationId: string;
}

interface PersonToEvaluate {
  id: string;
  name: string;
  department: string;
  relacionamento: string;
}

interface QuestionResponse {
  questionId: string;
  personId: string;
  response: any;
}

export default function EvaluationForm({ evaluationId }: EvaluationFormProps) {
  const [, setLocation] = useLocation();
  const { formData, loading, error, fetchEvaluationQuestions } = useEvaluationQuestions();
  const { pendingEvaluations } = usePendingEvaluations();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [peopleToEvaluate, setPeopleToEvaluate] = useState<PersonToEvaluate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchEvaluationQuestions(evaluationId);
  }, [evaluationId, fetchEvaluationQuestions]);

  useEffect(() => {
    if (pendingEvaluations.length > 0) {
      const peopleForThisEvaluation = pendingEvaluations.filter((evaluation) => {
        return evaluation.avaliacao_id === evaluationId;
      });
      
      if (peopleForThisEvaluation.length > 0) {
        const people = peopleForThisEvaluation.map(evaluation => ({
          id: evaluation.evaluatedId,
          name: evaluation.evaluatedName,
          department: evaluation.department_name || '',
          relacionamento: evaluation.relacionamento
        }));
        
        setPeopleToEvaluate(people);
      }
    }
  }, [pendingEvaluations, evaluationId]);

  const currentQuestion = formData?.questions[currentQuestionIndex];
  const totalQuestions = formData?.questions.length || 0;

  const handleResponse = (personId: string, response: any) => {
    if (!currentQuestion) return;

    setResponses(prev => {
      const existingIndex = prev.findIndex(
        r => r.questionId === currentQuestion.id && r.personId === personId
      );

      if (existingIndex >= 0) {
        const newResponses = [...prev];
        newResponses[existingIndex] = {
          questionId: currentQuestion.id,
          personId,
          response
        };
        return newResponses;
      } else {
        return [...prev, {
          questionId: currentQuestion.id,
          personId,
          response
        }];
      }
    });
  };

  const getPersonResponse = (personId: string) => {
    if (!currentQuestion) return null;
    return responses.find(
      r => r.questionId === currentQuestion.id && r.personId === personId
    )?.response;
  };

  const validateCurrentQuestion = () => {
    const currentQuestion = formData?.questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.required || currentQuestion.type === 'section') {
      return true;
    }
    
    const errors: string[] = [];
    
    for (const person of peopleToEvaluate) {
      const response = responses.find(
        r => r.questionId === currentQuestion.id && r.personId === person.id
      )?.response;
      
      if (currentQuestion.type === 'rating' && (!response || response === '0')) {
        errors.push(`Avaliação obrigatória não preenchida para ${person.name}`);
      }
      
      if (currentQuestion.type === 'select' && !response) {
        errors.push(`Seleção obrigatória não preenchida para ${person.name}`);
      }
      
      if ((currentQuestion.type === 'text' || currentQuestion.type === 'textarea') && 
          (!response || response.trim().length === 0)) {
        errors.push(`Texto obrigatório não preenchido para ${person.name}`);
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  const validateAllRequiredQuestions = () => {
    if (!formData?.questions) return false;
    
    const errors: string[] = [];
    
    formData.questions.forEach((question, index) => {
      if (question.required && question.type !== 'section') {
        for (const person of peopleToEvaluate) {
          const response = responses.find(
            r => r.questionId === question.id && r.personId === person.id
          )?.response;
          
          if (!response || response === '' || response === null || response === undefined) {
            errors.push(`Questão ${index + 1} ("${question.name}") obrigatória não respondida para ${person.name}`);
          }
        }
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextQuestion = () => {
    setValidationErrors([]);
    
    if (!validateCurrentQuestion()) {
      return; 
    }
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    setValidationErrors([]);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateAllRequiredQuestions()) {
      alert('Por favor, preencha todos os campos obrigatórios antes de enviar a avaliação.');
      return;
    }

    setIsSubmitting(true);
    try {
      alert('Avaliação enviada com sucesso!');
      setLocation('/pending-evaluations');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (person: PersonToEvaluate) => {
    if (!currentQuestion) return null;

    const currentResponse = getPersonResponse(person.id);

    switch (currentQuestion.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentResponse || ''}
            onChange={(e) => handleResponse(person.id, e.target.value)}
            placeholder={currentQuestion.help_text || 'Digite sua resposta...'}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentResponse || ''}
            onChange={(e) => handleResponse(person.id, e.target.value)}
            placeholder={currentQuestion.help_text || 'Digite sua resposta...'}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={currentResponse || ''}
            onChange={(e) => handleResponse(person.id, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione uma opção...</option>
            {currentQuestion.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(person.id, option)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  currentResponse === option
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(currentResponse) && currentResponse.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentResponse) ? currentResponse : [];
                    if (e.target.checked) {
                      handleResponse(person.id, [...currentArray, option]);
                    } else {
                      handleResponse(person.id, currentArray.filter(item => item !== option));
                    }
                  }}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'section':
        return null;
        
      default:
        return (
          <input
            type="text"
            value={currentResponse || ''}
            onChange={(e) => handleResponse(person.id, e.target.value)}
            placeholder="Digite sua resposta..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );
    }
  };

  const getRelacionamentoColor = (relacionamento: string) => {
    switch (relacionamento) {
      case 'leader': return 'bg-purple-100 text-purple-700';
      case 'teammate': return 'bg-blue-100 text-blue-700';
      case 'subordinate': return 'bg-green-100 text-green-700';
      case 'peer': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRelacionamentoText = (relacionamento: string) => {
    switch (relacionamento) {
      case 'leader': return 'Liderança';
      case 'teammate': return 'Colega';
      case 'subordinate': return 'Subordinado';
      case 'peer': return 'Par';
      default: return 'Outro';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando formulário...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !formData) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Erro ao carregar formulário'}</p>
            <button
              onClick={() => setLocation('/pending-evaluations')}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentQuestion) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Nenhuma questão encontrada</p>
            <button
              onClick={() => setLocation('/pending-evaluations')}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setLocation('/pending-evaluations')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="text-sm text-slate-500">
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {formData.form.name}
            </h1>
            <p className="text-slate-600">
              {formData.form.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progresso</span>
              <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* Exibir erros de validação */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 font-medium text-sm">Campos obrigatórios não preenchidos</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {currentQuestion.name}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            {currentQuestion.help_text && (
              <p className="text-slate-600 text-sm">
                {currentQuestion.help_text}
              </p>
            )}
          </div>

          {/* People to Evaluate ou Section */}
          {currentQuestion.type === 'section' ? (
            <div className="text-center py-4">
            </div>
          ) : (
            <div className="space-y-4">
              {peopleToEvaluate.map((person) => (
                <div key={person.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{person.name}</h3>
                        <p className="text-sm text-slate-600">{person.department}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelacionamentoColor(person.relacionamento)}`}>
                      {getRelacionamentoText(person.relacionamento)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {renderQuestionInput(person)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-800 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Salvar rascunho
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Rascunho</span>
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando...' : 'Finalizar Avaliação'}</span>
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
