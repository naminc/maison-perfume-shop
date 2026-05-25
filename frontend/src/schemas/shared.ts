import { z } from "zod";

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(255, "Đường dẫn không được vượt quá 255 ký tự.")
  .refine(
    (value) => !value || /^https?:\/\/.+/i.test(value),
    "Đường dẫn phải bắt đầu bằng http:// hoặc https://.",
  );
