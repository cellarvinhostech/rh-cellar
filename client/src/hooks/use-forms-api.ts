import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllForms, getFormById, createFormAPI, updateFormAPI, deleteFormAPI } from "@/utils/api";
import type { APIForm } from "@/types/hr";
import { useToast } from "./use-toast";

export function useForms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os formulários
  const {
    data: forms = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['forms'],
    queryFn: getAllForms,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar formulário
  const createMutation = useMutation({
    mutationFn: createFormAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: "Formulário criado",
        description: "Formulário criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar formulário
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<APIForm> }) => 
      updateFormAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: "Formulário atualizado",
        description: "Formulário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar formulário
  const deleteMutation = useMutation({
    mutationFn: deleteFormAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: "Formulário removido",
        description: "Formulário removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    forms,
    isLoading,
    error,
    
    // Actions
    refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook para buscar um formulário específico
export function useFormById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['forms', id],
    queryFn: () => getFormById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000,
  });
}
