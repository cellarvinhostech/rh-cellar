import type { LoginCredentials, LoginResponse } from "@/types/auth";
import type { APIEmployee, EmployeeAPIRequest, APIDepartment, DepartmentAPIRequest, APIHierarchyLevel, HierarchyLevelAPIRequest, APIPosition, PositionAPIRequest, APIDirectorate, DirectorateAPIRequest, APIShift, ShiftAPIRequest, APIUnit, UnitAPIRequest, APIForm, APIFormWithQuestions, APIQuestion, FormAPIRequest, FormQuestionAPIRequest } from "@/types/hr";
import { getCookie } from "./cookies";
import { API_CONFIG } from "./constants";

export async function loginAPI(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao fazer login");
  }

  const data: LoginResponse = await response.json();
  
  if (!data.success) {
    throw new Error("Credenciais inválidas");
  }

  return data;
}

interface ChangePasswordRequest {
  operation: "changePassword";
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export async function changePasswordAPI(data: Omit<ChangePasswordRequest, 'operation'>): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}`, {
    method: "POST",
    body: JSON.stringify({
      operation: "changePassword",
      ...data
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao alterar senha");
  }

  return await response.json();
}

/**
 * Função para fazer requisições à API de funcionários
 */
export async function employeesAPI(request: EmployeeAPIRequest): Promise<APIEmployee | APIEmployee[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com funcionários");
  }

  return await response.json();
}

/**
 * Buscar todos os funcionários
 */
export async function getAllEmployees(): Promise<APIEmployee[]> {
  const result = await employeesAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um funcionário por ID
 */
export async function getEmployeeById(id: string): Promise<APIEmployee> {
  const result = await employeesAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIEmployee;
}

/**
 * Criar um novo funcionário
 */
export async function createEmployee(data: Partial<APIEmployee>): Promise<APIEmployee> {
  const result = await employeesAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIEmployee;
}

/**
 * Atualizar um funcionário existente
 */
export async function updateEmployee(id: string, data: Partial<APIEmployee>): Promise<APIEmployee> {
  const result = await employeesAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIEmployee;
}

/**
 * Deletar um funcionário
 */
export async function deleteEmployee(id: string): Promise<{ success: boolean }> {
  const result = await employeesAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

/**
 * Função para fazer requisições à API de departamentos
 */
export async function departmentsAPI(request: DepartmentAPIRequest): Promise<APIDepartment | APIDepartment[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com departamentos");
  }

  return await response.json();
}

/**
 * Buscar todos os departamentos
 */
export async function getAllDepartments(): Promise<APIDepartment[]> {
  const result = await departmentsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um departamento por ID
 */
export async function getDepartmentById(id: string): Promise<APIDepartment> {
  const result = await departmentsAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDepartment;
}

/**
 * Criar um novo departamento
 */
export async function createDepartmentAPI(data: Partial<APIDepartment>): Promise<APIDepartment> {
  const result = await departmentsAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDepartment;
}

/**
 * Atualizar um departamento existente
 */
export async function updateDepartmentAPI(id: string, data: Partial<APIDepartment>): Promise<APIDepartment> {
  const result = await departmentsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDepartment;
}

/**
 * Deletar um departamento
 */
export async function deleteDepartmentAPI(id: string): Promise<{ success: boolean }> {
  const result = await departmentsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

/**
 * Função para fazer requisições à API de níveis hierárquicos
 */
export async function hierarchyLevelsAPI(request: HierarchyLevelAPIRequest): Promise<APIHierarchyLevel | APIHierarchyLevel[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HIERARCHY_LEVELS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com níveis hierárquicos");
  }

  return await response.json();
}

/**
 * Buscar todos os níveis hierárquicos
 */
export async function getAllHierarchyLevels(): Promise<APIHierarchyLevel[]> {
  const result = await hierarchyLevelsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um nível hierárquico por ID
 */
export async function getHierarchyLevelById(id: string): Promise<APIHierarchyLevel> {
  const result = await hierarchyLevelsAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIHierarchyLevel;
}

/**
 * Criar um novo nível hierárquico
 */
export async function createHierarchyLevelAPI(data: Partial<APIHierarchyLevel>): Promise<APIHierarchyLevel> {
  const result = await hierarchyLevelsAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIHierarchyLevel;
}

/**
 * Atualizar um nível hierárquico existente
 */
export async function updateHierarchyLevelAPI(id: string, data: Partial<APIHierarchyLevel>): Promise<APIHierarchyLevel> {
  const result = await hierarchyLevelsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIHierarchyLevel;
}

/**
 * Deletar um nível hierárquico
 */
export async function deleteHierarchyLevelAPI(id: string): Promise<{ success: boolean }> {
  const result = await hierarchyLevelsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

/**
 * Função para fazer requisições à API de cargos/posições
 */
export async function positionsAPI(request: PositionAPIRequest): Promise<APIPosition | APIPosition[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSITIONS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com cargos");
  }

  return await response.json();
}

/**
 * Buscar todos os cargos
 */
export async function getAllPositions(): Promise<APIPosition[]> {
  const result = await positionsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um cargo por ID
 */
export async function getPositionById(id: string): Promise<APIPosition> {
  const result = await positionsAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIPosition;
}

/**
 * Criar um novo cargo
 */
export async function createPositionAPI(data: Partial<APIPosition>): Promise<APIPosition> {
  const result = await positionsAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIPosition;
}

/**
 * Atualizar um cargo existente
 */
export async function updatePositionAPI(id: string, data: Partial<APIPosition>): Promise<APIPosition> {
  const result = await positionsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIPosition;
}

/**
 * Deletar um cargo
 */
export async function deletePositionAPI(id: string): Promise<{ success: boolean }> {
  const result = await positionsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

// ========================================
// DIRETORIAS API
// ========================================

/**
 * Função principal para operações com diretorias
 */
export async function directoratesAPI(request: DirectorateAPIRequest): Promise<APIDirectorate | APIDirectorate[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DIRECTORATES}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com diretorias");
  }

  return await response.json();
}

/**
 * Buscar todas as diretorias
 */
export async function getAllDirectorates(): Promise<APIDirectorate[]> {
  const result = await directoratesAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar uma diretoria por ID
 */
export async function getDirectorateById(id: string): Promise<APIDirectorate> {
  const result = await directoratesAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDirectorate;
}

/**
 * Criar uma nova diretoria
 */
export async function createDirectorateAPI(data: Partial<APIDirectorate>): Promise<APIDirectorate> {
  const result = await directoratesAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDirectorate;
}

/**
 * Atualizar uma diretoria existente
 */
export async function updateDirectorateAPI(id: string, data: Partial<APIDirectorate>): Promise<APIDirectorate> {
  const result = await directoratesAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIDirectorate;
}

/**
 * Deletar uma diretoria
 */
export async function deleteDirectorateAPI(id: string): Promise<{ success: boolean }> {
  const result = await directoratesAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

// ========================================
// TURNOS API
// ========================================

/**
 * Função principal para operações com turnos
 */
export async function shiftsAPI(request: ShiftAPIRequest): Promise<APIShift | APIShift[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIFTS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com turnos");
  }

  return await response.json();
}

/**
 * Buscar todos os turnos
 */
export async function getAllShifts(): Promise<APIShift[]> {
  const result = await shiftsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um turno por ID
 */
export async function getShiftById(id: string): Promise<APIShift> {
  const result = await shiftsAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIShift;
}

/**
 * Criar um novo turno
 */
export async function createShiftAPI(data: Partial<APIShift>): Promise<APIShift> {
  const result = await shiftsAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIShift;
}

/**
 * Atualizar um turno existente
 */
export async function updateShiftAPI(id: string, data: Partial<APIShift>): Promise<APIShift> {
  const result = await shiftsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIShift;
}

/**
 * Deletar um turno
 */
export async function deleteShiftAPI(id: string): Promise<{ success: boolean }> {
  const result = await shiftsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

// ========================================
// UNIDADES API
// ========================================

/**
 * Função principal para operações com unidades
 */
export async function unitsAPI(request: UnitAPIRequest): Promise<APIUnit | APIUnit[] | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UNITS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com unidades");
  }

  return await response.json();
}

/**
 * Buscar todas as unidades
 */
export async function getAllUnits(): Promise<APIUnit[]> {
  const result = await unitsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar uma unidade por ID
 */
export async function getUnitById(id: string): Promise<APIUnit> {
  const result = await unitsAPI({ operation: 'read', id });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIUnit;
}

/**
 * Criar uma nova unidade
 */
export async function createUnitAPI(data: Partial<APIUnit>): Promise<APIUnit> {
  const result = await unitsAPI({ operation: 'create', data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIUnit;
}

/**
 * Atualizar uma unidade existente
 */
export async function updateUnitAPI(id: string, data: Partial<APIUnit>): Promise<APIUnit> {
  const result = await unitsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIUnit;
}

/**
 * Deletar uma unidade
 */
export async function deleteUnitAPI(id: string): Promise<{ success: boolean }> {
  const result = await unitsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

/**
 * Função utilitária para fazer requisições autenticadas
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getCookie(API_CONFIG.STORAGE.TOKEN_COOKIE);
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Função para fazer requisições à API de formulários
 */
export async function formsAPI(request: FormAPIRequest): Promise<APIForm | APIForm[] | { success: boolean; form_id?: string }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORMS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com formulários");
  }

  // Verificar se a resposta tem conteúdo antes de tentar fazer parse do JSON
  const responseText = await response.text();
  
  if (!responseText || responseText.trim() === '') {
    return [];
  }

  try {
    return JSON.parse(responseText);
  } catch (jsonError) {
    console.error("Erro ao fazer parse do JSON da API:", jsonError, "Response text:", responseText);
    throw new Error("Resposta inválida da API");
  }
}

/**
 * Buscar todos os formulários
 */
export async function getAllForms(): Promise<APIForm[]> {
  const result = await formsAPI({ operation: 'readAll' });
  return Array.isArray(result) ? result : [];
}

/**
 * Buscar um formulário por ID (com perguntas)
 */
export async function getFormById(id: string): Promise<APIFormWithQuestions> {
  try {
    const result = await formsAPI({ operation: 'read', id });
    
    // Se a API retornou um array vazio ou null, significa que o formulário não foi encontrado
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("Formulário não encontrado");
    }
    
    if (Array.isArray(result)) {
      // Se a API retorna um array, assumimos que é o novo formato [{ form: ..., questions: ... }]
      const formWithQuestions = result[0] as unknown as APIFormWithQuestions;
      
      if (!formWithQuestions || !formWithQuestions.form) {
        throw new Error("Formato de resposta inválido da API");
      }
      
      // Garantir que questions existe, mesmo que seja um array vazio
      if (!formWithQuestions.questions) {
        formWithQuestions.questions = [];
      }
      
      return formWithQuestions;
    }
    
    // Fallback para o formato antigo (só o formulário, sem perguntas)
    return {
      form: result as APIForm,
      questions: []
    };
  } catch (error) {
    console.error("Erro ao buscar formulário:", error);
    throw error;
  }
}

/**
 * Criar um novo formulário
 */
export async function createFormAPI(data: Partial<APIForm>): Promise<{ success: boolean; form_id: string }> {
  const result = await formsAPI({ operation: 'create', data });
  return result as { success: boolean; form_id: string };
}

/**
 * Atualizar um formulário existente
 */
export async function updateFormAPI(id: string, data: Partial<APIForm>): Promise<APIForm> {
  const result = await formsAPI({ operation: 'update', id, data });
  if (Array.isArray(result)) {
    throw new Error("Resposta inesperada da API");
  }
  return result as APIForm;
}

/**
 * Deletar um formulário
 */
export async function deleteFormAPI(id: string): Promise<{ success: boolean }> {
  const result = await formsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}

// =============================================
// Form Questions API
// =============================================

/**
 * Função principal para operações com perguntas de formulário
 */
export async function formQuestionsAPI(request: FormQuestionAPIRequest): Promise<APIQuestion | { success: boolean }> {
  const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORM_QUESTIONS}`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na operação com perguntas do formulário");
  }

  return await response.json();
}

/**
 * Criar uma nova pergunta
 */
export async function createQuestionAPI(data: Partial<APIQuestion>): Promise<APIQuestion> {
  const result = await formQuestionsAPI({ operation: 'create', data });
  return result as APIQuestion;
}

/**
 * Atualizar uma pergunta existente
 */
export async function updateQuestionAPI(id: string, data: Partial<APIQuestion>): Promise<APIQuestion> {
  const result = await formQuestionsAPI({ operation: 'update', id, data });
  return result as APIQuestion;
}

/**
 * Deletar uma pergunta
 */
export async function deleteQuestionAPI(id: string): Promise<{ success: boolean }> {
  const result = await formQuestionsAPI({ operation: 'delete', id });
  return result as { success: boolean };
}
