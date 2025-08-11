import { Eye, Edit } from "lucide-react";
import type { EmployeeWithDetails } from "@/types/hr";

interface EmployeeCardProps {
  employee: EmployeeWithDetails;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function EmployeeCard({ employee, onView, onEdit }: EmployeeCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
      data-testid={`employee-card-${employee.id}`}
    >
      <div className="flex items-start space-x-4">
        <img 
          src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=e2e8f0&color=475569`} 
          alt={employee.name}
          className="w-12 h-12 rounded-full object-cover"
          data-testid={`employee-avatar-${employee.id}`}
        />
        <div className="flex-1">
          <h3 
            className="font-semibold text-slate-900"
            data-testid={`employee-name-${employee.id}`}
          >
            {employee.name}
          </h3>
          <p 
            className="text-sm text-slate-600"
            data-testid={`employee-position-${employee.id}`}
          >
            {employee.position.title}
          </p>
          <p 
            className="text-xs text-slate-500"
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
            <span 
              className="text-xs text-slate-500"
              data-testid={`employee-hire-date-${employee.id}`}
            >
              Contratado em {formatDate(employee.hireDate)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          className="btn-secondary flex-1"
          onClick={() => onView(employee.id)}
          data-testid={`view-employee-${employee.id}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </button>
        <button 
          className="btn-secondary flex-1"
          onClick={() => onEdit(employee.id)}
          data-testid={`edit-employee-${employee.id}`}
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </button>
      </div>
    </div>
  );
}
