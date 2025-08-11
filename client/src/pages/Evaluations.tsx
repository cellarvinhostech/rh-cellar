import { useState } from "react";
import { Plus, Search, Eye, Edit, Star, Clock, CheckCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FormComponent } from "@/components/forms/FormComponent";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
import type { Evaluation, EvaluationForm } from "@/types/hr";

export default function Evaluations() {
  const { 
    evaluations, 
    evaluationForms, 
    getEmployeesWithDetails, 
    createEvaluation, 
    updateEvaluation 
  } = useHRData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    formId: "",
    evaluatorId: "emp-1" // Default to Ana Silva (HR Manager)
  });

  const employees = getEmployeesWithDetails();

  // Get evaluation with details
  const getEvaluationWithDetails = (evaluation: Evaluation) => {
    const employee = employees.find(emp => emp.id === evaluation.employeeId);
    const form = evaluationForms.find(form => form.id === evaluation.formId);
    const evaluator = employees.find(emp => emp.id === evaluation.evaluatorId);
    
    return {
      ...evaluation,
      employee,
      form,
      evaluator
    };
  };

  const evaluationsWithDetails = evaluations.map(getEvaluationWithDetails);

  // Filter evaluations
  const filteredEvaluations = evaluationsWithDetails.filter((evaluation) => {
    const matchesSearch = evaluation.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.form?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || evaluation.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvaluation = () => {
    setFormData({
      employeeId: "",
      formId: "",
      evaluatorId: "emp-1"
    });
    setIsModalOpen(true);
  };

  const handleViewEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsViewModalOpen(true);
  };

  const handleEditEvaluation = (evaluationId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de avaliações será implementada em breve.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.formId) {
      toast({
        title: "Erro",
        description: "Funcionário e formulário são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      createEvaluation({
        employeeId: formData.employeeId,
        formId: formData.formId,
        evaluatorId: formData.evaluatorId,
        responses: {},
        status: "pending"
      });
      
      toast({
        title: "Sucesso",
        description: "Avaliação criada com sucesso.",
      });
      
      setIsModalOpen(false);
      setFormData({
        employeeId: "",
        formId: "",
        evaluatorId: "emp-1"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar avaliação.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "in_progress":
        return "Em Andamento";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in_progress":
        return Star;
      case "pending":
        return Clock;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="evaluations-title">
                Avaliações
              </h2>
              <p className="text-slate-600">Gerencie avaliações de performance dos funcionários</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateEvaluation}
              data-testid="create-evaluation-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </button>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar avaliações..." 
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-evaluations-input"
                />
              </div>
            </div>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              data-testid="filter-status-select"
            >
              <option value="">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
            </select>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="flex-1 overflow-auto p-6">
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12" data-testid="no-evaluations-message">
              <Star className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-slate-600">
                {searchTerm || selectedStatus 
                  ? "Tente ajustar os filtros de busca."
                  : "Comece criando sua primeira avaliação."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="evaluations-grid">
              {filteredEvaluations.map((evaluation) => {
                const StatusIcon = getStatusIcon(evaluation.status);
                
                return (
                  <div 
                    key={evaluation.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    data-testid={`evaluation-card-${evaluation.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={evaluation.employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(evaluation.employee?.name || 'Unknown')}&background=e2e8f0&color=475569`}
                          alt={evaluation.employee?.name}
                          className="w-12 h-12 rounded-full object-cover"
                          data-testid={`evaluation-employee-avatar-${evaluation.id}`}
                        />
                        <div>
                          <h3 
                            className="font-semibold text-slate-900"
                            data-testid={`evaluation-employee-name-${evaluation.id}`}
                          >
                            {evaluation.employee?.name}
                          </h3>
                          <p 
                            className="text-sm text-slate-600"
                            data-testid={`evaluation-form-name-${evaluation.id}`}
                          >
                            {evaluation.form?.name}
                          </p>
                          <p 
                            className="text-xs text-slate-500"
                            data-testid={`evaluation-evaluator-${evaluation.id}`}
                          >
                            Avaliador: {evaluation.evaluator?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(evaluation.status)}`}
                          data-testid={`evaluation-status-${evaluation.id}`}
                        >
                          {getStatusLabel(evaluation.status)}
                        </span>
                        <span 
                          className="text-xs text-slate-500"
                          data-testid={`evaluation-created-date-${evaluation.id}`}
                        >
                          Criada em {formatDate(evaluation.createdDate)}
                        </span>
                      </div>

                      {evaluation.completedDate && (
                        <div className="text-xs text-slate-500">
                          Concluída em {formatDate(evaluation.completedDate)}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <button 
                          className="btn-secondary flex-1"
                          onClick={() => handleViewEvaluation(evaluation)}
                          data-testid={`view-evaluation-${evaluation.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                        <button 
                          className="btn-secondary flex-1"
                          onClick={() => handleEditEvaluation(evaluation.id)}
                          data-testid={`edit-evaluation-${evaluation.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Evaluation Modal */}
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent data-testid="create-evaluation-modal">
            <ModalHeader>
              <ModalTitle>Nova Avaliação</ModalTitle>
              <ModalDescription>
                Crie uma nova avaliação selecionando o funcionário e o formulário.
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Funcionário</label>
                <select
                  className="form-select"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  required
                  data-testid="evaluation-employee-select"
                >
                  <option value="">Selecione um funcionário</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Formulário de Avaliação</label>
                <select
                  className="form-select"
                  value={formData.formId}
                  onChange={(e) => setFormData(prev => ({ ...prev, formId: e.target.value }))}
                  required
                  data-testid="evaluation-form-select"
                >
                  <option value="">Selecione um formulário</option>
                  {evaluationForms.filter(form => form.status === "active").map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Avaliador</label>
                <select
                  className="form-select"
                  value={formData.evaluatorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, evaluatorId: e.target.value }))}
                  required
                  data-testid="evaluation-evaluator-select"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-evaluation-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-evaluation-button"
                >
                  Criar Avaliação
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>

        {/* View Evaluation Modal */}
        <Modal open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <ModalContent className="max-w-4xl" data-testid="view-evaluation-modal">
            <ModalHeader>
              <ModalTitle>Detalhes da Avaliação</ModalTitle>
            </ModalHeader>
            
            {selectedEvaluation && (
              <div className="space-y-6">
                {/* Evaluation Info */}
                <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Informações da Avaliação</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Funcionário:</span> {getEvaluationWithDetails(selectedEvaluation).employee?.name}</p>
                      <p><span className="font-medium">Formulário:</span> {getEvaluationWithDetails(selectedEvaluation).form?.name}</p>
                      <p><span className="font-medium">Avaliador:</span> {getEvaluationWithDetails(selectedEvaluation).evaluator?.name}</p>
                      <p><span className="font-medium">Status:</span> {getStatusLabel(selectedEvaluation.status)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Datas</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Criada em:</span> {formatDate(selectedEvaluation.createdDate)}</p>
                      {selectedEvaluation.completedDate && (
                        <p><span className="font-medium">Concluída em:</span> {formatDate(selectedEvaluation.completedDate)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Preview */}
                {getEvaluationWithDetails(selectedEvaluation).form && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Formulário de Avaliação</h4>
                    <div className="space-y-6 border border-slate-200 rounded-lg p-6">
                      {getEvaluationWithDetails(selectedEvaluation).form!.fields.map((field) => (
                        <div key={field.id} data-testid={`evaluation-field-${field.id}`}>
                          <FormComponent 
                            field={field} 
                            value={selectedEvaluation.responses[field.id]}
                            disabled 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvaluation.status === "pending" && (
                  <div className="flex justify-end">
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        updateEvaluation(selectedEvaluation.id, { status: "in_progress" });
                        setIsViewModalOpen(false);
                        toast({
                          title: "Sucesso",
                          description: "Avaliação iniciada com sucesso.",
                        });
                      }}
                      data-testid="start-evaluation-button"
                    >
                      Iniciar Avaliação
                    </button>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}
