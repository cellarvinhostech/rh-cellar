import { useState, useEffect } from "react";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEvaluationsAPI } from "@/hooks/use-evaluations-api";
import { useForms } from "@/hooks/use-forms-api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { APIEvaluation } from "@/types/hr";

export default function EvaluationEdit() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/evaluations/:id/edit");
  const { evaluations, loading, updateEvaluation } = useEvaluationsAPI();
  const { forms } = useForms();
  const { authState } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_data: "",
    form_id: "",
    status: "pending",
    meta: "",
    peso_lider: "",
    peso_equipe: "",
    peso_outros: ""
  });

  // Buscar a avaliação atual
  const currentEvaluation = evaluations.find(evaluation => evaluation.id === params?.id);

  // Preencher o formulário com os dados da avaliação atual
  useEffect(() => {
    if (currentEvaluation) {
      setFormData({
        name: currentEvaluation.name || "",
        description: currentEvaluation.description || "",
        start_date: currentEvaluation.start_date || "",
        end_data: currentEvaluation.end_data || "",
        form_id: currentEvaluation.form_id || "",
        status: currentEvaluation.status || "pending",
        meta: currentEvaluation.meta?.toString() || "",
        peso_lider: currentEvaluation.peso_lider?.toString() || "70",
        peso_equipe: currentEvaluation.peso_equipe?.toString() || "20",
        peso_outros: currentEvaluation.peso_outros?.toString() || "10"
      });
    }
  }, [currentEvaluation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da avaliação é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.form_id) {
      toast({
        title: "Erro", 
        description: "Formulário é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!authState.user || !params?.id) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para atualizar a avaliação.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const evaluationData = {
        ...formData,
        meta: formData.meta ? parseInt(formData.meta) : undefined,
        peso_lider: formData.peso_lider ? parseInt(formData.peso_lider) : undefined,
        peso_equipe: formData.peso_equipe ? parseInt(formData.peso_equipe) : undefined,
        peso_outros: formData.peso_outros ? parseInt(formData.peso_outros) : undefined,
        updated_by: authState.user.id,
      };

      await updateEvaluation(params.id, evaluationData);
      
      toast({
        title: "Sucesso",
        description: "Avaliação atualizada com sucesso!",
      });
      
      setLocation("/evaluations");
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLocation("/evaluations");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600">Carregando avaliação...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentEvaluation) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Avaliação não encontrada</h2>
            <p className="text-slate-600 mb-4">A avaliação que você está tentando editar não existe.</p>
            <button 
              className="btn-primary"
              onClick={() => setLocation("/evaluations")}
            >
              Voltar para Avaliações
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                data-testid="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900" data-testid="edit-evaluation-title">
                  Editar Avaliação
                </h2>
                <p className="text-slate-600">Atualize as informações da avaliação</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Básicas</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Nome da Avaliação</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da avaliação"
                      required
                      data-testid="evaluation-name-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-input"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Digite uma descrição (opcional)"
                      rows={3}
                      data-testid="evaluation-description-input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Formulário de Avaliação</label>
                    <select
                      className="form-select"
                      value={formData.form_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, form_id: e.target.value }))}
                      required
                      data-testid="evaluation-form-select"
                    >
                      <option value="">Selecione um formulário</option>
                      {forms.filter((form) => form.is_active === 1).map((form) => (
                        <option key={form.id} value={form.id}>
                          {form.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurações</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Data de Início</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        data-testid="evaluation-start-date-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Data de Término</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={formData.end_data}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_data: e.target.value }))}
                        data-testid="evaluation-end-date-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        data-testid="evaluation-status-select"
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluída</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Meta (opcional)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.meta}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta: e.target.value }))}
                        placeholder="0"
                        data-testid="evaluation-meta-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Peso Líder</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={formData.peso_lider}
                        onChange={(e) => setFormData(prev => ({ ...prev, peso_lider: e.target.value }))}
                        placeholder="70"
                        data-testid="evaluation-peso-lider-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Peso Equipe</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={formData.peso_equipe}
                        onChange={(e) => setFormData(prev => ({ ...prev, peso_equipe: e.target.value }))}
                        placeholder="20"
                        data-testid="evaluation-peso-equipe-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Peso Outros</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={formData.peso_outros}
                        onChange={(e) => setFormData(prev => ({ ...prev, peso_outros: e.target.value }))}
                        placeholder="10"
                        data-testid="evaluation-peso-outros-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  data-testid="cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isSubmitting}
                  data-testid="save-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
