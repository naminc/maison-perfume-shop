export function formatAddressParts(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();

  return parts
    .flatMap((part) => (part ?? "").split(","))
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = normalizeAddressPart(part);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .join(", ");
}

export function formatWardDisplayName(wardFullName: string | null | undefined, provinceName: string | null | undefined): string {
  const ward = (wardFullName ?? "").trim();
  const province = (provinceName ?? "").trim();

  if (!ward || !province) {
    return ward;
  }

  const suffix = `, ${province}`;

  return ward.endsWith(suffix) ? ward.slice(0, -suffix.length).trim() : ward;
}

function normalizeAddressPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
