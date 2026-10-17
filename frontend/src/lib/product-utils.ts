import type { Product, ProductVariant } from "@/types/product";

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

export function defaultProductVariant(product: Product): ProductVariant | null {
  return product.default_variant
    ?? product.variants.find((variant) => variant.is_default)
    ?? product.variants[0]
    ?? null;
}

export function productPrice(product: Product, variant?: ProductVariant | null) {
  const selected = variant ?? defaultProductVariant(product);
  return selected ? Number(selected.sale_price ?? selected.price) : Number(product.min_price ?? 0);
}

export function productOriginalPrice(product: Product, variant?: ProductVariant | null) {
  const selected = variant ?? defaultProductVariant(product);
  return selected ? Number(selected.price) : Number(product.min_price ?? 0);
}

export function hasProductSale(product: Product, variant?: ProductVariant | null) {
  const selected = variant ?? defaultProductVariant(product);
  return Boolean(selected?.sale_price) && productPrice(product, selected) < productOriginalPrice(product, selected);
}

export function formatVnd(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function calculateStandardShipping(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
