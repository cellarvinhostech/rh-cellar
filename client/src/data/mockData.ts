import type { 
  Department, 
  Position, 
  Employee, 
  EvaluationForm, 
  Evaluation,
  HRStats,
  Activity 
} from "@/types/hr";

export const departments: Department[] = [
  {
    id: "dept-1",
    name: "Tecnologia",
    description: "Departamento de desenvolvimento e infraestrutura",
    managerId: "emp-2"
  },
  {
    id: "dept-2",
    name: "Recursos Humanos",
    description: "Gestão de pessoas e cultura organizacional",
    managerId: "emp-1"
  },
  {
    id: "dept-3",
    name: "Vendas",
    description: "Comercial e relacionamento com clientes",
    managerId: "emp-4"
  },
  {
    id: "dept-4",
    name: "Marketing",
    description: "Marketing digital e comunicação",
    managerId: "emp-5"
  }
];

export const positions: Position[] = [
  {
    id: "pos-1",
    title: "Gerente de RH",
    level: "gerente",
    departmentId: "dept-2"
  },
  {
    id: "pos-2",
    title: "CTO",
    level: "diretor",
    departmentId: "dept-1"
  },
  {
    id: "pos-3",
    title: "Desenvolvedor Sênior",
    level: "senior",
    departmentId: "dept-1"
  },
  {
    id: "pos-4",
    title: "Gerente de Vendas",
    level: "gerente",
    departmentId: "dept-3"
  },
  {
    id: "pos-5",
    title: "Gerente de Marketing",
    level: "gerente",
    departmentId: "dept-4"
  },
  {
    id: "pos-6",
    title: "Representante de Vendas",
    level: "pleno",
    departmentId: "dept-3"
  },
  {
    id: "pos-7",
    title: "Desenvolvedor Pleno",
    level: "pleno",
    departmentId: "dept-1"
  }
];

export const employees: Employee[] = [
  {
    id: "emp-1",
    name: "Ana",
    lastName: "Silva",
    email: "ana.silva@empresa.com",
    document: "123.456.789-01",
    positionId: "pos-1",
    departmentId: "dept-2",
    hireDate: "2021-01-10",
    status: "active",
    isLeader: true,
    avatar: "https://pixabay.com/get/gadfaeda8f45dac1f50485b9f6697d3ce0712f46d6e1d863b67553e7660784f8c9f44e982174e664fa7ca6fc89ff1104b2ebff8e1df9df0aeb75e7993ce97e90b_1280.jpg"
  },
  {
    id: "emp-2",
    name: "Carlos",
    lastName: "Oliveira",
    email: "carlos.oliveira@empresa.com",
    document: "234.567.890-12",
    positionId: "pos-2",
    departmentId: "dept-1",
    hireDate: "2020-03-15",
    status: "active",
    isLeader: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: "emp-3",
    name: "João",
    lastName: "Silva",
    email: "joao.silva@empresa.com",
    document: "345.678.901-23",
    positionId: "pos-3",
    departmentId: "dept-1",
    managerId: "emp-2",
    hireDate: "2022-03-15",
    status: "active",
    isLeader: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: "emp-4",
    name: "Pedro",
    lastName: "Costa",
    email: "pedro.costa@empresa.com",
    document: "456.789.012-34",
    positionId: "pos-4",
    departmentId: "dept-3",
    hireDate: "2021-08-20",
    status: "active",
    isLeader: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: "emp-5",
    name: "Ana",
    lastName: "Costa",
    email: "ana.costa@empresa.com",
    document: "567.890.123-45",
    positionId: "pos-5",
    departmentId: "dept-4",
    hireDate: "2021-01-10",
    status: "active",
    isLeader: false,
    avatar: "https://pixabay.com/get/g5b5e1ecaf653ca767167c33505b10907dc02dfe9f98488738a46a5838e17b69cec72d1ded6b73da62bc2677e490eb83403cef810f9dade9c66b3d1b3b4443552_1280.jpg"
  },
  {
    id: "emp-6",
    name: "Carlos",
    lastName: "Santos",
    email: "carlos.santos@empresa.com",
    document: "678.901.234-56",
    positionId: "pos-6",
    departmentId: "dept-3",
    managerId: "emp-4",
    hireDate: "2023-06-05",
    status: "pending_evaluation",
    isLeader: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: "emp-7",
    name: "Maria",
    lastName: "Santos",
    email: "maria.santos@empresa.com",
    document: "789.012.345-67",
    positionId: "pos-7",
    departmentId: "dept-1",
    managerId: "emp-2",
    hireDate: "2022-09-12",
    status: "active",
    isLeader: false,
    avatar: "https://pixabay.com/get/ge8e260fb92ea678ae97ae2ba81f9a17335f0120abb781562d3791b85c951bb9abb22819ac08cf1c6e033c252be2012cd449705f1616d84467833878f3f169290f_1280.jpg"
  }
];

export const evaluationForms: EvaluationForm[] = [
  {
    id: "form-1",
    name: "Avaliação de Performance Q4",
    description: "Avaliação trimestral completa",
    status: "active",
    createdDate: "2024-12-01",
    fields: [
      {
        id: "field-1",
        type: "rating",
        label: "Como você avalia seu desempenho geral no último trimestre?",
        required: true
      },
      {
        id: "field-2",
        type: "textarea",
        label: "Descreva suas principais conquistas no período:",
        required: true,
        placeholder: "Digite suas conquistas..."
      },
      {
        id: "field-3",
        type: "select",
        label: "Em quais áreas você gostaria de se desenvolver mais?",
        required: false,
        options: ["Liderança", "Comunicação", "Habilidades Técnicas", "Gestão de Tempo"]
      }
    ]
  },
  {
    id: "form-2",
    name: "Autoavaliação",
    description: "Formulário de autoavaliação dos funcionários",
    status: "draft",
    createdDate: "2024-11-15",
    fields: [
      {
        id: "field-4",
        type: "text",
        label: "Nome do funcionário",
        required: true
      },
      {
        id: "field-5",
        type: "rating",
        label: "Avalie sua satisfação com o trabalho atual",
        required: true
      }
    ]
  }
];

export const evaluations: Evaluation[] = [
  {
    id: "eval-1",
    employeeId: "emp-3",
    formId: "form-1",
    evaluatorId: "emp-2",
    status: "completed",
    createdDate: "2024-12-10",
    completedDate: "2024-12-12",
    responses: {
      "field-1": 4,
      "field-2": "Implementei 3 novas funcionalidades importantes",
      "field-3": "Liderança"
    }
  },
  {
    id: "eval-2",
    employeeId: "emp-6",
    formId: "form-1",
    evaluatorId: "emp-4",
    status: "pending",
    createdDate: "2024-12-14",
    responses: {}
  }
];

export const hrStats: HRStats = {
  totalEmployees: employees.length,
  pendingEvaluations: evaluations.filter(e => e.status === "pending").length,
  completedEvaluations: evaluations.filter(e => e.status === "completed").length,
  departments: departments.length
};

export const recentActivities: Activity[] = [
  {
    id: "act-1",
    type: "employee_added",
    description: "Carlos Santos foi adicionado ao sistema",
    timestamp: "2024-12-15T10:00:00Z",
    icon: "fas fa-user",
    color: "blue"
  },
  {
    id: "act-2",
    type: "evaluation_completed",
    description: "Avaliação de João Silva foi concluída",
    timestamp: "2024-12-15T06:00:00Z",
    icon: "fas fa-check",
    color: "green"
  },
  {
    id: "act-3",
    type: "form_created",
    description: 'Novo formulário "Avaliação Q4" criado',
    timestamp: "2024-12-14T14:00:00Z",
    icon: "fas fa-clipboard",
    color: "purple"
  }
];