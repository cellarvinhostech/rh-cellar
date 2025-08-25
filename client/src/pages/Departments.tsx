import { useState } from "react";
import { Plus, Building, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDepartmentsAPI } from "@/hooks/use-departments-api";
import { useToast } from "@/hooks/use-toast";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";

export default function Departments() {
  const { 
    departments, 
    loading, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useDepartmentsAPI();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });

  const getDepartmentStats = (department: any) => {
    // Usamos as estatísticas que vêm diretamente da API
    return {
      employeeCount: department.department_users || 0,
      positionCount: department.department_cargos || 0
    };
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setFormData({ name: department.name });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do departamento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData);
      } else {
        await createDepartment(formData);
      }
      
      setIsModalOpen(false);
      setFormData({ name: "" });
      setEditingDepartment(null);
    } catch (error) {
      // O erro já é tratado no hook
      console.error("Erro ao salvar departamento:", error);
    }
  };

  const handleDeleteDepartment = async (department: any) => {
    const stats = getDepartmentStats(department);
    
    if (stats.employeeCount > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Este departamento possui funcionários vinculados.",
        variant: "destructive"
      });
      return;
    }

    if (confirm("Tem certeza que deseja excluir este departamento?")) {
      try {
        await deleteDepartment(department.id);
      } catch (error) {
        // O erro já é tratado no hook
        console.error("Erro ao excluir departamento:", error);
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
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="departments-title">
                Departamentos
              </h2>
              <p className="text-slate-600">Gerencie os departamentos da empresa</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateDepartment}
              data-testid="create-department-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </button>
          </div>
        </header>

        {/* Departments List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Carregando departamentos...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12" data-testid="no-departments-message">
              <Building className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum departamento cadastrado</h3>
              <p className="text-slate-600">Comece criando seu primeiro departamento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="departments-grid">
              {departments.map((department) => {
                const stats = getDepartmentStats(department);
                
                return (
                  <div 
                    key={department.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    data-testid={`department-card-${department.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="text-blue-600 w-6 h-6" />
                        </div>
                        <div>
                          <h3 
                            className="font-semibold text-slate-900"
                            data-testid={`department-name-${department.id}`}
                          >
                            {department.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Criado em {new Date(department.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          className="p-2 text-slate-400 hover:text-slate-600"
                          onClick={() => handleEditDepartment(department)}
                          data-testid={`edit-department-${department.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-600"
                          onClick={() => handleDeleteDepartment(department)}
                          data-testid={`delete-department-${department.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-slate-600 mr-1" />
                        </div>
                        <p 
                          className="text-2xl font-bold text-slate-900"
                          data-testid={`department-employees-count-${department.id}`}
                        >
                          {stats.employeeCount}
                        </p>
                        <p className="text-xs text-slate-600">Funcionários</p>
                      </div>
                      
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Building className="w-4 h-4 text-slate-600 mr-1" />
                        </div>
                        <p 
                          className="text-2xl font-bold text-slate-900"
                          data-testid={`department-positions-count-${department.id}`}
                        >
                          {stats.positionCount}
                        </p>
                        <p className="text-xs text-slate-600">Cargos</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent data-testid="department-modal">
            <ModalHeader>
              <ModalTitle>
                {editingDepartment ? "Editar Departamento" : "Novo Departamento"}
              </ModalTitle>
              <ModalDescription>
                {editingDepartment 
                  ? "Atualize as informações do departamento."
                  : "Preencha as informações para criar um novo departamento."
                }
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome do Departamento</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do departamento"
                  required
                  data-testid="department-name-input"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-department-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-department-button"
                >
                  {editingDepartment ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}
