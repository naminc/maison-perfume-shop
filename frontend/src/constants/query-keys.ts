const ADMIN_CATEGORIES_KEY = ['admin', 'categories'] as const;
const ADMIN_BRANDS_KEY = ['admin', 'brands'] as const;

export const QUERY_KEYS = {
  admin: {
    settings: ['admin', 'settings'] as const,
    categories: {
      all: ADMIN_CATEGORIES_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_CATEGORIES_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_CATEGORIES_KEY, 'detail', id] as const,
    },
    brands: {
      all: ADMIN_BRANDS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_BRANDS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_BRANDS_KEY, 'detail', id] as const,
    },
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
  categories: {
    publicTree: ['categories', 'public-tree'] as const,
  },
  brands: {
    publicList: ['brands', 'public-list'] as const,
  },
} as const;
