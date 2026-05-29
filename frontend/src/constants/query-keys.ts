const ADMIN_CATEGORIES_KEY = ['admin', 'categories'] as const;
const ADMIN_BRANDS_KEY = ['admin', 'brands'] as const;
const ADMIN_PRODUCTS_KEY = ['admin', 'products'] as const;
const ADMIN_USERS_KEY = ['admin', 'users'] as const;
const PRODUCTS_KEY = ['products'] as const;

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
    products: {
      all: ADMIN_PRODUCTS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_PRODUCTS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_PRODUCTS_KEY, 'detail', id] as const,
    },
    users: {
      all: ADMIN_USERS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_USERS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_USERS_KEY, 'detail', id] as const,
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
  products: {
    all: PRODUCTS_KEY,
    list:   (params: Record<string, unknown> = {}) => [...PRODUCTS_KEY, 'list', params] as const,
    detail: (slug: string) => [...PRODUCTS_KEY, 'detail', slug] as const,
  },
  settings: {
    public: ['settings', 'public'] as const,
  },
} as const;
