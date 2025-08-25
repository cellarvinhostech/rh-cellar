import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save, X, User, IdCard, Building2, Users, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/use-employees-api";
import { useDepartmentsAPI } from "@/hooks/use-departments-api";
import { usePositionsAPI } from "@/hooks/use-positions-api";
import { useDirectoratesAPI } from "@/hooks/use-directorates-api";
import { useShiftsAPI } from "@/hooks/use-shifts-api";
import { useUnitsAPI } from "@/hooks/use-units-api";
import { useHierarchyLevelsAPI } from "@/hooks/use-hierarchy-levels-api";
import type { APIEmployee } from "@/types/hr";

export default function CreateEmployee() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { createEmployee } = useEmployees();
  const { employees } = useEmployees();
  const { departments } = useDepartmentsAPI();
  const { positions } = usePositionsAPI();
  const { directorates } = useDirectoratesAPI();
  const { shifts } = useShiftsAPI();
  const { units } = useUnitsAPI();
  const { hierarchyLevels } = useHierarchyLevelsAPI();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Opções para campos de seleção
  const civilStatusOptions = [
    { value: "solteiro", label: "Solteiro(a)" },
    { value: "casado", label: "Casado(a)" },
    { value: "divorciado", label: "Divorciado(a)" },
    { value: "viuvo", label: "Viúvo(a)" },
    { value: "uniao_estavel", label: "União Estável" }
  ];

  const educationLevels = [
    { value: "fundamental_incompleto", label: "Ensino Fundamental Incompleto" },
    { value: "fundamental_completo", label: "Ensino Fundamental Completo" },
    { value: "medio_incompleto", label: "Ensino Médio Incompleto" },
    { value: "medio_completo", label: "Ensino Médio Completo" },
    { value: "superior_incompleto", label: "Ensino Superior Incompleto" },
    { value: "superior_completo", label: "Ensino Superior Completo" },
    { value: "pos_graduacao", label: "Pós-graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validações básicas
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
        throw new Error("Nome, sobrenome e email são obrigatórios");
      }

      // Preparar dados para envio
      const employeeData: Partial<APIEmployee> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        documento: formData.documento || null,
        registro: formData.registro || null,
        nascimento: formData.nascimento || null,
        estado_civil: formData.estado_civil || null,
        escolaridade: formData.escolaridade || null,
        data_admissao: formData.data_admissao || null,
        department_id: formData.department_id || "",
        cargo_id: formData.cargo_id || null,
        nivel_id: formData.nivel_id || null,
        diretoria_id: formData.diretoria_id || null,
        turno_id: formData.turno_id || null,
        lider_direto: formData.lider_direto || null,
        lidera_pessoas: formData.lidera_pessoas,
        role: formData.role || ""
      };

      await createEmployee(employeeData as APIEmployee);
      
      toast({
        title: "Funcionário criado com sucesso!",
        description: `${formData.first_name} ${formData.last_name} foi adicionado ao sistema.`,
      });
      
      setLocation("/employees");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar funcionário";
      toast({
        title: "Erro ao criar funcionário",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLocation("/employees");
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
                  Novo Funcionário
                </h1>
                <p className="text-gray-600">
                  Preencha as informações do novo funcionário
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
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
                    Salvar Funcionário
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
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
                    <span>Documentação e Dados Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">CPF/Documento</label>
                      <Input 
                        value={formData.documento}
                        onChange={(e) => handleInputChange('documento', e.target.value)}
                        placeholder="000.000.000-00" 
                      />
                    </div>

                    <div>
                      <label className="form-label">Registro</label>
                      <Input 
                        value={formData.registro}
                        onChange={(e) => handleInputChange('registro', e.target.value)}
                        placeholder="Número do registro interno" 
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
                          <SelectValue placeholder="Selecione o estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          {civilStatusOptions.map((status) => (
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
                      <label className="form-label">Líder Direto</label>
                      <Select value={formData.lider_direto} onValueChange={(value) => handleInputChange('lider_direto', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o líder direto" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Data de Admissão</label>
                    <Input 
                      type="date"
                      value={formData.data_admissao}
                      onChange={(e) => handleInputChange('data_admissao', e.target.value)}
                    />
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
                  <div className="space-y-3">
                    <label className="form-label">Lidera pessoas?</label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.lidera_pessoas === 1}
                        onCheckedChange={(checked) => handleInputChange('lidera_pessoas', checked ? 1 : 0)}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.lidera_pessoas === 1 ? "Sim, é um líder" : "Não é líder"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
