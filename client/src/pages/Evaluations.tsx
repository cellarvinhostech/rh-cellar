import { useState } from "react";
import { Plus, Search, Eye, Edit, Star, Clock, CheckCircle, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/use-permissions";
import { useEvaluationsAPI } from "@/hooks/use-evaluations-api";
import { useForms } from "@/hooks/use-forms-api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { APIEvaluation } from "@/types/hr";

export default function Evaluations() {
  const { evaluations, loading, createEvaluation, deleteEvaluation } = useEvaluationsAPI();
  const { forms } = useForms();
  const { authState } = useAuth();
  const { permissions, isAdmin, isUser } = usePermissions();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<APIEvaluation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_data: "",
    form_id: "",
    status: "pending",
    meta: "",
    peso_lider: "70",
    peso_equipe: "20",
    peso_outros: "10"
  });

  // Filtrar avaliações baseado na role
  const filteredEvaluationsByRole = evaluations.filter((evaluation) => {
    if (!evaluation) return false;
    
    // Se for admin, vê todas as avaliações
    if (isAdmin) return true;
    
    // Se for user, vê apenas suas próprias avaliações (quando implementarmos a relação)
    // Por enquanto, vamos mostrar todas para users também, mas sem permissões de edição
    if (isUser) return true;
    
    return false;
  });

  // Filtrar avaliações
  const filteredEvaluations = filteredEvaluationsByRole.filter((evaluation) => {
    // Verificar se evaluation e suas propriedades existem
    if (!evaluation) return false;
    
    const evaluationName = evaluation.name || "";
    const evaluationDescription = evaluation.description || "";
    const evaluationStatus = evaluation.status || "";
    
    const matchesSearch = evaluationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluationDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || evaluationStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvaluation = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_data: "",
      form_id: "",
      status: "pending",
      meta: "",
      peso_lider: "70",
      peso_equipe: "20",
      peso_outros: "10"
    });
    setIsModalOpen(true);
  };

  const handleViewEvaluation = (evaluation: APIEvaluation) => {
    setLocation(`/evaluations/${evaluation.id}`);
  };

  const handleEditEvaluation = (evaluation: APIEvaluation) => {
    setLocation(`/evaluations/${evaluation.id}/edit`);
  };

  const handleDeleteEvaluation = (evaluation: APIEvaluation) => {
    setEvaluationToDelete(evaluation);
  };

  const confirmDeleteEvaluation = async () => {
    if (evaluationToDelete) {
      try {
        await deleteEvaluation(evaluationToDelete.id);
      } catch (error) {
        // Erro já tratado no hook
      } finally {
        setEvaluationToDelete(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da avaliação é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.form_id) {
      toast({
        title: "Erro", 
        description: "Formulário é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!authState.user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const evaluationData = {
        ...formData,
        meta: formData.meta ? parseInt(formData.meta) : undefined,
        peso_lider: formData.peso_lider ? parseInt(formData.peso_lider) : undefined,
        peso_equipe: formData.peso_equipe ? parseInt(formData.peso_equipe) : undefined,
        peso_outros: formData.peso_outros ? parseInt(formData.peso_outros) : undefined,
        created_by: authState.user.id,
        updated_by: authState.user.id,
      };

      await createEvaluation(evaluationData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_data: "",
        form_id: "",
        status: "pending",
        meta: "",
        peso_lider: "70",
        peso_equipe: "20",
        peso_outros: "10"
      });
    } catch (error) {
      // Erro já tratado no hook
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

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
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
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600">Carregando avaliações...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
              <p className="text-slate-600">Gerencie avaliações de performance</p>
            </div>
            <PermissionGuard roles={['admin']} showFallback={false}>
              <button 
                className="btn-primary" 
                onClick={handleCreateEvaluation}
                data-testid="create-evaluation-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </button>
            </PermissionGuard>
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
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || selectedStatus ? "Nenhuma avaliação encontrada" : "Nenhuma avaliação criada"}
              </h3>
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
                const associatedForm = forms.find((form) => form.id === evaluation.form_id);
                
                return (
                  <div 
                    key={evaluation.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow group relative"
                    data-testid={`evaluation-card-${evaluation.id}`}
                  >
                    {/* Botão de exclusão */}
                    <PermissionGuard roles={['admin']} showFallback={false}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvaluation(evaluation);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Excluir avaliação"
                        data-testid={`delete-evaluation-${evaluation.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </PermissionGuard>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 
                          className="font-semibold text-slate-900 mb-1 truncate"
                          data-testid={`evaluation-name-${evaluation.id}`}
                        >
                          {evaluation.name}
                        </h3>
                        {evaluation.description && (
                          <p 
                            className="text-sm text-slate-600 line-clamp-2"
                            data-testid={`evaluation-description-${evaluation.id}`}
                          >
                            {evaluation.description}
                          </p>
                        )}
                        {associatedForm && (
                          <p 
                            className="text-xs text-slate-500 mt-1"
                            data-testid={`evaluation-form-${evaluation.id}`}
                          >
                            Formulário: {associatedForm.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span 
                          className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(evaluation.status)}`}
                          data-testid={`evaluation-status-${evaluation.id}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{getStatusLabel(evaluation.status)}</span>
                        </span>
                        <span 
                          className="text-xs text-slate-500"
                          data-testid={`evaluation-created-date-${evaluation.id}`}
                        >
                          {formatDate(evaluation.created_at)}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button 
                          className="btn-secondary flex-1"
                          onClick={() => handleViewEvaluation(evaluation)}
                          data-testid={`view-evaluation-${evaluation.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                        <PermissionGuard roles={['admin']} showFallback={false}>
                          <button 
                            className="btn-secondary flex-1"
                            onClick={() => handleEditEvaluation(evaluation)}
                            data-testid={`edit-evaluation-${evaluation.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </button>
                        </PermissionGuard>
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
                Crie uma nova avaliação selecionando o formulário e definindo os parâmetros.
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome da Avaliação</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da avaliação"
                  required
                  data-testid="evaluation-name-input"
                />
              </div>

              <div>
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Digite uma descrição (opcional)"
                  rows={3}
                  data-testid="evaluation-description-input"
                />
              </div>
              
              <div>
                <label className="form-label">Formulário de Avaliação</label>
                <select
                  className="form-select"
                  value={formData.form_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_id: e.target.value }))}
                  required
                  data-testid="evaluation-form-select"
                >
                  <option value="">Selecione um formulário</option>
                  {forms.filter((form) => form.is_active === 1).map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Data de Início</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    data-testid="evaluation-start-date-input"
                  />
                </div>

                <div>
                  <label className="form-label">Data de Término</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.end_data}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_data: e.target.value }))}
                    data-testid="evaluation-end-date-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    data-testid="evaluation-status-select"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Meta (opcional)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.meta}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta: e.target.value }))}
                    placeholder="0"
                    data-testid="evaluation-meta-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Peso Líder</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.peso_lider}
                    onChange={(e) => setFormData(prev => ({ ...prev, peso_lider: e.target.value }))}
                    placeholder="70"
                    data-testid="evaluation-peso-lider-input"
                  />
                </div>

                <div>
                  <label className="form-label">Peso Equipe</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.peso_equipe}
                    onChange={(e) => setFormData(prev => ({ ...prev, peso_equipe: e.target.value }))}
                    placeholder="20"
                    data-testid="evaluation-peso-equipe-input"
                  />
                </div>

                <div>
                  <label className="form-label">Peso Outros</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.peso_outros}
                    onChange={(e) => setFormData(prev => ({ ...prev, peso_outros: e.target.value }))}
                    placeholder="10"
                    data-testid="evaluation-peso-outros-input"
                  />
                </div>
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

        {/* Delete Confirmation Modal */}
        {evaluationToDelete && (
          <Modal open={true} onOpenChange={() => setEvaluationToDelete(null)}>
            <ModalContent data-testid="delete-evaluation-modal">
              <ModalHeader>
                <ModalTitle>Excluir Avaliação</ModalTitle>
                <ModalDescription>
                  Tem certeza que deseja excluir <strong>{evaluationToDelete.name}</strong>?
                  <br />
                  Esta ação não pode ser desfeita.
                </ModalDescription>
              </ModalHeader>
              
              <div className="flex space-x-3 pt-4">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setEvaluationToDelete(null)}
                  data-testid="cancel-delete-evaluation-button"
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger flex-1"
                  onClick={confirmDeleteEvaluation}
                  data-testid="confirm-delete-evaluation-button"
                >
                  Excluir
                </button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
