import { X, Mail, Phone, Calendar, MapPin, User, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EmployeeWithDetails {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending_evaluation";
  departmentId: string;
  positionId: string;
  hireDate: string;
  managerId?: string;
  avatar?: string;
  position: {
    id: string;
    title: string;
    level: string;
    department?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
  };
  phone?: string;
  location?: string;
  salary?: number;
  performanceRating?: number;
}

interface EmployeeDetailSidebarProps {
  employee: EmployeeWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeDetailSidebar({ employee, isOpen, onClose }: EmployeeDetailSidebarProps) {
  if (!isOpen || !employee) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateYearsOfService = (joinDate: string) => {
    const years = new Date().getFullYear() - new Date(joinDate).getFullYear();
    return years;
  };

  return (
    <div className="h-full w-full relative bg-white overflow-y-auto rounded-t-2xl lg:rounded-none">
      <div className="p-4 sm:p-6">
        {/* Mobile drag handle */}
        <div className="flex justify-center mb-3 lg:hidden">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-20 pb-2 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
            Detalhes do Funcionário
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            data-testid="close-employee-sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Employee Info */}
        <div className="space-y-4 pb-24 lg:pb-6">
          {/* Profile Section */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1" data-testid="employee-name">
              {employee.name}
            </h3>
            <p className="text-sm text-slate-600" data-testid="employee-position">
              {employee.position.title}
            </p>
            <div className="flex justify-center mt-2">
              <Badge 
                variant={employee.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
                data-testid="employee-status"
              >
                {employee.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 text-sm">Informações de Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0" />
                <span className="text-slate-600 truncate" data-testid="employee-email">{employee.email}</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0" />
                <span className="text-slate-600" data-testid="employee-phone">{employee.phone || '(11) 99999-9999'}</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0" />
                <span className="text-slate-600" data-testid="employee-location">{employee.location || 'São Paulo, SP'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 text-sm">Informações de Trabalho</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Departamento
                </label>
                <p className="text-xs sm:text-sm text-slate-900 mt-1" data-testid="employee-department">
                  {employee.department?.name || 'Não definido'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cargo
                </label>
                <p className="text-xs sm:text-sm text-slate-900 mt-1">
                  {employee.position.title}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nível
                </label>
                <p className="text-xs sm:text-sm text-slate-900 mt-1 capitalize">
                  {employee.position.level}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Salário
                </label>
                <p className="text-xs sm:text-sm text-slate-900 mt-1" data-testid="employee-salary">
                  R$ {(employee.salary || 8500).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employment History */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 text-sm">Histórico de Emprego</h4>
            <div className="space-y-2">
              <div className="flex items-start text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-600">Contratação: </span>
                  <span className="font-medium text-slate-900" data-testid="employee-hire-date">
                    {formatDate(employee.hireDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-start text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-600">Tempo: </span>
                  <span className="font-medium text-slate-900" data-testid="employee-years-service">
                    {calculateYearsOfService(employee.hireDate)} anos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 text-sm">Performance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-slate-600">Avaliação Geral</span>
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < (employee.performanceRating || 4) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-900" data-testid="employee-rating">
                    {employee.performanceRating || 4}/5
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((employee.performanceRating || 4) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons - Mobile optimized */}
          <div className="space-y-2">
            <Button 
              className="w-full text-xs sm:text-sm py-2" 
              size="sm"
              data-testid="edit-employee-button"
            >
              Editar Funcionário
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-xs sm:text-sm py-2" 
              size="sm"
              data-testid="view-evaluations-button"
            >
              Ver Avaliações
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-xs sm:text-sm py-2" 
              size="sm"
              data-testid="performance-history-button"
            >
              Histórico de Performance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}