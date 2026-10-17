<?php

namespace App\Repositories\Interfaces;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function paginatePublished(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?Post;

    public function findPublishedBySlug(string $slug): ?Post;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;

    public function create(array $data): Post;

    public function update(Post $post, array $data): Post;

    public function delete(Post $post): bool;
}
