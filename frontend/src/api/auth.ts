import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<{ data: AuthResponse }>('/v1/auth/login', payload).then(unwrap),

  register: (payload: RegisterPayload) =>
    api.post<{ data: AuthResponse }>('/v1/auth/register', payload).then(unwrap),

  logout: () =>
    api.post('/v1/auth/logout'),

  me: () =>
    api.get<{ data: AuthUser }>('/v1/auth/me').then(unwrap),
};
