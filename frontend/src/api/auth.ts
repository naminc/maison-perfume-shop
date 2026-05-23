import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<{ data: AuthResponse }>('/v1/auth/login', payload).then(unwrap),

  register: (payload: RegisterPayload) =>
    api.post<{ data: AuthResponse }>('/v1/auth/register', payload).then(unwrap),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<{ data: null }>('/v1/auth/forgot-password', payload).then(unwrap),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<{ data: null }>('/v1/auth/reset-password', payload).then(unwrap),

  logout: (accessToken?: string | null) =>
    api.post('/v1/auth/logout', undefined, accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` },
    } : undefined),

  me: () =>
    api.get<{ data: AuthUser }>('/v1/auth/me').then(unwrap),
};
