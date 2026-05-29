<?php

namespace App\Services\Interfaces;

interface ProductServiceInterface
{
    public function getPaginated(array $filters): array;
    public function getById(int $id): array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): array;
    public function getActiveList(array $filters): array;
    public function getBySlug(string $slug): array;
}
