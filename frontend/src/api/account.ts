import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type { AuthUser } from '@/types/auth';
import type { ChangePasswordPayload, PaginatedSessions, UpdateProfilePayload } from '@/types/account';

export const accountApi = {
  getProfile: () =>
    api.get<{ data: AuthUser }>('/v1/account/profile').then(unwrap),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<{ data: AuthUser }>('/v1/account/profile', payload).then(unwrap),

  changePassword: (payload: ChangePasswordPayload) =>
    api.put<{ data: null }>('/v1/account/change-password', payload).then(unwrap),

  getSessions: (page = 1) =>
    api.get<{ data: PaginatedSessions }>('/v1/account/sessions', { params: { page } }).then(unwrap),
};
