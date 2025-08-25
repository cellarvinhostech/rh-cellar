import { useState, useEffect } from "react";
import type { APIShift } from "@/types/hr";
import { 
  getAllShifts, 
  createShiftAPI, 
  updateShiftAPI, 
  deleteShiftAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function useShiftsAPI() {
  const [shifts, setShifts] = useState<APIShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os turnos
  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllShifts();
      setShifts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar turnos";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar turnos na inicialização
  useEffect(() => {
    loadShifts();
  }, []);

  // Criar novo turno
  const createShift = async (data: { name: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      await createShiftAPI(data);
      
      toast({
        title: "Sucesso",
        description: `Turno "${data.name}" criado com sucesso.`
      });
      
      // Recarregar a lista
      await loadShifts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar turno";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar turno
  const updateShift = async (id: string, data: { name: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateShiftAPI(id, data);
      
      toast({
        title: "Sucesso",
        description: `Turno "${data.name}" atualizado com sucesso.`
      });
      
      // Recarregar a lista
      await loadShifts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar turno";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar turno
  const deleteShift = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteShiftAPI(id);
      
      toast({
        title: "Sucesso",
        description: "Turno excluído com sucesso."
      });
      
      // Recarregar a lista
      await loadShifts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir turno";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
    reloadShifts: loadShifts
  };
}
