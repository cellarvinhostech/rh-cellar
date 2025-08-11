import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Users, X } from "lucide-react";
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

type HierarchyLevel = {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: string[];
};

export default function HierarchyLevels() {
  const { positions, employees } = useHRData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchyLevel | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: 1,
    permissions: [] as string[]
  });

  // Níveis hierárquicos padrão
  const hierarchyLevels: HierarchyLevel[] = [
    {
      id: "1",
      name: "Operacional",
      description: "Nível operacional - execução de tarefas",
      level: 1,
      permissions: ["view_own_data", "edit_own_profile"]
    },
    {
      id: "2", 
      name: "Supervisão",
      description: "Supervisão de equipes pequenas",
      level: 2,
      permissions: ["view_team_data", "edit_team_data", "view_reports"]
    },
    {
      id: "3",
      name: "Coordenação",
      description: "Coordenação de múltiplas equipes",
      level: 3,
      permissions: ["view_department_data", "manage_team", "create_reports"]
    },
    {
      id: "4",
      name: "Gerência",
      description: "Gerenciamento de departamentos",
      level: 4,
      permissions: ["view_all_data", "manage_department", "approve_requests"]
    },
    {
      id: "5",
      name: "Diretoria",
      description: "Direção estratégica da empresa",
      level: 5,
      permissions: ["full_access", "strategic_decisions", "system_admin"]
    }
  ];

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmployeeCount = (levelName: string) => {
    const normalizedLevelName = levelName.toLowerCase();
    return positions
      .filter(pos => pos.level.toLowerCase().includes(normalizedLevelName))
      .reduce((count, pos) => {
        return count + employees.filter(emp => emp.positionId === pos.id).length;
      }, 0);
  };

  const filteredLevels = hierarchyLevels.filter(level => {
    const matchesSearch = level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         level.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || selectedLevel === 'all' || level.level.toString() === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      level: 1,
      permissions: []
    });
  };

  const handleCreateLevel = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEditLevel = (level: HierarchyLevel) => {
    setSelectedHierarchy(level);
    setFormData({
      name: level.name,
      description: level.description,
      level: level.level,
      permissions: level.permissions
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui normalmente criaria o nível hierárquico
    toast({
      title: "Nível Hierárquico Criado",
      description: `O nível ${formData.name} foi criado com sucesso.`,
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui normalmente atualizaria o nível hierárquico
    toast({
      title: "Nível Hierárquico Atualizado",
      description: `O nível ${formData.name} foi atualizado com sucesso.`,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteLevel = (levelId: string) => {
    // Aqui normalmente deletaria o nível hierárquico
    toast({
      title: "Nível Hierárquico Excluído",
      description: "O nível hierárquico foi excluído com sucesso.",
    });
  };

  const clearFilters = () => {
    setSelectedLevel("all");
    setSearchTerm("");
  };

  const activeFiltersCount = (selectedLevel !== "all" ? 1 : 0);

  const availablePermissions = [
    "view_own_data",
    "edit_own_profile", 
    "view_team_data",
    "edit_team_data",
    "view_reports",
    "view_department_data",
    "manage_team",
    "create_reports",
    "view_all_data",
    "manage_department",
    "approve_requests",
    "full_access",
    "strategic_decisions",
    "system_admin"
  ];

  const FiltersContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-4 ${isMobile ? 'px-4' : ''}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nível
        </label>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos os Níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Níveis</SelectItem>
            {[1, 2, 3, 4, 5].map((level) => (
              <SelectItem key={level} value={level.toString()}>
                Nível {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Níveis Hierárquicos</h1>
          <p className="text-slate-600">
            Gerencie a estrutura hierárquica da organização
          </p>
        </div>

        {/* Mobile Header with Search and Filter */}
        <div className="lg:hidden space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Buscar níveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-hierarchy"
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
            
            <Button onClick={handleCreateLevel} className="shrink-0" data-testid="create-hierarchy">
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
                placeholder="Buscar níveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-hierarchy"
              />
            </div>
            
            <Button onClick={handleCreateLevel} data-testid="create-hierarchy">
              <Plus className="w-4 h-4 mr-2" />
              Novo Nível
            </Button>
          </div>

          <div className="mt-4">
            <FiltersContent />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredLevels.length} {filteredLevels.length === 1 ? 'nível encontrado' : 'níveis encontrados'}
          </p>
        </div>

        {/* Hierarchy Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-6">
          {filteredLevels.map((level) => (
            <Card key={level.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {level.name}
                    </h3>
                    <Badge className={getLevelColor(level.level)}>
                      Nível {level.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {level.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 ml-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditLevel(level)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    data-testid={`edit-hierarchy-${level.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLevel(level.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    data-testid={`delete-hierarchy-${level.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Funcionários
                  </span>
                  <span className="font-medium">{getEmployeeCount(level.name)}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-500">Permissões:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {level.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {level.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{level.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Nível Hierárquico</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supervisão"
                  required
                  data-testid="create-hierarchy-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do nível hierárquico"
                  data-testid="create-hierarchy-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível *
                </label>
                <Select 
                  value={formData.level.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Nível {level}
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
                <Button type="submit" data-testid="submit-create-hierarchy">
                  Criar Nível
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Nível Hierárquico</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supervisão"
                  required
                  data-testid="edit-hierarchy-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do nível hierárquico"
                  data-testid="edit-hierarchy-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível *
                </label>
                <Select 
                  value={formData.level.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Nível {level}
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
                <Button type="submit" data-testid="submit-edit-hierarchy">
                  Atualizar Nível
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}