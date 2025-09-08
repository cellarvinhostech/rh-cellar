import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Save, X, User, IdCard, Building2, Users, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEmployeesAPI } from "@/hooks/use-employees-edit-api";
import { useEmployees } from "@/hooks/use-employees-api";
import { useDepartmentsAPI } from "@/hooks/use-departments-api";
import { usePositionsAPI } from "@/hooks/use-positions-api";
import { useDirectoratesAPI } from "@/hooks/use-directorates-api";
import { useShiftsAPI } from "@/hooks/use-shifts-api";
import { useUnitsAPI } from "@/hooks/use-units-api";
import { useHierarchyLevelsAPI } from "@/hooks/use-hierarchy-levels-api";
import type { APIEmployee } from "@/types/hr";

export default function EditEmployee() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/employees/edit/:id");
  const { toast } = useToast();
  
  const { getEmployeeById, updateEmployee } = useEmployeesAPI();
  const { employees } = useEmployees();
  const { departments } = useDepartmentsAPI();
  const { positions } = usePositionsAPI();
  const { directorates } = useDirectoratesAPI();
  const { shifts } = useShiftsAPI();
  const { units } = useUnitsAPI();
  const { hierarchyLevels } = useHierarchyLevelsAPI();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<APIEmployee | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    documento: "",
    registro: "",
    nascimento: "",
    estado_civil: "",
    escolaridade: "",
    data_admissao: "",
    department_id: "",
    cargo_id: "",
    nivel_id: "",
    diretoria_id: "",
    turno_id: "",
    lider_direto: "",
    lidera_pessoas: 0,
    role: ""
  });

  const employeeId = params?.id;

  // Debug: Log dos dados carregados
  useEffect(() => {
  }, [departments, positions, directorates, hierarchyLevels]);

  // Carregar dados do funcionário
  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    if (!employeeId) return;
    
    try {
      setIsLoading(true);
      const employeeData = await getEmployeeById(employeeId);
      setEmployee(employeeData);
      
      
      // Função helper para converter null para string vazia
      const nullToEmpty = (value: string | null): string => value === null ? "" : (value || "");
      
      // Preencher formulário com dados do funcionário
      setFormData({
        first_name: nullToEmpty(employeeData.first_name),
        last_name: nullToEmpty(employeeData.last_name),
        email: nullToEmpty(employeeData.email),
        phone: nullToEmpty(employeeData.phone),
        documento: nullToEmpty(employeeData.documento),
        registro: nullToEmpty(employeeData.registro),
        nascimento: nullToEmpty(employeeData.nascimento),
        estado_civil: nullToEmpty(employeeData.estado_civil),
        escolaridade: nullToEmpty(employeeData.escolaridade),
        data_admissao: nullToEmpty(employeeData.data_admissao),
        department_id: nullToEmpty(employeeData.department_id),
        cargo_id: nullToEmpty(employeeData.cargo_id),
        nivel_id: nullToEmpty(employeeData.nivel_id),
        diretoria_id: nullToEmpty(employeeData.diretoria_id),
        turno_id: nullToEmpty(employeeData.turno_id),
        lider_direto: nullToEmpty(employeeData.lider_direto),
        lidera_pessoas: employeeData.lidera_pessoas || 0,
        role: nullToEmpty(employeeData.role)
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do funcionário",
        variant: "destructive"
      });
      setLocation("/employees");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Log do formData quando muda
  useEffect(() => {
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) return;

    setIsSubmitting(true);
    try {
      // Remover campos vazios ou null
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "" && value !== null)
      );

      await updateEmployee(employeeId, cleanedData);
      
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!",
      });
      
      setLocation("/employees");
    } catch (error) {
      toast({
        title: "Erro ao atualizar funcionário",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLocation("/employees");
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mock data para campos que não temos API ainda
  const maritalStatuses = [
    { value: "solteiro", label: "Solteiro(a)" },
    { value: "casado", label: "Casado(a)" },
    { value: "divorciado", label: "Divorciado(a)" },
    { value: "viuvo", label: "Viúvo(a)" },
    { value: "uniao_estavel", label: "União Estável" },
  ];

  const educationLevels = [
    { value: "fundamental", label: "Ensino Fundamental" },
    { value: "medio", label: "Ensino Médio" },
    { value: "superior", label: "Ensino Superior" },
    { value: "pos_graduacao", label: "Pós-graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-slate-600">Carregando dados do funcionário...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!employee) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Funcionário não encontrado</p>
            <Button onClick={() => setLocation("/employees")}>
              Voltar para funcionários
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Editar Funcionário
                </h1>
                <p className="text-gray-600">
                  Atualize as informações de {employee.first_name} {employee.last_name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                  <CardDescription>
                    Dados básicos do funcionário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nome *</label>
                      <Input 
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Informe o nome do colaborador" 
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Sobrenome *</label>
                      <Input 
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Informe o sobrenome do colaborador" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">E-mail *</label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="exemplo@mail.com" 
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Telefone</label>
                      <Input 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Função/Role</label>
                    <Input 
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="Ex: Desenvolvedor, Analista, etc." 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documentação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IdCard className="w-5 h-5" />
                    <span>Documentação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Documento</label>
                      <Input 
                        value={formData.documento}
                        onChange={(e) => handleInputChange('documento', e.target.value)}
                        placeholder="Informe o número do documento" 
                      />
                    </div>

                    <div>
                      <label className="form-label">Matrícula / Registro</label>
                      <Input 
                        value={formData.registro}
                        onChange={(e) => handleInputChange('registro', e.target.value)}
                        placeholder="Informe o número da Matrícula / Registro" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Data de Nascimento</label>
                      <Input 
                        type="date"
                        value={formData.nascimento}
                        onChange={(e) => handleInputChange('nascimento', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="form-label">Estado Civil</label>
                      <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange('estado_civil', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          {maritalStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Escolaridade</label>
                    <Select value={formData.escolaridade} onValueChange={(value) => handleInputChange('escolaridade', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a escolaridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Organizacionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Informações Organizacionais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Departamento</label>
                      <Select value={formData.department_id} onValueChange={(value) => handleInputChange('department_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="form-label">Cargo</label>
                      <Select value={formData.cargo_id} onValueChange={(value) => handleInputChange('cargo_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nível Hierárquico</label>
                      <Select value={formData.nivel_id} onValueChange={(value) => handleInputChange('nivel_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível hierárquico" />
                        </SelectTrigger>
                        <SelectContent>
                          {hierarchyLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="form-label">Diretoria</label>
                      <Select value={formData.diretoria_id} onValueChange={(value) => handleInputChange('diretoria_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a diretoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {directorates.map((directorate) => (
                            <SelectItem key={directorate.id} value={directorate.id}>
                              {directorate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Turno</label>
                      <Select value={formData.turno_id} onValueChange={(value) => handleInputChange('turno_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                        <label className="form-label">Data de Admissão</label>
                        <Input 
                        type="date"
                        value={formData.data_admissao}
                        onChange={(e) => handleInputChange('data_admissao', e.target.value)}
                        />
                    </div>
                    
                  </div>
                  
                </CardContent>
              </Card>

              {/* Hierarquia e Liderança */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Hierarquia e Liderança</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="form-label">Lidera pessoas?</label>
                            <div className="flex items-center space-x-2">
                            <Switch
                                checked={formData.lidera_pessoas === 1}
                                onCheckedChange={(checked) => handleInputChange('lidera_pessoas', checked ? 1 : 0)}
                            />
                            <span className="text-sm">
                                {formData.lidera_pessoas === 1 ? "Sim" : "Não"}
                            </span>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Líder Direto</label>
                            <Select value={formData.lider_direto} onValueChange={(value) => handleInputChange('lider_direto', value)}>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione o líder direto" />
                                </SelectTrigger>
                                <SelectContent>
                                {employees
                                    .filter(emp => emp.id !== employeeId) // Não permite selecionar a si mesmo
                                    .map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                    {employee.first_name} {employee.last_name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
