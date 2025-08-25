import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePermissions } from "@/hooks/use-permissions";
import type { UserRole } from "@/types/auth";
import { BarChart3, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
  resource?: string;
  action?: string;
}

export function ProtectedRoute({ children, requireRole, resource, action }: ProtectedRouteProps) {
  const { authState } = useAuth();
  const { hasPermission, userRole } = usePermissions();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      navigate("/login");
    }
  }, [authState.isLoading, authState.isAuthenticated, navigate]);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Carregando...</p>
          <p className="text-slate-500 text-sm">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  // Verificar permissões baseadas em role
  if (requireRole && userRole !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar permissões baseadas em recurso e ação
  if (resource && action && !hasPermission(resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}