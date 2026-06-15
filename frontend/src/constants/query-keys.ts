const ADMIN_CATEGORIES_KEY = ['admin', 'categories'] as const;
const ADMIN_BRANDS_KEY = ['admin', 'brands'] as const;
const ADMIN_PRODUCTS_KEY = ['admin', 'products'] as const;
const ADMIN_PRODUCT_REVIEWS_KEY = ['admin', 'product-reviews'] as const;
const ADMIN_ORDERS_KEY = ['admin', 'orders'] as const;
const ADMIN_USERS_KEY = ['admin', 'users'] as const;
const ACCOUNT_ORDERS_KEY = ['account', 'orders'] as const;
const ACCOUNT_PRODUCT_REVIEWS_KEY = ['account', 'product-reviews'] as const;
const PRODUCTS_KEY = ['products'] as const;
const PRODUCT_REVIEWS_KEY = ['product-reviews'] as const;

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
    productReviews: {
      all: ADMIN_PRODUCT_REVIEWS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_PRODUCT_REVIEWS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_PRODUCT_REVIEWS_KEY, 'detail', id] as const,
    },
    orders: {
      all: ADMIN_ORDERS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ADMIN_ORDERS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ADMIN_ORDERS_KEY, 'detail', id] as const,
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
    orders: {
      all: ACCOUNT_ORDERS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ACCOUNT_ORDERS_KEY, 'list', params] as const,
      detail: (id: number | string) => [...ACCOUNT_ORDERS_KEY, 'detail', id] as const,
    },
    productReviews: {
      all: ACCOUNT_PRODUCT_REVIEWS_KEY,
      list:   (params: Record<string, unknown> = {}) => [...ACCOUNT_PRODUCT_REVIEWS_KEY, 'list', params] as const,
      reviewableItems: ['account', 'reviewable-items'] as const,
    },
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
  productReviews: {
    all: PRODUCT_REVIEWS_KEY,
    list:    (slug: string, params: Record<string, unknown> = {}) => [...PRODUCT_REVIEWS_KEY, slug, 'list', params] as const,
    summary: (slug: string) => [...PRODUCT_REVIEWS_KEY, slug, 'summary'] as const,
  },
  settings: {
    public: ['settings', 'public'] as const,
  },
} as const;
