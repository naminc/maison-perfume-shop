<?php

namespace App\Services\Interfaces;

interface PostServiceInterface
{
    public function getPublishedList(array $filters): array;

    public function getPublishedBySlug(string $slug): array;

    public function getPaginated(array $filters): array;

    public function getById(int $id): array;

    public function create(array $data): array;

    public function update(int $id, array $data): array;

    public function delete(int $id): array;
}
