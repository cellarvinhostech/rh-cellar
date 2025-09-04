import { useState } from "react";
import { Plus, Building2, Edit, Trash2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDirectoratesAPI } from "@/hooks/use-directorates-api";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";

export default function Directorates() {
  const { 
    directorates, 
    loading, 
    createDirectorate, 
    updateDirectorate, 
    deleteDirectorate 
  } = useDirectoratesAPI();
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirectorate, setEditingDirectorate] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "" 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateDirectorate = () => {
    setEditingDirectorate(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEditDirectorate = (directorate: any) => {
    setEditingDirectorate(directorate);
    setFormData({ 
      name: directorate.name, 
      description: directorate.description || "" 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da diretoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingDirectorate) {
        await updateDirectorate(editingDirectorate.id, formData);
      } else {
        await createDirectorate(formData);
      }
      
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
      setEditingDirectorate(null);
    } catch (error) {
      // O erro já é tratado no hook
      console.error("Erro ao salvar diretoria:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDirectorate = async (directorate: any) => {
    const confirmed = await confirm({
      title: "Excluir Diretoria",
      message: `Tem certeza que deseja excluir a diretoria "${directorate.name}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await deleteDirectorate(directorate.id);
      } catch (error) {
        // O erro já é tratado no hook
        console.error("Erro ao excluir diretoria:", error);
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
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="directorates-title">
                Diretorias
              </h2>
              <p className="text-slate-600">Gerencie as diretorias da empresa</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateDirectorate}
              data-testid="create-directorate-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Diretoria
            </button>
          </div>
        </header>

        {/* Directorates List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-slate-600">Carregando diretorias...</span>
            </div>
          ) : directorates.length === 0 ? (
            <div className="text-center py-12" data-testid="no-directorates-message">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma diretoria cadastrada</h3>
              <p className="text-slate-600">Comece criando sua primeira diretoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="directorates-grid">
              {directorates.map((directorate) => (
                <div 
                  key={directorate.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  data-testid={`directorate-card-${directorate.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-purple-600 w-6 h-6" />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-slate-900"
                          data-testid={`directorate-name-${directorate.id}`}
                        >
                          {directorate.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Criado em {new Date(directorate.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600"
                        onClick={() => handleEditDirectorate(directorate)}
                        data-testid={`edit-directorate-${directorate.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeleteDirectorate(directorate)}
                        data-testid={`delete-directorate-${directorate.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {directorate.description && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600">
                        {directorate.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent data-testid="directorate-modal">
            <ModalHeader>
              <ModalTitle>
                {editingDirectorate ? "Editar Diretoria" : "Nova Diretoria"}
              </ModalTitle>
              <ModalDescription>
                {editingDirectorate 
                  ? "Atualize as informações da diretoria."
                  : "Preencha as informações para criar uma nova diretoria."
                }
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome da Diretoria</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da diretoria"
                  required
                  data-testid="directorate-name-input"
                />
              </div>
              
              <div>
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Digite uma descrição para a diretoria (opcional)"
                  data-testid="directorate-description-input"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-directorate-button"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-directorate-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingDirectorate ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    editingDirectorate ? "Atualizar" : "Criar"
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
