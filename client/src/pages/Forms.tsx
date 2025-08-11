import { useState } from "react";
import { Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { FormComponent } from "@/components/forms/FormComponent";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
import type { EvaluationForm } from "@/types/hr";

export default function Forms() {
  const { evaluationForms, createEvaluationForm, updateEvaluationForm } = useHRData();
  const { toast } = useToast();
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<Partial<EvaluationForm> | null>(null);

  const handleCreateForm = () => {
    setSelectedForm(null);
  };

  const handleSelectForm = (form: EvaluationForm) => {
    setSelectedForm(form);
  };

  const handleSaveForm = (formData: Partial<EvaluationForm>) => {
    try {
      if (selectedForm) {
        updateEvaluationForm(selectedForm.id, formData);
        toast({
          title: "Sucesso",
          description: "Formulário atualizado com sucesso.",
        });
      } else {
        createEvaluationForm({
          name: formData.name || "Formulário sem título",
          description: formData.description || "",
          fields: formData.fields || [],
          status: formData.status || "draft"
        });
        toast({
          title: "Sucesso",
          description: "Formulário criado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar formulário.",
        variant: "destructive"
      });
    }
  };

  const handlePreviewForm = (formData: Partial<EvaluationForm>) => {
    setPreviewForm(formData);
    setIsPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "draft":
        return "Rascunho";
      case "archived":
        return "Arquivado";
      default:
        return status;
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
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="forms-title">
                Formulários de Avaliação
              </h2>
              <p className="text-slate-600">Crie e gerencie formulários personalizados</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateForm}
              data-testid="create-form-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Formulário
            </button>
          </div>
        </header>

        {/* Form Builder Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            {/* Form List */}
            <div className="col-span-4 bg-white border-r border-slate-200 overflow-auto">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Formulários Existentes</h3>
              </div>
              <div className="p-4 space-y-3">
                {evaluationForms.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-forms-message">
                    <p className="text-slate-500">Nenhum formulário criado ainda.</p>
                    <p className="text-sm text-slate-400">Clique em "Novo Formulário" para começar.</p>
                  </div>
                ) : (
                  evaluationForms.map((form) => (
                    <div 
                      key={form.id}
                      className={`p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${
                        selectedForm?.id === form.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectForm(form)}
                      data-testid={`form-item-${form.id}`}
                    >
                      <h4 
                        className="font-medium text-slate-900"
                        data-testid={`form-name-${form.id}`}
                      >
                        {form.name}
                      </h4>
                      <p 
                        className="text-sm text-slate-600"
                        data-testid={`form-description-${form.id}`}
                      >
                        {form.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span 
                          className="text-xs text-slate-500"
                          data-testid={`form-date-${form.id}`}
                        >
                          Criado em {formatDate(form.createdDate)}
                        </span>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(form.status)}`}
                          data-testid={`form-status-${form.id}`}
                        >
                          {getStatusLabel(form.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form Editor */}
            <div className="col-span-8 flex flex-col">
              <FormBuilder
                form={selectedForm || undefined}
                onSave={handleSaveForm}
                onPreview={handlePreviewForm}
              />
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <ModalContent className="max-w-4xl" data-testid="form-preview-modal">
            <ModalHeader>
              <ModalTitle>Pré-visualização do Formulário</ModalTitle>
            </ModalHeader>
            
            {previewForm && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {previewForm.name || "Formulário sem título"}
                  </h2>
                  {previewForm.description && (
                    <p className="text-slate-600">{previewForm.description}</p>
                  )}
                </div>

                <div className="space-y-6">
                  {previewForm.fields?.map((field, index) => (
                    <div key={field.id} data-testid={`preview-field-${field.id}`}>
                      <FormComponent field={field} disabled />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}
