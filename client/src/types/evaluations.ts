export interface PendingEvaluation {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_data?: string;
    form_id: string;
    meta?: number | null;
    peso_lider: number;
    peso_equipe: number;
    peso_outros: number;
    status: 'pending' | 'in_progress' | 'completed';
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export interface EvaluatorStatuses {
    [evaluationId: string]: 'pending' | 'in_progress' | 'completed';
}

export interface PendingEvaluationSummary {
    id: string;
    evaluationName: string;
    evaluatedName: string;
    evaluatedId: string;
    department_name?: string;
    status: 'pending' | 'in_progress' | 'completed';
    relacionamento: 'leader' | 'teammate' | 'other';
    avaliacao_id: string;
    avaliacao_name: string;
    avaliacao_description?: string;
    avaliacao_start_date: string;
    avaliacao_end_date: string;
    avaliacao_form_id: string;
}
