type DateTimeInput = string | number | Date | null | undefined;

export function formatDateTime(value: DateTimeInput, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return [
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
  ].join(" ");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
