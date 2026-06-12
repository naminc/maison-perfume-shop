import type { Product } from "@/types/product";

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

export function productPrice(product: Product) {
  return Number(product.sale_price ?? product.price);
}

export function productOriginalPrice(product: Product) {
  return Number(product.price);
}

export function hasProductSale(product: Product) {
  return product.sale_price !== null && productPrice(product) < productOriginalPrice(product);
}

export function formatVnd(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function calculateDiscount(couponCode: string, subtotal: number) {
  return couponCode === "MAISON10" ? Math.round(subtotal * 0.1) : 0;
}

export function calculateStandardShipping(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
