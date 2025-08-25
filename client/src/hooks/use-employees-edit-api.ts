import { useState } from "react";
import { getEmployeeById as getEmployeeByIdAPI, updateEmployee as updateEmployeeAPI } from "@/utils/api";
import type { APIEmployee } from "@/types/hr";
import { useToast } from "./use-toast";

export function useEmployeesAPI() {
  const { toast } = useToast();

  const getEmployeeById = async (id: string): Promise<APIEmployee> => {
    try {
      return await getEmployeeByIdAPI(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar funcionário";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, data: Partial<APIEmployee>): Promise<void> => {
    try {
      await updateEmployeeAPI(id, data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar funcionário";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    getEmployeeById,
    updateEmployee
  };
}
