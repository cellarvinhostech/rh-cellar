import { useState, useEffect, useCallback } from "react";
import type { APIPosition } from "@/types/hr";
import { 
  getAllPositions, 
  getPositionById, 
  createPositionAPI, 
  updatePositionAPI, 
  deletePositionAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function usePositionsAPI() {
  const [positions, setPositions] = useState<APIPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os cargos
  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPositions();
      setPositions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar cargos";
      setError(errorMessage);
      console.error("Erro ao carregar cargos:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar cargo
  const createPosition = useCallback(async (data: { name: string; department_id: string; nivel_hierarquico_id: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        department_id: data.department_id,
        nivel_hierarquico_id: data.nivel_hierarquico_id,
        // Outros campos serão preenchidos pela API automaticamente
      };
      
      await createPositionAPI(apiData);
      
      // Como a API pode retornar apenas { success: true }, vamos recarregar todos os dados
      await loadPositions();
      
      toast({
        title: "Sucesso",
        description: "Cargo criado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar cargo";
      setError(errorMessage);
      console.error("Erro ao criar cargo:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadPositions]);

  // Atualizar cargo
  const updatePosition = useCallback(async (id: string, data: { name: string; department_id: string; nivel_hierarquico_id: string }) => {
    try {
      setError(null);
      // Convertemos os dados do formulário para o formato que a API espera
      const apiData = {
        name: data.name,
        department_id: data.department_id,
        nivel_hierarquico_id: data.nivel_hierarquico_id,
        // Outros campos serão atualizados pela API automaticamente
      };
      
      await updatePositionAPI(id, apiData);
      
      // Como a API retorna apenas { success: true }, vamos recarregar todos os dados
      await loadPositions();
      
      toast({
        title: "Sucesso",
        description: "Cargo atualizado com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar cargo";
      setError(errorMessage);
      console.error("Erro ao atualizar cargo:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadPositions]);

  // Deletar cargo
  const deletePosition = useCallback(async (id: string) => {
    try {
      setError(null);
      await deletePositionAPI(id);
      
      // Recarregar dados após deletar
      await loadPositions();
      
      toast({
        title: "Sucesso",
        description: "Cargo excluído com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir cargo";
      setError(errorMessage);
      console.error("Erro ao excluir cargo:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, loadPositions]);

  // Buscar cargo por ID
  const getPosition = useCallback(async (id: string) => {
    try {
      setError(null);
      return await getPositionById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar cargo";
      setError(errorMessage);
      console.error("Erro ao buscar cargo:", err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Carregar cargos ao montar o componente
  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return {
    positions,
    loading,
    error,
    loadPositions,
    createPosition,
    updatePosition,
    deletePosition,
    getPosition,
  };
}
