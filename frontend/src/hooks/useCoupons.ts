import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCouponApi } from "@/api/admin/coupon";
import { couponApi } from "@/api/coupon";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { CouponListParams, CouponPayload, ValidateCouponPayload } from "@/types/coupon";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) => couponApi.validateCoupon(payload),
  });
}

export function useAdminCoupons(params: CouponListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.coupons.list(params as Record<string, unknown>),
    queryFn: () => adminCouponApi.getCoupons(params),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useAdminCoupon(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.coupons.detail(id ?? "new"),
    queryFn: () => adminCouponApi.getCoupon(id as number),
    enabled: Boolean(id),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CouponPayload) => adminCouponApi.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.coupons.all });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CouponPayload }) =>
      adminCouponApi.updateCoupon(id, payload),
    onSuccess: (coupon) => {
      queryClient.setQueryData(QUERY_KEYS.admin.coupons.detail(coupon.id), coupon);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.coupons.all });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminCouponApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.coupons.all });
    },
  });
}
