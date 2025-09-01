import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FirstAccessGuard } from "@/components/auth/FirstAccessGuard";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import CreateEmployee from "@/pages/CreateEmployee";
import EditEmployee from "@/pages/EditEmployee";
import Departments from "@/pages/Departments";
import Positions from "@/pages/Positions";
import Hierarchy from "@/pages/Hierarchy";
import HierarchyLevels from "@/pages/HierarchyLevels";
import Directorates from "@/pages/Directorates";
import Shifts from "@/pages/Shifts";
import Units from "@/pages/Units";
import Settings from "@/pages/Settings";
import Forms from "@/pages/Forms";
import Evaluations from "@/pages/Evaluations";
import PendingEvaluations from "@/pages/PendingEvaluations";
import EvaluationDetail from "@/pages/EvaluationDetail";
import EvaluationEdit from "@/pages/EvaluationEdit";
import EvaluationForm from "@/pages/EvaluationForm";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      <Route path="/">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Dashboard />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/employees">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Employees />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/employees/create">
        <ProtectedRoute>
          <FirstAccessGuard>
            <CreateEmployee />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/employees/edit/:id">
        <ProtectedRoute>
          <FirstAccessGuard>
            <EditEmployee />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/departments">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Departments />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/positions">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Positions />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/hierarchy">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Hierarchy />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/hierarchy-levels">
        <ProtectedRoute>
          <FirstAccessGuard>
            <HierarchyLevels />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/directorates">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Directorates />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/shifts">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Shifts />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/units">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Units />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/forms">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Forms />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/forms/:id/edit">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Forms />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/evaluations">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Evaluations />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/pending-evaluations">
        <ProtectedRoute>
          <FirstAccessGuard>
            <PendingEvaluations />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/evaluation/:evaluationId/form">
        <ProtectedRoute>
          <FirstAccessGuard>
            <EvaluationFormWrapper />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/evaluations/:id">
        <ProtectedRoute>
          <FirstAccessGuard>
            <EvaluationDetail />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/evaluations/:id/edit">
        <ProtectedRoute>
          <FirstAccessGuard>
            <EvaluationEdit />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <FirstAccessGuard>
            <Settings />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function EvaluationFormWrapper() {
  const params = useParams();
  const evaluationId = params.evaluationId;
  
  if (!evaluationId) {
    return <div>ID da avaliação não encontrado</div>;
  }
  
  return <EvaluationForm evaluationId={evaluationId} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
