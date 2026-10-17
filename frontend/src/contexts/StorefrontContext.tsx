import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountWishlistApi } from "@/api/account/wishlist";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuth } from "@/contexts/AuthContext";
import { wasApiConnectionNotified } from "@/lib/api";
import type { Product } from "@/types/product";

export interface CartLine {
  productId: number;
  variantId: number | null;
  quantity: number;
}

interface RawCartLine {
  productId?: number | string;
  variantId?: number | string;
  quantity?: number;
}

interface StorefrontContextValue {
  cart: CartLine[];
  cartCount: number;
  wishlistIds: number[];
  addToCart: (productId: number, variantId: number, quantity?: number, maxStock?: number) => void;
  updateCartQuantity: (productId: number, variantId: number | null, quantity: number, maxStock?: number) => void;
  removeFromCart: (productId: number, variantId: number | null) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number, product?: Product) => void;
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
  const merged = new Map<string, CartLine>();

  for (const line of lines) {
    const productId = normalizeProductId(line.productId);
    if (!productId) continue;
    const variantId = normalizeProductId(line.variantId);

    const quantity = normalizeQuantity(line.quantity);
    const key = `${productId}:${variantId ?? 0}`;
    const current = merged.get(key);
    merged.set(key, { productId, variantId, quantity: (current?.quantity ?? 0) + quantity });
  }

  return Array.from(merged.values());
}

function normalizeWishlist(ids: Array<number | string>) {
  const normalized = ids
    .map(normalizeProductId)
    .filter((id): id is number => id !== null);

  return Array.from(new Set(normalized));
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartLine[]>(() =>
    normalizeCart(readJson<RawCartLine[]>(CART_KEY, [])),
  );
  const [localWishlistIds, setLocalWishlistIds] = useState<number[]>(() =>
    normalizeWishlist(readJson<Array<number | string>>(WISHLIST_KEY, [])),
  );
  const mergedForUserRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(localWishlistIds));
  }, [localWishlistIds]);

  const serverWishlistQuery = useQuery({
    queryKey: QUERY_KEYS.account.wishlist,
    queryFn: accountWishlistApi.getWishlist,
    enabled: Boolean(user),
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: ({ productId }: { productId: number; product?: Product }) =>
      accountWishlistApi.toggle(productId),
    onMutate: async ({ productId, product }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.account.wishlist });

      const previous = queryClient.getQueryData<Product[]>(QUERY_KEYS.account.wishlist);

      queryClient.setQueryData<Product[]>(QUERY_KEYS.account.wishlist, (current = []) => {
        const exists = current.some((item) => item.id === productId);

        if (exists) {
          return current.filter((item) => item.id !== productId);
        }

        return product ? [product, ...current] : current;
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.account.wishlist, context.previous);
      }

      if (!wasApiConnectionNotified(error)) {
        toast.error("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.wishlist });
    },
  });
  const { mutate: toggleWishlistServer } = toggleWishlistMutation;

  // Đăng nhập lần đầu: đẩy wishlist localStorage lên server một lần rồi xoá local.
  useEffect(() => {
    if (!user || !serverWishlistQuery.data) return;
    if (mergedForUserRef.current === user.id) return;

    mergedForUserRef.current = user.id;

    const serverIds = new Set(serverWishlistQuery.data.map((item) => item.id));
    const missing = localWishlistIds.filter((id) => !serverIds.has(id));

    setLocalWishlistIds([]);

    if (missing.length > 0) {
      void Promise.allSettled(missing.map((id) => accountWishlistApi.toggle(id))).then(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.wishlist });
      });
    }
  }, [localWishlistIds, queryClient, serverWishlistQuery.data, user]);

  const addToCart = useCallback((productId: number, variantId: number, quantity = 1, maxStock?: number) => {
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(variantId) || variantId <= 0) return;

    setCart((prev) => {
      const existing = prev.find((line) => line.productId === productId && line.variantId === variantId);
      const currentQuantity = existing?.quantity ?? 0;
      const nextQuantity = normalizeQuantity(currentQuantity + quantity, maxStock);

      if (nextQuantity <= 0) {
        return prev.filter((line) => line.productId !== productId || line.variantId !== variantId);
      }

      if (existing) {
        return prev.map((line) =>
          line.productId === productId && line.variantId === variantId
            ? { ...line, quantity: nextQuantity }
            : line,
        );
      }

      return [...prev, { productId, variantId, quantity: nextQuantity }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: number, variantId: number | null, quantity: number, maxStock?: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.productId !== productId || line.variantId !== variantId);
      }

      return prev.map((line) =>
        line.productId === productId && line.variantId === variantId
          ? { ...line, quantity: normalizeQuantity(quantity, maxStock) }
          : line,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number, variantId: number | null) => {
    setCart((prev) => prev.filter((line) => line.productId !== productId || line.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const wishlistIds = useMemo(() => {
    if (user) {
      return (serverWishlistQuery.data ?? []).map((item) => item.id);
    }

    return localWishlistIds;
  }, [localWishlistIds, serverWishlistQuery.data, user]);

  const toggleWishlist = useCallback(
    (productId: number, product?: Product) => {
      if (!Number.isInteger(productId) || productId <= 0) return;

      if (user) {
        toggleWishlistServer({ productId, product });
        return;
      }

      setLocalWishlistIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    },
    [toggleWishlistServer, user],
  );

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
