import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Product } from "@/types/product";

export interface WishlistToggleResult {
  product_id: number;
  in_wishlist: boolean;
}

export const accountWishlistApi = {
  getWishlist: () =>
    api.get<{ data: Product[] }>("/v1/account/wishlist").then(unwrap),

  toggle: (productId: number) =>
    api
      .post<{ data: WishlistToggleResult }>("/v1/account/wishlist/toggle", { product_id: productId })
      .then(unwrap),

  remove: (productId: number) =>
    api.delete<{ data: null }>(`/v1/account/wishlist/${productId}`).then(unwrap),
};
