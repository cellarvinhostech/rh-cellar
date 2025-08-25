import { useState, useEffect } from "react";
import type { APIDirectorate } from "@/types/hr";
import { 
  getAllDirectorates, 
  createDirectorateAPI, 
  updateDirectorateAPI, 
  deleteDirectorateAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function useDirectoratesAPI() {
  const [directorates, setDirectorates] = useState<APIDirectorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todas as diretorias
  const loadDirectorates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDirectorates();
      setDirectorates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar diretorias";
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

  // Carregar diretorias na inicialização
  useEffect(() => {
    loadDirectorates();
  }, []);

  // Criar nova diretoria
  const createDirectorate = async (data: { name: string; description: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      await createDirectorateAPI(data);
      
      toast({
        title: "Sucesso",
        description: `Diretoria "${data.name}" criada com sucesso.`
      });
      
      // Recarregar a lista
      await loadDirectorates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar diretoria";
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

  // Atualizar diretoria
  const updateDirectorate = async (id: string, data: { name: string; description: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateDirectorateAPI(id, data);
      
      toast({
        title: "Sucesso",
        description: `Diretoria "${data.name}" atualizada com sucesso.`
      });
      
      // Recarregar a lista
      await loadDirectorates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar diretoria";
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

  // Deletar diretoria
  const deleteDirectorate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteDirectorateAPI(id);
      
      toast({
        title: "Sucesso",
        description: "Diretoria excluída com sucesso."
      });
      
      // Recarregar a lista
      await loadDirectorates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir diretoria";
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
    directorates,
    loading,
    error,
    createDirectorate,
    updateDirectorate,
    deleteDirectorate,
    reloadDirectorates: loadDirectorates
  };
}
