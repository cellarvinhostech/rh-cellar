import { useState, useEffect } from 'react';

// Mock data types
export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Position {
  id: string;
  title: string;
  level: string;
  departmentId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: Position;
  department?: Department;
  startDate: string;
  status: 'active' | 'inactive';
}

export interface HierarchyLevel {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

// Mock data
const mockDepartments: Department[] = [
  { id: '1', name: 'Recursos Humanos', description: 'Gestão de pessoas e talentos' },
  { id: '2', name: 'Tecnologia', description: 'Desenvolvimento e infraestrutura' },
  { id: '3', name: 'Financeiro', description: 'Controle financeiro e contábil' },
];

const mockPositions: Position[] = [
  { id: '1', title: 'Analista de RH', level: 'junior', departmentId: '1' },
  { id: '2', title: 'Desenvolvedor', level: 'pleno', departmentId: '2' },
  { id: '3', title: 'Analista Financeiro', level: 'senior', departmentId: '3' },
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    phone: '(11) 99999-9999',
    position: mockPositions[0],
    department: mockDepartments[0],
    startDate: '2023-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@empresa.com',
    phone: '(11) 88888-8888',
    position: mockPositions[1],
    department: mockDepartments[1],
    startDate: '2022-06-10',
    status: 'active'
  }
];

const mockHierarchyLevels: HierarchyLevel[] = [
  {
    id: '1',
    name: 'Estagiário',
    level: 1,
    permissions: ['view_own_data']
  },
  {
    id: '2',
    name: 'Analista Junior',
    level: 2,
    permissions: ['view_own_data', 'edit_own_profile']
  },
  {
    id: '3',
    name: 'Analista Pleno',
    level: 3,
    permissions: ['view_own_data', 'edit_own_profile', 'view_team_data']
  }
];

export function useHRData() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>(mockHierarchyLevels);

  // Stats mock
  const stats = {
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    pendingEvaluations: 5,
    completedEvaluations: 12
  };

  // Activities mock
  const activities = [
    {
      id: '1',
      type: 'evaluation',
      description: 'Avaliação de Ana Silva foi concluída',
      timestamp: new Date().toISOString(),
      user: 'Sistema'
    }
  ];

  // CRUD operations for departments
  const createDepartment = (data: Omit<Department, 'id'>) => {
    const newDepartment: Department = {
      ...data,
      id: (departments.length + 1).toString()
    };
    setDepartments(prev => [...prev, newDepartment]);
    return newDepartment;
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments(prev => 
      prev.map(dept => dept.id === id ? { ...dept, ...data } : dept)
    );
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  // CRUD operations for positions
  const createPosition = (data: Omit<Position, 'id'>) => {
    const newPosition: Position = {
      ...data,
      id: (positions.length + 1).toString()
    };
    setPositions(prev => [...prev, newPosition]);
    return newPosition;
  };

  const updatePosition = (id: string, data: Partial<Position>) => {
    setPositions(prev => 
      prev.map(pos => pos.id === id ? { ...pos, ...data } : pos)
    );
  };

  const deletePosition = (id: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== id));
  };

  // CRUD operations for hierarchy levels
  const createHierarchyLevel = (data: Omit<HierarchyLevel, 'id'>) => {
    const newLevel: HierarchyLevel = {
      ...data,
      id: (hierarchyLevels.length + 1).toString()
    };
    setHierarchyLevels(prev => [...prev, newLevel]);
    return newLevel;
  };

  const updateHierarchyLevel = (id: string, data: Partial<HierarchyLevel>) => {
    setHierarchyLevels(prev => 
      prev.map(level => level.id === id ? { ...level, ...data } : level)
    );
  };

  const deleteHierarchyLevel = (id: string) => {
    setHierarchyLevels(prev => prev.filter(level => level.id !== id));
  };

  // Helper functions
  const getDepartmentStats = (departmentId: string) => {
    const employeeCount = employees.filter(emp => emp.department?.id === departmentId).length;
    return { employeeCount };
  };

  const getEmployeesWithDetails = () => {
    return employees.map(emp => ({
      ...emp,
      department: departments.find(dept => dept.id === emp.department?.id),
      position: positions.find(pos => pos.id === emp.position.id) || emp.position
    }));
  };

  return {
    // Data
    departments,
    positions,
    employees: getEmployeesWithDetails(),
    hierarchyLevels,
    stats,
    activities,

    // Department operations
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentStats,

    // Position operations
    createPosition,
    updatePosition,
    deletePosition,

    // Hierarchy operations
    createHierarchyLevel,
    updateHierarchyLevel,
    deleteHierarchyLevel,

    // Helper functions
    getEmployeesWithDetails
  };
}