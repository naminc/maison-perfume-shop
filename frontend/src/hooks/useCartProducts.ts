import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useStorefront } from "@/hooks/useStorefront";
import { productPrice } from "@/lib/product-utils";
import type { Product, ProductVariant } from "@/types/product";

export interface CartProductLine {
  productId: number;
  variantId: number | null;
  requestedQuantity: number;
  quantity: number;
  product: Product | null;
  variant: ProductVariant | null;
  unavailableReason?: string;
  stockWarning?: string;
}

export function useCartProducts() {
  const store = useStorefront();
  const productsQuery = useProducts({ per_page: 100 });

  const productMap = useMemo(
    () => new Map((productsQuery.data?.data ?? []).map((product) => [product.id, product])),
    [productsQuery.data?.data],
  );

  const lines = useMemo<CartProductLine[]>(() => store.cart.map((line) => {
    const product = productMap.get(line.productId) ?? null;
    const variant = resolveVariant(product, line.variantId);

    if (!product) {
      return {
        productId: line.productId,
        variantId: line.variantId,
        requestedQuantity: line.quantity,
        quantity: line.quantity,
        product: null,
        variant: null,
        unavailableReason: "Sản phẩm không còn khả dụng.",
      };
    }

    if (product.status !== "active") {
      return {
        productId: line.productId,
        variantId: variant?.id ?? line.variantId,
        requestedQuantity: line.quantity,
        quantity: 0,
        product,
        variant,
        unavailableReason: "Sản phẩm đang tạm ẩn.",
      };
    }

    if (!variant || variant.status !== "active") {
      return {
        productId: line.productId,
        variantId: line.variantId,
        requestedQuantity: line.quantity,
        quantity: 0,
        product,
        variant,
        unavailableReason: "Phiên bản sản phẩm không còn khả dụng.",
      };
    }

    if (variant.stock <= 0) {
      return {
        productId: line.productId,
        variantId: variant.id,
        requestedQuantity: line.quantity,
        quantity: 0,
        product,
        variant,
        unavailableReason: "Phiên bản sản phẩm đã hết hàng.",
      };
    }

    const quantity = Math.min(line.quantity, variant.stock);

    return {
      productId: line.productId,
      variantId: variant.id,
      requestedQuantity: line.quantity,
      quantity,
      product,
      variant,
      stockWarning: quantity < line.quantity ? `Chỉ còn ${variant.stock} sản phẩm trong kho.` : undefined,
    };
  }), [productMap, store.cart]);

  const purchasableLines = useMemo(
    () => lines.filter((line) => line.product && line.variant && !line.unavailableReason && line.quantity > 0),
    [lines],
  );
  const subtotal = useMemo(
    () => purchasableLines.reduce((sum, line) => (
      line.product && line.variant ? sum + productPrice(line.product, line.variant) * line.quantity : sum
    ), 0),
    [purchasableLines],
  );
  const purchasableCount = useMemo(
    () => purchasableLines.reduce((sum, line) => sum + line.quantity, 0),
    [purchasableLines],
  );
  const hasUnavailableLines = useMemo(() => lines.some((line) => Boolean(line.unavailableReason)), [lines]);
  const hasStockWarnings = useMemo(() => lines.some((line) => Boolean(line.stockWarning)), [lines]);

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

function resolveVariant(product: Product | null, variantId: number | null): ProductVariant | null {
  if (!product) return null;

  return product.variants.find((variant) => variant.id === variantId)
    ?? product.default_variant
    ?? product.variants.find((variant) => variant.is_default)
    ?? product.variants[0]
    ?? null;
}
