import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Users, Building } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";
import type { Position } from "@/types/hr";

export default function Positions() {
  const { positions, departments, employees, createPosition, updatePosition, deletePosition } = useHRData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
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
    const matchesDepartment = !selectedDepartment || position.departmentId === selectedDepartment;
    const matchesLevel = !selectedLevel || position.level === selectedLevel;
    
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
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.departmentId || !selectedPosition) {
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

  return (
    <MainLayout>
      <div className="h-full flex flex-col pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900" data-testid="positions-title">
                Cargos
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">Gerencie posições e níveis hierárquicos</p>
            </div>
            <button 
              className="btn-primary text-sm sm:text-base w-full sm:w-auto" 
              onClick={handleCreatePosition}
              data-testid="create-position-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Cargo</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cargos..."
                className="pl-10 form-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-positions-input"
              />
            </div>

            {/* Department Filter */}
            <div className="sm:w-48">
              <select
                className="form-select w-full"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                data-testid="department-filter-select"
              >
                <option value="">Todos os departamentos</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="sm:w-36">
              <select
                className="form-select w-full"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                data-testid="level-filter-select"
              >
                <option value="">Todos os níveis</option>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {filteredPositions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {positions.length === 0 ? "Nenhum cargo cadastrado" : "Nenhum cargo encontrado"}
              </h3>
              <p className="text-slate-500">
                {positions.length === 0 
                  ? "Comece criando o primeiro cargo da empresa."
                  : "Tente ajustar os filtros para encontrar cargos."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPositions.map((position) => (
                <div
                  key={position.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                  data-testid={`position-card-${position.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-slate-900 mb-1"
                        data-testid={`position-title-${position.id}`}
                      >
                        {position.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        <span data-testid={`position-department-${position.id}`}>
                          {getDepartmentName(position.departmentId)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditPosition(position)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        data-testid={`edit-position-${position.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePosition(position)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-position-${position.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${getLevelColor(position.level)}`}
                      data-testid={`position-level-${position.id}`}
                    >
                      {getLevelLabel(position.level)}
                    </span>
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span data-testid={`position-employee-count-${position.id}`}>
                        {getEmployeeCount(position.id)} funcionário(s)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Position Modal */}
        <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <ModalContent className="max-w-md" data-testid="create-position-modal">
            <ModalHeader>
              <ModalTitle>Criar Novo Cargo</ModalTitle>
            </ModalHeader>
            
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="form-label">Título do Cargo *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Frontend"
                  required
                  data-testid="position-title-input"
                />
              </div>

              <div>
                <label className="form-label">Nível *</label>
                <select
                  className="form-select"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Position['level'] }))}
                  required
                  data-testid="position-level-select"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Departamento *</label>
                <select
                  className="form-select"
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  required
                  data-testid="position-department-select"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 btn-secondary"
                  data-testid="cancel-create-position-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  data-testid="submit-create-position-button"
                >
                  Criar Cargo
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>

        {/* Edit Position Modal */}
        <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <ModalContent className="max-w-md" data-testid="edit-position-modal">
            <ModalHeader>
              <ModalTitle>Editar Cargo</ModalTitle>
            </ModalHeader>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="form-label">Título do Cargo *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Frontend"
                  required
                  data-testid="edit-position-title-input"
                />
              </div>

              <div>
                <label className="form-label">Nível *</label>
                <select
                  className="form-select"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as Position['level'] }))}
                  required
                  data-testid="edit-position-level-select"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Departamento *</label>
                <select
                  className="form-select"
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  required
                  data-testid="edit-position-department-select"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedPosition(null);
                  }}
                  className="flex-1 btn-secondary"
                  data-testid="cancel-edit-position-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  data-testid="submit-edit-position-button"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </MainLayout>
  );
}