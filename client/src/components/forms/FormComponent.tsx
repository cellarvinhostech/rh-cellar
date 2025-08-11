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
          <select
            className="form-select"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            data-testid={`select-${field.id}`}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );

    case "rating":
      return (
        <div className="form-group">
          <label className="form-label" data-testid={`label-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex space-x-2 mt-2" data-testid={`rating-${field.id}`}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`w-8 h-8 border border-slate-300 rounded hover:bg-yellow-100 ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => handleRatingChange(rating)}
                disabled={disabled}
                data-testid={`rating-star-${field.id}-${rating}`}
              >
                <Star
                  className={`w-4 h-4 mx-auto ${
                    value >= rating ? 'text-yellow-500 fill-current' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div className="form-group">
          <label className="flex items-center space-x-2" data-testid={`label-${field.id}`}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange?.(e.target.checked)}
              disabled={disabled}
              data-testid={`checkbox-${field.id}`}
            />
            <span>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        </div>
      );

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
