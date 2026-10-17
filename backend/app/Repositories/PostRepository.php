<?php

namespace App\Repositories;

use App\Enums\PostStatus;
use App\Models\Post;
use App\Repositories\Interfaces\PostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostRepository implements PostRepositoryInterface
{
    public function __construct(protected Post $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->baseFilteredQuery($filters)
            ->orderByDesc('created_at')
            ->paginate($this->perPage($filters));
    }

    public function paginatePublished(array $filters): LengthAwarePaginator
    {
        return $this->baseFilteredQuery($filters)
            ->published()
            ->orderByDesc('published_at')
            ->paginate($this->perPage($filters, 9));
    }

    public function findById(int $id): ?Post
    {
        return $this->model->newQuery()->find($id);
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return $this->model
            ->newQuery()
            ->published()
            ->where('slug', $slug)
            ->first();
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return $this->model
            ->newQuery()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }

    public function create(array $data): Post
    {
        return $this->model->create($data);
    }

    public function update(Post $post, array $data): Post
    {
        $post->update($data);

        return $post->fresh();
    }

    public function delete(Post $post): bool
    {
        return (bool) $post->delete();
    }

    private function baseFilteredQuery(array $filters)
    {
        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['category']), function ($query) use ($filters) {
                $query->where('category', trim((string) $filters['category']));
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], PostStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            });
    }

    private function perPage(array $filters, int $default = 10): int
    {
        $perPage = (int) ($filters['per_page'] ?? $default);

        return max(1, min($perPage, 100));
    }
}
