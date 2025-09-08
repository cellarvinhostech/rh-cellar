import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Star, ChevronLeft, ChevronRight, Save, Send, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useEvaluationQuestions } from "@/hooks/use-evaluation-questions";
import { useAvaliados } from "@/hooks/use-avaliados";
import { useEvaluationForm } from "@/hooks/use-evaluation-form";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface EvaluationFormProps {
  evaluationId: string;
}

interface PersonToEvaluate {
  id: string;
  name: string;
  department: string;
}

export default function EvaluationForm({ evaluationId }: EvaluationFormProps) {
  const [, setLocation] = useLocation();
  const { authState } = useAuth();
  const { confirm, confirmState } = useConfirm();
  const { toast } = useToast();
  const { formData, loading, error, fetchEvaluationQuestions } = useEvaluationQuestions();
  const { avaliados } = useAvaliados(evaluationId, authState?.user?.id);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [peopleToEvaluate, setPeopleToEvaluate] = useState<PersonToEvaluate[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    getPersonResponse: getResponse,
    handleResponse: handleFormResponse,
    submitForm,
    validateForm,
    saveDraft,
    hasPendingChanges,
    loading: formLoading,
    autoSaving,
    lastSaved,
    saveFormProgress
  } = useEvaluationForm(
    evaluationId,
    formData?.form?.id || '',
    authState?.user?.id || '',
    peopleToEvaluate
  );

  useEffect(() => {
    fetchEvaluationQuestions(evaluationId);
  }, [evaluationId, fetchEvaluationQuestions]);

  useEffect(() => {
    if (avaliados.length > 0) {
      const people = avaliados.map((avaliado) => ({
        id: avaliado.user_id,
        name: avaliado.name || `Usuário ${avaliado.user_id.slice(0, 8)}`,
        department: avaliado.department || 'Departamento não informado'
      }));
      
      setPeopleToEvaluate(people);
    }
  }, [avaliados]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!autoSaving && !formLoading) {
        saveDraft().catch(error => {
          // Silently handle auto-save errors
        });
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [saveDraft, autoSaving, formLoading]);

  const currentQuestion = formData?.questions[currentQuestionIndex];
  const totalQuestions = formData?.questions.length || 0;

  const handleResponse = (personId: string, response: any) => {
    if (!currentQuestion) return;
    handleFormResponse(personId, currentQuestion.id, response);
  };

  const getPersonResponse = (personId: string) => {
    if (!currentQuestion) return '';
    return getResponse(personId, currentQuestion.id);
  };

  const validateCurrentQuestion = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required || currentQuestion.type === 'section') {
      return true;
    }

    const validation = validateForm([currentQuestion.id]);
    setValidationErrors(validation.missingResponses);
    return validation.isValid;
  };

  const validateAllRequiredQuestions = () => {
    if (!formData?.questions) return false;
    
    const requiredQuestions = formData.questions
      .filter(q => q.required && q.type !== 'section')
      .map(q => q.id);
    
    const validation = validateForm(requiredQuestions);
    setValidationErrors(validation.missingResponses);
    return validation.isValid;
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
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de enviar a avaliação.",
        variant: "destructive",
      });
      return;
    }

    // Usar o hook de confirmação customizado
    const confirmed = await confirm({
      title: 'Finalizar Avaliação',
      message: 'Tem certeza de que deseja finalizar esta avaliação? Esta ação não pode ser desfeita.',
      confirmText: 'Finalizar',
      cancelText: 'Cancelar',
      variant: 'warning'
    });
    
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitForm();
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message || "Avaliação enviada com sucesso!",
          variant: "default",
        });
        setLocation('/pending-evaluations');
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao enviar avaliação. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação. Tente novamente.",
        variant: "destructive",
      });
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
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-7">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = currentResponse === option;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <button
                      onClick={() => handleResponse(person.id, option)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-yellow-100 border-yellow-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          isSelected
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-600 mt-2 text-center font-medium">
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>
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
              onClick={saveDraft}
              disabled={autoSaving || !hasPendingChanges()}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{autoSaving ? 'Salvando...' : 'Salvar Rascunho'}</span>
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

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* Exibir erros de validação */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 font-medium text-sm">Perguntas Obrigatórias não preenchidas</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {currentQuestion.name}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            {currentQuestion.help_text && currentQuestion.type !== 'text' && currentQuestion.type !== 'textarea' && (
              <p className="text-slate-600 text-sm">
                {currentQuestion.help_text}
              </p>
            )}
          </div>

          {/* People to Evaluate ou Section */}
          {currentQuestion.type === 'section' ? (
            <div className="text-center py-4">
            </div>
          ) : peopleToEvaluate.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600 text-sm">Carregando pessoas para avaliar...</p>
              </div>
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
                  </div>
                  
                  <div className="space-y-2">
                    {renderQuestionInput(person)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </MainLayout>
  );
}
