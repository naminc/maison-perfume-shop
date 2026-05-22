import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Map lỗi validation từ API Laravel vào các field của react-hook-form.
 * Trả về `true` nếu có lỗi field được áp dụng, `false` nếu không.
 */
export function applyApiErrors<T extends FieldValues>(
  errors: Partial<Record<string, string[]>> | undefined,
  setError: UseFormSetError<T>,
): boolean {
  if (!errors || Object.keys(errors).length === 0) return false;

  Object.entries(errors).forEach(([field, messages]) => {
    if (messages?.length) {
      setError(field as Path<T>, { message: messages[0] });
    }
  });

  return true;
}
