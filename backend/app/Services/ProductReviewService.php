<?php

namespace App\Services;

use App\Enums\ProductReviewStatus;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Repositories\Interfaces\ProductReviewRepositoryInterface;
use App\Services\Interfaces\ProductReviewServiceInterface;
use Illuminate\Validation\ValidationException;

class ProductReviewService extends BaseService implements ProductReviewServiceInterface
{
    public function __construct(
        protected ProductReviewRepositoryInterface $reviewRepository,
    ) {}

    public function getApprovedByProductSlug(string $slug, array $filters): array
    {
        return $this->executeSafe(function () use ($slug, $filters) {
            $product = $this->findActiveProductBySlug($slug);

            if (! $product) {
                return ['found' => false];
            }

            return [
                'found'   => true,
                'reviews' => $this->reviewRepository->paginatePublicByProduct($product->id, $filters),
            ];
        }, 'getApprovedByProductSlug');
    }

    public function getSummaryByProductSlug(string $slug): array
    {
        return $this->executeSafe(function () use ($slug) {
            $product = $this->findActiveProductBySlug($slug);

            if (! $product) {
                return ['found' => false];
            }

            return [
                'found'   => true,
                'summary' => [
                    'product_id' => $product->id,
                    ...$this->reviewRepository->getProductRatingSummary($product->id),
                ],
            ];
        }, 'getSummaryByProductSlug');
    }

    public function getMyReviews(User $user, array $filters): array
    {
        return $this->executeSafe(function () use ($user, $filters) {
            return $this->reviewRepository->paginateByUser($user->id, $filters);
        }, 'getMyReviews');
    }

    public function getReviewableItems(User $user): array
    {
        return $this->executeSafe(function () use ($user) {
            return $this->reviewRepository->getReviewableItems($user->id);
        }, 'getReviewableItems');
    }

    public function createReview(User $user, array $data): array
    {
        return $this->executeTransaction(function () use ($user, $data) {
            $orderItemId = (int) $data['order_item_id'];
            $productId = (int) $data['product_id'];

            $orderItem = $this->reviewRepository->getReviewableOrderItem($user->id, $orderItemId, $productId);

            if (! $orderItem) {
                throw ValidationException::withMessages([
                    'order_item_id' => ['Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn thành.'],
                ]);
            }

            if ($this->reviewRepository->hasUserReviewedOrderItem($user->id, $orderItemId)) {
                throw ValidationException::withMessages([
                    'order_item_id' => ['Sản phẩm này trong đơn hàng đã được đánh giá.'],
                ]);
            }

            return $this->reviewRepository->create([
                'user_id'       => $user->id,
                'product_id'    => $productId,
                'order_id'      => $orderItem->order_id,
                'order_item_id' => $orderItem->id,
                'rating'        => (int) $data['rating'],
                'title'         => $this->normalizeNullableString($data['title'] ?? null),
                'content'       => $this->normalizeNullableString($data['content'] ?? null),
                'status'        => ProductReviewStatus::Pending->value,
            ]);
        }, 'createReview');
    }

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->reviewRepository->paginateAdmin($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->reviewRepository->findById($id);
        }, 'getById');
    }

    public function approve(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $review = $this->reviewRepository->findById($id);

            if (! $review) {
                return ['found' => false];
            }

            return [
                'found'  => true,
                'review' => $this->reviewRepository->update($review, [
                    'status'      => ProductReviewStatus::Approved->value,
                    'approved_at' => now(),
                    'rejected_at' => null,
                ]),
            ];
        }, 'approve');
    }

    public function reject(int $id, ?string $adminNote = null): array
    {
        return $this->executeTransaction(function () use ($id, $adminNote) {
            $review = $this->reviewRepository->findById($id);

            if (! $review) {
                return ['found' => false];
            }

            return [
                'found'  => true,
                'review' => $this->reviewRepository->update($review, [
                    'status'      => ProductReviewStatus::Rejected->value,
                    'admin_note'  => $this->normalizeNullableString($adminNote),
                    'approved_at' => null,
                    'rejected_at' => now(),
                ]),
            ];
        }, 'reject');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $review = $this->reviewRepository->findById($id);

            if (! $review) {
                return ['found' => false];
            }

            $payload = [
                'rating'     => (int) $data['rating'],
                'title'      => $this->normalizeNullableString($data['title'] ?? null),
                'content'    => $this->normalizeNullableString($data['content'] ?? null),
                'admin_note' => $this->normalizeNullableString($data['admin_note'] ?? null),
            ];

            if (! empty($data['status']) && $data['status'] !== $review->status->value) {
                $payload = [
                    ...$payload,
                    ...$this->moderationTimestamps($data['status']),
                    'status' => $data['status'],
                ];
            }

            return [
                'found'  => true,
                'review' => $this->reviewRepository->update($review, $payload),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $review = $this->reviewRepository->findById($id);

            if (! $review) {
                return ['found' => false];
            }

            $this->reviewRepository->delete($review);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    private function findActiveProductBySlug(string $slug): ?Product
    {
        return Product::query()
            ->active()
            ->where('slug', $slug)
            ->first(['id', 'slug']);
    }

    private function moderationTimestamps(string $status): array
    {
        return match ($status) {
            ProductReviewStatus::Approved->value => [
                'approved_at' => now(),
                'rejected_at' => null,
            ],
            ProductReviewStatus::Rejected->value => [
                'approved_at' => null,
                'rejected_at' => now(),
            ],
            default => [
                'approved_at' => null,
                'rejected_at' => null,
            ],
        };
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
