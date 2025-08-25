import { useState, useEffect } from "react";
import type { APIUnit } from "@/types/hr";
import { 
  getAllUnits, 
  createUnitAPI, 
  updateUnitAPI, 
  deleteUnitAPI 
} from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

export function useUnitsAPI() {
  const [units, setUnits] = useState<APIUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todas as unidades
  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUnits();
      setUnits(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar unidades";
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

  // Carregar unidades na inicialização
  useEffect(() => {
    loadUnits();
  }, []);

  // Criar nova unidade
  const createUnit = async (data: {
    name: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      await createUnitAPI(data);
      
      toast({
        title: "Sucesso",
        description: `Unidade "${data.name}" criada com sucesso.`
      });
      
      // Recarregar a lista
      await loadUnits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar unidade";
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

  // Atualizar unidade
  const updateUnit = async (id: string, data: {
    name: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateUnitAPI(id, data);
      
      toast({
        title: "Sucesso",
        description: `Unidade "${data.name}" atualizada com sucesso.`
      });
      
      // Recarregar a lista
      await loadUnits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar unidade";
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

  // Deletar unidade
  const deleteUnit = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteUnitAPI(id);
      
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso."
      });
      
      // Recarregar a lista
      await loadUnits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir unidade";
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
    units,
    loading,
    error,
    createUnit,
    updateUnit,
    deleteUnit,
    reloadUnits: loadUnits
  };
}
