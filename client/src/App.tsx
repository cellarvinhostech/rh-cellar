import { Switch, Route } from "wouter";
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
import Users from "@/pages/Users";
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
import EvaluationDetail from "@/pages/EvaluationDetail";
import EvaluationEdit from "@/pages/EvaluationEdit";
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
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <CreateEmployee />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/employees/edit/:id">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <EditEmployee />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/departments">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Departments />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/positions">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Positions />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/hierarchy">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Hierarchy />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/hierarchy-levels">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <HierarchyLevels />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/directorates">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Directorates />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/shifts">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Shifts />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/units">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Units />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/forms">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <Forms />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/forms/:id/edit">
        <ProtectedRoute requireRole="admin">
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
      <Route path="/evaluations/:id">
        <ProtectedRoute>
          <FirstAccessGuard>
            <EvaluationDetail />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/evaluations/:id/edit">
        <ProtectedRoute requireRole="admin">
          <FirstAccessGuard>
            <EvaluationEdit />
          </FirstAccessGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute requireRole="admin">
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
