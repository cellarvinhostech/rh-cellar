import { useState, useCallback } from "react";
import type { 
  Department, 
  Position, 
  Employee, 
  EvaluationForm, 
  Evaluation,
  EmployeeWithDetails,
  HRStats,
  Activity
} from "@/types/hr";
import type {
  InsertDepartment,
  InsertPosition,
  InsertEmployee,
  InsertEvaluationForm,
  InsertEvaluation
} from "@shared/schema";
import { 
  departments as initialDepartments,
  positions as initialPositions,
  employees as initialEmployees,
  evaluationForms as initialForms,
  evaluations as initialEvaluations,
  hrStats as initialStats,
  recentActivities as initialActivities
} from "@/data/mockData";

export function useHRData() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [evaluationForms, setEvaluationForms] = useState<EvaluationForm[]>(initialForms);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [stats, setStats] = useState<HRStats>(initialStats);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // Helper function to generate IDs
  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get employee with details
  const getEmployeeWithDetails = useCallback((employeeId: string): EmployeeWithDetails | undefined => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return undefined;

    const position = positions.find(p => p.id === employee.positionId);
    const department = departments.find(d => d.id === employee.departmentId);
    const manager = employee.managerId ? employees.find(e => e.id === employee.managerId) : undefined;

    if (!position || !department) return undefined;

    return {
      ...employee,
      position,
      department,
      manager
    };
  }, [employees, positions, departments]);

  // Get all employees with details
  const getEmployeesWithDetails = useCallback((): EmployeeWithDetails[] => {
    return employees.map(employee => {
      const position = positions.find(p => p.id === employee.positionId);
      const department = departments.find(d => d.id === employee.departmentId);
      const manager = employee.managerId ? employees.find(e => e.id === employee.managerId) : undefined;

      return {
        ...employee,
        position: position!,
        department: department!,
        manager
      };
    }).filter(emp => emp.position && emp.department);
  }, [employees, positions, departments]);

  // Department operations
  const createDepartment = useCallback((data: InsertDepartment) => {
    const newDepartment: Department = {
      ...data,
      id: generateId("dept")
    };
    setDepartments(prev => [...prev, newDepartment]);
    return newDepartment;
  }, [generateId]);

  const updateDepartment = useCallback((id: string, data: Partial<Department>) => {
    setDepartments(prev => prev.map(dept => 
      dept.id === id ? { ...dept, ...data } : dept
    ));
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  }, []);

  // Employee operations
  const createEmployee = useCallback((data: InsertEmployee) => {
    const newEmployee: Employee = {
      ...data,
      id: generateId("emp")
    };
    setEmployees(prev => [...prev, newEmployee]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalEmployees: prev.totalEmployees + 1
    }));

    // Add activity
    const newActivity: Activity = {
      id: generateId("act"),
      type: "employee_added",
      description: `${data.name} foi adicionado ao sistema`,
      timestamp: new Date().toISOString(),
      icon: "fas fa-user",
      color: "blue"
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);

    return newEmployee;
  }, [generateId]);

  const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...data } : emp
    ));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setStats(prev => ({
      ...prev,
      totalEmployees: prev.totalEmployees - 1
    }));
  }, []);

  // Form operations
  const createEvaluationForm = useCallback((data: InsertEvaluationForm) => {
    const newForm: EvaluationForm = {
      ...data,
      id: generateId("form"),
      createdDate: new Date().toISOString().split('T')[0]
    };
    setEvaluationForms(prev => [...prev, newForm]);

    // Add activity
    const newActivity: Activity = {
      id: generateId("act"),
      type: "form_created",
      description: `Novo formulário "${data.name}" criado`,
      timestamp: new Date().toISOString(),
      icon: "fas fa-clipboard",
      color: "purple"
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);

    return newForm;
  }, [generateId]);

  const updateEvaluationForm = useCallback((id: string, data: Partial<EvaluationForm>) => {
    setEvaluationForms(prev => prev.map(form => 
      form.id === id ? { ...form, ...data } : form
    ));
  }, []);

  const deleteEvaluationForm = useCallback((id: string) => {
    setEvaluationForms(prev => prev.filter(form => form.id !== id));
  }, []);

  // Evaluation operations
  const createEvaluation = useCallback((data: InsertEvaluation) => {
    const newEvaluation: Evaluation = {
      ...data,
      id: generateId("eval"),
      createdDate: new Date().toISOString().split('T')[0]
    };
    setEvaluations(prev => [...prev, newEvaluation]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingEvaluations: prev.pendingEvaluations + 1
    }));

    return newEvaluation;
  }, [generateId]);

  const updateEvaluation = useCallback((id: string, data: Partial<Evaluation>) => {
    setEvaluations(prev => {
      const updated = prev.map(evaluation => {
        if (evaluation.id === id) {
          const updatedEval = { ...evaluation, ...data };
          
          // If completing evaluation, add completed date and update stats
          if (data.status === "completed" && evaluation.status !== "completed") {
            updatedEval.completedDate = new Date().toISOString().split('T')[0];
            
            // Update stats
            setStats(prevStats => ({
              ...prevStats,
              pendingEvaluations: prevStats.pendingEvaluations - 1,
              completedEvaluations: prevStats.completedEvaluations + 1
            }));

            // Add activity
            const employee = employees.find(e => e.id === evaluation.employeeId);
            if (employee) {
              const newActivity: Activity = {
                id: generateId("act"),
                type: "evaluation_completed",
                description: `Avaliação de ${employee.name} foi concluída`,
                timestamp: new Date().toISOString(),
                icon: "fas fa-check",
                color: "green"
              };
              setActivities(prevActivities => [newActivity, ...prevActivities.slice(0, 9)]);
            }
          }
          
          return updatedEval;
        }
        return evaluation;
      });
      
      return updated;
    });
  }, [generateId, employees]);

  const deleteEvaluation = useCallback((id: string) => {
    const evaluation = evaluations.find(e => e.id === id);
    setEvaluations(prev => prev.filter(evaluation => evaluation.id !== id));
    
    // Update stats
    if (evaluation) {
      setStats(prev => ({
        ...prev,
        pendingEvaluations: evaluation.status === "pending" ? prev.pendingEvaluations - 1 : prev.pendingEvaluations,
        completedEvaluations: evaluation.status === "completed" ? prev.completedEvaluations - 1 : prev.completedEvaluations
      }));
    }
  }, [evaluations]);

  // Position operations
  const createPosition = useCallback((data: InsertPosition) => {
    const newPosition: Position = {
      ...data,
      id: generateId("pos")
    };
    setPositions(prev => [...prev, newPosition]);
    return newPosition;
  }, [generateId]);

  const updatePosition = useCallback((id: string, data: Partial<Position>) => {
    setPositions(prev => prev.map(pos => 
      pos.id === id ? { ...pos, ...data } : pos
    ));
  }, []);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== id));
  }, []);

  return {
    // Data
    departments,
    positions,
    employees,
    evaluationForms,
    evaluations,
    stats,
    activities,
    
    // Helpers
    getEmployeeWithDetails,
    getEmployeesWithDetails,
    
    // Department operations
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Position operations
    createPosition,
    updatePosition,
    deletePosition,
    
    // Employee operations
    createEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Form operations
    createEvaluationForm,
    updateEvaluationForm,
    deleteEvaluationForm,
    
    // Evaluation operations
    createEvaluation,
    updateEvaluation,
    deleteEvaluation
  };
}
