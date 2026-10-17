<?php

namespace App\Services;

use App\Enums\PostStatus;
use App\Repositories\Interfaces\PostRepositoryInterface;
use App\Services\Interfaces\PostServiceInterface;
use Illuminate\Support\Str;

class PostService extends BaseService implements PostServiceInterface
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
    ) {}

    public function getPublishedList(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->postRepository->paginatePublished($filters);
        }, 'getPublishedList');
    }

    public function getPublishedBySlug(string $slug): array
    {
        return $this->executeSafe(function () use ($slug) {
            return $this->postRepository->findPublishedBySlug($slug);
        }, 'getPublishedBySlug');
    }

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->postRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->postRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            return $this->postRepository->create($this->preparePayload($data));
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $post = $this->postRepository->findById($id);

            if (! $post) {
                return ['found' => false];
            }

            return [
                'found' => true,
                'post' => $this->postRepository->update($post, $this->preparePayload($data, $post->id, $post->published_at !== null)),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $post = $this->postRepository->findById($id);

            if (! $post) {
                return ['found' => false];
            }

            $this->postRepository->delete($post);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    private function preparePayload(array $data, ?int $ignoreId = null, bool $alreadyPublished = false): array
    {
        $title = trim((string) $data['title']);
        $status = (string) ($data['status'] ?? PostStatus::Draft->value);
        $slugInput = trim((string) ($data['slug'] ?? ''));

        $payload = [
            'title' => $title,
            'slug' => $this->makeUniqueSlug($slugInput !== '' ? $slugInput : $title, $ignoreId),
            'excerpt' => $this->nullableString($data['excerpt'] ?? null),
            'content' => (string) $data['content'],
            'cover_image' => $this->nullableString($data['cover_image'] ?? null),
            'category' => $this->nullableString($data['category'] ?? null),
            'status' => $status,
            'read_minutes' => $this->nullableInt($data['read_minutes'] ?? null),
        ];

        if (array_key_exists('published_at', $data) && $data['published_at']) {
            $payload['published_at'] = $data['published_at'];
        } elseif ($status === PostStatus::Published->value && ! $alreadyPublished) {
            // Xuất bản lần đầu mà không chỉ định thời gian → lấy thời điểm hiện tại.
            $payload['published_at'] = now();
        }

        return $payload;
    }

    private function makeUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($value) ?: 'bai-viet';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->postRepository->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return max(1, (int) $value);
    }
}
