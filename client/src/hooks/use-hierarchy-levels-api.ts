import { useState, useEffect, useCallback } from "react";
import type { APIHierarchyLevel } from "@/types/hr";
import { 
  getAllHierarchyLevels, 
  getHierarchyLevelById, 
  createHierarchyLevelAPI, 
  updateHierarchyLevelAPI, 
  deleteHierarchyLevelAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function useHierarchyLevelsAPI() {
  const [hierarchyLevels, setHierarchyLevels] = useState<APIHierarchyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os níveis hierárquicos
  const loadHierarchyLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHierarchyLevels();
      setHierarchyLevels(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar níveis hierárquicos";
      setError(errorMessage);
      console.error("Erro ao carregar níveis hierárquicos:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar nível hierárquico
  const createHierarchyLevel = useCallback(async (data: { name: string; description?: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        description: data.description,
        // Outros campos serão preenchidos pela API automaticamente
      };
      
      await createHierarchyLevelAPI(apiData);
      
      // Como a API pode retornar apenas { success: true }, vamos recarregar todos os dados
      await loadHierarchyLevels();
      
      toast({
        title: "Sucesso",
        description: "Nível hierárquico criado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar nível hierárquico";
      setError(errorMessage);
      console.error("Erro ao criar nível hierárquico:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadHierarchyLevels]);

  // Atualizar nível hierárquico
  const updateHierarchyLevel = useCallback(async (id: string, data: { name: string; description?: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        description: data.description,
        // Outros campos serão atualizados pela API automaticamente
      };
      
      await updateHierarchyLevelAPI(id, apiData);
      
      // Como a API retorna apenas { success: true }, vamos recarregar todos os dados
      await loadHierarchyLevels();
      
      toast({
        title: "Sucesso",
        description: "Nível hierárquico atualizado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar nível hierárquico";
      setError(errorMessage);
      console.error("Erro ao atualizar nível hierárquico:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadHierarchyLevels]);

  // Deletar nível hierárquico
  const deleteHierarchyLevel = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteHierarchyLevelAPI(id);
      
      // Recarregar dados após deletar
      await loadHierarchyLevels();
      
      toast({
        title: "Sucesso",
        description: "Nível hierárquico excluído com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir nível hierárquico";
      setError(errorMessage);
      console.error("Erro ao excluir nível hierárquico:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadHierarchyLevels]);

  // Buscar nível hierárquico por ID
  const getHierarchyLevel = useCallback(async (id: string) => {
    try {
      setError(null);
      return await getHierarchyLevelById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar nível hierárquico";
      setError(errorMessage);
      console.error("Erro ao buscar nível hierárquico:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Carregar níveis hierárquicos ao montar o componente
  useEffect(() => {
    loadHierarchyLevels();
  }, [loadHierarchyLevels]);

  return {
    hierarchyLevels,
    loading,
    error,
    loadHierarchyLevels,
    createHierarchyLevel,
    updateHierarchyLevel,
    deleteHierarchyLevel,
    getHierarchyLevel,
  };
}
