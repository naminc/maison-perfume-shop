import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type { AuthUser } from '@/types/auth';
import type { UpdateProfilePayload } from '@/types/account';

export const accountApi = {
  getProfile: () =>
    api.get<{ data: AuthUser }>('/v1/account/profile').then(unwrap),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<{ data: AuthUser }>('/v1/account/profile', payload).then(unwrap),
};
