import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  productId: number;
  quantity: number;
}

interface RawCartLine {
  productId?: number | string;
  quantity?: number;
}

interface StorefrontContextValue {
  cart: CartLine[];
  cartCount: number;
  wishlistIds: number[];
  addToCart: (productId: number, quantity?: number, maxStock?: number) => void;
  updateCartQuantity: (productId: number, quantity: number, maxStock?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const CART_KEY = "maison-cart";
const WISHLIST_KEY = "maison-wishlist";

export const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProductId(value: unknown): number | null {
  const id = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeQuantity(value: unknown, maxStock?: number) {
  const quantity = Number.isFinite(value) ? Math.max(1, Math.floor(Number(value))) : 1;

  if (typeof maxStock === "number") {
    return Math.min(quantity, Math.max(0, Math.floor(maxStock)));
  }

  return quantity;
}

function normalizeCart(lines: RawCartLine[]) {
  const merged = new Map<number, number>();

  for (const line of lines) {
    const productId = normalizeProductId(line.productId);
    if (!productId) continue;

    const quantity = normalizeQuantity(line.quantity);
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
}

function normalizeWishlist(ids: Array<number | string>) {
  const normalized = ids
    .map(normalizeProductId)
    .filter((id): id is number => id !== null);

  return Array.from(new Set(normalized));
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() =>
    normalizeCart(readJson<RawCartLine[]>(CART_KEY, [])),
  );
  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    normalizeWishlist(readJson<Array<number | string>>(WISHLIST_KEY, [])),
  );

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const addToCart = useCallback((productId: number, quantity = 1, maxStock?: number) => {
    if (!Number.isInteger(productId) || productId <= 0) return;

    setCart((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      const currentQuantity = existing?.quantity ?? 0;
      const nextQuantity = normalizeQuantity(currentQuantity + quantity, maxStock);

      if (nextQuantity <= 0) {
        return prev.filter((line) => line.productId !== productId);
      }

      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, quantity: nextQuantity }
            : line,
        );
      }

      return [...prev, { productId, quantity: nextQuantity }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: number, quantity: number, maxStock?: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.productId !== productId);
      }

      return prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: normalizeQuantity(quantity, maxStock) }
          : line,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: number) => {
    if (!Number.isInteger(productId) || productId <= 0) return;

    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  const value = useMemo<StorefrontContextValue>(
    () => ({
      cart,
      cartCount,
      wishlistIds,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
    }),
    [
      cart,
      cartCount,
      wishlistIds,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}
