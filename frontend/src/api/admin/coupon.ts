import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Coupon, CouponListParams, CouponListResponse, CouponPayload } from "@/types/coupon";

function normalizeParams(params: CouponListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    type: params.type === "all" ? undefined : params.type,
  };
}

export const adminCouponApi = {
  getCoupons: (params: CouponListParams = {}) =>
    api
      .get<{ data: CouponListResponse }>("/v1/admin/coupons", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getCoupon: (id: number) =>
    api.get<{ data: Coupon }>(`/v1/admin/coupons/${id}`).then(unwrap),

  createCoupon: (payload: CouponPayload) =>
    api.post<{ data: Coupon }>("/v1/admin/coupons", payload).then(unwrap),

  updateCoupon: (id: number, payload: CouponPayload) =>
    api.put<{ data: Coupon }>(`/v1/admin/coupons/${id}`, payload).then(unwrap),

  deleteCoupon: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/coupons/${id}`).then(unwrap),
};
