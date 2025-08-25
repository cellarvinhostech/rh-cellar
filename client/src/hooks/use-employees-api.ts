import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from "@/utils/api";
import type { APIEmployee } from "@/types/hr";
import { useToast } from "./use-toast";

export function useEmployees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os funcionários
  const {
    data: employees = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['employees'],
    queryFn: getAllEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar funcionário
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Funcionário criado",
        description: "Funcionário criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar funcionário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar funcionário
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<APIEmployee> }) => 
      updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Funcionário atualizado",
        description: "Funcionário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar funcionário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar funcionário
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Funcionário removido",
        description: "Funcionário removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover funcionário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    employees,
    isLoading,
    error,
    refetch,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });
}
