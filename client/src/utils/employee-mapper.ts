import type { APIEmployee } from "@/types/hr";
import type { Employee } from "@shared/schema";

/**
 * Converte dados da API para o formato do frontend
 */
export function mapAPIEmployeeToEmployee(apiEmployee: APIEmployee): Employee {
  // Função helper para extrair data de created_at de forma segura
  const getHireDate = (): string => {
    if (apiEmployee.data_admissao) {
      return apiEmployee.data_admissao;
    }
    if (apiEmployee.created_at) {
      return apiEmployee.created_at.split(' ')[0];
    }
    // Fallback para data atual se não houver informação
    return new Date().toISOString().split('T')[0];
  };

  return {
    id: apiEmployee.id,
    name: apiEmployee.first_name,
    lastName: apiEmployee.last_name,
    email: apiEmployee.email,
    phone: apiEmployee.phone || undefined,
    document: apiEmployee.documento || "",
    positionId: apiEmployee.cargo_id || "pos-default",
    departmentId: apiEmployee.department_id,
    unitId: undefined,
    managerId: undefined, // Não temos essa informação na API atual
    directManagerId: undefined,
    hireDate: getHireDate(),
    birthDate: apiEmployee.nascimento || undefined,
    status: "active" as const, // Assumir ativo por padrão
    avatar: undefined,
    level: apiEmployee.nivel_name || undefined,
    area: undefined,
    registry: apiEmployee.registro || undefined,
    maritalStatus: mapMaritalStatus(apiEmployee.estado_civil),
    education: mapEducation(apiEmployee.escolaridade),
    directoryId: apiEmployee.diretoria_id || undefined,
    shiftId: undefined,
    isLeader: apiEmployee.lidera_pessoas === 1,
    countryCode: undefined,
  };
}

/**
 * Converte dados do frontend para o formato da API
 */
export function mapEmployeeToAPIEmployee(employee: Partial<Employee>): Partial<APIEmployee> {
  return {
    first_name: employee.name,
    last_name: employee.lastName,
    email: employee.email,
    phone: employee.phone || null,
    documento: employee.document || null,
    cargo_id: employee.positionId !== "pos-default" ? employee.positionId : null,
    department_id: employee.departmentId,
    data_admissao: employee.hireDate || null,
    nascimento: employee.birthDate || null,
    role: mapLevelToRole(employee.level),
    registro: employee.registry || null,
    estado_civil: mapMaritalStatusToAPI(employee.maritalStatus),
    escolaridade: mapEducationToAPI(employee.education),
    lidera_pessoas: employee.isLeader ? 1 : 0,
  };
}

function mapRoleToLevel(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
    case "administrator":
      return "Diretoria";
    case "manager":
    case "gerente":
      return "Gerência";
    case "senior":
      return "Senior";
    case "pleno":
    case "mid":
      return "Pleno";
    default:
      return "Junior";
  }
}

function mapLevelToRole(level?: string): string {
  if (!level) return "employee";
  
  switch (level.toLowerCase()) {
    case "diretor":
    case "diretoria":
      return "admin";
    case "gerente":
    case "gerência":
      return "manager";
    case "senior":
    case "sênior":
      return "senior";
    case "pleno":
      return "pleno";
    case "junior":
    case "júnior":
      return "junior";
    default:
      return "employee";
  }
}

function mapMaritalStatus(status: string | null): "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | undefined {
  if (!status) return undefined;
  
  switch (status.toLowerCase()) {
    case "solteiro":
    case "single":
      return "solteiro";
    case "casado":
    case "married":
      return "casado";
    case "divorciado":
    case "divorced":
      return "divorciado";
    case "viuvo":
    case "widowed":
      return "viuvo";
    case "uniao_estavel":
    case "domestic_partnership":
      return "uniao_estavel";
    default:
      return undefined;
  }
}

function mapMaritalStatusToAPI(status?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel"): string | null {
  return status || null;
}

function mapEducation(education: string | null): "fundamental" | "medio" | "superior" | "pos_graduacao" | "mestrado" | "doutorado" | undefined {
  if (!education) return undefined;
  
  switch (education.toLowerCase()) {
    case "fundamental":
    case "elementary":
      return "fundamental";
    case "medio":
    case "high_school":
      return "medio";
    case "superior":
    case "bachelor":
      return "superior";
    case "pos_graduacao":
    case "postgraduate":
      return "pos_graduacao";
    case "mestrado":
    case "master":
      return "mestrado";
    case "doutorado":
    case "doctorate":
      return "doutorado";
    default:
      return undefined;
  }
}

function mapEducationToAPI(education?: "fundamental" | "medio" | "superior" | "pos_graduacao" | "mestrado" | "doutorado"): string | null {
  return education || null;
}

/**
 * Cria dados para EmployeeWithDetails usando a API
 */
export function createEmployeeWithDetails(apiEmployee: APIEmployee) {
  const employee = mapAPIEmployeeToEmployee(apiEmployee);
  
  return {
    ...employee,
    position: {
      id: apiEmployee.cargo_id || "pos-default",
      departmentId: apiEmployee.department_id,
      level: apiEmployee.nivel_name || "Funcionário",
      title: apiEmployee.cargo_name || "Funcionário",
    },
    department: {
      id: apiEmployee.department_id,
      name: apiEmployee.demartment_name || "Departamento não informado",
    },
    manager: undefined, // Não temos essa informação na API atual
  };
}
