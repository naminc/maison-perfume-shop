export type UserRole   = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse extends TokenPair {
  session_id?: number;
  user: AuthUser;
}

export interface ApiErrorResponse<T = unknown> {
  message?: string;
  errors?: Partial<Record<keyof T, string[]>>;
}
