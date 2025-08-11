import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
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

        {/* Employees List */}
        <div className="flex-1 overflow-auto p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="employees-grid">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={handleViewEmployee}
                  onEdit={handleEditEmployee}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employee Detail Sidebar */}
      <EmployeeDetailSidebar
        employee={selectedEmployee}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </MainLayout>
  );
}
