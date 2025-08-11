import { useState } from "react";
import { Plus, Eye, Save, Type, AlignLeft, List, Star, CheckSquare, Layers } from "lucide-react";
import { FormComponent } from "./FormComponent";
import type { FormField, EvaluationForm } from "@/types/hr";

interface FormBuilderProps {
  form?: EvaluationForm;
  onSave: (form: Partial<EvaluationForm>) => void;
  onPreview: (form: Partial<EvaluationForm>) => void;
}

const componentTypes = [
  { type: "text", label: "Campo de Texto", icon: Type },
  { type: "textarea", label: "Área de Texto", icon: AlignLeft },
  { type: "select", label: "Lista Suspensa", icon: List },
  { type: "rating", label: "Avaliação (1-5)", icon: Star },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "section", label: "Seção", icon: Layers }
] as const;

export function FormBuilder({ form, onSave, onPreview }: FormBuilderProps) {
  const [formData, setFormData] = useState<Partial<EvaluationForm>>({
    name: form?.name || "",
    description: form?.description || "",
    fields: form?.fields || [],
    status: form?.status || "draft"
  });

  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `Novo ${componentTypes.find(c => c.type === type)?.label}`,
      required: false,
      ...(type === "select" ? { options: ["Opção 1", "Opção 2"] } : {}),
      ...(type === "text" || type === "textarea" ? { placeholder: "Digite aqui..." } : {})
    };

    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.filter(field => field.id !== fieldId)
    }));
    setSelectedField(null);
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Editor de Formulário</h3>
            <p className="text-slate-600">Arraste componentes para construir seu formulário</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn-secondary" 
              onClick={handlePreview}
              data-testid="preview-form-button"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              data-testid="save-form-button"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </button>
          </div>
        </div>

        {/* Form Basic Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 h-full">
          {/* Component Palette */}
          <div className="col-span-3 bg-slate-50 border-r border-slate-200 p-4 overflow-auto">
            <h4 className="font-medium text-slate-900 mb-4">Componentes</h4>
            <div className="space-y-2">
              {componentTypes.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.type}
                    className="p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:shadow-sm"
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
          <div className="col-span-9 flex">
            {/* Canvas */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="bg-white min-h-full border border-slate-200 rounded-lg p-6" data-testid="form-canvas">
                {formData.fields?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400" data-testid="empty-canvas">
                    <Plus className="w-12 h-12 mx-auto mb-4" />
                    <p>Clique em um componente da paleta para começar a construir seu formulário</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {formData.name || "Formulário sem título"}
                      </h2>
                      {formData.description && (
                        <p className="text-slate-600">{formData.description}</p>
                      )}
                    </div>

                    {formData.fields?.map((field, index) => (
                      <div
                        key={field.id}
                        className={`group relative p-4 border border-transparent rounded-lg hover:border-blue-300 cursor-pointer ${
                          selectedField?.id === field.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedField(field)}
                        data-testid={`form-field-${field.id}`}
                      >
                        <FormComponent field={field} disabled />
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(field.id);
                            }}
                            data-testid={`remove-field-${field.id}`}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field Properties Panel */}
            {selectedField && (
              <div className="w-80 bg-slate-50 border-l border-slate-200 p-4 overflow-auto">
                <h4 className="font-medium text-slate-900 mb-4">Propriedades do Campo</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Rótulo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      data-testid="field-label-input"
                    />
                  </div>

                  {(selectedField.type === "text" || selectedField.type === "textarea") && (
                    <div>
                      <label className="form-label">Placeholder</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedField.placeholder || ""}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        data-testid="field-placeholder-input"
                      />
                    </div>
                  )}

                  {selectedField.type === "select" && (
                    <div>
                      <label className="form-label">Opções (uma por linha)</label>
                      <textarea
                        className="form-textarea"
                        rows={4}
                        value={selectedField.options?.join('\n') || ""}
                        onChange={(e) => updateField(selectedField.id, { 
                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        data-testid="field-options-input"
                      />
                    </div>
                  )}

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                        data-testid="field-required-checkbox"
                      />
                      <span>Campo obrigatório</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
