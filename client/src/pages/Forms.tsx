import { useState, useEffect } from "react";
import { Plus, Search, Filter, Trash2, MoreVertical } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { FormComponent } from "@/components/forms/FormComponent";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FormCreateModal } from "@/components/forms/FormCreateModal";
import { useForms, useFormById } from "@/hooks/use-forms-api";
import { useAuth } from "@/hooks/use-auth";
import type { EvaluationForm, FormField } from "@/types/hr";
import type { APIForm, APIQuestion, APIFormWithQuestions } from "@/types/hr";

export default function Forms() {
  const { forms, isLoading, create, update, isUpdating, delete: deleteForm, isDeleting } = useForms();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/forms/:id/edit");
  
  // Hook para buscar formulário específico se estamos na rota de edição
  const { data: formData, isLoading: isLoadingForm, error: formError } = useFormById(params?.id || "", { enabled: !!params?.id });
  
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<Partial<EvaluationForm> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<EvaluationForm | null>(null);

  // Converter APIQuestion para FormField
  const convertAPIQuestionToFormField = (apiQuestion: APIQuestion): FormField => {
    let options: string[] | undefined = undefined;
    
    // Tratamento inteligente das opções
    if (apiQuestion.options) {
      // Se já é um array, usar diretamente
      if (Array.isArray(apiQuestion.options)) {
        options = apiQuestion.options;
      } else if (typeof apiQuestion.options === 'string') {
        try {
          // Tentar fazer parse JSON primeiro
          const parsed = JSON.parse(apiQuestion.options);
          options = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          // Se falhar, tentar tratar como string separada por vírgula
          console.warn("Erro ao fazer parse das opções JSON, tentando como string:", apiQuestion.options);
          try {
            options = apiQuestion.options.split(',').map(opt => opt.trim()).filter(opt => opt);
          } catch (splitError) {
            console.error("Erro ao processar opções:", splitError);
            options = undefined;
          }
        }
      }
    }

    return {
      id: apiQuestion.id,
      type: apiQuestion.type as FormField["type"],
      label: apiQuestion.name,
      placeholder: apiQuestion.help_text || "",
      required: apiQuestion.required === 1,
      options: options,
      // Ordenação será mantida pela question_order da API
    };
  };

  // Converter APIForm para EvaluationForm (para lista)
  const convertAPIFormToEvaluationForm = (apiForm: APIForm): EvaluationForm => ({
    id: apiForm.id || "",
    name: apiForm.name || "Formulário sem nome",
    description: apiForm.description || "",
    status: apiForm.is_active === 1 ? "active" : "draft", // 1 = ativo, 0 = rascunho
    fields: [], // Sem campos na listagem
    createdDate: apiForm.created_at || new Date().toISOString(),
  });

  // Converter APIFormWithQuestions para EvaluationForm (para edição)
  const convertAPIFormWithQuestionsToEvaluationForm = (apiData: APIFormWithQuestions): EvaluationForm => {
    // Verificar se questions existe e é um array
    const questions = apiData.questions || [];
    
    // Ordenar perguntas por question_order
    const sortedQuestions = questions
      .map(q => q.json)
      .sort((a, b) => a.question_order - b.question_order);

    return {
      id: apiData.form.id,
      name: apiData.form.name,
      description: apiData.form.description,
      status: (apiData.form.is_active === 1 ? "active" : "draft") as "active" | "draft",
      fields: sortedQuestions.map(convertAPIQuestionToFormField),
      createdDate: apiData.form.created_at,
    };
  };

  // Converter lista de formulários da API
  const evaluationForms = forms
    .filter(form => form && form.id) // Filtrar formulários válidos
    .map(convertAPIFormToEvaluationForm);

  // Manter mapa para acessar dados originais da API
  const apiFormsMap = new Map(forms.map(form => [form.id, form]));

  // Efeito para carregar formulário da rota de edição
  useEffect(() => {
    if (match && formData) {
      const evaluationForm = convertAPIFormWithQuestionsToEvaluationForm(formData);
      setSelectedForm(evaluationForm);
    }
  }, [match, formData]);

  // Efeito para limpar selectedForm quando saímos da rota de edição
  useEffect(() => {
    if (!match) {
      setSelectedForm(null);
    }
  }, [match]);

  // Redireciona para o formulário criado
  const handleAfterCreate = async (data: { name: string; description: string }) => {
    try {
      if (!authState.user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return;
      }
      
      const formData = {
        name: data.name,
        description: data.description,
        created_by: authState.user.id,
        updated_by: authState.user.id,
      };
      
      const result = await create(formData);
      
      if (result.success && result.form_id) {
        // Navega para a rota de edição do novo formulário
        setLocation(`/forms/${result.form_id}/edit`);
        // Toast já é mostrado pelo hook useForms
      }
    } catch (error) {
      // Erro já é tratado pelo hook useForms
    }
  };

  const handleSelectForm = (form: EvaluationForm) => {
    setLocation(`/forms/${form.id}/edit`);
  };

  const handlePreviewForm = (formData: Partial<EvaluationForm>) => {
    setPreviewForm(formData);
    setIsPreviewOpen(true);
  };

  const handleDeleteForm = (form: EvaluationForm) => {
    setFormToDelete(form);
  };

  const confirmDeleteForm = async () => {
    if (formToDelete) {
      try {
        await deleteForm(formToDelete.id);
        // Se estivermos editando o formulário que foi deletado, voltar para a lista
        if (selectedForm?.id === formToDelete.id) {
          setLocation("/forms");
        }
      } catch (error) {
        // O erro já é tratado pelo hook useForms
      } finally {
        setFormToDelete(null);
      }
    }
  };

  const cancelDeleteForm = () => {
    setFormToDelete(null);
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

  // Filtrar formulários
  const filteredForms = evaluationForms.filter(form => {
    const matchesSearch = (form.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (form.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || form.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Se um formulário está selecionado, mostrar o FormBuilder
  if (selectedForm !== null) {
    return (
      <MainLayout>
        <FormBuilder
          form={selectedForm || undefined}
          isSaving={isUpdating}
          onValidationError={(message) => {
            toast({ title: "Erro de validação", description: message, variant: "destructive" });
          }}
          onSave={(formData) => {
            // TODO: Implementar salvamento de campos/perguntas do formulário
            console.log("Salvar formulário:", formData);
            setLocation("/forms");
          }}
          onSaveFormData={async (formData) => {
            if (!selectedForm?.id) {
              toast({ title: "Erro", description: "ID do formulário não encontrado.", variant: "destructive" });
              return;
            }

            try {
              const updateData = {
                name: formData.name,
                description: formData.description,
                is_active: formData.status === "active" ? 1 : 0
              };

              await update({ id: selectedForm.id, data: updateData });
              
              // Atualizar o formulário selecionado com os novos dados
              setSelectedForm(prev => prev ? {
                ...prev,
                name: formData.name,
                description: formData.description,
                status: formData.status as "active" | "draft"
              } : null);

              toast({ 
                title: "Sucesso", 
                description: "Formulário atualizado com sucesso!" 
              });
            } catch (error) {
              // O erro já é tratado pelo hook useForms
            }
          }}
          onClose={() => setLocation("/forms")}
        />
      </MainLayout>
    );
  }

  // Se estamos na rota de edição mas ainda carregando
  if (match && isLoadingForm) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Carregando formulário...</h3>
            <p className="text-slate-500">Aguarde um momento</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="forms-title">
                Formulários de Avaliação
              </h1>
              <p className="text-slate-600 mt-1">Crie e gerencie formulários personalizados para avaliações</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="create-form-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Formulário
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Buscar formulários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="search-forms"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="filter-status"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>
        </header>

        {/* Lista de Formulários */}
        <div className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Carregando formulários...</h3>
              <p className="text-slate-500">Aguarde um momento</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-16" data-testid="no-forms-message">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || filterStatus !== "all" ? "Nenhum formulário encontrado" : "Nenhum formulário criado"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterStatus !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro formulário de avaliação"
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button 
                  className="btn-primary" 
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Formulário
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div 
                  key={form.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group relative"
                  data-testid={`form-item-${form.id}`}
                >
                  {/* Botão de exclusão */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteForm(form);
                    }}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Excluir formulário"
                    data-testid={`delete-form-${form.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Card clicável */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleSelectForm(form)}
                  >
                    <div className="flex items-start justify-between mb-4 pr-8">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Plus className="w-5 h-5 text-purple-600" />
                      </div>
                      <span 
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(form.status)}`}
                        data-testid={`form-status-${form.id}`}
                      >
                        {getStatusLabel(form.status)}
                      </span>
                    </div>
                    
                    <h3 
                      className="font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors"
                      data-testid={`form-name-${form.id}`}
                    >
                      {form.name}
                    </h3>
                    
                    <p 
                      className="text-sm text-slate-600 mb-4 line-clamp-2"
                      data-testid={`form-description-${form.id}`}
                    >
                      {form.description || "Sem descrição"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span data-testid={`form-date-${form.id}`}>
                        {formatDate(form.createdDate)}
                      </span>
                      <span>
                        {apiFormsMap.get(form.id)?.count_questions || 0} {(apiFormsMap.get(form.id)?.count_questions || 0) !== 1 ? 'questões' : 'questão'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    <p className="text-slate-600 mt-2">{previewForm.description}</p>
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

        {/* Modal de criação de formulário */}
        <FormCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onCreate={handleAfterCreate}
        />

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!formToDelete} onOpenChange={(open) => !open && setFormToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Formulário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{formToDelete?.name}</strong>?
                <br />
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeleteForm}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteForm}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
