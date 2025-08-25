import { Eye, Edit, Trash2 } from "lucide-react";
import type { EmployeeWithDetails } from "@/types/hr";
import { formatDateBR } from "@/lib/utils";

interface EmployeeCardProps {
  employee: EmployeeWithDetails;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
  showEditActions?: boolean;
}

export function EmployeeCard({ employee, onView, onEdit, onDelete, showActions = true, showEditActions = true }: EmployeeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_evaluation":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "pending_evaluation":
        return "Avaliação Pendente";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  const formatDate = formatDateBR;

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
      data-testid={`employee-card-${employee.id}`}
    >
      <div className="flex items-start space-x-3">
        <img 
          src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=e2e8f0&color=475569`} 
          alt={employee.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          data-testid={`employee-avatar-${employee.id}`}
        />
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-slate-900 text-sm truncate"
            data-testid={`employee-name-${employee.id}`}
          >
            {employee.name}
          </h3>
          <p 
            className="text-xs text-slate-600 truncate"
            data-testid={`employee-position-${employee.id}`}
          >
            {employee.position.title}
          </p>
          <p 
            className="text-xs text-slate-500 truncate"
            data-testid={`employee-department-${employee.id}`}
          >
            {employee.department.name}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span 
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employee.status)}`}
              data-testid={`employee-status-${employee.id}`}
            >
              {getStatusLabel(employee.status)}
            </span>
          </div>
          <span 
            className="text-xs text-slate-500 block mt-1"
            data-testid={`employee-hire-date-${employee.id}`}
          >
            Contratado em {formatDate(employee.hireDate)}
          </span>
        </div>
      </div>
      {showActions && (
        <div className="mt-3 flex space-x-2">
          {showEditActions && (
            <button 
              className="btn-secondary-compact flex-1 text-xs"
              onClick={() => onView(employee.id)}
              data-testid={`view-employee-${employee.id}`}
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </button>
          )}
          {showEditActions && (
            <button 
              className="btn-secondary-compact flex-1 text-xs"
              onClick={() => onEdit(employee.id)}
              data-testid={`edit-employee-${employee.id}`}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </button>
          )}
          {showEditActions && (
            <button 
              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
              onClick={() => onDelete(employee.id)}
              data-testid={`delete-employee-${employee.id}`}
              title="Excluir funcionário"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
