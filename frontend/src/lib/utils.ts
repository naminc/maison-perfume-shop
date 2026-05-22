import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Lấy 2 chữ cái đầu từ họ tên, ví dụ "Ngô Đình Nam" → "ĐN" */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
