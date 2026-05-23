export const QUERY_KEYS = {
  account: {
    profile:  ['account', 'profile'] as const,
    sessions: (page: number) => ['account', 'sessions', page] as const,
  },
} as const;
