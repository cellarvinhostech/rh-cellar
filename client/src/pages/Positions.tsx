import { useState } from "react";
import { Plus, Building, Edit, Trash2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePositionsAPI } from "@/hooks/use-positions-api";
import { useDepartmentsAPI } from "@/hooks/use-departments-api";
import { useHierarchyLevelsAPI } from "@/hooks/use-hierarchy-levels-api";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";

export default function Positions() {
  const { 
    positions, 
    loading: positionsLoading, 
    createPosition, 
    updatePosition, 
    deletePosition 
  } = usePositionsAPI();
  const { departments, loading: departmentsLoading } = useDepartmentsAPI();
  const { hierarchyLevels, loading: hierarchyLevelsLoading } = useHierarchyLevelsAPI();
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    department_id: "", 
    nivel_hierarquico_id: "" 
  });
  const [submitting, setSubmitting] = useState(false);

  const loading = positionsLoading || departmentsLoading || hierarchyLevelsLoading;

  const handleCreatePosition = () => {
    setEditingPosition(null);
    setFormData({ name: "", department_id: "", nivel_hierarquico_id: "" });
    setIsModalOpen(true);
  };

  const handleEditPosition = (position: any) => {
    setEditingPosition(position);
    setFormData({ 
      name: position.name, 
      department_id: position.department_id, 
      nivel_hierarquico_id: position.nivel_hierarquico_id 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.department_id || !formData.nivel_hierarquico_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, formData);
      } else {
        await createPosition(formData);
      }
      
      setIsModalOpen(false);
      setFormData({ name: "", department_id: "", nivel_hierarquico_id: "" });
      setEditingPosition(null);
    } catch (error) {
      // O erro já é tratado no hook
      console.error("Erro ao salvar cargo:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePosition = async (position: any) => {
    const confirmed = await confirm({
      title: "Excluir Cargo",
      message: `Tem certeza que deseja excluir o cargo "${position.name}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await deletePosition(position.id);
      } catch (error) {
        // O erro já é tratado no hook
        console.error("Erro ao excluir cargo:", error);
      }
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="positions-title">
                Cargos
              </h2>
              <p className="text-slate-600">Gerencie os cargos da empresa</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreatePosition}
              data-testid="create-position-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </button>
          </div>
        </header>

        {/* Positions List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-slate-600">Carregando cargos...</span>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12" data-testid="no-positions-message">
              <Building className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum cargo cadastrado</h3>
              <p className="text-slate-600">Comece criando seu primeiro cargo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="positions-grid">
              {positions.map((position) => (
                <div 
                  key={position.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  data-testid={`position-card-${position.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="text-green-600 w-6 h-6" />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-slate-900"
                          data-testid={`position-name-${position.id}`}
                        >
                          {position.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Criado em {new Date(position.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600"
                        onClick={() => handleEditPosition(position)}
                        data-testid={`edit-position-${position.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeletePosition(position)}
                        data-testid={`delete-position-${position.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Departamento:</span> {position.department_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Nível:</span> {position.nivel_hierarquico_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent data-testid="position-modal">
            <ModalHeader>
              <ModalTitle>
                {editingPosition ? "Editar Cargo" : "Novo Cargo"}
              </ModalTitle>
              <ModalDescription>
                {editingPosition 
                  ? "Atualize as informações do cargo."
                  : "Preencha as informações para criar um novo cargo."
                }
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome do Cargo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do cargo"
                  required
                  data-testid="position-name-input"
                />
              </div>
              
              <div>
                <label className="form-label">Departamento</label>
                <select
                  className="form-select"
                  value={formData.department_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                  required
                  data-testid="position-department-select"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Nível Hierárquico</label>
                <select
                  className="form-select"
                  value={formData.nivel_hierarquico_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, nivel_hierarquico_id: e.target.value }))}
                  required
                  data-testid="position-hierarchy-level-select"
                >
                  <option value="">Selecione um nível hierárquico</option>
                  {hierarchyLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-position-button"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-position-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingPosition ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    editingPosition ? "Atualizar" : "Criar"
                  )}
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>

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
      </div>
    </MainLayout>
  );
}