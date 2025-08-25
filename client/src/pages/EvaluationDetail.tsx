import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, Star, Edit, Trash2, Users, Plus, Search, X, Crown } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEvaluationsAPI } from "@/hooks/use-evaluations-api";
import { useForms, useFormById } from "@/hooks/use-forms-api";
import { useEmployees } from "@/hooks/use-employees-api";
import { useToast } from "@/hooks/use-toast";
import { FormComponent } from "@/components/forms/FormComponent";
import type { APIEvaluation, APIFormWithQuestions, APIEmployee, APIEvaluationWithEvaluated, APIEvaluated, APIEvaluator, Employee } from "@/types/hr";

export default function EvaluationDetail() {
  const [, params] = useRoute("/evaluations/:id");
  const [, setLocation] = useLocation();
  const evaluationAPI = useEvaluationsAPI();
  const { 
    fetchEvaluationById, 
    deleteEvaluation, 
    createMultipleEvaluated,
    deleteEvaluated,
    createMultipleEvaluators,
    deleteEvaluator,
    evaluationWithEvaluated,
    getEvaluatedEmployees,
    isEmployeeEvaluated,
    getEvaluatorsByEvaluatedId,
    isUserEvaluatorOfEvaluated
  } = evaluationAPI;
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { toast } = useToast();
  
  const [evaluation, setEvaluation] = useState<APIEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'form'>('details');
  const [showEvaluatorsOffcanvas, setShowEvaluatorsOffcanvas] = useState(false);
  const [selectedEvaluated, setSelectedEvaluated] = useState<string | null>(null);
  const [showAddEvaluatedModal, setShowAddEvaluatedModal] = useState(false);
  const [isSavingEvaluated, setIsSavingEvaluated] = useState(false);
  
  // Estado local para remoção otimista de avaliadores
  const [optimisticEvaluationData, setOptimisticEvaluationData] = useState<APIEvaluationWithEvaluated | null>(null);
  
  // Buscar formulário associado
  const { data: formData, isLoading: isLoadingForm } = useFormById(
    evaluation?.form_id || "", 
    { enabled: !!evaluation?.form_id }
  );

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const evaluationData = await fetchEvaluationById(params.id);
        if (evaluationData) {
          setEvaluation(evaluationData.avaliacao);
        } else {
          throw new Error('Avaliação não encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar avaliação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a avaliação.",
          variant: "destructive"
        });
        setLocation('/evaluations');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [params?.id]); // Removido fetchEvaluationById das dependências

  // Sincronizar estado otimista com dados do hook
  useEffect(() => {
    setOptimisticEvaluationData(evaluationWithEvaluated);
  }, [evaluationWithEvaluated]);

  const handleDelete = async () => {
    if (!evaluation) return;
    
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      try {
        await deleteEvaluation(evaluation.id);
        setLocation("/evaluations");
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "concluída":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "concluída":
        return CheckCircle;
      case "in_progress":
      case "em_andamento":
        return Star;
      case "pending":
      case "pendente":
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não definido";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleManageEvaluators = (evaluatedId: string) => {
    setSelectedEvaluated(evaluatedId);
    setShowEvaluatorsOffcanvas(true);
  };

  const handleAddEvaluated = () => {
    setShowAddEvaluatedModal(true);
  };

  const handleSaveEvaluated = async (selectedIds: string[]) => {
    if (!evaluation) return;
    
    try {
      setIsSavingEvaluated(true);
      await createMultipleEvaluated(selectedIds, evaluation.id);
      setShowAddEvaluatedModal(false);
    } catch (error) {
      console.error('Erro ao salvar avaliados:', error);
      // O toast de erro já é mostrado na função createMultipleEvaluated
    } finally {
      setIsSavingEvaluated(false);
    }
  };

  const handleRemoveEvaluated = async (evaluatedId: string) => {
    if (!evaluation) return;
    
    if (confirm("Tem certeza que deseja remover este funcionário da avaliação?")) {
      try {
        await deleteEvaluated(evaluatedId, evaluation.id);
      } catch (error) {
        console.error('Erro ao remover avaliado:', error);
        // O toast de erro já é mostrado na função deleteEvaluated
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600">Carregando avaliação...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!evaluation) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Avaliação não encontrada</h2>
            <p className="text-slate-600 mb-4">A avaliação solicitada não existe ou foi removida.</p>
            <button 
              onClick={() => setLocation("/evaluations")}
              className="btn-primary"
            >
              Voltar para Avaliações
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const StatusIcon = getStatusIcon(evaluation.status);

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLocation("/evaluations")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="back-button"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="evaluation-title">
                  {evaluation.name}
                </h1>
                <p className="text-slate-600">Detalhes da avaliação</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span 
                className={`px-3 py-1 text-sm rounded-full flex items-center space-x-2 ${getStatusColor(evaluation.status)}`}
                data-testid="evaluation-status"
              >
                <StatusIcon className="w-4 h-4" />
                <span>{evaluation.status}</span>
              </span>
              
              <button
                onClick={() => setLocation(`/evaluations/${evaluation.id}/edit`)}
                className="btn-secondary"
                data-testid="edit-evaluation-button"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              
              <button
                onClick={handleDelete}
                className="btn-danger"
                data-testid="delete-evaluation-button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Tabs Navigation */}
          <div className="bg-white border-b border-slate-200 px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                data-testid="details-tab"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Detalhes</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'participants'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                data-testid="participants-tab"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Avaliados & Avaliadores</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'form'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                data-testid="form-tab"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Formulário</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {activeTab === 'details' ? (
                <DetailsTab 
                  evaluation={evaluation} 
                  formatDate={formatDate}
                  StatusIcon={StatusIcon}
                  evaluatedEmployees={getEvaluatedEmployees()}
                />
              ) : activeTab === 'participants' ? (
                <ParticipantsTab 
                  evaluation={evaluation} 
                  evaluatedEmployees={getEvaluatedEmployees()}
                  onManageEvaluators={handleManageEvaluators}
                  onAddEvaluated={handleAddEvaluated}
                  onRemoveEvaluated={handleRemoveEvaluated}
                />
              ) : (
                <FormTab 
                  evaluation={evaluation}
                  formData={formData}
                  isLoadingForm={isLoadingForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offcanvas para Gerenciar Avaliadores */}
      {showEvaluatorsOffcanvas && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowEvaluatorsOffcanvas(false)}
          />
          
          {/* Offcanvas */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <EvaluatorsOffcanvas 
              evaluatedId={selectedEvaluated}
              evaluatedEmployee={getEvaluatedEmployees().find(emp => emp.user_id === selectedEvaluated)}
              evaluation={evaluation}
              employees={employees}
              isLoadingEmployees={isLoadingEmployees}
              evaluationWithEvaluated={evaluationWithEvaluated}
              optimisticEvaluationData={optimisticEvaluationData}
              setOptimisticEvaluationData={setOptimisticEvaluationData}
              getEvaluatorsByEvaluatedId={getEvaluatorsByEvaluatedId}
              isUserEvaluatorOfEvaluated={isUserEvaluatorOfEvaluated}
              createEvaluator={evaluationAPI.createEvaluator}
              onSave={createMultipleEvaluators}
              onDeleteEvaluator={deleteEvaluator}
              onClose={() => setShowEvaluatorsOffcanvas(false)}
            />
          </div>
        </div>
      )}
      
      {/* Modal para Adicionar Avaliados */}
      {showAddEvaluatedModal && (
        <AddEvaluatedModal
          employees={employees}
          isLoadingEmployees={isLoadingEmployees}
          evaluatedEmployees={getEvaluatedEmployees()}
          isSaving={isSavingEvaluated}
          onClose={() => setShowAddEvaluatedModal(false)}
          onSave={handleSaveEvaluated}
        />
      )}
    </MainLayout>
  );
}

// Interface para o Modal de Adicionar Avaliados
interface AddEvaluatedModalProps {
  employees: APIEmployee[];
  isLoadingEmployees: boolean;
  evaluatedEmployees: APIEvaluated[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
}

// Componente para o Modal de Adicionar Avaliados
function AddEvaluatedModal({ employees, isLoadingEmployees, evaluatedEmployees, isSaving, onClose, onSave }: AddEvaluatedModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar funcionários que não estão já selecionados como avaliados
  const availableEmployees = employees.filter(emp => 
    !evaluatedEmployees.some(evaluated => evaluated.user_id === emp.id)
  );
  
  const filteredEmployees = availableEmployees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const departmentName = emp.demartment_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           departmentName.includes(search) ||
           (emp.cargo_name?.toLowerCase() || '').includes(search);
  });

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedIds(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSave = () => {
    if (selectedIds.length > 0) {
      onSave(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Adicionar Funcionários para Avaliação</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Selecione os funcionários que serão avaliados neste processo
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar funcionários..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoadingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-slate-600">Carregando funcionários...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map(employee => {
                const isSelected = selectedIds.includes(employee.id);
                
                return (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleToggleEmployee(employee.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{`${employee.first_name} ${employee.last_name}`}</p>
                        <p className="text-xs text-slate-600">{employee.cargo_name || 'Cargo não informado'}</p>
                        <p className="text-xs text-slate-500">{employee.demartment_name || 'Departamento não informado'}</p>
                      </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-primary border-primary' 
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoadingEmployees && filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>Nenhum funcionário disponível</p>
              <p className="text-sm">Todos os funcionários já foram adicionados ou não há funcionários cadastrados</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {selectedIds.length} funcionário(s) selecionado(s)
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={selectedIds.length === 0 || isSaving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSaving ? 'Adicionando...' : 'Adicionar Selecionados'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interface para o Offcanvas de Avaliadores
interface EvaluatorsOffcanvasProps {
  evaluatedId: string | null;
  evaluatedEmployee?: APIEvaluated;
  evaluation: APIEvaluation | null;
  employees: APIEmployee[];
  isLoadingEmployees: boolean;
  evaluationWithEvaluated: APIEvaluationWithEvaluated | null;
  optimisticEvaluationData: APIEvaluationWithEvaluated | null;
  setOptimisticEvaluationData: (data: APIEvaluationWithEvaluated | null) => void;
  getEvaluatorsByEvaluatedId: (evaluatedId: string) => {
    leaders: APIEvaluator[];
    teammates: APIEvaluator[];
    others: APIEvaluator[];
  };
  isUserEvaluatorOfEvaluated: (userId: string, evaluatedId: string) => boolean;
  createEvaluator: (
    userId: string, 
    evaluationId: string, 
    evaluatedId: string, 
    relacionamento: 'leader' | 'teammate' | 'other'
  ) => Promise<any>;
  onSave: (
    evaluators: Array<{
      userId: string;
      relacionamento: 'leader' | 'teammate' | 'other';
    }>,
    evaluationId: string,
    evaluatedId: string
  ) => Promise<any>;
  onDeleteEvaluator: (evaluatorId: string, evaluationId: string) => Promise<any>;
  onClose: () => void;
}

// Componente para o Offcanvas de Avaliadores
function EvaluatorsOffcanvas({ 
  evaluatedId, 
  evaluatedEmployee, 
  evaluation, 
  employees, 
  isLoadingEmployees, 
  evaluationWithEvaluated,
  optimisticEvaluationData,
  setOptimisticEvaluationData,
  getEvaluatorsByEvaluatedId,
  isUserEvaluatorOfEvaluated,
  createEvaluator,
  onSave, 
  onDeleteEvaluator,
  onClose 
}: EvaluatorsOffcanvasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'leaders' | 'teammates' | 'others'>('leaders');
  const [addingEvaluators, setAddingEvaluators] = useState<Set<string>>(new Set());
  const [removingEvaluators, setRemovingEvaluators] = useState<Set<string>>(new Set());

  // Função helper para obter avaliadores usando dados otimistas quando disponíveis
  const getOptimisticEvaluatorsByEvaluatedId = (evaluatedId: string) => {
    const dataToUse = optimisticEvaluationData || evaluationWithEvaluated;
    
    if (!dataToUse?.avaliadores) {
      return { leaders: [], teammates: [], others: [] };
    }
    
    const allEvaluators = dataToUse.avaliadores.map((item: any) => item.json);
    const evaluatedEvaluators = allEvaluators.filter((evaluator: any) => 
      evaluator.avaliado_id === evaluatedId
    );

    const result = {
      leaders: evaluatedEvaluators.filter((evaluator: any) => evaluator.relacionamento === 'leader'),
      teammates: evaluatedEvaluators.filter((evaluator: any) => evaluator.relacionamento === 'teammate'),
      others: evaluatedEvaluators.filter((evaluator: any) => evaluator.relacionamento === 'other')
    };
    
    return result;
  };

  // Carregar avaliadores existentes quando o componente for montado ou o avaliado mudar
  // Função helper para obter o ID do avaliador baseado no userId e evaluatedId
  const getEvaluatorId = (userId: string): string | null => {
    if (!evaluatedEmployee?.id) return null;
    
    const existingEvaluators = getOptimisticEvaluatorsByEvaluatedId(evaluatedEmployee.id);
    const allEvaluators = [...existingEvaluators.leaders, ...existingEvaluators.teammates, ...existingEvaluators.others];
    
    const evaluator = allEvaluators.find((evaluator: any) => evaluator.user_id === userId);
    return evaluator?.id || null;
  };

  // Função para remover um avaliador existente com remoção otimista
  const handleRemoveExistingEvaluator = async (userId: string) => {
    if (!evaluation || !evaluatedEmployee) return;
    
    const evaluatorId = getEvaluatorId(userId);
    if (!evaluatorId) return;
    
    // Adicionar ao estado de loading
    setRemovingEvaluators(prev => new Set(prev).add(userId));
    
    // Primeiro, fazer a animação visual (remoção otimista)
    // Encontrar em qual categoria o avaliador está
    const existingEvaluators = getOptimisticEvaluatorsByEvaluatedId(evaluatedEmployee.id!);
    const allEvaluators = [...existingEvaluators.leaders, ...existingEvaluators.teammates, ...existingEvaluators.others];
    const evaluatorToRemove = allEvaluators.find((evaluator: any) => evaluator.user_id === userId);
    
    if (!evaluatorToRemove) {
      setRemovingEvaluators(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      return;
    }
    
    // Backup do estado atual para rollback em caso de erro
    const backupEvaluationData = optimisticEvaluationData ? { ...optimisticEvaluationData } : null;
    
    try {
      // 1. Primeiro fazer a animação visual removendo o avaliador dos dados locais
      if (optimisticEvaluationData?.avaliadores) {
        const updatedEvaluators = optimisticEvaluationData.avaliadores.filter(
          (item: any) => item.json.id !== evaluatorId
        );
        
        setOptimisticEvaluationData({
          ...optimisticEvaluationData,
          avaliadores: updatedEvaluators
        });
      }
      
      // 2. Depois executar o request para remover do backend
      await onDeleteEvaluator(evaluatorId, evaluation.id);
      
      // Se chegou até aqui, o request deu certo - os dados serão atualizados pelo hook
      
    } catch (error) {
      console.error('Erro ao remover avaliador:', error);
      
      // 3. Em caso de erro, reverter a operação visual
      if (backupEvaluationData) {
        setOptimisticEvaluationData(backupEvaluationData);
      }
      
      // Mostrar erro para o usuário (o toast já é mostrado na função onDeleteEvaluator)
    } finally {
      // Remover do estado de loading
      setRemovingEvaluators(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Filtrar funcionários baseado no relacionamento com o avaliado
  const getFilteredEmployees = () => {
    if (!evaluatedEmployee) return { leaders: [], teammates: [], others: [] };

    const leaders = employees.filter(emp => 
      emp.id === evaluatedEmployee.lider_direto
    );

    const teammates = employees.filter(emp => 
      emp.id !== evaluatedEmployee.user_id && // Não incluir o próprio avaliado
      emp.id !== evaluatedEmployee.lider_direto && // Não incluir o líder direto (já está em leaders)
      emp.department_id === evaluatedEmployee.department_id // Mesmo departamento
    );

    const others = employees.filter(emp =>
      emp.id !== evaluatedEmployee.user_id && // Não incluir o próprio avaliado
      emp.id !== evaluatedEmployee.lider_direto && // Não incluir o líder direto
      emp.department_id !== evaluatedEmployee.department_id // Departamento diferente
    );

    return { leaders, teammates, others };
  };

  const categorizedEmployees = getFilteredEmployees();

  // Filtrar funcionários da categoria ativa baseado na busca
  const getFilteredEmployeesForCategory = () => {
    const categoryEmployees = categorizedEmployees[activeCategory];
    
    // Remover funcionários que já são avaliadores (salvos no backend)
    const availableEmployees = categoryEmployees.filter(emp => {
      if (!evaluatedEmployee?.id) return true;
      
      // Verificar se já é avaliador salvo no backend
      const isAlreadyEvaluator = isUserEvaluatorOfEvaluated(emp.id, evaluatedEmployee.id!);
      
      return !isAlreadyEvaluator;
    });
    
    if (!searchTerm) return availableEmployees;

    return availableEmployees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const departmentName = emp.demartment_name?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || 
             departmentName.includes(search) ||
             (emp.cargo_name?.toLowerCase() || '').includes(search);
    });
  };

  const filteredEmployees = getFilteredEmployeesForCategory();

  const handleAddEvaluator = async (employee: APIEmployee) => {
    if (!evaluation || !evaluatedEmployee) return;
    
    console.log('handleAddEvaluator chamado:', { employeeId: employee.id, activeCategory, evaluationId: evaluation.id, evaluatedId: evaluatedEmployee.id });
    
    // Adicionar ao estado de loading
    setAddingEvaluators(prev => new Set(prev).add(employee.id));
    
    // Mapear categoria para relacionamento
    const relacionamentoMap = {
      'leaders': 'leader' as const,
      'teammates': 'teammate' as const,
      'others': 'other' as const
    };
    
    const relacionamento = relacionamentoMap[activeCategory];
    
    try {
      // Usar a função correta da API para criar avaliador
      await createEvaluator(
        employee.id,
        evaluation.id,
        evaluatedEmployee.id || evaluatedEmployee.user_id,
        relacionamento
      );
      
      console.log('Avaliador adicionado com sucesso');
      
    } catch (error) {
      console.error('Erro ao adicionar avaliador:', error);
      // O toast de erro já é mostrado na função createEvaluator
    } finally {
      // Remover do estado de loading
      setAddingEvaluators(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee.id);
        return newSet;
      });
    }
  };

  const getEmployeeById = (id: string) => {
    return [...categorizedEmployees.leaders, ...categorizedEmployees.teammates, ...categorizedEmployees.others]
      .find(emp => emp.id === id);
  };

  // Calcular funcionários disponíveis para cada categoria (excluindo os que já são avaliadores)
  const getAvailableCountForCategory = (category: 'leaders' | 'teammates' | 'others') => {
    const categoryEmployees = categorizedEmployees[category];
    if (!evaluatedEmployee?.id) return categoryEmployees.length;
    
    return categoryEmployees.filter(emp => {
      // Verificar se já é avaliador salvo no backend
      const isAlreadyEvaluator = isUserEvaluatorOfEvaluated(emp.id, evaluatedEmployee.id!);
      
      return !isAlreadyEvaluator;
    }).length;
  };

  const categories = [
    { 
      key: 'leaders' as const, 
      label: 'Líderes', 
      icon: Crown, 
      color: 'bg-purple-100 text-purple-800',
      description: `Líder direto (${getAvailableCountForCategory('leaders')} disponível)`
    },
    { 
      key: 'teammates' as const, 
      label: 'Colegas de Equipe', 
      icon: Users, 
      color: 'bg-blue-100 text-blue-800',
      description: `Colegas do mesmo departamento (${getAvailableCountForCategory('teammates')} disponíveis)`
    },
    { 
      key: 'others' as const, 
      label: 'Outros Colegas', 
      icon: User, 
      color: 'bg-green-100 text-green-800',
      description: `Colaboradores de outros departamentos (${getAvailableCountForCategory('others')} disponíveis)`
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Gerenciar Avaliadores</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          {evaluatedEmployee ? (
            <>
              Configurando avaliadores para: <strong>{evaluatedEmployee.user_name}</strong>
              <br />
              <span className="text-xs text-slate-500">
                {evaluatedEmployee.cargo_name} • {evaluatedEmployee.department_name}
              </span>
            </>
          ) : (
            'Selecione os funcionários que irão avaliar este colaborador'
          )}
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar funcionários..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="border-b border-slate-200 px-6">
        <div className="flex space-x-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Category Description */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              {categories.find(c => c.key === activeCategory)?.description}
            </p>
          </div>

          {/* Existing Evaluators */}
          {evaluatedEmployee?.id && (() => {
            const existingEvaluators = getOptimisticEvaluatorsByEvaluatedId(evaluatedEmployee.id);
            const categoryEvaluators = existingEvaluators[activeCategory] || [];
            
            if (categoryEvaluators.length > 0) {
              return (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">
                    Avaliadores Atuais ({categoryEvaluators.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryEvaluators.map((evaluator: any) => {
                      const isRemoving = removingEvaluators.has(evaluator.user_id);
                      
                      return (
                        <div
                          key={evaluator.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{evaluator.user_name}</p>
                              <p className="text-xs text-slate-600">{evaluator.user_cargo_name || 'Cargo não informado'}</p>
                              <p className="text-xs text-slate-500">{evaluator.user_departament_name || 'Departamento não informado'}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveExistingEvaluator(evaluator.user_id)}
                            disabled={isRemoving}
                            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                              isRemoving 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'hover:bg-red-100 text-red-600'
                            }`}
                            title={isRemoving ? "Removendo..." : "Remover avaliador"}
                          >
                            {isRemoving ? (
                              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Available Employees */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Funcionários Disponíveis
            </h3>
            
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-slate-600">Carregando funcionários...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmployees.map(employee => {
                  const isAdding = addingEvaluators.has(employee.id);
                  
                  return (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 border rounded-lg transition-colors bg-white border-slate-200 hover:border-slate-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{`${employee.first_name} ${employee.last_name}`}</p>
                          <p className="text-xs text-slate-600">{employee.cargo_name || 'Cargo não informado'}</p>
                          <p className="text-xs text-slate-500">{employee.demartment_name || 'Departamento não informado'}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddEvaluator(employee)}
                        disabled={isAdding}
                        className={`text-sm flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          isAdding 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Adicionando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoadingEmployees && filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>Nenhum funcionário encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-6">
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="btn-secondary px-8"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para a aba de Detalhes
function DetailsTab({ evaluation, formatDate, StatusIcon, evaluatedEmployees }: {
  evaluation: APIEvaluation;
  formatDate: (date: string) => string;
  StatusIcon: any;
  evaluatedEmployees: APIEvaluated[];
}) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações da Avaliação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <p className="text-slate-900" data-testid="evaluation-name">{evaluation.name}</p>
            </div>
            
            {evaluation.description && (
              <div>
                <label className="text-sm font-medium text-slate-700">Descrição</label>
                <p className="text-slate-900" data-testid="evaluation-description">{evaluation.description}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIcon className="w-4 h-4 text-slate-500" />
                <span className="text-slate-900">{evaluation.status}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Data de Início</span>
              </label>
              <p className="text-slate-900" data-testid="evaluation-start-date">
                {formatDate(evaluation.start_date)}
              </p>
            </div>
            
            {evaluation.end_data && (
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Término</span>
                </label>
                <p className="text-slate-900" data-testid="evaluation-end-date">
                  {formatDate(evaluation.end_data)}
                </p>
              </div>
            )}
            
            {evaluation.meta && (
              <div>
                <label className="text-sm font-medium text-slate-700">Meta</label>
                <p className="text-slate-900" data-testid="evaluation-meta">{evaluation.meta}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pesos de Avaliação */}
        {(evaluation.peso_lider || evaluation.peso_equipe || evaluation.peso_outros) && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pesos da Avaliação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evaluation.peso_lider && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{evaluation.peso_lider}</div>
                  <div className="text-sm text-purple-800">Peso Líder</div>
                </div>
              )}
              
              {evaluation.peso_equipe && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{evaluation.peso_equipe}</div>
                  <div className="text-sm text-blue-800">Peso Equipe</div>
                </div>
              )}
              
              {evaluation.peso_outros && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{evaluation.peso_outros}</div>
                  <div className="text-sm text-green-800">Peso Outros</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resumo dos Avaliados */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumo dos Participantes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{evaluatedEmployees.length}</div>
            <div className="text-sm text-blue-800">Total de Avaliados</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {evaluatedEmployees.filter((e: APIEvaluated) => e.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-800">Pendentes</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {evaluatedEmployees.filter((e: APIEvaluated) => e.status === 'completed').length}
            </div>
            <div className="text-sm text-green-800">Concluídas</div>
          </div>
        </div>
      </div>

      {/* Metadados */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div>
              <span className="font-medium text-slate-700">Criado por:</span>
              <span className="ml-2 text-slate-900">
                {evaluation.created_by_name || evaluation.created_by}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Criado em:</span>
              <span className="ml-2 text-slate-900">{formatDate(evaluation.created_at)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium text-slate-700">Atualizado por:</span>
              <span className="ml-2 text-slate-900">
                {evaluation.updated_by_name || evaluation.updated_by}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Atualizado em:</span>
              <span className="ml-2 text-slate-900">{formatDate(evaluation.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para a aba de Formulário
function FormTab({ evaluation, formData, isLoadingForm }: {
  evaluation: APIEvaluation;
  formData: any;
  isLoadingForm: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Formulário Associado */}
      {evaluation.form_name ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Formulário de Avaliação</h2>
          </div>
          
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900">{evaluation.form_name}</h3>
            {evaluation.form_description && (
              <p className="text-slate-600 text-sm mt-1">{evaluation.form_description}</p>
            )}
            <div className="mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                evaluation.form_is_active === 1 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {evaluation.form_is_active === 1 ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {isLoadingForm ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-slate-600">Carregando formulário...</span>
            </div>
          ) : formData ? (
            <div className="space-y-6">
              {formData.questions && formData.questions.length > 0 ? (
                formData.questions
                  .map((q: any) => q.json)
                  .sort((a: any, b: any) => a.question_order - b.question_order)
                  .map((question: any) => (
                    <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                      <FormComponent 
                        field={{
                          id: question.id,
                          type: question.type as any,
                          label: question.name,
                          placeholder: question.help_text || "",
                          required: question.required === 1,
                          options: question.options ? 
                            (Array.isArray(question.options) ? question.options : 
                             typeof question.options === 'string' ? 
                               JSON.parse(question.options) : []) : undefined
                        }}
                        disabled
                      />
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p>Nenhuma pergunta cadastrada neste formulário</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>Erro ao carregar o formulário</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p>Nenhum formulário associado a esta avaliação</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para a aba de Participantes
function ParticipantsTab({ 
  evaluation, 
  evaluatedEmployees,
  onManageEvaluators,
  onAddEvaluated,
  onRemoveEvaluated 
}: { 
  evaluation: APIEvaluation; 
  evaluatedEmployees: APIEvaluated[];
  onManageEvaluators: (evaluatedId: string) => void;
  onAddEvaluated: () => void;
  onRemoveEvaluated: (evaluatedId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Seção de Avaliados */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Funcionários a serem Avaliados</span>
          </h3>
          <button 
            className="btn-primary text-sm"
            onClick={onAddEvaluated}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Avaliado
          </button>
        </div>

        <div className="space-y-3">
          {evaluatedEmployees.map((evaluatedEmployee) => {
            return (
          <div 
            key={evaluatedEmployee.id || evaluatedEmployee.user_id}
            className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">
                  {evaluatedEmployee.user_name || 'Nome não informado'}
                </h4>
                <p className="text-sm text-slate-600">
                  {evaluatedEmployee.cargo_name || 'Cargo não informado'}
                </p>
                <p className="text-xs text-slate-500">
                  {evaluatedEmployee.department_name || 'Departamento não informado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                evaluatedEmployee.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : evaluatedEmployee.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {evaluatedEmployee.status === 'completed' 
                  ? 'Concluído' 
                  : evaluatedEmployee.status === 'in_progress'
                  ? 'Em Progresso'
                  : 'Pendente'}
              </span>
              <button
                onClick={() => onManageEvaluators(evaluatedEmployee.user_id)}
                className="btn-secondary text-sm"
                data-testid={`manage-evaluators-${evaluatedEmployee.user_id}`}
              >
                <Users className="w-4 h-4 mr-1" />
                Avaliadores
              </button>
              <button
                onClick={() => onRemoveEvaluated(evaluatedEmployee.id || evaluatedEmployee.user_id)}
                className="btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                data-testid={`remove-evaluated-${evaluatedEmployee.user_id}`}
                title="Remover funcionário da avaliação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
            );
          })}
        
        {evaluatedEmployees.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <User className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-600 mb-2">Nenhum funcionário adicionado para avaliação</p>
            <p className="text-sm text-slate-500">Adicione funcionários que serão avaliados neste processo</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
