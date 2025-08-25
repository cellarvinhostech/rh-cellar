import type { 
  Department, 
  Position, 
  Employee, 
  EvaluationForm, 
  Evaluation,
  FormField 
} from "@shared/schema";

export interface HRStats {
  totalEmployees: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  departments: number;
}

export interface Activity {
  id: string;
  type: 'employee_added' | 'evaluation_completed' | 'form_created';
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface HierarchyNode {
  employee: Employee;
  children: HierarchyNode[];
  position: Position;
  department: Department;
}

export type EmployeeWithDetails = Employee & {
  position: Position;
  department: Department;
  manager?: Employee;
};

// Tipos da API real
export interface APIEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string | null;
  department_id: string;
  demartment_name: string | null;
  cargo_id: string | null;
  cargo_name: string | null;
  nivel_id: string | null;
  nivel_name: string | null;
  diretoria_id: string | null;
  name: string | null; // Nome da diretoria
  turno_id: string | null;
  turno_name: string | null;
  lider_direto: string | null;
  lider_direto_name: string | null;
  documento: string | null;
  registro: string | null;
  nascimento: string | null;
  estado_civil: string | null;
  escolaridade: string | null;
  data_admissao: string | null;
  lidera_pessoas: number;
  avatar: string | null;
  created_at: string | null;
  updated_at: string;
  last_access: string | null;
}

export interface EmployeeAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIEmployee>;
}

// Tipos da API para Departamentos
export interface APIDepartment {
  id: string;
  name: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  department_users: number;
  department_cargos: number;
}

export interface DepartmentAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIDepartment>;
}

// Tipos da API para Níveis Hierárquicos
export interface APIHierarchyLevel {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HierarchyLevelAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIHierarchyLevel>;
}

// Tipos da API para Cargos/Posições
export interface APIPosition {
  id: string;
  name: string;
  department_id: string;
  nivel_hierarquico_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  department_name: string;
  nivel_hierarquico_name: string;
}

export interface PositionAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIPosition>;
}

// Tipos da API para Diretorias
export interface APIDirectorate {
  id: string;
  name: string;
  description: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface DirectorateAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIDirectorate>;
}

// Tipos da API para Turnos
export interface APIShift {
  id: string;
  name: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIShift>;
}

// Tipos da API para Unidades
export interface APIUnit {
  id: string;
  name: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface UnitAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIUnit>;
}

// Tipos da API para Formulários
export interface APIQuestion {
  id: string;
  form_id: string;
  name: string;
  help_text: string | null;
  type: string;
  required: number; // 0 = não obrigatório, 1 = obrigatório
  options: string | string[] | null; // JSON string, array ou null para opções de select/checkbox
  question_order: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface APIForm {
  id: string;
  name: string;
  description: string;
  is_active: number; // 0 = rascunho, 1 = ativo
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  count_questions: number;
}

// Resposta detalhada da API com perguntas
export interface APIFormWithQuestions {
  form: APIForm;
  questions: Array<{
    json: APIQuestion;
    pairedItem: {
      item: number;
    };
  }>;
}

export interface FormAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIForm>;
}

export interface FormQuestionAPIRequest {
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIQuestion>;
}

// Tipos da API para Avaliações
export interface APIEvaluation {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_data?: string;
  form_id: string;
  meta?: number;
  peso_lider?: number;
  peso_equipe?: number;
  peso_outros?: number;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  // Novos campos da API expandida
  created_by_name?: string;
  updated_by_name?: string;
  form_name?: string;
  form_description?: string;
  form_is_active?: number;
}

// Estrutura completa da resposta da API com avaliados e avaliadores
export interface APIEvaluationWithEvaluated {
  avaliacao: APIEvaluation;
  avaliados: Array<{
    json: APIEvaluated;
    pairedItem: {
      item: number;
    };
  }>;
  avaliadores: Array<{
    json: APIEvaluator;
    pairedItem: {
      item: number;
    };
  }>;
}

export interface EvaluationAPIRequest {
  operation: 'read' | 'readAll' | 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<APIEvaluation>;
}

// Tipos da API para Avaliados
export interface APIEvaluated {
  id?: string;
  user_id: string;
  avaliacao_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  // Novos campos da API expandida
  user_name?: string;
  cargo_name?: string | null;
  department_name?: string | null;
  lider_direto?: string;
  lider_direto_name?: string;
  department_id?: string;
  lidera_pessoas?: number;
  cargo_id?: string;
}

export interface EvaluatedAPIRequest {
  operation: 'create' | 'update' | 'delete' | 'read' | 'readAll' | 'createMultiple';
  id?: string;
  data?: Partial<APIEvaluated> | Partial<APIEvaluated>[];
}

// Tipos da API para Avaliadores
export interface APIEvaluator {
  id?: string;
  user_id: string;
  avaliacao_id: string;
  avaliado_id: string;
  relacionamento: 'leader' | 'teammate' | 'other';
  status: 'pending' | 'in_progress' | 'completed';
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  // Campos do usuário avaliador
  user_name?: string;
  user_department_id?: string;
  user_departament_name?: string;
  user_cargo_id?: string | null;
  user_cargo_name?: string | null;
}

export interface EvaluatorAPIRequest {
  operation: 'create' | 'update' | 'delete' | 'read' | 'readAll' | 'createMultiple';
  id?: string;
  data?: Partial<APIEvaluator> | Partial<APIEvaluator>[];
}

export type {
  Department,
  Position,
  Employee,
  EvaluationForm,
  Evaluation,
  FormField
};
