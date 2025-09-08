import { useState, useEffect } from "react";
import type { User, LoginCredentials, ResetPasswordRequest, UpdateProfileData, ChangePasswordData, AuthState } from "@/types/auth";
import { loginAPI, changePasswordAPI } from "@/utils/api";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";
import { API_CONFIG } from "@/utils/constants";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Verificar se existe sessão ativa
    const storedUser = localStorage.getItem(API_CONFIG.STORAGE.USER_KEY);
    const token = getCookie(API_CONFIG.STORAGE.TOKEN_COOKIE);

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        // Adicionar campos computados para compatibilidade
        const userWithComputed = {
          ...user,
          name: `${user.first_name} ${user.last_name}`,
          department: user.demartment_name,
          position: user.role,
          joinDate: user.created_at ? user.created_at.split(' ')[0] : '',
          lastLogin: user.last_access
        };

        setAuthState({
          user: userWithComputed,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        // Se houver erro ao parsear, limpar dados
        localStorage.removeItem(API_CONFIG.STORAGE.USER_KEY);
        deleteCookie(API_CONFIG.STORAGE.TOKEN_COOKIE);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await loginAPI(credentials);

      // Salvar token como cookie
      setCookie(API_CONFIG.STORAGE.TOKEN_COOKIE, response.token, credentials.rememberMe ? 30 : 1);

      // Adicionar campos computados para compatibilidade
      const userWithComputed = {
        ...response.user,
        name: `${response.user.first_name} ${response.user.last_name}`,
        department: response.user.demartment_name,
        position: response.user.role,
        joinDate: response.user.created_at ? response.user.created_at.split(' ')[0] : '',
        lastLogin: response.user.last_access
      };

      // Salvar usuário no localStorage
      localStorage.setItem(API_CONFIG.STORAGE.USER_KEY, JSON.stringify(response.user));
      
      // Salvar avaliações pendentes se existirem
      if (response.pending_evaluations) {
        localStorage.setItem('pending_evaluations', JSON.stringify(response.pending_evaluations));
      }

      setAuthState({
        user: userWithComputed,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
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
    localStorage.removeItem(API_CONFIG.STORAGE.USER_KEY);
    localStorage.removeItem('pending_evaluations');
    deleteCookie(API_CONFIG.STORAGE.TOKEN_COOKIE);
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
      // TODO: Implementar API de reset de senha
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
      // TODO: Implementar API de atualização de perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...authState.user!, ...data };
      localStorage.setItem(API_CONFIG.STORAGE.USER_KEY, JSON.stringify(updatedUser));

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
      await changePasswordAPI({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword
      });

      // Se foi bem-sucedido e era primeiro acesso, atualizar o usuário
      if (authState.user?.first_access === null) {
        const updatedUser = {
          ...authState.user,
          first_access: new Date().toISOString()
        };

        // Atualizar tanto o objeto computado quanto o localStorage
        const userWithComputed = {
          ...updatedUser,
          name: `${updatedUser.first_name} ${updatedUser.last_name}`,
          department: updatedUser.demartment_name,
          position: updatedUser.role,
          joinDate: updatedUser.created_at ? updatedUser.created_at.split(' ')[0] : '',
          lastLogin: updatedUser.last_access
        };

        localStorage.setItem(API_CONFIG.STORAGE.USER_KEY, JSON.stringify(updatedUser));

        setAuthState(prev => ({
          ...prev,
          user: userWithComputed,
          isLoading: false
        }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
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