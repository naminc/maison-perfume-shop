export const QUERY_KEYS = {
  admin: {
    settings: ['admin', 'settings'] as const,
  },
  account: {
    profile:   ['account', 'profile'] as const,
    sessions:  (page: number) => ['account', 'sessions', page] as const,
    addresses: ['account', 'addresses'] as const,
  },
  geo: {
    provinces: ['geo', 'provinces'] as const,
    wards:     (provinceCode: string) => ['geo', 'wards', provinceCode] as const,
  },
} as const;
