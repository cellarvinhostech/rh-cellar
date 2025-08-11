import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Users, Building, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
import type { Position } from "@/types/hr";

export default function Positions() {
  const { positions, departments, employees, createPosition, updatePosition, deletePosition } = useHRData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    level: "junior" as Position['level'],
    departmentId: ""
  });

  const levels = [
    { value: "junior", label: "Júnior" },
    { value: "pleno", label: "Pleno" },
    { value: "senior", label: "Sênior" },
    { value: "gerente", label: "Gerente" },
    { value: "diretor", label: "Diretor" }
  ] as const;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "junior":
        return "bg-blue-100 text-blue-800";
      case "pleno":
        return "bg-green-100 text-green-800";
      case "senior":
        return "bg-purple-100 text-purple-800";
      case "gerente":
        return "bg-orange-100 text-orange-800";
      case "diretor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    return levels.find(l => l.value === level)?.label || level;
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || "Departamento não encontrado";
  };

  const getEmployeeCount = (positionId: string) => {
    return employees.filter(e => e.positionId === positionId).length;
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getDepartmentName(position.departmentId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || selectedDepartment === 'all' || position.departmentId === selectedDepartment;
    const matchesLevel = !selectedLevel || selectedLevel === 'all' || position.level === selectedLevel;
    
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleCreatePosition = () => {
    setFormData({ title: "", level: "junior", departmentId: "" });
    setIsCreateModalOpen(true);
  };

  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position);
    setFormData({
      title: position.title,
      level: position.level,
      departmentId: position.departmentId
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePosition = (position: Position) => {
    const employeeCount = getEmployeeCount(position.id);
    
    if (employeeCount > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir o cargo "${position.title}" pois há ${employeeCount} funcionário(s) vinculado(s).`,
        variant: "destructive"
      });
      return;
    }

    deletePosition(position.id);
    toast({
      title: "Sucesso",
      description: `Cargo "${position.title}" excluído com sucesso.`
    });
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.departmentId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    createPosition({
      title: formData.title,
      level: formData.level,
      departmentId: formData.departmentId
    });

    toast({
      title: "Sucesso",
      description: `Cargo "${formData.title}" criado com sucesso.`
    });

    setIsCreateModalOpen(false);
    setFormData({ title: "", level: "junior", departmentId: "" });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPosition || !formData.title || !formData.departmentId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    updatePosition(selectedPosition.id, {
      title: formData.title,
      level: formData.level,
      departmentId: formData.departmentId
    });

    toast({
      title: "Sucesso",
      description: `Cargo "${formData.title}" atualizado com sucesso.`
    });

    setIsEditModalOpen(false);
    setSelectedPosition(null);
  };

  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedLevel("all");
    setSearchTerm("");
  };

  const activeFiltersCount = [
    selectedDepartment !== "all" ? selectedDepartment : null,
    selectedLevel !== "all" ? selectedLevel : null,
    searchTerm
  ].filter(Boolean).length;

  // Filters Component for reuse
  const FiltersContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-4">
      <div className={`space-y-4 ${isMobile ? '' : 'flex flex-row space-y-0 space-x-4'}`}>
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
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os Níveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Níveis</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
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
      <div className="container mx-auto p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Cargos</h1>
          <p className="text-slate-600">
            Gerencie cargos e níveis hierárquicos
          </p>
        </div>

        {/* Mobile Header with Search and Filter */}
        <div className="lg:hidden space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Buscar cargos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-positions"
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
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent isMobile={true} />
              </div>
            </SheetContent>
            </Sheet>
            
            <Button onClick={handleCreatePosition} className="shrink-0" data-testid="create-position">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Buscar cargos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-positions"
              />
            </div>
            
            <Button onClick={handleCreatePosition} data-testid="create-position">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
          </div>

          <div className="mt-4">
            <FiltersContent />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredPositions.length} {filteredPositions.length === 1 ? 'cargo encontrado' : 'cargos encontrados'}
          </p>
        </div>

        {/* Positions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-6">
          {filteredPositions.map((position) => (
          <Card key={position.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-base">
                  {position.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getDepartmentName(position.departmentId)}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPosition(position)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  data-testid={`edit-position-${position.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePosition(position)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  data-testid={`delete-position-${position.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(position.level)}`}>
                {getLevelLabel(position.level)}
              </Badge>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{getEmployeeCount(position.id)}</span>
              </div>
            </div>
          </Card>
        ))}

        {filteredPositions.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cargo encontrado</p>
            <p className="text-sm text-gray-400 mt-1">
              Tente ajustar os filtros ou criar um novo cargo
            </p>
          </div>
        )}
      </div>

      {/* Create Position Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Cargo</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Cargo *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Desenvolvedor Frontend"
                required
                data-testid="position-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível Hierárquico
              </label>
              <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as Position['level'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento *
              </label>
              <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="submit-create-position">
                Criar Cargo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Position Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Cargo *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Desenvolvedor Frontend"
                required
                data-testid="edit-position-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível Hierárquico
              </label>
              <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as Position['level'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento *
              </label>
              <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="submit-edit-position">
                Atualizar Cargo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </MainLayout>
  );
}