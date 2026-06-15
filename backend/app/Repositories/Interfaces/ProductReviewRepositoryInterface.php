<?php

namespace App\Repositories\Interfaces;

use App\Models\OrderItem;
use App\Models\ProductReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductReviewRepositoryInterface
{
    public function paginateAdmin(array $filters): LengthAwarePaginator;

    public function paginatePublicByProduct(int $productId, array $filters): LengthAwarePaginator;

    public function paginateByUser(int $userId, array $filters): LengthAwarePaginator;

    public function findById(int $id): ?ProductReview;

    public function create(array $data): ProductReview;

    public function update(ProductReview $review, array $data): ProductReview;

    public function delete(ProductReview $review): bool;

    public function hasUserReviewedOrderItem(int $userId, int $orderItemId): bool;

    public function getReviewableOrderItem(int $userId, int $orderItemId, int $productId): ?OrderItem;

    public function getReviewableItems(int $userId): array;

    public function getProductRatingSummary(int $productId): array;
}
