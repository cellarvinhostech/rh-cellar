import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth/AuthProvider";

interface FirstAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que redireciona usuários em primeiro acesso para o perfil
 * para que definam uma nova senha antes de acessar outras funcionalidades
 */
export function FirstAccessGuard({ children }: FirstAccessGuardProps) {
  const { authState } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Se o usuário está autenticado e é primeiro acesso
    if (authState.isAuthenticated && authState.user?.first_access === null) {
      // Se não está na página de perfil, redireciona
      if (location !== "/profile") {
        navigate("/profile");
      }
    }
  }, [authState.isAuthenticated, authState.user?.first_access, location, navigate]);

  // Se é primeiro acesso e não está na página de perfil, não renderiza nada
  // (aguarda o redirecionamento)
  if (authState.user?.first_access === null && location !== "/profile") {
    return null;
  }

  return <>{children}</>;
}
