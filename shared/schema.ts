import { z } from "zod";

export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

export const unitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const directorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const shiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const positionSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.string(),
  departmentId: z.string(),
});

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  document: z.string(),
  positionId: z.string(),
  departmentId: z.string(),
  unitId: z.string().optional(),
  managerId: z.string().optional(),
  directManagerId: z.string().optional(),
  hireDate: z.string(),
  birthDate: z.string().optional(),
  status: z.enum(["active", "inactive", "pending_evaluation"]),
  avatar: z.string().optional(),
  level: z.string().optional(),
  area: z.string().optional(),
  registry: z.string().optional(),
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).optional(),
  education: z.enum(["fundamental", "medio", "superior", "pos_graduacao", "mestrado", "doutorado"]).optional(),
  directoryId: z.string().optional(),
  shiftId: z.string().optional(),
  isLeader: z.boolean().default(false),
  countryCode: z.string().optional(),
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "textarea", "select", "rating", "checkbox", "section"]),
  label: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  order: z.number().min(0).optional(),
});

export const evaluationFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fields: z.array(formFieldSchema),
  status: z.enum(["draft", "active", "archived"]),
  createdDate: z.string(),
});

export const evaluationSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  formId: z.string(),
  evaluatorId: z.string(),
  responses: z.record(z.any()),
  status: z.enum(["pending", "in_progress", "completed"]),
  peso_lider: z.number().optional(),
  peso_equipe: z.number().optional(),
  peso_outros: z.number().optional(),
  createdDate: z.string(),
  completedDate: z.string().optional(),
});

export type Department = z.infer<typeof departmentSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Directory = z.infer<typeof directorySchema>;
export type Shift = z.infer<typeof shiftSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type EvaluationForm = z.infer<typeof evaluationFormSchema>;
export type Evaluation = z.infer<typeof evaluationSchema>;

export const insertDepartmentSchema = departmentSchema.omit({ id: true });
export const insertUnitSchema = unitSchema.omit({ id: true });
export const insertDirectorySchema = directorySchema.omit({ id: true });
export const insertShiftSchema = shiftSchema.omit({ id: true });
export const insertPositionSchema = positionSchema.omit({ id: true });
export const insertEmployeeSchema = employeeSchema.omit({ id: true });
export const insertEvaluationFormSchema = evaluationFormSchema.omit({ id: true, createdDate: true });
export const insertEvaluationSchema = evaluationSchema.omit({ id: true, createdDate: true });

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type InsertDirectory = z.infer<typeof insertDirectorySchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertEvaluationForm = z.infer<typeof insertEvaluationFormSchema>;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
