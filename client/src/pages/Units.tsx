import { useState } from "react";
import { Plus, MapPin, Edit, Trash2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUnitsAPI } from "@/hooks/use-units-api";
import { useToast } from "@/hooks/use-toast";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";

export default function Units() {
  const { 
    units, 
    loading, 
    createUnit, 
    updateUnit, 
    deleteUnit 
  } = useUnitsAPI();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setFormData({ 
      name: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: ""
    });
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setFormData({ 
      name: unit.name,
      logradouro: unit.logradouro,
      numero: unit.numero,
      complemento: unit.complemento || "",
      bairro: unit.bairro,
      cidade: unit.cidade,
      uf: unit.uf,
      cep: unit.cep
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.logradouro.trim() || !formData.numero.trim() || 
        !formData.bairro.trim() || !formData.cidade.trim() || !formData.uf.trim() || !formData.cep.trim()) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const unitData = {
        ...formData,
        complemento: formData.complemento || undefined
      };

      if (editingUnit) {
        await updateUnit(editingUnit.id, unitData);
      } else {
        await createUnit(unitData);
      }
      
      setIsModalOpen(false);
      setFormData({ 
        name: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: ""
      });
      setEditingUnit(null);
    } catch (error) {
      // O erro já é tratado no hook
      console.error("Erro ao salvar unidade:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unit: any) => {
    if (confirm("Tem certeza que deseja excluir esta unidade?")) {
      try {
        await deleteUnit(unit.id);
      } catch (error) {
        // O erro já é tratado no hook
        console.error("Erro ao excluir unidade:", error);
      }
    }
  };

  const formatAddress = (unit: any) => {
    const parts = [
      unit.logradouro,
      unit.numero,
      unit.complemento,
      unit.bairro,
      unit.cidade,
      unit.uf,
      unit.cep
    ].filter(Boolean);
    
    return parts.join(", ");
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="units-title">
                Unidades
              </h2>
              <p className="text-slate-600">Gerencie as unidades da empresa</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateUnit}
              data-testid="create-unit-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Unidade
            </button>
          </div>
        </header>

        {/* Units List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-slate-600">Carregando unidades...</span>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-12" data-testid="no-units-message">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma unidade cadastrada</h3>
              <p className="text-slate-600">Comece criando sua primeira unidade.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="units-grid">
              {units.map((unit) => (
                <div 
                  key={unit.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  data-testid={`unit-card-${unit.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="text-orange-600 w-6 h-6" />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-slate-900"
                          data-testid={`unit-name-${unit.id}`}
                        >
                          {unit.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Criado em {new Date(unit.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600"
                        onClick={() => handleEditUnit(unit)}
                        data-testid={`edit-unit-${unit.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeleteUnit(unit)}
                        data-testid={`delete-unit-${unit.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Endereço:</span>
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {unit.logradouro}, {unit.numero}
                        {unit.complemento && `, ${unit.complemento}`}
                      </p>
                      <p className="text-sm text-slate-700">
                        {unit.bairro} - {unit.cidade}/{unit.uf}
                      </p>
                      <p className="text-sm text-slate-700">
                        CEP: {unit.cep}
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
          <ModalContent data-testid="unit-modal" className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>
                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
              </ModalTitle>
              <ModalDescription>
                {editingUnit 
                  ? "Atualize as informações da unidade."
                  : "Preencha as informações para criar uma nova unidade."
                }
              </ModalDescription>
            </ModalHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome da Unidade</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da unidade"
                  required
                  data-testid="unit-name-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Logradouro</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.logradouro}
                    onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                    placeholder="Ex: Rua das Flores"
                    required
                    data-testid="unit-logradouro-input"
                  />
                </div>

                <div>
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    placeholder="123"
                    required
                    data-testid="unit-numero-input"
                  />
                </div>

                <div>
                  <label className="form-label">Complemento</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.complemento}
                    onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                    placeholder="Apto 12, Bloco A (opcional)"
                    data-testid="unit-complemento-input"
                  />
                </div>

                <div>
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bairro}
                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                    placeholder="Centro"
                    required
                    data-testid="unit-bairro-input"
                  />
                </div>

                <div>
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    placeholder="São Paulo"
                    required
                    data-testid="unit-cidade-input"
                  />
                </div>

                <div>
                  <label className="form-label">UF</label>
                  <select
                    className="form-select"
                    value={formData.uf}
                    onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                    required
                    data-testid="unit-uf-select"
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                    required
                    data-testid="unit-cep-input"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="cancel-unit-button"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="save-unit-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingUnit ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    editingUnit ? "Atualizar" : "Criar"
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
