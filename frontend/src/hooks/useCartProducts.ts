import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useStorefront } from "@/hooks/useStorefront";
import { productPrice } from "@/lib/product-utils";
import type { Product } from "@/types/product";

export interface CartProductLine {
  productId: number;
  requestedQuantity: number;
  quantity: number;
  product: Product | null;
  unavailableReason?: string;
  stockWarning?: string;
}

export function useCartProducts() {
  const store = useStorefront();
  const productsQuery = useProducts({ per_page: 100 });

  const productMap = useMemo(() => {
    return new Map((productsQuery.data?.data ?? []).map((product) => [product.id, product]));
  }, [productsQuery.data?.data]);

  const lines = useMemo<CartProductLine[]>(() => {
    return store.cart.map((line) => {
      const product = productMap.get(line.productId) ?? null;

      if (!product) {
        return {
          productId: line.productId,
          requestedQuantity: line.quantity,
          quantity: line.quantity,
          product: null,
          unavailableReason: "Sản phẩm không còn khả dụng.",
        };
      }

      if (product.status !== "active") {
        return {
          productId: line.productId,
          requestedQuantity: line.quantity,
          quantity: 0,
          product,
          unavailableReason: "Sản phẩm đang tạm ẩn.",
        };
      }

      if (product.stock <= 0) {
        return {
          productId: line.productId,
          requestedQuantity: line.quantity,
          quantity: 0,
          product,
          unavailableReason: "Sản phẩm đã hết hàng.",
        };
      }

      const quantity = Math.min(line.quantity, product.stock);

      return {
        productId: line.productId,
        requestedQuantity: line.quantity,
        quantity,
        product,
        stockWarning: quantity < line.quantity ? `Chỉ còn ${product.stock} sản phẩm trong kho.` : undefined,
      };
    });
  }, [productMap, store.cart]);

  const purchasableLines = useMemo(
    () => lines.filter((line) => line.product && !line.unavailableReason && line.quantity > 0),
    [lines],
  );

  const subtotal = useMemo(() => {
    return purchasableLines.reduce((sum, line) => {
      return line.product ? sum + productPrice(line.product) * line.quantity : sum;
    }, 0);
  }, [purchasableLines]);

  const purchasableCount = useMemo(
    () => purchasableLines.reduce((sum, line) => sum + line.quantity, 0),
    [purchasableLines],
  );

  const hasUnavailableLines = useMemo(
    () => lines.some((line) => Boolean(line.unavailableReason)),
    [lines],
  );
  const hasStockWarnings = useMemo(
    () => lines.some((line) => Boolean(line.stockWarning)),
    [lines],
  );

  return {
    ...store,
    productsQuery,
    lines,
    purchasableLines,
    subtotal,
    purchasableCount,
    hasUnavailableLines,
    hasStockWarnings,
    hasCartIssues: hasUnavailableLines || hasStockWarnings,
  };
}
