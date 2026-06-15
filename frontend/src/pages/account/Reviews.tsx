import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import {
  PRODUCT_REVIEW_RATING_OPTIONS,
  PRODUCT_REVIEW_STATUS_BADGE_CLASS,
  PRODUCT_REVIEW_STATUS_FILTER_OPTIONS,
  PRODUCT_REVIEW_STATUS_LABELS,
} from "@/constants/product-review";
import { useMyReviews } from "@/hooks/useProductReviews";
import { formatDateTime } from "@/lib/date-time";
import type { ProductReviewRatingFilter, ProductReviewStatusFilter } from "@/types/product-review";

export default function AccountReviews() {
  const [status, setStatus] = useState<ProductReviewStatusFilter>("all");
  const [rating, setRating] = useState<ProductReviewRatingFilter>("all");
  const reviewsQuery = useMyReviews({ status, rating, per_page: 20 });
  const reviews = reviewsQuery.data?.data ?? [];

  return (
    <AccountLayout title="Đánh giá của tôi" subtitle="Theo dõi các đánh giá sản phẩm bạn đã gửi.">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductReviewStatusFilter)}
            className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
          >
            {PRODUCT_REVIEW_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={rating}
            onChange={(event) => setRating((event.target.value === "all" ? "all" : Number(event.target.value)) as ProductReviewRatingFilter)}
            className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
          >
            {PRODUCT_REVIEW_RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {reviewsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl border border-stone-200 bg-white" />
          ))}
        </div>
      ) : reviewsQuery.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          Không thể tải danh sách đánh giá. Vui lòng thử lại sau.
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-14 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
          <h2 className="mt-3 text-lg font-semibold text-stone-900">Chưa có đánh giá</h2>
          <p className="mt-1 text-sm text-stone-500">Các đánh giá sau khi gửi sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-stone-900">{review.product?.name ?? "Sản phẩm"}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-stone-500">{formatDateTime(review.created_at)}</span>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRODUCT_REVIEW_STATUS_BADGE_CLASS[review.status]}`}>
                  {PRODUCT_REVIEW_STATUS_LABELS[review.status]}
                </span>
              </div>
              {review.title && <p className="mt-3 text-sm font-semibold text-stone-900">{review.title}</p>}
              {review.content && <p className="mt-1 text-sm leading-6 text-stone-600">{review.content}</p>}
              {review.admin_note && <p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">Ghi chú: {review.admin_note}</p>}
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-500 text-amber-500" : "text-stone-300"}`}
        />
      ))}
    </span>
  );
}
