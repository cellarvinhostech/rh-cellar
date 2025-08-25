import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { UserRole } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({ 
  children, 
  resource, 
  action, 
  roles,
  fallback,
  showFallback = true 
}: PermissionGuardProps) {
  const { hasPermission, userRole } = usePermissions();

  // Verificar por role específica
  if (roles && userRole) {
    if (!roles.includes(userRole)) {
      return showFallback ? (fallback || <AccessDenied />) : null;
    }
  }

  // Verificar por recurso e ação
  if (resource && action) {
    if (!hasPermission(resource, action)) {
      return showFallback ? (fallback || <AccessDenied />) : null;
    }
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar este recurso.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Hook para verificar permissões condicionalmente
export function useConditionalPermission() {
  const { hasPermission, userRole, permissions } = usePermissions();

  const checkPermission = (resource?: string, action?: string, roles?: UserRole[]) => {
    if (roles && userRole) {
      return roles.includes(userRole);
    }
    
    if (resource && action) {
      return hasPermission(resource, action);
    }
    
    return true;
  };

  return {
    checkPermission,
    permissions,
    userRole
  };
}
