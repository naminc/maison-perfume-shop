import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { ValidateCouponPayload, ValidateCouponResponse } from "@/types/coupon";

export const couponApi = {
  validateCoupon: (payload: ValidateCouponPayload) =>
    api.post<{ data: ValidateCouponResponse }>("/v1/coupons/validate", payload).then(unwrap),
};
