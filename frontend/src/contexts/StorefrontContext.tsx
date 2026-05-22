import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { perfumes, type Perfume } from "@/lib/demo/perfume-catalog";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartLineDetail extends CartLine {
  product: Perfume;
}

interface StorefrontContextValue {
  cart: CartLineDetail[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string;
  wishlistIds: string[];
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => boolean;
  clearCouponCode: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CART_KEY = "maison-cart";
const COUPON_KEY = "maison-coupon";
const WISHLIST_KEY = "maison-wishlist";
const FREE_SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_FEE = 30000;
const VALID_COUPONS = new Set(["MAISON10"]);

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

function normalizeCart(lines: CartLine[]) {
  const validIds = new Set(perfumes.map((p) => p.id));
  const merged = new Map<string, number>();

  for (const line of lines) {
    if (!validIds.has(line.productId)) continue;
    const quantity = Number.isFinite(line.quantity) ? Math.max(1, Math.floor(line.quantity)) : 1;
    merged.set(line.productId, (merged.get(line.productId) ?? 0) + quantity);
  }

  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
}

function normalizeWishlist(ids: string[]) {
  const validIds = new Set(perfumes.map((p) => p.id));
  return Array.from(new Set(ids.filter((id) => validIds.has(id))));
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cartLines, setCartLines] = useState<CartLine[]>(() =>
    normalizeCart(readJson<CartLine[]>(CART_KEY, [])),
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    normalizeWishlist(readJson<string[]>(WISHLIST_KEY, ["p1", "p4", "p6"])),
  );
  const [couponCode, setCouponCode] = useState(() =>
    readJson<string>(COUPON_KEY, ""),
  );

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cartLines));
  }, [cartLines]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    window.localStorage.setItem(COUPON_KEY, JSON.stringify(couponCode));
  }, [couponCode]);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    const product = perfumes.find((p) => p.id === productId);
    if (!product?.inStock) return;

    setCartLines((prev) => {
      const normalizedQty = Math.max(1, Math.floor(quantity));
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + normalizedQty }
            : line,
        );
      }
      return [...prev, { productId, quantity: normalizedQty }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCartLines((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.productId !== productId)
        : prev.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.max(1, Math.floor(quantity)) }
              : line,
          ),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartLines((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartLines([]);
    setCouponCode("");
  }, []);

  const applyCouponCode = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!VALID_COUPONS.has(normalized)) return false;
    setCouponCode(normalized);
    return true;
  }, []);

  const clearCouponCode = useCallback(() => setCouponCode(""), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const cart = useMemo<CartLineDetail[]>(() => {
    return cartLines
      .map((line) => {
        const product = perfumes.find((p) => p.id === line.productId);
        return product ? { ...line, product } : null;
      })
      .filter((line): line is CartLineDetail => line !== null);
  }, [cartLines]);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );
  const discount = couponCode === "MAISON10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal + shipping - discount);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      cart,
      cartCount,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      wishlistIds,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyCouponCode,
      clearCouponCode,
      toggleWishlist,
      isInWishlist,
    }),
    [
      cart,
      cartCount,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      wishlistIds,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyCouponCode,
      clearCouponCode,
      toggleWishlist,
      isInWishlist,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}
