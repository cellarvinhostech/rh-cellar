import { Users, Clock, CheckCircle, Building, Plus, Star, BarChart, UserPlus, Sparkles, Target } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EvaluationChart } from "@/components/analytics/EvaluationChart";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { useHRData } from "@/hooks/use-hr-data";

export default function Dashboard() {
  const { stats, activities, departments, getEmployeesWithDetails } = useHRData();
  
  const employees = getEmployeesWithDetails();

  // Sample chart data based on the design reference
  const evaluationChartData = [
    { name: "Ana Silva", value: 4.5, color: "#0ea5e9" },
    { name: "Carlos Oliveira", value: 4.2, color: "#3b82f6" },
    { name: "João Silva", value: 4.0, color: "#f97316" },
    { name: "Pedro Costa", value: 3.8, color: "#fbbf24" },
    { name: "Ana Costa", value: 4.3, color: "#22c55e" },
    { name: "Carlos Santos", value: 3.9, color: "#84cc16" },
    { name: "Maria Santos", value: 4.1, color: "#ef4444" },
  ];

  const departmentChartData = [
    { name: "Tecnologia", value: 8, color: "#8b5cf6" },
    { name: "RH", value: 3, color: "#06b6d4" },
    { name: "Vendas", value: 5, color: "#f59e0b" },
    { name: "Marketing", value: 4, color: "#10b981" },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Há alguns minutos";
    if (diffInHours === 1) return "Há 1 hora";
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Ontem";
    return `Há ${diffInDays} dias`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "employee_added":
        return Users;
      case "evaluation_completed":
        return CheckCircle;
      case "form_created":
        return Plus;
      default:
        return Users;
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900" data-testid="dashboard-title">
                  Analytics de avaliações
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">Analise mais de uma avaliação ao mesmo tempo e veja pelo histórico o sucesso de iniciativas</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <AnalyticsCard
                title="Avaliação de Desempenho"
                description="Analise mais de uma avaliação ao mesmo tempo e veja pelo histórico o sucesso de iniciativas, a evolução de pessoas, departamentos e a empresa como um todo."
                buttonText="Tudo num único sistema."
                gradient="bg-gradient-to-br from-purple-600 to-pink-600"
                icon={<Sparkles className="w-5 h-5" />}
              />
              
              <AnalyticsCard
                title="Devolutivas"
                description="Aplique devolutivas detalhadas e transparentes com direcionamentos sobre desempenho, desenvolvimento, carreira, metas e reconhecimento para cada colaborador."
                buttonText="Examine resultados de relatórios com a ajuda da IA e agilize as próximas decisões."
                gradient="bg-gradient-to-br from-pink-600 to-purple-700"
                icon={<Target className="w-5 h-5" />}
              />
            </div>

            {/* Analytics Section */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Avaliações</h2>
                    <p className="text-slate-500 text-sm sm:text-base">Analytics de avaliações</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <select className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm">
                      <option>Avaliação de Competências e Potencial 2024</option>
                    </select>
                    <select className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm">
                      <option>Calibrados pelo Nine-box; Pontuação calibrada do gestor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  <EvaluationChart 
                    data={evaluationChartData}
                    title="Avaliação de Competências"
                    subtitle="Performance individual dos colaboradores"
                  />
                  
                  <EvaluationChart 
                    data={departmentChartData}
                    title="Funcionários por Departamento"
                    subtitle="Distribuição organizacional"
                  />
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100" data-testid="stats-total-employees">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">Total Funcionários</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900" data-testid="total-employees-count">
                      {stats.totalEmployees}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100" data-testid="stats-pending-evaluations">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">Avaliações Pendentes</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900" data-testid="pending-evaluations-count">
                      {stats.pendingEvaluations}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100" data-testid="stats-completed-evaluations">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">Avaliações Concluídas</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900" data-testid="completed-evaluations-count">
                      {stats.completedEvaluations}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100" data-testid="stats-departments">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">Departamentos</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900" data-testid="departments-count">
                      {stats.departments}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100" data-testid="recent-activity">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 sm:mb-6">Atividades Recentes</h3>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.color)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                        <p className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
