import { useState } from "react";
import { Plus, Clock, Edit, Trash2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useShiftsAPI } from "@/hooks/use-shifts-api";
import { useToast } from "@/hooks/use-toast";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";

export default function Shifts() {
  const { 
    shifts, 
    loading, 
    createShift, 
    updateShift, 
    deleteShift 
  } = useShiftsAPI();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "" 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateShift = () => {
    setEditingShift(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const handleEditShift = (shift: any) => {
    setEditingShift(shift);
    setFormData({ 
      name: shift.name
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do turno é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingShift) {
        await updateShift(editingShift.id, formData);
      } else {
        await createShift(formData);
      }
      
      setIsModalOpen(false);
      setFormData({ name: "" });
      setEditingShift(null);
    } catch (error) {
      // O erro já é tratado no hook
      console.error("Erro ao salvar turno:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async (shift: any) => {
    if (confirm("Tem certeza que deseja excluir este turno?")) {
      try {
        await deleteShift(shift.id);
      } catch (error) {
        // O erro já é tratado no hook
        console.error("Erro ao excluir turno:", error);
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
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="shifts-title">
                Turnos
              </h2>
              <p className="text-slate-600">Gerencie os turnos de trabalho da empresa</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateShift}
              data-testid="create-shift-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Turno
            </button>
          </div>
        </header>

        {/* Shifts List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-slate-600">Carregando turnos...</span>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-12" data-testid="no-shifts-message">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum turno cadastrado</h3>
              <p className="text-slate-600">Comece criando seu primeiro turno.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="shifts-grid">
              {shifts.map((shift) => (
                <div 
                  key={shift.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  data-testid={`shift-card-${shift.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="text-blue-600 w-6 h-6" />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-slate-900"
                          data-testid={`shift-name-${shift.id}`}
                        >
                          {shift.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Criado em {new Date(shift.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600"
                        onClick={() => handleEditShift(shift)}
                        data-testid={`edit-shift-${shift.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeleteShift(shift)}
                        data-testid={`delete-shift-${shift.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent data-testid="shift-modal">
            <ModalHeader>
              <ModalTitle>
                {editingShift ? "Editar Turno" : "Novo Turno"}
              </ModalTitle>
              <ModalDescription>
                {editingShift 
                  ? "Atualize as informações do turno."
                  : "Preencha as informações para criar um novo turno."
                }
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome do Turno</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Manhã (09:00 - 18:30)"
                  required
                  data-testid="shift-name-input"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Inclua os horários no nome do turno para facilitar a identificação
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-shift-button"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-shift-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingShift ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    editingShift ? "Atualizar" : "Criar"
                  )}
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}
