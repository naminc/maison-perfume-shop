export const normalizePhone = (value: string) => value.replace(/[\s.-]+/g, "");

export const isValidVietnamPhone = (value: string) => {
  const normalized = normalizePhone(value);
  return /^(0\d{9,10}|\+84\d{9,10})$/.test(normalized);
};

export const formatVietnamPhone = (value: string | null | undefined) => {
  const raw = value?.trim();
  if (!raw) return "";
  const normalized = normalizePhone(raw);
  const international = normalized.match(/^\+?84(\d{9,10})$/);
  if (international) {
    const subscriber = international[1].startsWith("0")
      ? international[1].slice(1)
      : international[1];
    return `+84 ${formatSubscriberNumber(subscriber)}`;
  }
  const digits = normalized.replace(/\D/g, "");
  if (/^0\d{9,10}$/.test(digits)) {
    return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)]
      .filter(Boolean)
      .join(" ");
  }
  return raw;
};

function formatSubscriberNumber(value: string) {
  if (value.length === 9) {
    return [value.slice(0, 3), value.slice(3, 6), value.slice(6)]
      .filter(Boolean)
      .join(" ");
  }
  return [value.slice(0, 4), value.slice(4, 7), value.slice(7)]
    .filter(Boolean)
    .join(" ");
}
