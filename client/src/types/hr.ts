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

export type {
  Department,
  Position,
  Employee,
  EvaluationForm,
  Evaluation,
  FormField
};
