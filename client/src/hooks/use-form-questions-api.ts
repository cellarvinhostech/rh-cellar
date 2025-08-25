import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuestionAPI, updateQuestionAPI, deleteQuestionAPI } from "@/utils/api";
import type { APIQuestion } from "@/types/hr";
import { useToast } from "./use-toast";

export function useFormQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para criar pergunta
  const createMutation = useMutation({
    mutationFn: createQuestionAPI,
    onSuccess: (data, variables) => {
      // Invalida as queries dos formulários para refetch
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      if (variables.form_id) {
        queryClient.invalidateQueries({ queryKey: ['forms', variables.form_id] });
      }
      toast({
        title: "Pergunta criada",
        description: "Pergunta adicionada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar pergunta
  const updateMutation = useMutation({
    mutationFn: ({ id, data, showToast = false }: { id: string; data: Partial<APIQuestion>; showToast?: boolean }) => 
      updateQuestionAPI(id, data),
    onSuccess: (data, variables) => {
      // Invalida as queries dos formulários para refetch
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      if (data.form_id) {
        queryClient.invalidateQueries({ queryKey: ['forms', data.form_id] });
      }
      
      // Só mostra toast se solicitado (evita spam durante edições automáticas)
      if (variables.showToast) {
        toast({
          title: "Pergunta atualizada",
          description: "Pergunta atualizada com sucesso!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar pergunta
  const deleteMutation = useMutation({
    mutationFn: deleteQuestionAPI,
    onSuccess: (data, questionId) => {
      // Invalida as queries dos formulários para refetch
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: "Pergunta removida",
        description: "Pergunta removida com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Actions
    createQuestion: createMutation.mutateAsync,
    updateQuestion: updateMutation.mutateAsync,
    deleteQuestion: deleteMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
