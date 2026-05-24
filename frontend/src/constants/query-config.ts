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
  /** Dữ liệu gần như tĩnh: geo (tỉnh/phường) — cache suốt session */
  GEO:     Infinity,
} as const;

export const GC_TIME = {
  /** Giữ cache lâu hơn staleTime mặc định để tránh refetch không cần thiết */
  DEFAULT: MINUTE * 10,
  /** Dữ liệu gần như tĩnh: geo (tỉnh/phường) — không bao giờ GC */
  GEO:     Infinity,
} as const;

