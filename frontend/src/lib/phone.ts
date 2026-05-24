export const normalizePhone = (value: string) => value.replace(/[\s.-]+/g, '');

export const isValidVietnamPhone = (value: string) => {
  const normalized = normalizePhone(value);
  return /^(0\d{9,10}|\+84\d{9,10})$/.test(normalized);
};
