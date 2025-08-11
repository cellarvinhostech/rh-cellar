import { useState, useEffect } from "react";
import type { User, LoginCredentials, ResetPasswordRequest, UpdateProfileData, ChangePasswordData, AuthState } from "@/types/auth";

// Mock user data
const mockUser: User = {
  id: "1",
  name: "Ana Silva",
  email: "ana.silva@empresa.com",
  role: "Gerente RH",
  avatar: "https://pixabay.com/get/gadfaeda8f45dac1f50485b9f6697d3ce0712f46d6e1d863b67553e7660784f8c9f44e982174e664fa7ca6fc89ff1104b2ebff8e1df9df0aeb75e7993ce97e90b_1280.jpg",
  department: "Recursos Humanos",
  phone: "(11) 99999-9999",
  position: "Gerente de RH",
  joinDate: "2022-01-15",
  lastLogin: new Date().toISOString()
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Simulate checking for existing session
    const storedUser = localStorage.getItem("hr_user");
    if (storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (credentials.email === "ana.silva@empresa.com" && credentials.password === "123456") {
        const updatedUser = { ...mockUser, lastLogin: new Date().toISOString() };
        
        // Always store user data for session persistence
        localStorage.setItem("hr_user", JSON.stringify(updatedUser));
        
        setAuthState({
          user: updatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login"
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("hr_user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const requestPasswordReset = async (data: ResetPasswordRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao solicitar redefinição de senha"
      }));
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...authState.user!, ...data };
      localStorage.setItem("hr_user", JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar perfil"
      }));
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro ao alterar senha"
      }));
      throw error;
    }
  };

  return {
    authState,
    login,
    logout,
    requestPasswordReset,
    updateProfile,
    changePassword
  };
}