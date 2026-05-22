const MINUTE = 1000 * 60;

export const STALE_TIME = {
  /** Dữ liệu ít thay đổi: session, profile, categories */
  LONG:    MINUTE * 10,
  /** Mặc định toàn app */
  DEFAULT: MINUTE * 5,
  /** Dữ liệu thay đổi thường xuyên: giỏ hàng, tồn kho */
  SHORT:   MINUTE * 1,
  /** Luôn fetch lại khi focus */
  NONE:    0,
} as const;
