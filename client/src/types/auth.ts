export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department_id: string;
  demartment_name: string;
  created_at: string;
  updated_at: string;
  last_access?: string;
  first_access?: string | null;
  // Campos computados para compatibilidade
  name?: string;
  avatar?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}