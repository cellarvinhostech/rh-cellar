import React from "react";
import { Bell, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingEvaluationsApi } from "@/hooks/use-pending-evaluations-api";
import { useLocation } from "wouter";

export function PendingEvaluationsNotification() {
  const { pendingEvaluations, loading } = usePendingEvaluationsApi();
  
  const actuallyPendingEvaluations = pendingEvaluations?.filter(
    evaluation => evaluation.status !== 'completed'
  ) || [];
  
  const pendingCount = actuallyPendingEvaluations.length;
  const [, setLocation] = useLocation();

  // console.log("PendingEvaluationsNotification - todas as avaliações:", pendingEvaluations);
  // console.log("PendingEvaluationsNotification - avaliações realmente pendentes:", actuallyPendingEvaluations);
  // console.log("PendingEvaluationsNotification - pendingCount:", pendingCount);
  // console.log("PendingEvaluationsNotification - loading:", loading);

  if (loading || pendingCount === 0) {
    return null;
  }

  const handleEvaluateClick = () => {
    setLocation("/pending-evaluations");
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-amber-900">
              {pendingCount === 1
                ? "Você tem 1 avaliação pendente"
                : `Você tem ${pendingCount} avaliações pendentes`}
            </h3>
            <Button
              onClick={handleEvaluateClick}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              Avaliar Agora
            </Button>
          </div>

          <p className="text-amber-800 mb-3">
            {pendingCount === 1
              ? "Complete sua avaliação para contribuir com o desenvolvimento da equipe."
              : "Complete suas avaliações para contribuir com o desenvolvimento da equipe."}
          </p>

          <div className="text-sm text-amber-700">
            <div className="flex items-center space-x-2">
              {/*
              <UserCheck className="w-4 h-4" />
              <span>
                {pendingCount === 1
                  ? "1 pessoa aguardando sua avaliação"
                  : `${pendingCount} pessoas aguardando suas avaliações`}
              </span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
