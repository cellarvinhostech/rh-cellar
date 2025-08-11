import { useState, useMemo } from "react";
import { Plus, Search, Users, User, Mail, Phone, MapPin, Star, X, Filter } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeDetailSidebar } from "@/components/employees/EmployeeDetailSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
import { ExportButtons } from "@/components/common/ExportButtons";
import { ExportData } from "@/utils/exportUtils";

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
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const employees = getEmployeesWithDetails();

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || selectedDepartment === 'all' || employee.departmentId === selectedDepartment;
    const matchesPosition = !selectedPosition || selectedPosition === 'all' || employee.position.level === selectedPosition;
    
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

  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedPosition("all");
    setSearchTerm("");
  };

  const activeFiltersCount = [
    selectedDepartment !== "all" ? selectedDepartment : null,
    selectedPosition !== "all" ? selectedPosition : null,
    searchTerm
  ].filter(Boolean).length;

  // Filters Component for reuse
  const FiltersContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-4">
      <div className={`space-y-4 ${isMobile ? '' : 'flex flex-row space-y-0 space-x-4'}`}>
        <div className={isMobile ? '' : 'flex-1'}>
          <ExportButtons 
            data={employees.map((employee): ExportData => ({
              id: employee.id,
              name: employee.name,
              email: employee.email,
              department: employee.department?.name || 'Não informado',
              position: employee.position.title,
              status: employee.status,
              hireDate: employee.hireDate,
              salary: employee.salary
            }))}
            filename="Funcionários"
            className="w-full"
          />
        </div>
        
        <div className={isMobile ? '' : 'flex-1'}>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os Departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={isMobile ? '' : 'flex-1'}>
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os Cargos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cargos</SelectItem>
              <SelectItem value="junior">Júnior</SelectItem>
              <SelectItem value="pleno">Pleno</SelectItem>
              <SelectItem value="senior">Sênior</SelectItem>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="diretor">Diretor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900" data-testid="employees-title">
                Funcionários
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">Gerencie informações dos colaboradores</p>
            </div>
            <Button 
              onClick={handleCreateEmployee}
              className="w-full sm:w-auto"
              data-testid="create-employee-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Funcionário</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </header>

        {/* Mobile Search and Filter */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-employees-input"
              />
            </div>
            
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  data-testid="open-filters"
                >
                  <Filter className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary text-white rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[400px]">
                <SheetHeader>
                  <SheetTitle>Filtros e Exportar</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Filters and Search */}
        <div className="hidden lg:block bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Buscar funcionários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-employees-input"
                />
              </div>
            </div>
            
            <div className="lg:flex-none">
              <FiltersContent />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="bg-white px-4 sm:px-6 py-2 border-b border-slate-200">
          <p className="text-sm text-gray-600">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'funcionário encontrado' : 'funcionários encontrados'}
          </p>
        </div>

        {/* Content Area - Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side - Employees List */}
          <div className={`${selectedEmployee ? 'lg:w-1/2 h-1/2 lg:h-full' : 'w-full'} transition-all duration-300 overflow-auto ${selectedEmployee ? 'border-b lg:border-b-0 lg:border-r border-slate-200' : ''}`}>
            <div className="p-4 sm:p-6 pb-20 lg:pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Colaboradores ({filteredEmployees.length})
              </h3>
              
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum funcionário encontrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tente ajustar os filtros ou criar um novo funcionário
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard 
                      key={employee.id}
                      employee={employee}
                      onView={() => handleViewEmployee(employee.id)}
                      onEdit={() => handleEditEmployee(employee.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Employee Details */}
          {selectedEmployee && (
            <div className="lg:w-1/2 h-1/2 lg:h-full bg-slate-50 border-t lg:border-t-0 relative">
              <EmployeeDetailSidebar 
                employee={selectedEmployee}
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}