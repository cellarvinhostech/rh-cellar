import { Star } from "lucide-react";
import type { FormField } from "@/types/hr";

interface FormComponentProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

export function FormComponent({ field, value, onChange, disabled = false }: FormComponentProps) {
  const handleRatingChange = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  switch (field.type) {
    case "text":
      return (
        <div className="form-group">
          <label className="form-label" data-testid={`label-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            data-testid={`input-${field.id}`}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="form-group">
          <label className="form-label" data-testid={`label-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            data-testid={`textarea-${field.id}`}
          />
        </div>
      );

    case "select":
      return (
        <div className="form-group">
          <label className="form-label" data-testid={`label-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.placeholder && (
            <p className="text-sm text-slate-600 mb-3">{field.placeholder}</p>
          )}
          <select
            className="form-select"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            data-testid={`select-${field.id}`}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option, index) => (
              <option key={`${field.id}-option-${index}-${option}`} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );

    case "rating":
      // Usar opções personalizadas se disponíveis, senão usar os rótulos padrão
      const ratingLabels = field.options && field.options.length > 0 
        ? field.options 
        : ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
      
      // Usar a quantidade de opções definidas (máximo 10 para usabilidade)
      const ratingCount = Math.min(ratingLabels.length, 10);
      
      return (
        <div className="form-group">
          <label className="form-label" data-testid={`label-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.placeholder && (
            <p className="text-sm text-slate-600 mb-3">{field.placeholder}</p>
          )}
          <div className={`flex flex-wrap gap-4 mt-3 ${
            ratingCount <= 5 ? 'sm:justify-between' : 'justify-center'
          }`} data-testid={`rating-${field.id}`}>
            {Array.from({ length: ratingCount }, (_, index) => index + 1).map((rating) => (
              <div key={`${field.id}-rating-${rating}`} className="flex flex-col items-center">
                <button
                  type="button"
                  className={`w-12 h-12 border-2 rounded-lg transition-all duration-200 ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
                  } ${
                    value === rating 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-slate-300 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleRatingChange(rating)}
                  disabled={disabled}
                  data-testid={`rating-star-${field.id}-${rating}`}
                >
                  <Star
                    className={`w-6 h-6 mx-auto transition-all duration-200 ${
                      value === rating 
                        ? 'text-purple-500 fill-current' 
                        : value > rating 
                          ? 'text-purple-400 fill-current'
                          : 'text-slate-300'
                    }`}
                  />
                </button>
                <span className={`text-xs mt-2 text-center font-medium transition-colors duration-200 max-w-24 break-words ${
                  value === rating ? 'text-purple-600' : 'text-slate-500'
                }`}>
                  {ratingLabels[rating - 1]}
                </span>
              </div>
            ))}
          </div>
          {value && value <= ratingLabels.length && (
            <div className="mt-3 text-sm text-slate-600">
              Avaliação: <span className="font-medium text-purple-600">{ratingLabels[value - 1]}</span>
            </div>
          )}
        </div>
      );

    case "checkbox":
      // Se há opções, renderizar como grupo de checkboxes múltiplos
      if (field.options && field.options.length > 0) {
        return (
          <div className="form-group">
            <label className="form-label" data-testid={`label-${field.id}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.placeholder && (
              <p className="text-sm text-slate-600 mb-3">{field.placeholder}</p>
            )}
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <label key={`${field.id}-checkbox-${index}-${option}`} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      if (!onChange) return;
                      
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        // Adicionar opção se marcada
                        onChange([...currentValues, option]);
                      } else {
                        // Remover opção se desmarcada
                        onChange(currentValues.filter(v => v !== option));
                      }
                    }}
                    disabled={disabled}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    data-testid={`checkbox-${field.id}-${index}`}
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      } else {
        // Fallback para checkbox simples (compatibilidade)
        return (
          <div className="form-group">
            <label className="flex items-center space-x-2" data-testid={`label-${field.id}`}>
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                data-testid={`checkbox-${field.id}`}
              />
              <span>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {field.placeholder && (
              <p className="text-sm text-slate-600 mt-1">{field.placeholder}</p>
            )}
          </div>
        );
      }

    case "section":
      return (
        <div className="border-b border-slate-200 pb-4 mb-6" data-testid={`section-${field.id}`}>
          <h3 className="text-lg font-semibold text-slate-900">{field.label}</h3>
          {field.placeholder && (
            <p className="text-slate-600 mt-1">{field.placeholder}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}
