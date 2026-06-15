<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface ProductReviewServiceInterface
{
    public function getApprovedByProductSlug(string $slug, array $filters): array;

    public function getSummaryByProductSlug(string $slug): array;

    public function getMyReviews(User $user, array $filters): array;

    public function getReviewableItems(User $user): array;

    public function createReview(User $user, array $data): array;

    public function getPaginated(array $filters): array;

    public function getById(int $id): array;

    public function approve(int $id): array;

    public function reject(int $id, ?string $adminNote = null): array;

    public function update(int $id, array $data): array;

    public function delete(int $id): array;
}
