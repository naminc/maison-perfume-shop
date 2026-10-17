import { useQuery } from "@tanstack/react-query";
import { accountWishlistApi } from "@/api/account/wishlist";
import { QUERY_KEYS } from "@/constants/query-keys";

/**
 * Danh sách sản phẩm yêu thích của user đã đăng nhập (server).
 * Dùng chung query key với StorefrontContext nên cache được chia sẻ.
 */
export function useWishlistProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.account.wishlist,
    queryFn: accountWishlistApi.getWishlist,
  });
}
