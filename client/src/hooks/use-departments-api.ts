import { useState, useEffect, useCallback } from "react";
import type { APIDepartment } from "@/types/hr";
import { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartmentAPI, 
  updateDepartmentAPI, 
  deleteDepartmentAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function useDepartmentsAPI() {
  const [departments, setDepartments] = useState<APIDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os departamentos
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar departamentos";
      setError(errorMessage);
      console.error("Erro ao carregar departamentos:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar departamento
  const createDepartment = useCallback(async (data: { name: string; description?: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        // Outros campos serão preenchidos pela API automaticamente
      };
      
      await createDepartmentAPI(apiData);
      
      // Como a API pode retornar apenas { success: true }, vamos recarregar todos os dados
      await loadDepartments();
      
      toast({
        title: "Sucesso",
        description: "Departamento criado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar departamento";
      setError(errorMessage);
      console.error("Erro ao criar departamento:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadDepartments]);

  // Atualizar departamento
  const updateDepartment = useCallback(async (id: string, data: { name: string; description?: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        // Outros campos serão atualizados pela API automaticamente
      };
      
      await updateDepartmentAPI(id, apiData);
      
      // Como a API retorna apenas { success: true }, vamos recarregar todos os dados
      await loadDepartments();
      
      toast({
        title: "Sucesso",
        description: "Departamento atualizado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar departamento";
      setError(errorMessage);
      console.error("Erro ao atualizar departamento:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadDepartments]);

  // Deletar departamento
  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteDepartmentAPI(id);
      
      // Recarregar dados após deletar
      await loadDepartments();
      
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir departamento";
      setError(errorMessage);
      console.error("Erro ao excluir departamento:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadDepartments]);

  // Buscar departamento por ID
  const getDepartment = useCallback(async (id: string) => {
    try {
      setError(null);
      return await getDepartmentById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar departamento";
      setError(errorMessage);
      console.error("Erro ao buscar departamento:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Carregar departamentos ao montar o componente
  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return {
    departments,
    loading,
    error,
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartment,
  };
}
