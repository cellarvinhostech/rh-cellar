import { useState, useEffect, useRef } from "react";
import { Plus, Eye, Save, Type, AlignLeft, List, Star, CheckSquare, Layers, ArrowLeft, X, Settings, Trash2, GripVertical } from "lucide-react";
import { FormComponent } from "./FormComponent";
import type { FormField, EvaluationForm } from "@/types/hr";
import { useFormQuestions } from "@/hooks/use-form-questions-api";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import React from "react";

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormBuilderProps {
  form?: EvaluationForm;
  onSave: (form: Partial<EvaluationForm>) => void;
  onSaveFormData?: (formData: { name: string; description: string; status: string }) => Promise<void>;
  onPreview?: (form: Partial<EvaluationForm>) => void;
  onClose?: () => void;
  isSaving?: boolean;
  onValidationError?: (message: string) => void;
}

const componentTypes = [
  { type: "text", label: "Campo de Texto", icon: Type },
  { type: "textarea", label: "Área de Texto", icon: AlignLeft },
  { type: "select", label: "Lista Suspensa", icon: List },
  { type: "rating", label: "Avaliação (1-5)", icon: Star },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "section", label: "Seção", icon: Layers }
] as const;

// Configuração dos campos de edição para cada tipo
const fieldEditConfig = {
  text: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: false,
    showRequired: true,
    placeholderAsSubtitle: false
  },
  textarea: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: false,
    showRequired: true,
    placeholderAsSubtitle: false
  },
  select: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: true,
    showRequired: true,
    placeholderAsSubtitle: true
  },
  rating: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: true,
    showRequired: true,
    placeholderAsSubtitle: true
  },
  checkbox: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: true,
    showRequired: true,
    placeholderAsSubtitle: true
  },
  section: {
    showLabel: true,
    showPlaceholder: true,
    showOptions: false,
    showRequired: false,
    placeholderAsSubtitle: false
  }
} as const;

// Função para renderizar campos de edição baseados no tipo
const renderFieldProperties = (
  selectedField: FormField, 
  updateField: (id: string, updates: Partial<FormField>) => void,
  localOptionsText: string,
  setLocalOptionsText: (text: string) => void,
  isMobile: boolean = false
) => {
  const config = fieldEditConfig[selectedField.type as keyof typeof fieldEditConfig];
  if (!config) return null;

  const textSize = isMobile ? 'text-sm' : '';
  const inputClass = isMobile ? 'form-input text-sm' : 'form-input';
  const textareaClass = isMobile ? 'form-textarea text-sm' : 'form-textarea';
  const labelClass = isMobile ? 'form-label text-sm' : 'form-label';

  return (
    <div className="space-y-3">
      {/* Rótulo - sempre mostrado */}
      {config.showLabel && (
        <div>
          <label className={labelClass}>Rótulo</label>
          <input
            type="text"
            className={inputClass}
            value={selectedField.label}
            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
            data-testid="field-label-input"
          />
        </div>
      )}

      {/* Placeholder */}
      {config.showPlaceholder && (
        <div>
          <label className={labelClass}>
            {config.placeholderAsSubtitle ? 'Descrição/Subtítulo' : 'Placeholder'}
          </label>
          <input
            type="text"
            className={inputClass}
            value={selectedField.placeholder || ""}
            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
            data-testid="field-placeholder-input"
            placeholder={config.placeholderAsSubtitle ? "Texto que aparecerá abaixo do rótulo" : "Texto de exemplo"}
          />
        </div>
      )}

      {/* Opções */}
      {config.showOptions && (
        <div>
          <label className={labelClass}>Opções (uma por linha)</label>
          <textarea
            className={textareaClass}
            rows={isMobile ? 3 : 4}
            value={localOptionsText}
            onChange={(e) => {
              setLocalOptionsText(e.target.value);
              updateField(selectedField.id, { 
                options: e.target.value.split('\n').filter(opt => opt.trim()) 
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            data-testid="field-options-input"
            placeholder="Digite uma opção por linha&#10;Opção 1&#10;Opção 2&#10;Opção 3"
          />
        </div>
      )}

      {/* Campo obrigatório */}
      {config.showRequired && (
        <div>
          <label className={`flex items-center space-x-2 ${textSize}`}>
            <input
              type="checkbox"
              checked={selectedField.required}
              onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
              data-testid="field-required-checkbox"
            />
            <span>Campo obrigatório</span>
          </label>
        </div>
      )}
    </div>
  );
};

// Componente para items arrastáveis
const SortableFormField = React.memo(function SortableFormField({ 
  field, 
  index, 
  selectedField, 
  setSelectedField, 
  setShowFieldProperties, 
  removeField 
}: {
  field: FormField;
  index: number;
  selectedField: FormField | null;
  setSelectedField: (field: FormField | null) => void;
  setShowFieldProperties: (show: boolean) => void;
  removeField: (id: string) => void;
}) {
  // Verificar se o campo tem um ID válido
  if (!field.id) {
    console.error("Campo sem ID válido:", field);
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-3 sm:p-4 border border-transparent rounded-lg hover:border-primary cursor-pointer transition-colors ${
        selectedField?.id === field.id ? 'border-primary bg-purple-50' : 'hover:bg-slate-50'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={() => {
        setSelectedField(field);
        setShowFieldProperties(true);
      }}
      data-testid={`form-field-${field.id}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
      </div>

      <div className="ml-6">
        <FormComponent field={field} disabled />
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button
          className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedField(field);
            setShowFieldProperties(true);
          }}
          data-testid={`config-field-${field.id}`}
          title="Configurar campo"
        >
          <Settings className="w-3 h-3" />
        </button>
        <button
          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (field.id) {
              removeField(field.id);
            } else {
              console.error("Campo sem ID válido:", field);
            }
          }}
          data-testid={`remove-field-${field.id}`}
          title="Remover campo"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

export function FormBuilder({ form, onSave, onSaveFormData, onPreview, onClose, isSaving, onValidationError }: FormBuilderProps) {
  const { createQuestion, updateQuestion, deleteQuestion } = useFormQuestions();
  const { authState } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Partial<EvaluationForm>>({
    name: form?.name || "",
    description: form?.description || "",
    fields: form?.fields || [],
    status: form?.status || "draft"
  });

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFieldProperties, setShowFieldProperties] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLocalSaving, setIsLocalSaving] = useState(false);
  
  // Estado local para a textarea de opções para evitar re-renders
  const [localOptionsText, setLocalOptionsText] = useState<string>("");

  // Função para atualizar o padding do canvas baseado no estado do painel
  const updateCanvasPadding = () => {
    if (canvasRef.current) {
      const isMobile = window.innerWidth < 1024;
      const shouldShowPanel = selectedField && showFieldProperties;
      
      if (shouldShowPanel && isMobile) {
        canvasRef.current.style.paddingBottom = '25rem';
      } else {
        canvasRef.current.style.paddingBottom = '2rem';
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounce para atualizações da API
  const debouncedUpdateQuestion = useDebounce((fieldId: string, field: FormField) => {
    // Só atualizar se tem formulário salvo e o ID não é um draft local
    if (form?.id && fieldId && !fieldId.startsWith('draft-')) {
      const questionOrder = formData.fields?.findIndex(f => f.id === fieldId) || 0;
      const apiData = convertFormFieldToAPIQuestion(field, form.id, questionOrder);
      updateQuestion({ id: fieldId, data: apiData, showToast: false });
    }
  }, 500);

  // Debounce para salvar dados básicos do formulário
  const debouncedSaveFormData = useDebounce(() => {
    if (form?.id && onSaveFormData && formData.name?.trim()) {
      onSaveFormData({
        name: formData.name,
        description: formData.description || "",
        status: formData.status || "draft"
      });
    }
  }, 1000);

  // Sincronizar selectedField com formData.fields quando campos são atualizados
  useEffect(() => {
    if (selectedField) {
      const updatedField = formData.fields?.find(field => field.id === selectedField.id);
      if (updatedField && JSON.stringify(updatedField) !== JSON.stringify(selectedField)) {
        setSelectedField(updatedField);
        // Atualizar o texto local das opções também
        setLocalOptionsText(updatedField.options?.join('\n') || "");
      }
    }
  }, [formData.fields, selectedField]);

  // Sincronizar texto local quando selectedField muda
  useEffect(() => {
    if (selectedField?.options) {
      setLocalOptionsText(selectedField.options.join('\n'));
    } else {
      setLocalOptionsText("");
    }
  }, [selectedField?.id]);

  // Atualizar padding do canvas quando o painel de propriedades muda
  useEffect(() => {
    updateCanvasPadding();
    
    // Listener para resize da janela
    const handleResize = () => updateCanvasPadding();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedField, showFieldProperties]);

  // Auto-salvar dados básicos do formulário quando mudarem
  useEffect(() => {
    debouncedSaveFormData();
  }, [formData.name, formData.description, formData.status]);

  // Funções auxiliares para conversão entre FormField e APIQuestion
  const convertFormFieldToAPIQuestion = (field: FormField, formId: string, order: number): Partial<import("@/types/hr").APIQuestion> => ({
    form_id: formId,
    name: field.label,
    help_text: field.placeholder || null,
    type: field.type,
    required: field.required ? 1 : 0,
    options: field.options ? JSON.stringify(field.options) : null,
    question_order: order
  });

  // Função para atualizar pergunta na API (debounced)
  const updateQuestionInAPI = (fieldId: string, field: FormField) => {
    debouncedUpdateQuestion(fieldId, field);
  };

  // Função para atualizar a ordem de todos os campos
  const updateAllFieldsOrder = async (newFields?: FormField[]) => {
    if (!form?.id) return;

    const fieldsToUpdate = newFields || formData.fields || [];
    const updatePromises = fieldsToUpdate
      .filter(field => !field.id.startsWith('draft-')) // Só campos salvos na API
      .map(async (field, index) => {
        const apiData = convertFormFieldToAPIQuestion(field, form.id!, index);
        try {
          await updateQuestion({ id: field.id, data: apiData, showToast: false });
        } catch (error) {
          console.error(`Erro ao atualizar ordem do campo ${field.id}:`, error);
        }
      });

    if (updatePromises && updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
  };

  // Função para rolar até o campo recém-criado
  const scrollToNewField = (fieldId: string) => {
    setTimeout(() => {
      const fieldElement = document.querySelector(`[data-testid="form-field-${fieldId}"]`);
      if (fieldElement && canvasRef.current) {
        // Scroll para o campo com margem extra
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 200);
  };

  const addField = async (type: FormField['type']) => {
    const newFieldTemplate: Omit<FormField, 'id'> = {
      type,
      label: type === "rating" 
        ? "Comunicação" 
        : `Novo ${componentTypes.find(c => c.type === type)?.label}`,
      required: false,
      ...(type === "select" ? { options: ["Opção 1", "Opção 2", "Opção 3"] } : {}),
      ...(type === "rating" ? { options: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"] } : {}),
      ...(type === "checkbox" ? { options: ["Opção A", "Opção B", "Opção C"] } : {}),
      ...(type === "text" || type === "textarea" ? { placeholder: "Digite aqui..." } : {}),
      ...(type === "checkbox" ? { placeholder: "Selecione uma ou mais opções" } : {}),
      ...(type === "section" ? { placeholder: "Instruções ou descrição desta seção" } : {})
    };

    // Se temos um formulário salvo, criar a pergunta na API primeiro
    if (form?.id) {
      try {
        const questionOrder = (formData.fields?.length || 0);
        const apiData = convertFormFieldToAPIQuestion({ ...newFieldTemplate, id: 'temp' }, form.id, questionOrder);
        
        const createdQuestion = await createQuestion(apiData);
        
        // Verificar se recebemos um ID válido da API
        // A API retorna question_id, não id
        const questionId = (createdQuestion as any).question_id || createdQuestion.id;
        if (!questionId) {
          console.error("API não retornou um ID válido:", createdQuestion);
          return;
        }
        
        // Criar o campo com o ID real da API
        const newField: FormField = {
          ...newFieldTemplate,
          id: questionId
        };

        // Adicionar o campo com o ID correto
        setFormData(prev => ({
          ...prev,
          fields: [...(prev.fields || []), newField]
        }));

        setSelectedField(newField);
        setShowFieldProperties(true);
        
        // Scroll até o novo campo
        scrollToNewField(questionId);
        
      } catch (error) {
        console.error("Erro ao criar pergunta:", error);
        // Não adicionar nada se houver erro
        return;
      }
    } else {
      // Se não há formulário salvo, usar um ID temporário simples
      const tempId = `draft-${Date.now()}`;
      const newField: FormField = {
        ...newFieldTemplate,
        id: tempId
      };

      setFormData(prev => ({
        ...prev,
        fields: [...(prev.fields || []), newField]
      }));

      setSelectedField(newField);
      setShowFieldProperties(true);
      
      // Scroll até o novo campo
      scrollToNewField(tempId);
    }
  };

  const updateField = async (fieldId: string, updates: Partial<FormField>) => {
    // Atualizar localmente primeiro
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
    
    // Atualiza também o selectedField se for o campo sendo editado
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null);
    }

    // Encontrar o campo atualizado e enviar para API (debounced)
    const currentField = formData.fields?.find(f => f.id === fieldId);
    if (currentField) {
      const updatedField = { ...currentField, ...updates };
      updateQuestionInAPI(fieldId, updatedField);
    }
  };

  const removeField = async (fieldId: string) => {
    // Verificar se fieldId é válido
    if (!fieldId) {
      console.error("ID do campo é inválido");
      return;
    }

    // Remover localmente primeiro
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.filter(field => field.id !== fieldId)
    }));
    setSelectedField(null);
    setShowFieldProperties(false);

    // Se é um campo salvo na API (não é draft local), deletar também
    if (form?.id && fieldId && !fieldId.startsWith('draft-')) {
      try {
        await deleteQuestion(fieldId);
      } catch (error) {
        console.error("Erro ao deletar pergunta:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Validação básica
      if (!formData.name?.trim()) {
        if (onValidationError) {
          onValidationError("Nome do formulário é obrigatório");
        }
        return;
      }

      // Se existe onSaveFormData (para salvar dados básicos do form), usar ela
      if (onSaveFormData) {
        await onSaveFormData({
          name: formData.name,
          description: formData.description || "",
          status: formData.status || "draft"
        });
      } else {
        // Caso contrário, usar onSave padrão
        onSave(formData);
      }
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      if (onValidationError) {
        onValidationError("Erro ao salvar formulário. Tente novamente.");
      }
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // Funções de Drag and Drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = formData.fields?.findIndex(field => field.id === active.id) ?? -1;
    const newIndex = formData.fields?.findIndex(field => field.id === over.id) ?? -1;

    if (oldIndex !== -1 && newIndex !== -1) {
      const newFields = arrayMove(formData.fields || [], oldIndex, newIndex);
      
      // Atualizar localmente primeiro
      setFormData(prev => ({
        ...prev,
        fields: newFields
      }));

      // Atualizar ordem na API se há um formulário salvo
      if (form?.id) {
        try {
          await updateAllFieldsOrder(newFields);
        } catch (error) {
          console.error("Erro ao atualizar ordem dos campos:", error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Back Button - Mobile Only */}
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                data-testid="back-to-forms-button"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Editor de Formulário</h3>
              <p className="text-slate-600 text-sm">Arraste componentes para construir seu formulário</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn-secondary text-sm" 
              onClick={handlePreview}
              data-testid="preview-form-button"
            >
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Visualizar</span>
            </button>
            <button 
              className="btn-primary text-sm" 
              onClick={handleSave}
              disabled={isSaving}
              data-testid="save-form-button"
            >
              <Save className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </span>
            </button>
          </div>
        </div>

        {/* Form Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Nome do Formulário</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do formulário"
              data-testid="form-name-input"
            />
          </div>
          <div>
            <label className="form-label">Descrição</label>
            <input
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição do formulário"
              data-testid="form-description-input"
            />
          </div>
          <div>
            <label className="form-label">Status do Formulário</label>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${formData.status === 'draft' ? 'text-slate-600' : 'text-slate-400'}`}>
                Rascunho
              </span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.status === 'active' ? 'bg-primary' : 'bg-slate-200'
                }`}
                onClick={() => setFormData(prev => ({
                  ...prev,
                  status: prev.status === 'active' ? 'draft' : 'active'
                }))}
                data-testid="form-status-toggle"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${formData.status === 'active' ? 'text-primary font-medium' : 'text-slate-400'}`}>
                Ativo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col lg:grid lg:grid-cols-12 flex-1 min-h-0">
          {/* Component Palette */}
          <div className="lg:col-span-3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex-shrink-0 lg:overflow-auto">
            <h4 className="font-medium text-slate-900 mb-4">Componentes</h4>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:space-y-2 lg:gap-0">
              {componentTypes.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.type}
                    className="p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => addField(component.type)}
                    data-testid={`add-component-${component.type}`}
                  >
                    <Icon className="w-4 h-4 text-slate-600 mr-2 inline" />
                    <span className="text-sm">{component.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Canvas */}
          <div className="flex-1 lg:col-span-9 flex flex-col lg:flex-row min-h-0">
            {/* Canvas */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
              ref={canvasRef}
            >
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 min-h-full" data-testid="form-canvas">
                {formData.fields?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400" data-testid="empty-canvas">
                    <Plus className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm sm:text-base">Clique em um componente da paleta para começar a construir seu formulário</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6 pb-8">
                    <div className="border-b border-slate-200 pb-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                        {formData.name || "Formulário sem título"}
                      </h2>
                      {formData.description && (
                        <p className="text-slate-600 text-sm sm:text-base">{formData.description}</p>
                      )}
                    </div>

                    {(formData.fields?.length || 0) > 0 && (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={formData.fields?.map(field => field.id) || []}
                          strategy={verticalListSortingStrategy}
                        >
                          {formData.fields
                            ?.filter((field, index, arr) => arr.findIndex(f => f.id === field.id) === index) // Remove duplicatas
                            ?.map((field) => (
                              <SortableFormField
                                key={`sortable-${field.id}`}
                                field={field}
                                index={formData.fields?.findIndex(f => f.id === field.id) || 0}
                                selectedField={selectedField}
                                setSelectedField={setSelectedField}
                                setShowFieldProperties={setShowFieldProperties}
                                removeField={removeField}
                              />
                            ))}
                        </SortableContext>
                        
                        <DragOverlay>
                          {activeId ? (
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg opacity-90">
                              <FormComponent 
                                field={formData.fields?.find(f => f.id === activeId)!} 
                                disabled 
                              />
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Field Properties Panel - Mobile: Bottom drawer, Desktop: Side panel */}
            {selectedField && (
              <>
                {/* Mobile: Fixed bottom drawer */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 max-h-80 overflow-y-auto shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Propriedades do Campo</h4>
                    <button
                      onClick={() => {
                        setSelectedField(null);
                        setShowFieldProperties(false);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {renderFieldProperties(selectedField, updateField, localOptionsText, setLocalOptionsText, true)}
                </div>

                {/* Desktop: Side panel */}
                <div className="hidden lg:block w-80 bg-slate-50 border-l border-slate-200 p-4 overflow-auto">
                  <h4 className="font-medium text-slate-900 mb-4">Propriedades do Campo</h4>
                  
                  {renderFieldProperties(selectedField, updateField, localOptionsText, setLocalOptionsText, false)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Visualização */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Visualização do Formulário</h3>
                <p className="text-slate-600 text-sm">Como os usuários verão este formulário</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                {/* Cabeçalho do Formulário */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {formData.name || "Formulário sem título"}
                  </h1>
                  {formData.description && (
                    <p className="text-slate-600">{formData.description}</p>
                  )}
                </div>

                {/* Campos do Formulário */}
                {(formData.fields?.length || 0) > 0 ? (
                  <div className="space-y-6">
                    {formData.fields?.map((field) => (
                      <div key={`preview-${field.id}`} className="space-y-2">
                        <FormComponent field={field} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p>Nenhum campo adicionado ao formulário ainda</p>
                  </div>
                )}

                {/* Botões de Ação (simulação) */}
                {(formData.fields?.length || 0) > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex space-x-3">
                      <button className="btn-primary flex-1">
                        Enviar Formulário
                      </button>
                      <button className="btn-secondary">
                        Salvar Rascunho
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Formulário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
