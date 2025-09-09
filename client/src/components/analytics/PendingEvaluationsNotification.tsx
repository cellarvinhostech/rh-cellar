import React from "react";
import { Bell, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePendingEvaluations,
  useEvaluatorStatuses,
} from "@/hooks/use-pending-evaluations";
import { useLocation } from "wouter";

export default function PendingEvaluationsNotification() {
  const { pendingEvaluations, loading } = usePendingEvaluations();
  const { pendingCount, loading: loadingStatuses } =
    useEvaluatorStatuses(pendingEvaluations);
  const [, setLocation] = useLocation();

  // console.log("PendingEvaluationsNotification - todas as avaliações:", pendingEvaluations);
  // console.log("PendingEvaluationsNotification - avaliações realmente pendentes:", pendingCount);
  // console.log("PendingEvaluationsNotification - loading:", loading);

  if (loading || loadingStatuses) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="h-6 bg-amber-200 rounded animate-pulse w-48"></div>
              <div className="h-8 bg-amber-200 rounded animate-pulse w-24"></div>
            </div>

            <div className="h-4 bg-amber-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div className="h-3 bg-amber-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (pendingCount === 0) {
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
