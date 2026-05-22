import type { AxiosResponse } from 'axios';

/**
 * Unwrap Laravel API envelope: { success, message, data }
 * Returns only the `data` field.
 */
export function unwrap<T>(res: AxiosResponse<{ data: T }>): T {
  return res.data.data;
}
