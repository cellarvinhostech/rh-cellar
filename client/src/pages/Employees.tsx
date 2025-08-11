import { useState } from "react";
import { Plus, Search, Users, User, Mail, Phone, MapPin, Star, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeDetailSidebar } from "@/components/employees/EmployeeDetailSidebar";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
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

export default function Employees() {
  const { getEmployeesWithDetails, departments, positions } = useHRData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const employees = getEmployeesWithDetails();

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || employee.departmentId === selectedDepartment;
    const matchesPosition = !selectedPosition || employee.position.level === selectedPosition;
    
    return matchesSearch && matchesDepartment && matchesPosition;
  });

  const handleCreateEmployee = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A criação de funcionários será implementada em breve.",
    });
  };

  const handleViewEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setSelectedEmployee(employee);
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditEmployee = (id: string) => {
    toast({
      title: "Editar funcionário",
      description: `Editando funcionário ${id}`,
    });
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="employees-title">
                Funcionários
              </h2>
              <p className="text-slate-600">Gerencie informações dos colaboradores</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateEmployee}
              data-testid="create-employee-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </button>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar funcionários..." 
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-employees-input"
                />
              </div>
            </div>
            <select 
              className="form-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              data-testid="filter-department-select"
            >
              <option value="">Todos os Departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select 
              className="form-select"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              data-testid="filter-position-select"
            >
              <option value="">Todos os Cargos</option>
              <option value="junior">Júnior</option>
              <option value="pleno">Pleno</option>
              <option value="senior">Sênior</option>
              <option value="gerente">Gerente</option>
              <option value="diretor">Diretor</option>
            </select>
          </div>
        </div>

        {/* Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Employees List */}
          <div className={`${selectedEmployee ? 'w-1/2' : 'w-full'} transition-all duration-300 overflow-auto p-6 border-r border-slate-200`}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Funcionários Existentes
            </h3>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12" data-testid="no-employees-message">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum funcionário encontrado</h3>
                <p className="text-slate-600">
                  {searchTerm || selectedDepartment || selectedPosition 
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando seu primeiro funcionário."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="employees-list">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleViewEmployee(employee.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${
                      selectedEmployee?.id === employee.id 
                        ? 'border-primary bg-purple-50 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    data-testid={`employee-item-${employee.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {employee.name}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {employee.position.title} • {employee.department?.name || 'Sem departamento'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Employee Details */}
          {selectedEmployee && (
            <div className="w-1/2 overflow-auto p-6 bg-slate-50">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Detalhes do Funcionário
                  </h3>
                  <button 
                    onClick={handleCloseSidebar}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    data-testid="close-details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Employee Info */}
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      {selectedEmployee.name}
                    </h4>
                    <p className="text-slate-600 mb-2">
                      {selectedEmployee.position.title}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEmployee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {selectedEmployee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h5 className="font-medium text-slate-900 mb-3">Informações de Contato</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-slate-400 mr-3" />
                        <span className="text-slate-600">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-slate-400 mr-3" />
                        <span className="text-slate-600">{selectedEmployee.phone || '(11) 99999-9999'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mr-3" />
                        <span className="text-slate-600">{selectedEmployee.location || 'São Paulo, SP'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h5 className="font-medium text-slate-900 mb-3">Informações de Trabalho</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Departamento
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          {selectedEmployee.department?.name || 'Não definido'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Nível
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          {selectedEmployee.position.level}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Data de Contratação
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          {new Date(selectedEmployee.hireDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Salário
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          R$ {(selectedEmployee.salary || 8500).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h5 className="font-medium text-slate-900 mb-3">Performance</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Avaliação Geral</span>
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < (selectedEmployee.performanceRating || 4) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {selectedEmployee.performanceRating || 4}/5
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${((selectedEmployee.performanceRating || 4) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleEditEmployee(selectedEmployee.id)}
                        className="btn-primary text-sm"
                      >
                        Editar
                      </button>
                      <button className="btn-secondary text-sm">
                        Ver Avaliações
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
